<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\LaptopFamily;
use App\Models\LaptopSku;
use App\Models\LaptopVariant;
use App\Models\RamConfiguration;
use App\Models\StorageSlot;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class LaptopUpgradesApiTest extends TestCase
{
    use DatabaseTransactions;

    private function makeSku(): LaptopSku
    {
        $token = substr(bin2hex(random_bytes(4)), 0, 8);
        $brand = Brand::create(['name' => "b-$token", 'slug' => "b-$token"]);
        $family = LaptopFamily::create([
            'brand_id' => $brand->id,
            'family_name' => "F-$token",
            'slug' => "f-$token",
        ]);
        $variant = LaptopVariant::create([
            'family_id' => $family->id,
            'manufacturer_model_code' => "M-$token",
        ]);
        $sku = LaptopSku::create([
            'variant_id' => $variant->id,
            'manufacturer_part_number' => "MPN-$token",
            'display_name' => "Demo SKU $token",
            'base_ram_gb' => 16,
            'base_storage_gb' => 512,
            'status' => 'published',
        ]);
        RamConfiguration::create([
            'sku_id' => $sku->id,
            'soldered_gb' => 16,
            'slot_count' => 0,
            'documented_max_gb' => null,
            'max_meaning' => 'unknown',
        ]);
        StorageSlot::create([
            'sku_id' => $sku->id,
            'slot_index' => 1,
            'protocol' => 'unknown',
            'occupied_status' => 'unknown',
        ]);

        return $sku->fresh();
    }

    public function test_upgrades_returns_unknown_by_default(): void
    {
        $sku = $this->makeSku();

        $response = $this->get("/api/v1/laptops/{$sku->manufacturer_part_number}/upgrades");

        $response->assertOk();
        $response->assertJsonPath('compatibility_default', 'unknown');
        $response->assertJsonPath('ram.documented_max_gb', null);
        $response->assertJsonPath('storage.0.protocol', 'unknown');
    }

    public function test_upgrades_unknown_sku_returns_404(): void
    {
        $this->get('/api/v1/laptops/does-not-exist/upgrades')->assertNotFound();
    }
}
