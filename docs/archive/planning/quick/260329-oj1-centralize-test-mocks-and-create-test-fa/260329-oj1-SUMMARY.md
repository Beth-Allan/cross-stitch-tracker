---
phase: quick
plan: 260329-oj1
subsystem: testing
tags: [vitest, factories, mocks, testing-infrastructure]

requires:
  - phase: 02-core-project-management
    provides: chart-add-form.test.tsx, chart-edit-modal.test.tsx, chart-actions.test.ts
provides:
  - Reusable test factories for Chart, Project, Designer, Genre domain objects
  - createMockPrisma and createMockRouter helpers for vi.mock setup
  - MOCK_PATTERNS reference for standard module mock patterns
affects: [all-future-test-files, phase-02, phase-03, phase-04]

tech-stack:
  added: []
  patterns: [test-factory-pattern, centralized-mock-data]

key-files:
  created:
    - src/__tests__/mocks/factories.ts
    - src/__tests__/mocks/module-mocks.ts
    - src/__tests__/mocks/index.ts
  modified:
    - src/components/features/charts/chart-add-form.test.tsx
    - src/components/features/charts/chart-edit-modal.test.tsx
    - src/lib/actions/chart-actions.test.ts

key-decisions:
  - "vi.mock calls stay in test files due to Vitest hoisting; only data factories and mock object creators are shared"
  - "Factory functions accept Partial<T> overrides for flexible customization with type-safe defaults"

patterns-established:
  - "Test factory pattern: createMock{Entity}(overrides?) returns full typed objects with sensible defaults"
  - "Mock object creators: createMockPrisma(), createMockRouter() for use inside vi.mock factory functions"

requirements-completed: []

duration: 3min
completed: 2026-03-29
---

# Quick Task 260329-oj1: Centralize Test Mocks Summary

**Type-safe test factories for Chart/Project/Designer/Genre with centralized mock helpers, replacing copy-pasted inline definitions across 3 test files**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T23:42:56Z
- **Completed:** 2026-03-29T23:46:13Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created 7 factory functions (createMockDesigner, createMockGenre, createMockProject, createMockChart, createMockChartWithRelations, createMockPrisma, createMockRouter) with full Prisma type coverage
- Refactored all 3 existing test files to import from centralized mocks, eliminating 63 lines of duplicated mock definitions
- Fixed pre-existing type error in chart-edit-modal.test.tsx (project mock was missing finishPhotoUrl and stitchesCompleted fields)
- All 41 tests pass with zero type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test factories and module mock helpers** - `e3a8868` (feat)
2. **Task 2: Refactor existing test files to use centralized factories** - `00676af` (refactor)

## Files Created/Modified

- `src/__tests__/mocks/factories.ts` - Type-safe factory functions for all domain objects + mock Prisma/Router creators
- `src/__tests__/mocks/module-mocks.ts` - MOCK_PATTERNS reference documenting standard vi.mock patterns
- `src/__tests__/mocks/index.ts` - Barrel export for all mocks
- `src/components/features/charts/chart-add-form.test.tsx` - Replaced inline mockDesigners/mockGenres with factory calls
- `src/components/features/charts/chart-edit-modal.test.tsx` - Replaced inline mockChart/mockDesigners/mockGenres with factory calls
- `src/lib/actions/chart-actions.test.ts` - Replaced inline prisma mock with createMockPrisma()

## Decisions Made

- **vi.mock stays in test files:** Vitest hoists vi.mock calls to the top of the file at transform time. Sharing vi.mock calls across files is not possible. Only data factories and mock object creators are centralized.
- **Partial<T> override pattern:** Each factory accepts optional Partial<T> overrides so tests can specify only the fields they care about while getting sensible defaults for everything else.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing type error in chart-edit-modal.test.tsx**
- **Found during:** Task 2 (refactoring to use factories)
- **Issue:** Inline mockChart.project was missing `finishPhotoUrl` and `stitchesCompleted` fields required by the Project type
- **Fix:** createMockProject factory includes all Project fields, so the factory-based mock is fully typed
- **Files modified:** src/components/features/charts/chart-edit-modal.test.tsx
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** 00676af (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Type error fix was a natural side-effect of using properly-typed factories. No scope creep.

## Issues Encountered

- Prisma client not generated in worktree (gitignored). Ran `npx prisma generate` after temporarily removing deprecated `url` from datasource block (Prisma 7 requires connection config in prisma.config.ts). Reverted schema change after generation.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all factories produce complete typed objects.

## Self-Check: PASSED

- All 3 created files exist
- Both task commits verified (e3a8868, 00676af)

---
*Quick task: 260329-oj1*
*Completed: 2026-03-29*
