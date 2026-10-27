<?php

namespace Tests\Feature;

use App\Models\AuditEvent;
use App\Models\LaptopSku;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * M6 security loop acceptance: threat → reproduction → verification on
 * the current source, using synthetic fixtures only.
 */
class SecurityLoopTest extends TestCase
{
    use RefreshDatabase;

    public function test_token_endpoint_is_rate_limited(): void
    {
        User::factory()->admin()->create(['email' => 'rl@example.test', 'hashed_password' => 'password']);

        $last = null;
        for ($i = 0; $i < 11; $i++) {
            $last = $this->postJson('/api/v1/admin/token', [
                'email' => 'rl@example.test',
                'password' => 'wrong-password',
            ]);
        }

        // The credential failure would be 401, but the 11th attempt inside
        // one minute is throttled to 429.
        $this->assertSame(429, $last->status(), 'Rate limit must engage before the 11th attempt.');
    }

    public function test_double_publish_is_refused_and_writes_one_audit_event(): void
    {
        [$user, $token] = $this->staffToken();
        $sku = $this->publishableSku($user);

        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();
        $this->postJson("/api/v1/admin/skus/{$sku->id}/publish", [], ['Authorization' => "Bearer {$token}"])
            ->assertStatus(409);

        $publishes = AuditEvent::where('entity_name', 'laptop_skus')
            ->where('entity_pk', (string) $sku->id)
            ->where('operation', 'publish')
            ->count();
        $this->assertSame(1, $publishes, 'Repeated publishes must not fabricate audit events.');
    }

    public function test_malicious_payload_is_returned_as_data_never_executed(): void
    {
        [$user, $token] = $this->staffToken();
        $payload = '<script>alert(1)</script>';
        $sku = LaptopSku::factory()->published()->create(['display_name' => $payload]);

        $response = $this->get('/api/v1/laptops/'.$sku->manufacturer_part_number);
        $response->assertOk();
        // JSON contract: the string is data; content type is JSON, so the
        // browser never executes it and the React layer escapes on render.
        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));
        $this->assertSame($payload, $response->json('display_name'));
    }

    public function test_mass_assignment_cannot_inject_server_columns(): void
    {
        [, $token] = $this->staffToken();
        $variant = \App\Models\LaptopVariant::factory()->create();

        $response = $this->postJson('/api/v1/admin/skus', [
            'variant_id' => $variant->id,
            'manufacturer_part_number' => 'MASS-01',
            'display_name' => 'Mass assignment probe',
            'id' => 99999,
            'created_at' => '2001-01-01T00:00:00Z',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertCreated();
        $sku = LaptopSku::where('manufacturer_part_number', 'MASS-01')->firstOrFail();
        $this->assertNotSame(99999, $sku->id, 'Client-supplied id must be ignored.');
        $this->assertSame('draft', $sku->status);
    }

    public function test_idor_shapes_nonexistent_ids_answer_404(): void
    {
        [, $token] = $this->staffToken();

        $this->patchJson('/api/v1/admin/skus/999999', ['display_name' => 'x'], ['Authorization' => "Bearer {$token}"])
            ->assertNotFound();
        $this->postJson('/api/v1/admin/skus/999999/publish', [], ['Authorization' => "Bearer {$token}"])
            ->assertNotFound();
        $this->putJson('/api/v1/admin/skus/999999/ram-configuration', ['max_meaning' => 'unknown'], ['Authorization' => "Bearer {$token}"])
            ->assertNotFound();
    }

    public function test_audit_events_have_no_mutation_route(): void
    {
        $mutationUris = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route) => in_array($route->methods()[0], ['PUT', 'PATCH', 'DELETE', 'POST'], true))
            ->map(fn ($route) => $route->uri())
            ->filter(fn ($uri) => str_contains($uri, 'audit'));

        $this->assertSame([], $mutationUris->values()->all(), 'Audit events must never be writable.');
    }

    public function test_unicode_search_does_not_crash_or_leak(): void
    {
        LaptopSku::factory()->published()->create(['display_name' => 'Lenovo ThinkPad']);
        LaptopSku::factory()->draft()->create(['display_name' => 'Lenovo Draft']);

        // Combining-decomposed Arabic and a mixed bidi string must answer
        // 200 with no leakage of the draft.
        foreach (["لَپ\tتوب", "‮x‬", 'لينوفو'] as $needle) {
            $response = $this->get('/api/v1/laptops?q='.rawurlencode($needle));
            $response->assertOk();
            $this->assertSame(0, $response->json('total'));
        }
    }

    public function test_pagination_is_capped(): void
    {
        LaptopSku::factory()->count(3)->published()->create();

        $response = $this->get('/api/v1/laptops?per_page=100000');
        $response->assertOk();
        $this->assertSame(100, $response->json('per_page'), 'per_page must be capped at 100.');
    }

    public function test_admin_search_is_parameterised(): void
    {
        [, $token] = $this->staffToken();
        LaptopSku::factory()->published()->create(['display_name' => 'Survivor']);

        $response = $this->getJson(
            '/api/v1/admin/skus?q='.rawurlencode("'; DROP TABLE laptop_skus;--"),
            ['Authorization' => "Bearer {$token}"]
        );
        $response->assertOk();
        // The injection text is treated as a literal needle: it matches
        // nothing (total 0) and the table survives intact.
        $this->assertSame(0, $response->json('total'), 'Injection text must be a literal needle, not SQL.');
        $this->assertSame(1, LaptopSku::count());
    }

    public function test_token_of_deleted_user_is_rejected(): void
    {
        $user = User::factory()->admin()->create();
        $token = $user->createToken('orphan')->plainTextToken;

        $user->delete();

        $this->getJson('/api/v1/admin/skus', ['Authorization' => "Bearer {$token}"])
            ->assertUnauthorized();
    }

    // ------------------------------------------------------------------

    private function staffToken(): array
    {
        $user = User::factory()->admin()->create(['hashed_password' => 'secret-password']);

        return [$user, $user->createToken('tests')->plainTextToken];
    }

    private function publishableSku(User $reviewer): LaptopSku
    {
        $sku = LaptopSku::factory()->draft()->create();
        $source = \App\Models\Source::create([
            'url' => 'https://example.test/'.uniqid('sec-'),
            'source_type' => 'oem_specification',
            'usage_permission_status' => 'unclear',
        ]);
        $evidence = \App\Models\Evidence::create([
            'source_id' => $source->id,
            'concise_paraphrase' => 'Security-loop fixture evidence',
            'fact_scope' => 'RAM configuration',
            'observed_at' => now(),
            'verification_status' => 'verified',
            'reviewer_id' => $reviewer->id,
        ]);
        \App\Models\RamConfiguration::create([
            'sku_id' => $sku->id,
            'max_meaning' => 'unknown',
            'evidence_id' => $evidence->id,
        ]);

        return $sku;
    }
}
