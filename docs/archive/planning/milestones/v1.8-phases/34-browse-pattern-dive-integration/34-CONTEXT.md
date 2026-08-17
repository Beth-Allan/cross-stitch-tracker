# Phase 34: Browse & Pattern Dive Integration - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds a Series tab to Pattern Dive and a series filter to the Browse tab. Users can browse their collection organized by series, view series progress cards, navigate to series detail pages, and filter the gallery by series. The Series data model, CRUD actions, management pages, and chart form integration already exist from Phases 31-33 — this phase wires series into the Pattern Dive browsing experience.

</domain>

<decisions>
## Implementation Decisions

### Tab Placement & Icon
- **D-01:** Series tab positioned 3rd in the tab bar: Browse → What's Next → **Series** → Fabric Requirements → Storage View. Groups browsing/planning tabs together, then reference tabs.
- **D-02:** Series tab uses the `Library` icon from Lucide. Matches the DesignOS empty state icon for series, represents a collection/catalog, and is visually distinct from the other tab icons (Search, Star, Layers, MapPin).
- **D-03:** Tab label is "Series" — matches the sidebar nav item, the /series page title, and all prior phase terminology. Consistent naming across the app.

### Series Card Style
- **D-04:** Reuse the same SeriesCard component from the /series list page (Phase 32). Progress bar, designer name, stats row — consistent look across the app. Wire with series data from the Pattern Dive server component.
- **D-05:** Include sort pills (Name/Completion/Charts) matching the /series page pattern (Phase 32 D-05/D-06). Users expect the same controls anywhere they see series cards.
- **D-06:** No "Create Series" button on the Pattern Dive Series tab. Pattern Dive is for browsing/discovering, not management. Series creation lives on the /series page.
- **D-07:** Empty state shows Library icon, "No series yet", and a text link: "Create your first series on the Series page". Guides the user without adding a full create button.

### Browse Tab Series Filter
- **D-08:** Series filter uses the same `MultiSelectDropdown` component as Status and Size. Select one or more series to filter by. Consistent UI pattern.
- **D-09:** Filter includes an "Unassigned" option to show charts with no series. With 500+ charts, many won't have a series — lets users find charts that still need categorization.
- **D-10:** Series filter positioned after Size in the filter bar: Search → Status → Size → **Series**. Appends without changing existing filter order.
- **D-11:** Series data added to `getChartsForGallery()` query — include `series: { select: { id: true, name: true } }`. Each chart carries its seriesId/seriesName. Filter options derived from the chart list. Single query, no extra fetch for the Browse tab.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — SERIES-08, SERIES-09 definitions
- `.planning/ROADMAP.md` §Phase 34 — Success criteria and dependencies

### DesignOS Design References
- `product-plan/sections/fabric-series-and-reference-data/series.png` — Target visual for series cards
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx` — DesignOS card design (progress bar + stats row + sort pills)

### Pattern Dive (integration target)
- `src/components/features/charts/pattern-dive-tabs.tsx` — Tab component to extend with 5th "series" tab
- `src/app/(dashboard)/charts/page.tsx` — Server component page, data fetching via Promise.all

### Gallery / Browse (filter integration)
- `src/components/features/gallery/filter-bar.tsx` — Filter bar to extend with Series MultiSelectDropdown
- `src/components/features/gallery/use-gallery-filters.ts` — Filter hook to extend with seriesFilter state
- `src/components/features/gallery/gallery-utils.ts` — `filterAndSort()` pure function to extend with series filter
- `src/components/features/gallery/gallery-types.ts` — `GalleryCardData` type to extend with seriesId/seriesName
- `src/components/features/gallery/multi-select-dropdown.tsx` — Reusable dropdown component

### Series Foundation (already built)
- `src/lib/actions/series-actions.ts` — `getSeriesWithStats()` for Series tab data
- `src/lib/actions/chart-actions.ts` — `getChartsForGallery()` query to extend with series include
- `src/types/series.ts` — SeriesWithStats, SeriesProgress types
- `src/components/features/series/series-list.tsx` — Existing series card component to reuse/extract from

### Prior Phase Context
- `.planning/phases/31-data-foundation-fixes/31-CONTEXT.md` — Progress display definitions (D-01 through D-04)
- `.planning/phases/32-series-management-pages/32-CONTEXT.md` — Card content and sort definitions (D-01 through D-06)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PatternDiveTabs` component: add "series" to `PATTERN_DIVE_TABS` array and `TAB_CONFIG`, add `seriesContent` prop
- `MultiSelectDropdown` component: reusable for series filter — same pattern as Status/Size dropdowns
- `SeriesCard` from `/series` list page: extract and share, or import directly for Pattern Dive tab
- `getSeriesWithStats()` action: returns `SeriesWithStats[]` with computed progress — use for Series tab content
- `useGalleryFilters` hook: extend with `seriesFilter` URL state via nuqs `parseAsArrayOf`
- `filterAndSort()`: extend with series filter predicate

### Established Patterns
- Tab content passed as React.ReactNode props to PatternDiveTabs
- Data fetched in server component (charts/page.tsx) via Promise.all — add `getSeriesWithStats()` call
- Client-side filtering via pure functions (filterAndSort) with nuqs URL state
- MultiSelectDropdown for filter dimensions — options array of `{ value, label }`
- Presigned image URL batching across all tabs in a single `getPresignedImageUrls()` call

### Integration Points
- `src/components/features/charts/pattern-dive-tabs.tsx` — add "series" tab value, Library icon, seriesContent prop
- `src/app/(dashboard)/charts/page.tsx` — add `getSeriesWithStats()` to Promise.all, create Series tab component, pass imageUrls
- `src/components/features/gallery/gallery-types.ts` — add `seriesId: string | null` and `seriesName: string | null` to GalleryCardData
- `src/components/features/gallery/gallery-utils.ts` — add `seriesFilter` param to filterAndSort, add series predicate
- `src/components/features/gallery/use-gallery-filters.ts` — add seriesFilter URL state, toggleSeries callback, clearFilters update
- `src/components/features/gallery/filter-bar.tsx` — add Series MultiSelectDropdown after Size
- `src/components/features/gallery/project-gallery.tsx` — pass seriesFilter/toggleSeries props through
- `src/lib/actions/chart-actions.ts` — add `series: { select: { id: true, name: true } }` to getChartsForGallery include

</code_context>

<specifics>
## Specific Ideas

- Series filter options derived from charts data: `uniqueSeries = [...new Set(cards.filter(c => c.seriesId).map(c => ({ value: c.seriesId, label: c.seriesName })))]` + an "Unassigned" option with a synthetic value (e.g., `"__unassigned__"`)
- filterAndSort series predicate: if filter includes "Unassigned", include cards where seriesId is null; if filter includes named series, include cards matching those IDs
- Series tab component can be a thin wrapper: fetch data via getSeriesWithStats(), render card grid with sort pills, link to /series/[id] on click
- Tab URL state: `?tab=series` — consistent with existing tab values

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 34-Browse & Pattern Dive Integration*
*Context gathered: 2026-07-01*
