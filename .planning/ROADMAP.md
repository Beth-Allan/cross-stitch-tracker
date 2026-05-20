# Roadmap: Cross Stitch Tracker

## Overview

Cross-stitch project management app replacing Notion. v1.5 shipped 2026-05-18 with a comprehensive statistics dashboard — lifetime counters, activity charts, stitching calendar, personal records, celebration confetti, and supply/designer/genre insights. 6 milestones shipped (v1.0-v1.5), 21 phases complete.

Design components from `product-plan/sections/` are imported and adapted as each phase's UI is built. See `.claude/rules/ui-design-reference.md` for the mapping.

## Milestones

- ✅ **v1.0 MVP -- "Replace Notion"** -- Phases 1-4 (shipped 2026-04-11)
- ✅ **v1.1 Browse & Organize** -- Phases 5-7 (shipped 2026-04-16)
- ✅ **v1.2 Track & Measure** -- Phases 8-9.1 (shipped 2026-04-20)
- ✅ **v1.3 Form & Supply Overhaul** -- Phases 10-14 (shipped 2026-05-16)
- ✅ **v1.4 Fixes & Polish** -- Phases 15-17 (shipped 2026-05-17)
- ✅ **v1.5 Statistics & Records** -- Phases 18-21 (shipped 2026-05-18)
- 🚧 **v1.6 Cleanup & Hardening** -- Phases 22-26 (in progress)

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

<details>
<summary>✅ v1.5 Statistics & Records (Phases 18-21) -- SHIPPED 2026-05-18</summary>

- [x] Phase 18: Stats Engine & Charting Foundation (3/3 plans) -- completed 2026-05-17
- [x] Phase 19: Hero Stats & Collection Overview (3/3 plans) -- completed 2026-05-17
- [x] Phase 20: Activity Visualization & Calendar (4/4 plans) -- completed 2026-05-18
- [x] Phase 21: Records, Insights & Celebrations (4/4 plans) -- completed 2026-05-18

Full details: `milestones/v1.5-ROADMAP.md`

</details>

### v1.6 Cleanup & Hardening (In Progress)

**Milestone Goal:** Address all accumulated backlog items -- bug fixes, test gaps, code quality issues, UX polish, cache correctness, and silent failure handling -- to harden the app before building new features.

- [x] **Phase 22: Critical Fixes & Test Infrastructure** - Fix security gaps, TypeScript errors, stats resilience, and test infrastructure (completed 2026-05-18)
- [x] **Phase 23: Test Coverage & Reliability** - Fill test gaps and fix silent failures and cache staleness (completed 2026-05-18)
- [x] **Phase 24: Code Quality** - Type narrowing, constant deduplication, discriminated unions, and comment cleanup (completed 2026-05-19)
- [x] **Phase 25: Shopping Cart Scaling** - Shopping cart handles 75+ projects with search, filtering, and status grouping (completed 2026-05-20)
- [ ] **Phase 26: UX Polish** - ARIA compliance, visual consistency, and component UX improvements

## Phase Details

### Phase 22: Critical Fixes & Test Infrastructure
**Goal**: The app's critical security, type-safety, and resilience gaps are closed, and the test infrastructure is reliable for subsequent test-writing phases
**Depends on**: Nothing (first phase of v1.6)
**Requirements**: CRIT-01, CRIT-03, CRIT-04, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Server actions reject supply operations when the project belongs to a different user
  2. All three test files (dashboard-tabs, chart-actions, shopping-cart-actions) compile without TypeScript errors
  3. Stats page renders partial data when individual queries fail instead of showing an error page
  4. createMockPrisma() provides sensible defaults for $transaction and vacuous assertions are eliminated
  5. Stats actions return appropriate errors for unauthenticated requests and invalid Zod inputs
**Plans:** 3/3 plans complete
Plans:
- [x] 22-01-PLAN.md -- Test infrastructure: $transaction defaults + mockTransaction helper + fix 3 test files
- [x] 22-02-PLAN.md -- Security + auth: supply ownership rejection tests + stats-actions auth restructuring
- [x] 22-03-PLAN.md -- Stats resilience: Promise.allSettled + settled() utility + nullable component props

### Phase 23: Test Coverage & Reliability
**Goal**: Test coverage gaps are filled for edge cases across the app, and silent failures in session handling and cache staleness in stats are resolved
**Depends on**: Phase 22
**Requirements**: TEST-01, TEST-04, TEST-05, TEST-06, RELY-01, RELY-02, RELY-03, RELY-04
**Success Criteria** (what must be TRUE):
  1. Skein calculator tests cover fabricCount=0 and resolveDefaultBrandId edge cases
  2. StitchingCalendar tests verify correct behavior when navigating across year boundaries (Jan-Dec, Dec-Jan)
  3. Record detection correctly handles two sessions on the same day with identical stitch counts
  4. Completion estimates exclude already-completed projects from the list
  5. File deletion and photo upload errors in session-actions are surfaced to the user instead of silently swallowed
  6. Stats data refreshes when chart status changes or supply mutations occur (no stale cache)
  7. Session logging warns when stitch counts would push a project over 100% progress
**Plans:** 3/3 plans complete
Plans:
- [x] 23-01-PLAN.md -- Edge case tests: calendar year-rollover, record detection duplicates, completion estimate exclusions
- [x] 23-02-PLAN.md -- Session reliability: file error visibility, deleteSession photo cleanup, over-100% progress guardrail
- [x] 23-03-PLAN.md -- Cache staleness: revalidateTag on chart status + supply mutations, resolveDefaultBrandId tests

### Phase 24: Code Quality
**Goal**: Stats types use precise TypeScript representations, shared utilities are deduplicated, and code comments follow project conventions
**Depends on**: Phase 22
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09, QUAL-10, QUAL-11, QUAL-12, QUAL-13, QUAL-14, QUAL-15, QUAL-16
**Success Criteria** (what must be TRUE):
  1. strandCount, MonthLabel, DayLabel, and BrokenRecordType use literal union types instead of broad string/number
  2. PersonalBestRecord is a discriminated union with no nullable fields that should be required per variant
  3. SORT_FIELDS/SORT_DIRS, buildDateFilter, and Scope type each have a single source of truth with no duplicated definitions
  4. All WHAT-comments (~27), low-harm JSX section markers (~20), and planning doc references are removed from code
  5. Hardcoded emerald-* classes in log-session-modal use semantic design tokens
  6. assertSuccess/assertFailure test helpers exist and all vacuous assertion patterns are replaced project-wide
**Plans:** 4/4 plans complete
Plans:
- [x] 24-01-PLAN.md -- Type contracts: literal unions, discriminated union, shared buildDateFilter, SORT exports, convention rule
- [x] 24-02-PLAN.md -- Consumer updates: query modules, components, and page wired to new types and shared utils
- [x] 24-03-PLAN.md -- Comment cleanup: JSX markers, semantic tokens, WHAT-comments, planning doc references
- [x] 24-04-PLAN.md -- Test assertion guards: assertSuccess/assertFailure helpers + vacuous assertion sweep

### Phase 25: Shopping Cart Scaling
**Goal**: The shopping cart is usable with 75+ projects through search, filtering, status grouping, and supply-type search
**Depends on**: Phase 22
**Requirements**: CRIT-02
**Success Criteria** (what must be TRUE):
  1. User can search projects by name in the shopping cart project list
  2. Projects are grouped by status (Kitting, Stitching, Unstarted, etc.) for faster scanning
  3. User can search/filter supplies by type in the By Supply aggregation view
  4. Shopping cart remains responsive with 75+ selected projects
**Plans:** 2/2 plans complete
Plans:
- [x] 25-01-PLAN.md -- New components: ProjectSearchInput, SupplySearchInput, StatusGroup, SelectionCounter with tests
- [x] 25-02-PLAN.md -- Integration: wire search, grouping, and smart selection into shopping cart + supply overview

### Phase 26: UX Polish
**Goal**: Accessibility violations are fixed, visual inconsistencies are resolved, and interactive components provide clear affordances
**Depends on**: Phase 22
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09, UX-10, UX-11, UX-12, UX-13, UX-14
**Success Criteria** (what must be TRUE):
  1. Clickable card rows use proper ARIA patterns without nested interactive elements
  2. SearchToAdd keyboard highlight only activates after arrow key input, not on initial render or mouse hover
  3. Focal point action bar does not obscure the bottom 25% of the cover image
  4. What's Next cards match gallery card styling, and kitting labels show appropriate text at 0% progress
  5. Supply table add row has a visible commit button, InlineCreateDialog labels are contextual per supply type, and EditableNumber shows feedback on rejected input
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phase 22 first (foundation). Phases 23, 24, 25, 26 depend only on Phase 22 and can proceed in any order.

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
| 18. Stats Engine & Charting Foundation | v1.5 | 3/3 | Complete | 2026-05-17 |
| 19. Hero Stats & Collection Overview | v1.5 | 3/3 | Complete | 2026-05-17 |
| 20. Activity Visualization & Calendar | v1.5 | 4/4 | Complete | 2026-05-18 |
| 21. Records, Insights & Celebrations | v1.5 | 4/4 | Complete | 2026-05-18 |
| 22. Critical Fixes & Test Infrastructure | v1.6 | 3/3 | Complete    | 2026-05-18 |
| 23. Test Coverage & Reliability | v1.6 | 3/3 | Complete    | 2026-05-18 |
| 24. Code Quality | v1.6 | 4/4 | Complete    | 2026-05-19 |
| 25. Shopping Cart Scaling | v1.6 | 2/2 | Complete   | 2026-05-20 |
| 26. UX Polish | v1.6 | 0/? | Not started | - |
