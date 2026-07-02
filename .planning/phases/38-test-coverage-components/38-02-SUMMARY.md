---
phase: 38-test-coverage-components
plan: 02
subsystem: chart-form-tests
tags: [testing, backlog-closure, test-coverage]
dependency_graph:
  requires: []
  provides: [seriesId-flow-through-tests, zip-validation-test, calcParams-rollback-tests]
  affects: [chart-actions.test.ts, chart-file-upload.test.tsx, supplies-tab.nyquist.test.tsx]
tech_stack:
  added: []
  patterns: [vitest-mock-assertion, startTransition-rollback-testing]
key_files:
  modified:
    - src/lib/actions/chart-actions.test.ts
    - src/components/features/charts/form-primitives/chart-file-upload.test.tsx
    - src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx
decisions:
  - "D-11: seriesId flows through to prisma.chart.create and prisma.chart.update"
  - "D-10: .zip file passes client-side validateFile"
  - "D-08: calcParams roll back to serverCalcParams on updateProjectSettings failure"
  - "D-09: 999.79 already covered by chart-actions-settings.test.ts (9 tests)"
  - "D-12: 999.82 already covered by use-chart-form.test.tsx (4 guard tests)"
metrics:
  duration: 7m
  completed: 2026-07-02
---

# Phase 38 Plan 02: Chart Form Component Test Gaps Summary

seriesId flow-through verified in create+update Prisma payloads, .zip validation confirmed, calcParams rollback tested for both failure modes, 999.79 and 999.82 verified as already covered.

## Task Summary

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | seriesId flow-through and zip validation tests | d979db0 | chart-actions.test.ts, chart-file-upload.test.tsx |
| 2 | calcParams error rollback tests and verify-and-close | 2547fb4 | supplies-tab.nyquist.test.tsx |

## What Was Built

### Task 1: seriesId flow-through and zip validation (999.80, 999.81)

**chart-actions.test.ts** -- 3 new tests in "seriesId flow-through" describe:
- `includes seriesId in create payload when provided` -- passes seriesId: "series-1" to createChartWithSupplies, asserts prisma.chart.create called with data containing seriesId: "series-1"
- `includes null seriesId in create payload when not provided` -- omits seriesId from input, asserts prisma.chart.create called with data containing seriesId: null (Zod default)
- `includes seriesId in update payload when provided` -- calls updateChart with seriesId: "series-1", mocks findUnique for ownership check and $transaction, asserts prisma.chart.update called with data containing seriesId: "series-1"

**chart-file-upload.test.tsx** -- 1 new test:
- `accepts .zip file and triggers upload` -- creates File with name "patterns.zip" and type "application/zip", fires change event, verifies onFilesChange called with correct filename and mimeType

### Task 2: calcParams error rollback (999.78) and verify-and-close (999.79, 999.82)

**supplies-tab.nyquist.test.tsx** -- 2 new tests in "calcParams error rollback" describe:
- `rolls back calcParams and shows toast.error when updateProjectSettings returns failure` -- renders SuppliesTab with calculator prop, clicks "Stitch over 1 thread" button to change overCount, mocks updateProjectSettings to return {success: false}, verifies toast.error("Couldn't save settings. Please try again.") and aria-pressed reverts to Over 2
- `rolls back calcParams and shows toast.error when updateProjectSettings throws` -- same setup but mocks rejection with Error, verifies same rollback + toast behavior

### Verify-and-Close

- **999.79** (updateProjectSettings server action tests): Confirmed covered by `chart-actions-settings.test.ts` with 9 existing tests -- auth rejection, 4 Zod boundary tests (strandCount below 1, above 6, overCount, wastePercent), ownership validation, happy path, partial update, Prisma error
- **999.82** (handleAddSeries empty/whitespace guards): Confirmed covered by `use-chart-form.test.tsx` with 4 guard tests -- "does not call server action when name is empty" (x2 for StorageLocation + Series) and "does not call server action when name is whitespace only" (x2)

## Test Results

- chart-actions.test.ts: 15 tests (3 new + 12 existing)
- chart-file-upload.test.tsx: 7 tests (1 new + 6 existing)
- supplies-tab.nyquist.test.tsx: 4 tests (2 new + 2 existing)
- Total new tests: 6
- All 26 tests pass with zero regressions

## Backlog Items Closed

| Item | Description | Resolution |
|------|-------------|------------|
| 999.78 | handleCalcParamsChange error/rollback test coverage | 2 tests added |
| 999.80 | Client-side zip validation test | 1 test added |
| 999.81 | seriesId flow-through tests | 3 tests added |
| 999.79 | updateProjectSettings server action tests | Verified covered (9 existing tests) |
| 999.82 | handleAddSeries empty/whitespace guards | Verified covered (4 existing tests) |

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 4 files found on disk
- Both commit hashes (d979db0, 2547fb4) found in git log
