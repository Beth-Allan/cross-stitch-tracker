---
phase: 06-gallery-cards-view-modes
reviewed: 2026-04-15T01:06:09Z
depth: standard
files_reviewed: 35
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/charts/loading.tsx
  - src/app/(dashboard)/charts/page.tsx
  - src/app/layout.tsx
  - src/components/features/charts/chart-detail.tsx
  - src/components/features/gallery/cover-placeholder.test.tsx
  - src/components/features/gallery/cover-placeholder.tsx
  - src/components/features/gallery/filter-bar.test.tsx
  - src/components/features/gallery/filter-bar.tsx
  - src/components/features/gallery/filter-chips.test.tsx
  - src/components/features/gallery/filter-chips.tsx
  - src/components/features/gallery/gallery-card.test.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/gallery/gallery-format.ts
  - src/components/features/gallery/gallery-grid.test.tsx
  - src/components/features/gallery/gallery-grid.tsx
  - src/components/features/gallery/gallery-types.ts
  - src/components/features/gallery/gallery-utils.test.ts
  - src/components/features/gallery/gallery-utils.ts
  - src/components/features/gallery/kitting-dots.test.tsx
  - src/components/features/gallery/kitting-dots.tsx
  - src/components/features/gallery/multi-select-dropdown.test.tsx
  - src/components/features/gallery/multi-select-dropdown.tsx
  - src/components/features/gallery/project-gallery.test.tsx
  - src/components/features/gallery/project-gallery.tsx
  - src/components/features/gallery/sort-dropdown.test.tsx
  - src/components/features/gallery/sort-dropdown.tsx
  - src/components/features/gallery/use-gallery-filters.test.ts
  - src/components/features/gallery/use-gallery-filters.ts
  - src/components/features/gallery/view-toggle-bar.test.tsx
  - src/components/features/gallery/view-toggle-bar.tsx
  - src/components/shell/nav-items.ts
  - src/lib/actions/chart-actions-gallery.test.ts
  - src/lib/actions/chart-actions.ts
  - src/types/chart.ts
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-15T01:06:09Z
**Depth:** standard
**Files Reviewed:** 35
**Status:** issues_found

## Summary

Phase 6 introduces gallery cards and view modes (gallery/list/table) for the /charts page with filtering, sorting, and URL-synced state via nuqs. This is a re-review after the round 1 fix report addressed all 4 prior findings (CR-01 unsafe type cast, WR-01 kitting dot logic, WR-02 progress clamping, WR-03 hardcoded listbox ID). All prior fixes are confirmed in the current code.

The implementation is well-structured with clean separation of concerns: types in `gallery-types.ts`, pure utility functions in `gallery-utils.ts`, URL state management in `use-gallery-filters.ts`, and presentational components composed in `project-gallery.tsx`.

Key positives:
- Server action `getChartsForGallery` correctly calls `requireAuth()` and scopes the query to `userId` -- no authorization gaps
- Data transformation via `transformToGalleryCard` now accepts the correct `GalleryChartData` type with no unsafe casts
- `progressPercent` is correctly clamped with `Math.min(100, ...)`
- `computeSupplyStatus` correctly distinguishes "needed" (zero acquired) from "partial" (some acquired)
- `SortDropdown` uses `useId()` for unique listbox IDs
- Tests are thorough with good coverage of filter/sort logic, hook integration with nuqs adapter, and component rendering
- Semantic tokens used consistently across most components
- Proper `"use client"` usage -- only components with hooks/interactivity are client components

Two warnings found (duplicate DOM IDs risk, hardcoded focus ring color) and four informational items. No critical issues.

## Warnings

### WR-01: MultiSelectDropdown generates listboxId from label text -- duplicate IDs if same label used twice

**File:** `src/components/features/gallery/multi-select-dropdown.tsx:28`
**Issue:** The `listboxId` is derived from the `label` prop: `` `${label.toLowerCase().replace(/\s+/g, "-")}-listbox` ``. If two `MultiSelectDropdown` instances share the same label, they produce duplicate DOM IDs, which is an HTML spec violation and breaks `aria-controls` associations. Currently the two instances in `filter-bar.tsx` use different labels ("Status" and "Size"), so this is not triggered in practice. However, the component is a reusable primitive and this is a latent bug. Note that `SortDropdown` already uses `useId()` correctly (fixed in the prior review round).
**Fix:** Use React's `useId()` hook for consistency with `SortDropdown`:
```tsx
import { useId } from "react";

// Replace line 28:
// const listboxId = `${label.toLowerCase().replace(/\s+/g, "-")}-listbox`;
const listboxId = useId();
```

### WR-02: Search input focus ring uses hardcoded emerald color instead of theme ring token

**File:** `src/components/features/gallery/filter-bar.tsx:48`
**Issue:** The search input uses `focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400` -- hardcoded color values rather than the theme's focus ring token. Per `base-ui-patterns.md`, semantic design tokens are preferred over hardcoded color scales. The emerald accent is used as a brand color throughout the gallery for selected/interactive states, but focus rings should use `ring-ring` for consistency with the rest of the app's form inputs and correct dark mode contrast. The current hardcoded `emerald-400` may not provide sufficient contrast against all dark mode backgrounds.
**Fix:** Use the theme ring token:
```tsx
className="... focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
```

## Info

### IN-01: "use client" directive in test file is dead code

**File:** `src/components/features/gallery/gallery-card.test.tsx:1`
**Issue:** The test file starts with `"use client";`. Test files run in Vitest (Node.js), not in Next.js, so the directive is meaningless and ignored. It is harmless but could confuse future contributors about whether test files need this directive.
**Fix:** Remove line 1 (`"use client";`).

### IN-02: Sort dropdown test description says "6 options" but there are 7 sort fields

**File:** `src/components/features/gallery/sort-dropdown.test.tsx:19`
**Issue:** The test is titled `"opens dropdown showing 6 options"` but `SORT_FIELD_ORDER` has 7 entries (dateAdded, name, designer, status, size, stitchCount, progress). The test verifies 6 specific labels but never checks for "Progress". The test passes because it only asserts presence of specific elements rather than a count. The description is misleading and the "Progress" option is not verified.
**Fix:** Update the test title and add the missing assertion:
```tsx
it("opens dropdown showing 7 options", () => {
  render(<SortDropdown {...defaultProps} />);
  fireEvent.click(screen.getByRole("button", { name: /sort by/i }));

  expect(screen.getAllByText("Date Added")).toHaveLength(2);
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("Designer")).toBeInTheDocument();
  expect(screen.getByText("Status")).toBeInTheDocument();
  expect(screen.getByText("Size")).toBeInTheDocument();
  expect(screen.getByText("Stitch Count")).toBeInTheDocument();
  expect(screen.getByText("Progress")).toBeInTheDocument();
});
```

### IN-03: STATUS_GRADIENT_CLASSES and celebration styles use hardcoded color scales

**File:** `src/components/features/gallery/gallery-utils.ts:133-156`
**Issue:** The `STATUS_GRADIENT_CLASSES` record and `getCelebrationClasses` function use hardcoded Tailwind color scales (e.g., `from-stone-200`, `border-violet-500`) rather than semantic tokens. Per CLAUDE.md conventions, semantic tokens are preferred. However, these are intentionally status-specific decorative elements (cover placeholders, celebration borders) that require distinct hues per status -- there are no semantic token equivalents. This was already acknowledged in the impeccable audit. Both include proper dark mode variants.
**Fix:** No action required. Consider adding a brief comment explaining the intentional deviation if desired.

### IN-04: GalleryChartWithProject and GalleryProjectWithRelations types in gallery-types.ts are now unused

**File:** `src/components/features/gallery/gallery-types.ts:69-77`
**Issue:** After the CR-01 fix from the prior review (changing `transformToGalleryCard` to accept `GalleryChartData`), the `GalleryChartWithProject` and `GalleryProjectWithRelations` types are no longer referenced by any source file. They are dead code.
**Fix:** Remove the unused types and their imports (`ProjectWithRelations`, `ChartWithProject`, `SupplyQuantity` from `@/types/chart`) from `gallery-types.ts`. Verify no other files import them first.

---

_Reviewed: 2026-04-15T01:06:09Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
