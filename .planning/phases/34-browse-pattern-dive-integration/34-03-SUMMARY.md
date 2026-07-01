---
phase: 34-browse-pattern-dive-integration
plan: 03
subsystem: gallery
tags: [series-filter, browse-tab, url-state, filter-bar]
dependency_graph:
  requires: [Plan 01 GalleryCardData series fields]
  provides: [Series filter in Browse tab, seriesFilter URL state, series filter chips]
  affects: [Browse tab user experience]
tech_stack:
  added: []
  patterns: [MultiSelectDropdown reuse, nuqs parseAsArrayOf, __unassigned__ sentinel]
key_files:
  created: []
  modified:
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/gallery/gallery-utils.test.ts
    - src/components/features/gallery/gallery-types.ts
    - src/components/features/gallery/use-gallery-filters.ts
    - src/components/features/gallery/use-gallery-filters.test.ts
    - src/components/features/gallery/filter-bar.tsx
    - src/components/features/gallery/filter-bar.test.tsx
    - src/components/features/gallery/filter-chips.tsx
    - src/components/features/gallery/filter-chips.test.tsx
    - src/components/features/gallery/project-gallery.tsx
    - src/components/features/gallery/project-gallery.test.tsx
    - src/types/chart.ts
    - src/__tests__/mocks/factories.ts
decisions: []
metrics:
  duration: "6m 40s"
  completed: "2026-07-01T19:48:55Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 17
  tests_total: 183
---

# Phase 34 Plan 03: Browse Tab Series Filter Summary

Series filter added to Browse tab using MultiSelectDropdown pattern, with __unassigned__ sentinel for null-series charts and URL persistence via nuqs.

## Task Results

| Task | Name | Commit(s) | Tests |
|------|------|-----------|-------|
| 1 | Extend filterAndSort with series filter predicate | 7992e8f (RED), ab20391 (GREEN) | 6 new, 51 existing pass |
| 2 | Wire series filter through hook, FilterBar, FilterChips, ProjectGallery | 72df0eb (RED), 36adf79 (GREEN) | 11 new, 172 existing pass |

## Implementation Details

### Task 1: filterAndSort Series Filter Predicate

Added `seriesFilter?: string[]` to the `filterAndSort` options. The predicate handles three cases:
- Named series IDs: include cards where `seriesId` matches any ID in the filter
- `__unassigned__` sentinel: include cards where `seriesId === null`
- Both combined: union of the above two sets

Made `seriesFilter` optional (defaulting to `[]`) so existing callers that don't pass it continue to work without changes.

Also added `seriesId: string | null` and `seriesName: string | null` to `GalleryCardData`, `GalleryChartData`, `transformToGalleryCard`, and `createMockGalleryCard` as prerequisite data layer changes (parallel with Plan 01).

### Task 2: Full Filter Pipeline Wiring

Four components modified to thread series filter through the pipeline:

1. **useGalleryFilters**: Added `seriesFilter` URL state (`?series=id1,id2` via `parseAsArrayOf`), `toggleSeries` callback, `seriesOptions` computed from cards (Unassigned first, then named series alphabetically), updated `clearFilters` and `hasActiveFilters`
2. **FilterBar**: Added 3rd `MultiSelectDropdown` for Series after Size, with `seriesFilter`, `onSeriesToggle`, and `seriesOptions` props
3. **FilterChips**: Added series chip generation with `"Series: {name}"` labels and `"Remove Series: {name} filter"` aria-labels, updated `hasFilters` check
4. **ProjectGallery**: Destructures new hook values, computes `seriesNames` lookup map, passes all series props to FilterBar and FilterChips

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added series fields to GalleryCardData/GalleryChartData/factories**
- **Found during:** Task 1
- **Issue:** Plan 01 (parallel worktree) adds these fields, but this worktree doesn't have them yet. TypeScript compilation would fail without them.
- **Fix:** Added `seriesId`/`seriesName` to GalleryCardData, GalleryChartData, transformToGalleryCard, and createMockGalleryCard. These changes overlap with Plan 01 and will be merged by the orchestrator.
- **Files modified:** gallery-types.ts, chart.ts, gallery-utils.ts, factories.ts
- **Commit:** 7992e8f

**2. [Rule 3 - Blocking] Updated project-gallery.test.tsx mock to include new hook return values**
- **Found during:** Task 2
- **Issue:** `useGalleryFilters` mock in project-gallery.test.tsx didn't return `seriesFilter`, `toggleSeries`, or `seriesOptions`, causing "seriesOptions is not iterable" error in all 6 existing tests
- **Fix:** Added missing fields to the vi.mock return object
- **Files modified:** project-gallery.test.tsx
- **Commit:** 36adf79

## TDD Gate Compliance

All gates verified in git log:
1. `test(34-03)` commit 7992e8f exists (RED gate - Task 1)
2. `feat(34-03)` commit ab20391 exists after it (GREEN gate - Task 1)
3. `test(34-03)` commit 72df0eb exists (RED gate - Task 2)
4. `feat(34-03)` commit 36adf79 exists after it (GREEN gate - Task 2)

## Self-Check: PASSED

All files verified present, all commits verified in git log.
