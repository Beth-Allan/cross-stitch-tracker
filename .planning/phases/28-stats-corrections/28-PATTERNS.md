# Phase 28: Stats Corrections - Pattern Map

**Mapped:** 2026-05-23
**Files analyzed:** 17 (modified) + 1 (new)
**Analogs found:** 18 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(dashboard)/stats/page.tsx` | controller | request-response | self (modify in-place) | exact |
| `src/app/(dashboard)/stats/search-params.ts` | config | request-response | self (modify in-place) | exact |
| `src/components/features/stats/status-filter-pills.tsx` | component | request-response | `year-scope-toggle.tsx` | exact |
| `src/components/features/stats/stats-overview.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/stats/records-overview.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/stats/lifetime-counters.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/stats/designer-breakdown-chart.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/stats/genre-distribution-chart.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/stats/size-category-chart.tsx` | component | request-response | self (modify in-place) | exact |
| `src/components/features/dashboard/buried-treasures-section.tsx` | component | request-response | self (modify in-place) | exact |
| `src/lib/queries/stats/hero-stats.ts` | service | CRUD | self (modify in-place) | exact |
| `src/lib/queries/stats/thread-insights.ts` | service | CRUD | self (modify in-place) | exact |
| `src/lib/queries/stats/designer-insights.ts` | service | CRUD | self (modify in-place) | exact |
| `src/lib/queries/stats/genre-insights.ts` | service | CRUD | self (modify in-place) | exact |
| `src/lib/queries/stats/index.ts` | config | N/A | self (modify in-place) | exact |
| `src/types/stats.ts` | model | N/A | self (modify in-place) | exact |
| `src/components/features/stats/stats-overview.test.tsx` | test | N/A | self (modify in-place) | exact |
| `src/components/features/stats/status-filter-pills.test.tsx` | test | N/A | `year-scope-toggle.test.tsx` | role-match |

## Pattern Assignments

### `src/components/features/stats/status-filter-pills.tsx` (component, NEW)

**Analog:** `src/components/features/stats/year-scope-toggle.tsx`

**Imports pattern** (lines 1-3):
```typescript
"use client";

import { useQueryState, parseAsString } from "nuqs";
```
StatusFilterPills will use `parseAsArrayOf` + `parseAsStringLiteral` instead of `parseAsString`. Import from `"nuqs"` (client-side).

**Toggle interaction pattern** (lines 9-38):
```typescript
export function YearScopeToggle({ availableYears }: YearScopeToggleProps) {
  const [scope, setScope] = useQueryState("scope", parseAsString.withDefault("all"));

  // ...options array...

  return (
    <div role="group" aria-label="Time scope" className="bg-muted inline-flex gap-1 rounded-xl p-1">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={scope === value}
          onClick={() => void setScope(value === "all" ? null : value)}
          className={
            scope === value
              ? "bg-selected text-selected-foreground border-selected-border rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```
StatusFilterPills adapts: `role="group"`, `aria-pressed` toggle, semantic token classes, `type="button"`. Key difference: multi-select (array state) vs single-select (string state). Use `useGalleryFilters` toggle pattern for the multi-select logic.

**Multi-select toggle pattern** from `src/components/features/gallery/use-gallery-filters.ts` (lines 96-104):
```typescript
const toggleStatus = useCallback(
  (s: string) => {
    void setStatusFilter((prev) => {
      const current = prev ?? [];
      return current.includes(s) ? current.filter((v) => v !== s) : [...current, s];
    });
  },
  [setStatusFilter],
);
```

---

### `src/app/(dashboard)/stats/search-params.ts` (config, MODIFY)

**Analog:** self + gallery filter pattern

**Current file** (lines 1-17):
```typescript
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const SORT_FIELDS = ["date", "stitches", "time"] as const;
export const SORT_DIRS = ["asc", "desc"] as const;

export const statsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringLiteral(SORT_FIELDS).withDefault("date"),
  dir: parseAsStringLiteral(SORT_DIRS).withDefault("desc"),
  project: parseAsString.withDefault("all"),
  scope: parseAsString.withDefault("all"),
});
```
Add `parseAsArrayOf` import from `"nuqs/server"`. Add `STATUS_GROUPS` const. Add `status` param to cache using `parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([])`.

---

### `src/app/(dashboard)/stats/page.tsx` (controller, MODIFY)

**Analog:** self

**Import + query pattern** (lines 1-45):
```typescript
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import {
  getHeroStats,
  // ...existing imports...
  getThreadInsights,
  getDesignerInsights,
  getGenreInsights,
  // ...
} from "@/lib/queries/stats";
import { settled } from "@/lib/utils/settled";
```
Changes: (1) Extract `status` from parsedParams alongside existing destructure. (2) Pass `status` instead of `scope` to insight queries. (3) Add `collectionTotalStitches` to heroStats flow. (4) Move thread/designer/genre insights from RecordsOverview props to StatsOverview props. (5) Always pass `"all"` as scope to personalBests, fastestCompletions, completionEstimates (D-03 removes YearScopeToggle).

**Promise.allSettled wiring** (lines 64-82):
```typescript
const results = await Promise.allSettled([
  getHeroStats(user.id),
  // ...
  getThreadInsights(user.id, scope),    // change to: getThreadInsights(user.id, status)
  getDesignerInsights(user.id, scope),  // change to: getDesignerInsights(user.id, status)
  getGenreInsights(user.id, scope),     // change to: getGenreInsights(user.id, status)
  // ...
]);
```

**Prop wiring pattern** (lines 125-162):
```typescript
<StatsOverview
  heroStats={heroStats}
  collectionBreakdown={collectionBreakdown}
  // ... add: threadInsights, designerInsights, genreInsights
/>
// ...
<RecordsOverview
  personalBests={personalBests}
  fastestCompletions={fastestCompletions}
  // remove: threadInsights, designerInsights, genreInsights
  // add: totalLifetimeStitches from heroStats
/>
```

---

### `src/lib/queries/stats/thread-insights.ts` (service, MODIFY)

**Analog:** self

**Current query signature** (lines 7-10):
```typescript
async function computeThreadInsights(
  userId: string,
  scope: Scope,
  limit: number,
): Promise<ThreadInsight[]> {
```
Change: Replace `scope: Scope` with `statusGroups: string[]`. Remove date filter logic. Add status filter via `resolveStatusFilter()`.

**Current session-gated filter** (lines 16-22):
```typescript
const results = await prisma.projectThread.groupBy({
  by: ["threadId"],
  where: {
    project: {
      userId,
      ...(dateFilter ? { sessions: { some: { date: dateFilter } } } : {}),
    },
  },
```
Change to library-wide with optional status filter:
```typescript
where: {
  project: {
    userId,
    ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
  },
},
```

**Cache key pattern** (lines 66-76):
```typescript
export function getThreadInsights(userId: string, scope: Scope, limit = 10) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeThreadInsights(userId, scope, limit),
    [`stats-thread-insights-${userId}-${scope}-${limit}`],
    { tags: ["stats"], revalidate },
  )();
}
```
Change: Accept `statusGroups: string[]` instead of `scope: Scope`. Fixed revalidate (always 300 -- no year-based logic for library-wide data). Serialize statusGroups into cache key.

---

### `src/lib/queries/stats/designer-insights.ts` (service, MODIFY)

**Analog:** self (same pattern as thread-insights)

**Session-gated filter** (lines 18-23):
```typescript
const projects = await prisma.project.findMany({
  where: {
    userId,
    chart: { designerId: { not: null } },
    ...(dateFilter ? { sessions: { some: { date: dateFilter } } } : {}),
  },
```
Same change: Remove session gate, add optional status filter.

---

### `src/lib/queries/stats/genre-insights.ts` (service, MODIFY)

**Analog:** self (same pattern as thread-insights)

**Session-gated filter** (lines 16-20):
```typescript
const projects = await prisma.project.findMany({
  where: {
    userId,
    chart: { genres: { some: {} } },
  },
  include: {
    // ...
    sessions: {
      where: dateFilter ? { date: dateFilter } : undefined,
      select: { stitchCount: true },
    },
  },
});
```
Same change: Remove session gate and session include. Add optional status filter. Genre insights use session stitchCount for ranking (D-08 shifts to library-wide -- this metric changes from "stitches logged per genre" to "project count per genre" or remains stitches-based via chart.stitchCount).

---

### `src/lib/queries/stats/hero-stats.ts` (service, MODIFY)

**Analog:** self

**Promise.all query pattern** (lines 11-36):
```typescript
const [today, week, month, year, lifetime, completedCount] = await Promise.all([
  // ...5 stitchSession aggregates...
  prisma.project.count({
    where: { userId, status: { in: ["FINISHED", "FFO"] } },
  }),
]);
```
Add 7th query: `prisma.chart.aggregate({ where: { projects: { some: { userId } } }, _sum: { stitchCount: true } })`.

**Return shape** (lines 38-47):
```typescript
return {
  stitchesToday: today._sum.stitchCount ?? 0,
  // ...existing fields...
  projectsCompleted: completedCount,
};
```
Add: `collectionTotalStitches: collectionTotal._sum.stitchCount ?? 0`.

---

### `src/types/stats.ts` (model, MODIFY)

**Analog:** self

**StatsHeroData interface** (lines 6-15):
```typescript
export interface StatsHeroData {
  stitchesToday: number;
  stitchesThisWeek: number;
  stitchesThisMonth: number;
  stitchesThisYear: number;
  totalLifetimeStitches: number;
  totalSessions: number;
  totalTimeMinutes: number;
  projectsCompleted: number;
}
```
Add: `collectionTotalStitches: number;`

---

### `src/components/features/stats/lifetime-counters.tsx` (component, MODIFY)

**Analog:** self

**COUNTER_CARDS config** (lines 11-16):
```typescript
const COUNTER_CARDS = [
  { key: "totalLifetimeStitches" as const, label: "TOTAL STITCHES", format: "number" as const },
  { key: "totalSessions" as const, label: "SESSIONS", format: "number" as const },
  { key: "totalTimeMinutes" as const, label: "TIME STITCHING", format: "time" as const },
  { key: "projectsCompleted" as const, label: "COMPLETED", format: "number" as const },
];
```
Change: Replace `totalLifetimeStitches` key+label with `collectionTotalStitches` / `"COLLECTION TOTAL"`. Update interface to accept `collectionTotalStitches` instead of `totalLifetimeStitches`.

---

### `src/components/features/stats/stats-overview.tsx` (component, MODIFY)

**Analog:** self

**Current props interface** (lines 18-24):
```typescript
interface StatsOverviewProps {
  heroStats: StatsHeroData | null;
  collectionBreakdown: CollectionBreakdownData | null;
  sizeBreakdown: SizeBreakdownItem[] | null;
  designerBreakdown: DesignerBreakdownItem[] | null;
  genreBreakdown: GenreBreakdownItem[] | null;
}
```
Add: `threadInsights`, `designerInsights`, `genreInsights` props (all `T | null`). Remove `RankedList` usage from designer/genre cards (lines 91-99, 113-121).

**RankedList usage to remove** (lines 91-99):
```typescript
<RankedList
  items={designerBreakdown.map((d) => ({
    id: d.designerId,
    name: d.name,
    count: d.count,
    href: `/designers/${d.designerId}`,
  }))}
  label="Top Designers by Chart Count"
/>
```

---

### `src/components/features/stats/records-overview.tsx` (component, MODIFY)

**Analog:** self

**Current props interface** (lines 18-27):
```typescript
interface RecordsOverviewProps {
  personalBests: PersonalBestRecord[] | null;
  fastestCompletions: FastestCompletion[] | null;
  threadInsights: ThreadInsight[] | null;
  designerInsights: DesignerInsight[] | null;
  genreInsights: GenreInsight[] | null;
  completionEstimates: CompletionEstimate[] | null;
  availableYears: number[] | null;
  hasNoSessions: boolean;
}
```
Remove: `threadInsights`, `designerInsights`, `genreInsights`, `availableYears` props. Add: `totalLifetimeStitches: number | null` for hero stat. Remove: `YearScopeToggle` rendering (lines 52-58). Remove: insight list grid (lines 70-86). Add: session stitch total hero stat section.

---

### Chart axis modifications (3 charts, identical change)

**`designer-breakdown-chart.tsx`** -- XAxis (line 24):
```typescript
<XAxis type="number" tickLine={false} axisLine={false} />
```
Add `allowDecimals={false}`.

**`genre-distribution-chart.tsx`** -- XAxis (line 24):
```typescript
<XAxis type="number" tickLine={false} axisLine={false} />
```
Add `allowDecimals={false}`.

**`size-category-chart.tsx`** -- YAxis (line 27):
```typescript
<YAxis type="number" tickLine={false} axisLine={false} />
```
Add `allowDecimals={false}`.

---

### `src/components/features/dashboard/buried-treasures-section.tsx` (component, MODIFY)

**Analog:** self

**Current formatAge function** (lines 16-20):
```typescript
function formatAge(days: number): string {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}
```
Fix: Return unit only ("days" / "months" / "years") -- the number is already rendered separately at line 79.

**Age badge rendering** (lines 77-84):
```typescript
<div className="flex shrink-0 flex-col items-end gap-0.5 text-right max-md:hidden">
  <span className="text-muted-foreground font-mono text-sm font-bold tabular-nums">
    {t.daysInLibrary.toLocaleString()}
  </span>
  <span className="text-muted-foreground/70 text-[10px]">
    {formatAge(t.daysInLibrary)} in library
  </span>
</div>
```
The number display (line 79) stays. The label (line 82) needs `formatAge` to return unit only. Also need to compute the display number correctly for months/years (e.g., `Math.floor(days / 30)` for months, `Math.floor(days / 365)` for years).

---

## Shared Patterns

### Stats Query Pattern (compute + unstable_cache)
**Source:** `src/lib/queries/stats/hero-stats.ts` (lines 1-59)
**Apply to:** All modified insight queries (`thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts`)
```typescript
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

async function computeXxx(userId: string, ...args): Promise<T> {
  try {
    // query logic
  } catch (error) {
    console.error("[stats] computeXxx failed:", { userId, ...args, error });
    throw error;
  }
}

export function getXxx(userId: string, ...args) {
  return unstable_cache(
    () => computeXxx(userId, ...args),
    [`stats-xxx-${userId}-${serializedArgs}`],
    { tags: ["stats"], revalidate: 300 },
  )();
}
```

### Stats Query Test Pattern (mock Prisma + bypass cache)
**Source:** `src/lib/queries/stats/hero-stats.test.ts` (lines 1-23)
**Apply to:** All insight query tests, new hero-stats tests for collectionTotal
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  // ...boundary mocks if needed
}));

describe("getXxx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("description", async () => {
    mockPrisma.model.method.mockResolvedValue(/* ... */);

    const { getXxx } = await import("./xxx");
    const result = await getXxx("user-1", /* args */);

    expect(result).toEqual(/* ... */);
  });
});
```

### Stats Component Test Pattern (mock children + test props)
**Source:** `src/components/features/stats/stats-overview.test.tsx` (lines 1-66)
**Apply to:** Updated `stats-overview.test.tsx`, new `records-overview.test.tsx`, new `status-filter-pills.test.tsx`
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";

// Mock child components to isolate testing
vi.mock("./child-component", () => ({
  ChildComponent: (props: Record<string, unknown>) => (
    <div data-testid="child-component" data-prop={props.propName} />
  ),
}));

vi.mock("./data-unavailable", () => ({
  DataUnavailable: (props: Record<string, unknown>) => (
    <div data-testid="data-unavailable" data-label={props.label} />
  ),
}));

// Import AFTER mocks
import { ParentComponent } from "./parent-component";

describe("ParentComponent", () => {
  it("renders child with correct props", () => {
    render(<ParentComponent prop={value} />);
    const child = screen.getByTestId("child-component");
    expect(child).toHaveAttribute("data-prop", "expected");
  });

  it("shows DataUnavailable when data is null", () => {
    render(<ParentComponent prop={null} />);
    expect(screen.getByTestId("data-unavailable")).toBeInTheDocument();
  });
});
```

### nuqs Toggle Component Pattern
**Source:** `src/components/features/stats/year-scope-toggle.tsx` (lines 1-39)
**Apply to:** `status-filter-pills.tsx`
```typescript
"use client";

import { useQueryState, /* parser */ } from "nuqs";

export function ToggleComponent() {
  const [value, setValue] = useQueryState("param", parser.withDefault(defaultValue));

  return (
    <div role="group" aria-label="Label" className="bg-muted inline-flex gap-1 rounded-xl p-1">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={isActive}
          onClick={handleToggle}
          className={isActive ? "bg-selected text-selected-foreground ..." : "text-muted-foreground ..."}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### Error Handling (stats queries)
**Source:** `src/lib/queries/stats/thread-insights.ts` (lines 61-63)
**Apply to:** All modified query files
```typescript
} catch (error) {
  console.error("[stats] computeXxx failed:", { userId, scope, limit, error });
  throw error;
}
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have exact analogs (modifications to existing files or direct pattern clones) |

## Metadata

**Analog search scope:** `src/components/features/stats/`, `src/lib/queries/stats/`, `src/app/(dashboard)/stats/`, `src/components/features/gallery/`, `src/components/features/dashboard/`, `src/types/`
**Files scanned:** 28
**Pattern extraction date:** 2026-05-23
