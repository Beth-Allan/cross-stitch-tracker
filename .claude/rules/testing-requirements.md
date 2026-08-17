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

## The per-mutation stats-invalidation rule

**Every stats-visible mutation carries a test asserting its own
`revalidateTag("stats", { expire: 0 })` call** — Beth's ruling, 2026-08-17
(`docs/process/work-log/drift.md`). This is the adopted protection *instead of* review-gating the
caller files: a path gate can only watch files that already do the right thing, and the failure
mode is a mutation that never had the line.

A mutation is stats-visible when its write can move a figure on `/stats` — anything touching
charts, projects, sessions, supplies, designers, or genres. When it is a close call, invalidate:
an unnecessary recomputation is cheap, a stale number is a bug Beth has to notice herself.

The test is one assertion per mutation, colocated in the action file's own test:

```ts
it("createThread calls revalidateTag('stats') after successful creation", async () => {
  mockPrisma.thread.create.mockResolvedValueOnce(createMockThread());
  const { createThread } = await import("./supply-actions");
  const { revalidateTag } = await import("next/cache");

  const result = await createThread({ ... });

  assertSuccess(result);
  expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("stats", { expire: 0 });
});
```

Group them in a `describe("cache invalidation", …)` block so the coverage is greppable, and add
at least one negative per file — a rejected write (ownership failure, missing record) that must
**not** invalidate. Adding a new mutation without its assertion is a review finding.

**Mock trap:** an action test's `vi.mock("next/cache", …)` factory must list `revalidateTag`
alongside `revalidatePath`. Omit it and the call throws inside the action's own `try`, so the
whole mutation returns its generic `{ success: false }` — the test fails on a wrong-looking
business error instead of naming the missing mock. `MOCK_PATTERNS.cache` in
`@/__tests__/mocks/module-mocks.ts` carries the correct shape.

The reader side of the same layer is `src/lib/queries/stats/`, which is review-gated; its TTL
windows are the named constants in `stats/utils.ts`, never bare numbers.

## What does not

Pure markup and styling changes (verify by looking at the page) and doc/process/tooling changes.
**Adding low-value tests to look thorough is itself a review finding.**

## Never weaken a test

Deleting, skipping, or loosening an existing test to get green converts a visible failure into an
invisible one. It is the one unforgivable move — **test removals need Beth's approval, on the
record** (hard rule 2).
