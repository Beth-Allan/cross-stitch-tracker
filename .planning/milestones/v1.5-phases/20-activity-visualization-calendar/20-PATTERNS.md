# Phase 20: Activity Visualization & Calendar - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 22 (new/modified)
**Analogs found:** 19 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/stats.ts` | model | transform | `src/types/stats.ts` (extend) | exact |
| `src/lib/chart-configs.ts` | config | transform | `src/lib/chart-configs.ts` (extend) | exact |
| `src/lib/queries/stats/monthly-totals.ts` | service | CRUD | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/calendar-days.ts` | service | CRUD | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/session-history.ts` | service | CRUD | `src/lib/queries/stats/designer-breakdown.ts` | role-match |
| `src/lib/queries/stats/pace-metrics.ts` | service | CRUD | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/day-of-week.ts` | service | CRUD | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/daily-breakdown.ts` | service | CRUD | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/index.ts` | config | re-export | `src/lib/queries/stats/index.ts` (extend) | exact |
| `src/lib/actions/stats-actions.ts` | controller | request-response | `src/lib/actions/session-actions.ts` | role-match |
| `src/components/features/stats/activity-overview.tsx` | component | transform | `src/components/features/stats/stats-overview.tsx` | exact |
| `src/components/features/stats/pace-cards.tsx` | component | transform | `src/components/features/stats/metrics-bar.tsx` | exact |
| `src/components/features/stats/monthly-stitch-chart.tsx` | component | event-driven | `src/components/features/stats/size-category-chart.tsx` | role-match |
| `src/components/features/stats/monthly-drill-down.tsx` | component | event-driven | none | no-analog |
| `src/components/features/stats/day-of-week-chart.tsx` | component | transform | `src/components/features/stats/size-category-chart.tsx` | exact |
| `src/components/features/stats/stitching-calendar.tsx` | component | event-driven | none | no-analog |
| `src/components/features/stats/session-history-table.tsx` | component | request-response | none | no-analog |
| `src/app/(dashboard)/stats/page.tsx` | controller | request-response | `src/app/(dashboard)/stats/page.tsx` (modify) | exact |
| `src/app/(dashboard)/stats/search-params.ts` | config | transform | none (new pattern) | no-analog |
| `src/lib/queries/stats/monthly-totals.test.ts` | test | -- | `src/lib/queries/stats/hero-stats.test.ts` | exact |
| `src/components/features/stats/monthly-stitch-chart.test.tsx` | test | -- | `src/components/features/stats/size-category-chart.test.tsx` | exact |
| `src/components/features/stats/activity-overview.test.tsx` | test | -- | `src/components/features/stats/stats-overview.test.tsx` | exact |

## Pattern Assignments

### `src/types/stats.ts` (model, transform -- EXTEND)

**Analog:** `src/types/stats.ts` (self -- add new interfaces)

**Section structure pattern** (lines 1-61):
```typescript
// Each data shape gets its own labeled section with ─── separators
// ─── Monthly Totals ──────────────────────────────────────────────────────
export interface MonthlyTotal { ... }

// ─── Calendar Day ────────────────────────────────────────────────────────
export interface CalendarDayData { ... }
```

**Convention:** Types use descriptive suffixes like `Data`, `Item`, `Breakdown`. Follow existing grouping with `// ─── Section Name ───` comment separators.

---

### `src/lib/chart-configs.ts` (config, transform -- EXTEND)

**Analog:** `src/lib/chart-configs.ts` (self)

**Config definition pattern** (lines 1-29):
```typescript
import { type ChartConfig } from "@/components/ui/chart";

export const sizeCategoryConfig = {
  Mini: { label: "Mini", color: "var(--chart-1)" },
  Small: { label: "Small", color: "var(--chart-2)" },
  // ...
} satisfies ChartConfig;

export const designerBarConfig = {
  count: { label: "Charts", color: "var(--chart-1)" },
} satisfies ChartConfig;
```

**Convention:** Each config is a named export, uses `satisfies ChartConfig`, references CSS variables `var(--chart-N)` for colors. Add `monthlyBarConfig` and `dayOfWeekConfig` following this pattern.

---

### `src/lib/queries/stats/monthly-totals.ts` (service, CRUD)

**Analog:** `src/lib/queries/stats/hero-stats.ts`

**Imports pattern** (lines 1-4):
```typescript
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone, getLocalDayBoundaries } from "./timezone";
import type { StatsHeroData } from "@/types/stats";
```

**Compute function pattern** (lines 6-52):
```typescript
async function computeHeroStats(userId: string): Promise<StatsHeroData> {
  try {
    const tz = getUserTimezone(userId);
    const { todayStart, todayEnd, weekStart, monthStart, yearStart } = getLocalDayBoundaries(tz);

    const [today, week, month, year, lifetime, completedCount] = await Promise.all([
      prisma.stitchSession.aggregate({
        where: { project: { userId }, date: { gte: todayStart, lt: todayEnd } },
        _sum: { stitchCount: true },
      }),
      // ... more parallel queries
    ]);

    return { /* mapped result */ };
  } catch (error) {
    console.error("[stats] computeHeroStats failed:", { userId, error });
    throw error;
  }
}
```

**Cache export pattern** (lines 54-59):
```typescript
export function getHeroStats(userId: string) {
  return unstable_cache(() => computeHeroStats(userId), [`stats-hero-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}
```

**CRITICAL cache key rule:** Include ALL parameters in the cache key string. For parameterized queries:
```typescript
// From designer-breakdown.ts lines 53-58 (corrected after WR-01/WR-02 bug):
export function getDesignerBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeDesignerBreakdown(userId, limit),
    [`stats-designer-${userId}-${limit}`],  // ALL params in key
    { tags: ["stats"], revalidate: 3600 },
  )();
}
```

**Conditional TTL pattern** (from RESEARCH.md -- new for Phase 20):
```typescript
export function getMonthlyTotals(userId: string, year: number) {
  const currentYear = new Date().getFullYear();
  return unstable_cache(
    () => computeMonthlyTotals(userId, year),
    [`stats-monthly-${userId}-${year}`],
    {
      tags: ["stats"],
      revalidate: year < currentYear ? 3600 : 300,  // 1hr historical, 5min current
    },
  )();
}
```

**Applies to:** monthly-totals.ts, calendar-days.ts, session-history.ts, pace-metrics.ts, day-of-week.ts, daily-breakdown.ts

---

### `src/lib/queries/stats/session-history.ts` (service, CRUD -- pagination)

**Analog:** `src/lib/queries/stats/designer-breakdown.ts` (for parameterized query + cache key pattern)

**Parameterized query with groupBy** (designer-breakdown.ts lines 5-51):
```typescript
async function computeDesignerBreakdown(
  userId: string,
  limit: number,
): Promise<DesignerBreakdownItem[]> {
  try {
    const results = await prisma.chart.groupBy({
      by: ["designerId"],
      where: {
        project: { userId },
        designerId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });
    // ... map results
  } catch (error) {
    console.error("[stats] computeDesignerBreakdown failed:", { userId, limit, error });
    throw error;
  }
}
```

**Additional pattern for session-history:** Uses `findMany` + `count` in `Promise.all` for pagination (from RESEARCH.md). This is new to the project but standard Prisma. The key addition is `skip`/`take` for pagination and `orderBy` from URL params.

---

### `src/lib/actions/stats-actions.ts` (controller, request-response)

**Analog:** `src/lib/actions/session-actions.ts` (simplified -- read-only wrappers)

**"use server" + requireAuth pattern** (session-actions.ts lines 1-6):
```typescript
"use server";

import { requireAuth } from "@/lib/auth-guard";
```

**Server action with auth guard** (session-actions.ts lines 226-267):
```typescript
export async function getSessionsForProject(projectId: string) {
  const user = await requireAuth();

  try {
    // ... query logic
    return { success: true as const, sessions: mapped };
  } catch (error) {
    console.error("getSessionsForProject error:", error);
    return { success: false as const, error: "Failed to load sessions" };
  }
}
```

**Phase 20 difference:** Stats server actions are thin wrappers that delegate to cached query functions. They do NOT use `{ success, error }` return shape -- they return data directly (like query functions do). The `requireAuth()` + delegation pattern is the key:
```typescript
export async function fetchCalendarMonth(month: number, year: number) {
  const user = await requireAuth();
  return getCalendarDays(user.id, month, year);
}
```

---

### `src/components/features/stats/activity-overview.tsx` (component, transform -- Server Component layout)

**Analog:** `src/components/features/stats/stats-overview.tsx`

**Imports pattern** (lines 1-15):
```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MetricsBar } from "./metrics-bar";
import { LifetimeCounters } from "./lifetime-counters";
// ... more child component imports
import type { StatsHeroData, CollectionBreakdownData, /* ... */ } from "@/types/stats";
```

**Layout wrapper pattern** (lines 25-115):
```typescript
export function StatsOverview({
  heroStats,
  collectionBreakdown,
  sizeBreakdown,
  designerBreakdown,
  genreBreakdown,
}: StatsOverviewProps) {
  return (
    <div className="space-y-8">
      {/* 1. MetricsBar -- full width */}
      <MetricsBar ... />

      {/* 2. LifetimeCounters -- full width */}
      <LifetimeCounters ... />

      {/* 3. Collection charts 2x2 grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-heading text-sm font-semibold">Collection by Status</h3>
          </CardHeader>
          <CardContent>
            <CollectionStatusChart ... />
          </CardContent>
        </Card>
        {/* ... more cards */}
      </div>
    </div>
  );
}
```

**Convention:** No `"use client"` -- this is a Server Component. Uses `space-y-8` for section spacing. Child components wrapped in `Card`/`CardHeader`/`CardContent`. Section order matches D-16: pace cards, monthly chart, day-of-week chart, calendar, session table.

---

### `src/components/features/stats/pace-cards.tsx` (component, transform -- Server Component)

**Analog:** `src/components/features/stats/metrics-bar.tsx`

**Data-driven cell rendering** (lines 10-47):
```typescript
const METRIC_CELLS = [
  { key: "stitchesToday" as const, label: "TODAY", icon: Zap },
  { key: "stitchesThisWeek" as const, label: "THIS WEEK", icon: CalendarDays },
  // ...
];

export function MetricsBar(props: MetricsBarProps) {
  return (
    <div className="bg-success-muted border-success-border grid grid-cols-2 rounded-xl border sm:flex sm:flex-row">
      {METRIC_CELLS.map((cell, index) => {
        const Icon = cell.icon;
        const value = props[cell.key];
        return (
          <div key={cell.key} className="flex items-center sm:flex-1">
            <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-1.5">
                <Icon className="text-success h-4 w-4" />
                <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {cell.label}
                </span>
              </div>
              <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
                {value.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-xs">stitches</span>
            </div>
            {index < METRIC_CELLS.length - 1 && (
              <div className="bg-success-border my-2 hidden w-px self-stretch sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Convention:** No `"use client"`. Data-driven cell array with `map()`. Green accent strip (`bg-success-muted`, `border-success-border`). Tabular nums for numeric values. Vertical dividers between cells on desktop. PaceCards adds trend arrows (TrendingUp/TrendingDown icons) and percentage text.

---

### `src/components/features/stats/monthly-stitch-chart.tsx` (component, event-driven -- Client Component)

**Analog:** `src/components/features/stats/size-category-chart.tsx`

**Imports and structure** (lines 1-37):
```typescript
"use client";

import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { sizeCategoryConfig } from "@/lib/chart-configs";
import type { SizeBreakdownItem } from "@/types/stats";

interface SizeCategoryChartProps {
  data: SizeBreakdownItem[];
}

export function SizeCategoryChart({ data }: SizeCategoryChartProps) {
  const isEmpty = data.reduce((sum, item) => sum + item.count, 0) === 0;

  if (isEmpty) {
    return (
      <div className="text-muted-foreground flex h-[250px] items-center justify-center">
        No projects yet
      </div>
    );
  }

  return (
    <ChartContainer config={sizeCategoryConfig} className="h-[250px] w-full">
      <BarChart data={data} accessibilityLayer>
        <XAxis dataKey="category" tickLine={false} axisLine={false} />
        <YAxis type="number" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
```

**Monthly chart additions:** The MonthlyStitchChart extends this with:
1. `onClick` handler on `Bar` component for drill-down
2. `Cell` components with conditional `fill` (active vs inactive) and `cursor`
3. `useState` for `activeMonth` tracking
4. Year selector heading with prev/next arrows (ChevronLeft/ChevronRight icons)
5. Server action call (`fetchDailyBreakdown`) on bar click

---

### `src/components/features/stats/day-of-week-chart.tsx` (component, transform -- Client Component)

**Analog:** `src/components/features/stats/size-category-chart.tsx` (exact match -- display-only bar chart)

Same pattern as size-category-chart. 7 bars (Mon-Sun) instead of 5. No click handler. Uses `dayOfWeekConfig` from chart-configs.

---

### `src/components/features/stats/designer-breakdown-chart.tsx` (component, horizontal bars reference)

**Analog for horizontal bar layout** (lines 1-41):
```typescript
"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { designerBarConfig } from "@/lib/chart-configs";

export function DesignerBreakdownChart({ data }: DesignerBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        No designers yet
      </div>
    );
  }

  return (
    <ChartContainer config={designerBarConfig} className="h-[300px] w-full">
      <BarChart layout="vertical" data={data} accessibilityLayer>
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) =>
            value.length > 20 ? `${value.slice(0, 18)}...` : value
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

**Convention:** Empty state returns text in centered flex container at fixed height. Non-empty renders `ChartContainer` with `h-[Npx] w-full`. BarChart uses `accessibilityLayer`. Axes have `tickLine={false} axisLine={false}`.

---

### `src/app/(dashboard)/stats/page.tsx` (controller, request-response -- MODIFY)

**Analog:** self (current version)

**Current pattern** (lines 1-37):
```typescript
import { requireAuth } from "@/lib/auth-guard";
import {
  getHeroStats,
  getCollectionBreakdown,
  getSizeBreakdown,
  getDesignerBreakdown,
  getGenreBreakdown,
} from "@/lib/queries/stats";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { StatsOverview } from "@/components/features/stats/stats-overview";

export default async function StatsPage() {
  const user = await requireAuth();

  const [heroStats, collectionBreakdown, sizeBreakdown, designerBreakdown, genreBreakdown] =
    await Promise.all([
      getHeroStats(user.id),
      getCollectionBreakdown(user.id),
      getSizeBreakdown(user.id),
      getDesignerBreakdown(user.id),
      getGenreBreakdown(user.id),
    ]);

  return (
    <StatsPageShell
      overviewContent={<StatsOverview ... />}
    />
  );
}
```

**Phase 20 modifications:**
1. Add `searchParams` to function signature for nuqs server-side parsing
2. Add `await statsSearchParamsCache.parse(searchParams)` before queries
3. Add activity queries to `Promise.all` (monthly totals, pace metrics, day-of-week, calendar days, session history)
4. Pass `activityContent={<ActivityOverview ... />}` to `StatsPageShell`

---

### `src/lib/queries/stats/index.ts` (config, re-export -- EXTEND)

**Analog:** self (current version)

**Pattern** (lines 1-6):
```typescript
export { getUserTimezone, getLocalDayBoundaries } from "./timezone";
export { getHeroStats } from "./hero-stats";
export { getCollectionBreakdown } from "./collection-breakdown";
export { getSizeBreakdown } from "./size-breakdown";
export { getDesignerBreakdown } from "./designer-breakdown";
export { getGenreBreakdown } from "./genre-breakdown";
```

**Convention:** One `export { name } from "./module"` per line. Add new query exports here.

---

## Shared Patterns

### Authentication
**Source:** `src/lib/auth-guard.ts` (imported as `requireAuth`)
**Apply to:** `src/app/(dashboard)/stats/page.tsx`, `src/lib/actions/stats-actions.ts`
```typescript
import { requireAuth } from "@/lib/auth-guard";
const user = await requireAuth();
// All queries filter by user.id
```

### Error Handling (Query Layer)
**Source:** `src/lib/queries/stats/hero-stats.ts` lines 48-51
**Apply to:** All query files in `src/lib/queries/stats/`
```typescript
  } catch (error) {
    console.error("[stats] computeHeroStats failed:", { userId, error });
    throw error;
  }
```

**Convention:** `[stats]` prefix in console.error, include `userId` and params in error context object, re-throw (do not swallow).

### Cache Layer
**Source:** `src/lib/queries/stats/hero-stats.ts` lines 54-59, `designer-breakdown.ts` lines 53-58
**Apply to:** All query files in `src/lib/queries/stats/`
```typescript
export function getQueryName(userId: string, ...params) {
  return unstable_cache(
    () => computeQueryName(userId, ...params),
    [`stats-queryname-${userId}-${...allParams}`],  // ALL params in key
    { tags: ["stats"], revalidate: 300 },            // or 3600 for slow-changing data
  )();
}
```

### Timezone-Aware Date Boundaries
**Source:** `src/lib/queries/stats/timezone.ts` lines 1-34
**Apply to:** monthly-totals.ts, calendar-days.ts, pace-metrics.ts, day-of-week.ts, daily-breakdown.ts
```typescript
import { getUserTimezone, getLocalDayBoundaries } from "./timezone";
import { TZDate } from "@date-fns/tz";
import { startOfMonth, endOfMonth } from "date-fns";

const tz = getUserTimezone(userId);
// For month/year boundaries, use TZDate directly:
const monthStart = startOfMonth(TZDate.tz(tz, year, month - 1, 1));
```

### Recharts Chart Component Structure
**Source:** `src/components/features/stats/size-category-chart.tsx` lines 1-37
**Apply to:** monthly-stitch-chart.tsx, day-of-week-chart.tsx
```typescript
"use client";

import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { configName } from "@/lib/chart-configs";
import type { DataType } from "@/types/stats";

// 1. Check isEmpty
// 2. Return empty state OR ChartContainer + BarChart
// 3. accessibilityLayer on BarChart
// 4. tickLine={false} axisLine={false} on axes
// 5. radius={4} on Bar
```

### Query Test Structure
**Source:** `src/lib/queries/stats/hero-stats.test.ts` lines 1-23
**Apply to:** All new query test files
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock timezone to return fixed boundaries
vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  getLocalDayBoundaries: () => ({ /* fixed dates */ }),
}));
```

**Convention:** Dynamic import after mocks (`await import("./module")`). `beforeEach` clears mocks. Chain `.mockResolvedValueOnce()` for sequential Promise.all calls.

### Chart Component Test Structure
**Source:** `src/components/features/stats/size-category-chart.test.tsx` lines 1-59
**Apply to:** All new chart component test files
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";

// Mock recharts to avoid SSR/canvas issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children, dataKey }: { children: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>{children}</div>
  ),
  XAxis: ({ dataKey }: { dataKey?: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock the chart UI components
vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config }: { children: ReactNode; config: Record<string, unknown>; className?: string }) => (
    <div data-testid="chart-container" data-config-keys={Object.keys(config).join(",")}>{children}</div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}));

// Dynamic import after mocks
const { ComponentName } = await import("./component-name");
```

### Layout Component Test Structure
**Source:** `src/components/features/stats/stats-overview.test.tsx` lines 1-60
**Apply to:** activity-overview.test.tsx
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";

// Mock all child components with data-testid stubs
vi.mock("./pace-cards", () => ({
  PaceCards: (props: Record<string, unknown>) => (
    <div data-testid="pace-cards" data-avg7={props.avg7Day} />
  ),
}));
// ... more child mocks

import { ActivityOverview } from "./activity-overview";

// Test: each child renders with correct props, layout order, grid classes
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/stats/monthly-drill-down.tsx` | component | event-driven | No inline expand/collapse panel exists. Use CSS grid-template-rows 0fr/1fr pattern from RESEARCH.md. |
| `src/components/features/stats/stitching-calendar.tsx` | component | event-driven | No calendar grid component exists. Custom month grid with project color pills. Server action for month navigation is new. |
| `src/components/features/stats/session-history-table.tsx` | component | request-response | No paginated data table exists. Use shadcn `table` + `pagination` (install first). Server-side sorting via URL params is new. |
| `src/app/(dashboard)/stats/search-params.ts` | config | transform | First use of nuqs `createSearchParamsCache` (server-side). All existing nuqs usage is client-side `useQueryState`. Use RESEARCH.md Pattern 4. |

## Metadata

**Analog search scope:** `src/lib/queries/stats/`, `src/components/features/stats/`, `src/lib/actions/`, `src/app/(dashboard)/stats/`, `src/types/`, `src/lib/chart-configs.ts`
**Files scanned:** 28 existing files read
**Pattern extraction date:** 2026-05-17
