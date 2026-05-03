---
name: sketch-findings-cross-stitch-tracker
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on cross-stitch-tracker.
---

<context>
## Project: cross-stitch-tracker

Cross-stitch project management app. Design explorations covering supply-adding UX, project creation wizard, and multi-supply-type management — tested through throwaway HTML sketches.

Design direction: fast, keyboard-driven data entry. Spreadsheet feel. Picker never obscures the list. Auto-calculation reduces manual work. Single-page form with supply takeover for project creation.

Reference points: Google Sheets cell entry, QuickBooks invoice line items, Jira backlog grid, accounting journal entry tables.

Sketch sessions wrapped: 2026-05-03
</context>

<design_direction>
## Overall Direction

**Layout:** Compact fixed-width table with single-line rows for supplies. 720px max-width continuous form for project creation. No multi-step wizards — progressive depth within a single page.

**Interaction:** Keyboard-first flow — type code, autocomplete, Enter to select, qty fields, Enter to add. Tab for manual overrides. Escape to reset. Minimal mouse usage. Segmented type toggle stays sticky between adds.

**Calculation:** Stitches auto-calculate need (skeins) for threads via the skein calculator formula. Need defaults to 1 when stitches are unknown. Auto-calc indicated with primary colour text. Beads default to 1 package, specialty to 1 item. All need fields are editable for manual override.

**Status:** Proportional SVG donut rings showing have/need ratio — not binary icons.

**Density:** Table layout with 5px vertical cell padding, 11-12px mono code text, inline colour swatches. Footer with running totals.

**Supply grouping:** Three sections (Thread/Beads/Specialty) in one table with divider headers + count badges. One persistent add row at top with segmented type toggle.

**Form design:** Merged single-page form with subtle dividers between groups. Green required dots (not "optional" tags). Pattern type cards with expandable sub-fields. Milestone marker transitions to supply takeover mode.

**Separation of concerns:** The add flow is for transcription (from pattern). "Have" quantities are a separate shopping workflow.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Supply Data Entry | references/supply-data-entry.md | Table + auto-calc with persistent add row, keyboard-first flow, portal dropdown, grouped sections with sticky type toggle |
| Project Creation Form | references/project-creation-form.md | Merged single-page form, supply takeover transition, pattern type cards, required dot indicator |

## Theme

The winning theme file is at `sources/themes/default.css`.

## Source Files

Original sketch HTML files are preserved in `sources/` for complete reference.
</findings_index>

<metadata>
## Processed Sketches

- 001-supply-add-interaction
- 002-supply-add-synthesis
- 003-wizard-flow
- 004-multi-supply-types
</metadata>
