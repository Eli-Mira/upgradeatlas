<?php

namespace Database\Seeders;

use App\Models\Evidence;
use App\Models\LaptopSku;
use App\Models\RamConfiguration;
use App\Models\Source;
use App\Models\StorageSlot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Internal-RC browser fixture seeder (M4.4 / M8 demo script).
 *
 * Synthetic data ONLY, clearly labelled SYNTHETIC DEMO DATA, for local
 * browser journeys against a disposable database. Never run against a
 * production or shared database; never represents real manufacturer facts.
 */
class RcBrowserFixtureSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'rc-admin@example.test'],
            [
                'hashed_password' => Hash::make('rc-demo-password'),
                'display_name' => 'RC Demo Admin',
                'locale' => 'en',
                'role' => 'admin',
            ]
        );

        $source = Source::query()->firstOrCreate(
            ['url' => 'https://fixtures.example.test/rc/oem-spec'],
            [
                'source_type' => 'oem_specification',
                'publisher' => 'ExampleTech (synthetic)',
                'usage_permission_status' => 'unclear',
                'notes' => 'SYNTHETIC DEMO DATA: fixture source for browser journeys; never fetched.',
            ]
        );

        $evidence = Evidence::query()->firstOrCreate(
            ['source_id' => $source->id, 'locator' => 'Memory section', 'fact_scope' => 'RAM configuration'],
            [
                'concise_paraphrase' => 'SYNTHETIC: fixture claims two SO-DIMM slots, both occupied.',
                'observed_at' => now(),
                'verification_status' => 'verified',
                'reviewer_id' => $admin->id,
            ]
        );

        $brand = \App\Models\Brand::query()->firstOrCreate(
            ['slug' => 'exampletech'],
            ['name' => 'ExampleTech (demo)']
        );
        $family = \App\Models\LaptopFamily::query()->firstOrCreate(
            ['brand_id' => $brand->id, 'slug' => 'exampletech-campus-15'],
            ['family_name' => 'Campus 15', 'launch_year' => 2024]
        );
        $variant = \App\Models\LaptopVariant::query()->firstOrCreate(
            ['family_id' => $family->id, 'manufacturer_model_code' => 'EX-C15', 'region_code' => null],
            ['notes' => 'SYNTHETIC DEMO DATA']
        );

        $published = LaptopSku::query()->firstOrCreate(
            ['manufacturer_part_number' => 'RC-EX-C15-01-DEMO'],
            [
                'variant_id' => $variant->id,
                'display_name' => 'ExampleTech Campus 15 (SYNTHETIC DEMO)',
                'base_ram_gb' => 16,
                'base_storage_gb' => 512,
                'mass_g' => 1500,
                'use_case' => 'study',
                'status' => 'published',
            ]
        );

        $draft = LaptopSku::query()->firstOrCreate(
            ['manufacturer_part_number' => 'RC-EX-C15-02-DRAFT'],
            [
                'variant_id' => $variant->id,
                'display_name' => 'ExampleTech Campus 15 v2 (DRAFT — must stay hidden)',
                'base_ram_gb' => 32,
                'use_case' => 'gaming',
                'status' => 'draft',
            ]
        );

        RamConfiguration::query()->firstOrCreate(
            ['sku_id' => $published->id],
            [
                'soldered_gb' => 0,
                'slot_count' => 2,
                'occupied_slot_count' => 2,
                'standard' => 'DDR5 SO-DIMM',
                'max_meaning' => 'unknown',
                'evidence_id' => $evidence->id,
            ]
        );

        StorageSlot::query()->firstOrCreate(
            ['sku_id' => $published->id, 'slot_index' => 1],
            [
                'form_factor' => 'M.2 2280',
                'protocol' => 'NVMe',
                'occupied_status' => 'occupied',
            ]
        );

        $this->command?->info('RC fixtures ready: admin rc-admin@example.test, published '.$published->manufacturer_part_number.', draft '.$draft->manufacturer_part_number.' (hidden).');
    }
}
