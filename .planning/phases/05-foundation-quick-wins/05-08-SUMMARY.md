---
phase: 05-foundation-quick-wins
plan: 08
subsystem: ui
tags: [cmdk, forceMount, SearchableSelect, viewport-collision, thread-picker]

# Dependency graph
requires:
  - phase: 05-foundation-quick-wins/07
    provides: SearchableSelect onAddNew and thread picker multi-add fixes
provides:
  - Always-visible "+ Add New" in SearchableSelect with cmdk forceMount
  - Viewport collision detection for thread picker (flip upward near bottom)
affects: [charts, supplies, fabric]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "forceMount on CommandGroup + CommandItem to bypass cmdk filtering"
    - "getBoundingClientRect collision detection for dropdown positioning"

key-files:
  created: []
  modified:
    - src/components/features/charts/form-primitives/searchable-select.tsx
    - src/components/features/charts/form-primitives/searchable-select.test.tsx
    - src/components/features/charts/sections/project-setup-section.test.tsx
    - src/components/features/supplies/supply-form-modal.test.tsx
    - src/components/features/fabric/fabric-form-modal.test.tsx
    - src/components/features/supplies/search-to-add.tsx
    - src/components/features/supplies/search-to-add.test.tsx

key-decisions:
  - "Static '+ Add New' label instead of dynamic 'Add {search}' -- simpler UX, always visible"
  - "forceMount on both CommandGroup AND CommandItem -- cmdk filters at both levels"
  - "300px threshold for viewport flip (max-h-72=288px + padding)"

patterns-established:
  - "forceMount pattern: bypass cmdk filtering for always-visible items"
  - "Viewport collision: useEffect + getBoundingClientRect for dropdown positioning"

requirements-completed: [STOR-03, SUPP-02]

# Metrics
duration: 5min
completed: 2026-04-13
---

# Phase 05 Plan 08: Gap Closure -- SearchableSelect Add New Always Visible + Thread Picker Viewport Flip

**SearchableSelect "Add New" always visible with forceMount bypass, plus thread picker viewport collision detection for upward flip near bottom edge**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-13T01:59:42Z
- **Completed:** 2026-04-13T02:04:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- SearchableSelect "+ Add New" always visible when onAddNew prop is provided -- no search text required
- forceMount prevents cmdk from hiding the Add New item when search contains spaces (e.g. "Bin A")
- Thread picker flips upward (bottom-full mb-1) when less than 300px of space below trigger
- All 506 tests pass, type check clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix SearchableSelect "Add New" -- always visible, cmdk-filter-proof** - `6d39038` (fix)
2. **Task 2: Add viewport collision detection to thread picker** - `b9febd6` (fix)

## Files Created/Modified
- `src/components/features/charts/form-primitives/searchable-select.tsx` - Removed search.trim() guard, added forceMount, static "+ Add New" label
- `src/components/features/charts/form-primitives/searchable-select.test.tsx` - 6 updated tests for always-visible behavior
- `src/components/features/charts/sections/project-setup-section.test.tsx` - Updated 3 tests to match static "+ Add New" label
- `src/components/features/supplies/supply-form-modal.test.tsx` - Updated 3 tests to match static "+ Add New" label
- `src/components/features/fabric/fabric-form-modal.test.tsx` - Updated 3 tests to match static "+ Add New" label
- `src/components/features/supplies/search-to-add.tsx` - Added flipUp state, useEffect with getBoundingClientRect, cn() conditional positioning
- `src/components/features/supplies/search-to-add.test.tsx` - Added 2 viewport flip tests with global getBoundingClientRect mock

## Decisions Made
- Static "+ Add New" label instead of dynamic "Add {search}" -- simpler UX, always clearly actionable
- forceMount needed on both CommandGroup AND CommandItem because cmdk filters at both levels
- 300px threshold chosen based on max-h-72 (288px) plus ~12px padding/border
- useEffect instead of useLayoutEffect for viewport measurement -- jsdom doesn't support useLayoutEffect, and the visual flicker is negligible for an absolutely-positioned picker

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Test mocking for getBoundingClientRect: initial approach of spying on individual elements after render didn't work because useEffect fires before the spy is set up. Solved by mocking HTMLElement.prototype.getBoundingClientRect globally before render.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 8 plans in Phase 05 are now complete
- Phase ready for verification via `/gsd:verify-work 5`
- All 506 tests passing, type check clean

## Self-Check: PASSED

All 7 modified files verified present. Both task commits (6d39038, b9febd6) verified in git history.

---
*Phase: 05-foundation-quick-wins*
*Completed: 2026-04-13*
