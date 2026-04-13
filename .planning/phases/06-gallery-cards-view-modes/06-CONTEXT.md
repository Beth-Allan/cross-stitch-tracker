# Phase 6: Gallery Cards & View Modes - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse their chart collection through visually rich gallery cards with status-specific footer content, switch between gallery/list/table view modes, sort by multiple fields, and search/filter by name, status, and size category. This phase replaces the current plain table on /charts with a gallery experience. All user-facing labels rename from "Charts" to "Projects" (routes and code stay unchanged).

</domain>

<decisions>
## Implementation Decisions

### Filter & Search Scope
- **D-01:** Build search + status multi-select + size multi-select only. No "More" expander, no secondary filters. The full 12-dimension AdvancedFilterBar is deferred to BRWS-01 (v1.2+).
- **D-02:** Layout is stacked: filter bar row (search + dropdowns) above, then a separator row with "N projects" count on the left and Cards/List/Table toggle on the right.
- **D-03:** Active filter chips appear below the filter bar when any filter is active, with individual dismiss (X) and a "Clear all" link.

### Card Data Mapping (Pre-Session-Logging)
- **D-04:** WIP cards show progress bar (stitchesCompleted / stitchCount — both fields exist on Project), stitch count fraction, and supply summary (thread/bead/specialty counts from junction tables). Skip last stitched date, total time, and stitching days since session data doesn't exist until Phase 9.
- **D-05:** Finished cards show celebration border/ring (Finished=violet, FFO=rose), full 100% progress bar, finish/FFO date if set, and supply summary. Skip the stats grid (start-to-finish days, stitching days, time, avg daily) until Phase 9.
- **D-06:** Unstarted cards compute kitting dot status from real data: Fabric = check if project has linked fabric. Thread/Beads/Specialty = check if junction table has entries for that type. Status values: 'fulfilled' (has entries), 'needed' (no entries but chart uses that supply type), 'not-applicable' (chart doesn't use that type).
- **D-07:** Skip the prep step pipeline entirely — no `prepStep` field on Project, no mini track on Unstarted cards. May add in a future phase.

### Gallery Page Structure
- **D-08:** Gallery replaces the /charts page entirely. The current table becomes the "table" view mode. One page, three views via mode toggle.
- **D-09:** Gallery cards are browse-only. Clicking a card navigates to /charts/[id] (existing detail page) where edit/delete actions live. No inline edit/delete on cards, no hover kebab menus.
- **D-10:** User-facing labels rename from "Charts" to "Projects" — sidebar nav, page heading, button labels, empty states. Routes stay /charts, code models stay Chart/Project. Cosmetic rename only.

### Sort Behaviour
- **D-11:** Sort dropdown appears on all three view modes (next to the view toggle bar). Table view additionally has clickable column headers for sorting. Sort state is shared — sorting in gallery carries over when switching to table.
- **D-12:** All view state persists in URL search params: view mode, sort field, sort direction, search text, and active filters (e.g. ?view=gallery&sort=dateAdded&dir=desc&status=IN_PROGRESS). Refresh-safe, shareable, back-button friendly.
- **D-13:** Default sort when landing with no URL params: date added, newest first.

### Claude's Discretion
- Gallery card grid column sizing and responsive breakpoints (the design shows `minmax(280px, 340px)` — adapt as needed)
- List view column layout and responsive hiding
- Empty state design when no projects match filters (the design has a scissors icon + message)
- Cover image placeholder gradient colors per status (design has specific gradient pairs)
- How to determine "chart uses beads/specialty" for kitting dot logic (check if chart's junction tables are relevant vs using a flag)
- Whether to use `nuqs` or manual URL param parsing for state management
- Sort dropdown component implementation (can reuse existing patterns or build new)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Gallery card designs (visual/behavioral — rewrite for Next.js)
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/GalleryCard.tsx` — Full card component with WIP/Unstarted/Finished footers, cover image handling, status badges, celebration borders
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/GalleryGrid.tsx` — Gallery/List/Table view implementations with sort logic
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/AdvancedFilterBar.tsx` — Filter bar with dropdowns, search, chips, view toggle (build Phase 6 subset only)
- `product-plan/sections/gallery-cards-and-advanced-filtering/types.ts` — GalleryCardBase, WIPCardData, UnstartedCardData, FinishedCardData, ViewMode, sort types
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-cards.png` — Gallery card view screenshot
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-list.png` — List view screenshot
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-table.png` — Table view screenshot
- `product-plan/sections/gallery-cards-and-advanced-filtering/README.md` — Component overview and props reference

### Existing code being replaced/extended
- `src/app/(dashboard)/charts/page.tsx` — Current Server Component page that fetches data and passes to ChartList
- `src/components/features/charts/chart-list.tsx` — Current table/card list being replaced by gallery views
- `src/components/features/charts/cover-thumbnail.tsx` — Existing cover image thumbnail component (reusable)
- `src/components/features/charts/status-badge.tsx` — Existing status badge component (adapt for gallery)
- `src/components/features/charts/size-badge.tsx` — Existing size badge component (adapt for gallery)
- `src/types/chart.ts` — ChartWithProject type definition (extend for gallery card data)
- `src/lib/actions/chart-actions.ts` — getCharts() action that fetches chart data (extend query for gallery fields)

### Schema and data model
- `prisma/schema.prisma` — Chart (line 41), Project (line 65), ProjectThread/ProjectBead/ProjectSpecialty junction tables, ProjectStatus enum

### Established patterns to follow
- `.claude/rules/base-ui-patterns.md` — Button/Link, semantic tokens, no nested forms
- `.claude/rules/server-client-split.md` — Server Components default, client only for interactivity
- `.claude/rules/component-implementation.md` — Component conventions
- `.claude/rules/form-patterns.md` — Zod trim+min patterns (for search validation if needed)

### Project requirements
- `.planning/REQUIREMENTS.md` — GLRY-01 through GLRY-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CoverThumbnail` component — existing small image thumbnail, can be adapted for gallery card cover images
- `StatusBadge` / `SizeBadge` — existing badge components, reusable across all view modes
- `getEffectiveStitchCount()` utility — calculates stitch count from dimensions, already used in ChartList
- `getPresignedImageUrls()` — server-side R2 URL resolution, already called in charts page.tsx
- `ChartEditModal` — existing edit modal, still accessible from detail page (not needed on gallery cards)
- `getCharts()` server action — fetches charts with project/designer/genre includes, needs extending for supply counts

### Established Patterns
- Server Component page.tsx fetches data → passes to Client Component for interactivity
- URL param state with `useSearchParams()` (existing pattern in supplies page for view mode)
- Presigned image URLs resolved server-side, passed as `imageUrls` record
- `router.refresh()` after mutations to revalidate Server Component data

### Integration Points
- `/charts/page.tsx` — replace content with gallery component, extend data fetching for supply counts
- `chart-list.tsx` — replace entirely with new gallery component(s)
- `src/components/shell/nav-items.ts` — rename "Charts" label to "Projects"
- `src/types/chart.ts` — extend ChartWithProject or create GalleryCardData type for gallery queries
- Sidebar, top bar, buttons, empty states — rename "Charts" → "Projects" throughout

</code_context>

<specifics>
## Specific Ideas

- The celebration border on Finished/FFO cards (violet/rose glow ring) is a design highlight — keep it prominent
- Kitting dots are a key visual differentiator for Unstarted cards — three-state icons (check/circle/dash) give quick "is this project ready?" assessment
- With 500+ charts, the gallery view default of `minmax(280px, 340px)` grid should feel dense but readable
- The "Projects" rename should feel natural — nav, heading, empty state copy, button labels all say "Projects" not "Charts"
- Cover image in gallery cards uses `aspect-[4/3]` container with `object-cover` (not the `object-contain` from Phase 5's detail page fix — gallery cards want visual impact, detail page wants full visibility)

</specifics>

<deferred>
## Deferred Ideas

- Full 12-dimension AdvancedFilterBar (BRWS-01, v1.2+) — designer, genre, series, kitting status, completion bracket, year filters
- PrepStep field and pipeline indicator on Unstarted cards — no current schema support
- Session-dependent stats on WIP/Finished cards (progress rate, time tracking, last stitched) — depends on Phase 9
- Inline edit/delete on gallery cards (kebab menu) — cards are browse-only, actions on detail page
- Routes rename /charts → /projects — user-facing labels only for now

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-gallery-cards-view-modes*
*Context gathered: 2026-04-13*
