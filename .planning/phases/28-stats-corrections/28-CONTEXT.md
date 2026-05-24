# Phase 28: Stats Corrections - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix accuracy and formatting issues across all three stats tabs. Records tab data moves to where it belongs (insights → Overview, session stats → Records). Charts display clean integer axes. Days-in-library formatting fixed on dashboard. Collection stitch total added as lifetime counter. No new pages, no new tab structure — fix what's shipped.

Requirements: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05

</domain>

<decisions>
## Implementation Decisions

### Records tab reorganization (STAT-01)
- **D-01:** Move thread/designer/genre insights from the Records tab to the Overview tab. These are library-level collection data, not session-based achievements. Place them near their existing breakdown charts on Overview.
- **D-02:** Records tab keeps only session-based content: personal bests, fastest completions, completion estimates.
- **D-03:** Remove the `YearScopeToggle` from the Records tab. All data is always all-time. Year scoping deferred to the future Year in Review feature.
- **D-04:** Add all-time session stitch total as a hero stat on the Records tab (moved from the Overview lifetime counter that it's replacing — see D-09).

### Status filter pills for Overview insights (STAT-01)
- **D-05:** Add a pill/chip row of status filter toggles to the Overview tab, above the insights sections. Multi-select toggles.
- **D-06:** Grouped statuses: **All** (default), **Not Started** (Unstarted), **In Progress** (Kitting + Stitching + Paused), **Complete** (Finished + FFO).
- **D-07:** When no specific pills are toggled, "All" is active (full library). URL-state via nuqs for persistence.

### Insights data source (STAT-01)
- **D-08:** Thread/designer/genre insight queries switch from session-gated (`sessions: { some: ... }`) to full-library queries. Filter by project status groups when pills are active. Always all-time scope — no date filtering.

### Total stitches (STAT-04)
- **D-09:** Replace the current "Total Stitches" lifetime counter (session-logged sum) with "Collection Total" — sum of all charts' `totalStitchCount`. This shows the total design scope of the library.
- **D-10:** Move the all-time session stitch total to the Records tab as a hero stat (see D-04).

### Chart axis formatting (STAT-02)
- **D-11:** Add `allowDecimals={false}` to the numeric axis on all collection breakdown charts: designer, genre, size, and collection status (where applicable). Pure Recharts prop.

### Chart + list consolidation (STAT-03)
- **D-12:** Remove the `RankedList` component from below the designer and genre breakdown charts. Chart Y-axis already shows entity names inline. Tooltip shows exact counts.
- **D-13:** Do NOT make Y-axis labels clickable (SVG link complexity). Deferred to future version.

### Days-in-library formatting (STAT-05)
- **D-14:** Fix the Buried Treasures section on the dashboard. Current format shows "23" on line 1 and "23 days in library" on line 2 — the number is duplicated. Fix: large number + "days in library" label without repeating the number. Change `formatAge()` to return only the unit ("days"/"months"/"years") for the label line.

### Claude's Discretion
- Test strategy and plan structure/grouping.
- Exact nuqs param names for the status filter URL state.
- How the session stitch total hero stat is styled on the Records tab.
- Whether to keep the `RankedList` component in the codebase for future use or remove it.
- Layout adjustments when insights move from Records to Overview (spacing, card sizing).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — STAT-01 through STAT-05 definitions
- `.planning/ROADMAP.md` §Phase 28 — Success criteria (5 items) and UI hint

### Stats Page (all tabs)
- `src/app/(dashboard)/stats/page.tsx` — Stats page data fetching, Promise.allSettled, prop wiring
- `src/app/(dashboard)/stats/search-params.ts` — nuqs search param cache for stats URL state

### Overview Tab
- `src/components/features/stats/stats-overview.tsx` — Overview layout (hero stats, charts, insights will move here)
- `src/components/features/stats/lifetime-counters.tsx` — Lifetime counter cards (D-09 replaces Total Stitches)
- `src/components/features/stats/designer-breakdown-chart.tsx` — Designer horizontal bar chart (D-11, D-12)
- `src/components/features/stats/genre-distribution-chart.tsx` — Genre horizontal bar chart (D-11, D-12)
- `src/components/features/stats/size-category-chart.tsx` — Size vertical bar chart (D-11)
- `src/components/features/stats/ranked-list.tsx` — RankedList to be removed (D-12)

### Records Tab
- `src/components/features/stats/records-overview.tsx` — Records layout (insights moving out, session total moving in)
- `src/components/features/stats/year-scope-toggle.tsx` — YearScopeToggle being removed (D-03)

### Insights Components (moving from Records to Overview)
- `src/components/features/stats/thread-insight-list.tsx` — Thread insight cards
- `src/components/features/stats/designer-insight-list.tsx` — Designer insight cards
- `src/components/features/stats/genre-insight-list.tsx` — Genre insight cards

### Insight Queries (data source change)
- `src/lib/queries/stats/thread-insights.ts` — Thread insights query (D-08 removes session gate)
- `src/lib/queries/stats/designer-insights.ts` — Designer insights query (D-08)
- `src/lib/queries/stats/genre-insights.ts` — Genre insights query (D-08)
- `src/lib/queries/stats/hero-stats.ts` — Hero stats query (D-09 adds collection total)

### Dashboard (days-in-library fix)
- `src/components/features/dashboard/buried-treasures-section.tsx` — `formatAge()` function and age badge (D-14)

### Types
- `src/types/stats.ts` — All stats type definitions (may need new types for filter state, collection total)

### Conventions
- `.claude/rules/base-ui-patterns.md` — Semantic tokens, component patterns
- `.claude/rules/component-implementation.md` — Component implementation rules
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataUnavailable` component — Used for graceful degradation when a query fails. Already wired throughout stats.
- `settled<T>()` utility — Unwraps `Promise.allSettled` results to `T | null`. Pattern for all 17 queries.
- `buildDateFilter()` + `Scope` type in `src/lib/queries/stats/utils.ts` — Shared date filter builder. Insight queries currently use this; D-08 removes date filtering but status filtering is new.
- nuqs `statsSearchParamsCache` — Existing URL state for session table. Status filter pills need new params added here.
- `collectionStatusConfig` and chart configs in `src/lib/chart-configs.ts` — Recharts config objects with CSS variable theming.

### Established Patterns
- **Stats query pattern:** `compute*()` function → `unstable_cache()` wrapper with `"stats"` tag. New/modified queries follow this.
- **Recharts always Client Components** — Charts use `"use client"`, data flows as props from Server Component page.
- **nuqs for URL state** — Tabs, sort, page, filter already use nuqs. Status filter pills should too.
- **Status grouping** — `STATUS_CONFIG` in `src/lib/utils/status.ts` maps all 7 statuses. Grouped statuses (Not Started, In Progress, Complete) need a mapping helper.

### Integration Points
- `stats/page.tsx` — Entry point. New queries (collection total) and new props (status filter, moved insights) wire through here.
- `StatsOverview` — Will receive insight components + status filter pills.
- `RecordsOverview` — Will lose insights, gain session stitch total hero stat.
- `StatsPageShell` — Tab wrapper. No structural changes needed.

</code_context>

<specifics>
## Specific Ideas

- Status filter pills: "All" is the default state (all toggles off = full library). When specific pills are active, "All" deactivates. Matches the multi-select toggle UX pattern.
- Collection Total counter: Sum `chart.totalStitchCount` across all user's charts. Some charts may have `null` totalStitchCount — handle with `?? 0`.
- `formatAge()` fix: Return just the unit string ("days"/"months"/"years"), let the template compose `"{number} {unit} in library"` → "23\ndays in library" (two lines, no duplication).
- Insight queries: For library-wide mode, remove the `sessions: { some: ... }` filter entirely. For status filtering, add `project.status: { in: [...statusValues] }` where statusValues come from the grouped status mapping.

</specifics>

<deferred>
## Deferred Ideas

- Clickable designer/genre names on chart Y-axis (SVG link to detail pages) — future version
- Year scoping for Records tab — deferred to Year in Review feature
- Stats architecture redesign (consolidate scattered stats across pages) — deferred to dedicated milestone (FEAT-07 in REQUIREMENTS.md)

</deferred>

---

*Phase: 28-stats-corrections*
*Context gathered: 2026-05-23*
