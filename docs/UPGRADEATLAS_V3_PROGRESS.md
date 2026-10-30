# UpgradeAtlas V3 — Progress Ledger

One row per meaningful step. Newest last. Real results only.

| When | Task | Result | Receipt |
|---|---|---|---|
| 2026-10-26 | M3-00 state recovery | HEAD `3f65ad9` verified; 9 modified + 36 untracked dirty files preserved; other project containers untouched (the previously-shared development container left running exactly as found, no further access per directive) | git log/status; docker ps read-only |
| 2026-10-26 | M3-00 DB isolation | New dedicated disposable container `upgradeatlas_pg` (postgres:16-alpine, 127.0.0.1:5434, isolated volume) with `upgradeatlas`/`upgradeatlas_test` + role `upgradeatlas_app`. No ERP resource touched. Flagged for owner confirmation in BLOCKERS | docker ps; psql role/DB list |
| 2026-10-26 | M3-00 test re-verification | Full backend suite green on isolated DB: **67 passed, 376 assertions** (`DB_PORT=5434 php artisan test`) | PHPUnit receipt |
| 2026-10-26 | M3-00 fresh migrate proof | `upgradeatlas` (5434) migrates cleanly from empty: 25 tables, 0 rows — fresh-adoption path proven on project-owned DB | migrate output |
| 2026-10-26 | M3-02 intake implementation | `laptops:intake` (JSON+CSV) + `laptops:intake-template`; validator/applier/CSV services; dry-run default; permit-gated commit; 14 intake tests covering zero-write dry-run, per-row errors, permit refusal, drafts-only commit, idempotence, conflicts→conflict_flags→publish 409, CSV Arabic/quoting round trip, formula-escape export, caps, malformed input | PHPUnit receipts below |
| 2026-10-26 | M3-04 dossier | `docs/SKU_SOURCE_APPROVAL.md` (structured empty decision blocks, permission gates, no fabricated candidates) + `docs/INTAKE_SCHEMA.md` (provenance contract, unknown semantics, CSV mapping) | docs |
| 2026-10-26 | M3 full-suite receipt | `DB_PORT=5434 php artisan test` → **81 passed, 477 assertions, 0 failed** | final-bytes run before commit |
| 2026-10-26 | M4.1 integration branch | Branch `integration/cinematic-api` off main: baseline commit `f1ab261` snapshots the pre-existing dirty apps/web work with provenance (bytes unchanged, hashes pre-recorded); main keeps its dirty state untouched | git log |
| 2026-10-26 | M4.2 integration fixes | Commit `fac397a`: unknown-price SKUs excluded from budget filter (D6 fix — was treated as EGP 0); distinct bilingual pre-data empty state for a genuinely empty catalog | build + node tests pass |
| 2026-10-26 | M4.4 browser matrix | Playwright/Chromium headless: **30/30 journeys PASS** — phase A (empty DB: honest pre-data state en+ar, RTL dir, no overflow, unknown-SKU 404 UI), phase B (fixture DB: published card at 360/390/768/1024/1440, draft hidden in cards+detail+counts, compare/upgrade/calculator-math (42,600 EGP), keyboard focus, anonymous admin POST→401, zero console errors) | `the local evidence directory (outside the repo) + 12 screenshots |
| 2026-10-26 | M4.3 admin UI decision | Deferred with documented rationale: M2's Sanctum admin API is the verified supported mode; a staff UI would touch protected dirty frontend files and add unapproved dashboard scope | DECISIONS D40 |

## Standing facts (re-verify before relying)

- Backend suite: `cd services/api && DB_PORT=5434 php artisan test`
- Frontend build: `cd apps/web && npm run build` · Prototype: `cd prototypes/visual-redesign && npm run build && npm test`
- Disposable DB container: `upgradeatlas_pg` (port 5434) — removable with `docker rm -f upgradeatlas_pg` without affecting anything else.
- `the previously-shared development container` is permanently out of scope from 2026-10-26 onward (directive §A.4).
| 2026-10-26 | M5/M6/M7 hardening | Commit `12bed70`: token endpoint throttled 10/min; double-publish 409 (single audit event); SecurityLoopTest 10 threat cases; EngineeringTest N+1 bounds; timestamptz remediation SQL in BLOCKERS B3 | 93 tests green (507 assertions) |
| 2026-10-27 | M8 internal RC | `docs/UPGRADEATLAS_V3_FINAL_REPORT.md` (directive template, all gates PASS, approvals A1-A5 consolidated); `docs/DEMO_SCRIPT.md`; README Windows quick-start; checklist fully closed | Final suite 93/507 exit 0 on final bytes |
| 2026-10-27 | Dirty-work preservation proof | Baseline f1ab261 byte-verified against M0 hash records for App.jsx / UpgradeCalculator.jsx / vite.config.js (match=YES) | git rev-parse vs evidence file |
| 2026-10-31 | Owner sign-off | Branch `integration/cinematic-api` at `516b707` approved: refactor (single null-safe upsert, SQL-NULL variant fix), compliance posture, YAGNI deferrals (row-DTO). Tree clean, 104/104 tests. Next owner act when ready: tick dossier rows + issue permit; merge to main on request. | this ledger |
| 2026-10-31 | Merged to main | Fast-forward `fdb0933` → `ddfa74a` (55 files, +4553/−421). Final receipt on main: 104 passed, 542 assertions, tree clean. Branch `integration/cinematic-api` kept for reference. Remaining gate: dossier row-ticks + permit before any real intake. | this ledger; suite receipt |
| 2026-10-31 | Published to GitHub | Pushed to `Eli-Mira/upgradeatlas` (private): scaffold init grafted via unrelated-history merge (-X ours, verified bytes won), CI DB name aligned to the D16 guard (`09915fe`). CI green on push (backend+frontend) — first green after the scaffold's red. Notes: only placeholder dev creds tracked; old dev APP_KEY remains in history (rotate before any future public flip); no LICENSE yet (all-rights-reserved default). | gh run 41140590107 |
| 2026-10-31 | Public flip | Full pre-publication audit: 558 historical blobs scanned (1 hit: historical dev APP_KEY - rotated locally, now inert); 3 junk-named tracked files removed (filenames embedded contents); cross-project names + local paths genericized at tip; session artifacts briefly swept in by a careless `git add -A` and immediately untracked (d940fed). Repo flipped PUBLIC. Known residuals in history only: dev key (inert), artifact blobs (benign local paths), author Gmail. No LICENSE yet (all-rights-reserved default). | commits ad44218, d940fed |

