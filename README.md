# UpgradeAtlas

> College project — PostgreSQL-backed platform built with Laravel 13, React, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.3+ / Laravel 13 |
| Frontend | React + JavaScript, HTML5, CSS3, Tailwind CSS |
| Database | PostgreSQL 16 |
| Dev | Git, GitHub, Docker |

## Monorepo Structure

```
upgradeatlas/
├── apps/
│   └── web/              # React + Vite + Tailwind CSS
├── services/
│   └── api/              # Laravel 13 backend
├── infra/                # Docker, Nginx
├── .github/workflows/    # CI/CD
├── docs/                 # Architecture decisions
└── docker-compose.yml
```

## Quick Start

### Docker (recommended)

```bash
docker compose -f infra/docker-compose.yml up -d
```

### Manual

```bash
# Backend
cd services/api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
cd apps/web
npm install
npm run dev
```

## Development

- **Backend tests:** `cd services/api && php artisan test`
- **Frontend tests:** `cd apps/web && npm run test`
- **Lint:** `cd apps/web && npm run lint`
- **Migrations:** `cd services/api && php artisan migrate`

## CI

GitHub Actions runs on every push and PR to `main`:
- **Backend:** PHP 8.3, Composer, PHPUnit, PostgreSQL migration tests
- **Frontend:** Node 20, ESLint, Vite build, Vitest

See [.github/workflows/ci.yml](.github/workflows/ci.yml).
