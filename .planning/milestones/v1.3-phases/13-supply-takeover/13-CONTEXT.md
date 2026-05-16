# Phase 13: Supply Takeover - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Transition from form entry into a dedicated supply-adding mode. The merged form (Phase 12) collapses to a sticky summary bar, a calculator card with fabric assignment appears, and the unified supply table (Phase 10) fills the page below — all in-page via React Activity toggle. Supplies are buffered locally until the user commits with a single atomic save. Users can return to edit form details without losing supply work.

</domain>

<decisions>
## Implementation Decisions

### Mode switching
- **D-01:** In-page transition using React `<Activity>` (stable in React 19.2.5, already installed). Form hides, summary bar + calculator card + supply table show. No navigation, no redirect, no new route
- **D-02:** The milestone marker "Add supplies →" button triggers the mode toggle (replaces current create-then-redirect behavior). "← Details" link in summary bar toggles back. Form state preserved by Activity (no unmount)
- **D-03:** Nothing is created in the database until the user clicks the final "Create" button — the entire flow (form fields + supplies) saves atomically

### Save timing and adapter
- **D-04:** New `CreationFlowAdapter` implementing `SupplyTableAdapter` — stores supply rows in React component state (not server actions). The adapter slot is already annotated in `supply-table/types.ts` line 76
- **D-05:** Supply rows backed up to localStorage alongside the existing form draft (same `saveDraft`/`loadDraft` pattern from Phase 12). Tab close or crash is recoverable
- **D-06:** On final "Create" click: single `$transaction` wrapping `createChart` + `batchAddSupplies` (new server action). Either everything persists or nothing does — no orphan records
- **D-07:** `batchAddSupplies` server action inserts into all three junction tables (ProjectThread, ProjectBead, ProjectSpecialty) from the buffered supply rows
- **D-08:** Supply search (`searchSupplies`, `createSupply` on the adapter) still hits server actions for catalog lookups — only persistence is buffered

### Fabric + calculator card
- **D-09:** One styled card containing: fabric dropdown (first row) → Strands Over / Fabric Count / Waste % segmented controls below. Lives above the supply table in the supply takeover area
- **D-10:** Fabric selection auto-fills `fabricCount` in CalcParams. Value remains editable after selection — fabric sets a default, not a lock
- **D-11:** Fabric picker syncs with the project's `fabricId` field (same source of truth as the form's fabric selector). Selecting fabric in the calc card = assigning it to the project
- **D-12:** Fabric dropdown shows unassigned fabrics (same `unassignedFabrics` prop already wired into `ChartMergedForm`)
- **D-13:** No flat settings bar — styled card with segmented controls per sketch spec ("Skein Calculator panel: Styled card with segmented controls, not flat settings bar")

### Summary bar
- **D-14:** Live binding from `form.values` — no snapshot, no extra state. Summary bar reads current form state directly
- **D-15:** Content: dot-separated tokens built as `[name, designerName, statusLabel, stitchCountFormatted].filter(Boolean).join(" · ")`. Empty optional fields drop out gracefully
- **D-16:** Chart name (required) and status (defaults to "Unstarted") are always present — bar always shows at minimum "Chart Name · Unstarted"
- **D-17:** Positioned `sticky top-[48px] z-[90]` per sketch spec. No conflict with sticky save bar at `fixed bottom-0 z-[100]`

### Claude's Discretion
- CreationFlowAdapter internal structure (memory buffer format, localStorage serialization)
- `batchAddSupplies` server action implementation details and error handling
- Calculator card segmented control component (reuse SegmentedTypeToggle pattern from supply table or build new)
- Supply table empty state in creation flow
- Test strategy for the two-phase save transaction
- How existing `handleAddSupplies` callback is refactored into mode toggle
- Whether stale fabric ID detection on draft restore needs the same pattern as stale designerId

</decisions>

<specifics>
## Specific Ideas

- The transition should feel instant — Activity toggle with no loading spinner. The user clicks "Add supplies →" and immediately sees the supply table
- Calculator card should feel intentional and styled (not a flat settings bar) — it's the "set up your workspace" moment before bulk data entry
- Supply entry in creation flow should feel identical to project detail — same keyboard flow, same autocomplete, same add row. The adapter is the only difference
- "← Details" should feel like toggling a view, not navigating — no page flash, no scroll reset

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec (primary)
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` — Supply takeover HTML structure, summary bar CSS, milestone marker CSS, calculator card placement, sticky bar layering
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` — Supply table visual design (reused from Phase 10)
- `.claude/skills/sketch-findings-cross-stitch-tracker/SKILL.md` — Design direction summary

### Existing form code (being extended)
- `src/components/features/charts/chart-merged-form.tsx` — Current merged form (454 lines). Phase 13 adds mode toggle, summary bar, calculator card, and supply table embedding. The `handleAddSupplies` callback and `redirectToSuppliesRef` are replaced by mode state
- `src/components/features/charts/use-chart-form.ts` — Core form hook. Unchanged but its `form.values` feeds the summary bar
- `src/components/features/charts/use-draft-persistence.ts` — Draft persistence utilities. Extended to include supply row backup

### Supply table component system (embedded in takeover)
- `src/components/features/supply-table/types.ts` — `SupplyTableAdapter` interface (line 77), `CalcParams` interface (line 11), `DEFAULT_CALC_PARAMS`, `SupplyRow` — the contract Phase 13's `CreationFlowAdapter` implements
- `src/components/features/supply-table/index.ts` — Public API barrel (SupplyTable, LocalStateAdapter, ServerActionAdapter, all types)
- `src/components/features/supply-table/local-state-adapter.ts` — Reference adapter implementation for CreationFlowAdapter patterns

### Calculator and fabric
- `src/lib/utils/skein-calculator.ts` — `calculateSkeins()` function used by the supply table for auto-calc
- `src/components/features/charts/project-detail/calculator-settings-bar.tsx` — Old calculator settings bar (NOT reused, but reference for field semantics)

### Server actions
- `src/lib/actions/chart-actions.ts` — `createChart` server action. Phase 13 extends the transaction to include `batchAddSupplies`
- `src/lib/actions/supply-actions.ts` — Supply CRUD actions. `searchSupplies` catalog lookups still used by CreationFlowAdapter

### Requirements
- `.planning/REQUIREMENTS.md` — TAKE-01 through TAKE-04 (4 requirements mapped to Phase 13)

### Prior phase context
- `.planning/phases/10-unified-supply-table/10-CONTEXT.md` — D-06/D-07/D-08: CalcParams prop boundary and real calculateSkeins()
- `.planning/phases/11-supply-table-on-project-detail/11-CONTEXT.md` — D-01/D-02/D-03: Calculator settings editing deferred to Phase 13
- `.planning/phases/12-merged-form/12-CONTEXT.md` — D-06/D-09: Draft persistence, milestone marker entry point

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SupplyTable` component (Phase 10): Complete unified table with grouped sections, persistent add row, portal autocomplete, SVG donuts, inline editing — import from `@/components/features/supply-table`
- `LocalStateAdapter`: Reference implementation of SupplyTableAdapter — pattern for CreationFlowAdapter. Stores rows in memory, implements all adapter methods
- `ServerActionAdapter`: Production adapter wired to supply-actions.ts — shows how catalog search/create delegates to server actions (CreationFlowAdapter will do the same for search but buffer for persistence)
- `saveDraft`/`loadDraft`/`clearDraft`: localStorage draft utilities — extend to include supply rows
- `calculateSkeins()`: Skein calculator function with full formula and tests
- `SegmentedTypeToggle`: Segmented control component in supply table — potential pattern for calc card's segmented controls
- `PatternTypeCards`: Card selection pattern from Phase 12 — visual reference for styled card design
- `SearchableSelect`: Dropdown with search — potential base for fabric selector in calc card

### Established Patterns
- React `<Activity>` for hide/show without unmounting (React 19.2.5 stable)
- `SupplyTableAdapter` interface for abstracting data operations
- Three junction tables: ProjectThread, ProjectBead, ProjectSpecialty
- `$transaction` in Prisma for atomic multi-table operations
- `sonner` toast for success/error feedback
- `form.values` as single source of truth for form state

### Integration Points
- `chart-merged-form.tsx` milestone marker → mode toggle entry point
- `ChartMergedFormProps.unassignedFabrics` → fabric picker in calculator card
- `/charts/new/page.tsx` → no page-level changes needed (form component handles everything internally)
- Phase 14 will add edit mode using the same merged form layout and remove deprecated components

</code_context>

<deferred>
## Deferred Ideas

- Auto-infer overCount from fabric count (backlog 999.14) — when fabric is linked, auto-set overCount based on count (≤25 → over 1, ≥28 → over 2). Natural fit inside the calculator card but out of Phase 13 scope
- Supply takeover in edit mode — Phase 14 uses merged form for editing; supply management for existing projects stays on project detail Supplies tab
- Optimistic UI for supply mutations in creation flow — buffer is already local, so this is inherent; but explicit optimistic patterns for server-action adapter contexts remain a backlog item

</deferred>

---

*Phase: 13-supply-takeover*
*Context gathered: 2026-05-13*
