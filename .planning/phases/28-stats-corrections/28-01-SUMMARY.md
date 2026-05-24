---
phase: 28-stats-corrections
plan: 01
subsystem: stats-data-layer
tags: [stats, queries, insights, hero-stats, status-filter]
dependency_graph:
  requires: []
  provides: [resolveStatusFilter, STATUS_GROUPS, StatusGroup, collectionTotalStitches, status-search-param]
  affects: [stats-page, overview-tab, records-tab]
tech_stack:
  added: []
  patterns: [status-group-mapping, library-wide-queries]
key_files:
  created:
    - src/lib/utils/status-groups.ts
    - src/lib/utils/status-groups.test.ts
  modified:
    - src/types/stats.ts
    - src/app/(dashboard)/stats/search-params.ts
    - src/app/(dashboard)/stats/page.tsx
    - src/lib/queries/stats/hero-stats.ts
    - src/lib/queries/stats/hero-stats.test.ts
    - src/lib/queries/stats/thread-insights.ts
    - src/lib/queries/stats/thread-insights.test.ts
    - src/lib/queries/stats/designer-insights.ts
    - src/lib/queries/stats/designer-insights.test.ts
    - src/lib/queries/stats/genre-insights.ts
    - src/lib/queries/stats/genre-insights.test.ts
    - src/__tests__/mocks/factories.ts
decisions:
  - "Genre insights rank by chart.stitchCount (library data) instead of session stitchCount sums"
  - "Status filter cache key uses sorted comma-joined groups or 'all' for consistent caching"
metrics:
  duration: "~9 minutes"
  completed: 2026-05-24T01:32:05Z
---

# Phase 28 Plan 01: Data Layer + Insight Query Rewrites Summary

Status group utility with library-wide insight queries and collection total hero stat, replacing session-gated scope filtering.

## Changes Made

### Task 1: Status-groups utility + search params (644d002)
- Created `src/lib/utils/status-groups.ts` with `STATUS_GROUPS`, `StatusGroup` type, and `resolveStatusFilter()` mapping 3 groups to ProjectStatus arrays
- Added `status` array param to `statsSearchParamsCache` via `parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",")`
- 9 test cases covering all groups, combinations, unknown input, and type safety

### Task 2: Insight query rewrites + collection total (b1064da)
- Added `collectionTotalStitches: number` to `StatsHeroData` interface
- Added 7th query to hero stats Promise.all: `prisma.chart.aggregate({ _sum: { stitchCount: true } })` scoped to user's projects
- Rewrote `getThreadInsights`, `getDesignerInsights`, `getGenreInsights` signatures: `scope: Scope` replaced with `statusGroups: string[]`
- Removed all `buildDateFilter`/`Scope` imports and session-gated where clauses from insight queries
- Added `resolveStatusFilter(statusGroups)` call with conditional status filter in Prisma where clauses
- Genre insights: switched from session stitchCount sums to `chart.stitchCount` for library-wide ranking
- Fixed cache keys to use sorted statusGroups instead of scope string
- Set fixed `revalidate: 300` on all insight queries (removed year-based conditional)
- Updated `stats/page.tsx` to extract `status` from parsed params and pass to insight queries
- Added `chart.aggregate` to mock Prisma factory (Rule 3: blocking mock missing)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mock Prisma factory missing chart.aggregate**
- **Found during:** Task 2 RED phase
- **Issue:** `createMockPrisma()` had no `aggregate` method on the `chart` model, causing tests to throw
- **Fix:** Added `aggregate: vi.fn()` to `chart` model in `src/__tests__/mocks/factories.ts`
- **Files modified:** `src/__tests__/mocks/factories.ts`
- **Commit:** b1064da

**2. [Rule 3 - Blocking] Stats page callers needed signature update**
- **Found during:** Task 2 GREEN phase
- **Issue:** `stats/page.tsx` passed `scope` (string) to insight functions that now expect `statusGroups` (string[])
- **Fix:** Destructured `status` from `parsedParams`, passed `status` array to all 3 insight query calls
- **Files modified:** `src/app/(dashboard)/stats/page.tsx`
- **Commit:** b1064da

## Test Results

| File | Tests | Status |
|------|-------|--------|
| status-groups.test.ts | 9 | PASS |
| hero-stats.test.ts | 8 | PASS |
| thread-insights.test.ts | 7 | PASS |
| designer-insights.test.ts | 6 | PASS |
| genre-insights.test.ts | 6 | PASS |
| **Full suite** | **2216** | **PASS** |

## Threat Mitigations Verified

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-28-01: URL status param tampering | `parseAsStringLiteral` rejects invalid values; `resolveStatusFilter` ignores unknown keys | Implemented |
| T-28-02: Collection total data leakage | Filtered by `projects: { some: { userId } }` | Implemented |
| T-28-03: Insight query data leakage | All queries filter by userId; status filter is additive restriction | Implemented |

## Self-Check: PASSED
