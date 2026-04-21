---
phase: 09-dashboards-shopping-cart
plan: 06
subsystem: shopping-cart
tags: [shopping-cart, tdd, localstorage, tabs, quantity-stepper, project-selection]
dependency_graph:
  requires: [getShoppingCartData, updateSupplyAcquired, ShoppingCartData-types]
  provides: [ShoppingCart-component, QuantityControl, ShoppingForBar, ProjectSelectionList, SupplyTab, FabricTab, ShoppingListTab]
  affects: [/shopping]
tech_stack:
  added: []
  patterns: [usePersistedSelection-localStorage, stale-id-filtering, tab-badge-counts, aggregated-supply-rows]
key_files:
  created:
    - src/components/features/shopping/shopping-cart.tsx
    - src/components/features/shopping/shopping-cart.test.tsx
    - src/components/features/shopping/quantity-control.tsx
    - src/components/features/shopping/quantity-control.test.tsx
    - src/components/features/shopping/shopping-for-bar.tsx
    - src/components/features/shopping/project-selection-list.tsx
    - src/components/features/shopping/supply-tab.tsx
    - src/components/features/shopping/fabric-tab.tsx
    - src/components/features/shopping/shopping-list-tab.tsx
  modified: []
decisions:
  - "Used inline usePersistedSelection hook within ShoppingCart rather than a separate file -- single consumer, keeps state co-located"
  - "SupplyTab aggregates supplies by supplyId across projects for cross-project quantity totals"
  - "ShoppingListTab manages checked state internally (UI-only) since Clear Checked resets UI, not data"
metrics:
  duration: 6m
  completed: "2026-04-18T04:06:25Z"
  tasks_completed: 3
  tasks_total: 3
  test_count: 13
  test_pass: 13
---

# Phase 9 Plan 6: Shopping Cart UI Summary

Complete Shopping Cart replacement with project-selection architecture, localStorage persistence with stale ID filtering, tabbed supply views with badge counts, +/- quantity stepper, and checklist view -- 8 components backed by 13 TDD tests.

## Tasks Completed

| # | Task | Type | Commit | Key Changes |
|---|------|------|--------|-------------|
| 1 | Write failing tests for QuantityControl and ShoppingCart | test (RED) | 82ed528 | 8 QuantityControl tests + 5 ShoppingCart tests, all failing |
| 2 | Implement QuantityControl, ShoppingForBar, ProjectSelectionList | feat (GREEN) | d6877e4 | Stepper with fulfilled styling, sticky chip bar, checkbox project rows |
| 3 | Implement ShoppingCart, SupplyTab, FabricTab, ShoppingListTab | feat (GREEN) | 7bd6d39 | Orchestrator with localStorage, 4 tab components, all 13 tests pass |

## Implementation Details

### ShoppingCart (orchestrator)
- `usePersistedSelection` hook: reads/writes localStorage key `shopping-cart-selected-projects`, filters stale project IDs against valid `data.projects` on hydration (D-10)
- SSR guard: `typeof window === "undefined"` check prevents server-side localStorage access
- Filtered data via `useMemo`: threads/beads/specialty/fabrics filtered to selected project IDs
- Badge counts: unfulfilled items per supply type (quantityAcquired < quantityRequired)
- Supply tabs show `opacity-50` when no projects selected per UI-SPEC
- Server action integration: `useTransition` + `startTransition` wrapping `updateSupplyAcquired`, toast feedback

### QuantityControl
- +/- stepper with `acquired/required` display in monospace font
- Direct input via `window.prompt` on display click, clamped to [0, required]
- Fulfilled state: `bg-emerald-100` container + Check icon when acquired >= required
- Disabled states: minus at 0, plus at max, both when isPending

### ShoppingForBar
- Sticky positioning with backdrop-blur and semi-transparent background
- Empty state: ShoppingBag icon + "No projects selected" copy per UI-SPEC
- With selections: emerald pill chips with X remove button + "Clear all" link

### ProjectSelectionList
- Checkbox rows with Square/CheckSquare icons, cover thumbnails, StatusBadge
- Selected state: emerald-300 border, emerald-50/30 background
- "Select all" link right-aligned above list
- Supply summary chips (e.g., "5 threads, 2 beads")

### SupplyTab
- Aggregates supplies by supplyId across selected projects
- ColorSwatch + brand/code + colorName + project attribution
- QuantityControl per row with server action integration
- Empty states per UI-SPEC copy contract

### FabricTab
- Fabric need rows with project name, dimensions, has/needs fabric status
- Fulfilled styling with emerald border when fabric assigned

### ShoppingListTab
- Checklist with checkbox toggle (Square/CheckSquare icons)
- Checked: emerald border/bg, line-through text, muted color
- Grouped by supply type (Threads, Beads, Specialty, Fabric)
- "Clear checked" button resets UI state only
- All fulfilled state: "All supplies acquired for selected projects!"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed localStorage mock leaking between tests**
- **Found during:** Task 3 verification
- **Issue:** `mockReturnValue` on localStorage.getItem persisted across tests, causing "renders ShoppingForBar" to see stale selections from previous test
- **Fix:** Switched to a real store object (`localStore`) that gets reset in `beforeEach`, and used `getAllByText` for elements appearing multiple times
- **Files modified:** src/components/features/shopping/shopping-cart.test.tsx
- **Commit:** 7bd6d39

## TDD Gate Compliance

- RED gate: `test(09-06)` commit 82ed528 -- 13 tests, all failing
- GREEN gate: `feat(09-06)` commits d6877e4 + 7bd6d39 -- 13 tests, all passing
- REFACTOR gate: Not needed -- implementation is clean

## Known Stubs

None -- all components are fully implemented with real data wiring, empty states, and interaction handlers.

## Self-Check: PASSED

- All 9 created files verified on disk
- All 3 commit hashes (82ed528, d6877e4, 7bd6d39) found in git log
- 13/13 new tests passing, 21/21 total shopping tests passing
