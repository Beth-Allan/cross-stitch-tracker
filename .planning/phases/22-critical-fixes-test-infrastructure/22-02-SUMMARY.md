---
phase: 22-critical-fixes-test-infrastructure
plan: 02
subsystem: supply-actions, stats-actions
tags: [security-tests, ownership-validation, auth-pattern, zod-boundary-tests]
dependency_graph:
  requires: []
  provides:
    - "Supply action ownership rejection test coverage for all 7 project-scoped operations"
    - "Stats-actions auth pattern aligned with supply-actions (requireAuth outside try/catch)"
    - "Stats-actions Zod boundary test coverage for all parameter edges"
  affects:
    - src/lib/actions/supply-actions.test.ts
    - src/lib/actions/stats-actions.ts
    - src/lib/actions/stats-actions.test.ts
tech_stack:
  added: []
  patterns:
    - "Ownership rejection test pattern: mock userId 'other-user', assert { success: false } and mutation NOT called"
    - "Auth throw-through pattern: requireAuth() outside try/catch, tests use .rejects.toThrow('Unauthorized')"
key_files:
  created: []
  modified:
    - src/lib/actions/supply-actions.test.ts
    - src/lib/actions/stats-actions.ts
    - src/lib/actions/stats-actions.test.ts
decisions:
  - "Used 'other-user' convention for ownership rejection mocks (matches existing createAndAddThread pattern)"
  - "Added null-record tests for remove operations (record not found at all) alongside ownership tests"
metrics:
  duration: "3m 35s"
  completed: "2026-05-18T21:32:48Z"
  tasks_completed: 2
  tasks_total: 2
  test_count_before: 1967
  test_count_after: 1988
---

# Phase 22 Plan 02: Security & Auth Test Coverage Summary

Supply ownership rejection tests for all 7 project-scoped operations + stats-actions auth pattern fix with Zod boundary tests.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add ownership rejection tests for all 7 project-scoped supply operations | 8a6c4fe | 16 new tests in supply-actions.test.ts covering add/update/remove ownership rejection |
| 2 | Restructure stats-actions auth pattern and add auth/Zod boundary tests | 5b9a070 | requireAuth moved outside try/catch in all 3 functions; 7 new tests |

## What Changed

### Supply Actions Test Coverage (Task 1)

Added 16 ownership rejection tests across 7 project-scoped functions:

- **addThreadToProject** -- rejects when project belongs to different user + when project does not exist
- **addBeadToProject** -- rejects when project belongs to different user
- **addSpecialtyToProject** -- rejects when project belongs to different user
- **updateProjectSupplyQuantity** -- rejects for thread/bead/specialty when record belongs to different user
- **removeProjectThread** -- rejects when record belongs to different user + when record does not exist
- **removeProjectBead** -- rejects when record belongs to different user + when record does not exist
- **removeProjectSpecialty** -- rejects when record belongs to different user + when record does not exist

Every test verifies both the error response shape AND that the mutation mock was NOT called.

### Stats Actions Auth Pattern (Task 2)

Moved `requireAuth()` from inside `try/catch` to before `try` in all 3 stats-actions functions:
- `fetchCalendarMonth`
- `fetchDailyBreakdown`
- `fetchMonthlyTotals`

This aligns stats-actions with the established supply-actions pattern (D-09) where auth failures throw through to Next.js error boundary rather than being swallowed as generic errors.

Added 7 new tests:
- 3 auth rejection tests using `.rejects.toThrow("Unauthorized")` pattern (D-10)
- 4 Zod boundary tests: month=0, month=13, year=2019, year=2101

## Deviations from Plan

### Auto-added Items

**1. [Rule 2 - Missing Tests] Added null-record tests for remove operations**
- **Found during:** Task 1
- **Issue:** Plan specified 9 ownership tests but remove functions also have a null-record code path (record not found at all, not just wrong user) that was untested
- **Fix:** Added 3 additional tests for removeProjectThread/Bead/Specialty with null mock
- **Files modified:** src/lib/actions/supply-actions.test.ts
- **Commit:** 8a6c4fe

**2. [Rule 2 - Missing Tests] Added project-not-found test for addThreadToProject**
- **Found during:** Task 1
- **Issue:** The existing ownership test pattern only checked "other-user" but the production code also has a `!project` null guard
- **Fix:** Added test for null project (project does not exist) in addThreadToProject
- **Files modified:** src/lib/actions/supply-actions.test.ts
- **Commit:** 8a6c4fe

## Verification Results

- `npx vitest run src/lib/actions/supply-actions.test.ts` -- 80 tests passed
- `npx vitest run src/lib/actions/stats-actions.test.ts` -- 15 tests passed
- `grep -c 'other-user' src/lib/actions/supply-actions.test.ts` -- 13 (>= 12 required)
- `grep -c 'rejects.toThrow' src/lib/actions/stats-actions.test.ts` -- 3 (>= 3 required)
- `npx vitest run` -- 1988 tests passed, 0 failures
- `npx tsc --noEmit` -- only pre-existing Prisma generated client errors (not related to changes)

## Threat Mitigations

| Threat ID | Status | Evidence |
|-----------|--------|----------|
| T-22-03 (Elevation of Privilege) | Mitigated | All 7 project-scoped functions have ownership rejection tests verifying { success: false } and mutation NOT called |
| T-22-04 (Spoofing) | Mitigated | requireAuth() outside try/catch in all 3 stats functions; tests verify .rejects.toThrow("Unauthorized") |
| T-22-05 (Tampering) | Mitigated | Zod boundary tests verify month=0, month=13, year=2019, year=2101 rejected before query execution |

## Known Stubs

None -- all tests are fully wired to production code paths.

## Self-Check: PASSED

- All 3 modified files exist on disk
- Both task commits verified in git log (8a6c4fe, 5b9a070)
- No unexpected file deletions
