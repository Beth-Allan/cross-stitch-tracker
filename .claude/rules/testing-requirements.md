# Testing Requirements

**TDD is mandatory for all new code.** Write tests before implementation.

## For GSD Plans

The planner MUST structure tasks as test-then-implement pairs:
1. Write tests for component/function X (defining expected behavior)
2. Implement component/function X (making tests pass)

Do NOT create a single "add tests" task at the end of a plan.

## Test Infrastructure

- Import test utils from `@/__tests__/test-utils` — not `@testing-library/react`
- Import shared mocks from `@/__tests__/mocks/` — do not duplicate mock setup per file
- Colocate tests: `foo.test.tsx` next to `foo.tsx`
- Test failure modes, not just happy paths (auth expiry, network errors, missing data)

## What to Test

- **Components**: Rendering, user interactions, error states, accessibility
- **Server actions**: Auth guard, validation, happy path, error responses
- **Utilities**: Boundary conditions, edge cases
- **Forms**: Validation messages, submission flow, field interactions
