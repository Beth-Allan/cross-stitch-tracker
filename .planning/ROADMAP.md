# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP — "Replace Notion"** — Phases 1-4 (shipped 2026-04-11)
- 📋 **v2.0 Browse & Organize** — Phases 5-6 (planned)
- 📋 **v3.0 Track & Measure** — Phases 7-8 (planned)
- 📋 **v4.0 Motivation & Planning** — Phases 9-10 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-11</summary>

- [x] Phase 1: Foundation & Infrastructure (3/3 plans) — completed 2026-03-28
- [x] Phase 2: Core Project Management (5/5 plans) — completed 2026-04-06
- [x] Phase 3: Designer & Genre Pages (5/5 plans) — completed 2026-04-08
- [x] Phase 4: Supplies & Fabric (10/10 plans) — completed 2026-04-10

Full details: `milestones/v1.0-ROADMAP.md`

</details>

### 📋 v2.0 Browse & Organize

- [ ] **Phase 5: Gallery & Filtering** — Status-specific gallery cards, filter bar, view mode toggle
- [ ] **Phase 6: Reference Data** — Series/collections, storage locations

### 📋 v3.0 Track & Measure

- [ ] **Phase 7: Basic Dashboards** — Main dashboard, collection-level stats, Pattern Dive browser
- [ ] **Phase 8: Session Logging & Activity Stats** — Quick session entry, progress tracking, activity statistics

### 📋 v4.0 Motivation & Planning

- [ ] **Phase 9: Advanced Stats** — Year in Review, personal bests, monthly charts, calendar view
- [ ] **Phase 10: Goals & Scheduling** — Goal setting, rotation management, achievements

## Phase Details

### Phase 5: Gallery & Filtering
**Goal**: Projects display with polished, status-specific gallery cards and users can filter and switch view modes
**Depends on**: Phase 2, Phase 4 (cards may show supply/fabric status)
**Requirements**: VIEW-01, VIEW-02, PROJ-09
**Success Criteria** (what must be TRUE):
  1. Gallery cards show status-specific layouts: WIP cards show progress, Unstarted cards show kitting needs, Finished cards show completion photo
  2. Reusable filter bar supports configurable filter dimensions, dismissible chips, and a view mode toggle (gallery/list/table)
  3. User can browse projects in gallery, list, and table views with sorting
**Plans**: TBD
**UI hint**: yes

### Phase 6: Reference Data
**Goal**: Users can manage series/collections and storage locations for organizing their project library
**Depends on**: Phase 2
**Requirements**: REF-03, REF-04
**Success Criteria** (what must be TRUE):
  1. User can create series/collections and track completion progress across grouped projects
  2. User can manage storage locations and assign projects to specific bins
**Plans**: TBD
**UI hint**: yes

### Phase 7: Basic Dashboards
**Goal**: Users have a main dashboard and collection-level statistics that don't depend on session logging
**Depends on**: Phase 5 (uses gallery cards and filter bar)
**Requirements**: DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. Main Dashboard shows recently added projects, currently stitching projects, buried treasures, and a spotlight feature
  2. Pattern Dive provides a library browser with filtering, fabric requirements display, and storage location views
**Plans**: TBD
**UI hint**: yes

### Phase 8: Session Logging & Activity Stats
**Goal**: Users can log daily stitch sessions and see activity-based statistics (stitches/day, streaks, progress tracking)
**Depends on**: Phase 2
**Requirements**: STCH-01, STCH-02, STCH-03, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can log a stitch session (date, project, count, optional photo, optional time) in under 30 seconds
  2. Project progress percentage updates automatically from logged sessions
  3. App displays activity statistics: daily, weekly, monthly, yearly stitch counts
  4. Project Dashboard shows active work tracking with progress indicators
  5. Shopping Cart dashboard aggregates unfulfilled supply and fabric needs
**Plans**: TBD
**UI hint**: yes

### Phase 9: Advanced Stats
**Goal**: Comprehensive statistical views that celebrate stitching progress over time
**Depends on**: Phase 8 (needs session data)
**Requirements**: STCH-04, STCH-05, STCH-06
**Success Criteria** (what must be TRUE):
  1. Monthly stitch bar charts visualize activity over time
  2. Stitching calendar shows daily activity by project in a monthly grid
  3. Year in Review tab shows 8 stat sections with year selector
**Plans**: TBD
**UI hint**: yes

### Phase 10: Goals & Scheduling
**Goal**: Users can set goals with milestone targets and deadlines, manage rotations, and earn achievements
**Depends on**: Phase 8 (goals reference session data and progress)
**Requirements**: GOAL-01, GOAL-02, GOAL-03, GOAL-04
**Success Criteria** (what must be TRUE):
  1. User can set project-specific and global goals with milestone targets, frequency goals, and deadlines
  2. User can create scheduling plans for project start dates, recurring stitching days, and seasonal focus
  3. Goals display progress based on actual session data and project completion
  4. Multi-style rotation management available (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
  5. Achievement trophy case tracks milestones, streaks, and records
**Plans**: TBD
**UI hint**: yes

## Execution Order

- v2.0: 5 → 6 (6 doesn't depend on 5)
- v3.0: 7 → 8 (8 doesn't depend on 7)
- v4.0: 9 → 10 (both depend on 8)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Core Project Management | v1.0 | 5/5 | Complete | 2026-04-06 |
| 3. Designer & Genre Pages | v1.0 | 5/5 | Complete | 2026-04-08 |
| 4. Supplies & Fabric | v1.0 | 10/10 | Complete | 2026-04-10 |
| 5. Gallery & Filtering | v2.0 | 0/TBD | Not started | - |
| 6. Reference Data | v2.0 | 0/TBD | Not started | - |
| 7. Basic Dashboards | v3.0 | 0/TBD | Not started | - |
| 8. Session Logging & Activity Stats | v3.0 | 0/TBD | Not started | - |
| 9. Advanced Stats | v4.0 | 0/TBD | Not started | - |
| 10. Goals & Scheduling | v4.0 | 0/TBD | Not started | - |
