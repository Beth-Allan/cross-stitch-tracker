# External Integrations

Every external service, storage layer, and deployment surface this app touches, and what is
deliberately absent.

## APIs & External Services

**Image Processing:**

- sharp 0.35.5 - Server-side WebP conversion and thumbnail generation
  - Used in: `src/lib/actions/upload-actions.ts` (`processAndStoreImage` — the one image
    pipeline, shared by chart covers and session photos since item P15, 2026-08-17)
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
    the Prisma CLI by `prisma.config.ts`, and so to the migration step that ends every Vercel
    build (see Deployment → Migrations)
  - ORM/client: Prisma 7.10.1 with the `@prisma/adapter-neon` 7.10.1 driver adapter
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
    verifies the stored object (`HeadObject` size for chart files, decoded format for images)
    before the key is recorded, and processes images from there
  - Download flow: server generates a presigned GET URL (1-hour expiry) for client display
  - Browser-side allowance: the CSP in `next.config.ts` permits
    `https://*.r2.cloudflarestorage.com` in `img-src` and `connect-src`. A new R2 hostname needs a
    CSP change or images silently fail to load
  - Storage keys:
    - Raw upload (all categories): `<category>/<entityId>/<nanoid>-<sanitizedName>`, where
      `<category>` is `covers`, `sessions`, or `files`. `<sanitizedName>` is reduced to
      `[A-Za-z0-9._-]` at upload time; keys written before that rule still read back, because
      `parseStorageKey` bounds the name segment rather than re-spelling it
    - Optimized image: `<category>/<entityId>/opt-<nanoid>.webp`
    - Thumbnail: `covers/<chartId>/thumb-<nanoid>.webp` — **covers only.** A chart records two
      keys (`coverImageUrl`, `coverThumbnailUrl`); a `StitchSession` records one (`photoKey`), so
      `processAndStoreImage` writes a session no thumbnail. A derivative nothing records is an
      orphan the moment it is stored and nothing can ever name it again (item P8, 2026-08-17)
    - **A saved cover always ends up under its own chart id** (item P15, 2026-08-17), because
      the derivatives are keyed by the entity rather than by where the raw upload landed. That is
      what moves a cover uploaded from the create form off `covers/unsaved/…`
  - Image optimization: raw upload → `sharp` WebP conversion → derivative(s) stored → row
    updated → **only then** is the raw object deleted. **One pipeline, both kinds of image**
    (item P15): a chart cover and a session photo run the same `processAndStoreImage`, so a cover
    is stored as a 1200px WebP plus its thumbnail instead of at full upload size. If optimization
    fails, the raw image is preserved and used as-is — the row keeps naming it, so nothing is
    deleted; a chart save reports it to the user as a warning, a session logs and moves on.
    Objects under `files/` (PDFs and other chart files) are stored as uploaded and never converted
  - **The pipeline step itself is `src/lib/actions/cover-optimization.ts`** (item P16,
    2026-08-20), deliberately without a `"use server"` directive: the save path and the backfill
    below run the same step, and exporting it from an action file would publish "re-point this
    chart's row at these keys" as an endpoint
  - **Covers saved before P15 are converted by a one-off backfill** (item P16), started from the
    Settings page and run **one chart per call** — hundreds of downloads plus two `sharp` encodes
    each cannot finish inside one request. It needs no job table: the work list is derived from
    the rows (`coverNeedsOptimizing` in `src/lib/utils/cover-keys.ts` — a cover is done when
    **both** its keys sit in the chart's own namespace, which only `processAndStoreImage`
    produces), so stopping and starting again resumes by asking the database rather than by
    remembering. A cover whose object is missing answers `Original image not found in storage`
    (`fetchImageBuffer` tells a 404 from a broken bucket via `isNotFound`) and the row is left
    exactly as it was, so a chart with a lost picture is reported rather than blanked
  - The raw key handed to `processAndStoreImage` must be **the key the entity's own row already
    records** (`Chart.coverImageUrl`, `StitchSession.photoKey`), not merely a well-formed key in
    the right namespace: every export of a `"use server"` file is a live POST endpoint, so
    without that an authenticated caller could have any object in the namespace re-encoded and
    stored under something it owns. **The save flow is fenced separately** (item P13b,
    2026-08-19): `chartFormSchema` accepts any well-formed `covers/…` key, so `createChart`,
    `createChartWithSupplies` and `updateChart` each check the submitted cover and thumbnail keys
    before their transaction — the owner segment must be `unsaved` or the chart's own id, **and**
    no other chart's row may already name the key. Both halves are needed: `CoverImageUpload` is
    never handed a chart id, so every cover the form uploads lands under `covers/unsaved/…` and
    covers saved before P15 are still live on that prefix, which the owner segment alone cannot
    tell apart from a fresh upload. Refusing `unsaved` outright is not an option — it would leak
    the raw upload of every replaced cover
  - **Object lifecycle — what removes what** (item P8, 2026-08-17):
    - `deleteChart` reads the chart's cover, thumbnail, every `ChartFile.url` and every
      `StitchSession.photoKey` **before** deleting the row, then removes them in one batched
      `DeleteObjects` per 1000 keys (`discardStoredObjects`, in `src/lib/r2.ts` rather than an
      action file — a bulk delete exported from a `"use server"` module would be a live endpoint
      taking an unbounded key list). The cascade destroys the only record of those keys, so
      reading them first is the whole game. `Project.finishPhotoUrl` is the one storage column
      left out, because nothing writes it — maintenance-ledger row
    - Saving a cover — adding one, replacing it, or taking it off the chart — removes each old
      object **only once the row has stopped naming it**. One rule covers every case, including
      the raw upload the optimized copy supersedes: on a failed optimization the row still names
      the raw upload and the form's re-submitted thumbnail key, so both stay
      (`processAndStoreImage` reports failure by returning rather than throwing, which is what
      used to make the cleanup delete a thumbnail the chart was still displaying); on removal the
      row names neither, so both go
    - Rows are deleted before objects, everywhere. The tolerated residue is an orphan, never a
      record pointing at an object that is gone
    - **Abandoned pre-save uploads are not cleaned up, by decision** (Beth, 2026-08-17). The
      chart form uploads before Save under `covers/unsaved/…` and `files/unsaved/…`; closing the
      form without saving leaves the object with nothing referencing it, and no sweep or
      lifecycle rule looks for it. A bucket-side rule on those prefixes was **not safe to switch
      on** after item P15 alone: new covers move to `covers/<chartId>/…` when the chart is saved,
      but covers saved before P15 kept their `unsaved/` key and were live. Item P16 built the
      conversion that moves the last of them off, and Beth ran it on production on 2026-08-21 — it
      finished with nothing left alone, so **the covers half of the rule is now safe** (the ledger
      row records the run). Chart **files** under `files/unsaved/…` were never moved by anything
      and still need their own answer
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

**Deployment topology** (2026-08-17, item R-1 — the 2026-08-16 ledger row asked for this to be
written down rather than assumed). All three rows are current fact as of 2026-08-17,
when the Preview environment was populated and verified.

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
- **Verified working end to end on 2026-08-17** (PR #85's preview): signed in with the production
  credentials, real chart covers rendered from the real bucket, a new cover uploaded into the scratch
  bucket, and the same chart in production still showed its original photo. Before that day no preview
  had ever been loggable-into.
- **Preview needs its own copy of every variable.** Vercel scopes environment variables per
  environment; a value set for Production only is simply absent on a preview. Until 2026-08-17 the
  Preview environment held **none** of them, and preview deployments returned HTTP 500 on
  `/api/auth/*` and could not be logged into at all. Beth populated it that day (twelve entries —
  the auth trio, the Neon branch pair, and the R2 real/scratch sets), which is what makes the table
  above fact rather than intent. **A new variable added to Production is still absent from Preview
  until it is ticked there too** — that is the standing trap, not a one-off.
- **A new bucket refuses browser uploads until it has a CORS policy.** Uploads are the only R2
  traffic the _browser_ makes — a presigned PUT via `fetch` — so they are the only path CORS governs;
  covers render through `<img src>` and chart files open through `window.open`/an anchor, neither of
  which is CORS-bound. The real bucket has carried a policy since April and a new bucket inherits
  nothing, so the scratch bucket needs its own: `AllowedOrigins: ["*"]`, `AllowedMethods:
["GET","PUT"]`, `AllowedHeaders: ["*"]`. **The wildcard origin is deliberate**, and it grants no
  access: authorization is the 10-minute presigned URL signed with the scratch credentials, and CORS
  only decides whether the browser is willing to send the request. An exact-origin list is not
  workable because every pull request gets its own preview hostname. It belongs on the **scratch
  bucket only** — the real bucket's policy is untouched by any of this. Found by testing the real
  preview on 2026-08-17, not by any gate; R2 bucket configuration is not inspectable from the repo
  (audit report §, 2026-08-17), so this is the record of it.
- **The real bucket allows exactly one origin, so the app has exactly one address.** Probed from
  outside on 2026-10-14: the real bucket answers a `PUT` preflight with 204 only for
  `https://cross-stitch-tracker-adolwyn.vercel.app`, and 403 for every other origin tried
  (`cross-stitch-tracker.vercel.app`, `localhost:3000`, other `vercel.app` variants); headers are
  not restricted. Vercel also serves production on the project's default alias
  `cross-stitch-tracker.vercel.app`, where every page works and every upload fails at the
  preflight — Beth's Safari was opening that alias, and the only symptom was "Upload failed".
  `src/lib/canonical-host.ts` now forwards the alias to the canonical origin (via
  `next.config.ts` `redirects()`), which keeps one front door instead of widening the bucket's
  list. **A new production hostname needs adding to `ALIAS_HOSTS` there**, or uploads on it fail
  the same way. Cookies are per host, so anyone who used the alias signs in once more on the
  canonical address, and a tab left open on the alias from before the redirect shipped fails its
  next action or sign-in until it is reloaded.
- **The scratch bucket needs no CSP change — but not for the reason it looks like.** The AWS SDK
  addresses R2 **virtual-hosted style** (no `forcePathStyle` is set), so the bucket is the first
  label of the hostname: a presigned URL for the scratch bucket points at
  `https://<bucket>.<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, a different host from the real
  bucket's. What covers both is that `next.config.ts` allows the **wildcard**
  `https://*.r2.cloudflarestorage.com`, which suffix-matches the extra label. **Tightening that
  wildcard to the bare account host would break images in production, not just preview** —
  verified empirically against this repo's SDK version, 2026-08-17.
- **"Write scratch" protects objects, not rows.** The split is storage-only: a preview's
  `deleteChartFile` still deletes the `ChartFile` row from whatever database it is pointed at, while
  the R2 delete lands harmlessly in scratch. With the Preview Neon branch in place that only touches
  the copy — but if Preview were ever pointed at the production database, the result would be a real
  row deleted and its real object left behind — the orphan class item P8 closed for the real
  bucket. The database half of the guarantee is D-15, not this code.
- **Nothing cleans up the scratch bucket.** Preview uploads accumulate there with no lifecycle
  rule and no orphan sweep — deliberate (a preview's leftovers are worthless), recorded so it is
  not discovered as a surprise (maintenance-ledger row, 2026-08-17).

**Migrations — how a schema change reaches each database** (item R-2, 2026-10-25; Beth's ruling
D-24, _automatic on deploy_). Before R-2 nothing applied a committed migration: every model after
March reached Neon by an out-of-band `prisma db push`.

- **The route.** A schema change is a migration committed in its PR. Every Vercel build ends by
  migrating: `vercel.json` sets the build command to `npm run build:deploy`, which is
  `npm run build` followed by `prisma/migrate-deploy.ts`, which runs `prisma migrate deploy`
  against that environment's own `DIRECT_URL`. So a PR's preview build applies the migration to
  the Neon `preview` branch, and the merge's production build applies it to production. CI and the
  pre-push hook run plain `npm run build`, which never touches a database.
- **Build first, then migrate.** A failed `next build` leaves the database alone. A migration still
  lands moments before Vercel switches traffic, so the outgoing code briefly runs against the new
  schema: every migration must be safe for the code it replaces — add before anything uses it,
  remove only once nothing reads it.
- **Each build names the database it migrates.** The runner's first line is
  `[migrate] Vercel environment "<env>" → database "<db>" at <host>`, and Prisma repeats the host.
  Preview's `DIRECT_URL` is the `preview` branch, `ep-jolly-truth…`, database
  `cross_stitch_tracker`. Production's is a separate variable (set in April) that Vercel will not
  reveal once saved, so its host is read off the first production build's log. A `DIRECT_URL`
  containing `-pooler` is refused before connecting — Prisma Migrate needs Neon's direct
  connection — and messages name the host, never the password. **And it must name the same
  database the app reads:** the runner refuses unless `DIRECT_URL` is the direct twin of
  `DATABASE_URL` (same Neon endpoint once `-pooler` is dropped, same database name). Both are
  scoped per environment, so a variable saved for the wrong environment — the way a preview would
  come to migrate production — stops the build instead. The URL checked is `prisma.config.ts`'s
  own datasource, imported, so the check and the Prisma commands cannot disagree.
- **The baseline.** The repo's one March migration (`20260328163529_…`, recorded in
  `_prisma_migrations` since 2026-03-28) describes 4 of the 18 models plus the `_ChartToGenre` join
  table; `20261026002357_baseline_db_push_era` describes the other 14. A database that already holds the app
  has it **recorded as applied, never executed**: finding tables but no baseline record, the runner
  asks Prisma whether the database matches `schema.prisma` exactly (`migrate diff --exit-code`),
  and only on "no difference" runs `migrate resolve --applied` for the baseline and any earlier
  migration missing from the record. A mismatch stops the build before anything is written — a
  drift question, never something to force. On an empty database the baseline simply runs.
  Verified 2026-10-25 against the `preview` branch: the two migrations replay to exactly what it
  holds, and to exactly `schema.prisma` (both `migrate diff` checks: no difference).
- **`20261026010000_pipeline_check` is intentionally empty** — the first migration through the
  route, so preview and production each demonstrably apply and record one.
- **A failed migration is not rolled back.** Rehearsed 2026-10-25 on a local Postgres 17: the
  statements before the error stay applied, the migration is recorded as failed, and **every later
  deploy stops** (`P3009`) until it is resolved. What Beth sees: the deploy fails in Vercel and the
  commit shows a red Vercel check, while the live site keeps serving the previous deployment —
  nothing new ships until it is recovered. Two rules follow:
  1. **Wrap every migration in `BEGIN;` … `COMMIT;`.** Rehearsed: a wrapped migration that fails
     leaves nothing behind. The exception is a statement Postgres refuses inside a transaction
     (`CREATE INDEX CONCURRENTLY`), which gets a migration of its own.
  2. **Recovery needs that database's key**: `prisma migrate resolve --rolled-back <name>`, correct
     the file (and undo any partial change, if rule 1 was skipped), deploy again. Sessions hold the
     `preview` branch's key; nobody's session holds production's (D-16, D-37), so a production
     failure is a stop-and-ask — Beth rules how it is recovered.
- **Every PR shares the one `preview` branch.** A migration applied by one PR's preview is there for
  all of them, so a PR whose migration changes after its preview ran, or is abandoned, leaves the
  branch ahead of `main`. The cure is resetting `preview` from its parent in Neon (Beth's
  dashboard), which also refreshes its data and brings production's migration record with it. A
  migration that can fail on **data** — a new uniqueness rule, a check constraint — needs that
  reset _before_ its preview runs: the branch's data dates from 2026-08-17, and a rehearsal on
  stale rows proves nothing about production's.
- **Writing a migration needs a throwaway database**, because no session has one of its own: a
  local Postgres 17 in OrbStack (`docker run -e POSTGRES_PASSWORD=… -p 55432:5432 postgres:17`),
  named by a temporary Prisma config as both `datasource.url` and `datasource.shadowDatabaseUrl`.
  `prisma migrate dev --create-only --name <name>` then writes the file without applying it.
  Prisma 7 refuses `db push --accept-data-loss` and `migrate reset` from an AI agent without the
  user's typed consent, even on a scratch database — build scratch state from migration SQL instead.

**CI Pipeline:**

- GitHub Actions — `.github/workflows/ci.yml`
  - Trigger: push to `main`, PRs targeting `main`
  - Runner: `ubuntu-24.04`; `actions/checkout@v6` + `actions/setup-node@v6` on Node 22 with npm
    caching
  - Job env: `DATABASE_URL` is set to a dummy local Postgres string — the build needs the
    variable present, and no CI step reaches a real database
  - Steps: `npm ci` → `npm run gate`. Since P14 (2026-08-20) CI invokes the gate script rather
    than re-listing its steps, so CI and the `pre-push` hook cannot drift apart
  - Concurrency: cancels in-progress runs on the same ref
- Dependabot (`.github/dependabot.yml`): weekly, Mondays, for both npm and github-actions. npm
  minor and patch bumps are grouped into one PR and major bumps are ignored for `next`, `prisma`,
  `@prisma/client`, and `next-auth` — those are upgraded deliberately, not by bot. Limit 5 open
  PRs; github-actions updates are grouped together. **There is a fifth ignore rule and it is
  broken:** it names `@base-ui-components/*`, but the installed package is `@base-ui/react`, so
  the guard on the UI primitives matches nothing (maintenance-ledger row, 2026-08-16)

**Git hooks (Husky):**

- `pre-commit` — `npx lint-staged`
- `pre-push` — `npm run gate`, the identical invocation CI runs

## Progressive Web App

- Installable: `src/app/manifest.ts` serves the web manifest (standalone display, theme
  `#059669`), with 192px and 512px icons in `public/` generated by `scripts/generate-icons.mjs`
- **No service worker is registered and no service-worker toolkit is installed.** There is no
  offline support, no runtime caching, no background sync, and no push notifications — every one
  of those would be a new integration, not a configuration change

## Environment Configuration

**Required:**

- `DATABASE_URL` - Neon pooled connection string
- `DIRECT_URL` - Neon direct connection string (Prisma CLI, migrations) — every Vercel environment
  that builds needs its own, because the build migrates the database it names
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
  bucket. **Both or neither — half a pair throws**; without them the main pair is used for both
  buckets, which then has to be able to write to the scratch bucket

**Optional, with a code-level default:**

- `STATS_TIMEZONE` - IANA timezone for stats day boundaries; defaults to `America/Edmonton`
  (`src/lib/queries/stats/timezone.ts`). An invalid value throws rather than falling back

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
