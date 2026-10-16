# Architecture (approved stack update)

Monorepo (single repository):
- apps/web: React + JavaScript + HTML5/CSS3 + Tailwind CSS (Vite).
- services/api: Laravel 13 (PHP 8.3+) REST API, validation, Eloquent ORM, Sanctum/auth when needed, Pest/PHPUnit tests.
- Database: PostgreSQL 16 (existing `upgradeatlas` DB/role reused).
- Development: Git/GitHub, Docker (compose for app + Postgres).

Layer separation:
- Frontend consumes JSON REST endpoints only; no DB access.
- Laravel owns domain logic, validation, migrations, auth, audit.
- PostgreSQL is source of truth; migrations via Laravel (or SQL seed scripts for fixtures).

Compatibility:
- PHP 8.3.33 + Composer 2.10.3 verified.
- pdo_pgsql + openssl enabled.
- Node 24.15 for React/Tailwind tooling.

Legacy note:
- The earlier FastAPI/Python scaffold is NOT the approved stack. It will be archived under `services/api-python-legacy` before Laravel scaffolding (no deletion of prior work).
