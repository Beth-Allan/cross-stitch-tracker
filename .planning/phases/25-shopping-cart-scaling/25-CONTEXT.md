# Phase 25: Shopping Cart Scaling - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the shopping cart usable with 75+ projects by adding project search, status grouping with collapsible sections, and supply-type search in the By Supply aggregation view. The existing shopping cart architecture (single data query, client-side selection, localStorage persistence) stays intact — this phase adds filtering and organization on top of it.

Requirements: CRIT-02

</domain>

<decisions>
## Implementation Decisions

### Project search & status grouping
- **D-01:** Single search input above the view toggle (By Project / By Supply Type), filtering both views from a single location.
- **D-02:** Projects grouped by status in collapsible sections with count badges (e.g., "Kitting (12)"). All sections expanded by default.
- **D-03:** Status group order follows workflow progression: Kitting → Stitching → On Hold → Unstarted → other statuses.
- **D-04:** When search is active, groups remain visible — search filters within groups. Empty groups auto-hide when no projects match.

### Supply search in By Supply view
- **D-05:** Text search input filtering across all supply types (threads, beads, specialty) simultaneously. Matches on brand name, color code, and color name only — not project names.
- **D-06:** Supply sections with zero matches auto-hide during search. Same pattern as project group auto-hiding.

### Selection behavior with filtering
- **D-07:** "Select All" selects only visible/filtered projects when search is active — what you see is what you get.
- **D-08:** Selected projects persist through search/filter changes — searching doesn't deselect hidden projects. Users can search-select iteratively (search "dragon", select, clear, search "fairy", select).
- **D-09:** Selection counter shows both filtered and total counts when search is active: "3 of 12 visible selected (5 total selected)".
- **D-10:** Each collapsible status group header has a "Select all in group" action for quick per-status selection (e.g., "Select all Kitting").

### Claude's Discretion
- Search input styling and debounce timing — match existing project input patterns in the app.
- Collapsible section animation — use existing Collapsible component or simple show/hide.
- Whether supply search shares the same input as project search or is a separate input within the By Supply view.
- Performance approach — virtualization vs. relying on search/filter to reduce rendered count. 75+ projects should be profiled.
- How the supply search input is positioned relative to the existing threads/beads/specialty section headers.

</decisions>

<specifics>
## Specific Ideas

- The real dataset has 75+ projects in kitting stages — this is the primary scaling bottleneck. Status grouping with per-group "Select all" directly addresses the most common workflow: "select all my kitting projects for a shopping trip."
- Search + group persistence means users can build selections across multiple searches without losing previous picks.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — CRIT-02 definition
- `.planning/ROADMAP.md` §Phase 25 — Success criteria and UI hint

### Shopping Cart Architecture
- `src/app/(dashboard)/shopping/page.tsx` — Server component, data fetching
- `src/components/features/shopping/shopping-cart.tsx` — Main client component, view toggle, selection state, filtering logic
- `src/components/features/shopping/project-accordion.tsx` — Project list with checkboxes and expandable supply details
- `src/components/features/shopping/supply-overview.tsx` — By Supply view with aggregated supply rows
- `src/components/features/shopping/shopping-for-bar.tsx` — Selected projects pill bar
- `src/components/features/shopping/shopping-list-tab.tsx` — Shopping list tab
- `src/components/features/shopping/shopping-list.tsx` — Shopping list component

### Data Layer
- `src/lib/actions/shopping-cart-actions.ts` — `getShoppingCartData()` query and `updateSupplyAcquired()` mutation
- `src/types/dashboard.ts` §Shopping Cart Types — `ShoppingCartProject`, `ShoppingSupplyNeed`, `ShoppingFabricNeed`, `ShoppingCartData`

### Tests
- `src/components/features/shopping/shopping-cart.test.tsx` — Shopping cart component tests
- `src/components/features/shopping/project-accordion.test.tsx` — Project accordion tests
- `src/components/features/shopping/supply-overview.test.tsx` — Supply overview tests
- `src/lib/actions/shopping-cart-actions.test.ts` — Shopping cart actions tests

### Design Reference
- `product-plan/sections/dashboards-and-views/` — Original shopping cart designs (Phase 9)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePersistedSelection` hook in `shopping-cart.tsx`: localStorage-backed selection with hydration guard — extend for per-group select
- `usePersistedViewMode` hook: Pattern for persisting UI state — could reuse for group collapse state
- `aggregateSupplies()` in `supply-overview.tsx`: Groups supplies by supplyId — filter this output for supply search
- `StatusBadge` component: Already renders status badges per project — reuse in group headers
- `cn()` utility: Tailwind class merging

### Established Patterns
- Client-side filtering via `useMemo` — threads/beads/specialty/fabrics already filtered by selectedIds
- Selection as `Set<string>` with toggle/add/remove/clear/selectAll operations
- localStorage persistence with SSR hydration guard (`hydratedRef`)
- Accordion expand/collapse via `expandedIds` Set state

### Integration Points
- `ShoppingCart` receives all data as props from server component — search/filter is purely client-side
- `ProjectAccordion` receives `projects` array — needs to accept grouped/filtered data
- `SupplyOverview` receives supply arrays — needs to accept search-filtered data
- `ShoppingForBar` shows selected projects — unaffected by search (always shows all selected)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 25-shopping-cart-scaling*
*Context gathered: 2026-05-18*
