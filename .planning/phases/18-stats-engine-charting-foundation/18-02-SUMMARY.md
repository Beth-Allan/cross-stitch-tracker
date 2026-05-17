---
phase: 18-stats-engine-charting-foundation
plan: "02"
subsystem: stats-query-layer
tags: [stats, queries, caching, cache-invalidation, prisma, timezone]
dependency_graph:
  requires: [18-01]
  provides: [getHeroStats, getCollectionBreakdown, stats-cache-invalidation]
  affects: [session-actions, stats-page]
tech_stack:
  added: []
  patterns: [unstable_cache, revalidateTag, Promise.all-parallel-queries, groupBy-with-zero-fill]
key_files:
  created:
    - src/lib/queries/stats/hero-stats.ts
    - src/lib/queries/stats/hero-stats.test.ts
    - src/lib/queries/stats/collection-breakdown.ts
    - src/lib/queries/stats/collection-breakdown.test.ts
  modified:
    - src/lib/queries/stats/index.ts
    - src/lib/actions/session-actions.ts
    - src/lib/actions/session-actions.test.ts
    - src/__tests__/mocks/factories.ts
decisions:
  - "Promise.all with 6 parallel Prisma queries for hero stats (avoids Neon cold-start waterfall)"
  - "300s TTL for hero stats, 3600s for collection breakdown (activity data changes more frequently)"
  - "Fill all 7 statuses including zeros for consistent donut chart rendering"
metrics:
  duration: "3m 14s"
  completed: "2026-05-17T19:44:54Z"
  tests_added: 10
  tests_total_passing: 57
---

# Phase 18 Plan 02: Stats Query Layer Summary

Timezone-aware hero stats and collection breakdown queries with unstable_cache caching and session mutation cache invalidation.

## What Was Built

### Hero Stats Query (`getHeroStats`)
- Accepts userId, computes timezone boundaries via `getLocalDayBoundaries`
- Runs 6 parallel Prisma queries (Promise.all): today/week/month/year/lifetime aggregates + completed project count
- Returns `StatsHeroData` with 8 metrics: stitch counts for 5 time windows, total sessions, total time, projects completed
- Cached with `unstable_cache` tagged "stats", 300s revalidation

### Collection Breakdown Query (`getCollectionBreakdown`)
- Groups projects by status using `prisma.project.groupBy`
- Fills all 7 statuses (including zeros for missing) with CSS variable colors from `collectionStatusConfig`
- Returns `CollectionBreakdownData` with `byStatus` array and `totalProjects` sum
- Cached with `unstable_cache` tagged "stats", 3600s revalidation

### Cache Invalidation
- Added `revalidateTag("stats")` to all 3 session mutation functions (create/update/delete)
- Ensures stats cache is purged whenever session data changes

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Hero stats + collection breakdown queries (TDD) | d6c6404 | hero-stats.ts, collection-breakdown.ts, index.ts |
| 2 | Cache invalidation in session mutations | cb04f73 | session-actions.ts, session-actions.test.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added project.groupBy to mock Prisma factory**
- **Found during:** Task 1 (test setup)
- **Issue:** `createMockPrisma()` did not include `project.groupBy`, required by collection-breakdown tests
- **Fix:** Added `groupBy: vi.fn()` to the project model in `src/__tests__/mocks/factories.ts`
- **Commit:** d6c6404

## Verification

- 20 stats query tests pass (10 hero + 4 collection + 6 timezone from Plan 01)
- 37 session-actions tests pass (no regressions)
- `revalidateTag` count in session-actions.ts: 4 (1 import + 3 calls)
- `unstable_cache` present in both query files

## Self-Check: PASSED
