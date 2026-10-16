# Architecture Decisions

All decisions documented here follow the [ADR format](https://adr.github.io/).

## 1. Tech Stack — PHP Laravel + React + PostgreSQL

**Status:** Accepted  
**Context:** UpgradeAtlas needs a web backend, admin UI, and robust database layer.  
**Decision:** Laravel 13 (PHP 8.3+) for the backend, React + Tailwind for the frontend, PostgreSQL 16 as the database.  
**Consequences:** Familiar ecosystem for the team; PostgreSQL gives us advanced types and constraints.

## 2. Monorepo Structure

**Status:** Accepted  
**Context:** Frontend and backend share a PostgreSQL database but have different build pipelines.  
**Decision:** Single repository with `apps/web` for the React frontend, `services/api` for the Laravel backend, and `infra` for Docker/Nginx configuration.  
**Consequences:** Simplifies CI/CD and deployment; shared .env configuration; clear separation of concerns.

## 3. Docker for Development

**Status:** Accepted  
**Context:** Need reproducible dev environments across team members.  
**Decision:** Docker Compose with PHP-FPM, Nginx, PostgreSQL, and Vite dev server containers.  
**Consequences:** One command to start: `docker compose -f infra/docker-compose.yml up -d`.

## 4. Safe Migration Baseline

**Status:** Accepted  
**Context:** Existing databases must be preserved; destructive migrations are forbidden.  
**Decision:** Back up with `pg_dump -Fc`, verify with `pg_restore --list`, create empty baseline migration, run `migrate:install` then `migrate --force`.  
**Consequences:** No data loss; migrations are reversible; team can safely collaborate on schema changes.
