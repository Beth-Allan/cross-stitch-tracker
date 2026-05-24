# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.6 shipped 2026-05-20 with comprehensive hardening — security fixes, test infrastructure, code quality improvements, shopping cart scaling, and UX polish. 7 milestones shipped (v1.0-v1.6), 26 phases complete.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP -- "Replace Notion"** -- Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** -- Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** -- Phases 8-9.1 (shipped 2026-04-20)
- ✅ **v1.3 Form & Supply Overhaul** -- Phases 10-14 (shipped 2026-05-16)
- ✅ **v1.4 Fixes & Polish** -- Phases 15-17 (shipped 2026-05-17)
- ✅ **v1.5 Statistics & Records** -- Phases 18-21 (shipped 2026-05-18)
- ✅ **v1.6 Cleanup & Hardening** -- Phases 22-26 (shipped 2026-05-20)
- 🚧 **v1.7 Fix & Polish** -- Phases 27-30 (in progress)

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

<details>
<summary>✅ v1.3 Form & Supply Overhaul (Phases 10-14) -- SHIPPED 2026-05-16</summary>

- [x] Phase 10: Unified Supply Table (6/6 plans) -- completed 2026-05-04
- [x] Phase 11: Supply Table on Project Detail (2/2 plans) -- completed 2026-05-11
- [x] Phase 12: Merged Form (3/3 plans) -- completed 2026-05-11
- [x] Phase 13: Supply Takeover (5/5 plans) -- completed 2026-05-16
- [x] Phase 14: Edit Mode & Cleanup (3/3 plans) -- completed 2026-05-16

Full details: `milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v1.4 Fixes & Polish (Phases 15-17) -- SHIPPED 2026-05-17</summary>

- [x] Phase 15: Chart File Management (4/4 plans) -- completed 2026-05-17
- [x] Phase 16: Input & Dashboard Fixes (2/2 plans) -- completed 2026-05-17
- [x] Phase 17: Image Focal Point (3/3 plans) -- completed 2026-05-17

Full details: `milestones/v1.4-ROADMAP.md`

</details>

<details>
<summary>✅ v1.5 Statistics & Records (Phases 18-21) -- SHIPPED 2026-05-18</summary>

- [x] Phase 18: Stats Engine & Charting Foundation (3/3 plans) -- completed 2026-05-17
- [x] Phase 19: Hero Stats & Collection Overview (3/3 plans) -- completed 2026-05-17
- [x] Phase 20: Activity Visualization & Calendar (4/4 plans) -- completed 2026-05-18
- [x] Phase 21: Records, Insights & Celebrations (4/4 plans) -- completed 2026-05-18

Full details: `milestones/v1.5-ROADMAP.md`

</details>

<details>
<summary>✅ v1.6 Cleanup & Hardening (Phases 22-26) -- SHIPPED 2026-05-20</summary>

- [x] Phase 22: Critical Fixes & Test Infrastructure (3/3 plans) -- completed 2026-05-18
- [x] Phase 23: Test Coverage & Reliability (3/3 plans) -- completed 2026-05-18
- [x] Phase 24: Code Quality (4/4 plans) -- completed 2026-05-19
- [x] Phase 25: Shopping Cart Scaling (2/2 plans) -- completed 2026-05-20
- [x] Phase 26: UX Polish (3/3 plans) -- completed 2026-05-20

Full details: `milestones/v1.6-ROADMAP.md`

</details>

### 🚧 v1.7 Fix & Polish (In Progress)

**Milestone Goal:** Fix user-reported bugs, resolve stats issues, and polish UI rough edges across the shipped app.

- [x] **Phase 27: Chart Form Fixes** - Fix designer quick-add, tab focus, thumbnails, stitch count calculation, and skeins display (completed 2026-05-21)
- [x] **Phase 28: Stats Corrections** - Fix records tab population, chart axis values, inline entity names, total stitches stat, and days-in-library formatting (completed 2026-05-24)
- [x] **Phase 29: UI Polish** - Colored status/size pills, digital copy indicator, supply sort fix, skein calc controls on project supplies, file upload improvements (completed 2026-05-24)
- [ ] **Phase 30: Code Quality** - Resolve TypeScript test errors, fix silent failures, clean up R2 photo orphans, centralize status colors, extract shared constants and hooks

## Phase Details

### Phase 27: Chart Form Fixes

**Goal**: Chart creation and editing form works correctly for all input fields and displays accurate data on related pages
**Depends on**: Nothing (first phase of v1.7)
**Requirements**: BUG-01, BUG-02, BUG-04, BUG-05, BUG-06
**Success Criteria** (what must be TRUE):

  1. User can type a new designer name in the Designer field on /charts/new and create it inline without leaving the form
  2. User can tab into the Designer field and immediately type to search existing designers (no extra click needed)
  3. Designer detail pages show the correct chart cover thumbnail for each chart (not wrong/missing images)
  4. Total stitch count on the chart form auto-updates when user changes per-colour stitch counts in supply entry
  5. Auto-calculated skeins value displays fully (not clipped or truncated) in the supply takeover skein calculator card

**Plans**: 2 plans
Plans:

- [x] 27-01-PLAN.md -- Designer inline creation, tab focus, and supply stitch total hint
- [x] 27-02-PLAN.md -- Designer detail thumbnails and Need column width

**UI hint**: yes

### Phase 28: Stats Corrections

**Goal**: Statistics page displays accurate, well-formatted data across all three tabs
**Depends on**: Nothing (independent of Phase 27)
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05
**Success Criteria** (what must be TRUE):

  1. Records tab shows populated thread statistics, personal bests, and insights sections (not empty/missing)
  2. Collection breakdown chart Y-axes display only integer tick values for discrete data (no 0.5, 1.5 labels)
  3. Collection breakdown charts show entity names directly on/near bars instead of in separate linked lists
  4. Stats overview displays total stitches across all projects as a hero counter
  5. Days-in-library displays as a large prominent number with a small descriptive label beneath it

**Plans**: 3 plansPlans:
**Wave 1**

- [x] 28-01-PLAN.md -- Data layer: status groups utility, insight query rewrites, collection total
- [x] 28-03-PLAN.md -- Chart axis fixes and days-in-library formatAge fix

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 28-02-PLAN.md -- Component restructuring: StatusFilterPills, Overview/Records tab rewiring

**UI hint**: yes

### Phase 29: UI Polish

**Goal**: Gallery cards, project detail supplies, and file uploads are visually polished and functionally complete
**Depends on**: Nothing (independent of Phases 27-28)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, BUG-03
**Success Criteria** (what must be TRUE):

  1. Status and size category pills on gallery cards and Pattern Dive use their designated colors (not grey)
  2. Gallery cards show a visual indicator when a chart has an uploaded digital working copy
  3. User can sort supplies by "Added" order and alphabetically (A-Z) on the project detail Supplies tab
  4. Project supplies card includes skein calculation adjustment controls (fabric count, over 1/2, waste percentage)
  5. User can upload files up to 50MB, including .zip files as digital working copies

**Plans**: 3 plansPlans:

- [x] 29-01-PLAN.md -- Gallery card visual polish: status/size badge colors and digital copy indicator
- [x] 29-02-PLAN.md -- Supply tab: CalculatorCard integration and sort fix
- [x] 29-03-PLAN.md -- File upload: 50MB limit and zip support

**UI hint**: yes

### Phase 30: Code Quality

**Goal**: Codebase has zero TypeScript test errors, no silent failure patterns, and shared design tokens/utilities replace scattered duplicates
**Depends on**: Phases 27-29 (builds on code changed in earlier phases)
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06
**Success Criteria** (what must be TRUE):

  1. `npm run build` and test suite produce zero TypeScript errors across all test files (dashboard-tabs, chart-actions, shopping-cart-actions)
  2. No `.catch(() => {})`, `.catch(() => null)`, or bare `catch {}` patterns remain in upload-actions, chart page, or log-session-modal
  3. Replacing a session photo deletes the old image from R2 (no orphaned files)
  4. Status colors defined as CSS custom properties and consumed from a single source (not scattered Tailwind color scales)
  5. DEFAULT_SUPPLY_HEX extracted to a shared constant, and useRejectionFlash extracted to a shared hook

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 27 → 28 → 29 → 30

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
| 10. Unified Supply Table | v1.3 | 6/6 | Complete | 2026-05-04 |
| 11. Supply Table on Project Detail | v1.3 | 2/2 | Complete | 2026-05-11 |
| 12. Merged Form | v1.3 | 3/3 | Complete | 2026-05-11 |
| 13. Supply Takeover | v1.3 | 5/5 | Complete | 2026-05-16 |
| 14. Edit Mode & Cleanup | v1.3 | 3/3 | Complete | 2026-05-16 |
| 15. Chart File Management | v1.4 | 4/4 | Complete | 2026-05-17 |
| 16. Input & Dashboard Fixes | v1.4 | 2/2 | Complete | 2026-05-17 |
| 17. Image Focal Point | v1.4 | 3/3 | Complete | 2026-05-17 |
| 18. Stats Engine & Charting Foundation | v1.5 | 3/3 | Complete | 2026-05-17 |
| 19. Hero Stats & Collection Overview | v1.5 | 3/3 | Complete | 2026-05-17 |
| 20. Activity Visualization & Calendar | v1.5 | 4/4 | Complete | 2026-05-18 |
| 21. Records, Insights & Celebrations | v1.5 | 4/4 | Complete | 2026-05-18 |
| 22. Critical Fixes & Test Infrastructure | v1.6 | 3/3 | Complete | 2026-05-18 |
| 23. Test Coverage & Reliability | v1.6 | 3/3 | Complete | 2026-05-18 |
| 24. Code Quality | v1.6 | 4/4 | Complete | 2026-05-19 |
| 25. Shopping Cart Scaling | v1.6 | 2/2 | Complete | 2026-05-20 |
| 26. UX Polish | v1.6 | 3/3 | Complete | 2026-05-20 |
| 27. Chart Form Fixes | v1.7 | 2/2 | Complete    | 2026-05-23 |
| 28. Stats Corrections | v1.7 | 3/3 | Complete    | 2026-05-24 |
| 29. UI Polish | v1.7 | 3/3 | Complete    | 2026-05-24 |
| 30. Code Quality | v1.7 | 0/0 | Not started | - |
