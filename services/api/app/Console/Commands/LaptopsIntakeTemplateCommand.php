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

        $rows = [
            // A deliberately formula-like display name: the exporter must
            // neutralise it for spreadsheet review.
            ['sku', null, null, null, null, null, null, null, null, null, null, null,
                'ExampleTech', null, null, null, null, 'example-campus', 'EX-C15', null,
                'EX-C15', 'EX-C15-01-DEMO', '=HYPERLINK("https://evil.example","click")', 16, 512,
                1500, 'study', 'SYNTHETIC DEMO DATA', null, 2, 2, 'DDR5 SO-DIMM',
                null, 'unknown', null, null, null, null, null, null],
            ['ram_configuration', null, null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, 'EX-C15-01-DEMO', null, null, null, null, null, null, 8, 2, 2, null,
                null, 'unknown', null, null, null, null, null, null],
        ];

        IntakeCsv::write($path, $header, $rows);
        $this->info("Template written to {$path} (cells starting with =, +, -, @ are formula-escaped).");

        return self::SUCCESS;
    }
}
