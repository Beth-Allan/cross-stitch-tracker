# Phase 22: Critical Fixes & Test Infrastructure - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the app's critical security, type-safety, and resilience gaps. Fix supply action ownership validation, resolve pre-existing TypeScript errors in test files, make the stats page resilient to individual query failures, and establish reliable test infrastructure (mock defaults, assertion patterns) for the test-heavy phases that follow.

Requirements: CRIT-01, CRIT-03, CRIT-04, TEST-02, TEST-03

</domain>

<decisions>
## Implementation Decisions

### Stats Page Resilience
- **D-01:** Use `Promise.allSettled` instead of `Promise.all` for the 17 parallel stats queries. Each query result becomes nullable. Components render a muted "unavailable" card when their data is null.
- **D-02:** Add a small `settled<T>(result: PromiseSettledResult<T>): T | null` helper to extract fulfilled values. Props interfaces become nullable where needed.
- **D-03:** `hasNoSessions` must be derived defensively — if `heroStats` itself failed (null), treat all activity/records sections as "no data" state rather than crashing.
- **D-04:** Suspense-per-tab streaming (each tab as its own async Server Component) is the right long-term architecture but is OUT OF SCOPE for Phase 22. Track as a refinement of backlog item 999.22 for a future milestone.

### Test Mock Foundation
- **D-05:** Add a sensible `$transaction` default to `createMockPrisma()` that executes the callback with the mock prisma client: `$transaction.mockImplementation(fn => typeof fn === 'function' ? fn(mockPrisma) : Promise.all(fn))`. This covers the common interactive-transaction case without per-test boilerplate.
- **D-06:** Add a `mockTransaction(mockPrisma, overrides)` helper function for tests that need a distinct tx-client scope with specific mocked methods. This replaces the 7-line `mockImplementationOnce(async (cb) => cb({...}))` boilerplate. Place in `src/__tests__/mocks/factories.ts` or a new `transaction-helpers.ts`.
- **D-07:** Fix vacuous assertions in the 3 named test files (dashboard-tabs.test.tsx, chart-actions.test.ts, shopping-cart-actions.test.ts) using native TypeScript narrowing (`expect(result.success).toBe(true)` before guarded assertions). No new assertion utility needed for Phase 22.
- **D-08:** Project-wide vacuous assertion sweep (~17 files) is deferred to Phase 24 (Code Quality).

### Stats Action Error Pattern
- **D-09:** Move `requireAuth()` outside the try/catch in stats action functions to match the established supply-actions and session-actions pattern. Auth failures throw through; Zod validation failures return `{ success: false, error: message }`. This is a 1-line structural change per function (~3 functions).
- **D-10:** Auth tests use `.rejects.toThrow("Unauthorized")` (identical to supply-actions test pattern). Zod boundary tests assert `result.success === false` with specific error messages.

### Claude's Discretion
- Supply ownership validation implementation (CRIT-01): Claude decides the check location and error shape, following the existing requireAuth + prisma ownership check patterns.
- TypeScript error fixes (CRIT-03): Claude resolves the specific type mismatches in the 3 test files based on current type definitions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — CRIT-01, CRIT-03, CRIT-04, TEST-02, TEST-03 definitions and acceptance criteria
- `.planning/ROADMAP.md` §Phase 22 — Success criteria (5 items)

### Auth & Security Patterns
- `.claude/rules/auth-patterns.md` — requireAuth pattern, JWT callbacks, session.user.id threading
- `.claude/rules/server-actions.md` — Server action rules (auth guard, Zod validation)
- `src/lib/auth-guard.ts` — requireAuth() implementation (source of truth for auth check)

### Stats Implementation
- `src/app/(dashboard)/stats/page.tsx` — Current Promise.all with 17 queries (the file being changed for CRIT-04)
- `src/lib/queries/stats/` — Query modules (each function returns cached data via unstable_cache)
- `src/lib/actions/stats-actions.ts` — Stats actions to restructure for D-09

### Test Infrastructure
- `src/__tests__/mocks/factories.ts` — createMockPrisma() to extend with $transaction default
- `src/__tests__/mocks/module-mocks.ts` — Module mock setup
- `src/__tests__/test-utils.tsx` — Test render wrapper

### Broken Test Files (CRIT-03)
- `src/components/features/dashboard/dashboard-tabs.test.tsx` — wrapper prop TS error
- `src/lib/actions/chart-actions.test.ts` — createMany mock TS error
- `src/lib/actions/shopping-cart-actions.test.ts` — error narrowing TS error

### Supply Actions (CRIT-01)
- `src/lib/actions/supply-actions.ts` — Supply actions needing ownership validation
- `src/lib/actions/supply-actions.test.ts` — Existing supply action tests (extend with ownership rejection tests)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `requireAuth()` from `src/lib/auth-guard.ts`: Returns user with id — use for ownership checks
- `createMockPrisma()` from `src/__tests__/mocks/factories.ts`: Mock factory to extend with $transaction default
- `settled()` helper: New utility to add — extracts fulfilled values from PromiseSettledResult

### Established Patterns
- **Auth guard pattern**: `requireAuth()` outside try/catch in supply-actions and session-actions — stats-actions should match
- **Ownership validation**: Supply actions call `requireAuth()` but don't verify `project.userId === user.id` — gap to close
- **Promise.all for parallel fetching**: Used in dashboard and stats pages — stats page needs Promise.allSettled upgrade
- **Three junction tables**: ProjectThread, ProjectBead, ProjectSpecialty — ownership checks must cover all three supply types
- **Colocated tests**: `foo.test.tsx` next to `foo.tsx`, shared mocks from `@/__tests__/mocks/`

### Integration Points
- Stats page Server Component (`page.tsx`): Data fetching restructured, props become nullable
- StatsPageShell + tab content components: Must handle null data gracefully
- Stats action functions: requireAuth moved outside try/catch
- createMockPrisma: Extended with $transaction default — affects all tests using it

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: this is a "fix what's broken" phase, not a refactor. Changes should be surgical.

</specifics>

<deferred>
## Deferred Ideas

- **Suspense-per-tab streaming for stats page** — Right architectural direction for Next.js 16 but requires restructuring hasNoSessions coordination across tabs. Track as refinement of 999.22 for a future milestone.
- **Project-wide vacuous assertion sweep** — ~17 test files have `if (result.success) { expect(...) }` pattern. Deferred to Phase 24 (Code Quality).
- **Typed tx-client mock** — `createMockTxClient()` returning `Omit<PrismaClient, '$transaction'>` for correct Prisma 7 types. Worth adding later but not blocking for Phase 22.
- **Assertion guard utility** — `assertSuccess(result)` / `assertFailure(result)` narrowing helpers. Phase 24 scope if adopted.

</deferred>

---

*Phase: 22-Critical Fixes & Test Infrastructure*
*Context gathered: 2026-05-18*
