---
phase: 16-input-dashboard-fixes
reviewed: 2026-05-17T12:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/components/features/charts/project-detail/supplies-tab.tsx
  - src/components/features/dashboard/spotlight-card.test.tsx
  - src/components/features/dashboard/spotlight-card.tsx
  - src/components/features/supply-table/portal-autocomplete.test.tsx
  - src/components/features/supply-table/portal-autocomplete.tsx
  - src/components/features/supply-table/supply-table-add-row.test.tsx
  - src/components/features/supply-table/supply-table-add-row.tsx
  - src/components/features/supply-table/use-supply-table.test.ts
  - src/components/features/supply-table/use-supply-table.ts
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-05-17T12:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 16 implements two fixes: a keystroke-dropping bug in the supply table autocomplete (refactored to portal-based dropdown with debounced search in a custom hook) and dashboard spotlight card styling improvements. The core architecture (controlled input + debounced useEffect for search) correctly addresses the keystroke issue. However, there is one crash-risk issue in the portal positioning code and several quality concerns around unused props, hardcoded colors, and duplicated sorting logic.

## Critical Issues

### CR-01: Non-null assertion in scroll/resize handler can crash

**File:** `src/components/features/supply-table/portal-autocomplete.tsx:43`
**Issue:** The `updatePosition` function uses `anchorRef.current!.getBoundingClientRect()` with a non-null assertion. While the parent `useEffect` guard checks `anchorRef.current` before defining `updatePosition`, this function is also registered as a scroll/resize event listener (lines 50-51). If the anchor element is removed from the DOM (e.g., React unmounts the input while a scroll event is queued), `anchorRef.current` could be `null` when the handler fires, causing a runtime crash: "Cannot read properties of null (reading 'getBoundingClientRect')".
**Fix:**
```typescript
function updatePosition() {
  if (!anchorRef.current) return;
  const rect = anchorRef.current.getBoundingClientRect();
  setCoords({
    top: rect.bottom + 4,
    left: rect.left,
    width: Math.max(320, rect.width),
  });
}
```

## Warnings

### WR-01: Hardcoded color classes violate semantic design token convention

**File:** `src/components/features/dashboard/spotlight-card.tsx:78-79,119,123`
**Issue:** Uses hardcoded `text-amber-500`, `text-amber-600`, `bg-emerald-500`, `text-emerald-600` (and their dark variants) instead of semantic tokens. The project convention in `.claude/rules/base-ui-patterns.md` explicitly states: "Always use semantic tokens, never hardcoded color scales." While decorative/accent colors may not have direct semantic equivalents, this creates maintenance burden when theming and inconsistency with the rest of the codebase.
**Fix:** Define semantic tokens for accent/progress colors in the Tailwind config (e.g., `text-accent-spotlight`, `bg-progress`) or document these as intentional exceptions. At minimum, the progress bar should use `bg-primary` or a dedicated progress semantic token rather than hardcoded emerald.

### WR-02: Unused `chartId` prop in SuppliesTab

**File:** `src/components/features/charts/project-detail/supplies-tab.tsx:18,84`
**Issue:** The `SuppliesTabProps` interface defines `chartId: string` (line 18) but the component destructures only `{ project, supplies }` (line 84), never using `chartId`. This is dead code in the interface that misleads consumers into thinking it's required by the component logic.
**Fix:**
```typescript
interface SuppliesTabProps {
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
}
```
And remove `chartId` from the callsite.

### WR-03: Null designerName renders empty span with gap spacing

**File:** `src/components/features/dashboard/spotlight-card.tsx:91`
**Issue:** `SpotlightProject.designerName` is typed as `string | null`. When `null`, the span renders as an empty element but still occupies space due to the `gap-3` flex layout, potentially leaving a visual gap between elements.
**Fix:**
```tsx
{project.designerName && (
  <span className="text-muted-foreground text-sm">{project.designerName}</span>
)}
```

### WR-04: Duplicated display-item sorting logic between parent and portal

**File:** `src/components/features/supply-table/supply-table-add-row.tsx:121-125` and `src/components/features/supply-table/portal-autocomplete.tsx:78-81`
**Issue:** The "addable-first, then already-added, sliced to 8" sorting logic is duplicated in both the `SupplyTableAddRow` component (for keyboard navigation) and the `PortalAutocomplete` component (for rendering). If one is modified without the other, the keyboard highlight index would point to the wrong item -- a silent mismatch bug waiting to happen.
**Fix:** Extract the sorting into a shared utility function (e.g., `sortDisplayItems(items, existingIds, maxItems)`) imported by both components, or have the parent compute once and pass `displayItems` as a prop to the portal instead of `items` + `existingIds`.

## Info

### IN-01: console.error left in production component

**File:** `src/components/features/dashboard/spotlight-card.tsx:51`
**Issue:** `console.error("Spotlight shuffle failed:", error)` is present in the catch block. While error logging can be useful, the project convention calls out `console.log` as a debug artifact. The toast already informs the user; the console.error may leak internal error details in production.
**Fix:** Remove or replace with a structured error reporting call if one exists in the project.

### IN-02: Inline arrow function for onClose causes effect re-registration

**File:** `src/components/features/supply-table/supply-table-add-row.tsx:225`
**Issue:** `onClose={() => setSearchText("")}` creates a new function reference on every render. The `PortalAutocomplete` uses `onClose` in a `useEffect` dependency array (line 75), causing the click-outside listener to be torn down and re-registered on every parent render while the dropdown is open.
**Fix:** Memoize with `useCallback`:
```typescript
const handleAutocompleteClose = useCallback(() => setSearchText(""), [setSearchText]);
```
Then pass `onClose={handleAutocompleteClose}`.

---

_Reviewed: 2026-05-17T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
