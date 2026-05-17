---
phase: 19-hero-stats-collection-overview
reviewed: 2026-05-17T18:42:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/stats/page.test.ts
  - src/app/(dashboard)/stats/page.tsx
  - src/components/features/stats/designer-breakdown-chart.test.tsx
  - src/components/features/stats/designer-breakdown-chart.tsx
  - src/components/features/stats/genre-distribution-chart.test.tsx
  - src/components/features/stats/genre-distribution-chart.tsx
  - src/components/features/stats/lifetime-counters.test.tsx
  - src/components/features/stats/lifetime-counters.tsx
  - src/components/features/stats/metrics-bar.test.tsx
  - src/components/features/stats/metrics-bar.tsx
  - src/components/features/stats/ranked-list.test.tsx
  - src/components/features/stats/ranked-list.tsx
  - src/components/features/stats/size-category-chart.test.tsx
  - src/components/features/stats/size-category-chart.tsx
  - src/components/features/stats/stats-overview.test.tsx
  - src/components/features/stats/stats-overview.tsx
  - src/lib/chart-configs.test.ts
  - src/lib/chart-configs.ts
  - src/lib/queries/stats/designer-breakdown.test.ts
  - src/lib/queries/stats/designer-breakdown.ts
  - src/lib/queries/stats/genre-breakdown.test.ts
  - src/lib/queries/stats/genre-breakdown.ts
  - src/lib/queries/stats/index.ts
  - src/lib/queries/stats/size-breakdown.test.ts
  - src/lib/queries/stats/size-breakdown.ts
  - src/types/stats.ts
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-05-17T18:42:00Z
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Phase 19 implements hero stats (MetricsBar, LifetimeCounters) and collection overview charts (size breakdown, designer breakdown, genre distribution) with a RankedList component and StatsOverview layout. The code is well-structured, follows project conventions (Server Components by default, "use client" only for chart interactivity, semantic tokens, colocated tests), and correctly uses `requireAuth()` before data fetching.

Two caching correctness issues stand out as the main findings -- the `limit` parameter is not included in `unstable_cache` keys for designer and genre breakdowns, meaning callers with different limits would incorrectly share cached results. There is also one minor code quality item.

## Warnings

### WR-01: Cache key does not include `limit` parameter (designer-breakdown)

**File:** `src/lib/queries/stats/designer-breakdown.ts:38-42`
**Issue:** The `unstable_cache` key is `stats-designer-${userId}` but the `limit` parameter is not part of the key. If `getDesignerBreakdown` is ever called with different `limit` values for the same user (e.g., `getDesignerBreakdown(userId, 5)` and `getDesignerBreakdown(userId, 10)`), the second call will serve the cached result from the first, returning incorrect data. While currently only called with the default `limit=10`, this is a latent bug that will surface the moment the function is reused with a different limit.

**Fix:**
```typescript
export function getDesignerBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeDesignerBreakdown(userId, limit),
    [`stats-designer-${userId}-limit-${limit}`],
    { tags: ["stats"], revalidate: 3600 },
  )();
}
```

### WR-02: Cache key does not include `limit` parameter (genre-breakdown)

**File:** `src/lib/queries/stats/genre-breakdown.ts:38-42`
**Issue:** Same issue as WR-01 but for `getGenreBreakdown`. The cache key `stats-genre-${userId}` omits the `limit`, risking stale/incorrect data if multiple callers request different limits.

**Fix:**
```typescript
export function getGenreBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeGenreBreakdown(userId, limit),
    [`stats-genre-${userId}-limit-${limit}`],
    { tags: ["stats"], revalidate: 3600 },
  )();
}
```

## Info

### IN-01: `size-breakdown` query includes charts without a project (orphan scenario)

**File:** `src/lib/queries/stats/size-breakdown.ts:14-16`
**Issue:** The query filters `where: { project: { userId } }` which uses a relation filter. Because `Chart` has an optional one-to-one `Project?` relation, charts without a linked project are correctly excluded by Prisma (they have no project to match the userId). This is fine behavior, but it means the size breakdown count may differ from `totalProjects` in the collection breakdown if there are ever charts without projects in the database. This is unlikely given the domain model (projects are created alongside charts), but worth noting for consistency.

**Fix:** No action required -- documenting the implicit exclusion behavior. If charts without projects ever become possible, add an explicit `project: { isNot: null }` clause.

---

_Reviewed: 2026-05-17T18:42:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
