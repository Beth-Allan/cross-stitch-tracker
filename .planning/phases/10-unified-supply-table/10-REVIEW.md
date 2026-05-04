---
phase: 10-unified-supply-table
reviewed: 2026-05-03T17:42:00Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - src/app/globals.css
  - src/components/features/supply-table/editable-number.test.tsx
  - src/components/features/supply-table/editable-number.tsx
  - src/components/features/supply-table/index.ts
  - src/components/features/supply-table/inline-create-dialog.test.tsx
  - src/components/features/supply-table/inline-create-dialog.tsx
  - src/components/features/supply-table/local-state-adapter.test.ts
  - src/components/features/supply-table/local-state-adapter.ts
  - src/components/features/supply-table/portal-autocomplete.test.tsx
  - src/components/features/supply-table/portal-autocomplete.tsx
  - src/components/features/supply-table/segmented-type-toggle.test.tsx
  - src/components/features/supply-table/segmented-type-toggle.tsx
  - src/components/features/supply-table/status-donut.test.tsx
  - src/components/features/supply-table/status-donut.tsx
  - src/components/features/supply-table/supply-table-add-row.test.tsx
  - src/components/features/supply-table/supply-table-add-row.tsx
  - src/components/features/supply-table/supply-table-data-row.test.tsx
  - src/components/features/supply-table/supply-table-data-row.tsx
  - src/components/features/supply-table/supply-table-footer.test.tsx
  - src/components/features/supply-table/supply-table-footer.tsx
  - src/components/features/supply-table/supply-table-section-divider.test.tsx
  - src/components/features/supply-table/supply-table-section-divider.tsx
  - src/components/features/supply-table/supply-table.test.tsx
  - src/components/features/supply-table/supply-table.tsx
  - src/components/features/supply-table/types.ts
  - src/components/features/supply-table/use-supply-table.test.ts
  - src/components/features/supply-table/use-supply-table.ts
findings:
  critical: 2
  warning: 4
  info: 2
  total: 8
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-03T17:42:00Z
**Depth:** standard
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Phase 10 implements the Unified Supply Table component system: types, adapter interface, LocalStateAdapter, UI primitives (StatusDonut, EditableNumber, SegmentedTypeToggle, PortalAutocomplete, InlineCreateDialog), data row, add row, section dividers, footer, root table composition, and a `useSupplyTable` hook. Test coverage is thorough with 27 files reviewed.

Two critical bugs were found: (1) the DataRow passes DB-column field names (`quantityRequired`, `quantityAcquired`, `quantity`) to `updateQuantity`, but the `SupplyRow` type uses normalized names (`need`, `have`, `stitchCount`), causing the LocalStateAdapter to silently drop all inline edits; and (2) `handleCreateSupply` in the hook lacks error handling, which can crash the UI. Four warnings cover an unfinished animation feature (dead code), missing click-outside behavior on the portal dropdown, hardcoded colors violating semantic token conventions, and the portal position not updating on scroll.

## Critical Issues

### CR-01: Field name mismatch in updateQuantity causes silent data loss

**File:** `src/components/features/supply-table/supply-table-data-row.tsx:48,55,74,88`
**Issue:** The `SupplyTableDataRow` passes DB-column-style field names to `onUpdateQuantity`:
- Line 48: `"stitchCount"` (correct -- matches SupplyRow)
- Line 55: `"quantity"` (WRONG -- SupplyRow has `stitchCount` for beads)
- Line 74: `"quantityRequired"` (WRONG -- SupplyRow has `need`)
- Line 88: `"quantityAcquired"` (WRONG -- SupplyRow has `have`)

The `LocalStateAdapter.updateQuantity` (line 128) checks `if (field in row)` before writing. Since `"quantityRequired"`, `"quantityAcquired"`, and `"quantity"` are NOT properties of `SupplyRow`, the check fails silently and the value is never written. All inline edits for need, have, and bead count are silently dropped.

The `field` parameter in the adapter interface is typed as `string` (not a union of valid field names), so TypeScript cannot catch this.

**Fix:** Either (a) use SupplyRow field names in the DataRow and fix the LocalStateAdapter to pass through correctly, or (b) keep the DB-level names and add a field mapping in the LocalStateAdapter. Option (a) is cleaner for Phase 10:

```tsx
// supply-table-data-row.tsx
// Line 55: BEAD stitch count
onSave={(v) => onUpdateQuantity(row.type, row.id, "stitchCount", v)}

// Line 74: Need
onSave={(v) => onUpdateQuantity(row.type, row.id, "need", v)}

// Line 88: Have
onSave={(v) => onUpdateQuantity(row.type, row.id, "have", v)}
```

Also strongly consider narrowing the `field` parameter type:
```ts
// types.ts
field: "stitchCount" | "need" | "have"
```

### CR-02: handleCreateSupply has no error handling -- unhandled promise rejection

**File:** `src/components/features/supply-table/use-supply-table.ts:188-195`
**Issue:** The `handleCreateSupply` callback calls `adapter.createSupply()` without a try/catch. If the adapter throws (network error, validation failure), the error propagates as an unhandled promise rejection. This violates the project's form-patterns convention ("Always wrap [server actions] in try/catch when doing optimistic updates") and can crash the React error boundary.

Compare with `handleUpdateQuantity` and `handleDelete` in `supply-table.tsx` (lines 72-101), which both have proper try/catch with toast error feedback.

**Fix:**
```ts
const handleCreateSupply = useCallback(
  async (data: CreateSupplyData): Promise<void> => {
    try {
      const created = await adapter.createSupply(supplyType, data);
      selectItem(created);
      setShowCreateDialog(false);
    } catch {
      toast.error("Couldn't create supply. Try again.");
    }
  },
  [adapter, supplyType, selectItem],
);
```

## Warnings

### WR-01: handleRowAdded is an empty no-op -- slide-in animation never fires

**File:** `src/components/features/supply-table/supply-table.tsx:63-70`
**Issue:** The `handleRowAdded` callback body is entirely comments describing what it *should* do, with zero implementation. As a result:
- `newRowIds` state (line 43) is declared but never populated
- `isNew` prop passed to every `SupplyTableDataRow` is always `false`
- The `animate-slide-in` CSS animation (defined in `globals.css:270-283`) is never triggered for newly added rows

This is dead code masquerading as a feature. The comments describe a "timestamp-based approach" but nothing is implemented.

**Fix:** Either implement the animation tracking or remove the dead code (`newRowIds` state, `isNew` prop, and the comment block). If implementing:
```ts
const handleRowAdded = useCallback(() => {
  // Snapshot current IDs, then on next render, any new ID gets animation
  const currentIds = new Set([
    ...threads.map(r => r.id),
    ...beads.map(r => r.id),
    ...specialty.map(r => r.id),
  ]);
  // After re-render, diff to find new IDs
  requestAnimationFrame(() => {
    const allIds = [...threads, ...beads, ...specialty].map(r => r.id);
    const newIds = allIds.filter(id => !currentIds.has(id));
    if (newIds.length > 0) {
      setNewRowIds(new Set(newIds));
      setTimeout(() => setNewRowIds(new Set()), 300);
    }
  });
}, [threads, beads, specialty]);
```
Note: this approach has timing issues since the parent hasn't re-rendered yet. The actual fix likely needs the parent to pass new row IDs down as props.

### WR-02: PortalAutocomplete has no click-outside handler

**File:** `src/components/features/supply-table/portal-autocomplete.tsx:124-221`
**Issue:** The portal-rendered dropdown has no mechanism to close when the user clicks outside of it. The only ways to close are: pressing Escape, selecting an item, or clearing the search text. Clicking elsewhere on the page leaves the dropdown floating with no way to dismiss it, which is a usability defect for any dropdown/popover component.

**Fix:** Add a click-outside listener:
```tsx
useEffect(() => {
  if (!isOpen) return;
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node;
    // Check if click is outside the dropdown and anchor
    if (!anchorRef.current?.contains(target)) {
      onClose();
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isOpen, anchorRef, onClose]);
```

### WR-03: Hardcoded color values in add-row violate semantic token convention

**File:** `src/components/features/supply-table/supply-table-add-row.tsx:139`
**Issue:** The add row uses `bg-[rgba(5,150,105,0.03)]` and `border-emerald-200` which are hardcoded color values, not semantic design tokens. Per project conventions in `base-ui-patterns.md`: "Always use semantic tokens, never hardcoded color scales." These will not adapt to dark mode.

**Fix:** Use semantic tokens or CSS custom properties:
```tsx
className="bg-primary/[0.03] border-b-2 border-primary/20"
```
Or define a dedicated semantic token if the add-row tint needs to be distinct from primary.

### WR-04: Portal dropdown position not updated on scroll/resize

**File:** `src/components/features/supply-table/portal-autocomplete.tsx:41-48`
**Issue:** The dropdown coordinates are calculated once via `getBoundingClientRect` when `isOpen` changes, but never recalculated on scroll or viewport resize. Since the dropdown uses `position: fixed`, scrolling the page or the table's overflow container will cause the dropdown to detach from its anchor input, floating in the wrong position. This is particularly relevant because the table wrapper has `overflow-x-auto` (supply-table.tsx:112).

**Fix:** Add scroll/resize listeners that recalculate position:
```tsx
useEffect(() => {
  if (!isOpen || !anchorRef.current) return;
  function updatePosition() {
    const rect = anchorRef.current!.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(320, rect.width),
    });
  }
  updatePosition();
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
  return () => {
    window.removeEventListener("scroll", updatePosition, true);
    window.removeEventListener("resize", updatePosition);
  };
}, [isOpen, anchorRef]);
```

## Info

### IN-01: Unused imports in local-state-adapter.test.ts

**File:** `src/components/features/supply-table/local-state-adapter.test.ts:4`
**Issue:** The import `{ createMockSupplyBrand, createMockThread, createMockBead, createMockSpecialtyItem }` from `@/__tests__/mocks/factories` is never used anywhere in the file. All test data is created via the local `makeSearchResult` helper.
**Fix:** Remove the unused import line.

### IN-02: Inconsistent afterEach import style in supply-table-add-row.test.tsx

**File:** `src/components/features/supply-table/supply-table-add-row.test.tsx:1,133`
**Issue:** `afterEach` is used on line 133 but not imported from vitest on line 1 (only `describe, it, expect, vi, beforeEach` are imported). It works because vitest globals are enabled, but the pattern is inconsistent with other test files in this directory that explicitly import all lifecycle hooks.
**Fix:** Add `afterEach` to the vitest import: `import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";`

---

_Reviewed: 2026-05-03T17:42:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
