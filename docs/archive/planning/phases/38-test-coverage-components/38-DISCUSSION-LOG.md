# Phase 38: Test Coverage -- Components - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 38-test-coverage-components
**Areas discussed:** Verify-and-close scope, Aggregation test target, Integration test depth, calcParams rollback level

---

## Verify-and-close scope

| Option | Description | Selected |
|--------|-------------|----------|
| Verify and close (Recommended) | Confirm existing coverage matches backlog item intent, then mark closed. Avoids redundant test churn — same approach that worked well for Phase 37. | ✓ |
| Write supplementary tests | Add edge cases beyond what exists even though the core gap is filled. More thorough but may be unnecessary work. | |

**User's choice:** Verify and close
**Notes:** Applies to 999.79 (updateProjectSettings — 9 tests) and 999.82 (handleAddSeries guards — 4 tests). Follow-up question confirmed partial-coverage items (999.63, 999.64) should get "supplement gaps only" treatment, not full rewrites.

### Follow-up: Partial coverage items

| Option | Description | Selected |
|--------|-------------|----------|
| Supplement gaps only (Recommended) | Add only the specific missing tests. Existing 14+ tests are already good. | ✓ |
| Full new test suites | Rewrite or significantly expand test files. More work, may duplicate existing coverage. | |

---

## Aggregation test target

| Option | Description | Selected |
|--------|-------------|----------|
| supply-overview.test.tsx (Recommended) | Add tests to the existing supply-overview test file. Render AggregatedSupplyRow with multi-item data and verify onUpdateAcquired calls. | ✓ |
| Extract and unit test | Extract the distribution algorithm into a standalone utility function first, then unit test it directly. | |
| You decide | Let Claude pick the best approach. | |

**User's choice:** supply-overview.test.tsx
**Notes:** The distribution logic is an inline onChange handler in AggregatedSupplyRow (supply-overview.tsx lines 262-286). No standalone component file exists despite the backlog item's wording.

---

## Integration test depth

| Option | Description | Selected |
|--------|-------------|----------|
| Wiring verification (Recommended) | Test that QuantityControl onChange triggers the action call, isPending/hasError props flow through, and toast fires. Mocked action. | ✓ |
| Full optimistic cycle | Test the complete pending→resolve→cleared→toast cycle. More thorough but duplicates server action coverage. | |
| You decide | Let Claude pick depth based on risk and existing coverage. | |

**User's choice:** Wiring verification
**Notes:** Server action already has 11+ tests in shopping-cart-actions.test.ts. Component test should prove the wiring, not re-test the action logic.

---

## calcParams rollback level

| Option | Description | Selected |
|--------|-------------|----------|
| SuppliesTab test file (Recommended) | Test handleCalcParamsChange in the existing supplies-tab test file. Mock updateProjectSettings to reject, verify rollback and toast. | ✓ |
| New dedicated test | Create a focused test file for rollback behavior. More isolated but adds a new file. | |
| You decide | Let Claude pick based on existing test structure. | |

**User's choice:** SuppliesTab test file
**Notes:** The rollback logic lives in SuppliesTab.handleCalcParamsChange (supplies-tab.tsx lines 142-151), using serverParamsRef.current for rollback target. Existing nyquist test file available.

---

## Claude's Discretion

- How to structure plans (single plan with all items, or split shopping cart vs chart form)
- Whether to add edge cases beyond explicit backlog items that are trivially close to test targets
- Exact test file placement for 999.64 integration tests (shopping-cart.test.tsx vs supply-overview.test.tsx)

## Deferred Ideas

None — discussion stayed within phase scope.
