# UpgradeAtlas V3 — Evidence Register

Append-only. Every entry: command, scope, exit status, and where the raw output lives.

## Batch 0 — 2026-10-26 (M3-00)

| Check | Command | Result |
|---|---|---|
| Git state | `git log -4 --oneline; git status --short` | HEAD `3f65ad9`; 9 modified + 36 untracked preserved (matches M1/M2 exit report) |
| Backend suite on isolated DB | `cd services/api && DB_PORT=5434 php artisan test --compact` | **67 passed, 376 assertions, 0 failed** — exit 0 |
| Isolated DB reachable | PDO connect `127.0.0.1:5434` as `upgradeatlas_app` | `upgradeatlas_test`: 25 tables after suite; `upgradeatlas`: 25 tables, 0 rows after clean migrate |
| Fresh-migration proof | `DB_PORT=5434 DB_DATABASE=upgradeatlas php artisan migrate --force` | All 3 migrations applied cleanly on empty DB (portable bootstrap proven on project-owned container) |
| ERP isolation | `docker ps -a` (read-only) | `the previously-shared development container` left running untouched; `another project container` untouched; no queries against any other project resource |

Interpretation notes:

- PHPUnit env override verified: shell `DB_PORT=5434` wins over `phpunit.xml` (PHPUnit `<env>` without
  `force` does not overwrite existing variables) and over `.env`. Test target remains `upgradeatlas_test`
  on pgsql, so the D16 fail-closed guard stays satisfied.
- D16 negative control (wrong DB refuses to run) is exercised inside `tests/TestCase.php` on every run.

## Batch 1 — 2026-10-26 (M3)

| Check | Command | Result |
|---|---|---|
| Full backend suite incl. intake | `cd services/api && DB_PORT=5434 php artisan test --compact` | **81 passed, 477 assertions, 0 failed** — exit 0 |
| Dry-run zero writes | `IntakeCommandTest::test_dry_run_is_the_default_and_writes_nothing` | PASS — full table-count snapshot identical before/after; 0 audit events |
| Permit gate | `test_commit_refused_without_owner_permit`, `test_commit_refused_with_malformed_permit` | PASS — commit refused; nothing written |
| Idempotence | `test_commit_is_idempotent` | PASS — identical re-run: 0 applied, table snapshots identical, 0 new audit events |
| Conflict → gate | `test_conflicting_row_is_flagged_and_blocks_publication` | PASS — stored verified value unchanged; open `conflict_flags` row; admin publish answers 409 |
| CSV robustness | `test_csv_intake_with_quoting_and_arabic_round_trips` | PASS — quoted commas, doubled quotes, UTF-8 Arabic survive write→read→validate→commit |
| Formula injection | `test_template_export_escapes_spreadsheet_formula_injection` | PASS — `=HYPERLINK` cells apostrophe-escaped on export |
| Fixtures used | `tests/Fixtures/intake/{valid,invalid,conflicting}.json` | Synthetic only; all part numbers contain `INTAKE-`/`DEMO`; no real manufacturer data |

Debugging note (honest record): 3 real bugs were found and fixed by these tests before green — (1) the
storage-slot fixture cited an evidence row defined later in the file (commit stored `evidence_id NULL`
on first pass; fixture reordered + validator now warns), (2) the CSV reader's hand-rolled quote
counting merged rows containing doubled quotes (replaced with native `fgetcsv`), (3) the test's CSV
row builder appended named keys instead of mapping them to header positions.
