# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP -- "Replace Notion"** -- Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** -- Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** -- Phases 8-9.1 (shipped 2026-04-20)
- 🚧 **v1.3 Form & Supply Overhaul** -- Phases 10-14 (in progress)
- 📋 **v1.4 Motivation & Planning** -- Phases TBD (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) -- SHIPPED 2026-04-11</summary>

- [x] Phase 1: Foundation & Infrastructure (3/3 plans) -- completed 2026-03-28
- [x] Phase 2: Core Project Management (5/5 plans) -- completed 2026-04-06
- [x] Phase 3: Designer & Genre Pages (5/5 plans) -- completed 2026-04-08
- [x] Phase 4: Supplies & Fabric (10/10 plans) -- completed 2026-04-10

Full details: `milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Browse & Organize (Phases 5-7) -- SHIPPED 2026-04-16</summary>

- [x] Phase 5: Foundation & Quick Wins (8/8 plans) -- completed 2026-04-13
- [x] Phase 6: Gallery Cards & View Modes (4/4 plans) -- completed 2026-04-15
- [x] Phase 7: Project Detail Experience (8/8 plans) -- completed 2026-04-16

Full details: `milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Track & Measure (Phases 8-9.1) -- SHIPPED 2026-04-20</summary>

- [x] Phase 8: Session Logging & Pattern Dive (11/11 plans) -- completed 2026-04-18
- [x] Phase 9: Dashboards & Shopping Cart (9/9 plans) -- completed 2026-04-18
- [x] Phase 9.1: Image Optimization on Upload (2/2 plans) -- completed 2026-04-26

Full details: `milestones/v1.2-ROADMAP.md`

</details>

### 🚧 v1.3 Form & Supply Overhaul (In Progress)

**Milestone Goal:** Replace the chart creation/edit form and supply-adding experience with a fast, keyboard-driven single-page flow. Unified supply table with grouped sections, persistent add row, and portal autocomplete. Merged form with supply takeover mode. Reusable on project detail.

- [x] **Phase 10: Unified Supply Table** - Shared supply table component with grouped sections, persistent add row, keyboard-first entry, portal autocomplete, SVG donuts, and inline editing (completed 2026-05-04)
- [x] **Phase 11: Supply Table on Project Detail** - Wire unified table into project detail Supplies tab with server-action persistence (completed 2026-05-11)
- [x] **Phase 12: Merged Form** - Single-page chart+project creation form with pattern type cards, required dot indicators, sticky save bar, and digital working copy upload (completed 2026-05-11)
- [ ] **Phase 13: Supply Takeover** - Form-to-supply transition with sticky summary bar, fabric assignment, skein calculator card, and two-phase save
- [ ] **Phase 14: Edit Mode & Cleanup** - Full-page edit route using merged form layout, removal of all deprecated components

### 📋 v1.4 Motivation & Planning (Planned)

- [ ] **Phase 15: Advanced Stats** - Year in Review, monthly charts, stitching calendar
- [ ] **Phase 16: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

### Phase 10: Unified Supply Table
**Goal**: Users can view and add supplies in a fast, keyboard-driven table with grouped sections and proportional status indicators
**Depends on**: Nothing (first phase of v1.3 -- foundational component)
**Requirements**: SUPTBL-01, SUPTBL-02, SUPTBL-03, SUPTBL-04, SUPENT-01, SUPENT-02, SUPENT-03, SUPENT-04
**Success Criteria** (what must be TRUE):
  1. User sees supplies organized in Thread, Beads, and Specialty sections with divider headers showing per-section counts
  2. User can type a supply code in the persistent add row, see portal autocomplete results (with already-added items disabled), select via keyboard, fill quantity, and commit with Enter -- repeating without re-selecting supply type
  3. User sees thread need auto-calculated from stitch count with a visual indicator, and can override any need/have/stitches value by clicking the cell inline
  4. User sees proportional SVG donut rings on each row showing have/need ratio
  5. User can delete a supply row via a hover-revealed button without a confirmation modal
**Plans**: 6 plans
Plans:
- [x] 10-01-PLAN.md -- Types, adapter interface, StatusDonut, EditableNumber
- [x] 10-02-PLAN.md -- PortalAutocomplete, SegmentedTypeToggle, InlineCreateDialog
- [x] 10-03-PLAN.md -- DataRow, SectionDivider, Footer, slideIn animation
- [x] 10-04-PLAN.md -- useSupplyTable hook, SupplyTableAddRow
- [x] 10-05-PLAN.md -- Root SupplyTable assembly, index.ts exports
- [x] 10-06-PLAN.md -- Verification suite and visual checkpoint
**UI hint**: yes

### Phase 11: Supply Table on Project Detail
**Goal**: Users can manage supplies on an existing project's detail page using the same unified table -- view and add in one surface
**Depends on**: Phase 10
**Requirements**: DETAIL-01, DETAIL-02
**Success Criteria** (what must be TRUE):
  1. User sees the unified supply table (grouped sections, donuts, inline editing) on the project detail Supplies tab, replacing the old supply section
  2. User can add missed supplies via the persistent add row on project detail without navigating away, with changes persisted immediately via server actions
**Plans**: 2 plans
Plans:
**Wave 1**
- [x] 11-01-PLAN.md -- ServerActionAdapter foundation (Result type extension, adapter class, tests, barrel export)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 11-02-PLAN.md -- Animation wiring + SuppliesTab integration (newRowId chain, tab replacement, visual checkpoint)
**UI hint**: yes

### Phase 12: Merged Form
**Goal**: Users can create a chart+project through a single continuous page with clear field grouping and a polished form experience
**Depends on**: Nothing (independent of Phases 10-11; composes with Phase 13)
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05
**Success Criteria** (what must be TRUE):
  1. User fills out chart+project fields on a single scrolling page (720px max-width) with field groups separated by dividers -- no chart/project split
  2. User selects pattern type via a 2x2 card grid and sees relevant sub-fields expand based on selection
  3. User sees green dot indicators on required fields (Chart Name, Status) and a sticky save bar at the bottom with Save Draft and Create buttons
  4. User can upload a digital working copy in the Workflow section of the form
**Plans**: 3 plans
Plans:
**Wave 1** *(parallel)*
- [x] 12-01-PLAN.md -- PatternTypeCards, StickySaveBar, FormField green dot, GenrePicker font-medium
- [x] 12-02-PLAN.md -- Draft persistence utility (saveDraft, loadDraft, clearDraft)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 12-03-PLAN.md -- ChartMergedForm shell assembly, page wiring, visual checkpoint
**UI hint**: yes

### Phase 13: Supply Takeover
**Goal**: Users can transition from form entry into a dedicated supply-adding mode that fills the page, with fabric assignment feeding the skein calculator
**Depends on**: Phase 10, Phase 12
**Requirements**: TAKE-01, TAKE-02, TAKE-03, TAKE-04
**Success Criteria** (what must be TRUE):
  1. User reaches the milestone marker in the form and transitions to supply mode -- the form collapses to a sticky summary bar and the supply table fills the page
  2. User can return to form details via a "Details" link in the summary bar with all form state preserved (no data loss)
  3. User can optionally assign fabric as the first step in supply takeover, which auto-populates the skein calculator's fabric count default
  4. User can configure skein calculation parameters (Strands Over, Fabric Count, Waste %) via a styled card with segmented controls in the supply area
**Plans**: TBD
**UI hint**: yes

### Phase 14: Edit Mode & Cleanup
**Goal**: Users can edit existing charts/projects through the same merged form layout, and all deprecated components are removed
**Depends on**: Phase 12, Phase 13
**Requirements**: EDIT-01, EDIT-02, CLEAN-01
**Success Criteria** (what must be TRUE):
  1. User edits an existing chart/project via a full-page merged form (same layout as creation) -- not a modal
  2. User can navigate to the edit form from the project detail page and from the gallery card kebab menu
  3. Old chart form, old supply tab, old supply row components, and the edit modal are fully removed from the codebase
**Plans**: TBD
**UI hint**: yes

## Execution Order

- v1.0: 1 -> 2 -> 3 -> 4
- v1.1: 5 -> 6 -> 7
- v1.2: 8 -> 9 -> 9.1
- v1.3: 10 -> 11 -> 12 -> 13 -> 14

Note: Phase 12 (Merged Form) has no dependency on Phases 10-11 and could theoretically execute in parallel, but is sequenced after Phase 11 to keep a single execution stream. Phase 13 requires both Phase 10 and Phase 12.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Core Project Management | v1.0 | 5/5 | Complete | 2026-04-06 |
| 3. Designer & Genre Pages | v1.0 | 5/5 | Complete | 2026-04-08 |
| 4. Supplies & Fabric | v1.0 | 10/10 | Complete | 2026-04-10 |
| 5. Foundation & Quick Wins | v1.1 | 8/8 | Complete | 2026-04-13 |
| 6. Gallery Cards & View Modes | v1.1 | 4/4 | Complete | 2026-04-15 |
| 7. Project Detail Experience | v1.1 | 8/8 | Complete | 2026-04-16 |
| 8. Session Logging & Pattern Dive | v1.2 | 11/11 | Complete | 2026-04-18 |
| 9. Dashboards & Shopping Cart | v1.2 | 9/9 | Complete | 2026-04-18 |
| 9.1. Image Optimization on Upload | v1.2 | 2/2 | Complete | 2026-04-26 |
| 10. Unified Supply Table | v1.3 | 6/6 | Complete    | 2026-05-04 |
| 11. Supply Table on Project Detail | v1.3 | 2/2 | Complete    | 2026-05-11 |
| 12. Merged Form | v1.3 | 3/3 | Complete   | 2026-05-11 |
| 13. Supply Takeover | v1.3 | 0/? | Not started | - |
| 14. Edit Mode & Cleanup | v1.3 | 0/? | Not started | - |
