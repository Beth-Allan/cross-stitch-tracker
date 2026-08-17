---
sketch: "004"
name: multi-supply-types
question: "How do beads and specialty items join the thread supply table? Same table, tabbed, or separate?"
winner: "C"
tags: [supply, beads, specialty, table, sections]
---

# Sketch 004: Multi-Supply Types

## Design Question
How should three structurally different supply types (thread, beads, specialty) coexist in one unified surface? Threads have stitch count → auto-calc, beads have bead count → package need, specialty just has a manual need. The interaction loop should feel identical across all types.

## How to View
open .planning/sketches/004-multi-supply-types/index.html

## Variants
- **A: Grouped + Per-Section Add** — Three visual sections (Thread/Beads/Specialty) in one table. Each section has its own "+ Add" button in the section header that reveals a type-specific add row within that section. Columns adapt per type.
- **B: Flat + Type Badge** — All supplies in one unsorted flat list. Each row has a coloured type badge (Thread/Bead/Special). One universal add row at top with segmented type selector. No visual grouping.
- **C: Grouped + Top Add Row** ★ Selected — Sections group the data visually, but one persistent add row at top with segmented type toggle. Switching type changes the add row fields. New items sort into their correct section automatically.

## Winner: C — Grouped + Top Add Row

### Key decisions
- **One persistent add row at top** with segmented type toggle (🧵/📿/✦) — not per-section add buttons
- **Sticky type toggle** — stays on Thread until you explicitly switch to Beads, so you can blast through 30+ thread codes without re-selecting
- **Visual section grouping** — Thread/Beads/Specialty sections with divider headers and counts, items auto-sort into their section
- **Live auto-calc for threads** — typing stitch count auto-fills Need in green (editable for override)
- **Beads get a "beads needed" column** → manual package need (defaults to 1, editable)
- **Specialty just gets need** — no qty column, defaults to 1 item
- **Same keyboard loop across all types** — search → Enter (select) → qty field → Enter (add) → loop
- **Columns adapt per type** — stitches/arrow/auto-need for thread, beads/arrow/manual-need for beads, just need for specialty. Empty columns when not applicable.

### Rejected
- **A: Per-Section Add** — Good grouping but "+ Add" button per section breaks the flow. Have to mouse to the section header, then back to the input. Extra friction for the same result.
- **B: Flat + Type Badge** — No visual grouping makes it hard to scan "how many beads do I need?" at a glance. Type badges add noise to every row.

## What to Look For
- **Scanning ease:** Can you glance at the table and quickly see "how many beads do I need?" Sections help vs. badges?
- **Add flow consistency:** Does the keyboard loop (search → qty → need → Enter) feel the same regardless of type?
- **Column adaptation:** When beads don't have stitch count, or specialty doesn't have qty — does the empty column feel weird?
- **Section overhead:** With only 1-2 beads and 1 specialty item, do section headers add too much visual weight?
- **Type switching friction:** In B and C, how does the segmented toggle feel? Is it fast enough for "do all threads, then switch to beads"?
