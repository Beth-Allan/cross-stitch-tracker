# Architecture Research: v1.3 Form & Supply Overhaul

**Domain:** Cross-stitch project management -- Milestone 4 (Form & Supply Overhaul)
**Researched:** 2026-05-03
**Confidence:** HIGH

## System Overview

v1.3 replaces the chart creation/edit flow and supply-adding experience with a merged single-page form, supply takeover transition, and unified supply table. This is primarily a **component architecture overhaul** -- the data model and server actions change minimally. The challenge is reorganizing client-side state management across a form that transitions between two visual modes (details vs. supply takeover) while preserving form state bidirectionally.

Key architectural concerns:
1. State preservation across form/supply-takeover mode transitions
2. A unified supply table component shared between creation flow and project detail page
3. Keyboard-driven interaction across heterogeneous row types in a single table
4. Portal autocomplete reuse from existing SearchToAdd pattern
5. Two-phase save: chart+project creation first, then supply linking to the new projectId

---

## Current Architecture (What Exists)

### Component Map

```
src/app/(dashboard)/charts/new/page.tsx          Server: fetches designers, genres, etc.
  -> ChartAddForm (client)                        Full-page form, uses useChartForm hook
     -> sections/basic-info-section.tsx            Name, designer, cover, digital file
     -> sections/stitch-count-section.tsx          Width, height, stitch count
     -> sections/genre-section.tsx                 Genre chip picker
     -> sections/pattern-type-section.tsx          Paper/Kit/SAL toggles
     -> sections/project-setup-section.tsx         Status, storage, app, fabric, onion skinning
     -> sections/dates-section.tsx                 Start/finish/FFO dates
     -> sections/goals-section.tsx                 Want to start next, season preference
     -> sections/notes-section.tsx                 Notes textarea

src/app/(dashboard)/charts/[id]/page.tsx          Server: fetches chart + supplies + sessions
  -> ProjectDetailPage (client)
     -> ProjectTabs -> SuppliesTab                 Manages supply sections + SearchToAdd
        -> SupplySection x3 (thread/bead/specialty) Collapsible sections with supply rows
           -> SupplyRow                            Inline-editable numbers, delete, status
        -> CalculatorSettingsBar                   Strand/over/fabric/waste controls
        -> InlineSupplyCreate                      Dialog for creating new catalog items

src/app/(dashboard)/charts/[id]/edit/page.tsx     Server: fetches chart + reference data
  -> ChartEditModal (client)                       Dialog with tabs, reuses useChartForm

src/components/features/supplies/search-to-add.tsx  Absolute-positioned dropdown
                                                   Fetches items, keyboard nav, adds to project
```

### Data Flow

```
Server Component (page.tsx)
  -> Promise.all([getDesigners(), getGenres(), ...])
  -> Pass data as props to Client Component

Client Component (ChartAddForm / ProjectDetailPage)
  -> useChartForm hook manages form state
  -> Server action calls: createChart, updateChart
  -> Server action calls: addThreadToProject, updateProjectSupplyQuantity
  -> revalidatePath + router.refresh() for data refresh
```

### Key Observations

1. **Two separate supply systems exist.** `ProjectSuppliesTab` (in project-supplies-tab.tsx) is an older implementation with its own inline SupplyRow and EditableNumber. `SuppliesTab` (in project-detail/supplies-tab.tsx) is the newer version with CalculatorSettingsBar, useMemo-derived sections, and the shared EditableNumber component. Both render on the project detail page via different code paths -- this is technical debt from iterative development.

2. **SearchToAdd is tightly coupled to projectId.** It calls `addThreadToProject({ projectId, threadId, ... })` directly. The new creation flow needs SearchToAdd to work **before** a project exists -- supplies must be accumulated in local state, then batch-persisted after chart+project creation.

3. **useChartForm owns all form state.** Clean hook-based architecture. Returns values, setField, handlers, errors. The merged form can extend this hook rather than replacing it.

4. **Form sections are cleanly decomposed.** Each section is a pure presentational component receiving values + onChange handlers. They can be regrouped with different visual treatment (HR dividers instead of section cards) without changing their APIs.

5. **The edit flow uses a modal.** `ChartEditModal` wraps the same sections in a Dialog with tabs. The v1.3 redesign should also provide a full-page edit route (not a modal) for consistency with the creation flow, but this can be deferred.

---

## Recommended Architecture (What to Build)

### Component Boundaries

| Component | Location | Responsibility | New/Modified |
|-----------|----------|----------------|--------------|
| `MergedFormPage` | `charts/new/page.tsx` | Server data fetch (unchanged route) | **Modified** |
| `MergedForm` | `features/charts/merged-form.tsx` | Top-level client orchestrator -- manages form mode (details vs. supply takeover) | **New** |
| `useChartForm` | `features/charts/use-chart-form.ts` | Form state hook (extended with supply accumulator) | **Modified** |
| `DetailsView` | `features/charts/merged-form/details-view.tsx` | Renders field groups with HR dividers, milestone marker | **New** |
| `SupplyTakeoverView` | `features/charts/merged-form/supply-takeover-view.tsx` | Summary bar + skein calc card + UnifiedSupplyTable | **New** |
| `StickyFormBar` | `features/charts/merged-form/sticky-form-bar.tsx` | Fixed bottom bar with save hint + Save Draft + Create | **New** |
| `SummaryBar` | `features/charts/merged-form/summary-bar.tsx` | Sticky bar showing collapsed form summary | **New** |
| `PatternTypeCards` | `features/charts/merged-form/pattern-type-cards.tsx` | 2x2 card grid replacing current toggles | **New** |
| `RequiredDot` | `features/charts/form-primitives/required-dot.tsx` | Green dot indicator for required fields | **New** |
| `MilestoneMarker` | `features/charts/merged-form/milestone-marker.tsx` | "Ready for supplies?" transition element | **New** |
| `SkeinCalculatorCard` | `features/charts/merged-form/skein-calculator-card.tsx` | Styled card with segmented controls (replaces flat settings bar) | **New** |
| `UnifiedSupplyTable` | `features/charts/supply-table/unified-supply-table.tsx` | Table with grouped sections, add row, type toggle | **New** |
| `SupplyAddRow` | `features/charts/supply-table/supply-add-row.tsx` | Persistent top row with type toggle + search + qty | **New** |
| `SupplyDataRow` | `features/charts/supply-table/supply-data-row.tsx` | Single supply item row with inline editing | **New** |
| `SectionDivider` | `features/charts/supply-table/section-divider.tsx` | Type group header row (icon + label + count) | **New** |
| `SupplyTypeToggle` | `features/charts/supply-table/supply-type-toggle.tsx` | Segmented 3-button control | **New** |
| `StatusDonut` | `features/charts/supply-table/status-donut.tsx` | SVG proportional have/need ring | **New** |
| `PortalAutocomplete` | `features/charts/supply-table/portal-autocomplete.tsx` | Extracted portal dropdown from SearchToAdd pattern | **New** |
| `useSupplyTable` | `features/charts/supply-table/use-supply-table.ts` | Keyboard navigation, add/remove/edit state, type toggle | **New** |

### Directory Structure

```
src/components/features/charts/
  merged-form/
    merged-form.tsx              Main orchestrator
    details-view.tsx             Form fields with HR dividers
    supply-takeover-view.tsx     Supply takeover mode wrapper
    sticky-form-bar.tsx          Bottom save bar
    summary-bar.tsx              Collapsed form summary
    pattern-type-cards.tsx       Selectable pattern type grid
    milestone-marker.tsx         Transition CTA
    skein-calculator-card.tsx    Calc settings as styled card
  supply-table/
    unified-supply-table.tsx     Shared table component
    supply-add-row.tsx           Persistent add row
    supply-data-row.tsx          Individual item row
    section-divider.tsx          Group header
    supply-type-toggle.tsx       Segmented type control
    status-donut.tsx             SVG have/need indicator
    portal-autocomplete.tsx      Extracted portal dropdown
    use-supply-table.ts          Table state + keyboard hook
  form-primitives/
    required-dot.tsx             NEW: green dot
    (existing files stay)
```

### What Changes vs. What Stays

**Modified (not deleted):**
- `charts/new/page.tsx` -- Same Server Component fetch, but renders `MergedForm` instead of `ChartAddForm`. Needs additional fetch for supply catalogs (threads, beads, specialty items) to support offline-first autocomplete.
- `use-chart-form.ts` -- Extended to include local supply accumulator state (`pendingSupplies: SupplyRowData[]`) and supply takeover mode flag. Form submission now includes a second pass for supply linking after chart+project creation.
- `form-primitives/form-field.tsx` -- Possibly swap "optional" label pattern for RequiredDot pattern.

**Kept as-is (no changes needed):**
- `sections/basic-info-section.tsx` -- Reused inside DetailsView
- `sections/stitch-count-section.tsx` -- Reused inside DetailsView
- `sections/genre-section.tsx` -- Reused inside DetailsView (chips stay the same)
- `sections/dates-section.tsx` -- Reused inside DetailsView
- `sections/goals-section.tsx` -- Reused inside DetailsView
- `sections/notes-section.tsx` -- Reused inside DetailsView
- `form-primitives/searchable-select.tsx` -- Still used for designer/storage/app selects
- `form-primitives/cover-image-upload.tsx` -- Still used in DetailsView
- `editable-number.tsx` -- Reused in SupplyDataRow and SkeinCalculatorCard
- `lib/utils/skein-calculator.ts` -- Pure function, no changes
- `lib/actions/supply-actions.ts` -- Existing add/remove/update actions stay for project detail page. New batch-add action needed for creation flow.

**Deprecated (eventually removed):**
- `chart-add-form.tsx` -- Replaced by MergedForm. Delete after MergedForm ships.
- `chart-add-form.test.tsx` -- Tests rewritten for MergedForm.
- `project-supplies-tab.tsx` -- Older supply view. The project detail `SuppliesTab` (in project-detail/) stays but evolves to use UnifiedSupplyTable.
- `project-detail/supply-section.tsx` -- Replaced by UnifiedSupplyTable's SectionDivider rows.
- `project-detail/supply-row.tsx` -- Replaced by SupplyDataRow.
- `project-detail/supply-footer-totals.tsx` -- Integrated into UnifiedSupplyTable footer.

**New server actions needed:**
- `batchAddSuppliesToProject(projectId, supplies[])` -- Creates all three junction table rows in a single $transaction after chart+project creation. Avoids N individual server action calls.

### Data Flow: Creation with Supply Takeover

This is the most complex flow and the architectural centerpiece.

```
1. USER fills form fields (details mode)
   -> useChartForm manages values in React state
   -> No server calls yet

2. USER clicks "Add Supplies" (milestone marker)
   -> MergedForm sets mode = "supply-takeover"
   -> Form fields collapse into SummaryBar (data preserved in useChartForm state)
   -> UnifiedSupplyTable renders with empty supply list

3. USER adds supplies in table
   -> useSupplyTable manages pendingSupplies[] in local state
   -> Each "add" appends to local array (NO server call -- no projectId yet)
   -> Auto-calc runs locally using skein calculator
   -> User can edit stitchCount, need, have in local state

4. USER clicks "Details" link in SummaryBar
   -> MergedForm sets mode = "details"
   -> Form fields expand, supply data preserved in useSupplyTable state
   -> Bidirectional transition preserves both states

5. USER clicks "Create" in StickyFormBar
   -> useChartForm.handleSubmit():
     a. Validate form fields (Zod)
     b. Call createChart() server action -> returns { chartId, projectId }
     c. If pendingSupplies.length > 0:
        Call batchAddSuppliesToProject(projectId, pendingSupplies)
     d. Navigate to /charts/[id]
```

### Data Flow: Project Detail Supplies Tab

```
1. SERVER fetches chart + project + supplies (existing)
   -> Passes to ProjectDetailPage

2. UnifiedSupplyTable renders with server data (not local state)
   -> Grouped by type (Thread/Beads/Specialty)
   -> Add row available at top

3. USER adds supply via add row
   -> PortalAutocomplete shows catalog items
   -> On select: IMMEDIATE server action (addThreadToProject etc.)
   -> router.refresh() updates data
   -> (This is the existing pattern, keeps working)

4. USER edits inline values (stitches, need, have)
   -> Optimistic update + server action (existing updateProjectSupplyQuantity)
```

### Key Architectural Decision: Local State vs. Server State

The UnifiedSupplyTable must work in TWO modes:

| Aspect | Creation Flow | Project Detail |
|--------|--------------|----------------|
| Data source | Local React state (pendingSupplies[]) | Server-fetched (Prisma query) |
| Add action | Append to local array | Server action + refresh |
| Edit action | Mutate local array | Optimistic + server action |
| Delete action | Remove from local array | Server action + refresh |
| Save | Batch persist on form submit | Already persisted on each action |
| projectId available? | NO (not created yet) | YES |
| Calculator settings | Local state (defaults or from fabric) | Project.strandCount/overCount/wastePercent |

**Implementation:** UnifiedSupplyTable accepts a `mode` prop (`"local" | "persisted"`) and a `supplies` prop interface:

```typescript
interface SupplyTableProps {
  mode: "local" | "persisted";
  supplies: SupplyRowData[];
  calculatorSettings: CalculatorSettings;

  // Local mode: parent manages array
  onAddLocal?: (item: SupplyRowData) => void;
  onUpdateLocal?: (id: string, updates: Partial<SupplyRowData>) => void;
  onRemoveLocal?: (id: string) => void;

  // Persisted mode: direct server actions
  projectId?: string;
  onServerAdd?: () => void;   // triggers router.refresh
  onServerUpdate?: () => void;
  onServerRemove?: () => void;

  // Shared
  onSettingsChange?: (settings: CalculatorSettings) => void;
}
```

This keeps the table component pure -- it renders data and emits events. The parent (MergedForm or SuppliesTab) decides whether those events go to local state or server actions.

---

## PortalAutocomplete Extraction

The existing SearchToAdd component at `supplies/search-to-add.tsx` does too many things:
1. Manages search state
2. Fetches catalog items via server action
3. Renders a positioned dropdown
4. Handles keyboard navigation
5. Calls server action to add item to project

For v1.3, extract the **search + dropdown + keyboard** part into a reusable `PortalAutocomplete`:

```typescript
interface PortalAutocompleteProps {
  supplyType: "thread" | "bead" | "specialty";
  existingIds: string[];          // Items already added (shown as disabled)
  anchorRef: React.RefObject<HTMLInputElement>;  // Position relative to this
  onSelect: (item: CatalogItem) => void;        // Parent decides what to do
  onClose: () => void;
  onCreateNew?: (searchText: string) => void;
}
```

Key change: `onSelect` returns the catalog item data. In persisted mode, the parent calls `addThreadToProject()`. In local mode, the parent builds a `SupplyRowData` and appends to local state. The portal pattern (`position: fixed` + `getBoundingClientRect()`) stays identical.

---

## Keyboard Navigation Architecture

The unified supply table needs keyboard flow across heterogeneous content:

```
[Type Toggle] Tab -> [Search Input] type+Enter -> [Stitches/Qty Input] Enter ->
  (row added, search refocuses)

Within data rows:
  Click cell -> inline edit -> Tab to next editable cell -> Enter to confirm
```

**useSupplyTable hook responsibilities:**
1. Track `activeType` (thread/bead/specialty) -- sticky between adds
2. Track `focusedElement` (search input, stitch input, need input)
3. Handle Enter key chain: autocomplete select -> qty field -> commit row -> refocus search
4. Handle Escape: reset add row fields
5. Handle Tab: move between editable cells in data rows
6. Manage `pendingSupplies` array (local mode) or delegate to parent (persisted mode)

The hook does NOT manage autocomplete keyboard nav (ArrowUp/ArrowDown) -- that stays in PortalAutocomplete which handles its own focus trap.

---

## Pattern Type Cards Architecture

Current implementation uses boolean toggles (isPaperChart, isFormalKit, isSAL) which don't map cleanly to the sketch-designed card grid (Chart Only, Kit, Digital Only, Subscription). The sketch shows mutually exclusive cards with radio-style selection.

**Decision: Keep existing schema fields.** The card selection is a UI affordance that maps to the existing booleans:
- "Chart Only" = isPaperChart: true, isFormalKit: false
- "Kit" = isFormalKit: true (expands to show kitColorCount)
- "Digital Only" = isPaperChart: false, isFormalKit: false
- "Subscription" = isSAL: true

This avoids a schema migration. The PatternTypeCards component translates card selection to boolean field updates.

---

## Form Edit Mode Integration

The current edit flow uses `ChartEditModal` (dialog with tabs). For v1.3 consistency, the edit page (`charts/[id]/edit/page.tsx`) should render the same `MergedForm` in edit mode, pre-populated with existing data and existing supplies.

In edit mode:
- DetailsView pre-fills all fields from existing chart+project
- Supply takeover shows existing supplies (fetched from server) as initial state
- Changes save via `updateChart()` + individual supply mutations (existing pattern)
- No batch-add needed -- supplies are already persisted

The `ChartEditModal` can stay as a lightweight quick-edit option (accessible from project detail hero kebab menu), but the full edit page becomes the canonical editing surface.

---

## Component Boundaries: What Talks to What

```
MergedForm (orchestrator)
  |
  |-- [mode === "details"]
  |     DetailsView
  |       BasicInfoSection (existing, reused)
  |       StitchCountSection (existing, reused)
  |       GenreSection (existing, reused as chips)
  |       PatternTypeCards (NEW)
  |       ProjectSetupSection (existing, reused)
  |       DatesSection (existing, reused)
  |       GoalsSection (existing, reused)
  |       NotesSection (existing, reused)
  |       MilestoneMarker (NEW)
  |
  |-- [mode === "supply-takeover"]
  |     SummaryBar (NEW)
  |     SupplyTakeoverView
  |       SkeinCalculatorCard (NEW)
  |       UnifiedSupplyTable (NEW, mode="local")
  |         SupplyAddRow (NEW)
  |           SupplyTypeToggle (NEW)
  |           PortalAutocomplete (NEW, extracted from SearchToAdd)
  |         SectionDivider (NEW) x3
  |         SupplyDataRow (NEW) xN
  |         StatusDonut (NEW)
  |
  |-- StickyFormBar (always visible)

SuppliesTab (project detail, existing but modified)
  |-- CalculatorSettingsBar (existing) OR SkeinCalculatorCard (if redesigned)
  |-- UnifiedSupplyTable (NEW, mode="persisted")
        (same component tree, different data source)
```

---

## Scalability Considerations

| Concern | At 10 supplies | At 50 supplies | At 200 supplies |
|---------|---------------|----------------|-----------------|
| Table render | No issue | No issue | Consider virtualization (unlikely needed -- most projects have <80 threads) |
| Add row autocomplete | 495 DMC threads, fast search | Same catalog | Same catalog |
| Local state (creation) | Trivial | Trivial | Array operations fine at this scale |
| Keyboard nav | Smooth | Smooth | Section dividers help scannability |
| Batch save | Single $transaction | Single $transaction | May need chunking at 200+ but unlikely |

---

## Suggested Build Order

Based on dependency analysis, the recommended phase structure:

### Phase 1: Foundation -- Unified Supply Table Components
Build the reusable table first because both creation flow and project detail depend on it.

1. StatusDonut (SVG component, pure, no dependencies)
2. SupplyTypeToggle (segmented control, pure)
3. SectionDivider (table row component, pure)
4. SupplyDataRow (table row with inline editing -- reuses EditableNumber)
5. PortalAutocomplete (extract from SearchToAdd -- search + dropdown + keyboard)
6. SupplyAddRow (combines toggle + search + qty inputs + keyboard chain)
7. useSupplyTable (state hook: pending supplies, active type, keyboard flow)
8. UnifiedSupplyTable (assembles all above into grouped table with footer)

### Phase 2: Supply Table Integration on Project Detail
Wire the new table into the existing project detail page (persisted mode).

1. Adapt SuppliesTab to use UnifiedSupplyTable instead of SupplySection/SupplyRow
2. Wire server actions (add/update/remove) through table callbacks
3. Integrate CalculatorSettingsBar (or replace with SkeinCalculatorCard)
4. Remove deprecated components (supply-section.tsx, supply-row.tsx, supply-footer-totals.tsx)

### Phase 3: Merged Form -- Details View
Build the new creation form layout.

1. RequiredDot (tiny component)
2. PatternTypeCards (card grid mapping to booleans)
3. MilestoneMarker (transition CTA)
4. StickyFormBar (fixed bottom bar)
5. DetailsView (regroups existing sections with HR dividers + new components)

### Phase 4: Merged Form -- Supply Takeover
Wire the form-to-supply transition.

1. SummaryBar (sticky collapsed form summary)
2. SkeinCalculatorCard (styled calc settings -- defaults from fabric)
3. SupplyTakeoverView (summary bar + calc card + table in local mode)
4. Extend useChartForm with supply accumulator + mode toggle
5. MergedForm orchestrator (details <-> supply-takeover transitions)
6. New server action: batchAddSuppliesToProject
7. Wire creation submit: createChart -> batchAddSupplies -> navigate

### Phase 5: Edit Mode + Cleanup
Make the edit page use MergedForm too, clean up deprecated code.

1. Wire MergedForm in edit mode (pre-populated, persisted supplies)
2. Update charts/[id]/edit/page.tsx
3. Delete chart-add-form.tsx, project-supplies-tab.tsx, and other deprecated files
4. Update tests for all modified components

**Phase ordering rationale:**
- Table first (Phase 1) because both creation (Phase 4) and project detail (Phase 2) need it
- Project detail integration (Phase 2) validates the table works with real server data before the more complex creation flow
- Details view (Phase 3) before supply takeover (Phase 4) because the form fields must exist before the transition between modes
- Edit mode + cleanup (Phase 5) last because it's additive -- existing edit modal still works as fallback

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Nested Forms
**What:** Wrapping the supply table inside the chart form's `<form>` element.
**Why bad:** HTML forbids nested forms. Enter key in supply search would submit the outer form.
**Instead:** The supply table uses `<div>` with `type="button"` handlers and explicit keyboard event handling. StickyFormBar's Create button submits via the useChartForm.handleSubmit callback, not a form submit event.

### Anti-Pattern 2: Server Actions During Creation Flow
**What:** Calling addThreadToProject() while adding supplies in creation mode.
**Why bad:** No projectId exists yet. Would require creating the project first, then managing partial creation state.
**Instead:** Accumulate supplies in local state. Batch-persist after chart+project creation succeeds.

### Anti-Pattern 3: SearchToAdd Fork
**What:** Duplicating SearchToAdd to make a "creation mode" version.
**Why bad:** Two components to maintain. Bugs fixed in one, not the other.
**Instead:** Extract PortalAutocomplete as a shared primitive. Both the creation flow add row and any future search-to-add usage compose from it.

### Anti-Pattern 4: Global Form State for Supplies
**What:** Putting supply array into useChartForm's values object.
**Why bad:** Couples form validation with supply state. Zod schema would need to understand supply rows. Form dirty tracking gets confused.
**Instead:** useSupplyTable manages supply state independently. MergedForm reads both states at submit time and orchestrates the two-phase save.

### Anti-Pattern 5: Table Layout with CSS Grid
**What:** Using CSS Grid instead of `<table>` for the supply table.
**Why bad:** The sketch explicitly uses `table-layout: fixed` for column alignment. Section dividers use `colspan`. Semantic table markup aids accessibility.
**Instead:** Use actual `<table>` element with `table-layout: fixed`, as designed in the sketches.

---

## Sources

- Sketch findings: `.claude/skills/sketch-findings-cross-stitch-tracker/`
- Existing codebase analysis (HIGH confidence -- direct code reading)
- Prisma schema: `prisma/schema.prisma`
- Existing components: `src/components/features/charts/`, `src/components/features/supplies/`
