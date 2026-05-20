---
phase: 26-ux-polish
plan: 03
subsystem: project-detail, dashboard, supplies, pattern-dive
tags: [focal-point, aspect-ratio, fabric-matching, view-persistence, ux-polish]
dependency_graph:
  requires: []
  provides: [focal-point-click-area, bucket-project-focal-point, fabric-matching-null-fix, supply-flash-fix]
  affects: [hero-cover-banner, bucket-project-row, cover-image-upload, supply-catalog, pattern-dive-actions]
tech_stack:
  added: []
  patterns: [component-extraction, synchronous-initialization, query-extension]
key_files:
  created:
    - src/components/features/charts/project-detail/focal-point-click-area.tsx
    - src/components/features/charts/project-detail/focal-point-click-area.test.tsx
    - src/components/features/dashboard/bucket-project-row.test.tsx
  modified:
    - src/components/features/charts/project-detail/focal-point-editor.tsx
    - src/components/features/charts/project-detail/focal-point-editor.test.tsx
    - src/components/features/charts/project-detail/hero-cover-banner.tsx
    - src/components/features/charts/form-primitives/cover-image-upload.tsx
    - src/components/features/charts/form-primitives/cover-image-upload.test.tsx
    - src/types/dashboard.ts
    - src/lib/actions/project-dashboard-actions.ts
    - src/components/features/dashboard/bucket-project-row.tsx
    - src/lib/actions/pattern-dive-actions.ts
    - src/lib/actions/pattern-dive-actions.test.ts
    - src/components/features/supplies/supply-catalog.tsx
    - src/components/features/supplies/supply-catalog.test.tsx
decisions:
  - "D-09/D-10: FocalPointEditor split into FocalPointClickArea (overlay) + action bar (normal flow) per CONTEXT.md"
  - "D-11: Cover image preview uses dynamic aspect ratio from onLoad with h-48 fallback"
  - "D-12: Hero banner object-contain + blur fill unchanged"
  - "Fabric matching: removed .filter() on null fabricCount branch to show all candidates with fit indicators"
  - "Supply catalog: synchronous localStorage in useState initializer eliminates useEffect flash"
metrics:
  duration: "7m"
  completed: "2026-05-20T03:39:07Z"
  tasks_completed: 3
  tasks_total: 3
  tests_added: 18
  tests_modified: 7
  files_created: 3
  files_modified: 12
---

# Phase 26 Plan 03: Layout & Data Fixes Summary

Focal point action bar repositioned below image, dynamic aspect ratio on cover preview, BucketProject focal point styling, supplies flash fix, and fabric matching null fabricCount correction.

## Tasks Completed

### Task 1: Focal point editor split + cover image dynamic aspect ratio (UX-10, UX-13)

**Commit:** `7817fa4` feat(26-03): split focal point editor + dynamic cover image aspect ratio

- Extracted `FocalPointClickArea` into separate component with absolute inset-0 overlay, cursor-crosshair, role="button"
- Refactored `FocalPointEditor` to return a Fragment: edit button (absolute), click area (absolute), action bar (normal flow)
- Action bar removed from absolute bottom-0 positioning -- now renders below image in document flow with border-t, bg-card/90, backdrop-blur-sm preserved
- Restructured `HeroCoverBanner`: overflow-hidden moved to inner image wrapper div; outer container keeps relative only, so action bar is not clipped
- Added dynamic aspect ratio to `CoverImageUpload`: onLoad reads naturalWidth/naturalHeight, sets aspectRatio style with maxHeight 18rem cap; h-48 fallback before image loads
- Hero banner object-contain behavior unchanged per D-12

### Task 2: BucketProject focal point + fabric matching fix (UX-09, UX-11)

**Commit:** `18859b3` feat(26-03): BucketProject focal point styling + fabric matching null fabricCount fix

- Extended `BucketProject` interface with `OptionalFocalPoint` (matching CurrentlyStitchingProject, StartNextProject, BuriedTreasure, SpotlightProject pattern)
- Added `focalPointX: true, focalPointY: true` to chart select in project dashboard query
- Added focal point fields to bucket project mapping
- Applied `getObjectPositionStyle()` to bucket-project-row img element
- Removed `.filter((f) => f.fitsWidth || f.fitsHeight)` from falsy fabricCount branch in `getFabricRequirements`
- All fabric candidates now returned with fit indicators when fabricCount is null (consistent with truthy branch showing all candidates)
- Updated 2 pre-existing tests to match new behavior

### Task 3: Supplies page first-load flash fix (UX-04)

**Commit:** `fd8a2f7` fix(26-03): eliminate supplies page first-load view mode flash

- Moved localStorage read from useEffect into useState initializer function
- Synchronous read runs before first paint, eliminating flash between default and stored view mode
- `typeof window !== "undefined"` guard for SSR safety
- URL param `initialView` still takes precedence over localStorage for the specified tab
- Removed unused `useEffect` import
- Updated 4 test descriptions to reflect synchronous initialization behavior

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated pre-existing fabric matching tests**
- **Found during:** Task 2
- **Issue:** Two existing tests ("matches unassigned fabrics by computing required size per-fabric count" and "excludes fabric that cannot fit both dimensions in any orientation") expected the old filtering behavior where non-fitting fabrics were excluded
- **Fix:** Updated assertions to expect all candidates returned with fitsWidth/fitsHeight indicators
- **Files modified:** src/lib/actions/pattern-dive-actions.test.ts
- **Commit:** 18859b3

**2. [Rule 3 - Blocking] Missing fireEvent import in cover-image-upload.test.tsx**
- **Found during:** Task 1 RED phase
- **Issue:** New tests used `fireEvent.load()` but the import only had `render, screen, waitFor`
- **Fix:** Added `fireEvent` to the import from `@/__tests__/test-utils`
- **Files modified:** src/components/features/charts/form-primitives/cover-image-upload.test.tsx
- **Commit:** 7817fa4

## Known Stubs

None -- all implementations are fully wired.

## Self-Check: PASSED

All files verified present, all commits verified in git log, all 84 tests passing across 6 test files.
