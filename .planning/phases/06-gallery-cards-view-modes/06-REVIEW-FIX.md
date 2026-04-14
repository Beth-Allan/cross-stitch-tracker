---
phase: 06-gallery-cards-view-modes
fixed_at: 2026-04-14T01:55:00Z
review_path: .planning/phases/06-gallery-cards-view-modes/06-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 6: Code Review Fix Report

**Fixed at:** 2026-04-14T01:55:00Z
**Source review:** .planning/phases/06-gallery-cards-view-modes/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Unsafe `as unknown as` type cast hides type mismatch

**Files modified:** `src/components/features/gallery/gallery-utils.ts`, `src/components/features/gallery/project-gallery.tsx`, `src/components/features/gallery/gallery-utils.test.ts`
**Commit:** 9e6f369
**Applied fix:** Changed `transformToGalleryCard` to accept `GalleryChartData` (the slim query type from `src/types/chart.ts`) instead of `GalleryChartWithProject` (the full Prisma model type). Removed the `as unknown as GalleryChartWithProject` cast in `project-gallery.tsx` and the unused `GalleryChartWithProject` import. Updated test mock `baseChart` from full `Project` shape to slim `GalleryProjectData` shape (removed `userId`, `chartId`, `startingStitches`, `storageLocation`, `stitchingApp`, full `fabric` object, etc. -- kept only the fields `transformToGalleryCard` actually accesses). TypeScript now enforces that the function only uses fields present in the query result.

### WR-01: computeSupplyStatus never returns "needed"

**Files modified:** `src/components/features/gallery/gallery-utils.ts`, `src/components/features/gallery/gallery-utils.test.ts`
**Commit:** 27ba6f9
**Applied fix:** Added `anyAcquired` check in `computeSupplyStatus`: when items exist but none have `quantityAcquired > 0`, now returns `"needed"` instead of `"partial"`. This gives correct kitting dot icons -- empty circle for "Still needed" (zero acquired) vs amber circle-dot for "In progress" (some acquired). Updated test expectation from `"partial"` to `"needed"` for the zero-acquired case.

### WR-02: progressPercent can exceed 100%

**Files modified:** `src/components/features/gallery/gallery-utils.ts`
**Commit:** 6be5f71
**Applied fix:** Wrapped the progress calculation with `Math.min(100, ...)` so `progressPercent` is clamped to 100% maximum. Handles the common case where `stitchesCompleted` exceeds `stitchCount` (approximate stitch counts).

### WR-03: SortDropdown uses hardcoded `id="sort-listbox"`

**Files modified:** `src/components/features/gallery/sort-dropdown.tsx`
**Commit:** a6cf249
**Applied fix:** Replaced hardcoded `id="sort-listbox"` with React `useId()` hook. The generated ID is used on the listbox element and in the trigger's `aria-controls` attribute. This ensures unique IDs per ARIA spec and avoids conflicts if multiple instances are rendered.

---

_Fixed: 2026-04-14T01:55:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
