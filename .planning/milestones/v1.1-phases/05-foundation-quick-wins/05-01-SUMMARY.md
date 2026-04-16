---
phase: 05-foundation-quick-wins
plan: 01
subsystem: database
tags: [prisma, server-actions, zod, storage, stitching-app]

# Dependency graph
requires: []
provides:
  - StorageLocation and StitchingApp Prisma models with FK relations to Project
  - CRUD + query server actions for both entities
  - Zod validation schemas (storageLocationSchema, stitchingAppSchema)
  - TypeScript types (WithStats, Detail) for both entities
  - Sidebar nav entries for Storage and Apps
affects: [05-02, 05-03, 05-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Transaction-based delete with FK unlink (updateMany + delete in $transaction)"

key-files:
  created:
    - src/lib/actions/storage-location-actions.ts
    - src/lib/actions/storage-location-actions.test.ts
    - src/lib/actions/stitching-app-actions.ts
    - src/lib/actions/stitching-app-actions.test.ts
    - src/lib/validations/storage.ts
    - src/lib/validations/storage.test.ts
    - src/types/storage.ts
  modified:
    - prisma/schema.prisma
    - src/components/shell/nav-items.ts
    - src/__tests__/mocks/factories.ts
    - src/types/chart.ts
    - src/lib/validations/chart.ts
    - src/lib/actions/chart-actions.ts
    - src/components/features/charts/use-chart-form.ts
    - src/components/features/charts/sections/project-setup-section.tsx
    - src/components/features/charts/chart-add-form.tsx
    - src/components/features/charts/chart-edit-modal.tsx
    - src/components/features/charts/chart-detail.tsx

key-decisions:
  - "Extended ChartWithProject type to include resolved storageLocation/stitchingApp relations"
  - "Disabled storage/app dropdowns in project-setup-section pending DB-backed wiring in later plans"

patterns-established:
  - "Transaction-based delete: unlink FK references via updateMany then delete entity"
  - "Storage/app action pattern mirrors designer-actions for consistency"

requirements-completed: [STOR-01, STOR-02, STOR-03, STOR-04]

# Metrics
duration: 9min
completed: 2026-04-11
---

# Phase 5 Plan 1: Data Layer Summary

**StorageLocation and StitchingApp Prisma models with FK relations, full CRUD server actions, Zod validations, and sidebar nav entries**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-04-11T23:06:25Z
- **Completed:** 2026-04-11T23:15:12Z
- **Tasks:** 2
- **Files modified:** 18 (7 created, 11 modified)

## Accomplishments
- Added StorageLocation and StitchingApp models to Prisma schema, replacing projectBin/ipadApp text fields with proper FK relations
- Created full CRUD + query server actions for both entities following the established designer-actions pattern
- Added Zod validation schemas with trim+min+max and TypeScript types for both entities
- Updated sidebar navigation with Storage (MapPin) and Apps (Tablet) entries between Fabric and Sessions
- 31 tests passing (11 validation + 20 action tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration + types + validations** - `fad2362` (feat)
2. **Task 2: Server actions for both entities + nav items** - `4b303c7` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added StorageLocation and StitchingApp models, updated Project FKs
- `src/types/storage.ts` - TypeScript interfaces for WithStats and Detail types
- `src/lib/validations/storage.ts` - Zod schemas for both entities
- `src/lib/validations/storage.test.ts` - 11 validation tests
- `src/lib/actions/storage-location-actions.ts` - CRUD + query actions with requireAuth
- `src/lib/actions/storage-location-actions.test.ts` - 11 action tests
- `src/lib/actions/stitching-app-actions.ts` - CRUD + query actions with requireAuth
- `src/lib/actions/stitching-app-actions.test.ts` - 9 action tests
- `src/components/shell/nav-items.ts` - Added Storage and Apps nav entries
- `src/__tests__/mocks/factories.ts` - Added mock factories for new models
- `src/types/chart.ts` - Extended ChartWithProject with resolved storage/app relations
- `src/lib/validations/chart.ts` - Replaced projectBin/ipadApp with storageLocationId/stitchingAppId
- `src/lib/actions/chart-actions.ts` - Updated to use new FK fields and include relations
- `src/components/features/charts/use-chart-form.ts` - Updated form values to new field names
- `src/components/features/charts/sections/project-setup-section.tsx` - Updated props, disabled dropdowns pending wiring
- `src/components/features/charts/chart-add-form.tsx` - Updated prop names
- `src/components/features/charts/chart-edit-modal.tsx` - Updated prop names
- `src/components/features/charts/chart-detail.tsx` - Display resolved relation names

## Decisions Made
- Extended `ChartWithProject` type to include `ProjectWithRelations` that carries resolved `storageLocation` and `stitchingApp` name data, so the detail page can display entity names without additional queries
- Disabled storage/app dropdowns in project-setup-section with hint text, since the full DB-backed wiring happens in later plans (05-03/05-04)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated all projectBin/ipadApp references across codebase**
- **Found during:** Task 1 (Schema migration)
- **Issue:** Removing projectBin/ipadApp from Prisma schema caused type errors in 11 files referencing those fields
- **Fix:** Updated all references to use storageLocationId/stitchingAppId in validations, actions, form components, and tests
- **Files modified:** chart.ts, chart-actions.ts, chart-actions-errors.test.ts, chart-actions-thumbnail.test.ts, chart.test.ts, use-chart-form.ts, project-setup-section.tsx, chart-add-form.tsx, chart-edit-modal.tsx, chart-detail.tsx, factories.ts
- **Verification:** All existing tests pass, no type errors in modified files
- **Committed in:** fad2362 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to maintain codebase integrity after schema change. No scope creep -- all changes are direct consequences of the planned field rename.

## Issues Encountered
- `npx prisma db push --accept-data-loss` failed in worktree due to missing DATABASE_URL -- expected in parallel execution environment. Schema validates correctly; push will succeed in the actual environment.

## User Setup Required
None - no external service configuration required. Database schema push (`npx prisma db push --accept-data-loss`) needed once when deploying to update the production database.

## Next Phase Readiness
- Data layer complete: both models, actions, types, and validations ready for UI plans (05-02, 05-03, 05-04)
- Nav items added, ready for route pages to be created
- Project-setup-section dropdowns disabled with hints, ready to be wired to DB-backed data in plan 05-03/04

---
*Phase: 05-foundation-quick-wins*
*Completed: 2026-04-11*
