# Phase 20: Activity Visualization & Calendar - Research

**Researched:** 2026-05-17
**Domain:** Data visualization, calendar UI, server-side pagination, Recharts charting, date arithmetic
**Confidence:** HIGH

## Summary

Phase 20 builds the Activity tab content for the stats page. It introduces 5 new query modules (monthly totals, calendar days, session history, pace metrics, day-of-week patterns), 7 new components (ActivityOverview, PaceCards, MonthlyStitchChart, MonthlyDrillDown, DayOfWeekChart, StitchingCalendar, SessionHistoryTable), and 2 new chart configs. All data sources already exist in the StitchSession model -- no schema migrations needed. The established patterns from Phases 18-19 (unstable_cache, ChartContainer+chartConfig, Promise.all fetching, semantic tokens) apply directly.

The key new patterns are: (1) Recharts BarChart click-to-expand interaction for the monthly chart drill-down, (2) a custom calendar grid component with project color pills, (3) server-side pagination with nuqs `createSearchParamsCache` for the session history table, and (4) on-demand data fetching via server actions for calendar month navigation and chart drill-down.

**Primary recommendation:** Structure in 3 waves: Wave 1 (types + queries + chart configs), Wave 2 (PaceCards + charts + calendar), Wave 3 (session history table + ActivityOverview wiring). Install shadcn `table` and `pagination` components in Wave 0/1.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Recharts BarChart (not CSS bars from DesignOS) for monthly stitch chart -- consistent with Phase 18/19 approach
- **D-02:** Click-to-drill-down shows inline expand panel below the chart (not floating popover)
- **D-03:** Default time range is current calendar year (Jan-Dec), 12 bars
- **D-04:** Year selector with prev/next arrows near the heading
- **D-05:** Fetch per month for calendar -- current month on initial load, server action for navigation
- **D-06:** Project colors use `--chart-1` through `--chart-5` CSS variables, cycling deterministically
- **D-07:** Clicking a session pill navigates to `/projects/[id]`
- **D-08:** Mobile: compact grid with truncation, colored dots instead of pills, tap day for detail
- **D-09:** Server-side pagination with 20-25 sessions per page and prev/next controls
- **D-10:** Session history within the Activity tab, not a separate tab
- **D-11:** View only -- no Edit button per row
- **D-12:** Sort + project filter -- sortable by Date, Stitches, Time; project dropdown filter
- **D-13:** Day-of-week patterns as small bar chart (7 bars, Mon-Sun)
- **D-14:** Rolling averages and MoM pace as stats cards row
- **D-15:** Stitch rate with trend in the pace cards row
- **D-16:** Top-to-bottom order: pace cards, monthly chart, day-of-week chart, calendar, session table

### Claude's Discretion
- Exact number of sessions per page (20 vs 25)
- Inline expand panel design for monthly chart drill-down (card vs simple list)
- Day-of-week chart positioning relative to monthly chart (side-by-side on desktop vs stacked)
- Calendar day cell compact mode breakpoint (sm vs md)
- Project filter dropdown component choice (simple select vs combobox)
- Whether pace cards row uses the same green-accent MetricsBar pattern from Phase 19 or lighter approach
- Animation/transition for monthly chart drill-down expand/collapse

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIZ-01 | Monthly stitch bar chart (12 bars) with click-to-drill-down | Recharts BarChart onClick + Cell pattern verified; inline expand panel replaces DesignOS popover |
| VIZ-02 | Stitching calendar (month-view grid with project color-coding) | Custom calendar grid component; project color assignment via `--chart-1..5`; today indicator |
| VIZ-03 | Navigate between months on stitching calendar | Server action for month data fetch; client-side month state; long-TTL cache for historical months |
| VIZ-04 | Session history (sortable, paginated table) | nuqs `createSearchParamsCache` for server-side URL params; shadcn `table` + `pagination` components |
| VIZ-05 | Day-of-week stitching pattern | Recharts BarChart (7 bars Mon-Sun); query groups sessions by day-of-week |
| VIZ-06 | Rolling averages (7/30/90-day stitches/day) | Prisma aggregate queries with date boundaries from getUserTimezone |
| VIZ-07 | Month-over-month pace trends | Compare current month sum vs prior month sum; percentage calculation |
| INS-04 | Stitch rate (stitches/hour) when time data available | Filter sessions with non-null timeSpentMinutes; compute sum(stitchCount)/sum(timeSpentMinutes)*60 |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Monthly totals query | Database / Storage | API / Backend | Prisma groupBy on StitchSession.date with userId filter |
| Calendar day data query | Database / Storage | API / Backend | Per-month query, timezone-aware date boundaries |
| Session history pagination | API / Backend | Frontend Server | Server-side sort/filter/paginate via searchParams, rendered in RSC |
| Pace metrics calculation | API / Backend | -- | Rolling averages computed from DB aggregates |
| Chart rendering | Browser / Client | -- | Recharts requires client-side rendering (canvas/SVG) |
| Calendar grid rendering | Browser / Client | -- | Interactive month navigation, day click handlers |
| Session table interaction | Browser / Client | -- | Sort toggles update URL params, triggering RSC re-render |
| Data caching | Frontend Server (SSR) | -- | unstable_cache with revalidateTag("stats") |

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 3.8.0 | Bar charts (monthly, day-of-week) | Already installed (Phase 18); shadcn chart wraps it [VERIFIED: node_modules] |
| date-fns | 4.1.0 | Date arithmetic, formatting, boundaries | Already installed; used in timezone.ts [VERIFIED: node_modules] |
| @date-fns/tz | 1.4.1 | Timezone-aware date operations | Already installed; TZDate used for local boundaries [VERIFIED: node_modules] |
| nuqs | 2.8.9 | URL query state (sorting, pagination, filtering) | Already installed; used in StatsPageShell, gallery filters [VERIFIED: node_modules] |
| lucide-react | 1.8.0 | Icons (ChevronLeft/Right, ArrowUpDown, Camera, TrendingUp/Down) | Already installed; project standard [VERIFIED: package.json] |

### New shadcn Components to Install

| Component | Purpose | Install Command |
|-----------|---------|----------------|
| `table` | Session history table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell) | `npx shadcn@latest add table` |
| `pagination` | Session history prev/next page controls | `npx shadcn@latest add pagination` |

**Installation:**
```bash
npx shadcn@latest add table pagination
```

### No New npm Dependencies

All required packages are already installed. No `npm install` needed. [VERIFIED: package.json scan]

## Architecture Patterns

### System Architecture Diagram

```
[Stats Page (RSC)] ──── Promise.all ──┬── getMonthlyTotals(year)
                                      ├── getCalendarDays(month, year)
                                      ├── getSessionHistory(page, sort, filter)
                                      ├── getPaceMetrics()
                                      └── getDayOfWeekPattern()
                                              │
                                              ▼
                                    [unstable_cache layer]
                                              │
                                              ▼
                                    [Prisma queries → PostgreSQL]
                                              │
                                              ▼
[ActivityOverview (Server)] ── passes data as props to ──┐
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         ├── PaceCards (Server) ── static display
         ├── MonthlyStitchChart (Client) ── Recharts BarChart
         │     └── MonthlyDrillDown (Client) ── inline expand
         │           └── on bar click → server action getDailyBreakdown()
         ├── DayOfWeekChart (Client) ── Recharts BarChart
         ├── StitchingCalendar (Client) ── custom grid
         │     └── on month nav → server action getCalendarDays()
         └── SessionHistoryTable (Client) ── shadcn Table
               └── sort/filter/page → URL params → RSC re-render
```

### Data Flow: Two Patterns

**Pattern A: Server-Rendered Initial Data (session table)**
```
URL params → createSearchParamsCache.parse(searchParams) → query(page, sort, filter)
  → data passed as props → SessionHistoryTable renders → user clicks sort/page
  → URL params change → full RSC re-render cycle
```

**Pattern B: Client-Side Data Fetching (calendar, drill-down, year nav)**
```
Initial data from RSC → MonthlyStitchChart renders → user clicks bar
  → client calls server action getDailyBreakdown(month, year)
  → response updates local state → drill-down panel shows

Initial data from RSC → StitchingCalendar renders → user navigates month
  → client calls server action getCalendarDays(newMonth, newYear)
  → response updates local state → calendar re-renders
```

### Recommended Project Structure

```
src/
├── lib/
│   ├── queries/stats/
│   │   ├── monthly-totals.ts          # getMonthlyTotals(userId, year)
│   │   ├── monthly-totals.test.ts
│   │   ├── calendar-days.ts           # getCalendarDays(userId, month, year)
│   │   ├── calendar-days.test.ts
│   │   ├── session-history.ts         # getSessionHistory(userId, page, sort, dir, projectId?)
│   │   ├── session-history.test.ts
│   │   ├── pace-metrics.ts            # getPaceMetrics(userId)
│   │   ├── pace-metrics.test.ts
│   │   ├── day-of-week.ts             # getDayOfWeekPattern(userId)
│   │   ├── day-of-week.test.ts
│   │   ├── daily-breakdown.ts         # getDailyBreakdown(userId, month, year)
│   │   ├── daily-breakdown.test.ts
│   │   └── index.ts                   # re-exports
│   ├── actions/
│   │   └── stats-actions.ts           # "use server" wrappers for client-triggered queries
│   │   └── stats-actions.test.ts
│   └── chart-configs.ts               # + monthlyBarConfig, dayOfWeekConfig
│
├── components/features/stats/
│   ├── activity-overview.tsx           # Server Component layout wrapper
│   ├── activity-overview.test.tsx
│   ├── pace-cards.tsx                  # Server Component (static display)
│   ├── pace-cards.test.tsx
│   ├── monthly-stitch-chart.tsx        # Client Component (Recharts + click)
│   ├── monthly-stitch-chart.test.tsx
│   ├── monthly-drill-down.tsx          # Client Component (inline expand)
│   ├── monthly-drill-down.test.tsx
│   ├── day-of-week-chart.tsx           # Client Component (Recharts)
│   ├── day-of-week-chart.test.tsx
│   ├── stitching-calendar.tsx          # Client Component (custom grid)
│   ├── stitching-calendar.test.tsx
│   ├── session-history-table.tsx       # Client Component (shadcn Table)
│   └── session-history-table.test.tsx
│
├── types/
│   └── stats.ts                        # + new activity type interfaces
│
└── app/(dashboard)/stats/
    ├── page.tsx                         # + searchParams parsing, activity queries
    └── search-params.ts                # createSearchParamsCache definition
```

### Pattern 1: Query with unstable_cache and Parameterized Cache Key

**What:** Every stats query follows the same compute-then-cache pattern with unique cache keys that include all query parameters.
**When to use:** All 6 new query functions.
**Example:**
```typescript
// Source: Established in hero-stats.ts, collection-breakdown.ts [VERIFIED: codebase]
async function computeMonthlyTotals(userId: string, year: number): Promise<MonthlyTotal[]> {
  const tz = getUserTimezone(userId);
  // ... Prisma queries with timezone-aware boundaries
}

export function getMonthlyTotals(userId: string, year: number) {
  const currentYear = new Date().getFullYear();
  return unstable_cache(
    () => computeMonthlyTotals(userId, year),
    [`stats-monthly-${userId}-${year}`],  // Include ALL params in cache key
    {
      tags: ["stats"],
      revalidate: year < currentYear ? 3600 : 300,  // 1hr historical, 5min current
    },
  )();
}
```

**Critical:** Cache key MUST include all parameters. Phase 19 had a bug (WR-01/WR-02) where the `limit` parameter was missing from designer/genre query cache keys. [VERIFIED: code review findings]

### Pattern 2: Recharts BarChart with Click Handler

**What:** BarChart with per-bar click events using the `onClick` prop on the `Bar` component and `Cell` for conditional styling.
**When to use:** MonthlyStitchChart (click-to-expand), DayOfWeekChart (display-only).
**Example:**
```typescript
// Source: Context7 /recharts/recharts, verified against existing size-category-chart.tsx
<ChartContainer config={monthlyBarConfig} className="h-[250px] w-full">
  <BarChart data={data} accessibilityLayer>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis type="number" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="totalStitches" radius={4} onClick={handleBarClick}>
      {data.map((entry, index) => (
        <Cell
          key={entry.month}
          fill={index === activeIndex ? "var(--chart-1)" : "hsl(var(--chart-1) / 0.6)"}
          cursor={entry.totalStitches > 0 ? "pointer" : "default"}
        />
      ))}
    </Bar>
  </BarChart>
</ChartContainer>
```
[VERIFIED: Recharts Bar onClick from Context7 + existing Cell pattern from size-category-chart.tsx]

### Pattern 3: Server Action for Client-Triggered Queries

**What:** Thin "use server" wrapper that calls the cached query function, used by client components for on-demand data fetching (calendar month navigation, drill-down).
**When to use:** Calendar month changes, monthly chart drill-down, year navigation.
**Example:**
```typescript
// src/lib/actions/stats-actions.ts
"use server";

import { requireAuth } from "@/lib/auth-guard";
import { getCalendarDays, getDailyBreakdown, getMonthlyTotals } from "@/lib/queries/stats";

export async function fetchCalendarMonth(month: number, year: number) {
  const user = await requireAuth();
  return getCalendarDays(user.id, month, year);
}

export async function fetchDailyBreakdown(month: number, year: number) {
  const user = await requireAuth();
  return getDailyBreakdown(user.id, month, year);
}

export async function fetchMonthlyTotals(year: number) {
  const user = await requireAuth();
  return getMonthlyTotals(user.id, year);
}
```
[VERIFIED: Pattern matches existing session-actions.ts with requireAuth + "use server"]

### Pattern 4: nuqs Server-Side Search Params Cache (NEW to project)

**What:** Parse URL query params in the server component for session history pagination/sorting, making them available to the RSC tree without prop drilling.
**When to use:** Session history table server-side rendering.
**Example:**
```typescript
// src/app/(dashboard)/stats/search-params.ts
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const SORT_FIELDS = ["date", "stitches", "time"] as const;
const SORT_DIRS = ["asc", "desc"] as const;

export const statsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringLiteral(SORT_FIELDS).withDefault("date"),
  dir: parseAsStringLiteral(SORT_DIRS).withDefault("desc"),
  project: parseAsString.withDefault("all"),
});
```
[VERIFIED: nuqs createSearchParamsCache from Context7 + existing nuqs patterns in codebase]

### Pattern 5: Inline Expand/Collapse with CSS Grid Rows

**What:** Animated expand/collapse for the monthly drill-down panel using CSS `grid-template-rows: 0fr` to `1fr` transition.
**When to use:** MonthlyDrillDown panel below the chart.
**Example:**
```typescript
// Expand/collapse container
<div
  className="grid transition-all duration-300"
  style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
>
  <div className="overflow-hidden">
    {/* Drill-down content */}
  </div>
</div>
```
[ASSUMED: CSS grid-rows animation is a standard pattern; verify browser support is universal for this project's targets]

### Anti-Patterns to Avoid

- **Client-side sorting with large datasets:** Session history MUST sort server-side. With 500+ projects and potentially thousands of sessions, client-side sort is untenable. Use URL params + RSC re-render pattern. [VERIFIED: D-09 mandates server-side pagination]
- **Missing cache key parameters:** Every query parameter (year, month, page, sort, direction, projectId) MUST appear in the unstable_cache key string. Phase 19 WR-01/WR-02 bugs were caused by this exact mistake. [VERIFIED: code review findings]
- **Hardcoded timezone offsets:** All date boundary calculations MUST use getUserTimezone() + TZDate. Never use `new Date()` for boundary math. [VERIFIED: existing timezone.ts pattern]
- **Nesting forms in the session table:** The filter/sort controls are NOT in a form. Use button onClick handlers and nuqs URL state management. [VERIFIED: CLAUDE.md guardrail]
- **Importing from "use client" modules in Server Components:** PaceCards and ActivityOverview are Server Components. They must NOT import from client modules like `chart.tsx`. Utility functions go in non-client files. [VERIFIED: base-ui-patterns.md rule]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar charts | Custom SVG bars | Recharts BarChart + ChartContainer | Tooltips, accessibility, responsive container, animation |
| Date arithmetic | Manual month/year math | date-fns startOfMonth, endOfMonth, addMonths, getDay | Edge cases: DST transitions, month lengths, year boundaries |
| Timezone-aware dates | UTC offset constants | @date-fns/tz TZDate + getUserTimezone() | Single-user now, but future-proofs for per-user timezone |
| URL state management | Manual searchParams parsing | nuqs createSearchParamsCache | Type-safe, handles serialization, integrates with Next.js 16 |
| Data table | Custom table HTML | shadcn `table` component | Consistent styling, accessible markup, design system tokens |
| Pagination controls | Custom prev/next buttons | shadcn `pagination` component | Accessible, styled, consistent with design system |
| Number formatting | Manual toLocaleString | Existing patterns in codebase | Consistency with hero stats, session table |
| Time formatting | Custom h/m logic | Existing `formatTime()` from `@/lib/utils/format-time` | Already tested, used by lifetime-counters and session-table |

**Key insight:** The query complexity is in the date math and aggregations, not in custom UI widgets. Rely on Recharts for visualization and date-fns for all date boundary computations.

## Common Pitfalls

### Pitfall 1: Cache Key Missing Parameters
**What goes wrong:** Two different queries return the same cached result because the cache key doesn't differentiate them.
**Why it happens:** Forgetting to include a query parameter (year, month, page number, sort field) in the `unstable_cache` key array.
**How to avoid:** Template literal that includes ALL function parameters: `` `stats-monthly-${userId}-${year}` ``, `` `stats-calendar-${userId}-${month}-${year}` ``, etc.
**Warning signs:** Data doesn't change when navigating between months/years, or pagination shows the same page for different page numbers.

### Pitfall 2: Timezone Boundary Errors in Monthly/Daily Aggregations
**What goes wrong:** A session logged at 11pm MDT on Jan 31 shows up in the February bar because the query uses UTC midnight boundaries.
**Why it happens:** Using `new Date(year, month, 1)` without timezone awareness.
**How to avoid:** Always use `TZDate.tz(timezone)` + date-fns boundary functions for all date range calculations. The existing `getUserTimezone()` + `getLocalDayBoundaries()` pattern handles this correctly.
**Warning signs:** Stitch counts don't match between monthly chart and calendar for the same month.

### Pitfall 3: Recharts Click Handler Receives null for Empty Bars
**What goes wrong:** Clicking a bar with 0 stitches triggers the drill-down with no data, or throws an error.
**Why it happens:** Recharts fires onClick for all bars including zero-height ones.
**How to avoid:** Guard the click handler: `if (entry.totalStitches === 0) return;`. Also set `cursor="default"` on zero-value cells.
**Warning signs:** Empty drill-down panel appears when clicking months with no activity.

### Pitfall 4: Calendar Grid Off-by-One on Month Boundaries
**What goes wrong:** Calendar shows 32 days, or misaligns weekdays, or padding cells are wrong.
**Why it happens:** JavaScript months are 0-indexed but displayed as 1-indexed. `new Date(year, month + 1, 0).getDate()` gets last day of month, but mixing 0-indexed and 1-indexed is error-prone.
**How to avoid:** Use date-fns `getDaysInMonth()`, `getDay()`, `startOfMonth()` instead of manual Date constructor arithmetic. Write explicit test cases for Feb (28/29), months starting on Sunday, months starting on Saturday.
**Warning signs:** Calendar looks wrong for February, or December wraps into January incorrectly.

### Pitfall 5: Session History Pagination Count Drift
**What goes wrong:** "Page 3 of 5" but page 5 is empty, or the last page has 1 item when it should have 25.
**Why it happens:** Total count and paginated results are separate queries -- if a session is added/deleted between them, counts don't match.
**How to avoid:** Run count + paginated fetch in a single query execution (or accept eventual consistency since stats page has 5-min cache). Use `Math.ceil(total / pageSize)` for total pages and clamp current page.
**Warning signs:** Empty last page, or "Page X of Y" where X > Y.

### Pitfall 6: nuqs Server Cache Parse Must Happen in Page Component
**What goes wrong:** `searchParamsCache.get()` throws "Empty Search Params Cache" error in a child server component.
**Why it happens:** `createSearchParamsCache.parse(searchParams)` was never called in the page component before accessing the cache in a child.
**How to avoid:** Always call `await statsSearchParamsCache.parse(searchParams)` in `page.tsx` before rendering any child that calls `.get()`.
**Warning signs:** Runtime error mentioning "NUQS-500" or "Empty Search Params Cache".

### Pitfall 7: Stitch Rate Division by Zero
**What goes wrong:** `NaN` or `Infinity` displayed for stitch rate when no sessions have time data.
**Why it happens:** `totalStitches / totalMinutes` when `totalMinutes` is 0.
**How to avoid:** Guard: if no sessions have `timeSpentMinutes`, return `null` for stitch rate. UI shows "--" when null.
**Warning signs:** "NaN stitches/hr" or "Infinity stitches/hr" displayed.

## Code Examples

### Monthly Totals Query Structure
```typescript
// Source: Prisma groupBy pattern from collection-breakdown.ts [VERIFIED: codebase]
async function computeMonthlyTotals(userId: string, year: number): Promise<MonthlyTotal[]> {
  const tz = getUserTimezone(userId);
  const yearStart = startOfMonth(TZDate.tz(tz, year, 0, 1));  // Jan 1
  const yearEnd = endOfMonth(TZDate.tz(tz, year, 11, 1));     // Dec 31

  const sessions = await prisma.stitchSession.groupBy({
    by: ["date"],
    where: {
      project: { userId },
      date: { gte: yearStart, lte: yearEnd },
    },
    _sum: { stitchCount: true },
  });

  // Aggregate by month (sessions are per-day, need to bucket into months)
  const monthBuckets = new Map<number, number>();
  for (let m = 0; m < 12; m++) monthBuckets.set(m, 0);

  for (const session of sessions) {
    const sessionDate = TZDate.tz(tz, session.date);
    const month = sessionDate.getMonth();
    monthBuckets.set(month, (monthBuckets.get(month) ?? 0) + (session._sum.stitchCount ?? 0));
  }

  const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return MONTH_LABELS.map((label, i) => ({
    month: label,
    totalStitches: monthBuckets.get(i) ?? 0,
    year,
  }));
}
```

### Pace Metrics Query Structure
```typescript
// Source: hero-stats.ts aggregate pattern [VERIFIED: codebase]
async function computePaceMetrics(userId: string): Promise<PaceMetricsData> {
  const tz = getUserTimezone(userId);
  const now = TZDate.tz(tz);

  // Rolling windows
  const day7Ago = subDays(now, 7);
  const day30Ago = subDays(now, 30);
  const day90Ago = subDays(now, 90);

  // Current month boundaries
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [avg7, avg30, avg90, thisMonth, lastMonth, rateData] = await Promise.all([
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: day7Ago } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: day30Ago } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: day90Ago } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: currentMonthStart } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { stitchCount: true },
    }),
    // Stitch rate: only sessions with time data
    prisma.stitchSession.aggregate({
      where: { project: { userId }, timeSpentMinutes: { not: null } },
      _sum: { stitchCount: true, timeSpentMinutes: true },
    }),
  ]);

  const totalMinutes = rateData._sum.timeSpentMinutes ?? 0;
  const stitchRate = totalMinutes > 0
    ? Math.round((rateData._sum.stitchCount ?? 0) / totalMinutes * 60)
    : null;

  return {
    avg7Day: Math.round((avg7._sum.stitchCount ?? 0) / 7),
    avg30Day: Math.round((avg30._sum.stitchCount ?? 0) / 30),
    avg90Day: Math.round((avg90._sum.stitchCount ?? 0) / 90),
    thisMonthStitches: thisMonth._sum.stitchCount ?? 0,
    lastMonthStitches: lastMonth._sum.stitchCount ?? 0,
    stitchRate,
  };
}
```

### Session History Paginated Query
```typescript
// Source: Prisma findMany + count pattern [VERIFIED: Prisma docs]
async function computeSessionHistory(
  userId: string,
  page: number,
  sortField: string,
  sortDir: string,
  projectId: string | null,
  pageSize: number = 25,
): Promise<SessionHistoryData> {
  const where: Prisma.StitchSessionWhereInput = {
    project: { userId },
    ...(projectId && projectId !== "all" ? { projectId } : {}),
  };

  const orderBy = {
    [sortField === "stitches" ? "stitchCount" : sortField === "time" ? "timeSpentMinutes" : "date"]:
      sortDir as "asc" | "desc",
  };

  const [sessions, total] = await Promise.all([
    prisma.stitchSession.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        project: {
          select: { id: true, chart: { select: { name: true } } },
        },
      },
    }),
    prisma.stitchSession.count({ where }),
  ]);

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      date: s.date,
      projectId: s.project.id,
      projectName: s.project.chart.name,
      stitchCount: s.stitchCount,
      timeSpentMinutes: s.timeSpentMinutes,
      hasPhoto: !!s.photoKey,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
```

### Calendar Day Data Query
```typescript
// Source: Prisma findMany with date range [VERIFIED: codebase pattern]
async function computeCalendarDays(
  userId: string,
  month: number,  // 1-based (January = 1)
  year: number,
): Promise<CalendarDayData[]> {
  const tz = getUserTimezone(userId);
  const monthStart = startOfMonth(TZDate.tz(tz, year, month - 1, 1));
  const monthEnd = endOfMonth(TZDate.tz(tz, year, month - 1, 1));

  const sessions = await prisma.stitchSession.findMany({
    where: {
      project: { userId },
      date: { gte: monthStart, lte: monthEnd },
    },
    select: {
      date: true,
      stitchCount: true,
      projectId: true,
      project: { select: { chart: { select: { name: true } } } },
    },
    orderBy: { date: "asc" },
  });

  // Group sessions by date string (YYYY-MM-DD in user timezone)
  const dayMap = new Map<string, CalendarSession[]>();
  for (const session of sessions) {
    const localDate = TZDate.tz(tz, session.date);
    const dateKey = format(localDate, "yyyy-MM-dd");
    const existing = dayMap.get(dateKey) ?? [];
    existing.push({
      projectId: session.projectId,
      projectName: session.project.chart.name,
      stitchCount: session.stitchCount,
    });
    dayMap.set(dateKey, existing);
  }

  return Array.from(dayMap.entries()).map(([date, sessions]) => ({ date, sessions }));
}
```

### Project Color Assignment
```typescript
// Source: DesignOS StitchingCalendar.tsx projectColorStyles [VERIFIED: codebase]
// Use CSS variables for design system consistency
const CHART_COLORS = [
  "var(--chart-1)",  // emerald
  "var(--chart-2)",  // amber
  "var(--chart-3)",  // sky
  "var(--chart-4)",  // violet
  "var(--chart-5)",  // rose
] as const;

function getProjectColorMap(projectIds: string[]): Map<string, number> {
  const sorted = [...new Set(projectIds)].sort();  // deterministic order
  return new Map(sorted.map((id, i) => [id, i % CHART_COLORS.length]));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side sort/filter for tables | Server-side via URL params + RSC | Next.js App Router (2023+) | Better performance for large datasets |
| Custom date pickers | date-fns v4 with TZDate | date-fns 4.0 (2024) | First-class timezone support without moment.js |
| CSS height animation | CSS grid-template-rows 0fr→1fr | 2023 (all modern browsers) | Smooth expand/collapse without JavaScript height calculation |
| Manual search params parsing | nuqs createSearchParamsCache | nuqs 2.x (2024) | Type-safe, RSC-compatible URL state |

**Deprecated/outdated:**
- Recharts `ResponsiveContainer`: Not needed when using shadcn `ChartContainer` which handles responsiveness [VERIFIED: existing chart components don't use ResponsiveContainer]
- Manual URL params via `useSearchParams()`: Use nuqs instead for type-safe parsing and serialization [VERIFIED: project standard]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS grid-template-rows 0fr→1fr transition works for drill-down expand/collapse | Architecture Patterns | Low -- fallback is max-height transition or no animation |
| A2 | Prisma groupBy on DateTime field returns individual day rows that need client-side month bucketing | Code Examples | Medium -- if Prisma can do month-level grouping via raw SQL, query is simpler |
| A3 | 25 sessions per page is appropriate for the data volume | Discretion areas | Low -- easily adjustable |
| A4 | Session history stitch rate trend comparison uses 30-day rolling window | Code Examples | Low -- UI just needs a direction arrow, window is flexible |

## Open Questions

1. **Recharts Bar onClick type signature in v3.8**
   - What we know: Context7 confirms `onClick` on Bar receives `(data, index)`. The data object contains the entry's fields.
   - What's unclear: Exact TypeScript types for the callback parameters in Recharts 3.8 (may be generic).
   - Recommendation: Type the handler parameter as the data shape and verify at implementation time.

2. **Server action response size for calendar days**
   - What we know: A month with heavy stitching could have 30+ days x multiple sessions per day.
   - What's unclear: Whether the serialized response size is a concern.
   - Recommendation: Not likely an issue (max ~100 session records per month), but monitor.

3. **nuqs createSearchParamsCache with Next.js 16 Promise searchParams**
   - What we know: Next.js 16 uses `searchParams: Promise<SearchParams>`, and nuqs 2.8.9 supports this.
   - What's unclear: Whether `await cache.parse(searchParams)` works with the Promise-based searchParams in Next.js 16 or needs `await searchParams` first.
   - Recommendation: Test during implementation. The supplies page shows the `await searchParams` pattern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x (jsdom environment) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIZ-01 | Monthly stitch bar chart renders 12 bars, click opens drill-down | unit | `npx vitest run src/components/features/stats/monthly-stitch-chart.test.tsx -x` | Wave 1 |
| VIZ-02 | Calendar grid renders day cells with session pills | unit | `npx vitest run src/components/features/stats/stitching-calendar.test.tsx -x` | Wave 2 |
| VIZ-03 | Calendar month navigation triggers server action | unit | `npx vitest run src/components/features/stats/stitching-calendar.test.tsx -x` | Wave 2 |
| VIZ-04 | Session table renders rows, sorts, paginates | unit | `npx vitest run src/components/features/stats/session-history-table.test.tsx -x` | Wave 2 |
| VIZ-05 | Day-of-week chart renders 7 bars | unit | `npx vitest run src/components/features/stats/day-of-week-chart.test.tsx -x` | Wave 1 |
| VIZ-06 | Pace metrics query returns rolling averages | unit | `npx vitest run src/lib/queries/stats/pace-metrics.test.ts -x` | Wave 1 |
| VIZ-07 | MoM comparison shows correct trend direction | unit | `npx vitest run src/components/features/stats/pace-cards.test.tsx -x` | Wave 1 |
| INS-04 | Stitch rate computed correctly, null when no time data | unit | `npx vitest run src/lib/queries/stats/pace-metrics.test.ts -x` | Wave 1 |

### Additional Test Coverage

| Component/Module | Test Type | Focus Areas |
|-----------------|-----------|-------------|
| monthly-totals.ts | unit | 12-month aggregation, timezone boundaries, empty year |
| calendar-days.ts | unit | Day grouping, timezone boundaries, empty month |
| session-history.ts | unit | Pagination math, sort ordering, project filter, empty results |
| day-of-week.ts | unit | 7-day distribution, timezone boundaries |
| daily-breakdown.ts | unit | Daily entries for drill-down, project names |
| stats-actions.ts | unit | Auth guard, delegation to query functions |
| activity-overview.tsx | unit | Layout order, empty state |
| pace-cards.tsx | unit | Trend arrow direction, stitch rate null handling |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- Install shadcn `table` and `pagination` components: `npx shadcn@latest add table pagination`
- No new test infrastructure needed -- existing Vitest setup, recharts mocks, nuqs testing adapter, and Prisma mock patterns all apply

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | `requireAuth()` in all server actions and page.tsx |
| V3 Session Management | No | Read-only page, no session mutations |
| V4 Access Control | Yes | All queries filter by `userId` from auth; server actions call `requireAuth()` |
| V5 Input Validation | Yes | nuqs parsers validate URL params; page/sort/dir have constrained types |
| V6 Cryptography | No | No encryption needed for read-only stats |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on session history | Tampering | All queries include `project: { userId }` filter from `requireAuth()` |
| URL param injection (sort/page) | Tampering | nuqs parsers with constrained literal types reject invalid values |
| Unauthorized data access | Information Disclosure | Server actions call `requireAuth()` before any query |

## Sources

### Primary (HIGH confidence)
- Context7 `/recharts/recharts` -- BarChart onClick, Cell, ChartTooltip patterns
- Context7 `/47ng/nuqs` -- createSearchParamsCache, parseAsInteger, parseAsStringLiteral
- Codebase `src/lib/queries/stats/hero-stats.ts` -- unstable_cache + timezone pattern
- Codebase `src/components/features/stats/size-category-chart.tsx` -- Recharts + ChartContainer pattern
- Codebase `src/components/features/stats/metrics-bar.tsx` -- PaceCards styling reference
- Codebase `src/components/features/stats/stats-page-shell.tsx` -- activityContent slot
- Codebase `product-plan/sections/stitching-sessions-and-statistics/` -- DesignOS reference components
- npm registry: recharts 3.8.0, date-fns 4.1.0, nuqs 2.8.9 (all pinned in package.json)

### Secondary (MEDIUM confidence)
- Phase 18/19 CONTEXT.md -- Architecture decisions (cache strategy, chart approach, query layer)
- Phase 19 code review findings -- WR-01/WR-02 cache key bugs (informs pitfall documentation)
- nuqs docs -- createSearchParamsCache with Next.js 16 Promise searchParams

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified in node_modules
- Architecture: HIGH -- extends established Phase 18/19 patterns with well-documented additions
- Pitfalls: HIGH -- several verified from actual Phase 19 bugs (cache keys), others from established patterns
- Query patterns: MEDIUM -- Prisma groupBy for monthly aggregation approach assumed (A2), may benefit from raw SQL

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable -- all dependencies pinned, no version changes expected)
