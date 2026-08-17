# Phase 33: Chart Form Integration - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds series assignment to the chart create/edit form via SearchableSelect with inline creation. Users can assign a chart to a series, create a new series without leaving the form, and clear a series assignment. The Series schema, CRUD actions, and management pages already exist from Phases 31-32 — this phase wires series into the chart form only.

</domain>

<decisions>
## Implementation Decisions

### Form Layout
- **D-01:** Series field placed between Cover Image and Genres in the form: Name → Designer → Cover Image → **Series** → Genres. Treats series as an organizational property, positioned after visual identity and before classification tags.

### Inline Create Dialog
- **D-02:** Inline series creation dialog includes name only (single field). Matches the genre inline-add simplicity. User can fill in totalCount, designer, and notes later from the Series management page.
- **D-03:** Dialog title: "Add New Series". Submit button: "Add Series". Error: "Series name is required".

### Designer Pre-fill
- **D-04:** When creating a series inline from the chart form, auto-populate `designerId` from the chart's currently-selected designer. Common case: series is published by same designer. User can correct from Series management page for edge cases (collabs, mixed publishers per Phase 31 D-06).
- **D-05:** If no designer is selected on the chart, series is created with `designerId: null`.

### Pattern Consistency
- **D-06:** Follow the exact SearchableSelect + InlineDialog + form hook pattern established by designer (onAddNew → dialog open → handleAddSeries → select new value). No structural deviations.
- **D-07:** Clear button (X icon) clears series assignment immediately — no confirmation. Matches existing designer/storage/app clear behavior.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — SERIES-06, SERIES-07 definitions
- `.planning/ROADMAP.md` §Phase 33 — Success criteria and dependencies

### Existing Pattern (series mirrors this exactly)
- `src/components/features/charts/chart-merged-form.tsx` — Chart form where series field is added (lines ~477-494 show designer SearchableSelect + InlineDesignerDialog pattern)
- `src/components/features/charts/use-chart-form.ts` — Form hook with handleAddDesigner pattern (lines 325-343) to replicate for handleAddSeries
- `src/components/features/charts/form-primitives/searchable-select.tsx` — SearchableSelect component (reused as-is)
- `src/components/features/charts/inline-designer-dialog.tsx` — InlineDesignerDialog as structural template for InlineSeriesDialog

### Phase 31 Foundation (already built)
- `src/lib/actions/series-actions.ts` — createSeries action (accepts name, totalCount, designerId, notes)
- `src/types/series.ts` — Series types
- `src/lib/validations/series.ts` — Zod schema for series validation
- `prisma/schema.prisma` — Chart.seriesId field already exists

### Chart Form Pages (both need series data loading)
- `src/app/(dashboard)/charts/new/page.tsx` — Create page (add series fetch to Promise.all)
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` — Edit page (add series fetch, pass current seriesId)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SearchableSelect` component: fully reusable with `onAddNew` callback for inline creation trigger
- `InlineDesignerDialog` pattern: structural template for InlineSeriesDialog (name-only version is simpler)
- `use-chart-form.ts` hook: `handleAddDesigner` provides exact pattern for `handleAddSeries` (create → update local state → select new ID)
- Series CRUD actions: `createSeries` already accepts all needed params, `getSeriesWithStats` returns list for dropdown

### Established Patterns
- Form pages load reference data via `Promise.all` in server component, pass as props
- Form hook manages local entity lists (`designers`, `genres`) with setter for optimistic addition
- `SearchableSelect` options built from entity list: `entities.map(e => ({ value: e.id, label: e.name }))`
- InlineDialog: controlled open state, `initialName` from search term, `onSubmit` calls server action

### Integration Points
- `src/app/(dashboard)/charts/new/page.tsx` — add `getSeries()` (or similar) to Promise.all, pass to form
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` — same, plus pass chart's current `seriesId`
- `src/components/features/charts/chart-merged-form.tsx` — add Series SearchableSelect + InlineSeriesDialog between Cover Image and Genres
- `src/components/features/charts/use-chart-form.ts` — add `seriesId` to form values, `series` to state, `handleAddSeries` callback
- `src/lib/actions/chart-actions.ts` — ensure createChart/updateChart handle `seriesId` field

</code_context>

<specifics>
## Specific Ideas

- Series options format: `series.map(s => ({ value: s.id, label: s.name }))` — just name, no designer suffix needed (names are unique per D-08 Phase 31)
- handleAddSeries passes `designerId` from current form values for auto-populate (D-04)
- Form field label: "Series" with placeholder "Select series..."
- New file: `src/components/features/charts/inline-series-dialog.tsx` (single name field, simpler than InlineDesignerDialog)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 33-Chart Form Integration*
*Context gathered: 2026-05-25*
