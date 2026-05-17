# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.4 shipped 2026-05-17 with chart file management, SearchToAdd keystroke fix, Dashboard Spotlight sizing, and image focal point control. 5 milestones shipped (v1.0-v1.4), 17 phases complete. v1.5 adds a comprehensive statistics dashboard with activity charts, personal records, and celebration moments.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP -- "Replace Notion"** -- Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** -- Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** -- Phases 8-9.1 (shipped 2026-04-20)
- ✅ **v1.3 Form & Supply Overhaul** -- Phases 10-14 (shipped 2026-05-16)
- ✅ **v1.4 Fixes & Polish** -- Phases 15-17 (shipped 2026-05-17)
- 🚧 **v1.5 Statistics & Records** -- Phases 18-21 (in progress)

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

### v1.5 Statistics & Records (In Progress)

**Milestone Goal:** A dedicated statistics dashboard that surfaces lifetime counters, activity charts, collection insights, and personal bests — making every stitch feel measured and rewarding.

- [x] **Phase 18: Stats Engine & Charting Foundation** - Server-side query layer, caching, timezone handling, and Recharts installation (completed 2026-05-17)
- [x] **Phase 19: Hero Stats & Collection Overview** - Lifetime counters, rolling time-window stats, and collection breakdown charts (completed 2026-05-17)
- [ ] **Phase 20: Activity Visualization & Calendar** - Monthly bar chart, stitching calendar, session history, day-of-week patterns, and pace trends
- [ ] **Phase 21: Records, Insights & Celebrations** - Personal bests board, "New record!" toast, designer/genre/supply insights, and completion estimates

## Phase Details

### Phase 18: Stats Engine & Charting Foundation
**Goal**: A tested, timezone-aware stats query layer exists with caching and invalidation, and Recharts is installed and integrated with the design system
**Depends on**: Phase 17 (v1.4 complete)
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04
**Success Criteria** (what must be TRUE):
  1. Stats query functions return correct aggregations from existing session/project data (verified by unit tests)
  2. Cache invalidates automatically when a session is logged, edited, or deleted
  3. Date boundaries align with the user's timezone (a session at 11pm Pacific on Monday counts as Monday, not Tuesday)
  4. A Recharts chart component renders in a test page with design system colors (emerald/amber/stone tokens)
**Plans:** 3/3 plans complete
Plans:
- [x] 18-01-PLAN.md — Install deps, types, timezone utility, chart configs
- [x] 18-02-PLAN.md — Query layer (hero stats, collection breakdown) + cache invalidation
- [x] 18-03-PLAN.md — Stats page shell + collection status donut chart

### Phase 19: Hero Stats & Collection Overview
**Goal**: Users can view a stats page with lifetime counters, time-window stats, and interactive collection breakdown charts
**Depends on**: Phase 18
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06, INS-06
**Success Criteria** (what must be TRUE):
  1. User can see total stitches, total sessions, total time, and projects completed as hero counters on the stats page
  2. User can see today/this week/this month/this year stitch counts that update after logging a session
  3. User can see collection broken down by status, size category, designer, and genre as interactive charts
  4. All entity references (projects, designers) in stats are clickable links to their detail pages
**Plans:** 3/3 plans complete
Plans:
**Wave 1**
- [x] 19-01-PLAN.md — Types, chart configs, and breakdown queries (size, designer, genre)
- [x] 19-02-PLAN.md — MetricsBar and LifetimeCounters components

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 19-03-PLAN.md — Chart components, RankedList, StatsOverview layout, page wiring

### Phase 20: Activity Visualization & Calendar
**Goal**: Users can explore their stitching activity over time through charts, a navigable calendar, session history, and pace metrics
**Depends on**: Phase 19
**Requirements**: VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05, VIZ-06, VIZ-07, INS-04
**Success Criteria** (what must be TRUE):
  1. User can see a 12-month bar chart of stitches and click a bar to see that month's detail
  2. User can view a month-view stitching calendar with daily activity indicators and navigate between months
  3. User can browse all sessions in a sortable, paginated table
  4. User can see day-of-week patterns, rolling averages (7/30/90-day), and month-over-month pace trends
  5. User can see their stitch rate (stitches/hour) with trend direction when time data is available
**Plans:** 4 plans
Plans:
- [ ] 20-01-PLAN.md — Types, chart configs, queries, server actions, search-params cache
- [ ] 20-02-PLAN.md — PaceCards, MonthlyStitchChart, MonthlyDrillDown, DayOfWeekChart
- [ ] 20-03-PLAN.md — StitchingCalendar, SessionHistoryTable, shadcn table\/pagination
- [ ] 20-04-PLAN.md — ActivityOverview layout, page.tsx wiring, human verification

### Phase 21: Records, Insights & Celebrations
**Goal**: Users can view personal bests, receive celebration toasts when breaking records, and explore supply/designer/genre insights with completion estimates
**Depends on**: Phase 20
**Requirements**: REC-01, REC-02, REC-03, REC-04, REC-05, INS-01, INS-02, INS-03, INS-05
**Success Criteria** (what must be TRUE):
  1. User can see a personal bests board showing most stitches in a day, most in a session, longest streak, and current streak — each linking to the associated project/session
  2. User sees a "New record!" celebration toast immediately when logging a session that beats a personal best
  3. User can see year-scoped records alongside all-time records, and fastest completions by size category
  4. User can see most-used thread colors (with swatches), designer completion rates, and genre distribution
  5. User can see estimated completion dates for active projects when sufficient session data exists
**Plans:** 4 plans
Plans:
- [ ] 20-01-PLAN.md — Types, chart configs, queries, server actions, search-params cache
- [ ] 20-02-PLAN.md — PaceCards, MonthlyStitchChart, MonthlyDrillDown, DayOfWeekChart
- [ ] 20-03-PLAN.md — StitchingCalendar, SessionHistoryTable, shadcn table\/pagination
- [ ] 20-04-PLAN.md — ActivityOverview layout, page.tsx wiring, human verification

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
| 10. Unified Supply Table | v1.3 | 6/6 | Complete | 2026-05-04 |
| 11. Supply Table on Project Detail | v1.3 | 2/2 | Complete | 2026-05-11 |
| 12. Merged Form | v1.3 | 3/3 | Complete | 2026-05-11 |
| 13. Supply Takeover | v1.3 | 5/5 | Complete | 2026-05-16 |
| 14. Edit Mode & Cleanup | v1.3 | 3/3 | Complete | 2026-05-16 |
| 15. Chart File Management | v1.4 | 4/4 | Complete | 2026-05-17 |
| 16. Input & Dashboard Fixes | v1.4 | 2/2 | Complete | 2026-05-17 |
| 17. Image Focal Point | v1.4 | 3/3 | Complete | 2026-05-17 |
| 18. Stats Engine & Charting Foundation | v1.5 | 3/3 | Complete    | 2026-05-17 |
| 19. Hero Stats & Collection Overview | v1.5 | 0/3 | Planned | - |
| 20. Activity Visualization & Calendar | v1.5 | 0/4 | Planned | - |
| 21. Records, Insights & Celebrations | v1.5 | 0/? | Not started | - |
