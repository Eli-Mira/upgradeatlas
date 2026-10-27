<?php

namespace Tests\Feature;

use App\Models\AuditEvent;
use App\Models\ConflictFlag;
use App\Models\Evidence;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\Source;
use App\Models\StorageSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    // ------------------------------------------------------------------
    // Token issuance: fail closed on credentials and role.
    // ------------------------------------------------------------------

    public function test_token_requires_valid_credentials(): void
    {
        User::factory()->admin()->create(['email' => 'staff@example.test', 'hashed_password' => 'right-password']);

        $this->postJson('/api/v1/admin/token', ['email' => 'staff@example.test', 'password' => 'wrong'])
            ->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);

        // Unknown email must answer with the same generic message: no
        // account enumeration.
        $this->postJson('/api/v1/admin/token', ['email' => 'nobody@example.test', 'password' => 'right-password'])
            ->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);

        $this->postJson('/api/v1/admin/token', ['email' => 'staff@example.test'])
            ->assertStatus(422);
    }

    public function test_token_refused_for_non_staff_role(): void
    {
        User::factory()->create(['email' => 'buyer@example.test', 'role' => 'customer', 'hashed_password' => 'password']);

        $this->postJson('/api/v1/admin/token', ['email' => 'buyer@example.test', 'password' => 'password'])
            ->assertStatus(403);
    }

    public function test_valid_admin_token_grants_admin_api(): void
    {
        User::factory()->admin()->create(['email' => 'staff@example.test', 'hashed_password' => 'secret-password']);

        $issued = $this->postJson('/api/v1/admin/token', [
            'email' => 'staff@example.test',
            'password' => 'secret-password',
            'device_name' => 'tests',
        ]);
        $issued->assertCreated()->assertJsonStructure(['token', 'role']);

        $this->get('/api/v1/admin/skus', ['Authorization' => 'Bearer '.$issued->json('token')])
            ->assertOk();
    }

    public function test_admin_endpoints_reject_anonymous_requests(): void
    {
        $sku = LaptopSku::factory()->draft()->create();

        $this->getJson('/api/v1/admin/skus')->assertUnauthorized();
        $this->postJson('/api/v1/admin/skus', ['variant_id' => 1])->assertUnauthorized();
        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish")->assertUnauthorized();
        $this->getJson('/api/v1/admin/sources')->assertUnauthorized();
        $this->postJson('/api/v1/admin/sources', ['url' => 'https://example.test'])->assertUnauthorized();
        $this->getJson('/api/v1/admin/evidence')->assertUnauthorized();
    }

    public function test_admin_endpoints_reject_non_staff_tokens(): void
    {
        // A consumer-role user with a token (e.g. for future favorites)
        // must still be refused by the server-side role gate.
        $customer = User::factory()->create(['role' => 'customer']);
        $token = $customer->createToken('consumer')->plainTextToken;

        $this->getJson('/api/v1/admin/skus', ['Authorization' => "Bearer {$token}"])->assertForbidden();
        $this->postJson('/api/v1/admin/sources', ['url' => 'https://example.test'], ['Authorization' => "Bearer {$token}"])
            ->assertForbidden();
    }

    public function test_token_logout_revokes_token(): void
    {
        [$user, $token] = $this->staffToken();
        $this->assertSame(1, $user->tokens()->count());

        $this->postJson('/api/v1/admin/token/logout', [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        // Revocation must delete the token row. (A follow-up request with
        // the same bearer is not asserted here: Sanctum's guard caches the
        // resolved user per app instance, which only happens inside a
        // single test process, never across real requests.)
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    // ------------------------------------------------------------------
    // SKU administration: drafts are the only entry state, validation
    // is server-side, and status changes go through the gate.
    // ------------------------------------------------------------------

    public function test_admin_can_create_draft_and_status_is_server_owned(): void
    {
        [, $token] = $this->staffToken();

        $response = $this->postJson('/api/v1/admin/skus', [
            'variant_id' => \App\Models\LaptopVariant::factory()->create()->id,
            'manufacturer_part_number' => 'ADMIN-NEW-01',
            'display_name' => 'Admin Created Draft',
            'base_ram_gb' => 16,
            // A client must not be able to talk its way into publication.
            'status' => 'published',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertCreated();
        $this->assertSame('draft', $response->json('status'));
        $this->assertDatabaseHas('laptop_skus', [
            'manufacturer_part_number' => 'ADMIN-NEW-01',
            'status' => 'draft',
        ]);

        // Draft creation is audited and actor-bound.
        $this->assertTrue(
            AuditEvent::where('entity_name', 'laptop_skus')
                ->where('entity_pk', (string) $response->json('id'))
                ->where('operation', 'create')
                ->where('new_value->status', 'draft')
                ->exists()
        );

        // A draft created through admin stays invisible on the public API.
        $this->get('/api/v1/laptops/ADMIN-NEW-01')->assertNotFound();
    }

    public function test_duplicate_part_number_is_rejected(): void
    {
        [, $token] = $this->staffToken();
        $existing = LaptopSku::factory()->create();

        $this->postJson('/api/v1/admin/skus', [
            'variant_id' => $existing->variant_id,
            'manufacturer_part_number' => $existing->manufacturer_part_number,
            'display_name' => 'Duplicate',
        ], ['Authorization' => "Bearer {$token}"])->assertStatus(422);
    }

    public function test_negative_and_invalid_values_are_rejected(): void
    {
        [, $token] = $this->staffToken();
        $variant = \App\Models\LaptopVariant::factory()->create();
        $base = ['variant_id' => $variant->id, 'manufacturer_part_number' => 'NEG-01', 'display_name' => 'x'];

        $this->postJson('/api/v1/admin/skus', $base + ['base_ram_gb' => -1], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
        $this->postJson('/api/v1/admin/skus', $base + ['use_case' => 'crypto_mining'], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
    }

    public function test_admin_listing_shows_all_statuses_including_drafts(): void
    {
        [, $token] = $this->staffToken();
        LaptopSku::factory()->draft()->create();
        LaptopSku::factory()->published()->create();
        LaptopSku::factory()->retired()->create();

        $all = $this->getJson('/api/v1/admin/skus', ['Authorization' => "Bearer {$token}"]);
        $all->assertOk();
        $this->assertSame(3, $all->json('total'));

        $drafts = $this->getJson('/api/v1/admin/skus?status=draft', ['Authorization' => "Bearer {$token}"]);
        $drafts->assertOk();
        $this->assertSame(1, $drafts->json('total'));
    }

    public function test_status_cannot_be_changed_via_update(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create(['display_name' => 'Before']);

        $this->patchJson("/api/v1/admin/skus/{$sku->id}", ['status' => 'published'], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
        $this->assertDatabaseHas('laptop_skus', ['id' => $sku->id, 'status' => 'draft']);

        $this->patchJson("/api/v1/admin/skus/{$sku->id}", ['display_name' => 'After'], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        $this->assertTrue(
            AuditEvent::where('entity_name', 'laptop_skus')
                ->where('entity_pk', (string) $sku->id)
                ->where('operation', 'update')
                ->where('actor_id', $user->id)
                ->exists()
        );
    }

    // ------------------------------------------------------------------
    // Publication gate: fail closed, then honest happy path.
    // ------------------------------------------------------------------

    public function test_publish_blocked_without_verified_evidence(): void
    {
        [, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create();

        $blocked = $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"]);
        $blocked->assertStatus(409);
        $this->assertNotEmpty($blocked->json('blocked_by'));
        $this->assertDatabaseHas('laptop_skus', ['id' => $sku->id, 'status' => 'draft']);
    }

    public function test_publish_blocked_with_unreviewed_compatibility_assertion(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = $this->draftSkuWithVerifiedRamEvidence($user);
        \App\Models\CompatibilityAssertion::create([
            'sku_id' => $sku->id,
            'component_class_id' => \App\Models\ComponentClass::factory()->create()->id,
            'outcome' => 'unknown',
            'reason' => 'No documentation found yet',
            'confidence_level' => 'unverified',
            'evidence_id' => Evidence::first()->id,
            // reviewed_by / reviewed_at deliberately absent.
        ]);

        $blocked = $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"]);
        $blocked->assertStatus(409);
        $this->assertSame(1, collect($blocked->json('blocked_by'))->filter(
            fn ($reason) => str_contains($reason, 'review')
        )->count());
    }

    public function test_publish_blocked_by_open_conflict(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = $this->draftSkuWithVerifiedRamEvidence($user);
        ConflictFlag::create([
            'entity_type' => 'laptop_skus',
            'entity_id' => $sku->id,
            'field_name' => 'documented_max_gb',
            'evidence_ids' => '1,2',
            'status' => 'open',
        ]);

        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);
    }

    public function test_publish_gate_then_public_visibility_then_retire(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = $this->draftSkuWithVerifiedRamEvidence($user);

        // While draft: invisible publicly (M1 gate), visible to admin.
        $this->get('/api/v1/laptops/'.$sku->manufacturer_part_number)->assertNotFound();

        $published = $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"]);
        $published->assertOk();
        $this->assertSame('published', $published->json('status'));

        // Now public.
        $this->get('/api/v1/laptops/'.$sku->manufacturer_part_number)->assertOk();

        // Retire removes it from the public API again.
        $this->postJson("/api/v1/admin/skus/{$sku->id}/retire", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();
        $this->get('/api/v1/laptops/'.$sku->manufacturer_part_number)->assertNotFound();

        // Retiring twice is refused.
        $this->postJson("/api/v1/admin/skus/{$sku->id}/retire", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);
    }

    public function test_admin_mutations_write_actor_bound_audit_events(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = $this->draftSkuWithVerifiedRamEvidence($user);

        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        $events = AuditEvent::where('entity_name', 'laptop_skus')->where('entity_pk', (string) $sku->id)
            ->orderBy('id')->get();
        // The helper created this SKU via factory, so only the publish is
        // an API mutation and carries an audit event here.
        $this->assertSame(['publish'], $events->pluck('operation')->all());
        $this->assertSame($user->id, $events->first()->actor_id);
        $publish = $events->where('operation', 'publish')->first();
        $this->assertSame('draft', $publish->old_value['status']);
        $this->assertSame('published', $publish->new_value['status']);
    }

    // ------------------------------------------------------------------
    // RAM configuration and storage slots.
    // ------------------------------------------------------------------

    public function test_ram_configuration_upsert_create_then_update(): void
    {
        [, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create();
        $payload = ['soldered_gb' => 8, 'slot_count' => 2, 'occupied_slot_count' => 2, 'max_meaning' => 'unknown'];

        $created = $this->putJson("/api/v1/admin/skus/{$sku->id}/ram-configuration", $payload, ['Authorization' => "Bearer {$token}"]);
        $created->assertCreated();
        $id = $created->json('id');

        $updated = $this->putJson("/api/v1/admin/skus/{$sku->id}/ram-configuration", $payload + ['standard' => 'DDR5'], ['Authorization' => "Bearer {$token}"]);
        $updated->assertOk();
        $this->assertSame($id, $updated->json('id'), 'Upsert must not create a second row');
        $this->assertSame(1, RamConfiguration::where('sku_id', $sku->id)->count());

        $this->putJson("/api/v1/admin/skus/{$sku->id}/ram-configuration", [
            'slot_count' => 2, 'occupied_slot_count' => 3, 'max_meaning' => 'unknown',
        ], ['Authorization' => "Bearer {$token}"])->assertStatus(422);

        $this->putJson("/api/v1/admin/skus/{$sku->id}/ram-configuration", [
            'max_meaning' => 'guessed',
        ], ['Authorization' => "Bearer {$token}"])->assertStatus(422);
    }

    public function test_storage_slot_create_duplicate_and_validation(): void
    {
        [, $token] = $this->staffToken();
        $sku = LaptopSku::factory()->draft()->create();
        $slot = ['slot_index' => 1, 'protocol' => 'NVMe', 'occupied_status' => 'free'];

        $this->postJson("/api/v1/admin/skus/{$sku->id}/storage-slots", $slot, ['Authorization' => "Bearer {$token}"])
            ->assertCreated();

        // Duplicate natural key is a validation failure (PRD §12 reserves
        // 409 for conflicting publication).
        $this->postJson("/api/v1/admin/skus/{$sku->id}/storage-slots", $slot, ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
        $this->assertSame(1, StorageSlot::where('sku_id', $sku->id)->count());

        $this->postJson("/api/v1/admin/skus/{$sku->id}/storage-slots", ['slot_index' => 2, 'protocol' => 'IDE', 'occupied_status' => 'free'], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
    }

    // ------------------------------------------------------------------
    // Sources and evidence.
    // ------------------------------------------------------------------

    public function test_source_create_validation_and_uniqueness(): void
    {
        [, $token] = $this->staffToken();
        $base = ['source_type' => 'oem_specification', 'usage_permission_status' => 'unclear'];

        $ok = $this->postJson('/api/v1/admin/sources', $base + ['url' => 'https://example.test/spec'], ['Authorization' => "Bearer {$token}"]);
        $ok->assertCreated();

        $this->postJson('/api/v1/admin/sources', $base + ['url' => 'https://example.test/spec'], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
        $this->postJson('/api/v1/admin/sources', $base + ['url' => 'not-a-url'], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
        $this->postJson('/api/v1/admin/sources', array_merge($base, ['url' => 'https://example.test/other', 'usage_permission_status' => 'trust_me']), ['Authorization' => "Bearer {$token}"])
            ->assertStatus(422);
    }

    public function test_evidence_created_with_actor_bound_reviewer(): void
    {
        [$user, $token] = $this->staffToken();
        $source = Source::create([
            'url' => 'https://example.test/spec',
            'source_type' => 'oem_specification',
            'usage_permission_status' => 'unclear',
        ]);

        $ok = $this->postJson('/api/v1/admin/evidence', [
            'source_id' => $source->id,
            'locator' => 'Memory section',
            'concise_paraphrase' => 'Two SO-DIMM slots, both populated at base config',
            'fact_scope' => 'RAM configuration',
            'observed_at' => '2026-10-26',
            'verification_status' => 'verified',
        ], ['Authorization' => "Bearer {$token}"]);
        $ok->assertCreated();
        $this->assertSame($user->id, $ok->json('reviewer_id'), 'Reviewer must be the authenticated actor');

        $this->postJson('/api/v1/admin/evidence', [
            'source_id' => $source->id,
            'concise_paraphrase' => 'x',
            'fact_scope' => 'RAM configuration',
            'observed_at' => '2026-10-26',
            'verification_status' => 'definitely_verified',
        ], ['Authorization' => "Bearer {$token}"])->assertStatus(422);
    }

    // ------------------------------------------------------------------
    // Helpers.
    // ------------------------------------------------------------------

    /**
     * @return array{0: User, 1: string} authenticated staff user and token
     */
    private function staffToken(): array
    {
        $user = User::factory()->admin()->create(['hashed_password' => 'secret-password']);

        return [$user, $user->createToken('tests')->plainTextToken];
    }

    /**
     * A draft SKU one step short of publishable: verified evidence is
     * attached through its RAM configuration.
     */
    private function draftSkuWithVerifiedRamEvidence(User $reviewer): LaptopSku
    {
        $sku = LaptopSku::factory()->draft()->create();
        $source = Source::create([
            'url' => 'https://example.test/'.uniqid('spec-'),
            'source_type' => 'oem_specification',
            'usage_permission_status' => 'unclear',
        ]);
        $evidence = Evidence::create([
            'source_id' => $source->id,
            'concise_paraphrase' => 'OEM spec sheet documents two SO-DIMM slots',
            'fact_scope' => 'RAM configuration',
            'observed_at' => now(),
            'verification_status' => 'verified',
            'reviewer_id' => $reviewer->id,
        ]);
        RamConfiguration::create([
            'sku_id' => $sku->id,
            'soldered_gb' => 8,
            'slot_count' => 2,
            'occupied_slot_count' => 2,
            'max_meaning' => 'unknown',
            'evidence_id' => $evidence->id,
        ]);

        return $sku;
    }
}
