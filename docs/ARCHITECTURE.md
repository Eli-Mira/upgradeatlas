# Architecture (approved stack update)

## Current frontend design authority

`prototypes/visual-redesign/index.html` mounts `prototypes/visual-redesign/src/main.tsx`, the sole authoritative implementation of the current frontend design. It renders `src/App.tsx` (header, navigation, locale switch, footer, routes), which imports `src/pages/home.tsx`, `src/pages/catalog.tsx` and `src/pages/not-found.tsx`, the shared `src/components/` primitives, the `src/data/` copy and profile records, and the recovered `src/index.css` design system. Detailed import graph, provenance of the recovered artefacts and checks: `../prototypes/visual-redesign/FRONTEND_ARCHITECTURE.md`.

Two earlier generations of the laboratory are Git-only and must not be used as an active route, component reference or architecture specification: the unmounted experimental frontend (branch `archive/pre-prototype-frontend`, tag `legacy-prototype-frontend-final-2026-10-18`) and the previous three-page prototype (branch `archive/pre-replit-prototype`, tag `prototype-pre-replit-20261020-011151`).

`apps/web` remains the preserved API-connected integration target. These laboratory changes affect neither its source nor Laravel/PostgreSQL, and do not authorize transplanting research profiles or local preview arithmetic into production.

## Preserved API-connected architecture

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
