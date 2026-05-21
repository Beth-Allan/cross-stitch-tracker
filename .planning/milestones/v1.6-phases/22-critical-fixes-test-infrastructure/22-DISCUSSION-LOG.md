# Phase 22: Critical Fixes & Test Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 22-Critical Fixes & Test Infrastructure
**Areas discussed:** Stats page failure experience, Test mock foundation depth, Stats action error responses

---

## Stats Page Failure Experience

| Option | Description | Selected |
|--------|-------------|----------|
| A: Promise.allSettled + fallback | Swap Promise.all to Promise.allSettled, nullable props, per-section "unavailable" cards. Low complexity. | ✓ |
| B: Suspense per tab | Each tab streams independently via async Server Components. Better architecture but meaningful refactor. | |
| C: Individual try/catch | Each query independently safe with typed fallback values. Verbose (17 wrappers). | |
| D: Grouped by tab | Promise.allSettled in 3 groups. Tab-level error boundaries, no streaming. | |
| E: Suspense per card section | Maximum granularity per card. Over-engineered for personal app. | |

**User's choice:** A: Promise.allSettled + per-section fallback
**Notes:** Suspense-per-tab (B) acknowledged as right long-term direction, tracked for future milestone.

---

## Test Mock Foundation Depth

| Option | Description | Selected |
|--------|-------------|----------|
| A: Minimal patch | Add $transaction default to createMockPrisma(), fix 3 vacuous assertions. Surgical. | |
| B: Transaction helper | Add mockTransaction() helper alongside default. Eliminates boilerplate. | |
| A+B: Default + helper | Both default and helper. Phases 23-26 benefit. | ✓ |
| D: Assertion guard utility | assertSuccess()/assertFailure() narrowing helpers. New convention across ~17 files. | |
| E: Full mock overhaul | Proxy-based auto-mock. Hard to debug, changes mental model of 1,967 tests. | |

**User's choice:** A+B: Default + mockTransaction() helper
**Notes:** Vacuous assertions in 3 named files fixed with native TS narrowing. Project-wide sweep deferred to Phase 24.

---

## Stats Action Error Responses

| Option | Description | Selected |
|--------|-------------|----------|
| A: Keep current pattern | Zero production changes. Auth indistinguishable from DB errors. | |
| B: Match supply/session pattern | Move requireAuth() outside try/catch. Auth throws, Zod returns result. 3 one-line changes. | ✓ |
| C: Differentiate auth in result | Catch "Unauthorized" specifically in result shape. Brittle string coupling. | |
| D: Typed error codes | Add error codes to StatsResult type. Over-engineered for read-only stats. | |

**User's choice:** B: Match existing supply-actions/session-actions pattern
**Notes:** Root cause: stats-actions calls requireAuth() inside try/catch, making auth failures indistinguishable from DB errors. The fix aligns stats-actions with every other action file in the codebase.

---

## Claude's Discretion

- Supply ownership validation (CRIT-01): Implementation details (check location, error shape) left to Claude
- TypeScript error fixes (CRIT-03): Specific type mismatch resolutions left to Claude

## Deferred Ideas

- Suspense-per-tab streaming for stats page — future milestone refinement of 999.22
- Project-wide vacuous assertion sweep — Phase 24 (Code Quality)
- Typed tx-client mock (createMockTxClient) — future if needed
- Assertion guard utility (assertSuccess/assertFailure) — Phase 24 scope
