# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.3 shipped 2026-05-16 with keyboard-driven supply table, merged creation form, supply takeover mode, edit mode, and full deprecated component cleanup. v1.4 addresses targeted fixes and polish: chart file management, input bug, dashboard sizing, and image focal point control.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP -- "Replace Notion"** -- Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** -- Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** -- Phases 8-9.1 (shipped 2026-04-20)
- ✅ **v1.3 Form & Supply Overhaul** -- Phases 10-14 (shipped 2026-05-16)
- 📋 **v1.4 Fixes & Polish** -- Phases 15-17 (in progress)

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

### v1.4 Fixes & Polish

- [x] **Phase 15: Chart File Management** - Multiple digital working copies per chart with add/remove lifecycle -- completed 2026-05-17
- [ ] **Phase 16: Input & Dashboard Fixes** - SearchToAdd keystroke bug fix and Spotlight section sizing corrections
- [ ] **Phase 17: Image Focal Point** - Click-to-set anchor point for cover images across all display contexts

## Phase Details

### Phase 15: Chart File Management
**Goal**: Users can manage multiple digital working copy files per chart instead of a single URL
**Depends on**: Nothing (independent feature)
**Requirements**: FILE-01, FILE-02, FILE-03
**Success Criteria** (what must be TRUE):
  1. User can attach multiple working copy files to a chart (not limited to one)
  2. User can add a new working copy file without affecting existing files
  3. User can remove a specific working copy file without affecting others
  4. User can see all attached working copies listed on the project detail page with filenames and download links
**Plans**: 4/4 complete
Plans:
- [x] 15-01-PLAN.md — Schema, server actions, validation constants
- [x] 15-02-PLAN.md — Multi-file upload component and creation form integration
- [x] 15-03-PLAN.md — Project detail file list UI with add/remove lifecycle
- [x] 15-04-PLAN.md — Data migration and codebase cleanup
**UI hint**: yes

### Phase 16: Input & Dashboard Fixes
**Goal**: SearchToAdd input works reliably and the Dashboard Spotlight section displays at correct proportions
**Depends on**: Nothing (independent fixes)
**Requirements**: INPUT-01, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can type "310" (or any multi-digit code) quickly in SearchToAdd without keystrokes being dropped
  2. Spotlight "Rediscover This One" image displays at a constrained, proportional size (not dominating the section)
  3. "Check it Out" and "Shuffle Spotlight" buttons render at matching, visually balanced sizes
**Plans**: 4/4 complete
Plans:
- [x] 15-01-PLAN.md — Schema, server actions, validation constants
- [x] 15-02-PLAN.md — Multi-file upload component and creation form integration
- [x] 15-03-PLAN.md — Project detail file list UI with add/remove lifecycle
- [x] 15-04-PLAN.md — Data migration and codebase cleanup
**UI hint**: yes

### Phase 17: Image Focal Point
**Goal**: Users can control which area of a cover image stays visible when the image is cropped in different display contexts
**Depends on**: Nothing (independent feature)
**Requirements**: IMG-01, IMG-02
**Success Criteria** (what must be TRUE):
  1. User can click/tap on a cover image to set its focal point (anchor position)
  2. The focal point is stored and persisted across page loads
  3. Gallery cards display cover images cropped to the saved focal point
  4. Dashboard cards, hero banners, and project detail all respect the same focal point
**Plans**: 4/4 complete
Plans:
- [x] 15-01-PLAN.md — Schema, server actions, validation constants
- [x] 15-02-PLAN.md — Multi-file upload component and creation form integration
- [x] 15-03-PLAN.md — Project detail file list UI with add/remove lifecycle
- [x] 15-04-PLAN.md — Data migration and codebase cleanup
**UI hint**: yes

## Execution Order

- v1.0: 1 -> 2 -> 3 -> 4
- v1.1: 5 -> 6 -> 7
- v1.2: 8 -> 9 -> 9.1
- v1.3: 10 -> 11 -> 12 -> 13 -> 14
- v1.4: 15 -> 16 -> 17

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
| 15. Chart File Management | v1.4 | 0/4 | Not started | - |
| 16. Input & Dashboard Fixes | v1.4 | 0/? | Not started | - |
| 17. Image Focal Point | v1.4 | 0/? | Not started | - |
