---
phase: 22-critical-fixes-test-infrastructure
plan: 03
subsystem: stats
tags: [resilience, promise-allsettled, nullable-props, graceful-degradation]
dependency_graph:
  requires: []
  provides: [settled-utility, nullable-stats-components]
  affects: [stats-page, stats-overview, activity-overview, records-overview]
tech_stack:
  added: []
  patterns: [Promise.allSettled, nullable-props-with-fallback, DataUnavailable-component]
key_files:
  created:
    - src/lib/utils/settled.ts
    - src/lib/utils/settled.test.ts
    - src/components/features/stats/data-unavailable.tsx
  modified:
    - src/app/(dashboard)/stats/page.tsx
    - src/components/features/stats/stats-overview.tsx
    - src/components/features/stats/activity-overview.tsx
    - src/components/features/stats/records-overview.tsx
decisions:
  - "Used indexed settled() calls instead of .map() + type assertion for better type safety"
  - "Created shared DataUnavailable component (server component) instead of duplicating in each file"
  - "RecordsTable shows DataUnavailable when either personalBests OR fastestCompletions is null (they share the card)"
  - "availableYears passed as ?? [] to YearScopeToggle for null fallback"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-18T21:34:42Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 3
  tests_total: 1970
---

# Phase 22 Plan 03: Stats Page Promise.allSettled Resilience Summary

Stats page converted from fragile Promise.all to resilient Promise.allSettled with settled() utility and nullable prop handling across all 3 tab components.

## What Changed

### Task 1: settled() utility + stats page conversion (1867ce9)
- Created `settled<T>()` generic helper that extracts fulfilled values from PromiseSettledResult, returning null for rejected
- Added 3 unit tests (fulfilled, rejected, complex types)
- Converted stats page from `Promise.all` (17 queries) to `Promise.allSettled` with per-result `settled()` extraction
- Fixed `hasNoSessions` to defensively check `heroStats === null` before accessing `.totalSessions` (D-03)
- Updated `availableYears` prop to use optional chaining with null fallback

### Task 2: Nullable props + DataUnavailable fallbacks (12e0952)
- Created shared `DataUnavailable` server component with Card wrapper and muted text
- Updated `StatsOverview` interface: 5 data props now `| null`, each section guarded with fallback
- Updated `ActivityOverview` interface: 5 data props now `| null`, each section guarded with fallback
- Updated `RecordsOverview` interface: 7 data props now `| null`, each section guarded with fallback
- `YearScopeToggle` receives `availableYears ?? []` for null safety

## Decisions Made

1. **Indexed settled() over .map()**: Using `settled<T>(results[N])` with explicit type parameters instead of `results.map(r => settled(r)) as [...]` avoids union-type inference issues and keeps each variable independently typed
2. **Shared DataUnavailable component**: Single server component imported by all 3 tabs -- cleaner than duplicating the fallback card pattern
3. **Combined RecordsTable guard**: personalBests and fastestCompletions share a single Card, so both must be non-null to render the RecordsTable

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `Promise.allSettled` in page.tsx | 1 occurrence |
| `settled` references in page.tsx | 18 (import + 17 calls) |
| StatsOverview `\| null` props | 5 |
| ActivityOverview `\| null` props | 5 |
| RecordsOverview `\| null` props | 7 |
| DataUnavailable in 4 files | stats-overview, activity-overview, records-overview, data-unavailable |
| hasNoSessions defensive null check | Present |
| settled.test.ts | 3/3 passing |
| Full test suite | 1970/1970 passing |

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 1867ce9 | feat(22-03): add settled() utility and convert stats page to Promise.allSettled |
| 2 | 12e0952 | feat(22-03): update stats tab components to handle nullable props |

## Self-Check: PASSED

- All 3 created files verified on disk
- Commit 1867ce9 verified in git log
- Commit 12e0952 verified in git log
