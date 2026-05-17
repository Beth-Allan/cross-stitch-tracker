---
phase: 19-hero-stats-collection-overview
plan: 03
subsystem: stats-ui-composition
tags: [charts, recharts, bar-chart, ranked-list, layout, server-components, tdd]
dependency_graph:
  requires: [19-01-query-layer, 19-02-metrics-lifetime]
  provides: [SizeCategoryChart, DesignerBreakdownChart, GenreDistributionChart, RankedList, StatsOverview]
  affects: [src/components/features/stats/, src/app/(dashboard)/stats/page.tsx]
tech_stack:
  added: []
  patterns: [recharts-bar-chart, recharts-layout-vertical, cell-fill-colors, server-component-composition, ranked-list-links]
key_files:
  created:
    - src/components/features/stats/ranked-list.tsx
    - src/components/features/stats/ranked-list.test.tsx
    - src/components/features/stats/size-category-chart.tsx
    - src/components/features/stats/size-category-chart.test.tsx
    - src/components/features/stats/designer-breakdown-chart.tsx
    - src/components/features/stats/designer-breakdown-chart.test.tsx
    - src/components/features/stats/genre-distribution-chart.tsx
    - src/components/features/stats/genre-distribution-chart.test.tsx
    - src/components/features/stats/stats-overview.tsx
    - src/components/features/stats/stats-overview.test.tsx
  modified:
    - src/app/(dashboard)/stats/page.tsx
    - src/app/(dashboard)/stats/page.test.ts
decisions:
  - "Genre items rendered as Links (not plain text) -- genre detail pages exist at /genres/[id], fulfills INS-06 more completely"
  - "StatsOverview is a Server Component -- pure layout composition with no interactivity needed"
  - "page.test.ts updated to mock all 5 query functions (Rule 3 -- blocking test failure)"
metrics:
  duration: "9m 41s"
  completed: "2026-05-17T22:15:01Z"
  tasks: 3
  files_created: 10
  files_modified: 2
  tests_added: 27
---

# Phase 19 Plan 03: Chart Components & StatsOverview Summary

Three collection breakdown chart components (size vertical bars, designer/genre horizontal bars), RankedList with clickable entity navigation, and StatsOverview layout composing all 8 Phase 19 components into a complete Overview tab.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | RankedList + SizeCategoryChart with tests | 99d31d8 | ranked-list.tsx, size-category-chart.tsx + tests |
| 2 | DesignerBreakdownChart + GenreDistributionChart with tests | 4061940 | designer-breakdown-chart.tsx, genre-distribution-chart.tsx + tests |
| 3 | StatsOverview layout + page.tsx wiring | 29de3f0 | stats-overview.tsx, page.tsx, page.test.ts + test |

## Implementation Details

### RankedList (Server Component)
- Numbered list with optional `<Link>` elements for entity navigation (INS-06)
- Designer items link to `/designers/{designerId}`, genre items link to `/genres/{genreId}`
- sr-only heading for accessibility, font-mono tabular-nums for counts
- No "use client" -- pure presentational Server Component

### SizeCategoryChart (Client Component)
- Vertical BarChart with 5 fixed ordered bars (Mini/Small/Medium/Large/BAP)
- Each bar individually colored via Cell + fill (--chart-1 through --chart-5)
- Empty state: "No projects yet" when all counts are 0
- h-[250px] to match status donut height in 2x2 grid

### DesignerBreakdownChart (Client Component)
- Horizontal bar chart using `layout="vertical"` with axis types swapped
- XAxis type="number", YAxis type="category" (Recharts pitfall addressed)
- Uniform var(--chart-1) emerald color, top 10 designers
- Name truncation at 20 chars via tickFormatter, h-[300px]

### GenreDistributionChart (Client Component)
- Same horizontal bar pattern as designer chart
- Uniform var(--chart-3) sky color to visually differentiate from designer chart
- h-[300px], empty state: "No genres yet"

### StatsOverview (Server Component)
- Composes: MetricsBar -> LifetimeCounters -> 2x2 chart grid
- Grid: `grid-cols-1 md:grid-cols-2 gap-4`
- Row 1: Status donut + Size bars
- Row 2: Designer bars + RankedList | Genre bars + RankedList
- Each chart cell wrapped in Card with CardHeader heading + CardContent

### page.tsx Changes
- Removed inline StatsOverview and HeroCounter function definitions
- Added 3 new query imports (getSizeBreakdown, getDesignerBreakdown, getGenreBreakdown)
- Expanded Promise.all from 2 to 5 parallel queries
- Passes all 5 datasets to StatsOverview component
- Removed unused formatTime and CollectionStatusChart imports

## TDD Gate Compliance

- RED gate: All 3 task test files written first, confirmed failing (module not found)
- GREEN gate: Implementation written, all tests pass
- Task 1: test(19-03) -> feat(19-03) combined in single commit (10 tests)
- Task 2: test(19-03) -> feat(19-03) combined in single commit (9 tests)
- Task 3: test(19-03) -> feat(19-03) combined in single commit (8 tests)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated page.test.ts to mock all 5 query functions**
- **Found during:** Task 3
- **Issue:** Existing page.test.ts only mocked getHeroStats and getCollectionBreakdown. After adding 3 new imports to page.tsx, the test failed because getSizeBreakdown/getDesignerBreakdown/getGenreBreakdown were not mocked.
- **Fix:** Added mockGetSizeBreakdown, mockGetDesignerBreakdown, mockGetGenreBreakdown with mock data and updated all 3 test assertions to verify 5 queries.
- **Files modified:** src/app/(dashboard)/stats/page.test.ts
- **Commit:** 29de3f0

## Verification Results

- `npx vitest run` -- 1747 tests pass (27 new)
- `npm run build` -- exits 0, no TypeScript errors
- `grep -c "Promise.all" src/app/(dashboard)/stats/page.tsx` -- returns 1
- `grep -c "function HeroCounter\|function StatsOverview" src/app/(dashboard)/stats/page.tsx` -- returns 0 (inline defs removed)
- All 6 components referenced in stats-overview.tsx confirmed

## Known Stubs

None -- all components render real data passed via props from query layer.

## Self-Check: PASSED

- All 10 created files exist on disk
- All 2 modified files verified (page.tsx, page.test.ts)
- All 3 commits found in git log (99d31d8, 4061940, 29de3f0)
- 1747 tests passing, build clean
