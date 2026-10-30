# UpgradeAtlas V3 — Internal Release Candidate Final Report

**Date:** 2026-10-27 · **Scope:** M3 → M8 after the verified M1/M2 baseline (`3f65ad9`)
**Nature:** local, private, experimental internal RC. Nothing is pushed, deployed, or published.

```
REPO / BRANCH / HEAD:
  Repo:   the local repository checkout
  main:                     3f65ad9 → fdb0933 (Batch 0 + M3 landed on main)
  integration/cinematic-api: f1ab261 (dirty-work baseline) → fac397a (M4.2 fixes)
                             → 850f3b2 (M4 receipt+seeder) → 12bed70 (M5/M6/M7) → <final-commit> (M8)
  Working tree: clean of tracked modifications; 8 pre-existing untracked session
  artifacts (e2e scripts/screenshots/audit JSON) intentionally left uncommitted.

PREEXISTING DIRTY FILES PRESERVED:
  YES — proven byte-for-byte. The nine modified apps/web files were committed on the
  integration branch as baseline f1ab261 and verified against the M0 hash records
  (App.jsx 53e0f6d…, UpgradeCalculator.jsx bce7301…, vite.config.js b9dc0d2… match).
  Untracked artifacts remain untouched. No stash/reset/clean was ever used.

M3 DATA INTAKE: PASS
  - laptops:intake (JSON+CSV), dry-run default with per-row JSON report; --commit gated
    by owner permit format UA-APPROVED-YYYY-MM-DD-<8hex>; single-transaction natural-key
    upserts; idempotent (identical re-run: 0 changes, 0 audit events — tested).
  - Zero-write proof: full table snapshot identical before/after dry-run (tested).
  - Conflicts: rows contradicting verified-evidence-backed stored facts are skipped,
    recorded as open conflict_flags, and the M2 publish gate then answers 409 (tested).
  - Bounds: 5 MB / 2000 rows / 40 columns / UTF-8 / control chars rejected / JSON depth 32.
  - URLs shape-checked only, never fetched (no SSRF). CSV exports formula-escaped.
  - Dossier: docs/SKU_SOURCE_APPROVAL.md (candidate-free by design); contract:
    docs/INTAKE_SCHEMA.md.

M4 CINEMATIC API + BROWSER: PASS
  - Integration strategy: isolated branch, dirty-work baseline first, scoped fixes on top.
    Design authority (prototypes/visual-redesign) untouched; apps/web enhanced only.
  - M4.2 fixes: unknown-price excluded from budget filter (D6 in UI); distinct bilingual
    pre-data empty state for a genuinely empty catalog.
  - Admin UI: deferred, documented (D40) — M2's Sanctum admin API is the supported mode.
  - Browser matrix (REAL, Playwright/Chromium headless): 30/30 PASS.
    Phase A (empty DB): pre-data state en 1440 + ar 390, RTL dir asserted, no overflow,
    unknown-SKU 404 UI.
    Phase B (fixture DB): published card visible at 360/390/768/1024/1440, draft hidden
    in cards+detail+counts, compare renders, upgrade page renders, calculator math
    (42,600 EGP), keyboard focus, anonymous admin POST→401, zero console errors.
    Receipts: the local evidence directory (outside the repo) + 13 screenshots.

M5 SCHEMA + SECURITY: PASS (dev-DB mutation BLOCKED by design)
  - Fresh migrate/up/down/re-up proven on the project-owned upgradeatlas_pg container;
    historical the previously-shared development container permanently out of scope (incident documented in BLOCKERS).
  - timestamptz drift: exact reversible remediation SQL prepared in BLOCKERS B3,
    awaiting owner approval (fresh DBs are drift-free).
  - Auth hardening: token endpoint rate-limited (10/min); revoked/expired-token behaviour
    verified; tokens of deleted users rejected.
  - .env.testing disposition proposed in BLOCKERS B4 (dev-only key; no history rewrite).

M6 SEC LOOP: PASS — 10 threat cases covered (SecurityLoopTest)
  1 credential abuse + rate limit ✓  2 draft disclosure (counts/filters/detail) ✓
  3 stored-XSS-as-data contract ✓    4 mass assignment / status forgery ✓
  5 publication race (double publish 409, single audit event) ✓
  6 SQL injection literal-needle ✓   7 unicode/bidi search ✓
  8 intake dry-run zero-write + idempotence ✓
  9 audit immutability (no mutation route) ✓  10 cross-project isolation (the previously-shared development container untouched) ✓
  No assertion was weakened; 1 test expectation was corrected to the honest outcome
  (injection literal matches nothing rather than everything).

M7 QUALITY/PERFORMANCE: PASS
  - N+1: public index ≤15 queries for 20 rows, detail ≤12 (EngineeringTest, synthetic data).
  - Bundles measured: apps/web initial JS within warning threshold (chunk-size notice only);
    prototype 446.34 kB JS / 146.85 kB gzip, 148.41 kB CSS / 27.09 kB gzip (unchanged D20
    architecture). No speculative redesign.
  - Install docs: README now carries the Windows isolated-DB quick start + repeatable commands.

M8 PRIVATE RELEASE: PASS (local only)
  - This report; docs/DEMO_SCRIPT.md (safe synthetic walkthrough); updated README;
    V3 register closed out; export guidance below.

BACKEND: php artisan test (DB_PORT=5434, fail-closed to upgradeatlas_test per D16)
  93 passed, 0 failed, 0 skipped — 507 assertions — exit 0 (final bytes before final commit).

FRONTEND/PROTOTYPE:
  apps/web: vite build ✓ (1.07 s), node --test costValidation ✓ 4/4.
  prototypes/visual-redesign: vite build ✓ (340 ms), node tests ✓ 9/9, tsc --noEmit ✓.

BROWSER: 30/30 journeys PASS, 0 failed; Chromium headless 147 (Playwright 1.59, Python);
  widths 360/390/768/1024/1440; locales ar (RTL asserted) + en; 13 screenshots + receipt.json;
  exit 0.

DB: dedicated disposable upgradeatlas_pg (127.0.0.1:5434, isolated volume) carried
  upgradeatlas / upgradeatlas_test / upgradeatlas_empty (+ transient _migrate_check databases,
  always dropped). ERP resources untouched all session: the previously-shared development container, another project container,
  another project container, another project container — no start/stop/query/config against any of them.

SKUS: verified real 0 · synthetic 2 (both draft, hidden) — unchanged at every gate.
  Browser fixtures (RC-EX-C15-01-DEMO published / RC-EX-C15-02-DRAFT draft) exist ONLY in
  the disposable demo DB, are labelled SYNTHETIC DEMO, and are not product data.

COMMITS (tests bound: every commit's tree passed the suite named in its message):
  main:        81d500b (register docs) · fdb0933 (M3 intake, 81 tests)
  integration: f1ab261 (baseline snapshot) · fac397a (M4.2 fixes) · 850f3b2 (M4 receipt)
               12bed70 (M5/M6/M7 hardening, 93 tests) · <final-commit> (M8 close-out)

PRIVACY/SECURITY FINDINGS:
  1. .env.testing git-tracked with dev-only APP_KEY (BLOCKERS B4; proposal ready; no rotation
     without owner authorization).
  2. Demo credentials in docs/DEMO_SCRIPT.md are synthetic and scoped to disposable DBs.
  3. No secrets printed to logs; the previously-shared development container incident previously recorded, no recurrence.

APPROVALS NEEDED (consolidated owner decisions — nothing below is bypassed):
  A1 Confirm/replace the dedicated upgradeatlas_pg container (BLOCKERS B2).
  A2 Real SKU/source permission: complete docs/SKU_SOURCE_APPROVAL.md D-A/D-B and issue the
     D-C permit — until then the public catalog stays honestly empty.
  A3 Tracked .env.testing disposition (untrack + example file; rotation if desired).
  A4 Dev-DB timestamptz remediation (BLOCKERS B3 SQL) if the historical DB is ever revived.
  A5 Public deployment, GitHub visibility, license, affiliate rights — all out of scope.

NEXT EXACT STEP:
  Owner decisions A1–A5; then, once A2 lands, run the intake dry-run on real candidate rows
  and review them through the gated admin flow. No engineering task is blocked on the owner
  today; the next engineering slice would be the bounded admin UI (D40) if approved.
```

## Internal acceptance criteria — verification

1. M1/M2 functionality preserved, not rebuilt — PASS (M1/M2 tests still green in the 93-test suite).
2. M3 intake dry-run zero writes, validation, conflicts, idempotence, audit semantics — PASS (tested).
3. No unapproved real-model facts, scraper, price or stock claims entered the product — PASS.
4. Cinematic frontend integrated without overwriting protected design or dirty work — PASS (hash-verified).
5. Browser journeys genuinely passed — PASS (30/30, receipts retained).
6. Security/authorization/transaction checks pass on real current source — PASS (SecurityLoopTest).
7. No unauthorized access to ERP/shared container or DB — PASS (verified by session log above).
8. Build/test/install results reproducible — PASS (README commands; exit codes in this report).
9. All milestones committed or preserved — PASS (tracked work committed; artifacts documented).
10. No public deployment or "marketplace ready" claims — PASS (internal RC only).

## Export guidance (sanitized source candidate)

A shareable source export must be produced with: `git archive --format=zip -o upgradeatlas-src.zip <commit>`
from a clean checkout, then verify against the allowlist: include only tracked files; assert no
`.env`, no `.env.testing`, no `storage/framework/testing` artifacts, no `node_modules`, no evidence-dir
material, no ERP/other-project paths. The tracked-tree scan found zero `.env*` files outside
`.env.example` and the gitignored services/api/.env.
