# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP — "Replace Notion"** — Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** — Phases 5-7 (shipped 2026-04-16)
- 🚧 **v1.2 Track & Measure** — Phases 8-9 (in progress)
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

<details>
<summary>✅ v1.1 Browse & Organize (Phases 5-7) — SHIPPED 2026-04-16</summary>

- [x] Phase 5: Foundation & Quick Wins (8/8 plans) — completed 2026-04-13
- [x] Phase 6: Gallery Cards & View Modes (4/4 plans) — completed 2026-04-15
- [x] Phase 7: Project Detail Experience (8/8 plans) — completed 2026-04-16

Full details: `milestones/v1.1-ROADMAP.md`

</details>

### 🚧 v1.2 Track & Measure

**Milestone Goal:** Add session logging as the data foundation for progress tracking, evolve the Charts page into Pattern Dive, and build dashboard pages that surface collection insights and streamline shopping.

- [x] **Phase 8: Session Logging & Pattern Dive** - StitchSession model, global log modal, auto-updating progress, Pattern Dive tabs (completed 2026-04-18)
- [x] **Phase 9: Dashboards & Shopping Cart** - Main Dashboard, Project Dashboard, Shopping Cart upgrade with project selection (completed 2026-04-18)

### 📋 v1.3 Motivation & Planning

- [ ] **Phase 10: Advanced Stats** - Year in Review, monthly charts, stitching calendar
- [ ] **Phase 11: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

### Phase 8: Session Logging & Pattern Dive
**Goal**: Users can log stitch sessions that automatically update project progress, and browse their collection through specialized Pattern Dive tabs
**Depends on**: Phase 7 (uses project detail tabbed layout, gallery infrastructure from Phase 6)
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06, PDIV-01, PDIV-02, PDIV-03, PDIV-04, PDIV-05
**Success Criteria** (what must be TRUE):
  1. User can log a stitch session from the header, project detail page, or dashboard, providing date, project, stitch count, and optionally time and a progress photo
  2. After logging, editing, or deleting a session, the project's progress percentage updates automatically without manual recalculation
  3. User can view a per-project session history on the project detail Sessions tab showing total stitches, session count, average per session, and active-since date
  4. User can navigate Pattern Dive tabs (Browse, What's Next, Fabric Requirements, Storage View) to explore their collection from different angles
  5. The Charts page nav label reads "Pattern Dive" while the URL path remains `/charts`
**Plans**: 11 plans

Plans:
- [x] 08-01-PLAN.md -- Schema, types, validation, test infrastructure foundation
- [x] 08-02-PLAN.md -- Session CRUD server actions with atomic progress recalculation (TDD)
- [x] 08-03-PLAN.md -- LogSessionModal component and TopBar integration
- [x] 08-04-PLAN.md -- Project Sessions tab, SessionTable, global Sessions page
- [x] 08-05-PLAN.md -- Pattern Dive nav rename, tab infrastructure, Browse tab
- [x] 08-06-PLAN.md -- Pattern Dive data actions (What's Next, Fabric Reqs, Storage)
- [x] 08-07-PLAN.md -- Pattern Dive tab components and eager data wiring
- [x] 08-08-PLAN.md -- DB push, data migration, conditional EditableNumber
- [x] 08-09-PLAN.md -- Integration verification and visual checkpoint
- [x] 08-10-PLAN.md -- Gap closure: fabric assign bug (CR-01), $transaction, availability guard, validation trim
- [x] 08-11-PLAN.md -- Gap closure: fix fabric matching Catch-22 for unassigned projects (UAT #13)

**UI hint**: yes

### Phase 9: Dashboards & Shopping Cart
**Goal**: Users have a curated home dashboard, a progress-oriented project dashboard, and a shopping cart that lets them plan supply runs by project
**Depends on**: Phase 8 (dashboards use session data for "last stitched" sorting, progress aggregations, and stitching-day stats)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, SHOP-01, SHOP-02, SHOP-03, SHOP-04
**Success Criteria** (what must be TRUE):
  1. User sees a Main Dashboard home page with Currently Stitching (sorted by most recently worked on), Start Next, Buried Treasures, Spotlight, and Collection Stats sections
  2. User can use Quick Add from the dashboard to create charts, supplies, designers, or log a session without navigating away
  3. User sees a Project Dashboard with hero stats, progress buckets (Unstarted through Almost There) with sortable projects, and a Finished tab with per-project stats sortable by multiple dimensions
  4. User can select specific projects to shop for, see aggregated supply needs in tabbed view (Threads, Beads, Specialty, Fabric) with badge counts, and mark individual items as acquired
**Plans**: 9 plans

Plans:
- [ ] 09-01-PLAN.md -- Dashboard types + main dashboard data actions (TDD)
- [ ] 09-02-PLAN.md -- Project dashboard data actions (TDD)
- [ ] 09-03-PLAN.md -- Shopping cart data actions with IDOR protection (TDD)
- [ ] 09-04-PLAN.md -- Main Dashboard section components (cards, sidebar, spotlight, scroll)
- [ ] 09-05-PLAN.md -- Project Dashboard UI (hero stats, progress buckets, finished tab)
- [ ] 09-06-PLAN.md -- Shopping Cart UI (project selection, supply tabs, quantity control)
- [ ] 09-07-PLAN.md -- Dashboard page wiring (tabs, Quick Add, layout composition)
- [ ] 09-08-PLAN.md -- Shopping page wiring + TopBar event listener
- [ ] 09-09-PLAN.md -- Integration verification and visual checkpoint

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

- v1.0: 1 → 2 → 3 → 4
- v1.1: 5 → 6 → 7
- v1.2: 8 → 9
- v1.3: 10 → 11

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
| 9. Dashboards & Shopping Cart | v1.2 | 0/9 | Not started | - |
| 10. Advanced Stats | v1.3 | 0/TBD | Not started | - |
| 11. Goals & Scheduling | v1.3 | 0/TBD | Not started | - |
