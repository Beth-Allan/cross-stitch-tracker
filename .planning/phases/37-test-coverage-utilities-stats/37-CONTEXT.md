# Phase 37: Test Coverage -- Utilities & Stats - Context

**Gathered:** 2026-07-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify that existing test coverage satisfies all 5 success criteria for utility and stats test gaps (skein calculator, stats actions, calendar year-rollover, record detection, completion estimates). Close the corresponding backlog items. This is a verification-and-closure phase — the target tests were proactively added during earlier phases.

Requirements: TEST-01, TEST-02.

</domain>

<decisions>
## Implementation Decisions

### Scope Approach

- **D-01:** This phase is verify-and-close, not write-new-tests. Codebase scout confirmed all 5 success criteria are already covered by existing tests added proactively in Phases 22-34.
- **D-02:** The verification plan should run all relevant test suites, confirm each backlog item's described behavior is tested, and close the backlog items (999.0.24, 999.24, 999.27, 999.38, 999.39).

### Existing Coverage Evidence

- **D-03:** Skein calculator `fabricCount=0` — tested at `skein-calculator.test.ts:157` ("returns 0 for fabricCount of 0").
- **D-04:** `resolveDefaultBrandId` — tested in `supply-actions.test.ts:1359` (3 tests covering default upsert and specific brandId skip). This function lives in supply-actions, not skein-calculator — the backlog item 999.0.24 groups them but they're separate modules.
- **D-05:** Stats action auth rejection — all 3 exported functions (`fetchCalendarMonth`, `fetchDailyBreakdown`, `fetchMonthlyTotals`) have "throws when requireAuth rejects" tests.
- **D-06:** Stats action Zod boundaries — all 3 functions test min/max violations for year (2019/2101) and month (0/13) parameters.
- **D-07:** Calendar year-rollover — `stitching-calendar.test.tsx` tests Jan→Dec (line 174) and Dec→Jan (line 189) navigation.
- **D-08:** Record-detection duplicate stitch counts — `record-detection.test.ts:218` tests "two sessions on same day with identical stitch counts without false positives".
- **D-09:** Completion-estimate exclusion — `completion-estimates.test.ts` tests both equals (line 171) and exceeds (line 196) totalStitches scenarios.

### Claude's Discretion

- How to structure the verification plan (single plan vs. multiple)
- Whether to add any supplementary edge case tests discovered during verification that are trivially close to existing tests
- Exact wording of backlog item closure in CLAUDE.md

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Test Files (verify coverage)
- `src/lib/utils/skein-calculator.test.ts` — 17 tests including fabricCount=0 edge case
- `src/lib/actions/stats-actions.test.ts` — 15 tests covering auth rejection + Zod boundaries for all 3 actions
- `src/lib/actions/supply-actions.test.ts` — resolveDefaultBrandId tests at line 1359
- `src/components/features/stats/stitching-calendar.test.tsx` — 11 tests including year-rollover
- `src/lib/queries/stats/record-detection.test.ts` — 8 tests including duplicate stitch count
- `src/lib/queries/stats/completion-estimates.test.ts` — 12 tests including stitchesCompleted >= totalStitches

### Source Files (reference for understanding test targets)
- `src/lib/utils/skein-calculator.ts` — `calculateSkeins` pure function
- `src/lib/actions/stats-actions.ts` — 3 exported server actions with Zod validation
- `src/lib/actions/supply-actions.ts` — `resolveDefaultBrandId` internal function
- `src/lib/queries/stats/record-detection.ts` — `detectBrokenRecords` query
- `src/lib/queries/stats/completion-estimates.ts` — `getCompletionEstimates` + `getProjectCompletionEstimate`

### Requirements
- `.planning/REQUIREMENTS.md` — TEST-01 and TEST-02 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@/__tests__/mocks/factories.ts` — Mock factories for all domain objects, `createMockPrisma()`, `assertSuccess`/`assertFailure`
- `@/__tests__/test-utils.tsx` — Custom render wrapper (always import from here)

### Established Patterns
- Server action tests: mock `@/lib/auth` + `@/lib/db` + `next/cache`, set up auth in `beforeEach`
- Query tests: mock Prisma client, test return shape and filtering logic
- Component tests: mock server actions + navigation, render with test utils

### Integration Points
- Backlog items 999.0.24, 999.24, 999.27, 999.38, 999.39 need to be marked as closed in CLAUDE.md after verification

</code_context>

<specifics>
## Specific Ideas

- Run `npm test -- --grep "skein-calculator|stats-actions|record-detection|completion-estimates|stitching-calendar"` to verify all target tests pass
- Cross-reference each backlog item description against test assertions to confirm coverage
- Mark backlog items with strikethrough and "Shipped in Phase 37" annotation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 37-Test Coverage -- Utilities & Stats*
*Context gathered: 2026-07-02*
