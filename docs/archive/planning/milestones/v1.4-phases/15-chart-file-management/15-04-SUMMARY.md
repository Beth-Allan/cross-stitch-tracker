---
phase: 15-chart-file-management
plan: 04
subsystem: data-migration
tags: [schema-migration, cleanup, column-removal]
dependency_graph:
  requires: [ChartFile-model, chart-file-actions, ChartFileUpload-component, overview-tab-files-integration]
  provides: [clean-schema-no-digitalWorkingCopyUrl, migration-script, ChartWithProject-files-type]
  affects: [prisma-schema, upload-actions, chart-types, test-factories]
tech_stack:
  added: []
  patterns: [idempotent-sql-migration, type-narrowing-for-relations]
key_files:
  created:
    - src/scripts/migrate-working-copies.sql
  modified:
    - prisma/schema.prisma
    - src/lib/actions/upload-actions.ts
    - src/lib/actions/upload-actions.test.ts
    - src/__tests__/mocks/factories.ts
    - src/types/chart.ts
    - src/components/features/charts/project-detail/types.ts
    - src/components/features/gallery/project-gallery.test.tsx
    - src/components/features/gallery/gallery-utils.test.ts
    - src/components/features/charts/use-draft-persistence.test.ts
    - src/components/features/charts/chart-merged-form.test.tsx
  deleted:
    - src/components/features/charts/form-primitives/file-upload.tsx
decisions:
  - "Migration script uses NOT EXISTS guard for idempotency -- safe to run multiple times"
  - "ChartWithProject type extended with files relation rather than creating separate type"
metrics:
  duration: 452s
  completed: "2026-05-17T01:17:41Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 0
  files_changed: 12
---

# Phase 15 Plan 04: Data Migration & Cleanup Summary

Idempotent SQL migration script for existing digitalWorkingCopyUrl data, schema column removal, and full codebase cleanup of all stale references.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Schema column removal + migration script | ea1f31d | Removed digitalWorkingCopyUrl from Chart model, added idempotent SQL migration script |
| 2 | Remove all stale references and old component | 4bb6928 | Cleaned 10 files, deleted old file-upload.tsx, updated types and test fixtures |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ChartWithProject type missing files relation**
- **Found during:** Task 2
- **Issue:** After removing digitalWorkingCopyUrl, project-detail-page.tsx had a type error because ChartWithProject didn't include the `files` relation needed by OverviewTab
- **Fix:** Added `ChartFileData` type and `files: ChartFileData[]` to ChartWithProject in src/types/chart.ts
- **Files modified:** src/types/chart.ts
- **Commit:** 4bb6928

**2. [Rule 1 - Bug] Fixed use-draft-persistence.test.ts stale field reference**
- **Found during:** Task 2
- **Issue:** Test still referenced `digitalFileUrl` (old field name) instead of `uploadedFiles` (new field from plan 02)
- **Fix:** Replaced `digitalFileUrl: null` with `uploadedFiles: []` in test fixture
- **Files modified:** src/components/features/charts/use-draft-persistence.test.ts
- **Commit:** 4bb6928

**3. [Rule 1 - Bug] Fixed chart-merged-form.test.tsx button name mismatch**
- **Found during:** Task 2
- **Issue:** Test searched for "Upload Working Copy" (singular, from old FileUpload component) but new ChartFileUpload renders "Upload Working Copies" (plural)
- **Fix:** Updated test assertion to match plural button text
- **Files modified:** src/components/features/charts/chart-merged-form.test.tsx
- **Commit:** 4bb6928

### Adjustments

**Database push deferred:** `prisma db push --accept-data-loss` cannot run in worktree (no DATABASE_URL). Schema validated + client regenerated. Push required in main environment before deploy.

**Migration script execution deferred:** SQL migration script written but cannot execute against database in worktree. Must run before `prisma db push` in production.

## Execution Order (for deploy)

1. Run `src/scripts/migrate-working-copies.sql` against production database
2. Verify ChartFile record count matches Chart records with non-null digitalWorkingCopyUrl
3. Run `npx prisma db push --accept-data-loss` to drop the column

## Known Stubs

None -- all code is fully functional and wired.

## Threat Mitigations Verified

| Threat ID | Mitigation | Verified |
|-----------|-----------|----------|
| T-15-12 | Migration copies URL strings to ChartFile table; same access controls apply | Yes (SQL uses same chartId, ownership enforced at action layer) |
| T-15-13 | Run data migration BEFORE column drop; idempotent with NOT EXISTS guard | Yes (script includes idempotency check, deploy order documented) |

## Self-Check: PASSED
