---
sketch: 001
name: supply-add-interaction
question: "Which interaction model makes transcribing a 30+ colour list feel fast and trackable?"
winner: null
tags: [supply, data-entry, keyboard, ux]
---

# Sketch 001: Supply Add Interaction

## Design Question
Which interaction model makes transcribing a 30+ colour list from a digital pattern feel fast, keyboard-driven, and trackable?

## How to View
open .planning/sketches/001-supply-add-interaction/index.html

## Variants

- **A: Sticky Add Row** — Permanent input row at the top of the supply list with colour search, stitches, need, and have fields in one line. Tab between fields, Enter to add. New items appear at top. Autocomplete dropdown is compact and positioned under the input only, never covering the list.

- **B: Continuous Flow Pipeline** — Step indicator (Colour → Stitches → Need → Add) with fields that reveal progressively. Selected colour locks into a chip, subsequent fields slide in. Very guided — you always know what step you're on. Enter confirms and resets the pipeline.

- **C: Smart Table Mode** — The entire supply section is a compact spreadsheet grid. Each existing row is one line (half the height of current rows). The first row is always an empty "add" row with autocomplete. Tab moves between cells. Enter adds the row and creates a new empty one. Existing cells are clickable to edit.

## What to Look For

1. **Speed of the add loop** — how many keystrokes/clicks from "I want to add DMC 310 with 450 stitches" to "it's in the list and I'm ready for the next one"?
2. **Visibility** — can you always see the list of what you've already added while the picker is active?
3. **Keyboard flow** — does Tab/Enter feel natural through the whole sequence?
4. **Density at scale** — toggle to "Many items (12)" and see how each variant handles a longer list
5. **Orientation** — which feels most natural when you have a pattern open in the other window?

## State Toggles
Each variant has state buttons to switch between:
- **Few items (3)** — typical early-stage entry
- **Many items (12)** — mid-entry with a realistic list
- **Empty** — starting from scratch
