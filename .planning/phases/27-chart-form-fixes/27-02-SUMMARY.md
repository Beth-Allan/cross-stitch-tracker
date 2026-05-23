---
phase: 27-chart-form-fixes
plan: 02
subsystem: ui
tags: [designer, thumbnails, supply-table, column-width, prisma-query]

requires:
  - phase: none
    provides: existing designer detail and supply table components
provides:
  - "coverImageUrl fallback on designer detail chart thumbnails"
  - "widened Need column (16%) in supply table for 3-digit skeins display"
affects: [designer-detail, supply-table]

tech-stack:
  added: []
  patterns: ["thumbnail fallback pattern: coverThumbnailUrl ?? coverImageUrl"]

key-files:
  created: []
  modified:
    - src/types/designer.ts
    - src/lib/actions/designer-actions.ts
    - src/components/features/designers/designer-detail.tsx
    - src/components/features/supply-table/supply-table.tsx
    - src/__tests__/mocks/factories.ts

key-decisions:
  - "coverImageUrl fallback for thumbnails: when thumbnail hasn't been generated yet, show full cover image instead of placeholder"
  - "3% column width redistribution: Colour 44->41%, Need 13->16% to prevent skeins truncation"

patterns-established:
  - "Thumbnail fallback: prefer coverThumbnailUrl, fall back to coverImageUrl, then placeholder"

requirements-completed: [BUG-04, BUG-06]

duration: 4min
completed: 2026-05-21
---

# Phase 27 Plan 02: Display Fixes Summary

**Designer detail coverImageUrl fallback for missing thumbnails and Need column widened from 13% to 16% for full skeins display**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-21T02:58:20Z
- **Completed:** 2026-05-21T03:02:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- BUG-04: Designer detail pages now fall back to full cover image when thumbnail URL is null, preventing blank thumbnails during the thumbnail generation window
- BUG-06: Need column widened from 13% to 16% (Colour narrowed from 44% to 41%), fully displaying 3-digit skeins + "sk" label + Sparkles icon
- Added `coverImageUrl` to `DesignerChart` type, `getDesigner` query, and data mapping
- 7 new tests across 3 files, all 2183 tests passing, build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Tests for designer thumbnails and Need column width** - `8cb80fa` (test)
2. **Task 2: Fix designer thumbnails and widen Need column** - `4409168` (feat)

## Files Created/Modified
- `src/types/designer.ts` - Added `coverImageUrl: string | null` to DesignerChart type
- `src/lib/actions/designer-actions.ts` - Added `coverImageUrl: true` to getDesigner charts.select and data mapping
- `src/components/features/designers/designer-detail.tsx` - Thumbnail fallback: `coverThumbnailUrl ?? coverImageUrl`
- `src/components/features/supply-table/supply-table.tsx` - Column widths: Colour 44->41%, Need 13->16%
- `src/__tests__/mocks/factories.ts` - Added `coverImageUrl: null` to createMockDesignerChart
- `src/components/features/designers/designer-detail.test.tsx` - 3 new tests for BUG-04 thumbnails
- `src/lib/actions/designer-actions.test.ts` - 2 new tests for coverThumbnailUrl/coverImageUrl in query
- `src/components/features/supply-table/supply-table.test.tsx` - 2 new tests for BUG-06 column widths

## Decisions Made
- **coverImageUrl fallback**: When `coverThumbnailUrl` is null but `coverImageUrl` exists, the designer detail page now shows the full cover image as a thumbnail. This handles the race condition where a cover image has been uploaded but the thumbnail hasn't been generated yet. The full image is already served on the chart detail page, so no new data is exposed.
- **3% width redistribution**: Moved 3% from Colour (44->41%) to Need (13->16%). Colour column uses CSS `truncate` on content so the narrower width is handled gracefully. All other columns remain unchanged.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BUG-04 and BUG-06 fixes are complete and tested
- Manual verification recommended: navigate to /designers/{id} to confirm thumbnails, and add supplies with 3-digit skeins to confirm no truncation

## Self-Check: PASSED

---
*Phase: 27-chart-form-fixes*
*Completed: 2026-05-21*
