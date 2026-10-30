<?php

namespace App\Services\Intake;

use App\Models\Brand;
use App\Models\ComponentClass;
use App\Models\ConflictFlag;
use App\Models\Evidence;
use App\Models\LaptopFamily;
use App\Models\LaptopSku;
use App\Models\LaptopVariant;
use App\Models\RamConfiguration;
use App\Models\Retailer;
use App\Models\Source;
use App\Models\StorageSlot;
use App\Services\Audit;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Commit mode for the manual intake (M3.2/M3.3).
 *
 * Applied only after an owner permit passes the command-level gate. All
 * rows apply inside one transaction, in file order, by natural-key
 * upsert. Re-applying an identical accepted fixture changes nothing and
 * therefore writes no new audit events (idempotence). Conflicting rows
 * are never applied: they become open conflict_flags for human review.
 *
 * Intake can never publish: SKUs it creates are drafts, existing status
 * is preserved, and compatibility assertions it creates are unreviewed —
 * both keep the M2 publication gate closed.
 */
class IntakeApplier
{
    /**
     * @param  list<array<string, mixed>>  $validatedRows  rows as produced by IntakeValidator (with _fields)
     * @param  int|null  $actorId  authenticated staff user, or null for console-owner runs
     * @return array<string, mixed> summary of what was applied/skipped
     */
    public function commit(array $validatedRows, ?int $actorId): array
    {
        $applied = 0;
        $skipped = 0;
        $rowResults = [];

        DB::transaction(function () use ($validatedRows, $actorId, &$applied, &$skipped, &$rowResults) {
            foreach ($validatedRows as $row) {
                $status = $row['status'];

                if ($status === 'error') {
                    $skipped++;
                    $rowResults[] = ['index' => $row['index'], 'type' => $row['type'], 'action' => 'skipped_error'];

                    continue;
                }

                if ($status === 'conflict') {
                    $this->recordConflict($row, $actorId);
                    $skipped++;
                    $rowResults[] = ['index' => $row['index'], 'type' => $row['type'], 'action' => 'skipped_conflict'];

                    continue;
                }

                $action = $this->applyRow($row['_fields'], $row['type'], $actorId);
                if ($action !== 'unchanged') {
                    $applied++;
                }
                $rowResults[] = ['index' => $row['index'], 'type' => $row['type'], 'action' => $action];
            }
        });

        return [
            'applied' => $applied,
            'skipped' => $skipped,
            'rows' => $rowResults,
        ];
    }

    private function applyRow(array $fields, string $type, ?int $actorId): string
    {
        return match ($type) {
            'source' => $this->applySource($fields, $actorId),
            'evidence' => $this->applyEvidence($fields, $actorId),
            'brand' => $this->applyBrand($fields, $actorId),
            'family' => $this->applyFamily($fields, $actorId),
            'variant' => $this->applyVariant($fields, $actorId),
            'sku' => $this->applySku($fields, $actorId),
            'ram_configuration' => $this->applyRam($fields, $actorId),
            'storage_slot' => $this->applySlot($fields, $actorId),
            'compatibility_assertion' => $this->applyAssertion($fields, $actorId),
            'offer' => $this->applyOffer($fields, $actorId),
        };
    }

    /**
     * Shared upsert for rows with boring semantics: locate by natural key
     * (null-safe — `where(col, null)` never matches SQL NULL), create with
     * locate+extra attributes, update only when `changed()`, audit both.
     * Evidence/assertion/offer are hand-written: their update semantics
     * (frozen reviewer status, supersede-not-overwrite) are the point.
     *
     * @param  array<string, mixed>  $locate  natural-key attributes; null values match SQL NULL
     * @param  array<string, mixed>  $new  the updatable attributes
     * @param  array<string, mixed>  $createAttributes  create-only extras (e.g. server-owned status)
     * @param  array<string, mixed>  $auditNew  what the audit event records for creates
     */
    private function upsert(string $modelClass, array $locate, array $new, ?int $actorId, string $entity, array $auditNew, array $createAttributes = []): string
    {
        $query = $modelClass::query();
        foreach ($locate as $column => $value) {
            $value === null ? $query->whereNull($column) : $query->where($column, $value);
        }
        $existing = $query->first();

        if ($existing === null) {
            $model = $modelClass::create($new + $locate + $createAttributes);
            Audit::record($actorId, $entity, $model->id, 'intake_create', null, $auditNew);

            return 'created';
        }

        if (! $this->changed($existing, $new)) {
            return 'unchanged';
        }

        $old = $existing->only(array_keys($new));
        $existing->fill($new)->save();
        Audit::record($actorId, $entity, $existing->id, 'intake_update', $old, $new);

        return 'updated';
    }

    private function changed(object $model, array $new): bool
    {
        foreach ($new as $field => $value) {
            $stored = $model->{$field} ?? null;

            // Representation-drift-proof comparison (D36 idempotence):
            // numbers compare numerically ("16" == "16.00"), dates compare
            // as instants, everything else as trimmed strings.
            if (is_numeric($value) && is_numeric($stored)) {
                if (abs((float) $value - (float) $stored) >= 0.001) {
                    return true;
                }
                continue;
            }
            if ($value instanceof \DateTimeInterface || $stored instanceof \DateTimeInterface) {
                try {
                    if (Carbon::parse($value)?->notEqualTo(Carbon::parse($stored))) {
                        return true;
                    }
                    continue;
                } catch (\Exception) {
                    // fall through to string comparison
                }
            }
            if (trim((string) $stored) !== trim((string) $value)) {
                return true;
            }
        }

        return false;
    }

    // ------------------------------------------------------------------

    private function applySource(array $f, ?int $actorId): string
    {
        return $this->upsert(Source::class, ['url' => $f['url']], [
            'source_type' => $f['source_type'],
            'publisher' => $f['publisher'] ?? null,
            'usage_permission_status' => $f['usage_permission_status'],
            'notes' => $f['notes'] ?? null,
        ], $actorId, 'sources', ['url' => $f['url'], 'usage_permission_status' => $f['usage_permission_status']]);
    }

    private function applyEvidence(array $f, ?int $actorId): string
    {
        $source = Source::where('url', $f['source_url'])->firstOrFail();

        $query = Evidence::where('source_id', $source->id)->where('fact_scope', $f['fact_scope']);
        if (($f['locator'] ?? null) === null) {
            $query->whereNull('locator');
        } else {
            $query->where('locator', $f['locator']);
        }
        $existing = $query->first();

        $new = [
            'concise_paraphrase' => $f['concise_paraphrase'],
            'observed_at' => Carbon::parse($f['observed_at']),
            'verification_status' => $f['verification_status'],
        ];

        if ($existing === null) {
            $evidence = Evidence::create($new + [
                'source_id' => $source->id,
                'locator' => $f['locator'] ?? null,
                'fact_scope' => $f['fact_scope'],
            ]);
            Audit::record($actorId, 'evidence', $evidence->id, 'intake_create', null, [
                'source_url' => $f['source_url'], 'fact_scope' => $f['fact_scope'],
            ]);

            return 'created';
        }

        if (! $this->changed($existing, $new)) {
            return 'unchanged';
        }

        // A differing paraphrase or status for the same locator/scope is a
        // fact change: record it, but never touch verification_status set
        // by a human reviewer without their action.
        $old = $existing->only(array_keys($new));
        $applied = $new;
        $applied['verification_status'] = $existing->verification_status;
        $existing->fill($applied)->save();
        Audit::record($actorId, 'evidence', $existing->id, 'intake_update', $old, $applied);

        return 'updated';
    }

    private function applyBrand(array $f, ?int $actorId): string
    {
        return $this->upsert(Brand::class, ['slug' => $f['slug']], [
            'name' => $f['name'],
        ], $actorId, 'brands', ['slug' => $f['slug']]);
    }

    private function applyFamily(array $f, ?int $actorId): string
    {
        $brand = Brand::where('slug', $f['brand'])->firstOrFail();

        return $this->upsert(LaptopFamily::class, ['brand_id' => $brand->id, 'slug' => $f['slug']], [
            'family_name' => $f['family_name'],
            'launch_year' => isset($f['launch_year']) && $f['launch_year'] !== null && $f['launch_year'] !== '' ? (int) $f['launch_year'] : null,
        ], $actorId, 'laptop_families', ['brand' => $f['brand'], 'slug' => $f['slug']]);
    }

    private function applyVariant(array $f, ?int $actorId): string
    {
        $family = LaptopFamily::where('slug', $f['family'])->firstOrFail();

        return $this->upsert(LaptopVariant::class, [
            'family_id' => $family->id,
            'manufacturer_model_code' => $f['manufacturer_model_code'],
            'region_code' => $f['region_code'] ?? null,
        ], ['notes' => $f['notes'] ?? null], $actorId, 'laptop_variants', [
            'family' => $f['family'], 'manufacturer_model_code' => $f['manufacturer_model_code'],
        ]);
    }

    private function applySku(array $f, ?int $actorId): string
    {
        $variant = $this->resolveVariant($f);
        $new = [
            'display_name' => $f['display_name'],
            'cpu_id' => null, 'gpu_id' => null, 'display_id' => null,
            'base_ram_gb' => isset($f['base_ram_gb']) && $f['base_ram_gb'] !== null && $f['base_ram_gb'] !== '' ? (int) $f['base_ram_gb'] : null,
            'base_storage_gb' => isset($f['base_storage_gb']) && $f['base_storage_gb'] !== null && $f['base_storage_gb'] !== '' ? (int) $f['base_storage_gb'] : null,
            'mass_g' => isset($f['mass_g']) && $f['mass_g'] !== null && $f['mass_g'] !== '' ? (int) $f['mass_g'] : null,
            'use_case' => $f['use_case'] ?? null,
        ];

        // Status is server-owned and create-only: an existing published SKU
        // stays published and a draft stays draft; the publication gate is
        // untouched by intake.
        return $this->upsert(LaptopSku::class, ['manufacturer_part_number' => $f['manufacturer_part_number']], $new, $actorId, 'laptop_skus', [
            'manufacturer_part_number' => $f['manufacturer_part_number'], 'status' => 'draft',
        ], ['variant_id' => $variant->id, 'status' => 'draft']);
    }

    private function applyRam(array $f, ?int $actorId): string
    {
        $sku = LaptopSku::where('manufacturer_part_number', $f['manufacturer_part_number'])->firstOrFail();

        return $this->upsert(RamConfiguration::class, ['sku_id' => $sku->id], $this->intFields($f, ['soldered_gb', 'slot_count', 'occupied_slot_count', 'documented_max_gb']) + [
            'standard' => $f['standard'] ?? null,
            'max_meaning' => $f['max_meaning'],
            'evidence_id' => $this->resolveEvidenceId($f),
        ], $actorId, 'ram_configurations', ['sku' => $sku->manufacturer_part_number]);
    }

    private function applySlot(array $f, ?int $actorId): string
    {
        $sku = LaptopSku::where('manufacturer_part_number', $f['manufacturer_part_number'])->firstOrFail();

        return $this->upsert(StorageSlot::class, ['sku_id' => $sku->id, 'slot_index' => (int) $f['slot_index']], [
            'form_factor' => $f['form_factor'] ?? null,
            'protocol' => $f['protocol'],
            'pcie_generation' => $f['pcie_generation'] ?? null,
            'occupied_status' => $f['occupied_status'],
            'constraints_text' => $f['constraints_text'] ?? null,
            'evidence_id' => $this->resolveEvidenceId($f),
        ], $actorId, 'storage_slots', ['sku' => $sku->manufacturer_part_number, 'slot_index' => (int) $f['slot_index']]);
    }

    private function applyAssertion(array $f, ?int $actorId): string
    {
        $sku = LaptopSku::where('manufacturer_part_number', $f['manufacturer_part_number'])->firstOrFail();
        $component = $f['component'];
        $class = ComponentClass::firstOrCreate([
            'component_type' => $component['component_type'],
            'standard' => $component['standard'],
            'form_factor' => $component['form_factor'],
        ], [
            'protocol' => $component['protocol'] ?? null,
            'capacity_gb' => isset($component['capacity_gb']) && $component['capacity_gb'] !== null && $component['capacity_gb'] !== '' ? (int) $component['capacity_gb'] : null,
        ]);
        $evidenceId = $this->resolveEvidenceId($f);

        $existing = DB::table('compatibility_assertions')
            ->where('sku_id', $sku->id)->where('component_class_id', $class->id)->where('evidence_id', $evidenceId)
            ->first();

        $new = [
            'outcome' => $f['outcome'],
            'reason' => $f['reason'],
            'scope_notes' => $f['scope_notes'] ?? null,
            'confidence_level' => $f['confidence_level'],
        ];

        if ($existing === null) {
            // Unreviewed: reviewed_by/reviewed_at stay null so the
            // publication gate refuses to publish around them.
            $id = DB::table('compatibility_assertions')->insertGetId($new + [
                'sku_id' => $sku->id,
                'component_class_id' => $class->id,
                'evidence_id' => $evidenceId,
                'reviewed_by' => null,
                'reviewed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            Audit::record($actorId, 'compatibility_assertions', $id, 'intake_create', null, ['sku' => $sku->manufacturer_part_number] + $new);

            return 'created';
        }

        $current = (array) $existing;
        $differs = collect($new)->contains(fn ($value, $field) => (string) ($current[$field] ?? '') !== (string) $value);
        if (! $differs) {
            return 'unchanged';
        }

        DB::table('compatibility_assertions')->where('id', $current['id'])->update($new + ['updated_at' => now()]);
        Audit::record($actorId, 'compatibility_assertions', $current['id'], 'intake_update',
            collect($new)->mapWithKeys(fn ($v, $k) => [$k => $current[$k] ?? null])->all(), $new);

        return 'updated';
    }

    private function applyOffer(array $f, ?int $actorId): string
    {
        $sku = LaptopSku::where('manufacturer_part_number', $f['manufacturer_part_number'])->firstOrFail();
        $retailerData = $f['retailer'];
        $retailer = Retailer::firstOrCreate(
            ['name' => $retailerData['name']],
            [
                'website_url' => $retailerData['website_url'],
                'country' => $retailerData['country'] ?? 'EG',
                'status' => 'uncatalogued',
            ]
        );
        $evidenceId = $this->resolveEvidenceId($f);

        $new = [
            'product_url' => $f['product_url'],
            'currency' => 'EGP',
            'displayed_price_egp' => $f['displayed_price_egp'] ?? null,
            'available_status' => $f['available_status'],
            'observed_at' => Carbon::parse($f['observed_at']),
            'recorded_at' => now(),
            'active' => $this->toBool($f['active'] ?? null),
        ];

        $existing = DB::table('retailer_offers')
            ->where('sku_id', $sku->id)->where('retailer_id', $retailer->id)->where('product_url', $f['product_url'])
            ->first();

        if ($existing === null) {
            if ($evidenceId === null) {
                throw new \RuntimeException('Offer rows require a resolvable evidence reference; validation should have rejected this file.');
            }

            $offerId = DB::table('retailer_offers')->insertGetId($new + [
                'sku_id' => $sku->id,
                'retailer_id' => $retailer->id,
                'retailer_sku' => null,
                'source_id' => Evidence::findOrFail($evidenceId)->source_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            Audit::record($actorId, 'retailer_offers', $offerId, 'intake_create', null, [
                'sku' => $sku->manufacturer_part_number, 'retailer' => $retailer->name,
                'displayed_price_egp' => $new['displayed_price_egp'],
            ]);

            return 'created';
        }

        $current = (array) $existing;
        $priceChanged = (string) ($current['displayed_price_egp'] ?? '') !== (string) ($new['displayed_price_egp'] ?? '');
        $statusChanged = (string) $current['available_status'] !== (string) $new['available_status'];

        if (! $priceChanged && ! $statusChanged && (bool) $current['active'] === $new['active']) {
            return 'unchanged';
        }

        // An observed price change is a NEW observation, not an overwrite:
        // the old offer is deactivated and a new row records the new fact.
        DB::table('retailer_offers')->where('id', $current['id'])->update(['active' => false, 'updated_at' => now()]);
        $offerId = DB::table('retailer_offers')->insertGetId($new + [
            'sku_id' => $sku->id,
            'retailer_id' => $retailer->id,
            'retailer_sku' => $current['retailer_sku'],
            'source_id' => Evidence::findOrFail($evidenceId ?? $current['source_id'])->source_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        Audit::record($actorId, 'retailer_offers', $offerId, 'intake_supersede', [
            'displayed_price_egp' => $current['displayed_price_egp'], 'available_status' => $current['available_status'],
        ], ['displayed_price_egp' => $new['displayed_price_egp'], 'available_status' => $new['available_status']]);

        return 'superseded';
    }

    // ------------------------------------------------------------------

    private function resolveVariant(array $f): LaptopVariant
    {
        if (isset($f['family']) && $f['family'] !== null && $f['family'] !== '') {
            $family = LaptopFamily::where('slug', $f['family'])->firstOrFail();

            return LaptopVariant::where('family_id', $family->id)
                ->where('manufacturer_model_code', $f['variant_model_code'])
                ->firstOrFail();
        }

        return LaptopVariant::where('manufacturer_model_code', $f['variant_model_code'])->firstOrFail();
    }

    private function resolveEvidenceId(array $f): ?int
    {
        $evidence = $f['evidence'] ?? null;
        if (! is_array($evidence)) {
            return null;
        }

        $source = Source::where('url', $evidence['source_url'])->firstOrFail();

        $query = Evidence::where('source_id', $source->id);
        if (($evidence['locator'] ?? null) === null) {
            $query->whereNull('locator');
        } else {
            $query->where('locator', $evidence['locator']);
        }
        if (($evidence['fact_scope'] ?? null) !== null) {
            $query->where('fact_scope', $evidence['fact_scope']);
        }

        return $query->first()?->id;
    }

    private function intFields(array $f, array $names): array
    {
        $out = [];
        foreach ($names as $name) {
            $value = $f[$name] ?? null;
            $out[$name] = ($value === null || $value === '') ? null : (int) $value;
        }

        return $out;
    }

    private function toBool(mixed $value): bool
    {
        if ($value === null) {
            return true;
        }

        return in_array(strtolower((string) $value), ['true', '1', 'yes'], true);
    }

    private function recordConflict(array $row, ?int $actorId): void
    {
        $fields = $row['_fields'];
        $conflict = $row['conflict'];

        // Anchor conflicts to the SKU entity so the M2 publication gate
        // (open conflicts on laptop_skus) also refuses to publish around
        // an unresolved intake conflict.
        $skuId = (int) (LaptopSku::where('manufacturer_part_number', (string) ($fields['manufacturer_part_number'] ?? ''))
            ->value('id') ?? 0);

        // Re-committing the same conflicting fixture must not accumulate
        // duplicate open flags for the same field.
        ConflictFlag::firstOrCreate([
            'entity_type' => 'laptop_skus',
            'entity_id' => $skuId,
            'field_name' => $conflict['field'],
            'status' => 'open',
        ], [
            // The column is text: intake conflicts record the disagreeing
            // VALUES (what a resolver needs), not evidence row IDs.
            'evidence_ids' => json_encode(['stored' => $conflict['stored'], 'incoming' => $conflict['incoming']]),
            'resolution_notes' => 'Manual intake conflict: '.($conflict['note'] ?? ''),
            'resolved_by' => null, // open flag: nobody has resolved it yet
        ]);
    }
}
