# Roadmap: Cross Stitch Tracker

## Overview

This roadmap delivers a personal cross-stitch project management app replacing Notion. Restructured 2026-04-07 to ship a lean MVP faster: core CRUD + supplies + fabric, then deploy and iterate based on real usage. The full vision is preserved across 4 milestones.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. Note: design sections don't map 1:1 to phases -- see `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

| Milestone | Theme | Phases | Deploy? |
|-----------|-------|--------|---------|
| **1** | MVP -- "Replace Notion" | 1-4 | Yes, after Phase 4 |
| **2** | Browse & Organize | 5-6 | Incremental |
| **3** | Track & Measure | 7-8 | Incremental |
| **4** | Motivation & Planning | 9-10 | Incremental |

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3...): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

---

### Milestone 1: MVP -- "Replace Notion"

- [x] **Phase 1: Foundation & Infrastructure** - Auth, app shell, design system, responsive layout, PWA manifest
- [ ] **Phase 2: Core Project Management** - Chart CRUD with rich metadata, file uploads, status system, size calculation
- [ ] **Phase 3: Designer & Genre Pages** - Dedicated management pages for designers and genres
- [ ] **Phase 4: Supplies & Fabric** - Pre-seeded DMC catalog, bead + specialty catalogs, fabric records, project-supply linking, shopping list

**>> Deploy to Vercel -- start entering real data <<**

### Milestone 2: Browse & Organize

- [ ] **Phase 5: Gallery & Filtering** - Status-specific gallery cards, filter bar, view mode toggle
- [ ] **Phase 6: Reference Data** - Series/collections, storage locations, fabric brand management

### Milestone 3: Track & Measure

- [ ] **Phase 7: Basic Dashboards** - Main dashboard, collection-level stats, Pattern Dive browser
- [ ] **Phase 8: Session Logging & Activity Stats** - Quick session entry, progress tracking, activity statistics

### Milestone 4: Motivation & Planning

- [ ] **Phase 9: Advanced Stats** - Year in Review, personal bests, monthly charts, calendar view
- [ ] **Phase 10: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: A working, authenticated app shell with the design system applied, responsive on Mac and iPhone, installable as a PWA
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. User can log in and all app routes are protected behind authentication
  2. App shell displays MainNav, TopBar, and UserMenu matching the design system (emerald/amber/stone palette, Fraunces/Source Sans 3 fonts)
  3. Layout is usable on both Mac browser and iPhone without horizontal scroll or broken elements
  4. App can be installed to iPhone home screen and launches in full-screen mode
  5. Database connects to Neon with pooled and direct URLs, Prisma migrations run cleanly
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md -- Scaffold Next.js 16, design system tokens, Prisma 7 + Neon, PWA manifest
- [x] 01-02-PLAN.md -- Auth.js v5 credentials, rate limiting, branded login page
- [x] 01-03-PLAN.md -- App shell (sidebar, TopBar, UserMenu), placeholder pages, responsive layout
**UI hint**: yes

### Phase 2: Core Project Management
**Goal**: Users can create and manage cross-stitch projects with full metadata, cover photos, digital file storage, and status tracking
**Depends on**: Phase 1
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05
**Success Criteria** (what must be TRUE):
  1. User can create a project with ~50 metadata fields and view/edit/delete it
  2. User can upload a cover photo that displays in detail views
  3. User can upload a digital working copy (PDF/image) via presigned R2 URL and download it later
  4. User can set and change project status through all 7 stages (Unstarted through FFO)
  5. App displays auto-calculated size category (Mini/Small/Medium/Large/BAP) based on stitch count
**Plans:** 4/5 plans executed

Plans:
- [x] 02-01-PLAN.md -- Prisma schema (Chart/Project/Designer/Genre), R2 client, Zod schemas, utilities, type definitions
- [x] 02-02-PLAN.md -- Server Actions (chart CRUD, file uploads, inline entity creation)
- [x] 02-03-PLAN.md -- Chart form UI (add/edit) with upload components and inline entity dialogs
- [x] 02-04-PLAN.md -- Chart detail page, charts list page, status/size badges, status control
- [ ] 02-05-PLAN.md -- Human verification of full chart lifecycle
**UI hint**: yes

### Phase 3: Designer & Genre Pages
**Goal**: Users can manage designers and genres with dedicated pages -- list, create, edit, delete -- not just inline creation from the chart form
**Depends on**: Phase 2
**Requirements**: PROJ-06, PROJ-07
**Success Criteria** (what must be TRUE):
  1. User can view a list of all designers with chart counts
  2. User can create, edit, and delete designers from a dedicated page
  3. User can view a list of all genres with chart counts
  4. User can create, edit, and delete genres from a dedicated page
  5. Designer/genre detail views show associated charts
**Plans:** 5 plans

Plans:
- [x] 03-01-PLAN.md -- Schema migration (Designer notes), validations, types, server actions (full CRUD for designers and genres)
- [x] 03-02-PLAN.md -- Designer list page with sortable table, search, form modal, sidebar navigation
- [x] 03-03-PLAN.md -- Genre list page with sortable table, search, form modal
- [x] 03-04-PLAN.md -- Designer and genre detail pages, delete confirmation dialog, human verification
- [x] 03-05-PLAN.md -- Gap closure: wire delete into designer list, replace confirm() in genre list, fix dialog error handling
**UI hint**: yes
**Design refs**: `product-plan/sections/fabric-series-and-reference-data/` (DesignerPage, DesignerDetailModal, DesignerFormModal)

### Phase 4: Supplies & Fabric
**Goal**: Users can track supplies and fabric linked to projects, with a pre-seeded DMC catalog and a shopping list showing what they still need
**Depends on**: Phase 2
**Requirements**: SUPP-01, SUPP-02 (essentials), SUPP-03, SUPP-04, REF-01, REF-02
**Success Criteria** (what must be TRUE):
  1. DMC thread catalog (~500 colors with hex color swatches) is pre-seeded and searchable
  2. User can browse and add threads, beads, and specialty items (with basic brand tracking)
  3. User can link supplies to projects with required vs acquired quantities (three junction tables)
  4. User can create fabric records (brand, count, type, color, dimensions) and link to projects
  5. App auto-calculates required fabric size from stitch dimensions and fabric count
  6. Shopping list view shows unfulfilled supplies grouped by project
**Plans**: TBD
**UI hint**: yes
**Design refs**: `product-plan/sections/supply-tracking-and-shopping/` (all components), `product-plan/sections/fabric-series-and-reference-data/` (FabricCatalog, FabricDetail, FabricFormModal)
**Deferred to later**: Kitting auto-calculation (8 conditions), kitting progress indicators, supply statistics, advanced brand management

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

## Progress

**Execution Order:**
Milestone 1: 1 -> 2 -> 3 + 4 (parallel-capable, both depend on 2)
Milestone 2: 5 -> 6 (6 doesn't depend on 5)
Milestone 3: 7 -> 8 (8 doesn't depend on 7)
Milestone 4: 9 -> 10 (both depend on 8)

Note: Within milestones, phases with independent dependencies can run in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 3/3 | Complete | 2026-03-28 |
| 2. Core Project Management | 4/5 | In Progress |  |
| 3. Designer & Genre Pages | 4/5 | In Progress | - |
| 4. Supplies & Fabric | 0/TBD | Not started | - |
| 5. Gallery & Filtering | 0/TBD | Not started | - |
| 6. Reference Data | 0/TBD | Not started | - |
| 7. Basic Dashboards | 0/TBD | Not started | - |
| 8. Session Logging & Activity Stats | 0/TBD | Not started | - |
| 9. Advanced Stats | 0/TBD | Not started | - |
| 10. Goals & Scheduling | 0/TBD | Not started | - |
