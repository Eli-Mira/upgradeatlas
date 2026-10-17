# UpgradeAtlas

Egypt-first, exact-SKU laptop buying & upgrade advisor (college project).

Approved stack:
- Frontend: React + JavaScript + HTML5/CSS3 + Tailwind CSS
- Backend: PHP 8.3+ / Laravel 13
- Database: PostgreSQL 16
- Development: Git, GitHub, Docker

See `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md`.

Status: Laravel + React scaffold and local catalog/upgrades API exist. The manual cost calculator works in Arabic/English; this is not a completed Phase 2 or a production release. Laravel schema bootstrap/parity and source-backed publication gates remain open.

## Local development

1. Keep the existing PostgreSQL database unchanged. Configure `services/api/.env` for your local connection; never commit credentials. Do not run resets or fresh migrations.
2. From `services/api`, run `php -S 127.0.0.1:8000 -t public` with PHP 8.3 and the required extensions.
3. From `apps/web`, run `npm run dev -- --host 127.0.0.1 --port 5173`. Open `http://127.0.0.1:5173`. The Vite proxy forwards `/api` to Laravel.
4. Backend tests: from `services/api`, `php vendor/bin/phpunit`. The test guard requires PostgreSQL `upgradeatlas_test`. Frontend checks: from `apps/web`, `npm test`, `npm run lint`, `npm run build`.

The calculator needs no paid services, AI keys or new runtime dependencies. See `docs/COST_CALCULATOR.md` for its contract, evidence, limitations and browser-check instructions.
