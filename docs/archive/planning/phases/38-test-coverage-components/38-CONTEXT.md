# Phase 38: Test Coverage -- Components - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Fill test gaps for shopping cart and chart form components — interaction paths that are currently untested. This is a mixed verify-and-write phase: 2 items are already covered and need verification+closure, 2 items have partial coverage needing supplements, and 5 items are genuine gaps needing new tests.

Requirements: TEST-03, TEST-04.

</domain>

<decisions>
## Implementation Decisions

### Scope Approach

- **D-01:** Verify-and-close for 999.79 (updateProjectSettings) and 999.82 (handleAddSeries guards) — both already have comprehensive test coverage. Same pattern as Phase 37.
- **D-02:** Supplement-gaps-only for 999.63 (project accordion) and 999.64 (updateSupplyAcquired integration) — existing tests are solid, only add the specific missing scenarios.
- **D-03:** Write new tests for the remaining 5 genuine gaps: 999.62, 999.65, 999.78, 999.80, 999.81.

### Shopping Cart Tests (TEST-03)

- **D-04:** 999.62 (aggregated quantity distribution) — test in `supply-overview.test.tsx`. The distribution logic is an inline onChange handler in AggregatedSupplyRow (supply-overview.tsx lines 262-286). Render with multi-item aggregated data and verify onUpdateAcquired calls with correct junction IDs and allocated quantities for both increment and decrement paths.
- **D-05:** 999.63 (project accordion expand/collapse) — supplement `project-accordion.test.tsx` with "not selected" message display and supply detail rendering. 14 existing tests already cover thumbnails, focal points, status grouping, expand/collapse, and search empty state.
- **D-06:** 999.64 (updateSupplyAcquired integration) — wiring verification only, not full optimistic cycle. Test that QuantityControl onChange triggers the server action, isPending/hasError props flow through, and toast.success/toast.error fire. Server action is already thoroughly tested (11+ tests in shopping-cart-actions.test.ts).
- **D-07:** 999.65 (QuantityControl blur) — add blur commit test to `quantity-control.test.tsx`. Enter commit (line 69) and Escape cancel (line 83) are already tested; blur commit via `onBlur={commitEdit}` is the gap.

### Chart Form Tests (TEST-04)

- **D-08:** 999.78 (calcParams error/rollback) — test in supplies-tab test file. Mock updateProjectSettings to reject, verify calcParams roll back to serverCalcParams and toast.error fires. The rollback logic lives in SuppliesTab.handleCalcParamsChange (supplies-tab.tsx lines 142-151).
- **D-09:** 999.79 (updateProjectSettings) — verify-and-close. 9 tests exist in chart-actions-settings.test.ts covering auth rejection, 4 Zod boundary violations (strandCount 0/7, wastePercent -1/51), happy path single and multiple params, and Prisma error.
- **D-10:** 999.80 (.zip file validation) — add acceptance test to `chart-file-upload.test.tsx`. Currently only an error message mentions zip (line 96); no test verifies .zip file passes validateFile.
- **D-11:** 999.81 (seriesId flow-through) — add test to chart-actions.test.ts verifying seriesId appears in prisma.chart.create and prisma.chart.update data payloads when provided.
- **D-12:** 999.82 (handleAddSeries guards) — verify-and-close. Empty (lines 79, 135) and whitespace (lines 89, 145) guard tests already exist in use-chart-form.test.tsx.

### Existing Coverage Evidence (Verify-and-Close Items)

- **D-09 evidence:** `chart-actions-settings.test.ts` — "rejects unauthenticated", "rejects strandCount 0", "rejects strandCount 7", "rejects overCount 3", "rejects wastePercent -1", "rejects wastePercent 51", "updates strandCount", "updates multiple fields", "handles Prisma error"
- **D-12 evidence:** `use-chart-form.test.tsx` — "does not call server action when name is empty (dialog handles this case)" at lines 79/135, "does not call server action when name is whitespace only" at lines 89/145

### Claude's Discretion

- How to structure plans (single plan with all items, or split shopping cart vs chart form)
- Whether to add any edge cases beyond the explicit backlog items that are trivially close to the test targets
- Exact test file placement for 999.64 integration tests (shopping-cart.test.tsx vs supply-overview.test.tsx)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Shopping Cart Test Files (existing coverage + gap targets)
- `src/components/features/shopping/supply-overview.test.tsx` — target for 999.62 aggregated quantity distribution tests
- `src/components/features/shopping/supply-overview.tsx` — AggregatedSupplyRow onChange handler (lines 262-286) is the distribution logic to test
- `src/components/features/shopping/project-accordion.test.tsx` — 14 existing tests, supplement for 999.63
- `src/components/features/shopping/shopping-cart.test.tsx` — target for 999.64 wiring verification
- `src/components/features/shopping/shopping-cart.tsx` — handleUpdateAcquired (lines 239-262) with pending/error/toast cycle
- `src/components/features/shopping/quantity-control.test.tsx` — target for 999.65 blur test
- `src/components/features/shopping/quantity-control.tsx` — onBlur={commitEdit} at line 97
- `src/lib/actions/shopping-cart-actions.test.ts` — 11+ existing updateSupplyAcquired tests (reference, not target)

### Chart Form Test Files (existing coverage + gap targets)
- `src/components/features/charts/project-detail/supplies-tab.tsx` — handleCalcParamsChange rollback logic (lines 123-154)
- `src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx` — target for 999.78 rollback tests
- `src/components/features/charts/form-primitives/chart-file-upload.test.tsx` — target for 999.80 zip validation
- `src/lib/actions/chart-actions.test.ts` — target for 999.81 seriesId flow-through
- `src/lib/actions/chart-actions-settings.test.ts` — 9 existing tests (verify-and-close for 999.79)
- `src/components/features/charts/use-chart-form.test.tsx` — existing handleAddSeries guard tests (verify-and-close for 999.82)

### Test Infrastructure
- `src/__tests__/mocks/factories.ts` — createMockPrisma, domain object factories, assertSuccess/assertFailure
- `src/__tests__/test-utils.tsx` — custom render wrapper (always import from here)

### Requirements
- `.planning/REQUIREMENTS.md` — TEST-03 and TEST-04 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createMockPrisma()` from factories.ts — for chart-actions seriesId tests
- `createMockStitchSession`, `createMockProject` factories — for supply/shopping test data
- Standard server action test setup (vi.mock auth + db + cache) — chart-actions seriesId test
- `userEvent.setup()` from @testing-library/user-event — for QuantityControl blur simulation

### Established Patterns
- Server action tests: mock `@/lib/auth` + `@/lib/db` + `next/cache`, set up auth in `beforeEach`
- Component tests: mock server actions + navigation, render with test utils
- Nyquist tests: `.nyquist.test.tsx` suffix for supplemental gap tests (supplies-tab already has one)
- Sonner toast: `vi.mock("sonner")` for toast.success/toast.error assertions

### Integration Points
- Backlog items 999.62, 999.63, 999.64, 999.65, 999.78, 999.79, 999.80, 999.81, 999.82 need to be marked as closed in CLAUDE.md after verification
- Phase 36 narrowed types (StrandCount, CalcParams) — tests must use the narrowed types

</code_context>

<specifics>
## Specific Ideas

- For 999.62, test both increment (capacity-based allocation) and decrement (acquired-based deallocation) paths with 2-3 item aggregated supply
- For 999.65, simulate blur by calling `fireEvent.blur` on the inline input after typing a value — mirrors the real mobile commit path
- For 999.78, verify rollback sets calcParams back to `serverCalcParams` value, not just "previous" — the ref-based rollback is the key behavior
- For 999.81, verify seriesId in both create and update action Prisma calls, plus verify omission when seriesId is null/undefined

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 38-Test Coverage -- Components*
*Context gathered: 2026-07-01*
