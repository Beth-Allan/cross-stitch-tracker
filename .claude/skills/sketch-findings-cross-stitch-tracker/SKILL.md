---
name: sketch-findings-cross-stitch-tracker
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on cross-stitch-tracker.
---

<context>
## Project: cross-stitch-tracker

Cross-stitch project management app. Supply-adding UX redesign explored through throwaway HTML sketches — testing interaction models, layout density, and keyboard flow for transcribing 30+ colour lists from digital patterns.

Design direction: fast, keyboard-driven data entry. Spreadsheet feel. Picker never obscures the list. Auto-calculation reduces manual work.

Reference points: Google Sheets cell entry, QuickBooks invoice line items, Jira backlog grid, accounting journal entry tables.

Sketch sessions wrapped: 2026-05-03
</context>

<design_direction>
## Overall Direction

**Layout:** Compact fixed-width table with single-line rows. All fields visible at once in a persistent add row at the top. Newest items prepend to top.

**Interaction:** Keyboard-first flow — type code, autocomplete, Enter to select, Enter again to add. Tab for manual overrides. Escape to reset. Minimal mouse usage.

**Calculation:** Stitches auto-calculate need (skeins) via the skein calculator formula. Need defaults to 1 when stitches are unknown. Auto-calc is indicated with a sparkle badge.

**Status:** Proportional SVG donut rings showing have/need ratio — not binary icons.

**Density:** Table layout with 5px vertical cell padding, 11-12px mono code text, inline colour swatches. Footer with running totals.

**Separation of concerns:** The add flow is for transcription (from pattern). "Have" quantities are a separate shopping workflow.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Supply Data Entry | references/supply-data-entry.md | Table + auto-calc with persistent add row, keyboard-first flow, portal dropdown |

## Theme

The winning theme file is at `sources/themes/default.css`.

## Source Files

Original sketch HTML files are preserved in `sources/` for complete reference.
</findings_index>

<metadata>
## Processed Sketches

- 001-supply-add-interaction
- 002-supply-add-synthesis
</metadata>
