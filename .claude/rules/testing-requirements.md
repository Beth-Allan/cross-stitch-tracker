# Testing Requirements

> Policy lives in `docs/process/session-protocol.md` §3. This file is the mechanical detail for
> writing a test in this repo. Where the two disagree, the protocol wins.

**TDD is mandatory for app behavior: the failing test comes first, always** (hard rule 2).
Catching yourself writing implementation first means stop, delete, start over. This is the
project's oldest rule and it survived the process change.

A work item demonstrates its done-when test-first, clause by clause. **Never a single "add tests"
step at the end** — tests written after the fact describe what the code does, not what it should
do.

## Test infrastructure

- Import `render`, `screen`, `userEvent` from `@/__tests__/test-utils` — **never**
  `@testing-library/react` directly. `test-utils` re-exports the library plus this project's
  `customRender` as `render`.
- Import shared mocks and factories from `@/__tests__/mocks/` (`factories.ts`,
  `module-mocks.ts`, both re-exported from the index). Do not duplicate mock setup per file.
- Prefer a factory over a hand-built object.
- Colocate: `foo.test.tsx` beside `foo.tsx`.

## What deserves a test

- **Server actions** — auth guard, Zod validation, happy path, error responses
- **Utilities and calculations** — boundary conditions, edge cases
- **Components** — rendering, user interaction, error states, accessibility
- **Forms** — validation messages, submission flow, field interactions

Test failure modes, not just happy paths: auth expiry, network errors, missing data.

## What does not

Pure markup and styling changes (verify by looking at the page) and doc/process/tooling changes.
**Adding low-value tests to look thorough is itself a review finding.**

## Never weaken a test

Deleting, skipping, or loosening an existing test to get green converts a visible failure into an
invisible one. It is the one unforgivable move — **test removals need Beth's approval, on the
record** (hard rule 2).
