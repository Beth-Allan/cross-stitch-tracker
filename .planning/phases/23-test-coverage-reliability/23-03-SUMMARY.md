---
phase: 23-test-coverage-reliability
plan: 03
subsystem: actions/cache-invalidation
tags: [cache, stats, revalidation, supply-actions, chart-actions, tdd]
dependency_graph:
  requires: []
  provides: [stats-cache-invalidation-supply, stats-cache-invalidation-chart, resolveDefaultBrandId-tests]
  affects: [stats-page, supply-mutations, chart-status-changes]
tech_stack:
  added: []
  patterns: [revalidateTag-blanket-invalidation]
key_files:
  created: []
  modified:
    - src/lib/actions/chart-actions.ts
    - src/lib/actions/chart-actions.test.ts
    - src/lib/actions/supply-actions.ts
    - src/lib/actions/supply-actions.test.ts
decisions:
  - "Blanket revalidateTag('stats') on all supply mutations per D-09/D-10 -- over-invalidation cost negligible for single-user app"
metrics:
  duration: "~7 minutes"
  completed: "2026-05-18T23:32:14Z"
  tasks: 2
  tests_added: 5
  tests_total: 2015
---

# Phase 23 Plan 03: Cache Staleness Fixes Summary

Stats cache invalidation on chart status and supply mutations, plus resolveDefaultBrandId edge case test coverage via public API.

## What Changed

### chart-actions.ts (RELY-02)
- Added `revalidateTag` import alongside existing `revalidatePath`
- `updateChartStatus` now calls `revalidateTag("stats", { expire: 0 })` after successful status update
- Prevents stale collection breakdowns, hero stats, and completion estimates when chart status changes

### supply-actions.ts (RELY-03)
- Added `revalidateTag` import alongside existing `revalidatePath`
- All 22 mutation functions now call `revalidateTag("stats", { expire: 0 })` after their `revalidatePath` calls
- Covers: createThread, updateThread, deleteThread, createBead, updateBead, deleteBead, createSpecialtyItem, updateSpecialtyItem, deleteSpecialtyItem, createSupplyBrand, updateSupplyBrand, deleteSupplyBrand, addThreadToProject, addBeadToProject, addSpecialtyToProject, updateProjectSupplyQuantity, removeProjectThread, removeProjectBead, removeProjectSpecialty, createAndAddThread, createAndAddBead, createAndAddSpecialty

### Test Coverage (TEST-01, RELY-02, RELY-03)
- 3 resolveDefaultBrandId edge case tests via public createThread/createBead API
- 1 chart-actions revalidateTag assertion on updateChartStatus
- 1 supply-actions revalidateTag assertion on createThread
- Updated `next/cache` mock to include `revalidateTag: vi.fn()` in both test files

## TDD Gate Compliance

- RED: `d807cff` -- 5 tests added, 2 fail (revalidateTag not yet implemented), 3 pass (existing resolveDefaultBrandId behavior)
- GREEN: `40c0a0b` -- all 96 tests pass after adding revalidateTag to production code
- REFACTOR: not needed -- changes are minimal additions with no cleanup required

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 (RED) | `d807cff` | Failing tests for stats cache invalidation + resolveDefaultBrandId edge cases |
| 2 (GREEN) | `40c0a0b` | Production code: revalidateTag on chart + 22 supply mutations |

## Backlog Items Resolved

- 999.41: Stats cache staleness on chart status change
- 999.42: Stats cache staleness on supply mutations

## Self-Check: PASSED

- All 4 modified files exist on disk
- Commit d807cff (RED) exists in git log
- Commit 40c0a0b (GREEN) exists in git log
- 2015 tests pass, zero regressions
- chart-actions.ts has 1 revalidateTag call
- supply-actions.ts has 22 revalidateTag calls
