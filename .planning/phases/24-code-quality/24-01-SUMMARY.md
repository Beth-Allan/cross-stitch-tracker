---
phase: 24-code-quality
plan: 01
subsystem: types/stats
tags: [type-narrowing, discriminated-union, utility-extraction, conventions]
dependency_graph:
  requires: []
  provides: [MonthLabel, DayLabel, ProjectLinkedRecord, AggregateRecord, PersonalBestRecord, BrokenRecordType, buildDateFilter, Scope, SORT_FIELDS, SORT_DIRS]
  affects: [src/types/stats.ts, src/components/features/supply-table/types.ts, src/lib/queries/stats/utils.ts, src/app/(dashboard)/stats/search-params.ts]
tech_stack:
  added: []
  patterns: [discriminated-union, literal-union, extends-interface, Exclude-utility-type]
key_files:
  created:
    - src/lib/queries/stats/utils.ts
    - .claude/rules/comment-conventions.md
  modified:
    - src/types/stats.ts
    - src/types/stats.test.ts
    - src/components/features/supply-table/types.ts
    - src/app/(dashboard)/stats/search-params.ts
decisions:
  - "D-05/D-06: PersonalBestRecord split into ProjectLinkedRecord (optional fields) + AggregateRecord (no project fields)"
  - "D-08: BrokenRecordType derived via Exclude<RecordType, 'currentStreak'>"
  - "D-09/D-10: SessionHistoryItem.date changed to string to match RSC wire format"
  - "D-02/D-03: Comment convention rule documents type-bundle marker exception"
metrics:
  duration: 4m 50s
  completed: 2026-05-19T01:06:43Z
  tasks_completed: 2
  tasks_total: 2
  files_changed: 6
  tests: 29
---

# Phase 24 Plan 01: Type Contracts & Shared Utilities Summary

Precise literal union types, discriminated union for PersonalBestRecord, shared buildDateFilter utility, and exported SORT constants as stable contracts for downstream consumer plans.

## What Was Done

### Task 1: Define type contracts in stats.ts and supply-table/types.ts (TDD)

**RED:** Wrote 29 type-level tests covering MonthLabel, DayLabel, ProjectLinkedRecord, AggregateRecord, PersonalBestRecord union, BrokenRecordType Exclude, DailyBreakdownEntry extends, SessionHistoryItem.date as string, AvailableYearsData removal, and strandCount literal union. TypeScript confirmed 5 compile errors (expected).

**GREEN:** Implemented all type changes:
- `MonthLabel` literal union (12 month abbreviations) replaces `string` on `MonthlyTotal.month`
- `DayLabel` literal union (7 day abbreviations) replaces `string` on `DayOfWeekData.dayOfWeek`
- `SessionHistoryItem.date` changed from `Date` to `string` ("YYYY-MM-DD")
- `DailyBreakdownEntry` now `extends CalendarSession` (eliminates 4 duplicated fields)
- `PersonalBestRecord` split into `ProjectLinkedRecord` + `AggregateRecord` discriminated union
- `BrokenRecordType` uses `Exclude<RecordType, "currentStreak">` instead of duplicated literal union
- `AvailableYearsData` wrapper interface removed entirely
- `CalcParams.strandCount` narrowed from `number` to `1 | 2 | 3 | 4 | 5 | 6`

### Task 2: Create shared buildDateFilter utility, export SORT constants, add convention rule

- Created `src/lib/queries/stats/utils.ts` with `buildDateFilter` function and `Scope` type (extracted from 6 identical inline copies across query modules)
- Exported `SORT_FIELDS` and `SORT_DIRS` from `search-params.ts` as single source of truth
- Created `.claude/rules/comment-conventions.md` documenting the type-bundle section marker exception (D-02/D-03)

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `95215ed` | test | Failing type tests for literal unions, discriminated union, date string |
| `d3de8b1` | feat | Type contracts in stats.ts and supply-table types |
| `170d19d` | feat | Shared buildDateFilter utility, SORT exports, comment convention rule |

## TDD Gate Compliance

- RED gate: `95215ed` (test commit, TypeScript confirmed 5 compile errors)
- GREEN gate: `d3de8b1` (implementation commit, all 29 tests pass)
- REFACTOR gate: Not needed (no cleanup required)

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all types are fully defined with no placeholder values.

## Self-Check: PASSED

All 6 files verified present. All 3 commits verified in git log.
