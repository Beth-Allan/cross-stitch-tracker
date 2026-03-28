# Requirements: Cross Stitch Tracker

**Defined:** 2026-03-28
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1 Requirements

### Project Management

- [ ] **PROJ-01**: User can create, view, edit, and delete cross-stitch projects with ~50 metadata fields
- [ ] **PROJ-02**: User can upload cover photo and view it in gallery/detail views
- [ ] **PROJ-03**: User can upload and store digital working copies (PDF/image) via presigned R2 URLs
- [ ] **PROJ-04**: User can set and change project status (Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO)
- [ ] **PROJ-05**: App auto-calculates size category (Mini/Small/Medium/Large/BAP) from stitch count
- [ ] **PROJ-06**: User can create, edit, and delete designers and link them to projects
- [ ] **PROJ-07**: User can create, edit, and manage genre tags and apply them to projects
- [ ] **PROJ-08**: User can add SAL parts (PDF uploads) to a project with evolving stitch counts and supply needs
- [ ] **PROJ-09**: User can browse projects in gallery, list, and table views with sorting

### Supply Tracking & Shopping

- [ ] **SUPP-01**: App pre-seeds full DMC thread catalog (~500 colors with hex swatches)
- [ ] **SUPP-02**: User can browse and manage thread, bead, and specialty item databases with brand management
- [ ] **SUPP-03**: User can link supplies to projects with per-project quantities (required vs acquired)
- [ ] **SUPP-04**: App auto-generates shopping list showing unfulfilled supplies grouped by project
- [ ] **SUPP-05**: App auto-calculates kitting status from 8+ conditions with progress indicator

### Stitching Sessions & Statistics

- [ ] **STCH-01**: User can log stitch sessions (date, project, count, optional photo, optional time) in under 30 seconds
- [ ] **STCH-02**: App auto-updates project progress percentage from logged sessions
- [ ] **STCH-03**: App calculates comprehensive statistics (daily/weekly/monthly/yearly stitches, project stats, supply stats)

### Fabric, Series & Reference Data

- [ ] **REF-01**: User can create, view, edit, and delete fabric records with brand, count, type, color, dimensions
- [ ] **REF-02**: App auto-calculates required fabric size from stitch dimensions and fabric count
- [ ] **REF-03**: User can create and manage series/collections with completion tracking
- [ ] **REF-04**: User can manage storage locations and assign projects to bins

### Gallery Cards & Filtering

- [ ] **VIEW-01**: Gallery cards show status-specific layouts (WIP: progress, Unstarted: kitting needs, Finished: completion photo)
- [ ] **VIEW-02**: Reusable advanced filter bar with configurable dimensions, dismissible chips, and view mode toggle

### Dashboards

- [ ] **DASH-01**: Main Dashboard with recently added, currently stitching, buried treasures, spotlight
- [ ] **DASH-02**: Pattern Dive with library browser, filtering, fabric requirements, storage views
- [ ] **DASH-03**: Project Dashboard with active work tracking, progress, and goals
- [ ] **DASH-04**: Shopping Cart dashboard with aggregated supply and fabric needs

### Goals & Plans

- [ ] **GOAL-01**: User can set project-specific and global goals with milestone targets, frequency goals, and deadlines
- [ ] **GOAL-02**: User can create scheduling plans for project start dates, recurring stitching days, and seasonal focus

### Infrastructure

- [ ] **INFRA-01**: Auth.js single-user authentication protecting all app routes
- [ ] **INFRA-02**: App shell with MainNav, TopBar, UserMenu matching design system
- [ ] **INFRA-03**: Responsive design working on Mac browser and iPhone
- [ ] **INFRA-04**: PWA installable (home screen icon, full-screen launch)
- [ ] **INFRA-05**: Design system tokens (emerald/amber/stone, Fraunces/Source Sans 3/JetBrains Mono, status colors)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Statistics & Visualization

- **STCH-04**: Monthly stitch bar charts with Recharts
- **STCH-05**: Stitching calendar view (monthly grid showing daily activity by project)
- **STCH-06**: Year in Review tab with 8 stat sections and year selector

### Advanced Views

- **VIEW-03**: Draggable widget dashboard layouts with dnd-kit

### Goals & Plans (Advanced)

- **GOAL-03**: Multi-style rotation management (Focus+Rotate, Milestone, Daily, Round Robin, Random, Seasonal)
- **GOAL-04**: Achievement trophy case with auto-tracked milestones, streaks, and records

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Pattern viewer / markup tool | Markup R-XP, Pattern Keeper, Saga are mature specialized apps — don't compete |
| Pattern creation / photo conversion | Entirely different product category |
| Social media share card generation | API integrations fragile, deferred post-MVP |
| Social media direct posting | Instagram API restrictive, ongoing maintenance burden |
| PWA offline support (service workers) | Significant engineering complexity, deferred post-MVP |
| Multi-user account architecture | Enormous scope — single-user first, multi-user aware architecture |
| Import/export functionality | User starting fresh with 500+ charts, no migration needed now |
| Thread stash inventory (total skeins owned) | Complicates supply model, per-project tracking is core need |
| Additional supply brand pre-seeding (Mill Hill, Kreinik, Anchor) | Future if catalog data available |
| iPad app integration | No known APIs |
| Barcode scanning for supplies | DMC doesn't standardize barcodes; search-and-select is faster |
| Automated rotation schedule generator | AI-level complexity for marginal value |
| Real-time multi-user collaboration | Enormous complexity (sync, conflicts, permissions) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| PROJ-01 | Phase 2 | Pending |
| PROJ-02 | Phase 2 | Pending |
| PROJ-03 | Phase 2 | Pending |
| PROJ-04 | Phase 2 | Pending |
| PROJ-05 | Phase 2 | Pending |
| PROJ-06 | Phase 3 | Pending |
| PROJ-07 | Phase 3 | Pending |
| PROJ-08 | Phase 3 | Pending |
| PROJ-09 | Phase 3 | Pending |
| REF-01 | Phase 4 | Pending |
| REF-02 | Phase 4 | Pending |
| REF-03 | Phase 4 | Pending |
| REF-04 | Phase 4 | Pending |
| SUPP-01 | Phase 5 | Pending |
| SUPP-02 | Phase 5 | Pending |
| SUPP-03 | Phase 5 | Pending |
| SUPP-04 | Phase 5 | Pending |
| SUPP-05 | Phase 5 | Pending |
| STCH-01 | Phase 6 | Pending |
| STCH-02 | Phase 6 | Pending |
| STCH-03 | Phase 6 | Pending |
| VIEW-01 | Phase 7 | Pending |
| VIEW-02 | Phase 7 | Pending |
| DASH-01 | Phase 8 | Pending |
| DASH-02 | Phase 8 | Pending |
| DASH-03 | Phase 8 | Pending |
| DASH-04 | Phase 8 | Pending |
| GOAL-01 | Phase 9 | Pending |
| GOAL-02 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
