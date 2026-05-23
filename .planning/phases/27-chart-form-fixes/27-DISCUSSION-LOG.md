# Phase 27: Chart Form Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 27-chart-form-fixes
**Areas discussed:** Designer creation flow, Stitch count auto-sum, Skeins display format

---

## Designer Creation Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Wire up InlineDesignerDialog | Same pattern as storage/stitching app inline dialogs. Shows name + optional website fields with pending/error feedback. | ✓ |
| Toast-only silent create | Create directly from search term, show success/error toast. No dialog, no website capture. | |
| Reuse DesignerFormModal | Full designer form from /designers page. Requires refactoring to avoid router.refresh clobbering form state. | |

**User's choice:** Wire up InlineDesignerDialog (Recommended)
**Notes:** Consistent with existing inline creation pattern. InlineDesignerDialog component already exists and is feature-complete — just needs wiring.

---

## Stitch Count Auto-Sum

| Option | Description | Selected |
|--------|-------------|----------|
| Display-only sum hint | Shows supply stitch total as a read-only hint. Manual field stays authoritative for size category. Safe with partial supply entry. | ✓ |
| Auto-fill when empty | Writes supply sum into the field only if currently zero. One-shot, not live updating. | |
| Reactive auto-sum | Live updates as you edit supply stitch counts. Risk: partial sums skew size category. | |
| Lock with escape hatch | Auto-sum + manual override toggle. Most flexible but complex for a fix phase. | |

**User's choice:** Display-only sum hint (Recommended)
**Notes:** Domain reality: cross-stitch charts routinely have 50+ colors, and stitchers often only track main threads initially. Partial sums would produce misleading size category classifications.

---

## Skeins Display Format

| Option | Description | Selected |
|--------|-------------|----------|
| Widen Need column % | Adjust table column percentages so Need has room for 3-digit numbers + label + icon. Simplest fix. | ✓ |
| min-width on Need cell | Set a minimum width floor on the Need column without changing other column ratios. | |
| Add tooltip with raw decimal | Keep current width, add tooltip showing formula breakdown (e.g., "≈1.3 skeins → buy 2"). | |

**User's choice:** Widen Need column % (Recommended)
**Notes:** calculateSkeins already uses Math.ceil (whole numbers). The rounding is correct — this is purely a CSS column width issue.

---

## Claude's Discretion

- **BUG-02 (Designer tab focus):** Implementation approach for fixing SearchableSelect focus management. Tab into Designer field should allow immediate typing.
- **BUG-04 (Designer thumbnails):** Investigation and fix for wrong/missing chart thumbnails on designer detail pages.
- Plan structure and grouping of 5 bugs into plans/waves.
- Test strategy for each fix.
- Exact column width percentages for Need column.
- Stitch count hint text formatting and placement.

## Deferred Ideas

None.
