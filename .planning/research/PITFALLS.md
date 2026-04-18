# Pitfalls Research

**Domain:** Adding dashboards, session logging, and progress tracking to an existing cross-stitch management app
**Researched:** 2026-04-16
**Confidence:** HIGH (based on codebase analysis + external research + Prisma/Neon documentation)

## Critical Pitfalls

### Pitfall 1: Route Rename Blast Radius (Charts to Pattern Dive)

**What goes wrong:**
Renaming the `/charts` route to `/pattern-dive` (or similar) breaks links across the entire codebase. Current audit shows **50+ hardcoded `/charts` references in 30+ files**: nav items, LinkButton hrefs, `revalidatePath()` calls in 12+ server action files, test assertions, back-to-gallery links, shopping list links, designer detail links, genre detail links, fabric detail links, storage location links, stitching app links, and the top bar "Add Chart" button.

**Why it happens:**
The app was built with `/charts` as the canonical route for everything project-related. Renaming it is not a simple find-replace because:
- `revalidatePath("/charts")` appears in chart-actions.ts, supply-actions.ts, genre-actions.ts, designer-actions.ts, storage-location-actions.ts, stitching-app-actions.ts
- Dynamic routes like `/charts/${chartId}` and `/charts/${chart.id}/edit` are interpolated strings
- Tests assert on specific href values like `"/charts/c1"` and `"/charts?view=table"`
- `back-to-gallery-link.tsx` defaults to `"/charts"` and reads localStorage for view mode

**How to avoid:**
Do NOT rename the route. Keep `/charts` as the URL path and update only the visible label in the navigation from "Projects" to "Pattern Dive." The route path is an implementation detail users rarely see in a PWA. If the route absolutely must change later, use Next.js `redirects` in `next.config.js` and do the rename as a dedicated task with a comprehensive search-and-replace across all href attributes, revalidatePath calls, and test assertions.

**Warning signs:**
404 errors on project links, stale data after mutations (broken revalidation), failing tests with href mismatches.

**Phase to address:**
Phase 8 (Pattern Dive) -- decide on approach during planning. Recommendation: label change only, no route rename.

---

### Pitfall 2: Dashboard Query Waterfall on Neon Cold Start

**What goes wrong:**
The Main Dashboard design requires data from 6+ distinct query groups: Currently Stitching (WIPs with session stats), Start Next (flagged projects), Buried Treasures (oldest unstarted), Spotlight (random pick), Collection Stats (aggregated counts), and Recently Added. If these run sequentially in a Server Component, the page load stacks 6 round trips on top of a potential Neon cold-start penalty of 300-500ms.

**Why it happens:**
Server Components naturally encourage sequential data fetching when queries are written as sequential `await` calls. Neon free tier auto-suspends after 5 minutes of inactivity, so the first request after idle time adds 300-500ms latency. Combined with 6 sequential queries at 50-200ms each, total page load could exceed 2 seconds.

**How to avoid:**
1. Use `Promise.all()` to parallelize independent queries in the dashboard page's Server Component
2. Group related data into fewer, broader Prisma queries -- one `findMany` for all projects with selective `include` can serve Currently Stitching + Start Next + Buried Treasures
3. Use Suspense boundaries per dashboard section so fast sections render immediately while slow ones stream in
4. Consider a single `getDashboardData()` server action that runs parallel queries internally and returns a structured object

**Warning signs:**
Dashboard page consistently takes 2+ seconds on first load. Lighthouse "Time to First Byte" over 1.5 seconds.

**Phase to address:**
Phase 8 (Main Dashboard) -- architect the data fetching layer before building UI.

---

### Pitfall 3: Progress Calculation Divergence (Two Sources of Truth)

**What goes wrong:**
The current schema stores `stitchesCompleted` directly on the `Project` model. When sessions are added, progress should derive from `startingStitches + SUM(session.stitchCount)`. If both exist without a clear source-of-truth rule, they will diverge: a user logs a session but the project's `stitchesCompleted` field does not update, or someone edits `stitchesCompleted` directly and it no longer matches the session sum.

**Why it happens:**
The current `stitchesCompleted` field on `Project` was designed for manual entry (pre-sessions). Adding StitchSession creates a second path to the same data. The `gallery-utils.ts` progress calculation (line 79-80) reads directly from `project.stitchesCompleted` and divides by `stitchCount` -- it has no concept of sessions.

**How to avoid:**
After the StitchSession model exists, use a denormalized cache strategy:
- Keep `stitchesCompleted` on Project as a calculated cache field
- Define the truth as: `stitchesCompleted = startingStitches + SUM(sessions.stitchCount)`
- Every session CRUD action (create, update, delete) must recalculate and update `project.stitchesCompleted` atomically within the same transaction
- Never allow direct editing of `stitchesCompleted` through the chart form once sessions exist for that project
- All existing display code (gallery-utils, overview-tab, project-detail-hero) continues to work without changes because they already read `stitchesCompleted`

**Warning signs:**
Progress bar shows different values on gallery card vs. project detail page. "Stitches completed" does not match sum of session logs. Edit or delete a session and progress does not update.

**Phase to address:**
Phase 9 (Session Logging) -- define the source-of-truth contract in the StitchSession schema migration and enforce it in every session action.

---

### Pitfall 4: Division-by-Zero and Edge Cases in Progress Percentages

**What goes wrong:**
The progress formula `Math.round((stitchesCompleted / stitchCount) * 100)` produces `NaN` when `stitchCount` is 0. Currently `gallery-utils.ts` handles this with a guard (`stitchCount > 0 ? ... : 0`), but dashboard stat cards, project dashboard buckets, session tab mini-stats, and Collection Stats sidebar all need the same guard. Miss it once and "NaN%" or "Infinity%" appears in the UI.

**Why it happens:**
Many charts have `stitchCount: 0` because the user has not entered dimensions yet -- they added the chart with just a name and designer. The current gallery handles this correctly, but every NEW component that displays progress needs to replicate the guard independently.

**How to avoid:**
Extract progress calculation into a single shared utility:
```typescript
// lib/utils/progress.ts
export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}
```
Use this everywhere instead of inline math. Also handle:
- `stitchesCompleted > stitchCount` -- cap at 100 or display a note that the count may need updating
- `startingStitches > stitchCount` -- data entry error, clamp to total
- Negative session stitch counts -- validate at Zod boundary with `z.number().int().min(1)` to prevent

**Warning signs:**
"NaN%" in any stat display. Progress bar overflowing past 100%. Gallery and project detail showing different percentages for the same project.

**Phase to address:**
Phase 8 (first dashboard phase) -- create shared `calculateProgress()` utility and refactor existing `gallery-utils.ts` to use it.

---

### Pitfall 5: Session Logging Friction Kills the Feature

**What goes wrong:**
The session logging modal (per DesignOS design) has 5 fields: date, project, stitch count, time spent, and photo. Research on habit-tracking UX consistently shows that more than 2-3 required fields causes logging abandonment. If the user has to select a project from a dropdown every single time (when they are almost always logging for the same WIP), the friction compounds.

**Why it happens:**
The design is comprehensive -- it covers editing, backfilling, and multi-project logging. But the daily use case is: "I just finished stitching, let me log 423 stitches for the same project as last time." That flow should be 2 actions: enter count, save.

**How to avoid:**
1. Auto-select the most recently stitched project (or the only active WIP if there is just one)
2. Date defaults to today (already in design -- good)
3. Only stitch count is required; time and photo are clearly optional with collapsed/de-emphasized UI
4. From project detail page's Sessions tab, pre-fill the project (design already does this -- ensure implementation follows through)
5. Consider a keyboard shortcut or persistent "Log Stitches" button on the dashboard for quick access

**Warning signs:**
User logs sessions for the first week then stops. Session modal feels sluggish to open. Project selector requires scrolling through 20+ items on every log.

**Phase to address:**
Phase 9 (Session Logging) -- implement smart defaults and minimal-friction flow for the common case.

---

### Pitfall 6: revalidatePath Explosion When Sessions Touch Multiple Pages

**What goes wrong:**
Logging a session should update: the project detail page (progress, session list), the gallery (progress bar on card), the dashboard (Currently Stitching stats, Collection Stats), the shopping list (if progress changes kitting status), and Pattern Dive (progress-based views). Missing any of these creates stale data. But calling `revalidatePath` for 5+ paths on every session save is wasteful and can cause unnecessary re-renders.

**Why it happens:**
The current codebase already has extensive revalidation -- `supply-actions.ts` calls `revalidatePath("/charts")` and `revalidatePath("/shopping")` on every supply mutation. Adding sessions will multiply this. Each new dashboard page is another path to revalidate.

**How to avoid:**
1. Use `revalidatePath("/", "layout")` to revalidate the entire app when session data changes (since sessions affect many pages) -- simpler than tracking every path, and acceptable for a single-user app
2. Alternatively, be strategic: revalidate `/charts/${chartId}` (project detail) and `/` (dashboard) on session mutations; the gallery page re-fetches naturally on next navigation
3. Avoid over-revalidating: do not revalidate `/shopping` on session save unless sessions actually affect shopping data
4. Test revalidation by logging a session and immediately navigating to each affected page

**Warning signs:**
Stale progress bars after logging a session. Dashboard shows old stats until manual refresh. "Flash of old content" when navigating between pages.

**Phase to address:**
Phase 9 (Session Logging) -- define revalidation strategy alongside session actions.

---

### Pitfall 7: N+1 Queries in Dashboard Aggregation

**What goes wrong:**
Dashboard sections like "Collection Stats" need aggregated data: total stitches across all projects, count by status, most recent finish. If implemented as separate `prisma.project.count()`, `prisma.project.aggregate()`, and `prisma.project.findFirst()` calls for each stat, plus per-project session data for Currently Stitching cards, the result is 10+ database round trips.

**Why it happens:**
Prisma's type-safe API encourages granular queries. It feels natural to write `const totalWIP = await prisma.project.count({ where: { status: "IN_PROGRESS" } })` for each status, but that is 7 separate COUNT queries for the status breakdown alone.

**How to avoid:**
1. Use `prisma.project.groupBy({ by: ["status"], _count: true })` for all status counts in a single query
2. Use `prisma.project.aggregate()` for total stitch counts
3. Combine related data: one `findMany` with selective includes can serve multiple dashboard sections
4. For Currently Stitching cards that need session data, use a single query with `include: { sessions: { orderBy: { date: "desc" }, take: 1 } }` rather than fetching sessions separately per project
5. If aggregations get complex enough that Prisma cannot express them efficiently, use `prisma.$queryRaw` for a single SQL query with multiple aggregations

**Warning signs:**
Prisma query logging shows 15+ queries per dashboard load. Dashboard page takes 1.5+ seconds even when Neon is warm.

**Phase to address:**
Phase 8 (first dashboard phase) -- design the data layer to use grouped/aggregated queries from the start.

---

### Pitfall 8: Shopping Cart Upgrade Losing Fulfillment State

**What goes wrong:**
The current Shopping page (`shopping-actions.ts`) has a specific data structure and fulfillment tracking via `markSupplyAcquired`. Upgrading to the new Shopping Cart design (with project selection tabs, fabric-to-stash matching, tabbed supply types) risks breaking existing fulfillment tracking if the data format changes or the component contract shifts.

**Why it happens:**
The Shopping Cart redesign adds significant new functionality (project selector, fabric matching, supply type tabs) on top of the existing simple list. If the component is rebuilt from scratch following the DesignOS design, the existing `markSupplyAcquired` action and its `revalidatePath("/shopping")` pattern could be disconnected from the new UI.

**How to avoid:**
1. Keep the existing `shopping-actions.ts` server actions intact -- they are correct and tested
2. Build the new Shopping Cart component to consume the same `ShoppingListProject` type
3. Add new data alongside existing fields (fabric-to-stash matching, project selection state) without removing anything
4. Test that fulfillment toggle still works in the new UI before removing the old component
5. If the data shape needs to change, write a migration plan that maps old to new

**Warning signs:**
Fulfillment toggles stop working after redesign. `markSupplyAcquired` action still points to old paths. Shopping list shows stale data after supply changes.

**Phase to address:**
Phase 8 (Shopping Cart upgrade) -- explicitly preserve existing fulfillment action integration.

---

### Pitfall 9: StitchSession Photo Upload Without R2 Category Separation

**What goes wrong:**
Session photos are stored in R2 alongside cover images, but without proper key namespacing they become impossible to manage. The existing upload system uses `covers/` and `files/` categories (validated in `uploadRequestSchema`). Session photos need their own category or they will be mixed in with cover images.

**Why it happens:**
The existing `getPresignedUploadUrl` action validates `category` against "covers" and "files" and uses it as the R2 key prefix: `${category}/${projectId}/${nanoid()}-${filename}`. Adding session photos without updating the category validation will error with "Invalid category" or force them into an incorrect bucket prefix.

**How to avoid:**
1. Add a "sessions" category to the upload validation schema (`uploadRequestSchema`)
2. Use key pattern: `sessions/${projectId}/${nanoid()}-${filename}`
3. Store the R2 key on the StitchSession model (e.g., `photoUrl: String?`)
4. Reuse the existing presigned URL patterns -- `getPresignedUploadUrl` and `getPresignedImageUrls` already handle the heavy lifting
5. Update `ALLOWED_IMAGE_TYPES` validation to apply to session photos (same set as covers)

**Warning signs:**
Session photos uploaded but never displayed. R2 bucket has unorganized files. Upload fails with "Invalid category" error.

**Phase to address:**
Phase 9 (Session Logging) -- extend upload-actions.ts with "sessions" category before building the photo upload UI.

---

### Pitfall 10: Adding New Navigation Items Breaks Mobile Layout

**What goes wrong:**
The current nav has: Dashboard, Projects, Shopping, Fabric, Supplies, Designers, Genres, Storage, Apps (9 items). Adding Pattern Dive, Project Dashboard, Shopping Cart, and Stats pages could push the count to 13+ items, breaking the mobile nav layout (overflow, tiny touch targets, or requiring scrolling).

**Why it happens:**
Each new dashboard/page gets its own nav entry because it is a distinct view. But mobile nav has limited space. The current `nav-items.ts` uses grouped items, but too many items in a group still overflows.

**How to avoid:**
1. Replace rather than add: "Pattern Dive" replaces "Projects" (same route, new label). "Shopping Cart" replaces "Shopping" (same route, upgraded page)
2. Group dashboards under a parent: Main Dashboard as home `/`, Project Dashboard as a tab or sub-route
3. Do not add Stats page to nav in v1.2 -- it belongs in v1.3 (Motivation & Planning)
4. Test on iPhone-sized viewport (375px width) with the full nav visible before shipping

**Warning signs:**
Nav items wrap to two lines on mobile. Touch targets smaller than 44px. Users cannot find new pages because nav is too crowded.

**Phase to address:**
Phase 8 (first new page) -- plan navigation hierarchy before building any new pages.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing `stitchesCompleted` as denormalized cache | Fast reads without session aggregation | Must update on every session CRUD operation or data drifts | Always -- but wrap in transaction with session mutations |
| Inline progress math instead of shared utility | Faster to write each component | Bugs when edge cases handled inconsistently across 8+ components | Never -- extract from day one |
| `revalidatePath("/", "layout")` blanket revalidation | Simple, never stale data | Over-fetches data on every mutation | Acceptable for single-user app; revisit if multi-user |
| Raw SQL for dashboard aggregations | Fewer round trips, faster queries | Bypasses Prisma type safety, harder to maintain | Only when Prisma groupBy/aggregate is insufficient |
| Keeping `/charts` route instead of renaming | Zero refactoring effort | URL does not match "Pattern Dive" label | Always for v1.2 -- cosmetic concern only |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon free tier | Assuming always-warm connections | Design for 300-500ms cold start; parallel queries via Promise.all; use Neon's pooled connection endpoint |
| R2 session photos | Reusing "covers" category for session photos | Add "sessions" category to upload validation schema; separate R2 key prefix |
| Prisma 7 aggregation | Using `count()` per-status instead of `groupBy` | Single `groupBy({ by: ["status"], _count: true })` for all status counts |
| Auth in new server actions | Forgetting `requireAuth()` in new session/dashboard actions | Copy existing pattern from chart-actions.ts; ESLint rule already blocks direct auth imports |
| Session-to-progress sync | Updating session without updating Project.stitchesCompleted | Always update both in same Prisma transaction |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential dashboard queries | 2+ second page loads | `Promise.all()` for parallel fetching | At 6+ independent queries on cold Neon |
| Per-card session aggregation in gallery | Gallery slows with more WIP projects | Denormalize `stitchesCompleted` on Project; no per-card session query needed | At 20+ WIP projects with session data |
| Loading all sessions in project detail | Slow tab switch when project has 500+ sessions | Paginate sessions (show last 20, "Load More") | At 100+ sessions per project (roughly 3 months of daily logging) |
| Dashboard loading all projects to compute stats | Slow with 500+ charts | Use aggregate/groupBy queries, not findMany + JS reduce | At 200+ projects with includes |
| Presigned URL generation for session photos in list | One R2 call per photo in session list | Batch `getPresignedImageUrls()` like gallery already does | At 20+ sessions with photos displayed |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Session CRUD without ownership check | User could edit/delete another user's sessions (multi-user readiness concern) | `requireAuth()` + verify session.project.userId matches in every action |
| No Zod validation on session stitch count | Negative or astronomically large values corrupt stats | `z.number().int().min(1).max(999999)` on stitch count |
| Session photo upload without size limit | R2 storage bloat from large images | Enforce max file size (5MB) in upload validation, same as cover images |
| Dashboard data leaking across users | Stats from other users shown (if multi-user ever added) | All dashboard queries must filter by userId, even in single-user app |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring project selection on every session log | Friction kills daily logging habit | Auto-select most recently stitched project (or only active WIP) |
| Dashboard sections load as empty shells then pop in | Feels broken/slow, content layout shift | Use skeleton loaders matching section dimensions; Suspense boundaries |
| Progress bar jumps after logging session | Jarring if gallery card updates asynchronously | Optimistic update on session save, then revalidate |
| Buried Treasures shows same projects forever | Feature feels stale, user stops looking | Add "Dismiss" or rotate selection criteria (e.g., random 5 of oldest 20) |
| Session table shows ALL sessions with no pagination | Unusable after a year of daily logging (365+ rows) | Default to last 20 sessions with "Show More" or date-range filter |
| Main Dashboard feels empty before any sessions logged | User sees "Currently Stitching" section with no time/session stats | Design "no sessions yet" state that still feels useful (show progress, dates, not just empty cards) |

## "Looks Done But Isn't" Checklist

- [ ] **Dashboard stats:** Verify `totalStitchesCompleted` includes `startingStitches` for projects with pre-tracking progress
- [ ] **Progress calculation:** Test with stitchCount=0 projects (should show 0%, not NaN or crash)
- [ ] **Session logging:** Test editing a session -- does `stitchesCompleted` update correctly (recalculated, not just incremented)?
- [ ] **Session deletion:** Does deleting a session decrement `stitchesCompleted` and update all dependent views?
- [ ] **Dashboard empty states:** Test with 0 WIPs, 0 sessions, 0 unstarted projects -- each section handles "no data" gracefully
- [ ] **Shopping Cart fulfillment:** Existing `markSupplyAcquired` still works after redesign
- [ ] **Navigation mobile:** All nav items accessible on 375px-wide viewport without horizontal scroll
- [ ] **R2 session photos:** Photos display correctly (presigned URLs resolved) in both session list and project detail
- [ ] **revalidatePath coverage:** After logging a session, verify fresh data on: project detail, gallery card, dashboard stats
- [ ] **Pattern Dive tabs:** Each tab (What's Next, Fabric Requirements, Storage View) works with 0 matching projects
- [ ] **Collection Stats sidebar:** All counts (totalProjects, totalWIP, etc.) match actual data; totalStitchesCompleted is accurate aggregate
- [ ] **Currently Stitching cards:** Display gracefully before sessions exist (show progress from stitchesCompleted, hide session-specific stats)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Progress data divergence | MEDIUM | Write a migration script: recalculate all project stitchesCompleted as startingStitches + SUM(session stitchCount) |
| Route rename blast radius | HIGH | Revert route change, add redirects in next.config.js, systematic find-replace with test validation |
| Dashboard query waterfall | LOW | Wrap existing queries in `Promise.all()` -- no schema change needed |
| N+1 in dashboard aggregation | MEDIUM | Replace individual count queries with groupBy; may need to refactor data layer |
| Shopping fulfillment lost | MEDIUM | Restore from git, compare old/new action contracts, re-wire toggle handlers |
| Session photo upload broken | LOW | Add "sessions" category to upload validation, re-upload affected photos |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Route rename blast radius | Phase 8 (Pattern Dive) | Decision documented; no 404s in navigation smoke test |
| Dashboard query waterfall | Phase 8 (Main Dashboard) | Page load under 1.5s measured with cold Neon |
| Progress divergence | Phase 9 (Session Logging) | Session CRUD test: sum(sessions) + startingStitches === project.stitchesCompleted |
| Division-by-zero progress | Phase 8 (first dashboard) | Shared utility exists; tested with stitchCount=0 |
| Session logging friction | Phase 9 (Session Logging) | Logging flow requires exactly 2 actions for common case (enter count + save) |
| revalidatePath explosion | Phase 9 (Session Logging) | No stale data visible after session CRUD on any page |
| N+1 dashboard queries | Phase 8 (Main Dashboard) | Prisma query log shows under 5 queries for full dashboard load |
| Shopping fulfillment loss | Phase 8 (Shopping Cart) | Existing shopping action tests still pass after redesign |
| Session photo R2 category | Phase 9 (Session Logging) | "sessions" category accepted by upload action; photos display correctly |
| Navigation overflow | Phase 8 (first new page) | Mobile nav tested at 375px; all items accessible |

## Sources

- Codebase analysis: `src/lib/actions/chart-actions.ts`, `shopping-actions.ts`, `upload-actions.ts`, `gallery-utils.ts` (direct code review)
- Codebase analysis: 50+ hardcoded `/charts` references found via grep across 30+ files
- Codebase analysis: `src/components/features/charts/project-detail/overview-tab.tsx` -- current progress display reads `project.stitchesCompleted`
- Codebase analysis: `src/components/features/charts/project-detail/project-detail-page.tsx` -- current 2-tab layout (Overview + Supplies) that sessions tab will extend
- [Neon Plans & Limits](https://neon.com/docs/introduction/plans) -- free tier: 100 CU-hours, 0.5GB storage, auto-suspend after 5 min
- [Neon Connection Latency](https://neon.com/docs/connect/connection-latency) -- cold start 300-500ms
- [Neon Connection Pooling](https://neon.com/docs/connect/connection-pooling) -- PgBouncer up to 10K connections on all plans
- [Prisma Aggregation Docs](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing) -- groupBy, aggregate, count patterns
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance) -- N+1 prevention with includes and join strategy
- [Next.js Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns) -- parallel fetching with Promise.all, Suspense streaming
- Context7: Prisma 7 groupBy/aggregate API (verified current)
- DesignOS designs: `product-plan/sections/stitching-sessions-and-statistics/components/LogSessionModal.tsx` -- 5 fields, session photo upload
- DesignOS designs: `product-plan/sections/dashboards-and-views/components/MainDashboard.tsx` -- 6 dashboard sections requiring parallel data

---
*Pitfalls research for: v1.2 Track & Measure milestone -- dashboards, session logging, progress tracking*
*Researched: 2026-04-16*
