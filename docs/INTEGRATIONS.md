# External Integrations

Every external service, storage layer, and deployment surface this app touches, and what is
deliberately absent.

## APIs & External Services

**Image Processing:**

- sharp 0.35.3 - Server-side WebP conversion and thumbnail generation
  - Used in: `src/lib/actions/upload-actions.ts` (`processAndStoreImage`, `generateThumbnail`)
  - Not an external API; runs in-process on Vercel serverless functions

**Font Delivery:**

- Google Fonts (via `next/font/google`) - Fraunces, Source Sans 3, JetBrains Mono
  - Loaded at build time and self-hosted by Next.js; no runtime CDN dependency
  - Configured in: `src/app/layout.tsx`

## Data Storage

**Databases:**

- PostgreSQL via Neon (serverless)
  - Connection (pooled app): `DATABASE_URL` env var — pooler hostname (`*-pooler.neon.tech`)
  - Connection (direct CLI): `DIRECT_URL` env var — direct hostname (`*.neon.tech`), supplied to
    the Prisma CLI by `prisma.config.ts`
  - ORM/client: Prisma 7.9.1 with the `@prisma/adapter-neon` 7.9.1 driver adapter
  - Client singleton: `src/lib/db.ts` (lazy Proxy pattern; the client is not constructed until
    first property access, so module evaluation during build does not require `DATABASE_URL`)
  - Schema: `prisma/schema.prisma` (source of truth)

**File Storage:**

- Cloudflare R2 (S3-compatible object storage)
  - SDK: `@aws-sdk/client-s3` 3.1033.0 + `@aws-sdk/s3-request-presigner` 3.1033.0
  - Client: `src/lib/r2.ts` — every caller asks for a **target** (`{ client, bucket }`) rather
    than a client and a bucket name separately, because on preview deployments reads and writes
    land in different buckets:
    - `getWriteTarget()` — where every `PutObject` and `DeleteObject` goes. Synchronous
    - `getReadTarget(key)` — where that key is read from. Async: in scratch mode it costs one
      `HeadObject` against the scratch bucket, and nothing at all otherwise
    - Clients are lazy singletons (`S3Client`, `region: "auto"`, pointed at the R2 endpoint), so
      module evaluation during a build touches no credentials and prints nothing
  - Bucket: `R2_BUCKET_NAME` — **required**; a missing value throws rather than defaulting
  - Credentials: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - **Read real, write scratch** (Beth's ruling, 2026-08-17; item R-1): setting
    `R2_SCRATCH_BUCKET_NAME` puts the app in scratch mode — it still reads `R2_BUCKET_NAME`, so
    a preview shows the real images, but every object it creates or deletes goes to the scratch
    bucket instead. A delete aimed at a real key is issued against the scratch bucket, where it
    is a no-op, which is what makes a preview unable to remove a real file. Optional
    `R2_SCRATCH_ACCESS_KEY_ID` / `R2_SCRATCH_SECRET_ACCESS_KEY` let the main credential pair be
    read-only, so Cloudflare rather than this code enforces the split; without them one pair
    covers both buckets. A scratch name equal to `R2_BUCKET_NAME` throws — a deployment that
    believes it is isolated and is not is worse than one that fails loudly
  - Endpoint pattern: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
  - Upload flow: client → presigned PUT URL (10-minute expiry) → R2 directly; the server then
    confirms the upload and processes it
  - Download flow: server generates a presigned GET URL (1-hour expiry) for client display
  - Browser-side allowance: the CSP in `next.config.ts` permits
    `https://*.r2.cloudflarestorage.com` in `img-src` and `connect-src`. A new R2 hostname needs a
    CSP change or images silently fail to load
  - Storage keys:
    - Raw upload (all categories): `<category>/<entityId>/<nanoid>-<sanitizedName>`, where
      `<category>` is `covers`, `sessions`, or `files`
    - Optimized image: `<category>/<entityId>/opt-<nanoid>.webp`
    - Thumbnail: `<category>/<entityId>/thumb-<nanoid>.webp`
  - Image optimization: raw upload → `sharp` WebP conversion → optimized + thumbnail stored →
    chart row updated → **only then** is the raw object deleted. If optimization fails, the raw
    image is preserved and used as-is (`console.warn`, no user-facing error). Objects under
    `files/` (PDFs and other chart files) are stored as uploaded and never converted
  - Degradation when R2 is not configured: `src/lib/r2.ts` **throws** on a missing credential.
    The upload and download actions catch that specific error and return
    `{ success: false, error: "File storage is not configured…" }`, so uploads and downloads are
    unavailable while the rest of the app keeps working. Other R2 failures return a generic
    `{ success: false }` rather than propagating

**Caching:**

- Next.js `unstable_cache` (built-in) — used by the stats query layer
  - Tag: `"stats"` — invalidated via `revalidateTag("stats", { expire: 0 })` in the chart,
    session, and supply actions
  - TTL: 300s for the fast-moving queries (hero stats, pace, day-of-week, session history,
    designer/genre/thread insights); 3600s for the slower breakdowns (size, genre, designer,
    collection). Several modules take their `revalidate` as a computed value
  - Cache keys: `stats-hero-<userId>`, `stats-pace-<userId>`, `stats-dayofweek-<userId>`, etc.
  - Location: `src/lib/queries/stats/`. Most modules wrap their compute function with
    `unstable_cache`; `record-detection.ts`, `timezone.ts`, `utils.ts`, and `index.ts` do not —
    they are helpers and re-exports, not cached queries

## Authentication & Identity

**Auth Provider:**

- Auth.js v5 (next-auth 5.0.0-beta.32) — single-user credentials-based authentication
  - Implementation: `src/lib/auth.ts`
  - Strategy: JWT sessions (30-day maxAge)
  - Provider: `Credentials` — email + bcrypt password hash from env vars
  - Custom callbacks: `jwt` threads `user.id` into the token; `session` exposes `token.id` as
    `session.user.id`. Removing them breaks every `requireAuth()` call
  - Sign-in page: `/login` (`src/app/(auth)/login/`)
  - Route handler: `src/app/api/auth/[...nextauth]/route.ts`
  - Required env vars: `AUTH_SECRET`, `AUTH_USER_EMAIL`, `AUTH_USER_PASSWORD_HASH`
  - Bcrypt escape: `$` in the hash must be `\$` in `.env.local` (Next.js variable interpolation)

**Enforcement surfaces — there are two:**

- **`proxy.ts` (repo root)** — the app-wide fence. Next.js 16 renamed middleware to proxy; this
  file re-exports Auth.js's `auth` as `proxy`, so every request passes a session check except the
  matcher's exclusions: `api/auth`, `_next/static`, `_next/image`, `favicon.ico`, `icon-*.png`,
  `manifest.webmanifest`
- **`src/lib/auth-guard.ts`** — the per-action guard. Every server action calls `requireAuth()`,
  which rejects unless `session.user.id` exists. ESLint blocks importing `@/lib/auth` inside
  `src/lib/actions/**` so this stays the single path

**Rate limiting:**

- `src/lib/rate-limit.ts` — in-process login throttle, no external service. 5 attempts per key
  within a 30-second cooldown window, then `{ allowed: false, retryAfter }`
- The store is a module-level `Map`, so it resets on every serverless cold start and is not
  shared between instances. Adequate for a single user; a multi-user or multi-instance
  deployment would need a shared store

## Monitoring & Observability

**Error Tracking:**

- None (no Sentry, Datadog, or equivalent integrated)

**Logs:**

- `console.error` used in server actions and query modules for failure logging
- Pattern: `console.error("[stats] computeHeroStats failed:", { userId, error })` — structured
  with context
- `console.warn` for non-fatal degradation (e.g. R2 unavailable, image optimization skipped, raw
  file cleanup failed)

## CI/CD & Deployment

**Hosting:**

- Vercel — auto-deploys the `main` branch; merging to `main` is deploying
- Production URL: `https://cross-stitch-tracker-adolwyn.vercel.app`
- Pull requests get a Vercel preview deployment

**Deployment topology** (state as of 2026-08-17, item R-1 — the 2026-08-16 ledger row asked for
this to be written down rather than assumed):

| surface        | code            | database                    | R2 reads         | R2 writes                |
| -------------- | --------------- | --------------------------- | ---------------- | ------------------------ |
| local dev      | working tree    | whatever `.env.local` names | `R2_BUCKET_NAME` | same bucket              |
| Vercel Preview | the PR's branch | a Neon branch — a copy      | `R2_BUCKET_NAME` | `R2_SCRATCH_BUCKET_NAME` |
| Vercel Prod    | `main`          | the Neon production branch  | `R2_BUCKET_NAME` | same bucket              |

- **Two Vercel environments are in play:** Production (built from `main`) and Preview (one per
  pull request). There is no staging environment and no third Vercel environment.
- **Preview's shape is Beth's ruling, twice over** (2026-08-17): the database is a _copy_ — a Neon
  branch, so a click in a preview cannot edit or delete a real chart — and R2 is **read real,
  write scratch**, so a preview shows the real photos but its uploads and deletes land in the
  scratch bucket. Both decisions exist because a preview is a working app, not a screenshot.
- **Preview needs its own copy of every variable.** Vercel scopes environment variables per
  environment; a value set for Production only is simply absent on a preview. Until item R-1's
  settings half lands, the Preview environment has **none** of them, which is why preview
  deployments return HTTP 500 on `/api/auth/*` and cannot be logged into at all
  (maintenance-ledger row, 2026-08-17; verified against production, which returns 200).
- **The scratch bucket needs no CSP change.** R2 puts the bucket in the URL path, not the
  hostname, so both buckets are served from `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
  and the existing `img-src`/`connect-src` allowance already covers it.
- **Nothing cleans up the scratch bucket.** Preview uploads accumulate there with no lifecycle
  rule and no orphan sweep — deliberate (a preview's leftovers are worthless), recorded so it is
  not discovered as a surprise (maintenance-ledger row, 2026-08-17).

**CI Pipeline:**

- GitHub Actions — `.github/workflows/ci.yml`
  - Trigger: push to `main`, PRs targeting `main`
  - Runner: `ubuntu-24.04`; `actions/checkout@v6` + `actions/setup-node@v6` on Node 22 with npm
    caching
  - Job env: `DATABASE_URL` is set to a dummy local Postgres string — the build needs the
    variable present, and no CI step reaches a real database
  - Steps: `npm ci` → `npx prisma generate` → `npm run format:check` → `npm run lint` →
    `npx tsc --noEmit` → `npm test` → `npm run build`
  - Concurrency: cancels in-progress runs on the same ref
- Dependabot (`.github/dependabot.yml`): weekly, Mondays, for both npm and github-actions. npm
  minor and patch bumps are grouped into one PR and major bumps are ignored for `next`, `prisma`,
  `@prisma/client`, and `next-auth` — those are upgraded deliberately, not by bot. Limit 5 open
  PRs; github-actions updates are grouped together. **There is a fifth ignore rule and it is
  broken:** it names `@base-ui-components/*`, but the installed package is `@base-ui/react`, so
  the guard on the UI primitives matches nothing (maintenance-ledger row, 2026-08-16)

**Git hooks (Husky):**

- `pre-commit` — `npx lint-staged`
- `pre-push` — `npm run gate`, the same six steps CI runs

## Progressive Web App

- Installable: `src/app/manifest.ts` serves the web manifest (standalone display, theme
  `#059669`), with 192px and 512px icons in `public/` generated by `scripts/generate-icons.mjs`
- **No service worker is registered and no service-worker toolkit is installed.** There is no
  offline support, no runtime caching, no background sync, and no push notifications — every one
  of those would be a new integration, not a configuration change

## Environment Configuration

**Required:**

- `DATABASE_URL` - Neon pooled connection string
- `DIRECT_URL` - Neon direct connection string (Prisma CLI, migrations)
- `AUTH_SECRET` - Auth.js session encryption secret
- `AUTH_USER_EMAIL` - Single-user login email
- `AUTH_USER_PASSWORD_HASH` - Bcrypt hash (escape `$` as `\$`)

**Required for file storage** — absent, uploads and downloads degrade as described above:

- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 API token access key
- `R2_SECRET_ACCESS_KEY` - R2 API token secret

- `R2_BUCKET_NAME` - the bucket every read comes from; required since item R-1 (it previously
  defaulted to `cross-stitch-tracker` with a warning, which meant a typo silently redirected
  every presign to the wrong bucket)

**Optional — Vercel Preview only (scratch writes):**

- `R2_SCRATCH_BUCKET_NAME` - when set, all writes and deletes go here instead of
  `R2_BUCKET_NAME`. Unset in Production and locally
- `R2_SCRATCH_ACCESS_KEY_ID`, `R2_SCRATCH_SECRET_ACCESS_KEY` - credentials for the scratch
  bucket. Both or neither; without them the main pair is used for both buckets

**Optional, with a code-level default:**

- `STATS_TIMEZONE` - IANA timezone for stats day boundaries; defaults to `America/Edmonton`
  (`src/lib/queries/stats/timezone.ts`). An invalid value throws rather than falling back

**Declared but dead:**

- `NEXT_PUBLIC_APP_URL` is in `.env.example` and is read nowhere — not in `src/`, `next.config.ts`
  or `proxy.ts`. Setting it does nothing (maintenance-ledger row, 2026-08-16)

**Secrets location:**

- `.env.local` (development) — gitignored
- `.env.production.local` — gitignored
- Vercel environment variable dashboard — **scoped per environment**: Production and Preview each
  hold their own copy, and the scratch-bucket variables belong to Preview alone
- Reference template: `.env.example` (committed, no real values)

## Webhooks & Callbacks

**Incoming:**

- None (no external service pushes events to this app)

**Outgoing:**

- None (no webhooks sent to external services)
