---
phase: 13-supply-takeover
fixed_at: 2026-05-15T21:30:00Z
status: all_fixed
findings_in_scope: 6
fixed: 6
skipped: 0
iteration: 1
fix_scope: critical_warning
---

# Phase 13: Code Review Fix Report

**Fixed:** 2026-05-15T21:30:00Z
**Scope:** Critical + Warning (6 findings)
**Status:** all_fixed

## Fixes Applied

### CR-01: Fabric Ownership Check (Critical) — FIXED

**Commit:** `a086216`
**Files:** `src/lib/actions/chart-actions.ts`

Added `!targetFabric` guard to all 3 ownership checks (createChart, createChartWithSupplies, updateChart). Previously, a nonexistent fabricId would pass the guard since `targetFabric?.linkedProject` evaluates to undefined (falsy), skipping the ownership check entirely.

### WR-01: Supply Row localStorage Validation — FIXED

**Commit:** `34f4a55`
**Files:** `src/components/features/charts/use-draft-persistence.ts`

Added `isValidSupplyRow` runtime type guard that validates all required fields and types before loading supply rows from localStorage. Malformed rows are silently filtered out, preventing client-side crashes from tampered localStorage data.

### WR-02: Duplicate fabricCount Update — FIXED

**Commit:** `929e915`
**Files:** `src/components/features/charts/form-primitives/calculator-card.tsx`, `calculator-card.test.tsx`

Removed duplicate `onCalcParamsChange` call from `handleFabricSelect` in CalculatorCard. Parent's `onFabricChange` handler is the single owner of fabricCount updates. Updated test to assert `onCalcParamsChange` is NOT called on fabric select.

### WR-03: Type-Unsafe Cast in updateQuantity — FIXED

**Commit:** `bd7a3c6`
**Files:** `src/components/features/supply-table/creation-flow-adapter.ts`

Replaced `(row as unknown as Record<string, unknown>)[field] = value` with immutable spread: `const updated: SupplyRow = { ...row, [field]: value }`. Preserves type safety and makes the update immutable.

### WR-04: Non-Null Assertion on result.project — FIXED

**Commit:** `a086216` (combined with CR-01)
**Files:** `src/lib/actions/chart-actions.ts`

Replaced `result.project!.id` with explicit guard: `if (!result.project) throw new Error("Project creation failed")`.

### WR-05: Code Duplication — FIXED

**Commit:** `4e00994`
**Files:** `src/lib/actions/chart-actions.ts`

Extracted `createChartAndProject` and `handleThumbnail` shared helpers. Both `createChart` and `createChartWithSupplies` now delegate to the shared helper, eliminating ~60 lines of duplicated creation + ownership logic.

## Skipped (Info-Level, Out of Scope)

- **IN-01:** console.error logging — not in scope (info)
- **IN-02:** Unused assertion in adapter tests — not in scope (info)

## Test Verification

All 60 tests pass across 4 affected test files:
- `chart-actions.test.ts` — 11 tests
- `calculator-card.test.tsx` — 11 tests
- `use-draft-persistence.test.ts` — 22 tests
- `creation-flow-adapter.test.ts` — 16 tests
