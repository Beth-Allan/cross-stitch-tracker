# Phase 19: Hero Stats & Collection Overview - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 19 delivers the **user-facing stats content** for the Overview tab: time-window stitch counters, lifetime summary counters, and interactive collection breakdown charts (by status, size, designer, genre). It builds on Phase 18's query layer, caching, and Recharts foundation. All entity references in stats are clickable links to their detail pages.

</domain>

<decisions>
## Implementation Decisions

### Hero Counter Presentation
- **D-01:** Use a **condensed horizontal metrics bar** for time-window stats (Today/Week/Month/Year) — a single continuous strip with subtle dividers, NOT 4 separate identical cards. This avoids the generic AI-dashboard "4 equal cards" pattern and feels more intentionally designed.
- **D-02:** Lifetime counters (total stitches, total sessions, total time, projects completed) render in a **separate StatCards-style section** below the metrics bar — plain `bg-card` border cards with a section label, matching the DesignOS `StatCards` pattern.
- **D-03:** This is a deliberate departure from the DesignOS `HeroStats.tsx` 4-card grid. The DesignOS design is a starting point but the metrics bar is a conscious upgrade for visual distinctiveness.

### Collection Breakdown Charts
- **D-04:** **Size categories** (HERO-04) = **vertical bar chart** — 5 fixed ordered buckets (Mini/Small/Medium/Large/BAP) with short labels, natural progression order
- **D-05:** **Designer breakdown** (HERO-05) = **horizontal bar chart** (`layout="vertical"` in Recharts) — ranked top-N list, designer names on Y-axis to avoid truncation
- **D-06:** **Genre distribution** (HERO-06) = **horizontal bar chart** — same pattern as designer, handles 5-15 categories gracefully
- **D-07:** Status donut (HERO-03) is already built from Phase 18 — no changes needed
- **D-08:** Each chart uses Recharts `BarChart + Bar + XAxis + YAxis + Cell` primitives directly with shadcn `ChartContainer` + `chartConfig` — no wrapper components (per Phase 18 D-11)
- **D-09:** New chart configs added to `src/lib/chart-configs.ts` — `sizeCategoryConfig`, `designerBarConfig`, `genreDistributionConfig`

### Entity Click-Throughs (INS-06)
- **D-10:** **Ranked lists below each breakdown chart** as the primary navigation surface — e.g., "Top designers by chart count" with each name as a Next.js `<Link>` to `/designers/[id]`
- **D-11:** Use standard HTML `<Link>` components, keyboard-navigable, screen-reader safe
- **D-12:** Follows the existing `LinkableValue` pattern from DesignOS `StatCards.tsx`
- **D-13:** No chart segment click handlers (onClick on bars/slices) — keeps charts simpler and avoids WCAG keyboard accessibility issues

### Overview Tab Composition
- **D-14:** Layout order: **metrics bar → lifetime counters → 2×2 collection chart grid** — all Phase 19 content visible, no placeholder gaps
- **D-15:** Collection charts in a **responsive 2×2 grid** (status donut + size bars in row 1, designer bars + genre bars in row 2). Falls to single column on mobile.
- **D-16:** No "coming soon" placeholders for Phase 20/21 content (PersonalBests, MonthlyChart) — the page feels complete on day one
- **D-17:** When Phase 20 arrives, the monthly chart and calendar insert between the hero block and collections — a single layout adjustment in `page.tsx`

### Claude's Discretion
- Number of designers/genres to show in "top N" bar charts (probably top 10, but researcher/planner can adjust based on data distribution)
- Exact responsive breakpoints for the 2×2 grid → single column transition
- Whether the metrics bar uses a single card with internal dividers or a flex row of inline elements — both achieve the same visual result
- Animation/transition choices for chart rendering (Recharts defaults are fine)
- Color assignments for size category and genre charts — extend the `--chart-*` CSS variable series

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — HERO-01 through HERO-06, INS-06 (Phase 19 requirements)
- `.planning/ROADMAP.md` §Phase 19 — Success criteria and dependencies

### DesignOS Reference
- `product-plan/sections/stitching-sessions-and-statistics/components/HeroStats.tsx` — Time-window card design (reference for metrics bar content, NOT layout)
- `product-plan/sections/stitching-sessions-and-statistics/components/StatCards.tsx` — Lifetime stat card pattern + `LinkableValue` click-through pattern
- `product-plan/sections/stitching-sessions-and-statistics/components/StitchingDashboard.tsx` — Overview tab composition (reference, not strict order)
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-overview.png` — Visual reference for overall stats page
- `product-plan/sections/stitching-sessions-and-statistics/types.ts` — DesignOS type interfaces

### Phase 18 Context (Foundation)
- `.planning/phases/18-stats-engine-charting-foundation/18-CONTEXT.md` — Query layer decisions, caching strategy, chart architecture (D-01 through D-11)

### Existing Code Patterns
- `src/app/(dashboard)/stats/page.tsx` — Current stats page (Phase 18 output — replace StatsOverview content)
- `src/components/features/stats/stats-page-shell.tsx` — Tab shell (permanent, Phase 19 fills overview content)
- `src/components/features/stats/collection-status-chart.tsx` — Existing status donut (Recharts PieChart pattern to reference)
- `src/lib/chart-configs.ts` — Shared chart config file (add new configs here)
- `src/lib/queries/stats/hero-stats.ts` — Hero stats query (already returns all 8 values needed)
- `src/lib/queries/stats/collection-breakdown.ts` — Status breakdown query (extend pattern for size/designer/genre)
- `src/types/stats.ts` — Stats type definitions (extend with new breakdown types)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getHeroStats()` — Already returns all 8 values (4 time-window + 4 lifetime). No new query needed for HERO-01/HERO-02.
- `getCollectionBreakdown()` — Pattern for new breakdown queries (size, designer, genre). Uses `prisma.project.groupBy()` + `unstable_cache`.
- `CollectionStatusChart` — Reference implementation for Recharts + ChartContainer integration
- `collectionStatusConfig` — Pattern for new `chartConfig` objects
- `formatTime()` — Utility for displaying totalTimeMinutes as human-readable string
- CSS tokens `--chart-1` through `--chart-5` and `--status-*` — Already in globals.css

### Established Patterns
- **Parallel data fetching:** `Promise.all([...queries])` in Server Component `page.tsx`
- **Chart architecture:** shadcn `ChartContainer` + named `chartConfig` constants, no wrapper components
- **Cache strategy:** `unstable_cache` with `revalidateTag("stats")`, 5-min TTL for active data, 1-hour for historical
- **Type exports:** Shared types in `src/types/stats.ts`

### Integration Points
- `src/app/(dashboard)/stats/page.tsx` — Add new queries to `Promise.all`, replace `StatsOverview` with full layout
- `src/lib/queries/stats/` — New query files: `size-breakdown.ts`, `designer-breakdown.ts`, `genre-breakdown.ts`
- `src/lib/queries/stats/index.ts` — Re-export new queries
- `src/components/features/stats/` — New chart components, metrics bar, ranked lists
- `src/lib/chart-configs.ts` — New config exports for size/designer/genre charts
- `src/types/stats.ts` — New interfaces for breakdown data shapes

</code_context>

<specifics>
## Specific Ideas

- Metrics bar should feel like a crafted dashboard element, not a generic card grid — think of it as a single cohesive strip showing your stitching pulse
- User has 500+ charts across 50+ designers and 10-15 genres — designer/genre charts need to handle real-scale data
- Green tint from DesignOS hero cards can be repurposed as an accent for the metrics bar background
- Monospace/tabular-nums for all numeric values (JetBrains Mono in DesignOS, but use font-mono from Tailwind)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-Hero Stats & Collection Overview*
*Context gathered: 2026-05-17*
