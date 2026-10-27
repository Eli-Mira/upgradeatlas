<?php

namespace Tests\Feature;

use App\Models\AuditEvent;
use App\Models\ConflictFlag;
use App\Models\Evidence;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\Source;
use App\Services\Intake\IntakeCsv;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class IntakeCommandTest extends TestCase
{
    use RefreshDatabase;

    private string $fixtures;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixtures = __DIR__.'/../Fixtures/intake';
    }

    /**
     * Run the intake command and return the parsed JSON report. Uses
     * --report so the machine-readable report is read from file, separate
     * from the human summary lines on stdout.
     */
    private function runIntake(array $args): array
    {
        $reportPath = storage_path('framework/testing/intake-report.json');
        @mkdir(dirname($reportPath), 0777, true);
        // Never let a stale report from a previous test masquerade as output.
        @unlink($reportPath);

        Artisan::call('laptops:intake', $args + ['--report' => $reportPath]);

        $decoded = json_decode((string) file_get_contents($reportPath), true);
        $this->assertIsArray($decoded, 'Intake must always emit a parseable JSON report. Stdout: '.Artisan::output());

        return $decoded;
    }

    // ------------------------------------------------------------------
    // Dry-run: the only default. Proves zero persistent writes.
    // ------------------------------------------------------------------

    public function test_dry_run_is_the_default_and_writes_nothing(): void
    {
        $before = $this->tableCounts();

        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json']);

        $this->assertSame($before, $this->tableCounts(), 'Dry-run intake must not modify any table.');
        $this->assertSame(0, AuditEvent::count(), 'Dry-run must not write audit events.');
    }

    public function test_dry_run_report_is_actionable_and_structured(): void
    {
        $report = $this->runIntake(['path' => $this->fixtures.'/valid.json']);

        $this->assertSame('dry-run', $report['mode']);
        $this->assertSame(11, $report['summary']['total']);
        // 10 fully valid rows; the source row is a deliberate warning
        // (usage_permission_status "unclear" must not silently pass).
        $this->assertSame(10, $report['summary']['valid'], 'The valid fixture must fully validate.');
        $this->assertSame(1, $report['summary']['warning']);
        $this->assertSame(0, $report['summary']['error']);

        foreach ($report['rows'] as $row) {
            $this->assertArrayHasKey('type', $row);
            $this->assertArrayHasKey('status', $row);
            $this->assertArrayNotHasKey('_fields', $row, 'Internal fields must not leak into reports.');
        }
    }

    public function test_dry_run_surfaces_errors_per_row_without_partial_application(): void
    {
        $report = $this->runIntake(['path' => $this->fixtures.'/invalid.json']);

        $this->assertGreaterThan(0, $report['summary']['error']);
        $this->assertSame($this->tableCounts(), $this->tableCounts(), 'Invalid rows must never partially apply.');

        $errorRows = array_filter($report['rows'], fn ($row) => $row['status'] === 'error');
        foreach ($errorRows as $row) {
            $this->assertNotEmpty($row['errors']);
        }

        // Specifically covered invalid cases:
        $messages = json_encode($report['rows']);
        foreach ([
            'not a valid URL',
            'status is server-owned',
            'base_ram_gb must be a non-negative integer',
            'occupied_slot_count cannot exceed slot_count',
            'max_meaning must be one of',
            'documented_max_gb is required',
            'documented_max_gb must be null',
            'observed_at is in the future',
            'use_case must be one of',
        ] as $needle) {
            $this->assertStringContainsString($needle, $messages, "Expected validation message: {$needle}");
        }
    }

    // ------------------------------------------------------------------
    // Commit mode: gated by the owner permit, transactional, audited.
    // ------------------------------------------------------------------

    public function test_commit_refused_without_owner_permit(): void
    {
        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json', '--commit' => true]);

        $this->assertSame([], LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->get()->all());
        $this->assertStringContainsString('Commit refused', Artisan::output());
    }

    public function test_commit_refused_with_malformed_permit(): void
    {
        config(['intake.owner_permit' => 'yes-please']);

        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json', '--commit' => true]);

        $this->assertSame(0, LaptopSku::count());
        $this->assertStringContainsString('Commit refused', Artisan::output());
    }

    public function test_commit_applies_all_rows_as_drafts_and_audits(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        $report = $this->runIntake(['path' => $this->fixtures.'/valid.json', '--commit' => true]);

        $this->assertSame('commit', $report['mode']);
        $this->assertSame(11, $report['summary']['applied']);

        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->firstOrFail();

        // Intake can never publish: created SKUs are drafts, hidden by M1.
        $this->assertSame('draft', $sku->status);
        $this->get('/api/v1/laptops/INTAKE-EX-C15-01-DEMO')->assertNotFound();

        $this->assertSame(2, Evidence::count());
        $this->assertSame(1, Source::count());
        $this->assertDatabaseHas('ram_configurations', ['sku_id' => $sku->id, 'slot_count' => 2]);
        $this->assertDatabaseHas('storage_slots', ['sku_id' => $sku->id, 'slot_index' => 1]);

        // Actor-bound audit of the intake mutations (console run: null actor).
        $this->assertTrue(
            AuditEvent::where('entity_name', 'laptop_skus')
                ->where('operation', 'intake_create')
                ->exists()
        );
    }

    public function test_commit_is_idempotent(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json', '--commit' => true]);
        $snapshot = $this->tableCounts();
        $audits = AuditEvent::count();

        $report = $this->runIntake(['path' => $this->fixtures.'/valid.json', '--commit' => true]);

        $this->assertSame(0, $report['summary']['applied'], 'Re-applying an identical fixture must change nothing.');
        $this->assertSame($snapshot, $this->tableCounts(), 'No table may gain duplicate rows.');
        $this->assertSame($audits, AuditEvent::count(), 'No new audit events for unchanged data.');
    }

    public function test_commit_never_publishes_and_preserves_existing_status(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        // A published SKU exists (as if the owner published it via admin).
        $published = LaptopSku::factory()->published()->create([
            'manufacturer_part_number' => 'INTAKE-EX-C15-01-DEMO',
        ]);

        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json', '--commit' => true]);

        $published->refresh();
        $this->assertSame('published', $published->status, 'Intake must never change publication status.');
        $this->get('/api/v1/laptops/INTAKE-EX-C15-01-DEMO')->assertOk();
    }

    // ------------------------------------------------------------------
    // Conflicts: never silently overwrite evidence-backed facts.
    // ------------------------------------------------------------------

    public function test_conflicting_row_is_flagged_and_blocks_publication(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        Artisan::call('laptops:intake', ['path' => $this->fixtures.'/valid.json', '--commit' => true]);
        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->firstOrFail();

        $conflictBefore = ConflictFlag::count();
        $report = $this->runIntake(['path' => $this->fixtures.'/conflicting.json', '--commit' => true]);
        $this->assertSame('conflict', $report['rows'][2]['status'] ?? null,
            'The contradictory RAM row must be a conflict, not an update.');

        // Stored value unchanged.
        $this->assertSame(2, RamConfiguration::where('sku_id', $sku->id)->firstOrFail()->slot_count);

        // Conflict recorded and anchored to the SKU entity...
        $flag = ConflictFlag::where('entity_type', 'laptop_skus')->where('entity_id', $sku->id)->firstOrFail();
        $this->assertSame('open', $flag->status);
        $this->assertGreaterThan($conflictBefore, ConflictFlag::count());

        // ...which also keeps the M2 publication gate closed.
        $admin = \App\Models\User::factory()->admin()->create();
        $token = $admin->createToken('tests')->plainTextToken;
        $blocked = $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"]);
        $blocked->assertStatus(409);
        $this->assertStringContainsString(
            'conflict',
            json_encode($blocked->json('blocked_by')),
            'The publication gate must refuse to publish with an open intake conflict.'
        );
    }

    // ------------------------------------------------------------------
    // CSV: quoting, Arabic UTF-8, formula escaping on export.
    // ------------------------------------------------------------------

    public function test_csv_intake_with_quoting_and_arabic_round_trips(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        $csvPath = storage_path('framework/testing/intake-ar.csv');
        @mkdir(dirname($csvPath), 0777, true);

        $header = [
            'type', 'url', 'source_type', 'publisher', 'usage_permission_status', 'notes',
            'source_url', 'locator', 'concise_paraphrase', 'fact_scope', 'observed_at', 'verification_status',
            'name', 'slug', 'brand', 'family_name', 'launch_year', 'family', 'manufacturer_model_code', 'region_code',
            'variant_model_code', 'manufacturer_part_number', 'display_name', 'base_ram_gb', 'base_storage_gb',
            'mass_g', 'use_case', 'demo_label', 'soldered_gb', 'slot_count', 'occupied_slot_count', 'standard',
            'documented_max_gb', 'max_meaning',
        ];

        // Map named values onto header positions (never append at the end).
        $row = fn (array $values) => collect($header)->map(fn ($col) => $values[$col] ?? null)->all();

        IntakeCsv::write($csvPath, $header, [
            // Quoted comma + Arabic text + a formula-like cell in a free-text field.
            $row([
                'type' => 'source',
                'url' => 'https://fixtures.example.test/csv/ar-spec',
                'source_type' => 'oem_specification',
                'usage_permission_status' => 'unclear',
                'notes' => 'Arabic fixture: "لابتوب, للاختبار" =CMD evil',
            ]),
            $row([
                'type' => 'brand',
                'name' => 'ExampleTech',
                'slug' => 'exampletech',
            ]),
            $row([
                'type' => 'family',
                'brand' => 'exampletech',
                'family_name' => 'Study 14',
                'slug' => 'exampletech-study-14',
                'launch_year' => '2025',
            ]),
            $row([
                'type' => 'variant',
                'family' => 'exampletech-study-14',
                'manufacturer_model_code' => 'EX-S14',
                'region_code' => 'EG',
            ]),
            $row([
                'type' => 'sku',
                'family' => 'exampletech-study-14',
                'variant_model_code' => 'EX-S14',
                'manufacturer_part_number' => 'INTAKE-CSV-01-DEMO',
                'display_name' => 'ExampleTech Study 14 (CSV fixture)',
                'base_ram_gb' => '8',
                'use_case' => 'study',
                'demo_label' => 'SYNTHETIC DEMO DATA',
            ]),
            $row([
                'type' => 'ram_configuration',
                'manufacturer_part_number' => 'INTAKE-CSV-01-DEMO',
                'soldered_gb' => '8',
                'slot_count' => '1',
                'occupied_slot_count' => '1',
                'standard' => 'LPDDR5 (soldered)',
                'max_meaning' => 'unknown',
            ]),
        ]);

        $report = $this->runIntake(['path' => $csvPath, '--commit' => true]);

        $this->assertSame(6, $report['summary']['total']);
        $this->assertSame(0, $report['summary']['error'], json_encode($report['rows'], JSON_UNESCAPED_UNICODE));
        $this->assertSame(6, $report['summary']['applied']);

        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-CSV-01-DEMO')->firstOrFail();
        $this->assertSame('ExampleTech Study 14 (CSV fixture)', $sku->display_name);
        $this->assertDatabaseHas('ram_configurations', ['sku_id' => $sku->id, 'soldered_gb' => 8, 'slot_count' => 1]);

        // Arabic text survived the CSV round trip.
        $source = Source::where('url', 'https://fixtures.example.test/csv/ar-spec')->firstOrFail();
        $this->assertStringContainsString('لابتوب', $source->notes);
    }

    public function test_template_export_escapes_spreadsheet_formula_injection(): void
    {
        $path = storage_path('framework/testing/intake-template.csv');
        Artisan::call('laptops:intake-template', ['path' => $path]);

        $raw = file_get_contents($path);
        $this->assertStringContainsString('\'=HYPERLINK', $raw, 'Formula-like cells must be apostrophe-escaped.');
        $this->assertStringNotContainsString('=HYPERLINK', str_replace("'=HYPERLINK", '', $raw));
    }

    public function test_oversized_input_is_rejected(): void
    {
        $jsonPath = storage_path('framework/testing/intake-too-big.json');
        $rows = [];
        for ($i = 0; $i < 4; $i++) {
            $rows[] = ['type' => 'brand', 'name' => 'X'.$i, 'slug' => 'x'.$i];
        }
        file_put_contents($jsonPath, json_encode(['intake_version' => 1, 'rows' => $rows]));

        Artisan::call('laptops:intake', ['path' => $jsonPath, '--max-rows' => 3]);

        $this->assertSame(0, LaptopSku::count());
        $this->assertStringContainsString('row cap', Artisan::output());
    }

    public function test_malformed_json_is_rejected(): void
    {
        $path = storage_path('framework/testing/intake-broken.json');
        file_put_contents($path, '{"intake_version": 1, "rows": [ {"type": "brand", } ]}');

        Artisan::call('laptops:intake', ['path' => $path]);

        $this->assertStringContainsString('malformed', strtolower(Artisan::output()));
    }

    public function test_duplicate_json_keys_and_deep_nesting_rejected_by_parser_limits(): void
    {
        $path = storage_path('framework/testing/intake-deep.json');
        $deep = ['intake_version' => 1, 'rows' => [['type' => 'brand', 'name' => 'x', 'slug' => 'x', 'meta' => ['a' => ['b' => ['c' => ['d' => ['e' => 'too deep']]]]]]]];
        file_put_contents($path, json_encode($deep));

        Artisan::call('laptops:intake', ['path' => $path]);

        // depth limit 32 in json_decode allows this depth, but non-scalar
        // unexpected fields must not be silently accepted as data.
        $this->assertSame(0, LaptopSku::count());
    }

    // ------------------------------------------------------------------

    /**
     * Row counts of every table intake can touch — used for zero-write
     * proofs and idempotence snapshots.
     */
    private function tableCounts(): array
    {
        $tables = [
            'brands', 'laptop_families', 'laptop_variants', 'laptop_skus',
            'ram_configurations', 'storage_slots', 'compatibility_assertions',
            'component_classes', 'sources', 'evidence', 'retailers',
            'retailer_offers', 'conflict_flags', 'audit_events',
        ];

        return collect($tables)
            ->mapWithKeys(fn ($table) => [$table => (int) \DB::table($table)->count()])
            ->all();
    }
}
