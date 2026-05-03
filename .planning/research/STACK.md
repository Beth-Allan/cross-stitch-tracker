# Stack Research: Milestone 4 -- Form & Supply Overhaul (v1.3)

**Domain:** Merged form with supply takeover, unified supply table, keyboard-driven data entry, portal autocomplete, SVG donut indicators
**Researched:** 2026-05-03
**Confidence:** HIGH

## Executive Summary

v1.3 requires **zero new npm dependencies**. Everything needed is already installed or achievable with standard React/browser APIs. The key insight: `@base-ui/react` (already at 1.4.1) ships a full `Combobox` component with `Portal` + `Positioner` sub-components that solve the table-cell autocomplete positioning problem the sketches identified. React 19.2.5 (already installed) includes `<Activity>` for state preservation during the form-to-supply takeover transition. SVG donuts are trivial inline SVG with `stroke-dasharray` math -- no library warranted.

**What NOT to add:**
- No form library (react-hook-form, Formik) -- the existing `useChartForm` hook pattern (393 lines) is well-tested and the merged form is an evolution, not a rewrite
- No table library (TanStack Table, AG Grid) -- the supply table is a fixed-column layout with an add row, not a generic data grid
- No charting library -- SVG donuts are 8 lines of inline SVG
- No virtualization -- server-side filtering with 150ms debounce (proven in SearchToAdd) handles the 495-item DMC catalog fine
- No keyboard navigation library -- the flow is linear (search -> qty -> Enter -> loop), not a 2D grid navigation problem

## Recommended Stack Changes

### New Dependencies: NONE

The existing stack covers every v1.3 need:

| Capability Needed | Already Have | Version | How |
|---|---|---|---|
| Table cell autocomplete with portal positioning | `@base-ui/react` | 1.4.1 | `Combobox.Portal` + `Combobox.Positioner` handle z-index escaping from table cells |
| Keyboard-driven combobox (arrow keys, Enter, Esc) | `@base-ui/react` | 1.4.1 | `Combobox` provides WAI-ARIA keyboard navigation out of the box |
| Form state preservation during takeover | `react` | 19.2.5 | `<Activity mode="visible"|"hidden">` preserves state + DOM while hiding children via `display: none` |
| SVG donut status indicators | Browser SVG | n/a | Inline `<svg>` with `stroke-dasharray` / `stroke-dashoffset` -- see formula below |
| Segmented type toggle | Tailwind CSS | 4.2.3 | Button group with conditional active styles -- pure CSS |
| Sticky summary bar | Tailwind CSS | 4.2.3 | `sticky top-12 z-90` -- native CSS sticky positioning |
| Sticky save bar | Tailwind CSS | 4.2.3 | `fixed bottom-0` -- already a proven pattern in the app |
| Form validation | `zod` | 3.24.4 | Extend existing `chartFormSchema` for merged form fields |
| Toast notifications | `sonner` | 2.0.7 | Already used throughout for add/edit/delete feedback |
| Skein auto-calculation | `skein-calculator.ts` | custom | Already implemented and validated -- reuse directly |

## Detailed Rationale

### Base UI Combobox for Table Autocomplete

**Why this, not a custom portal dropdown:**

The existing `SearchToAdd` component uses a hand-rolled portal pattern (`position: fixed` + `getBoundingClientRect()` + viewport collision detection). This works but has ~80 lines of positioning/flip/close logic. The new supply table needs the same pattern inside a table cell, which adds complexity (table cells have no overflow context, stacking contexts on `<tr>` are unreliable).

Base UI's `Combobox` solves this with:
- `Combobox.Portal` -- renders dropdown outside the table DOM
- `Combobox.Positioner` -- auto-positions relative to the input with `sideOffset`, collision detection, and anchor-width CSS variables
- `Combobox.Input` -- handles keyboard events (arrow keys navigate items, Enter selects, Esc closes)
- `Combobox.useFilter()` -- provides `contains`/`startsWith` filtering with `Intl.Collator` for robust string matching
- WAI-ARIA combobox role semantics (important since the table itself needs ARIA annotations)

**Migration path:** The existing `SearchToAdd` can be preserved for now (it works on the project detail Supplies tab). The new table add row uses `Combobox` directly. Over time, `SearchToAdd` could be refactored to use `Combobox` too, but that's not v1.3 scope.

**Confidence:** HIGH -- verified `Combobox` exists in installed `@base-ui/react@1.4.1` with Portal, Positioner, Input, Popup, List, Item, Empty, Status sub-components all present in `node_modules`.

### React Activity for Form/Supply Takeover

**Why this, not conditional rendering:**

The sketch design has a "supply takeover" mode: clicking "Add supplies" collapses the form into a sticky summary bar and shows the supply table. Clicking "Details" brings the form back. The form has ~20 fields including cover image upload, genre chip selections, and inline-created designers -- losing this state during takeover would be unacceptable.

Options considered:
1. **Conditional rendering (`{showForm && <Form />}`)** -- destroys form state, requires manual state lifting or serialization. Bad.
2. **CSS `display: none`** -- preserves DOM but leaves React effects running unnecessarily. Manual.
3. **React `<Activity mode="hidden">`** -- preserves state + DOM, destroys effects (subscriptions clean up), re-creates effects when visible again. Built for exactly this use case.

```tsx
// Conceptual structure
<Activity mode={showSupplyTable ? "hidden" : "visible"}>
  <MergedChartForm values={formValues} onChange={setField} />
</Activity>

<Activity mode={showSupplyTable ? "visible" : "hidden"}>
  <SummaryBar project={formValues} onBack={() => setShowSupplyTable(false)} />
  <SupplyTable projectId={projectId} />
</Activity>
```

**Caveat:** For chart *creation* (no projectId yet), supplies can't be saved to the database until the chart is created. Two approaches:
1. Create a draft chart on first save, then supply takeover works with a real projectId
2. Hold supplies in client state, persist on final form submit

The `useChartForm` hook already batches chart+project creation in one server action. Extending it to also create supplies in the same action is the cleaner path -- avoids orphaned draft records.

**Confidence:** HIGH -- verified `Activity` exported from `react@19.2.5` as a symbol (`Symbol(react.activity)`). Context7 confirms the API: `<Activity mode="visible"|"hidden">`.

### SVG Donut Indicators (No Library)

**Why inline SVG, not a library:**

The donut indicators are 16x16px inline status rings -- not interactive, not animated, not configurable. Libraries like `react-circular-progressbar` add 5KB+ for features we don't need (animation, text overlays, gradients, trail customization).

The sketch already provides the exact implementation:

```tsx
function StatusDonut({ have, need }: { have: number; need: number }) {
  const ratio = need > 0 ? Math.min(have / need, 1) : 0;
  const circumference = 2 * Math.PI * 6; // r=6, circ=37.7
  const offset = circumference * (1 - ratio);
  const color = ratio >= 1 ? "var(--color-success)" : ratio > 0 ? "var(--color-warning)" : "var(--color-border-light)";

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-label={`${have} of ${need}`}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-border-light)" strokeWidth="2" />
      {ratio > 0 && (
        <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 8 8)" strokeLinecap="round" />
      )}
    </svg>
  );
}
```

This is a Server Component candidate -- no hooks, no event handlers, pure render from props.

**Confidence:** HIGH -- standard SVG, sketch-validated, no external dependencies.

### No Form Library Needed

**Why keep the custom hook:**

The existing `useChartForm` hook (393 lines) already handles:
- 20+ field types (text, number, select, date, boolean, file URL, multi-select)
- Inline entity creation (designer, genre, storage location, stitching app)
- Zod validation with field-level errors
- Dirty tracking for navigation guards
- Create and edit modes with initial data hydration
- Server action submission with toast feedback

The merged form adds:
- Pattern type cards (selection -> conditional sub-fields): straightforward `useState` addition
- Required field dot indicator: CSS-only, no state impact
- Supply takeover trigger: boolean state toggle

This is additive work on a proven pattern, not a case where a form library would reduce complexity. React Hook Form would require migrating 393 lines of working code and re-testing all field interactions -- high cost, low benefit.

**Confidence:** HIGH -- assessed based on actual hook implementation.

### No Table Library Needed

**Why custom table, not TanStack Table or AG Grid:**

The supply table has:
- Fixed columns (Colour, Stitches, Need, Have, Status, Delete)
- One add row (first `<tbody>` row, always visible)
- Section dividers (Thread/Beads/Specialty -- `<tr>` with `colspan`)
- Inline editable cells (click to edit number fields)
- Single keyboard flow (search -> qty -> Enter -> loop)

This is NOT:
- A sortable/filterable data grid
- A paginated table with dynamic columns
- A spreadsheet with cell-to-cell navigation

TanStack Table excels at dynamic column definitions, sorting, filtering, grouping, and pagination. None of those apply here. The fixed-column table with an add row is simpler to build directly with `<table>` + Tailwind than to configure through TanStack's API.

**Confidence:** HIGH.

## Alternatives Considered

| Capability | Recommended | Alternative | Why Not |
|---|---|---|---|
| Table autocomplete | Base UI Combobox (installed) | Custom portal (like SearchToAdd) | Base UI handles positioning, keyboard nav, ARIA -- less custom code |
| Table autocomplete | Base UI Combobox | cmdk (installed) | cmdk is for command palettes, not inline combobox in table cells. Lacks Positioner. |
| State preservation | React Activity | CSS display:none | Activity manages effect lifecycle; CSS alone leaves effects running |
| State preservation | React Activity | URL state (nuqs) | Form has 20+ fields including file uploads -- URL state is impractical |
| SVG donut | Inline SVG | react-circular-progressbar | 5KB for a 16px static ring is absurd |
| Form management | Custom useChartForm hook | react-hook-form | 393 lines of working, tested code. Migration cost > benefit. |
| Supply table | Custom HTML table | TanStack Table | Fixed columns, no sort/filter/pagination -- TanStack adds abstraction without reducing complexity |

## Schema Changes Needed

No new models. Potential field additions to existing junction tables:

| Table | Field | Type | Purpose |
|---|---|---|---|
| ProjectBead | beadCount | Int? | Bead count for future auto-calc (optional, matches sketch "bead count -> manual package need") |

The `isNeedOverridden` field already exists on `ProjectThread` and should be added to `ProjectBead` and `ProjectSpecialty` for consistency. This is a schema migration, not a dependency concern.

## Key Integration Points

### Base UI Combobox in Table Cell

The Combobox renders inside a `<td>` but the dropdown portals out via `Combobox.Portal`:

```tsx
<td className="relative">
  <Combobox.Root value={selected} onValueChange={handleSelect}>
    <Combobox.Input className="tbl-input" placeholder="Search..." />
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4}>
        <Combobox.Popup className="ac-dropdown">
          <Combobox.List>
            {(item) => <Combobox.Item key={item.id} value={item}>...</Combobox.Item>}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</td>
```

`Combobox.Positioner` uses `--anchor-width` CSS variable, which can be overridden to `max(320px, var(--anchor-width))` to match the sketch's `min-width: 320px` requirement.

### Activity Wrapping for Takeover

The form page component manages the transition:

```tsx
const [mode, setMode] = useState<"form" | "supplies">("form");

<Activity mode={mode === "form" ? "visible" : "hidden"}>
  <MergedChartForm ... onSupplyTakeover={() => setMode("supplies")} />
</Activity>

<Activity mode={mode === "supplies" ? "visible" : "hidden"}>
  <StickyProjectSummary ... onBack={() => setMode("form")} />
  <SupplyTableSection ... />
</Activity>
```

### Keyboard Flow Wiring

The add row keyboard loop (search -> stitches -> need -> Enter -> repeat) is managed by the Combobox's `onValueChange` callback focusing the next input via `ref`:

```
1. User types in Combobox.Input -> Combobox handles arrow/Enter for selection
2. On selection: Combobox.Root.onValueChange fires -> focus stitches input ref
3. User types stitches -> Tab or Enter -> focus need input (or auto-fill from calculator)
4. Enter on need field -> commit row (server action or local state) -> refocus Combobox.Input
5. Escape at any point -> clear add row fields, refocus Combobox.Input
```

No keyboard navigation library needed -- this is a linear flow managed by `ref.focus()` calls in event handlers.

## Installation

```bash
# No new packages needed
# Verify Base UI Combobox availability:
node -e "require('@base-ui/react/combobox'); console.log('Combobox available')"
```

## Sources

- Base UI Combobox documentation (Context7, verified against installed 1.4.1)
- React Activity documentation (Context7, verified export in React 19.2.5)
- SVG stroke-dasharray/dashoffset spec (MDN, standard browser API)
- Existing project: `use-chart-form.ts` (393 lines, custom hook pattern)
- Existing project: `search-to-add.tsx` (portal positioning with getBoundingClientRect)
- Existing project: `skein-calculator.ts` (validated formula)
- Sketch findings: `supply-data-entry.md`, `project-creation-form.md`
