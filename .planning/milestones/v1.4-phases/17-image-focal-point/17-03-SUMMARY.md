---
phase: 17-image-focal-point
plan: 03
subsystem: ui
tags: [react, focal-point, click-to-place, crop-preview, accessibility]

# Dependency graph
requires:
  - phase: 17-01
    provides: "updateFocalPoint server action, focalPointX/Y fields on Chart"
provides:
  - FocalPointEditor interactive click-to-set UI with edit mode and server action integration
  - FocalPointMarker crosshair visualization at click position
  - CropGuideOverlay 4:3 aspect preview with dimming effect
  - HeroCoverBanner integration with focal point editing
  - ProjectDetailHero passes focal point data to banner
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Click coordinate normalization via getBoundingClientRect to 0-1 range"
    - "Box-shadow 9999px trick for crop guide dimming overlay"
    - "vi.hoisted() for mock variable references in vi.mock factories"

key-files:
  created:
    - src/components/features/charts/project-detail/focal-point-editor.tsx
    - src/components/features/charts/project-detail/focal-point-editor.test.tsx
    - src/components/features/charts/project-detail/focal-point-marker.tsx
    - src/components/features/charts/project-detail/crop-guide-overlay.tsx
  modified:
    - src/components/features/charts/project-detail/hero-cover-banner.tsx
    - src/components/features/charts/project-detail/project-detail-hero.tsx

key-decisions:
  - "Action bar positioned as absolute bottom overlay within banner (not in layout flow below) for better visual integration"
  - "Used vi.hoisted() pattern for mock variable references instead of inline mock factories"

patterns-established:
  - "FocalPointEditor renders only overlay elements, not the image itself — layers on top of HeroCoverBanner"
  - "Click coordinate clamping with Math.max(0, Math.min(1, ...)) at both client and server"

requirements-completed: [IMG-01]

# Metrics
duration: 4min
completed: 2026-05-17
---

# Phase 17 Plan 03: Focal Point Editor UI Summary

**Interactive click-to-set focal point editor on hero banner with crosshair marker, 4:3 crop guide preview, and save/cancel/reset controls**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-17T15:18:22Z
- **Completed:** 2026-05-17T15:22:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- FocalPointMarker renders 24px crosshair circle with primary/80 fill, white border, shadow, and scale animation
- CropGuideOverlay renders 4:3 aspect crop preview centered on focal point with box-shadow dimming and clamping to bounds
- FocalPointEditor provides full edit mode: trigger button, click-to-place, save/cancel/reset actions, Escape key, aria-live announcements
- HeroCoverBanner accepts chartId/focalPointX/Y and renders FocalPointEditor overlay
- 9 tests covering trigger rendering, edit mode toggle, coordinate calculation, all three actions, and keyboard support

## Task Commits

Each task was committed atomically:

1. **Task 1: FocalPointMarker and CropGuideOverlay** - `ec47600` (feat)
2. **Task 2 RED: Failing tests for FocalPointEditor** - `d20185c` (test)
3. **Task 2 GREEN: FocalPointEditor + HeroCoverBanner + ProjectDetailHero** - `db51aaf` (feat)

## TDD Gate Compliance

- RED gate: `d20185c` (test commit, 9 tests, module not found = correctly failing)
- GREEN gate: `db51aaf` (feat commit, all 9 tests pass)
- REFACTOR gate: not needed (clean implementation)

## Files Created/Modified
- `src/components/features/charts/project-detail/focal-point-marker.tsx` - 24px crosshair circle positioned at normalized coordinates
- `src/components/features/charts/project-detail/crop-guide-overlay.tsx` - 4:3 aspect crop preview with dimming, clamped to bounds
- `src/components/features/charts/project-detail/focal-point-editor.tsx` - Main editor: edit mode toggle, click handler, save/cancel/reset, accessibility
- `src/components/features/charts/project-detail/focal-point-editor.test.tsx` - 9 tests for all editor interactions
- `src/components/features/charts/project-detail/hero-cover-banner.tsx` - Extended with chartId/focalPointX/Y props, renders FocalPointEditor
- `src/components/features/charts/project-detail/project-detail-hero.tsx` - Passes chart.focalPointX/Y to HeroCoverBanner

## Decisions Made
- Action bar positioned as absolute bottom overlay within the banner container rather than in layout flow below, for tighter visual integration with the hero image
- Used `vi.hoisted()` vitest pattern for mock variable references in `vi.mock` factories -- the standard `const mockFn = vi.fn()` pattern fails when referenced inside hoisted mock factories

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock hoisting error in test file**
- **Found during:** Task 2 (RED phase, test execution)
- **Issue:** `mockToast` variable referenced inside `vi.mock("sonner", ...)` factory was not accessible due to vitest hoisting `vi.mock` calls above variable declarations
- **Fix:** Used `vi.hoisted()` to declare mock variables before mock factory execution
- **Files modified:** src/components/features/charts/project-detail/focal-point-editor.test.tsx
- **Verification:** All 9 tests pass
- **Committed in:** db51aaf (Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test infrastructure fix, no scope change.

## Issues Encountered
- Pre-existing TypeScript errors (37 files) from `@/generated/prisma/client` import -- worktree limitation (no `.env.local` for `prisma generate`). Not introduced by this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full focal point feature is complete: schema + action (Plan 01), propagation (Plan 02), editor UI (Plan 03)
- Editor integrates with server action from Plan 01
- All display contexts from Plan 02 will apply the focal point via CSS object-position

## Self-Check: PASSED

- All 6 files: FOUND
- All 3 commits: FOUND (ec47600, d20185c, db51aaf)
- FocalPointEditor exports: YES
- FocalPointMarker exports: YES
- CropGuideOverlay exports: YES
- HeroCoverBanner renders FocalPointEditor: YES
- Tests pass (9/9): YES

---
*Phase: 17-image-focal-point*
*Completed: 2026-05-17*
