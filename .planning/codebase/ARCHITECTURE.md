# Architecture

> Codebase architecture analysis — patterns, layers, data flow, abstractions, entry points.
> Generated: 2026-05-20

## System Pattern

Next.js 16 App Router monolith with Server Components → Server Actions → Prisma (Neon PostgreSQL) + Cloudflare R2 object storage. Single-user auth via Auth.js v5 JWT strategy.

```
Browser
  → App Router (Server Components)
    → Server Actions / Stats Queries
      → Prisma (Neon PostgreSQL)
      → S3Client (Cloudflare R2)
    → Client Components (props down, actions up)
```

## Architectural Layers

### Layer 1: Routing / Pages (`src/app/`)

Two route groups plus an API segment:

| Group | Purpose | Layout |
|-------|---------|--------|
| `(auth)` | Login page | Bare, no shell |
| `(dashboard)` | All app pages | Auth-gated AppShell (sidebar + topbar) |
| `api/` | NextAuth handler only | None |

Pages are async Server Components. They fetch all data eagerly via `Promise.all()` or `Promise.allSettled()` (stats), then pass data as props to client components.

Key routes:
- `/` — Dashboard (library + progress tabs)
- `/charts` — Pattern Dive (gallery + what's next + fabric + storage tabs)
- `/charts/[id]` — Project detail (overview + supplies + files + sessions + history)
- `/charts/new`, `/charts/[id]/edit` — Chart create/edit forms
- `/designers`, `/genres`, `/fabric`, `/storage`, `/apps` — Reference data CRUD
- `/supplies`, `/supplies/brands` — Supply catalog
- `/sessions` — Session log
- `/stats` — Statistics (overview + activity + records)
- `/shopping` — Shopping list
- `/settings` — Settings

### Layer 2: Shell (`src/components/shell/`)

- `app-shell.tsx` — Sidebar + topbar wrapper
- `sidebar.tsx`, `top-bar.tsx`, `nav-items.ts` — Navigation structure
- `logout-action.ts` — Logout server action

### Layer 3: Feature Components (`src/components/features/`)

Domain-scoped directories. Most are `"use client"` for interactivity. Sub-domains:
- `charts/` — Form, detail tabs, supply integration, session logging
- `charts/form-primitives/` — Reusable form sub-components (upload, calculator, genre picker)
- `charts/project-detail/` — Multi-tab detail view
- `dashboard/` — Dashboard tabs, stats sidebar, spotlight, buried treasures
- `gallery/` — Gallery card, filter bar, sort/filter logic
- `stats/` — Stats page shell, overview/activity/records sections
- `supply-table/` — Reusable tabular supply editor (threads, beads, specialty)
- `shopping/` — Shopping list with aggregation, project filtering
- `designers/`, `fabric/`, `genres/`, `sessions/`, `settings/`, `storage/`, `apps/`

### Layer 4: UI Primitives (`src/components/ui/`)

Shadcn/Base UI component wrappers. No business logic. Key files:
- `button.tsx`, `button-variants.ts` — CVA variants extracted to non-client file for server import
- `link-button.tsx` — Replaces `Button render={<Link>}` pattern
- `dialog.tsx`, `table.tsx`, `tabs.tsx`, `select.tsx`, `badge.tsx`, `card.tsx`
- `chart.tsx` — Recharts wrapper

### Layer 5: Server Actions (`src/lib/actions/`)

All files start with `"use server"`. One file per domain. Pattern: `requireAuth()` → Zod validation → Prisma mutation → `revalidatePath()` / `revalidateTag()`.

Key files:
- `chart-actions.ts` — Chart CRUD + gallery/detail queries
- `upload-actions.ts` — Presigned URL generation, image processing, R2 delete
- `session-actions.ts` — StitchSession CRUD, progress recalculation
- `supply-actions.ts` — Thread/bead/specialty supply mutations
- `dashboard-actions.ts` — Dashboard data aggregation
- `stats-actions.ts` — Delegating wrapper for calendar/session stats
- `shopping-cart-actions.ts` — Shopping list mutations
- Plus: `designer-actions.ts`, `genre-actions.ts`, `fabric-actions.ts`, `chart-file-actions.ts`, `storage-location-actions.ts`, `stitching-app-actions.ts`, `focal-point-actions.ts`, `pattern-dive-actions.ts`, `shopping-actions.ts`, `project-dashboard-actions.ts`

### Layer 6: Stats Query Layer (`src/lib/queries/stats/`)

Pure async functions querying Prisma. Not server actions — called from pages and actions. Each file exports one function. Uses `unstable_cache` with `"stats"` cache tag (300s TTL).

- `index.ts` — Barrel re-exports all 17+ query functions
- `hero-stats.ts` — Today/week/month/year/lifetime aggregates
- `timezone.ts` — IANA timezone resolution + day boundary computation
- Plus: `completion-estimates.ts`, `pace-metrics.ts`, `personal-bests.ts`, `record-detection.ts`, `calendar-days.ts`, `session-history.ts`, `monthly-totals.ts`, `daily-breakdown.ts`, `day-of-week.ts`, `fastest-completions.ts`, `thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts`, `collection-breakdown.ts`, `size-breakdown.ts`, `available-years.ts`
- `utils.ts` — Shared `buildDateFilter()` and `Scope` type

### Layer 7: Database

- `prisma/schema.prisma` — PostgreSQL via Neon, source of truth
- `src/lib/db.ts` — Lazy singleton Prisma client via `Proxy` + `globalThis` (survives hot-reload)
- `src/generated/prisma/` — Generated client (auto-generated, never edit)
- `prisma/seed.ts` + `prisma/fixtures/` — Seeding

### Layer 8: Object Storage (R2)

- `src/lib/r2.ts` — Lazy S3Client singleton pointing to Cloudflare R2
- Accessed exclusively through `upload-actions.ts` and `chart-file-actions.ts`
- DB stores R2 object keys (not URLs); presigned URLs generated at render time via `getPresignedImageUrls()`

### Layer 9: Auth

- `src/lib/auth.ts` — NextAuth v5 config; single-user credentials from env vars; JWT strategy, 30-day session
- `src/lib/auth-guard.ts` — `requireAuth()`: single enforcement function called by every server action
- `src/lib/rate-limit.ts` — In-memory rate limiter (5 attempts, 30s cooldown)

### Layer 10: Validations (`src/lib/validations/`)

Zod schemas colocated by domain. Shared between actions (server) and form hooks (client).

### Layer 11: Domain Types (`src/types/`)

TypeScript interface/type files; no runtime code. Composed from Prisma-generated types using intersection, `Pick`, and `&`.

### Layer 12: Utilities (`src/lib/utils/`)

Pure functions, no side effects: `skein-calculator.ts`, `fabric-calculator.ts`, `size-category.ts`, `status.ts`, `settled.ts`, `focal-point.ts`, `format-file-size.ts`, `format-time.ts`, `natural-sort.ts`.

## Data Flow Patterns

### Page Renders

1. Page function is `async`, calls `requireAuth()` or relies on layout auth redirect
2. Independent data fetches batched with `Promise.all()` (or `Promise.allSettled()` for stats)
3. R2 image keys collected, resolved in one batch call to `getPresignedImageUrls()`
4. Data + `imageUrls: Record<string, string>` passed as props to top-level client component

### Mutations (Server Actions)

Invariant sequence:
1. `requireAuth()` — throws if no session
2. `schema.parse(input)` — Zod validation
3. Ownership check — `prisma.X.findUnique({ where: { id }, select: { userId: true } })`
4. Prisma write (often inside `$transaction`)
5. `revalidatePath()` / `revalidateTag()`
6. Return `{ success: true, ... }` or `{ success: false, error: string }`

### File Uploads (R2 Three-Step Presigned URL)

1. Client → Server Action (`getPresignedUploadUrl`): validates metadata, generates presigned PUT URL (10-min expiry)
2. Client → R2 directly: `fetch(url, { method: "PUT", body: file })` — bytes never touch Next.js server
3. Client → Server Action (`confirmUpload`): verifies ownership, writes key to DB, triggers server-side image processing (sharp → WebP + thumbnail → R2)

R2 key pattern: `{category}/{projectId}/{nanoid()}-{filename}` (categories: `covers`, `files`, `sessions`)

### Stats Queries

- Each query accepts `userId`, uses `unstable_cache()` with user-scoped key and `"stats"` tag
- 300s TTL, invalidated by `revalidateTag("stats")` on session/status mutations
- Stats page calls all 17 queries with `Promise.allSettled()` for graceful degradation
- `settled<T>()` unwraps each result to `T | null`

## Key Abstractions

| Abstraction | Location | Purpose |
|-------------|----------|---------|
| Lazy Singleton | `db.ts`, `r2.ts` | Deferred init via Proxy/getter to avoid build-time env failures |
| Auth Guard | `auth-guard.ts` | Single chokepoint for auth enforcement |
| Discriminated Union Results | All actions | `{ success: true } \| { success: false; error }` — never throw to client |
| Gallery Transform | `gallery-utils.ts` | Pure DB→UI type transformation with computed fields |
| Status Config | `utils/status.ts` | `Record<ProjectStatus, {...}>` — single source for labels/colors |
| Factory Pattern | `__tests__/mocks/factories.ts` | Typed factories for every Prisma model + mock client |
| nuqs URL State | Gallery, stats | URL-persisted search/filter/sort state |
| Barrel Index | `queries/stats/index.ts` | Single import path for all stats queries |

## Architectural Constraints

- Server Components fetch data; Client Components receive props (split at top-level feature component)
- `buttonVariants` must import from `button-variants.ts` (non-client) in Server Components
- R2 keys stored in DB, presigned URLs generated per-render (1-hour expiry)
- All page-level fetching uses `Promise.all()` or `Promise.allSettled()` — no sequential awaits
- Zod validation runs on both server (actions) and client (form hooks) from same schema
- Image processing (sharp) happens server-side only
- Stats queries use `unstable_cache` with shared `"stats"` tag
- Test files colocated with source files
- Security headers set globally in `next.config.ts` (CSP whitelists R2 origins)
