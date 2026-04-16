---
phase: 07-project-detail-experience
plan: 04
subsystem: supplies-tab
tags: [calculator, supply-row, settings-bar, editable-number, supplies]
dependency_graph:
  requires:
    - calculateSkeins utility (07-01)
    - CalculatorSettings, SupplyRowData, SupplySectionData types (07-01)
    - updateProjectSettings server action (07-01)
    - updateProjectSupplyQuantity server action (07-01)
  provides:
    - EditableNumber shared component with ariaLabel, formatDisplay, min/max
    - SupplyRow two-line component with calculator integration and override detection
    - CalculatorSettingsBar with "show once shown" visibility pattern
    - SupplySection collapsible section with header totals
    - SupplyFooterTotals summary row
    - SuppliesTab complete tab composing all supply sub-components
  affects:
    - src/components/features/charts/project-detail/ (6 new files)
    - src/components/features/charts/ (2 new files: editable-number.tsx + test)
tech_stack:
  added: []
  patterns:
    - "Show once shown" visibility for progressive disclosure (Pitfall 6)
    - useMemo-derived totals to avoid stale data (Pitfall 5)
    - formatDisplay prop on EditableNumber for locale-formatted numbers
    - TooltipTrigger without asChild to avoid nested button hydration issues
key_files:
  created:
    - src/components/features/charts/editable-number.tsx
    - src/components/features/charts/editable-number.test.tsx
    - src/components/features/charts/project-detail/supply-row.tsx
    - src/components/features/charts/project-detail/supply-row.test.tsx
    - src/components/features/charts/project-detail/calculator-settings-bar.tsx
    - src/components/features/charts/project-detail/calculator-settings-bar.test.tsx
    - src/components/features/charts/project-detail/supply-section.tsx
    - src/components/features/charts/project-detail/supply-footer-totals.tsx
    - src/components/features/charts/project-detail/supplies-tab.tsx
    - src/components/features/charts/project-detail/supplies-tab.test.tsx
  modified: []
decisions:
  - "EditableNumber gets formatDisplay prop for locale-formatted stitch counts (commas in display, raw number in edit)"
  - "TooltipTrigger used directly (no asChild) to avoid nested button hydration issues with Base UI"
  - "Single fulfillment icon per row (not mobile+desktop duplication) to avoid duplicate aria-labels"
  - "SupplyRow recalculates skeins from settings on render rather than relying on data.calculatedNeed prop"
metrics:
  duration: ~12 minutes
  completed: "2026-04-15T05:41:38Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 25
  tests_total: 830
  files_changed: 10
---

# Phase 7 Plan 04: Supplies Tab Summary

Complete supplies tab with extracted EditableNumber, two-line supply rows with skein calculator integration, "show once shown" settings bar, collapsible supply sections with header/footer totals, and sort toggle.

## Task Commits

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Extract EditableNumber + build SupplyRow with calculator integration (TDD) | 338ee9d | EditableNumber shared component, SupplyRow with two-line layout, calculator integration, override detection |
| 2 | Calculator settings bar + supply section + footer totals + supplies tab (TDD) | 7984e4b | CalculatorSettingsBar, SupplySection, SupplyFooterTotals, SuppliesTab orchestrator |

## What Was Built

### EditableNumber (`src/components/features/charts/editable-number.tsx`)
- Extracted from `project-supplies-tab.tsx` as shared component
- Props: `value`, `onSave`, `className`, `ariaLabel`, `min`, `max`, `formatDisplay`
- Click-to-edit, Enter-to-save, Escape-to-cancel, blur-to-save behavior
- 44px touch targets (`min-h-11 min-w-11`), `font-mono tabular-nums` display
- `formatDisplay` prop enables locale-formatted numbers (e.g., 12,450 in display, raw 12450 in edit)

### SupplyRow (`src/components/features/charts/project-detail/supply-row.tsx`)
- Two-line layout per D-14: Line 1 (swatch + code + name + trash), Line 2 (stitches -> skeins | Need | Have | status)
- Color swatch: 20x20px rounded-sm, `border border-border` for light colors, `aria-hidden="true"`
- Calculator integration: `calculateSkeins()` called with current settings on every render
- Auto-calc indicator: Calculator icon with `aria-label="Auto-calculated"` when not overridden
- Override detection: "Calc: X" clickable button when `isNeedOverridden=true` and calculated differs from required
- Fulfillment icons: Check (all acquired), AlertTriangle (partial), none (zero)
- Trash icon with Tooltip, 44px touch target
- Optimistic updates with `useTransition` + rollback on failure

### CalculatorSettingsBar (`src/components/features/charts/project-detail/calculator-settings-bar.tsx`)
- Four fields: Strands (EditableNumber, 1-6), Over (toggle 1/2), Fabric (display), Waste (EditableNumber, 0-50%)
- Labels: `text-sm uppercase tracking-wider font-semibold` per UI-SPEC typography
- Container: `bg-muted rounded-lg px-4 py-3`
- "Show once shown" visibility: hidden until `hasStitchCounts=true`, then persists (Pitfall 6)
- Fabric hint: "14ct (default) -- link a fabric for accuracy" when no fabric linked (D-19)
- Optimistic settings updates via `updateProjectSettings` server action

### SupplySection (`src/components/features/charts/project-detail/supply-section.tsx`)
- Collapsible with chevron toggle, `role="list"` / `role="listitem"` accessibility
- Header: label + "(N colours)" + stitch total (threads only), `font-heading text-xl font-semibold`
- Body: SupplyRow list + "+ Add [type]" button
- Empty state: "No [type] linked to this project" with add button

### SupplyFooterTotals (`src/components/features/charts/project-detail/supply-footer-totals.tsx`)
- Summary row: total stitches, total skeins needed, total acquired
- `font-mono tabular-nums font-semibold`, Separator above

### SuppliesTab (`src/components/features/charts/project-detail/supplies-tab.tsx`)
- Composes: CalculatorSettingsBar + 3 SupplySections + SupplyFooterTotals
- Data transform: `useMemo` transforms raw `ProjectThreadWithThread` to `SupplyRowData` with calculatedNeed (Pitfall 5)
- Sort toggle: "Added" (insertion order, default) / "A-Z" (alphabetical by code) per SUPP-01
- Totals: `useMemo` computing totalStitchCount, totalSkeinsNeeded, totalAcquired from thread data
- Empty state: "No supplies added yet" + descriptive body text per UI-SPEC copywriting contract
- Optimistic remove handlers for thread/bead/specialty with rollback on failure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Skein calculator test values in SupplyRow test**
- **Found during:** Task 1 Step 3
- **Issue:** Plan specified `calculatedNeed: 5` for 1000 stitches but formula produces 9
- **Fix:** Updated test to use correct calculated value (9) matching the formula
- **Files modified:** `src/components/features/charts/project-detail/supply-row.test.tsx`
- **Commit:** 338ee9d

**2. [Rule 1 - Bug] Nested button hydration with Base UI TooltipTrigger**
- **Found during:** Task 1 Step 4
- **Issue:** `<TooltipTrigger asChild><button>` creates nested buttons -- Base UI TooltipTrigger renders its own button element
- **Fix:** Removed `asChild`, placed click handler and styling directly on TooltipTrigger
- **Files modified:** `src/components/features/charts/project-detail/supply-row.tsx`
- **Commit:** 338ee9d

**3. [Rule 1 - Bug] Duplicate fulfillment icons in DOM**
- **Found during:** Task 1 Step 4
- **Issue:** Separate mobile and desktop fulfillment icons (hidden via CSS) caused duplicate `aria-label` elements
- **Fix:** Single fulfillment icon rendered once without responsive duplication
- **Files modified:** `src/components/features/charts/project-detail/supply-row.tsx`
- **Commit:** 338ee9d

**4. [Rule 3 - Blocking] React hooks before early return**
- **Found during:** Task 2 Step 2
- **Issue:** `useCallback` hooks declared after `if (!everShown) return null` early return, violating React rules of hooks
- **Fix:** Moved all hooks before the conditional return
- **Files modified:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx`
- **Commit:** 7984e4b

## Self-Check: PASSED

- [x] `src/components/features/charts/editable-number.tsx` exists and exports `EditableNumber`
- [x] `src/components/features/charts/editable-number.test.tsx` exists (5 tests)
- [x] `src/components/features/charts/project-detail/supply-row.tsx` exists and exports `SupplyRow`
- [x] `src/components/features/charts/project-detail/supply-row.test.tsx` exists (10 tests)
- [x] `src/components/features/charts/project-detail/calculator-settings-bar.tsx` exists and exports `CalculatorSettingsBar`
- [x] `src/components/features/charts/project-detail/calculator-settings-bar.test.tsx` exists (5 tests)
- [x] `src/components/features/charts/project-detail/supply-section.tsx` exists and exports `SupplySection`
- [x] `src/components/features/charts/project-detail/supply-footer-totals.tsx` exists and exports `SupplyFooterTotals`
- [x] `src/components/features/charts/project-detail/supplies-tab.tsx` exists and exports `SuppliesTab`
- [x] `src/components/features/charts/project-detail/supplies-tab.test.tsx` exists (5 tests)
- [x] Commit 338ee9d exists (Task 1)
- [x] Commit 7984e4b exists (Task 2)
- [x] All 830 tests pass
- [x] No accidental file deletions
