# Phase 32: Series Management Pages - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers two pages: a `/series` list page showing all series as progress cards with sorting, and a `/series/[id]` detail page showing assigned charts with dual progress and inline editing. Series CRUD actions already exist from Phase 31 — this phase adds the UI layer. No chart assignment workflow (that's Phase 33).

</domain>

<decisions>
## Implementation Decisions

### Progress Display
- **D-01:** Single progress bar on both cards and detail header showing finished/owned ratio. Matches DesignOS visual.
- **D-02:** Text stat below the bar: when `totalCount` is set, show "X of Y owned" as a secondary line. When open-ended, show "3 finished · 8 charts" (finished first, chart count second).
- **D-03:** Detail page header uses the same progress treatment as cards — no extra bars. The full chart list provides richer context.

### Series Card Content
- **D-04:** Designer name shown below the series name on cards (small text, e.g., "by Nora Corbett"). Only rendered when designerId is non-null — no blank space otherwise.
- **D-05:** Sort options: Name, Completion, Charts (not "Members"). Completion sorts by finished/owned percentage.
- **D-06:** Sort bar matches DesignOS pattern — pill-style toggles with chevron direction indicators.

### Detail Page Chart List
- **D-07:** Inline editing for name, totalCount, and notes on the detail page. Name uses the DesignOS inline-edit pattern (border-bottom input). TotalCount as a number input, notes as a textarea.
- **D-08:** Designer field editable via a small edit icon that opens a SearchableSelect dropdown or mini-modal. Designer name displayed as a link to `/designers/[id]`.
- **D-09:** "Add Chart" flow deferred to Phase 33 (chart form integration). Detail page shows existing charts but no add button until Phase 33.
- **D-10:** Chart rows are clickable — navigate to `/charts/[id]` (project detail). Matches designer detail chart row pattern.

### Navigation & Sidebar
- **D-11:** Series added to the "Projects" nav section (alongside Dashboard, Pattern Dive, Shopping). Users see it as a primary browsing entry point.
- **D-12:** URL structure: `/series` (list) and `/series/[id]` (detail). Clean, matches `/designers` pattern.
- **D-13:** Loading skeleton (loading.tsx) for the list page with card-shaped placeholders matching the grid layout.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — SERIES-02, SERIES-05 definitions
- `.planning/ROADMAP.md` §Phase 32 — Success criteria and dependencies

### DesignOS Design References
- `product-plan/sections/fabric-series-and-reference-data/series.png` — Target visual for series list page
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx` — List page design component (card grid, sort bar, add modal)
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesDetail.tsx` — Detail page design component (inline edit, chart rows, progress bar)
- `product-plan/sections/fabric-series-and-reference-data/README.md` — Section overview and data types

### Existing Patterns (series mirrors these)
- `src/app/(dashboard)/designers/page.tsx` — List page pattern (server component → client list)
- `src/app/(dashboard)/designers/[id]/page.tsx` — Detail page pattern (server component → client detail)
- `src/components/features/designers/designer-list.tsx` — List component with sort, search, delete
- `src/components/features/designers/designer-detail.tsx` — Detail component with chart rows, inline edit, delete
- `src/app/(dashboard)/designers/loading.tsx` — Loading skeleton pattern

### Phase 31 Foundation (already built)
- `src/lib/actions/series-actions.ts` — CRUD actions: createSeries, updateSeries, deleteSeries, getSeriesWithStats
- `src/types/series.ts` — SeriesProgress, SeriesWithStats, SeriesChart, SeriesDetail types
- `src/lib/utils/series-progress.ts` — computeSeriesProgress utility
- `src/lib/validations/series.ts` — Zod schema for series validation
- `prisma/schema.prisma` — Series model with chart relation

### Navigation
- `src/components/shell/nav-items.ts` — Sidebar navigation sections and items

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DesignerList` component: sort toggle pattern, card grid, empty state, form modal — series list mirrors this
- `DesignerDetail` component: back button, inline name edit, chart row with thumbnail/status/stitch count, delete confirmation — series detail mirrors this
- `StatusBadge` component: already used in designer detail for chart status display
- `SizeBadge` component: available for chart rows if needed
- `EmptyState` component: reusable empty state with icon
- `DeleteConfirmationDialog`: reusable delete confirmation pattern
- `getObjectPositionStyle`: focal point utility for thumbnails

### Established Patterns
- Server Component page → fetches data → passes to Client Component (all management pages follow this)
- `getSeriesWithStats()` returns `SeriesWithStats[]` with computed progress — use for list page
- Need a new `getSeriesDetail(id)` action returning `SeriesDetail` (with charts array) for detail page
- Sort state managed via `useState` in client component (not URL params — matching designer pattern)

### Integration Points
- `src/app/(dashboard)/series/page.tsx` — new list page (server component)
- `src/app/(dashboard)/series/[id]/page.tsx` — new detail page (server component)
- `src/app/(dashboard)/series/loading.tsx` — new loading skeleton
- `src/components/features/series/` — new feature component directory (series-list.tsx, series-detail.tsx, etc.)
- `src/components/shell/nav-items.ts` — add Series to Projects section
- `src/lib/actions/series-actions.ts` — add `getSeriesDetail(id)` query action

</code_context>

<specifics>
## Specific Ideas

- Card stat line format: "3 finished · 8 charts" for open-ended, "3 of 8 finished" + "8 of 15 owned" for totalCount series
- Designer name on card: "by Nora Corbett" in muted text below series name, only when set
- Sort pill labels: "Name", "Completion", "Charts" (not "Members")
- Detail page inline editing: name (inline input), totalCount (number input), notes (textarea), designer (edit icon → SearchableSelect)
- Chart rows match designer detail pattern: thumbnail, name, designer, stitch count, status badge, progress for in-progress

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 32-Series Management Pages*
*Context gathered: 2026-05-24*
