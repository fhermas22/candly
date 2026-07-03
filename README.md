# Candly

[![CI — Candly](https://github.com/fhermas22/candly/actions/workflows/ci.yml/badge.svg)](https://github.com/fhermas22/candly/actions/workflows/ci.yml)

Candly is a full-stack recruitment platform that connects candidates with job opportunities through a Laravel API backend and a React/Vite frontend.

## Project overview

- **Backend:** `candly-api` — Laravel 13, PHP 8.3+, Sanctum auth, MySQL data storage, OpenAPI docs.
- **Frontend:** `candly-frontend` — React 19, Vite 8, Tailwind CSS, Axios API client.
- **Infrastructure:** `docker-compose.yml` — MySQL, Laravel API, and React app with live code volume mounts.

## Repository structure

- `.github/` — GitHub Actions CI/CD workflows.
- `candly-api/` — Laravel application source code, routes, controllers, services, repositories, and API documentation.
- `candly-frontend/` — React SPA source code, Vite config, and frontend environment setup.
- `docker-compose.yml` — Docker Compose orchestration for the full stack.
- `LICENSE` — project licensing terms (BSD 3-Clause License).
- `notes-devops-candly.md` — project-specific DevOps notes.
- `sprints/` — project sprint retrospective notes.

## Key features

- Public job listings and job detail browsing.
- Candidate application management.
- Admin job management and application moderation.
- Profile media upload with secure private CV delivery.
- API-driven architecture with Sanctum token authentication.
- Dockerized development environment for backend, frontend, and database.

## Local development

### Backend (`candly-api`)

1. Open a terminal in `candly-api/`.
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy environment file and generate app key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Configure database connection in `.env`.
5. Run database migrations:
   ```bash
   php artisan migrate --force
   ```
6. Start the Laravel API:
   ```bash
   php artisan serve
   ```

### Frontend (`candly-frontend`)

1. Open a terminal in `candly-frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the frontend environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Notes

- Set `VITE_API_BASE_URL` in `candly-frontend/.env` to the backend URL, for example `http://localhost:8000/api`.
- The Laravel API is exposed at `http://localhost:8000` when running locally.
- The React app is exposed at `http://localhost:5173` by default.

## Docker development

The repository includes a Docker Compose setup to run the full stack with minimal local configuration.

### Services

- `mysql` — MySQL 8.0 database
- `laravel` — Laravel API container
- `react` — React/Vite frontend container

### Start the stack

From the repository root:

```bash
docker compose up -d --build
```

### Access the app

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`

### Docker container details

- `candly_mysql` — MySQL database on port `3306`
- `candly_api` — Laravel API on port `8000`
- `candly_frontend` — React app on port `5173`

### Notes on Docker setup

- The Laravel container is built from `candly-api/Dockerfile` using `php:8.4-fpm-alpine`.
- The React container is built from `candly-frontend/Dockerfile` using `node:20-alpine`.
- Database credentials are defined in `docker-compose.yml` and match the Laravel defaults.
- `mysql` includes a health check and the `laravel` service depends on a healthy database.
- Source code is mounted into each container for live development.

### Stop the stack

```bash
docker compose down
```

## Testing

### Backend tests

Run from `candly-api/`:

```bash
composer run test
```

### Frontend checks

Run from `candly-frontend/`:

```bash
npm run lint
```

## API documentation

- The API specification is available in `candly-api/docs/openapi.yaml`.
- The Laravel API may also expose synced API docs under `public/docs/openapi.yaml` after running the composer setup scripts.

## Environment configuration

### Laravel `.env`

Important variables:

- `APP_URL` — backend base URL
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DRIVER` and `CACHE_STORE`
- `FILESYSTEM_DISK`

### Frontend `.env`

- `VITE_API_BASE_URL` — backend API base URL, e.g. `http://localhost:8000/api`

## Contribution and maintenance

- Use `docker compose up -d --build` for development workflow.
- Keep `candly-api` and `candly-frontend` environment files in sync with the active deployment targets.
- For backend changes, rely on the Laravel service/repository layer and API route definitions in `candly-api/routes/api.php`.
- For frontend changes, edit the React pages and components under `candly-frontend/src/`.

## Additional resources

- `candly-api/README.md` — backend-specific usage and setup details.
- `candly-frontend/README.md` — frontend-specific usage and setup instructions.
- `notes-devops-candly.md` — project DevOps notes and environment tips.

## Author

- **Hermas Francisco** — [fhermas22](https://github.com/fhermas22)

## License

This project is licensed under the [BSD 3-Clause License](LICENSE).
