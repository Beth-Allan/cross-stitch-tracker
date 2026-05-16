---
phase: 13-supply-takeover
plan: 03
subsystem: charts, supply-table
tags: [react-activity, mode-toggle, supply-embedding, atomic-save, draft-v2, tdd]
dependency_graph:
  requires: [13-01, 13-02]
  provides: [supply-takeover-integration, activity-mode-toggle, atomic-chart-supply-creation]
  affects: [chart-merged-form.tsx, use-chart-form.ts, creation-flow-adapter.ts]
tech_stack:
  added: []
  patterns:
    - "React Activity for form/supply mode toggle (preserves state without unmount)"
    - "CreationFlowAdapter wired as local buffer for supply rows during creation"
    - "Conditional createChartWithSupplies vs createChart based on supply count"
    - "DraftV2 persistence with supply rows and CalcParams"
    - "Stale fabric ID detection on draft restore with toast notification"
key_files:
  created: []
  modified:
    - src/components/features/charts/chart-merged-form.tsx
    - src/components/features/charts/chart-merged-form.test.tsx
    - src/components/features/charts/use-chart-form.ts
    - src/components/features/supply-table/creation-flow-adapter.ts
decisions:
  - "Used colorName for Bead and SpecialtyItem models (not name) in createFn result mappings"
  - "Cast through unknown for Record<string, unknown> in adapter updateQuantity to satisfy strict TypeScript"
metrics:
  duration_seconds: 180
  completed: 2026-05-16
  tests_added: 13
  tests_total: 1542
  files_changed: 4
requirements_completed: [TAKE-01, TAKE-02, TAKE-03, TAKE-04]
---

# Phase 13 Plan 03: Activity Mode Toggle + Supply Embedding Summary

Activity mode toggle wired into ChartMergedForm with SummaryBar, CalculatorCard, and SupplyTable via CreationFlowAdapter; handleSubmit extended to dispatch createChartWithSupplies for atomic save; DraftV2 persistence backs up supply rows and CalcParams; two type errors fixed for build compliance.

## Performance

- **Duration:** ~3 min (type fixes only; main implementation from prior session)
- **Tasks:** 1 of 2 (Task 2 is checkpoint:human-verify -- awaiting manual verification)
- **Tests:** 1,542 passing (32 in chart-merged-form.test.tsx, 13 new for supply takeover)
- **Build:** Clean (zero type errors)

## Tasks Completed

| Task | Name | Commit(s) | Key Changes |
|------|------|-----------|-------------|
| 1 | Activity mode toggle + supply embedding | `003d7f4` (RED), `a6e338d` (GREEN), `81ef2ff` (fix), `9e37482` (fix), `19ad113` (fix) | Mode toggle, SummaryBar/CalculatorCard/SupplyTable embedding, createChartWithSupplies dispatch, DraftV2 wiring, type fixes |

## Implementation Details

### Mode Toggle (D-01, D-02)
- React `<Activity>` wraps form mode and supply mode as sibling blocks
- Form mode shows creation form; supply mode shows SummaryBar + CalculatorCard + SupplyTable
- Milestone marker "Add supplies" button triggers `setMode("supply")` (disabled when name empty)
- SummaryBar "Details" button triggers `setMode("form")` with last-focused-element restore
- Form state fully preserved across toggles (Activity preserves DOM without unmounting)

### Supply Embedding
- `CreationFlowAdapter` instantiated once via ref with injected `searchFn` and `createFn`
- Search delegates to `getThreads`/`getBeads`/`getSpecialtyItems` server actions with proper field mapping
- Create delegates to `createThread`/`createBead`/`createSpecialtyItem` (catalog-only, no junction records)
- Supply rows stored in React state via `onRowsChange` callback
- SupplyTable receives filtered rows by type + adapter + calcParams

### Atomic Save (D-03, D-06)
- `useChartForm` accepts `getSupplyRows` callback to extract buffered rows from adapter
- When supplies exist: builds typed payload (threads/beads/specialty) and calls `createChartWithSupplies`
- When no supplies: calls original `createChart`
- `onValidationError` callback switches mode back to "form" if validation fails

### Draft Persistence V2 (D-05)
- `saveDraftV2` serializes form values + supply rows + calcParams to localStorage
- `loadDraftV2` restores all three; applies stale ID detection for fabric/designer/storage/app
- Stale fabric detection compares raw draft fabricId to restored value; shows toast if nulled
- V1 backward compat: old drafts wrapped in V2 shape with empty supplies

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed type errors in createFn for Bead and SpecialtyItem**
- **Found during:** Task 1 verification (build check)
- **Issue:** `result.bead.name` and `result.specialtyItem.name` referenced non-existent `name` property; models use `colorName`
- **Fix:** Changed to `result.bead.colorName` and `result.specialtyItem.colorName`
- **Files modified:** `src/components/features/charts/chart-merged-form.tsx`
- **Commit:** `19ad113`

**2. [Rule 1 - Bug] Fixed strict TypeScript cast in CreationFlowAdapter updateQuantity**
- **Found during:** Task 1 verification (build check)
- **Issue:** `(row as Record<string, unknown>)` fails strict TypeScript overlap check
- **Fix:** Changed to `(row as unknown as Record<string, unknown>)` for double-cast
- **Files modified:** `src/components/features/supply-table/creation-flow-adapter.ts`
- **Commit:** `19ad113`

## Threat Mitigations Verified

| Threat ID | Mitigation | Verified |
|-----------|-----------|----------|
| T-13-07 | requireAuth() in createChartWithSupplies | Yes (Plan 01) |
| T-13-08 | batchSupplySchema validates all fields at server boundary | Yes (Plan 01) |
| T-13-09 | SummaryBar shows only user's own form data | Yes -- reads form.values directly |
| T-13-10 | Activity toggle is synchronous state change, no server calls | Yes -- pure React state |

## TDD Gate Compliance

- RED: `003d7f4` (13 test cases for mode toggle, supply embedding, draft V2, submit dispatch)
- GREEN: `a6e338d` (implementation making all tests pass)
- Follow-up fixes: `81ef2ff`, `9e37482`, `19ad113` (supply search mapping, Activity event blocking, type errors)

All TDD gates satisfied.

## Checkpoint Status

Task 2 (`type="checkpoint:human-verify"`) is pending. The full supply takeover flow needs manual verification:
1. Navigate to /charts/new
2. Fill form, click "Add supplies"
3. Verify mode toggle, SummaryBar, CalculatorCard, SupplyTable
4. Add supplies, toggle back, verify state preservation
5. Create chart, verify atomic save including supplies

## Self-Check: PASSED

- All 4 modified files verified on disk
- Commit `19ad113` verified in git log
- 1,542 tests passing, zero regressions
- Build passes clean (zero type errors)
- No stubs or placeholder patterns found
