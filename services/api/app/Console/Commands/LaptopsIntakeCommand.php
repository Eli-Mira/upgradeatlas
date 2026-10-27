<?php

namespace App\Console\Commands;

use App\Services\Intake\IntakeApplier;
use App\Services\Intake\IntakeValidator;
use Illuminate\Console\Command;

/**
 * Manual data intake (M3): dry-run first, commit only with an owner
 * permit. See docs/SKU_SOURCE_APPROVAL.md and docs/INTAKE_SCHEMA.md.
 */
class LaptopsIntakeCommand extends Command
{
    protected $signature = 'laptops:intake
        {path : Absolute or relative path to the intake file (JSON or CSV)}
        {--format= : json|csv (default: inferred from the extension)}
        {--commit : Apply validated rows (REQUIRES the owner permit; default is dry-run)}
        {--report= : Write the JSON report to this path instead of stdout}
        {--max-rows= : Override the row cap for this run (max 2000)}';

    protected $description = 'Validate (and, with an owner permit, apply) a manual exact-SKU intake file. Dry-run by default.';

    public function handle(): int
    {
        $path = $this->argument('path');
        $absolute = realpath($path) ?: base_path($path);
        if ($absolute === false || ! is_file($absolute)) {
            $this->error("Intake file not found: {$path}");

            return self::FAILURE;
        }

        $format = strtolower((string) ($this->option('format') ?: pathinfo($absolute, PATHINFO_EXTENSION)));
        if (! in_array($format, ['json', 'csv'], true)) {
            $this->error('Unsupported format; use json or csv.');

            return self::FAILURE;
        }

        $maxRows = min((int) ($this->option('max-rows') ?: config('intake.max_rows')), (int) config('intake.max_rows'));

        $validator = new IntakeValidator;
        try {
            ['report' => $report, 'rows' => $rows] = $validator->validate($absolute, $format, $maxRows);
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $commit = (bool) $this->option('commit');

        if ($commit) {
            $permit = (string) config('intake.owner_permit');
            if (! preg_match('/^UA-APPROVED-\d{4}-\d{2}-\d{2}-[0-9a-f]{8}$/', $permit)) {
                $this->error('Commit refused: no valid owner permit is configured.');
                $this->line('Real ingestion requires the permit recorded in docs/SKU_SOURCE_APPROVAL.md');
                $this->line('(format UA-APPROVED-YYYY-MM-DD-<8 hex>), set as INTAKE_OWNER_PERMIT.');
                $this->line('Dry-run output follows.');
                $commit = false;
            }
        }

        $report['mode'] = $commit ? 'commit' : 'dry-run';

        if ($commit) {
            $summary = app(IntakeApplier::class)->commit($rows, null);
            $report['commit'] = $summary;
            $report['summary']['applied'] = $summary['applied'];
            $report['summary']['skipped'] = $summary['skipped'];
        }

        $json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (($reportPath = $this->option('report')) !== null) {
            file_put_contents($reportPath, $json);
            $this->info("Report written to {$reportPath}");
        } else {
            $this->line($json);
        }

        $summary = $report['summary'];
        $this->info(sprintf(
            'Intake %s: %d row(s) — %d valid, %d warnings, %d conflicts, %d errors.',
            $report['mode'],
            $summary['total'],
            $summary['valid'],
            $summary['warning'],
            $summary['conflict'],
            $summary['error'],
        ));

        if (($summary['error'] ?? 0) > 0) {
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
