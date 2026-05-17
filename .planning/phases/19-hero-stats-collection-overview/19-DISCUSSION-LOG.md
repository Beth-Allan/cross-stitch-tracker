# Phase 19: Hero Stats & Collection Overview - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 19-Hero Stats & Collection Overview
**Areas discussed:** Hero counter layout, Collection chart types, Entity click-throughs, Overview tab composition

---

## Hero Counter Layout

### Round 1: Initial layout options

| Option | Description | Selected |
|--------|-------------|----------|
| Design-faithful | Green time-window cards at top, lifetime counters in separate StatCards section below. Matches DesignOS spec exactly. | |
| Two-row stacked | Time-window row (green) immediately followed by lifetime row (neutral). Both above fold. | |
| Combined 8-card grid | Single 2x4 grid mixing both groups. Compact but loses hierarchy. | |

**User's choice:** None directly — user pushed back asking whether design-faithful was truly better or just safe, and whether there was a more unique/modern option. Referenced anti-AI aesthetics.

### Round 2: Refined direction after pushback

| Option | Description | Selected |
|--------|-------------|----------|
| Asymmetric hero | One big primary stat + 3 smaller supporting numbers. Real visual hierarchy. | |
| Condensed metrics bar | Single horizontal strip with subtle dividers. Modern, avoids "4 identical cards" pattern. | ✓ |
| DesignOS 4-card grid | Follow spec as-is. Safe, consistent, but common dashboard pattern. | |
| Sketch it first | Defer to /gsd-sketch before planning. | |

**User's choice:** Condensed metrics bar
**Notes:** User identified that the DesignOS 4-card grid is a common AI-generated dashboard pattern and wanted something more intentionally designed. The metrics bar was chosen as a modern alternative that avoids the uniform-grid look.

---

## Collection Chart Types

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed: vert bars + horiz bars | Size = vertical bars (5 ordered labels). Designer + Genre = horizontal bars (long names, ranked). Best chart per data shape. | ✓ |
| All horizontal bars | Consistent visual language. Simpler but size categories lose order emphasis. | |
| Donut for size, bars for rest | Size donut echoes status donut. Visual variety but 2 donuts on one page. | |

**User's choice:** Mixed: vertical bars + horizontal bars
**Notes:** Accepted the recommendation that different data shapes warrant different chart types.

---

## Entity Click-Throughs

| Option | Description | Selected |
|--------|-------------|----------|
| Ranked list below charts | Standard HTML links, keyboard-navigable. Matches existing LinkableValue pattern. | ✓ |
| Ranked list + clickable segments | Dual navigation surfaces. More discoverable but more complex. | |
| Clickable segments only | Click bars/slices to navigate. Compact but not keyboard-accessible. | |

**User's choice:** Ranked list below charts
**Notes:** Accessibility and simplicity won out. No chart segment click handlers needed.

---

## Overview Tab Composition

| Option | Description | Selected |
|--------|-------------|----------|
| Compact: bar → lifetime → 2x2 grid | Metrics bar at top, lifetime counters below, 4 collection charts in 2×2 grid. No gaps. | ✓ |
| Bar → section-headed 2x2 grid | Same but with "Collection Insights" section header. | |
| DesignOS order with placeholders | Follow spec order, leave empty sections for Phase 20/21. | |

**User's choice:** Compact layout, no placeholder gaps
**Notes:** User prefers complete-feeling pages over spec-order fidelity with gaps.

---

## Claude's Discretion

- Top-N count for designer/genre bar charts
- Responsive breakpoints for 2×2 → 1-column grid
- Metrics bar internal implementation (single card vs flex row)
- Chart animation/transition choices
- Color assignments for size/genre charts

## Deferred Ideas

None — discussion stayed within phase scope.
