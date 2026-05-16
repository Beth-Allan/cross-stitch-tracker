---
phase: 13-supply-takeover
plan: 05
subsystem: supply-table
tags: [skein-calculator, recalculation, adapter-pattern, tdd]
dependency_graph:
  requires: [13-03]
  provides: [skein-recalculation-on-edit, bulk-recalculation-on-param-change]
  affects: [supply-table, creation-flow-adapter, server-action-adapter]
tech_stack:
  added: []
  patterns: [adapter-method-injection-via-duck-typing, ref-based-change-detection]
key_files:
  created: []
  modified:
    - src/components/features/supply-table/creation-flow-adapter.ts
    - src/components/features/supply-table/creation-flow-adapter.test.ts
    - src/components/features/supply-table/server-action-adapter.ts
    - src/components/features/supply-table/server-action-adapter.test.ts
    - src/components/features/supply-table/supply-table.tsx
    - src/components/features/supply-table/supply-table.test.tsx
decisions:
  - Duck-typing check for setCalcParams/setRows avoids changing the SupplyTableAdapter interface
  - JSON.stringify for calcParams change detection is simple and sufficient for 4 numeric fields
  - Ref-based prev tracking skips initial mount to avoid unnecessary bulk recalculation
metrics:
  duration: 4m
  completed: 2026-05-16
  tasks_completed: 2
  tasks_total: 2
  tests_added: 8
  tests_total: 1550
---

# Phase 13 Plan 05: Skein Recalculation Wiring Summary

Wired calculateSkeins through both adapters so editing stitchCount on existing thread rows recalculates need, and changing calc settings triggers bulk recalculation for all non-overridden threads.

## What Was Done

### Task 1: Adapter Recalculation (TDD)

**RED:** Added 5 failing tests across both adapter test files covering:
- CreationFlowAdapter recalculates need on stitchCount edit (non-overridden thread)
- CreationFlowAdapter skips recalculation when isNeedOverridden is true
- CreationFlowAdapter leaves need/have fields unchanged (no side effects)
- ServerActionAdapter sends quantityRequired alongside stitchCount
- ServerActionAdapter skips recalculation when isNeedOverridden is true

**GREEN:** Implemented setCalcParams on both adapters and recalculation in updateQuantity:
- CreationFlowAdapter: imports calculateSkeins, recalculates in-memory need when field is stitchCount + type is THREAD + not overridden + calcParams available
- ServerActionAdapter: adds setCalcParams + setRows methods, looks up row by junctionId to check isNeedOverridden, sends both stitchCount and quantityRequired to server action

### Task 2: SupplyTable CalcParams Wiring (TDD)

**RED:** Added 3 failing tests for SupplyTable:
- Calls adapter.setCalcParams when method exists
- Calls adapter.setRows when method exists
- Bulk recalculates non-overridden thread rows on calcParams change

**GREEN:** Added three useEffect hooks to SupplyTable:
1. Syncs mergedCalcParams to adapter via duck-typed setCalcParams check
2. Syncs allRows to adapter via duck-typed setRows check
3. Detects calcParams changes via ref + JSON.stringify, iterates non-overridden thread rows with stitchCount > 0, calls adapter.updateQuantity to trigger recalculation

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- All 224 supply-table tests pass (8 new)
- All 1550 project tests pass (no regressions)
- Build passes clean
- calculateSkeins imported in both adapters (grep verified)

## TDD Gate Compliance

- RED commit: a9471a6 (adapter tests), e6aeed2 (SupplyTable tests)
- GREEN commit: b1a635d (adapter implementations), 71d3e9d (SupplyTable wiring)
- All tests failed before implementation and passed after -- gates satisfied.

## Self-Check: PASSED

All 6 modified files confirmed on disk. All 4 task commits confirmed in git log.
