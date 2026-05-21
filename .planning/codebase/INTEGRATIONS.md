# External Integrations

**Analysis Date:** 2026-05-20

## APIs & External Services

**Image Processing:**
- sharp 0.34.5 - Server-side WebP conversion and thumbnail generation
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
  - Connection (direct CLI): `DIRECT_URL` env var — direct hostname (`*.neon.tech`)
  - Two Neon branches maintained: dev and production (both receive schema pushes)
  - ORM/client: Prisma 7.7.0 with `@prisma/adapter-neon` 7.7.0 adapter
  - Client singleton: `src/lib/db.ts` (lazy Proxy pattern to defer connection until first use)
  - Schema: `prisma/schema.prisma` (source of truth)

**File Storage:**
- Cloudflare R2 (S3-compatible object storage)
  - SDK: `@aws-sdk/client-s3` 3.1033.0 + `@aws-sdk/s3-request-presigner` 3.1033.0
  - Client: `src/lib/r2.ts` — lazy singleton `getR2Client()` using S3Client pointed at R2 endpoint
  - Bucket: configured via `R2_BUCKET_NAME` (defaults to `"cross-stitch-tracker"`)
  - Auth: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - Endpoint pattern: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
  - Upload flow: client → presigned PUT URL (10-min expiry) → R2 directly; server confirms and processes
  - Download flow: server generates presigned GET URL (1-hour expiry) for client display
  - Image optimization: raw upload → `sharp` WebP conversion → optimized + thumbnail stored; raw deleted
  - Storage keys:
    - Cover images: `covers/<chartId>/opt-<nanoid>.webp`
    - Thumbnails: `covers/<chartId>/thumb-<nanoid>.webp`
    - Session photos: `sessions/<projectId>/opt-<nanoid>.webp`
    - Chart files (PDFs, etc.): `files/<projectId>/<nanoid>-<sanitizedName>`
  - Graceful degradation: R2 errors return `{ success: false }` rather than crashing; upload features disabled with user-facing message when unconfigured

**Caching:**
- Next.js `unstable_cache` (built-in) - Used for all stats queries
  - Tag: `"stats"` — invalidated via `revalidateTag("stats", { expire: 0 })` on mutations
  - TTL: 300s for hero stats; longer TTLs (up to 3600s) for breakdown queries
  - Cache keys: `stats-hero-<userId>`, `stats-pace-<userId>`, `stats-dayofweek-<userId>`, etc.
  - Usage: `src/lib/queries/stats/` — every query module wraps its compute function with `unstable_cache`

## Authentication & Identity

**Auth Provider:**
- Auth.js v5 (next-auth 5.0.0-beta.30) — single-user credentials-based authentication
  - Implementation: `src/lib/auth.ts`
  - Strategy: JWT sessions (30-day maxAge)
  - Provider: `Credentials` — email + bcrypt password hash from env vars
  - Custom callbacks: `jwt` threads `user.id` into token; `session` exposes `token.id` as `session.user.id`
  - Auth guard: `src/lib/auth-guard.ts` — all server actions import `requireAuth()` from here (ESLint enforced)
  - Sign-in page: `/login` (`src/app/(auth)/login/`)
  - Route handler: `src/app/api/auth/[...nextauth]/route.ts`
  - Required env vars: `AUTH_SECRET`, `AUTH_USER_EMAIL`, `AUTH_USER_PASSWORD_HASH`
  - Bcrypt escape: `$` in hash must be `\$` in `.env.local` (Next.js variable interpolation)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, or equivalent integrated)

**Logs:**
- `console.error` used in server actions and query modules for failure logging
- Pattern: `console.error("[stats] computeHeroStats failed:", { userId, error })` — structured with context
- `console.warn` for non-fatal degradation (e.g., R2 unavailable, image optimization skipped)

## CI/CD & Deployment

**Hosting:**
- Vercel — linked project (`.vercel/project.json`); auto-deploys `main` branch
- Production URL: `https://cross-stitch-tracker-adolwyn.vercel.app`

**CI Pipeline:**
- GitHub Actions — `.github/workflows/ci.yml`
  - Trigger: push to `main`, PRs targeting `main`
  - Runner: `ubuntu-24.04`
  - Steps: `npm ci` → `prisma generate` → format check → lint → test → build
  - Concurrency: cancels in-progress runs on same ref
- Dependabot: configured (`.github/dependabot.yml`)

**Pre-push hook:**
- `npm run build` — full build runs locally before every push (via Husky `pre-push`)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Neon pooled connection string
- `DIRECT_URL` - Neon direct connection string (Prisma CLI migrations)
- `AUTH_SECRET` - Auth.js session encryption secret
- `AUTH_USER_EMAIL` - Single-user login email
- `AUTH_USER_PASSWORD_HASH` - Bcrypt hash (escape `$` as `\$`)
- `NEXT_PUBLIC_APP_URL` - Public app base URL
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 API token access key
- `R2_SECRET_ACCESS_KEY` - R2 API token secret
- `R2_BUCKET_NAME` - R2 bucket name (defaults to `cross-stitch-tracker`)
- `STATS_TIMEZONE` - IANA timezone for user stats (e.g., `America/Edmonton`)

**Secrets location:**
- `.env.local` (development) — gitignored
- `.env.production.local` — gitignored
- Vercel environment variable dashboard (production secrets)
- Reference template: `.env.example` (committed, no real values)

## Webhooks & Callbacks

**Incoming:**
- None (no external service pushes events to this app)

**Outgoing:**
- None (no webhooks sent to external services)

---

*Integration audit: 2026-05-20*
