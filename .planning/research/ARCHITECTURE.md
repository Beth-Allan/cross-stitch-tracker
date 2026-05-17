# Architecture Patterns: Statistics Dashboard

**Domain:** Statistics dashboard & data aggregation for cross-stitch tracker
**Researched:** 2026-05-17
**Confidence:** HIGH (based on existing codebase patterns + official docs + Neon benchmarks)

## Recommended Architecture

### Overview

The statistics dashboard integrates as a new page route (`/stats`) with a dedicated query layer that follows the established pattern: Server Component page fetches data via Promise.all, passes serialized results as props to Client Components that handle interactivity (tab switching, chart hover, popover drill-down).

```
src/app/(dashboard)/stats/page.tsx          <- Server Component (data fetching orchestrator)
src/lib/queries/stats/                      <- Stats query layer (pure functions, no "use server")
src/components/features/stats/              <- Client Components (charts, interactive tabs)
src/types/stats.ts                          <- Type definitions
```

### Why a Query Layer, Not Server Actions

The existing dashboard uses `"use server"` actions for data fetching, but stats queries are read-only and never called from Client Components via form submission. A dedicated query layer (`src/lib/queries/stats/`) provides:

1. **No overhead** -- server actions add POST endpoint overhead for reads
2. **Composability** -- queries can be combined with `Promise.all` in the Server Component
3. **Testability** -- pure functions with injected prisma client, no auth coupling in unit tests
4. **Cacheable** -- can wrap with `unstable_cache` without "use server" conflicts

The auth guard moves to the page-level Server Component (call `requireAuth()` once, pass `userId` down to query functions).

---

## Component Boundaries

| Component | Type | Responsibility | Communicates With |
|-----------|------|---------------|-------------------|
| `stats/page.tsx` | Server Component | Auth, parallel data fetch, cache orchestration | Query layer, Client Components |
| `StatsPageClient` | Client Component | Tab state, tab rendering | Individual stat components |
| `HeroCounters` | Server Component | Render lifetime stat numbers | Receives props from page |
| `MonthlyBarChart` | Client Component | Interactive bar chart with drill-down popover | Receives `monthlyTotals` prop |
| `StitchingCalendar` | Client Component | Month navigation, day detail hover | Receives `calendarDays`, fetches on month change |
| `PersonalBestsBoard` | Client/Server hybrid | Record cards with links | Receives `personalBests` prop |
| `SessionHistoryTable` | Client Component | Sort, paginate session list | Receives initial data, lazy-loads pages |
| `YearInReview` | Client Component | Year selector, all sub-sections | Receives data for selected year |
| `CollectionInsights` | Server Component | Status/size/designer breakdowns | Receives pre-aggregated data |

### Server vs Client Split Rationale

**Server Components** (no interactivity needed):
- `HeroCounters` -- static number display with JetBrains Mono
- `CollectionInsights` -- pie/donut charts if CSS-only, or pass data to client
- Page layout and section headings

**Client Components** (require interactivity):
- `MonthlyBarChart` -- click-to-drill-down popover, hover states
- `StitchingCalendar` -- month navigation arrows, day cell hover
- `PersonalBestsBoard` -- clickable project links (could be server if using `<Link>`)
- `SessionHistoryTable` -- sort state, pagination
- `YearInReview` -- year selector dropdown triggers data reload
- `StatsPageClient` -- tab state management

---

## Data Flow

### Primary Flow (Page Load)

```
1. User navigates to /stats
2. stats/page.tsx (Server Component):
   a. requireAuth() -> userId
   b. Promise.all([
        getHeroStats(userId),
        getMonthlyTotals(userId, currentYear),
        getPersonalBests(userId),
        getCalendarDays(userId, currentMonth),
        getCollectionBreakdown(userId),
      ])
   c. Pass results as props to StatsPageClient
3. StatsPageClient renders active tab with pre-fetched data
```

### Secondary Flow (Tab Interaction / Lazy Loading)

```
Calendar month change:
  1. Client Component calls server action getCalendarDays(month, year)
  2. Server action validates auth, queries, returns data
  3. Client Component updates state

Year in Review year change:
  1. Client Component calls server action getYearInReviewData(year)
  2. Server action validates auth, queries, returns data
  3. Client Component updates state

Session History pagination:
  1. Client Component calls server action getSessionPage(cursor)
  2. Returns next page of sessions
```

### Data Flow Diagram

```
+-------------------------------------------------------------+
| stats/page.tsx (Server Component)                           |
|                                                             |
|  requireAuth() --------------------------------------------|---> auth-guard
|       |                                                     |
|       v userId                                              |
|  +----------------------------------------------------------+
|  | Promise.all([                                        |   |
|  |   getHeroStats(userId),          <- queries/stats/   |   |
|  |   getMonthlyTotals(userId, yr),  <- queries/stats/   |   |
|  |   getPersonalBests(userId),      <- queries/stats/   |   |
|  |   getCalendarDays(userId, mo),   <- queries/stats/   |   |
|  |   getCollectionBreakdown(userId) <- queries/stats/   |   |
|  | ])                                                   |   |
|  +----------------------+-------------------------------+   |
|                         | serialized data                    |
|                         v                                    |
|  <StatsPageClient                                           |
|     heroStats={...}                                         |
|     monthlyTotals={...}                                     |
|     personalBests={...}                                     |
|     calendarDays={...}                                      |
|     collectionBreakdown={...}                               |
|  />                                                         |
+-------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------+
| StatsPageClient ("use client")                              |
|                                                             |
|  Tab state: overview | calendar | history | year-in-review  |
|                                                             |
|  +----------+  +--------------+  +----------------------+   |
|  | Overview |  |  Calendar    |  |  Year in Review      |   |
|  | -------- |  | ------------ |  | -------------------- |   |
|  | HeroCntrs|  | StitchingCal |  | YearSelector ->      |   |
|  | Personal |  | (month nav   |  | getYearInReviewData()|   |
|  | Monthly  |  |  -> server   |  | (server action)      |   |
|  | StatCards|  |  action)     |  |                      |   |
|  +----------+  +--------------+  +----------------------+   |
+-------------------------------------------------------------+
```

---

## Aggregation Strategy: Where Computation Happens

### Decision: DB-level groupBy for time-series, in-memory for small collections

| Query Type | Strategy | Rationale |
|------------|----------|-----------|
| Monthly totals (12 months) | Prisma `groupBy` | DB sums are O(n) on indexed column; avoids shipping all sessions to server |
| Daily calendar (30 days) | Prisma `where` + in-memory group | Filter by date range at DB, group by day in JS (max ~60 sessions/month) |
| Hero stats (today/week/month/year) | Prisma `aggregate` with `where` | 4 separate aggregate calls OR 1 call + in-memory bucketing |
| Personal bests (all-time records) | Prisma `orderBy` + `take(1)` | "Max stitch day" = groupBy date, sum stitchCount, orderBy desc, take 1 |
| Collection breakdown (status/size/designer) | In-memory from findMany | Already fetched for other dashboard sections; ~500 rows is trivial |
| Streak calculation | Fetch all session dates, compute in JS | No SQL window function support in Prisma; date gap detection is cleaner in JS |
| Year in Review | Mix of groupBy + in-memory | groupBy for monthly totals, in-memory for project timeline sorting |

### Why Not Raw SQL?

For this dataset scale (~500 projects, ~2000-5000 sessions over time), Prisma's groupBy/aggregate is sufficient. The overhead vs raw SQL is negligible at this volume. Benefits of staying with Prisma:

1. Type safety on results
2. No SQL injection surface
3. Consistent with rest of codebase
4. Prisma 7's query optimizer handles simple aggregates well

**Exception:** If personal best streak calculation becomes complex (needing window functions like `LAG()`), use `prisma.$queryRaw` for that single query.

### Query Layer File Structure

```
src/lib/queries/stats/
  index.ts                    <- Re-exports all query functions
  hero-stats.ts               <- getHeroStats(userId): lifetime counters
  monthly-totals.ts           <- getMonthlyTotals(userId, year): bar chart data
  calendar-days.ts            <- getCalendarDays(userId, year, month): calendar grid
  personal-bests.ts           <- getPersonalBests(userId): records board
  collection-breakdown.ts     <- getCollectionBreakdown(userId): status/size/designer
  year-in-review.ts           <- getYearInReviewData(userId, year): yearly summary
  session-history.ts          <- getSessionHistory(userId, cursor, limit): paginated
  streak-calculator.ts        <- computeCurrentStreak, computeLongestStreak
```

Each file exports a single async function that takes `userId` and optional parameters, returns typed data. No auth logic inside -- caller is responsible.

---

## Caching Strategy for Neon Free Tier

### The Problem

Neon free tier has:
- 300-800ms cold starts after 5 min inactivity
- ~770ms for aggregate queries (vs ~240ms on optimized DBs)
- Promise.all mitigates waterfall but not individual query latency

The stats page will fire 5+ queries in parallel. Without caching, worst case (cold start + 5 aggregates) = ~2-3 seconds total wall time.

### Recommended Approach: `unstable_cache` with Tag-Based Invalidation

**Why `unstable_cache` over `"use cache"` directive:**
- The project does NOT have `dynamicIO` enabled in `next.config.ts`
- Enabling `dynamicIO` is a global change affecting all routes -- too invasive for one feature
- `unstable_cache` works without config changes and is battle-tested in this Next.js version
- Can migrate to `"use cache"` later when/if `dynamicIO` is adopted project-wide

**Implementation pattern:**

```typescript
// src/lib/queries/stats/hero-stats.ts
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { StatsHeroData } from "@/types/stats";

async function computeHeroStats(userId: string): Promise<StatsHeroData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // ... aggregate queries ...
}

export function getHeroStats(userId: string) {
  return unstable_cache(
    () => computeHeroStats(userId),
    [`stats-hero-${userId}`],
    {
      tags: ["stats", `stats-${userId}`],
      revalidate: 300, // 5 minutes
    }
  )();
}
```

### Cache Invalidation

Stats change when sessions are created/edited/deleted. Add `revalidateTag("stats")` to session mutation actions:

```typescript
// In session-actions.ts createSession/updateSession/deleteSession:
import { revalidateTag } from "next/cache";

// After successful mutation:
revalidateTag("stats");
```

This invalidates ALL stats cache entries, which is correct because:
- A new session affects hero stats, monthly totals, calendar, personal bests, streaks
- Single-user app means no cross-user invalidation concerns
- 5-minute revalidate means even without invalidation, data is reasonably fresh

### Cache TTL Strategy

| Query | TTL | Rationale |
|-------|-----|-----------|
| Hero stats | 5 min (+ on-demand) | Changes with every session log |
| Monthly totals | 1 hour (+ on-demand) | Only changes when sessions are logged |
| Personal bests | 1 hour (+ on-demand) | Rarely changes; recomputed on session create |
| Calendar days | 10 min (+ on-demand) | Active month changes with session logging |
| Collection breakdown | 1 hour | Changes only when projects change status |
| Year in Review | 1 hour | Historical data rarely changes |
| Session history | 0 (no cache) | Paginated, cheap query on indexed column |

The `+ on-demand` means `revalidateTag("stats")` from session mutations provides instant freshness when the user logs a session and navigates to stats.

---

## Charting Library Integration

### Decision: Recharts 3.8.x

Already specified in `docs/tech-stack.md`. Rationale confirmed:
- React 19 compatible (v3.x has native support, no `react-is` override needed like v2.x)
- Declarative component API aligns with React patterns
- SVG-based (accessible, inspectable, print-friendly)
- Tree-shakeable -- import only `BarChart`, `Bar`, `XAxis`, `YAxis` etc.
- ~43M weekly npm downloads, actively maintained

### Server/Client Split for Charts

Charts **must** be Client Components (Recharts uses DOM measurement + D3 internally). Pattern:

```typescript
// Server Component (page.tsx)
const monthlyTotals = await getMonthlyTotals(userId, currentYear);

// Pass to Client Component
<MonthlyBarChart data={monthlyTotals} />
```

```typescript
// Client Component
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function MonthlyBarChart({ data }: { data: MonthlyTotal[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="totalStitches" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### CSS-Only vs Recharts Decision Matrix

| Chart Type | Approach | Rationale |
|------------|----------|-----------|
| Monthly bar chart | Recharts | Needs tooltips, click-to-drill, responsive sizing |
| Calendar heatmap | CSS Grid | No library needed -- 7x5 grid with conditional bg colors |
| Progress donut (collection) | CSS `conic-gradient` | Simple percentage, no library overhead |
| Hero stat numbers | Plain text | No chart needed |
| Streak display | Plain text + badge | No chart needed |
| Year timeline | CSS or Recharts | If horizontal timeline bars, CSS flex; if complex, Recharts |

### Bundle Impact

Recharts 3.8.x (tree-shaken, only BarChart + deps): ~35-45kb gzipped. Acceptable for a stats page that is not the landing page. Consider dynamic import if first-load performance is a concern:

```typescript
import dynamic from "next/dynamic";
const MonthlyBarChart = dynamic(
  () => import("@/components/features/stats/monthly-bar-chart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

---

## Patterns to Follow

### Pattern 1: Parallel Query Orchestration (Established)

Matches the existing Main Dashboard pattern exactly:

```typescript
// stats/page.tsx
export default async function StatsPage() {
  const user = await requireAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [heroStats, monthlyTotals, personalBests, calendarDays, breakdown] =
    await Promise.all([
      getHeroStats(user.id),
      getMonthlyTotals(user.id, currentYear),
      getPersonalBests(user.id),
      getCalendarDays(user.id, currentYear, currentMonth),
      getCollectionBreakdown(user.id),
    ]);

  return (
    <StatsPageClient
      heroStats={heroStats}
      monthlyTotals={monthlyTotals}
      personalBests={personalBests}
      calendarDays={calendarDays}
      collectionBreakdown={breakdown}
    />
  );
}
```

### Pattern 2: Server Actions for Dynamic Tab Data

Calendar month changes and Year in Review year changes need fresh data. Use server actions (not the query layer directly) because Client Components invoke them:

```typescript
// src/lib/actions/stats-actions.ts
"use server";

import { requireAuth } from "@/lib/auth-guard";
import { getCalendarDays } from "@/lib/queries/stats/calendar-days";

export async function fetchCalendarMonth(year: number, month: number) {
  const user = await requireAuth();
  return getCalendarDays(user.id, year, month);
}
```

### Pattern 3: Type-Safe Query Results

Follow the established `src/types/dashboard.ts` pattern -- define interfaces for all query return types:

```typescript
// src/types/stats.ts
export interface StatsHeroData {
  stitchesToday: number;
  stitchesThisWeek: number;
  stitchesThisMonth: number;
  stitchesThisYear: number;
  totalLifetime: number;
  totalSessions: number;
  totalStitchingDays: number;
  totalHoursStitched: number | null;
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching All Sessions Then Computing Everything Client-Side

**What:** Sending raw session rows to the client and computing aggregates in React state.
**Why bad:** Ships potentially thousands of rows over the wire. Increases TTFB. Makes the client do DB work.
**Instead:** Aggregate in the query layer (DB or server-side JS), send only computed results.

### Anti-Pattern 2: One Giant Query With All Stats

**What:** Single Prisma query that tries to fetch everything for all tabs.
**Why bad:** Blocks on the slowest sub-query. Neon cold start affects the entire page load.
**Instead:** Multiple focused queries in `Promise.all` -- fastest queries resolve first.

### Anti-Pattern 3: Storing Computed Stats in the Database

**What:** Adding columns like `totalStitchesThisMonth` to the User or Project model.
**Why bad:** Violates the project constraint ("calculated fields at query time, never stored in DB"). Creates stale data bugs.
**Instead:** Always compute at request time, cache at the HTTP layer with `unstable_cache`.

### Anti-Pattern 4: Client-Side Recharts Without Loading States

**What:** Using `ssr: false` dynamic import without a skeleton fallback.
**Why bad:** Flash of empty space, then chart pops in. Feels broken.
**Instead:** Always provide a `loading` prop with `<ChartSkeleton />` that matches the chart dimensions.

### Anti-Pattern 5: Cache Without Invalidation

**What:** Setting `revalidate: 3600` but never calling `revalidateTag` on mutations.
**Why bad:** User logs a session, navigates to stats, sees stale numbers. Confusing.
**Instead:** Always pair `unstable_cache` with `revalidateTag` in the relevant mutation actions.

---

## Scalability Considerations

| Concern | Current (~500 projects, ~2K sessions) | At 5K sessions | At 50K sessions |
|---------|---------------------------------------|----------------|-----------------|
| Query latency | <500ms per aggregate (warm) | Same (indexed) | Consider materialized views |
| Cold start | 300-800ms one-time | Same | Same |
| Cache hit ratio | High (single user, few updates/day) | Same | Same |
| Bundle size | +45kb (Recharts) | Same | Same |
| Memory (in-memory aggregation) | Trivial (<1MB) | Trivial (<5MB) | May need DB-level aggregation |

**Key insight:** This is a single-user app. The dataset will grow linearly with time, not exponentially with users. At typical stitching frequency (1-3 sessions/day), expect ~1000 sessions/year. Even at 10 years, 10K sessions is trivially handled by Prisma aggregate + groupBy on indexed columns.

---

## File Structure (Complete)

```
src/
  app/(dashboard)/stats/
    page.tsx                           <- Server Component orchestrator
    loading.tsx                        <- Suspense fallback (already exists)
  lib/
    queries/stats/
      index.ts                         <- Barrel exports
      hero-stats.ts                    <- Lifetime counters
      monthly-totals.ts                <- Bar chart aggregation
      calendar-days.ts                 <- Calendar grid data
      personal-bests.ts                <- Records computation
      collection-breakdown.ts          <- Status/size/designer distributions
      year-in-review.ts                <- Yearly summary
      session-history.ts               <- Paginated session list
      streak-calculator.ts             <- Streak algorithms
    actions/
      stats-actions.ts                 <- Server actions for client-invoked fetches
  components/features/stats/
    stats-page-client.tsx              <- Tab container ("use client")
    hero-counters.tsx                  <- Big number cards (server-safe)
    monthly-bar-chart.tsx              <- Recharts bar chart ("use client")
    stitching-calendar.tsx             <- Calendar grid ("use client")
    personal-bests-board.tsx           <- Record cards
    collection-insights.tsx            <- Breakdown charts
    session-history-table.tsx          <- Sortable session table ("use client")
    year-in-review/
      year-in-review.tsx               <- Year in Review container
      year-selector.tsx                <- Year dropdown
      monthly-pace.tsx                 <- Pace chart
      project-timeline.tsx             <- Timeline visualization
      top-projects.tsx                 <- Top N ranking
    chart-skeleton.tsx                 <- Loading placeholder for dynamic charts
  types/
    stats.ts                           <- All stats-related type definitions
```

---

## Build Order (Dependency-Driven)

```
Phase 1: Data Layer (no UI dependencies)
  1. src/types/stats.ts -- type definitions
  2. src/lib/queries/stats/ -- all query functions with tests
  3. src/lib/actions/stats-actions.ts -- server actions wrapping queries
  4. Cache integration (unstable_cache + revalidateTag in session-actions)

Phase 2: Core UI (depends on Phase 1 types)
  5. stats/page.tsx -- Server Component orchestrating queries
  6. stats-page-client.tsx -- Tab structure
  7. hero-counters.tsx -- Simplest visual component
  8. personal-bests-board.tsx -- Record cards

Phase 3: Charts (depends on Phase 1 data, Phase 2 structure)
  9. Install recharts (npm install recharts@3.8.1)
  10. monthly-bar-chart.tsx -- Primary chart with drill-down
  11. stitching-calendar.tsx -- CSS grid calendar
  12. collection-insights.tsx -- Breakdown visualization

Phase 4: Advanced Features (depends on Phase 2-3)
  13. session-history-table.tsx -- Paginated table
  14. year-in-review/ -- Complete year summary
  15. "New record!" toast on session logging
```

---

## Integration Points with Existing Code

| Existing Code | Integration | Change Required |
|---------------|-------------|-----------------|
| `session-actions.ts` createSession | Add `revalidateTag("stats")` | 1 line addition |
| `session-actions.ts` updateSession | Add `revalidateTag("stats")` | 1 line addition |
| `session-actions.ts` deleteSession | Add `revalidateTag("stats")` | 1 line addition |
| `stats/page.tsx` (placeholder) | Replace with real Server Component | Full rewrite |
| `stats/loading.tsx` | Keep existing loading skeleton | No change needed |
| `src/types/dashboard.ts` | Reference pattern for new `stats.ts` | No change |
| `src/lib/db.ts` (Prisma singleton) | Used by query layer | No change |
| `src/lib/auth-guard.ts` | Used in page.tsx and server actions | No change |
| Navigation (MainNav) | Already has /stats link | No change |

---

## Sources

- Existing codebase: `src/lib/actions/dashboard-actions.ts`, `project-dashboard-actions.ts`
- [Next.js unstable_cache docs](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [Next.js cacheTag docs](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Next.js "use cache" directive docs](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Neon latency benchmarks](https://neon.com/docs/guides/benchmarking-latency)
- [Recharts GitHub releases](https://github.com/recharts/recharts/releases)
- [Prisma aggregation docs](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing)
- Design reference: `product-plan/sections/stitching-sessions-and-statistics/`
