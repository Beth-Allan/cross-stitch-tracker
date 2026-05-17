---
phase: 17-image-focal-point
plan: 02
subsystem: ui, api
tags: [focal-point, css-object-position, prisma-select, gallery, dashboard, shopping]

# Dependency graph
requires:
  - phase: 17-01
    provides: getObjectPositionStyle utility, focalPointX/Y on display context types, prisma schema fields
provides:
  - All Prisma queries include focalPointX/Y in chart selects
  - transformToGalleryCard passes focal point through to GalleryCardData
  - All 8 object-cover display components apply CSS object-position from focal point
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Add focalPointX/Y to Prisma select blocks alongside coverThumbnailUrl"
    - "Apply getObjectPositionStyle as inline style on all object-cover images"

key-files:
  created: []
  modified:
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/gallery/gallery-card.tsx
    - src/components/features/dashboard/spotlight-card.tsx
    - src/components/features/dashboard/currently-stitching-card.tsx
    - src/components/features/dashboard/buried-treasures-section.tsx
    - src/components/features/genres/genre-detail.tsx
    - src/components/features/designers/designer-detail.tsx
    - src/components/features/shopping/project-accordion.tsx
    - src/lib/actions/dashboard-actions.ts
    - src/lib/actions/genre-actions.ts
    - src/lib/actions/designer-actions.ts
    - src/lib/actions/shopping-cart-actions.ts

key-decisions:
  - "Hero banner blur layer explicitly excluded — decorative element where focal point is invisible through blur"

patterns-established:
  - "Focal point propagation: add to Prisma select → add to object mapping → add style to img element"

requirements-completed: [IMG-02]

# Metrics
duration: 18min
completed: 2026-05-17
---

# Plan 02: Display Propagation Summary

**Focal point data flows from DB through all 8 object-cover display contexts with CSS object-position styling**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-17T15:17:00Z
- **Completed:** 2026-05-17T15:35:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- All Prisma queries (dashboard, genre, designer, shopping) include focalPointX/Y in chart selects
- transformToGalleryCard passes focal point through with test coverage
- All 8 object-cover components apply getObjectPositionStyle: gallery card, spotlight, currently stitching, buried treasures, genre detail, designer detail, shopping accordion
- Hero banner blur layer explicitly excluded per D-06

## Task Commits

Each task was committed atomically:

1. **Task 1: Update queries and transform functions** - `dc14aad` (feat)
2. **Task 2: Apply getObjectPositionStyle to display components** - `d7eaaf9` + `c17195b` (feat)

## Files Created/Modified
- `src/components/features/gallery/gallery-utils.ts` - transformToGalleryCard passes focalPointX/Y
- `src/components/features/gallery/gallery-utils.test.ts` - 2 tests for focal point pass-through
- `src/components/features/gallery/gallery-card.tsx` - Image style from focal point
- `src/components/features/dashboard/spotlight-card.tsx` - img style from focal point
- `src/components/features/dashboard/currently-stitching-card.tsx` - img style from focal point
- `src/components/features/dashboard/buried-treasures-section.tsx` - img style from focal point
- `src/components/features/genres/genre-detail.tsx` - img style from focal point
- `src/components/features/designers/designer-detail.tsx` - img style from focal point
- `src/components/features/shopping/project-accordion.tsx` - Image style from focal point
- `src/lib/actions/dashboard-actions.ts` - 4 queries include focalPointX/Y
- `src/lib/actions/genre-actions.ts` - getGenre includes focalPointX/Y
- `src/lib/actions/designer-actions.ts` - getDesigner includes focalPointX/Y
- `src/lib/actions/shopping-cart-actions.ts` - includes focalPointX/Y

## Decisions Made
- Hero banner blur layer excluded from focal point — decorative element (aria-hidden, opacity-60, blur-[20px]) where positioning is invisible per D-06

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated test mock factories for type compatibility**
- **Found during:** Task 1 (query updates)
- **Issue:** Existing test mocks missing focalPointX/Y fields caused type errors
- **Fix:** Added focalPointX: null, focalPointY: null to 6 test mock objects
- **Verification:** All tests pass with updated mocks

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for type compatibility. No scope creep.

## Issues Encountered
- Agent hit permission denials on Edit/Write tools for final 3 components; orchestrator completed them inline

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All display contexts now respect focal point — ready for verification
- Combined with Plan 03 (editor UI), the full focal point feature is complete

---
*Phase: 17-image-focal-point*
*Completed: 2026-05-17*
