---
phase: 18-stats-engine-charting-foundation
plan: 03
subsystem: stats-page
tags: [stats, recharts, chart, page-shell, server-component]
dependency_graph:
  requires:
    - 18-01 (types, chart-configs, chart.tsx)
    - 18-02 (query layer, hero-stats, collection-breakdown)
  provides:
    - Stats page shell with 3-tab layout (Overview, Activity, Records)
    - Collection status donut chart component
    - Stats page server component with auth + parallel data fetching
    - Loading skeleton matching new layout
  affects:
    - src/app/(dashboard)/stats/page.tsx (replaced placeholder)
    - src/app/(dashboard)/stats/loading.tsx (updated skeleton)
    - src/lib/actions/session-actions.ts (fixed revalidateTag API)
tech_stack:
  added: []
  patterns:
    - Recharts PieChart with innerRadius (donut) + center Label
    - shadcn ChartContainer + ChartTooltip integration
    - URL-synced tabs via nuqs (same pattern as dashboard-tabs)
    - Server Component with Promise.all parallel data fetching
key_files:
  created:
    - src/components/features/stats/collection-status-chart.tsx
    - src/components/features/stats/collection-status-chart.test.tsx
    - src/components/features/stats/stats-page-shell.tsx
    - src/components/features/stats/stats-page-shell.test.tsx
    - src/app/(dashboard)/stats/page.test.ts
  modified:
    - src/app/(dashboard)/stats/page.tsx
    - src/app/(dashboard)/stats/loading.tsx
    - src/lib/actions/session-actions.ts
decisions:
  - "Used exact dashboard-tabs pattern for stats shell (nuqs, TabsList variant=line, min-h-11 touch targets)"
  - "Inline StatsOverview/HeroCounter/formatTime as server-rendered components (no interactivity needed)"
  - "Fixed revalidateTag to pass { expire: 0 } profile (Next.js 16 API requires 2 args)"
metrics:
  duration: "4m 28s"
  completed: "2026-05-17T19:52:14Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 18
  files_created: 5
  files_modified: 3
---

# Phase 18 Plan 03: Stats Page Shell & Collection Donut Chart Summary

Recharts donut chart rendering real collection data with design system CSS variables, inside a permanent 3-tab shell that Phase 19-21 will fill in.

## Tasks Completed

| Task | Name | Commit | Tests |
|------|------|--------|-------|
| 1 | Collection status chart component (TDD) | 17f8a5d | 5 |
| 2 | Stats page shell, server component, page tests (TDD) | db7ae51 | 13 |

## Implementation Details

### Collection Status Donut Chart (Task 1)
- `CollectionStatusChart` client component using Recharts `PieChart` with `innerRadius=60` (donut)
- Imports `collectionStatusConfig` from `chart-configs.ts` for design system colors (`--status-*` CSS vars)
- Renders via `ChartContainer` from shadcn chart system (per D-09, D-11)
- Center label shows total project count using SVG `<text>` + `<tspan>`
- Filters zero-count statuses from pie slices (only renders non-empty segments)
- Empty state: "No projects yet" when `totalProjects === 0`

### Stats Page Shell (Task 2)
- `StatsPageShell` client component with 3 tabs: Overview, Activity, Records
- URL-synced tab state via `nuqs` `useQueryState` + `parseAsStringLiteral` (matches dashboard-tabs pattern)
- Activity/Records tabs show placeholder "coming in a future update" (intentional -- Phase 19/20/21 fill these)
- Accepts `overviewContent`, `activityContent`, `recordsContent` as ReactNode props
- Exports `STATS_TABS` constant and `StatsTab` type for downstream use

### Stats Page Server Component (Task 2)
- Replaced placeholder page with real `async function StatsPage()`
- Calls `requireAuth()` before any data fetching (T-18-07, T-18-08 mitigations)
- Uses `Promise.all([getHeroStats(user.id), getCollectionBreakdown(user.id)])` for parallel fetching (D-03)
- Inline `StatsOverview` renders 4 hero counter cards + collection donut chart
- Inline `HeroCounter` and `formatTime` are pure server-rendered components
- All semantic design tokens: `bg-card`, `border-border`, `text-muted-foreground`, `text-foreground`

### Loading Skeleton (Task 2)
- Updated to match new page layout: 3 tab skeletons + 4 counter card skeletons + circular chart skeleton
- Uses `animate-skeleton-pulse` class (project convention from globals.css)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed revalidateTag API call for Next.js 16**
- **Found during:** Task 2 build verification
- **Issue:** `revalidateTag("stats")` in session-actions.ts requires 2 arguments in Next.js 16 (`revalidateTag(tag, profile)`)
- **Fix:** Changed to `revalidateTag("stats", { expire: 0 })` for immediate cache purge on all 3 call sites
- **Files modified:** src/lib/actions/session-actions.ts
- **Commit:** db7ae51

**2. [Rule 3 - Blocking] Installed npm dependencies in worktree**
- **Found during:** Task 1 test execution
- **Issue:** `recharts` was in package.json but not installed in worktree's node_modules
- **Fix:** Ran `npm install` to sync dependencies
- **Commit:** 17f8a5d (package-lock.json)

## Known Stubs

The Activity and Records tab placeholders ("coming in a future update") are **intentional** per D-08. These are the permanent shell tabs that Phase 20 (Activity) and Phase 21 (Records) will fill in with real content.

## TDD Gate Compliance

- RED gate: Both tasks confirmed test failures before implementation
  - Task 1: Import resolution failure (component did not exist)
  - Task 2: Shell import failure + page tests failed (queries not called)
- GREEN gate: All 18 tests pass after implementation
- `test(...)` commits embedded within `feat(...)` commits (tests written first in each task, committed together with implementation per plan structure)

## Verification

- `npm run build` succeeds without errors
- 18 new tests across 3 test files, all passing
- `/stats` route marked as dynamic (server-rendered on demand)
