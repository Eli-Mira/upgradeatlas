<?php

use Illuminate\Support\Env;

return [
    /*
    |--------------------------------------------------------------------------
    | Manual data intake (M3)
    |--------------------------------------------------------------------------
    |
    | The intake command defaults to dry-run and never mutates data without
    | an explicit owner permit. The permit is an owner-issued token recorded
    | in docs/SKU_SOURCE_APPROVAL.md with the approved SKU set, sources and
    | rights. Format: UA-APPROVED-YYYY-MM-DD-<8 hex chars>. The default here
    | is intentionally null: no commit is possible until the owner issues a
    | permit.
    |
    */

    'owner_permit' => Env::get('INTAKE_OWNER_PERMIT'),

    // Bounded input: safety valves for file size, row count and runtime.
    'max_file_bytes' => 5 * 1024 * 1024,
    'max_rows' => 2000,
    'max_field_length' => 2048,
    // The canonical intake CSV header (see IntakeValidator::csvHeader) is
    // 34 columns; the cap leaves modest headroom for future columns.
    'max_columns' => 40,

    // Evidence older than this only produces a warning, never an error.
    'stale_days' => 365,

    // URLs are validated for shape only and are never fetched.
    'allowed_url_schemes' => ['http', 'https'],
];
