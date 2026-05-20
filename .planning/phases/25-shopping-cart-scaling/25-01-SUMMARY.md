---
phase: 25-shopping-cart-scaling
plan: 01
subsystem: ui
tags: [react, shopping-cart, search, accessibility, tdd]

requires:
  - phase: none
    provides: standalone components, no prior phase dependencies
provides:
  - ProjectSearchInput component for project name filtering
  - SupplySearchInput component for supply filtering in By Supply view
  - StatusGroup collapsible section with status dot, label, count, per-group select
  - SelectionCounter with normal and search-active display modes
  - STATUS_GROUP_ORDER constant for D-03 workflow progression
affects: [25-02-PLAN shopping cart integration]

tech-stack:
  added: []
  patterns: [search-input-with-clear-button, collapsible-status-group, dual-mode-selection-counter]

key-files:
  created:
    - src/components/features/shopping/project-search-input.tsx
    - src/components/features/shopping/project-search-input.test.tsx
    - src/components/features/shopping/supply-search-input.tsx
    - src/components/features/shopping/supply-search-input.test.tsx
    - src/components/features/shopping/status-group.tsx
    - src/components/features/shopping/status-group.test.tsx
    - src/components/features/shopping/selection-counter.tsx
    - src/components/features/shopping/selection-counter.test.tsx
  modified: []

key-decisions:
  - "Used document.getElementById for toggle button test selectors to avoid ambiguity with 'Select all' button sharing name regex"
  - "SelectionCounter is a Server Component (no 'use client') since it's pure presentational with no hooks or event handlers"

patterns-established:
  - "Search input pattern: full-width with Search icon prefix, X clear button, role=searchbox, semantic tokens"
  - "StatusGroup pattern: collapsible section with STATUS_CONFIG dot+label, count badge, per-group select action"
  - "SelectionCounter pattern: dual-mode counter with normal/search-active display and aria-live=polite"

requirements-completed: [CRIT-02]

duration: 3min
completed: 2026-05-20
---

# Phase 25 Plan 01: Shopping Cart Scaling Components Summary

**4 standalone UI building blocks for shopping cart scaling: search inputs, collapsible status groups, and dual-mode selection counter with full ARIA accessibility**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-20T00:51:03Z
- **Completed:** 2026-05-20T00:54:15Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- Created ProjectSearchInput and SupplySearchInput with Search icon, clear button, and proper ARIA attributes
- Created StatusGroup with collapsible sections using STATUS_CONFIG for status dot, label, and count badge
- Created SelectionCounter with normal mode ("{N} of {M} projects selected") and search mode ("{visibleSelected} of {visibleTotal} visible selected")
- Exported STATUS_GROUP_ORDER constant following D-03 workflow progression (KITTING first for 75+ kitting projects)
- Full TDD cycle: 29 tests across 4 test files, all passing

## Task Commits

Each task was committed atomically (TDD RED then GREEN):

1. **Task 1 RED: ProjectSearchInput + SupplySearchInput tests** - `fa9dacd` (test)
2. **Task 1 GREEN: ProjectSearchInput + SupplySearchInput implementation** - `20b0479` (feat)
3. **Task 2 RED: StatusGroup + SelectionCounter tests** - `2f35963` (test)
4. **Task 2 GREEN: StatusGroup + SelectionCounter implementation** - `5475525` (feat)

## Files Created/Modified
- `src/components/features/shopping/project-search-input.tsx` - Search input for project name filtering with Search icon and clear button
- `src/components/features/shopping/project-search-input.test.tsx` - 7 tests: placeholder, icon, onChange, clear button, ARIA
- `src/components/features/shopping/supply-search-input.tsx` - Search input for supply filtering with identical structure
- `src/components/features/shopping/supply-search-input.test.tsx` - 5 tests: placeholder, onChange, clear button, ARIA
- `src/components/features/shopping/status-group.tsx` - Collapsible status group with dot, label, count badge, per-group select
- `src/components/features/shopping/status-group.test.tsx` - 10 tests: label, count, dot, expand/collapse, toggle, select all, ARIA + 1 ORDER test
- `src/components/features/shopping/selection-counter.tsx` - Dual-mode selection counter (normal + search-active)
- `src/components/features/shopping/selection-counter.test.tsx` - 6 tests: normal mode, singular, search mode, parenthetical, aria-live

## Decisions Made
- SelectionCounter implemented as a Server Component (no "use client") since it's pure presentational with no hooks or event handlers -- follows project convention of Server Components by default
- Test selectors for StatusGroup toggle button use `document.getElementById` instead of `getByRole` with name regex to avoid ambiguity with the "Select all" button that shares the status label in its aria-label

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- StatusGroup tests initially had 3 failures due to `screen.getByRole("button", { name: /Kitting/ })` matching both the toggle button and "Select all Kitting projects" button. Fixed by using `document.getElementById("group-KITTING")` for the toggle button tests, which is unambiguous since the button has a unique id attribute.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 components ready for Plan 02 integration into the existing shopping cart
- StatusGroup exports STATUS_GROUP_ORDER for grouping logic
- SelectionCounter props interface designed for shopping-cart.tsx to wire visible/total counts
- Search inputs accept controlled value/onChange props for parent state management

---
*Phase: 25-shopping-cart-scaling*
*Completed: 2026-05-20*
