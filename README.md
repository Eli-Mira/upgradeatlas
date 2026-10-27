# UpgradeAtlas

Egypt-first, exact-SKU laptop buying & upgrade advisor (college project).

Approved stack:
- Frontend: React + JavaScript + HTML5/CSS3 + Tailwind CSS
- Backend: PHP 8.3+ / Laravel 13
- Database: PostgreSQL 16
- Development: Git, GitHub, Docker

See `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md`.

## Current frontend authority

The sole authoritative implementation of the current frontend design is `prototypes/visual-redesign/index.html` -> `prototypes/visual-redesign/src/main.tsx` and its imported `App.tsx`, `pages/`, `components/`, `data/` modules and the recovered `src/index.css` design system. Run `npm run dev` in `prototypes/visual-redesign` and open `http://127.0.0.1:5174`. See `prototypes/visual-redesign/FRONTEND_ARCHITECTURE.md` for the source map, checks and archive recovery.

The laboratory now holds the **UpgradeAtlas field-guide build**: an Egypt-first gaming-laptop research instrument with sourced hardware profiles, an exact-versus-family confidence model and a research-library catalogue. It was recovered from the user's own saved build (its real stylesheet, entry module, component structure and hardware data) and rebuilt as working source. The previous three-page prototype and, before it, the unmounted experimental frontend are both archived, not active: branches `archive/pre-replit-prototype` and `archive/pre-prototype-frontend`; annotated tags `prototype-pre-replit-20261020-011151` and `legacy-prototype-frontend-final-2026-10-18`.

The API-connected application under `apps/web` remains preserved and is not replaced by this change. It is an integration target, not a second design authority. No production rollout, backend change or database migration is implied.

Status (internal RC, 2026-10-27): publication gates, staff admin API, manual intake readiness and browser-verified frontend integration are complete; schema bootstrap/parity is proven on a disposable database. The public catalog is **intentionally empty** — verified real SKUs: **0** (synthetic demo: 2, draft and hidden) until the owner approves exact SKUs and sources via `docs/SKU_SOURCE_APPROVAL.md`. This is an internal release candidate, not a production release; nothing is deployed.

## Local development (Windows)

Prerequisites: PHP 8.3 (+pdo_pgsql, openssl, mbstring, fileinfo), Composer 2.10+, Node 24, Docker Desktop for the disposable PostgreSQL.

1. Isolated disposable database (project-owned, never shared with other projects):

```bash
docker run -d --name upgradeatlas_pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=ua-local-only-disposable -e POSTGRES_DB=postgres -p 127.0.0.1:5434:5432 postgres:16-alpine
docker exec upgradeatlas_pg psql -U postgres -c "CREATE ROLE upgradeatlas_app LOGIN PASSWORD 'ua-dev-change-me'"
docker exec upgradeatlas_pg psql -U postgres -c "CREATE DATABASE upgradeatlas OWNER upgradeatlas_app"
docker exec upgradeatlas_pg psql -U postgres -c "CREATE DATABASE upgradeatlas_test OWNER upgradeatlas_app"
cd services/api && DB_PORT=5434 php artisan migrate --force
```

2. API: from `services/api`, `DB_PORT=5434 php artisan serve --host=127.0.0.1 --port=8000`.
3. Frontend: from `apps/web`, `npm run dev` → `http://127.0.0.1:5173` (Vite proxies `/api` to Laravel).
4. Backend tests (fail-closed to `upgradeatlas_test` per D16): from `services/api`, `DB_PORT=5434 php artisan test`.
5. Frontend checks: from `apps/web`, `npm test`, `npm run lint`, `npm run build`. Prototype: from `prototypes/visual-redesign`, `npm test` and `npm run build`.
6. Synthetic demo walkthrough (guest + staff flows): `docs/DEMO_SCRIPT.md`.
7. Data intake (dry-run first): `php artisan laptops:intake <file>` — see `docs/INTAKE_SCHEMA.md`. Real ingestion requires the owner permit in `docs/SKU_SOURCE_APPROVAL.md`.

The calculator needs no paid services, AI keys or new runtime dependencies. See `docs/COST_CALCULATOR.md` for its contract, evidence, limitations and browser-check instructions.
