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

Status: Laravel + React scaffold and local catalog/upgrades API exist. The manual cost calculator works in Arabic/English; this is not a completed Phase 2 or a production release. Laravel schema bootstrap/parity and source-backed publication gates remain open.

## Local development

1. Keep the existing PostgreSQL database unchanged. Configure `services/api/.env` for your local connection; never commit credentials. Do not run resets or fresh migrations.
2. From `services/api`, run `php -S 127.0.0.1:8000 -t public` with PHP 8.3 and the required extensions.
3. From `apps/web`, run `npm run dev -- --host 127.0.0.1 --port 5173`. Open `http://127.0.0.1:5173`. The Vite proxy forwards `/api` to Laravel.
4. Backend tests: from `services/api`, `php vendor/bin/phpunit`. The test guard requires PostgreSQL `upgradeatlas_test`. Frontend checks: from `apps/web`, `npm test`, `npm run lint`, `npm run build`.

The calculator needs no paid services, AI keys or new runtime dependencies. See `docs/COST_CALCULATOR.md` for its contract, evidence, limitations and browser-check instructions.
