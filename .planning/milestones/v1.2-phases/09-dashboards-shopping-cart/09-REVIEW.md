---
phase: 09-dashboards-shopping-cart
reviewed: 2026-04-18T04:47:43Z
depth: standard
files_reviewed: 44
files_reviewed_list:
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/shopping/page.tsx
  - src/components/features/dashboard/bucket-project-row.tsx
  - src/components/features/dashboard/buried-treasures-section.tsx
  - src/components/features/dashboard/collection-stats-sidebar.test.tsx
  - src/components/features/dashboard/collection-stats-sidebar.tsx
  - src/components/features/dashboard/currently-stitching-card.test.tsx
  - src/components/features/dashboard/currently-stitching-card.tsx
  - src/components/features/dashboard/dashboard-tabs.test.tsx
  - src/components/features/dashboard/dashboard-tabs.tsx
  - src/components/features/dashboard/finished-project-card.tsx
  - src/components/features/dashboard/finished-tab.test.tsx
  - src/components/features/dashboard/finished-tab.tsx
  - src/components/features/dashboard/hero-stats.test.tsx
  - src/components/features/dashboard/hero-stats.tsx
  - src/components/features/dashboard/main-dashboard.tsx
  - src/components/features/dashboard/progress-breakdown-tab.test.tsx
  - src/components/features/dashboard/progress-breakdown-tab.tsx
  - src/components/features/dashboard/project-dashboard.tsx
  - src/components/features/dashboard/quick-add-menu.test.tsx
  - src/components/features/dashboard/quick-add-menu.tsx
  - src/components/features/dashboard/scrollable-row.test.tsx
  - src/components/features/dashboard/scrollable-row.tsx
  - src/components/features/dashboard/section-heading.tsx
  - src/components/features/dashboard/spotlight-card.test.tsx
  - src/components/features/dashboard/spotlight-card.tsx
  - src/components/features/shopping/fabric-tab.tsx
  - src/components/features/shopping/project-selection-list.tsx
  - src/components/features/shopping/quantity-control.test.tsx
  - src/components/features/shopping/quantity-control.tsx
  - src/components/features/shopping/shopping-cart.test.tsx
  - src/components/features/shopping/shopping-cart.tsx
  - src/components/features/shopping/shopping-for-bar.tsx
  - src/components/features/shopping/shopping-list-tab.tsx
  - src/components/features/shopping/supply-tab.tsx
  - src/components/shell/top-bar.tsx
  - src/lib/actions/dashboard-actions.test.ts
  - src/lib/actions/dashboard-actions.ts
  - src/lib/actions/project-dashboard-actions.test.ts
  - src/lib/actions/project-dashboard-actions.ts
  - src/lib/actions/shopping-cart-actions.test.ts
  - src/lib/actions/shopping-cart-actions.ts
  - src/types/dashboard.ts
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-04-18T04:47:43Z
**Depth:** standard
**Files Reviewed:** 44
**Status:** issues_found

## Summary

Phase 9 delivers a well-structured dashboard and shopping cart feature set across 44 files. Server actions properly use `requireAuth()`, Zod validation, and IDOR protection. The component architecture follows established patterns with colocated tests, correct server/client split, and semantic design tokens (with a few exceptions).

Key concerns:
- **Two image lookup key mismatches** that silently prevent thumbnails from rendering (warnings -- no crash, but broken images)
- **Spotlight shuffle sets raw R2 key as image URL** instead of a presigned URL, breaking the image after shuffle
- **`avgDailyStitches` uses chart total instead of stitches completed** -- semantically incorrect for projects where stitchesCompleted differs from stitchCount
- **Buried Treasures query includes charts with no project** without user ownership filter -- safe in single-user mode but a latent data isolation gap

## Warnings

### WR-01: Buried Treasures image lookup uses wrong key

**File:** `src/components/features/dashboard/buried-treasures-section.tsx:38`
**Issue:** `imageUrls[t.chartId]` looks up the image by chart ID, but the `imageUrls` map is keyed by R2 object keys (the `coverThumbnailUrl` values). The page component at `src/app/(dashboard)/page.tsx:25` collects `t.coverThumbnailUrl` as keys via `getPresignedImageUrls()`, so the lookup will always return `undefined` and no thumbnail will render.
**Fix:**
```tsx
// WRONG
const imgUrl = imageUrls[t.chartId] ?? null;

// CORRECT
const imgUrl = imageUrls[t.coverThumbnailUrl ?? ""] ?? null;
```

### WR-02: Project selection list image lookup uses wrong key

**File:** `src/components/features/shopping/project-selection-list.tsx:49`
**Issue:** Same pattern as WR-01. `imageUrls[project.chartId]` will never match because the shopping page collects `coverThumbnailUrl` values as presigned URL keys. Thumbnails will never appear in the project selection list.
**Fix:**
```tsx
// WRONG
const imageUrl = imageUrls[project.chartId];

// CORRECT
const imageUrl = imageUrls[project.coverThumbnailUrl ?? ""];
```

### WR-03: Spotlight shuffle sets raw R2 key as image URL

**File:** `src/components/features/dashboard/spotlight-card.tsx:37`
**Issue:** After shuffling, `setImageUrl(newProject.coverImageUrl ?? newProject.coverThumbnailUrl)` sets the raw R2 object key (e.g., `"covers/abc123.jpg"`) as the image source. The initial render uses presigned URLs resolved server-side, but the shuffle action returns only the raw project data without resolving presigned URLs. The `<img src>` will receive an invalid URL and the image will break after every shuffle.
**Fix:** The `getSpotlightProject` server action needs to return presigned URLs, or a separate presigned URL resolution step needs to happen after the shuffle. One approach:
```tsx
// In spotlight-card.tsx handleShuffle:
const newProject = await getSpotlightProject();
if (newProject) {
  setProject(newProject);
  // Fetch presigned URL for the new project's image
  const key = newProject.coverImageUrl ?? newProject.coverThumbnailUrl;
  if (key) {
    const urls = await getPresignedImageUrls([key]);
    setImageUrl(urls[key] ?? null);
  } else {
    setImageUrl(null);
  }
}
```
Alternatively, have `getSpotlightProject` return a resolved URL.

### WR-04: Buried Treasures query leaks orphan charts across users

**File:** `src/lib/actions/dashboard-actions.ts:131-137`
**Issue:** The `getBuriedTreasures` query uses `OR: [{ project: { userId, status: "UNSTARTED" } }, { project: null }]`. The `{ project: null }` clause returns all charts without an associated project regardless of which user "owns" them. Since `Chart` has no `userId` field, orphan charts are unowned and visible to all users. Currently safe because this is a single-user app, but becomes a data leak if multi-user is ever added.
**Fix:** Remove the `{ project: null }` clause, or add a `userId` field to the Chart model. For now, a code comment acknowledging the single-user assumption would suffice:
```ts
OR: [
  { project: { userId, status: "UNSTARTED" } },
  { project: null }, // Safe: single-user app. Add Chart.userId if multi-user is added.
],
```

### WR-05: avgDailyStitches uses chart total instead of stitches completed

**File:** `src/lib/actions/project-dashboard-actions.ts:220`
**Issue:** `avgDailyStitches` is computed as `p.chart.stitchCount / stitchingDays` -- using the total chart stitch count rather than `p.stitchesCompleted`. For a perfectly tracked finished project these values are close, but if `stitchesCompleted` differs from `stitchCount` (e.g., the user didn't track every stitch), the "average daily stitches" will be inaccurate. The metric label "Avg Daily" implies the rate of actual stitching work done.
**Fix:**
```ts
// WRONG: uses total chart stitches
avgDailyStitches: stitchingDays > 0
  ? Math.round(p.chart.stitchCount / stitchingDays)
  : 0,

// CORRECT: uses actual stitches completed
avgDailyStitches: stitchingDays > 0
  ? Math.round(p.stitchesCompleted / stitchingDays)
  : 0,
```

## Info

### IN-01: Hardcoded color scales in hero-stats and progress-breakdown-tab

**File:** `src/components/features/dashboard/hero-stats.tsx:52`
**Issue:** Uses `border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-950/20` instead of semantic tokens (`border-border`, `bg-card`). The project convention (base-ui-patterns.md) mandates semantic design tokens. Similar hardcoded scales appear in `progress-breakdown-tab.tsx` (bucket accents) and `finished-tab.tsx` (aggregate cards). This is partly intentional for visual accent differentiation, but the hero stat cards could use semantic tokens.
**Fix:** Consider using `border-border bg-card` with a subtle accent class for the colored elements, or document the intentional deviation from the semantic token convention for dashboard accent colors.

### IN-02: Redundant link href ternary in buried-treasures-section

**File:** `src/components/features/dashboard/buried-treasures-section.tsx:39`
**Issue:** `const linkHref = t.projectId ? '/charts/${t.chartId}' : '/charts/${t.chartId}'` -- both branches produce the identical URL. The ternary is dead code.
**Fix:**
```tsx
// WRONG: both branches identical
const linkHref = t.projectId ? `/charts/${t.chartId}` : `/charts/${t.chartId}`;

// CORRECT: just use the value directly
const linkHref = `/charts/${t.chartId}`;
```

### IN-03: console.error in production server action

**File:** `src/lib/actions/shopping-cart-actions.ts:195`
**Issue:** `console.error("updateSupplyAcquired error:", error)` logs the full error object to server console. While not a security issue per se (server-side only), it may log sensitive stack traces in production. Consider using a structured logger or at minimum logging only `error.message`.
**Fix:** Replace with a structured log or narrow the output:
```ts
console.error("updateSupplyAcquired error:", error instanceof Error ? error.message : error);
```

### IN-04: window.prompt for quantity input

**File:** `src/components/features/shopping/quantity-control.tsx:21-29`
**Issue:** Uses `window.prompt()` for direct quantity input. This works but is not visually consistent with the rest of the UI (no styling, browser-native dialog). Not a bug, but worth noting for potential future polish.
**Fix:** Consider replacing with an inline editable number input or a modal for visual consistency. Low priority.

---

_Reviewed: 2026-04-18T04:47:43Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
