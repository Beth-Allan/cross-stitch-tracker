# Phase 24: Code Quality - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Make TypeScript types more precise (literal unions, discriminated unions, consistent date representation), deduplicate shared utilities (sort constants, date filter builder), clean up convention-violating comments (WHAT-comments, JSX section markers, planning doc refs), replace hardcoded color classes with semantic tokens, and add assertion guard utilities to eliminate vacuous test assertions project-wide.

Requirements: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09, QUAL-10, QUAL-11, QUAL-12, QUAL-13, QUAL-14, QUAL-15, QUAL-16

</domain>

<decisions>
## Implementation Decisions

### Comment Cleanup (QUAL-06, QUAL-07, QUAL-14)
- **D-01:** Tiered by file type — remove JSX `{/* ... */}` section labels in Phase 20/21 render blocks, `// --- Sub-section ---` markers inside function bodies, and planning doc references (e.g., `(D-02)`, `(T-10-12)`).
- **D-02:** Keep `// ─── Section Name ───` markers in type-bundle files (`stats.ts`, `dashboard.ts`, etc.) — these files have no function symbol structure, so the markers serve as legitimate navigation aids.
- **D-03:** Document the exception in `.claude/rules/` to prevent future cleanup drift: "Type-bundle files containing only interface/type declarations may use `// ─── Section Name ───` separators as navigation aids."
- **D-04:** Remove `// ─── ... ───` markers in test files where describe block names already provide structure (backlog 999.57).

### PersonalBestRecord Redesign (QUAL-09, QUAL-10)
- **D-05:** Two-variant discriminated union — `ProjectLinkedRecord` (for bestDay/bestSession, with optional project fields) and `AggregateRecord` (for longestStreak/currentStreak, no project fields). Discriminant is the `type` field.
- **D-06:** Use `optional` (not nullable) for `date`, `projectId`, `chartId`, `projectName` on `ProjectLinkedRecord` — semantically cleaner for the empty-state path where fields are absent rather than explicitly cleared.
- **D-07:** The `emptyRecord` helper in `personal-bests.ts` returns records with `value: 0` and no date/project fields. Under the new types, bestDay/bestSession empty records are `ProjectLinkedRecord` with optional fields omitted; streak empty records are `AggregateRecord`.
- **D-08:** BrokenRecordType becomes `Exclude<RecordType, "currentStreak">` — one-line change, zero consumer impact, self-documenting constraint.

### Date Consistency (QUAL-04)
- **D-09:** Normalize `SessionHistoryItem.date` from `Date` to `string` ("YYYY-MM-DD"). This is the lone outlier — all other stats date fields already use strings. The component only formats to `"MMM d, yyyy"` and never uses the time component.
- **D-10:** This fixes a latent serialization bug — React's RSC serialization converts Date objects to ISO strings across the Server Component → Client Component boundary, making the type (`Date`) diverge from the wire format (`string`). The defensive `new Date(item.date)` wrapper in `session-history-table.tsx` becomes unnecessary.

### Test Assertion Quality (QUAL-15, QUAL-16)
- **D-11:** Add `assertSuccess(result)` and `assertFailure(result)` narrowing helpers to `src/__tests__/mocks/factories.ts`. These throw if the result doesn't match, ensuring tests fail on unexpected action outcomes instead of silently passing with no assertions.
- **D-12:** Project-wide sweep of vacuous assertion pattern (`if (result.success) { expect(...) }`) — 43 instances across 12 test files. Replace with `assertSuccess(result)` followed by direct property assertions.
- **D-13:** This fulfills the explicit Phase 22 deferral (D-07/D-08 in 22-CONTEXT.md) and the deferred "assertion guard utility" item.

### Claude's Discretion
- Plan structure and grouping of the 16 QUAL requirements into plans/waves — Claude decides how to cluster the work.
- Exact type definitions for literal unions (MonthLabel, DayLabel, strandCount) — Claude determines the specific literal values from the codebase.
- buildDateFilter extraction location — Claude decides where the shared utility lives (likely `src/lib/queries/stats/utils.ts` or similar).
- Scope type definition — Claude determines the literal union values for the shared Scope type.
- Semantic token mapping for emerald-* classes in log-session-modal — Claude chooses the appropriate design tokens from the existing system.
- DailyBreakdownEntry/CalendarSession relationship implementation — Claude decides the exact extends/intersection approach for QUAL-05.
- AvailableYearsData unwrapping — Claude removes the wrapper and updates consumers.
- CompletionEstimate tilde prefix — Claude moves `~` from data to rendering.
- Convention exception wording in `.claude/rules/` — Claude drafts the rule text.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — QUAL-01 through QUAL-16 definitions
- `.planning/ROADMAP.md` §Phase 24 — Success criteria and requirement list

### Type Definitions (QUAL-01, QUAL-03, QUAL-04, QUAL-05, QUAL-09, QUAL-10, QUAL-11, QUAL-12)
- `src/types/stats.ts` — All stats type definitions including PersonalBestRecord, MonthlyTotal, DayOfWeekData, DailyBreakdownEntry, CalendarSession, CompletionEstimate, BrokenRecordType, AvailableYearsData, SessionHistoryItem
- `src/types/stats.test.ts` — Type-level tests to extend

### PersonalBestRecord Consumers (QUAL-09)
- `src/lib/queries/stats/personal-bests.ts` — emptyRecord helper, record construction
- `src/components/features/stats/records-table.tsx` — RecordValueCell, date/project guards
- `src/components/features/stats/records-table.test.tsx` — Streak fixture at lines 30-37 (has spurious project fields)
- `src/components/features/stats/records-overview.tsx` — Records overview component

### Date Consistency (QUAL-04)
- `src/lib/queries/stats/session-history.ts` — Query returning SessionHistoryItem with Date
- `src/components/features/stats/session-history-table.tsx` — Client component with `new Date(item.date)` wrapper
- `src/components/features/stats/activity-overview.tsx` — Server Component passing SessionHistoryData to client

### Constant Deduplication (QUAL-02, QUAL-13)
- `src/app/(dashboard)/stats/search-params.ts` — SORT_FIELDS/SORT_DIRS definitions
- `src/components/features/stats/session-history-table.tsx` — Duplicate SORT_FIELDS/SORT_DIRS
- `src/lib/queries/stats/genre-insights.ts` — buildDateFilter (1 of 6 duplicates)
- `src/lib/queries/stats/thread-insights.ts` — buildDateFilter duplicate
- `src/lib/queries/stats/designer-insights.ts` — buildDateFilter duplicate
- `src/lib/queries/stats/personal-bests.ts` — buildDateFilter duplicate
- `src/lib/queries/stats/fastest-completions.ts` — buildDateFilter duplicate
- `src/lib/queries/stats/completion-estimates.ts` — buildDateFilter duplicate

### Semantic Tokens (QUAL-08)
- `src/components/features/sessions/log-session-modal.tsx` — 5 hardcoded emerald-* locations (lines 301, 316, 318, 470, 480)

### Comment Cleanup (QUAL-06, QUAL-07, QUAL-14)
- `src/lib/queries/stats/personal-bests.ts` — `// --- Sub-section ---` inside function body
- `src/components/features/stats/stitching-calendar.tsx` — JSX `{/* ... */}` section labels
- `src/lib/queries/stats/record-detection.test.ts` — WHAT-comments (backlog 999.56)
- `src/lib/actions/chart-actions.test.ts` — Section marker at line 229 (backlog 999.57)
- `src/lib/actions/supply-actions.test.ts` — Section markers at lines 1423, 1502 (backlog 999.57)

### Test Assertions (QUAL-15, QUAL-16)
- `src/__tests__/mocks/factories.ts` — Where assertSuccess/assertFailure helpers will live
- `.planning/phases/22-critical-fixes-test-infrastructure/22-CONTEXT.md` — D-07/D-08 deferral context

### Conventions
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests
- `.claude/rules/component-implementation.md` — Semantic token convention
- `.claude/rules/base-ui-patterns.md` — Design token mappings

### strandCount (QUAL-01)
- `src/components/features/supply-table/types.ts` — strandCount usage
- `src/components/features/supply-table/use-supply-table.ts` — strandCount usage
- `prisma/schema.prisma` — strandCount field definition (source of truth)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createMockPrisma()` from `src/__tests__/mocks/factories.ts`: Mock factory — extend with assertSuccess/assertFailure helpers
- `settled()` from `src/lib/utils/settled.ts`: Phase 22 utility for PromiseSettledResult extraction
- Existing semantic tokens: `bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-primary`, `bg-primary/10`, `hover:bg-accent`

### Established Patterns
- **Type exports from `src/types/stats.ts`**: Central type definitions, re-exported via query modules
- **buildDateFilter**: Identical implementation in 6 files — `scope: string`, `tz: string` → `{ gte: Date; lt: Date } | null`
- **SORT_FIELDS/SORT_DIRS**: Array constants with `as const` assertions — deduplicate to search-params.ts as single source
- **Section markers in type files**: `// ─── Section Name ───` used consistently for navigation in interface-only files
- **TDD**: Tests before implementation in all plans
- **Colocated tests**: `foo.test.tsx` next to `foo.tsx`

### Integration Points
- Stats query modules all import from `src/types/stats.ts` — type changes propagate through imports
- `session-history-table.tsx` renders `SessionHistoryItem` — date type change requires format function update
- `records-table.tsx` renders `PersonalBestRecord` — discriminated union requires narrowing updates
- `.claude/rules/` directory — new convention exception file for type-file section markers
- `src/__tests__/mocks/factories.ts` — assertion helpers added here, consumed by all test files

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: this is a code quality cleanup phase, not a feature or refactor. Changes improve type precision, reduce duplication, and enforce conventions without changing runtime behavior (except the date serialization fix).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-Code Quality*
*Context gathered: 2026-05-18*
