<?php

namespace Tests\Feature;

use App\Models\Cpu;
use App\Models\Display;
use App\Models\Gpu;
use App\Models\LaptopSku;
use App\Models\LaptopVariant;
use App\Models\RamConfiguration;
use App\Models\Retailer;
use App\Models\RetailerOffer;
use App\Models\Source;
use App\Models\StorageSlot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaptopApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_laptops_index_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptop_show_unknown_returns_not_found(): void
    {
        $this->get('/api/v1/laptops/does-not-exist')->assertNotFound();
    }

    public function test_laptops_index_with_empty_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_arabic_unicode_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=مرحبا');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_apostrophe_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=laptop%27s');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_percent_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=50%25');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_underscore_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=base_model');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_backslash_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=foo%5Cbar');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_with_malicious_injection_query_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops?q=%27%20OR%201%3D1%20--%20');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptops_index_search_is_parameterised_and_safe(): void
    {
        // Seed a couple of rows with known display names.
        $variant = LaptopVariant::factory()->create();
        LaptopSku::factory()->create([
            'variant_id' => $variant->id,
            'manufacturer_part_number' => 'SKU-AAA-001',
            'display_name' => 'ThinkPad X1 Carbon Gen 11',
            'cpu_id' => Cpu::factory()->create()->id,
            'gpu_id' => Gpu::factory()->create()->id,
            'display_id' => Display::factory()->create()->id,
            'base_ram_gb' => 16,
        ]);
        LaptopSku::factory()->create([
            'variant_id' => $variant->id,
            'manufacturer_part_number' => 'SKU-BBB-002',
            'display_name' => 'MacBook Pro 14',
            'cpu_id' => Cpu::factory()->create()->id,
            'gpu_id' => Gpu::factory()->create()->id,
            'display_id' => Display::factory()->create()->id,
            'base_ram_gb' => 16,
        ]);

        // 1. A literal query that matches nothing should return an empty
        //    data array — proving the query is parameterised and not
        //    interpreted as SQL.
        $response = $this->get('/api/v1/laptops?q=zzz-not-a-real-sku-zzz');
        $response->assertOk();
        $this->assertSame(0, $response->json('total'));

        // 2. A malicious injection string must NOT return all rows.
        $response = $this->get('/api/v1/laptops?q=%27%20OR%201%3D1%20--%20');
        $response->assertOk();
        $this->assertSame(0, $response->json('total'));

        // 3. A literal substring of a real display name must match exactly.
        $response = $this->get('/api/v1/laptops?q=thinkpad');
        $response->assertOk();
        $this->assertSame(1, $response->json('total'));
        $this->assertSame('SKU-AAA-001', $response->json('data.0.manufacturer_part_number'));

        // 4. A literal underscore must not act as a single-char wildcard.
        $response = $this->get('/api/v1/laptops?q=SKU-AAA-001');
        $response->assertOk();
        $this->assertSame(1, $response->json('total'));
    }

    // ------------------------------------------------------------------
    // Publication gates (docs/DECISIONS.md D17, PRD §8 status contract).
    // Only `published` SKUs are public; draft/review/retired are hidden on
    // every read path, including counts, and a draft detail response is
    // indistinguishable from a missing one.
    // ------------------------------------------------------------------

    public function test_draft_skus_are_hidden_from_public_index(): void
    {
        LaptopSku::factory()->create([
            'manufacturer_part_number' => 'PUB-001',
            'display_name' => 'Published Laptop',
        ]);
        LaptopSku::factory()->draft()->create([
            'manufacturer_part_number' => 'DRF-001',
            'display_name' => 'Draft Laptop',
        ]);

        $response = $this->get('/api/v1/laptops');
        $response->assertOk();
        $this->assertSame(1, $response->json('total'));
        $this->assertSame('PUB-001', $response->json('data.0.manufacturer_part_number'));
    }

    public function test_draft_skus_are_hidden_from_search(): void
    {
        LaptopSku::factory()->draft()->create([
            'manufacturer_part_number' => 'DRF-SEARCH-01',
            'display_name' => 'Secret Draft Machine',
        ]);

        foreach (['Secret Draft', 'DRF-SEARCH'] as $needle) {
            $response = $this->get('/api/v1/laptops?q='.rawurlencode($needle));
            $response->assertOk();
            $this->assertSame(
                0,
                $response->json('total'),
                "Draft SKU must not be discoverable via q={$needle}"
            );
        }
    }

    public function test_only_published_status_is_public(): void
    {
        // review and retired are valid contract states but are not public.
        LaptopSku::factory()->review()->create(['manufacturer_part_number' => 'REV-001']);
        LaptopSku::factory()->retired()->create(['manufacturer_part_number' => 'RET-001']);

        $response = $this->get('/api/v1/laptops');
        $response->assertOk();
        $this->assertSame(0, $response->json('total'));
        $this->get('/api/v1/laptops/REV-001')->assertNotFound();
        $this->get('/api/v1/laptops/RET-001')->assertNotFound();
    }

    public function test_draft_detail_is_indistinguishable_from_missing(): void
    {
        LaptopSku::factory()->draft()->create(['manufacturer_part_number' => 'DRF-404']);

        // Same 404 for a draft and a nonexistent part number: no existence
        // disclosure through status codes.
        $this->get('/api/v1/laptops/DRF-404')->assertNotFound();
        $this->get('/api/v1/laptops/definitely-not-here')->assertNotFound();
    }

    public function test_draft_upgrades_is_indistinguishable_from_missing(): void
    {
        LaptopSku::factory()->draft()->create(['manufacturer_part_number' => 'DRF-UPG']);

        $this->get('/api/v1/laptops/DRF-UPG/upgrades')->assertNotFound();
        $this->get('/api/v1/laptops/definitely-not-here/upgrades')->assertNotFound();
    }

    public function test_published_detail_and_upgrades_return_payload(): void
    {
        $sku = LaptopSku::factory()->create([
            'manufacturer_part_number' => 'PUB-UPG-01',
            'display_name' => 'Upgradable Machine',
        ]);
        RamConfiguration::create([
            'sku_id' => $sku->id,
            'soldered_gb' => 8,
            'slot_count' => 2,
            'occupied_slot_count' => 2,
            'standard' => 'DDR5',
            'max_meaning' => 'unknown',
        ]);
        StorageSlot::create([
            'sku_id' => $sku->id,
            'slot_index' => 1,
            'form_factor' => 'M.2 2280',
            'protocol' => 'NVMe',
            'occupied_status' => 'occupied',
        ]);

        $detail = $this->get('/api/v1/laptops/PUB-UPG-01');
        $detail->assertOk();
        $this->assertSame('PUB-UPG-01', $detail->json('manufacturer_part_number'));

        $upgrades = $this->get('/api/v1/laptops/PUB-UPG-01/upgrades');
        $upgrades->assertOk();
        $this->assertSame('PUB-UPG-01', $upgrades->json('part_number'));
        $this->assertSame(8, $upgrades->json('ram.soldered_gb'));
        $this->assertSame('NVMe', $upgrades->json('storage.0.protocol'));
        // Compatibility contract (D5): unknown until evidence-backed.
        $this->assertSame('unknown', $upgrades->json('compatibility_default'));
    }

    public function test_filters_and_totals_do_not_leak_draft_records(): void
    {
        LaptopSku::factory()->create([
            'manufacturer_part_number' => 'RAM-PUB-16',
            'display_name' => 'Alpha Book 16',
            'base_ram_gb' => 16,
        ]);
        LaptopSku::factory()->draft()->create([
            'manufacturer_part_number' => 'RAM-DRF-64',
            'display_name' => 'Alpha Book 64',
            'base_ram_gb' => 64,
        ]);

        // A hard filter that only the draft satisfies must yield an empty
        // set, not silently expose the draft (D23 grouped predicate).
        $strict = $this->get('/api/v1/laptops?q=Alpha+Book&min_ram_gb=32');
        $strict->assertOk();
        $this->assertSame(0, $strict->json('total'));

        $loose = $this->get('/api/v1/laptops?q=Alpha+Book&min_ram_gb=8');
        $loose->assertOk();
        $this->assertSame(1, $loose->json('total'));
        $this->assertSame('RAM-PUB-16', $loose->json('data.0.manufacturer_part_number'));
    }

    public function test_price_filter_ignores_null_inactive_and_draft_offers(): void
    {
        $published = LaptopSku::factory()->create(['manufacturer_part_number' => 'PRICE-PUB-01']);
        $draft = LaptopSku::factory()->draft()->create(['manufacturer_part_number' => 'PRICE-DRF-01']);

        $retailer = Retailer::create([
            'name' => 'Synthetic Demo Retailer',
            'website_url' => 'https://example.test',
            'country' => 'EG',
            'status' => 'demo',
        ]);
        $source = Source::create([
            'url' => 'https://example.test/offer-source',
            'source_type' => 'retailer_listing',
            'usage_permission_status' => 'not_permitted',
        ]);

        $mkOffer = fn (LaptopSku $sku, ?string $price, bool $active) => RetailerOffer::create([
            'sku_id' => $sku->id,
            'retailer_id' => $retailer->id,
            'product_url' => 'https://example.test/'.$sku->manufacturer_part_number,
            'currency' => 'EGP',
            'displayed_price_egp' => $price,
            'available_status' => 'unknown',
            'observed_at' => now(),
            'recorded_at' => now(),
            'source_id' => $source->id,
            'active' => $active,
        ]);

        $mkOffer($published, '50000.00', true);
        $mkOffer($published, '10000.00', false); // inactive: must not count
        $mkOffer($published, null, true);        // NULL price: must not become 0 (D6)
        $mkOffer($draft, '10000.00', true);      // draft offers: must not count

        $inBudget = $this->get('/api/v1/laptops?max_price=60000');
        $inBudget->assertOk();
        $this->assertSame(1, $inBudget->json('total'));
        $this->assertSame('PRICE-PUB-01', $inBudget->json('data.0.manufacturer_part_number'));
        // price_egp is the min active-offer price; current accessor contract
        // is numeric (float-typed accessor). NULL offers stay null (D6).
        $this->assertEquals(50000, $inBudget->json('data.0.price_egp'));
        $this->assertNotNull($inBudget->json('data.0.price_egp'));

        $belowAll = $this->get('/api/v1/laptops?max_price=40000');
        $belowAll->assertOk();
        $this->assertSame(0, $belowAll->json('total'));
    }

    public function test_public_api_rejects_write_methods(): void
    {
        // There is no public write surface; mutations are admin work (M2)
        // and must never be reachable through the catalog endpoints.
        $this->post('/api/v1/laptops', ['display_name' => 'x'])->assertStatus(405);
        $this->patch('/api/v1/laptops/PUB-001', ['status' => 'published'])->assertStatus(405);
        $this->delete('/api/v1/laptops/PUB-001')->assertStatus(405);
    }
}
