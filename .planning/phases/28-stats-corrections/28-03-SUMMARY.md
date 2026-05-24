---
phase: 28-stats-corrections
plan: 03
subsystem: stats-ui, dashboard
tags: [chart-formatting, bug-fix, presentation]
dependency_graph:
  requires: []
  provides:
    - integer-only chart axis ticks
    - fixed days-in-library display
  affects:
    - src/components/features/stats/designer-breakdown-chart.tsx
    - src/components/features/stats/genre-distribution-chart.tsx
    - src/components/features/stats/size-category-chart.tsx
    - src/components/features/dashboard/buried-treasures-section.tsx
tech_stack:
  added: []
  patterns:
    - allowDecimals={false} on Recharts numeric axes
    - separated formatAge (unit) and formatAgeNumber (display number)
key_files:
  created:
    - src/components/features/dashboard/buried-treasures-section.test.tsx
  modified:
    - src/components/features/stats/designer-breakdown-chart.tsx
    - src/components/features/stats/designer-breakdown-chart.test.tsx
    - src/components/features/stats/genre-distribution-chart.tsx
    - src/components/features/stats/genre-distribution-chart.test.tsx
    - src/components/features/stats/size-category-chart.tsx
    - src/components/features/stats/size-category-chart.test.tsx
    - src/components/features/dashboard/buried-treasures-section.tsx
decisions: []
metrics:
  duration: 6m
  completed: 2026-05-24T01:29:41Z
  tasks: 2/2
  tests_added: 8
  files_modified: 7
  files_created: 1
---

# Phase 28 Plan 03: Chart Axis & Age Display Fixes Summary

Integer-only Recharts axis ticks via allowDecimals={false} on 3 collection breakdown charts, plus formatAge/formatAgeNumber split to eliminate days-in-library number duplication on Buried Treasures

## Task Summary

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add allowDecimals={false} to chart axes | 42ba059 | 3 chart components + 3 test files |
| 2 | Fix formatAge number duplication | 46c94ce | buried-treasures-section.tsx + test |

## Changes Made

### Task 1: Integer-only chart axis ticks
- Added `allowDecimals={false}` to `XAxis` in DesignerBreakdownChart (horizontal bar, numeric axis)
- Added `allowDecimals={false}` to `XAxis` in GenreDistributionChart (horizontal bar, numeric axis)
- Added `allowDecimals={false}` to `YAxis` in SizeCategoryChart (vertical bar, numeric axis)
- Updated Recharts mocks in all 3 test files to capture `allowDecimals` prop
- Added 3 new test assertions verifying the prop is set to `false`

### Task 2: Days-in-library display fix
- Split `formatAge(days)` into two functions:
  - `formatAge(days)`: returns unit string only ("days", "months", "years")
  - `formatAgeNumber(days)`: returns the converted display number (days, months, or years)
- Updated template: line 84 now uses `formatAgeNumber(t.daysInLibrary).toLocaleString()` for the large number, and line 87 uses `formatAge(t.daysInLibrary)` for the unit label
- Before: "200" then "6 months in library" (number duplication)
- After: "6" then "months in library" (correct)
- Created buried-treasures-section.test.tsx with 5 tests covering empty state, item count, and age display at days/months/years boundaries

## Deviations from Plan

None - plan executed exactly as written.

## Verification

All 21 tests pass across 4 test files:
- designer-breakdown-chart.test.tsx: 6 tests
- genre-distribution-chart.test.tsx: 5 tests
- size-category-chart.test.tsx: 5 tests
- buried-treasures-section.test.tsx: 5 tests

## TDD Gate Compliance

Both tasks followed RED/GREEN cycle:
- Task 1: test(28-03) mock updates + assertions (RED) -> feat(28-03) allowDecimals addition (GREEN) -- combined in single commit
- Task 2: test(28-03) new test file with 5 tests (RED) -> fix(28-03) formatAge split (GREEN) -- combined in single commit
