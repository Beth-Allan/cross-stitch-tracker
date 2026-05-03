# Research Summary: v1.3 Form & Supply Overhaul

**Project:** Cross-Stitch Tracker — Milestone 4
**Domain:** Form architecture overhaul, unified supply table, keyboard-first data entry
**Researched:** 2026-05-03
**Confidence:** HIGH

## Executive Summary

v1.3 is a component architecture overhaul, not a backend or data model overhaul. The core challenge is replacing two disconnected experiences (chart creation form + supplies tab) with a single unified flow: a merged form that transitions into a supply table without losing state. Zero new npm dependencies are needed — every capability (portal autocomplete, state preservation, SVG progress indicators) is already available in the installed stack (`@base-ui/react` Combobox, React 19 `<Activity>`, inline SVG).

The highest-risk areas are the form/supply-takeover state transition and keyboard navigation in the heterogeneous table. Both require architectural decisions before UI code is written.

## Stack Additions

**Zero new dependencies.** The installed stack handles every v1.3 requirement:

- **Base UI Combobox** (`@base-ui/react` 1.4.1, installed): `Combobox.Portal` + `Combobox.Positioner` escape table stacking context — replaces hand-rolled portal in SearchToAdd
- **React Activity** (`react` 19.2.5, installed): `<Activity mode="visible"|"hidden">` preserves form state during takeover mode without unmounting
- **Inline SVG**: 16x16px donuts using `stroke-dasharray`/`stroke-dashoffset` — 8 lines of code, no library needed
- **Existing `useChartForm` hook** (~393 lines): extend with supply accumulator, not replace
- **Existing `calculateSkeins()` utility**: reuse directly for live auto-calc in add row

**What NOT to add:** react-hook-form, TanStack Table, react-circular-progressbar, any virtualization library.

**Minor schema additions:** `isNeedOverridden` on `ProjectBead`/`ProjectSpecialty` for consistency with `ProjectThread`.

## Feature Table Stakes vs Differentiators

### Table Stakes (must have)
- Single-page merged form for chart+project creation and editing
- Required field indicators (green dot)
- Sticky save bar with action buttons
- Keyboard-first supply entry: Tab/Enter/Escape flow, portal autocomplete
- Already-added items disabled in autocomplete
- Inline editable cells (stitches, need, have)
- SVG donut status indicators (proportional have/need)
- Delete supply with hover-reveal button
- Supply count footer with per-section totals

### Differentiators (unique value)
- **Supply takeover mode**: form collapses to sticky summary bar, table fills page, React Activity preserves state
- **Segmented type toggle**: sticky between adds — blast through 30+ codes without re-selecting type
- **Auto-calculated skein need**: live inline calculation with primary-color auto indicator
- **Fabric assignment feeding calculator**: optional, skippable, auto-populates fabric count
- **Grouped sections**: three supply types in one table with divider headers + count badges
- **Persistent add row**: zero clicks to start adding
- **Pattern type cards**: 2x2 grid with expandable sub-fields

### Anti-Features (explicitly avoid)
- Drag-and-drop row reordering
- Auto-save (explicit save action via sticky bar)
- "Have" quantity in the add row (separate shopping workflow)
- Tabs for supply types (all types visible in one surface)
- Progressive reveal / step indicators

## Architecture Approach

The overhaul centers on one new abstraction: **UnifiedSupplyTable** — a dual-mode table component with a supply adapter interface. In local mode (creation flow), it accumulates supplies in React state and batches them on form submit. In persisted mode (project detail), it calls server actions on each mutation.

**Key architectural decisions:**
- **CSS visibility toggle** (not conditional rendering) for form/supply-takeover transition — preserves `useChartForm` state
- **SupplyTableAdapter interface**: server-action adapter vs. local-state adapter — defined before any table UI is built
- **Two-phase save on create**: `createChart` first, then `batchAddSuppliesToProject` in one `$transaction`
- **PortalAutocomplete extraction** from existing `SearchToAdd` — decoupled from server actions

**Deprecated after milestone:** `chart-add-form.tsx`, `project-supplies-tab.tsx`, `project-detail/supply-section.tsx`, `project-detail/supply-row.tsx`, `project-detail/supply-footer-totals.tsx`.

## Critical Pitfalls

1. **Form state destroyed during takeover (HIGH)** — Conditional rendering unmounts the form. Use CSS visibility toggle or React Activity so form never unmounts.
2. **Supply table data contract mismatch (HIGH)** — Existing supply system requires `projectId`; during creation, none exists. Design adapter interface before writing table UI.
3. **Keyboard trap in heterogeneous table (HIGH)** — Mixed row types + autocomplete capturing arrow keys. Implement roving tabindex from the start with separate keyboard contexts.
4. **Portal autocomplete detaches on scroll (LOW)** — `position: fixed` dropdown doesn't reposition. Close dropdown on scroll.
5. **Dual-mode form initialization (LOW)** — `useState` doesn't reinitialize on prop change. Add `key={chartId ?? "new"}`.

## Suggested Build Order

**Phase 1: Unified Supply Table Foundation** — Build the shared component and adapter interface before anything depends on it. StatusDonut, SupplyDataRow, PortalAutocomplete, useSupplyTable keyboard hook.

**Phase 2: Supply Table on Project Detail** — Wire into existing project detail (persisted mode). Validates with real server data before complex creation flow.

**Phase 3: Merged Form Details View** — Regroup existing section components with HR dividers. PatternTypeCards, MilestoneMarker, StickyFormBar, RequiredDot.

**Phase 4: Supply Takeover + Creation Flow** — CSS visibility toggle, SummaryBar, SkeinCalculatorCard, fabric assignment, batchAddSuppliesToProject.

**Phase 5: Edit Mode + Cleanup** — Full-page edit route using MergedForm, remove all deprecated components.

**Rationale:** Table first because everything composes it. Project detail before creation because persisted mode is simpler. Form before takeover because form must exist before the transition is wired. Edit + cleanup last because existing modal works as fallback.

## Open Questions for Planning

- Fabric cascade behavior: when fabric changes after manual override of `fabricCount` in calculator, overwrite or preserve?
- `beadCount` on `ProjectBead`: add now for future auto-calc (low cost) or defer?
- Edit mode: full-page route or modal remains as lightweight quick-edit option?

---
*Research completed: 2026-05-03*
*Ready for requirements: yes*
