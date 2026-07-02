---
phase: 35-error-handling-comment-cleanup
plan: 03
subsystem: ui
tags: [comment-conventions, jsx, code-quality, lint]

requires:
  - phase: 35-error-handling-comment-cleanup
    provides: "Plans 01-02 completed (error handling + test comment cleanup)"
provides:
  - "Zero JSX section-label comments in render blocks across 59 TSX files"
  - "Updated comment-conventions.md with loading.tsx skeleton label exception"
  - "WHY-comments relocated from {/* */} to { // } format"
affects: [comment-conventions, code-quality]

tech-stack:
  added: []
  patterns:
    - "JSX WHY-comments use { // comment } block format instead of {/* */}"
    - "eslint-disable-next-line directives remain as {/* */} (ESLint JSX requirement)"

key-files:
  created: []
  modified:
    - ".claude/rules/comment-conventions.md"
    - "59 TSX component files across src/components/ and src/app/"

key-decisions:
  - "eslint-disable-next-line directives kept as {/* */} -- ESLint requires this format in JSX"
  - "WHY-comments relocated to { // comment } block syntax rather than deleted"
  - "loading.tsx files exempted from JSX comment prohibition (skeleton labels)"

patterns-established:
  - "{ // WHY-comment } block syntax for JSX WHY-comments that cannot move outside render blocks"

requirements-completed: [QUAL-02]

duration: 10min
completed: 2026-07-01
---

# Phase 35 Plan 03: JSX Comment Cleanup Summary

**334 JSX section-label comments removed from 59 TSX files, 4 WHY-comments relocated to // format, convention updated with loading.tsx exception**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-01T23:13:19Z
- **Completed:** 2026-07-01T23:23:00Z
- **Tasks:** 2
- **Files modified:** 60

## Accomplishments
- Removed 334 JSX `{/* Section Label */}` comments from render blocks across 59 TSX files
- Relocated 4 genuine WHY-comments to `{ // }` block format (chart-merged-form Popover init, spotlight-card amber accent, fabric-catalog hydration, chart.tsx ChartStyle safety)
- Updated comment-conventions.md with loading.tsx skeleton label exception (per D-07)
- Preserved all 4 eslint-disable-next-line functional directives (cannot be converted to // format in JSX)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove JSX comments from high-volume files and update convention** - `f2b186f` (style)
2. **Task 2: Remove JSX comments from remaining files and verify zero total** - `7fea959` (style)

## Files Created/Modified
- `.claude/rules/comment-conventions.md` - Added loading.tsx exception section
- `src/components/features/gallery/gallery-card.tsx` - Removed 19 JSX comments (highest count)
- `src/components/features/gallery/gallery-grid.tsx` - Removed 16 JSX comments
- `src/components/features/designers/designer-detail.tsx` - Removed 13 JSX comments
- `src/components/features/supplies/supply-catalog.tsx` - Removed 12 JSX comments
- `src/components/features/charts/fabric-requirements-tab.tsx` - Removed 10 JSX comments
- `src/components/features/fabric/fabric-catalog.tsx` - Removed 10 + relocated WHY-comment
- `src/components/features/charts/chart-merged-form.tsx` - Relocated multi-line WHY-comment
- `src/components/features/dashboard/spotlight-card.tsx` - Relocated WHY-comment (amber accent)
- `src/components/ui/chart.tsx` - Relocated framework WHY-comment (ChartStyle safety)
- 50 additional TSX files with 1-9 comments each removed

## Decisions Made
- **eslint-disable preservation:** ESLint requires `{/* eslint-disable-next-line */}` format in JSX -- `// eslint-disable-next-line` inside `{ }` blocks would target the closing brace, not the next JSX element. Kept all 4 as-is.
- **WHY-comment relocation format:** Used `{ // comment }` block syntax for WHY-comments that must live inside JSX render blocks. This satisfies the zero `{/*` convention while remaining syntactically valid JSX.
- **loading.tsx exemption:** Skeleton files have no code logic; JSX comments are the only navigation aid. Documented as convention exception per D-07.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] eslint-disable-next-line directives cannot be converted**
- **Found during:** Task 1 (JSX comment removal)
- **Issue:** Plan verification expected zero `{/*` comments, but 4 eslint-disable-next-line directives in JSX require `{/* */}` format. Converting to `{ // }` would break the ESLint directive targeting.
- **Fix:** Preserved all 4 eslint-disable directives. They are functional lint directives, not section labels.
- **Files:** series-detail.tsx, genre-detail.tsx, designer-detail.tsx, cover-image-upload.tsx
- **Verification:** ESLint passes, no `@next/next/no-img-element` warnings

---

**Total deviations:** 1 auto-fixed (Rule 2 - functional directive preservation)
**Impact on plan:** Minimal. All section-label comments removed. Only functional ESLint directives remain.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- QUAL-02 (zero JSX section labels) fully satisfied
- Comment conventions documented with all exceptions
- All 2399 tests pass, build succeeds
- Phase 35 complete (all 3 plans done)

---
## Self-Check: PASSED

- SUMMARY.md exists
- Both commits verified (f2b186f, 7fea959)
- comment-conventions.md updated with loading.tsx exception
- Zero non-eslint JSX comments in src/
- 2399 tests passing, build successful

---
*Phase: 35-error-handling-comment-cleanup*
*Completed: 2026-07-01*
