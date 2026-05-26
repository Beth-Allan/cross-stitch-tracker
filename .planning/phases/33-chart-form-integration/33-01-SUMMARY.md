---
phase: 33-chart-form-integration
plan: 01
subsystem: charts
tags: [series, form-hook, validation, inline-dialog, tdd]
dependency_graph:
  requires: [phase-31-series-schema]
  provides: [seriesId-in-chart-form, handleAddSeries-callback, inline-name-dialog-custom-props]
  affects: [chart-create, chart-edit, chart-merged-form]
tech_stack:
  added: []
  patterns: [inline-entity-creation, auto-populate-designer]
key_files:
  created: []
  modified:
    - src/lib/validations/chart.ts
    - src/lib/actions/chart-actions.ts
    - src/components/features/charts/use-chart-form.ts
    - src/components/features/charts/use-chart-form.test.tsx
    - src/components/features/charts/inline-name-dialog.tsx
    - src/components/features/charts/inline-name-dialog.test.tsx
decisions:
  - "seriesId placed after designerId in validation schema, matching field order"
  - "handleAddSeries auto-populates designerId from current form values (D-04)"
  - "InlineNameDialog uses submitLabel/requiredError with backward-compatible defaults"
metrics:
  duration: 6m 33s
  completed: 2026-05-26
---

# Phase 33 Plan 01: Data Plumbing Summary

seriesId wired through chart validation, actions, and form hook with auto-populate designer passthrough

## Changes Made

### Task 1: RED -- Failing tests + validation/action updates
- Added `seriesId: z.string().nullable().default(null)` to chartFormSchema.chart
- Added `seriesId: chart.seriesId` to both createChartAndProject (line 40) and updateChart (line 263)
- Added 4 tests for `handleAddSeries`: success, designer passthrough, server error, null designer
- Added 2 tests for InlineNameDialog: custom submitLabel, custom requiredError
- Commit: `193da47`

### Task 2: GREEN -- Implementation
- `ChartFormValues`: added `seriesId: string | null`
- `UseChartFormOptions`: added `series?: SeriesWithStats[]`
- `buildInitialValues`: maps `data.seriesId` for edit mode, defaults to `null` for create
- `submitForm`: includes `seriesId` in formData.chart
- `handleAddSeries`: calls `createSeries({ name, designerId: values.designerId })`, constructs `SeriesWithStats`, appends to `seriesList`, selects new ID
- `InlineNameDialog`: accepts `submitLabel` (default "Add") and `requiredError` (default "Name is required")
- Commit: `94e7158`

## Deviations from Plan

None -- plan executed exactly as written.

## Test Results

- 22 tests passing (12 hook + 10 dialog)
- 6 new tests added (4 hook + 2 dialog)
- All pre-existing tests continue to pass

## Verification

- `seriesId` in chartFormSchema: confirmed at line 10
- `seriesId` in chart-actions create: confirmed at line 40
- `seriesId` in chart-actions update: confirmed at line 263
- `handleAddSeries` and `seriesList` exported from useChartForm: confirmed at lines 474, 477
