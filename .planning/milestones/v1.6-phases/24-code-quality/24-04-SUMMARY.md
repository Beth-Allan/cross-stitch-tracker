---
phase: 24-code-quality
plan: 04
subsystem: test-infrastructure
tags: [testing, assertions, code-quality, refactor]
dependency_graph:
  requires: []
  provides: [assertSuccess-helper, assertFailure-helper, vacuous-assertion-free-tests]
  affects: [all-server-action-tests, factories-mock]
tech_stack:
  added: []
  patterns: [assertion-narrowing-helpers, asserts-return-type]
key_files:
  created:
    - src/__tests__/mocks/factories.test.ts (assertSuccess/assertFailure tests)
  modified:
    - src/__tests__/mocks/factories.ts
    - src/lib/validations/chart.test.ts
    - src/lib/actions/upload-actions.test.ts
    - src/lib/actions/chart-file-actions.test.ts
    - src/lib/actions/designer-actions.test.ts
    - src/lib/actions/supply-actions.test.ts
    - src/lib/actions/chart-actions.test.ts
    - src/lib/actions/genre-actions.test.ts
    - src/lib/actions/fabric-actions.test.ts
    - src/lib/actions/chart-actions-thumbnail.test.ts
    - src/lib/actions/storage-location-actions.test.ts
    - src/lib/actions/stitching-app-actions.test.ts
    - src/lib/actions/session-actions.test.ts
    - src/lib/actions/chart-actions-errors.test.ts
    - src/lib/actions/chart-actions-settings.test.ts
    - src/lib/actions/shopping-cart-actions.test.ts
    - src/lib/actions/shopping-actions.test.ts
decisions:
  - "D-11 fulfilled: assertSuccess/assertFailure helpers with TypeScript asserts return types"
  - "D-12 fulfilled: All vacuous if(result.success) patterns eliminated from test suite"
  - "D-13 fulfilled: Phase 22 deferral (D-07/D-08 from 22-CONTEXT.md) completed"
  - "D-04 fulfilled: Test file section markers removed from chart-actions.test.ts and supply-actions.test.ts"
  - "999.48 resolved: createMockStitchSession now uses Partial<StitchSession> from Prisma"
metrics:
  duration: 13m
  completed: 2026-05-19T01:34:20Z
  tasks_completed: 2
  tasks_total: 2
  files_modified: 17
  tests_passed: 508
---

# Phase 24 Plan 04: Vacuous Assertion Sweep Summary

assertSuccess/assertFailure narrowing helpers added to test factories; ~126 vacuous assertion patterns replaced across 16 test files; createMockStitchSession fixed to use Prisma type; test file section markers removed per QUAL-07.

## Task Results

### Task 1: Add assertSuccess/assertFailure helpers and fix createMockStitchSession type (TDD)

| Gate | Commit | Description |
|------|--------|-------------|
| RED | c0e091d | 6 failing tests for assertSuccess/assertFailure (pass, throw, narrowing) |
| GREEN | 874d4b2 | Helpers implemented with `asserts result is T & { success: true/false }` return types |

- `assertSuccess<T>` throws with JSON context when `result.success` is false
- `assertFailure<T>` throws with JSON context when `result.success` is true
- Both use TypeScript `asserts` return types for compile-time narrowing
- `createMockStitchSession` parameter changed from inline anonymous type to `Partial<StitchSession>` -- catches schema drift automatically

### Task 2: Sweep vacuous assertions and remove section markers

| Commit | Description |
|--------|-------------|
| b452a0c | ~126 patterns replaced across 16 files, 14 section markers removed |

**Instances replaced per file:**

| File | Success | Failure | Total |
|------|---------|---------|-------|
| session-actions.test.ts | 16 | 9 | 25 |
| supply-actions.test.ts | 7 | 17 | 24 |
| fabric-actions.test.ts | 3 | 16 | 19 |
| upload-actions.test.ts | 1 | 11 | 12 |
| chart-file-actions.test.ts | 2 | 8 | 10 |
| chart.test.ts | 6 | 0 | 6 |
| designer-actions.test.ts | 1 | 5 | 6 |
| genre-actions.test.ts | 1 | 5 | 6 |
| storage-location-actions.test.ts | 1 | 3 | 4 |
| chart-actions.test.ts | 2 | 1 | 3 |
| stitching-app-actions.test.ts | 1 | 2 | 3 |
| chart-actions-thumbnail.test.ts | 2 | 0 | 2 |
| chart-actions-errors.test.ts | 0 | 2 | 2 |
| shopping-cart-actions.test.ts | 0 | 2 | 2 |
| chart-actions-settings.test.ts | 0 | 1 | 1 |
| shopping-actions.test.ts | 0 | 1 | 1 |

**Section markers removed:**
- supply-actions.test.ts: 11 `// ─── ... ───` markers (Auth Guard, Thread CRUD, Bead CRUD, etc.) -- all redundant with describe block names
- chart-actions.test.ts: 1 `// ─── updateChartStatus cache invalidation ───` marker

**Net effect:** -224 lines (334 additions, 558 deletions) -- tests are more concise and safer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Non-adjacent vacuous pattern in session-actions.test.ts**
- **Found during:** Task 2, line 776-781
- **Issue:** One pattern had `expect(mockPrisma.$transaction).toHaveBeenCalled()` between `expect(result.success).toBe(true)` and `if (result.success)`, causing the automated regex to miss it
- **Fix:** Manually replaced with `assertSuccess(result)` and de-indented assertions
- **Commit:** b452a0c

**2. [Rule 2 - Critical] All supply-actions.test.ts section markers removed (not just 2)**
- **Found during:** Task 2
- **Issue:** Plan specified removing markers at lines ~1423 and ~1502, but comment-conventions.md rule prohibits ALL `// ─── ───` markers in test files where describe blocks provide structure. All 11 markers were redundant.
- **Fix:** Removed all 11 markers per comment-conventions.md (D-04)
- **Commit:** b452a0c

## Backlog Items Resolved

- **999.48:** createMockStitchSession uses `Partial<StitchSession>` from Prisma (was inline anonymous type)
- **999.57:** Section markers removed from chart-actions.test.ts:229 and supply-actions.test.ts:1423,1502

## Self-Check: PASSED

- All key files verified present on disk
- All 3 commits verified in git log (c0e091d, 874d4b2, b452a0c)
- No unexpected file deletions
- 508 tests passing across 25 test files
- Zero remaining vacuous assertion patterns in target files
