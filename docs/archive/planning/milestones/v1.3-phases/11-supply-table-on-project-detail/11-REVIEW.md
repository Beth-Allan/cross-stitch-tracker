---
phase: 11-supply-table-on-project-detail
reviewed: 2026-05-10T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/charts/project-detail/supplies-tab.test.tsx
  - src/components/features/supply-table/index.ts
  - src/components/features/supply-table/server-action-adapter.ts
  - src/components/features/supply-table/server-action-adapter.test.ts
  - src/components/features/supply-table/supply-table-add-row.tsx
  - src/components/features/supply-table/supply-table.tsx
  - src/components/features/supply-table/types.ts
  - src/components/features/supply-table/use-supply-table.ts
  - src/components/features/supply-table/portal-autocomplete.tsx
  - src/components/features/supply-table/editable-number.tsx
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-05-10
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 11 delivers a `ServerActionAdapter` bridging the existing `SupplyTableAdapter` interface to supply server actions, a `SuppliesTab` replacement for the project detail page, and supporting components (`PortalAutocomplete`, `EditableNumber`, `SupplyTable`, `useSupplyTable`). The adapter and hook logic are the highest-risk areas. Three blockers were found: a silent failure on `commitRow` errors leaving the user with no feedback, a `refreshFn()` call that fires before React has re-rendered new data (race condition with `router.refresh()`), and a thrown exception from `adapter.searchSupplies` / `adapter.addThread` / etc. going uncaught in the hook, which can crash the component. Four warnings cover the unused `chartId` prop, a missing `parseInt` radix, an `aria-disabled` attribute that should be a boolean string, and the new-row animation tracking row IDs that are junction-table IDs (which `router.refresh()` replaces, meaning the animation never fires on the real row). Three info items cover the `_quantity` parameter, a magic number timeout, and the missing "create" error path from `server-action-adapter.test.ts` for bead/specialty.

---

## Critical Issues

### CR-01: `commitRow` failure silently swallows the error — user gets no feedback

**File:** `src/components/features/supply-table/supply-table-add-row.tsx:72-80`

**Issue:** `handleCommit` calls `commitRow()` and branches on `result.success`, but on `false` it does nothing — no toast, no error message, nothing. The user presses Enter, the row does not appear, and the UI gives no indication why. `commitRow` itself does not call `toast` either (it only returns `{ success: false }`). The error string from the adapter (`result.error`) is thrown away at the `commitRow` return site (`use-supply-table.ts:166`).

**Fix:**
```tsx
// supply-table-add-row.tsx
async function handleCommit() {
  const result = await commitRow();
  if (result.success) {
    onRowAdded(result.newId);
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  } else {
    toast.error(result.error ?? "Couldn't add supply. Try again.");
  }
}
```

And surface the error string from `commitRow` in `use-supply-table.ts`:
```ts
// use-supply-table.ts — commitRow return type and failure path
return { success: false, focusTarget: "search", error: result.error };
```

### CR-02: Unhandled exception from `adapter.searchSupplies` can crash the component

**File:** `src/components/features/supply-table/use-supply-table.ts:62-73`

**Issue:** The debounced `useEffect` wraps the async callback in `try/finally`, but the `try` block has no `catch`. If `adapter.searchSupplies(...)` throws (network error, unexpected server action exception), the `finally` runs and clears `isSearching`, but the exception propagates uncaught — in React 18 this triggers an unhandled promise rejection and can bubble to the nearest error boundary or produce a white screen. The `finally` guard on `cancelledRef` also means the error is silently swallowed in the no-catch path when `cancelledRef.current` is true, which is the wrong failure mode.

**Fix:**
```ts
debounceRef.current = setTimeout(async () => {
  try {
    const results = await adapter.searchSupplies(supplyType, searchText);
    if (!cancelledRef.current) {
      setSearchResults(results);
    }
  } catch {
    if (!cancelledRef.current) {
      setSearchResults([]);
      toast.error("Search failed. Try again.");
    }
  } finally {
    if (!cancelledRef.current) {
      setIsSearching(false);
    }
  }
}, DEBOUNCE_MS);
```

### CR-03: `commitRow` does not catch exceptions thrown by adapter methods

**File:** `src/components/features/supply-table/use-supply-table.ts:144-154`

**Issue:** `commitRow` calls `adapter.addThread`, `adapter.addBead`, or `adapter.addSpecialty` with no try/catch. `ServerActionAdapter` does not throw on add failures — it returns `{ success: false }` — but the contract is `Promise<Result>` and nothing prevents future adapters or network-level failures from throwing. More immediately: if the server action itself throws (e.g., network timeout, Prisma error not caught upstream), this propagates as an unhandled rejection through `handleCommit`, which is also not wrapped in try/catch. The chain is: `handleStitchesKeyDown` → `handleCommit()` (no await in the event handler context, but `handleCommit` is async) — so the rejected promise is unhandled.

**Fix:**
```ts
async function handleCommit() {
  try {
    const result = await commitRow();
    if (result.success) {
      onRowAdded(result.newId);
      requestAnimationFrame(() => { searchInputRef.current?.focus(); });
    } else {
      toast.error(result.error ?? "Couldn't add supply. Try again.");
    }
  } catch {
    toast.error("Couldn't add supply. Try again.");
  }
}
```

And wrap `commitRow`'s adapter calls:
```ts
// use-supply-table.ts — inside commitRow
try {
  switch (supplyType) {
    case "THREAD":
      result = await adapter.addThread(selectedItem.id, safeStitchCount, effectiveNeed);
      break;
    // ...
  }
} catch {
  return { success: false, focusTarget: "search", error: "Couldn't add supply. Try again." };
}
```

---

## Warnings

### WR-01: `chartId` prop declared but never used in `SuppliesTab`

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:18,84`

**Issue:** `SuppliesTabProps` declares `chartId: string` and the component destructures `{ project, supplies }` — `chartId` is silently dropped. The prop is passed by the caller (`project-detail-page.tsx:76`) and accepted in every test case, creating a surface for confusion about what the component actually needs. If `chartId` was intentionally dropped (adapter uses `project.id`), the prop should be removed from the interface.

**Fix:** Remove `chartId` from `SuppliesTabProps` and from the call sites, or document explicitly why it is present (e.g., reserved for Phase 13 analytics).

```ts
// Remove from interface:
interface SuppliesTabProps {
  // chartId: string;  <- remove
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
}
```

### WR-02: `parseInt(draft)` missing radix — parses unexpected inputs as non-decimal

**File:** `src/components/features/supply-table/editable-number.tsx:60`

**Issue:** `parseInt(draft)` without a radix defaults to base 10 in modern engines but is a lint violation under `radix` rules and behaves incorrectly if the user enters a value like `"08"` in some older environments. More practically, this is a strict-TypeScript project and ESLint's `radix` rule will flag this. `parseInt("08")` returns `8` in ES5+ but the missing radix is a code quality defect documented as a warning in the project's TypeScript/ESLint config.

**Fix:**
```ts
const num = parseInt(draft, 10);
```

### WR-03: New-row animation is broken — tracks junction IDs that `router.refresh()` replaces

**File:** `src/components/features/supply-table/supply-table.tsx:60-71`, `src/components/features/supply-table/server-action-adapter.ts:50-53`

**Issue:** `handleRowAdded(newId)` stores the new junction-table record ID in `newRowIds`. After a successful add, `ServerActionAdapter` calls `this.refreshFn()` (which calls `router.refresh()`), causing the server to re-fetch and re-render the parent with fresh data. The new row arrives via the refreshed `threads`/`beads`/`specialty` props with its correct `row.id` (the junction ID), so `isNew={newRowIds.has(row.id)}` should theoretically work.

However, `router.refresh()` is called *before* `handleRowAdded` is invoked (the adapter calls `refreshFn()` synchronously during `await adapter.addThread(...)`, which resolves before `commitRow` returns). The refresh may resolve and re-render before the `newRowIds` state is set, meaning the row arrives in the DOM without `isNew=true` already set. The animation therefore never fires on a real project-detail render, only on local-state tests. The 250ms timeout in `handleRowAdded` is also too short relative to a `router.refresh()` round-trip.

**Fix:** Either call `refreshFn()` after `handleRowAdded` is called (not inside the adapter), or wire the animation via a `useEffect` keyed on the incoming row count rather than a timed ID set.

### WR-04: `aria-disabled` should be `"true"` string, not boolean `true`

**File:** `src/components/features/supply-table/portal-autocomplete.tsx:202`

**Issue:** `aria-disabled={disabled || undefined}` passes a boolean `true` when the item is disabled. ARIA attributes in HTML must be string values (`"true"` / `"false"`), not booleans. React converts boolean `true` to the string `"true"` for known ARIA props, so this works in practice — but passing `undefined` instead of `"false"` means screenreaders don't know the item is *not* disabled when it isn't, because the attribute is completely absent for enabled items. Consistent presence of `aria-disabled="false"` is the recommended pattern for listbox options.

**Fix:**
```tsx
aria-disabled={disabled ? "true" : "false"}
```

---

## Info

### IN-01: `_quantity` parameter in `addBead` is interface-mandated but unused — document or reconsider

**File:** `src/components/features/supply-table/server-action-adapter.ts:57`

**Issue:** `addBead(beadId: string, _quantity: number, need: number)` accepts `_quantity` (bead count / stitch equivalent) and throws it away. This matches the `SupplyTableAdapter` interface definition which has `quantity: number` — so the signature is correct. The underscore prefix signals "unused by design," but there is no comment explaining what `quantity` represents for beads or why it is not forwarded to `addBeadToProject`. Given that `addBeadToProject` does not have a stitch-count field, this is intentional, but a comment in the interface or adapter would prevent future confusion.

**Fix:** Add a comment to `types.ts`:
```ts
// quantity: for beads, represents bead count used in the pattern (informational only;
// not forwarded to the junction table since ProjectBead has no stitchCount field)
addBead(beadId: string, quantity: number, need: number): Promise<Result>;
```

### IN-02: Magic number `250` in `setTimeout` should be a named constant

**File:** `src/components/features/supply-table/supply-table.tsx:63-69`

**Issue:** The `250` millisecond timeout is explained in a comment but is still a magic number. If the animation duration changes in CSS, the timeout must be updated separately. A named constant co-located with (or imported alongside) the animation definition would make this relationship explicit.

**Fix:**
```ts
const NEW_ROW_ANIMATION_DURATION_MS = 250; // 200ms animation + 50ms buffer (per D-09)
// ...
setTimeout(() => { ... }, NEW_ROW_ANIMATION_DURATION_MS);
```

### IN-03: `createSupply` failure path not tested for BEAD and SPECIALTY types

**File:** `src/components/features/supply-table/server-action-adapter.test.ts`

**Issue:** The `createSupply` describe block includes a "throws on failure" test only for the THREAD case (line 560). BEAD and SPECIALTY follow the same `throw new Error(result.error)` pattern but are not covered for the failure path. This is a test coverage gap — not a production bug — but it means regressions in error handling for those branches are invisible.

**Fix:** Add failure-path tests for BEAD and SPECIALTY in the `createSupply` describe block, mirroring the existing THREAD failure test.

---

_Reviewed: 2026-05-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
