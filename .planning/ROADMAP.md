# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP — "Replace Notion"** — Phases 1-4 (shipped 2026-04-11)
- 🚧 **v1.1 Browse & Organize** — Phases 5-7 (in progress)
- 📋 **v1.2 Track & Measure** — Phases 8-9 (planned)
- 📋 **v1.3 Motivation & Planning** — Phases 10-11 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-11</summary>

- [x] Phase 1: Foundation & Infrastructure (3/3 plans) — completed 2026-03-28
- [x] Phase 2: Core Project Management (5/5 plans) — completed 2026-04-06
- [x] Phase 3: Designer & Genre Pages (5/5 plans) — completed 2026-04-08
- [x] Phase 4: Supplies & Fabric (10/10 plans) — completed 2026-04-10

Full details: `milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Browse & Organize

- [ ] **Phase 5: Foundation & Quick Wins** - Storage/app CRUD, fabric selector, DMC catalog, UX fixes
- [ ] **Phase 6: Gallery Cards & View Modes** - Status-specific gallery cards, view mode toggle, sorting, search/filter
- [ ] **Phase 7: Skein Calculator & Supply Workflow** - Per-colour stitch counts, auto skein calculation, supply entry ordering

### 📋 v1.2 Track & Measure

- [ ] **Phase 8: Dashboards & Collection Views** - Main dashboard, Pattern Dive browser, shopping cart dashboard
- [ ] **Phase 9: Session Logging & Activity Stats** - Quick session entry, progress tracking, activity statistics

### 📋 v1.3 Motivation & Planning

- [ ] **Phase 10: Advanced Stats** - Year in Review, monthly charts, stitching calendar
- [ ] **Phase 11: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

### Phase 5: Foundation & Quick Wins
**Goal**: Users can manage storage locations and stitching apps as proper entities, link fabrics to projects, and benefit from a complete DMC catalog and two UX bug fixes
**Depends on**: Phase 4
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, PROJ-01, PROJ-02, SUPP-02, SUPP-03
**Success Criteria** (what must be TRUE):
  1. User can create, rename, and delete storage locations with a dedicated management page showing assigned projects
  2. User can create, rename, and delete stitching app entries and assign both storage location and app to a project via dropdowns
  3. User can link an unassigned fabric to a project from the project form (replacing the disabled placeholder)
  4. DMC thread catalog includes all standard colours (Blanc and ~30 missing entries filled) and cover images display without cropping distortion
  5. Thread colour picker auto-scrolls to keep search/add controls visible when adding items
**Plans:** 8 plans
Plans:
- [x] 05-01-PLAN.md — Schema + types + validations + server actions + nav items
- [x] 05-02-PLAN.md — Storage Location management UI (shared components + list + detail)
- [x] 05-03-PLAN.md — Stitching App management UI (mirrors storage pattern)
- [x] 05-04-PLAN.md — Chart form integration (DB-backed dropdowns + fabric selector)
- [x] 05-05-PLAN.md — Cover image fix + thread picker scroll + DMC catalog completion
- [x] 05-06-PLAN.md — Gap closure: Prisma client regeneration + inline Add New for storage/app dropdowns
- [x] 05-07-PLAN.md — Gap closure: Fix Add New empty name bug + thread picker multi-add UX
- [x] 05-08-PLAN.md — Gap closure: Always-visible Add New + thread picker viewport flip
**UI hint**: yes

### Phase 6: Gallery Cards & View Modes
**Goal**: Users can browse their chart collection through visually rich gallery cards with status-specific content, switch between view modes, and find charts quickly
**Depends on**: Phase 5 (cards display storage info; fabric selector enables kitting dots)
**Requirements**: GLRY-01, GLRY-02, GLRY-03, GLRY-04, GLRY-05
**Success Criteria** (what must be TRUE):
  1. User can browse charts as gallery cards showing cover images with status-specific footer content (WIP: progress/supplies, Unstarted: kitting dots, Finished: celebration border)
  2. User can switch between gallery, list, and table view modes with state persisted in URL params
  3. User can sort charts by name, designer, status, size, stitch count, and date added
  4. User can search charts by name and filter by status and size category
**Plans**: TBD
**UI hint**: yes

### Phase 7: Skein Calculator & Supply Workflow
**Goal**: Users can enter per-colour stitch counts when linking threads, see auto-calculated skein estimates, and enjoy a streamlined supply entry experience
**Depends on**: Phase 5 (fabric selector provides fabric count for calculation)
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, SUPP-01
**Success Criteria** (what must be TRUE):
  1. User can enter stitch count per colour when linking threads to a project, and per-colour counts sum to display project total
  2. App auto-calculates skeins needed from fabric count, strand count, and 20% waste factor, with sensible defaults when no fabric is linked
  3. User can manually override auto-calculated skein quantities and set strand count per project
  4. Supply entries maintain insertion order during data entry so users can verify nothing was skipped
**Plans**: TBD

### Phase 8: Dashboards & Collection Views
**Goal**: Users have a main dashboard and collection-level statistics that don't depend on session logging
**Depends on**: Phase 6 (uses gallery cards and filter components)
**Requirements**: TBD (v1.2 milestone)
**Success Criteria** (what must be TRUE):
  1. Main Dashboard shows recently added projects, currently stitching projects, buried treasures, and a spotlight feature
  2. Pattern Dive provides a library browser with filtering, fabric requirements display, and storage location views
**Plans**: TBD
**UI hint**: yes

### Phase 9: Session Logging & Activity Stats
**Goal**: Users can log daily stitch sessions and see activity-based statistics
**Depends on**: Phase 8
**Requirements**: TBD (v1.2 milestone)
**Success Criteria** (what must be TRUE):
  1. User can log a stitch session (date, project, count, optional photo, optional time) in under 30 seconds
  2. Project progress percentage updates automatically from logged sessions
  3. App displays activity statistics: daily, weekly, monthly, yearly stitch counts
**Plans**: TBD
**UI hint**: yes

### Phase 10: Advanced Stats
**Goal**: Comprehensive statistical views that celebrate stitching progress over time
**Depends on**: Phase 9 (needs session data)
**Requirements**: TBD (v1.3 milestone)
**Success Criteria** (what must be TRUE):
  1. Monthly stitch bar charts visualize activity over time
  2. Stitching calendar shows daily activity by project in a monthly grid
  3. Year in Review tab shows 8 stat sections with year selector
**Plans**: TBD
**UI hint**: yes

### Phase 11: Goals & Scheduling
**Goal**: Users can set goals with milestone targets and deadlines, manage rotations, and earn achievements
**Depends on**: Phase 9 (goals reference session data and progress)
**Requirements**: TBD (v1.3 milestone)
**Success Criteria** (what must be TRUE):
  1. User can set project-specific and global goals with milestone targets, frequency goals, and deadlines
  2. User can create scheduling plans for project start dates, recurring stitching days, and seasonal focus
  3. Multi-style rotation management available
  4. Achievement trophy case tracks milestones, streaks, and records
**Plans**: TBD
**UI hint**: yes

## Execution Order

- v1.1: 5 → 6 → 7 (6 and 7 both depend on 5; 7 benefits from 6 being complete but not strictly required)
- v1.2: 8 → 9
- v1.3: 10 → 11

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Core Project Management | v1.0 | 5/5 | Complete | 2026-04-06 |
| 3. Designer & Genre Pages | v1.0 | 5/5 | Complete | 2026-04-08 |
| 4. Supplies & Fabric | v1.0 | 10/10 | Complete | 2026-04-10 |
| 5. Foundation & Quick Wins | v1.1 | 7/8 | In progress | - |
| 6. Gallery Cards & View Modes | v1.1 | 0/TBD | Not started | - |
| 7. Skein Calculator & Supply Workflow | v1.1 | 0/TBD | Not started | - |
| 8. Dashboards & Collection Views | v1.2 | 0/TBD | Not started | - |
| 9. Session Logging & Activity Stats | v1.2 | 0/TBD | Not started | - |
| 10. Advanced Stats | v1.3 | 0/TBD | Not started | - |
| 11. Goals & Scheduling | v1.3 | 0/TBD | Not started | - |
