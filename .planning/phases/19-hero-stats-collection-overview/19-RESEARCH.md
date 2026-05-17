# Phase 19: Hero Stats & Collection Overview - Research

**Researched:** 2026-05-17
**Domain:** Recharts bar charts, Prisma aggregation queries, Next.js Server/Client component composition
**Confidence:** HIGH

## Summary

Phase 19 builds on Phase 18's stats engine foundation to deliver the full Overview tab content: a condensed metrics bar for time-window stats, lifetime counter cards, and three new collection breakdown charts (size category, designer, genre). The query layer (`getHeroStats`) already returns all 8 values needed for the hero section. Three new breakdown queries are needed, each following the established `unstable_cache` + `groupBy` pattern from `collection-breakdown.ts`.

The main technical considerations are: (1) size category is a computed field (not stored in DB), so the breakdown query must fetch charts and bucket them in application code rather than using `prisma.project.groupBy()`; (2) designer and genre breakdowns require joining through Chart to Project to scope by userId; (3) Recharts 3.8.0's `layout="vertical"` prop with swapped axis types produces horizontal bar charts for designer/genre rankings. All CSS tokens (`--chart-*`, `--success-*`, `--status-*`) and font utilities (`font-heading`, `font-mono`, `tabular-nums`) already exist in the codebase.

**Primary recommendation:** Three plans -- (1) query layer + types + chart configs, (2) MetricsBar + LifetimeCounters components, (3) bar chart components + RankedList + Overview layout composition.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a condensed horizontal metrics bar for time-window stats (Today/Week/Month/Year) -- a single continuous strip with subtle dividers, NOT 4 separate identical cards
- **D-02:** Lifetime counters render in a separate StatCards-style section below the metrics bar -- plain `bg-card` border cards with a section label
- **D-03:** Deliberate departure from DesignOS HeroStats.tsx 4-card grid -- metrics bar is a conscious upgrade
- **D-04:** Size categories = vertical bar chart (5 fixed ordered buckets)
- **D-05:** Designer breakdown = horizontal bar chart (`layout="vertical"` in Recharts) -- ranked top-N
- **D-06:** Genre distribution = horizontal bar chart -- same pattern as designer
- **D-07:** Status donut already built in Phase 18 -- no changes needed
- **D-08:** Each chart uses Recharts primitives directly with shadcn ChartContainer + chartConfig -- no wrapper components
- **D-09:** New chart configs in `src/lib/chart-configs.ts`
- **D-10:** Ranked lists below each breakdown chart as primary navigation surface
- **D-11:** Standard HTML `<Link>` components for entity navigation
- **D-12:** Follows existing `LinkableValue` pattern from DesignOS StatCards.tsx
- **D-13:** No chart segment click handlers -- navigation via ranked lists only
- **D-14:** Layout order: metrics bar -> lifetime counters -> 2x2 collection chart grid
- **D-15:** Collection charts in responsive 2x2 grid (status+size top, designer+genre bottom)
- **D-16:** No "coming soon" placeholders for Phase 20/21 content
- **D-17:** Phase 20 inserts between hero block and collections -- single layout adjustment

### Claude's Discretion
- Number of designers/genres in "top N" bar charts (recommended: 10)
- Exact responsive breakpoints for 2x2 -> single column transition
- Whether metrics bar uses single card with internal dividers or flex row
- Animation/transition choices for chart rendering (Recharts defaults fine)
- Color assignments for size category and genre charts -- extend `--chart-*` CSS variable series

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | User can see lifetime hero counters: total stitches, sessions, time, completed | `getHeroStats()` already returns all 4 values. LifetimeCounters component consumes them directly. |
| HERO-02 | User can see rolling time-window stats: today/week/month/year | `getHeroStats()` already returns all 4 time-window values. MetricsBar component consumes them. |
| HERO-03 | User can see collection breakdown by status (donut) | Already built in Phase 18 (`CollectionStatusChart`). No changes needed (D-07). |
| HERO-04 | User can see collection breakdown by size category | New query `getSizeBreakdown()` + `SizeCategoryChart` component. Size computed from chart stitch count. |
| HERO-05 | User can see collection breakdown by designer | New query `getDesignerBreakdown()` + `DesignerBreakdownChart` component. Prisma groupBy on Chart.designerId. |
| HERO-06 | User can see collection breakdown by genre | New query `getGenreBreakdown()` + `GenreDistributionChart` component. Many-to-many through `_ChartToGenre`. |
| INS-06 | All stat entities are clickable links to their detail pages | RankedList component with `<Link>` to `/designers/[id]` and `/genres/[id]`. Both detail pages exist. |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Time-window stitch counts | API/Backend (query layer) | Frontend Client (MetricsBar display) | Computation in `getHeroStats()` with timezone-aware SQL; display in client component |
| Lifetime counters | API/Backend (query layer) | Frontend Server (LifetimeCounters) | Same query, rendered in Server Component (no interactivity needed) |
| Size breakdown | API/Backend (query layer) | Frontend Client (SizeCategoryChart) | Computed field: fetch charts, bucket by stitch count in app code, display via Recharts |
| Designer breakdown | Database (groupBy) | Frontend Client (DesignerBreakdownChart) | Prisma groupBy on designerId, join designer name, display via Recharts |
| Genre breakdown | Database (groupBy) | Frontend Client (GenreDistributionChart) | Count charts per genre via many-to-many, display via Recharts |
| Entity navigation | Frontend Server (RankedList) | -- | Server Component renders `<Link>` elements, no client interactivity needed |
| Overview layout | Frontend Server (page.tsx) | -- | Server Component composes all sections, passes data as props |

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| recharts | 3.8.0 | Bar charts + existing donut chart | [VERIFIED: node_modules/recharts/package.json] |
| date-fns | 4.1.0 | Timezone-aware date boundaries | [VERIFIED: package.json] |
| @date-fns/tz | 1.4.1 | Timezone conversion | [VERIFIED: package.json] |
| nuqs | (installed) | URL state for tabs | [VERIFIED: stats-page-shell.tsx imports] |

### Supporting (already installed)
| Library | Version | Purpose | When Used |
|---------|---------|---------|-----------|
| lucide-react | (installed) | Icons for metrics bar cells | Zap, CalendarDays, CalendarRange, TrendingUp, FolderOpen |
| @/components/ui/chart | shadcn v4 | ChartContainer, ChartTooltip, ChartTooltipContent | All chart components |
| @/components/ui/card | shadcn v4 | Card, CardHeader, CardContent | Chart card wrappers |

**No new dependencies needed.** Everything is already installed from Phase 18.

## Architecture Patterns

### System Architecture Diagram

```
page.tsx (Server Component)
    |
    |-- requireAuth() --> userId
    |
    |-- Promise.all([
    |       getHeroStats(userId),           # existing, cached 5min
    |       getCollectionBreakdown(userId),  # existing, cached 1hr
    |       getSizeBreakdown(userId),        # NEW, cached 1hr
    |       getDesignerBreakdown(userId),    # NEW, cached 1hr
    |       getGenreBreakdown(userId),       # NEW, cached 1hr
    |   ])
    |
    |-- StatsPageShell (Client - tab management)
    |       |
    |       |-- overviewContent (Server-rendered layout)
    |               |
    |               |-- MetricsBar (Client - chart tooltip interactions)
    |               |       props: stitchesToday/Week/Month/Year
    |               |
    |               |-- LifetimeCounters (Server - static display)
    |               |       props: totalLifetimeStitches, totalSessions, totalTimeMinutes, projectsCompleted
    |               |
    |               |-- 2x2 Grid (Server layout wrapper)
    |                       |-- CollectionStatusChart (Client - existing)
    |                       |-- SizeCategoryChart (Client - NEW)
    |                       |-- DesignerBreakdownChart (Client - NEW) + RankedList (Server)
    |                       |-- GenreDistributionChart (Client - NEW) + RankedList (Server)
```

### Recommended Project Structure

```
src/
  lib/
    queries/stats/
      hero-stats.ts           # existing (no changes)
      collection-breakdown.ts # existing (no changes)
      size-breakdown.ts       # NEW
      designer-breakdown.ts   # NEW
      genre-breakdown.ts      # NEW
      index.ts                # add new exports
    chart-configs.ts          # add sizeCategoryConfig, designerBarConfig, genreDistributionConfig
  types/
    stats.ts                  # add SizeBreakdownItem, DesignerBreakdownItem, GenreBreakdownItem
  components/features/stats/
    collection-status-chart.tsx      # existing (no changes)
    stats-page-shell.tsx             # existing (no changes)
    metrics-bar.tsx                  # NEW (client)
    lifetime-counters.tsx            # NEW (server)
    size-category-chart.tsx          # NEW (client)
    designer-breakdown-chart.tsx     # NEW (client)
    genre-distribution-chart.tsx     # NEW (client)
    ranked-list.tsx                  # NEW (server)
    stats-overview.tsx               # NEW (server - layout composition)
  app/(dashboard)/stats/
    page.tsx                         # modify: add new queries, replace inline StatsOverview
```

### Pattern 1: Breakdown Query with `unstable_cache`

**What:** Each breakdown query follows the established `getCollectionBreakdown` pattern -- a compute function wrapped in `unstable_cache` with `tags: ["stats"]` and 1-hour TTL.
**When to use:** All new breakdown queries.
**Example:**
```typescript
// Source: existing src/lib/queries/stats/collection-breakdown.ts pattern
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

async function computeDesignerBreakdown(userId: string, limit: number) {
  const results = await prisma.chart.groupBy({
    by: ["designerId"],
    where: {
      project: { userId },  // scope by user through Chart -> Project relation
      designerId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });
  // Join designer names...
  return results;
}

export function getDesignerBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeDesignerBreakdown(userId, limit),
    [`stats-designer-breakdown-${userId}`],
    { tags: ["stats"], revalidate: 3600 }
  )();
}
```

### Pattern 2: Horizontal Bar Chart (Recharts `layout="vertical"`)

**What:** Horizontal bars with category labels on Y-axis and numeric values on X-axis. [VERIFIED: Recharts 3.8.0 types confirm `CartesianLayout = 'horizontal' | 'vertical'`]
**When to use:** Designer and genre breakdown charts (D-05, D-06).
**Example:**
```typescript
// Source: Recharts API docs + existing CollectionStatusChart pattern
"use client";

import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

### Pattern 3: Size Breakdown Query (Computed Field)

**What:** Size category is computed from stitch count, not stored in DB. Query must fetch all charts and bucket in app code.
**When to use:** `getSizeBreakdown()` query only.
**Example:**
```typescript
// Source: src/lib/utils/size-category.ts (calculateSizeCategory, getEffectiveStitchCount)
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";

async function computeSizeBreakdown(userId: string) {
  const charts = await prisma.chart.findMany({
    where: { project: { userId } },
    select: { stitchCount: true, stitchesWide: true, stitchesHigh: true },
  });

  const buckets = { Mini: 0, Small: 0, Medium: 0, Large: 0, BAP: 0 };
  for (const chart of charts) {
    const { count } = getEffectiveStitchCount(chart.stitchCount, chart.stitchesWide, chart.stitchesHigh);
    const category = calculateSizeCategory(count);
    buckets[category]++;
  }

  return Object.entries(buckets).map(([category, count]) => ({
    category,
    count,
    fill: CATEGORY_FILLS[category],  // map to --chart-1 through --chart-5
  }));
}
```

### Pattern 4: RankedList (Server Component with Links)

**What:** Server Component rendering a numbered list with `<Link>` elements for entity navigation (INS-06).
**When to use:** Below designer and genre charts.
**Example:**
```typescript
// Source: DesignOS StatCards.tsx LinkableValue pattern + existing Link usage
import Link from "next/link";

interface RankedItem {
  id: string;
  name: string;
  count: number;
  href: string;  // e.g., "/designers/abc123"
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

### Anti-Patterns to Avoid
- **Custom chart wrapper components (D-08, D-11 from Phase 18):** Each chart has distinct needs; shared wrappers are premature abstraction
- **onClick handlers on chart segments (D-13):** Avoid WCAG keyboard accessibility issues; ranked lists handle navigation instead
- **Storing size category in DB:** It's a derived field from stitch count; compute at query time using existing `calculateSizeCategory()`
- **Direct `prisma` calls in components:** All queries go through `src/lib/queries/stats/` with `unstable_cache` wrappers
- **Client Components for static content:** MetricsBar needs "use client" (for Recharts/tooltip interactivity), but LifetimeCounters and RankedList are Server Components (no interactivity)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Size category buckets | Custom threshold logic | `calculateSizeCategory()` from `@/lib/utils/size-category` | Already exists, tested, used by gallery; thresholds (Mini <1k, Small <5k, Medium <25k, Large <50k, BAP >=50k) are established [VERIFIED: src/lib/utils/size-category.ts] |
| Effective stitch count | Manual stitch count logic | `getEffectiveStitchCount()` from same file | Handles stitchCount=0 fallback to stitchesWide*stitchesHigh [VERIFIED: src/lib/utils/size-category.ts] |
| Time formatting | Custom hours/minutes formatter | `formatTime()` from `@/lib/utils/format-time` | Already handles edge cases (0h, minutes-only, hours+minutes) [VERIFIED: src/lib/utils/format-time.ts] |
| Chart tooltip | Custom tooltip component | shadcn `ChartTooltip` + `ChartTooltipContent` | Integrated with design tokens, handles dark mode [VERIFIED: collection-status-chart.tsx usage] |
| Chart color theming | Inline hex colors | `chartConfig` objects with `var(--chart-N)` CSS variables | Tokens exist in globals.css for both light/dark [VERIFIED: globals.css] |

## Common Pitfalls

### Pitfall 1: Size Breakdown Can't Use groupBy
**What goes wrong:** Attempting `prisma.chart.groupBy({ by: ["sizeCategory"] })` fails because `sizeCategory` doesn't exist in the schema -- it's computed from `stitchCount`.
**Why it happens:** Natural instinct is to follow the `getCollectionBreakdown` pattern (which uses `groupBy` on the `status` enum). Size category is derived, not stored.
**How to avoid:** Fetch all charts with `findMany` (selecting only stitchCount/stitchesWide/stitchesHigh), then bucket in application code using `calculateSizeCategory()`.
**Warning signs:** Prisma error about unknown field.

### Pitfall 2: Genre Many-to-Many Query Scoping
**What goes wrong:** Genre breakdown counts ALL charts, not just the user's projects.
**Why it happens:** Genres are on Chart (not Project), and the many-to-many `_ChartToGenre` table doesn't have a userId column. You need to filter through Chart -> Project -> userId.
**How to avoid:** Use `prisma.genre.findMany({ where: { charts: { some: { project: { userId } } } } })` or a raw aggregation query that joins through project. [VERIFIED: Prisma schema shows Chart.genres is Genre[], Chart.project is Project? with userId]
**Warning signs:** Stats show genres from all users (single-user app makes this hard to detect, but the pattern should be correct for future multi-user).

### Pitfall 3: Recharts Horizontal Bar Axis Type Swap
**What goes wrong:** Using `layout="vertical"` without changing axis types produces empty or misaligned charts.
**Why it happens:** Default XAxis is `type="category"` and YAxis is `type="number"`. When layout flips to vertical, these must swap: XAxis becomes `type="number"`, YAxis becomes `type="category"`.
**How to avoid:** Always set explicit `type` on both axes when using `layout="vertical"`.
**Warning signs:** Bars not rendering, axis labels on wrong axis. [CITED: Recharts API docs, GitHub issues #90, #308]

### Pitfall 4: Charts Without stitchCount Fall to Mini
**What goes wrong:** Charts with `stitchCount=0` and no dimensions (stitchesWide=0, stitchesHigh=0) get bucketed as "Mini" since `calculateSizeCategory(0)` returns "Mini".
**Why it happens:** Some charts in the collection may not have stitch count data entered yet.
**How to avoid:** Use `getEffectiveStitchCount()` first (which handles the stitchesWide*stitchesHigh fallback). Charts with truly zero data will still be "Mini" -- this is acceptable behavior matching the gallery filter. Consider adding a count/label if the number of unknown-size charts is significant.
**Warning signs:** Disproportionately large "Mini" bucket.

### Pitfall 5: Designer/Genre Breakdown Returns No Data for Unlinked Charts
**What goes wrong:** Charts without a designer (`designerId: null`) or without genres are excluded from breakdown counts.
**Why it happens:** `groupBy` with `designerId: { not: null }` filter, and genre many-to-many only counts charts that have at least one genre.
**How to avoid:** This is correct behavior -- you can't chart "Unknown Designer" meaningfully. But be aware the sum of all designer/genre chart counts may be less than total projects.
**Warning signs:** None -- this is expected.

### Pitfall 6: Metrics Bar "use client" Is Required
**What goes wrong:** Attempting to render MetricsBar as a Server Component.
**Why it happens:** Even though the metrics bar is visually simple, if it includes any Recharts tooltips or interactive elements, it needs "use client".
**How to avoid:** MetricsBar is a client component per the UI-SPEC. However, note that the current design is pure HTML/CSS without Recharts -- it's a flex row with text values. If no tooltip/hover interactivity is needed, it could be a Server Component. The decision depends on whether the green accent background or icon animation requires client-side behavior. **Recommendation: Make it a Server Component initially since it's pure display, and only add "use client" if interactive behavior is needed later.**
**Warning signs:** None -- this is an architecture decision.

## Code Examples

### Chart Config Pattern (for new configs)
```typescript
// Source: existing src/lib/chart-configs.ts pattern [VERIFIED]
import { type ChartConfig } from "@/components/ui/chart";

export const sizeCategoryConfig = {
  Mini: { label: "Mini", color: "var(--chart-1)" },
  Small: { label: "Small", color: "var(--chart-2)" },
  Medium: { label: "Medium", color: "var(--chart-3)" },
  Large: { label: "Large", color: "var(--chart-4)" },
  BAP: { label: "BAP", color: "var(--chart-5)" },
} satisfies ChartConfig;

export const designerBarConfig = {
  count: { label: "Charts", color: "var(--chart-1)" },
} satisfies ChartConfig;

export const genreDistributionConfig = {
  count: { label: "Charts", color: "var(--chart-3)" },
} satisfies ChartConfig;
```

### Recharts Test Mock Pattern (for new chart tests)
```typescript
// Source: existing collection-status-chart.test.tsx pattern [VERIFIED]
vi.mock("recharts", () => ({
  BarChart: ({ children, layout }: { children: ReactNode; layout?: string }) => (
    <div data-testid="bar-chart" data-layout={layout}>{children}</div>
  ),
  Bar: ({ children, dataKey }: { children: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config }: { children: ReactNode; config: Record<string, unknown> }) => (
    <div data-testid="chart-container" data-config-keys={Object.keys(config).join(",")}>{children}</div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}));
```

### Prisma Genre Breakdown Query
```typescript
// Source: Prisma schema (Genre -> Chart[] many-to-many, Chart -> Project -> userId)
// Note: Can't use prisma.genre.groupBy because genre-chart is many-to-many
// Must count charts per genre with user scoping

async function computeGenreBreakdown(userId: string, limit: number) {
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

  return genres.map((g) => ({
    genreId: g.id,
    name: g.name,
    count: g._count.charts,
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x `ResponsiveContainer` | Recharts 3.x built-in responsive (via shadcn `ChartContainer`) | Recharts 3.0 (2024) | No need for explicit `ResponsiveContainer` wrapper [VERIFIED: collection-status-chart.tsx uses ChartContainer without ResponsiveContainer] |
| Inline chart config | Centralized `chartConfig` objects | shadcn chart component convention | Colors and labels defined once in `chart-configs.ts`, referenced by CSS variable [VERIFIED: existing pattern] |
| `revalidatePath` for cache | `unstable_cache` + `revalidateTag` | Next.js 15+ | Tag-based invalidation allows surgical cache busting [VERIFIED: hero-stats.ts, collection-breakdown.ts] |

**Key version notes:**
- Recharts 3.8.0 is installed (not 2.x) -- API is the same for basic BarChart/PieChart usage but `ResponsiveContainer` is no longer needed with `ChartContainer` [VERIFIED: node_modules/recharts/package.json]
- Prisma 7 uses `@/generated/prisma/client` import path (not `@prisma/client`) [VERIFIED: collection-breakdown.ts imports]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `prisma.genre.findMany` with `_count.charts` filtered by userId works in Prisma 7 for many-to-many relations | Code Examples | Query might need restructuring; test will catch |
| A2 | Recharts 3.8.0 `layout="vertical"` produces horizontal bars with same API as documented | Architecture Patterns | Chart won't render; verified via type definitions but not runtime tested |
| A3 | Genre detail pages at `/genres/[id]` accept the genre ID from the ranked list links | Phase Requirements | Link would 404; genre page exists but link format needs verification |

**All other claims verified via codebase inspection or documentation.**

## Open Questions (RESOLVED)

1. **MetricsBar: Server or Client Component?**
   - What we know: UI-SPEC labels it as "client component" but the design is pure HTML/CSS display (no hooks, no event handlers, no Recharts)
   - What's unclear: Whether any interactivity is planned (tooltip, hover state with JS)
   - Recommendation: Start as Server Component. The metrics bar is a flex row with text and icons -- no client-side behavior needed. If interactive behavior is needed, add "use client" later.
   - **RESOLVED:** Plan 02 implements MetricsBar as a Server Component (no "use client"). Pure display with icons and text -- no client-side behavior required.

2. **Genre items: links or plain text?**
   - What we know: UI-SPEC says "genre names are plain text (not links)" because "no detail page exists"
   - What's actually true: Genre detail pages DO exist at `/genres/[id]` [VERIFIED: src/app/(dashboard)/genres/[id]/page.tsx]
   - Recommendation: Make genre items `<Link>` elements pointing to `/genres/{genreId}`, matching the designer pattern. This fulfills INS-06 more completely and the infrastructure exists.
   - **RESOLVED:** Plan 03 implements genre items as `<Link>` elements to `/genres/{genreId}`. Genre detail pages confirmed to exist. Fulfills INS-06.

3. **Charts with no stitch data in size breakdown**
   - What we know: `getEffectiveStitchCount()` returns `{ count: 0, approximate: false }` for charts with zero stitchCount and zero dimensions
   - What's unclear: Whether these should be counted in the size chart at all, or excluded
   - Recommendation: Include them in "Mini" bucket (consistent with gallery behavior). The UI-SPEC doesn't call out an "Unknown" category.
   - **RESOLVED:** Plan 01 query uses `getEffectiveStitchCount()` and includes zero-data charts in "Mini" bucket, consistent with gallery filter behavior.

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity (Recharts charts need it; LifetimeCounters and RankedList do not)
- **TDD mandatory** -- tests before implementation in all plans
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **Semantic design tokens** -- use `bg-card`, `text-muted-foreground`, etc. Never hardcoded color scales
- **Pin exact versions** -- no `^` or `~` (no new deps needed for this phase)
- **Quality gates** -- `/impeccable:polish` after UI plans, `/impeccable:audit` before verification
- **Prisma schema is source of truth** -- no schema changes needed for this phase
- **No `Button render={<Link>}`** -- use `<Link>` directly or `<LinkButton>`
- **`buttonVariants` in Server Components must import from `button-variants.ts`** not `button.tsx`
- **Check Context7 for bleeding-edge library APIs** before using version-specific features

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Lifetime counters render 4 values | unit | `npx vitest run src/components/features/stats/lifetime-counters.test.tsx` | Wave 0 |
| HERO-02 | Metrics bar renders 4 time-window values | unit | `npx vitest run src/components/features/stats/metrics-bar.test.tsx` | Wave 0 |
| HERO-03 | Status donut renders (existing) | unit | `npx vitest run src/components/features/stats/collection-status-chart.test.tsx` | Exists |
| HERO-04 | Size category chart renders 5 bars | unit | `npx vitest run src/components/features/stats/size-category-chart.test.tsx` | Wave 0 |
| HERO-05 | Designer chart renders top-N horizontal bars | unit | `npx vitest run src/components/features/stats/designer-breakdown-chart.test.tsx` | Wave 0 |
| HERO-06 | Genre chart renders distribution bars | unit | `npx vitest run src/components/features/stats/genre-distribution-chart.test.tsx` | Wave 0 |
| INS-06 | Ranked list renders clickable links | unit | `npx vitest run src/components/features/stats/ranked-list.test.tsx` | Wave 0 |
| HERO-04 | getSizeBreakdown returns correct buckets | unit | `npx vitest run src/lib/queries/stats/size-breakdown.test.ts` | Wave 0 |
| HERO-05 | getDesignerBreakdown returns top-N designers | unit | `npx vitest run src/lib/queries/stats/designer-breakdown.test.ts` | Wave 0 |
| HERO-06 | getGenreBreakdown returns genre counts | unit | `npx vitest run src/lib/queries/stats/genre-breakdown.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/queries/stats/size-breakdown.test.ts` -- covers HERO-04 query
- [ ] `src/lib/queries/stats/designer-breakdown.test.ts` -- covers HERO-05 query
- [ ] `src/lib/queries/stats/genre-breakdown.test.ts` -- covers HERO-06 query
- [ ] `src/components/features/stats/metrics-bar.test.tsx` -- covers HERO-02
- [ ] `src/components/features/stats/lifetime-counters.test.tsx` -- covers HERO-01
- [ ] `src/components/features/stats/size-category-chart.test.tsx` -- covers HERO-04
- [ ] `src/components/features/stats/designer-breakdown-chart.test.tsx` -- covers HERO-05
- [ ] `src/components/features/stats/genre-distribution-chart.test.tsx` -- covers HERO-06
- [ ] `src/components/features/stats/ranked-list.test.tsx` -- covers INS-06
- [ ] `src/lib/chart-configs.test.ts` -- extends existing tests for new configs

Framework and test infrastructure already exist -- no setup needed.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` in page.tsx (existing) |
| V3 Session Management | no | -- |
| V4 Access Control | yes | All queries scoped by `userId` from `requireAuth()` |
| V5 Input Validation | no | Read-only page, no user input |
| V6 Cryptography | no | -- |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Data leakage (seeing other users' stats) | Information Disclosure | All queries filter by `userId` from authenticated session [VERIFIED: existing queries use `where: { project: { userId } }`] |
| Cache poisoning | Tampering | Cache keys include userId (`stats-hero-${userId}`), preventing cross-user cache reads [VERIFIED: hero-stats.ts, collection-breakdown.ts] |

**No new security concerns for this phase.** All patterns follow the existing authenticated query layer.

## Sources

### Primary (HIGH confidence)
- `src/lib/queries/stats/hero-stats.ts` -- existing query returning all 8 hero values
- `src/lib/queries/stats/collection-breakdown.ts` -- query pattern template for new breakdowns
- `src/lib/utils/size-category.ts` -- `calculateSizeCategory()`, `getEffectiveStitchCount()` utilities
- `src/components/features/stats/collection-status-chart.tsx` -- Recharts + ChartContainer integration pattern
- `src/lib/chart-configs.ts` -- existing chart config pattern
- `src/types/stats.ts` -- existing type definitions
- `prisma/schema.prisma` -- Chart model with designerId, genres relation, stitchCount fields
- `node_modules/recharts/types/util/types.d.ts` -- `CartesianLayout = 'horizontal' | 'vertical'` type
- `src/app/globals.css` -- CSS tokens `--chart-1` through `--chart-5`, `--success-*`, `--status-*`

### Secondary (MEDIUM confidence)
- [Recharts API docs](https://recharts.github.io/en-US/api/BarChart/) -- `layout="vertical"` with axis type swap
- [shadcn chart docs](https://ui.shadcn.com/docs/components/chart) -- ChartContainer + ChartConfig pattern
- Context7 `/recharts/recharts` -- BarChart with Cell colors, Label/LabelList
- Context7 `/websites/ui_shadcn` -- chart component patterns with bar charts

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all deps already installed, versions verified in package.json and node_modules
- Architecture: HIGH -- follows established Phase 18 patterns exactly, new components fit existing structure
- Pitfalls: HIGH -- verified via codebase inspection (computed fields, many-to-many relations, axis types)

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable -- no dependency changes expected)
