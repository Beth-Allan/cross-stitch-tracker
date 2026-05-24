# Phase 31: Data Foundation & Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 31-Data Foundation & Fixes
**Areas discussed:** Dual progress definitions, Fix scope verification, Series-designer relationship, Series name constraints

---

## Dual Progress Definitions

| Option | Description | Selected |
|--------|-------------|----------|
| FINISHED + FFO | Both count as finished. FINISHED = stitching complete, FFO = fully finished object. | ✓ |
| Only FFO | Only fully finished objects count. | |
| FINISHED + FFO + ON_HOLD excluded | Everything else is 'in progress'. | |

**User's choice:** FINISHED + FFO
**Notes:** Both represent completed stitching work.

| Option | Description | Selected |
|--------|-------------|----------|
| All assigned charts = owned | Any chart in library linked to series counts as 'owned'. | ✓ |
| Only charts with projects | Only charts promoted to a Project count. | |

**User's choice:** All assigned charts = owned
**Notes:** User clarified that charts and projects are interchangeable in this app (merged creation form always creates both).

| Option | Description | Selected |
|--------|-------------|----------|
| Show count only: '8 charts' | No denominator when totalCount is null. | |
| Show as fraction: '3/8 finished' | Only show finished/owned ratio. | |
| Both: '8 charts, 3 finished' | Show both facts side by side. | ✓ |

**User's choice:** Both: '8 charts, 3 finished'

---

## Fix Scope Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Verify and close both | Run tsc, confirm allSettled, mark as already-resolved. | ✓ |
| FIX-02 needs more: Suspense boundaries | Split into Suspense boundaries for independent streaming. | |
| FIX-02 needs more: query grouping | Split into 3-4 logical groups with separate allSettled calls. | |

**User's choice:** Verify and close both
**Notes:** TypeScript reports 0 errors. Stats page already uses Promise.allSettled(). No new implementation needed — just verification.

---

## Series-Designer Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Always matches charts' designer | Series designer should match charts. Simple FK. | |
| Can differ (independent link) | Series curated by user, different designers possible. | |
| Display only, no enforcement | FK for display, no validation that charts match. | ✓ |

**User's choice:** Display only, no enforcement (via free-text: "almost always the same, but edge cases exist")

| Option | Description | Selected |
|--------|-------------|----------|
| Always manual | User sets designer when creating series. No auto-fill. | ✓ |
| Auto-suggest but editable | Pre-fill from current chart on inline create. | |

**User's choice:** Always manual

| Option | Description | Selected |
|--------|-------------|----------|
| Derive from charts (no FK) | Computed at query time. No FK on model. | |
| Keep FK on Series | Simple nullable FK to Designer. Always available. | |
| You decide | Let Claude pick. | ✓ |

**User's choice:** You decide
**Notes:** User initially questioned whether a FK was needed ("why can't the series just use the Designer for the charts?"). After discussion of tradeoffs, deferred to Claude's recommendation.

---

## Series Name Constraints

| Option | Description | Selected |
|--------|-------------|----------|
| Unique (like Designer) | No two series share a name. Mirrors Designer pattern. | ✓ |
| Unique per designer | @@unique([name, designerId]). | |
| No uniqueness constraint | Allow duplicate names. | |

**User's choice:** Unique (like Designer)

| Option | Description | Selected |
|--------|-------------|----------|
| Just name, totalCount, designer | Keep it minimal. | |
| Add notes field | Optional notes for user context. | ✓ |
| Add notes + coverImage | Notes plus optional cover image. | |

**User's choice:** Add notes field

---

## Claude's Discretion

- **Series designer FK:** Retained on the model. Rationale: entity property (not derivation), management pages need quick access, matches existing Designer/Genre patterns. The "calculated at query time" convention applies to computed metrics, not entity relationships.

## Deferred Ideas

None — discussion stayed within phase scope.
