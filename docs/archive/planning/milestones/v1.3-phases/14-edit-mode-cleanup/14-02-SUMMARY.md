---
phase: 14-edit-mode-cleanup
plan: 02
subsystem: charts
tags: [edit-mode, kebab-menu, form-extension, rewire]
dependency_graph:
  requires: [14-01]
  provides: [edit-mode-merged-form, list-row-kebab-menu, manage-supplies-link]
  affects: [edit-client, chart-list]
tech_stack:
  added: []
  patterns: [form-mode-switching, kebab-menu-with-confirmation-dialog]
key_files:
  created:
    - src/components/features/charts/manage-supplies-link.tsx
    - src/components/features/charts/manage-supplies-link.test.tsx
    - src/components/features/charts/list-row-kebab-menu.tsx
    - src/components/features/charts/list-row-kebab-menu.test.tsx
  modified:
    - src/components/features/charts/chart-merged-form.tsx
    - src/components/features/charts/chart-merged-form.test.tsx
    - src/components/features/charts/form-primitives/sticky-save-bar.tsx
    - src/components/features/charts/form-primitives/sticky-save-bar.test.tsx
    - src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
    - src/components/features/charts/chart-list.tsx
    - src/components/features/charts/chart-list.test.tsx
decisions:
  - "ListRowKebabMenu extracted as standalone component (not inline in chart-list) for testability and reuse"
  - "Activity wrapper stays visible in edit mode (no supply mode toggle) rather than rendering form directly without Activity"
  - "ChartList props simplified -- removed storageLocations, stitchingApps, unassignedFabrics (only needed by old ChartEditModal)"
metrics:
  duration: 10m 1s
  completed: 2026-05-16T20:21:07Z
  tasks_completed: 2
  tasks_total: 3
  files_created: 4
  files_modified: 7
  tests_before: 1523
  tests_after: 1549
---

# Phase 14 Plan 02: Edit Mode, Kebab Menu, Form Rewire Summary

Extended ChartMergedForm with mode/initialData props for full-page edit at /charts/[id]/edit, created ListRowKebabMenu with Edit/Delete actions, replaced ChartEditModal imports in edit-client.tsx and chart-list.tsx.

## What Was Done

### Task 1: Create ManageSuppliesLink, ListRowKebabMenu, extend StickySaveBar
**Commit:** 5724e50

- **ManageSuppliesLink** (server-safe): Renders "Supplies are managed on the project page" with "Go to Supplies" link to `/charts/[chartId]?tab=supplies`. ArrowRight icon, text-primary styling, hover:underline. No "use client" directive.
- **ListRowKebabMenu** (client): DropdownMenu with "Edit Project" (Pencil icon, router.push to edit page) and "Delete Project" (Trash2 icon, variant destructive, opens confirmation dialog). Delete handler calls router.refresh() (stays on list page) + toast.success("Project deleted"). 44px touch target on trigger. Follows HeroKebabMenu pattern exactly.
- **StickySaveBar**: Added optional `mode` prop. Edit mode shows "Save Changes"/"Saving..." and hides Save Draft button. Create mode (default) unchanged.
- **23 tests** covering all behaviors: 4 ManageSuppliesLink, 10 ListRowKebabMenu, 9 StickySaveBar (including 4 new edit mode tests).

### Task 2: Extend ChartMergedForm, rewire edit-client.tsx and chart-list.tsx
**Commit:** c17a91a

- **ChartMergedForm**: Added `mode?: "create" | "edit"` and `initialData?: ChartWithProject` props. Conditional heading ("Edit [Name]" vs "Add New Chart"), subtitle, back link ("/charts/[id]" vs "/charts"), ManageSuppliesLink (replaces milestone marker in edit mode), draft persistence gated on create mode only (no loadDraftV2/saveDraftV2 in edit), supply takeover section gated on `!isEdit`, StickySaveBar receives mode prop. onSuccess redirects to `/charts/[chartId]` with `toast.success("Changes saved")` in edit mode.
- **edit-client.tsx**: Complete rewrite -- replaced ChartEditModal import with ChartMergedForm. Renders `<ChartMergedForm mode="edit" initialData={chart} ...referenceData />`. Removed useRouter (navigation handled inside form's onSuccess).
- **chart-list.tsx**: Removed ChartEditModal import, editingChart/deletingChart useState, handleDelete/handleEditSuccess functions, delete confirmation dialog, inline Pencil/Trash buttons, useTransition/isPending. Replaced with ListRowKebabMenu in both ChartRow (desktop) and ChartCard (mobile). Simplified ChartListProps (removed storageLocations, stitchingApps, unassignedFabrics -- only needed by old modal). Net -54 lines.
- **9 new edit mode tests** in chart-merged-form.test.tsx, **6 updated tests** in chart-list.test.tsx.

### Task 3: Visual verification checkpoint
**Status:** Awaiting human verification

## Verification

- `npm run build` -- passed (zero errors)
- `npx vitest run` -- 126 test files, 1549 tests, all passing (+26 new tests vs Plan 01)
- ChartEditModal references removed from edit-client.tsx (0 occurrences) and chart-list.tsx (0 occurrences)
- ManageSuppliesLink renders in edit mode (confirmed via test)
- ListRowKebabMenu renders in both desktop and mobile list views (confirmed via test)
- Draft persistence confirmed skipped in edit mode (confirmed via test)
- All existing creation flow tests pass unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] ChartList has zero live importers**
- **Found during:** Task 2, chart-list.tsx analysis
- **Issue:** ChartList is not imported by any page (replaced by ProjectGallery in Phase 9). Still valid code that must compile.
- **Fix:** Proceeded with refactor as planned -- component still has its test file and must build cleanly. No action needed beyond the planned work.

## Self-Check: PASSED

- Commit 5724e50 found in git log
- Commit c17a91a found in git log
- All 4 created files exist on disk
- All 7 modified files exist on disk
- 14-02-SUMMARY.md exists on disk
