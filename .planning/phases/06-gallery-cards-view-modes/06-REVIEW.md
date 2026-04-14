---
phase: 06-gallery-cards-view-modes
reviewed: 2026-04-14T01:42:26Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - src/components/features/gallery/cover-placeholder.tsx
  - src/components/features/gallery/cover-placeholder.test.tsx
  - src/components/features/gallery/filter-bar.tsx
  - src/components/features/gallery/filter-bar.test.tsx
  - src/components/features/gallery/filter-chips.tsx
  - src/components/features/gallery/filter-chips.test.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/gallery/gallery-card.test.tsx
  - src/components/features/gallery/gallery-grid.tsx
  - src/components/features/gallery/gallery-grid.test.tsx
  - src/components/features/gallery/gallery-types.ts
  - src/components/features/gallery/gallery-utils.ts
  - src/components/features/gallery/gallery-utils.test.ts
  - src/components/features/gallery/gallery-format.ts
  - src/components/features/gallery/kitting-dots.tsx
  - src/components/features/gallery/kitting-dots.test.tsx
  - src/components/features/gallery/multi-select-dropdown.tsx
  - src/components/features/gallery/multi-select-dropdown.test.tsx
  - src/components/features/gallery/project-gallery.tsx
  - src/components/features/gallery/project-gallery.test.tsx
  - src/components/features/gallery/sort-dropdown.tsx
  - src/components/features/gallery/sort-dropdown.test.tsx
  - src/components/features/gallery/use-gallery-filters.ts
  - src/components/features/gallery/use-gallery-filters.test.ts
  - src/components/features/gallery/view-toggle-bar.tsx
  - src/components/features/gallery/view-toggle-bar.test.tsx
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/chart-actions-gallery.test.ts
  - src/types/chart.ts
  - src/components/shell/nav-items.ts
  - src/app/(dashboard)/charts/page.tsx
  - src/app/layout.tsx
  - src/__tests__/mocks/factories.ts
findings:
  critical: 1
  warning: 3
  info: 3
  total: 7
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-14T01:42:26Z
**Depth:** standard
**Files Reviewed:** 33
**Status:** issues_found

## Summary

Phase 6 adds a gallery view to the /charts page with three view modes (gallery cards, list, table), filtering by status/designer/genre, sorting with URL-based state via nuqs, and kitting dot status indicators. The code is well-structured with clean separation of concerns: types in `gallery-types.ts`, pure utility logic in `gallery-utils.ts`, formatting in `gallery-format.ts`, URL state in `use-gallery-filters.ts`, and presentation in component files. Test coverage is thorough (148 gallery tests reported). Auth patterns and server action conventions are followed correctly. The `getChartsForGallery` action uses `requireAuth()` and scopes queries to `userId`.

Key concerns: a logic bug in kitting dot computation that conflates "none acquired" with "partially acquired", an unsafe type cast that bypasses TypeScript's safety, and an unbounded progress percentage that can exceed 100%.

## Critical Issues

### CR-01: Unsafe `as unknown as` type cast hides type mismatch between GalleryChartData and GalleryChartWithProject

**File:** `src/components/features/gallery/project-gallery.tsx:24`
**Issue:** The cast `c as unknown as GalleryChartWithProject` bypasses TypeScript entirely. `GalleryChartData` (from `src/types/chart.ts`) has a slim `project` type with only selected fields (`id`, `status`, `stitchesCompleted`, etc.), while `GalleryChartWithProject` expects a full `Project` type (with `userId`, `chartId`, `startingStitches`, `needsOnionSkinning`, etc. plus `storageLocation` and `stitchingApp` relations). Today `transformToGalleryCard` only accesses fields present on both types, so it works at runtime. But any future change to `transformToGalleryCard` that accesses a `Project` field not in `GalleryProjectData` would silently read `undefined` at runtime with no compiler warning.
**Fix:** Make `transformToGalleryCard` accept `GalleryChartData` directly, or create a shared input type that both types satisfy. The simplest fix is to update the function signature:
```typescript
// gallery-utils.ts
import type { GalleryChartData } from "@/types/chart";

export function transformToGalleryCard(
  chart: GalleryChartData,
  imageUrls: Record<string, string>,
): GalleryCardData {
  // ... implementation unchanged, it only uses fields present on GalleryChartData
}
```
Then in `project-gallery.tsx`, remove the cast:
```typescript
charts.map((c) => transformToGalleryCard(c, imageUrls))
```

## Warnings

### WR-01: computeSupplyStatus never returns "needed" -- conflates zero-acquired with partially-acquired

**File:** `src/components/features/gallery/gallery-utils.ts:34-38`
**Issue:** The function returns `"not-applicable"` (no items), `"fulfilled"` (all acquired), or `"partial"` (some not acquired). It never returns `"needed"`, which is one of the four `KittingItemStatus` values. When a user has linked supplies but has acquired 0 of them, the UI shows an amber circle-dot icon ("partial") instead of an empty circle icon ("needed"). The `KittingDotIcon` component renders distinct icons for "needed" vs "partial", and the tooltip text differs ("Still needed" vs "In progress"), so this is a meaningful UX distinction.
**Fix:**
```typescript
function computeSupplyStatus(items: SupplyItem[]): KittingItemStatus {
  if (items.length === 0) return "not-applicable";
  const allAcquired = items.every((i) => i.quantityAcquired >= i.quantityRequired);
  if (allAcquired) return "fulfilled";
  const anyAcquired = items.some((i) => i.quantityAcquired > 0);
  if (anyAcquired) return "partial";
  return "needed";
}
```

### WR-02: progressPercent can exceed 100% when stitchesCompleted > stitchCount

**File:** `src/components/features/gallery/gallery-utils.ts:77`
**Issue:** `Math.round((stitchesCompleted / stitchCount) * 100)` has no upper bound. If a user enters stitchesCompleted > stitchCount (common when stitch count is approximate), the progress bar text will show values like "105%". The bar itself is visually clamped by `overflow-hidden`, but the percentage label in `WIPFooter` and the table view will display the unclamped value.
**Fix:**
```typescript
const progressPercent = stitchCount > 0
  ? Math.min(100, Math.round((stitchesCompleted / stitchCount) * 100))
  : 0;
```

### WR-03: SortDropdown uses hardcoded `id="sort-listbox"` -- would conflict if rendered twice

**File:** `src/components/features/gallery/sort-dropdown.tsx:153`
**Issue:** The listbox element uses a static `id="sort-listbox"` rather than a generated ID. While currently only one instance exists, this violates ARIA requirements (IDs must be unique in a document) and would break `aria-controls` if a second instance were added. The `MultiSelectDropdown` correctly generates dynamic IDs from its label prop.
**Fix:** Use `useId()` from React or derive from the label/props:
```typescript
const listboxId = useId();
// ...
<div id={listboxId} role="listbox" ...>
```

## Info

### IN-01: STATUS_GRADIENT_CLASSES uses hardcoded color scales (stone-*, amber-*, etc.) instead of semantic tokens

**File:** `src/components/features/gallery/gallery-utils.ts:130-141`
**Issue:** Project conventions prefer semantic tokens (`bg-card`, `text-muted-foreground`) over hardcoded color scales. The gradient map uses raw Tailwind colors like `stone-200`, `amber-100`, `sky-100`, etc. This is a deliberate design choice for status-specific gradients that don't have semantic equivalents, and each entry includes dark-mode variants. Documenting as info rather than warning since these are visual status indicators with no semantic token equivalent.
**Fix:** Consider adding a code comment explaining why raw colors are used here, e.g. `// Status gradients use raw colors intentionally -- no semantic equivalents exist for these status-specific visual treatments`.

### IN-02: GalleryChartWithProject type in gallery-types.ts is unused at runtime -- only needed due to CR-01 cast

**File:** `src/components/features/gallery/gallery-types.ts:69-77`
**Issue:** The `GalleryChartWithProject` and `GalleryProjectWithRelations` types exist primarily to type the `transformToGalleryCard` function, but the actual data flowing through is `GalleryChartData` from `src/types/chart.ts`. If CR-01 is fixed (making `transformToGalleryCard` accept `GalleryChartData`), these types become dead code and should be removed.
**Fix:** Remove after fixing CR-01, along with the `ChartWithProject` and `ProjectWithRelations` imports.

### IN-03: Test file cover-placeholder.test.tsx asserts raw color classes (from-stone-200) that are implementation details

**File:** `src/components/features/gallery/cover-placeholder.test.tsx:17`
**Issue:** Test asserts `expect(div.className).toContain("from-stone-200")` which couples the test to specific Tailwind class names. If the gradient colors change, the test breaks even though the behavior (rendering a gradient) is unchanged. This is a minor coupling concern.
**Fix:** Consider testing for the presence of `bg-gradient-to-br` only (which is stable), or test that different statuses produce different classes (which is already covered in the "7 statuses" test).

---

_Reviewed: 2026-04-14T01:42:26Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
