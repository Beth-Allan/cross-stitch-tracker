# Phase 21: Records, Insights & Celebrations - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 22 new/modified files
**Analogs found:** 18 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/stats.ts` | type | N/A (extend) | `src/types/stats.ts` (self) | exact |
| `src/lib/queries/stats/personal-bests.ts` | service | CRUD-aggregate | `src/lib/queries/stats/hero-stats.ts` | exact |
| `src/lib/queries/stats/fastest-completions.ts` | service | CRUD-aggregate | `src/lib/queries/stats/designer-breakdown.ts` | exact |
| `src/lib/queries/stats/thread-insights.ts` | service | CRUD-aggregate | `src/lib/queries/stats/designer-breakdown.ts` | exact |
| `src/lib/queries/stats/designer-insights.ts` | service | CRUD-aggregate | `src/lib/queries/stats/designer-breakdown.ts` | exact |
| `src/lib/queries/stats/genre-insights.ts` | service | CRUD-aggregate | `src/lib/queries/stats/genre-breakdown.ts` | role-match |
| `src/lib/queries/stats/completion-estimates.ts` | service | CRUD-aggregate | `src/lib/queries/stats/hero-stats.ts` | role-match |
| `src/lib/queries/stats/available-years.ts` | service | CRUD-aggregate | `src/lib/queries/stats/hero-stats.ts` | role-match |
| `src/lib/queries/stats/record-detection.ts` | service | event-driven | `src/lib/queries/stats/hero-stats.ts` | partial |
| `src/lib/queries/stats/index.ts` | config | N/A (extend) | `src/lib/queries/stats/index.ts` (self) | exact |
| `src/app/(dashboard)/stats/search-params.ts` | config | N/A (extend) | `src/app/(dashboard)/stats/search-params.ts` (self) | exact |
| `src/app/(dashboard)/stats/page.tsx` | controller | request-response | `src/app/(dashboard)/stats/page.tsx` (self) | exact |
| `src/components/features/stats/records-overview.tsx` | component (layout) | request-response | `src/components/features/stats/activity-overview.tsx` | exact |
| `src/components/features/stats/records-table.tsx` | component (client) | request-response | `src/components/features/stats/session-history-table.tsx` | exact |
| `src/components/features/stats/year-scope-toggle.tsx` | component (client) | request-response | `src/components/features/stats/stats-page-shell.tsx` | role-match |
| `src/components/features/stats/thread-insight-list.tsx` | component (server) | request-response | `src/components/features/stats/ranked-list.tsx` | exact |
| `src/components/features/stats/designer-insight-list.tsx` | component (server) | request-response | `src/components/features/stats/ranked-list.tsx` | exact |
| `src/components/features/stats/genre-insight-list.tsx` | component (server) | request-response | `src/components/features/stats/ranked-list.tsx` | exact |
| `src/components/features/stats/completion-estimates.tsx` | component (server) | request-response | `src/components/features/stats/ranked-list.tsx` | role-match |
| `src/components/features/stats/record-celebration.tsx` | component (client) | event-driven | `src/components/features/sessions/log-session-modal.tsx` | partial |
| `src/lib/actions/session-actions.ts` | action | CRUD (extend) | `src/lib/actions/session-actions.ts` (self) | exact |
| `package.json` | config | N/A | N/A | N/A |

## Pattern Assignments

### `src/types/stats.ts` (type, extend existing)

**Analog:** Self -- add new type blocks following established section-comment convention.

**Section separator pattern** (lines 1-4, 16-17, etc.):
```typescript
// ─── Hero Stats ───────────────────────────────────────────────────────────

export interface StatsHeroData {
  // ...
}

// ─── Collection Breakdown ─────────────────────────────────────────────────
```

**New sections to add:** Records, Fastest Completions, Thread Insights, Designer Insights, Genre Insights, Completion Estimates, Broken Records, Available Years. Follow same `// ─── Section Name ──────` pattern.

---

### `src/lib/queries/stats/personal-bests.ts` (service, CRUD-aggregate)

**Analog:** `src/lib/queries/stats/hero-stats.ts`

**Imports pattern** (lines 1-4):
```typescript
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone, getLocalDayBoundaries } from "./timezone";
import type { StatsHeroData } from "@/types/stats";
```

**Core query pattern** (lines 6-52):
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

**Cache wrapper pattern** (lines 54-59):
```typescript
export function getHeroStats(userId: string) {
  return unstable_cache(() => computeHeroStats(userId), [`stats-hero-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}
```

**Year-scoped cache variant** -- from `monthly-totals.ts` (lines 59-68):
```typescript
export function getMonthlyTotals(userId: string, year: number) {
  const currentYear = new Date().getFullYear();
  const revalidate = year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeMonthlyTotals(userId, year),
    [`stats-monthly-${userId}-${year}`],
    { tags: ["stats"], revalidate },
  )();
}
```

**Apply to:** All 7 new query files. Use `scope` param in cache key: `[`stats-personal-bests-${userId}-${scope}`]`. Historical scope (past years) uses 3600s TTL; "all" and current year use 300s.

**Timezone-aware year boundaries** -- from `monthly-totals.ts` (lines 24-27):
```typescript
const tz = getUserTimezone(userId);
const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
```

---

### `src/lib/queries/stats/fastest-completions.ts` (service, CRUD-aggregate)

**Analog:** `src/lib/queries/stats/designer-breakdown.ts`

**groupBy + hydrate pattern** (lines 5-50):
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

    if (results.length === 0) return [];

    const designerIds = results.map((r) => r.designerId).filter((id): id is string => id !== null);

    const designers = await prisma.designer.findMany({
      where: { id: { in: designerIds } },
      select: { id: true, name: true },
    });

    const nameMap = new Map(designers.map((d) => [d.id, d.name]));
    // ... map results
  } catch (error) {
    console.error("[stats] computeDesignerBreakdown failed:", { userId, limit, error });
    throw error;
  }
}
```

**Apply to:** `fastest-completions.ts`, `thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts` all follow the groupBy -> hydrate two-step pattern.

---

### `src/lib/queries/stats/record-detection.ts` (service, event-driven)

**Analog:** `src/lib/queries/stats/hero-stats.ts` (for query structure) + `src/lib/queries/stats/timezone.ts` (for local day boundaries)

**Timezone utility** -- from `timezone.ts` (lines 10-34):
```typescript
export function getUserTimezone(_userId: string): string {
  return process.env.STATS_TIMEZONE ?? "America/Edmonton";
}

export function getLocalDayBoundaries(timezone: string, now?: TZDate): LocalDateBoundaries {
  const current = now ?? TZDate.tz(timezone);
  return {
    todayStart: startOfDay(current),
    todayEnd: endOfDay(current),
    // ...
  };
}
```

**Key difference:** This function is NOT cached (called per-request from the server action, not via `unstable_cache`). It must compare the just-inserted session's values against historical records to detect broken records.

---

### `src/app/(dashboard)/stats/search-params.ts` (config, extend)

**Analog:** Self -- `src/app/(dashboard)/stats/search-params.ts` (lines 1-16)

**Full current content:**
```typescript
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

**Add:** `scope: parseAsString.withDefault("all")` to the cache definition.

---

### `src/app/(dashboard)/stats/page.tsx` (controller, extend)

**Analog:** Self -- `src/app/(dashboard)/stats/page.tsx` (lines 1-106)

**Promise.all parallel fetch pattern** (lines 37-61):
```typescript
const [
  heroStats,
  collectionBreakdown,
  sizeBreakdown,
  // ...
] = await Promise.all([
  getHeroStats(user.id),
  getCollectionBreakdown(user.id),
  getSizeBreakdown(user.id),
  // ...
]);
```

**Tab content wiring pattern** (lines 81-105):
```typescript
return (
  <StatsPageShell
    overviewContent={<StatsOverview heroStats={heroStats} /* ... */ />}
    activityContent={<ActivityOverview /* ... */ />}
  />
);
```

**Add:** Extract `scope` from `parsedParams`, add new queries to `Promise.all`, create `RecordsOverview` component and pass as `recordsContent` prop. Also add `getAvailableYears` query.

---

### `src/components/features/stats/records-overview.tsx` (component, layout, Server)

**Analog:** `src/components/features/stats/activity-overview.tsx`

**Layout pattern** (lines 1-91):
```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PaceCards } from "./pace-cards";
// ... sub-component imports
import type { /* data types */ } from "@/types/stats";

interface ActivityOverviewProps {
  paceMetrics: PaceMetricsData;
  monthlyTotals: MonthlyTotal[];
  // ... all data as props
  hasNoSessions: boolean;
}

export function ActivityOverview({
  paceMetrics,
  monthlyTotals,
  // ...
  hasNoSessions,
}: ActivityOverviewProps) {
  if (hasNoSessions) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold">No sessions logged yet</p>
        <p className="text-sm">...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sections with Card wrappers and section gaps */}
      <Card>
        <CardContent className="pt-6">
          <SubComponent data={data} />
        </CardContent>
      </Card>
      {/* ... more sections */}
    </div>
  );
}
```

**Key pattern:** Server Component (no "use client"), receives all data as props, renders Card-wrapped sections with `space-y-8` gaps. Empty state check at top.

---

### `src/components/features/stats/records-table.tsx` (component, client)

**Analog:** `src/components/features/stats/session-history-table.tsx`

**Client table pattern** (lines 1-14, 36-184):
```typescript
"use client";

import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import Link from "next/link";
import { ArrowUpDown, Camera } from "lucide-react";
import { format } from "date-fns";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
// ...

interface SessionHistoryTableProps {
  data: SessionHistoryData;
  projects: { id: string; name: string }[];
}

export function SessionHistoryTable({ data, projects }: SessionHistoryTableProps) {
  // ...
}
```

**Table card wrapper** (lines 87-152):
```typescript
<div className="border-border bg-card rounded-xl border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        {/* ... */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.sessions.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="py-8 text-center">
            <span className="text-muted-foreground text-sm">
              No sessions match your filters
            </span>
          </TableCell>
        </TableRow>
      ) : (
        data.sessions.map((item) => (
          <TableRow key={item.id} className="hover:bg-accent">
            {/* cells */}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>
```

**Entity link in table cell** (lines 128-134):
```typescript
<TableCell>
  <Link
    href={`/charts/${item.chartId}`}
    className="decoration-muted-foreground/50 hover:decoration-foreground inline-block max-w-[200px] truncate underline"
  >
    {item.projectName}
  </Link>
</TableCell>
```

**Monospace tabular-nums for numbers** (lines 125, 136):
```typescript
<TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
  {format(new Date(item.date), "MMM d, yyyy")}
</TableCell>
<TableCell className="tabular-nums">
  {item.stitchCount.toLocaleString()}
</TableCell>
```

---

### `src/components/features/stats/year-scope-toggle.tsx` (component, client)

**Analog:** `src/components/features/stats/stats-page-shell.tsx` (for nuqs URL state pattern)

**nuqs URL state pattern** (lines 4, 31-34):
```typescript
import { useQueryState, parseAsStringLiteral } from "nuqs";

const [tab, setTab] = useQueryState(
  "tab",
  parseAsStringLiteral([...STATS_TABS]).withDefault("overview"),
);
```

**For year-scope:** Use `parseAsString.withDefault("all")` instead of `parseAsStringLiteral` (since year values are dynamic).

---

### `src/components/features/stats/thread-insight-list.tsx` (component, server)

**Analog:** `src/components/features/stats/ranked-list.tsx`

**Ranked list pattern** (lines 1-41):
```typescript
import Link from "next/link";

export interface RankedItem {
  id: string;
  name: string;
  count: number;
  href?: string;
}

interface RankedListProps {
  items: RankedItem[];
  label: string;
}

export function RankedList({ items, label }: RankedListProps) {
  return (
    <div className="mt-3 space-y-1">
      <h4 className="sr-only">{label}</h4>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
              {index + 1}.
            </span>
            {item.href ? (
              <Link
                href={item.href}
                className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm underline underline-offset-2 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-foreground text-sm">{item.name}</span>
            )}
          </div>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
```

**Thread swatch extension from DesignOS** -- `YearInReview.tsx FavouriteSupplies` (lines 626-636):
```typescript
{item.colourHex && (
  <div
    style={{
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      backgroundColor: item.colourHex,
      border: '1px solid #e7e5e4',
      flexShrink: 0,
    }}
  />
)}
```

**Adapt to Tailwind:** `<div className="h-4 w-4 shrink-0 rounded-sm border border-border" style={{ backgroundColor: hexCode }} aria-hidden="true" />` with fallback `<div className="bg-muted border-border h-4 w-4 shrink-0 rounded-sm border" aria-hidden="true" />`

**Apply to:** `thread-insight-list.tsx` adds swatch before item name. `designer-insight-list.tsx` adds percentage+fraction after name. `genre-insight-list.tsx` closely mirrors RankedList but with stitch counts formatted via `toLocaleString()`.

---

### `src/components/features/stats/completion-estimates.tsx` (component, server)

**Analog:** `src/components/features/stats/ranked-list.tsx` (for list structure) + `product-plan/sections/.../YearInReview.tsx TopProjectsRanking` (for progress bar pattern)

**Progress bar pattern from DesignOS** (lines 567-580):
```typescript
<div style={{ flex: 1, height: '6px', backgroundColor: '#f5f5f4', borderRadius: '3px', overflow: 'hidden' }}>
  <div
    style={{
      width: `${proj.percentOfYearTotal}%`,
      height: '100%',
      backgroundColor: '#a7f3d0',
      borderRadius: '3px',
      transition: 'width 300ms ease',
    }}
  />
</div>
```

**Adapt to Tailwind:** `<div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"><div className="bg-progress h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} /></div>`

**Add accessibility:** `role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="{projectName} completion"`

---

### `src/components/features/stats/record-celebration.tsx` (component, client, event-driven)

**Analog:** `src/components/features/sessions/log-session-modal.tsx` (for toast usage pattern)

**Toast import and usage** (line 5, lines 200-216):
```typescript
import { toast } from "sonner";

// Success toast pattern:
toast.success("Session logged");

// Error toast pattern:
toast.error("Session could not be saved. Check that stitch count is a positive number and a project is selected.");
```

**For celebrations:** Use `toast.custom()` instead of `toast.success()` for themed amber styling. The celebration function should be a standalone client utility (not a component) that the log-session-modal calls after receiving `brokenRecords`.

**canvas-confetti SSR safety:** Use dynamic import inside the function or keep it in a "use client" module only imported by client code.

---

### `src/lib/actions/session-actions.ts` (action, extend)

**Analog:** Self -- `src/lib/actions/session-actions.ts`

**createSession return pattern** (lines 47-106):
```typescript
export async function createSession(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = sessionFormSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { id: true, userId: true, chartId: true, startingStitches: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const session = await prisma.$transaction(async (tx) => {
      // ... create + recalculateProgress
    });

    // ... photo processing ...

    revalidatePath(`/charts/${project.chartId}`);
    revalidatePath("/sessions");
    revalidateTag("stats", { expire: 0 });
    return { success: true as const, session: returnSession };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createSession error:", error);
    return { success: false as const, error: "Failed to create session" };
  }
}
```

**Modification point:** After the transaction and photo processing, BEFORE the return statement, call `detectBrokenRecords(user.id, { date, stitchCount, projectId })`. Add `brokenRecords` as optional field in success return: `return { success: true as const, session: returnSession, brokenRecords }`.

**Important:** The `brokenRecords` field must be optional (`brokenRecords?: BrokenRecord[]`) to maintain backward compatibility. Existing callers that don't check it continue working.

---

## Shared Patterns

### Authentication / User Scoping
**Source:** `src/lib/queries/stats/hero-stats.ts` line 7, `src/app/(dashboard)/stats/page.tsx` line 25
**Apply to:** All new query functions (userId passed as parameter), page.tsx (requireAuth at top)
```typescript
// In page.tsx:
const user = await requireAuth();

// In all query functions -- userId is a parameter, used in Prisma where clauses:
where: { project: { userId } }
```

### Cache Strategy (unstable_cache + revalidateTag)
**Source:** `src/lib/queries/stats/hero-stats.ts` lines 54-59, `src/lib/queries/stats/monthly-totals.ts` lines 59-68
**Apply to:** All 7 new query files
```typescript
export function getQueryName(userId: string, scope: string) {
  const isHistorical = scope !== "all" && parseInt(scope) < new Date().getFullYear();
  return unstable_cache(
    () => computeQueryName(userId, scope),
    [`stats-queryname-${userId}-${scope}`],
    { tags: ["stats"], revalidate: isHistorical ? 3600 : 300 },
  )();
}
```

### Error Handling in Queries
**Source:** `src/lib/queries/stats/hero-stats.ts` lines 48-51
**Apply to:** All new query compute functions
```typescript
} catch (error) {
  console.error("[stats] computeXxx failed:", { userId, /* params */, error });
  throw error;
}
```

### Entity Link Styling
**Source:** `src/components/features/stats/ranked-list.tsx` lines 27-33
**Apply to:** RecordsTable project links, DesignerInsightList designer links, GenreInsightList genre links
```typescript
<Link
  href={href}
  className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm underline underline-offset-2 transition-colors"
>
  {name}
</Link>
```

### Section Heading Pattern
**Source:** `src/components/features/stats/stats-overview.tsx` lines 55, 66, 79, 99
**Apply to:** All insight section Cards, completion estimates Card
```typescript
<CardHeader>
  <h3 className="font-heading text-sm font-semibold">Section Title</h3>
</CardHeader>
```

### Test Pattern for Stats Queries
**Source:** `src/lib/queries/stats/designer-breakdown.test.ts` (full file)
**Apply to:** All 8 new query test files
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getQueryName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no data exists", async () => {
    mockPrisma.modelName.groupBy.mockResolvedValue([]);
    const { getQueryName } = await import("./query-file");
    const result = await getQueryName("user-1", "all");
    expect(result).toEqual([]);
  });

  // ... more test cases
});
```

### Test Pattern for Stats Components
**Source:** `src/components/features/stats/ranked-list.test.tsx` (full file)
**Apply to:** All 7 new component test files
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import { ComponentName } from "./component-file";

const mockData = [/* ... */];

describe("ComponentName", () => {
  it("renders expected content", () => {
    render(<ComponentName data={mockData} />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });
  // ...
});
```

### Toast Pattern
**Source:** `src/components/features/sessions/log-session-modal.tsx` lines 5, 201, 205
**Apply to:** `record-celebration.tsx`
```typescript
import { toast } from "sonner";

// Standard usage:
toast.success("Session logged");
toast.error("Error message");

// Celebration extends to custom toast:
toast.custom((toastId) => (
  <CelebrationToastContent record={record} onDismiss={() => toast.dismiss(toastId)} />
), { duration: 5000 });
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/stats/record-celebration.tsx` | client utility | event-driven | No existing `toast.custom()` usage in codebase; no existing canvas-confetti integration. Use RESEARCH.md patterns for confetti API + sonner toast.custom() API. |
| `src/lib/queries/stats/record-detection.ts` | service | event-driven | No existing "post-mutation comparison" pattern. Query structure follows hero-stats.ts but the invocation pattern (called from server action, not cached) is unique. |

**Guidance for planner:** These two files should reference the code examples in RESEARCH.md (sections "Record Detection Query" and "Celebration Client Component") as their primary patterns, supplemented by the shared patterns above.

---

## Metadata

**Analog search scope:** `src/lib/queries/stats/`, `src/components/features/stats/`, `src/lib/actions/`, `src/app/(dashboard)/stats/`, `src/types/`, `product-plan/sections/stitching-sessions-and-statistics/`
**Files scanned:** 42
**Pattern extraction date:** 2026-05-17
