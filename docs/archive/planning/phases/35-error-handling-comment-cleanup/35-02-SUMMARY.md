---
phase: 35-error-handling-comment-cleanup
plan: 02
subsystem: code-quality
tags: [comments, conventions, cleanup, section-markers]

requires:
  - phase: 35-01
    provides: error handling fixes completed before comment cleanup
provides:
  - Zero section markers in non-type-bundle production and test files
  - Zero WHAT-comments in chart form files
  - Comment convention compliance across codebase
affects: [all future phases touching listed files]

tech-stack:
  added: []
  patterns:
    - "Section markers (// --- ... ---) reserved exclusively for type-bundle files"
    - "WHAT-comments removed; only WHY-comments allowed per comment-conventions.md"

key-files:
  created: []
  modified:
    - src/components/features/charts/chart-merged-form.tsx
    - src/components/features/charts/use-chart-form.ts
    - src/__tests__/mocks/factories.ts
    - 23 production files (section markers removed)
    - 25 test files (section markers removed)

key-decisions:
  - "Preserved WHY-comments: unmount auto-save scope, focus restore, type-safe setter, stale fabric detection"
  - "Removed GAP 10 planning doc reference from ref sync comment"
  - "Kept test step comments that provide context (mock rationale, arithmetic explanations) vs removing pure WHAT-labels"

patterns-established:
  - "Comment convention enforcement: no section markers outside src/types/, gallery-types.ts, project-detail/types.ts"

requirements-completed: [QUAL-03]

duration: 7min
completed: 2026-07-01
---

# Phase 35 Plan 02: Comment Cleanup Summary

**Removed 190+ section markers from 48 non-type-bundle files and 19 WHAT-comments from chart form files, achieving full comment convention compliance**

## Performance

- **Duration:** 7 min
- **Started:** 2026-07-01T23:02:50Z
- **Completed:** 2026-07-01T23:09:34Z
- **Tasks:** 2
- **Files modified:** 50

## Accomplishments
- Removed 90+ section markers from 23 production files (components, actions, utilities)
- Removed 100+ section markers from 25 test files and factories.ts mock file
- Removed 11 WHAT-comments from chart-merged-form.tsx and 8 from use-chart-form.ts
- Removed 5 WHAT-comments from creation-flow-adapter.test.ts test bodies
- Preserved all WHY-comments explaining non-obvious constraints and design decisions
- Preserved all type-bundle section markers (src/types/*.ts, gallery-types.ts, project-detail/types.ts)
- All 2399 tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove section markers from production files and WHAT-comments from chart form** - `cbf635a` (style)
2. **Task 2: Remove section markers from test files and WHAT-comments from test bodies** - `15fccb1` (style)

## Files Created/Modified
- `src/components/features/charts/chart-merged-form.tsx` - 11 WHAT-comments removed, 4 WHY-comments preserved
- `src/components/features/charts/use-chart-form.ts` - 8 WHAT-comments removed, 1 WHY-comment preserved
- `src/components/features/gallery/gallery-utils.ts` - 8 section markers removed
- `src/components/features/gallery/gallery-grid.tsx` - 7 section markers removed
- `src/components/features/sessions/log-session-modal.tsx` - 14 section markers removed
- `src/lib/actions/session-actions.ts` - 9 section markers removed
- `src/lib/actions/supply-actions.ts` - 6 section markers removed
- `src/lib/actions/project-dashboard-actions.ts` - 6 section markers removed
- `src/components/features/supply-table/creation-flow-adapter.test.ts` - 14 section markers + 5 WHAT-comments removed
- `src/__tests__/mocks/factories.ts` - 7 section markers removed
- 40 additional files with section markers removed (see commits for full list)

## Decisions Made
- Preserved inner WHY-comment "Clear errors for this field -- check both chart.X and project.X paths" while removing outer WHAT-comment "Clear field error when value changes"
- Removed "GAP 10" planning doc reference from ref sync comment (violates comment-conventions.md) while keeping the WHY explanation about stale closures
- Kept test arithmetic comments (e.g., "15% = 1500/10000") as they explain WHY assertion values are expected
- Kept mock setup rationale comments (e.g., "Mock SearchableSelect since it uses Popover/Command internals") as WHY-comments

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed planning doc reference (GAP 10)**
- **Found during:** Task 1 (chart-merged-form.tsx comment cleanup)
- **Issue:** Comment "Keep refs in sync with latest values for unmount auto-save (GAP 10)" contained a planning doc reference violating comment-conventions.md
- **Fix:** Removed the WHAT portion and planning reference, kept only the WHY explanation about stale closures
- **Files modified:** src/components/features/charts/chart-merged-form.tsx
- **Committed in:** cbf635a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Minor additional cleanup within scope. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Comment convention is now fully enforced across all non-type-bundle files
- Future phases should maintain convention: no section markers outside type-bundle files
- Backlog items 999.29, 999.30, 999.57, 999.84 can be closed (section markers and chart form WHAT-comments now cleaned)

---
*Phase: 35-error-handling-comment-cleanup*
*Completed: 2026-07-01*
