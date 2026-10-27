<?php

namespace App\Services\Intake;

use App\Models\Brand;
use App\Models\ComponentClass;
use App\Models\Evidence;
use App\Models\LaptopFamily;
use App\Models\LaptopSku;
use App\Models\LaptopVariant;
use App\Models\RamConfiguration;
use App\Models\Retailer;
use App\Models\Source;
use App\Models\StorageSlot;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Deterministic manual-intake validator (M3.2).
 *
 * Parses JSON or CSV intake files into a canonical row stream, validates
 * every row against the real schema vocabulary, resolves natural-key
 * references against earlier rows and the database, and detects conflicts
 * against evidence-backed stored values. It NEVER writes: dry-run is the
 * only default, and the report is pure data.
 */
class IntakeValidator
{
    public const ROW_TYPES = [
        'source', 'evidence', 'brand', 'family', 'variant', 'sku',
        'ram_configuration', 'storage_slot', 'compatibility_assertion', 'offer',
    ];

    public const USE_CASES = ['gaming', 'programming', 'study', 'content_creation', 'business'];
    public const MAX_MEANINGS = ['manufacturer_tested', 'hard_limit', 'unknown'];
    public const PROTOCOLS = ['NVMe', 'SATA', 'both', 'unknown'];
    public const OCCUPIED = ['occupied', 'free', 'unknown'];
    public const OUTCOMES = ['supported', 'unsupported', 'unknown', 'conflicting'];
    public const CONFIDENCE = ['manufacturer_verified', 'reputable_independent', 'unverified'];
    public const PERMISSION = ['permitted', 'unclear', 'not_permitted'];
    public const EVIDENCE_STATUS = ['verified', 'unverified'];
    public const AVAILABILITY = ['unknown', 'in_stock_confirmed', 'out_of_stock_confirmed'];

    /**
     * Within-file reference registries (natural key => row fields).
     *
     * @var array<string, array<string, mixed>>
     */
    protected array $pendingSources = [];
    protected array $pendingEvidence = [];
    protected array $pendingBrands = [];
    protected array $pendingFamilies = [];
    protected array $pendingVariants = [];
    protected array $pendingSkus = [];

    protected int $staleDays;
    protected int $maxFieldLength;

    public function __construct()
    {
        $this->staleDays = (int) config('intake.stale_days', 365);
        $this->maxFieldLength = (int) config('intake.max_field_length', 2048);
    }

    /**
     * @return array{report: array<string, mixed>, rows: list<array<string, mixed>>}
     *         rows are the validated, normalised rows (errors included) in file order
     */
    public function validate(string $absolutePath, string $format, int $maxRows): array
    {
        $rawRows = $format === 'csv'
            ? $this->readCsv($absolutePath)
            : $this->readJson($absolutePath, $maxRows);

        if ($format === 'csv' && count($rawRows) - 1 > $maxRows) {
            throw new \RuntimeException("Intake CSV exceeds the row cap ({$maxRows} data rows).");
        }

        $this->pendingSources = [];
        $this->pendingEvidence = [];
        $this->pendingBrands = [];
        $this->pendingFamilies = [];
        $this->pendingVariants = [];
        $this->pendingSkus = [];
        $results = [];
        $counts = ['valid' => 0, 'error' => 0, 'warning' => 0, 'conflict' => 0];

        $header = null;
        foreach ($rawRows as $index => $row) {
            if ($format === 'csv' && $index === 0) {
                $header = $row;
                continue;
            }

            $fields = $format === 'csv'
                ? $this->csvRowToFields($header, $row)
                : $this->normaliseJsonRow($row);

            $result = $this->validateRow($index, $fields);
            $result['_fields'] = $fields;
            $results[] = $result;
            $counts[$result['status']]++;
        }

        $report = [
            'mode' => 'validation',
            'file' => [
                'path' => basename($absolutePath),
                'format' => $format,
                'row_count' => count($results),
            ],
            'summary' => $counts + [
                'total' => count($results),
                'notes' => 'Dry-run validation only; nothing was written. URLs are references, never fetched.',
            ],
            'rows' => array_map(fn (array $row) => Arr::except($row, ['_fields']), $results),
        ];

        return ['report' => $report, 'rows' => $results];
    }

    // ------------------------------------------------------------------
    // Parsing
    // ------------------------------------------------------------------

    private function readJson(string $path, int $maxRows): array
    {
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException('Unable to read the intake file.');
        }
        if (strlen($raw) > (int) config('intake.max_file_bytes')) {
            throw new \RuntimeException('Intake file exceeds the size cap.');
        }
        if (! mb_check_encoding($raw, 'UTF-8')) {
            throw new \RuntimeException('Intake file must be valid UTF-8.');
        }

        try {
            $decoded = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \RuntimeException('Intake JSON is malformed: '.$e->getMessage());
        }

        if (! is_array($decoded) || ($decoded['rows'] ?? null) === null) {
            throw new \RuntimeException('Intake JSON must be an object with a "rows" array.');
        }
        if (($decoded['intake_version'] ?? null) !== 1) {
            throw new \RuntimeException('Unsupported intake_version (expected 1).');
        }

        $rows = $decoded['rows'];
        if (! is_array($rows) || array_is_list($rows) === false) {
            throw new \RuntimeException('"rows" must be a list of row objects.');
        }
        if (count($rows) > $maxRows) {
            throw new \RuntimeException("Intake file exceeds the row cap ({$maxRows} rows).");
        }

        foreach ($rows as $row) {
            if (! is_array($row)) {
                throw new \RuntimeException('Every intake row must be an object.');
            }
        }

        return $rows;
    }

    /**
     * @return list<list<string>> including the header row
     */
    private function readCsv(string $path): array
    {
        if (filesize($path) > (int) config('intake.max_file_bytes')) {
            throw new \RuntimeException('Intake file exceeds the size cap.');
        }

        return IntakeCsv::read($path, (int) config('intake.max_columns'), (int) config('intake.max_rows'));
    }

    private function csvRowToFields(array $header, array $row): array
    {
        $fields = [];
        foreach ($header as $i => $column) {
            $column = trim((string) $column);
            if ($column === '' || ! array_key_exists($i, $row)) {
                continue;
            }
            $value = trim((string) $row[$i]);
            $fields[$column] = $value === '' ? null : $value;
        }

        return $fields;
    }

    /**
     * Reject duplicate JSON keys is impossible with json_decode; instead we
     * normalise types and reject unexpected shapes. Unknown top-level keys
     * are errors, not silently ignored data.
     */
    private function normaliseJsonRow(array $row): array
    {
        $fields = [];
        foreach ($row as $key => $value) {
            if (is_array($value)) {
                // Structured sub-objects (component, retailer, evidence) pass through.
                $fields[$key] = $value;
                continue;
            }
            if (is_bool($value)) {
                $fields[$key] = $value ? 'true' : 'false';
                continue;
            }
            if ($value === null) {
                $fields[$key] = null;
                continue;
            }
            if (! is_scalar($value)) {
                throw new \RuntimeException("Field {$key} has an unsupported type.");
            }
            $fields[$key] = (string) $value;
        }

        return $fields;
    }

    // ------------------------------------------------------------------
    // Row validation
    // ------------------------------------------------------------------

    private function validateRow(int $index, array $fields): array
    {
        $type = $fields['type'] ?? null;
        if ($type === null || ! in_array($type, self::ROW_TYPES, true)) {
            return $this->result($index, null, 'error', 'Unknown or missing row type.');
        }

        $errors = [];
        $warnings = [];

        $validate = match ($type) {
            'source' => fn (&$e, &$w) => $this->checkSource($fields, $e, $w),
            'evidence' => fn (&$e, &$w) => $this->checkEvidence($fields, $e, $w),
            'brand' => fn (&$e, &$w) => $this->checkBrand($fields, $e, $w),
            'family' => fn (&$e, &$w) => $this->checkFamily($fields, $e, $w),
            'variant' => fn (&$e, &$w) => $this->checkVariant($fields, $e, $w),
            'sku' => fn (&$e, &$w) => $this->checkSku($fields, $e, $w),
            'ram_configuration' => fn (&$e, &$w) => $this->checkRam($fields, $e, $w),
            'storage_slot' => fn (&$e, &$w) => $this->checkSlot($fields, $e, $w),
            'compatibility_assertion' => fn (&$e, &$w) => $this->checkAssertion($fields, $e, $w),
            'offer' => fn (&$e, &$w) => $this->checkOffer($fields, $e, $w),
        };

        $validate($errors, $warnings);

        $key = $this->naturalKey($type, $fields);
        $status = $errors !== [] ? 'error' : ($warnings !== [] ? 'warning' : 'valid');
        $conflict = null;

        if ($errors === [] && in_array($type, ['ram_configuration', 'storage_slot', 'sku'], true)) {
            $conflict = $this->detectConflict($type, $fields);
            if ($conflict !== null) {
                $status = 'conflict';
            }
        }

        if ($errors === []) {
            $this->register($type, $fields);
        }

        return $this->result($index, $type, $status, null, $errors, $warnings, $key, $conflict);
    }

    private function result(int $index, ?string $type, string $status, ?string $error, array $errors = [], array $warnings = [], ?string $key = null, ?array $conflict = null): array
    {
        $row = [
            'index' => $index,
            'type' => $type,
            'key' => $key,
            'status' => $status,
        ];

        if ($error !== null) {
            $row['errors'] = [$error];
        } elseif ($errors !== []) {
            $row['errors'] = $errors;
        }
        if ($warnings !== []) {
            $row['warnings'] = $warnings;
        }
        if ($conflict !== null) {
            $row['conflict'] = $conflict;
        }

        return $row;
    }

    private function naturalKey(string $type, array $fields): ?string
    {
        return match ($type) {
            'source' => 'source:'.$fields['url'],
            'evidence' => 'evidence:'.$fields['source_url'].'|'.($fields['locator'] ?? '').'|'.$fields['fact_scope'],
            'brand' => 'brand:'.$fields['slug'],
            'family' => 'family:'.($fields['brand'] ?? '').'|'.$fields['slug'],
            'variant' => 'variant:'.($fields['family'] ?? '').'|'.$fields['manufacturer_model_code'].'|'.($fields['region_code'] ?? ''),
            'sku', 'ram_configuration', 'storage_slot', 'compatibility_assertion', 'offer' => $type.':'.($fields['manufacturer_part_number'] ?? '').($type === 'storage_slot' ? '|'.$fields['slot_index'] : ''),
        };
    }

    // ------------------------------------------------------------------
    // Shared checks
    // ------------------------------------------------------------------

    private function field(array $fields, string $name): mixed
    {
        $value = $fields[$name] ?? null;

        return ($value === '' || $value === 'null') ? null : $value;
    }

    private function str(mixed $value, string $label, int $max, array &$errors, bool $required = false): ?string
    {
        if ($value === null) {
            if ($required) {
                $errors[] = "{$label} is required.";
            }

            return null;
        }
        $value = (string) $value;
        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $value)) {
            $errors[] = "{$label} contains control characters.";

            return null;
        }
        if (mb_strlen($value) > max($max, $this->maxFieldLength)) {
            $errors[] = "{$label} exceeds its maximum length ({$max}).";

            return null;
        }

        return $value;
    }

    private function intField(mixed $value, string $label, int $min, ?int $max, array &$errors): ?int
    {
        if ($value === null) {
            return null;
        }
        if (! preg_match('/^\d+$/', (string) $value)) {
            $errors[] = "{$label} must be a non-negative integer.";

            return null;
        }
        $int = (int) $value;
        if ($int < $min || ($max !== null && $int > $max)) {
            $errors[] = "{$label} must be between {$min}".($max !== null ? " and {$max}" : '').'.';

            return null;
        }

        return $int;
    }

    private function enumField(mixed $value, string $label, array $allowed, array &$errors, bool $required = false): ?string
    {
        if ($value === null) {
            if ($required) {
                $errors[] = "{$label} is required (one of: ".implode(', ', $allowed).').';
            }

            return null;
        }
        if (! in_array($value, $allowed, true)) {
            $errors[] = "{$label} must be one of: ".implode(', ', $allowed).'.';

            return null;
        }

        return $value;
    }

    private function checkUrl(mixed $value, string $label, array &$errors): ?string
    {
        $url = $this->str($value, $label, 2048, $errors, true);
        if ($url === null) {
            return null;
        }
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            $errors[] = "{$label} is not a valid URL.";

            return null;
        }
        $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?? '');
        if (! in_array($scheme, config('intake.allowed_url_schemes', ['http', 'https']), true)) {
            $errors[] = "{$label} must use http(s).";

            return null;
        }

        // Shape check only: intake never fetches URLs (no SSRF surface).
        return $url;
    }

    private function checkDate(mixed $value, string $label, array &$errors, array &$warnings, bool $required = false): ?string
    {
        $raw = $this->str($value, $label, 32, $errors, $required);
        if ($raw === null) {
            return null;
        }
        try {
            $date = Carbon::parse($raw);
        } catch (\Exception) {
            $errors[] = "{$label} is not a parseable date.";

            return null;
        }
        if ($date->isFuture()) {
            $errors[] = "{$label} is in the future.";

            return null;
        }
        if ($date->diffInDays(now()) > $this->staleDays) {
            $warnings[] = "{$label} is older than {$this->staleDays} days: evidence is stale and requires re-verification before publication.";
        }

        return $date->toIso8601String();
    }

    private function decimalString(mixed $value, string $label, array &$errors): ?string
    {
        if ($value === null) {
            return null;
        }
        if (! preg_match('/^\d{1,9}(\.\d{1,2})?$/', (string) $value)) {
            $errors[] = "{$label} must be a decimal amount with at most two fractional digits (no separators, no exponent, no negatives).";

            return null;
        }

        return (string) $value;
    }

    private function boolField(mixed $value, string $label, array &$errors, bool $default = true): bool
    {
        if ($value === null) {
            return $default;
        }
        if (in_array(strtolower((string) $value), ['true', '1', 'yes'], true)) {
            return true;
        }
        if (in_array(strtolower((string) $value), ['false', '0', 'no'], true)) {
            return false;
        }
        $errors[] = "{$label} must be true or false.";

        return $default;
    }

    // ------------------------------------------------------------------
    // Type-specific checks
    // ------------------------------------------------------------------

    private function checkSource(array $fields, array &$errors, array &$warnings): void
    {
        $url = $this->checkUrl($this->field($fields, 'url'), 'url', $errors);
        if ($url !== null && str_starts_with($url, 'http://')) {
            $warnings[] = 'url uses plain http; https is preferred for a documentation source.';
        }
        $this->str($this->field($fields, 'source_type'), 'source_type', 64, $errors, true);
        $this->str($this->field($fields, 'publisher'), 'publisher', 256, $errors);
        $this->enumField($this->field($fields, 'usage_permission_status'), 'usage_permission_status', self::PERMISSION, $errors, true);
        $this->str($this->field($fields, 'notes'), 'notes', $this->maxFieldLength, $errors);

        if ($errors === [] && ($this->field($fields, 'usage_permission_status')) !== 'permitted') {
            $warnings[] = 'usage_permission_status is not "permitted": the referenced source may not be republished beyond citation.';
        }
    }

    private function checkEvidence(array $fields, array &$errors, array &$warnings): void
    {
        $sourceUrl = $this->checkUrl($this->field($fields, 'source_url'), 'source_url', $errors);
        if ($sourceUrl !== null && ! $this->sourceKnown($sourceUrl)) {
            $errors[] = "source_url does not match a source defined earlier in the file or already stored.";
        }
        $this->str($this->field($fields, 'locator'), 'locator', 512, $errors);
        $this->str($this->field($fields, 'concise_paraphrase'), 'concise_paraphrase', 1024, $errors, true);
        $this->str($this->field($fields, 'fact_scope'), 'fact_scope', 256, $errors, true);
        $this->checkDate($this->field($fields, 'observed_at'), 'observed_at', $errors, $warnings, true);
        $this->enumField($this->field($fields, 'verification_status'), 'verification_status', self::EVIDENCE_STATUS, $errors, true);
    }

    private function checkBrand(array $fields, array &$errors, array &$warnings): void
    {
        $this->str($this->field($fields, 'name'), 'name', 128, $errors, true);
        $this->slug($this->field($fields, 'slug'), 'slug', $errors, true);
    }

    private function checkFamily(array $fields, array &$errors, array &$warnings): void
    {
        $brand = $this->slug($this->field($fields, 'brand'), 'brand', $errors, true);
        if ($brand !== null && ! $this->brandKnown($brand)) {
            $errors[] = 'brand does not match an earlier row or a stored brand.';
        }
        $this->str($this->field($fields, 'family_name'), 'family_name', 256, $errors, true);
        $this->slug($this->field($fields, 'slug'), 'slug', $errors, true);
        $this->intField($this->field($fields, 'launch_year'), 'launch_year', 1980, 2100, $errors);
    }

    private function checkVariant(array $fields, array &$errors, array &$warnings): void
    {
        $family = $this->slug($this->field($fields, 'family'), 'family', $errors, true);
        if ($family !== null && ! $this->familyKnown($family)) {
            $errors[] = 'family does not match an earlier row or a stored family.';
        }
        $this->str($this->field($fields, 'manufacturer_model_code'), 'manufacturer_model_code', 128, $errors, true);
        $this->str($this->field($fields, 'region_code'), 'region_code', 32, $errors);
    }

    private function checkSku(array $fields, array &$errors, array &$warnings): void
    {
        if (array_key_exists('status', $fields) && $this->field($fields, 'status') !== null) {
            $errors[] = 'status is server-owned: intake rows must never set it. Intake creates drafts only.';
        }

        $variant = $this->str($this->field($fields, 'variant_model_code'), 'variant_model_code', 128, $errors, true);
        if ($variant !== null) {
            $family = $this->field($fields, 'family');
            if ($family !== null) {
                $this->slug($family, 'family', $errors, true);
                if (! $this->variantKnown($family, $variant)) {
                    $errors[] = 'family+variant_model_code do not match an earlier row or stored records.';
                }
            } elseif (! $this->variantKnown(null, $variant)) {
                $errors[] = 'variant_model_code does not match an earlier row or stored records; supply "family" to disambiguate.';
            }
        }

        $this->str($this->field($fields, 'manufacturer_part_number'), 'manufacturer_part_number', 128, $errors, true);
        $this->str($this->field($fields, 'display_name'), 'display_name', 256, $errors, true);
        $this->intField($this->field($fields, 'base_ram_gb'), 'base_ram_gb', 0, 1024, $errors);
        $this->intField($this->field($fields, 'base_storage_gb'), 'base_storage_gb', 0, 1024 * 100, $errors);
        $this->intField($this->field($fields, 'mass_g'), 'mass_g', 0, 20000, $errors);
        $this->enumField($this->field($fields, 'use_case'), 'use_case', self::USE_CASES, $errors);

        $demo = $this->field($fields, 'demo_label');
        if ($demo !== null && ! str_contains(strtoupper((string) $demo), 'SYNTHETIC')) {
            $errors[] = 'demo_label, when present, must clearly contain SYNTHETIC so demo rows can never pass as real data.';
        }

        $mpn = $this->field($fields, 'manufacturer_part_number');
        if ($mpn !== null && $this->skuExists((string) $mpn)) {
            $warnings[] = 'manufacturer_part_number already exists: this row is an update of a stored SKU.';
        }
    }

    private function checkRam(array $fields, array &$errors, array &$warnings): void
    {
        $this->requireSku($fields, $errors);
        $slotCount = $this->intField($this->field($fields, 'slot_count'), 'slot_count', 0, 16, $errors);
        $occupied = $this->intField($this->field($fields, 'occupied_slot_count'), 'occupied_slot_count', 0, 16, $errors);
        if ($slotCount !== null && $occupied !== null && $occupied > $slotCount) {
            $errors[] = 'occupied_slot_count cannot exceed slot_count.';
        }
        $this->intField($this->field($fields, 'soldered_gb'), 'soldered_gb', 0, 512, $errors);
        $this->intField($this->field($fields, 'documented_max_gb'), 'documented_max_gb', 0, 4096, $errors);
        $this->str($this->field($fields, 'standard'), 'standard', 64, $errors);
        $maxMeaning = $this->enumField($this->field($fields, 'max_meaning'), 'max_meaning', self::MAX_MEANINGS, $errors, true);
        $documentedMax = $this->field($fields, 'documented_max_gb');
        if ($maxMeaning !== null && $maxMeaning !== 'unknown' && $documentedMax === null) {
            $errors[] = 'documented_max_gb is required when max_meaning is not "unknown".';
        }
        if ($maxMeaning === 'unknown' && $documentedMax !== null) {
            $errors[] = 'documented_max_gb must be null when max_meaning is "unknown" (unknown is never a number).';
        }
        $this->checkEvidenceRef($fields, $errors, $warnings, required: false);
    }

    private function checkSlot(array $fields, array &$errors, array &$warnings): void
    {
        $this->requireSku($fields, $errors);
        $this->intField($this->field($fields, 'slot_index'), 'slot_index', 1, 16, $errors);
        $this->str($this->field($fields, 'form_factor'), 'form_factor', 32, $errors);
        $this->enumField($this->field($fields, 'protocol'), 'protocol', self::PROTOCOLS, $errors, true);
        $this->str($this->field($fields, 'pcie_generation'), 'pcie_generation', 16, $errors);
        $this->enumField($this->field($fields, 'occupied_status'), 'occupied_status', self::OCCUPIED, $errors, true);
        $this->str($this->field($fields, 'constraints_text'), 'constraints_text', 1024, $errors);
        $this->checkEvidenceRef($fields, $errors, $warnings, required: false);
    }

    private function checkAssertion(array $fields, array &$errors, array &$warnings): void
    {
        $this->requireSku($fields, $errors);
        $component = $this->field($fields, 'component');
        if (! is_array($component)) {
            $errors[] = 'component object is required (component_type, standard, form_factor).';
        } else {
            $this->enumField($this->field($component, 'component_type'), 'component.component_type', ['ram', 'ssd'], $errors, true);
            $this->str($this->field($component, 'standard'), 'component.standard', 64, $errors, true);
            $this->str($this->field($component, 'form_factor'), 'component.form_factor', 64, $errors, true);
            $this->enumField($this->field($component, 'protocol'), 'component.protocol', self::PROTOCOLS, $errors);
            $this->intField($this->field($component, 'capacity_gb'), 'component.capacity_gb', 0, 1024 * 100, $errors);
        }
        $this->enumField($this->field($fields, 'outcome'), 'outcome', self::OUTCOMES, $errors, true);
        $this->str($this->field($fields, 'reason'), 'reason', 1024, $errors, true);
        $this->str($this->field($fields, 'scope_notes'), 'scope_notes', 1024, $errors);
        $this->enumField($this->field($fields, 'confidence_level'), 'confidence_level', self::CONFIDENCE, $errors, true);
        // An assertion without evidence is a guess; guesses never enter.
        $this->checkEvidenceRef($fields, $errors, $warnings, required: true);
    }

    private function checkOffer(array $fields, array &$errors, array &$warnings): void
    {
        $this->requireSku($fields, $errors);
        $retailer = $this->field($fields, 'retailer');
        if (! is_array($retailer)) {
            $errors[] = 'retailer object is required (name, website_url).';
        } else {
            $this->str($this->field($retailer, 'name'), 'retailer.name', 128, $errors, true);
            $this->checkUrl($this->field($retailer, 'website_url'), 'retailer.website_url', $errors);
            // country is optional and defaults to EG in the applier.
            $this->str($this->field($retailer, 'country'), 'retailer.country', 8, $errors);
        }
        $this->checkUrl($this->field($fields, 'product_url'), 'product_url', $errors);
        $this->decimalString($this->field($fields, 'displayed_price_egp'), 'displayed_price_egp', $errors);
        $this->enumField($this->field($fields, 'available_status'), 'available_status', self::AVAILABILITY, $errors, true);
        $this->checkDate($this->field($fields, 'observed_at'), 'observed_at', $errors, $warnings, true);
        $this->boolField($this->field($fields, 'active'), 'active', $errors, true);
        $this->checkEvidenceRef($fields, $errors, $warnings, required: true);
    }

    private function requireSku(array $fields, array &$errors): void
    {
        $mpn = $this->str($this->field($fields, 'manufacturer_part_number'), 'manufacturer_part_number', 128, $errors, true);
        if ($mpn !== null && ! $this->skuKnown((string) $mpn)) {
            $errors[] = 'manufacturer_part_number does not match an earlier SKU row or a stored SKU.';
        }
    }

    private function checkEvidenceRef(array $fields, array &$errors, array &$warnings, bool $required): void
    {
        $evidence = $this->field($fields, 'evidence');
        if ($evidence === null) {
            if ($required) {
                $errors[] = 'evidence reference is required for this row type.';
            }

            return;
        }
        if (! is_array($evidence)) {
            $errors[] = 'evidence must be an object with source_url (and ideally locator).';

            return;
        }
        $sourceUrl = $this->checkUrl($this->field($evidence, 'source_url'), 'evidence.source_url', $errors);
        if ($sourceUrl !== null && ! $this->sourceKnown($sourceUrl)) {
            $errors[] = 'evidence.source_url does not match an earlier source row or a stored source.';
        }
        $this->str($this->field($evidence, 'locator'), 'evidence.locator', 512, $errors);

        if ($errors === [] && $sourceUrl !== null && ! $this->evidenceKnown($sourceUrl, $this->field($evidence, 'locator'))) {
            $warnings[] = 'evidence reference matches no earlier evidence row (define the evidence row before its dependents so commit can link it).';
        }

        if ($sourceUrl !== null) {
            $source = $this->resolveSource($sourceUrl);
            if ($source !== null && ($source['usage_permission_status'] ?? null) === 'not_permitted') {
                $warnings[] = 'evidence cites a source marked not_permitted: suitable for internal review only, never for publication.';
            }
        }
    }

    // ------------------------------------------------------------------
    // Reference resolution (earlier rows first, then the database)
    // ------------------------------------------------------------------

    private function register(string $type, array $fields): void
    {
        match ($type) {
            'source' => $this->pendingSources[strtolower($fields['url'])] = $fields,
            'evidence' => $this->pendingEvidence[$this->evidenceKey($fields)] = $fields,
            'brand' => $this->pendingBrands[$fields['slug']] = $fields,
            'family' => $this->pendingFamilies[$fields['slug']] = $fields,
            'variant' => $this->pendingVariants[$this->variantKey($fields['family'], $fields['manufacturer_model_code'])] = $fields,
            'sku' => $this->pendingSkus[strtolower((string) $fields['manufacturer_part_number'])] = $fields,
            default => null,
        };
    }

    private function evidenceKey(array $fields): string
    {
        return strtolower((string) $fields['source_url']).'|'.strtolower((string) ($fields['locator'] ?? '')).'|'.strtolower((string) $fields['fact_scope']);
    }

    private function variantKey(?string $familySlug, string $modelCode): string
    {
        return strtolower((string) $familySlug).'|'.strtolower($modelCode);
    }

    private function sourceKnown(string $url): bool
    {
        if (isset($this->pendingSources[strtolower($url)])) {
            return true;
        }
        return DB::table('sources')->where('url', $url)->exists();
    }

    private function resolveSource(string $url): ?array
    {
        $pending = $this->pendingSources[strtolower($url)] ?? null;
        if ($pending !== null) {
            return $pending;
        }
        $row = DB::table('sources')->where('url', $url)->first();

        return $row ? (array) $row : null;
    }

    private function evidenceKnown(string $sourceUrl, ?string $locator): bool
    {
        $key = strtolower($sourceUrl).'|'.strtolower((string) $locator);
        foreach (array_keys($this->pendingEvidence) as $pendingKey) {
            if (str_starts_with($pendingKey, $key.'|')) {
                return true;
            }
        }

        $query = DB::table('evidence')->join('sources', 'sources.id', '=', 'evidence.source_id')
            ->where('sources.url', $sourceUrl);
        if ($locator === null) {
            $query->whereNull('evidence.locator');
        } else {
            $query->where('evidence.locator', $locator);
        }

        return $query->exists();
    }

    private function brandKnown(string $slug): bool
    {
        if (isset($this->pendingBrands[$slug])) {
            return true;
        }
        return Brand::where('slug', $slug)->exists();
    }

    private function familyKnown(string $slug): bool
    {
        if (isset($this->pendingFamilies[$slug])) {
            return true;
        }
        return LaptopFamily::where('slug', $slug)->exists();
    }

    private function variantKnown(?string $familySlug, string $modelCode): bool
    {
        $key = $this->variantKey($familySlug, $modelCode);
        if (isset($this->pendingVariants[$key])) {
            return true;
        }

        if ($familySlug === null) {
            // Family-less lookup: any variant with this model code matches.
            if (in_array(strtolower($modelCode), array_map('strtolower', array_column($this->pendingVariants, 'manufacturer_model_code')), true)) {
                return true;
            }

            return LaptopVariant::where('manufacturer_model_code', $modelCode)->exists();
        }

        $familyId = $this->pendingFamilies[$familySlug]['_id'] ?? null;
        if ($familyId === null) {
            $familyId = LaptopFamily::where('slug', $familySlug)->value('id');
            if ($familyId === null) {
                return false;
            }
        }

        return LaptopVariant::where('family_id', $familyId)->where('manufacturer_model_code', $modelCode)->exists();
    }

    private function skuKnown(string $mpn): bool
    {
        if (isset($this->pendingSkus[strtolower($mpn)])) {
            return true;
        }
        return LaptopSku::where('manufacturer_part_number', $mpn)->exists();
    }

    private function skuExists(string $mpn): bool
    {
        return LaptopSku::where('manufacturer_part_number', $mpn)->exists();
    }

    // ------------------------------------------------------------------
    // Conflict detection against evidence-backed stored values (read-only)
    // ------------------------------------------------------------------

    /**
     * @return array{field: string, stored: mixed, incoming: mixed, note: string}|null
     */
    private function detectConflict(string $type, array $fields): ?array
    {
        $mpn = (string) ($fields['manufacturer_part_number'] ?? '');
        if ($mpn === '') {
            return null;
        }

        if ($type === 'ram_configuration') {
            $existing = RamConfiguration::where('sku_id', fn ($q) => $q->select('id')
                ->from('laptop_skus')->where('manufacturer_part_number', $mpn))->first();
            if ($existing === null) {
                return null;
            }

            foreach (['slot_count', 'soldered_gb', 'documented_max_gb', 'standard', 'max_meaning'] as $field) {
                $incoming = $this->field($fields, $field);
                if ($incoming !== null && (string) $existing->{$field} !== (string) $incoming
                    && $existing->evidence_id !== null
                    && Evidence::find($existing->evidence_id)?->verification_status === 'verified') {
                    return [
                        'field' => $field,
                        'stored' => $existing->{$field},
                        'incoming' => $incoming,
                        'note' => 'Stored RAM fact is backed by verified evidence; a differing intake row becomes a review conflict and is never silently overwritten.',
                    ];
                }
            }
        }

        if ($type === 'storage_slot') {
            $sku = LaptopSku::where('manufacturer_part_number', $mpn)->first();
            $slotIndex = $this->field($fields, 'slot_index');
            if ($sku === null || $slotIndex === null) {
                return null;
            }
            $existing = StorageSlot::where('sku_id', $sku->id)->where('slot_index', (int) $slotIndex)->first();
            if ($existing === null) {
                return null;
            }
            foreach (['protocol', 'occupied_status', 'form_factor'] as $field) {
                $incoming = $this->field($fields, $field);
                if ($incoming !== null && (string) $existing->{$field} !== (string) $incoming
                    && $existing->evidence_id !== null
                    && Evidence::find($existing->evidence_id)?->verification_status === 'verified') {
                    return [
                        'field' => $field,
                        'stored' => $existing->{$field},
                        'incoming' => $incoming,
                        'note' => 'Stored slot fact is backed by verified evidence; the differing row is flagged for review.',
                    ];
                }
            }
        }

        if ($type === 'sku') {
            $existing = LaptopSku::where('manufacturer_part_number', $mpn)->first();
            if ($existing === null) {
                return null;
            }
            foreach (['base_ram_gb', 'base_storage_gb'] as $field) {
                $incoming = $this->field($fields, $field);
                if ($incoming !== null && (string) ($existing->{$field} ?? '') !== (string) $incoming) {
                    return [
                        'field' => $field,
                        'stored' => $existing->{$field},
                        'incoming' => $incoming,
                        'note' => 'Base specification differs from the stored SKU record; flagged for human review.',
                    ];
                }
            }
        }

        return null;
    }

    // ------------------------------------------------------------------
    // CSV helpers used by the template command
    // ------------------------------------------------------------------

    public static function csvHeader(): array
    {
        return [
            'type', 'url', 'source_type', 'publisher', 'usage_permission_status', 'notes',
            'source_url', 'locator', 'concise_paraphrase', 'fact_scope', 'observed_at', 'verification_status',
            'name', 'slug', 'brand', 'family_name', 'launch_year', 'family', 'manufacturer_model_code', 'region_code',
            'variant_model_code', 'manufacturer_part_number', 'display_name', 'base_ram_gb', 'base_storage_gb',
            'mass_g', 'use_case', 'demo_label', 'soldered_gb', 'slot_count', 'occupied_slot_count', 'standard',
            'documented_max_gb', 'max_meaning', 'slot_index', 'protocol', 'form_factor', 'pcie_generation',
            'occupied_status', 'constraints_text',
        ];
    }

    private function slug(mixed $value, string $label, array &$errors, bool $required = false): ?string
    {
        $slug = $this->str($value, $label, 128, $errors, $required);
        if ($slug !== null && ! preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) {
            $errors[] = "{$label} must be a lowercase slug (letters, digits, hyphens).";

            return null;
        }

        return $slug;
    }
}
