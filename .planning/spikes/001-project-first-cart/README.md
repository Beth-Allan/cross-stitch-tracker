---
spike: "001"
name: project-first-cart
validates: "Given three shopping cart layouts (current 6-tab, project-first accordion, hybrid toggle), when a stitcher compares them side-by-side, then one layout clearly reduces cognitive load while preserving cross-project supply aggregation"
verdict: VALIDATED
related: []
tags: [shopping-cart, ux, information-architecture, phase-9]
---

# Spike 001: Project-First Cart Redesign

## What This Validates

Three layouts compared side-by-side with identical mock data (2 selected projects, 8 thread types, 2 bead types, 1 specialty, 2 fabric entries):

- **Layout A (Current):** 6 tabs — Projects, Threads, Beads, Specialty, Fabric, Shopping List. Supplies aggregated across projects.
- **Layout B (Project-First):** 2 tabs — Projects (accordion with inline supplies), Shopping List. "Also in [project]" notes for cross-project items.
- **Layout C (Hybrid Toggle):** 2 tabs — Projects (with "By Project" / "By Supply Type" toggle), Shopping List. Best-of-both but adds a UI concept.

Key questions:
1. Does project-first reduce cognitive load vs 6 tabs?
2. How does cross-project dedup feel? (DMC 310 in 2 projects)
3. Does the Shopping List still work as a flat checklist?
4. Is the hybrid toggle worth the added complexity?

## How to Run

```bash
open .planning/spikes/001-project-first-cart/mockup.html
```

## What to Expect

- Top bar switches between all three layouts
- Each layout uses the same mock data (Woodland Sampler + Highland Cow selected)
- Layout A: Click through 6 tabs to see how supply browsing currently works
- Layout B: Expand/collapse projects to see inline supplies; note "Also in..." annotations
- Layout C: Toggle between "By Project" and "By Supply Type" views within one tab
- Shopping List checklist items are clickable in all layouts

## Results

**Verdict: VALIDATED — Layout C (Hybrid Toggle)**

User evaluated all three layouts side-by-side. Layout C selected because:
- Reduces 6 tabs to 2 (Projects + Shopping List) — major cognitive load reduction
- "By Project" / "By Supply Type" toggle preserves both mental models
- "By Supply Type" is better than current 4 separate supply tabs (one scrollable view with sections)
- Toggle is a well-established UX pattern (Notion, Figma, Finder)
- No information loss vs current design

**Decision:** Build Layout C in the current Phase 9 branch before shipping.
