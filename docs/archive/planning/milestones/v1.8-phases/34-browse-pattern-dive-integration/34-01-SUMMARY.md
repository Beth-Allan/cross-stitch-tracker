---
phase: 34-browse-pattern-dive-integration
plan: 01
subsystem: gallery, series
tags: [extraction, data-layer, series, gallery]
dependency_graph:
  requires: [Phase 32 SeriesCard, Phase 31 Series model]
  provides: [SeriesCard shared component, GalleryCardData series fields, GalleryChartData series relation]
  affects: [Plan 02 SeriesTabContent, Plan 03 Browse filter]
tech_stack:
  added: []
  patterns: [component extraction, optional prop pattern, Prisma include extension]
key_files:
  created:
    - src/components/features/series/series-card.tsx
    - src/components/features/series/series-card.test.tsx
  modified:
    - src/components/features/series/series-list.tsx
    - src/components/features/gallery/gallery-types.ts
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/gallery/gallery-utils.test.ts
    - src/types/chart.ts
    - src/lib/actions/chart-actions.ts
    - src/__tests__/mocks/factories.ts
    - src/components/features/gallery/project-gallery.test.tsx
decisions: []
metrics:
  duration: "4m 38s"
  completed: "2026-07-01T19:37:24Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 16
  tests_total: 76
---

# Phase 34 Plan 01: Data Layer & SeriesCard Extraction Summary

Extracted SeriesCard into standalone shared component with optional delete, extended gallery data pipeline with series fields from Prisma through to GalleryCardData.

## Task Results

| Task | Name | Commit(s) | Tests |
|------|------|-----------|-------|
| 1 | Extract SeriesCard component | c769e5e (RED), 8233101 (GREEN) | 10 new, 9 existing pass |
| 2 | Extend gallery data layer with series fields | 9abaa34 (RED), c8c5e81 (GREEN) | 6 new, 51 existing pass |

## Implementation Details

### Task 1: SeriesCard Extraction

Extracted the inline `SeriesCard` function (lines 165-217) and `getCompletionPercent` helper (lines 18-20) from `series-list.tsx` into a new `series-card.tsx` file. Key change: `onDelete` prop is now optional -- when undefined, the delete button is hidden via conditional rendering. This enables reuse across both the `/series` list page (passes `onDelete`) and Pattern Dive Series tab (omits it, per D-06).

`series-list.tsx` now imports `SeriesCard` from `./series-card`. Removed unused `Link` and `Trash2` imports. All 9 existing series-list tests pass unchanged.

### Task 2: Gallery Data Layer Extension

Four changes across the data pipeline (per D-11):

1. **GalleryCardData** (gallery-types.ts): Added `seriesId: string | null` and `seriesName: string | null`
2. **GalleryChartData** (chart.ts): Added `series: { id: string; name: string } | null`
3. **getChartsForGallery** (chart-actions.ts): Added `series: { select: { id: true, name: true } }` to Prisma include
4. **transformToGalleryCard** (gallery-utils.ts): Maps `chart.series?.id ?? null` and `chart.series?.name ?? null`
5. **createMockGalleryCard** (factories.ts): Added `seriesId: null` and `seriesName: null` defaults

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added series field to project-gallery.test.tsx mock factory**
- **Found during:** Task 2
- **Issue:** `createMockGalleryChartData` in project-gallery.test.tsx constructed a `GalleryChartData` literal missing the new required `series` field, causing TypeScript compilation failure
- **Fix:** Added `series: null` to the mock factory return object
- **Files modified:** src/components/features/gallery/project-gallery.test.tsx
- **Commit:** c8c5e81

## TDD Gate Compliance

All gates verified in git log:
1. `test(34-01)` commit c769e5e exists (RED gate - Task 1)
2. `feat(34-01)` commit 8233101 exists after it (GREEN gate - Task 1)
3. `test(34-01)` commit 9abaa34 exists (RED gate - Task 2)
4. `feat(34-01)` commit c8c5e81 exists after it (GREEN gate - Task 2)
