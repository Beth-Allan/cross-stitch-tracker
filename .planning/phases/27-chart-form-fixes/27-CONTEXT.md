# Phase 27: Chart Form Fixes - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix 5 bugs in the chart creation/editing form: designer quick-add, designer tab focus, designer detail thumbnails, stitch count auto-calculation display, and skeins value display. No new features, no new pages, no schema changes — fix what's already shipped.

Requirements: BUG-01, BUG-02, BUG-04, BUG-05, BUG-06

</domain>

<decisions>
## Implementation Decisions

### Designer inline creation (BUG-01)
- **D-01:** Wire up the existing `InlineDesignerDialog` component — same controlled-dialog pattern already used for storage locations and stitching apps. Add two `useState` vars (dialog open + initial name) to `chart-merged-form.tsx` and connect `SearchableSelect.onAddNew` to open the dialog instead of calling `handleAddDesigner` directly.
- **D-02:** `InlineDesignerDialog` already supports name + optional website fields, error/pending states, and `initialName` sync. Zero new components needed.
- **D-03:** `handleAddDesigner` in `use-chart-form.ts` already accepts `(name, website?)` — dialog submission calls this handler, which creates via server action and auto-selects the new designer.

### Stitch count display (BUG-05)
- **D-04:** Display-only sum hint — show the supply stitch total as a read-only hint alongside the manual `totalStitchCount` field. The manual field stays authoritative for size category calculation.
- **D-05:** No auto-override of manually entered values. Partial supply entry (common with 50+ color charts) would produce misleading size categories if auto-summed.
- **D-06:** Hint should work in both create mode (supply panel) and edit mode (different page). Display something like "Supply total: X stitches" near the stitch count field when supply stitch counts exist.

### Skeins display (BUG-06)
- **D-07:** Widen the Need column percentage in the supply table's `table-layout: fixed` configuration. Current 13% is too narrow for 3-digit skeins + "sk" label + Sparkles icon.
- **D-08:** No number format changes — `calculateSkeins` already uses `Math.ceil` (whole numbers), which is domain-correct (you buy whole skeins).

### Claude's Discretion
- **Designer tab focus (BUG-02):** Fix approach for `SearchableSelect` focus management — tab into the Designer field should immediately allow typing to search. Likely a focus delegation issue in the Popover/Command component chain.
- **Designer thumbnails (BUG-04):** Investigation and fix for wrong/missing chart thumbnails on designer detail pages. Could be a query issue (wrong join, stale data) or thumbnail URL mismatch. Pure debugging.
- Plan structure — grouping of 5 bugs into plans/waves.
- Test strategy for each fix.
- Exact column width percentages for the Need column adjustment.
- Hint text formatting and placement for the stitch count display.

</decisions>

<specifics>
## Specific Ideas

- Designer dialog should match the exact InlineNameDialog pattern used for storage locations (lines 166-169 in chart-merged-form.tsx) — two useState vars, controlled open, and the dialog as a JSX sibling to SearchableSelect.
- Stitch count hint should be non-intrusive — informational only, not suggesting the user should change anything. Partial sums are expected and normal for large charts.
- Skeins: the 1.3 formula constant was previously validated against community calculators. No formula changes needed — just display width.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — BUG-01 through BUG-06 definitions
- `.planning/ROADMAP.md` §Phase 27 — Success criteria (5 items) and UI hint

### Designer Inline Create (BUG-01, BUG-02)
- `src/components/features/charts/chart-merged-form.tsx` — Main form component, SearchableSelect wiring (line 466), existing inline dialog patterns (lines 166-169, 567-580)
- `src/components/features/charts/inline-designer-dialog.tsx` — Existing dialog component (unused, needs wiring)
- `src/components/features/charts/use-chart-form.ts` — `handleAddDesigner` handler (line 325)
- `src/components/features/charts/form-primitives/searchable-select.tsx` — SearchableSelect with `onAddNew` callback and Popover focus management

### Designer Thumbnails (BUG-04)
- `src/components/features/designers/designer-detail.tsx` — Thumbnail rendering (line 305), uses `chart.coverThumbnailUrl`
- `src/app/(dashboard)/designers/[id]/page.tsx` — Designer detail page route

### Stitch Count (BUG-05)
- `src/components/features/charts/form-primitives/stitch-count-fields.tsx` — Stitch count input fields
- `src/lib/utils/skein-calculator.ts` — `getEffectiveStitchCount` with two-tier fallback
- `src/components/features/supply-table/supply-table.tsx` — Supply rows with per-colour stitchCount

### Skeins Display (BUG-06)
- `src/components/features/supply-table/supply-table.tsx` — Table column widths (Need at 13%)
- `src/components/features/supply-table/supply-table-data-row.tsx` — Need column rendering with "sk" label + Sparkles icon
- `src/lib/utils/skein-calculator.ts` — `calculateSkeins` with Math.ceil (line ~30)
- `src/components/features/charts/form-primitives/calculator-card.tsx` — Skein calculator card UI

### Conventions
- `.claude/rules/base-ui-patterns.md` — Semantic tokens, button/link patterns
- `.claude/rules/component-implementation.md` — Component implementation rules
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests

### Design Reference
- `product-plan/sections/supply-tracking-and-shopping/` — Supply table designs
- `product-plan/sections/project-management/` — Chart form designs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `InlineDesignerDialog` from `src/components/features/charts/inline-designer-dialog.tsx` — Already built, supports name + website + error + pending state. Just needs wiring.
- `InlineNameDialog` pattern (storage/stitching apps) — Reference implementation for the controlled-dialog wiring in chart-merged-form.tsx.
- `calculateSkeins` from `src/lib/utils/skein-calculator.ts` — Already uses Math.ceil. No changes needed.
- `getEffectiveStitchCount` from `src/lib/utils/skein-calculator.ts` — Two-tier fallback (explicit > width×height). Supply hint would be a companion display, not a third tier.
- `cn()` utility — Tailwind class merging.

### Established Patterns
- **Inline entity creation:** Controlled dialog with `useState` for open + initial value, dialog as JSX sibling, handler calls server action and auto-selects result. Used for storage locations and stitching apps.
- **Supply table column widths:** Fixed `table-layout` with percentage-based columns. `tabular-nums` on numeric cells.
- **TDD mandatory:** Tests before implementation.
- **Colocated tests:** `foo.test.tsx` next to `foo.tsx`.

### Integration Points
- `SearchableSelect.onAddNew` callback — entry point for designer creation. Currently calls handler directly; needs to open dialog instead.
- `chart-merged-form.tsx` mode switching — form mode vs supply mode. Stitch count hint needs to bridge this boundary.
- `supply-table.tsx` column configuration — Need column width affects all supply table instances (chart form + project detail).
- `designer-detail.tsx` chart list — thumbnail rendering. Fix here affects only the designer detail page.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 27-chart-form-fixes*
*Context gathered: 2026-05-21*
