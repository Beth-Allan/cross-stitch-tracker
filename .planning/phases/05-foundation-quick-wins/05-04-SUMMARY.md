---
phase: 05-foundation-quick-wins
plan: 04
subsystem: ui
tags: [chart-form, searchable-select, fabric, storage-location, stitching-app, zod, prisma]

# Dependency graph
requires:
  - phase: 05-01
    provides: StorageLocation and StitchingApp Prisma models, CRUD server actions, Zod validations
provides:
  - Chart form wired to DB-backed dropdowns for storage location, stitching app, and fabric
  - Fabric linking/unlinking on chart create and edit
  - getUnassignedFabrics server action
  - fabricId in chartFormSchema validation
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fabric link/unlink pattern: find current fabric by linkedProjectId, unlink if changed, link new"
    - "DB-backed dropdown wiring: Server Component fetches data, passes through client form components"

key-files:
  created:
    - src/components/features/charts/sections/project-setup-section.test.tsx
  modified:
    - src/lib/validations/chart.ts
    - src/lib/actions/chart-actions.ts
    - src/lib/actions/fabric-actions.ts
    - src/lib/auth-guard.ts
    - src/types/chart.ts
    - src/components/features/charts/use-chart-form.ts
    - src/components/features/charts/sections/project-setup-section.tsx
    - src/components/features/charts/chart-add-form.tsx
    - src/components/features/charts/chart-edit-modal.tsx
    - src/components/features/charts/chart-list.tsx
    - src/components/features/charts/chart-detail.tsx
    - src/app/(dashboard)/charts/new/page.tsx
    - src/app/(dashboard)/charts/page.tsx
    - src/app/(dashboard)/charts/[id]/page.tsx
    - src/app/(dashboard)/charts/[id]/edit/page.tsx
    - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
    - src/__tests__/mocks/factories.ts
    - src/components/features/charts/chart-add-form.test.tsx
    - src/components/features/charts/chart-edit-modal.test.tsx

key-decisions:
  - "Merged Task 1 and Task 2 implementation into a single commit because ProjectSetupSection props had to be updated for the build to pass"
  - "Made storageLocations/stitchingApps/unassignedFabrics optional with defaults in ChartListProps to minimize test changes"
  - "Fixed requireAuth return type to narrow user.id to string (pre-existing type issue blocking build)"
  - "Added fabric display to chart detail Project Setup section for consistency"

patterns-established:
  - "Fabric link/unlink on chart save: check current fabric by linkedProjectId, unlink old, link new"
  - "Reference data fetching: Server Component pages fetch storage/app/fabric data and thread through forms"

requirements-completed: [STOR-03, PROJ-01]

# Metrics
duration: 14min
completed: 2026-04-11
---

# Phase 5 Plan 4: Wire Chart Form Summary

**DB-backed SearchableSelect dropdowns for storage location, stitching app, and fabric in the chart create/edit form with fabric link/unlink on save**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-04-11T23:21:07Z
- **Completed:** 2026-04-11T23:34:50Z
- **Tasks:** 2
- **Files modified:** 20 (1 created, 19 modified)

## Accomplishments
- Wired chart form's Project Setup section to use live database-backed dropdowns for storage locations, stitching apps, and fabrics (replacing disabled placeholders)
- Added fabricId to the full data flow: Zod validation schema, ChartFormValues interface, form submit, and chart server actions
- Implemented fabric link/unlink logic in both createChart and updateChart server actions
- Added getUnassignedFabrics server action that filters to unlinked fabrics plus the currently linked one for edit mode
- Added 8 new ProjectSetupSection tests and 13 chart validation tests
- All 455 tests pass, build clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Full data flow update + UI wiring** - `e60ac5a` (feat)
2. **Task 2: Component tests + fixture updates** - `5da3b97` (test)

## Files Created/Modified
- `src/lib/validations/chart.ts` - Added fabricId to chartFormSchema project object
- `src/lib/validations/chart.test.ts` - 8 new tests for FK fields (storageLocationId, stitchingAppId, fabricId)
- `src/lib/actions/chart-actions.ts` - Fabric link/unlink in create/update, fabric+brand include in queries
- `src/lib/actions/fabric-actions.ts` - New getUnassignedFabrics action
- `src/lib/auth-guard.ts` - Fixed return type to narrow user.id to string
- `src/types/chart.ts` - Added fabric relation to ProjectWithRelations
- `src/components/features/charts/use-chart-form.ts` - Added fabricId to values and submit
- `src/components/features/charts/sections/project-setup-section.tsx` - Replaced disabled placeholders with live SearchableSelect dropdowns
- `src/components/features/charts/sections/project-setup-section.test.tsx` - 8 tests for dropdown rendering, empty states, no hardcoded arrays
- `src/components/features/charts/chart-add-form.tsx` - Accepts and passes storage/app/fabric props
- `src/components/features/charts/chart-edit-modal.tsx` - Accepts and passes storage/app/fabric props
- `src/components/features/charts/chart-list.tsx` - Accepts and passes storage/app/fabric props (optional)
- `src/components/features/charts/chart-detail.tsx` - Displays linked fabric in Project Setup section
- `src/app/(dashboard)/charts/new/page.tsx` - Fetches storage/app/fabric data
- `src/app/(dashboard)/charts/page.tsx` - Fetches storage/app/fabric data for list page
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` - Fetches storage/app/fabric data for edit page
- `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` - Threads new props through to ChartEditModal
- `src/__tests__/mocks/factories.ts` - Updated createMockChartWithRelations to include fabric relation

## Decisions Made
- Merged Task 1 and Task 2 implementations because the build couldn't pass without both ProjectSetupSection's new props interface and the parent components passing those props
- Made ChartList's new props optional with empty array defaults to minimize breaking changes in test files that don't exercise the dropdown functionality
- Fixed requireAuth return type as a Rule 3 (blocking) deviation -- user.id was typed as `string | undefined` despite the runtime guarantee

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed requireAuth return type for user.id**
- **Found during:** Task 1 (build verification)
- **Issue:** Auth.js v5 types `user.id` as `string | undefined` in the session. The `requireAuth()` function throws if `!user.id` but TypeScript didn't narrow the type, causing build errors in stitching-app-actions.ts and storage-location-actions.ts.
- **Fix:** Added `AuthUser` type with `id: string` and explicit return type on `requireAuth()` using a safe cast after the runtime check.
- **Files modified:** src/lib/auth-guard.ts
- **Verification:** Build passes, all 455 tests pass
- **Committed in:** e60ac5a (Task 1 commit)

**2. [Rule 3 - Blocking] Updated ChartList and chart list page for new ChartEditModal props**
- **Found during:** Task 1 (build verification)
- **Issue:** ChartList inline-renders ChartEditModal which now requires storageLocations/stitchingApps/unassignedFabrics props. Build failed without updating ChartList.
- **Fix:** Added optional props to ChartListProps with empty array defaults, updated charts/page.tsx to fetch and pass the data.
- **Files modified:** src/components/features/charts/chart-list.tsx, src/app/(dashboard)/charts/page.tsx
- **Verification:** Build passes, chart list tests unchanged (props are optional)
- **Committed in:** e60ac5a (Task 1 commit)

**3. [Rule 3 - Blocking] Updated mock factories for new ProjectWithRelations type**
- **Found during:** Task 2 (test verification)
- **Issue:** The mock factory `createMockChartWithRelations` returned plain `Project` without `fabric`, `storageLocation`, and `stitchingApp` relations, causing test failures when components accessed `project?.fabric?.id`.
- **Fix:** Added `createMockProjectWithRelations` factory and updated `createMockChartWithRelations` to return `ChartWithProject` type with null relation fields.
- **Files modified:** src/__tests__/mocks/factories.ts
- **Verification:** All 455 tests pass
- **Committed in:** 5da3b97 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes necessary for build and test integrity. No scope creep.

## Threat Model Coverage

- **T-05-11 (Tampering - fabric linking):** Mitigated. Server-side fabric update uses Prisma query by `linkedProjectId` to find current fabric and by `id` to link new. FK constraints ensure fabric exists. Single-user app accepts the trust boundary for ownership.
- **T-05-12 (Tampering - FK fields):** Mitigated. Zod validates all three FK fields as nullable strings. Prisma FK constraints reject invalid IDs at the database level.
- **T-05-13 (Info Disclosure - getUnassignedFabrics):** Accepted. Single-user app; all fabrics belong to the authenticated user. requireAuth() gate present.

## Issues Encountered
None beyond the blocking deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chart form fully wired: storage locations, stitching apps, and fabrics all selectable via DB-backed dropdowns
- Fabric linking complete end-to-end: create chart links fabric, edit chart can change/unlink fabric
- Detail page shows linked fabric in Project Setup section
- All data flows through the full stack: Server Component page -> client form component -> server action -> Prisma

## Self-Check: PASSED

- All created/modified files exist on disk
- Commit e60ac5a found in git log (Task 1)
- Commit 5da3b97 found in git log (Task 2)
- SUMMARY.md exists at expected path
- 455 tests pass, build clean

---
*Phase: 05-foundation-quick-wins*
*Completed: 2026-04-11*
