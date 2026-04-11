---
phase: 05-foundation-quick-wins
plan: 02
subsystem: ui
tags: [react, next.js, storage-location, inline-edit, crud-ui]

# Dependency graph
requires:
  - "05-01: StorageLocation/StitchingApp Prisma models, CRUD server actions, types, validations"
provides:
  - InlineNameEdit shared component with display/edit modes, heading variant, defaultEditing prop
  - DeleteEntityDialog supporting storage-location and stitching-app entity types
  - StorageLocationList with inline add/rename/delete and navigation
  - StorageLocationDetail with project listing, StatusBadge, fabric info
  - Route pages at /storage and /storage/[id]
affects: [05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "InlineNameEdit pattern: display/edit toggle with onMouseDown for confirm/cancel, defaultEditing for external trigger"
    - "DeleteEntityDialog pattern: entity-type-driven copy with project count and unlink messaging"
    - "Location row pattern: role=button div with stopPropagation on action buttons"

key-files:
  created:
    - src/components/features/storage/inline-name-edit.tsx
    - src/components/features/storage/inline-name-edit.test.tsx
    - src/components/features/storage/delete-entity-dialog.tsx
    - src/components/features/storage/delete-entity-dialog.test.tsx
    - src/components/features/storage/storage-location-list.tsx
    - src/components/features/storage/storage-location-list.test.tsx
    - src/components/features/storage/storage-location-detail.tsx
    - src/components/features/storage/storage-location-detail.test.tsx
    - src/app/(dashboard)/storage/page.tsx
    - src/app/(dashboard)/storage/[id]/page.tsx
  modified: []

key-decisions:
  - "Added defaultEditing and onCancel props to InlineNameEdit for external edit trigger from list rows"
  - "StatusBadge status cast via 'as ProjectStatus' -- matches shopping-list.tsx pattern for string-typed status from Prisma queries"

patterns-established:
  - "InlineNameEdit: reusable inline edit with variant sizing, onMouseDown confirm/cancel, blur-to-cancel"
  - "DeleteEntityDialog: entity-type-aware delete confirmation with project unlink copy"
  - "Storage list row: clickable div with role=button, stopPropagation on action buttons, hover-reveal icons"

requirements-completed: [STOR-01, STOR-02]

# Metrics
duration: 6min
completed: 2026-04-11
---

# Phase 5 Plan 2: Storage Location UI Summary

**Storage location management pages with inline add/rename/delete, detail view with project listing, and reusable InlineNameEdit + DeleteEntityDialog components**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-11T23:38:18Z
- **Completed:** 2026-04-11T23:44:36Z
- **Tasks:** 2
- **Files modified:** 10 (10 created, 0 modified)

## Accomplishments
- Built InlineNameEdit shared component with display/edit modes, heading variant, auto-focus/select, onMouseDown confirm/cancel to avoid blur race condition
- Built DeleteEntityDialog supporting storage-location and stitching-app entity types with project-count-aware copy
- Built StorageLocationList with inline add row, inline rename via InlineNameEdit, delete with confirmation dialog, row navigation, and empty state
- Built StorageLocationDetail with heading-variant InlineNameEdit, project list with StatusBadge and fabric info, back navigation, and empty state
- Created Server Component route pages at /storage and /storage/[id] following established designer page pattern
- 29 tests passing across all 4 component test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared components (InlineNameEdit + DeleteEntityDialog)** - `71d06d7` (feat)
2. **Task 2: StorageLocationList + StorageLocationDetail + route pages** - `e85ffb7` (feat)

## Files Created/Modified
- `src/components/features/storage/inline-name-edit.tsx` - Shared inline edit component with display/edit modes, heading variant
- `src/components/features/storage/inline-name-edit.test.tsx` - 9 tests: display, edit, Enter/Escape/blur, onMouseDown, heading variant
- `src/components/features/storage/delete-entity-dialog.tsx` - Delete confirmation for storage-location and stitching-app entity types
- `src/components/features/storage/delete-entity-dialog.test.tsx` - 7 tests: titles, descriptions, project counts, pending state
- `src/components/features/storage/storage-location-list.tsx` - List page with inline add, rename, delete, navigation, empty state
- `src/components/features/storage/storage-location-list.test.tsx` - 8 tests: rendering, add flow, delete dialog, navigation, stopPropagation
- `src/components/features/storage/storage-location-detail.tsx` - Detail page with heading edit, project list, StatusBadge, fabric info
- `src/components/features/storage/storage-location-detail.test.tsx` - 5 tests: heading, projects, empty state, back link, fabric
- `src/app/(dashboard)/storage/page.tsx` - Server Component calling getStorageLocationsWithStats
- `src/app/(dashboard)/storage/[id]/page.tsx` - Server Component with params Promise, notFound on missing

## Decisions Made
- Added `defaultEditing` and `onCancel` props to InlineNameEdit -- the list row needs to enter edit mode immediately when the pencil is clicked (not show display mode first). This was a minor API extension beyond the plan spec, needed for correct UX flow.
- Used `as ProjectStatus` cast for StatusBadge status prop -- the StorageLocationDetail type has `status: string` from Prisma queries, but StatusBadge expects the enum type. This follows the same pattern as `shopping-list.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added defaultEditing and onCancel props to InlineNameEdit**
- **Found during:** Task 2 (StorageLocationList implementation)
- **Issue:** When the pencil icon on a list row was clicked, it set the row to editing mode which rendered InlineNameEdit -- but InlineNameEdit started in display mode (not edit mode), requiring a second click on the edit button. The UX was broken.
- **Fix:** Added `defaultEditing` prop (boolean, default false) to start in edit mode, and `onCancel` callback so the parent row can reset its editing state when the user cancels.
- **Files modified:** `src/components/features/storage/inline-name-edit.tsx`
- **Verification:** All 29 tests pass, pencil click now immediately shows edit input.
- **Committed in:** e85ffb7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor API addition to InlineNameEdit for correct list row editing UX. No scope creep.

## Issues Encountered
- StatusBadge `IN_PROGRESS` maps to label "Stitching" (not "In Progress") -- test assertion corrected after checking STATUS_CONFIG.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- InlineNameEdit and DeleteEntityDialog are ready for reuse by Plan 03 (Stitching Apps)
- Plan 03 should pass `entityType="stitching-app"` to DeleteEntityDialog and mirror the StorageLocationList/Detail pattern
- /storage routes are live and accessible from sidebar navigation (nav items added in Plan 01)

## Self-Check: PASSED

- All 10 created files verified present on disk
- Commit 71d06d7 (Task 1) verified in git log
- Commit e85ffb7 (Task 2) verified in git log
- 29 tests passing across 4 test files
- Production build succeeds with /storage and /storage/[id] routes registered

---
*Phase: 05-foundation-quick-wins*
*Completed: 2026-04-11*
