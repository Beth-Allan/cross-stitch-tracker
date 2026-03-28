# Roadmap: Cross Stitch Tracker

## Overview

This roadmap delivers a personal cross-stitch project management app that replaces a Notion-based system. The build order follows the data dependency chain: infrastructure and auth first, then the core project entity, then supporting data (designers, genres, fabric, supplies), then the daily-use features (session logging, statistics), then presentation layers (gallery cards, dashboards), and finally the capstone features (goals and scheduling). Each phase delivers a complete, verifiable capability. Design components from `~/projects/cross-stitch-tracker-design/product-plan/` are imported and adapted as each phase's UI is built.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Infrastructure** - Auth, app shell, design system, responsive layout, PWA manifest
- [ ] **Phase 2: Core Project Management** - Project CRUD with rich metadata, file uploads, status system, size calculation
- [ ] **Phase 3: Project Metadata & Browsing** - Designers, genres, SAL support, gallery/list/table views with sorting
- [ ] **Phase 4: Reference Data** - Fabric records, series/collections, storage locations
- [ ] **Phase 5: Supply Management & Shopping** - DMC catalog, supply databases, project-supply linking, shopping list, kitting status
- [ ] **Phase 6: Stitch Sessions & Statistics** - Session logging, progress tracking, comprehensive statistics engine
- [ ] **Phase 7: Gallery Cards & Advanced Filtering** - Status-specific card layouts, reusable filter bar with chips and view toggle
- [ ] **Phase 8: Dashboards** - Main Dashboard, Pattern Dive, Project Dashboard, Shopping Cart dashboard
- [ ] **Phase 9: Goals & Scheduling** - Project and global goals, scheduling plans

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
- [x] 01-01-PLAN.md — Scaffold Next.js 16, design system tokens, Prisma 7 + Neon, PWA manifest
- [x] 01-02-PLAN.md — Auth.js v5 credentials, rate limiting, branded login page
- [x] 01-03-PLAN.md — App shell (sidebar, TopBar, UserMenu), placeholder pages, responsive layout
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
**Plans:** 3/5 plans executed

Plans:
- [x] 02-01-PLAN.md — Prisma schema (Chart/Project/Designer/Genre), R2 client, Zod schemas, utilities, type definitions
- [x] 02-02-PLAN.md — Server Actions (chart CRUD, file uploads, inline entity creation)
- [x] 02-03-PLAN.md — Chart form UI (add/edit) with upload components and inline entity dialogs
- [ ] 02-04-PLAN.md — Chart detail page, charts list page, status/size badges, status control
- [ ] 02-05-PLAN.md — Human verification of full chart lifecycle
**UI hint**: yes

### Phase 3: Project Metadata & Browsing
**Goal**: Users can organize projects with designers, genres, and SAL parts, and browse their collection in multiple view modes
**Depends on**: Phase 2
**Requirements**: PROJ-06, PROJ-07, PROJ-08, PROJ-09
**Success Criteria** (what must be TRUE):
  1. User can create/edit/delete designers and link them to projects; designer detail view shows associated projects and stats
  2. User can create genre tags and apply them to projects for organization
  3. User can add SAL parts to a project with PDF uploads and evolving stitch counts
  4. User can browse projects in gallery, list, and table views with sorting (server-side TanStack Table with URL-based pagination)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Reference Data
**Goal**: Users can manage supporting reference data: fabrics with auto-calculated sizing, series/collections, and storage locations
**Depends on**: Phase 2
**Requirements**: REF-01, REF-02, REF-03, REF-04
**Success Criteria** (what must be TRUE):
  1. User can create/view/edit/delete fabric records with brand, count, type, color, and dimensions
  2. App auto-calculates required fabric size from stitch dimensions and fabric count
  3. User can create series/collections and track completion progress across grouped projects
  4. User can manage storage locations and assign projects to specific bins
**Plans**: TBD
**UI hint**: yes

### Phase 5: Supply Management & Shopping
**Goal**: Users can track supplies across projects with a pre-seeded DMC catalog, link supplies to projects with quantities, and get auto-generated shopping lists
**Depends on**: Phase 2
**Requirements**: SUPP-01, SUPP-02, SUPP-03, SUPP-04, SUPP-05
**Success Criteria** (what must be TRUE):
  1. DMC thread catalog (~500 colors with hex color swatches) is pre-seeded and browsable
  2. User can browse and manage thread, bead, and specialty item databases with brand management
  3. User can link supplies to projects with required vs acquired quantities (three separate junction tables)
  4. App auto-generates a shopping list showing unfulfilled supplies grouped by project
  5. App auto-calculates kitting status from 8+ conditions and displays a progress indicator on project detail
**Plans**: TBD
**UI hint**: yes

### Phase 6: Stitch Sessions & Statistics
**Goal**: Users can log daily stitch sessions quickly and see comprehensive auto-calculated statistics that make tracking feel rewarding
**Depends on**: Phase 2, Phase 5 (for supply stats)
**Requirements**: STCH-01, STCH-02, STCH-03
**Success Criteria** (what must be TRUE):
  1. User can log a stitch session (date, project, count, optional photo, optional time) in under 30 seconds
  2. Project progress percentage updates automatically from logged sessions
  3. App displays comprehensive statistics: daily, weekly, monthly, and yearly stitch counts, project-level stats, and supply stats
**Plans**: TBD
**UI hint**: yes

### Phase 7: Gallery Cards & Advanced Filtering
**Goal**: Projects display with polished, status-specific gallery cards and users can filter across all browsing contexts with a reusable filter bar
**Depends on**: Phase 3, Phase 5, Phase 6 (cards show progress, kitting, completion data)
**Requirements**: VIEW-01, VIEW-02
**Success Criteria** (what must be TRUE):
  1. Gallery cards show status-specific layouts: WIP cards show progress, Unstarted cards show kitting needs, Finished cards show completion photo
  2. Reusable filter bar supports configurable filter dimensions, dismissible chips, and a view mode toggle (gallery/list/table)
**Plans**: TBD
**UI hint**: yes

### Phase 8: Dashboards
**Goal**: Users have four purpose-built dashboards that compose data from all systems into actionable views
**Depends on**: Phase 6, Phase 7 (needs statistics, gallery cards, and filters)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. Main Dashboard shows recently added projects, currently stitching projects, buried treasures, and a spotlight feature
  2. Pattern Dive provides a deep library browser with filtering, fabric requirements display, and storage location views
  3. Project Dashboard shows active work tracking with progress indicators and goal status
  4. Shopping Cart dashboard aggregates unfulfilled supply and fabric needs across all projects
**Plans**: TBD
**UI hint**: yes

### Phase 9: Goals & Scheduling
**Goal**: Users can set goals with milestone targets and deadlines, and create scheduling plans for their stitching workflow
**Depends on**: Phase 6 (goals reference session data and progress)
**Requirements**: GOAL-01, GOAL-02
**Success Criteria** (what must be TRUE):
  1. User can set project-specific and global goals with milestone targets, frequency goals, and deadlines
  2. User can create scheduling plans for project start dates, recurring stitching days, and seasonal focus
  3. Goals display progress based on actual session data and project completion
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
Note: Phases 3, 4, and 5 all depend on Phase 2 but not on each other. They could theoretically be reordered, but the listed order follows the data dependency chain (designers/genres enrich projects, reference data supports supplies, supplies enable kitting/shopping).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 0/3 | Planning complete | - |
| 2. Core Project Management | 3/5 | In Progress|  |
| 3. Project Metadata & Browsing | 0/TBD | Not started | - |
| 4. Reference Data | 0/TBD | Not started | - |
| 5. Supply Management & Shopping | 0/TBD | Not started | - |
| 6. Stitch Sessions & Statistics | 0/TBD | Not started | - |
| 7. Gallery Cards & Advanced Filtering | 0/TBD | Not started | - |
| 8. Dashboards | 0/TBD | Not started | - |
| 9. Goals & Scheduling | 0/TBD | Not started | - |
