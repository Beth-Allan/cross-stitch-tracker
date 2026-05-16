# Phase 12: Merged Form - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 12-merged-form
**Areas discussed:** Pattern type cards, Save Draft behavior, Form rebuild strategy, Genre chip selector

---

## Pattern Type Cards

| Option | Description | Selected |
|--------|-------------|----------|
| UI-level mapping only | Keep 3 booleans (isPaperChart, isFormalKit, isSAL). Render 4 cards that map to existing fields. Zero schema changes. | ✓ |
| Add isSubscription boolean | Add a 4th boolean if Subscription is genuinely different from SAL. Requires Prisma migration. | |
| Zod-only chartType | Single selection in UI mapped to booleans on write. Adds a translation layer but cleaner card UX. | |

**User's choice:** UI-level mapping only
**Notes:** User clarified "Subscription" in REQUIREMENTS.md was a misnomer — SAL/Stitch-Along is the correct label. The 4 cards are Paper Chart, Digital, Kit, SAL. Paper/Digital are mutually exclusive; Kit/SAL are independent overlays.

---

## Save Draft Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage only | Save Draft serializes form state to browser storage. Survives page refresh. Zero schema changes. | ✓ |
| DB draft record | Save Draft creates a real chart+project record with isDraft=true. Requires migration, gallery filter updates. | |
| Create immediately on name entry | No separate draft concept. Entering a name auto-creates the record. Fastest but creates incomplete records. | |

**User's choice:** localStorage only
**Notes:** Single-user app on one Mac — localStorage is sufficient. FEATURES.md already lists auto-save as an anti-feature.

---

## Form Rebuild Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid | New shell + 2-3 new components alongside existing code. Reuse hook, primitives, tests. ~200-300 lines new. | ✓ |
| Fresh directory | New chart-form/ directory, everything rebuilt. Clean boundary but ~900 lines rebuilt, all tests rewritten. | |
| Restructure in-place | Refactor existing section components into new grouping. Medium risk during transition. | |

**User's choice:** Hybrid
**Notes:** Phase 10's fresh-directory precedent doesn't apply — supply table was entirely new component family with zero shared code. Chart form shares 70-80% of primitives and all logic. Keep use-chart-form.ts, build new shell, add pattern-type-cards.tsx and sticky-save-bar.tsx.

---

## Genre Chip Selector

Research found this was not a real gray area — current `GenrePicker` is already chip toggles matching the sketch spec. No SearchableSelect is used for genres.

**User's choice:** Keep as-is (acknowledged via "Create context")
**Notes:** Only adjustment needed is style fidelity check (font-weight: 500 on selected chips).

---

## Claude's Discretion

- Form group wrapper component design
- Required dot indicator implementation
- localStorage serialization and debounce for Save Draft
- Stale ID detection on draft hydration
- Save-readiness hint text logic
- Milestone marker connection to Phase 13
- Test strategy for new components

## Deferred Ideas

- Supply takeover transition — Phase 13
- Edit mode using merged form layout — Phase 14
- Deprecated component removal — Phase 14
