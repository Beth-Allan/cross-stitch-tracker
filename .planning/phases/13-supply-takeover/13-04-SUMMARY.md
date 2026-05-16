---
phase: 13-supply-takeover
plan: 04
subsystem: charts/creation-flow
tags: [gap-closure, bug-fix, createFn, draft-persistence, conditional-rendering]
dependency_graph:
  requires: [13-03]
  provides: [correct-createFn-mapping, draft-auto-save, fabric-dropdown-fix]
  affects: [chart-merged-form, supply-table-create-flow]
tech_stack:
  added: []
  patterns: [extracted-testable-helper, ref-based-unmount-cleanup, conditional-rendering-over-activity]
key_files:
  created: []
  modified:
    - src/components/features/charts/chart-merged-form.tsx
    - src/components/features/charts/chart-merged-form.test.tsx
decisions:
  - Extracted buildCreateFn() as named export for testability rather than testing through deeply nested SupplyTable UI interaction
  - Used conditional rendering instead of Activity for supply mode to avoid Base UI Popover init deferral
  - Used ref-based approach for unmount auto-save to avoid stale closures in useEffect cleanup
metrics:
  duration: 6m
  completed: 2026-05-16
  tasks_completed: 2
  tasks_total: 2
  tests_added: 7
  tests_total: 39
---

# Phase 13 Plan 04: Gap Closure - createFn + Activity + Auto-save Summary

Fix three UAT failures in chart-merged-form: createFn field mismatches causing server validation errors, Activity deferring Popover init for fabric dropdown, and draft not auto-saving on unmount.

## One-liner

Fixed createFn Zod schema field mapping (name->colorName), replaced supply-mode Activity with conditional rendering for Popover init, and added ref-based draft auto-save on unmount.

## What Changed

### Task 1: Fix createFn field name mismatches (GAP 7)

**Problem:** The `createFn` callback in chart-merged-form passed `name` instead of `colorName` to server actions, and was missing required fields (`colorFamily`, `hexColor`). All three supply types (Thread, Bead, Specialty) failed Zod validation on the server.

**Fix:**
- Extracted `buildCreateFn()` as a named export for isolated testability
- THREAD: `name` -> `colorName`, added `colorFamily: "NEUTRAL"`, default `hexColor: "#808080"`
- BEAD: `name` -> `colorName`, added `colorFamily: "NEUTRAL"`, `hexColor: "#808080"`
- SPECIALTY: `name` -> `colorName`, added `hexColor: "#808080"`
- All fields now match their Zod schemas (threadSchema, beadSchema, specialtyItemSchema)

### Task 2: Conditional rendering + draft auto-save (GAPs 5 + 10)

**Problem (GAP 5):** React 19 Activity with `mode="hidden"` defers Base UI Popover internal FloatingRootContext init to OffscreenLane. When Activity becomes visible, PopoverTrigger has stale empty context -- clicks on the fabric dropdown do nothing.

**Fix:** Replaced `<Activity mode={...}>` around the supply section with `{mode === "supply" && (...)}`. CalculatorCard mounts fresh when supply mode activates. CalcParams state lives in the parent so remounting is safe.

**Problem (GAP 10):** Navigating away from the form (via Next.js Link) unmounts the component without saving the draft. Only explicit "Save Draft" button worked.

**Fix:** Added `useEffect` cleanup that calls `saveDraftV2` on unmount. Uses refs (`formValuesRef`, `supplyRowsRef`, `calcParamsRef`) to avoid stale closures. A `submittedRef` prevents auto-save after successful form submission. Empty form names skip auto-save.

## Commits

| # | Hash | Type | Description |
|---|------|------|-------------|
| 1 | 81b0e88 | test | Add failing tests for createFn field name mapping (RED) |
| 2 | de064ec | feat | Fix createFn field name mismatches for all supply types (GREEN) |
| 3 | 8d836a5 | test | Add failing tests for draft auto-save on unmount (RED) |
| 4 | 3ea8b75 | feat | Conditional rendering for supply mode + draft auto-save on unmount (GREEN) |

## Tests

- 39 tests in chart-merged-form.test.tsx (7 new)
- 363 tests across 34 chart test files (0 regressions)
- Build passes clean (no type errors)

### New Tests

| Test | What it verifies |
|------|-----------------|
| createFn THREAD mapping | colorName, colorCode, hexColor, colorFamily, brandId passed correctly |
| createFn BEAD mapping | colorName, productCode, hexColor, colorFamily, brandId passed correctly |
| createFn SPECIALTY mapping | colorName, productCode, hexColor, brandId passed correctly |
| Auto-save on unmount with content | saveDraftV2 called with V2 format on unmount |
| No auto-save after submit | submittedRef prevents auto-save after successful creation |
| No auto-save with empty name | Empty forms don't produce draft entries |
| Conditional rendering | CalculatorCard absent from DOM in form mode, present in supply mode |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Extracted buildCreateFn as testable export**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** The createFn callback was defined inline inside the component body, making it impossible to test the field mapping in isolation without complex SupplyTable UI interaction
- **Fix:** Extracted as `buildCreateFn()` named export, called from both tests and component
- **Files modified:** src/components/features/charts/chart-merged-form.tsx
- **Commit:** de064ec

## TDD Gate Compliance

- RED gate: 81b0e88 (test commit for Task 1), 8d836a5 (test commit for Task 2)
- GREEN gate: de064ec (feat commit for Task 1), 3ea8b75 (feat commit for Task 2)
- REFACTOR gate: Not needed -- code was clean after GREEN

## Verification

```
Activity supply wrapper count: 0 (expected 0)
colorName: data.name count: 3 (expected 3)
Chart test suite: 363/363 passed
Production build: clean
File deletions: none
```

## Known Stubs

None -- all functionality is fully wired.

## Self-Check: PASSED

- All files exist: chart-merged-form.tsx, chart-merged-form.test.tsx, 13-04-SUMMARY.md
- All commits found: 81b0e88, de064ec, 8d836a5, 3ea8b75
