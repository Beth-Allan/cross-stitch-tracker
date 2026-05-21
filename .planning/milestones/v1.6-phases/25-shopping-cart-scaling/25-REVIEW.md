---
phase: 25-shopping-cart-scaling
reviewed: 2026-05-20T01:21:40Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/features/shopping/project-search-input.tsx
  - src/components/features/shopping/supply-search-input.tsx
  - src/components/features/shopping/status-group.tsx
  - src/components/features/shopping/selection-counter.tsx
  - src/components/features/shopping/shopping-cart.tsx
  - src/components/features/shopping/project-accordion.tsx
  - src/components/features/shopping/supply-overview.tsx
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 25: Code Review Report

**Reviewed:** 2026-05-20T01:21:40Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Reviewed 7 component files implementing shopping cart scaling features: project/supply search inputs, status grouping, selection persistence, project accordion with supply details, and aggregated supply overview. The architecture is well-structured with proper use of `useMemo`, `useCallback`, and `useDeferredValue` for search. Auth and data validation are handled upstream in server actions.

Key concerns: (1) a data-loss bug in the aggregated supply quantity update logic that silently drops increments/decrements when multiple projects share the same supply, and (2) a localStorage hydration race that can momentarily overwrite persisted selections.

## Critical Issues

### CR-01: Aggregated supply quantity change silently drops updates for multi-project supplies

**File:** `src/components/features/shopping/supply-overview.tsx:269-280`
**Issue:** When a supply appears in multiple selected projects (e.g., DMC 310 in projects A and B), the `onChange` handler only updates the first item's junction record. If the first item is already at its `quantityRequired` ceiling, increments are silently clamped away. Similarly, if the first item is already at 0, decrements are lost.

Example scenario:
- Project A: DMC 310, required=2, acquired=2 (fully acquired)
- Project B: DMC 310, required=3, acquired=0
- Aggregated display: 2/5
- User clicks +1, expecting 3/5
- `diff=1`, `firstItem` is Project A (acquired=2, required=2)
- `newItemValue = Math.min(2, 2+1) = 2` -- no change
- Server action fires with value 2 (same as current), toast says "Supply quantity updated" despite nothing changing

The user sees no progress and the UI is misleading.

**Fix:** Distribute the diff across items, or find the first item with remaining capacity:
```typescript
onChange={(newValue) => {
  if (supply.items.length === 1) {
    onUpdateAcquired(type, supply.items[0].junctionId, newValue);
  } else {
    const diff = newValue - supply.totalAcquired;
    if (diff > 0) {
      // Find first item with remaining capacity
      const target = supply.items.find(
        (i) => i.quantityAcquired < i.quantityRequired,
      ) ?? supply.items[0];
      const newItemValue = Math.min(
        target.quantityRequired,
        target.quantityAcquired + diff,
      );
      onUpdateAcquired(type, target.junctionId, newItemValue);
    } else if (diff < 0) {
      // Find first item with acquired > 0
      const target = supply.items.find(
        (i) => i.quantityAcquired > 0,
      ) ?? supply.items[0];
      const newItemValue = Math.max(0, target.quantityAcquired + diff);
      onUpdateAcquired(type, target.junctionId, newItemValue);
    }
  }
}}
```

## Warnings

### WR-01: localStorage hydration race overwrites stored selection with empty set

**File:** `src/components/features/shopping/shopping-cart.tsx:35-58`
**Issue:** On initial render, both `useEffect` hooks fire sequentially. Effect 1 (hydration) sets `hydratedRef.current = true` and calls `setSelectedIds` with stored data. Effect 2 (persist) runs immediately after, sees `hydratedRef.current === true` and writes the current (still empty) `selectedIds` to localStorage. The hydrated data is only restored on re-render, at which point effect 2 fires again with correct data.

In the normal case the net effect is: `[]` written, then correct data re-written. But if the component unmounts between renders (e.g., due to navigation, error boundary, or Suspense), the stored selection is lost.

**Fix:** Add a second guard to the persist effect to skip the initial write:
```typescript
const initialRenderRef = useRef(true);

useEffect(() => {
  if (!hydratedRef.current) return;
  if (initialRenderRef.current) {
    initialRenderRef.current = false;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
  } catch {
    // localStorage may be unavailable
  }
}, [selectedIds]);
```

### WR-02: Hardcoded `text-amber-600` violates semantic token convention

**File:** `src/components/features/shopping/project-accordion.tsx:293`
**File:** `src/components/features/shopping/supply-overview.tsx:322`
**Issue:** Both files use `text-amber-600` for the "Needs fabric" label. The project convention (base-ui-patterns.md) states: "Always use semantic tokens, never hardcoded color scales." This creates dark mode issues if amber-600 doesn't have sufficient contrast on dark backgrounds.

**Fix:** Define a semantic token (e.g., `--warning-foreground` mapped to appropriate amber values in light/dark modes) or use the existing `text-muted-foreground` with a warning icon instead:
```tsx
// Option A: Define a warning token in globals.css and use it
<span className="font-medium text-warning-foreground">Needs fabric</span>

// Option B: Use existing StatusBadge or similar pattern
```

### WR-03: Dead "has fabric" UI code in project-accordion and supply-overview

**File:** `src/components/features/shopping/project-accordion.tsx:284-289`
**File:** `src/components/features/shopping/supply-overview.tsx:305-316`
**Issue:** The `ShoppingFabricNeed` data from the server action (`getShoppingCartData`) only includes projects where `!p.fabric` -- projects that need fabric. The `hasFabric` field is always `false` and `fabricName` is always `null`. Yet both components render a "has fabric" branch (green checkmark, `bg-selected` styling) that can never execute.

This creates confusion for future maintainers who may assume both states are reachable, and wastes test effort covering unreachable paths.

**Fix:** Either:
1. Remove the dead "has fabric" branches since the data source guarantees `hasFabric === false`
2. Or update the server action to include projects WITH fabric so both branches are exercised (if the design intent is to show complete fabric status)

### WR-04: Redundant `as ProjectStatus` type assertion

**File:** `src/components/features/shopping/project-accordion.tsx:219`
**Issue:** `project.status as ProjectStatus` is unnecessary because `ShoppingCartProject.status` is already typed as `ProjectStatus`. The assertion masks potential type drift -- if the upstream type were to change to `string`, this assertion would silently suppress the type error instead of surfacing it.

**Fix:**
```tsx
<StatusBadge status={project.status} />
```

## Info

### IN-01: Duplicated search input components

**File:** `src/components/features/shopping/project-search-input.tsx`
**File:** `src/components/features/shopping/supply-search-input.tsx`
**Issue:** These two files are identical except for placeholder text and aria-label. This is code duplication that increases maintenance surface.

**Fix:** Extract a shared `SearchInput` component with `placeholder` and `ariaLabel` props:
```tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}
```

### IN-02: JSX section markers violate comment convention

**File:** `src/components/features/shopping/project-accordion.tsx:170,236,313`
**File:** `src/components/features/shopping/shopping-cart.tsx:349`
**Issue:** JSX `{/* Section Label */}` markers inside render return blocks are disallowed per comment-conventions.md. Additionally, `shopping-cart.tsx` has 7 `/* ── ... ── */` sub-section markers inside the `ShoppingCart` function body, which also violate the "no sub-section markers inside function bodies" rule.

**Fix:** Remove the JSX markers. For the function-body markers in `shopping-cart.tsx`, consider extracting the logical groups into separate custom hooks (e.g., `useFilteredSupplies`, `useSelectionHandlers`) which would provide natural code structure without needing comment separators.

### IN-03: Corrupted Unicode characters in section marker comments

**File:** `src/components/features/shopping/supply-overview.tsx:167,287`
**Issue:** Two section marker comments contain Unicode replacement characters (`�`): `SupplySection ─────��────` and `FabricSection ��─────`. This suggests encoding corruption during file creation.

**Fix:** Replace with clean box-drawing characters or remove the markers entirely (per IN-02, they violate comment conventions in non-type-bundle files).

---

_Reviewed: 2026-05-20T01:21:40Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
