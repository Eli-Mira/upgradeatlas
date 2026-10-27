<?php

namespace App\Services\Intake;

/**
 * CSV reader and formula-safe writer for the manual intake path.
 *
 * Reading is bounded and strict: UTF-8, a hard column cap, and no
 * spreadsheet formulas are executed anywhere (values are data only).
 * Cells written for human review escape spreadsheet formula injection
 * by prefixing characters Excel/LibreOffice/Sheets interpret as formulas.
 */
class IntakeCsv
{
    public const FORMULA_PREFIXES = ['=', '+', '-', '@', "\t", "\r"];

    /**
     * @return list<list<string>> rows including the header row
     */
    public static function read(string $absolutePath, int $maxColumns, int $maxRows): array
    {
        $raw = file_get_contents($absolutePath);
        if ($raw === false) {
            throw new \RuntimeException('Unable to read the intake file.');
        }

        if (! mb_check_encoding($raw, 'UTF-8')) {
            throw new \RuntimeException('Intake file must be valid UTF-8.');
        }

        // Strip a UTF-8 BOM if present before parsing.
        if (str_starts_with($raw, "\xEF\xBB\xBF")) {
            $raw = substr($raw, 3);
        }

        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $raw);
        rewind($handle);

        $rows = [];
        while (($cells = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
            if ($cells === [null] || $cells === []) {
                continue; // blank line
            }
            if (count($cells) > $maxColumns) {
                throw new \RuntimeException("Intake CSV row exceeds the column cap ({$maxColumns}).");
            }
            if (count($rows) > $maxRows) {
                throw new \RuntimeException("Intake CSV exceeds the row cap ({$maxRows} data rows).");
            }

            $rows[] = array_map(function ($cell) {
                $cell = (string) $cell;
                // Control characters other than \n and \t are rejected
                // upstream by the validator; here they are only normalised.
                return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $cell) ?? '';
            }, $cells);
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Escape a single cell destined for a human-review CSV so spreadsheet
     * applications cannot interpret it as a formula.
     */
    public static function escapeCell(?string $value): string
    {
        $value = (string) $value;

        if ($value !== '' && in_array($value[0], self::FORMULA_PREFIXES, true)) {
            return "'".$value;
        }

        return $value;
    }

    /**
     * @param list<string> $header
     * @param list<list<?string>> $rows cells in the same order as $header
     */
    public static function write(string $absolutePath, array $header, array $rows): void
    {
        $handle = fopen($absolutePath, 'w');
        if ($handle === false) {
            throw new \RuntimeException('Unable to open the export path for writing.');
        }

        fputcsv($handle, $header, ',', '"', '\\');
        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn ($cell) => self::escapeCell($cell), $row), ',', '"', '\\');
        }

        fclose($handle);
    }
}
