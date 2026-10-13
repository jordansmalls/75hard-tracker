# 75 Hard

A mobile-first, iOS-style helper for the 75 Hard challenge, built on the [Prism](https://github.com/jordansmalls/prism) Next.js + Laravel starter kit.

- **Today:** check off the seven daily tasks (10 pages, progress picture, a gallon of water, two workouts, diet, no alcohol), see today's progress ring and how many days are left
- **Water:** log ounces through the day with quick-add buttons. Reaching 128 oz checks off the gallon
- **Reading:** log the book and how many pages you read. Insights use the real page counts and list your books
- **Progress photos:** take or upload the day's photo right from the task. The Photos tab has a Day 1 vs latest comparison slider and a grid of every day. Photos are resized in the browser and stored privately
- **Your 75:** all 75 days as circles that fill in with a check when a day is complete. Tap any past day to review it or log something you forgot
- **Missed days:** a day left unfinished is flagged, with the choice to fill it in or start over at Day 1 (restarts count as attempts)
- **Insights:** pages read, gallons drunk, workouts and hours trained, current and best streak, perfect-day rate, progress photos, average reading time with an hour-by-hour chart, average check-off time per task, which task you do first and save for last, when your day usually wraps up, and tasks per day
- Starting mid-challenge? Pick your real Day 1 and mark the earlier days complete
- Installable: add it to your home screen for a full-screen, app-like experience

Time-of-day stats only use tasks checked off on the day they were done, in the challenge's timezone.

**Demo data:** `php artisan db:seed --class=DemoSeeder` creates `demo@example.com` / `password`, 18 days into a challenge, with water and reading logs and placeholder photos.

### Built on Prism

Sign up, sign in, email verification, password reset and account settings all come from the starter kit.

| Layer | Stack |
| --- | --- |
| API | Laravel 13, PHP 8.3+, Sanctum (SPA cookie auth), PostgreSQL, Pest |
| Web | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Data & forms | TanStack Query v5, React Hook Form, Zod 4 |
| UI | Tailwind CSS 4, shadcn/ui (Base UI), Sonner, lucide |
| Tooling | Pint, ESLint, Prettier, Vitest, GitHub Actions, Laravel Boost |

```
api/      Laravel API      → http://localhost:8000
web/      Next.js app      → http://localhost:3000
landing/  static landing page (see landing/README.md)
docker/   init scripts for the optional Docker services
```

## Getting started

### Prerequisites

- PHP 8.3+ with the `pdo_pgsql` extension, and [Composer](https://getcomposer.org)
- Node.js 22+ and [pnpm](https://pnpm.io)
- PostgreSQL 14+, **or** Docker to run the included `docker-compose.yml`

### 1. Get the code

Clone this repository and move into it:

```bash
git clone https://github.com/jordansmalls/75hard-tracker 75-hard
cd 75-hard
```

### 2. Start the database

**With Docker (easiest):**

```bash
docker compose up -d
```

This starts Postgres 17 with the `hard75` and `hard75_test` databases, plus [Mailpit](https://mailpit.axllent.org) to catch outgoing email. The default credentials (`postgres` / `postgres`) already match `api/.env.example`.

**With your own Postgres** (Homebrew, Herd, Postgres.app, etc.):

```bash
createdb hard75
createdb hard75_test
```

### 3. Set up the API

```bash
cd api
cp .env.example .env
```

If you're using your own Postgres, set `DB_USERNAME` and `DB_PASSWORD` in `api/.env` now. Then run:

```bash
composer setup    # installs dependencies, generates APP_KEY, runs migrations
```

### 4. Set up the web app

```bash
cd ../web
pnpm install
cp .env.example .env.local
```

### 5. Run it

```bash
cd ../api
composer dev
```

This one command starts the Laravel server, a queue worker, the log viewer and the Next.js dev server. Open **http://localhost:3000** and create an account.

### Where do the emails go?

By default, verification and password reset emails are written to `api/storage/logs/laravel.log`. Open that file and copy the link to finish the flow.

If you started Mailpit with Docker, you can view them in a real inbox at http://localhost:8025 instead. Set these values in `api/.env`:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
```

For production, point the `MAIL_*` settings at an SMTP server or a provider such as Resend, Postmark or SES.

## Testing

```bash
# API
cd api
php artisan test        # Pest feature tests (uses the hard75_test database)
vendor/bin/pint         # format PHP

# Web
cd web
pnpm test               # Vitest unit tests
pnpm lint && pnpm typecheck && pnpm format:check && pnpm build
```

CI (`.github/workflows/ci.yml`) runs all of these on every push and pull request, using a Postgres service container.

## How authentication works

The API uses **Sanctum's SPA authentication**: an HTTP-only session cookie plus CSRF protection.

By default the browser only talks to Next.js. `web/next.config.ts` forwards `/api/*` and `/sanctum/*` to Laravel. This means:

- session cookies belong to the frontend's domain;
- there's no CORS to configure;
- the frontend and API can live on unrelated domains (for example Vercel + Laravel Cloud).

The API client (`web/src/lib/api/client.ts`) fetches `/sanctum/csrf-cookie` before the first request that changes data and sends the `X-XSRF-TOKEN` header. If it gets a `419`, it refreshes the token and retries once.

**Calling the API directly instead** (for example `app.example.com` → `api.example.com`): set `NEXT_PUBLIC_API_URL` in `web`. In `api`, set `SESSION_DOMAIN=.example.com`, `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`. CORS is already configured from `FRONTEND_URL`.

### Email verification and password reset

Both flows use Laravel's built-in notifications. The links in the emails point to the Next.js app, which then calls the API.

- **Verification:** signing up or changing your email sends a signed link to `/verify-email/{id}/{hash}`. The link expires after 60 minutes and doesn't need a session, so it works on any device. Unverified users can still use the app and see a banner. To require verification for a route, add Laravel's `verified` middleware to it.
- **Password reset:** `/forgot-password` sends a link to `/reset-password?token=…&email=…`. The response is the same whether or not the account exists. Tokens expire after 60 minutes. A successful reset signs out the user's other sessions and marks their email as verified.

### Route protection

`<AuthGuard requirement="guest" | "onboarding" | "user">` (in `web/src/components/auth/auth-guard.tsx`) wraps each route group's layout. It handles every auth redirect, based on the cached `/me` query:

| Route group | Requirement | Redirects |
| --- | --- | --- |
| `(guest)`: login, register, forgot/reset password | `guest` | signed in → `?next=` or dashboard; no username → onboarding |
| `onboarding/` | `onboarding` | guest → login; has username → dashboard |
| `(app)`: dashboard, settings, your features | `user` | guest → `login?next=…`; no username → onboarding |

Signing in, signing out and onboarding only update the `me` cache, and the guard does the redirecting, so forms never navigate on their own. A `401` from any request marks the user as signed out, so an expired session redirects automatically.

The guard only controls what the user sees. **The API checks auth on every request.** Use the `onboarded` middleware on API routes that require a username.

## API reference

All routes are under `/api/v1` and return JSON. Resources are wrapped in `data`. Validation errors use Laravel's standard `422 { message, errors }` shape.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/sanctum/csrf-cookie` | – | Sets the `XSRF-TOKEN` cookie |
| POST | `/auth/register` | – | `{ email, password, password_confirmation, name? }` → `201` user, signed in |
| POST | `/auth/login` | – | `{ login (email or username), password, remember? }` → user |
| POST | `/auth/logout` | – | `204`, safe to call when signed out |
| POST | `/auth/forgot-password` | – | `{ email }`. Same response whether or not the account exists |
| POST | `/auth/reset-password` | – | `{ token, email, password, password_confirmation }` |
| POST | `/auth/email/verify/{id}/{hash}?expires&signature` | signed URL | Verifies the email; no session needed |
| POST | `/auth/email/verification-notification` | ✓ | Resends the verification email |
| GET | `/availability/email?email=` | – | `{ available, reason: null \| "taken" }` |
| GET | `/availability/username?username=` | – | `{ available, reason: null \| "taken" \| "reserved" }` |
| GET | `/me` | ✓ | Current user |
| PATCH | `/me` | ✓ | `{ name?, email? }`. Changing the email resets verification |
| PUT | `/me/username` | ✓ | `{ username }`. Completes onboarding |
| PUT | `/me/password` | ✓ | `{ current_password, password, password_confirmation }`. Signs out other sessions |
| DELETE | `/me` | ✓ | `{ password }`. Deletes the account |
| GET | `/challenge` | ✓ | The current challenge with its check-ins, or `data: null` |
| POST | `/challenges` | ✓ | `{ started_on, timezone, backfill? }`. Starts a challenge; any active one becomes a restart |
| PUT | `/challenge/check-ins` | ✓ | `{ date, task, done }`. Checks a task off (or unchecks it) for a day |
| PATCH | `/challenge/days/{date}` | ✓ | `{ water_oz?, pages?, book_title? }`. 128 oz checks off water; pages check off reading |
| POST | `/challenge/photos` | ✓ | Multipart `date`, `photo`, `thumbnail`. Replaces that day's photo and checks off the photo task |
| GET | `/challenge/photos/{id}` | ✓ | The photo (`?size=thumb` for the thumbnail), owner only |
| DELETE | `/challenge/photos/{id}` | ✓ | Deletes a photo and its files |
| GET | `/up` | – | Health check |

The availability endpoints return `422` for malformed input. They treat the signed-in user's own email and username as available.

**Rules** (`api/config/usernames.php`, mirrored in `web/src/features/auth/schemas.ts`): usernames are 3–30 characters of lowercase letters, numbers and single underscores. They must start with a letter, can't end with `_`, and can't be a reserved name. Emails and usernames are stored lowercase, so uniqueness is case-insensitive.

**Rate limits** (`AppServiceProvider`): 5 failed logins per login + IP; auth endpoints 10/min per IP; availability 60/min; verification 6/min; everything else 120/min.

## Project layout

```
api/app/
  Http/Controllers/Api/V1/{Auth,Account}/    thin controllers
  Http/Requests/{Auth,Account,Availability}/ validation + input normalization
  Http/Resources/UserResource.php            the user JSON shape
  Http/Middleware/                           ForceJsonResponse, EnsureUsernameIsSet (`onboarded`)
  Rules/Username.php                         username format rule
  Providers/AppServiceProvider.php           password/email rules, rate limits, email link URLs
api/routes/api.php                           versioned routes
api/tests/Feature/                           Pest tests (run against Postgres)

web/src/
  app/(guest) app/onboarding app/(app)       route groups, each with an AuthGuard layout
  features/auth/      api.ts, queries.ts (TanStack hooks), schemas.ts (Zod), components/
  features/account/   profile/username/password/delete + availability hook
  lib/api/            fetch client (CSRF, errors), shared types
  lib/forms.ts        maps Laravel 422s onto React Hook Form fields
  components/         ui/ (shadcn), forms/, layout/, auth/
```

## Adding a feature

1. **API:** run `php artisan make:model Post -mf`, then add a Form Request, an API Resource and a controller under `Api/V1`. Register the routes inside the `auth:sanctum` → `onboarded` group in `routes/api.php`, and add a Pest feature test.
2. **Web:** create `src/features/posts/` with `api.ts` (calls via `api.get/post`), `queries.ts` (query key factory + `useQuery`/`useMutation` hooks), `schemas.ts` (Zod) and `components/`.
3. Add pages under `src/app/(app)/posts/` so they inherit the auth guard. Pages under a guarded layout should `export const instant = false;`, because the guard holds rendering until the session check finishes.
4. Use `useUser()` inside `(app)` pages to get the signed-in user, and call `applyServerErrors(form, error)` in form error handlers.

`switchSessionUser()` clears every non-auth query on sign in and sign out, so one account's data never shows up for another.

### Working with AI coding agents

The `AGENTS.md` files at the root, in `api/` and in `web/` describe this project's conventions for coding agents. `CLAUDE.md` points Claude Code at them. The `api/` folder also includes [Laravel Boost](https://github.com/laravel/boost) guidelines and skills.

## Deploying

- **API:** set `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, `FRONTEND_URL=https://your-app` and `SANCTUM_STATEFUL_DOMAINS=your-app-host`. In production, passwords are also checked against known data breaches (`uncompromised()`).
- **Web:** set `API_URL` to the API's origin as seen from the Next.js server.
- **Client IPs and rate limiting:** Laravel sees requests coming from the Next.js server, so set `TRUSTED_PROXIES` to that server's IP or CIDR (or `*` if the API is only reachable through it). Run Next.js behind a platform or load balancer that sets `X-Forwarded-For` (Vercel, Cloudflare, AWS ALB, etc.). On its own, Next.js passes through whatever `X-Forwarded-For` header the client sends, which would let clients fake their IP to get around rate limits.

## License

Open-source under the [MIT license](LICENSE), which covers the Prism starter kit this is built on.
