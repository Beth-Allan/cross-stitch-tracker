# Stack Research: Milestone 3 -- Track & Measure (v1.2)

**Domain:** Dashboards with aggregated queries, session logging with photo uploads, progress tracking
**Researched:** 2026-04-16
**Confidence:** HIGH

## Executive Summary

v1.2 requires **one new schema model** (StitchSession) and **zero new npm dependencies**. The original project plan listed Recharts, TanStack Table, and dnd-kit as future dependencies, but after reviewing the actual DesignOS components for v1.2 and v1.3, none of these are needed yet:

- **Bar charts (v1.3 only):** The MonthlyChart design is a custom CSS bar chart built with divs, inline styles, and state -- not a charting library. This is a v1.3 feature anyway.
- **Calendar view (v1.3 only):** The StitchingCalendar design is a custom CSS Grid calendar component. Also v1.3.
- **Dashboard widgets:** The MainDashboard, ProjectDashboard, and ShoppingCart designs use static sections, not draggable widgets. dnd-kit is not needed.
- **Table views:** Already built with custom components in v1.1. TanStack Table was never adopted.

The actual v1.2 work involves: Prisma aggregation queries (using existing `aggregate()`, `groupBy()`, and `_count` APIs), a new StitchSession model, reuse of the existing R2 upload pattern for session photos, and building dashboard pages as Server Components with data-fetching.

## Recommended Stack Changes

### New Dependencies: NONE

No new npm packages required. Every v1.2 feature builds on the existing stack.

### Schema Addition: StitchSession Model

The only infrastructure change is a new Prisma model:

```prisma
model StitchSession {
  id               String   @id @default(cuid())
  project          Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  date             DateTime @db.Date
  stitchCount      Int
  timeSpentMinutes Int?
  photoUrl         String?
  photoThumbnailUrl String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

This requires adding `sessions StitchSession[]` to the Project model and running `prisma db push` + `prisma generate`.

## Technology Decisions

### Charting: Do NOT add Recharts for v1.2

| Decision | Rationale |
|----------|-----------|
| No charting library in v1.2 | v1.2 has no chart/graph features. MonthlyChart and StitchingCalendar are v1.3 (Motivation & Planning). |
| When v1.3 arrives, evaluate CSS-only vs Recharts | The DesignOS MonthlyChart is a custom div-based bar chart (~200 lines). Building it as CSS/React is cleaner than introducing a 50KB dependency for one simple bar chart. |
| If Recharts is ever added, pin `3.8.1` | Current version, React 19 compatible. Use `next/dynamic` to lazy-load on chart pages only. |

**Confidence:** HIGH -- verified by reading DesignOS components and the PROJECT.md milestone scoping.

### Calendar: Do NOT add a calendar/date-picker library

| Decision | Rationale |
|----------|-----------|
| Use native `<input type="date">` for session logging | The LogSessionModal design uses `type="date"` directly. Works on all target platforms (Mac Safari, Chrome, iOS Safari). |
| Build custom calendar grid for v1.3 | The StitchingCalendar design is a CSS Grid component, not a date-picker widget. It displays session data on a monthly grid, not select dates. |

**Confidence:** HIGH -- verified against LogSessionModal.tsx and StitchingCalendar.tsx designs.

### Dashboard Queries: Prisma aggregation (existing API)

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `findMany` with `_count` | Counting related records (status breakdowns, supply counts) | Already used throughout (designer chartCount, storage projectCount) |
| `aggregate` with `_sum`, `_avg`, `_count` | Single-model totals (total stitches completed, avg per session) | `prisma.stitchSession.aggregate({ _sum: { stitchCount: true }, _count: { _all: true } })` |
| `groupBy` with aggregation | Monthly totals, per-project breakdowns, progress buckets | `prisma.stitchSession.groupBy({ by: ['projectId'], _sum: { stitchCount: true } })` |
| `$queryRaw<T>` | Complex multi-table aggregation if Prisma API is awkward | Typed raw SQL with manual type annotation. Reserve for "collection stats" if Prisma DSL produces too many queries. |

**Key pattern: Prefer Prisma API, fall back to $queryRaw only when measured.**

For v1.2's ~500 records, Prisma's built-in aggregation is more than sufficient. No need for raw SQL, CTEs, or window functions at this scale. The single-user architecture means concurrent load is never a concern.

**Confidence:** HIGH -- Prisma 7 `aggregate()` and `groupBy()` verified via Context7. Already have `_count` usage across 8+ action files.

### Session Photo Uploads: Reuse existing R2 pattern

The upload infrastructure is already built and battle-tested:

| Component | Exists | Reuse Strategy |
|-----------|--------|---------------|
| `getPresignedUploadUrl()` | Yes (upload-actions.ts) | Extend to accept `"sessionPhotoUrl"` field type |
| `sharp` thumbnail generation | Yes (upload-actions.ts) | Same pattern for session photo thumbnails |
| `nanoid` key generation | Yes | Same `sessions/{nanoid}` key pattern |
| R2 client singleton | Yes (lib/r2.ts) | No changes needed |
| Client-side upload flow | Yes (components/features/) | Adapt existing upload button pattern |

No new infrastructure. The only work is extending the existing upload action to handle a new entity type (StitchSession instead of Chart).

**Confidence:** HIGH -- existing code reviewed.

### Auto-updating Progress: Server action pattern

When a session is logged, `stitchesCompleted` on the Project must update. This follows the existing server action pattern:

```typescript
// In session-actions.ts (new file)
await prisma.$transaction(async (tx) => {
  // 1. Create the session
  const session = await tx.stitchSession.create({ data: { ... } });
  // 2. Recalculate project progress from all sessions
  const total = await tx.stitchSession.aggregate({
    where: { projectId },
    _sum: { stitchCount: true },
  });
  // 3. Update project
  await tx.project.update({
    where: { id: projectId },
    data: { stitchesCompleted: project.startingStitches + (total._sum.stitchCount ?? 0) },
  });
  return session;
});
```

Uses `$transaction` (already used for supply actions), `aggregate` for summing, and `revalidatePath` for cache invalidation.

**Confidence:** HIGH -- follows established patterns.

### Dashboard Data Fetching: Server Components

v1.2 dashboards are read-heavy pages with aggregated data. The established pattern is:

| Pattern | Used For |
|---------|----------|
| Server Component page fetches data | All dashboard pages (MainDashboard, ProjectDashboard, PatternDive, ShoppingCart) |
| Server actions for aggregation queries | `getCollectionStats()`, `getProgressBuckets()`, `getCurrentlyStitching()` etc. |
| Client Components only for interactivity | Tab switching, sort dropdowns, expand/collapse, modal triggers |
| `nuqs` for URL tab state | Pattern Dive tabs, Project Dashboard tabs -- already used for project detail tabs |

No data-fetching library (SWR, React Query) needed. Single-user app with server-side data loading.

**Confidence:** HIGH -- follows v1.1 patterns (gallery, project detail).

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Charting | CSS bar chart (v1.3) | Recharts 3.8.1 | 50KB bundle for one simple bar chart. DesignOS already designs it as custom divs. Revisit if v1.3 needs complex charts beyond bar. |
| Calendar | Custom CSS Grid (v1.3) | react-day-picker | The calendar shows session data in a grid, not a date-picker. Different component entirely. |
| Date input | Native `<input type="date">` | @base-ui/react date-picker | Base UI doesn't have a date picker. Native input works on all target platforms and matches the DesignOS design. |
| Dashboard aggregation | Prisma `aggregate`/`groupBy` | Raw SQL | Unnecessary at single-user scale (~500 projects, ~10k sessions max). If performance issues arise, add raw SQL for specific queries. |
| TypedSQL | Not yet | Prisma TypedSQL (preview) | Still a preview feature in Prisma 7. Risk of breaking changes. `$queryRaw<T>` with manual types is safer if raw SQL is needed. |
| Data fetching | Server Components | SWR / React Query | Single-user, no real-time needs, no cache invalidation complexity. Server Components + revalidatePath is sufficient. |
| Drag-and-drop widgets | Not in v1.2 | dnd-kit | DesignOS designs have static section layouts, not draggable widgets. Deferred indefinitely per current designs. |
| Data tables | Custom table components | TanStack Table | Already built custom tables in v1.1 that work well. No need to introduce a new dependency. |

## Existing Stack Reuse Map

| v1.2 Feature | Existing Stack Component | Notes |
|-------------|------------------------|-------|
| Main Dashboard | Server Components, `findMany` with includes | Aggregation queries for stats sidebar |
| Collection Stats | `prisma.project.count()` + `groupBy` on status | Simple counts, no joins needed |
| Currently Stitching | `findMany` with `where: { status: "IN_PROGRESS" }` | Reuses gallery card data shape |
| Buried Treasures | `findMany` + `orderBy: { chart: { dateAdded: "asc" } }` | Oldest unstarted, limit 5 |
| Spotlight | `findMany` + random offset | Single random project |
| Pattern Dive tabs | `nuqs` URL state, existing gallery components | What's Next, Fabric Req, Storage View |
| Project Dashboard | `groupBy` on progress buckets, `findMany` for finished | Progress % calculated at query time |
| Shopping Cart upgrade | Existing shopping-actions.ts + new filters | Per-project selection, tabbed supply types |
| Session logging | New `StitchSession` model + server action | Modal pattern matches existing modals |
| Session photo upload | Existing R2 presigned URL pattern | Same as cover image uploads |
| Auto-updating progress | `$transaction` + `aggregate` | Same transaction pattern as supply actions |
| Project Sessions tab | New tab on existing project detail | `nuqs` tab state already in place |

## Installation

No new packages to install. Schema migration only:

```bash
# Add StitchSession model to prisma/schema.prisma
npx prisma db push
npx prisma generate
```

## Sources

- Prisma aggregation API: Context7 `/prisma/skills` -- `aggregate()`, `groupBy()`, `$queryRaw` (HIGH confidence)
- Prisma raw SQL: Context7 `/prisma/skills` -- `$queryRaw<T>` with typed results (HIGH confidence)
- Recharts 3.8.1: npm registry, Bundlephobia (~50KB gzipped) (MEDIUM confidence -- version current as of 2026-03-25)
- TypedSQL status: Prisma docs -- still preview feature in Prisma 7 (MEDIUM confidence -- may have stabilized since last check)
- DesignOS components: Local files in `product-plan/sections/` (HIGH confidence -- these are the source of truth)
- Existing upload pattern: `src/lib/actions/upload-actions.ts` (HIGH confidence -- reviewed directly)
- Existing aggregation patterns: `_count` in 8+ action files (HIGH confidence -- reviewed directly)
