---
phase: "09-dashboards-shopping-cart"
plan: "01"
subsystem: "dashboard-data-layer"
tags: [dashboard, server-actions, tdd, types]
dependency_graph:
  requires: []
  provides: [dashboard-types, main-dashboard-actions, spotlight-action]
  affects: [09-02, 09-03, 09-04, 09-05, 09-06, 09-07, 09-08, 09-09]
tech_stack:
  added: []
  patterns: [Promise.all-parallel-fetch, server-side-random, dynamic-threshold]
key_files:
  created:
    - src/types/dashboard.ts
    - src/lib/actions/dashboard-actions.ts
    - src/lib/actions/dashboard-actions.test.ts
  modified:
    - src/__tests__/mocks/factories.ts
decisions:
  - "Collection stats totalUnstarted includes UNSTARTED + KITTING + KITTED statuses"
  - "Buried treasures queries charts with UNSTARTED project OR no project (chart.project is null)"
  - "Spotlight uses Prisma findFirst with random skip for server-side randomness"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-18T03:52:40Z"
  tasks_completed: 2
  tasks_total: 2
  test_count: 14
  files_created: 3
  files_modified: 1
---

# Phase 9 Plan 01: Main Dashboard Types & Actions Summary

TDD data layer for main dashboard: 22 TypeScript interfaces + 2 server actions with 14 passing tests covering auth, currently stitching sort/progress, start next filtering, buried treasures dynamic threshold, collection stats aggregation, and spotlight random selection.

## Task Results

| Task | Name | Type | Commit | Status |
|------|------|------|--------|--------|
| 1 | Define dashboard types and write failing tests (RED) | test | `49949b1` | Done |
| 2 | Implement dashboard actions to make all tests pass (GREEN) | feat | `d2d6893` | Done |

## What Was Built

### Types (`src/types/dashboard.ts`)
- **Main Dashboard:** `CurrentlyStitchingProject`, `StartNextProject`, `BuriedTreasure`, `SpotlightProject`, `CollectionStats`, `MainDashboardData`
- **Project Dashboard:** `HeroStatsData`, `ProgressBucketId`, `BucketProject`, `ProgressBucket`, `FinishedProjectData`, `ProjectDashboardData`
- **Shopping Cart:** `ShoppingCartProject`, `ShoppingSupplyNeed`, `ShoppingFabricNeed`, `ShoppingCartData`

### Actions (`src/lib/actions/dashboard-actions.ts`)
- `getMainDashboardData()` -- parallel fetches 5 data sections via Promise.all()
- `getSpotlightProject()` -- server action for shuffle button, server-side random

### Key Implementation Details
- **Currently Stitching:** IN_PROGRESS + ON_HOLD, sorted by most recent session date DESC (null last), progress capped at 100%
- **Start Next:** wantToStartNext=true with UNSTARTED/KITTED, limited to top 2
- **Buried Treasures:** Dynamic 10% threshold with Math.max(ceil, 1) minimum, Math.min(threshold, 5) maximum
- **Collection Stats:** Aggregated counts across all projects, mostRecentFinish by latest finishDate, largestProject by highest stitchCount
- **Spotlight:** Server-side random via prisma.project.count + findFirst with skip

### Mock Factory Extensions
- Added `project.count`, `project.findFirst` to `createMockPrisma()`
- Added `stitchSession.groupBy` to `createMockPrisma()`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test mock data missing sessions field for currently stitching query**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** Collection stats tests mocked `project.findMany` with an implementation that returned projects without `sessions` and incomplete `chart` fields. When the currently stitching query matched the status filter, it crashed on `p.sessions[0]?.date`.
- **Fix:** Added `sessions: []` and full chart shape (`coverThumbnailUrl`, `designer`) to WIP mock projects in collection stats tests
- **Files modified:** `src/lib/actions/dashboard-actions.test.ts`
- **Commit:** `d2d6893`

## TDD Gate Compliance

- RED gate: `49949b1` (test commit with all 14 tests failing)
- GREEN gate: `d2d6893` (feat commit with all 14 tests passing)
- REFACTOR gate: Not needed -- code is clean as-is

## Threat Mitigations

| Threat ID | Status | Evidence |
|-----------|--------|----------|
| T-09-01 (Information Disclosure) | Mitigated | All 5 internal query functions accept `userId` parameter; every Prisma query filters by `userId` |
| T-09-02 (Spoofing) | Mitigated | Both `getMainDashboardData` and `getSpotlightProject` call `requireAuth()` first; auth test verifies rejection |

## Self-Check: PASSED

- [x] `src/types/dashboard.ts` -- FOUND
- [x] `src/lib/actions/dashboard-actions.ts` -- FOUND
- [x] `src/lib/actions/dashboard-actions.test.ts` -- FOUND
- [x] Commit `49949b1` -- FOUND
- [x] Commit `d2d6893` -- FOUND
- [x] All 14 tests passing
