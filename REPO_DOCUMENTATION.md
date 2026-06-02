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
