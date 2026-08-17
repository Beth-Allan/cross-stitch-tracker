---
phase: 04-supplies-fabric
plan: 01
subsystem: database
tags: [prisma, postgresql, zod, seed, dmc, fabric, supply, tdd]

# Dependency graph
requires:
  - phase: 02-chart-crud
    provides: "Project model, Prisma patterns, Zod validation patterns, test factory infrastructure"
provides:
  - "9 new Prisma models (SupplyBrand, Thread, Bead, SpecialtyItem, FabricBrand, Fabric) + 3 junction tables (ProjectThread, ProjectBead, ProjectSpecialty)"
  - "2 new enums (SupplyType, ColorFamily)"
  - "TypeScript domain types for supply and fabric entities"
  - "Zod validation schemas for all supply/fabric CRUD operations"
  - "Fabric size calculator with TDD tests"
  - "DMC thread catalog with 459 entries seeded in database"
  - "Test factories for all new entity types"
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07]

# Tech tracking
tech-stack:
  added: [tsx]
  patterns: [seed-script-with-prisma-neon, fabric-size-calculation, color-family-classification]

key-files:
  created:
    - prisma/fixtures/dmc-threads.json
    - prisma/seed.ts
    - src/types/supply.ts
    - src/types/fabric.ts
    - src/lib/validations/supply.ts
    - src/lib/validations/fabric.ts
    - src/lib/utils/fabric-calculator.ts
    - src/lib/utils/fabric-calculator.test.ts
  modified:
    - prisma/schema.prisma
    - prisma.config.ts
    - package.json
    - src/__tests__/mocks/factories.ts
    - src/components/features/charts/chart-detail.tsx
    - src/components/features/charts/use-chart-form.ts
    - src/lib/actions/chart-actions.ts
    - src/lib/actions/chart-actions-errors.test.ts
    - src/lib/validations/chart.ts
    - src/lib/validations/chart.test.ts

key-decisions:
  - "Seed config in prisma.config.ts (Prisma 7 pattern) instead of package.json"
  - "PrismaNeon adapter in seed script to match app's database connection pattern"
  - "Color family classification via HSL hue/saturation/lightness ranges for 459 DMC threads"
  - "Removed fabricId from Project model -- replaced by Fabric.linkedProjectId reverse relation"

patterns-established:
  - "Seed script pattern: dotenv + PrismaNeon adapter + upsert for idempotency"
  - "Supply type pattern: domain types re-export Prisma types with computed relations"
  - "Fabric calculator: pure function with (stitches / count) + 6 inch margin formula"

requirements-completed: [SUPP-01, REF-02]

# Metrics
duration: 11min
completed: 2026-04-10
---

# Phase 4 Plan 01: Data Foundation Summary

**Prisma schema with 9 supply/fabric models, 459-entry DMC thread catalog, Zod validations, and TDD fabric calculator**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-10T23:51:04Z
- **Completed:** 2026-04-11T00:02:33Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Extended Prisma schema with 9 new models, 3 junction tables, and 2 enums for supply and fabric tracking
- Created 459-entry DMC thread fixture with HSL-based color family classification across all 11 families
- Implemented fabric size calculator with TDD (9 tests) using the standard 3-inch-per-side margin formula
- Built comprehensive Zod validation schemas for all supply and fabric CRUD operations
- Extended test factories to cover all new entity types with sensible defaults

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma schema, TypeScript types, Zod validations, and fabric calculator** - `516245f` (feat)
2. **Task 2: DMC seed fixture, seed script, package.json config, and database push** - `a933887` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Extended with SupplyBrand, Thread, Bead, SpecialtyItem, ProjectThread, ProjectBead, ProjectSpecialty, FabricBrand, Fabric models + SupplyType, ColorFamily enums
- `prisma/fixtures/dmc-threads.json` - 459 DMC thread entries with colorCode, colorName, hexColor, colorFamily
- `prisma/seed.ts` - Idempotent seed script using PrismaNeon adapter
- `prisma.config.ts` - Added seed command configuration
- `src/types/supply.ts` - Supply domain types (ThreadWithBrand, BeadWithBrand, etc.)
- `src/types/fabric.ts` - Fabric domain types (FabricWithBrand, FabricWithProject, constants)
- `src/lib/validations/supply.ts` - Zod schemas for all supply entities and junction records
- `src/lib/validations/fabric.ts` - Zod schemas for fabric and fabric brand
- `src/lib/utils/fabric-calculator.ts` - calculateRequiredFabricSize and doesFabricFit functions
- `src/lib/utils/fabric-calculator.test.ts` - 9 TDD tests for fabric calculator
- `src/__tests__/mocks/factories.ts` - Added 9 new factory functions + extended mock Prisma client
- `package.json` - Added tsx dev dependency
- `src/components/features/charts/chart-detail.tsx` - Removed fabricId references
- `src/components/features/charts/use-chart-form.ts` - Removed fabricId from form values
- `src/lib/actions/chart-actions.ts` - Removed fabricId from create/update project data
- `src/lib/validations/chart.ts` - Removed fabricId from chart form schema
- `src/lib/validations/chart.test.ts` - Removed fabricId from test data
- `src/lib/actions/chart-actions-errors.test.ts` - Removed fabricId from test fixtures

## Decisions Made
- **Seed config in prisma.config.ts:** Prisma 7 moved the seed command from `package.json` to `prisma.config.ts` under `migrations.seed`. Discovered during execution when `npx prisma db seed` reported no seed command configured.
- **PrismaNeon adapter in seed script:** The seed script must use the same `PrismaNeon` adapter as the app's `db.ts` to connect to Neon. A bare `PrismaClient()` fails without the adapter in Prisma 7.
- **Removed fabricId from Project model:** Replaced the plain string `fabricId` field with a proper `Fabric` model relation via `Fabric.linkedProjectId`. This required updating existing chart actions, forms, validations, and tests that referenced `fabricId`.
- **Color family classification via HSL:** Used hue/saturation/lightness thresholds to classify all 459 DMC threads into 11 color families, with reasonable distribution across all families.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed fabricId references from existing code**
- **Found during:** Task 1 (Schema changes)
- **Issue:** Removing `fabricId` from the Project model broke 6 files that referenced `project.fabricId` in chart detail, form hook, actions, validations, and tests
- **Fix:** Removed all `fabricId` references -- the field is replaced by the `Fabric.linkedProjectId` reverse relation
- **Files modified:** chart-detail.tsx, use-chart-form.ts, chart-actions.ts, chart.ts, chart.test.ts, chart-actions-errors.test.ts
- **Verification:** All 183 tests pass, no remaining fabricId references in src/
- **Committed in:** 516245f (Task 1 commit)

**2. [Rule 3 - Blocking] Seed config in prisma.config.ts instead of package.json**
- **Found during:** Task 2 (Seed script setup)
- **Issue:** Plan specified adding seed config to package.json, but Prisma 7 reads seed from prisma.config.ts
- **Fix:** Added `seed: "npx tsx prisma/seed.ts"` to `migrations` in prisma.config.ts
- **Files modified:** prisma.config.ts
- **Verification:** `npx prisma db seed` runs successfully
- **Committed in:** a933887 (Task 2 commit)

**3. [Rule 3 - Blocking] PrismaNeon adapter required for seed script**
- **Found during:** Task 2 (Seed execution)
- **Issue:** Bare `PrismaClient()` throws PrismaClientInitializationError -- needs PrismaNeon adapter like the app
- **Fix:** Updated seed.ts to use dotenv + PrismaNeon adapter with DATABASE_URL
- **Files modified:** prisma/seed.ts
- **Verification:** Seed runs twice without error (idempotent)
- **Committed in:** a933887 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes necessary for correct operation. No scope creep -- all changes directly related to making the schema migration and seed script work.

## Issues Encountered
- Worktree missing `.env.local` -- resolved by symlinking from main project directory

## User Setup Required
None - no external service configuration required. Database schema was pushed to existing Neon instance.

## Next Phase Readiness
- All 9 supply/fabric models in database, ready for server actions (Plan 02)
- Types and validations exported, ready for forms and UI (Plans 03-07)
- DMC catalog seeded with 459 threads, ready for catalog browsing (Plan 03)
- Test factories ready for all new entity types
- Fabric calculator ready for project detail integration

## Self-Check: PASSED

All files exist, all commits verified, all key content present. 10/10 files found, 2/2 commits found, 459 DMC entries confirmed, all model/type/validation/factory exports verified.

---
*Phase: 04-supplies-fabric*
*Completed: 2026-04-10*
