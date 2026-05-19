# Phase 23: Test Coverage & Reliability - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Fill edge-case test gaps across four subsystems (skein calculator, stitching calendar, record detection, completion estimates), and fix three production reliability issues — silent error swallowing in session file handling, stale stats cache on chart status/supply mutations, and unbounded stitch count progress tracking.

Requirements: TEST-01, TEST-04, TEST-05, TEST-06, RELY-01, RELY-02, RELY-03, RELY-04

</domain>

<decisions>
## Implementation Decisions

### Error Visibility (RELY-01)
- **D-01:** Use log-and-continue for file cleanup failures. Replace `deleteFile().catch(() => {})` with `.catch(err => console.warn("[R2] raw file cleanup failed:", key, err))` to match the existing `console.warn` convention used by photo optimization catch blocks.
- **D-02:** Fix the `deleteSession` structural gap — it currently never calls `deleteFile` when deleting a session, silently orphaning photos in R2. Add proper photo cleanup to the delete path.
- **D-03:** Do NOT show user-facing toasts or warnings for file cleanup failures — these are non-actionable background cleanup tasks. The primary operation (session create/update/delete) should always succeed from the user's perspective regardless of R2 cleanup status.

### Progress Guardrail (RELY-04)
- **D-04:** Warn but allow — server action checks if `stitchesCompleted + newCount > chart.stitchCount` and returns `{ success: true, warning: "overTotal" }` when the session would push progress past 100%.
- **D-05:** Client shows a non-blocking toast warning (e.g., "This session pushes progress past 100% — is your stitch count accurate?"). The session is saved regardless.
- **D-06:** This handles approximate stitch counts gracefully — charts with estimated totals (especially BAPs) won't block legitimate logging near completion. The user can still save and continue.
- **D-07:** The ownership check query in `createSession` can be extended to also select `chart.stitchCount` at no extra round-trip cost.

### Stats Cache Freshness (RELY-02, RELY-03)
- **D-08:** Blanket `revalidateTag("stats")` on `updateChartStatus` in chart-actions.ts. This affects collection breakdown, hero stats (completions count), designer insights, fastest completions, and completion estimates.
- **D-09:** Blanket `revalidateTag("stats")` on all supply-actions mutations. Even catalog-only CRUD busts the cache, but the over-invalidation cost is negligible for a single-user app and avoids the maintenance risk of classifying each supply function.
- **D-10:** This is consistent with the existing session-actions pattern (blanket `revalidateTag("stats")` after mutations). Keeping the pattern uniform means no reasoning overhead when adding future mutations.

### Claude's Discretion
- Test organization and plan structure for the 4 test requirements (TEST-01, TEST-04, TEST-05, TEST-06): Claude decides how to group test work into plans.
- Specific test case design for edge cases: Claude determines the exact assertions and test scenarios, following TDD (tests before implementation).
- `deleteSession` photo cleanup implementation details: Claude decides whether to use the existing `deleteFile` utility directly or wrap it, following the log-and-continue pattern from D-01.
- Warning toast text and styling for the over-100% progress guardrail: Claude decides the exact copy and toast variant (info vs warning).
- Placement of `revalidateTag("stats")` calls within supply-actions: Claude decides whether to add at each return point or extract a shared pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — TEST-01, TEST-04, TEST-05, TEST-06, RELY-01, RELY-02, RELY-03, RELY-04 definitions
- `.planning/ROADMAP.md` §Phase 23 — Success criteria (7 items)

### Session Actions (RELY-01, RELY-04)
- `src/lib/actions/session-actions.ts` — Two `deleteFile().catch(() => {})` calls (lines ~90, ~178), missing `deleteFile` in `deleteSession`, stitch count update logic (line ~39)
- `src/lib/actions/session-actions.test.ts` — Existing session action tests to extend

### Stats Cache (RELY-02, RELY-03)
- `src/lib/actions/chart-actions.ts` — `updateChartStatus` (line ~369) missing `revalidateTag("stats")`
- `src/lib/actions/supply-actions.ts` — ~25 mutation functions, none call `revalidateTag("stats")`
- `src/lib/actions/session-actions.ts` — Reference pattern: existing `revalidateTag("stats")` calls (lines ~110, ~187, ~229)

### Test Targets
- `src/lib/utils/skein-calculator.ts` + `skein-calculator.test.ts` — TEST-01: add fabricCount=0 and resolveDefaultBrandId edge cases
- `src/components/features/stats/stitching-calendar.tsx` + `stitching-calendar.test.tsx` — TEST-04: year-rollover navigation (Jan↔Dec)
- `src/lib/queries/stats/record-detection.ts` + `record-detection.test.ts` — TEST-05: duplicate stitch count on same day
- `src/lib/queries/stats/completion-estimates.ts` + `completion-estimates.test.ts` — TEST-06: exclude already-completed projects

### Test Infrastructure (from Phase 22)
- `src/__tests__/mocks/factories.ts` — `createMockPrisma()` with `$transaction` default, `mockTransaction()` helper
- `src/__tests__/test-utils.tsx` — Test render wrapper
- `src/lib/utils/settled.ts` — `settled()` helper for `PromiseSettledResult` extraction

### Auth & Validation Patterns
- `.claude/rules/auth-patterns.md` — requireAuth pattern
- `.claude/rules/server-actions.md` — Server action rules
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `settled()` from `src/lib/utils/settled.ts`: Phase 22 utility for extracting PromiseSettledResult values
- `createMockPrisma()` from `src/__tests__/mocks/factories.ts`: Mock factory with $transaction default
- `mockTransaction()` helper: For tests needing distinct tx-client scope
- `deleteFile()` from `src/lib/actions/upload-actions.ts`: R2 file deletion utility — already used in session-actions, needs to be added to deleteSession path

### Established Patterns
- **Cache invalidation**: `revalidateTag("stats", { expire: 0 })` used in session-actions — supply-actions and chart-actions should match
- **Action return shape**: `{ success: true/false, error?: string }` — RELY-04 extends this with `warning?: string`
- **TDD**: Tests before implementation in all plans
- **Colocated tests**: `foo.test.tsx` next to `foo.tsx`
- **Console.warn for non-blocking errors**: Used by photo optimization catch blocks — file deletion cleanup should match

### Integration Points
- Session logging modal (log-session-modal): Must handle `warning: "overTotal"` in createSession response and show toast
- Chart-actions `updateChartStatus`: Add `revalidateTag("stats")` alongside existing `revalidatePath` calls
- Supply-actions mutations: Add `revalidateTag("stats")` alongside existing `revalidatePath("/supplies")` calls
- `deleteSession` function: Add `deleteFile(session.photoKey)` with .catch(console.warn) before or after DB delete

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: this is a "fix and test" phase, not a refactor. Changes should be surgical and test-first.

</specifics>

<deferred>
## Deferred Ideas

- **Suspense-per-tab streaming for stats page** — Noted in Phase 22 as the right long-term architecture. Not in scope for Phase 23.
- **Fine-grained stats cache tags** (`stats-collection`, `stats-insights`) — Would allow targeted invalidation per query module. Over-engineered at single-user scale; revisit if multi-user.
- **stitchCountApproximate-aware progress guardrail** — Hard reject for exact counts, warn for approximate. More precise but adds two code paths. Current warn-for-all approach is simpler and sufficient.

</deferred>

---

*Phase: 23-Test Coverage & Reliability*
*Context gathered: 2026-05-18*
