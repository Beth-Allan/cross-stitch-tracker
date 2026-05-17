---
phase: 17-image-focal-point
plan: 01
subsystem: database, api
tags: [prisma, zod, server-actions, focal-point, css-object-position]

# Dependency graph
requires: []
provides:
  - focalPointX/focalPointY Float? fields on Chart model
  - updateFocalPoint server action with auth + ownership + validation
  - getObjectPositionStyle utility for CSS object-position conversion
  - updateFocalPointSchema Zod validation schema
  - Display context types with focal point fields (8 interfaces/types)
affects: [17-02-PLAN, 17-03-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Focal point as 0-1 normalized coordinates, converted to CSS percentages at render time"
    - "Null focal point = browser default (50% 50%) — no visual change for existing images"

key-files:
  created:
    - src/lib/validations/focal-point.ts
    - src/lib/actions/focal-point-actions.ts
    - src/lib/actions/focal-point-actions.test.ts
    - src/lib/utils/focal-point.ts
    - src/lib/utils/focal-point.test.ts
  modified:
    - prisma/schema.prisma
    - src/components/features/gallery/gallery-types.ts
    - src/types/dashboard.ts
    - src/types/genre.ts
    - src/types/designer.ts
    - src/__tests__/mocks/factories.ts

key-decisions:
  - "Ownership check via chart.project.userId — Chart is owned through Project, not directly"

patterns-established:
  - "getObjectPositionStyle returns undefined for null coords — lets browser default apply"

requirements-completed: [IMG-01]

# Metrics
duration: 4min
completed: 2026-05-17
---

# Phase 17 Plan 01: Schema & Action Foundation Summary

**Focal point persistence layer with 0-1 normalized coordinates on Chart, Zod-validated server action with ownership checks, and CSS conversion utility**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-17T15:10:04Z
- **Completed:** 2026-05-17T15:13:44Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Schema extended with focalPointX/focalPointY nullable Float fields on Chart model
- Server action validates coordinates (0-1 range), authenticates, checks chart ownership through project, persists, and revalidates 3 paths
- Pure utility function converts 0-1 coords to CSS object-position percentages, returning undefined for null (browser defaults to center)
- All 8 display context types updated with focal point fields, ready for Plan 02 propagation
- 19 tests covering auth, ownership, validation bounds, null reset, and CSS conversion

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests** - `c3bfce8` (test)
2. **Task 1 GREEN: Schema + validation + action + utility** - `11941fb` (feat)
3. **Task 2: Display context type updates** - `847bc95` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added focalPointX/focalPointY Float? to Chart model
- `src/lib/validations/focal-point.ts` - Zod schema: chartId + x/y number 0-1 nullable
- `src/lib/actions/focal-point-actions.ts` - Server action: auth, validate, ownership check, persist, revalidate
- `src/lib/actions/focal-point-actions.test.ts` - 11 tests for auth, validation, ownership, persistence
- `src/lib/utils/focal-point.ts` - getObjectPositionStyle: 0-1 to CSS object-position
- `src/lib/utils/focal-point.test.ts` - 8 tests for conversion and null handling
- `src/components/features/gallery/gallery-types.ts` - focalPointX/Y on GalleryCardData
- `src/types/dashboard.ts` - focalPointX/Y on 5 interfaces (CurrentlyStitching, StartNext, BuriedTreasure, Spotlight, ShoppingCart)
- `src/types/genre.ts` - focalPointX/Y on GenreChart
- `src/types/designer.ts` - focalPointX/Y on DesignerChart
- `src/__tests__/mocks/factories.ts` - Updated Chart, DesignerChart, GenreChart, GalleryCard factories with focal point defaults

## Decisions Made
- Ownership check uses `chart.project.userId` pattern (Chart owned through Project) -- consistent with existing chart-actions.ts patterns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated mock factories with focalPointX/focalPointY defaults**
- **Found during:** Task 1 (after Prisma generate)
- **Issue:** createMockChart, createMockDesignerChart, createMockGenreChart, createMockGalleryCard missing required focalPointX/focalPointY fields after schema change
- **Fix:** Added `focalPointX: null, focalPointY: null` to all 4 factories
- **Files modified:** src/__tests__/mocks/factories.ts
- **Verification:** All 19 tests pass, tsc confirms factory types match
- **Committed in:** 11941fb (Task 1), 847bc95 (Task 2)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Factory update required for type compatibility after schema change. No scope creep.

## Issues Encountered
- `prisma db push` unavailable in worktree (no .env.local with DATABASE_URL) -- skipped since adding nullable fields requires no migration. `prisma generate` succeeded and the schema change will be applied by the orchestrator's db push before deployment.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (propagation) can consume focal point fields from all display types
- Plan 03 (editor UI) can call updateFocalPoint server action
- Existing type errors in downstream files (gallery-utils.ts, dashboard actions, test files) are expected and will be resolved in Plan 02 when queries are updated to select focalPointX/Y

## Self-Check: PASSED

- All 11 files: FOUND
- All 3 commits: FOUND (c3bfce8, 11941fb, 847bc95)
- Schema contains focalPointX: YES
- Validation exports updateFocalPointSchema: YES
- Action calls requireAuth: YES
- Utility exports getObjectPositionStyle: YES

---
*Phase: 17-image-focal-point*
*Completed: 2026-05-17*
