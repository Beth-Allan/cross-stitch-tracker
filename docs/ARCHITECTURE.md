# Architecture

> Patterns, layers, data flow, abstractions, entry points. Convention detail lives in
> `.claude/rules/`, which loads into every session — cited here, never restated.

## System Pattern

Next.js 16 App Router monolith with Server Components → Server Actions → Prisma (Neon PostgreSQL) + Cloudflare R2 object storage. Single-user auth via Auth.js v5 JWT strategy.

```
Browser
  → proxy.ts (Auth.js session gate, runs before routing)
    → App Router (Server Components)
      → Server Actions / Stats Queries
        → Prisma (Neon PostgreSQL)
        → S3Client (Cloudflare R2)
      → Client Components (props down, actions up)
```

## Architectural Layers

### Layer 0: Auth Edge (`proxy.ts`)

Root-level `proxy.ts` is Next.js 16's rename of middleware. It re-exports Auth.js's `auth` as `proxy`; the matcher excludes `api/auth`, `_next/static`, `_next/image`, `favicon.ico`, `icon-*.png`, and `manifest.webmanifest`. Every other request passes the session check here **before** routing. The `(dashboard)` layout's `redirect("/login")` is the second gate, not the only one.

**Two parts, and both are load-bearing.** The matcher decides which requests reach the fence; the `authorized` callback in `src/lib/auth.ts` decides what the fence does with them — public paths (`/login`) pass, everything else needs `auth.user.id` — the same predicate `requireAuth()` enforces — and an unauthorized request is redirected to the sign-in page. Without that callback Auth.js defaults `authorized` to `true`, so the middleware fetches the session and discards the answer and every route passes (the state this file described until item P1, 2026-08-17). Anything added to the matcher's exclusion list, or to the callback's public set, is unauthenticated from then on.

**The fence does not protect server actions, and cannot.** App Router action ids are global: a POST carrying any action's id executes it, including at `/login`, which the fence lets through by definition. `requireAuth()` inside every action is what protects mutations — the fence protects _pages_.

### Layer 1: Routing / Pages (`src/app/`)

Two route groups plus an API segment:

| Group         | Purpose               | Layout                                 |
| ------------- | --------------------- | -------------------------------------- |
| `(auth)`      | Login page            | Bare, no shell                         |
| `(dashboard)` | All app pages         | Auth-gated AppShell (sidebar + topbar) |
| `api/`        | NextAuth handler only | None                                   |

Pages are async Server Components. They fetch all data eagerly via `Promise.all()` or `Promise.allSettled()`, then pass data as props to client components. **A page that guards a fetch degrades to `null`, never to `[]` or a zero** — the client component then renders `DataUnavailable` for that panel instead of an empty state that would read as "you have none" (item P6).

Key routes:

- `/` — Dashboard (library + progress tabs)
- `/charts` — Pattern Dive (browse + what's next + series + fabric + storage tabs)
- `/charts/[id]` — Project detail (overview + supplies + sessions tabs; the chart file list renders inside the overview tab)
- `/charts/new`, `/charts/[id]/edit` — Chart create/edit forms
- `/series`, `/series/[id]` — Series list + detail
- `/designers`, `/genres`, `/fabric`, `/storage`, `/apps` — Reference data CRUD
- `/supplies`, `/supplies/brands` — Supply catalog
- `/sessions` — Session log
- `/stats` — Statistics (overview + activity + records)
- `/shopping` — Shopping list
- `/settings` — `PlaceholderPage` stub; the only route without an implementation

Twelve routes carry their own `loading.tsx` skeleton alongside the group-level one.

### Layer 2: Shell (`src/components/shell/`)

- `app-shell.tsx` — Sidebar + topbar wrapper
- `sidebar.tsx`, `top-bar.tsx`, `nav-item-link.tsx` — Navigation chrome
- `nav-items.ts` — Three sections plus a pinned settings item: **Projects** (Dashboard, Pattern Dive, Shopping, Series) · **Track** (Sessions, Statistics) · **Reference** (Designers, Genres, Supplies, Fabric, Storage, Apps).
- `logo.tsx`, `theme-toggle.tsx`, `user-menu.tsx`
- `logout-action.ts` — Logout server action

### Layer 3: Feature Components (`src/components/features/`)

Fifteen domain-scoped directories. Most are `"use client"` for interactivity.

- `charts/` — Chart form, Pattern Dive tab contents (what's next, series, fabric requirements, storage view), status controls, badges
- `charts/form-primitives/` — Reusable form sub-components (upload, calculator, genre picker)
- `charts/project-detail/` — Multi-tab detail view, hero, focal-point editor, chart file list
- `series/` — Series list, card, detail, form modal, sort
- `dashboard/` — Dashboard tabs, stats sidebar, spotlight, buried treasures
- `gallery/` — Gallery card, filter bar, sort/filter logic (search, status, size, series)
- `stats/` — Stats page shell, overview/activity/records sections
- `supplies/` — Supply catalog with grid and table views, supply and brand form modals
- `supply-table/` — Reusable tabular supply editor (threads, beads, specialty); `index.ts` is its declared public API
- `shopping/` — Shopping list with aggregation, project filtering
- `shared/` — Components used by more than one feature directory
- `designers/`, `fabric/`, `genres/`, `sessions/`, `storage/`, `apps/`

Also directly under `src/components/`: `hooks/` (component-level hooks owned by no single feature), `theme-provider.tsx`, `placeholder-page.tsx`.

### Layer 4: UI Primitives (`src/components/ui/`)

Shadcn/Base UI component wrappers. No business logic. Key files:

- `button.tsx`, `button-variants.ts` — CVA variants extracted to a non-client file so Server Components can import them
- `link-button.tsx` — Replaces the `Button render={<Link>}` pattern
- `dialog.tsx`, `sheet.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `command.tsx`, `tooltip.tsx`, `table.tsx`, `tabs.tsx`, `select.tsx`, `badge.tsx`, `card.tsx`
- `chart.tsx` — Recharts wrapper
- `empty-state.tsx`, `error-card.tsx`, `data-unavailable.tsx` — Shared zero/failure states; `DataUnavailable` is the per-panel "couldn't load" card

### Layer 5: Server Actions (`src/lib/actions/`)

Eighteen files, each starting with `"use server"`, one per domain. Pattern: `requireAuth()` → Zod validation → Prisma mutation → `revalidatePath()` / `revalidateTag("stats", { expire: 0 })` — the Next 16 two-argument form.

Key files:

- `chart-actions.ts` — Chart CRUD + gallery/detail queries
- `series-actions.ts` — Series CRUD plus `getSeriesWithStats()` and `getSeriesDetail()`
- `upload-actions.ts` — Presigned URL generation, image processing, R2 delete
- `session-actions.ts` — StitchSession CRUD, progress recalculation
- `supply-actions.ts` — Thread/bead/specialty supply mutations
- `dashboard-actions.ts` — Dashboard data aggregation
- `stats-actions.ts` — Delegating wrapper for calendar/session stats
- `shopping-cart-actions.ts` — Shopping list mutations
- Plus: `designer-actions.ts`, `genre-actions.ts`, `fabric-actions.ts`, `chart-file-actions.ts`, `storage-location-actions.ts`, `stitching-app-actions.ts`, `focal-point-actions.ts`, `pattern-dive-actions.ts`, `project-dashboard-actions.ts`

### Layer 6: Stats Query Layer (`src/lib/queries/stats/`)

Nineteen query files plus a barrel and a shared helper module. Pure async functions querying Prisma — not server actions, called from pages and actions. Most export a single function; `completion-estimates.ts` exports two and `timezone.ts` four.

Caching: `unstable_cache` keyed per user, tagged `"stats"`, invalidated by `revalidateTag("stats", { expire: 0 })` from any mutation that moves a statistic. TTL varies by volatility and is named, never numeric — `STATS_CACHE_VOLATILE` (300s) for activity-derived queries, `STATS_CACHE_STABLE` (3600s) for the four collection-shape breakdowns (`collection`, `size`, `designer`, `genre`); the six period-scoped queries pick between them per call (`isCurrentPeriod ? VOLATILE : STABLE`). Both constants and the rule for choosing live in `stats/utils.ts`. `timezone.ts` and `record-detection.ts` are uncached.

- `index.ts` — Barrel re-exporting 20 functions. Not exhaustive by design: `record-detection.ts` stays off it entirely and `completion-estimates.ts` puts only one of its two exports on it; both are imported by path instead — from `session-actions.ts` and `charts/[id]/page.tsx` respectively.
- `hero-stats.ts` — Today/week/month/year/lifetime aggregates
- `timezone.ts` — IANA timezone resolution, today's calendar date, the current year/month period, and day boundaries (see "Calendar dates")
- Plus: `completion-estimates.ts`, `pace-metrics.ts`, `personal-bests.ts`, `record-detection.ts`, `calendar-days.ts`, `session-history.ts`, `monthly-totals.ts`, `daily-breakdown.ts`, `day-of-week.ts`, `fastest-completions.ts`, `thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts`, `collection-breakdown.ts`, `size-breakdown.ts`, `designer-breakdown.ts`, `genre-breakdown.ts`, `available-years.ts`
- `utils.ts` — Shared `buildDateFilter()`, `monthBounds()` and the `Scope` type

### Layer 7: Database

- `prisma/schema.prisma` — PostgreSQL via Neon, source of truth. 18 models and 3 enums, including `Series` (unique `name`, optional `totalCount`, optional `Designer` relation) with `Chart.seriesId` as the FK.
- `prisma.config.ts` — Prisma 7 config: schema path, migrations path, seed command, and the `DIRECT_URL` datasource
- `src/lib/db.ts` — Lazy singleton Prisma client via `Proxy` + `globalThis` (survives hot-reload)
- `src/generated/prisma/` — Generated client (auto-generated, never edit)
- `prisma/seed.ts` + `prisma/fixtures/` — Seeding

### Layer 8: Object Storage (R2)

- `src/lib/r2.ts` — Lazy S3Client singleton pointing to Cloudflare R2
- Accessed exclusively through `upload-actions.ts` and `chart-file-actions.ts`
- DB stores R2 object keys (not URLs); presigned URLs generated at render time via `getPresignedImageUrls()`

### Layer 9: Auth

- `proxy.ts` — The edge gate (Layer 0); the matcher only, with the decision in `auth.ts`'s `authorized` callback
- `src/lib/auth.ts` — NextAuth v5 config; single-user credentials from env vars; JWT strategy, 30-day session; `jwt`/`session` callbacks thread `user.id` through; `authorized` is the outer fence's decision; `authorizeCredentials` is the one point both login entry paths pass through, so it carries the rate limit and rejects a missing or mangled `AUTH_USER_*` by throwing rather than reporting bad credentials
- `src/lib/auth-guard.ts` — `requireAuth()`: single enforcement function called by every server action
- `src/lib/rate-limit.ts` — In-memory rate limiter (5 attempts, 30s cooldown). `recordAttempt()` enforces and is called only from `authorizeCredentials`; `peekRateLimit()` reads without consuming, so the login form can name the wait

### Layer 10: Validations (`src/lib/validations/`)

Zod schemas by domain (`auth`, `chart`, `fabric`, `focal-point`, `series`, `session`, `storage`, `supply`, `upload`). Shared between actions (server) and form hooks (client). `upload.ts` also owns the allowed MIME/extension lists, the 50MB cap, and the image-optimization constants.

### Layer 11: Domain Types (`src/types/`)

TypeScript interface/type files; no runtime code. Composed from Prisma-generated types using intersection, `Pick`, and `&`. One file per domain: `chart`, `dashboard`, `designer`, `fabric`, `focal-point`, `genre`, `series`, `session`, `shopping`, `stats`, `storage`, `supply`.

### Layer 12: Utilities (`src/lib/utils/`)

Pure functions, no side effects: `calendar-date.ts`, `skein-calculator.ts`, `fabric-calculator.ts`, `size-category.ts`, `status.ts`, `status-groups.ts`, `series-progress.ts`, `progress.ts`, `settled.ts`, `focal-point.ts`, `format-file-size.ts`, `format-time.ts`, `natural-sort.ts`.

`src/lib/constants.ts` holds literals shared across modules that belong to no single utility.

## Calendar dates

Some dates in this app are **calendar dates**, not moments: `StitchSession.date` and a project's
`startDate` / `finishDate` / `ffoDate`. Both are read and displayed under this convention;
`StitchSession.date` is also _written_ under it, while the project dates are still stored through a
looser `Date.parse` path (maintenance-ledger row, 2026-08-17). Beth picks them from a `type="date"` input; they carry no
time and belong to no timezone. Everything else that is a `DateTime` (`createdAt`, `updatedAt`,
`dateAdded`) is a real instant and is _not_ covered by this convention.

**The convention: a calendar date is stored as the UTC-midnight instant of that date, and every
date part is read back in UTC.** `src/lib/utils/calendar-date.ts` is the only implementation —
`parseCalendarDate` on the way in, `toCalendarDate` on the way out, `formatCalendarDate` for
display (it forces `timeZone: "UTC"`, so the viewer's own zone cannot shift a stored date).
Calendar arithmetic — `addCalendarDays`, `daysBetweenCalendarDates`, `startOfCalendarWeek` /
`Month` / `Year` — works on `YYYY-MM-DD` strings, which makes daylight saving structurally unable
to reach it.

**"Now" is the one genuine instant**, and it is the only place a timezone belongs. `getTodayCalendarDate(tz)`
resolves it into the user's calendar date and `getCurrentPeriod(tz)` into their year and month
(`src/lib/queries/stats/timezone.ts`, timezone from `STATS_TIMEZONE`, default `America/Edmonton`).
Every "today", "this month", "current year" — including the cache-TTL predicates that decide
whether a period is still live — starts there, never from the server clock.

Two rules follow, and breaking either reintroduces the off-by-one this convention was written to
kill (a session logged the 1st counting in the previous month, streaks shifting, the browser
showing yesterday):

- **Never read a stored calendar date in a local timezone.** No `new TZDate(session.date, tz)`, no
  `toLocaleDateString` without `timeZone: "UTC"`, no `getMonth()`/`getDay()` where `getUTCMonth()`/
  `getUTCDay()` is meant.
- **Query boundaries are calendar boundaries.** A month filter runs from the UTC midnight that
  stores the 1st (`monthBounds` in `queries/stats/utils.ts`), a year filter from the one that
  stores January 1st (`buildDateFilter`), and an N-day rolling window is the N calendar days
  ending today.

## Data Flow Patterns

### Page Renders

1. Page function is `async`; the session is already gated by `proxy.ts`, and pages call `requireAuth()` when they need `user.id`
2. Independent data fetches batched with `Promise.all()` (or `Promise.allSettled()` for stats)
3. R2 image keys collected, resolved in one batch call to `getPresignedImageUrls()`
4. Data + `imageUrls: Record<string, string>` passed as props to top-level client component

### Mutations (Server Actions)

1. `requireAuth()` — throws if no session
2. `schema.parse(input)` — Zod validation
3. Ownership check — **direct where the model carries a `userId`, transitive where it does not.** Three models carry one: `Project`, `StitchingApp`, `StorageLocation`; those get `prisma.X.findUnique({ where: { id }, select: { userId: true } })` before the write. Models that hang off a project are checked **through** it — `chart-actions.ts` selects `{ project: { select: { userId: true } } }` before deleting a chart or changing its status, `chart-file-actions.ts` checks `file.chart.project?.userId` on every mutation, and `fabric-actions.ts` verifies a linked fabric's project. Genuinely global, because this is a single-user app with one collection: designers, genres, series, threads, beads, specialty items and brands. **Fabric is the boundary case** — `linkedProjectId` is nullable, so an unlinked fabric has no ownership path at all and is queried as `OR: [{ linkedProjectId: null }, { linkedProject: { userId } }]`.
4. Prisma write (often inside `$transaction`)
5. `revalidatePath()` / `revalidateTag("stats", { expire: 0 })` — the Next 16 two-argument form
6. Return `{ success: true, ... }` or `{ success: false, error: string }`

### File Uploads (presigned PUT, verified on commit)

1. Client → Server Action (`getPresignedUploadUrl`): Zod-parses the request, sanitizes the filename into the key, returns a presigned PUT URL (10-min expiry)
2. Client → R2 directly: `fetch(url, { method: "PUT", body: file })` — bytes never touch Next.js server
3. Client → the action that owns the entity (`addChartFile`, or the chart/session form): ownership is checked, then **the stored object is verified before the key becomes durable**

Step 1 constrains nothing about the bytes. A presigned PUT signs method, bucket, key and expiry; `content-type` is unsignable and the payload hash is `UNSIGNED_PAYLOAD`, so the size and type declared in step 1 are claims. Enforcement is therefore in step 3, against what R2 actually holds: `HeadObject`'s `ContentLength` for chart files (recorded instead of the client's number, over-cap uploads deleted), and `GetObject`'s `ContentLength` plus a bounded read plus the format `sharp` decodes for images.

R2 key pattern: `{category}/{entityId}/{nanoid()}-{filename}` (categories: `covers`, `files`, `sessions`). Every key that reaches an action is parsed against that grammar first — directly with `parseStorageKey`, or through the form schema that carries it (`chartFormSchema`) — and the actions that act on an entity resolve the key from an ownership-checked row. The image pipeline goes one step further: the raw key must be the one that row already records, so `processAndStoreImage` **called on its own** cannot be made to re-encode a well-formed key the entity never named. That is a guarantee about the action, not about the whole flow — `chartFormSchema` accepts any well-formed `covers/…` key, so a save can make the row name one first (maintenance-ledger row, 2026-08-17).

### Stats Queries

- Each query accepts `userId`, uses `unstable_cache()` with a user-scoped key and the `"stats"` tag
- Invalidated by `revalidateTag("stats", { expire: 0 })` from any mutation that moves a statistic
- The stats page calls sixteen of them in one `Promise.allSettled()` for graceful degradation, then fetches its project picker list separately in its own try/catch
- `settled<T>()` unwraps each result to `T | null`, logging under a caller-supplied scope (`"stats"` by default; `/charts`, `/sessions`, the chart detail page and the dashboard shell pass their own)

## Key Abstractions

| Abstraction                 | Location                         | Purpose                                                                             |
| --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Lazy Singleton              | `db.ts`, `r2.ts`                 | Deferred init via Proxy/getter to avoid build-time env failures                     |
| Auth Edge                   | `proxy.ts`                       | Session gate ahead of routing; layout redirect is the second line                   |
| Auth Guard                  | `auth-guard.ts`                  | Single chokepoint for auth enforcement inside actions                               |
| Discriminated Union Results | All actions                      | `{ success: true } \| { success: false; error }` — never throw to client            |
| Gallery Transform           | `gallery-utils.ts`               | Pure DB→UI type transformation with computed fields, including series identity      |
| Status Config               | `utils/status.ts`                | `Record<ProjectStatus, {...}>` — single source for labels/colors                    |
| Factory Pattern             | `__tests__/mocks/factories.ts`   | Typed factories for 17 of the 18 Prisma models (`ChartFile` has none) + mock client |
| nuqs URL State              | Gallery, stats                   | URL-persisted search/filter/sort state, series filter included                      |
| Stats Barrel                | `queries/stats/index.ts`         | Aggregated import path for the stats page's query set                               |
| Component Public API        | `features/supply-table/index.ts` | Exports the table, adapters and types; sub-components stay internal                 |

## Architectural Constraints

- Requests pass `proxy.ts` before routing; nothing in `(dashboard)` renders for an unauthenticated session
- Server Components fetch data; Client Components receive props (split at top-level feature component)
- Pages that fetch more than one dataset parallelize with `Promise.all()` / `Promise.allSettled()`. It is a habit, not an invariant — around a dozen of the simpler dashboard pages still await sequentially (e.g. `shopping/page.tsx`), which is worth fixing when you are already in the file and is not a review finding on its own
- R2 keys stored in DB, presigned URLs generated per-render (1-hour expiry); image processing (sharp) is server-side only
- Stats queries share the `"stats"` cache tag; any mutation that moves a statistic must invalidate it with `revalidateTag("stats", { expire: 0 })`, and **every such mutation carries a test asserting its own call** (Beth's ruling, 2026-08-17). `supply-actions.ts` alone does so at 22 sites, most of which change neither stitch count nor status
- Ownership is checked directly on the three `userId`-carrying models and transitively on everything that hangs off a project; only true reference data is global (see the mutation sequence above)
- Calendar dates (session dates, project start/finish/FFO) are stored as UTC-midnight instants and read in UTC; only "now" is resolved in the user's timezone (see "Calendar dates")
- Security headers set globally in `next.config.ts` (CSP whitelists R2 origins)
- Component, form, action and testing conventions are in `.claude/rules/` — follow them there rather than duplicating them here
