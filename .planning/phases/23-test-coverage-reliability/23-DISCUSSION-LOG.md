# Phase 23: Test Coverage & Reliability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 23-test-coverage-reliability
**Areas discussed:** Error visibility, Progress guardrail, Stats freshness scope

---

## Error Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Log-and-continue | Replace silent .catch(() => {}) with console.warn logging. Fix deleteSession to actually clean up photos. No user-facing noise. | ✓ |
| Warn toast, operation succeeds | Return a warning field from session actions when cleanup fails. Show a non-blocking toast. | |
| Block the operation | Fail the entire session save/delete if file cleanup fails. Maximum consistency. | |

**User's choice:** Log-and-continue
**Notes:** User confirmed log-and-continue and flagged the deleteSession photo orphan gap. Confirmed it fits within RELY-01 scope for this phase — no backlog item needed.

---

## Progress Guardrail

| Option | Description | Selected |
|--------|-------------|----------|
| Warn but allow | Server checks the math and returns a warning. Client shows a toast. Session saves regardless. | ✓ |
| Hard reject | Server blocks any session that would push past 100%. Clean invariant but blocks approximate totals. | |
| Hard reject exact, warn approximate | Block if chart has exact count, warn if approximate. Two code paths. | |

**User's choice:** Warn but allow
**Notes:** Chosen to handle approximate stitch counts gracefully — BAP charts with estimated totals won't block legitimate logging near completion.

---

## Stats Freshness Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Blanket invalidation | Add revalidateTag("stats") to updateChartStatus and all supply-actions mutations. Consistent with session-actions pattern. | ✓ |
| Targeted invalidation | Only project-linked supply mutations. More precise but maintenance risk. | |
| Fine-grained tags | Split into stats-collection and stats-insights. 17+ files to update. Overkill at this scale. | |

**User's choice:** Blanket invalidation
**Notes:** Consistent with existing session-actions pattern. Over-invalidation cost negligible for single-user.

---

## Claude's Discretion

- Test organization and plan structure for TEST-01, TEST-04, TEST-05, TEST-06
- Specific test case design and assertions
- deleteSession photo cleanup implementation details
- Warning toast text and styling for over-100% progress
- Placement of revalidateTag("stats") calls within supply-actions

## Deferred Ideas

- Fine-grained stats cache tags (stats-collection, stats-insights) — revisit if multi-user
- stitchCountApproximate-aware progress guardrail — more precise but unnecessary complexity
- Suspense-per-tab streaming for stats page — right long-term architecture, not in scope
