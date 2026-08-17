# Phase 11: Supply Table on Project Detail - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the Phase 10 unified supply table component into the project detail Supplies tab, replacing the old supply section. The unified table is backed by a new ServerActionAdapter that persists changes via existing supply server actions. Users view and add supplies in one surface without navigating away.

</domain>

<decisions>
## Implementation Decisions

### Calculator settings integration
- **D-01:** Pass saved project values as read-only `calcParams` — build from `project.strandCount`, `project.overCount`, `project.fabric?.count ?? 14`, `project.wastePercent` at the page level
- **D-02:** No settings editing UI on project detail in this phase — defer CalculatorSettingsBar to Phase 13's styled calculator card (TAKE-04)
- **D-03:** The existing CalculatorSettingsBar component stays in the codebase untouched (per Phase 10 D-10) but is not mounted in the new SuppliesTab

### Sorting carry-over
- **D-04:** Carry the Added/A-Z sort toggle from the old supplies tab into the Phase 11 wrapper component
- **D-05:** Reuse the existing `sortItems()` logic — parent pre-sorts `SupplyRow[]` arrays before passing to `SupplyTable`
- **D-06:** The SupplyTable component itself stays sort-unaware — sorting is the parent's responsibility

### New-row entrance animation
- **D-07:** Server actions (addThread, addBead, addSpecialty) return the new junction record ID on success
- **D-08:** ServerActionAdapter stores the returned ID and signals it to the table as `newRowId` (or equivalent prop)
- **D-09:** The table animates only the identified new row using the existing slideIn CSS (opacity 0→1, translateY -6px→0, 0.2s ease)
- **D-10:** This closes the Phase 10 deferred item ("slideIn animation wiring needs adapter interface change in Phase 11")

### Claude's Discretion
- ServerActionAdapter implementation details and error handling patterns
- Data transformation approach (Prisma junction types → SupplyRow[])
- Sort toggle placement and styling within the tab wrapper
- How newRowId is cleared after animation completes (timeout vs. onAnimationEnd)
- Empty state design for the new tab
- Test strategy for the ServerActionAdapter

</decisions>

<specifics>
## Specific Ideas

- Sort toggle should feel like the existing one — familiar, not a redesign
- Project detail is a "review and kitting" surface — users cross-reference against a physical pattern key sorted by DMC number, so A-Z sorting is important for large thread lists
- The animation closing the Phase 10 deferred item is a polish detail the user values — don't skip it

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 10 component system (primary)
- `src/components/features/supply-table/types.ts` — SupplyTableAdapter interface, SupplyRow, SupplyTableProps, CalcParams (the contract Phase 11 implements against)
- `src/components/features/supply-table/index.ts` — Public API barrel file (SupplyTable, StatusDonut, LocalStateAdapter, all types)
- `src/components/features/supply-table/local-state-adapter.ts` — Reference adapter implementation (shows how addThread/addBead/etc. return Result and handle newRowId pattern)

### Existing project detail code (being modified)
- `src/components/features/charts/project-detail/supplies-tab.tsx` — Current SuppliesTab being replaced (457 lines — contains sortItems, CalculatorSettings, section rendering, SearchToAdd wiring)
- `src/components/features/charts/project-detail/project-detail-page.tsx` — Parent component that mounts SuppliesTab with chartId, project, supplies props
- `src/components/features/charts/project-detail/types.ts` — ProjectDetailProps, CalculatorSettings, SupplyRowData, SupplySortOption types

### Server actions (adapter targets)
- `src/lib/actions/supply-actions.ts` — Existing supply CRUD actions (addProjectThread, removeProjectThread, updateProjectSupplyQuantity, etc.)

### Design context
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` — Visual design spec for the unified table
- `.planning/phases/10-unified-supply-table/10-CONTEXT.md` — Phase 10 decisions (D-08 calcParams seam, D-10 don't touch old components)

### Requirements
- `.planning/REQUIREMENTS.md` — DETAIL-01 (unified table on project detail), DETAIL-02 (add via persistent add row)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SupplyTable` component (Phase 10): Fully built unified table with grouped sections, persistent add row, portal autocomplete, SVG donuts, inline editing — import from `@/components/features/supply-table`
- `LocalStateAdapter`: Reference implementation of SupplyTableAdapter — pattern for ServerActionAdapter
- `sortItems()` in current `supplies-tab.tsx`: Sort function with `localeCompare({ numeric: true })` — extract and reuse
- Supply server actions in `supply-actions.ts`: addProjectThread, addProjectBead, addProjectSpecialty, removeProject*, updateProjectSupplyQuantity — all already exist

### Established Patterns
- Project detail page passes server-fetched data as props to client components
- `router.refresh()` for data revalidation after mutations
- `useTransition` for non-blocking server action calls
- `sonner` toast for success/error feedback
- Three junction tables: ProjectThread, ProjectBead, ProjectSpecialty

### Integration Points
- `project-detail-page.tsx` imports and mounts SuppliesTab — swap import to new implementation
- Page-level data fetching provides `supplies` prop (threads, beads, specialty arrays with includes)
- `calcParams` derived from project fields (strandCount, overCount, wastePercent) and linked fabric (count)

</code_context>

<deferred>
## Deferred Ideas

- Calculator settings editing UI — Phase 13 (TAKE-04)
- Per-column header sorting inside SupplyTable — future data management phase
- Optimistic UI for supply mutations — backlog (would provide instant feedback without router.refresh())

</deferred>

---

*Phase: 11-supply-table-on-project-detail*
*Context gathered: 2026-05-10*
