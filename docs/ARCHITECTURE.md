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

### Layer 1: Routing / Pages (`src/app/`)

Two route groups plus an API segment:

| Group         | Purpose               | Layout                                 |
| ------------- | --------------------- | -------------------------------------- |
| `(auth)`      | Login page            | Bare, no shell                         |
| `(dashboard)` | All app pages         | Auth-gated AppShell (sidebar + topbar) |
| `api/`        | NextAuth handler only | None                                   |

Pages are async Server Components. They fetch all data eagerly via `Promise.all()` or `Promise.allSettled()` (stats), then pass data as props to client components.

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
- `nav-items.ts` — Three sections plus a pinned settings item: **Projects** (Dashboard, Pattern Dive, Shopping, Series) · **Track** (Sessions, Statistics) · **Reference** (Designers, Genres, Supplies, Fabric, Storage, Apps). `navigationItems` is a flattened list kept for mobile nav.
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
- `empty-state.tsx`, `error-card.tsx` — Shared zero/failure states

### Layer 5: Server Actions (`src/lib/actions/`)

Eighteen files, each starting with `"use server"`, one per domain. Pattern: `requireAuth()` → Zod validation → Prisma mutation → `revalidatePath()` / `revalidateTag()`.

Key files:

- `chart-actions.ts` — Chart CRUD + gallery/detail queries
- `series-actions.ts` — Series CRUD plus `getSeriesWithStats()` and `getSeriesDetail()`
- `upload-actions.ts` — Presigned URL generation, image processing, R2 delete
- `session-actions.ts` — StitchSession CRUD, progress recalculation
- `supply-actions.ts` — Thread/bead/specialty supply mutations
- `dashboard-actions.ts` — Dashboard data aggregation
- `stats-actions.ts` — Delegating wrapper for calendar/session stats
- `shopping-cart-actions.ts` — Shopping list mutations
- Plus: `designer-actions.ts`, `genre-actions.ts`, `fabric-actions.ts`, `chart-file-actions.ts`, `storage-location-actions.ts`, `stitching-app-actions.ts`, `focal-point-actions.ts`, `pattern-dive-actions.ts`, `shopping-actions.ts`, `project-dashboard-actions.ts`

### Layer 6: Stats Query Layer (`src/lib/queries/stats/`)

Nineteen query files plus a barrel and a shared helper module. Pure async functions querying Prisma — not server actions, called from pages and actions. Most export a single function; `timezone.ts` exports two.

Caching: `unstable_cache` keyed per user, tagged `"stats"`, invalidated by `revalidateTag("stats")` on session and status mutations. TTL varies by volatility — **300s** for activity-derived queries, **3600s** for collection-shape queries (`collection-breakdown`, `size-breakdown`, `designer-breakdown`, `genre-breakdown`); several take a scope-derived `revalidate`. `timezone.ts` and `record-detection.ts` are uncached.

- `index.ts` — Barrel re-exporting 20 functions. Not exhaustive by design: `record-detection.ts` stays off the barrel and is imported by path from `session-actions.ts`.
- `hero-stats.ts` — Today/week/month/year/lifetime aggregates
- `timezone.ts` — IANA timezone resolution + day boundary computation
- Plus: `completion-estimates.ts`, `pace-metrics.ts`, `personal-bests.ts`, `record-detection.ts`, `calendar-days.ts`, `session-history.ts`, `monthly-totals.ts`, `daily-breakdown.ts`, `day-of-week.ts`, `fastest-completions.ts`, `thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts`, `collection-breakdown.ts`, `size-breakdown.ts`, `designer-breakdown.ts`, `genre-breakdown.ts`, `available-years.ts`
- `utils.ts` — Shared `buildDateFilter()` and `Scope` type

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

- `proxy.ts` — The edge gate (Layer 0)
- `src/lib/auth.ts` — NextAuth v5 config; single-user credentials from env vars; JWT strategy, 30-day session; `jwt`/`session` callbacks thread `user.id` through
- `src/lib/auth-guard.ts` — `requireAuth()`: single enforcement function called by every server action
- `src/lib/rate-limit.ts` — In-memory rate limiter (5 attempts, 30s cooldown)

### Layer 10: Validations (`src/lib/validations/`)

Zod schemas by domain (`auth`, `chart`, `fabric`, `focal-point`, `series`, `session`, `storage`, `supply`, `upload`). Shared between actions (server) and form hooks (client). `upload.ts` also owns the allowed MIME/extension lists, the 50MB cap, and the image-optimization constants.

### Layer 11: Domain Types (`src/types/`)

TypeScript interface/type files; no runtime code. Composed from Prisma-generated types using intersection, `Pick`, and `&`. One file per domain: `chart`, `dashboard`, `designer`, `fabric`, `focal-point`, `genre`, `series`, `session`, `shopping`, `stats`, `storage`, `supply`.

### Layer 12: Utilities (`src/lib/utils/`)

Pure functions, no side effects: `skein-calculator.ts`, `fabric-calculator.ts`, `size-category.ts`, `status.ts`, `status-groups.ts`, `series-progress.ts`, `settled.ts`, `focal-point.ts`, `format-file-size.ts`, `format-time.ts`, `natural-sort.ts`.

`src/lib/constants.ts` holds literals shared across modules that belong to no single utility.

## Data Flow Patterns

### Page Renders

1. Page function is `async`; the session is already gated by `proxy.ts`, and pages call `requireAuth()` when they need `user.id`
2. Independent data fetches batched with `Promise.all()` (or `Promise.allSettled()` for stats)
3. R2 image keys collected, resolved in one batch call to `getPresignedImageUrls()`
4. Data + `imageUrls: Record<string, string>` passed as props to top-level client component

### Mutations (Server Actions)

1. `requireAuth()` — throws if no session
2. `schema.parse(input)` — Zod validation
3. Ownership check — **only for user-scoped models.** Three models carry a `userId`: `Project`, `StitchingApp`, `StorageLocation`. Those get `prisma.X.findUnique({ where: { id }, select: { userId: true } })` before the write. Everything else — charts, series, designers, genres, threads, beads, specialty items, brands, fabric — is globally scoped, because this is a single-user app with one collection.
4. Prisma write (often inside `$transaction`)
5. `revalidatePath()` / `revalidateTag()`
6. Return `{ success: true, ... }` or `{ success: false, error: string }`

### File Uploads (R2 Three-Step Presigned URL)

1. Client → Server Action (`getPresignedUploadUrl`): validates metadata, generates presigned PUT URL (10-min expiry)
2. Client → R2 directly: `fetch(url, { method: "PUT", body: file })` — bytes never touch Next.js server
3. Client → Server Action (`confirmUpload`): verifies ownership, writes key to DB, triggers server-side image processing (sharp → WebP + thumbnail → R2)

R2 key pattern: `{category}/{projectId}/{nanoid()}-{filename}` (categories: `covers`, `files`, `sessions`)

### Stats Queries

- Each query accepts `userId`, uses `unstable_cache()` with a user-scoped key and the `"stats"` tag
- Invalidated by `revalidateTag("stats")` on session/status mutations
- The stats page calls sixteen of them in one `Promise.allSettled()` for graceful degradation, then fetches its project picker list separately in its own try/catch
- `settled<T>()` unwraps each result to `T | null`

## Key Abstractions

| Abstraction                 | Location                         | Purpose                                                                        |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| Lazy Singleton              | `db.ts`, `r2.ts`                 | Deferred init via Proxy/getter to avoid build-time env failures                |
| Auth Edge                   | `proxy.ts`                       | Session gate ahead of routing; layout redirect is the second line              |
| Auth Guard                  | `auth-guard.ts`                  | Single chokepoint for auth enforcement inside actions                          |
| Discriminated Union Results | All actions                      | `{ success: true } \| { success: false; error }` — never throw to client       |
| Gallery Transform           | `gallery-utils.ts`               | Pure DB→UI type transformation with computed fields, including series identity |
| Status Config               | `utils/status.ts`                | `Record<ProjectStatus, {...}>` — single source for labels/colors               |
| Factory Pattern             | `__tests__/mocks/factories.ts`   | Typed factories for every Prisma model + mock client                           |
| nuqs URL State              | Gallery, stats                   | URL-persisted search/filter/sort state, series filter included                 |
| Stats Barrel                | `queries/stats/index.ts`         | Aggregated import path for the stats page's query set                          |
| Component Public API        | `features/supply-table/index.ts` | Exports the table, adapters and types; sub-components stay internal            |

## Architectural Constraints

- Requests pass `proxy.ts` before routing; nothing in `(dashboard)` renders for an unauthenticated session
- Server Components fetch data; Client Components receive props (split at top-level feature component)
- All page-level fetching uses `Promise.all()` or `Promise.allSettled()` — no sequential awaits
- R2 keys stored in DB, presigned URLs generated per-render (1-hour expiry); image processing (sharp) is server-side only
- Stats queries share the `"stats"` cache tag; a mutation that changes stitch counts or status must invalidate it
- Ownership checks apply to the three user-scoped models; reference data is global
- Security headers set globally in `next.config.ts` (CSP whitelists R2 origins)
- Component, form, action and testing conventions are in `.claude/rules/` — follow them there rather than duplicating them here
