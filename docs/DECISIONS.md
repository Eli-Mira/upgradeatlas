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
