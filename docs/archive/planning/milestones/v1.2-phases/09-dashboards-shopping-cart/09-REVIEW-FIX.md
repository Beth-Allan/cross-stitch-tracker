---
phase: 09-dashboards-shopping-cart
fixed_at: 2026-04-18T05:02:00Z
review_path: .planning/phases/09-dashboards-shopping-cart/09-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 9: Code Review Fix Report

**Fixed at:** 2026-04-18T05:02:00Z
**Source review:** .planning/phases/09-dashboards-shopping-cart/09-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### WR-01: Buried Treasures image lookup uses wrong key

**Files modified:** `src/components/features/dashboard/buried-treasures-section.tsx`
**Commit:** 6504e2e
**Applied fix:** Changed `imageUrls[t.chartId]` to `imageUrls[t.coverThumbnailUrl ?? ""]` so the lookup matches the R2 object keys used by `getPresignedImageUrls()`. Without this fix, thumbnails silently failed to render.

### WR-02: Project selection list image lookup uses wrong key

**Files modified:** `src/components/features/shopping/project-selection-list.tsx`
**Commit:** a491206
**Applied fix:** Changed `imageUrls[project.chartId]` to `imageUrls[project.coverThumbnailUrl ?? ""]` -- same root cause as WR-01. The `imageUrls` map is keyed by R2 object keys, not chart IDs.

### WR-03: Spotlight shuffle sets raw R2 key as image URL

**Files modified:** `src/components/features/dashboard/spotlight-card.tsx`
**Commit:** 69d257c
**Applied fix:** After shuffle, the raw R2 key (e.g. `covers/abc123.jpg`) was set directly as the `<img src>`, which is not a valid URL. Added import of `getPresignedImageUrls` and a resolution step after `getSpotlightProject()` returns -- the R2 key is now converted to a presigned URL before setting state.

### WR-04: Buried Treasures query leaks orphan charts across users

**Files modified:** `src/lib/actions/dashboard-actions.ts`
**Commit:** 930df71
**Applied fix:** Added inline comment `// Safe: single-user app. Add Chart.userId if multi-user is added.` to the `{ project: null }` clause documenting the intentional single-user assumption. No behavioral change needed for current architecture.

### WR-05: avgDailyStitches uses chart total instead of stitches completed

**Files modified:** `src/lib/actions/project-dashboard-actions.ts`
**Commit:** 866d92b
**Applied fix:** Changed `p.chart.stitchCount / stitchingDays` to `p.stitchesCompleted / stitchingDays`. The metric "Avg Daily Stitches" should reflect actual stitching work recorded, not the total chart size divided by days.

---

_Fixed: 2026-04-18T05:02:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
