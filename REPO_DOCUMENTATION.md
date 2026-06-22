# Repository documentation

## Overview

This mono-repo contains a Laravel backend and a React frontend. It includes Docker configurations for local development and uses modern frontend tooling (Vite/Tailwind) alongside a Laravel 12 application.

**Primary components:**
- **Backend:** Laravel (PHP) application in the `backend/` folder.
- **Frontend:** React app in the `frontend/` folder.
- **Infrastructure:** `docker-compose.yml` plus Dockerfiles in both `backend/` and `frontend/`.

## Tech stacks

- **Backend:** PHP ^8.4, Laravel ^12
- **Frontend:** React ^19 (Create React App / Vite for asset pipeline), JavaScript/TypeScript
- **Styling:** Tailwind CSS
- **Build/tools:** Vite (used in Laravel asset pipeline), npm
- **Containers:** Docker, docker-compose

## Key libraries and packages

Backend (from [backend/composer.json](backend/composer.json#L1-L200)):
- **laravel/framework**: core framework
- **laravel/sanctum**: API authentication
- **laravel/tinker**: REPL for Laravel
- Dev: **phpunit**, **mockery**, **fakerphp**, **nunomaduro/collision**, **laravel/pint**, **laravel/sail**

Frontend (from [frontend/package.json](frontend/package.json#L1-L200)):
- **react**, **react-dom**: UI library
- **react-router-dom**: routing
- **axios**: HTTP client
- **maplibre-gl**, **react-map-gl**: maps
- **radix-ui** components: primitives (dialog, dropdown, tooltip, etc.)
- **tailwindcss**: utility-first CSS
- **lucide-react**, **react-icons**: icons
- Testing: **@testing-library/react**, **jest-dom**, **user-event**
- Dev tooling: **eslint**, **typescript**, **postcss**, **autoprefixer**

Backend npm (asset build/helpers) (from [backend/package.json](backend/package.json#L1-L200)):
- **vite**, **laravel-vite-plugin**, **tailwindcss**, **concurrently**

## Dev scripts & common commands

- Install backend PHP deps: `composer install` (see [backend/composer.json](backend/composer.json#L1-L200) `scripts.setup`)
- Install frontend deps: `npm install` in `frontend/`
- Run Laravel server: `php artisan serve`
- Frontend dev (CRA): `npm start` in `frontend/`
- Vite build (assets): `npm run build` or `vite` via `backend/package.json` scripts
- Tests: `php artisan test` (backend) and `npm test` (frontend)

## API Endpoints

### Auth
| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/api/register` | No | 3 per 60 min | Create account (password: 8+ chars, upper, lower, digit, special). Sends verification email. |
| POST | `/api/login` | No | 5 per 1 min | Login with timing-safe credential check. Supports multi-device sessions. |
| GET | `/api/me` | Yes | — | Returns authenticated user with `email_verified_at`. |
| POST | `/api/logout` | Yes | — | Revoke current token. |
| POST | `/api/sessions/revoke-others` | Yes | — | Revoke all tokens except current. |

### Email Verification
| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| GET | `/email/verify/{id}/{hash}` | No | — | Verification link from email. Redirects to frontend `/email/verify?status=success\|invalid`. |
| POST | `/api/email/resend` | Yes | 1 per 1 min | Resend verification email. |

### Analysis (with Risk Scoring)
| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/api/analyze` | Yes | — | Full analysis with multi-signal risk scoring. Response includes `risk_score`, `risk_level`, `risk_breakdown`. |
| POST | `/api/analyze/public` | No | 10 per 1 min | Public analysis (no history persistence). |
| GET | `/api/lookup/{uuid}` | No | — | Public lookup by UUID. |

### History
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/history` | Yes | List saved lookups. |
| PATCH | `/api/history/{id}` | Yes | Update label. |
| DELETE | `/api/history/{id}` | Yes | Delete one. |
| DELETE | `/api/history` | Yes | Delete all. |

### Geo
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/geo` | Yes | Geo data for request IP. |
| GET | `/api/geo/{ip}` | Yes | Geo data for specific IP. |
| GET | `/api/geo/public` | No | Public geo lookup (hardcoded ip-api.com). |

## Risk Scoring System

The `RiskScorer` uses a weighted multi-signal algorithm with 10 signals:

| Signal | Weight | Description |
|---|---|---|
| `proxy` | +25 | IP is a proxy/anonymizer |
| `hosting` | +8 | IP is datacenter/hosting |
| `on_blocklist` | +40 | Domain found on Google Safe Browsing, PhishTank, or VirusTotal |
| `domain_age_under_7_days` | +35 | Domain registered < 7 days ago |
| `domain_age_under_30_days` | +25 | Domain registered 7–30 days ago |
| `domain_age_under_90_days` | +15 | Domain registered 30–90 days ago |
| `no_valid_ssl` | +20 | No valid SSL certificate |
| `suspicious_tld` | +10 | TLD in suspicious list (.xyz, .top, .gq, etc.) |
| `typosquatting` | +35 | Levenshtein distance ≤ 2 from known service |
| `known_service_bonus` | -30 | Domain is a recognized legitimate service |

Thresholds: **HIGH** ≥ 65, **MEDIUM** ≥ 30, **LOW** < 30. Score clamped to [0, 100].

Configuration in `config/risk-scoring.php`. Known services whitelist in `storage/app/known-services.json`.

## Email Verification Setup

1. **Development:** `MAIL_MAILER=log` — emails go to `storage/logs/laravel.log`
2. **Production:** Sign up at [resend.com](https://resend.com) (free tier: 100/day), set `MAIL_MAILER=resend` and `RESEND_API_KEY`
3. **Docker:** Optionally add Mailpit service for local email UI at `http://localhost:8025`

## Infrastructure / Deployment

- Dockerfiles exist for both `backend/` and `frontend/` and there's a repository `docker-compose.yml` at the project root for local orchestration.
- The Laravel project references an SQLite file in `database/database.sqlite` in project setup scripts.

## Where to look (files)

- Composer manifest: [backend/composer.json](backend/composer.json#L1-L200)
- Backend npm/package: [backend/package.json](backend/package.json#L1-L200)
- Frontend manifest: [frontend/package.json](frontend/package.json#L1-L200)
- Docker compose: [docker-compose.yml](docker-compose.yml)
- Backend app code: `backend/app/`
- Frontend source: `frontend/src/`

## Notes & next steps

- If you want a more detailed dependency inventory, I can generate a full list of Composer and NPM packages with versions.
- I can also add quick start instructions (copy .env, database setup, Docker compose up) as a separate `CONTRIBUTING.md` or expand this file.
