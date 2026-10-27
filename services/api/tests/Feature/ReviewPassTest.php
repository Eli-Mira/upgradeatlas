<?php

namespace Tests\Feature;

use App\Models\AuditEvent;
use App\Models\ConflictFlag;
use App\Models\Evidence;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\Source;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for the code-review pass (two-axis: standards + spec).
 */
class ReviewPassTest extends TestCase
{
    use RefreshDatabase;

    // ------------------------------------------------------------------
    // Spec fix: conflict resolution + assertion review close the loop.
    // ------------------------------------------------------------------

    public function test_conflict_can_be_resolved_then_sku_publishes(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);
        [$user, $token] = $this->staffToken();

        $this->applyFixture('valid.json');
        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->firstOrFail();
        $this->applyFixture('conflicting.json');

        $flag = ConflictFlag::where('entity_type', 'laptop_skus')->where('entity_id', $sku->id)
            ->where('status', 'open')->firstOrFail();

        // Publishing must be blocked while the flag is open.
        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);

        // Resolve it: server sets status + resolver + notes.
        $this->postJson("/api/v1/admin/skus/{$sku->id}/conflicts/{$flag->id}/resolve",
            ['resolution_notes' => 'OEM spec re-checked: two slots are correct.'],
            ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('status', 'resolved');

        $flag->refresh();
        $this->assertSame('resolved', $flag->status);
        $this->assertSame($user->id, $flag->resolved_by);

        // But the unreviewed assertion still blocks (gate needs both).
        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);

        // Review the assertion, then publish succeeds.
        $assertionId = \DB::table('compatibility_assertions')->where('sku_id', $sku->id)->value('id');
        $this->postJson("/api/v1/admin/skus/{$sku->id}/assertions/{$assertionId}/review",
            ['review_notes' => 'Scope confirmed: exact SKU only.'],
            ['Authorization' => "Bearer {$token}"])->assertOk();

        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        // The resolve and review actions are audited.
        $this->assertTrue(AuditEvent::where('entity_name', 'conflict_flags')->where('operation', 'resolve')->exists());
        $this->assertTrue(AuditEvent::where('entity_name', 'compatibility_assertions')->where('operation', 'review')->exists());
    }

    public function test_conflict_resolution_requires_an_open_flag_and_notes(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create();

        $this->postJson("/api/v1/admin/skus/{$sku->id}/conflicts/999999/resolve",
            ['resolution_notes' => 'x'], ['Authorization' => "Bearer {$token}"])->assertNotFound();

        $flag = ConflictFlag::create([
            'entity_type' => 'laptop_skus', 'entity_id' => $sku->id, 'field_name' => 'slot_count',
            'evidence_ids' => '{}', 'status' => 'open', 'resolved_by' => null,
        ]);

        $this->postJson("/api/v1/admin/skus/{$sku->id}/conflicts/{$flag->id}/resolve",
            [], ['Authorization' => "Bearer {$token}"])->assertStatus(422);
    }

    public function test_draft_can_be_submitted_for_review(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create();

        $this->postJson("/api/v1/admin/skus/{$sku->id}/review", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('status', 'review');

        // Published SKUs cannot go backwards to review.
        $published = LaptopSku::factory()->published()->create();
        $this->postJson("/api/v1/admin/skus/{$published->id}/review", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);
    }

    // ------------------------------------------------------------------
    // Standards fix: length caps bind; idempotence is drift-proof.
    // ------------------------------------------------------------------

    public function test_per_field_length_caps_are_enforced(): void
    {
        $jsonPath = storage_path('framework/testing/intake-caps.json');
        $longSource = str_repeat('a', 70);
        file_put_contents($jsonPath, json_encode([
            'intake_version' => 1,
            'rows' => [['type' => 'source', 'url' => 'https://x.test/a', 'source_type' => $longSource, 'usage_permission_status' => 'unclear']],
        ]));

        $reportPath = storage_path('framework/testing/intake-caps-report.json');
        \Illuminate\Support\Facades\Artisan::call('laptops:intake', ['path' => $jsonPath, '--report' => $reportPath]);
        $report = json_decode((string) file_get_contents($reportPath), true);

        $this->assertSame('error', $report['rows'][0]['status']);
        $this->assertStringContainsString('exceeds its maximum length (64)', implode(' ', $report['rows'][0]['errors']));
    }

    public function test_reapply_with_different_representation_stays_idempotent(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);
        $this->applyFixture('valid.json');
        $audits = AuditEvent::count();

        // Same fact, different representation: "16" base RAM stays 16.
        $this->applyFixture('valid.json');

        $this->assertSame($audits, AuditEvent::count(), 'Representation drift must not create updates.');
    }

    public function test_recommitting_conflicting_fixture_does_not_duplicate_flags(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);
        $this->applyFixture('valid.json');

        $this->applyFixture('conflicting.json');
        $flags = ConflictFlag::where('status', 'open')->count();
        $this->assertSame(1, $flags);

        $this->applyFixture('conflicting.json');
        $this->assertSame(1, ConflictFlag::where('status', 'open')->count(), 'No duplicate open flags.');
        // An open flag is never attributed to a resolver.
        $this->assertNull(ConflictFlag::where('status', 'open')->first()->resolved_by);
    }

    public function test_base_spec_diff_without_verified_evidence_is_not_a_conflict(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);
        $this->applyFixture('valid.json');
        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->firstOrFail();

        // Give the RAM row UNVERIFIED evidence, then change base_ram_gb:
        // without verified evidence this is a plain update, not a blocker.
        RamConfiguration::where('sku_id', $sku->id)->update(['evidence_id' => Evidence::first()->id]);
        \App\Models\Evidence::query()->update(['verification_status' => 'unverified']);
        \DB::table('conflict_flags')->delete();

        $jsonPath = storage_path('framework/testing/intake-ram-change.json');
        file_put_contents($jsonPath, json_encode([
            'intake_version' => 1,
            'rows' => [[
                'type' => 'sku',
                'family' => 'exampletech-campus-15',
                'variant_model_code' => 'EX-C15',
                'manufacturer_part_number' => 'INTAKE-EX-C15-01-DEMO',
                'display_name' => 'ExampleTech Campus 15 (intake fixture)',
                'base_ram_gb' => 32,
            ]],
        ]));
        $this->runIntakePath($jsonPath, 'review-pass-ram-change.json');

        $sku->refresh();
        $this->assertSame(32, $sku->base_ram_gb, 'Unverified stored values do not block updates.');
        $this->assertSame(0, ConflictFlag::count());
    }

    // ------------------------------------------------------------------
    // Spec fix: token lifecycle is audited.
    // ------------------------------------------------------------------

    public function test_token_issue_and_revoke_are_audited(): void
    {
        $user = User::factory()->admin()->create(['email' => 'audit@example.test', 'hashed_password' => 'password']);

        $token = $this->postJson('/api/v1/admin/token', ['email' => 'audit@example.test', 'password' => 'password'])
            ->assertCreated()->json('token');

        $this->postJson('/api/v1/admin/token/logout', [], ['Authorization' => "Bearer {$token}"])->assertOk();

        $operations = AuditEvent::where('entity_name', 'personal_access_tokens')
            ->orderBy('id')->pluck('operation')->all();
        $this->assertSame(['token_issue', 'token_revoke'], $operations);
        // No secret material in the audit trail.
        $this->assertStringNotContainsString(substr((string) $token, -10), json_encode(AuditEvent::all()));
    }

    // ------------------------------------------------------------------
    // Spec fix: per_page lower clamp.
    // ------------------------------------------------------------------

    public function test_per_page_is_clamped_from_below(): void
    {
        LaptopSku::factory()->count(2)->published()->create();

        $this->get('/api/v1/laptops?per_page=0')->assertOk();
        $this->get('/api/v1/laptops?per_page=-5')->assertOk();
    }

    // ------------------------------------------------------------------
    // CSV: assertion and offer rows must round-trip through flat columns.
    // ------------------------------------------------------------------

    public function test_csv_supports_assertion_and_offer_rows(): void
    {
        config(['intake.owner_permit' => 'UA-APPROVED-2026-10-26-deadbeef']);

        // Commit the JSON fixture first to establish source/evidence/sku.
        $this->applyFixture('valid.json');
        \DB::table('compatibility_assertions')->delete(); // keep only the SKU story

        $csvPath = storage_path('framework/testing/intake-assertion.csv');
        $header = \App\Services\Intake\IntakeValidator::csvHeader();
        $row = fn (array $values) => collect($header)->map(fn ($col) => $values[$col] ?? null)->all();

        \App\Services\Intake\IntakeCsv::write($csvPath, $header, [
            $row([
                'type' => 'compatibility_assertion',
                'manufacturer_part_number' => 'INTAKE-EX-C15-01-DEMO',
                'component_type' => 'ram', 'component_standard' => 'DDR5 SO-DIMM', 'component_form_factor' => 'SO-DIMM',
                'outcome' => 'unknown', 'reason' => 'CSV fixture: no documented maximum.',
                'confidence_level' => 'unverified',
                'source_url' => 'https://fixtures.example.test/oem/ex-campus-15-spec',
                'locator' => 'Memory section', 'evidence_fact_scope' => 'RAM configuration',
            ]),
            $row([
                'type' => 'offer',
                'manufacturer_part_number' => 'INTAKE-EX-C15-01-DEMO',
                'retailer_name' => 'Fixture CSV Shop', 'retailer_website_url' => 'https://fixtures.example.test/csv-shop',
                'retailer_country' => 'EG', 'product_url' => 'https://fixtures.example.test/csv-shop/offer-1',
                'displayed_price_egp' => '21999.00', 'available_status' => 'unknown', 'active' => 'true',
                'source_url' => 'https://fixtures.example.test/oem/ex-campus-15-spec',
                'locator' => 'Memory section', 'evidence_fact_scope' => 'RAM configuration',
                'observed_at' => '2026-10-20',
            ]),
        ]);

        $report = $this->runIntakePath($csvPath, 'review-pass-csv.json');
        $this->assertSame(0, $report['summary']['error'], json_encode($report['rows']));
        $this->assertSame(2, $report['summary']['applied']);

        $sku = LaptopSku::where('manufacturer_part_number', 'INTAKE-EX-C15-01-DEMO')->firstOrFail();
        $this->assertSame(1, \DB::table('compatibility_assertions')->where('sku_id', $sku->id)->count());
        $this->assertDatabaseHas('retailer_offers', ['sku_id' => $sku->id, 'displayed_price_egp' => '21999.00']);
    }

    // ------------------------------------------------------------------

    private function staffToken(): array
    {
        $user = User::factory()->admin()->create(['hashed_password' => 'secret-password']);

        return [$user, $user->createToken('tests')->plainTextToken];
    }

    private function applyFixture(string $fixture, ?string $reportFile = null): array
    {
        return $this->runIntakePath(__DIR__.'/../Fixtures/intake/'.$fixture, $reportFile ?? 'review-pass-report.json');
    }

    private function runIntakePath(string $absolutePath, string $reportFile): array
    {
        $reportPath = storage_path('framework/testing/'.$reportFile);
        @unlink($reportPath);
        \Illuminate\Support\Facades\Artisan::call('laptops:intake', [
            'path' => $absolutePath,
            '--commit' => true,
            '--report' => $reportPath,
        ]);

        return json_decode((string) file_get_contents($reportPath), true) ?? [];
    }
}
