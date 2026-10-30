# Decisions

- D1: Reuse existing PostgreSQL 16 container `med_dms_db`, but separate DB `upgradeatlas` + non-superuser owner role `upgradeatlas_app` (isolated; no changes to `medical_dms`).
- D2: Python 3.14.0 verified compatible with FastAPI/SQLAlchemy/Alembic/Pydantic/Psy Copg/Pytest (all import successfully).
- D3: Schema-first Phase 1: 24 tables (catalog, upgrades, offers, governance, users, audit) before API feature work.
- D4: Timestamps use TIMESTAMPTZ (UTC stored). Monetary values NUMERIC(12,2), never float in DB.
- D5: Compatibility defaults to `unknown`; `supported` only requires explicit evidence and reviewed scope.
- D6: Unknown compatibility/price never treated as 0/free; enum checks enforce valid states and unit tests verify violation.
- D7: Synthetic demonstration data is clearly labeled `SYNTHETIC DEMO DATA`. No invented real laptop specs/prices.
- D8: JSON used for portable attributes; PostgreSQL JSONB can replace if needed.
- D9: Trigram/full-text indexing deferred (no data scale yet); baseline indexes will be added before public search.

- D10: Approved stack is React+JS+Tailwind (frontend), Laravel 13/PHP 8.3+ (backend), PostgreSQL 16 (database), Git/GitHub/Docker (development). Python/FastAPI and Next.js are explicitly excluded.
- D11: PHP installed via winget (8.3.33); pdo_pgsql, pgsql, openssl enabled; Composer 2.10.3 installed.
- D12: Laravel migrations will replace Python Alembic for schema ownership; existing SQL schema/constraints serve as the spec baseline.
- D13: Phase 0b archives the Python scaffold (no deletion), then scaffolds Laravel in services/api and Vite React in apps/web.
- D14: Prefer free/open-source and built-in capabilities; the cost calculator adds no packages/services, uses integer piasters and decimal strings, and neither queries nor persists database data. No public price is inferred from a user's cost inputs.
- D15: Calculator mode is manual cost-only, with no automatic SKU selection or compatibility/performance recommendation. Source-backed SKU and offer flows remain separate.
- D16: Laravel feature tests fail closed unless the resolved target is PostgreSQL `upgradeatlas_test`, before transaction traits run. A wrong-database negative control must refuse execution.
- D17: Previous phase completion claims overstated readiness. A no-op migration baseline does not prove portable bootstrap/parity. Existing draft exposure and evidence-publication gates block public deployment.

## 2026-10-17 — Graphite design system and frontend completion

- D18: Visual identity is graphite (charcoal surfaces, one signal accent, 8px radius). No pill shapes, no glow effects, no gradient surfaces. Rationale: an instrument/tool feel, not a marketing page.
- D19: Unknown values render as their own token (`unknown`), never as a blank cell or a 0. A comparison row is marked "differs" only when every present value agrees; an unknown prevents agreement without pretending to be a number.
- D20: Three.js and Lenis are dynamic imports. Measured bundle: initial JS 278.9 kB (84.8 kB gzip); three.js 527.6 kB and Lenis 18.6 kB ship as separate chunks that load after first paint.
- D21: Fonts are self-hosted (`@fontsource-variable/archivo`, IBM Plex Sans Arabic 400/500/600). No CDN request. The 700 weight was dropped because nothing in the UI used it.
- D22: `vite.config.js` pins `server.host` to `127.0.0.1`. Vite otherwise binds to IPv6 `[::1]` only, which makes the documented URL unreachable over IPv4.
- D23: `LaptopController@index` search predicate is grouped (`where(fn => ...)`). A bare `orWhere` escaped the `min_ram_gb` filter and silently widened results. Verified: `q=EX-&min_ram_gb=64` returns 0, not 2.
- D24: `min_ram_gb` is a real server-side filter. Price filtering remains deferred until offer joins exist, and the API documents that rather than returning an unfiltered set.

### Not verified

- No visual render check was performed. The only browser on the machine is Brave, whose profile is locked while running; quitting it was not attempted. Build, lint, unit tests, PHP syntax, API responses and Vite module transforms all pass, but pixels were not inspected.
- The catalogue contains 2 synthetic demo SKUs only. Empty-state, pagination and multi-model comparison logic are implemented and tested but not exercised against a realistic data volume.

## 2026-10-26 — Publication gates and migration parity (M1)

- D25: All three public read paths (`GET /api/v1/laptops`, `/{sku}`, `/{sku}/upgrades`) apply a server-side `published` scope. Only `status='published'` SKUs are returned; `draft`/`review`/`retired` never appear — including in `total` counts and inside combined search/filter predicates. A non-public detail responds 404, identical to a missing part number, so existence is never disclosed. Verified by 9 new feature tests in `LaptopApiTest` (publication, counts, filters, price NULL/inactive handling, write-method rejection).
- D26: The `laptop_skus` status contract is `draft|review|published|retired` (PRD §8). The SKU factory now defaults to `published` with named `draft()/review()/retired()` states; the previous `active/discontinued` values were not part of any approved contract.
- D27: Migration parity was verified on a disposable database (`upgradeatlas_migrate_check`, dropped after the check): all three migrations apply, `migrate:reset` removes everything, re-apply reproduces the schema. Column-level diff against the dev `upgradeatlas` database found: (a) dev-only residue table `alembic_version` from the archived Python scaffold, (b) dev drift where `retailer_offers.recorded_at` and `offer_price_observations.observed_at` are `timestamp without time zone` while the migration (D4-conformant) uses `timestamptz`. The dev database was left unchanged; aligning it is an owner-approved follow-up.
- D28: `Retailer` and `Source` Eloquent models were added because `RetailerOffer::retailer()/source()` referenced classes that did not exist (latent fatal error on first relation load). Migration parity confirmed the source test suite has 47 passing tests including D16's fail-closed guard.

### Not verified in M1

- No browser journey was exercised in this milestone (build + unit/feature evidence only); M4 owns browser evidence at 360/390/768/1440.
- The dev database still contains only 2 synthetic demo SKUs, both `draft`, so the public catalog is now intentionally empty until the owner approves verified data (M3 gate).

## 2026-10-26 — Protected admin/evidence API (M2)

- D29: Approved admin model (PRD §2, journey C): `users.role` of `admin` or `editor` gates the admin API. Guest browsing stays guest-first; no consumer sign-in was added. Authentication is Laravel Sanctum tokens (first-party, directive-sanctioned); the `staff` middleware alias enforces the role server-side. Hidden-button-less: the API refuses non-staff tokens and anonymous requests outright.
- D30: The `User` model was aligned to the baseline `users` table (`hashed_password`, `role`, `locale`, `display_name`, `external_auth_id`, `deleted_at`). The previously shipped Laravel-default model (name/password/remember_token) did not match the schema and would fail any real use. `UserFactory` now provides `admin()`/`editor()` states.
- D31: Admin API surface under `/api/v1/admin`: token issue/revoke, SKU list (all statuses)/create/patch, `publish`, `retire`, RAM-configuration upsert, storage-slot create, sources, evidence. Every mutation runs in a transaction with an actor-bound `audit_events` row (old/new values). Status is server-owned: direct status edits via PATCH are rejected; drafts are the only entry state regardless of client payload.
- D32: Publication gate (fail closed): `publish` requires verified evidence attached through `ram_configurations`/`storage_slots`/`compatibility_assertions`, no unreviewed compatibility assertions, and no open `conflict_flags`; otherwise 409 with the blocking reasons. Retiring a published SKU removes it from the public API (verified end-to-end in tests).
- D33: Evidence records bind `reviewer_id` to the authenticated actor. Sources record an explicit `usage_permission_status` (`permitted|unclear|not_permitted`) — supplied descriptions are never treated as licenses. Source URLs are shape-validated only and never fetched by the API, so there is no SSRF surface.
- D34: The `personal_access_tokens` migration is reversible and was verified up/down on a disposable database before commit; migration parity from M1 remains intact.

### Not verified in M2

- No admin UI was built (deliberately: secure API and tests first, per the execution directive). Forms come later within approved PRD scope.
- Sanctum token expiration stays at the library default (non-expiring, revocable). A rotation/expiry policy is an owner decision.

## 2026-10-26 — Data intake readiness and DB isolation (M3)

- D35: Per the M3-RC directive, the ERP's `med_dms_db` container is permanently out of scope for this project (see `docs/UPGRADEATLAS_V3_BLOCKERS.md` for the incident record). All verification now runs on a dedicated disposable container `upgradeatlas_pg` (postgres:16-alpine, 127.0.0.1:5434, isolated volume, `upgradeatlas`/`upgradeatlas_test` + role `upgradeatlas_app`); its creation is flagged for owner confirmation. A fresh migrate bootstrap and the full suite (then 67 tests) were proven on it.
- D36: Manual data intake is a bounded, offline artisan command (`laptops:intake`) — dry-run by default with a structured per-row JSON report; `--commit` requires an owner-issued permit (`UA-APPROVED-YYYY-MM-DD-<8hex>` via `INTAKE_OWNER_PERMIT`). Commits are single-transaction, natural-key upserts (idempotent: identical re-application writes nothing), with per-row audit events. Input is bounded (5 MB / 2000 rows / 40 columns / UTF-8 / no control chars / JSON depth 32); source URLs are shape-validated only and never fetched (no SSRF surface). CSV review exports escape spreadsheet formula injection.
- D37: Intake can never publish: created SKUs are `draft`, existing status is preserved (server-owned), and compatibility assertions are inserted unreviewed. Rows contradicting verified-evidence-backed stored facts are not applied — they become open `conflict_flags` anchored to `laptop_skus`, which the M2 publication gate honours (verified: publish then answers 409).
- D38: The provenance contract (identity chain, claim/units, source + permission status, locator, paraphrase, timestamps, human reviewer, confidence, explicit `unknown` semantics) is documented in `docs/INTAKE_SCHEMA.md`; `docs/SKU_SOURCE_APPROVAL.md` is the owner decision sheet and deliberately contains no candidate part numbers, because none are grounded in documentation already in hand. Verified real SKUs remain **0**; synthetic remain **2** (`draft`, hidden).

## 2026-10-26 — Cinematic frontend integration and browser evidence (M4)

- D39: Frontend integration runs on an isolated branch `integration/cinematic-api`, based on `main`. Its first commit (`f1ab261`) snapshots the pre-existing uncommitted `apps/web` work verbatim as a provenance baseline (hashes pre-recorded), so integration commits stay individually scoped and `main`'s working state is never silently rewritten. `main` retains the dirty files as they were.
- D40: Staff administration is documented as **API/CLI-only** for this release: the M2 Sanctum admin API is the verified supported mode, and a staff UI would have to touch protected uncommitted frontend files and add dashboard scope the PRD has not approved. Deferral does not block any public-user workflow.
- D41: The genuinely empty catalog (zero published records) renders a distinct bilingual pre-data empty state rather than the filtered-results message, and unknown-price SKUs are excluded from client-side budget filtering instead of being treated as EGP 0 (D6 applied in the UI layer). Verified by 30/30 real browser journeys (Playwright/Chromium) across 360/390/768/1024/1440 in Arabic RTL and English LTR, with zero console errors and no horizontal overflow.

## 2026-10-27 — Two-axis code review pass and owner-decision execution

- D42: A standards/spec review (per the code-review skill, two independent axes) of the M2/M3/hardening surface found and fixed: CSV row-cap off-by-one (header was counted), dead per-field length caps (max() raised every cap to the 2048 ceiling), representation-drift in the intake idempotence comparison, over-broad SKU conflicts without verified-evidence anchoring, duplicate open conflict flags, resolver attribution on open flags, a publish check outside its transaction (now row-locked), missing audit on token issue/revoke, missing lower bound on per_page, duplicate storage slots answering 409 (PRD reserves 409 for conflicting publication — now 422), unreachable `review` status, missing conflict-resolution and assertion-review endpoints, and CSV rows unable to express assertion/offer facts. Follow-up (ponytail pass, same day): the seven boring `apply*` upsert methods now share one null-safe `upsert()` helper (deleting the duplicated locate/create/update/audit shape) and the `audit()` middle-man is gone. That read also caught a live bug: the variant locate used `where(col, null)`, which never matches SQL NULL, so a null-region variant duplicated on every commit - fixed and regression-tested. Still deferred, deliberately: assertion/offer rows stay on `DB::table` (their supersede/freeze semantics are the interesting part), and the loose-array row payload stays (a DTO would be an abstraction for one consumer).
- D43: The owner delegated the A1–A5 decisions with "proceed with your recommendations" (2026-10-27). Adopted: upgradeatlas_pg as the standard DB; `.env.testing` untracked with an example file; timestamptz resolved by obsolescence; the project stays local/private with no license file created on the owner's behalf; and the SKU ingestion gate stays CLOSED — the dossier now carries a grounded 18-row candidate shortlist (bounded manual lookups only, every row unverified, locator provenance labeled) so the owner's remaining act is per-row approval plus a permit. Candidate names are not facts; the public catalog remains empty.

