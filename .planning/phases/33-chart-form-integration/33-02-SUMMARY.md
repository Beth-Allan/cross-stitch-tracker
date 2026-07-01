---
phase: 33-chart-form-integration
plan: 02
subsystem: charts
tags: [series, form-ui, searchable-select, inline-dialog]
dependency_graph:
  requires: [33-01-data-plumbing]
  provides: [series-field-on-chart-form, series-inline-creation-ui]
  affects: [chart-create-page, chart-edit-page, chart-merged-form]
tech_stack:
  added: []
  patterns: [searchable-select-with-inline-dialog]
key_files:
  created: []
  modified:
    - src/app/(dashboard)/charts/new/page.tsx
    - src/app/(dashboard)/charts/[id]/edit/page.tsx
    - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
    - src/components/features/charts/chart-merged-form.tsx
decisions:
  - "Series field placed between Cover Image and Genres per D-01"
  - "InlineNameDialog uses title 'Add New Series', submitLabel 'Add Series', requiredError 'Series name is required' per D-03"
  - "seriesId added to draft hydration defaultValues to satisfy ChartFormValues type"
metrics:
  duration: 3m 11s
  completed: 2026-05-26
---

# Phase 33 Plan 02: Form UI Wiring Summary

Series SearchableSelect + InlineNameDialog wired into chart form between Cover Image and Genres on both create and edit pages

## Changes Made

### Task 1: Update chart pages to fetch and pass series data
- Added `getSeriesWithStats` import + call to Promise.all in `charts/new/page.tsx` (6th position)
- Added `getSeriesWithStats` import + call to Promise.all in `charts/[id]/edit/page.tsx` (6th position)
- Added `series: SeriesWithStats[]` to `EditChartPageClientProps` interface and threaded through to `ChartMergedForm`
- Commit: `111d588`

### Task 2: Wire series SearchableSelect and InlineNameDialog into chart form
- Added `series: SeriesWithStats[]` to `ChartMergedFormProps` interface
- Added `series` to destructured props and `useChartForm` call
- Added `seriesDialogOpen`/`seriesDialogName` state for inline creation dialog
- Added `seriesOptions` computed from `form.seriesList`
- Added Series FormField JSX between Cover Image and Genres with SearchableSelect + InlineNameDialog
- Added `seriesId: null` to draft hydration `defaultValues` to fix type error (Rule 3 -- blocking type mismatch)
- Commit: `a62a514`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added seriesId to draft hydration defaultValues**
- **Found during:** Task 2
- **Issue:** `ChartFormValues` now requires `seriesId` (added in Plan 01), but the inline `defaultValues` object in draft hydration didn't include it, causing a TypeScript error
- **Fix:** Added `seriesId: null` to the defaultValues literal
- **Files modified:** src/components/features/charts/chart-merged-form.tsx
- **Commit:** a62a514

## Verification

- `npm run build` succeeds with no errors
- `getSeriesWithStats` imported in both chart pages (2 occurrences each)
- `series: SeriesWithStats[]` in ChartMergedFormProps confirmed
- `Select series...` placeholder in chart-merged-form.tsx confirmed
- InlineNameDialog configured with D-03 copy: "Add New Series" / "Add Series" / "Series name is required"
