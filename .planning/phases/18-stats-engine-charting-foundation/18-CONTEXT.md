# Phase 18: Stats Engine & Charting Foundation - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 18 delivers the **server-side computation layer** that phases 19-21 build on: timezone-aware stats query functions, persistent caching with smart invalidation, and Recharts installed and integrated with the design system. The phase also replaces the `/stats` placeholder page with a permanent shell containing one real chart to validate the full stack end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Stats Freshness (Cache Strategy)
- **D-01:** Use `unstable_cache` with `revalidateTag("stats")` and **per-query TTLs** — 5-minute TTL for hero/activity stats that change with every session, longer TTL (1 hour) for historical data (monthly totals, personal bests) that rarely changes
- **D-02:** Add `revalidateTag("stats")` calls to session-actions.ts (create/update/delete) alongside existing `revalidatePath` calls — mutations trigger immediate cache invalidation
- **D-03:** Use `Promise.all` for parallel query execution on the stats page (existing dashboard pattern)

### Timezone Handling
- **D-04:** Use a `STATS_TIMEZONE` environment variable set to `America/Denver` (Mountain Time), accessed via a `getUserTimezone(userId: string)` abstraction function in the query layer
- **D-05:** All query functions call `getUserTimezone()` — never read the env var directly. When multi-user support arrives, swap the function implementation to read from a user preferences table (zero changes to query functions)
- **D-06:** date-fns 4.1.0 timezone utilities handle the UTC → local conversion at the query level

### Phase 18 Visible Output
- **D-07:** Replace the `/stats` placeholder page with a **permanent stats page shell** — a real Server Component page that calls the query layer and renders at least one chart with real data
- **D-08:** This shell becomes the container Phase 19 fills in (not throwaway code). Phase 19 adds remaining charts, tabs, and polish to this foundation

### Chart Component Architecture
- **D-09:** Use **shadcn ChartContainer + chartConfig** directly in each chart component — the established shadcn pattern, not custom wrapper components
- **D-10:** Create a shared `src/lib/chart-configs.ts` file exporting named `chartConfig` constants (`collectionStatusConfig`, `monthlyBarConfig`, etc.) — centralizes color/label mappings without premature component abstraction
- **D-11:** No wrapper components (`<StitchBarChart>`, `<CollectionDonut>`, etc.) — each chart type in phases 19-21 has distinct interaction models (click-to-drill, center labels, multi-series) that make shared wrappers premature

### Claude's Discretion
- Query function granularity (how many files, how functions are grouped) — researcher and planner decide based on codebase patterns
- Which specific chart to render on the Phase 18 shell page (collection donut, hero counters, etc.) — whatever validates the Recharts + design token integration most effectively
- Exact TTL values — 5min/1hr are guidelines; planner can adjust based on implementation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — STAT-01 through STAT-04 (Phase 18 requirements)
- `.planning/ROADMAP.md` §Phase 18 — Success criteria and dependencies

### Research
- `.planning/research/SUMMARY.md` — Architecture approach, stack additions, critical pitfalls
- `.planning/research/STACK.md` — Recharts 3.8.x + date-fns 4.1.0 evaluation
- `.planning/research/ARCHITECTURE.md` — Query layer structure, caching design
- `.planning/research/PITFALLS.md` — SSR/Recharts, Neon cold starts, timezone bugs

### DesignOS Reference
- `product-plan/sections/stitching-sessions-and-statistics/types.ts` — Data shape interfaces (HeroStats, MonthlyStitchTotal, CalendarDay, etc.)
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-overview.png` — Overview design reference
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-calendar.png` — Calendar design reference
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-sessions.png` — Sessions table design reference

### Existing Code Patterns
- `src/app/(dashboard)/page.tsx` — Promise.all parallel fetch pattern (model for stats page)
- `src/lib/actions/session-actions.ts` — Session CRUD + revalidatePath (add revalidateTag here)
- `src/lib/actions/dashboard-actions.ts` — In-memory aggregation pattern from fetched Prisma data
- `prisma/schema.prisma` §StitchSession (line 116) — Date field is DateTime (UTC), indexed on date and projectId

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(dashboard)/stats/page.tsx` — Existing placeholder page to replace (route + nav already wired)
- `src/app/(dashboard)/stats/loading.tsx` — Loading state already exists
- `src/lib/actions/dashboard-actions.ts` — Aggregation patterns (currently stitching, collection stats) to reference
- `src/lib/actions/session-actions.ts` — Session CRUD where cache invalidation tags will be added
- CSS tokens `--chart-1` through `--chart-5` and `--status-*` — Already defined in globals.css

### Established Patterns
- **Parallel data fetching:** `Promise.all([...queries])` in Server Component pages (dashboard page.tsx)
- **Server action structure:** `"use server"` + `requireAuth()` + Prisma queries + `revalidatePath`
- **Cache invalidation:** Currently `revalidatePath` per-route; Phase 18 adds `revalidateTag` for stats
- **Type exports:** Shared types in `src/types/` directory
- **React `cache()` for deduplication:** Used in session-actions.ts for request-scoped deduplication

### Integration Points
- `src/lib/actions/session-actions.ts` — Add `revalidateTag("stats")` to create/update/delete
- `src/app/(dashboard)/stats/page.tsx` — Replace placeholder with real Server Component
- `src/components/features/` — New `stats/` directory for chart components
- `src/lib/queries/stats/` — New query layer directory (pure functions, not server actions)
- `package.json` — Add recharts + date-fns (pin exact versions, no carets)

</code_context>

<specifics>
## Specific Ideas

- User is in **Mountain Time** (America/Denver), not Pacific — env var must reflect this
- The DesignOS calendar is a **month-view CSS grid** (not a GitHub-style heatmap) — no heatmap library needed
- CSS stacked bars exist already for progress indicators — Recharts adds capability for interactive charts that CSS can't handle (donut, line, multi-series)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-Stats Engine & Charting Foundation*
*Context gathered: 2026-05-17*
