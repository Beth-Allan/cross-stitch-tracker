# Phase 7: Project Detail Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 07-project-detail-experience
**Areas discussed:** Page layout & feel, Supply row & calculator UX, Project-level settings, Quick-add & entry order

---

## Page Layout & Feel

| Option | Description | Selected |
|--------|-------------|----------|
| Hero banner | Full-width cover image at top, metadata overlaid or below | ✓ |
| Large sidebar | Side-by-side layout with larger image (40-50% width) | |
| Current size, polish it | Same layout with visual polish | |

**User's choice:** Hero banner — with caveat that many patterns are square/vertical, so it must handle non-landscape aspect ratios gracefully (object-contain, not cropping).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs | Overview + Supplies tabs, tab state in URL | ✓ |
| Scrolling sections | One scrolling page with section breaks | |
| Sidebar + main | Fixed sidebar with metadata, main content area | |

**User's choice:** Tabs
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Essentials only | Name, designer, status badge | |
| Key stats too | Name, designer, status + stitch count, size, progress % | ✓ |
| Full metadata | Everything currently in header | |

**User's choice:** Key stats too
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Warm & tactile | Textures, soft shadows, rounded edges, craft journal feel | ✓ (partial) |
| Clean & editorial | Generous whitespace, strong typography, magazine-like | ✓ (partial) |
| You decide | Claude picks | |

**User's choice:** Both — warm and tactile WITH strong typography. Data-dense while well-designed. Whimsical touches that are warm. Not either/or.
**Notes:** "I'd rather see more information than have to scroll for all the information."

---

| Option | Description | Selected |
|--------|-------------|----------|
| Status gradient | Full-width gradient placeholder using status colours | |
| Pattern texture | Cross-stitch grid pattern in muted tones | |
| Compact hero | Skip banner, metadata-forward layout | ✓ |

**User's choice:** Compact hero — don't fake a visual that isn't there
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Status-aware sections | Reorder/emphasise based on status | ✓ |
| Same layout always | Consistent order regardless of status | |
| You decide | Claude determines | |

**User's choice:** Status-aware sections
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Kebab menu in hero | Three-dot menu for actions | ✓ (partial) |
| Tab bar actions | Contextual edit per tab | |
| Keep visible buttons | Visible Edit and Delete | ✓ (partial) |

**User's choice:** Kebab for overflow (delete, future), but Edit stays visible somewhere — "maybe on the bottom of the page or somewhere else that makes sense"
**Notes:** Hybrid approach — kebab + visible primary action

---

| Option | Description | Selected |
|--------|-------------|----------|
| Integrated in hero | Clickable status badge | ✓ |
| Keep separate | Standalone section | |
| You decide | Claude picks | |

**User's choice:** Integrated in hero — with strong visual cues that it's interactive ("not a secret easter egg thing")
**Notes:** Chevron or dropdown indicator alongside badge

---

## Supply Row & Calculator UX

| Option | Description | Selected |
|--------|-------------|----------|
| Default to stitch count | Stitch count prominent, auto-calc skeins | ✓ |
| Default to skeins | Skeins primary, stitch count optional/expandable | |
| Toggle mode per project | Project-level switch changes all rows | |

**User's choice:** Default to stitch count
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Calculated, then editable | Auto-calc fills Need, user can override | ✓ |
| Separate display + override | Read-only calc label, separate manual field | |
| Locked until toggle | Locked calc, explicit Override button | |

**User's choice:** Calculated, then editable
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same layout, different labels | Identical structure, type-specific labels/units | ✓ |
| Threads get calculator, others simpler | Only threads get stitch-to-skein calc | |
| You decide | Claude determines | |

**User's choice:** Same layout, different labels
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Section header total | Running total in each section header | |
| Footer summary row | Column totals at bottom of each section | |
| Both header + footer | Running total in header + column totals in footer | ✓ |

**User's choice:** Both header + footer
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Recalculate, warn if different | Show "calc suggests X" when override differs | ✓ |
| Always recalculate | Overwrites override on stitch count change | |
| Never recalculate after override | Override is permanent | |

**User's choice:** Recalculate, warn if different
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Two-line row | Line 1: identity, Line 2: numbers | ✓ |
| Expandable detail | Compact default, click to expand | |
| Single line, scrollable | All fields on one line | |

**User's choice:** Two-line row
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Project-level | Formula set once for project | ✓ |
| Per-row adjustable | Each row has own strand count | |
| Project default + per-row override | Default with per-row overrides | |

**User's choice:** Project-level
**Notes:** None

---

## Project-Level Settings

| Option | Description | Selected |
|--------|-------------|----------|
| Supplies tab header | Settings row at top of Supplies tab | ✓ |
| In the chart edit form | Field in project setup form | |
| Kitting summary card | In existing kitting progress card | |

**User's choice:** Supplies tab header
**Notes:** "Should those be visible for all projects, even ones that don't have any stitches entered?" — Led to contextual visibility decision (D-17)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Contextual (appears on first stitch count) | Hidden until needed | ✓ |
| Always visible | Show on all projects | |
| Manual toggle | Explicit "enable calculator" toggle | |

**User's choice:** Yes, contextual
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, in settings bar | Over 1/2 toggle alongside strand count | ✓ |
| Derive from fabric | Infer from fabric count | |
| Defer to later | Ship without over-count | |

**User's choice:** Yes, in settings bar
**Notes:** User suggested user-level defaults for fabric count — noted as deferred idea

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sensible default (14ct) | Default with hint to link fabric | ✓ |
| Skip fabric in formula | Calculate without fabric factor | |
| Require fabric first | Disable calculator until fabric linked | |

**User's choice:** Sensible default (14ct)
**Notes:** User asked about user-level default settings — deferred to future settings page

---

## Quick-Add & Entry Order

| Option | Description | Selected |
|--------|-------------|----------|
| Inline create | "+ Create [search text]" in SearchToAdd | ✓ |
| Link to supplies page | Navigate away to create | |
| Defer this | Keep current behavior | |

**User's choice:** Inline create
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Insertion order default, sortable | Added order with sort toggle | ✓ |
| Always insertion order | No sort option | |
| Drag to reorder | Drag-and-drop | |

**User's choice:** Insertion order default, sortable
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Part of redesign | Fix UX bugs as part of new design | ✓ |
| Separate cleanup first | Fix bugs before redesign | |
| You decide | Claude determines | |

**User's choice:** Part of redesign
**Notes:** Applies to 999.0.13, 999.0.15, 999.0.16

---

| Option | Description | Selected |
|--------|-------------|----------|
| One-at-a-time is fine | Current SearchToAdd flow | |
| Quick-add mode | POS-terminal-style speed entry | |
| Defer, decide later | Ship basic, evaluate real usage | ✓ |

**User's choice:** Defer, decide later
**Notes:** None

---

## Claude's Discretion

- Edit button placement within hero/page layout
- Hero visual treatment for non-landscape images
- Celebration/status-specific visual accents
- Component architecture and split
- Tab implementation approach
- Inline supply create form details
- Responsive mobile behavior
- Exact skein calculation formula
- How "over 1/2" affects formula

## Deferred Ideas

- User-level default fabric count (needs settings page)
- Bulk/speed entry mode for supplies
- Per-row strand count override
- Fabric-adjusted recalculation (chart reference vs actual)
- Per-row stitch type (backstitch, french knots — CALC-06 in v1.2+)
