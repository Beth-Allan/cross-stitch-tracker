---
phase: 19-hero-stats-collection-overview
plan: 01
subsystem: stats-query-layer
tags: [queries, types, chart-configs, caching, tdd]
dependency_graph:
  requires: [phase-18-stats-engine]
  provides: [getSizeBreakdown, getDesignerBreakdown, getGenreBreakdown, sizeCategoryConfig, designerBarConfig, genreDistributionConfig]
  affects: [src/lib/queries/stats/, src/types/stats.ts, src/lib/chart-configs.ts]
tech_stack:
  added: []
  patterns: [unstable_cache-with-tags, prisma-groupBy, computed-field-bucketing]
key_files:
  created:
    - src/lib/queries/stats/size-breakdown.ts
    - src/lib/queries/stats/size-breakdown.test.ts
    - src/lib/queries/stats/designer-breakdown.ts
    - src/lib/queries/stats/designer-breakdown.test.ts
    - src/lib/queries/stats/genre-breakdown.ts
    - src/lib/queries/stats/genre-breakdown.test.ts
  modified:
    - src/types/stats.ts
    - src/lib/chart-configs.ts
    - src/lib/chart-configs.test.ts
    - src/lib/queries/stats/index.ts
    - src/__tests__/mocks/factories.ts
decisions:
  - "Added chart.groupBy to createMockPrisma (test infrastructure gap for designer query)"
metrics:
  duration: "3m 19s"
  completed: "2026-05-17T21:53:19Z"
  tasks: 2
  files_created: 6
  files_modified: 5
  tests_added: 20
---

# Phase 19 Plan 01: Breakdown Query Layer Summary

Cached breakdown queries for size category, designer, and genre collection analysis with full TDD coverage and chart config definitions.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Extend types and chart configs | e3da3b6 | src/types/stats.ts, src/lib/chart-configs.ts, src/lib/chart-configs.test.ts |
| 2 (RED) | Failing tests for breakdown queries | 1cdbdb2 | size-breakdown.test.ts, designer-breakdown.test.ts, genre-breakdown.test.ts |
| 2 (GREEN) | Implement breakdown queries | 81dbe6f | size-breakdown.ts, designer-breakdown.ts, genre-breakdown.ts, index.ts |

## Implementation Details

### Types (src/types/stats.ts)
- `SizeBreakdownItem` -- category (string), count, fill (CSS var)
- `DesignerBreakdownItem` -- designerId, name, count
- `GenreBreakdownItem` -- genreId, name, count

### Chart Configs (src/lib/chart-configs.ts)
- `sizeCategoryConfig` -- 5 keys (Mini through BAP), colors var(--chart-1) through var(--chart-5)
- `designerBarConfig` -- single "count" key, color var(--chart-1)
- `genreDistributionConfig` -- single "count" key, color var(--chart-3)

### Queries
- `getSizeBreakdown(userId)` -- fetches all user's charts, buckets by calculateSizeCategory, returns fixed 5-item array. Uses getEffectiveStitchCount for stitchCount=0 fallback.
- `getDesignerBreakdown(userId, limit=10)` -- prisma.chart.groupBy on designerId, joins designer names, returns top-N sorted desc.
- `getGenreBreakdown(userId, limit=10)` -- prisma.genre.findMany with _count.charts filtered by userId, returns top-N sorted desc.
- All three: `unstable_cache`, 1-hour TTL, tagged "stats", userId-scoped cache keys.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added chart.groupBy to createMockPrisma**
- **Found during:** Task 2 (test setup)
- **Issue:** `createMockPrisma()` did not include `groupBy` on the `chart` model, needed for designer breakdown tests
- **Fix:** Added `groupBy: vi.fn()` to `chart` object in `src/__tests__/mocks/factories.ts`
- **Files modified:** src/__tests__/mocks/factories.ts
- **Commit:** 1cdbdb2

## Verification Results

- `npx vitest run src/lib/chart-configs.test.ts` -- 10 tests PASS
- `npx vitest run src/lib/queries/stats/size-breakdown.test.ts` -- 5 tests PASS
- `npx vitest run src/lib/queries/stats/designer-breakdown.test.ts` -- 4 tests PASS
- `npx vitest run src/lib/queries/stats/genre-breakdown.test.ts` -- 4 tests PASS
- All 44 tests in `src/lib/queries/stats/` pass
- `grep -c` confirms all 3 re-exports in index.ts

## TDD Gate Compliance

- RED gate: test(19-01) commit 1cdbdb2 (all tests fail before implementation)
- GREEN gate: feat(19-01) commit 81dbe6f (all tests pass after implementation)
- Task 1 combined RED+GREEN in single commit e3da3b6 (tests and implementation in same task per plan structure)

## Security

All three queries mitigate T-19-01/02/03 (Information Disclosure) by:
- Scoping via `project: { userId }` in WHERE clauses
- Including userId in cache keys (`stats-size-${userId}`, etc.)
- Server-side-only cache (not client-accessible)

## Known Stubs

None -- all queries return real computed data from Prisma.

## Self-Check: PASSED

- All 6 created files exist on disk
- All 5 modified files verified
- All 3 commits found in git log (e3da3b6, 1cdbdb2, 81dbe6f)
