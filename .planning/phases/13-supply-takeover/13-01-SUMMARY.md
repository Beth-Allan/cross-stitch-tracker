---
phase: 13-supply-takeover
plan: 01
subsystem: supply-table, chart-actions, draft-persistence
tags: [data-layer, adapter, server-action, validation, localStorage]
dependency_graph:
  requires: []
  provides: [CreationFlowAdapter, createChartWithSupplies, batchSupplySchema, DraftV2]
  affects: [supply-table/index.ts, chart-actions.ts, chart.ts, use-draft-persistence.ts]
tech_stack:
  added: []
  patterns: [adapter-pattern, injected-dependencies, supply-cache, versioned-localStorage]
key_files:
  created:
    - src/components/features/supply-table/creation-flow-adapter.ts
    - src/components/features/supply-table/creation-flow-adapter.test.ts
  modified:
    - src/components/features/supply-table/index.ts
    - src/lib/actions/chart-actions.ts
    - src/lib/actions/chart-actions.test.ts
    - src/lib/validations/chart.ts
    - src/lib/validations/chart.test.ts
    - src/components/features/charts/use-draft-persistence.ts
    - src/components/features/charts/use-draft-persistence.test.ts
decisions:
  - "Used injected searchFn/createFn instead of direct server action imports for testability"
  - "Supply cache populated on search/create to resolve metadata in add methods"
  - "DraftV2 uses version field for backward compat with V1 drafts"
  - "Added createMany to mock prisma locally in chart-actions.test.ts (not in shared factory)"
metrics:
  duration_seconds: 496
  completed: 2026-05-14T03:47:39Z
  tests_added: 35
  tests_total: 1506
  files_changed: 9
---

# Phase 13 Plan 01: Supply Data Layer Summary

CreationFlowAdapter buffering supplies in React state, createChartWithSupplies with atomic $transaction across three junction tables, batchSupplySchema with max-500 validation, DraftV2 localStorage persistence with V1 backward compat.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | CreationFlowAdapter + barrel export | `62dee4c` (RED), `85e7072` (GREEN) | Adapter class with Map storage, injected search/create fns, duplicate detection, getRows/loadRows, supply cache |
| 2 | createChartWithSupplies + batchSupplySchema + DraftV2 | `9f32131` (RED), `b7d7ade` (GREEN) | Server action with $transaction, Zod batch schema, versioned draft persistence |

## Implementation Details

### CreationFlowAdapter (Task 1)
- Implements `SupplyTableAdapter` interface using a flat `Map<string, SupplyRow>` for all supply types
- Constructor accepts `onRowsChange`, `searchFn`, and `createFn` callbacks -- no direct server action imports
- Supply metadata cache populated during `searchSupplies()` and `createSupply()` calls; fallback values for uncached supplies
- Duplicate detection checks `supplyId + type` combination before adding
- `getRows()` returns all buffered rows for form submission payload
- `loadRows()` replaces buffer contents for draft restore from localStorage
- 16 test cases covering all adapter methods + edge cases

### createChartWithSupplies (Task 2)
- Follows exact pattern of existing `createChart` (auth guard, Zod validation, try/catch ZodError)
- Single `$transaction` wrapping chart.create + fabric link + three `createMany` calls (D-06)
- `ProjectThread`, `ProjectBead`, `ProjectSpecialty` junction inserts with `skipDuplicates: true` (D-07)
- Thumbnail generation after transaction (matches existing pattern)
- `batchSupplySchema`: validates supply arrays with `supplyId.min(1)`, `need.min(1)`, `stitchCount.min(0)`, `.max(500)` per type

### DraftV2 Persistence (Task 2)
- `DraftV2` interface: `{ version: 2, form, supplies, calcParams }`
- `saveDraftV2()`: serializes full V2 shape to localStorage under same `chart-draft` key
- `loadDraftV2()`: detects V1 (no version field) and wraps in V2 shape with empty supplies + DEFAULT_CALC_PARAMS
- Stale ID detection applied to V2 drafts (designer, storage, app, fabric)
- Original `saveDraft`/`loadDraft`/`clearDraft` preserved for backward compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added createMany to mock Prisma in chart-actions.test.ts**
- **Found during:** Task 2 GREEN phase
- **Issue:** Shared `createMockPrisma()` factory lacks `createMany` on junction table mocks; tests calling `$transaction` would fail because `tx.projectThread.createMany` was undefined
- **Fix:** Added `createMany` as `vi.fn()` locally in the test file (not modifying shared factory to avoid cross-agent conflicts in parallel worktree)
- **Files modified:** `src/lib/actions/chart-actions.test.ts`
- **Commit:** `b7d7ade`

**2. [Rule 1 - Bug] Used vi.resetAllMocks() instead of vi.clearAllMocks() in chart-actions tests**
- **Found during:** Task 2 GREEN phase
- **Issue:** `vi.clearAllMocks()` only clears call counts, not `mockImplementationOnce` queues, causing mock state to leak between tests
- **Fix:** Switched to `vi.resetAllMocks()` in the `beforeEach` block
- **Files modified:** `src/lib/actions/chart-actions.test.ts`
- **Commit:** `b7d7ade`

## TDD Gate Compliance

Task 1:
- RED: `62dee4c` (test commit, 16 failing tests)
- GREEN: `85e7072` (feat commit, 16 passing tests)

Task 2:
- RED: `9f32131` (test commit, 13 failing tests)
- GREEN: `b7d7ade` (feat commit, all 53 tests passing)

All TDD gates satisfied.

## Threat Mitigations Verified

| Threat ID | Mitigation | Verified |
|-----------|-----------|----------|
| T-13-01 | `requireAuth()` at function entry | Yes -- test confirms Unauthorized rejection |
| T-13-02 | Zod validation on supplyId, need, stitchCount | Yes -- batchSupplySchema tests cover boundaries |
| T-13-03 | `.max(500)` on each supply array | Yes -- test confirms 501 items rejected |
| T-13-04 | Prisma FK constraints + $transaction rollback | Accepted (no test needed -- DB-level enforcement) |

## Self-Check: PASSED

- All 9 key files verified present on disk
- All 4 commits verified in git log (62dee4c, 85e7072, 9f32131, b7d7ade)
- 1506 tests passing, zero regressions
- No stubs or placeholder patterns found
