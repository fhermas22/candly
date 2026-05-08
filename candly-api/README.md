## Candly API (Laravel + Sanctum)

API backend for **Candly** built with Laravel and designed to be consumed by a React SPA.

### Tech stack

- **PHP**: 8.3+
- **Framework**: Laravel (installed dependency is `laravel/framework`)
- **Auth**: Laravel Sanctum (Bearer tokens)
- **Tests**: Pest
- **Docs**: OpenAPI 3.0 (`docs/openapi.yaml`)

---

## Quick start

### Requirements

- PHP 8.3+
- Composer 2+
- A database (SQLite/MySQL/PostgreSQL)
- (Optional) Node.js if you use Vite assets

### Install

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
```

Or use the automated project setup script:

```bash
composer run setup
```

### Run locally

```bash
php artisan serve
```

---

## Environment configuration

Key environment variables (in `.env`):

- **`APP_URL`**: base URL used to generate public URLs (e.g. profile photo URL)
- **DB connection**: `DB_CONNECTION`, `DB_DATABASE`, etc.

### Storage

- **Public assets (photos)**: stored under `storage/app/public/` and exposed through `/storage` (requires `php artisan storage:link`)
- **Private assets (CVs)**: stored under `storage/app/private/` and served only via **short-lived signed URLs**

Run once (local dev):

```bash
php artisan storage:link
```

---

## Authentication (Sanctum)

Candly uses **Sanctum Personal Access Tokens**.

- The API returns a **`plainTextToken`** on login/register.
- Sanctum stores **only a hash** of the token server-side; the plain token is returned **once**.
- Clients must send it as:

```http
Authorization: Bearer <token>
```

---
## Admin user management

Create an admin user without exposing the password on the command line:

```bash
php artisan candly:create-admin-user admin@example.com --status=1
```

This command will prompt for the admin password in hidden mode when run interactively.

For CI or non-interactive automation, provide the secret through environment or stdin:

```bash
CANDLY_ADMIN_PASSWORD="$ADMIN_PASSWORD" php artisan candly:create-admin-user admin@example.com --status=1
```

```bash
printf '%s' "$ADMIN_PASSWORD" | php artisan candly:create-admin-user admin@example.com --password-stdin --status=1
```

Do not pass the password as a positional argument; that can expose it in shell history and process listings.

---
## Roles & authorization

User roles are stored in `users.role`:

- `admin`
- `candidate`

Authorization is enforced via:

- **`auth:sanctum`** for authenticated endpoints
- a custom **`role:admin`** middleware for admin-only routes
- policies registered in `AuthServiceProvider`

Security anomaly handling:

- If a user role is not in `['admin', 'candidate']`, requests are denied with **403**.

---

## Domain model overview

### Tables

- **`users`**
  - `email` (unique), `password`, `role`, `status`, `deleted_at`, timestamps
- **`profiles`** (1–1)
  - `user_id`, identity fields, `photo_path`, `cv_path`
- **`job_advertisements`**
  - `admin_id` (creator), `status` (`open|closed`), job details
- **`applications`**
  - `user_id` (candidate), `job_id`, `status` (`pending|accepted|rejected`)
  - `moderated_by` (admin traceability), `applied_at`, `deleted_at`

### Eloquent relationships (high level)

- `User` hasOne `Profile`
- `User` hasMany `JobAdvertisement` (as creator via `admin_id`)
- `User` hasMany `Application` (as candidate)
- `User` hasMany `Application` (as moderator via `moderated_by`)
- `JobAdvertisement` hasMany `Application`
- `Application` belongsTo `User` (candidate) and belongsTo `JobAdvertisement`

---

## API Endpoints

Source of truth:

- **Routes**: `routes/api.php`
- **OpenAPI spec**: `docs/openapi.yaml`

### Auth

- `POST /api/auth/register` (rate limited `throttle:10,1`)
- `POST /api/auth/login` (rate limited `throttle:10,1`)

### Candidate

- `GET /api/candidate/applications`
- `POST /api/candidate/applications` (body: `job_id`)
- `DELETE /api/candidate/applications/{applicationId}`

### Admin

- `GET /api/admin/applications/pending` (paginated)
- `PATCH /api/admin/applications/{applicationId}/moderate` (body: `status=accepted|rejected`)

### Profile media

- `POST /api/profile/media` (multipart: `photo` and/or `cv`)
- `GET /api/profiles/{profile}/cv` (signed URL only)

---

## Business rules (Applications)

The application logic follows a **Service–Repository** pattern:

- **Repository** (`ApplicationRepository`)
  - Candidate: list active (non-soft-deleted) applications
  - Admin: list pending (non-soft-deleted) applications (pagination: 15)
- **Service** (`ApplicationService`)
  - Apply:
    - prevents duplicates per candidate+job (422)
    - blocks closed jobs (422)
  - Withdraw:
    - only owner + status `pending` (soft delete)
    - otherwise forbidden (403)
  - Moderate:
    - status must be `accepted|rejected` (422 otherwise)
    - always stores `moderated_by` for traceability

Custom domain exceptions are mapped to HTTP responses in `app/Exceptions/Handler.php`.

---

## Media management (high security)

Media upload rules (validated by `ProfileMediaRequest`):

- **photo**: `image`, `jpeg/png/jpg`, max **2048KB**
- **cv**: `pdf`, max **5120KB**

Storage policy:

- **Photos** are public and served via standard public URLs (safe for display in a SPA).
- **CVs** are private documents and are **never exposed directly** from storage.
  Instead, the API serves them through a **signed URL** with a short TTL (15 minutes).

Cleanup policy (anti-data-loss):

- Profile record is updated in a DB transaction.
- Old files are deleted **only after commit**.
- On transaction failure, old files are kept and newly uploaded files are removed.

---

## Global API behavior

### JSON-only responses

All API responses are forced to negotiate JSON (even errors) via a global middleware that sets:

- `Accept: application/json`

### Security headers

The API adds baseline hardening headers globally:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

---

## Testing

Run the test suite:

```bash
php artisan test
```

Feature tests live under:

- `tests/Feature/ApplicationTest.php`
- `tests/Feature/MediaTest.php`

---

## OpenAPI documentation

The OpenAPI spec is available at:

- `docs/openapi.yaml`

Preview locally (Node):

```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```

---

## Project structure (important folders)

- `app/Http/Controllers/Api/`: API controllers
- `app/Http/Middleware/`: custom middleware (role checks, JSON enforcement, headers)
- `app/Http/Resources/`: API resources (response mapping)
- `app/Http/Requests/`: FormRequest validation objects
- `app/Services/`: business services
- `app/Repositories/`: data access layer
- `database/migrations/`: schema
- `database/factories/`: factories for tests
- `tests/Feature/`: feature tests

