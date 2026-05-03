# Phase 10: Unified Supply Table - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 10-unified-supply-table
**Areas discussed:** Supply search features, Auto-calc before the calculator card, Building new vs evolving existing

---

## Supply Search Features

| Option | Description | Selected |
|--------|-------------|----------|
| A: Full parity | Bring everything from SearchToAdd: color filter, inline create, keyboard nav | |
| B: Minimal | Just search + select + disabled already-added items | |
| C: Search + color filter | Keep color family dropdown, drop inline create | |
| D: Search + inline create | Type-and-select with inline create at zero results, no color filter | ✓ |

**User's choice:** D: Search + inline create, no color filter
**Notes:** Color filter is a browsing tool for exploring by color — not useful during transcription when user always has the code. Inline create handles non-seeded supplies (Weeks Dye Works, Mill Hill). After create, auto-add and refocus search input.

---

## Auto-Calc Before the Calculator Card

| Option | Description | Selected |
|--------|-------------|----------|
| A: Hardcoded defaults | Bake in 14ct/2-strand/over-1/20% waste, no props | |
| B: Props with defaults | Accept optional calcParams prop, merge with sensible defaults | ✓ |
| C: Simplified ÷3000 | Use sketch's rough approximation as a separate code path | |
| D: Inline settings row | Add fabric/strand dropdowns in table header | |

**User's choice:** B: Props-based with defaults
**Notes:** Real `calculateSkeins()` exists — use it, don't create a second code path. Props-based approach costs nothing in Phase 10 and means Phase 11 can pass fabric count from assigned fabric, Phase 13 can wire up the full calculator card.

---

## Building New vs Evolving Existing

| Option | Description | Selected |
|--------|-------------|----------|
| A: Build completely fresh | New directory, everything from scratch, old untouched | |
| B: Extract + reuse | Pull primitives to canonical homes first, build new around them | |
| C: Evolve old tab | Refactor project-supplies-tab.tsx into new design | |
| D: Hybrid | Build fresh supply-table/ directory, import existing primitives from current locations | ✓ |

**User's choice:** D: Hybrid — fresh build, import primitives
**Notes:** Don't touch existing supply components (they're live until Phase 14 cleanup). Import EditableNumber and ColorSwatch from their current locations. One more needsBorder copy is acceptable debt.

---

## Claude's Discretion

- Component file structure within supply-table/
- Test strategy and adapter mocking approach
- SVG donut implementation details
- Loading/empty states
- Keyboard navigation implementation
- Error handling patterns

## Deferred Ideas

- Color family browsing for supply exploration — future supply detail surface (backlog 999.1)
- needsBorder consolidation — Phase 14 cleanup
