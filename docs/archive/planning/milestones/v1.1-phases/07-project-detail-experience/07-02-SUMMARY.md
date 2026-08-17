---
phase: 07-project-detail-experience
plan: 02
subsystem: ui
tags: [react, hero, status-badge, dropdown-menu, cover-image, blur-background]

# Dependency graph
requires:
  - phase: 02-project-crud
    provides: chart-detail page, deleteChart action, status-control
  - phase: 06-gallery-cards-view-modes
    provides: BackToGalleryLink, gallery card celebration pattern
provides:
  - ProjectDetailHero component with cover banner, metadata, status badge, kebab menu
  - HeroCoverBanner with blurred background fill and object-contain
  - HeroStatusBadge with Select dropdown, optimistic updates, rollback
  - HeroKebabMenu with delete confirmation dialog
affects: [07-06-page-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns: [hero-cover-blur-pattern, celebration-ring-accents, interactive-status-badge]

key-files:
  created:
    - src/components/features/charts/project-detail/project-detail-hero.tsx
    - src/components/features/charts/project-detail/hero-cover-banner.tsx
    - src/components/features/charts/project-detail/hero-status-badge.tsx
    - src/components/features/charts/project-detail/hero-kebab-menu.tsx
    - src/components/features/charts/project-detail/hero-status-badge.test.tsx
    - src/components/features/charts/project-detail/hero-kebab-menu.test.tsx
    - src/components/features/charts/project-detail/project-detail-hero.test.tsx
  modified: []

key-decisions:
  - "Status badge uses Select with borderless trigger styling instead of wrapping StatusBadge component"
  - "Celebration ring uses ring-2 utility (not box-shadow) for consistency with gallery card pattern"
  - "Progress percentage shown as plain text in metadata row rather than ProgressBar component for density"

patterns-established:
  - "Hero cover blur: foreground object-contain over blur-[20px] scaled background copy, returns null when no image"
  - "Celebration ring: ring-2 with status-specific colors (violet for FINISHED, rose for FFO)"
  - "Kebab menu: separate Dialog state from DropdownMenu, dialog stays open on delete failure"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-04-15
---

# Phase 7 Plan 02: Project Detail Hero Summary

**Hero section with blurred cover banner, interactive status badge dropdown, kebab delete menu, and celebration ring accents for FINISHED/FFO**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-15T05:02:24Z
- **Completed:** 2026-04-15T05:05:42Z
- **Tasks:** 2
- **Files created:** 7

## Accomplishments
- Full hero section with cover image banner using object-contain + blurred background fill (D-01, D-02)
- Interactive status badge with Select dropdown, optimistic updates, and rollback on failure (D-08, T-07-07)
- Kebab overflow menu with delete confirmation dialog that stays open on failure (D-07)
- Celebration ring accents for FINISHED (violet) and FFO (rose) statuses
- 19 tests across 3 test files all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Hero cover banner + status badge with tests** - `f1972da` (test)
2. **Task 2: Hero container + kebab menu with tests** - `a4cad63` (feat)

## Files Created/Modified
- `src/components/features/charts/project-detail/hero-cover-banner.tsx` - Cover image with blurred background, returns null for no-image
- `src/components/features/charts/project-detail/hero-status-badge.tsx` - Interactive status badge with Select dropdown and optimistic updates
- `src/components/features/charts/project-detail/hero-status-badge.test.tsx` - 6 tests: rendering, aria-label, touch target, status dot colors
- `src/components/features/charts/project-detail/hero-kebab-menu.tsx` - Dropdown menu with delete action and confirmation dialog
- `src/components/features/charts/project-detail/hero-kebab-menu.test.tsx` - 3 tests: trigger rendering, aria-label, touch targets
- `src/components/features/charts/project-detail/project-detail-hero.tsx` - Main hero composing all sub-components with celebration rings
- `src/components/features/charts/project-detail/project-detail-hero.test.tsx` - 10 tests: heading, designer, stitch count, edit link, celebrations, progress

## Decisions Made
- Status badge uses a borderless Select trigger (border-0, bg-transparent, shadow-none) styled to look like a badge rather than a form input, matching the UI-SPEC's "clickable badge with chevron" design
- Celebration ring uses Tailwind's ring-2 utility rather than box-shadow for consistency with the gallery card celebration border pattern from Phase 6
- Progress percentage rendered as plain monospaced text in the metadata row instead of using the ProgressBar component, since the hero metadata row is a compact inline flex layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed rerender test for status badge**
- **Found during:** Task 1
- **Issue:** Test used rerender() to change currentStatus prop, but HeroStatusBadge initializes internal state from prop and doesn't sync on re-render (correct behavior for optimistic updates)
- **Fix:** Changed test to unmount + remount instead of rerender to test different initial statuses
- **Files modified:** hero-status-badge.test.tsx
- **Committed in:** f1972da

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test fix, no scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hero components ready for composition into the detail page (Plan 06: page wiring)
- HeroStatusBadge exposes onStatusChange callback for overview tab section reordering
- All 4 hero sub-components exported and independently testable

## Self-Check: PASSED

- All 7 created files verified present on disk
- Both commit hashes (f1972da, a4cad63) verified in git log
- 19 tests passing across 3 test files

---
*Phase: 07-project-detail-experience*
*Completed: 2026-04-15*
