# Phase 21: Records, Insights & Celebrations - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 21 fills the **Records tab** in StatsPageShell (the `recordsContent` slot). It delivers a unified records table with year-scoped and all-time personal bests, fastest completions by size category, a celebration system (confetti + themed toasts) when records are broken during session logging, supply/designer/genre insight lists, and completion estimates for active projects. This is NOT the Year in Review (a future shareable snapshot) — this is a living records dashboard.

</domain>

<decisions>
## Implementation Decisions

### Records Tab Structure
- **D-01:** The Records tab is a **single scrollable page** with sections: records table → insights → completion estimates. No sub-tabs.
- **D-02:** A **segmented control** at the top (All-time | 2026 | 2025 | ...) scopes **all sections** — records, insights, and estimates all respond to the year toggle. Available years auto-detected from session data (no empty years shown).
- **D-03:** **Not** a Year in Review — YiR is planned for a future phase as a shareable year-at-a-glance sheet. Records is an ongoing living dashboard.

### Personal Bests & Records Table
- **D-04:** Personal bests use a **table layout** (not cards). Rows = record types, columns = years. Columns are All-time, 2026, 2025, etc. Each cell shows value + date + clickable project link. All-time column gets visual emphasis (bold/highlighted).
- **D-05:** Record types: Best Day (most stitches in a day), Best Session (most stitches in a single session), Longest Streak (consecutive days with sessions), Current Streak (live, only in All-time column).
- **D-06:** **Fastest completions** (REC-05) are rows in the **same table**, separated by a grouped divider row. Rows: Fastest Mini, Fastest Small, Fastest Medium, Fastest Large, Fastest BAP. Value = days-to-complete + project link. Dash (—) for empty cells.
- **D-07:** 4 personal bests + 5 fastest completions = 9 rows total in the unified records table.

### Celebration Toast & Confetti
- **D-08:** Record detection happens **server-side in createSession**. After inserting the session, run comparison queries (today's total > best day? this session > best session? streak extended?). Return broken records as part of the action response: `{ success, brokenRecords: [{ type, oldValue, newValue }] }`.
- **D-09:** Client-side on project detail page: if `brokenRecords` array is non-empty, trigger **full-page canvas-confetti burst** (1-2 seconds, gold/amber/emerald particles, fires from center-top, fades naturally) and **themed amber toast** with trophy icon, record type name, new value, and previous value. Auto-dismiss after 5 seconds.
- **D-10:** Multiple broken records = multiple confetti bursts + stacked toasts (one per record broken).
- **D-11:** New dependency: `canvas-confetti` (~5KB, no deps). Pin exact version.

### Supply & Designer Insights
- **D-12:** Insights are **list-based, not chart-based** — differentiated from Overview tab's bar charts (which show chart COUNT). Records tab shows deeper metrics: thread usage by project count, designer completion RATE, genre by total stitches.
- **D-13:** **Top Thread Colors** — Query ThreadColor usage across projects, ranked by project count. Show color swatch using `ThreadColor.hexCode` when available; neutral gray placeholder swatch when hex is missing. Show top 10.
- **D-14:** **Designer Completion Rates** — For each designer: (completed projects / total projects) as percentage. Show fraction alongside (e.g., "82% (14/17)"). Ranked by completion rate. Designer names are clickable links to designer detail pages.
- **D-15:** **Most Stitched Genres** — Ranked by total stitches (not chart count). Shows stitch count per genre. Genre names as clickable links.
- **D-16:** All three insight sections respond to the year scope toggle (D-02). When scoped to a year, show thread/designer/genre stats for that year only.

### Completion Estimates
- **D-17:** Calculation: `avg_per_day = project_total_stitches / days_since_first_session`. `remaining = target_stitches - current_stitches`. `est_date = today + (remaining / avg_per_day)`. Display as "~Month Year" (e.g., "~Aug 2027").
- **D-18:** Thresholds: only show when (a) project has totalStitches target set on the chart, (b) project has ≥3 sessions, (c) avg_per_day > 0.
- **D-19:** Show estimates in **two places**: (1) Records tab section listing all active projects with estimates, ranked by soonest completion, with progress bar. (2) Individual project detail page in the stats/session summary area.
- **D-20:** Estimates respond to the year scope toggle — when scoped to a year, shows projects active in that year.

### Claude's Discretion
- Exact responsive breakpoint for records table (horizontal scroll vs stacked layout on mobile)
- Number of items in each insight list (top 10 recommended, but adjustable based on data)
- Progress bar styling for completion estimates section
- Empty state messaging when a year has no records or sparse data
- Whether "Current Streak" row shows values in year columns (it's inherently a live/all-time concept)
- Confetti particle count and exact color mix
- Toast position (top-right vs bottom-right — match existing sonner config)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — REC-01 through REC-05, INS-01 through INS-03, INS-05 (Phase 21 requirements)
- `.planning/ROADMAP.md` §Phase 21 — Success criteria and dependencies

### DesignOS Reference
- `product-plan/sections/stitching-sessions-and-statistics/components/PersonalBests.tsx` — Personal bests card design (reference for content/icons/styling, NOT layout — we're using a table instead)
- `product-plan/sections/stitching-sessions-and-statistics/components/YearInReview.tsx` — FavouriteSupplies sub-component (reference for thread color swatch rendering and supply list pattern)
- `product-plan/sections/stitching-sessions-and-statistics/types.ts` — PersonalBest, FavouriteSupply type interfaces

### Prior Phase Context (Foundation)
- `.planning/phases/18-stats-engine-charting-foundation/18-CONTEXT.md` — Query layer, caching, chart architecture decisions
- `.planning/phases/19-hero-stats-collection-overview/19-CONTEXT.md` — MetricsBar pattern, entity click-through pattern (D-10/D-11), RankedList component
- `.planning/phases/20-activity-visualization-calendar/20-CONTEXT.md` — Activity tab patterns, year selector precedent, table pagination

### Existing Code Patterns
- `src/app/(dashboard)/stats/page.tsx` — Stats page Server Component with Promise.all data fetching
- `src/components/features/stats/stats-page-shell.tsx` — Tab shell with `recordsContent` slot (plug Phase 21 content here)
- `src/components/features/stats/ranked-list.tsx` — RankedList component (reference for insight lists)
- `src/lib/queries/stats/` — Query layer directory (add new record/insight queries here)
- `src/lib/queries/stats/hero-stats.ts` — Example query with unstable_cache + timezone handling
- `src/lib/actions/session-actions.ts` — createSession action (add record-breaking detection here)
- `src/types/stats.ts` — Stats type definitions (extend with record/insight types)
- `src/lib/chart-configs.ts` — Shared chart configs (may not need new ones — insights are list-based)
- `prisma/schema.prisma` §ThreadColor — hexCode field for color swatches
- `prisma/schema.prisma` §Chart — totalStitches field for completion estimate targets

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatsPageShell` — Already has `recordsContent` prop slot. Phase 21 creates a `RecordsOverview` component and passes it in.
- `RankedList` — Existing component from Phase 19 for rendering ranked entity lists with links. Reference for insight list styling.
- `getUserTimezone()` — Timezone-aware date boundaries for streak/daily record calculations.
- `unstable_cache` with `revalidateTag("stats")` — Caching strategy for all new queries.
- `formatTime()` — Utility for displaying minutes as human-readable string.
- Entity `<Link>` pattern — Established in Phase 19 ranked lists for clickable project/designer names.
- `sonner` toast — Already installed and configured for success/error toasts throughout the app.
- `SessionHistoryTable` — Reference for table styling patterns (Phase 20).

### Established Patterns
- **Parallel data fetching:** `Promise.all([...queries])` in Server Component `page.tsx`
- **Chart/list architecture:** shadcn `ChartContainer` + `chartConfig` for charts; plain styled lists for non-chart data
- **Cache strategy:** `unstable_cache` with `revalidateTag("stats")`, 5-min TTL for active data, 1-hour for historical
- **Type exports:** Shared types in `src/types/stats.ts`
- **Entity links:** Next.js `<Link>` to detail pages (designers, projects)
- **Server action response shape:** `{ success: true, data? }` or `{ success: false, error }` — extend for `brokenRecords`

### Integration Points
- `src/app/(dashboard)/stats/page.tsx` — Add new record/insight queries to Promise.all, pass data to RecordsOverview
- `src/components/features/stats/stats-page-shell.tsx` — Wire `recordsContent` prop
- `src/lib/queries/stats/` — New query files: `personal-bests.ts`, `fastest-completions.ts`, `thread-insights.ts`, `designer-insights.ts`, `genre-insights.ts`, `completion-estimates.ts`
- `src/lib/queries/stats/index.ts` — Re-export new queries
- `src/components/features/stats/` — New components: records table, insight lists, completion estimates section, RecordsOverview layout
- `src/types/stats.ts` — New interfaces for records, insights, estimates, broken records
- `src/lib/actions/session-actions.ts` — Add record-breaking detection to createSession response
- Project detail page — Display completion estimate + handle brokenRecords toast/confetti
- `package.json` — Add `canvas-confetti` (pin exact version)

</code_context>

<specifics>
## Specific Ideas

- Records table should feel like a **sports stats leaderboard** — clean rows, monospace numbers, highlighted all-time column
- Confetti + themed toast should feel genuinely celebratory — this is the reward for consistency
- Thread color swatches should use actual hex codes, with a tasteful neutral placeholder for threads without hex data
- Designer completion rates give a fun "completionist" perspective — "you've stitched 82% of Dimensions designs you own"
- The year scope toggle means you can see "my best stitching year was 2025" at a glance by comparing columns
- Completion estimates should be modest ("~Aug 2027") not falsely precise ("August 14, 2027") — stitching pace varies

</specifics>

<deferred>
## Deferred Ideas

- **Gallery card completion estimates** — Show estimated completion date on Browse page gallery cards for active projects. Small UI change but touches Phase 6 component territory. Add after Phase 21 as a quick fix.
- **Year in Review** — Shareable year-at-a-glance summary page. Distinct from Records tab — YiR is a snapshot, Records is a living dashboard. Future milestone.

</deferred>

---

*Phase: 21-Records, Insights & Celebrations*
*Context gathered: 2026-05-18*
