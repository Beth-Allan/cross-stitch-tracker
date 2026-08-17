---
phase: 10-unified-supply-table
plan: 01
subsystem: supply-table
tags: [types, adapter, svg, editable-cell, tdd]
dependency_graph:
  requires: []
  provides: [SupplyTableAdapter, SupplyRow, SupplySearchResult, CalcParams, StatusDonut, EditableNumber, LocalStateAdapter]
  affects: [supply-table-data-row, supply-table-add-row, supply-table, use-supply-table]
tech_stack:
  added: []
  patterns: [adapter-pattern, svg-donut-ring, click-to-edit-cell]
key_files:
  created:
    - src/components/features/supply-table/types.ts
    - src/components/features/supply-table/local-state-adapter.ts
    - src/components/features/supply-table/local-state-adapter.test.ts
    - src/components/features/supply-table/status-donut.tsx
    - src/components/features/supply-table/status-donut.test.tsx
    - src/components/features/supply-table/editable-number.tsx
    - src/components/features/supply-table/editable-number.test.tsx
  modified: []
decisions:
  - "Used crypto.randomUUID() for ID generation in LocalStateAdapter instead of adding nanoid dependency"
  - "StatusDonut is server-compatible (no 'use client') -- pure SVG with no hooks"
  - "EditableNumber validates parseInt >= 0 before calling onSave, reverts on invalid (T-10-01 mitigation)"
metrics:
  duration: 203s
  completed: 2026-05-03T23:39:00Z
  tasks_completed: 3
  tasks_total: 3
  tests_added: 37
  files_created: 7
  files_modified: 0
---

# Phase 10 Plan 01: Types, Adapter, and Atomic Primitives Summary

SupplyTableAdapter interface with 7 methods, LocalStateAdapter in-memory implementation, StatusDonut SVG ring with proportional arc math, and EditableNumber click-to-edit cell with keyboard support and input validation.

## Tasks Completed

| # | Task | Commit | Tests |
|---|------|--------|-------|
| 1 | Define type contracts and build LocalStateAdapter | 5594d06 | 17 |
| 2 | Build StatusDonut SVG component | 1682daa | 9 |
| 3 | Build EditableNumber component | c318e0b | 11 |

## What Was Built

### types.ts
- `SupplyTableAdapter` interface with 7 async methods: addThread, addBead, addSpecialty, updateQuantity, remove, searchSupplies, createSupply
- `SupplyRow`, `SupplySearchResult`, `CreateSupplyData` data types
- `CalcParams` with `DEFAULT_CALC_PARAMS` (fabricCount=14, strandCount=2, overCount=1, wastePercent=20)
- `SupplyType`, `Result`, `SupplyTableProps` types
- No "use client" -- pure type definitions

### local-state-adapter.ts
- `LocalStateAdapter` class implementing full `SupplyTableAdapter` interface
- Constructor accepts three `SupplySearchResult[]` arrays for controlled test data
- Search: case-insensitive substring match on code/name, max 8 results
- Add: generates junction IDs with `crypto.randomUUID()`, stores in typed Maps
- Update/Remove: O(1) lookup by junctionId with error result on miss
- CreateSupply: adds to search pool for subsequent queries

### status-donut.tsx
- 16x16 SVG donut with `r=6`, `strokeWidth=2`, circumference `2 * Math.PI * 6`
- Three states: empty (bg ring only), partial (warning arc), complete (primary full ring)
- `stroke-dashoffset` math with ratio clamped via `Math.min(have/need, 1)`
- Complete state uses `dashoffset=0` to avoid rounding gap (Pitfall 5)
- Accessible `<title>` element with "X of Y" text
- Server-compatible -- no "use client" directive

### editable-number.tsx
- Click-to-edit pattern extracted from project-supplies-tab.tsx (D-09 hybrid build)
- Required `ariaLabel` prop rendered on both button and input
- Keyboard: Enter saves, Escape reverts, Blur saves-if-valid/reverts-if-invalid
- Input validation: `parseInt >= 0` check before calling onSave (T-10-01 mitigation)
- `hover:bg-primary/5` editable-cell indicator, `[font-variant-numeric:tabular-nums]`
- "use client" -- uses useState, useEffect, useRef

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **crypto.randomUUID() over nanoid** -- avoids adding a dependency for the local-state adapter's ID generation. The adapter is in-memory only; crypto.randomUUID() is available in all target environments.
2. **getRows() helper on LocalStateAdapter** -- added a public method for test assertions that returns all rows across types. Not part of the SupplyTableAdapter interface.

## Verification

```
37 tests passing across 3 test files:
- local-state-adapter.test.ts: 17 tests (search, add, update, remove, create)
- status-donut.test.tsx: 9 tests (SVG attributes, 3 states, math, accessibility)
- editable-number.test.tsx: 11 tests (edit/save/cancel/blur/accessibility)
```

## Self-Check: PASSED

All 7 created files verified on disk. All 3 commit hashes verified in git log.
