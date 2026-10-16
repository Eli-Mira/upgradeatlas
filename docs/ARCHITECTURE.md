# Architecture (approved stack update)

Monorepo (single repository):
- apps/web: React + JavaScript + HTML5/CSS3 + Tailwind CSS (Vite). Fetches `/api/v1/*` via dev proxy to Laravel.
- services/api: Laravel 13 (PHP 8.3+) REST API, validation, Eloquent ORM, Sanctum/auth when needed, Pest/PHPUnit tests.
- Database: PostgreSQL 16 (existing `upgradeatlas` DB/role reused).
- Development: Git/GitHub, Docker (compose for app + Postgres).

Layer separation:
- Frontend consumes JSON REST endpoints only; no DB access.
- Laravel owns domain logic, validation, migrations, auth, audit.
- PostgreSQL is source of truth; Laravel is the sole migration authority going forward.

Phase 2 baseline:
- Eloquent models for catalog (Brand, LaptopFamily, LaptopVariant, LaptopSku, Cpu, Gpu, Display, RamConfiguration, StorageSlot).
- API: `GET /api/v1/laptops` (paginated, search), `GET /api/v1/laptops/{mpn}` (404 on miss).
- React catalog page with loading/error/empty states, Tailwind cards.
- 5 PHPUnit tests passing (DB connectivity, API index, API 404, 2 default).
- React production build passing.

Compatibility:
- PHP 8.3.33 + Composer 2.10.3 verified.
- pdo_pgsql + openssl + mbstring + fileinfo enabled.
- Node 24.15 for React/Tailwind tooling.

Legacy note:
- The earlier FastAPI/Python scaffold is NOT the approved stack. It is archived under `services/api-python-legacy` (no deletion of prior work).
