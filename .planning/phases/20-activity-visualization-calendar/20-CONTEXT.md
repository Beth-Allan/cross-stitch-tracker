# Phase 20: Activity Visualization & Calendar - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 20 delivers the **Activity tab** content for the stats page: a monthly stitch bar chart with year navigation and click-to-drill-down, a month-view stitching calendar with per-month data loading, pace/rate metrics cards, a day-of-week pattern chart, and a sortable/filterable session history table with server-side pagination. It plugs into the existing `activityContent` slot in `StatsPageShell`.

</domain>

<decisions>
## Implementation Decisions

### Monthly Stitch Chart
- **D-01:** Use **Recharts BarChart** (not CSS bars from DesignOS) — consistent with Phase 18/19 chart approach. Uses `ChartContainer` + `chartConfig` pattern.
- **D-02:** Click-to-drill-down shows an **inline expand panel below the chart** with that month's daily session breakdown. Click another bar to switch, click same bar to collapse. No floating popover.
- **D-03:** Default time range is **current calendar year (Jan-Dec)** — 12 bars, Jan through Dec. Matches DesignOS heading style "Monthly Stitches — 2026".
- **D-04:** Include a **year selector** (prev/next arrows near the heading) to view previous years' data. Historical year queries use long-TTL cache since data doesn't change.

### Stitching Calendar
- **D-05:** **Fetch per month** — initial load fetches only the current month's calendar day data. Navigating to a different month triggers a server action/query for that month's sessions. Historical months get long-TTL cache.
- **D-06:** Project colors use the **`--chart-1` through `--chart-5` CSS variable** design tokens, cycling through them. Projects get deterministic color assignment based on a stable sort order.
- **D-07:** Clicking a session pill **navigates to the project detail page** (`/projects/[id]`). Matches INS-06 entity click-through requirement and DesignOS `onNavigateToProject` callback.
- **D-08:** Mobile responsiveness: **compact grid with truncation** — keep 7-column layout but shrink cells. Show stitch count dots/indicators instead of full project pills on small screens. Tap a day to see detail.

### Session History Table
- **D-09:** **Server-side pagination** with 20-25 sessions per page and prev/next controls. Sorting (by date, stitches, time) happens server-side via query parameters.
- **D-10:** Session history lives **within the Activity tab** — not a separate tab. It's a section below the calendar, keeping all activity content together.
- **D-11:** **View only** — no Edit button per row. Session editing lives on the project detail page. Keeps the stats page read-only.
- **D-12:** **Sort + project filter** — sortable by Date, Stitches, Time columns AND a project dropdown filter above the table to view all sessions for a specific project.

### Pace & Pattern Metrics
- **D-13:** Day-of-week patterns shown as a **small bar chart (7 bars, Mon-Sun)** — compact Recharts BarChart showing average stitches per day of week.
- **D-14:** Rolling averages (7/30/90-day) and month-over-month pace shown as a **stats cards row** — horizontal compact stat cards similar to the Phase 19 metrics bar. Includes up/down trend arrow + percentage for MoM comparison.
- **D-15:** Stitch rate (stitches/hour) with trend appears **in the pace cards row** alongside rolling averages. Grouped with related pace metrics.

### Activity Tab Layout
- **D-16:** Top-to-bottom order: **pace cards → monthly chart → day-of-week chart → calendar → session table**. Progressive detail — summary metrics first, then yearly view, then patterns, then the detailed calendar, then the full session log.

### Claude's Discretion
- Exact number of sessions per page (20 vs 25)
- Inline expand panel design for monthly chart drill-down (card vs simple list)
- Day-of-week chart positioning relative to the monthly chart (side-by-side on desktop vs stacked)
- Calendar day cell compact mode breakpoint (sm vs md)
- Project filter dropdown component choice (simple select vs combobox for many projects)
- Whether the pace cards row uses the same green-accent MetricsBar pattern from Phase 19 or a lighter approach
- Animation/transition for monthly chart drill-down expand/collapse

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — VIZ-01 through VIZ-07, INS-04 (Phase 20 requirements)
- `.planning/ROADMAP.md` §Phase 20 — Success criteria and dependencies

### DesignOS Reference
- `product-plan/sections/stitching-sessions-and-statistics/components/MonthlyChart.tsx` — Monthly bar chart design (reference for content/interaction, NOT charting engine)
- `product-plan/sections/stitching-sessions-and-statistics/components/StitchingCalendar.tsx` — Calendar grid design, project color pills, month navigation, legend
- `product-plan/sections/stitching-sessions-and-statistics/components/SessionHistory.tsx` — Session table design (columns, sorting, layout — NOT edit functionality)
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-calendar.png` — Calendar visual reference
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-sessions.png` — Sessions table visual reference
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-overview.png` — Overview design showing Monthly Stitches chart at bottom
- `product-plan/sections/stitching-sessions-and-statistics/types.ts` — DesignOS type interfaces (MonthlyStitchTotal, CalendarDay, DailyBreakdown, StitchSession)

### Prior Phase Context (Foundation)
- `.planning/phases/18-stats-engine-charting-foundation/18-CONTEXT.md` — Query layer, caching, chart architecture decisions (D-01 through D-11)
- `.planning/phases/19-hero-stats-collection-overview/19-CONTEXT.md` — MetricsBar pattern, chart component approach, entity click-through pattern

### Existing Code Patterns
- `src/app/(dashboard)/stats/page.tsx` — Stats page Server Component with Promise.all data fetching
- `src/components/features/stats/stats-page-shell.tsx` — Tab shell with `activityContent` slot (plug Phase 20 content here)
- `src/components/features/stats/metrics-bar.tsx` — Phase 19 MetricsBar (reference for pace cards styling)
- `src/components/features/stats/collection-status-chart.tsx` — Recharts PieChart pattern
- `src/components/features/stats/size-category-chart.tsx` — Recharts BarChart pattern (vertical bars)
- `src/components/features/stats/designer-breakdown-chart.tsx` — Recharts BarChart pattern (horizontal bars)
- `src/lib/chart-configs.ts` — Shared chart config file (add new monthly/day-of-week configs here)
- `src/lib/queries/stats/` — Query layer directory (add new query files here)
- `src/lib/queries/stats/hero-stats.ts` — Example query with unstable_cache + timezone handling
- `src/lib/queries/stats/timezone.ts` — getUserTimezone() utility
- `src/types/stats.ts` — Stats type definitions (extend with new activity types)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatsPageShell` — Already has `activityContent` prop slot. Phase 20 creates the `ActivityOverview` component and passes it in.
- `MetricsBar` — Reference for pace cards row styling (green accent strip, compact layout)
- `getUserTimezone()` — Timezone-aware date boundaries for calendar and daily breakdown queries
- `unstable_cache` with `revalidateTag("stats")` — Caching strategy for all new queries
- CSS tokens `--chart-1` through `--chart-5` — For calendar project color assignment
- `formatTime()` — Utility for displaying minutes as human-readable string (for session table Time column)
- `collectionStatusConfig` pattern — Reference for new `monthlyBarConfig`, `dayOfWeekConfig` chartConfig objects

### Established Patterns
- **Parallel data fetching:** `Promise.all([...queries])` in Server Component `page.tsx`
- **Chart architecture:** shadcn `ChartContainer` + named `chartConfig` constants, no wrapper components
- **Cache strategy:** `unstable_cache` with `revalidateTag("stats")`, 5-min TTL for active data, 1-hour for historical
- **Type exports:** Shared types in `src/types/stats.ts`
- **Entity links:** Next.js `<Link>` to detail pages (established in Phase 19 ranked lists)

### Integration Points
- `src/app/(dashboard)/stats/page.tsx` — Add new activity queries to Promise.all, pass data to ActivityOverview
- `src/components/features/stats/stats-page-shell.tsx` — Wire `activityContent` prop
- `src/lib/queries/stats/` — New query files: `monthly-totals.ts`, `calendar-days.ts`, `session-history.ts`, `pace-metrics.ts`, `day-of-week.ts`
- `src/lib/queries/stats/index.ts` — Re-export new queries
- `src/components/features/stats/` — New components: monthly chart, calendar, session table, pace cards, day-of-week chart, activity overview layout
- `src/lib/chart-configs.ts` — New config exports for monthly bar and day-of-week charts
- `src/types/stats.ts` — New interfaces for monthly totals, calendar days, session history, pace metrics

</code_context>

<specifics>
## Specific Ideas

- Pace cards should feel like the Phase 19 metrics bar — a cohesive strip showing your stitching pulse, not isolated generic cards
- Calendar should show "today" with a green dot/circle on the day number (matching DesignOS design)
- Session table should include a photo indicator column (camera icon) for sessions with progress photos
- Project names in the session table should be clickable links to project detail pages (INS-06)
- The monthly chart's inline drill-down should show daily breakdown with project names and stitch counts, similar to the DesignOS popover content
- Stitch rate should only appear when time data is available (some sessions don't have time logged)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-Activity Visualization & Calendar*
*Context gathered: 2026-05-17*
