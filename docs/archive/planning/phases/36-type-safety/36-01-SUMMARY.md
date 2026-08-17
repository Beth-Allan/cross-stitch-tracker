---
phase: 36-type-safety
plan: 01
subsystem: types
tags: [type-safety, strandcount, codependent-props]
dependency_graph:
  requires: []
  provides: [StrandCount-type, isStrandCount-guard, calculator-prop]
  affects: [skein-calculator, supply-table, project-detail]
tech_stack:
  added: []
  patterns: [literal-union-type, type-guard, codependent-prop-object]
key_files:
  created:
    - src/types/supply.test.ts
  modified:
    - src/types/supply.ts
    - src/lib/utils/skein-calculator.ts
    - src/components/features/supply-table/types.ts
    - src/components/features/charts/project-detail/types.ts
    - src/components/features/charts/project-detail/supplies-tab.tsx
    - src/components/features/charts/project-detail/supplies-tab.test.tsx
    - src/components/features/charts/project-detail/project-detail-page.tsx
    - src/lib/utils/skein-calculator.test.ts
decisions:
  - "StrandCount as literal union 1|2|3|4|5|6 with isStrandCount runtime guard (D-01)"
  - "Replaced as CalcParams['strandCount'] cast with isStrandCount guard defaulting to 2 (D-05)"
  - "Collapsed fabricOptions+chartId into single calculator? object prop (D-11)"
  - "Narrowed persistFields from Record<string,number> to Partial<Pick<CalcParams,...>> (D-12)"
metrics:
  duration: 5m
  completed: 2026-07-02T00:50:27Z
---

# Phase 36 Plan 01: StrandCount Type & Co-Dependent Props Summary

StrandCount literal union (1-6) with type guard across calculator, supply table, and project detail types; SuppliesTab co-dependent props collapsed to single calculator object with narrowed persistFields.

## What Was Built

### Task 1: StrandCount Type and Downstream Narrowing
- Exported `StrandCount` type alias (`1 | 2 | 3 | 4 | 5 | 6`) from `src/types/supply.ts`
- Exported `isStrandCount` type guard function validating `Number.isInteger` and range 1-6
- Narrowed `calculateSkeins` parameter from `number` to `StrandCount` in `skein-calculator.ts`
- Updated `CalcParams.strandCount` in `supply-table/types.ts` to import `StrandCount` (replacing inline literal)
- Narrowed `CalculatorSettings.strandCount` in `project-detail/types.ts` from `number` to `StrandCount`
- 13 tests for the type guard (valid 1-6, invalid 0/7/-1/1.5/NaN/Infinity, type narrowing)

### Task 2: Co-Dependent Props and persistFields Narrowing
- Replaced separate `fabricOptions?: FabricOption[]` and `chartId?: string` props with single `calculator?: { fabricOptions: FabricOption[]; chartId: string }`
- Updated `project-detail-page.tsx` caller to conditionally pass `calculator` prop
- Replaced `as CalcParams["strandCount"]` cast with `isStrandCount` guard (defaults to 2 if invalid)
- Narrowed `persistFields` from `Record<string, number>` to `Partial<Pick<CalcParams, 'strandCount' | 'overCount' | 'wastePercent'>>`
- Updated 4 test cases for new prop shape

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed skein-calculator.test.ts strandCount:0 type error**
- **Found during:** Task 1
- **Issue:** Existing test passed `strandCount: 0` which became a compile-time error after narrowing to `StrandCount`
- **Fix:** Added `as unknown as 1` cast with comment explaining it tests the runtime defense-in-depth guard
- **Files modified:** `src/lib/utils/skein-calculator.test.ts`
- **Commit:** 233ecc0

**2. [Rule 3 - Blocking] Fixed supplies-tab.test.tsx prop shape mismatch**
- **Found during:** Task 2
- **Issue:** 4 test cases still passed separate `fabricOptions` and `chartId` props after the interface change
- **Fix:** Updated all 4 test renders to use `calculator={{ fabricOptions, chartId }}` shape
- **Files modified:** `src/components/features/charts/project-detail/supplies-tab.test.tsx`
- **Commit:** e342fa7

## Verification

- `npx tsc --noEmit` exits with only pre-existing errors (Prisma client not generated in worktree)
- Zero new type errors introduced by these changes
- 2412/2412 tests passing (zero regressions)
- `strandCount: 0` and `strandCount: 7` are compile-time errors when passed to `calculateSkeins`

## Self-Check: PASSED

- All 8 modified/created files verified present
- Commits 593a4f9 (RED), 233ecc0 (GREEN Task 1), e342fa7 (Task 2) verified in git log
- StrandCount type and isStrandCount guard confirmed in src/types/supply.ts
- StrandCount import confirmed in skein-calculator.ts
- calculator? prop confirmed in supplies-tab.tsx (line 22)
- Partial<Pick<CalcParams, ...>> confirmed in supplies-tab.tsx (line 128)
- 2412/2412 tests passing
