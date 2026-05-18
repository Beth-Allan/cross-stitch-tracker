---
phase: 18-stats-engine-charting-foundation
plan: 01
subsystem: stats-foundation
tags: [charting, types, timezone, date-fns, recharts]
dependency_graph:
  requires: []
  provides: [stats-types, chart-configs, timezone-utility, recharts]
  affects: [src/types/stats.ts, src/lib/chart-configs.ts, src/lib/queries/stats/]
tech_stack:
  added: [recharts@3.8.0, date-fns@4.1.0, "@date-fns/tz@1.4.1"]
  patterns: [TZDate-timezone-boundaries, ChartConfig-satisfies, CSS-variable-tokens]
key_files:
  created:
    - src/types/stats.ts
    - src/lib/chart-configs.ts
    - src/lib/chart-configs.test.ts
    - src/lib/queries/stats/timezone.ts
    - src/lib/queries/stats/timezone.test.ts
    - src/lib/queries/stats/index.ts
    - src/components/ui/chart.tsx
  modified:
    - package.json
    - package-lock.json
    - .env.example
    - src/components/ui/card.tsx
decisions:
  - "Used UPPERCASE keys in collectionStatusConfig to match Prisma ProjectStatus enum values directly"
  - "TZDate.tz() for current-time-in-timezone vs new TZDate() constructor"
  - "toUTC helper in tests to normalize TZDate ISO output for assertion clarity"
metrics:
  duration: 5m 19s
  completed: "2026-05-17T19:37:37Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 13
  files_created: 7
  files_modified: 4
---

# Phase 18 Plan 01: Foundation Layer Summary

Install charting and date dependencies, create shared type contracts, timezone utility, and chart configuration constants for the stats engine.

**One-liner:** Recharts + date-fns installed, stats types defined, timezone utility with DST-aware boundaries, chart configs using CSS variable tokens.

## Completed Tasks

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install dependencies, create types, and chart configs | 91ac8cd | package.json, src/types/stats.ts, src/lib/chart-configs.ts, src/components/ui/chart.tsx |
| 2 | Timezone utility with TDD | 25f644c | src/lib/queries/stats/timezone.ts, timezone.test.ts, .env.example |

## What Was Built

### Dependencies (Task 1)
- **recharts 3.8.0** -- installed via `npx shadcn@latest add chart`, which also generated `src/components/ui/chart.tsx`
- **date-fns 4.1.0** -- functional date arithmetic
- **@date-fns/tz 1.4.1** -- TZDate for timezone-aware calculations
- All pinned to exact versions (no carets)

### Types (Task 1)
- `StatsHeroData` -- lifetime counters (stitches today/week/month/year, total sessions, time, completed)
- `StatusBreakdownItem` / `CollectionBreakdownData` -- for collection donut chart
- `LocalDateBoundaries` -- timezone-aware day/week/month/year boundaries

### Chart Configs (Task 1)
- `collectionStatusConfig` with 7 keys matching ProjectStatus enum
- Uses `satisfies ChartConfig` for type safety with preserved literal types
- References `var(--status-*)` CSS variables from globals.css
- No `"use client"` directive -- usable from Server Components

### Timezone Utility (Task 2)
- `getUserTimezone(userId)` -- reads STATS_TIMEZONE env var, defaults to America/Denver
- `getLocalDayBoundaries(timezone)` -- returns UTC Date instants for local midnight/end-of-day/week/month/year boundaries
- Correctly handles MDT (UTC-6) vs MST (UTC-7) DST transitions
- 10 tests including 11:30pm edge case proving late-night sessions stay in correct local day

## Deviations from Plan

None -- plan executed exactly as written.

## Test Results

```
13 tests passing across 2 test files:
- src/lib/chart-configs.test.ts (3 tests)
- src/lib/queries/stats/timezone.test.ts (10 tests)
```

## Known Stubs

None -- all code is fully functional with no placeholders.

## Self-Check: PASSED

All 7 created files verified on disk. Both commit hashes (91ac8cd, 25f644c) found in git log.
