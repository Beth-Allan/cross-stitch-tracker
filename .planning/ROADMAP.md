# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.0 MVP shipped 2026-04-11 with core CRUD, supplies, fabric, and shopping lists. Iterating based on real usage.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP — "Replace Notion"** — Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** — Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** — Phases 8-9 (shipped 2026-04-20)
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

<details>
<summary>✅ v1.2 Track & Measure (Phases 8-9) — SHIPPED 2026-04-20</summary>

- [x] Phase 8: Session Logging & Pattern Dive (11/11 plans) — completed 2026-04-18
- [x] Phase 9: Dashboards & Shopping Cart (9/9 plans) — completed 2026-04-18

Full details: `milestones/v1.2-ROADMAP.md`

</details>

### 🔧 Inserted Phase

- [ ] **Phase 9.1: Image Optimization on Upload** (INSERTED) - WebP conversion for covers/session photos via Sharp

### 📋 v1.3 Motivation & Planning

- [ ] **Phase 10: Advanced Stats** - Year in Review, monthly charts, stitching calendar
- [ ] **Phase 11: Goals & Scheduling** - Goal setting, rotation management, achievements

## Phase Details

### Phase 9.1: Image Optimization on Upload (INSERTED)
**Goal**: Convert display images (covers, session photos) to optimized WebP on upload, reducing storage ~90% and bandwidth ~12x per gallery page
**Depends on**: Phase 4 (upload pipeline exists)
**Requirements**: See `.planning/research/image-optimization-on-upload.md`
**Success Criteria** (what must be TRUE):
  1. Cover uploads are converted to 1200px WebP q80 and raw original deleted from R2
  2. Session photo uploads are converted to optimized WebP
  3. Existing thumbnail generation continues to work
  4. Working copy files (PDFs, .saga, .oxs, .xsd) are never modified
  5. Upload UX is unchanged (no visible delay or behavior change)
**Plans**: 2 plans
Plans:
- [x] 09.1-01-PLAN.md — Cover image optimization (processAndStoreImage + confirmUpload refactor)
- [x] 09.1-02-PLAN.md — Session photo optimization (createSession + updateSession integration)
**UI hint**: no

### Phase 10: Advanced Stats
**Goal**: Comprehensive statistical views that celebrate stitching progress over time
**Depends on**: Phase 9 (needs session data)
**Requirements**: TBD (v1.3 milestone)
**Success Criteria** (what must be TRUE):
  1. Monthly stitch bar charts visualize activity over time
  2. Stitching calendar shows daily activity by project in a monthly grid
  3. Year in Review tab shows 8 stat sections with year selector
**Plans**: 2 plans
Plans:
- [x] 09.1-01-PLAN.md — Cover image optimization (processAndStoreImage + confirmUpload refactor)
- [ ] 09.1-02-PLAN.md — Session photo optimization (createSession + updateSession integration)
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
**Plans**: 2 plans
Plans:
- [ ] 09.1-01-PLAN.md — Cover image optimization (processAndStoreImage + confirmUpload refactor)
- [ ] 09.1-02-PLAN.md — Session photo optimization (createSession + updateSession integration)
**UI hint**: yes

## Execution Order

- v1.0: 1 → 2 → 3 → 4
- v1.1: 5 → 6 → 7
- v1.2: 8 → 9
- inserted: 9.1
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
| 9. Dashboards & Shopping Cart | v1.2 | 9/9 | Complete | 2026-04-18 |
| 9.1. Image Optimization on Upload | inserted | 0/2 | Planned | - |
| 10. Advanced Stats | v1.3 | 0/TBD | Not started | - |
| 11. Goals & Scheduling | v1.3 | 0/TBD | Not started | - |
