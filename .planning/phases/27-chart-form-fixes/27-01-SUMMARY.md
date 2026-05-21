---
phase: 27-chart-form-fixes
plan: 01
subsystem: ui
tags: [react, form, dialog, searchable-select, accessibility, prisma]

requires:
  - phase: 13-chart-edit-form
    provides: ChartMergedForm, StitchCountFields, SearchableSelect, InlineDesignerDialog
provides:
  - InlineDesignerDialog wired into chart form via controlled open/onOpenChange
  - SearchableSelect tab-to-type focus forwarding via onKeyDown handler
  - Supply stitch total hint on stitch count field (create + edit modes)
  - Edit page supply stitch total query via ProjectThread aggregate
affects: [chart-form, supply-table, designer-creation]

tech-stack:
  added: []
  patterns:
    - "Printable key detection via e.key.length === 1 for type-to-search"
    - "Supply stitch total as informational hint (not auto-override)"

key-files:
  created:
    - src/components/features/charts/form-primitives/stitch-count-fields.test.tsx
  modified:
    - src/components/features/charts/chart-merged-form.tsx
    - src/components/features/charts/chart-merged-form.test.tsx
    - src/components/features/charts/form-primitives/searchable-select.tsx
    - src/components/features/charts/form-primitives/searchable-select.test.tsx
    - src/components/features/charts/form-primitives/stitch-count-fields.tsx
    - src/app/(dashboard)/charts/[id]/edit/page.tsx
    - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx

key-decisions:
  - "Controlled dialog pattern for designer creation matches existing storage/stitching app pattern"
  - "e.key.length === 1 check captures all printable characters while excluding Tab/Escape/Shift"
  - "Supply stitch total is display-only hint, manual stitch count field stays authoritative"

patterns-established:
  - "SearchableSelect onKeyDown handler forwards printable chars to open popover and seed search"

requirements-completed: [BUG-01, BUG-02, BUG-05]

duration: 8min
completed: 2026-05-21
---

# Phase 27 Plan 01: Designer Dialog, Tab Focus, and Supply Stitch Hint Summary

**InlineDesignerDialog wired into chart form with controlled open/initialName, SearchableSelect tab-to-type via onKeyDown forwarding, and supply stitch total hint on stitch count field**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-21T02:58:28Z
- **Completed:** 2026-05-21T03:06:08Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- BUG-01: Designer "Add New" now opens InlineDesignerDialog instead of calling handler directly -- pre-fills search term, auto-selects created designer
- BUG-02: Tabbing into any SearchableSelect and typing immediately filters options (printable chars open popover and forward to CommandInput)
- BUG-05: "Supply total: N stitches" hint below stitch count field when supply rows have stitch counts, in both create mode (from supply panel) and edit mode (from ProjectThread aggregate query)

## Task Commits

Each task was committed atomically:

1. **Task 1: Tests for designer dialog wiring, tab focus, and supply stitch hint** - `d261a97` (test)
2. **Task 2: Implement designer dialog wiring, tab focus fix, and supply stitch hint** - `c7162d7` (feat)

## Files Created/Modified

- `src/components/features/charts/form-primitives/stitch-count-fields.test.tsx` - NEW: 9 tests for supply hint + basic rendering
- `src/components/features/charts/form-primitives/stitch-count-fields.tsx` - Added supplyStitchTotal prop, hint rendering, aria-describedby linkage
- `src/components/features/charts/form-primitives/searchable-select.tsx` - Added onKeyDown handler for printable char forwarding
- `src/components/features/charts/form-primitives/searchable-select.test.tsx` - 2 new tests for tab focus behavior
- `src/components/features/charts/chart-merged-form.tsx` - Wired InlineDesignerDialog, added supplyStitchTotal computation and prop pass
- `src/components/features/charts/chart-merged-form.test.tsx` - 3 new tests for designer dialog + Popover/Command/Dialog mocks
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` - ProjectThread aggregate query for supply stitch total
- `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` - Pass supplyStitchTotal through to ChartMergedForm

## Decisions Made

- Used controlled dialog pattern (open/onOpenChange state) matching existing storage location and stitching app inline dialogs
- `e.key.length === 1` for printable char detection -- single-char keys are printable, multi-char key names (Tab, Escape, Shift, etc.) are non-printable
- Supply stitch total is informational only -- no auto-override of manual stitch count (partial supply entry is common for large charts)
- Edit mode queries ProjectThread aggregate; create mode computes from local supplyRows state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Popover/Command/Dialog mocks to chart-merged-form.test.tsx**
- **Found during:** Task 1 (test creation)
- **Issue:** chart-merged-form.test.tsx had no Popover/Command mocks, so SearchableSelect dropdown content (including "Add New" buttons) was not visible in the test DOM
- **Fix:** Added vi.mock for @/components/ui/command, @/components/ui/popover, and ./inline-designer-dialog with simplified testable implementations
- **Files modified:** src/components/features/charts/chart-merged-form.test.tsx
- **Verification:** All 51 tests pass including 3 new designer dialog tests
- **Committed in:** d261a97 (Task 1) and c7162d7 (Task 2)

**2. [Rule 1 - Bug] Fixed CommandSeparator mock producing extra `<hr>` elements**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** CommandSeparator mock used `<hr>` which broke the "renders 4 section dividers" existing test (counted 7 instead of 4)
- **Fix:** Changed CommandSeparator mock to use `<div data-testid="command-separator" />` instead of `<hr>`
- **Files modified:** src/components/features/charts/chart-merged-form.test.tsx
- **Verification:** Section dividers test passes
- **Committed in:** c7162d7 (Task 2)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for test infrastructure correctness. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Designer inline creation fully functional from chart form
- Tab-to-type works on all SearchableSelect instances (designer, storage location, stitching app)
- Supply stitch total hint ready for visual verification
- Plan 02 (designer thumbnails, skeins display) can proceed independently

## Self-Check: PASSED

- All 8 key files exist on disk
- Commit d261a97 (test) verified in git log
- Commit c7162d7 (feat) verified in git log
- 404 chart tests pass, 0 failures

---
*Phase: 27-chart-form-fixes*
*Completed: 2026-05-21*
