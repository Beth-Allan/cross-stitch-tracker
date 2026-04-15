---
phase: 06-gallery-cards-view-modes
plan: 03
subsystem: ui
tags: [gallery, filter-bar, filter-chips, multi-select, sort-dropdown, view-toggle]

# Dependency graph
requires:
  - phase: 06-gallery-cards-view-modes
    plan: 01
    provides: GalleryCardData types, ViewMode, SortField, SortDir, STATUS_CONFIG, SizeCategory
provides:
  - FilterBar component with search input and status/size multi-select dropdowns
  - FilterChips component with individual dismiss and clear-all
  - MultiSelectDropdown reusable component with checkboxes and keyboard close
  - SortDropdown component with 6 fields and direction toggle
  - ViewToggleBar component with project count, sort control, and 3-mode segmented toggle
affects: [06-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [custom multi-select dropdown with click-outside and Escape close, segmented view toggle with sr-only labels]

key-files:
  created:
    - src/components/features/gallery/multi-select-dropdown.tsx
    - src/components/features/gallery/multi-select-dropdown.test.tsx
    - src/components/features/gallery/filter-bar.tsx
    - src/components/features/gallery/filter-bar.test.tsx
    - src/components/features/gallery/filter-chips.tsx
    - src/components/features/gallery/filter-chips.test.tsx
    - src/components/features/gallery/sort-dropdown.tsx
    - src/components/features/gallery/sort-dropdown.test.tsx
    - src/components/features/gallery/view-toggle-bar.tsx
    - src/components/features/gallery/view-toggle-bar.test.tsx
  modified: []

key-decisions:
  - "Built custom MultiSelectDropdown with inline click-outside/Escape handlers rather than using a library -- only 5 lines of effect code, matches DesignOS pattern exactly"
  - "FilterChips wraps onRemove callbacks to prevent React event leaking through to caller props"
  - "SortDropdown closes on option selection for single-select UX, unlike MultiSelectDropdown which stays open for multi-select"

patterns-established:
  - "Dropdown pattern: useState for isOpen, useRef for container, useEffect for mousedown click-outside and keydown Escape"
  - "View toggle: segmented control with sr-only text labels and title tooltips per accessibility spec"

requirements-completed: [GLRY-03, GLRY-04, GLRY-05]

# Metrics
duration: 4min
completed: 2026-04-13
---

# Phase 6 Plan 03: Filter, Sort & View Toggle Components Summary

**Five gallery control components with 31 tests: filter bar with search and multi-select dropdowns, filter chips with dismiss, sort dropdown with 6 fields, and view toggle bar with segmented control**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-13T16:35:41Z
- **Completed:** 2026-04-13T16:40:05Z
- **Tasks:** 2
- **Files created:** 10

## Accomplishments
- MultiSelectDropdown: reusable component with checkbox visuals, emerald active styling, click-outside close, Escape close, count badge
- FilterBar: search input with Search icon + Status multi-select (7 statuses from STATUS_CONFIG) + Size multi-select (5 categories)
- FilterChips: active filter chips with individual dismiss X buttons, Clear all link, returns null when no filters active
- SortDropdown: 6 sort fields (Date Added, Name, Designer, Status, Size, Stitch Count) with direction indicator, accessible aria-label
- ViewToggleBar: project count (plain or "N of M"), SortDropdown composition, 3-button segmented toggle (Cards/List/Table) with sr-only labels and tooltips
- 31 tests across 5 test files, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Build MultiSelectDropdown, FilterBar, and FilterChips with tests** - `11e234a` (feat)
2. **Task 2: Build SortDropdown and ViewToggleBar with tests** - `b25dd07` (feat)

## Files Created
- `src/components/features/gallery/multi-select-dropdown.tsx` - Reusable multi-select with checkboxes, emerald active state, click-outside/Escape close
- `src/components/features/gallery/multi-select-dropdown.test.tsx` - 7 tests: label, count badge, open/close, toggle callback, Escape, active styling, checked state
- `src/components/features/gallery/filter-bar.tsx` - Search input + Status/Size dropdowns, imports STATUS_CONFIG for status labels
- `src/components/features/gallery/filter-bar.test.tsx` - 5 tests: placeholder, search callback, dropdown triggers, search icon, value display
- `src/components/features/gallery/filter-chips.tsx` - Active filter chips with dismiss, Clear all, returns null when empty
- `src/components/features/gallery/filter-chips.test.tsx` - 7 tests: null when empty, search/status/size chips, dismiss callbacks, clear all
- `src/components/features/gallery/sort-dropdown.tsx` - Sort field selector with SORT_LABELS, direction indicator, aria-label
- `src/components/features/gallery/sort-dropdown.test.tsx` - 5 tests: trigger label, 6 options, sort callback, aria-label direction, Escape close
- `src/components/features/gallery/view-toggle-bar.tsx` - Count + Sort + View toggle composition with sr-only labels and tooltips
- `src/components/features/gallery/view-toggle-bar.test.tsx` - 7 tests: count text, filtered count, sr-only labels, active styling, view change, sort presence, tooltips

## Decisions Made
- Built custom MultiSelectDropdown with inline click-outside/Escape handlers rather than using a library -- only 5 lines of effect code per handler, matches DesignOS pattern exactly.
- FilterChips wraps onRemove callbacks in arrow functions to prevent React SyntheticEvent leaking through to caller props that expect zero arguments.
- SortDropdown closes dropdown on option selection (single-select UX), while MultiSelectDropdown stays open (multi-select UX).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None

## Next Phase Readiness
- All 5 filter/sort/view components ready for Plan 04 (Page Assembly) to compose into the gallery page
- Components accept callbacks as props, decoupled from useGalleryFilters hook for independent testability
- 31 new tests + 43 existing gallery-utils tests = 74 gallery tests passing

## Self-Check: PASSED

All 10 created files verified present. Both commit hashes verified in git log.

---
*Phase: 06-gallery-cards-view-modes*
*Completed: 2026-04-13*
