---
name: Phase 7 Reimagined — Project Detail Experience
description: Exploration notes on reshaping Phase 7 from skein-calculator-only to a full project detail page + supply redesign
type: note
date: 2026-04-14
context: /gsd-explore session with Beth
---

## Decision

Phase 7 should be renamed from "Skein Calculator & Supply Workflow" to "Project Detail Experience" (or similar). The skein calculator is not a standalone feature — it's part of redesigning how supplies are displayed and managed on the project detail page.

## Key Insights

### The calculator IS the thread-adding experience
The skein calculation should happen inline when adding a thread colour. Mental model is a spreadsheet row: colour → stitches → calculated skeins → needed quantity. Not a separate tool or modal.

### Three entry paths for supply quantities
1. **Chart gives per-colour stitch counts** → enter stitches, calculator auto-populates skeins
2. **Chart gives skein quantities** (for a specific fabric setup) → enter skeins directly
3. **No data** → guess and enter manually

Stitch count is the bonus path. The baseline is always "how many do I need."

### Cross-supply-type pattern
This isn't thread-specific. Beads need package counts, kreinik needs length. The row structure is universal: supply item → optional usage input → calculated quantity → manual override. Units change per type.

**Priority order:** threads/skeins (most common) → beads/packages → specialty items

### The project detail page needs love too
Current detail page feels "like a boring piece of paper" — not the "ooh I love looking at this" feeling it should evoke. Redesigning supply rows inside a flat page would make the contrast worse. The page itself needs to feel like pulling a beloved pattern out of your stash.

### Fabric-adjusted recalculation is out of scope (for now)
Charts sometimes specify "model stitched on 14-count over two" but user may stitch on 18-count. Auto-adjusting between chart reference fabric and actual fabric is interesting but requires capturing the chart's reference setup — too much input for uncertain payoff right now. Parked as a seed.

## Backlog Items Absorbed

- 999.0.2: Per-colour stitch counts & skein calculator
- 999.0.13: Thread picker scroll UX
- 999.0.15: SearchToAdd panel positioning
- 999.0.16: SearchToAdd highlight conflict
- 999.0.10: Quick-add missing supplies from detail page

## Two Layers

1. **Page redesign** — visual hierarchy, cover image prominence, space usage, delight factor
2. **Supply experience** — display, add, manage threads/beads/specialty with calculation baked in
