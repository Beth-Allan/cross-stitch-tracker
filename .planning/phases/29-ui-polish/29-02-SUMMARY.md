---
phase: 29-ui-polish
plan: 02
subsystem: project-detail
tags: [calculator-card, supplies-tab, sort-fix, fabric-options]
dependency_graph:
  requires: []
  provides: [calculator-card-on-supplies-tab, fabric-options-threading]
  affects: [supplies-tab, project-detail-page, chart-page]
tech_stack:
  uses: [react, next-app-router, server-actions, zod]
  patterns: [optimistic-ui, server-component-data-threading]
key-files:
  created: []
  modified:
    - src/components/features/charts/project-detail/supplies-tab.tsx
    - src/components/features/charts/project-detail/supplies-tab.test.tsx
    - src/components/features/charts/project-detail/project-detail-page.tsx
    - src/app/(dashboard)/charts/[id]/page.tsx
---

## Self-Check: PASSED

## What Was Built

Wired the CalculatorCard component into the project detail Supplies tab with database persistence via `updateProjectSettings`, and threaded fabric options through the component hierarchy.

## Task Results

### Task 1: Tests for CalculatorCard integration
- 4 new tests in supplies-tab.test.tsx covering CalculatorCard rendering and prop threading
- Tests verify CalculatorCard renders when fabricOptions and chartId are provided
- Tests verify CalculatorCard does not render when props are missing

### Task 2: Wire CalculatorCard, thread fabric data
- CalculatorCard imported and rendered above supply table in SuppliesTab
- Local state for calcParams initialized from project values (strandCount, overCount, wastePercent)
- Optimistic persistence via updateProjectSettings with rollback on failure
- page.tsx calls getUnassignedFabrics in Promise.all and transforms to FabricOption shape
- ProjectDetailPage threads fabricOptions and chart.id to SuppliesTab

## Deviations

1. **fabricCount schema addition skipped** — Plan instructed adding `fabricCount` to `updateProjectSettingsSchema`, but `fabricCount` is not a column on the Project model. It derives from `Fabric.count`. CalculatorCard uses it for local calculation only.
2. **BUG-03 sort confirmed working** — Investigation showed `sortSupplyRows` correctly handles both "Added" (insertion order) and "A-Z" (alphabetical with numeric) modes. No code change needed.

## Test Results

2246 tests passing across 198 files (0 regressions)
