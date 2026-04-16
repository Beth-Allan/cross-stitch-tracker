# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP — "Replace Notion"** — Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** — Phases 5-7 (shipped 2026-04-16)
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

<details>
<summary>✅ v1.1 Browse & Organize (Phases 5-7) — SHIPPED 2026-04-16</summary>

- [x] Phase 5: Foundation & Quick Wins (8/8 plans) — completed 2026-04-13
- [x] Phase 6: Gallery Cards & View Modes (4/4 plans) — completed 2026-04-15
- [x] Phase 7: Project Detail Experience (8/8 plans) — completed 2026-04-16

Full details: `milestones/v1.1-ROADMAP.md`

</details>

### 📋 v1.2 Track & Measure

- [ ] **Phase 8: Dashboards & Collection Views** - Main dashboard, Pattern Dive browser, shopping cart dashboard
- [ ] **Phase 9: Session Logging & Activity Stats** - Quick session entry, progress tracking, activity statistics

### 📋 v1.3 Motivation & Planning

- [ ] **Phase 10: Advanced Stats** - Year in Review, monthly charts, stitching calendar
- [ ] **Phase 11: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

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
| 5. Foundation & Quick Wins | v1.1 | 8/8 | Complete | 2026-04-13 |
| 6. Gallery Cards & View Modes | v1.1 | 4/4 | Complete | 2026-04-15 |
| 7. Project Detail Experience | v1.1 | 8/8 | Complete | 2026-04-16 |
| 8. Dashboards & Collection Views | v1.2 | 0/TBD | Not started | - |
| 9. Session Logging & Activity Stats | v1.2 | 0/TBD | Not started | - |
| 10. Advanced Stats | v1.3 | 0/TBD | Not started | - |
| 11. Goals & Scheduling | v1.3 | 0/TBD | Not started | - |
