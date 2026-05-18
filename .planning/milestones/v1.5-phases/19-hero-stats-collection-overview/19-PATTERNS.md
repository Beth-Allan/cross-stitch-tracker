# Phase 19: Hero Stats & Collection Overview - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 16 new/modified files
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/queries/stats/size-breakdown.ts` | service | CRUD | `src/lib/queries/stats/collection-breakdown.ts` | exact |
| `src/lib/queries/stats/designer-breakdown.ts` | service | CRUD | `src/lib/queries/stats/collection-breakdown.ts` | exact |
| `src/lib/queries/stats/genre-breakdown.ts` | service | CRUD | `src/lib/queries/stats/collection-breakdown.ts` | exact |
| `src/lib/queries/stats/index.ts` | config | transform | `src/lib/queries/stats/index.ts` (self) | exact |
| `src/types/stats.ts` | model | transform | `src/types/stats.ts` (self) | exact |
| `src/lib/chart-configs.ts` | config | transform | `src/lib/chart-configs.ts` (self) | exact |
| `src/components/features/stats/metrics-bar.tsx` | component | request-response | `src/components/features/dashboard/collection-stats-sidebar.tsx` | role-match |
| `src/components/features/stats/lifetime-counters.tsx` | component | request-response | `src/app/(dashboard)/stats/page.tsx` (HeroCounter) | exact |
| `src/components/features/stats/size-category-chart.tsx` | component | request-response | `src/components/features/stats/collection-status-chart.tsx` | exact |
| `src/components/features/stats/designer-breakdown-chart.tsx` | component | request-response | `src/components/features/stats/collection-status-chart.tsx` | role-match |
| `src/components/features/stats/genre-distribution-chart.tsx` | component | request-response | `src/components/features/stats/collection-status-chart.tsx` | role-match |
| `src/components/features/stats/ranked-list.tsx` | component | request-response | (no close analog -- new pattern) | none |
| `src/components/features/stats/stats-overview.tsx` | component | request-response | `src/app/(dashboard)/stats/page.tsx` (StatsOverview) | exact |
| `src/app/(dashboard)/stats/page.tsx` | controller | request-response | `src/app/(dashboard)/stats/page.tsx` (self) | exact |
| `src/lib/queries/stats/size-breakdown.test.ts` | test | CRUD | `src/lib/queries/stats/collection-breakdown.test.ts` | exact |
| `src/lib/queries/stats/designer-breakdown.test.ts` | test | CRUD | `src/lib/queries/stats/collection-breakdown.test.ts` | exact |
| `src/lib/queries/stats/genre-breakdown.test.ts` | test | CRUD | `src/lib/queries/stats/collection-breakdown.test.ts` | exact |
| `src/components/features/stats/metrics-bar.test.tsx` | test | request-response | `src/components/features/stats/collection-status-chart.test.tsx` | role-match |
| `src/components/features/stats/lifetime-counters.test.tsx` | test | request-response | `src/components/features/stats/collection-status-chart.test.tsx` | role-match |
| `src/components/features/stats/size-category-chart.test.tsx` | test | request-response | `src/components/features/stats/collection-status-chart.test.tsx` | exact |
| `src/components/features/stats/designer-breakdown-chart.test.tsx` | test | request-response | `src/components/features/stats/collection-status-chart.test.tsx` | role-match |
| `src/components/features/stats/genre-distribution-chart.test.tsx` | test | request-response | `src/components/features/stats/collection-status-chart.test.tsx` | role-match |
| `src/components/features/stats/ranked-list.test.tsx` | test | request-response | (no chart mock needed -- server component) | none |
| `src/lib/chart-configs.test.ts` | test | transform | `src/lib/chart-configs.test.ts` (self) | exact |

## Pattern Assignments

### `src/lib/queries/stats/size-breakdown.ts` (service, CRUD)

**Analog:** `src/lib/queries/stats/collection-breakdown.ts`

**Imports pattern** (lines 1-5):
```typescript
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { collectionStatusConfig } from "@/lib/chart-configs";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { CollectionBreakdownData, StatusBreakdownItem } from "@/types/stats";
```
Adapt: replace config/type imports with size-specific ones. Add `calculateSizeCategory`, `getEffectiveStitchCount` from `@/lib/utils/size-category`.

**Core query pattern** (lines 17-35):
```typescript
async function computeCollectionBreakdown(userId: string): Promise<CollectionBreakdownData> {
  const statusCounts = await prisma.project.groupBy({
    by: ["status"],
    where: { userId },
    _count: { id: true },
  });

  const countMap = new Map(statusCounts.map((s) => [s.status, s._count.id]));

  const byStatus: StatusBreakdownItem[] = ALL_STATUSES.map((status) => ({
    status,
    count: countMap.get(status) ?? 0,
    fill: collectionStatusConfig[status]?.color ?? "var(--chart-1)",
  }));

  const totalProjects = byStatus.reduce((sum, item) => sum + item.count, 0);

  return { byStatus, totalProjects };
}
```
Adapt: size-breakdown cannot use `groupBy` (size is computed). Use `prisma.chart.findMany` with `select: { stitchCount, stitchesWide, stitchesHigh }`, then bucket via `calculateSizeCategory()`. Return array with fixed order: Mini, Small, Medium, Large, BAP.

**Cache wrapper pattern** (lines 37-42):
```typescript
export function getCollectionBreakdown(userId: string) {
  return unstable_cache(() => computeCollectionBreakdown(userId), [`stats-collection-${userId}`], {
    tags: ["stats"],
    revalidate: 3600,
  })();
}
```
Copy exactly. Change cache key to `stats-size-${userId}`.

---

### `src/lib/queries/stats/designer-breakdown.ts` (service, CRUD)

**Analog:** `src/lib/queries/stats/collection-breakdown.ts`

Same imports/cache pattern as above. Core query differs:

**Core query pattern** -- use `prisma.chart.groupBy`:
```typescript
// Adapt from collection-breakdown.ts lines 17-35
// Designer breakdown groups by designerId on Chart, scoped through Project.userId
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
```
Then join designer names with a second query (`prisma.designer.findMany({ where: { id: { in: [...ids] } } })`).

Cache key: `stats-designer-${userId}`. TTL: 3600.

---

### `src/lib/queries/stats/genre-breakdown.ts` (service, CRUD)

**Analog:** `src/lib/queries/stats/collection-breakdown.ts`

Same imports/cache pattern. Core query uses Prisma `findMany` with `_count` (many-to-many cannot use `groupBy`):

**Core query pattern** from RESEARCH.md (verified against Prisma 7 schema):
```typescript
const genres = await prisma.genre.findMany({
  where: {
    charts: { some: { project: { userId } } },
  },
  select: {
    id: true,
    name: true,
    _count: {
      select: {
        charts: {
          where: { project: { userId } },
        },
      },
    },
  },
  orderBy: {
    charts: { _count: "desc" },
  },
  take: limit,
});
```

Cache key: `stats-genre-${userId}`. TTL: 3600.

---

### `src/lib/queries/stats/index.ts` (config, transform)

**Analog:** `src/lib/queries/stats/index.ts` (self -- extend existing)

**Current content** (lines 1-3):
```typescript
export { getUserTimezone, getLocalDayBoundaries } from "./timezone";
export { getHeroStats } from "./hero-stats";
export { getCollectionBreakdown } from "./collection-breakdown";
```
Add three new re-exports:
```typescript
export { getSizeBreakdown } from "./size-breakdown";
export { getDesignerBreakdown } from "./designer-breakdown";
export { getGenreBreakdown } from "./genre-breakdown";
```

---

### `src/types/stats.ts` (model, transform)

**Analog:** `src/types/stats.ts` (self -- extend existing)

**Existing type pattern** (lines 18-27):
```typescript
export interface StatusBreakdownItem {
  status: ProjectStatus;
  count: number;
  fill: string;
}

export interface CollectionBreakdownData {
  byStatus: StatusBreakdownItem[];
  totalProjects: number;
}
```
Add new interfaces following same shape:
```typescript
export interface SizeBreakdownItem {
  category: string;
  count: number;
  fill: string;
}

export interface DesignerBreakdownItem {
  designerId: string;
  name: string;
  count: number;
}

export interface GenreBreakdownItem {
  genreId: string;
  name: string;
  count: number;
}
```

---

### `src/lib/chart-configs.ts` (config, transform)

**Analog:** `src/lib/chart-configs.ts` (self -- extend existing)

**Existing config pattern** (lines 1-12):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";
import { type ChartConfig } from "@/components/ui/chart";

export const collectionStatusConfig = {
  UNSTARTED: { label: "Unstarted", color: "var(--status-unstarted)" },
  KITTING: { label: "Kitting", color: "var(--status-kitting)" },
  KITTED: { label: "Kitted", color: "var(--status-kitted)" },
  IN_PROGRESS: { label: "In Progress", color: "var(--status-in-progress)" },
  ON_HOLD: { label: "On Hold", color: "var(--status-on-hold)" },
  FINISHED: { label: "Finished", color: "var(--status-finished)" },
  FFO: { label: "FFO", color: "var(--status-ffo)" },
} satisfies Record<ProjectStatus, ChartConfig[string]>;
```
Add new configs using same pattern with `satisfies ChartConfig`:
- `sizeCategoryConfig` -- 5 keys (Mini/Small/Medium/Large/BAP), colors `var(--chart-1)` through `var(--chart-5)`
- `designerBarConfig` -- single key `count`, color `var(--chart-1)` (uniform emerald)
- `genreDistributionConfig` -- single key `count`, color `var(--chart-3)` (uniform sky)

---

### `src/components/features/stats/metrics-bar.tsx` (component, request-response)

**Analog:** `src/components/features/dashboard/collection-stats-sidebar.tsx`

**Why this analog:** Both render numeric stats with icons in a row/list. CollectionStatsSidebar uses data-driven rendering with a STAT_ROWS config array, font-mono tabular-nums for values, and lucide icons with per-cell colors.

**Data-driven row config pattern** (lines 12-33):
```typescript
const STAT_ROWS = [
  {
    key: "totalProjects",
    label: "Total Projects",
    icon: BarChart3,
    color: "text-muted-foreground",
  },
  // ... more rows
] as const;
```
Adapt: Define a METRIC_CELLS array with key, label, icon (Zap/CalendarDays/CalendarRange/TrendingUp).

**Numeric rendering pattern** (lines 70-71):
```typescript
<span className="text-foreground font-mono text-sm font-bold tabular-nums">
  {stats[row.key]}
</span>
```
Adapt: Use `text-3xl font-mono font-semibold tabular-nums` for the display number per UI-SPEC.

**Icon rendering pattern** (line 68):
```typescript
<row.icon className={`h-4 w-4 shrink-0 ${row.color}`} strokeWidth={1.5} />
```
Copy directly -- use `text-success` color for all icons in the metrics bar.

**Note:** UI-SPEC says client component, but RESEARCH.md recommends starting as Server Component since no hooks/handlers are needed. If purely display, omit "use client". Only add if tooltip/hover interactivity requires it.

---

### `src/components/features/stats/lifetime-counters.tsx` (component, request-response)

**Analog:** `src/app/(dashboard)/stats/page.tsx` lines 57-63 (HeroCounter inline component)

**Existing card pattern** (lines 57-63):
```typescript
function HeroCounter({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground text-2xl font-bold">{value}</p>
    </div>
  );
}
```
Adapt per UI-SPEC:
- Card styling: `ring-1 ring-foreground/10 rounded-xl p-4` (ring instead of border)
- Label: `text-xs text-muted-foreground uppercase tracking-wider`
- Value: `text-lg font-mono font-semibold tabular-nums`
- Grid: `grid grid-cols-2 sm:grid-cols-4 gap-4`
- Section heading with FolderOpen icon

**Server Component** -- no "use client" needed. Pure display.

---

### `src/components/features/stats/size-category-chart.tsx` (component, request-response)

**Analog:** `src/components/features/stats/collection-status-chart.tsx`

**Full file pattern** (lines 1-72):
```typescript
"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { collectionStatusConfig } from "@/lib/chart-configs";
import type { StatusBreakdownItem } from "@/types/stats";
```
Adapt: Replace `PieChart/Pie` with `BarChart/Bar/XAxis/YAxis`. Replace config/type imports.

**Empty state pattern** (lines 14-19):
```typescript
if (totalProjects === 0) {
  return (
    <div className="text-muted-foreground flex h-[200px] items-center justify-center">
      No projects yet
    </div>
  );
}
```
Copy exactly -- change message text and height to match `h-[250px]`.

**ChartContainer + Cell coloring pattern** (lines 26-42):
```typescript
<ChartContainer
  config={collectionStatusConfig}
  className="mx-auto h-[250px] w-full max-w-[250px]"
>
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent />} />
    <Pie data={chartData} dataKey="count" nameKey="status" ...>
      {chartData.map((entry) => (
        <Cell key={entry.status} fill={entry.fill} />
      ))}
    </Pie>
  </PieChart>
</ChartContainer>
```
Adapt: BarChart with `<Bar dataKey="count">` + `<Cell>` per bar using fill from data item. Vertical bar chart (default layout, no `layout="vertical"`).

---

### `src/components/features/stats/designer-breakdown-chart.tsx` (component, request-response)

**Analog:** `src/components/features/stats/collection-status-chart.tsx`

Same imports/empty-state/ChartContainer pattern as size-category-chart. Key difference:

**Horizontal bar chart** -- uses `layout="vertical"` on BarChart:
```typescript
<ChartContainer config={designerBarConfig} className="h-[300px] w-full">
  <BarChart layout="vertical" data={data} accessibilityLayer>
    <XAxis type="number" />
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
```
Uniform bar color (`var(--chart-1)`), no per-bar Cell coloring needed.

---

### `src/components/features/stats/genre-distribution-chart.tsx` (component, request-response)

**Analog:** `src/components/features/stats/designer-breakdown-chart.tsx` (sibling)

Identical pattern to designer-breakdown-chart. Only differences:
- Config: `genreDistributionConfig` instead of `designerBarConfig`
- Bar fill: `var(--chart-3)` instead of `var(--chart-1)`
- Empty text: "No genres yet"
- Heading: "Genre Distribution"

---

### `src/components/features/stats/ranked-list.tsx` (component, request-response)

**No close analog in codebase.** This is a new pattern -- server component rendering a numbered list with `<Link>` elements.

**Reference from RESEARCH.md** (Pattern 4):
```typescript
import Link from "next/link";

interface RankedItem {
  id: string;
  name: string;
  count: number;
  href: string;
}

export function RankedList({ items, label }: { items: RankedItem[]; label: string }) {
  return (
    <div className="mt-3 space-y-1">
      <h4 className="sr-only">{label}</h4>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-xs tabular-nums w-5">
              {index + 1}.
            </span>
            <Link
              href={item.href}
              className="text-foreground hover:text-primary underline decoration-border underline-offset-2 hover:decoration-primary transition-colors text-sm"
            >
              {item.name}
            </Link>
          </div>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
```

**Server Component** -- no "use client". Uses `next/link` which works in both server and client components.

**Note per UI-SPEC:** Designer items are `<Link>` to `/designers/{id}`. Genre items are plain text (no `<Link>`), per UI-SPEC section 7 ("genre names are plain text (not links)"). However, RESEARCH.md notes genre detail pages DO exist at `/genres/[id]`. The planner should decide whether to follow UI-SPEC (plain text) or RESEARCH.md recommendation (links). Either way, RankedList should accept an optional `href` prop per item.

---

### `src/components/features/stats/stats-overview.tsx` (component, request-response)

**Analog:** `src/app/(dashboard)/stats/page.tsx` lines 25-54 (StatsOverview inline component)

**Existing layout pattern** (lines 25-54):
```typescript
function StatsOverview({
  heroStats,
  collectionBreakdown,
}: {
  heroStats: StatsHeroData;
  collectionBreakdown: CollectionBreakdownData;
}) {
  return (
    <div className="space-y-8">
      {/* Hero counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HeroCounter ... />
      </div>

      {/* Collection donut chart */}
      <div className="border-border bg-card rounded-lg border p-6">
        <h3 className="text-muted-foreground mb-4 text-sm font-medium">Collection by Status</h3>
        <CollectionStatusChart ... />
      </div>
    </div>
  );
}
```
Adapt: Extract to own file. Expand props to include all 5 datasets. Replace inline HeroCounter grid with `<MetricsBar>` + `<LifetimeCounters>`. Add 2x2 chart grid below.

**Server Component** -- no "use client". Composes server + client children.

---

### `src/app/(dashboard)/stats/page.tsx` (controller, request-response)

**Analog:** self (modify existing)

**Current page pattern** (lines 1-23):
```typescript
import { requireAuth } from "@/lib/auth-guard";
import { getHeroStats, getCollectionBreakdown } from "@/lib/queries/stats";
import { formatTime } from "@/lib/utils/format-time";
import { StatsPageShell } from "@/components/features/stats/stats-page-shell";
import { CollectionStatusChart } from "@/components/features/stats/collection-status-chart";
import type { StatsHeroData, CollectionBreakdownData } from "@/types/stats";

export default async function StatsPage() {
  const user = await requireAuth();

  const [heroStats, collectionBreakdown] = await Promise.all([
    getHeroStats(user.id),
    getCollectionBreakdown(user.id),
  ]);

  return (
    <StatsPageShell
      overviewContent={
        <StatsOverview heroStats={heroStats} collectionBreakdown={collectionBreakdown} />
      }
    />
  );
}
```
Adapt:
1. Add 3 new query imports (`getSizeBreakdown`, `getDesignerBreakdown`, `getGenreBreakdown`)
2. Expand `Promise.all` to include all 5 queries
3. Import `StatsOverview` from new file instead of inline definition
4. Remove inline `StatsOverview` and `HeroCounter` functions
5. Pass all 5 datasets to `<StatsOverview>`

---

## Test Pattern Assignments

### Query tests: `size-breakdown.test.ts`, `designer-breakdown.test.ts`, `genre-breakdown.test.ts`

**Analog:** `src/lib/queries/stats/collection-breakdown.test.ts`

**Mock setup pattern** (lines 1-10):
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
```
Copy exactly for all three query test files.

**Dynamic import after mocks pattern** (line 20):
```typescript
const { getCollectionBreakdown } = await import("./collection-breakdown");
```
Copy -- dynamic import is required because mocks must be registered before module loads.

**Test structure pattern** (lines 17-29):
```typescript
it("returns empty ... when no projects exist", async () => {
  mockPrisma.project.groupBy.mockResolvedValue([]);
  const { getCollectionBreakdown } = await import("./collection-breakdown");
  const result = await getCollectionBreakdown("user-1");
  expect(result.totalProjects).toBe(0);
});
```
Adapt mock method per query:
- size-breakdown: `mockPrisma.chart.findMany.mockResolvedValue([])`
- designer-breakdown: `mockPrisma.chart.groupBy.mockResolvedValue([])` + `mockPrisma.designer.findMany.mockResolvedValue([])`
- genre-breakdown: `mockPrisma.genre.findMany.mockResolvedValue([])`

### Chart component tests: all 5 chart test files

**Analog:** `src/components/features/stats/collection-status-chart.test.tsx`

**Recharts mock pattern** (lines 8-26):
```typescript
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children, data }: { children: ReactNode; data?: StatusBreakdownItem[] }) => (
    <div data-testid="pie" data-slice-count={data?.length ?? 0}>{children}</div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  Label: ({ content }: { content: (props: Record<string, unknown>) => ReactNode }) => {
    const rendered = content({ viewBox: { cx: 125, cy: 125 } });
    return <>{rendered}</>;
  },
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));
```
Adapt for BarChart tests -- mock `BarChart`, `Bar`, `XAxis`, `YAxis` instead of `PieChart`/`Pie`.

**shadcn chart mock pattern** (lines 29-44):
```typescript
vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({
    children,
    config,
  }: {
    children: ReactNode;
    config: Record<string, unknown>;
    className?: string;
  }) => (
    <div data-testid="chart-container" data-config-keys={Object.keys(config).join(",")}>{children}</div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}));
```
Copy exactly for all chart test files.

**Dynamic import pattern** (line 65):
```typescript
const { CollectionStatusChart } = await import("./collection-status-chart");
```
Copy -- import after mocks are registered.

**Test assertion patterns** (lines 68-76, 78-93):
```typescript
// Renders without crashing
render(<CollectionStatusChart data={data} totalProjects={totalProjects} />);
expect(screen.getByTestId("chart-container")).toBeInTheDocument();

// Empty state
render(<CollectionStatusChart data={data} totalProjects={0} />);
expect(screen.getByText("No projects yet")).toBeInTheDocument();
expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
```
Copy pattern for each chart component.

### Chart configs test: `chart-configs.test.ts`

**Analog:** `src/lib/chart-configs.test.ts` (self -- extend)

**Existing test pattern** (lines 15-38):
```typescript
describe("collectionStatusConfig", () => {
  it("has exactly 7 keys matching ProjectStatus enum values", () => {
    const keys = Object.keys(collectionStatusConfig);
    expect(keys).toHaveLength(7);
  });

  it("every value has a non-empty label and a color starting with var(--status-", () => {
    for (const key of EXPECTED_STATUS_KEYS) {
      const entry = collectionStatusConfig[key];
      expect(entry.label).toBeDefined();
      expect(entry.color).toMatch(/^var\(--status-/);
    }
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = collectionStatusConfig;
    expect(_config).toBeDefined();
  });
});
```
Add parallel test blocks for `sizeCategoryConfig`, `designerBarConfig`, `genreDistributionConfig`. Adjust key count and color pattern assertions.

---

## Shared Patterns

### Authentication / Data Scoping
**Source:** `src/app/(dashboard)/stats/page.tsx` lines 8-9
**Apply to:** `page.tsx` only (queries receive userId as parameter)
```typescript
export default async function StatsPage() {
  const user = await requireAuth();
  // All queries scoped by user.id
}
```

### Cache Wrapper
**Source:** `src/lib/queries/stats/collection-breakdown.ts` lines 37-42
**Apply to:** All 3 new breakdown query files
```typescript
export function getXxxBreakdown(userId: string) {
  return unstable_cache(() => computeXxxBreakdown(userId), [`stats-xxx-${userId}`], {
    tags: ["stats"],
    revalidate: 3600,
  })();
}
```
- Tags: `["stats"]` (shares tag with all stats queries for invalidation)
- TTL: 3600 (1 hour, matching collection-breakdown)
- Cache key includes userId to prevent cross-user reads

### Chart Component Structure
**Source:** `src/components/features/stats/collection-status-chart.tsx` lines 1-72
**Apply to:** All 3 new chart components
1. `"use client"` directive
2. Import Recharts primitives + shadcn ChartContainer/ChartTooltip
3. Import config from `@/lib/chart-configs`
4. Import type from `@/types/stats`
5. Empty state guard (return muted message if data is empty)
6. `<ChartContainer config={...}>` wrapping Recharts chart
7. `<ChartTooltip content={<ChartTooltipContent />} />`

### Test Infrastructure
**Source:** `src/lib/queries/stats/collection-breakdown.test.ts` lines 1-10
**Apply to:** All query test files
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
```

### Numeric Display
**Source:** `src/components/features/dashboard/collection-stats-sidebar.tsx` line 70
**Apply to:** MetricsBar, LifetimeCounters
```typescript
// All numeric values use font-mono + tabular-nums for alignment stability
className="font-mono tabular-nums"
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/stats/ranked-list.tsx` | component | request-response | No numbered list with navigation links exists in codebase. RESEARCH.md provides a complete reference implementation (Pattern 4). Pattern is straightforward: server component, `next/link`, flexbox rows. |

---

## Metadata

**Analog search scope:** `src/lib/queries/stats/`, `src/components/features/stats/`, `src/components/features/dashboard/`, `src/app/(dashboard)/stats/`, `src/lib/`, `src/types/`
**Files scanned:** 14 analog candidates read, 5 selected as primary analogs
**Pattern extraction date:** 2026-05-17
