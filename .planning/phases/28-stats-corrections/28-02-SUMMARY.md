---
phase: 28-stats-corrections
plan: 02
subsystem: stats-ui
tags: [stats, overview, records, filter, insights]
dependency_graph:
  requires: [28-01]
  provides: [StatusFilterPills, restructured-overview, simplified-records]
  affects: [stats-page, lifetime-counters]
tech_stack:
  added: []
  patterns: [nuqs-multi-select-toggle, hero-stat-card]
key_files:
  created:
    - src/components/features/stats/status-filter-pills.tsx
    - src/components/features/stats/status-filter-pills.test.tsx
    - src/components/features/stats/records-overview.test.tsx
  modified:
    - src/components/features/stats/stats-overview.tsx
    - src/components/features/stats/stats-overview.test.tsx
    - src/components/features/stats/records-overview.tsx
    - src/components/features/stats/lifetime-counters.tsx
    - src/components/features/stats/lifetime-counters.test.tsx
    - src/app/(dashboard)/stats/page.tsx
decisions:
  - "Insights moved from Records to Overview tab with StatusFilterPills (D-01, D-05)"
  - "RankedList removed from designer/genre chart cards (D-12)"
  - "Records tab always shows all-time data, no YearScopeToggle (D-03)"
  - "Session hero stat uses totalLifetimeStitches from heroStats (D-04)"
  - "LifetimeCounters renamed to COLLECTION TOTAL using collectionTotalStitches (D-09)"
metrics:
  duration: "6 minutes"
  completed: "2026-05-24T01:54:00Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 15
  tests_modified: 14
  tests_total: 202
---

# Phase 28 Plan 02: Component Restructuring Summary

StatusFilterPills multi-select toggle with nuqs URL state, insights relocated to Overview tab, Records simplified to session-only content with hero stat, COLLECTION TOTAL label rename.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `21ecfe1` | test | Failing tests for StatusFilterPills, StatsOverview insights, LifetimeCounters rename |
| `c17eaf8` | feat | StatusFilterPills, insights on Overview, COLLECTION TOTAL label |
| `eccf079` | test | Failing tests for simplified RecordsOverview with session hero stat |
| `cf45746` | feat | Simplify RecordsOverview, add session hero stat, rewire page.tsx |

## Task Details

### Task 1: StatusFilterPills + StatsOverview restructure + LifetimeCounters rename

- Created `StatusFilterPills` client component with `useQueryState` multi-select toggle
  - 4 pills: All, Not Started, In Progress, Complete
  - `role="group"` with `aria-label="Filter by status"`, `aria-pressed` on each pill
  - Styling matches existing `YearScopeToggle` exactly (bg-muted container, selected/muted states)
- Moved `ThreadInsightList`, `DesignerInsightList`, `GenreInsightList` into `StatsOverview`
- Removed both `RankedList` instances from designer and genre chart cards
- Renamed `LifetimeCounters` prop from `totalLifetimeStitches` to `collectionTotalStitches`
- Changed label from "TOTAL STITCHES" to "COLLECTION TOTAL"
- 7 new tests for StatusFilterPills, 8 modified tests for StatsOverview, 7 modified tests for LifetimeCounters

### Task 2: RecordsOverview simplification + page.tsx rewiring

- Removed `YearScopeToggle`, `ThreadInsightList`, `DesignerInsightList`, `GenreInsightList` from RecordsOverview
- Added `totalSessionStitches` hero stat card with "STITCHES LOGGED" label
- Rewired `page.tsx`:
  - Insight queries (`getThreadInsights`, `getDesignerInsights`, `getGenreInsights`) pass `status` array
  - Records queries (`getPersonalBests`, `getFastestCompletions`, `getCompletionEstimates`) always pass `"all"`
  - Insight props flow to `StatsOverview`, not `RecordsOverview`
  - `totalSessionStitches` passed to `RecordsOverview` from `heroStats.totalLifetimeStitches`
- 8 new tests for RecordsOverview covering hero stat, empty state, no-insight/no-scope assertions

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- Task 1: `test(28-02)` commit `21ecfe1` (RED) -> `feat(28-02)` commit `c17eaf8` (GREEN)
- Task 2: `test(28-02)` commit `eccf079` (RED) -> `feat(28-02)` commit `cf45746` (GREEN)

## Verification

- 202/202 stats component tests passing across 26 test files
- All acceptance criteria verified programmatically
- No stubs found in created/modified files
- Threat model T-28-04 mitigated: `parseAsStringLiteral` validates on both client and server
