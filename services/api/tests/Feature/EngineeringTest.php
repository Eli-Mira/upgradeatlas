<?php

namespace Tests\Feature;

use App\Models\LaptopSku;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * M7 engineering checks on synthetic data: bounded query count for the
 * public catalog (no N+1) and honest payload behaviour.
 */
class EngineeringTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_index_query_count_is_bounded_not_n_plus_one(): void
    {
        LaptopSku::factory()->count(20)->published()->create();

        DB::enableQueryLog();
        $response = $this->get('/api/v1/laptops?per_page=20');
        DB::disableQueryLog();

        $response->assertOk();
        $this->assertSame(20, $response->json('total'));

        $queryCount = count(DB::getQueryLog());
        $this->assertLessThan(
            15,
            $queryCount,
            "Public index used {$queryCount} queries for 20 rows — an N+1 regression."
        );
    }

    public function test_detail_query_count_is_bounded(): void
    {
        $sku = LaptopSku::factory()->published()->create();
        \App\Models\RamConfiguration::create(['sku_id' => $sku->id, 'max_meaning' => 'unknown']);
        \App\Models\StorageSlot::create(['sku_id' => $sku->id, 'slot_index' => 1, 'protocol' => 'NVMe', 'occupied_status' => 'occupied']);

        DB::enableQueryLog();
        $this->get('/api/v1/laptops/'.$sku->manufacturer_part_number);
        DB::disableQueryLog();

        $queryCount = count(DB::getQueryLog());
        $this->assertLessThan(12, $queryCount, "Detail used {$queryCount} queries — check eager loading.");
    }
}
