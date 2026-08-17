---
phase: 06-gallery-cards-view-modes
plan: 04
subsystem: ui
tags: [gallery, grid, list, table, orchestrator, page-wiring, view-modes, nuqs]

# Dependency graph
requires:
  - phase: 06-01
    provides: GalleryCardData types, gallery-utils, useGalleryFilters hook, getChartsForGallery action
  - phase: 06-02
    provides: GalleryCard with WIP/Unstarted/Finished footers, CoverPlaceholder, KittingDots
  - phase: 06-03
    provides: FilterBar, FilterChips, MultiSelectDropdown, SortDropdown, ViewToggleBar
provides:
  - GalleryGrid component with gallery/list/table view modes
  - ProjectGallery orchestrator composing all gallery sub-components
  - Replaced /charts page with gallery experience
  - "Charts" renamed to "Projects" in sidebar nav
affects: [phase-7-dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "View-mode switch: single GalleryGrid component with gallery/list/table render paths"
    - "Orchestrator pattern: ProjectGallery composes all sub-components and wires useGalleryFilters hook"
    - "Server/Client data split: page.tsx fetches + resolves URLs, passes to client-only ProjectGallery"

key-files:
  created:
    - src/components/features/gallery/gallery-grid.tsx
    - src/components/features/gallery/gallery-grid.test.tsx
    - src/components/features/gallery/project-gallery.tsx
    - src/components/features/gallery/project-gallery.test.tsx
  modified:
    - src/app/(dashboard)/charts/page.tsx
    - src/components/shell/nav-items.ts
    - package-lock.json

key-decisions:
  - "Used type assertion (as unknown as GalleryChartWithProject) to bridge GalleryChartData from server action to transformToGalleryCard — runtime data is compatible, types differ due to select vs include"
  - "Table sort shares sort state with gallery/list via shared onSortChange — no local table sort state"
  - "Simplified page.tsx from 7 data fetches to 2 (charts + image URLs) — edit data stays on detail page"

patterns-established:
  - "Page simplification: gallery page only fetches what it needs (no designers, genres, storage, apps, fabrics)"
  - "Three-view GalleryGrid: single component dispatches to GalleryView/ListView/TableView sub-components"

requirements-completed: [GLRY-01, GLRY-02, GLRY-03, GLRY-04, GLRY-05]

# Metrics
duration: 7min
completed: 2026-04-13
---

# Plan 06-04: Page Wiring & Assembly Summary

**GalleryGrid with gallery/list/table views, ProjectGallery orchestrator, charts page replaced with full gallery experience, nav renamed to "Projects"**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-13T16:47:39Z
- **Completed:** 2026-04-13T16:55:31Z
- **Tasks:** 1 auto + 1 checkpoint (pending)
- **Files modified:** 7

## Accomplishments
- GalleryGrid renders 3 view modes: gallery (CSS grid with role=list), list (compact rows with status dots), table (sortable column headers with aria-sort)
- ProjectGallery orchestrator composes FilterBar + FilterChips + ViewToggleBar + GalleryGrid with useGalleryFilters hook
- Charts page.tsx simplified from 7 data fetches to 2 (getChartsForGallery + getPresignedImageUrls)
- Sidebar nav "Charts" renamed to "Projects" per D-10
- Empty states for both no-projects (with "Add Project" CTA) and no-filter-matches (scissors icon)
- Table column headers trigger shared sort state with gallery/list views per D-11
- 17 new tests (11 grid + 6 orchestrator), 719 total tests passing, build clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Build GalleryGrid, ProjectGallery orchestrator, wire page, rename nav** - `09bb146` (feat)

## Files Created/Modified
- `src/components/features/gallery/gallery-grid.tsx` - GalleryGrid with gallery/list/table views, empty states, sortable table headers
- `src/components/features/gallery/gallery-grid.test.tsx` - 11 tests: gallery role=list, list links, table headers, sort callbacks, aria-sort, empty states
- `src/components/features/gallery/project-gallery.tsx` - Orchestrator composing all sub-components with useGalleryFilters
- `src/components/features/gallery/project-gallery.test.tsx` - 6 tests: heading, add button, subtitle, FilterBar, ViewToggleBar, GalleryGrid composition
- `src/app/(dashboard)/charts/page.tsx` - Replaced with simplified gallery page (getChartsForGallery + ProjectGallery)
- `src/components/shell/nav-items.ts` - "Charts" label changed to "Projects"
- `package-lock.json` - nuqs dependency resolution

## Decisions Made
- Used `as unknown as GalleryChartWithProject` type assertion in ProjectGallery to bridge the server action return type (`GalleryChartData`) to `transformToGalleryCard`'s parameter type. The runtime data is fully compatible; the types differ because `getChartsForGallery` uses `select` (lighter) while the gallery type system was built on the full `include` type.
- Table view shares sort state with the gallery/list views via the shared `onSortChange` prop from `useGalleryFilters`, matching D-11's requirement that "sort state is shared across views."
- Page.tsx simplified drastically: removed imports and fetches for designers, genres, storage locations, stitching apps, and fabrics. The gallery page only needs chart data and image URLs. Edit functionality stays on the detail page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed nuqs in worktree**
- **Found during:** Task 1 (test execution)
- **Issue:** nuqs was added to package.json by Plan 01 but not installed in this worktree's node_modules
- **Fix:** `npm install nuqs@2.8.9 --save-exact` to populate node_modules
- **Files modified:** package-lock.json
- **Verification:** All 719 tests pass, build clean
- **Committed in:** 09bb146 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for test execution. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 6 components assembled into working gallery page
- Pending: Task 2 visual verification checkpoint (human-verify)
- After verification: Phase 6 complete, ready for impeccable polish and phase boundary audit

## Self-Check: PASSED

All 4 created files verified present. Task 1 commit hash verified in git log.

---
*Phase: 06-gallery-cards-view-modes*
*Completed: 2026-04-13*
