---
sketch: "003"
name: wizard-flow
question: "How should the progressive-depth single-page form feel? Where are save points, section boundaries, and how does chart basics → details → supplies flow as one page?"
winner: "Synthesis: Merged Form + Supply Takeover"
tags: [wizard, form, layout, progressive-depth, supplies]
---

# Sketch 003: Wizard Flow & Layout

## Design Question
How should the add-chart experience flow as a single continuous page with progressive depth? The current 8-section form is a wall of fields. This sketch explores consolidation, save-anywhere, and how to transition from form-filling to supply transcription.

## How to View
open .planning/sketches/003-wizard-flow/index.html

## Variants
- **A: Section Cards** — All sections visible as stacked cards. Rejected: too static, no progressive depth.
- **B: Progressive Reveal** — Milestone markers between sections. Good base but Chart/Project split is artificial.
- **C: Sidebar Nav** — Sticky TOC with progress dots. Nice for docs, too heavy for a form.
- **D: Synthesis: Merged Form + Supply Takeover** ★ Selected — Single merged form with dividers, one milestone, supply section takes over the page.

## Winner: Synthesis — Merged Form + Supply Takeover

### Key decisions
- **No Chart/Project split** — one continuous form with subtle `<hr>` dividers between logical groups: identity → pattern details → workflow → timeline
- **One milestone marker** at the bottom: "Project details filled in. Ready for supplies?"
- **Supply takeover mode** — clicking "Add supplies →" collapses the form into a compact summary bar ("Woodland Sampler · Ink Circles · Kitting · 54,800 stitches") and the supply table fills the page. "← Details" to go back.
- **Pattern type cards** — selectable card-style toggles instead of bare checkboxes. Kit card expands to show "Colours in kit" input when selected.
- **Required dot only** — green dot on required fields (Chart Name, Status). Everything else is implicitly optional. No "optional" tags.
- **Onion skinning** lives in the pattern section (chart property, not project workflow).
- **Styled calc panel** — "Skein Calculator" card with segmented controls for Strands/Over, labeled inputs for Fabric Count/Waste. Replaces the flat settings bar.
- **Autocomplete** — reuse sketch-002's proven portal pattern (`position: fixed` + `getBoundingClientRect()`). Not re-implemented here.
- **Sticky save bar** always visible: "Name entered — ready to save at any point"

### Form field groups (with dividers)
1. **Identity:** Chart Name (required), Designer, Cover Image, Genres
2. **Pattern:** Width, Height, Stitch Count, Pattern Type cards, Onion skinning toggle
3. **Workflow:** Status (required), Storage Location, Stitching App, Digital File
4. **Timeline:** Start/Finish/FFO Dates, Notes, Want to start next toggle
