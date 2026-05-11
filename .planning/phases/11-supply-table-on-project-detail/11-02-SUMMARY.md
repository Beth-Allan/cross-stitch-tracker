---
phase: 11-supply-table-on-project-detail
plan: 02
subsystem: project-detail-supplies
tags: [supply-table, animation, integration, tdd]
dependency_graph:
  requires: [ServerActionAdapter (11-01), SupplyTable (Phase 10)]
  provides: [Unified SuppliesTab on project detail, newRowId animation chain]
  affects: [project-detail-page.tsx (no changes needed -- same props interface)]
tech_stack:
  added: []
  patterns: [parent-sorts-child-renders, animation-chain-via-id, adapter-pattern]
key_files:
  created: []
  modified:
    - src/components/features/supply-table/use-supply-table.ts
    - src/components/features/supply-table/supply-table-add-row.tsx
    - src/components/features/supply-table/supply-table.tsx
    - src/components/features/charts/project-detail/supplies-tab.tsx
    - src/components/features/charts/project-detail/supplies-tab.test.tsx
decisions:
  - "Used getAllByText in tests to avoid collision with SegmentedTypeToggle labels"
  - "Kept chartId in SuppliesTabProps interface for backward compatibility (parent still passes it)"
metrics:
  duration: 6m 58s
  completed: 2026-05-11
  tasks: 2/3 (Task 3 is human-verify checkpoint)
  tests_added: 14
  files_changed: 5
---

# Phase 11 Plan 02: Animation Wiring + SuppliesTab Replacement Summary

Wired newRowId animation chain end-to-end and replaced 457-line SuppliesTab with 157-line wrapper using SupplyTable + ServerActionAdapter. Closes Phase 10 deferred animation item (D-10).

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Wire newRowId animation chain | 3ea4c13 | commitRow returns newId, onRowAdded passes newId, handleRowAdded stores in Set with 250ms clear |
| 2 | Replace SuppliesTab with unified table wrapper (TDD) | 47c7213 (RED), 78fccd0 (GREEN) | New 157-line component, 14 tests, data transforms, sort toggle, ServerActionAdapter |

## Task 3: Pending Checkpoint

Task 3 is a `checkpoint:human-verify` gate requiring visual verification of the supply table on project detail. This cannot be completed by automation.

## TDD Gate Compliance

- RED: 47c7213 -- 8 tests fail against old implementation (confirms tests target new behavior)
- GREEN: 78fccd0 -- All 14 tests pass after implementation
- REFACTOR: Not needed -- implementation is clean at 157 lines

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test assertions for duplicate "Thread" text**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** `screen.getByText("Thread")` found multiple elements because both the section divider and the SegmentedTypeToggle render "Thread" text
- **Fix:** Changed to `screen.getAllByText("Thread").length` assertions and `screen.getByTestId("supply-table-add-row")` for non-ambiguous verification
- **Files modified:** `supplies-tab.test.tsx`
- **Commit:** 78fccd0

## Key Implementation Details

- **Animation chain:** adapter.add* returns `{ success: true, id: "..." }` -> commitRow extracts `result.id` -> onRowAdded passes `newId` up -> handleRowAdded adds to `newRowIds` Set -> DataRow renders with `animate-slide-in` -> setTimeout clears after 250ms (200ms animation + 50ms buffer)
- **Data transformation:** Three pure functions map junction types to SupplyRow (threadToSupplyRow, beadToSupplyRow, specialtyToSupplyRow)
- **Sort pattern:** Parent pre-sorts arrays with `localeCompare({ numeric: true })`, SupplyTable receives pre-sorted data (D-06)
- **CalcParams:** Derived from project fields (D-01), default fabricCount=14 when no fabric linked
- **No CalculatorSettingsBar:** Deferred to Phase 13 (D-02, D-03)
- **Backward compatible:** SuppliesTabProps interface unchanged, parent passes same props

## Verification Results

- 214 tests passing (200 supply-table + 14 supplies-tab)
- No TypeScript errors in modified files
- No unexpected file deletions
- Component line count: 157 (was 457)

## Known Stubs

None -- all code paths are fully implemented and wired to real components.

## Self-Check: PASSED
