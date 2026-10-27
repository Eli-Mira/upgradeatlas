<?php

namespace App\Console\Commands;

use App\Services\Intake\IntakeCsv;
use App\Services\Intake\IntakeValidator;
use Illuminate\Console\Command;

/**
 * Export a human-review CSV template. Formula-like example cells are
 * escaped so spreadsheet applications cannot execute them.
 */
class LaptopsIntakeTemplateCommand extends Command
{
    protected $signature = 'laptops:intake-template {path : Where to write the review CSV}';

    protected $description = 'Write an intake CSV template with formula-injection-safe example rows.';

    public function handle(): int
    {
        $path = (string) $this->argument('path');
        $header = IntakeValidator::csvHeader();

        // Map named values onto header positions (never positional).
        $row = fn (array $values) => collect($header)->map(fn ($col) => $values[$col] ?? null)->all();

        $rows = [
            // A deliberately formula-like display name: the exporter must
            // neutralise it for spreadsheet review.
            $row([
                'type' => 'sku',
                'name' => null, 'slug' => null,
                'family' => 'example-campus', 'manufacturer_model_code' => 'EX-C15', 'region_code' => null,
                'variant_model_code' => 'EX-C15',
                'manufacturer_part_number' => 'EX-C15-01-DEMO',
                'display_name' => '=HYPERLINK("https://evil.example","click")',
                'base_ram_gb' => '16', 'base_storage_gb' => '512', 'mass_g' => '1500',
                'use_case' => 'study', 'demo_label' => 'SYNTHETIC DEMO DATA',
            ]),
            $row([
                'type' => 'ram_configuration',
                'manufacturer_part_number' => 'EX-C15-01-DEMO',
                'soldered_gb' => '8', 'slot_count' => '2', 'occupied_slot_count' => '2',
                'standard' => 'DDR5 SO-DIMM', 'max_meaning' => 'unknown',
            ]),
            $row([
                'type' => 'compatibility_assertion',
                'manufacturer_part_number' => 'EX-C15-01-DEMO',
                'component_type' => 'ssd', 'component_standard' => 'PCIe 4.0 NVMe', 'component_form_factor' => 'M.2 2280',
                'outcome' => 'unknown', 'reason' => 'Fixture: controller compatibility undocumented.',
                'confidence_level' => 'unverified',
                'source_url' => 'https://fixtures.example.test/oem/spec', 'locator' => 'Storage section',
                'evidence_fact_scope' => 'Storage configuration',
            ]),
            $row([
                'type' => 'offer',
                'manufacturer_part_number' => 'EX-C15-01-DEMO',
                'retailer_name' => 'Fixture Demo Shop', 'retailer_website_url' => 'https://fixtures.example.test/shop',
                'retailer_country' => 'EG', 'product_url' => 'https://fixtures.example.test/shop/ex-c15-01-demo',
                'displayed_price_egp' => '23999.99', 'available_status' => 'unknown', 'active' => 'true',
                'source_url' => 'https://fixtures.example.test/oem/spec', 'locator' => 'Storage section',
                'evidence_fact_scope' => 'Storage configuration',
                'observed_at' => '2026-10-26',
            ]),
        ];

        IntakeCsv::write($path, $header, $rows);
        $this->info("Template written to {$path} (cells starting with =, +, -, @ are formula-escaped).");

        return self::SUCCESS;
    }
}
