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
