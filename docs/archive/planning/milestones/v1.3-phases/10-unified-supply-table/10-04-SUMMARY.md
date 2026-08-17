---
phase: 10-unified-supply-table
plan: 04
subsystem: supply-table
tags: [hook, state-machine, add-row, keyboard-flow, auto-calc, tdd]
dependency_graph:
  requires: [10-01, 10-02]
  provides: [useSupplyTable, SupplyTableAddRow]
  affects: [10-05]
tech_stack:
  added: []
  patterns: [custom-hook-state-machine, debounced-search, adapter-pattern, focus-management-raf]
key_files:
  created:
    - src/components/features/supply-table/use-supply-table.ts
    - src/components/features/supply-table/use-supply-table.test.ts
    - src/components/features/supply-table/supply-table-add-row.tsx
    - src/components/features/supply-table/supply-table-add-row.test.tsx
  modified: []
decisions:
  - "Used real calculateSkeins() for auto-calc (D-07), not sketch shorthand"
  - "Hook file has no 'use client' -- imported by client component, not a client module itself"
  - "requestAnimationFrame for focus management after commit/reset (D-03)"
  - "InlineCreateDialog rendered outside <tr> via Fragment to avoid DOM nesting issues"
metrics:
  duration: 12m
  completed: 2026-05-04
  tests_added: 38
  files_created: 4
  files_modified: 0
---

# Phase 10 Plan 04: useSupplyTable Hook + SupplyTableAddRow Summary

Custom hook state machine and persistent add-row component providing the keyboard-driven supply entry flow with debounced search, auto-calc via calculateSkeins, and sticky type toggle.

## What Was Built

### Task 1: useSupplyTable hook
- State machine managing the complete add-row lifecycle: type selection, debounced search (150ms), item selection with focus hints, auto-calculation, commit with correct adapter call, and reset with sticky type toggle
- 150ms debounce with cleanup (clearTimeout + cancelled flag) per T-10-12
- Auto-calc uses real `calculateSkeins()` from `@/lib/utils/skein-calculator` (D-07)
- Input validation: stitchCount >= 0 and need >= 1 before adapter calls (T-10-11)
- Inline create flow: adapter.createSupply -> auto-select result -> close dialog (D-03)
- Focus target hints: "stitches" for THREAD/BEAD, "need" for SPECIALTY
- 23 tests covering all state transitions

### Task 2: SupplyTableAddRow component
- Persistent add row composing SegmentedTypeToggle, PortalAutocomplete, InlineCreateDialog
- Keyboard flow: search -> select -> stitches -> Enter commits (SUPTBL-03)
- Focus returns to search input after commit via requestAnimationFrame (D-03)
- Type-specific rendering: stitches input (THREAD), bead count input (BEAD), "--" (SPECIALTY)
- Auto-calc sparkle indicator (Sparkles icon) for THREAD type when isAutoCalc is true
- Green tint background `bg-[rgba(5,150,105,0.03)]` + emerald border per UI-SPEC
- Unit labels: sk (THREAD), pkg (BEAD), item (SPECIALTY)
- 15 tests with mocked child components for isolation

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 03c1cb5 | test | Add failing tests for useSupplyTable hook (RED) |
| b61f998 | feat | Implement useSupplyTable hook (GREEN) |
| 1fcc119 | test | Add failing tests for SupplyTableAddRow component (RED) |
| 1f3a039 | feat | Implement SupplyTableAddRow component (GREEN) |

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Hook has no "use client" directive** -- It only uses React hooks (useState, useEffect, useCallback, useRef) which are importable by any client component. The consuming component (SupplyTableAddRow) has "use client". This avoids making the hook file a client boundary entry point.

2. **InlineCreateDialog rendered via Fragment** -- The component returns `<><tr>...</tr><InlineCreateDialog /></>` so the Dialog portal renders outside the table DOM, avoiding invalid HTML nesting.

3. **requestAnimationFrame for focus management** -- Used `requestAnimationFrame` rather than `setTimeout(0)` for post-commit and post-reset focus return, matching the plan's specified approach and ensuring DOM has updated.

4. **PortalAutocomplete isOpen logic** -- Opens when no item is selected AND searchText is non-empty AND (results exist OR search is not loading). This prevents flash of empty dropdown during debounce.

## Verification

```
npx vitest run use-supply-table.test.ts supply-table-add-row.test.tsx
Test Files  2 passed (2)
Tests       38 passed (38)
```

## Self-Check: PASSED

All 4 created files verified on disk. All 4 commit hashes verified in git log.
