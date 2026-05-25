---
phase: 32-series-management-pages
plan: 01
subsystem: series-data-layer
tags: [series, types, actions, nav, factories, skeleton]
dependency_graph:
  requires: [Phase 31 Series CRUD]
  provides: [SeriesChart expanded type, getSeriesDetail action, mock factories, nav item, loading skeleton]
  affects: [Plan 02 series list page, Plan 03 series detail page]
tech_stack:
  added: []
  patterns: [TDD RED-GREEN, server action query pattern, type intersection with OptionalFocalPoint]
key_files:
  created:
    - src/app/(dashboard)/series/loading.tsx
  modified:
    - src/types/series.ts
    - src/lib/actions/series-actions.ts
    - src/lib/actions/series-actions.test.ts
    - src/components/features/designers/delete-confirmation-dialog.tsx
    - src/components/features/designers/delete-confirmation-dialog.test.tsx
    - src/components/shell/nav-items.ts
    - src/__tests__/mocks/factories.ts
decisions: []
metrics:
  duration: 6m
  completed: 2026-05-25T01:17:00Z
  tasks_completed: 2
  tasks_total: 2
  tests_added: 6
  tests_total: 31
---

# Phase 32 Plan 01: Data Layer for Series Pages Summary

Expanded SeriesChart type with focal point and dimensions, added getSeriesDetail query action with TDD, extended DeleteConfirmationDialog for series, added nav item, created mock factories and loading skeleton.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Expand SeriesChart type and add getSeriesDetail with tests | 77b4200 | src/types/series.ts, src/lib/actions/series-actions.ts, src/lib/actions/series-actions.test.ts |
| 2 | Extend DeleteConfirmationDialog, add nav item, mock factories, loading skeleton | 7ee0c0d | delete-confirmation-dialog.tsx/.test.tsx, nav-items.ts, factories.ts, loading.tsx |

## What Was Built

### Task 1: SeriesChart Type Expansion + getSeriesDetail Action (TDD)
- Expanded `SeriesChart` type with `OptionalFocalPoint` intersection plus `coverImageUrl`, `stitchesWide`, `stitchesHigh` -- mirrors `DesignerChart` pattern without genres
- Added `getSeriesDetail(id)` query action following `getDesigner()` pattern: `requireAuth()`, `prisma.series.findUnique` with chart includes, maps project status/stitchesCompleted, calls `computeSeriesProgress`
- 5 new tests: auth guard, null return for missing ID, enriched data shape, chart field mapping (focal points, dimensions, status), progress computation delegation

### Task 2: Infrastructure Extensions
- Extended `DeleteConfirmationDialog` entityType union with `"series"` and added getDescription case matching CP-06 copy: "unassigned from this series. Charts will NOT be deleted."
- Added Series nav item to Projects section with Library icon from lucide-react (per D-11)
- Created `createMockSeriesWithStats` and `createMockSeriesChart` factories in shared mocks
- Created `loading.tsx` skeleton: header + 3 sort pill placeholders + 6-card responsive grid with animate-skeleton-pulse, aria-label="Loading series"

## TDD Gate Compliance

- RED gate: 5 tests failed with "getSeriesDetail is not a function" (confirmed non-existent export)
- GREEN gate: All 5 tests pass after implementing type expansion + action
- Commit combines RED+GREEN as `feat(32-01)` since type changes and action are inseparable

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all data flows are fully wired.

## Verification

- `npm test -- --run src/lib/actions/series-actions.test.ts`: 22 passed (17 existing + 5 new)
- `npm test -- --run src/components/features/designers/delete-confirmation-dialog.test.tsx`: 9 passed (8 existing + 1 new)
- `grep "Series" src/components/shell/nav-items.ts`: confirmed nav item present
- `grep "getSeriesDetail" src/lib/actions/series-actions.ts`: confirmed export exists
- `grep "createMockSeriesWithStats" src/__tests__/mocks/factories.ts`: confirmed factory exists
- `ls src/app/(dashboard)/series/loading.tsx`: confirmed skeleton exists
