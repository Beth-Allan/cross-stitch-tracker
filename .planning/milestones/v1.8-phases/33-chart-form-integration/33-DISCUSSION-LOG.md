# Phase 33: Chart Form Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 33-chart-form-integration
**Areas discussed:** Form field placement, Inline create dialog scope, Designer pre-fill logic

---

## Form Field Placement

| Option | Description | Selected |
|--------|-------------|----------|
| After Designer | Same metadata cluster: Name → Designer → Series → Cover Image → Genres. Series is an entity-level property like designer. | |
| After Genres | End of the basic info section: Name → Designer → Cover Image → Genres → Series. Treats it as more of a classification. | |
| Before Genres | Name → Designer → Cover Image → Series → Genres. Keeps it with visual identity fields but separate from entity metadata. | ✓ |

**User's choice:** Before Genres
**Notes:** None

---

## Inline Create Dialog Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Matches genre inline-add simplicity. User can fill in totalCount/designer/notes later from the Series management page. Keeps the chart form flow fast. | ✓ |
| Name + Total Count | Two fields. Total count is the most common thing you'd know upfront (e.g., "12-chart mystery series"). Designer and notes can be added later. | |
| Name + Total + Designer | Three fields, with Designer as a nested SearchableSelect. More complete but adds complexity to an inline dialog. | |

**User's choice:** Name only
**Notes:** None

---

## Designer Pre-fill Logic

| Option | Description | Selected |
|--------|-------------|----------|
| No pre-fill | Series designer is null on inline create. User adds it later from Series management page. Avoids wrong assumptions (chart designer ≠ series publisher in collab/mixed cases per D-06). | |
| Auto-populate designer | Pass the chart's designerId to createSeries automatically. Convenient for the common case (same designer publishes the series). Can be removed later from Series page if wrong. | ✓ |

**User's choice:** Auto-populate designer
**Notes:** None

---

## Claude's Discretion

- D-03 (dialog copy): Dialog title, button text, and error messages — standard pattern
- D-06 (pattern consistency): Follow established SearchableSelect + InlineDialog pattern exactly
- D-07 (clear behavior): No confirmation on clear — matches all other fields

## Deferred Ideas

None
