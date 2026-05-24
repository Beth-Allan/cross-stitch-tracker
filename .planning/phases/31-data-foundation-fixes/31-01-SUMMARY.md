---
phase: 31-data-foundation-fixes
plan: 01
subsystem: series-data-model
tags: [prisma, types, validation, testing, tdd]
dependency_graph:
  requires: []
  provides: [series-model, series-types, series-validation, series-factory]
  affects: [chart-model, designer-model, test-factories]
tech_stack:
  added: []
  patterns: [zod-validation, prisma-model, test-factory]
key_files:
  created:
    - src/types/series.ts
    - src/lib/validations/series.ts
    - src/lib/validations/series.test.ts
  modified:
    - prisma/schema.prisma
    - src/__tests__/mocks/factories.ts
    - src/components/features/gallery/gallery-utils.test.ts
    - src/components/features/gallery/project-gallery.test.tsx
decisions:
  - "Series model mirrors Designer pattern: cuid ID, @unique name, nullable fields, timestamps"
  - "SeriesProgress type uses number|null for totalCount to support open-ended series"
  - "seriesId: null added to createMockChart and inline test chart objects to prevent TS regressions"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-24T23:07:46Z"
  tasks_completed: 3
  tasks_total: 3
  test_count_before: 2283
  test_count_after: 2289
  files_created: 3
  files_modified: 4
---

# Phase 31 Plan 01: Series Schema, Types, Validation & Factories Summary

Series Prisma model with @unique name, nullable designer FK, and dual-progress type contracts backed by 6 Zod validation tests

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Series Prisma schema, types, and validation | 353d3ec | Series model in schema, SeriesProgress/SeriesWithStats/SeriesDetail types, seriesSchema with 6 passing tests |
| 2 | Test factory and mock Prisma updates | 770c0c8 | createMockSeries factory, series mock Prisma methods, Series import |
| 3 | Database schema push | N/A (env) | prisma validate confirms schema valid; db push deferred to main environment |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added seriesId: null to createMockChart and inline test objects in Task 1**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Adding `seriesId String?` to Chart model made the Prisma-generated Chart type require `seriesId`, breaking `createMockChart` and 2 gallery test files that build Chart objects inline
- **Fix:** Added `seriesId: null` to createMockChart return object and to inline chart objects in gallery-utils.test.ts and project-gallery.test.tsx
- **Files modified:** src/__tests__/mocks/factories.ts, src/components/features/gallery/gallery-utils.test.ts, src/components/features/gallery/project-gallery.test.tsx
- **Commit:** 353d3ec (bundled with Task 1 since it was blocking TypeScript compilation)

**2. [Rule 3 - Blocking] Task 3 db push skipped due to missing DATABASE_URL in worktree**
- **Found during:** Task 3
- **Issue:** Worktree environment lacks .env.local with DATABASE_URL; prisma db push requires database connection
- **Resolution:** `prisma validate` confirms schema is syntactically valid. db push must run from main environment after merge where .env.local is present
- **Action needed:** Run `npx prisma db push` after merging to feature/phase-31

## Verification Results

- `npx tsc --noEmit` -- exits 0, zero errors
- `npx vitest run src/lib/validations/series.test.ts` -- 6/6 tests pass
- `npm test` -- 2289/2289 tests pass (202 test files), 6 new tests added
- `npx prisma validate` -- schema valid

## TDD Gate Compliance

- RED gate: seriesSchema tests written and confirmed to fail (import error, module doesn't exist)
- GREEN gate: seriesSchema implementation created, all 6 tests pass
- Commits: test(31-01) at 353d3ec (combined RED+GREEN due to import dependency), feat(31-01) at 770c0c8

## Self-Check: PASSED

- All 3 created files exist (series.ts types, series.ts validation, series.test.ts)
- All 4 modified files confirmed (schema.prisma, factories.ts, gallery-utils.test.ts, project-gallery.test.tsx)
- Both commits found in git log (353d3ec, 770c0c8)
- Schema contains "model Series" (1 occurrence)
- Factory contains "createMockSeries" (1 occurrence)
- TypeScript compiles cleanly, 2289 tests pass
