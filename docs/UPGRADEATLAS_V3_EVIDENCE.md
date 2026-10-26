# UpgradeAtlas V3 — Evidence Register

Append-only. Every entry: command, scope, exit status, and where the raw output lives.

## Batch 0 — 2026-10-26 (M3-00)

| Check | Command | Result |
|---|---|---|
| Git state | `git log -4 --oneline; git status --short` | HEAD `3f65ad9`; 9 modified + 36 untracked preserved (matches M1/M2 exit report) |
| Backend suite on isolated DB | `cd services/api && DB_PORT=5434 php artisan test --compact` | **67 passed, 376 assertions, 0 failed** — exit 0 |
| Isolated DB reachable | PDO connect `127.0.0.1:5434` as `upgradeatlas_app` | `upgradeatlas_test`: 25 tables after suite; `upgradeatlas`: 25 tables, 0 rows after clean migrate |
| Fresh-migration proof | `DB_PORT=5434 DB_DATABASE=upgradeatlas php artisan migrate --force` | All 3 migrations applied cleanly on empty DB (portable bootstrap proven on project-owned container) |
| ERP isolation | `docker ps -a` (read-only) | `med_dms_db` left running untouched; `b01_isolated_pg` untouched; no queries against any ERP resource |

Interpretation notes:

- PHPUnit env override verified: shell `DB_PORT=5434` wins over `phpunit.xml` (PHPUnit `<env>` without
  `force` does not overwrite existing variables) and over `.env`. Test target remains `upgradeatlas_test`
  on pgsql, so the D16 fail-closed guard stays satisfied.
- D16 negative control (wrong DB refuses to run) is exercised inside `tests/TestCase.php` on every run.
