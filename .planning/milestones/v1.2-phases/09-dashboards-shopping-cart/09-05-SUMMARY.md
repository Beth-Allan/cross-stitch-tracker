---
phase: 09-dashboards-shopping-cart
plan: 05
subsystem: project-dashboard-ui
tags: [components, tdd, dashboard, progress-breakdown, finished-tab]
dependency_graph:
  requires: [getProjectDashboardData, ProjectDashboardData-types]
  provides: [HeroStats-component, ProgressBreakdownTab-component, FinishedTab-component, BucketProjectRow-component, FinishedProjectCard-component]
  affects: [project-dashboard-page, dashboard-tabs]
tech_stack:
  added: []
  patterns: [css-stacked-bar-chart, accordion-with-set-state, single-expand-pattern, client-side-sort-with-usememo]
key_files:
  created:
    - src/components/features/dashboard/hero-stats.tsx
    - src/components/features/dashboard/hero-stats.test.tsx
    - src/components/features/dashboard/progress-breakdown-tab.tsx
    - src/components/features/dashboard/progress-breakdown-tab.test.tsx
    - src/components/features/dashboard/bucket-project-row.tsx
    - src/components/features/dashboard/finished-tab.tsx
    - src/components/features/dashboard/finished-tab.test.tsx
    - src/components/features/dashboard/finished-project-card.tsx
  modified: []
decisions:
  - "Pure CSS stacked bar chart (no charting library) — matches DesignOS design, zero bundle cost"
  - "BucketProjectRow as server component (no use client) — pure presentational, receives data via props"
  - "FinishedProjectCard as client component — needs onToggle handler for expand/collapse"
  - "Aggregate stats computed from full project list (not filtered) — filtering only affects card visibility"
metrics:
  duration: "5m 01s"
  completed: "2026-04-18T04:04:37Z"
  tasks_completed: 3
  tasks_total: 3
  tests_added: 14
  tests_passing: 14
---

# Phase 09 Plan 05: Project Dashboard UI Components Summary

Project dashboard UI: HeroStats 6-stat auto-fit grid with font-mono values, ProgressBreakdownTab with pure CSS stacked bar chart and 5 collapsible accordion buckets with 5 sort options, FinishedTab with search/sort and expandable project cards showing stitching statistics grids.

## Tasks Completed

| Task | Name | Type | Commit | Key Files |
|------|------|------|--------|-----------|
| 1 | Write failing tests for HeroStats, ProgressBreakdownTab, FinishedTab | RED | 5e288d4 | hero-stats.test.tsx, progress-breakdown-tab.test.tsx, finished-tab.test.tsx |
| 2 | Implement HeroStats and ProgressBreakdownTab | GREEN | 67b815c | hero-stats.tsx, progress-breakdown-tab.tsx, bucket-project-row.tsx |
| 3 | Implement FinishedTab and FinishedProjectCard | GREEN | e7dc40b | finished-tab.tsx, finished-project-card.tsx |

## Implementation Details

### HeroStats (Server Component)

6-stat auto-fit grid (`grid-cols-[repeat(auto-fit,minmax(140px,1fr))]`) with emerald-50/60 card backgrounds. Stats: Total WIPs, Avg. Progress, Closest to Done, Finished This Year, Finished All Time, Total Stitches. Values use `font-mono text-xl font-bold tabular-nums`. Shows em-dash when closestToCompletion is null. No "use client" directive -- pure presentational.

### ProgressBreakdownTab (Client Component)

- **Stacked bar chart:** Pure CSS flex layout with `h-6 rounded-full bg-muted` container. Segments use bucket accent colors (stone, amber, emerald, sky, violet). Min-width 24px for visibility. Title attributes on segments for tooltip accessibility.
- **Legend:** Inline flex-wrap colored dots below the bar.
- **5 sort options:** closestToDone (default), furthestFromDone, mostStitchingDays, fewestStitchingDays, recentlyStitched. Client-side sort via `useMemo`.
- **Accordion buckets:** `useState<Set<ProgressBucketId>>` for expansion (all collapsed by default per D-13). Tinted backgrounds per bucket. Chevron rotates with `transition-transform duration-200`. `aria-expanded` on trigger buttons.
- **Pagination:** 10 per page with "Show more (N remaining)" link.

### BucketProjectRow (Server Component)

Row with cover thumbnail (32x32), project name as Link to `/charts/{chartId}`, designer, progress bar (h-1.5 with bucket accent color fill), stitch count. Mobile hides progress bar and last-stitched columns. Uses existing CoverPlaceholder component.

### FinishedTab (Client Component)

- **4 sort options:** finishDate (default, newest first), startToFinish, stitchCount, stitchingDays. Null values sort last.
- **Search:** Filters by projectName or designerName. Resets pagination on input change.
- **Aggregate stat cards:** Violet-50 bg with violet-100 border (distinct from emerald hero stats per UI-SPEC). Shows: Projects Finished, Total Stitches, Avg Duration, Avg Daily Stitches. Computed from full list, not filtered subset.
- **Empty states:** "No finished projects yet. Your first finish is going to feel amazing!" (no projects) and "No finished projects match your search." (search with no results).

### FinishedProjectCard (Client Component)

- **Compact header:** Cover thumbnail (48x48), project name, designer, stitch count, finish date. ChevronDown rotates 180deg on expand.
- **Single-expand:** Parent FinishedTab manages `expandedId` via useState. Expanding one collapses previous.
- **Expanded panel:** Genre tags as muted rounded badges. Stats grid (`auto-fill, minmax(140px, 1fr)`) with: Start to Finish, Stitching Days, Total Stitches, Avg Daily, Threads, Beads, Specialty. "View project details" link using buttonVariants.

## Test Coverage

14 tests across 3 test files:

**HeroStats (3 tests):** Renders all 6 stat labels, values have font-mono class, em-dash for null closestToCompletion.

**ProgressBreakdownTab (5 tests):** Stacked bar chart renders, all 5 bucket headers present, all collapsed by default, sort dropdown with 5 options, sort change reorders projects.

**FinishedTab (6 tests):** Sort dropdown with 4 options, default sort is finishDate, search input renders, empty state (no projects), search empty state, aggregate stat cards with bg-violet-50.

## Deviations from Plan

None -- plan executed exactly as written.

## TDD Gate Compliance

- RED gate: `test(09-05)` commit 5e288d4 -- 14 tests, 13 failing (1 collapsed-default test trivially passes on null stub)
- GREEN gate: `feat(09-05)` commits 67b815c + e7dc40b -- 14 tests, all passing
- REFACTOR gate: Not needed -- implementations are clean, no duplication

## Self-Check: PASSED

- [x] src/components/features/dashboard/hero-stats.tsx exists
- [x] src/components/features/dashboard/hero-stats.test.tsx exists
- [x] src/components/features/dashboard/progress-breakdown-tab.tsx exists
- [x] src/components/features/dashboard/progress-breakdown-tab.test.tsx exists
- [x] src/components/features/dashboard/bucket-project-row.tsx exists
- [x] src/components/features/dashboard/finished-tab.tsx exists
- [x] src/components/features/dashboard/finished-tab.test.tsx exists
- [x] src/components/features/dashboard/finished-project-card.tsx exists
- [x] Commit 5e288d4 (RED) verified
- [x] Commit 67b815c (GREEN - HeroStats/ProgressBreakdownTab) verified
- [x] Commit e7dc40b (GREEN - FinishedTab/FinishedProjectCard) verified
- [x] SUMMARY.md created in plan directory
