# Phase 10: Unified Supply Table - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a shared supply table component with grouped sections (Thread/Beads/Specialty), persistent add row with segmented type toggle, keyboard-first entry flow, portal autocomplete, SVG donut status indicators, and inline editing. This component will be reused in Phase 11 (project detail Supplies tab) and Phase 13 (supply takeover during creation).

</domain>

<decisions>
## Implementation Decisions

### Supply search autocomplete
- **D-01:** Portal autocomplete with `position: fixed` + `getBoundingClientRect()` for coordinates — escapes table stacking context
- **D-02:** Include inline create ("+ Create X") that appears only when zero results match and search text exists — handles non-seeded supplies (Weeks Dye Works, Mill Hill, etc.) without navigating away
- **D-03:** After inline create dialog completes, auto-add the newly created supply and refocus the search input — keeps transcription flow unbroken
- **D-04:** No color family filter — this is a transcription tool, not a browsing tool. The user always has the code from the pattern. Color browsing belongs in a future supply exploration surface
- **D-05:** Already-added items shown as disabled with "Added" label in the autocomplete dropdown

### Auto-calc and skein calculator integration
- **D-06:** Component accepts optional `calcParams` prop (Partial<CalcParams>) with sensible defaults: fabricCount=14, strandCount=2, overCount=1, wastePercent=20
- **D-07:** Use the real `calculateSkeins()` function from `src/lib/utils/skein-calculator.ts` — do NOT implement the sketch's "÷3000" shorthand as a separate code path
- **D-08:** Phase 11 will pass `fabricCount` from the project's assigned fabric. Phase 13 will add the full calculator card UI. The prop boundary is the clean seam between phases

### Build strategy
- **D-09:** Hybrid build — new `supply-table/` directory with fresh components, import existing primitives (`EditableNumber`, `ColorSwatch`) from their current locations
- **D-10:** Do NOT touch existing supply components (`project-supplies-tab.tsx`, `SearchToAdd`, `supply-grid-view`, `supply-table-view`) — they remain live until Phase 14 cleanup
- **D-11:** `needsBorder` helper may be duplicated one more time in the new component — acceptable debt cleaned in Phase 14

### Claude's Discretion
- Component file structure within `supply-table/`
- Test strategy and mocking approach for the adapter pattern
- SVG donut implementation details (the visual spec is locked by sketches)
- Loading/empty states
- Exact keyboard navigation implementation
- Error handling for failed server actions (relevant when wired in Phase 11)

</decisions>

<specifics>
## Specific Ideas

- Keyboard flow modeled after Google Sheets cell entry and QuickBooks invoice line items — fast, repetitive, minimal mouse
- Segmented type toggle (🧵/📿/✦) stays sticky between adds — blast through all threads, then switch to beads once
- Auto-calc indicated with primary colour text (sparkle badge in sketches)
- Delete buttons hidden by default, revealed on row hover, danger-red on hover
- New rows animate in with slideIn (opacity 0→1, translateY -6px→0, 0.2s ease)
- Table uses `table-layout: fixed` with specific column width percentages from sketches
- Footer with running totals ("N colours added" / "Total: N skeins needed")
- Keyboard hint bar at bottom

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec (primary)
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` — Complete visual design, CSS patterns, HTML structures, column widths, interaction flow, and rejected alternatives
- `.claude/skills/sketch-findings-cross-stitch-tracker/SKILL.md` — Design direction summary and multi-supply-type decisions (Sketch 004)

### Requirements
- `.planning/REQUIREMENTS.md` — SUPTBL-01 through SUPTBL-04, SUPENT-01 through SUPENT-04 (8 requirements mapped to Phase 10)

### Existing code to reuse
- `src/lib/utils/skein-calculator.ts` — `calculateSkeins()` function with full formula and tests
- `src/components/features/supplies/color-swatch.tsx` — Thread colour display with border detection
- `src/components/features/charts/project-supplies-tab.tsx` — `EditableNumber` component pattern (lines ~35-70) and `needsBorder` helper
- `src/types/supply.ts` — `ProjectThreadWithThread`, `ProjectBeadWithBead`, `ProjectSpecialtyWithItem` types and `COLOR_FAMILIES`
- `src/lib/validations/supply.ts` — Existing Zod schemas for supply validation
- `src/lib/actions/supply-actions.ts` — Existing server actions for supply CRUD (used by Phase 11's adapter, not Phase 10 directly)

### Architecture context
- `.planning/STATE.md` §Accumulated Context — SupplyTableAdapter interface, PortalAutocomplete strategy, two-phase save pattern, zero new dependencies constraint

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EditableNumber` (in `project-supplies-tab.tsx`): Click-to-edit number cells with focus/blur/Enter handling — import directly
- `ColorSwatch` (in `supplies/color-swatch.tsx`): 16x16 colour square with light-colour border detection — already has 6 importers
- `calculateSkeins()` (in `utils/skein-calculator.ts`): Full skein calculator with tests — call directly with calcParams
- `needsBorder()` helper: Luminance check for near-white colour swatches — exists in 3 locations, can duplicate once more

### Established Patterns
- Server Components by default, "use client" only for interactivity — the supply table will be a client component (keyboard handlers, state management)
- Three junction tables for supplies: `ProjectThread`, `ProjectBead`, `ProjectSpecialty` — component receives these as typed props
- `sonner` toast for success/error feedback
- `lucide-react` for icons (Check, Trash2, Plus, etc. already imported in supply components)

### Integration Points
- Phase 11 will replace the project detail Supplies tab with the unified table + server-action adapter
- Phase 13 will embed the table in the supply takeover area with local-state adapter + skein calculator card
- The SupplyTableAdapter interface (from research) provides the abstraction layer between these contexts

</code_context>

<deferred>
## Deferred Ideas

- Color family browsing for supply exploration — future supply detail surface (backlog 999.1)
- `needsBorder` consolidation to a single canonical location — Phase 14 cleanup removes the old copies

</deferred>

---

*Phase: 10-unified-supply-table*
*Context gathered: 2026-05-03*
