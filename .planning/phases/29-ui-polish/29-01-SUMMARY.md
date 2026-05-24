---
phase: 29-ui-polish
plan: 01
subsystem: gallery
tags: [ui-polish, gallery-cards, status-badges, size-badges, digital-copy]
dependency_graph:
  requires: []
  provides: [colored-status-badges, colored-size-badges, digital-copy-indicator]
  affects: [gallery-card, gallery-grid, status-badge]
tech_stack:
  added: []
  patterns: [config-driven-badge-colors, prisma-count-for-derived-booleans]
key_files:
  created: []
  modified:
    - src/lib/utils/status.ts
    - src/lib/utils/size-category.ts
    - src/components/features/gallery/gallery-types.ts
    - src/types/chart.ts
    - src/lib/actions/chart-actions.ts
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/gallery/gallery-card.tsx
    - src/components/features/gallery/gallery-grid.tsx
    - src/components/features/gallery/gallery-card.test.tsx
    - src/components/features/charts/status-badge.test.tsx
    - src/lib/utils/size-category.test.ts
    - src/components/features/gallery/gallery-utils.test.ts
    - src/__tests__/mocks/factories.ts
decisions:
  - "D-01/D-02: UNSTARTED status uses slate-50/slate-700 instead of bg-muted semantic tokens"
  - "D-03: Gallery card size badges use SIZE_COLORS from shared config instead of hardcoded grey"
  - "D-04: SIZE_COLORS lightened from -100 to -50 shade for visual distinction from status badges"
  - "D-05/D-06: hasDigitalCopy boolean derived from _count.files, displayed as FileText icon + label in card body"
metrics:
  duration: 5m
  completed: 2026-05-24
---

# Phase 29 Plan 01: Gallery Card Visual Polish Summary

Colored status/size badges and digital copy indicator on gallery cards using config-driven colors and Prisma _count query

## What Changed

### STATUS_CONFIG UNSTARTED (D-01, D-02)
- `bgClass`: `bg-muted` -> `bg-slate-50`
- `textClass`: `text-muted-foreground` -> `text-slate-700 dark:text-slate-300`
- `dotClass`: `bg-muted-foreground/60` -> `bg-slate-500`
- `darkBgClass`: `""` -> `dark:bg-slate-900/40`

### SIZE_COLORS Lightened (D-04)
All 5 categories changed from `-100` to `-50` shade backgrounds:
- Mini: `bg-blue-100` -> `bg-blue-50`
- Small: `bg-green-100` -> `bg-green-50`
- Medium: `bg-amber-100` -> `bg-amber-50`
- Large: `bg-orange-100` -> `bg-orange-50`
- BAP: `bg-red-100` -> `bg-red-50`

### Gallery Card Size Badges (D-03)
- Gallery card: replaced `bg-background/90 text-muted-foreground` with `SIZE_COLORS[category].bg + .text`
- List view: replaced `bg-muted text-muted-foreground` with SIZE_COLORS
- Table view: replaced `text-muted-foreground` with SIZE_COLORS (added bg + rounded-full)

### Digital Copy Indicator (D-05, D-06)
- `GalleryChartData` type: added `_count?: { files: number }`
- `getChartsForGallery()`: added `_count: { select: { files: true } }` to Prisma include
- `transformToGalleryCard()`: maps `(chart._count?.files ?? 0) > 0` to `hasDigitalCopy`
- `GalleryCardData`: added `hasDigitalCopy: boolean`
- Gallery card body: FileText icon + "Digital copy" label shown when `hasDigitalCopy` is true

## Commits

| Task | Name | Commit | Type |
|------|------|--------|------|
| 1 | Tests for status/size colors and digital copy pipeline (RED) | ddb31f4 | test |
| 2 | Implement all changes (GREEN) | 1b69cce | feat |

## Test Results

- 2255 tests passing (full suite), 0 failures
- 13 new test assertions added across 4 test files
- TDD gate: RED commit (ddb31f4) -> GREEN commit (1b69cce)

### New Tests
- `status-badge.test.tsx`: UNSTARTED slate bg/text, KITTING amber regression check (3 new)
- `size-category.test.ts`: SIZE_COLORS -50 shade for all 5 categories (5 new)
- `gallery-utils.test.ts`: hasDigitalCopy mapping for _count > 0, === 0, missing (3 new)
- `gallery-card.test.tsx`: Digital copy indicator visible/hidden (2 new)

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

1. RED gate: `test(29-01)` commit ddb31f4 - all 10 new assertions fail
2. GREEN gate: `feat(29-01)` commit 1b69cce - all 104 tests pass across 4 files
3. No REFACTOR needed - implementation is clean

## Self-Check: PASSED

- 13/13 files: FOUND
- 2/2 commits: FOUND
- 8/8 key content checks: FOUND
