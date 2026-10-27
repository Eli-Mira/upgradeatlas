# UpgradeAtlas V3 — Progress Ledger

One row per meaningful step. Newest last. Real results only.

| When | Task | Result | Receipt |
|---|---|---|---|
| 2026-10-26 | M3-00 state recovery | HEAD `3f65ad9` verified; 9 modified + 36 untracked dirty files preserved; ERP containers untouched (med_dms_db left running exactly as found, no further access per directive) | git log/status; docker ps read-only |
| 2026-10-26 | M3-00 DB isolation | New dedicated disposable container `upgradeatlas_pg` (postgres:16-alpine, 127.0.0.1:5434, isolated volume) with `upgradeatlas`/`upgradeatlas_test` + role `upgradeatlas_app`. No ERP resource touched. Flagged for owner confirmation in BLOCKERS | docker ps; psql role/DB list |
| 2026-10-26 | M3-00 test re-verification | Full backend suite green on isolated DB: **67 passed, 376 assertions** (`DB_PORT=5434 php artisan test`) | PHPUnit receipt |
| 2026-10-26 | M3-00 fresh migrate proof | `upgradeatlas` (5434) migrates cleanly from empty: 25 tables, 0 rows — fresh-adoption path proven on project-owned DB | migrate output |
| 2026-10-26 | M3-02 intake implementation | `laptops:intake` (JSON+CSV) + `laptops:intake-template`; validator/applier/CSV services; dry-run default; permit-gated commit; 14 intake tests covering zero-write dry-run, per-row errors, permit refusal, drafts-only commit, idempotence, conflicts→conflict_flags→publish 409, CSV Arabic/quoting round trip, formula-escape export, caps, malformed input | PHPUnit receipts below |
| 2026-10-26 | M3-04 dossier | `docs/SKU_SOURCE_APPROVAL.md` (structured empty decision blocks, permission gates, no fabricated candidates) + `docs/INTAKE_SCHEMA.md` (provenance contract, unknown semantics, CSV mapping) | docs |
| 2026-10-26 | M3 full-suite receipt | `DB_PORT=5434 php artisan test` → **81 passed, 477 assertions, 0 failed** | final-bytes run before commit |

## Standing facts (re-verify before relying)

- Backend suite: `cd services/api && DB_PORT=5434 php artisan test`
- Frontend build: `cd apps/web && npm run build` · Prototype: `cd prototypes/visual-redesign && npm run build && npm test`
- Disposable DB container: `upgradeatlas_pg` (port 5434) — removable with `docker rm -f upgradeatlas_pg` without affecting anything else.
- `med_dms_db` is permanently out of scope from 2026-10-26 onward (directive §A.4).
