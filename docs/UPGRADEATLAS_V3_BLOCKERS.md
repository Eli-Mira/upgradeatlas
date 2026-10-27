# UpgradeAtlas V3 — Consolidated Blockers & Owner Decisions

Nothing here is bypassed by other work. Each item names the gate and what unblocks it.

## RESOLUTIONS — 2026-10-27 (owner delegated decisions; recommended dispositions adopted)

| # | Decision | Adopted disposition |
|---|---|---|
| A1 | Isolated container | **Adopted**: `upgradeatlas_pg` is the project's standard dev/test database. Remove/replace anytime via `docker rm -f upgradeatlas_pg` + recreate from README. |
| A2 | Real SKUs/sources | **Gate stays closed; dossier filled**: the ingestion permit still requires row-level approvals because no specific SKUs were named. `docs/SKU_SOURCE_APPROVAL.md` now carries a grounded 18-row candidate shortlist (3 web-confirmed Acer exact SKUs, 3 confirmed locator families, all rows unverified) so the owner's remaining work is ticking rows and issuing the permit. No real data has entered the product. |
| A3 | Tracked `.env.testing` | **Resolved**: untracked from git (file preserved locally), `.gitignore` entry added, `.env.testing.example` committed. The dev APP_KEY is no longer in the tracked tree; no history rewrite was performed (rotation remains optional and owner-side). |
| A4 | timestamptz drift | **Resolved by obsolescence**: the drifted dev DB lives inside the permanently out-of-scope `med_dms_db` and is unreachable; all fresh databases are drift-free by canonical migrations. The prepared ALTER remains documented below should that DB ever be revived. |
| A5 | Deploy/license/affiliates | **Recommended and adopted**: remain local/private — no deployment, no GitHub visibility change, no affiliate work. License selection deliberately deferred to the owner's legal review (PRD §19.5); no LICENSE file was created on the owner's behalf. |

The following items remain open as originally recorded (history preserved):

## BLOCKED / pending owner approval

| # | Item | Why it needs the owner | Safe state meanwhile |
|---|---|---|---|
| B1 | **`med_dms_db` separation** — the dev `upgradeatlas`/`upgradeatlas_test` DBs historically lived inside the ERP's `med_dms_db` container. Per directive §A.4 that container is now permanently out of scope, so those DB copies are unreachable for this project. | Owner decides: abandon the two DBs inside `med_dms_db` (they were demonstrably stale: 2 draft synthetic SKUs, `alembic_version` residue, timestamp drift) and adopt the isolated container; or arrange an approved export path. **No access will be attempted.** | All work runs on dedicated `upgradeatlas_pg` (127.0.0.1:5434). Data loss inside `med_dms_db`'s UpgradeAtlas DBs would be acceptable (2 synthetic draft rows only). |
| B2 | **Isolated container creation confirmation** — `upgradeatlas_pg` (postgres:16-alpine, port 5434, local-only binding, isolated volume) was created 2026-10-26 as the directive's "separately owned UpgradeAtlas-only disposable DB". The directive asks for owner sign-off on host-level Docker creation. | Retroactive confirmation (or replace with an owner-provisioned DB). Reversible: `docker rm -f upgradeatlas_pg`. | Work continues; removal/replacement is a one-command change. |
| B3 | **Dev-DB timestamp drift fix** — `retailer_offers.recorded_at`, `offer_price_observations.observed_at` are `timestamp` on the historical dev DB vs `timestamptz` in canonical migrations. | Reversible remediation (owner approval required before touching any persistent DB): a single migration — `ALTER TABLE retailer_offers ALTER recorded_at TYPE timestamptz USING recorded_at AT TIME ZONE 'UTC'; ALTER TABLE offer_price_observations observations... ALTER observed_at TYPE timestamptz USING observed_at AT TIME ZONE 'UTC';` with a matching `down()`. Verified shape on the disposable container; the historical dev DB is anyway unreachable (B1). Fresh DBs on `upgradeatlas_pg` are already drift-free. | Canonical migrations already correct; fresh DBs on `upgradeatlas_pg` are drift-free. |
| B4 | **Tracked `.env.testing`** — git-tracked with a development-only `APP_KEY` and the well-known dev DB password (`ua-dev-change-me`). Local-only repo, never pushed. | Proposal ready (M5-03): `git rm --cached .env.testing` + `.gitignore` entry + `.env.testing.example`; key rotation is owner's call; history rewrite only with explicit authorization. | Functionality preserved; nothing printed into logs. |
| B5 | **Real SKU/source ingestion** — 0 verified real SKUs. Any ingestion needs the named permit: exact SKUs, sources, license/rights, method (M3.4 dossier prepared). | Owner completes `docs/SKU_SOURCE_APPROVAL.md` decision blocks. | Intake is dry-run-only; `--commit` additionally gated by an owner-issued permit string. |
| B6 | **Public deployment / GitHub visibility / license** — out of scope by directive. | Owner decision at RC acceptance. | Private local RC only. |

## Incident report (per §A.4 — stated, not hidden)

During the M0/M1 session of 2026-10-26, the then-authoritative V2 directive (D1) sanctioned reusing
the existing PostgreSQL container for UpgradeAtlas. That session found the container `med_dms_db`
stopped (clean exit) and restarted it to reach the documented dev DB, and ran read-only parity
queries plus a disposable `upgradeatlas_migrate_check` DB (created and dropped) inside it. No ERP
data was read, modified, or exposed; ERP containers/files were otherwise untouched. Under the
current M3-RC directive this coupling is judged an architectural risk: as of this session,
`med_dms_db` has received **no further access** and is permanently out of scope (see B1/B2).
