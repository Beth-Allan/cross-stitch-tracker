---
phase: 07-project-detail-experience
plan: 06
subsystem: project-detail
tags: [page-wiring, composition, schema-push, integration]
dependency_graph:
  requires: [07-01, 07-02, 07-03, 07-04, 07-05]
  provides: [project-detail-page, schema-synced-to-db]
  affects: [charts/[id]/page.tsx, project-detail-types]
tech_stack:
  added: []
  patterns: [server-client-composition, status-state-lifting, schema-push]
key_files:
  created:
    - src/components/features/charts/project-detail/project-detail-page.tsx
    - src/components/features/charts/project-detail/project-detail-page.test.tsx
  modified:
    - src/app/(dashboard)/charts/[id]/page.tsx
    - src/components/features/charts/project-detail/types.ts
    - src/components/features/charts/project-detail/overview-tab.test.tsx
decisions:
  - "ProjectDetailPage accepts ChartWithProject (full Prisma type) not the restricted ProjectDetailProps['chart'] -- avoids lossy type mapping at page boundary"
  - "Status state lifted into ProjectDetailPage so overview tab reorders sections on status change without full page reload"
  - "Old ChartDetail import removed from page.tsx but file not deleted (may be referenced by other routes)"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-15T06:04:00Z"
  tasks: 1
  tests_added: 9
  tests_total: 864
  files_changed: 5
---

# Phase 07 Plan 06: Page Wiring & Schema Push Summary

Server Component page wired to new ProjectDetailPage composition component with schema pushed to Neon database, replacing old ChartDetail with hero + tabs + overview + supplies layout.

## What Was Built

### Task 1: Schema push + page wiring + composition component

- **Schema push**: `prisma db push` synced 4 new fields to Neon DB (strandCount, overCount, wastePercent on Project; isNeedOverridden on ProjectThread). All fields have defaults, no data loss.
- **ProjectDetailPage** client component created: composes ProjectDetailHero, ProjectTabs, OverviewTab, and SuppliesTab. Lifts status state so overview sections reorder on status change via `router.refresh()`.
- **page.tsx updated**: Server Component now imports ProjectDetailPage instead of ChartDetail. Passes chart, imageUrls, and supplies (from getProjectSupplies).
- **Null project handling**: Supplies tab shows "No project linked" message when chart has no project or supplies are null.
- **9 integration tests**: Hero rendering, tabs composition, overview/supplies data passing, imageUrls forwarding, onStatusChange callback, status update propagation, null project states.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed phantom digitalWorkingCopyName from ProjectDetailProps**
- **Found during:** Task 1 (build verification)
- **Issue:** `ProjectDetailProps["chart"]` included `digitalWorkingCopyName: string | null` which doesn't exist in the Prisma schema. The OverviewTab's type signature required it but never used it, causing a type error when passing actual Prisma data.
- **Fix:** Removed the field from types.ts and the test mock in overview-tab.test.tsx
- **Files modified:** types.ts, overview-tab.test.tsx
- **Commit:** 93780b8

## Verification

- `npx prisma db push` -- exited 0, schema synced
- `npm run build` -- TypeScript clean, no errors
- `npx vitest run` -- 864 tests passing, 0 failures
- Task 2 (visual verification) pending human checkpoint

## Self-Check: PENDING

Task 2 (checkpoint:human-verify) not yet executed. Self-check will complete after visual verification.
