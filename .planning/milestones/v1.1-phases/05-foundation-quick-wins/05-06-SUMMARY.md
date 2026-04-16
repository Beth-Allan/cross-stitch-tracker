---
phase: 05-foundation-quick-wins
plan: 06
subsystem: ui
tags: [prisma, react, forms, inline-creation, searchable-select]

# Dependency graph
requires:
  - phase: 05-foundation-quick-wins/05-01
    provides: Schema with StorageLocation and StitchingApp models
  - phase: 05-foundation-quick-wins/05-04
    provides: Storage location and stitching app server actions
provides:
  - Inline creation of storage locations and stitching apps from chart form dropdowns
  - Regenerated Prisma client matching current schema
affects: [chart-form, storage-locations, stitching-apps]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline-entity-creation-from-form-dropdowns]

key-files:
  created: []
  modified:
    - src/components/features/charts/use-chart-form.ts
    - src/components/features/charts/sections/project-setup-section.tsx
    - src/components/features/charts/chart-add-form.tsx
    - src/components/features/charts/chart-edit-modal.tsx
    - src/components/features/charts/sections/project-setup-section.test.tsx
    - src/components/features/charts/chart-add-form.test.tsx
    - src/components/features/charts/chart-edit-modal.test.tsx
    - src/components/features/charts/chart-list.test.tsx

key-decisions:
  - "Followed existing handleAddDesigner/handleAddGenre pattern exactly for storage/app handlers"
  - "Made onAddStorageLocation/onAddStitchingApp optional props for backward compatibility"

patterns-established:
  - "Inline entity creation pattern extended: useChartForm now manages storage locations and stitching apps lists alongside designers and genres"

requirements-completed: [STOR-03]

# Metrics
duration: 5min
completed: 2026-04-12
---

# Phase 05 Plan 06: Gap Closure - Prisma Client + onAddNew Handlers Summary

**Regenerated Prisma client and wired inline "Add New" creation for storage location and stitching app dropdowns in chart form**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-12T23:42:13Z
- **Completed:** 2026-04-12T23:47:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Regenerated Prisma client (was missing after schema changes, causing all UAT blockers)
- Wired onAddNew handlers for Storage Location and Stitching App dropdowns in chart create/edit forms
- Added 3 new tests verifying the onAddNew contract (forward + backward compatibility)
- All 498 tests pass, build clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Regenerate Prisma client and add onAddNew tests** - `4d5bdc5` (test) - TDD RED phase
2. **Task 2: Wire onAddNew handlers for storage location and stitching app dropdowns** - `aa7365f` (feat) - TDD GREEN phase

_TDD: Task 1 wrote failing tests, Task 2 made them pass._

## Files Created/Modified
- `src/components/features/charts/use-chart-form.ts` - Added handleAddStorageLocation, handleAddStitchingApp callbacks + storageLocationsList/stitchingAppsList state
- `src/components/features/charts/sections/project-setup-section.tsx` - Added optional onAddStorageLocation/onAddStitchingApp props, wired to SearchableSelect onAddNew
- `src/components/features/charts/chart-add-form.tsx` - Passed storageLocations/stitchingApps to useChartForm, wired hook lists and handlers to ProjectSetupSection
- `src/components/features/charts/chart-edit-modal.tsx` - Same wiring as chart-add-form
- `src/components/features/charts/sections/project-setup-section.test.tsx` - 3 new tests for onAddNew contract
- `src/components/features/charts/chart-add-form.test.tsx` - Added missing server action mocks for storage/app
- `src/components/features/charts/chart-edit-modal.test.tsx` - Added missing server action mocks for storage/app
- `src/components/features/charts/chart-list.test.tsx` - Added missing server action mocks for storage/app

## Decisions Made
- Followed existing handleAddDesigner/handleAddGenre pattern exactly for consistency -- same suppressUnloadRef pattern, same state management, same error handling
- Made onAddStorageLocation/onAddStitchingApp optional props so ProjectSetupSection remains backward-compatible (no changes needed in non-chart-form consumers)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing server action mocks in 3 test files**
- **Found during:** Task 2 (wiring handlers)
- **Issue:** Adding createStorageLocation/createStitchingApp imports to use-chart-form.ts caused chart-add-form, chart-edit-modal, and chart-list test files to fail -- the import chain reached next-auth/next/server which isn't available in the test environment
- **Fix:** Added vi.mock() for @/lib/actions/storage-location-actions and @/lib/actions/stitching-app-actions in all 3 test files, matching the existing mock pattern for designer and genre actions
- **Files modified:** chart-add-form.test.tsx, chart-edit-modal.test.tsx, chart-list.test.tsx
- **Verification:** All 498 tests pass
- **Committed in:** aa7365f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix was necessary to maintain test suite integrity. No scope creep.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three UAT blockers resolved: /storage, /apps, and /charts pages load with correct Prisma client
- Storage Location and Stitching App dropdowns in chart form now support inline "Add New" creation
- Chart form pattern complete: all four entity types (designer, genre, storage location, stitching app) support inline creation from dropdowns

---

## Self-Check: PASSED

- All 8 modified files: FOUND
- Commit 4d5bdc5: FOUND
- Commit aa7365f: FOUND
- Prisma client (src/generated/prisma/): FOUND
- Tests: 498/498 passing
- Build: clean

---
*Phase: 05-foundation-quick-wins*
*Completed: 2026-04-12*
