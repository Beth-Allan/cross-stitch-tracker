# Phase 13: Supply Takeover - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 13-supply-takeover
**Areas discussed:** Mode switching, Save timing, Fabric + calculator card, Summary bar details
**Mode:** Advisor (full_maturity tier, 4 parallel research agents)

---

## Mode Switching

| Option | Description | Selected |
|--------|-------------|----------|
| A: Activity + local buffer | In-page toggle via React Activity. Form hides, supplies show. Nothing saved to DB until final Create. Matches sketch spec and STATE.md pre-decision. | ✓ |
| B: Create-first + Activity | Chart created on "Add supplies" click, then in-page toggle to supply table with ServerActionAdapter. Supplies persist immediately. Risk: orphan charts. | |
| C: Dedicated route | Create chart, redirect to /charts/[id]/kitting. Separate page with its own data fetching. | |
| D: Current approach enhanced | Keep create-then-redirect to project detail supplies tab. Add polish only. | |

**User's choice:** Option A — in-page Activity toggle with local buffer, two-phase save
**Notes:** Research surfaced React 19.2.5 <Activity> as a stable zero-dependency primitive. STATE.md had pre-decided this approach. Matched sketch spec intent.

---

## Save Timing

| Option | Description | Selected |
|--------|-------------|----------|
| A+: Buffer + localStorage backup | Supplies stored in memory via CreationFlowAdapter. Also backed up to localStorage for tab-close recovery. Single atomic transaction on Create. | ✓ |
| A: Buffer only, no localStorage | Same atomic transaction, but supply data lives only in React state. Tab close = lost work. | |

**User's choice:** Option A+ — local buffer with localStorage backup
**Notes:** Narrowed from 4 options to 2 after D-01 locked the Activity toggle approach. CreationFlowAdapter already annotated in types.ts.

---

## Fabric + Calculator Card

| Option | Description | Selected |
|--------|-------------|----------|
| A: Separate fabric selector above card | Standalone fabric picker row above the calculator card. Distinct "first step" feel. | |
| B: Inside calculator card | One styled card: fabric dropdown first row, then segmented controls below. All calc config in one surface. | ✓ |
| C: No fabric selector in takeover | Calculator card with manual fabricCount only. Fabric stays on the form. Would defer TAKE-03. | |

**User's choice:** Option B — fabric selector inside calculator card
**Follow-up:** Fabric picker syncs with project's fabricId (same source of truth as form). Confirmed.
**Notes:** Sketch didn't include a fabric selector (added as TAKE-03 after sketch). Option B co-locates fabric with its primary consumer (fabricCount). Backlog 999.14 (auto-infer overCount) would naturally live here too.

---

## Summary Bar Details

| Option | Description | Selected |
|--------|-------------|----------|
| A: Static snapshot | Capture form values into ref on transition. Stable but needs re-snapshot logic. | |
| B: Live binding | Bar reads directly from form.values. Always accurate, zero extra state. Dot-separated tokens. | ✓ |
| C: Minimal bar | Just chart name + ← Details link. No other fields. | |

**User's choice:** Option B — live binding from form.values
**Notes:** Key insight: since <Activity> hides the form when bar is visible, "transient partial input" edge case can't actually occur. Live binding is strictly better than snapshot.

---

## Claude's Discretion

- CreationFlowAdapter internal structure and localStorage serialization format
- batchAddSupplies server action implementation and error handling
- Calculator card segmented control component design
- Supply table empty state in creation flow
- Test strategy for two-phase save transaction
- Refactoring handleAddSupplies into mode toggle
- Stale fabric ID detection on draft restore

## Deferred Ideas

- Auto-infer overCount from fabric count (backlog 999.14) — natural fit inside calc card but out of Phase 13 scope
- Supply takeover in edit mode — Phase 14
- Optimistic UI for supply mutations — backlog
