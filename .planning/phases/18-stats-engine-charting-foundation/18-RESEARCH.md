# Phase 18: Stats Engine & Charting Foundation - Research

**Researched:** 2026-05-17
**Domain:** Server-side stats query layer, caching infrastructure, charting library integration
**Confidence:** HIGH

## Summary

Phase 18 builds the invisible engine that phases 19-21 consume: timezone-aware query functions, a cache layer with smart invalidation, and Recharts integrated with the design system. No UI design work is needed beyond a single proof-of-concept chart on a permanent stats page shell. The entire data surface already exists (StitchSession, Project, Chart, supply junction tables) -- no schema migrations required.

Two new npm packages: `recharts@3.8.1` (installed via `npx shadcn@latest add chart`) and `date-fns@4.1.0` plus `@date-fns/tz@1.4.1` for timezone-aware date arithmetic. The query layer lives in a new `src/lib/queries/stats/` directory as pure functions (no `"use server"`) that receive `userId` and return typed data. Caching uses `unstable_cache` with `revalidateTag("stats")` -- the project does NOT have `dynamicIO` enabled, so `"use cache"` is not an option without a global config change.

**Primary recommendation:** Build the query layer with full test coverage first (pure functions, easy to TDD), then add caching and invalidation, then install Recharts and render one chart to prove the integration works end-to-end.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `unstable_cache` with `revalidateTag("stats")` and per-query TTLs -- 5-minute TTL for hero/activity stats, 1-hour TTL for historical data (monthly totals, personal bests)
- **D-02:** Add `revalidateTag("stats")` calls to session-actions.ts (create/update/delete) alongside existing `revalidatePath` calls
- **D-03:** Use `Promise.all` for parallel query execution on the stats page (existing dashboard pattern)
- **D-04:** Use a `STATS_TIMEZONE` environment variable set to `America/Denver` (Mountain Time), accessed via a `getUserTimezone(userId: string)` abstraction function
- **D-05:** All query functions call `getUserTimezone()` -- never read the env var directly. Future-proofed for multi-user
- **D-06:** date-fns 4.1.0 timezone utilities handle UTC-to-local conversion at the query level
- **D-07:** Replace `/stats` placeholder with a permanent stats page shell (real Server Component, not throwaway)
- **D-08:** Shell becomes the container Phase 19 fills in
- **D-09:** Use shadcn ChartContainer + chartConfig directly in each chart component (no custom wrappers)
- **D-10:** Create shared `src/lib/chart-configs.ts` with named chartConfig constants
- **D-11:** No wrapper components -- each chart type uses Recharts directly

### Claude's Discretion
- Query function granularity (file count, function grouping)
- Which specific chart to render on Phase 18 shell page (collection donut, hero counters, etc.)
- Exact TTL values (5min/1hr are guidelines)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAT-01 | Stats page loads within 2s with all data pre-fetched via parallel queries | Promise.all pattern (D-03), unstable_cache with TTLs (D-01), existing dashboard page.tsx as reference |
| STAT-02 | Stats data refreshes automatically when sessions are logged/edited/deleted | revalidateTag("stats") in session-actions.ts (D-02), cache invalidation architecture |
| STAT-03 | All date-based stats respect user's timezone (not UTC boundaries) | @date-fns/tz TZDate + getUserTimezone() abstraction (D-04, D-05, D-06) |
| STAT-04 | Charting library installed and integrated with design system tokens | Recharts 3.8.1 via shadcn chart, CSS variables --chart-1..5 and --status-* already in globals.css |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Stats aggregation (groupBy, aggregate) | Database / Prisma | -- | SQL-level aggregation on indexed columns; never ship raw rows to server JS for counting |
| Timezone conversion | API / Server (query layer) | -- | TZDate converts UTC dates to local boundaries before Prisma WHERE clauses |
| Cache management | Frontend Server (Next.js) | -- | unstable_cache and revalidateTag are Next.js data cache primitives, server-only |
| Cache invalidation triggers | API / Server (session-actions) | -- | revalidateTag("stats") called from existing server action mutations |
| Chart rendering | Browser / Client | -- | Recharts uses DOM measurement + SVG; requires "use client" |
| Stats page orchestration | Frontend Server (SSR) | -- | Server Component calls requireAuth() + Promise.all, passes serialized data to client |
| Design token integration | Browser / Client | CDN / Static | CSS variables in globals.css, consumed by ChartContainer at render time |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.1 | Bar charts, donut/pie, line charts | shadcn wraps Recharts; React 19 supported in v3.x; ~43M weekly downloads [VERIFIED: npm registry] |
| date-fns | 4.1.0 | Date arithmetic, formatting, intervals | Functional API, excellent tree-shaking, ESM-first [VERIFIED: npm registry] |
| @date-fns/tz | 1.4.1 | TZDate for timezone-aware date calculations | Official date-fns timezone extension; no peer deps on date-fns [VERIFIED: npm registry, Context7] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn chart component | (copy-paste) | ChartContainer, ChartTooltip, ChartConfig | Every Recharts chart -- provides theme integration via CSS variables [CITED: Context7 shadcn-ui/ui] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | visx (@visx/*) | Lower-level D3 primitives. Smaller bundle (~15KB used) but 2-3x development time. No shadcn integration. |
| Recharts | nivo | Beautiful defaults, larger bundle, heavier abstraction. Recharts gives more control. |
| date-fns | dayjs | dayjs needs plugins for locale/format; date-fns tree-shakes better per-function |
| @date-fns/tz | Native Intl API | Missing eachDayOfInterval, startOfWeek, differenceInCalendarDays. Would need 10+ utility reimplementations. |
| unstable_cache | "use cache" directive | Requires enabling dynamicIO globally in next.config.ts -- too invasive for one feature |

**Installation:**
```bash
# Add shadcn chart component (installs recharts as dependency)
npx shadcn@latest add chart

# Date utilities
npm install date-fns@4.1.0 @date-fns/tz@1.4.1

# Post-install: remove ^ from recharts, date-fns, @date-fns/tz in package.json (project convention)
```

**Version verification:**
- recharts: 3.8.1 [VERIFIED: npm view recharts version, 2026-05-17]
- date-fns: 4.1.0 [VERIFIED: npm view date-fns version, 2026-05-17]
- @date-fns/tz: 1.4.1 [VERIFIED: npm view @date-fns/tz version, 2026-05-17]
- shadcn chart: installed via `npx shadcn@latest add chart` (creates `src/components/ui/chart.tsx`) [CITED: Context7 shadcn-ui/ui]

## Architecture Patterns

### System Architecture Diagram

```
Request: GET /stats
    |
    v
+----------------------------------------------------------+
| stats/page.tsx (Server Component)                        |
|                                                          |
|  requireAuth() --> userId                                |
|       |                                                  |
|  Promise.all([                                           |
|    getHeroStats(userId) ----\                             |
|    getCollectionBreakdown(userId) ---> unstable_cache     |
|    ... more query functions /        + revalidateTag     |
|  ])                                                      |
|       |                                                  |
|  Serialized data as props                                |
|       |                                                  |
+----------------------------------------------------------+
        |
        v
+----------------------------------------------------------+
| StatsPageShell ("use client")                            |
|                                                          |
|  Tab state: overview | calendar | history | year-review  |
|                                                          |
|  +---------------------+   +-------------------------+  |
|  | HeroCounters (SSR)  |   | CollectionDonut (client)|  |
|  | (pure text/numbers) |   | ChartContainer +        |  |
|  +---------------------+   | PieChart from recharts  |  |
|                             +-------------------------+  |
+----------------------------------------------------------+

Cache Invalidation Flow:
  session-actions.ts (create/update/delete)
    --> revalidateTag("stats")
      --> Next.js data cache purges all entries tagged "stats"
        --> Next request computes fresh data
```

### Recommended Project Structure

```
src/
  lib/
    queries/stats/
      index.ts                  # Barrel re-exports
      hero-stats.ts             # getHeroStats(userId) -- lifetime + rolling counters
      collection-breakdown.ts   # getCollectionBreakdown(userId) -- status/size distributions
      timezone.ts               # getUserTimezone(userId) + date boundary helpers
    actions/
      stats-actions.ts          # Server actions for client-invoked fetches (calendar month change, etc.)
    chart-configs.ts            # Named ChartConfig constants (collectionStatusConfig, etc.)
  components/
    features/stats/
      stats-page-shell.tsx      # Phase 18 shell ("use client") -- tabs, layout
      chart-skeleton.tsx        # Loading placeholder for dynamic chart imports
      [chart-component].tsx     # One file per chart type, "use client"
  types/
    stats.ts                    # All stats type definitions
  app/(dashboard)/stats/
    page.tsx                    # Server Component orchestrator (replaces placeholder)
    loading.tsx                 # Already exists -- update skeleton to match new layout
```

### Pattern 1: Query Layer with Caching (unstable_cache + revalidateTag)

**What:** Pure async functions wrapped with `unstable_cache`, invalidated by tags
**When to use:** Every stats query function

```typescript
// Source: Next.js docs [CITED: Context7 vercel/next.js unstable_cache]
// src/lib/queries/stats/hero-stats.ts
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone, getLocalDayBoundaries } from "./timezone";
import type { HeroStatsData } from "@/types/stats";

async function computeHeroStats(userId: string): Promise<HeroStatsData> {
  const tz = getUserTimezone(userId);
  const { todayStart, todayEnd, weekStart, monthStart, yearStart } = getLocalDayBoundaries(tz);

  const [today, week, month, year, lifetime] = await Promise.all([
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: todayStart, lt: todayEnd } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: weekStart } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: monthStart } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId }, date: { gte: yearStart } },
      _sum: { stitchCount: true },
    }),
    prisma.stitchSession.aggregate({
      where: { project: { userId } },
      _sum: { stitchCount: true },
      _count: { id: true },
    }),
  ]);

  return {
    stitchesToday: today._sum.stitchCount ?? 0,
    stitchesThisWeek: week._sum.stitchCount ?? 0,
    stitchesThisMonth: month._sum.stitchCount ?? 0,
    stitchesThisYear: year._sum.stitchCount ?? 0,
    totalLifetime: lifetime._sum.stitchCount ?? 0,
    totalSessions: lifetime._count.id,
  };
}

export function getHeroStats(userId: string) {
  return unstable_cache(
    () => computeHeroStats(userId),
    [`stats-hero-${userId}`],
    { tags: ["stats"], revalidate: 300 } // 5 minutes
  )();
}
```

### Pattern 2: Timezone-Aware Date Boundaries with TZDate

**What:** Use `@date-fns/tz` TZDate to compute local-timezone day/week/month boundaries, then pass as UTC Date objects to Prisma WHERE clauses
**When to use:** Every date-bounded query

```typescript
// Source: @date-fns/tz docs [CITED: Context7 date-fns/tz]
// src/lib/queries/stats/timezone.ts
import { TZDate } from "@date-fns/tz";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

export function getUserTimezone(_userId: string): string {
  // D-04/D-05: Abstraction function. Single-user: reads env var.
  // Multi-user future: read from user preferences table.
  return process.env.STATS_TIMEZONE ?? "America/Denver";
}

export function getLocalDayBoundaries(timezone: string) {
  const now = TZDate.tz(timezone);

  return {
    todayStart: startOfDay(now),      // Midnight local time -> UTC Date
    todayEnd: endOfDay(now),          // 23:59:59 local time -> UTC Date
    weekStart: startOfWeek(now),      // Sunday midnight local -> UTC Date
    monthStart: startOfMonth(now),    // 1st of month midnight local -> UTC Date
    yearStart: startOfYear(now),      // Jan 1 midnight local -> UTC Date
  };
}
```

**Key insight:** When you create a `TZDate` in a timezone and pass it to `startOfDay()`, date-fns computes midnight in that timezone and returns the corresponding UTC instant. Prisma's `DateTime` field stores UTC, so the WHERE clause comparison works correctly. [CITED: Context7 date-fns/tz TZDate docs]

### Pattern 3: shadcn ChartContainer + ChartConfig Integration

**What:** Use shadcn's chart component for theme-aware Recharts rendering
**When to use:** Every Recharts chart in the app

```typescript
// Source: shadcn chart docs [CITED: Context7 shadcn-ui/ui chart.mdx]
// src/components/features/stats/collection-status-chart.tsx
"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { collectionStatusConfig } from "@/lib/chart-configs";

interface CollectionStatusChartProps {
  data: { status: string; count: number; fill: string }[];
}

export function CollectionStatusChart({ data }: CollectionStatusChartProps) {
  if (data.length === 0) return <EmptyState />;

  return (
    <ChartContainer config={collectionStatusConfig} className="h-[200px] w-full">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}
```

```typescript
// src/lib/chart-configs.ts
import { type ChartConfig } from "@/components/ui/chart";

export const collectionStatusConfig = {
  unstarted: { label: "Unstarted", color: "var(--status-unstarted)" },
  kitting: { label: "Kitting", color: "var(--status-kitting)" },
  kitted: { label: "Kitted", color: "var(--status-kitted)" },
  inProgress: { label: "In Progress", color: "var(--status-in-progress)" },
  onHold: { label: "On Hold", color: "var(--status-on-hold)" },
  finished: { label: "Finished", color: "var(--status-finished)" },
  ffo: { label: "FFO", color: "var(--status-ffo)" },
} satisfies ChartConfig;
```

### Pattern 4: Cache Invalidation in Session Mutations

**What:** Add `revalidateTag("stats")` to existing session create/update/delete actions
**When to use:** After every successful session mutation

```typescript
// src/lib/actions/session-actions.ts (modification)
import { revalidateTag } from "next/cache";

// In createSession, after successful transaction:
revalidatePath(`/charts/${project.chartId}`);
revalidatePath("/sessions");
revalidateTag("stats"); // NEW: invalidate stats cache

// Same pattern in updateSession and deleteSession
```

### Anti-Patterns to Avoid

- **Fetching all sessions client-side:** Never ship raw session rows to the client for aggregation. Use Prisma aggregate/groupBy on the server. [CITED: .planning/research/ARCHITECTURE.md]
- **Storing computed stats in the database:** Violates project constraint "calculated fields at query time, never stored in DB." Use SQL aggregation + HTTP-layer caching instead.
- **Single monolithic query:** Don't try to fetch all stats in one query. Use Promise.all with focused queries -- fastest resolve first.
- **Charts without loading states:** Always use `ssr: false` dynamic import with a `loading` skeleton prop. Charts at width=0 look broken.
- **Reading process.env directly in query functions:** Always go through `getUserTimezone(userId)` abstraction per D-05.
- **Wrapper components around Recharts:** Per D-11, no `<StitchBarChart>` wrappers. Each chart composes Recharts directly via ChartContainer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone-aware date boundaries | Manual Date math with getTimezoneOffset() | @date-fns/tz TZDate + date-fns startOfDay/startOfMonth | DST transitions, edge cases at midnight, off-by-one errors. TZDate handles all of them. [CITED: Context7 date-fns/tz] |
| Interactive chart tooltips | Custom absolute-positioned divs | Recharts Tooltip + shadcn ChartTooltipContent | Positioning, collision detection, theme integration already solved |
| Responsive chart sizing | useRef + ResizeObserver | shadcn ChartContainer (wraps ResponsiveContainer) | Handles SSR-safe measurement, debouncing, container queries |
| Cache invalidation | Manual Redis/in-memory cache | Next.js unstable_cache + revalidateTag | Built into the framework, no infrastructure, works with Vercel deployment |
| SVG chart rendering | Raw <svg> with D3 scales | Recharts declarative components | Accessibility, animation, responsive behavior, tooltip integration all handled |

**Key insight:** The query layer is the only code that should be hand-written. Everything else -- charting, caching, timezone math, responsive sizing -- has a standard solution.

## Common Pitfalls

### Pitfall 1: Recharts Hydration Mismatch in App Router
**What goes wrong:** Recharts uses DOM measurement + `window` internally. Rendering in a Server Component produces different HTML than client, causing hydration errors.
**Why it happens:** App Router defaults to Server Components. Chart components MUST be Client Components with `ssr: false` dynamic import.
**How to avoid:** Every chart component: (1) add `"use client"`, (2) import via `next/dynamic` with `ssr: false` and `loading` prop from the page.
**Warning signs:** Console "Text content does not match server-rendered HTML", charts flash or render at 0 width.

### Pitfall 2: Timezone Boundary Bugs Near Midnight
**What goes wrong:** A session logged at 11pm Mountain Time (05:00 UTC next day) counts in the wrong day/month when aggregating by UTC boundaries.
**Why it happens:** StitchSession.date is `DateTime` stored as UTC. `GROUP BY date_trunc('day', date)` truncates in UTC, not local time.
**How to avoid:** Always compute local-timezone boundaries using TZDate, then pass as UTC Date objects to Prisma WHERE clauses. Test with timestamps at 11:30pm local time.
**Warning signs:** "Stitches today" counter is wrong near midnight; monthly totals shift at month boundaries.

### Pitfall 3: Neon Cold Start Waterfall
**What goes wrong:** Stats page fires 5+ queries. Without Promise.all, Neon's 300-800ms cold start compounds per sequential query.
**Why it happens:** @prisma/adapter-neon uses HTTP-based serverless driver -- each Prisma call is a separate HTTP request. First request wakes compute; subsequent requests hit warm instance.
**How to avoid:** Always use Promise.all for parallel queries in page.tsx. Bundle queries in a single Server Component (one cold start, all queries in parallel).
**Warning signs:** Stats page consistently slow (>2s) after 5+ minutes of inactivity.

### Pitfall 4: unstable_cache Without Invalidation
**What goes wrong:** Setting revalidate TTL but forgetting revalidateTag in mutations. User logs a session, navigates to stats, sees stale numbers.
**Why it happens:** Easy to forget adding revalidateTag to ALL mutation paths (create, update, delete).
**How to avoid:** Add revalidateTag("stats") to all three session mutation functions. Write a test that verifies revalidateTag is called.
**Warning signs:** Stats lag behind actual data by TTL duration.

### Pitfall 5: ResponsiveContainer Race Condition
**What goes wrong:** Recharts ResponsiveContainer measures parent width on mount. Inside dynamically imported components, container may not have final dimensions yet. Chart renders at width=0.
**Why it happens:** Dynamic import with ssr:false means component mounts after layout paint.
**How to avoid:** Always wrap ResponsiveContainer in a div with explicit CSS dimensions (`h-[200px] w-full`). Or use ChartContainer from shadcn which handles this.
**Warning signs:** Charts briefly flash at 0 width or wrong dimensions.

### Pitfall 6: Bundle Size from Recharts
**What goes wrong:** Importing `from 'recharts'` pulls ~50KB gzipped. If chart code lands in shared bundle, all pages get heavier.
**Why it happens:** Recharts bundles all chart types together. Tree-shaking helps but isn't perfect with D3 deps.
**How to avoid:** Dynamic import with `ssr: false` automatically code-splits to the /stats route. Verify with `npm run build` that chart JS only appears in stats chunks.
**Warning signs:** `npm run build` shows significantly larger first-load JS on non-stats pages.

## Code Examples

### unstable_cache with Tags (Verified Pattern)

```typescript
// Source: Next.js docs [CITED: Context7 vercel/next.js unstable_cache]
import { unstable_cache } from "next/cache";

export function getCachedData(userId: string) {
  return unstable_cache(
    async () => {
      // Expensive computation here
      return await prisma.stitchSession.aggregate({
        where: { project: { userId } },
        _sum: { stitchCount: true },
      });
    },
    [`stats-lifetime-${userId}`],  // Cache key parts
    {
      tags: ["stats"],              // Tag for invalidation
      revalidate: 300,              // 5 minutes TTL
    }
  )();  // Note: immediately invoked
}
```

### TZDate for Timezone Boundaries (Verified Pattern)

```typescript
// Source: @date-fns/tz docs [CITED: Context7 date-fns/tz]
import { TZDate } from "@date-fns/tz";
import { startOfDay, startOfWeek, startOfMonth, format } from "date-fns";

// Create "now" in Mountain Time
const now = TZDate.tz("America/Denver");

// startOfDay gives midnight Mountain Time as a Date object
// The underlying UTC instant is correct for Prisma WHERE clauses
const dayStart = startOfDay(now);   // e.g., 2026-05-17T06:00:00.000Z (midnight MDT = UTC-6)
const weekStart = startOfWeek(now); // Sunday midnight MDT
const monthStart = startOfMonth(now); // May 1 midnight MDT

// format() respects TZDate timezone context
format(now, "yyyy-MM-dd HH:mm");    // "2026-05-17 22:30" (local time)
```

### shadcn ChartConfig with CSS Variables (Verified Pattern)

```typescript
// Source: shadcn chart docs [CITED: Context7 shadcn-ui/ui chart.mdx]
import { type ChartConfig } from "@/components/ui/chart";

// CSS variables --status-* already defined in globals.css
const chartConfig = {
  inProgress: {
    label: "In Progress",
    color: "var(--status-in-progress)",
  },
  finished: {
    label: "Finished",
    color: "var(--status-finished)",
  },
} satisfies ChartConfig;
```

### Collection Breakdown via Prisma groupBy

```typescript
// Source: Prisma aggregation docs [CITED: Context7 verified, Prisma docs]
const statusCounts = await prisma.project.groupBy({
  by: ["status"],
  where: { userId },
  _count: { id: true },
});
// Returns: [{ status: "IN_PROGRESS", _count: { id: 5 } }, ...]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 + react-is override | Recharts v3 native React 19 | Recharts 3.0 (2024) | No compatibility shims needed |
| date-fns-tz (separate package by marnusw) | @date-fns/tz (official, by date-fns team) | date-fns v4 (2024) | TZDate class instead of utility functions; first-class date-fns integration |
| Next.js "use cache" directive | unstable_cache (for projects without dynamicIO) | Next.js 15+ | "use cache" requires dynamicIO flag; unstable_cache works without config changes |
| Manual ResponsiveContainer | shadcn ChartContainer | shadcn v4 (2025) | Handles responsive sizing + theme integration in one component |

**Deprecated/outdated:**
- `date-fns-tz` (marnusw/date-fns-tz): Superseded by official `@date-fns/tz`. Still works but not the recommended path for date-fns 4.x.
- Recharts v2.x: Needs `react-is` workaround for React 19. Use v3.x.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `npx shadcn@latest add chart` will create `src/components/ui/chart.tsx` and install recharts as a dependency | Standard Stack | LOW -- may need manual install. Verify during execution. |
| A2 | `unstable_cache` still exists in Next.js 16.2.4 and hasn't been removed | Architecture Patterns | LOW -- it's documented in current Next.js docs, but "unstable" prefix means potential removal. Verify with import test. |
| A3 | TZDate from @date-fns/tz returns Date-compatible objects that Prisma accepts in WHERE clauses | Code Examples | MEDIUM -- if TZDate doesn't serialize to Date for Prisma, need to call `.toDate()` or similar. Test in first query function. |
| A4 | `revalidateTag` accepts a single string tag (not requiring a second strategy argument) in Next.js 16.2.4 | Architecture Patterns | LOW -- Context7 docs show optional second parameter. Single-arg call should work. |

## Open Questions (RESOLVED)

1. **TZDate serialization with Prisma** (RESOLVED)
   - What we know: TZDate extends Date and is API-compatible. Prisma expects Date objects in WHERE clauses.
   - What's unclear: Whether Prisma's `@prisma/adapter-neon` correctly serializes TZDate to timestamptz
   - Recommendation: Write a unit test that creates a TZDate and passes it to a Prisma aggregate WHERE clause. If it fails, wrap with `new Date(tzDate.getTime())`.
   - Resolution: Plan 01 Task 2 includes timezone tests that will validate TZDate serialization. If Prisma rejects TZDate, the executor wraps with `new Date(tzDate.getTime())`.

2. **Chart component for Phase 18 proof-of-concept** (RESOLVED)
   - What we know: Need at least one chart to validate Recharts + design token integration (D-07)
   - What's unclear: Which chart best validates the full stack
   - Recommendation: A **collection status donut** (PieChart with innerRadius) -- it uses the `--status-*` CSS variables already in globals.css, tests ChartConfig color mapping, and the data (project counts by status) is trivial to query via Prisma groupBy. Simple enough for Phase 18, not throwaway.
   - Resolution: Plan 03 Task 1 implements the collection status donut chart (per D-09, D-10, D-11).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | (inherited from Next.js 16) | -- |
| PostgreSQL (Neon) | Stats queries | Yes | Neon serverless | -- |
| recharts | Chart rendering | Not yet | 3.8.1 (to install) | -- |
| date-fns | Date arithmetic | Not yet | 4.1.0 (to install) | -- |
| @date-fns/tz | Timezone support | Not yet | 1.4.1 (to install) | -- |
| STATS_TIMEZONE env var | Timezone config | Not yet | -- | Falls back to "America/Denver" in code |

**Missing dependencies with no fallback:**
- None -- all missing items are npm packages installed during Phase 18

**Missing dependencies with fallback:**
- STATS_TIMEZONE env var: code defaults to "America/Denver" if not set

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/queries/stats --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | Parallel query execution returns all data | unit | `npx vitest run src/lib/queries/stats/hero-stats.test.ts -x` | No -- Wave 0 |
| STAT-01 | Page orchestrates Promise.all correctly | unit | `npx vitest run src/app/(dashboard)/stats/page.test.ts -x` | No -- Wave 0 |
| STAT-02 | revalidateTag("stats") called on session create | unit | `npx vitest run src/lib/actions/session-actions.test.ts -x` | Yes (extend) |
| STAT-02 | revalidateTag("stats") called on session update | unit | `npx vitest run src/lib/actions/session-actions.test.ts -x` | Yes (extend) |
| STAT-02 | revalidateTag("stats") called on session delete | unit | `npx vitest run src/lib/actions/session-actions.test.ts -x` | Yes (extend) |
| STAT-03 | Timezone boundaries correct at 11:30pm local time | unit | `npx vitest run src/lib/queries/stats/timezone.test.ts -x` | No -- Wave 0 |
| STAT-03 | getUserTimezone returns STATS_TIMEZONE env value | unit | `npx vitest run src/lib/queries/stats/timezone.test.ts -x` | No -- Wave 0 |
| STAT-04 | Chart component renders with design system colors | unit | `npx vitest run src/components/features/stats/*.test.tsx -x` | No -- Wave 0 |
| STAT-04 | ChartConfig uses CSS variable tokens | unit | `npx vitest run src/lib/chart-configs.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/queries/stats --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/queries/stats/hero-stats.test.ts` -- covers STAT-01 (query returns correct aggregations)
- [ ] `src/lib/queries/stats/timezone.test.ts` -- covers STAT-03 (timezone boundaries)
- [ ] `src/lib/queries/stats/collection-breakdown.test.ts` -- covers STAT-01 (groupBy returns distributions)
- [ ] `src/components/features/stats/collection-status-chart.test.tsx` -- covers STAT-04 (Recharts renders)
- [ ] `src/lib/chart-configs.test.ts` -- covers STAT-04 (config uses CSS variable tokens)
- [ ] Framework install: `npm install date-fns@4.1.0 @date-fns/tz@1.4.1` + `npx shadcn@latest add chart`
- [ ] Add `stitchSession` mock methods (`aggregate`, `groupBy`) to `createMockPrisma()` -- already present, verified

### Testing Notes for Stats Query Functions

Stats query functions are **pure functions** (no `"use server"`, no auth guard) that accept `userId` and return typed data. This makes them trivially testable:

```typescript
// Test pattern for stats queries
import { vi, describe, it, expect } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn, // Bypass cache in tests
}));

describe("getHeroStats", () => {
  it("returns zero counts when no sessions exist", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
      _count: { id: 0 },
    });
    // ...
  });
});
```

**Mock unstable_cache in tests:** Wrap as identity function to bypass caching. The mock pattern `vi.mock("next/cache", () => ({ unstable_cache: (fn: Function) => fn }))` makes the cached function transparent. [ASSUMED]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (uses existing requireAuth) | requireAuth() at page level -- already implemented |
| V3 Session Management | No | Existing Auth.js session -- no changes |
| V4 Access Control | Yes | userId passed to all query functions; all Prisma WHERE clauses filter by userId |
| V5 Input Validation | Minimal | Query params (year, month) validated as numbers; no user-provided strings in queries |
| V6 Cryptography | No | No encryption needed for stats |

### Known Threat Patterns for Stats Layer

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-user data exposure | Information Disclosure | All query functions require userId in WHERE clause; requireAuth() at page level |
| SQL injection via raw queries | Tampering | Use Prisma parameterized queries; if $queryRaw needed, use tagged template literals (auto-parameterized) |
| Cache poisoning | Tampering | unstable_cache keys include userId; single-user app minimizes risk |
| Denial of service via expensive queries | Denial of Service | TTL caching limits re-computation; dataset is bounded (~10K sessions max) |

## Sources

### Primary (HIGH confidence)
- [Context7 /recharts/recharts] - BarChart, PieChart, ResponsiveContainer API patterns
- [Context7 /date-fns/tz] - TZDate constructor, timezone conversion, tz() context function
- [Context7 /date-fns/date-fns] - startOfDay, startOfMonth, format, timezone integration
- [Context7 /shadcn-ui/ui] - ChartContainer, ChartConfig, ChartTooltip patterns
- [Context7 /vercel/next.js] - unstable_cache, revalidateTag API and usage patterns
- [npm registry] - recharts@3.8.1, date-fns@4.1.0, @date-fns/tz@1.4.1 version verification

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` - Stack evaluation completed 2026-05-17
- `.planning/research/ARCHITECTURE.md` - Query layer design, caching strategy
- `.planning/research/PITFALLS.md` - SSR hydration, Neon cold start, timezone bugs
- Existing codebase: `src/lib/actions/dashboard-actions.ts` (Promise.all pattern), `src/lib/actions/session-actions.ts` (mutation pattern), `src/__tests__/mocks/factories.ts` (mock infrastructure)

### Tertiary (LOW confidence)
- None

## Project Constraints (from CLAUDE.md)

- **TDD mandatory** -- tests before implementation in all plans
- **Pin exact versions** -- no `^` or `~` in package.json
- **Server Components by default** -- "use client" only for interactivity
- **Zod validation at boundaries** -- server actions, API routes
- **Calculated fields at query time** -- never stored in DB (compatible with SQL aggregation)
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **buttonVariants from button-variants.ts** -- not button.tsx in Server Components
- **No `"use client"` unless genuinely needed** -- query layer and types are server-safe
- **Design reference check before building UI** -- stats page shell uses DesignOS StitchingDashboard layout
- **Quality gates** -- `/impeccable:polish` after UI plans, `/impeccable:audit` at phase boundary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all versions verified via npm registry and Context7
- Architecture: HIGH - follows established codebase patterns (dashboard-actions.ts, Promise.all, mock factories)
- Pitfalls: HIGH - verified against project-specific constraints and Next.js/Recharts documentation
- Timezone handling: MEDIUM - TZDate API verified but Prisma serialization needs runtime test (A3)

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable domain -- established libraries, no breaking changes expected)
