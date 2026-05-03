# Feature Landscape

**Domain:** Form & supply table overhaul for a cross-stitch project management app
**Researched:** 2026-05-03
**Confidence:** HIGH (validated sketch findings + UX pattern research + existing codebase analysis)

## Comparable Patterns Studied

| Reference App / Pattern | Type | Key Insight |
|------------------------|------|-------------|
| QuickBooks invoice line items | Accounting SaaS | Persistent add row, autocomplete on item name fills description/rate, Tab to move between cells, sticky item type between adds |
| Google Sheets cell entry | Spreadsheet | Type-ahead autocomplete from column values, Enter commits and moves down, Tab moves right, Escape cancels, all fields always visible |
| Jira backlog grid | Project management | Inline editing on click, keyboard navigation between rows, grouped sections (epics), different row layouts per context |
| AG Grid / TanStack Table | Data grid libraries | Grouped row display with collapsible sections, different column renderers per row type, keyboard cell navigation with arrow keys |
| Airtable record detail | Database UI | Collapsible field groups, tab navigation for sections, inline editing with save-on-blur, linked record search with autocomplete |
| Harvest time entry | Time tracking | Persistent add row with live running total, auto-save, Tab navigation between entry fields |
| StashCache (cross-stitch) | Craft supply tracking | Input materials list, auto-checks stash for what's missing, kitted status from supply completeness |
| Cross Stitch Journal | Craft project tracker | Stage-based project tracking (Wishlist through Finished), supply tracking, goal setting |
| X-Stitch Plus | Craft stash manager | Thread/fabric/chart inventory, shopping list generation, per-project material lists |
| Thread-bare skein calculator | Cross-stitch tool | Stitches-per-skein formula incorporating fabric count, strand count, over count |

---

## Table Stakes

Features users expect in a form + supply table overhaul. Missing any = the product feels incomplete or regressed.

| Feature | Why Expected | Complexity | Depends On | Notes |
|---------|-------------|------------|------------|-------|
| **Single-page form for chart+project creation** | The current form already works as a scrolling page. Merging the chart/project distinction (which was always artificial -- users think "I'm adding a project") is table stakes for a form overhaul. Notion, Airtable, every project tracker uses one form per entity. | Med | Existing `useChartForm` hook, Chart+Project Prisma models | Replaces current `chart-add-form.tsx` and `chart-edit-modal.tsx`. Must support both create and edit modes. ~50 fields organized into 4 groups with `<hr>` dividers per sketch 003. |
| **Required field indicators** | Users need to know what's mandatory before they start filling in a long form. Green dot indicator (sketch 003 winner) is cleaner than "optional" tags on 40+ fields. Standard UX pattern -- Airtable uses asterisks, Notion uses red dots. | Low | None | Only Chart Name and Status are required. The green dot pattern is validated in sketch 003. |
| **Sticky save bar** | Long forms need persistent save access. Users should never scroll to find the submit button. GitLab Pajamas, SAP Fiori, and Primer all document this pattern. The sketch validated a fixed bottom bar with save-readiness hint. | Low | Form validation state | Fixed bottom bar: save-readiness hint on left ("Chart name entered -- ready to save"), Save Draft + Create buttons on right. Must account for mobile viewport (no overlap with iOS safe area). |
| **Keyboard navigation within supply table** | Tab between cells, Enter to commit row, Escape to cancel -- this is what every spreadsheet and accounting app does. QuickBooks, Google Sheets, Harvest all use this flow. Users transcribing from a pattern will enter 30+ thread codes in one sitting; mouse-only entry is a dealbreaker. | Med-High | Supply table component, focus management | Flow: type code -> autocomplete -> Enter to select -> stitches field auto-focuses -> Enter to add (fast path) or Tab to override need -> Enter to add -> search refocuses. Escape resets add row at any point. |
| **Autocomplete for supply search** | Pre-seeded DMC catalog (495 threads) demands search-and-select, not manual entry. This is the existing app's core advantage over Notion. Every comparable app with a catalog (QuickBooks items, Airtable linked records) uses autocomplete. The W3C ARIA combobox pattern defines the keyboard contract. | Med | DMC thread catalog, Bead/Specialty catalogs, ARIA combobox role | Must implement `role="combobox"` with `aria-activedescendant`, `aria-expanded`, `aria-autocomplete="list"`. Portal rendering (`position: fixed`) to escape table stacking context -- validated in sketch 002. |
| **Already-added items shown as disabled in autocomplete** | Preventing duplicates is table stakes for any search-to-add pattern. QuickBooks grays out already-invoiced items. The existing `SearchToAdd` component does this. | Low | Existing pattern in `search-to-add.tsx` | Show "Added" badge on items already in the table. Filter or gray out -- not remove -- so users can see them and understand why a code doesn't appear. |
| **Inline editable cells in data rows** | Once supplies are added, users need to adjust stitch counts, need quantities, and have quantities without opening a modal. Click-to-edit is standard in Airtable, AG Grid, Material React Table. The existing `EditableNumber` component proves the pattern works. | Med | Existing `EditableNumber` component pattern | Click cell to enter edit mode, Enter/blur to save, Escape to cancel. Auto-select content on focus so typing replaces. Save via server action with optimistic update. |
| **SVG donut status indicators** | Proportional have/need visualization is superior to binary checkmarks. The sketch validated 16x16 SVG donuts using `stroke-dasharray`/`stroke-dashoffset`. Three states: empty ring (0 have), partial amber ring, full green ring. Hover tooltip shows "X of Y". | Low | `quantityRequired` and `quantityAcquired` fields on junction tables | Pure SVG, no library needed. The formula is: `dashoffset = circumference * (1 - have/need)`. Already designed in sketch 002. Replaces current simple icons. |
| **Delete supply with confirmation** | Users will make mistakes during bulk entry. Row-level delete with hover-reveal button (danger red) is standard. The existing supplies tab already has this pattern. | Low | Existing `removeProjectThread/Bead/Specialty` server actions | Hover-reveal on row, danger-red on hover. No modal confirmation for individual rows -- too slow for bulk editing. Consider undo toast instead. |
| **Supply count footer** | Running totals ("N colours added / Total: N skeins needed") anchor the user's progress during bulk entry. QuickBooks shows invoice totals, Harvest shows time totals. Every table-entry UI needs a summary row. | Low | Computed from table data | Footer outside `<tbody>`. Recalculates on every add/edit/delete. Shows count per section + grand total. |

---

## Differentiators

Features that elevate this beyond a basic form + table. Not universally expected, but validated through sketches and high value for this specific user's workflow.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| **Supply takeover mode** | No comparable craft app transitions from form to supply table within the same page. The sketch-validated pattern: form collapses into a sticky summary bar, supply table fills the page. This keeps the user in flow rather than forcing navigation to a separate page. Closest analog: QuickBooks switching from customer details to line items on the same invoice. | Med-High | Form state management, form collapse animation, summary bar component | Milestone marker triggers transition. Summary bar shows "Project Name / Designer / Status / Stitches" with "Back to Details" link. Supply table mounts below. Sticky save bar persists through transition. Form state preserved in memory during takeover. |
| **Segmented type toggle (sticky between adds)** | Instead of separate "Add Thread" / "Add Bead" / "Add Specialty" buttons (forcing a choice per item), one persistent add row with a 3-way segmented toggle. Toggle stays on last-used type between adds. This matches how stitchers transcribe: all threads first, then switch to beads. No comparable craft app has this. QuickBooks has item type selection but resets per line. | Med | Supply table add row, segmented control component | Three options with emoji icons. Active state is primary-colored. Stays sticky across adds. Field adaptation: Thread shows stitches + auto-calc need; Bead shows bead count + manual need (pkg); Specialty shows just need (item). |
| **Auto-calculated skein need from stitches** | Entering stitch count and getting auto-filled skein need is the "wow" moment. Thread-bare and other calculators require navigating to a separate tool. Having it inline in the add row, with visual indication (primary color text + sparkle badge), makes the table smarter than a spreadsheet. | Med | Existing `calculateSkeins()` utility, fabric assignment for defaults | Live calculation as user types stitch count. Formula: `stitches * strands / (effectiveCount * 255) * wasteFactor`. Primary color text indicates auto-calc. If user manually edits, `isNeedOverridden` flag set, auto-calc badge disappears. Need defaults to 1 when no stitches entered. |
| **Fabric assignment feeding skein calculator** | Linking fabric (with its `count` field) to a project in supply takeover mode auto-populates the skein calculator's fabricCount and infers overCount (count <= 25 -> over 1, count >= 28 -> over 2). This eliminates a manual configuration step that most users would forget or get wrong. No comparable app connects fabric to calculation defaults. | Med | Existing Fabric model with `count` field, `calculateSkeins()`, skein calculator settings panel | Fabric selector in supply takeover area. On selection, fabricCount + overCount auto-set. User can still override via calculator settings panel. Backlog item 999.14 already captured this need. |
| **Grouped sections with different column schemas** | Thread/Bead/Specialty items in one table surface with section dividers, but columns adapt per type (Thread has Stitches column, Bead has Bead Count, Specialty has neither). No standard data grid library handles this natively -- it requires custom rendering per section. The unified view prevents the "which tab am I on?" confusion of tabbed supply types. | High | Custom table rendering, section divider components | Section dividers as `<tr>` elements with icon + label + count badge. Colspan for divider rows. Column adaptation means Stitches/arrow columns show `--` or are blank for non-thread types. The add row dynamically shows/hides fields based on selected type. |
| **Persistent add row at table top** | Most table UIs use a modal or slide-out panel for adding rows. A persistent first row (visually distinguished with green tint + bottom border) means zero clicks to start adding. Google Sheets is the closest analog -- the next empty row is always ready. For bulk transcription of 30+ supply codes, this saves significant time vs. click-to-open patterns. | Med | Table layout, add row state management, focus orchestration | Visually distinct: faint green background (`rgba(5,150,105,0.03)`), 2px primary bottom border. All input fields always visible. After successful add, fields clear and search refocuses. New item prepends to its correct section with slide-in animation. |
| **Pattern type cards with expandable sub-fields** | Instead of a dropdown for Chart Only / Kit / Digital Only / Subscription, selectable cards in a 2x2 grid. Selecting "Kit" expands to show "Colours in kit" input. This makes pattern type feel like a meaningful choice rather than a buried dropdown. Closest analog: Stripe's payment method selection cards. | Low-Med | Form state, CSS max-height transition | Cards with radio-style check circle. Selected state: primary border + subtle green background. Expand animation via `max-height` + `opacity` transition (validated in sketch 003 CSS). |
| **Keyboard hints bar** | A subtle bar below the supply table showing available keyboard shortcuts ("Arrow Up/Down navigate, Enter select/add, Tab next field, Esc clear"). Power users discover shortcuts; this accelerates that discovery. Figma and VS Code show contextual keyboard hints. | Low | None | Static presentational component. Could auto-hide after N uses (localStorage counter). Helps bridge the gap between mouse-first and keyboard-first users. |
| **New-row slide-in animation** | Newly added supply rows animate in with a subtle slide-down + fade (`translateY(-6px)` to `0`, 200ms). This provides visual confirmation that the add succeeded and shows where the item landed in the grouped sections. Adds polish that distinguishes from spreadsheet-level UX. | Low | CSS `@keyframes` animation | Applied via `.data-row` class. 200ms ease timing. Prepend to section means animation is visible at the section boundary, not the table top. |
| **Reusable supply table on project detail** | The same supply table component used in the form's takeover mode can be reused on the existing project detail Supplies tab. Currently that tab uses a different `project-supplies-tab.tsx` with its own `EditableNumber` and `SearchToAdd` integration. Unifying means one component to maintain, consistent UX across contexts. | Med | Supply table component abstraction | Must work in two contexts: (1) supply takeover during creation (no saved project yet, optimistic state), (2) project detail tab (existing project, server actions for persistence). Abstract via props: `projectId` (optional for create mode), `onSupplyChange` callback. |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full data grid library (AG Grid, TanStack Table)** | The supply table has 3 supply types with different column schemas per section, a persistent add row, and inline autocomplete -- none of which standard grid libraries handle well. AG Grid is 300kb+ gzipped. TanStack Table is headless but its grouping model assumes uniform column schemas. Building custom with `<table>` + focused components is simpler and lighter for this specific use case. | Custom `<table>` with fixed layout, semantic HTML, and focused client components for editable cells and autocomplete. Match the sketch CSS patterns exactly. |
| **Drag-and-drop row reordering** | Supply order doesn't matter semantically -- items auto-sort into sections by type. Adding dnd-kit for visual reordering adds complexity without value. The insertion-order within sections is sufficient. | Items sort by creation date within their section. No manual ordering needed. |
| **Multi-column sort/filter on supply table** | The supply table is for transcription and management, not analysis. During entry of 30 threads, sorting/filtering breaks the mental model of "I'm going through the pattern's thread list." | Static sort (newest first within sections). The table is small enough (typically <100 rows) that visual scanning suffices. If scaling becomes an issue, address in backlog item 999.11. |
| **Auto-save / draft persistence to server** | The form overhaul is a create/edit flow, not a document editor. Auto-save adds complexity (debouncing, conflict resolution, partial state in DB). The sticky save bar with explicit Save Draft + Create buttons is clearer. | Explicit save only. Consider `beforeunload` warning for unsaved changes (already exists in current form via `isDirty` check). localStorage draft could be a future enhancement but is not table stakes. |
| **Supply quantity stepper in add flow** | The add row is for transcription: code + stitches + need. "Have" quantities are a separate shopping workflow (backlog wisdom from sketch findings: "The add flow is for transcription from pattern. Have quantities are a separate shopping workflow."). Adding a have-quantity field in the add row confuses two workflows. | Have quantities are only editable on existing data rows via inline editing, or via the Shopping Cart. The add row focuses on "what does the pattern call for?" |
| **Inline supply creation in add row** | The existing `SearchToAdd` has an "Add New" flow for creating supplies not in the catalog. Building inline creation inside the compact add row would overcrowd it. | Existing `InlineSupplyCreate` component handles this via a slide-out or modal triggered from "No results found -- Create new?" in the autocomplete dropdown. |
| **Undo/redo stack** | Full undo/redo for table operations (add, edit, delete) requires a state management layer (command pattern, history stack). Significant complexity for an edge case. | Undo toast for deletes (3-second window to reverse). For edits, Escape cancels in-progress changes. For adds, delete the row. |
| **Batch operations (select multiple, bulk delete)** | The table is for per-item transcription. Bulk operations are a different workflow (more relevant for the Shopping Cart). | Single-row delete via hover-reveal button. If user needs to clear all supplies, that's a rare enough operation to do one at a time. |
| **Responsive table layout (card view on mobile)** | The supply table's column density (7 columns) doesn't work on phone screens. But this user stitches on iPad and manages on Mac -- the iPhone use case for bulk supply entry is negligible. | Desktop-optimized fixed-width table. On mobile, the form works fine (720px max-width is responsive). Supply takeover mode is a desktop workflow. The project detail supplies tab (existing) already handles mobile. |

---

## Feature Dependencies

```
Existing ChartAddForm + useChartForm ──────────> Merged single-page form (refactor, not rewrite)
                                                  - BasicInfoSection, StitchCountSection, etc. are reusable
                                                  - useChartForm hook needs mode awareness (create vs edit)

Merged form state ─────────────────────────────> Supply takeover mode
                                                  - Form collapse requires preserving form state
                                                  - Summary bar reads from form values
                                                  - "Back to Details" restores form with values intact

Supply takeover mode ──────────────────────────> Unified supply table (lives inside takeover area)
                                                  - Table needs project context (or pending-project context for create)
                                                  - Fabric assignment panel sits above table

Existing SearchToAdd + InlineSupplyCreate ─────> Autocomplete in add row (port to table context)
                                                  - SearchToAdd logic reusable, UI must adapt to table cell
                                                  - Portal dropdown pattern already validated
                                                  - Already-added filtering exists

Existing calculateSkeins() utility ────────────> Auto-calc need in add row + data rows
                                                  - Formula unchanged
                                                  - Needs calculator settings (strand, fabric, over, waste)

Existing Fabric model + selector ──────────────> Fabric assignment feeding calculator defaults
                                                  - Fabric.count -> fabricCount
                                                  - count inference -> overCount
                                                  - Existing fabric selector can be reused

Existing EditableNumber component ─────────────> Inline editable cells in data rows
                                                  - Pattern proven in project-supplies-tab.tsx
                                                  - May need enhancement for Enter-to-save (currently blur-only)

Existing supply server actions ────────────────> All supply mutations (add/remove/update)
                                                  - addThreadToProject, removeProjectThread, etc. exist
                                                  - updateProjectSupplyQuantity exists
                                                  - May need batch-add action for create mode

Existing project-supplies-tab.tsx ─────────────> Reusable supply table on project detail
                                                  - Currently a different component with similar logic
                                                  - Goal: single component used in both contexts

Schema: isNeedOverridden on ProjectThread ─────> Auto-calc vs manual override distinction
                                                  - Already in schema
                                                  - May need equivalent on ProjectBead/ProjectSpecialty (currently not present, but beads/specialty default to manual)
```

**Critical path:**
1. Merged form (refactor existing sections) -> foundation for everything else
2. Supply table component (new) -> core of the overhaul, most complex piece
3. Supply takeover mode -> connects form to table
4. Fabric assignment + calculator integration -> feeds auto-calc
5. Reuse on project detail -> extracts table component for dual-context use

**Parallel work possible:**
- SVG donut indicators (pure presentational, no dependencies)
- Pattern type cards (form-only, no supply table dependency)
- Keyboard hints bar (pure presentational)

---

## MVP Recommendation

### Must Build (v1.3 core)

1. **Merged single-page form** -- Refactor existing `ChartAddForm` sections into the sketch 003 layout: 4 field groups with `<hr>` dividers, green required dots, pattern type cards. This is the foundation -- the form must work standalone before supply takeover is wired.

2. **Unified supply table with grouped sections** -- The centerpiece of the milestone. Persistent add row with segmented type toggle, section dividers with counts, keyboard-first entry flow, autocomplete from portal dropdown, auto-calc need for threads. This is the highest-complexity feature.

3. **Supply takeover mode** -- The form-to-table transition. Milestone marker, form collapse to summary bar, supply table fills the page. Without this, the form and table are disconnected experiences.

4. **Inline editable cells on data rows** -- Click-to-edit stitch counts, need quantities, have quantities. Without inline editing, the table is view-only after add, which defeats the "spreadsheet feel."

5. **SVG donut status indicators** -- Proportional have/need visualization replacing current icons. Low effort, high visual impact. The CSS/SVG is already designed.

6. **Reusable supply table on project detail** -- Abstract the table component so it works in both create-form and project-detail contexts. Replaces current `project-supplies-tab.tsx` with the new unified component.

### Stretch Goals

7. **Fabric assignment feeding calculator defaults** -- Auto-populates fabricCount and overCount from linked fabric. Medium complexity because fabric selector integration already exists, but wiring to calculator settings requires careful state plumbing.

8. **Skein calculator styled card** -- Replaces current flat settings bar with the sketch-validated card with segmented controls. Visual upgrade, medium effort.

### Defer

- **Sticky save bar save-readiness hint** -- The hint ("Chart name entered -- ready to save") is nice polish but not blocking. Can ship with just the buttons initially and add the hint text in a polish pass.
- **Form edit mode parity** -- The current edit flow uses a modal (`chart-edit-modal.tsx`). Converting edit to the same single-page form is valuable but can follow the create flow.
- **Keyboard hints auto-dismissal** -- The localStorage counter for auto-hiding is a future refinement.

---

## Complexity Assessment

| Feature | Complexity | Why |
|---------|------------|-----|
| Merged form | Med | Refactor of existing sections, not greenfield. Pattern type cards are new. |
| Supply table | High | Custom table with 3 supply types, different column schemas, persistent add row, keyboard orchestration, portal autocomplete, inline editing, optimistic adds. This is the hardest single component in the app. |
| Supply takeover | Med-High | State preservation during form collapse, summary bar rendering from form values, scroll position management, "back" transition restoring form. |
| Keyboard flow | Med-High | Focus management across autocomplete -> input -> input -> commit cycle. Tab/Enter/Escape handling. Edge cases: autocomplete open + Tab should select + advance (not just close). |
| Autocomplete portal | Med | Already validated in sketch, but implementing in a table cell context with proper z-index, scroll handling, and ARIA compliance is nontrivial. |
| Grouped sections | Med | Section divider rows, auto-sorting new items into correct section, different column rendering per section type. |
| Segmented toggle | Low-Med | Standard component, but "sticky between adds" means persisting selected type in component state across add cycles. |
| SVG donuts | Low | Pure math + SVG. Formula validated in sketch. |
| Fabric -> calculator | Med | Wiring fabric selector to calculator settings state, inferring overCount from count, handling "no fabric assigned" default. |
| Reusable table | Med | Abstraction layer: `projectId` optional (create vs edit), callback props for mutations, optimistic state for create mode vs server state for edit mode. |

---

## Sources

- [Pencil & Paper: Data Table UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables) -- Inline editing, expandable rows, confirmation patterns
- [W3C ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) -- Keyboard interaction spec for autocomplete
- [Apple HIG: Segmented Controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls) -- When to use segmented controls, state behavior
- [Mobbin: Segmented Control UI Design](https://mobbin.com/glossary/segmented-control) -- Segmented control best practices and variants
- [GitLab Pajamas: Saving and Feedback](https://design.gitlab.com/usability/saving-and-feedback) -- Save draft vs explicit save patterns, sticky save bar
- [Primer: Saving](https://primer.style/ui-patterns/saving/) -- Explicit vs auto-save form patterns
- [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) -- Form-to-detail transition patterns, collapsible sections
- [Material React Table: Inline Cell Editing](https://www.material-react-table.com/docs/examples/editing-crud-inline-cell) -- Production click-to-edit table implementation
- [CSS-Tricks: Building a Progress Ring](https://css-tricks.com/building-progress-ring-quickly/) -- SVG ring/donut progress technique
- [React Aria: useComboBox](https://react-spectrum.adobe.com/react-aria/useComboBox.html) -- Accessible combobox implementation reference
- [Thread-bare: Skein Estimator](https://www.thread-bare.com/tools/cross-stitch-skein-estimator) -- Skein calculation formula reference
- [Sirious Stitches: Inventory Tracking](https://sirithre.com/inventory-tracking-cross-stitch-patterns-wips-and-materials/) -- How cross-stitchers actually track supplies (Google Sheets, Trello, Airtable)
- [Cross Stitch Journal](https://apps.apple.com/us/app/cross-stitch-journal/id6443886471) -- Competitor: stage-based tracking with supply management
- [X-Stitch Plus](https://apps.apple.com/us/app/xstitch-plus/id1281394467) -- Competitor: thread/fabric/chart inventory with shopping lists
- Sketch findings: `supply-data-entry.md`, `project-creation-form.md` -- Validated design decisions from 4 sketch experiments

---
*Feature research for: Cross-stitch project management -- v1.3 Form & Supply Overhaul*
*Researched: 2026-05-03*
