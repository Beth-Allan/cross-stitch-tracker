---
phase: 06-gallery-cards-view-modes
plan: 01
subsystem: ui
tags: [nuqs, gallery, url-state, prisma, typescript, sorting, filtering]

# Dependency graph
requires:
  - phase: 05-foundation-quick-wins
    provides: Chart/Project CRUD, supply junction tables, fabric linking
provides:
  - GalleryCardData type system with StatusGroup, KittingItemStatus, ViewMode, SortField, SortDir
  - gallery-utils with getStatusGroup, computeKittingDots, transformToGalleryCard, compareFn, filterAndSort
  - useGalleryFilters hook with nuqs URL state for 6 params
  - getChartsForGallery server action with supply _count
  - createMockGalleryCard test factory
affects: [06-02, 06-03, 06-04]

# Tech tracking
tech-stack:
  added: [nuqs 2.8.9]
  patterns: [nuqs URL state with parseAsStringLiteral/parseAsArrayOf, NuqsTestingAdapter for hook tests, filterAndSort pure function extraction]

key-files:
  created:
    - src/components/features/gallery/gallery-types.ts
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/gallery/gallery-utils.test.ts
    - src/components/features/gallery/use-gallery-filters.ts
    - src/components/features/gallery/use-gallery-filters.test.ts
    - src/lib/actions/chart-actions-gallery.test.ts
  modified:
    - package.json
    - src/app/layout.tsx
    - src/__tests__/mocks/factories.ts
    - src/lib/actions/chart-actions.ts
    - src/types/chart.ts

key-decisions:
  - "Extracted filterAndSort as pure function in gallery-utils for testability — hook is thin nuqs glue"
  - "Used nuqs NuqsTestingAdapter for hook integration tests instead of mocking useQueryState"
  - "getChartsForGallery uses select (not include) on project for lighter query"

patterns-established:
  - "nuqs URL state: parseAsStringLiteral for enums, parseAsArrayOf for multi-select, NuqsAdapter in root layout"
  - "Pure function extraction: complex logic in testable utils, hooks as thin glue over URL state"
  - "Gallery data flow: server fetches all, client filters/sorts via useMemo"

requirements-completed: [GLRY-01, GLRY-04]

# Metrics
duration: 7min
completed: 2026-04-13
---

# Phase 6 Plan 01: Gallery Data Layer Summary

**Gallery type system, utility functions, URL state hook, and server action providing the data foundation for all gallery views**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-13T16:25:34Z
- **Completed:** 2026-04-13T16:32:30Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Complete gallery type system: GalleryCardData, StatusGroup, KittingItemStatus, ViewMode, SortField, SortDir with const arrays for nuqs parsers
- All utility functions with 43 tests: status mapping, kitting dot computation, data transformation, 6-field sort comparator, celebration styles, status gradients
- useGalleryFilters hook managing 6 URL params via nuqs with 17 tests covering filtering, sorting, toggle, and clear
- getChartsForGallery server action with optimized select query including supply _count, with 6 tests
- nuqs 2.8.9 installed (pinned exact) with NuqsAdapter wired in root layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Install nuqs, create gallery type system, and data transformation utilities with tests** - `b65add3` (feat)
2. **Task 2: Create useGalleryFilters hook with nuqs URL state management and tests** - `a60214f` (feat)
3. **Task 3: Extend chart-actions with getChartsForGallery server action and tests** - `96d386d` (feat)

## Files Created/Modified
- `src/components/features/gallery/gallery-types.ts` - GalleryCardData, StatusGroup, KittingItemStatus, ViewMode, SortField, SortDir, GalleryChartWithProject
- `src/components/features/gallery/gallery-utils.ts` - getStatusGroup, computeKittingDots, transformToGalleryCard, compareFn, filterAndSort, STATUS_GRADIENTS, getCelebrationStyles
- `src/components/features/gallery/gallery-utils.test.ts` - 43 tests across 8 describe blocks
- `src/components/features/gallery/use-gallery-filters.ts` - useGalleryFilters hook with nuqs URL state
- `src/components/features/gallery/use-gallery-filters.test.ts` - 17 tests: 8 pure function + 9 hook integration
- `src/lib/actions/chart-actions.ts` - Added getChartsForGallery with optimized select query
- `src/lib/actions/chart-actions-gallery.test.ts` - 6 tests for auth, scoping, includes, ordering
- `src/types/chart.ts` - Added GalleryProjectData and GalleryChartData types
- `src/app/layout.tsx` - Added NuqsAdapter wrapping children
- `package.json` - Added nuqs 2.8.9 (exact pin)
- `src/__tests__/mocks/factories.ts` - Added createMockGalleryCard factory

## Decisions Made
- Extracted `filterAndSort` as a pure function in gallery-utils.ts for direct testability. The hook is thin glue over nuqs state + this function. This avoids complex hook mocking while ensuring filtering/sorting logic has comprehensive coverage.
- Used nuqs `NuqsTestingAdapter` with `hasMemory: true` for hook integration tests rather than mocking `useQueryState`. This tests the real nuqs behavior.
- `getChartsForGallery` uses `select` (not `include`) on the project relation to fetch only the fields needed for gallery cards (lighter query than `getCharts`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added filterAndSort pure function**
- **Found during:** Task 2 (useGalleryFilters hook)
- **Issue:** Plan suggested extracting filtering/sorting logic as "alternative approach" but the hook needed this for testability
- **Fix:** Added filterAndSort to gallery-utils.ts, used by both the hook and directly in tests
- **Files modified:** src/components/features/gallery/gallery-utils.ts
- **Verification:** 8 pure function tests + 9 hook integration tests pass
- **Committed in:** b65add3 (Task 1 commit, since utils file was created there)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Improved testability. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All gallery types, utilities, and server action ready for Plan 02 (Gallery Card Components) and Plan 03 (View Modes & Filter Bar)
- createMockGalleryCard factory available for downstream component tests
- 634 total tests passing, all clean

## Self-Check: PASSED

All 7 created files verified present. All 3 commit hashes verified in git log.

---
*Phase: 06-gallery-cards-view-modes*
*Completed: 2026-04-13*
