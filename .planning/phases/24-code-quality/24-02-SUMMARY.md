---
phase: 24-code-quality
plan: 02
subsystem: stats/queries, stats/components
tags: [deduplication, discriminated-union, type-narrowing, date-normalization, tilde-rendering]
dependency_graph:
  requires: [buildDateFilter, Scope, ProjectLinkedRecord, AggregateRecord, PersonalBestRecord, BrokenRecordType, SORT_FIELDS, SORT_DIRS]
  provides: [shared-buildDateFilter-consumers, discriminant-narrowing-records-table, tilde-in-rendering, number[]-available-years, string-date-session-history]
  affects: [src/lib/queries/stats/*.ts, src/components/features/stats/*.tsx, src/app/(dashboard)/stats/page.tsx]
tech_stack:
  added: []
  patterns: [discriminant-narrowing, type-guard-filter, parseISO-for-date-strings]
key_files:
  created: []
  modified:
    - src/lib/queries/stats/genre-insights.ts
    - src/lib/queries/stats/thread-insights.ts
    - src/lib/queries/stats/designer-insights.ts
    - src/lib/queries/stats/personal-bests.ts
    - src/lib/queries/stats/fastest-completions.ts
    - src/lib/queries/stats/completion-estimates.ts
    - src/lib/queries/stats/available-years.ts
    - src/lib/queries/stats/session-history.ts
    - src/components/features/stats/session-history-table.tsx
    - src/components/features/stats/records-table.tsx
    - src/components/features/stats/completion-estimates-section.tsx
    - src/components/features/stats/project-completion-estimate.tsx
    - src/app/(dashboard)/stats/page.tsx
    - src/lib/queries/stats/available-years.test.ts
    - src/lib/queries/stats/personal-bests.test.ts
    - src/lib/queries/stats/session-history.test.ts
    - src/lib/queries/stats/completion-estimates.test.ts
    - src/components/features/stats/records-table.test.tsx
    - src/components/features/stats/completion-estimates-section.test.tsx
    - src/components/features/stats/project-completion-estimate.test.tsx
    - src/components/features/stats/session-history-table.test.tsx
    - src/components/features/stats/activity-overview.test.tsx
decisions:
  - "Used parseISO instead of new Date() for YYYY-MM-DD string parsing to avoid UTC timezone offset issues"
  - "Used toMatchObject for ProjectLinkedRecord field assertions to avoid type assertions (as) in tests"
  - "Type guard function for array filter narrowing (isProjectLinked) instead of as-cast"
metrics:
  duration: 10m 38s
  completed: 2026-05-19T01:50:33Z
  tasks_completed: 2
  tasks_total: 2
  files_changed: 23
  tests: 285
---

# Phase 24 Plan 02: Consumer Updates for Type Contracts Summary

Wired all stats query modules and components to Plan 01's shared buildDateFilter, discriminated union PersonalBestRecord, normalized date strings, deduplicated SORT constants, presentational tilde prefix, and unwrapped AvailableYearsData.

## What Was Done

### Task 1: Update query modules

- **buildDateFilter deduplication:** Replaced 6 identical local `buildDateFilter` definitions with `import { buildDateFilter } from "./utils"` in genre-insights, thread-insights, designer-insights, personal-bests, fastest-completions, and completion-estimates. Removed unused `TZDate` imports from files that only used it inside buildDateFilter (genre-insights, thread-insights, designer-insights).
- **PersonalBestRecord discriminated union:** Replaced single `emptyRecord` helper with `emptyProjectLinked` (returns `ProjectLinkedRecord`) and `emptyAggregate` (returns `AggregateRecord`). Updated all 4 call sites. Changed record construction to match variant shapes -- streaks no longer carry null date/project fields. Removed 4 sub-section comment markers (`// --- Best Day ---` etc.) per D-01 convention.
- **Completion estimates tilde:** Removed `~` prefix from `estimatedDate` in both `computeCompletionEstimates` and `getProjectCompletionEstimate` data returns.
- **Available years unwrap:** Removed `AvailableYearsData` import, changed return type to `Promise<number[]>`, changed `{ years: [] }` to `[]` and `{ years }` to `years`.
- **Session history date format:** Added `getUserTimezone`, `TZDate`, and `format` imports. Formatted date field as `format(new TZDate(s.date, tz), "yyyy-MM-dd")` string instead of raw Date object.
- **Test fixture updates:** Fixed available-years tests (removed `.years` accessor), personal-bests tests (removed null date/project assertions for aggregate records, used type guard for filter narrowing), session-history-table tests (Date to string), activity-overview test (Date to string).

### Task 2: Update components and page

- **SORT constants deduplication:** Removed local `SORT_FIELDS` and `SORT_DIRS` from session-history-table.tsx, replaced with import from `@/app/(dashboard)/stats/search-params`.
- **Discriminant-based narrowing:** Updated `RecordValueCell` in records-table.tsx to use `record.type === "bestDay" || record.type === "bestSession"` check instead of null checks on `record.date`. TypeScript now narrows to `ProjectLinkedRecord` for date/project field access.
- **Tilde in rendering:** Added `~` prefix in JSX of completion-estimates-section.tsx and project-completion-estimate.tsx. Updated test fixtures to remove tilde from data while keeping tilde in rendered output assertions.
- **AvailableYearsData removal:** Removed type from page.tsx import, changed `settled<AvailableYearsData>` to `settled<number[]>`, changed `availableYears?.years ?? null` to `availableYears ?? null`.
- **parseISO for date strings:** Used `parseISO` from date-fns instead of `new Date()` for YYYY-MM-DD string parsing in session-history-table.tsx and records-table.tsx to avoid UTC timezone offset issues.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `8df73ad` | refactor | Update query modules -- shared buildDateFilter, discriminated union, normalized types |
| `658a41d` | refactor | Update components and page -- SORT import, discriminant narrowing, tilde rendering |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Timezone offset in date string parsing**
- **Found during:** Task 2
- **Issue:** `new Date("2026-05-15")` parses as UTC midnight, which shifts to previous day in behind-UTC timezones (e.g., America/Edmonton). Test assertions expected "May 15" but got "May 14".
- **Fix:** Used `parseISO` from date-fns for YYYY-MM-DD string parsing in components. Updated test mock dates to use explicit UTC times (`T14:00:00Z`) to stay within intended day in Edmonton timezone.
- **Files modified:** session-history-table.tsx, records-table.tsx, session-history.test.ts

**2. [Rule 1 - Bug] Missing getUserTimezone mock in session-history test**
- **Found during:** Task 2
- **Issue:** Added `getUserTimezone(userId)` call to session-history.ts but test file didn't mock `./timezone`, causing undefined timezone.
- **Fix:** Added `vi.mock("./timezone", ...)` to session-history.test.ts.
- **Files modified:** session-history.test.ts

**3. [Rule 1 - Bug] Missing chartId in session-history test mock data**
- **Found during:** Task 2
- **Issue:** Test mock project objects lacked `chartId` field that the query selects and maps to `SessionHistoryItem.chartId`.
- **Fix:** Added `chartId` to mock project data and expected assertions.
- **Files modified:** session-history.test.ts

**4. [Rule 1 - Bug] Third tilde regex in completion-estimates.test.ts**
- **Found during:** Task 2
- **Issue:** `getProjectCompletionEstimate` test at line 254 still expected `~` prefix pattern.
- **Fix:** Updated regex from `/^~[A-Z]...$/` to `/^[A-Z]...$/`.
- **Files modified:** completion-estimates.test.ts

## Known Stubs

None -- all changes are complete refactors with no placeholder values.

## Self-Check: PASSED

All 13 modified source files verified present. Both commits (8df73ad, 658a41d) verified in git log. SUMMARY.md exists.
