# Phase 11: Supply Table on Project Detail - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 11-supply-table-on-project-detail
**Areas discussed:** Calculator settings integration, Sorting carry-over, New-row entrance animation

---

## Calculator Settings Integration

| Option | Description | Selected |
|--------|-------------|----------|
| A. Keep everything as-is | Mount the old settings bar exactly as it is today | |
| B. Read-only from DB | Pass saved project values as calcParams. Defer settings editing UI to Phase 13's styled calculator card | ✓ |
| C. Keep existing settings bar | Mount the current CalculatorSettingsBar above the unified table for editing capability | |

**User's choice:** B. Read-only from DB
**Notes:** Clean scope boundary. Phase 13 explicitly owns TAKE-04 (styled calculator card). No evidence that settings editing is actively used on project detail during kitting.

---

## Sorting Carry-Over

| Option | Description | Selected |
|--------|-------------|----------|
| A. No sorting — insertion order | Simplest. Sections provide grouping. Accept visual scanning | |
| B. Carry sort toggle | Reuse existing sortItems() logic. Parent pre-sorts arrays before passing to SupplyTable | ✓ |
| C. Server-side sort via Prisma | Sort persists across page loads. Needs URL param or cookie | |
| D. Column header sorting | Click column headers to sort. Significant new work inside Phase 10 component | |

**User's choice:** B. Carry sort toggle
**Notes:** Project detail is a review/kitting surface where users cross-reference against pattern keys sorted by DMC number. A-Z sorting important for large thread lists.

---

## New-Row Entrance Animation

| Option | Description | Selected |
|--------|-------------|----------|
| A. Return new ID from server action | Server action returns created junction ID. Adapter stores it, table animates that row | ✓ |
| B. Client-side timestamp tracking | No adapter change. Track "new" rows via useState timing. Fragile race conditions | |
| C. Optimistic row insertion | Best UX but significant scope expansion. Row appears instantly, syncs in background | |
| D. Skip animation entirely | Zero work. CSS stays dormant. Accept polish debt | |

**User's choice:** A. Return new ID from server action
**Notes:** Closes the Phase 10 deferred item. Animation CSS already exists. Server action likely already returns the created record.

---

## Claude's Discretion

- ServerActionAdapter implementation details and error handling
- Data transformation approach (Prisma junction types → SupplyRow[])
- Sort toggle placement and styling
- How newRowId is cleared after animation completes
- Empty state design
- Test strategy for ServerActionAdapter

## Deferred Ideas

- Calculator settings editing UI — Phase 13 (TAKE-04)
- Per-column header sorting inside SupplyTable — future data management phase
- Optimistic UI for supply mutations — backlog
