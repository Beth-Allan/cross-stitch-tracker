---
status: diagnosed
phase: 13-supply-takeover
source: [13-01-SUMMARY.md, 13-02-SUMMARY.md, 13-03-SUMMARY.md]
started: 2026-05-15T00:00:00Z
updated: 2026-05-15T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Mode toggle to Supply view
expected: Navigate to /charts/new. Fill in a chart name. Click "Add supplies" → form collapses, supply view appears with SummaryBar, CalculatorCard, and SupplyTable.
result: pass

### 2. SummaryBar displays form summary
expected: In supply mode, SummaryBar shows dot-separated tokens from form values (chart name, designer, status, stitch count). It sticks to the top when scrolling. A "Details" link is visible.
result: pass

### 3. Return to Form mode preserves state
expected: Click "Details" on SummaryBar → form reappears with all previously entered field values intact (name, designer, status, stitch count, etc.).
result: pass

### 4. CalculatorCard renders and interacts
expected: In supply mode, CalculatorCard appears as a styled card with: fabric dropdown, Over segmented control (1/2), and editable Strands, Count, and Waste fields.
result: pass

### 5. Fabric selection auto-populates count
expected: Select a fabric from CalculatorCard's fabric dropdown → the "Count" field auto-fills with the selected fabric's count value.
result: issue
reported: "The fabric dropdown isn't dropping down. It drops down if I change something in the strands/over/count/waste, but if I haven't changed anything, it won't drop down."
severity: major

### 6. Search and add thread supply
expected: In supply mode, search for a thread (e.g., DMC 310) in the supply table, add it → row appears in the table with quantity fields.
result: pass

### 7. Add multiple supply types
expected: Add a thread, a bead, and a specialty supply → all three types appear in the supply table, each with appropriate columns.
result: issue
reported: "Don't have existing beads or specialty items to search. Tried '+ Create' quick add for them and it errors: 'Couldn't create supply. Try again.' Create flow for non-thread supply types is broken."
severity: major

### 8. Create chart with supplies (atomic save)
expected: Fill form + add at least one supply, submit → chart is created with all supplies linked. Navigating to the project detail page shows the supplies.
result: pass

### 9. Create chart without supplies (regression)
expected: Fill form with basic fields only, don't switch to supply mode, submit → chart is created normally, same as before this feature.
result: pass

### 10. Draft persistence with supplies
expected: Fill form + add supplies + set calc params, navigate away from /charts/new, then return → draft restores form values AND supply rows AND calculator params.
result: issue
reported: "When I navigate away, I can't get back to the draft."
severity: major

## Summary

total: 10
passed: 7
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Select a fabric from CalculatorCard's fabric dropdown → the Count field auto-fills with the selected fabric's count value."
  status: failed
  reason: "User reported: The fabric dropdown isn't dropping down. It drops down if I change something in the strands/over/count/waste, but if I haven't changed anything, it won't drop down."
  severity: major
  test: 5
  root_cause: "React 19 Activity mode='hidden' defers Base UI Popover internal store init to OffscreenLane. When Activity becomes visible, PopoverTrigger still has stale empty FloatingRootContext — clicks call setOpen on empty context with undefined onOpenChange, so nothing happens. Any other state change forces re-render that picks up correct context."
  artifacts:
    - path: "src/components/features/charts/chart-merged-form.tsx"
      issue: "Supply-mode Activity with mode='hidden' defers Popover store sync"
      lines: "631-663"
  missing:
    - "Replace supply-mode <Activity> with conditional rendering ({mode === 'supply' && ...}). Form-mode Activity on line 351 can stay — it starts visible."

- truth: "Skein calculator produces correct results for given inputs (over, count, strands, waste, stitches)."
  status: failed
  reason: "User reported: With over 2, 14 count, strands 2, waste 20%, and 8000 stitches, it shows only 1 skein needed. Should be significantly more."
  severity: major
  test: 5b
  root_cause: "calculateSkeins formula is correct (returns 11 for those inputs). But editing stitchCount on an existing data row does NOT recalculate need — it stays frozen at its initial value. SupplyTableDataRow has zero awareness of skein calculation. Both adapters' updateQuantity do raw field updates without recalculation."
  artifacts:
    - path: "src/components/features/supply-table/supply-table-data-row.tsx"
      issue: "No calcParams prop, no recalculation on stitch count edit"
    - path: "src/components/features/supply-table/server-action-adapter.ts"
      issue: "updateQuantity for stitchCount sends only stitchCount, not recalculated need"
      lines: "87-115"
    - path: "src/components/features/supply-table/creation-flow-adapter.ts"
      issue: "updateQuantity does raw field update with no recalculation"
      lines: "102-116"
  missing:
    - "Wire calcParams into SupplyTableDataRow and recalculate need via calculateSkeins when stitchCount changes (unless isNeedOverridden)"
    - "Both adapters' updateQuantity for stitchCount should also update quantityRequired"
    - "Calc settings changes should trigger recalculation for all non-overridden thread rows"

- truth: "Quick-create ('+ Create') for bead and specialty supply types works in supply table during chart creation."
  status: failed
  reason: "User reported: '+ Create' quick add for beads/specialty errors with 'Couldn't create supply. Try again.' Thread search works but non-thread create is broken."
  severity: major
  test: 7
  root_cause: "Field name mismatches in createFn callbacks in chart-merged-form.tsx. All three types send name: data.name but Zod schemas expect colorName. Bead missing hexColor and colorFamily. Specialty missing hexColor. Thread also has same mismatch (may not have been tested via +Create)."
  artifacts:
    - path: "src/components/features/charts/chart-merged-form.tsx"
      issue: "createFn sends wrong field names to server actions"
      lines: "131-185"
  missing:
    - "Change name: data.name to colorName: data.name for all three types"
    - "Add hexColor: data.hexColor ?? '#808080' for bead and specialty"
    - "Add colorFamily: 'NEUTRAL' for thread and bead"

- truth: "Draft persistence restores form values, supply rows, and calculator params after navigating away and returning to /charts/new."
  status: failed
  reason: "User reported: When I navigate away, I can't get back to the draft."
  severity: major
  test: 10
  root_cause: "Draft is never auto-saved. saveDraftV2 only called on manual 'Save Draft' button click. beforeunload handler only shows browser dialog, doesn't save, and doesn't fire for client-side Next.js Link navigations. Component unmounts silently with no draft saved."
  artifacts:
    - path: "src/components/features/charts/chart-merged-form.tsx"
      issue: "Missing auto-save on unmount/navigation"
    - path: "src/components/features/charts/use-chart-form.ts"
      issue: "beforeunload handler warns but doesn't save, doesn't cover client-side nav"
      lines: "405-413"
  missing:
    - "Add ref-based useEffect cleanup in chart-merged-form.tsx that calls saveDraftV2 on unmount (when form not submitted)"
