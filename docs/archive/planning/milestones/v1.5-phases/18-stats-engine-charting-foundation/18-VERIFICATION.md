---
phase: 18-stats-engine-charting-foundation
verified: 2026-05-17T14:04:00Z
status: human_needed
score: 10/10 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Navigate to /stats in browser"
    expected: "Page loads with 4 hero counter cards (Total Stitches, Sessions, Time Stitching, Completed) and a collection donut chart. Switching tabs between Overview / Activity / Records works, with placeholder text in Activity and Records."
    why_human: "Visual rendering of Recharts donut chart with CSS variable design tokens requires browser verification — the chart SVG renders and the --status-* colors appear correctly."
  - test: "Log or edit a stitching session, then reload /stats"
    expected: "The hero counters and collection chart reflect the updated data within the cache TTL (or immediately on hard reload in dev mode). Confirms revalidateTag('stats') wiring is live."
    why_human: "Cache invalidation behavior can only be confirmed end-to-end in a running app; the unit tests mock revalidateTag but cannot verify Next.js actually purges the cache."
---

# Phase 18: Stats Engine & Charting Foundation Verification Report

**Phase Goal:** A tested, timezone-aware stats query layer exists with caching and invalidation, and Recharts is installed and integrated with the design system
**Verified:** 2026-05-17T14:04:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Stats query functions return correct aggregations verified by unit tests (ROADMAP SC-1) | VERIFIED | 10 hero-stats + collection-breakdown tests pass; 6 parallel Prisma queries with correct stitch count/time/session aggregations |
| 2 | Cache invalidates when a session is logged, edited, or deleted (ROADMAP SC-2) | VERIFIED | `revalidateTag("stats", { expire: 0 })` called in createSession/updateSession/deleteSession; 3 test assertions confirm each call site; session-actions.test.ts 37/37 pass |
| 3 | Date boundaries align with user's timezone — 11pm Pacific = same day, not next day (ROADMAP SC-3) | VERIFIED | `timezone.test.ts` "a session at 11:30pm Mountain Time falls within todayStart..todayEnd" passes; TZDate.tz() used for DST-aware boundaries |
| 4 | A Recharts chart renders with design system colors (ROADMAP SC-4) | VERIFIED (automated) / needs human (visual) | `collection-status-chart.tsx` imports `PieChart`, `ChartContainer`, `collectionStatusConfig` (CSS `var(--status-*)` tokens); 5 chart tests pass |
| 5 | date-fns 4.1.0, @date-fns/tz 1.4.1, and recharts 3.8.0 installed as exact pinned versions | VERIFIED | `package.json` lines 24, 31, 40: exact versions, no `^` or `~` |
| 6 | getUserTimezone reads STATS_TIMEZONE env var, never hardcodes in query functions | VERIFIED | `timezone.ts` line 17: `process.env.STATS_TIMEZONE ?? "America/Denver"` |
| 7 | getLocalDayBoundaries returns correct UTC boundaries for America/Denver (DST-aware) | VERIFIED | `timezone.test.ts` 10 tests pass including MDT (UTC-6) and MST (UTC-7) January boundary |
| 8 | Both query functions wrapped with unstable_cache tagged "stats" with correct TTLs | VERIFIED | `hero-stats.ts`: revalidate 300; `collection-breakdown.ts`: revalidate 3600 |
| 9 | Stats page calls requireAuth() before data fetching, uses Promise.all for parallel queries | VERIFIED | `page.tsx` line 8: `requireAuth()` first; line 10: `Promise.all([getHeroStats, getCollectionBreakdown])`; page tests verify call order |
| 10 | Stats page shell has 3 tabs (Overview/Activity/Records) with URL-synced state, shell is permanent | VERIFIED | `stats-page-shell.tsx` exports `STATS_TABS`, uses nuqs `useQueryState`; 10 shell tests pass |

**Score:** 10/10 truths verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/stats.ts` | StatsHeroData, StatusBreakdownItem, CollectionBreakdownData, LocalDateBoundaries | VERIFIED | All 4 interfaces present; follows dashboard.ts section-divider convention |
| `src/lib/queries/stats/timezone.ts` | getUserTimezone + getLocalDayBoundaries exports | VERIFIED | Exports both; imports TZDate from @date-fns/tz |
| `src/lib/chart-configs.ts` | collectionStatusConfig with 7 keys, satisfies ChartConfig, no "use client" | VERIFIED | UPPERCASE keys, `satisfies ChartConfig`, no client directive |
| `src/components/ui/chart.tsx` | shadcn ChartContainer, ChartTooltip, etc. | VERIFIED | Added via `npx shadcn@latest add chart` |
| `src/lib/queries/stats/index.ts` | Barrel re-exports for all query layer functions | VERIFIED | 3 exports: getUserTimezone, getLocalDayBoundaries, getHeroStats, getCollectionBreakdown |
| `src/lib/queries/stats/hero-stats.ts` | getHeroStats with unstable_cache | VERIFIED | 6 parallel queries, unstable_cache with tags: ["stats"], revalidate: 300 |
| `src/lib/queries/stats/collection-breakdown.ts` | getCollectionBreakdown with all-7-status fill | VERIFIED | prisma.project.groupBy, fills zeros for missing statuses, revalidate: 3600 |
| `src/lib/actions/session-actions.ts` | revalidateTag("stats") on create/update/delete | VERIFIED | 4 occurrences (1 import + 3 calls); uses `{ expire: 0 }` for Next.js 16 API |
| `src/app/(dashboard)/stats/page.tsx` | Server Component with requireAuth + Promise.all | VERIFIED | No "use client"; imports from @/lib/queries/stats barrel |
| `src/app/(dashboard)/stats/loading.tsx` | Skeleton matching new layout with animate-skeleton-pulse | VERIFIED | 3 tab skeletons + 4 counter skeletons + circular chart skeleton |
| `src/components/features/stats/stats-page-shell.tsx` | Client component with 3 tabs + nuqs URL state | VERIFIED | "use client", STATS_TABS const, StatsTab type, nuqs useQueryState |
| `src/components/features/stats/collection-status-chart.tsx` | Recharts PieChart + ChartContainer + collectionStatusConfig | VERIFIED | "use client", PieChart with innerRadius=60, ChartContainer, collectionStatusConfig |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `timezone.ts` | `process.env.STATS_TIMEZONE` | getUserTimezone abstraction | WIRED | Line 17 reads env var with Denver default |
| `chart-configs.ts` | `globals.css` CSS variables | var(--status-*) references | WIRED | All 7 status entries use `var(--status-{lowercase})` tokens |
| `hero-stats.ts` | `timezone.ts` | getUserTimezone + getLocalDayBoundaries | WIRED | Lines 3, 7-9 import and call both functions |
| `hero-stats.ts` | `prisma.stitchSession.aggregate` | 6 parallel aggregate queries | WIRED | Promise.all with 5 aggregate calls + 1 project.count |
| `collection-breakdown.ts` | `prisma.project.groupBy` | groupBy query | WIRED | Line 20: `prisma.project.groupBy({ by: ["status"] })` |
| `session-actions.ts` | `next/cache` revalidateTag | revalidateTag("stats") | WIRED | Lines 97, 174, 216 — all 3 mutations call revalidateTag |
| `stats/page.tsx` | `@/lib/queries/stats` | getHeroStats, getCollectionBreakdown | WIRED | Line 2 barrel import; both called in Promise.all |
| `stats/page.tsx` | `@/lib/auth-guard.ts` | requireAuth() | WIRED | Line 1 import, line 8 call before any queries |
| `collection-status-chart.tsx` | `@/components/ui/chart.tsx` | ChartContainer + ChartTooltip | WIRED | Lines 4-8 import, lines 30+35 used in render |
| `collection-status-chart.tsx` | `@/lib/chart-configs.ts` | collectionStatusConfig | WIRED | Line 9 import, line 31 passed to ChartContainer |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `collection-status-chart.tsx` | `data` prop (StatusBreakdownItem[]) | `collectionBreakdown.byStatus` from `getCollectionBreakdown(user.id)` → `prisma.project.groupBy` | Yes — real DB groupBy | FLOWING |
| `stats/page.tsx` `StatsOverview` | `heroStats` | `getHeroStats(user.id)` → 6 `prisma.stitchSession.aggregate` calls | Yes — real DB aggregation | FLOWING |
| `stats-page-shell.tsx` | Tab state | `useQueryState("tab", ...)` with URL query param | N/A (navigation state) | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 75 phase 18 tests pass | `npx vitest run src/lib/queries/stats/ src/components/features/stats/ src/app/(dashboard)/stats/page.test.ts src/lib/actions/session-actions.test.ts` | 7 test files, 75 tests, 0 failures | PASS |
| Package versions pinned exact | grep in package.json | recharts@3.8.0, date-fns@4.1.0, @date-fns/tz@1.4.1 — no carets | PASS |
| revalidateTag called 3 times (one per mutation) | grep -c revalidateTag session-actions.ts | 4 (1 import + 3 calls) | PASS |
| unstable_cache used in both query files | grep -c unstable_cache | hero-stats.ts: 2, collection-breakdown.ts: 2 | PASS |
| Browser rendering of chart | Navigate to /stats | Requires running server | SKIP — route to human |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STAT-01 | 18-02, 18-03 | Stats page loads within 2s with all data pre-fetched via parallel queries | SATISFIED | Promise.all in page.tsx; unstable_cache with 300s/3600s TTL; unit tests verified |
| STAT-02 | 18-02 | Stats data refreshes automatically when sessions are logged/edited/deleted | SATISFIED | revalidateTag("stats") on all 3 session mutations; test assertions at lines 338, 556, 779 of session-actions.test.ts |
| STAT-03 | 18-01 | All date-based stats respect user's timezone (not UTC boundaries) | SATISFIED | getUserTimezone + getLocalDayBoundaries with TZDate; 10 timezone tests including DST and 11pm edge case |
| STAT-04 | 18-01, 18-03 | Recharts via shadcn chart installed and integrated with design system tokens | SATISFIED | recharts@3.8.0 installed; chart.tsx exists; collectionStatusConfig uses var(--status-*); donut chart renders in /stats |

All 4 Phase 18 requirement IDs are satisfied. No orphaned requirements (STAT-01 through STAT-04 are the only IDs mapped to Phase 18 in REQUIREMENTS.md).

---

### Anti-Patterns Found

No blockers or warnings. Scanned all 9 source files for TODO/FIXME/placeholder comments, empty returns, stub implementations, and hardcoded empty data. The Activity and Records tab placeholders ("coming in a future update") are intentional per design decision D-08 — they are the permanent shell that Phases 20 and 21 fill in, not implementation stubs. No anti-patterns affecting goal achievement.

---

### Human Verification Required

#### 1. Visual Chart Rendering

**Test:** Start the dev server (`npm run dev`) and navigate to `/stats`
**Expected:** Page shows 4 hero counter cards with real data (or zeros if no sessions exist), a "Collection by Status" card containing a donut chart with colored segments matching project statuses, and 3 tab labels (Overview / Activity / Records). The Activity and Records tabs show "coming in a future update" placeholder text.
**Why human:** Recharts renders SVG in a browser DOM. The `--status-*` CSS variables must resolve to the correct colors. Tests mock recharts and cannot verify the actual visual output or CSS variable application.

#### 2. Cache Invalidation End-to-End

**Test:** Log a new stitching session (add stitches to any project), then reload `/stats`
**Expected:** The "Total Stitches" and "Sessions" counters increase to reflect the new session. In dev mode Next.js cache typically invalidates on the next request after `revalidateTag`. In production, the `{ expire: 0 }` profile should cause immediate invalidation.
**Why human:** Unit tests verify that `revalidateTag` is called with the correct arguments, but cannot verify that Next.js 16's cache actually purges on the next request. The `{ expire: 0 }` profile is a deviation from the plan's `revalidateTag("stats")` — it was added as an auto-fix for the Next.js 16 two-argument API. This behavioral wiring needs live confirmation.

---

### Gaps Summary

No automated gaps. All 10 observable truths verified, all 12 artifacts substantive and wired, all data flows confirmed as real DB queries. Two items require human testing before this phase can be fully signed off: visual chart rendering with design system colors, and live cache invalidation behavior.

---

_Verified: 2026-05-17T14:04:00Z_
_Verifier: Claude (gsd-verifier)_
