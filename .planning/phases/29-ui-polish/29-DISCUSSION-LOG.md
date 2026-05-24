# Phase 29: UI Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 29-ui-polish
**Areas discussed:** Status & size pill colors, Digital copy indicator, Skein calc on project supplies, File upload changes

---

## Status & Size Pill Colors

### Size pill styling

| Option | Description | Selected |
|--------|-------------|----------|
| Per-size colors | Each size gets its own color (Mini=sky, Small=teal, Medium=amber, Large=orange, BAP=rose) | ✓ |
| Neutral with accent dot | Keep semi-transparent background, add colored dot indicator | |
| Single accent color | All size pills use one accent color | |

**User's choice:** Per-size colors, but more muted/pastel/lighter than status badge colors so they're visually unique.
**Notes:** User emphasized the two badge types should be visually distinct.

### Size color intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Lighter existing palette | Same hues (blue/green/amber/orange/red) at -50 shade instead of -100 | ✓ |
| Monochrome gradient | Same hue at different intensities (lighter for Mini, darker for BAP) | |
| You decide | Let Claude pick | |

**User's choice:** Lighter existing palette.

### Unstarted status color

| Option | Description | Selected |
|--------|-------------|----------|
| Slate/stone | Cool grey-blue (slate-50/slate-700). Neutral but clearly colored | ✓ |
| Indigo | Soft blue-violet | |
| Cyan/teal | Light teal | |

**User's choice:** Slate/stone.
**Notes:** User provided screenshot showing gallery cards where both status and size badges appeared completely grey/colorless. Root cause: all shown cards were "Unstarted" status (which uses `bg-muted`) and size badge uses hardcoded grey inline classes.

### Status badge visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Size pills only | Status badges are fine, only size pills need fixing | |
| Both need fixing | Status badges look washed out too | |
| Both, but different fixes | Size pills need colors. Status pills need better contrast | |

**User's choice:** (Free text) Issue is on gallery cards — need unique colours for size badges and StatusBadge colours need to be used on Pattern Dive page, not just dashboard page.
**Notes:** Investigation showed StatusBadge IS used on Pattern Dive via ProjectGallery. The real issue was that Unstarted (the most common status for 500+ charts) is intentionally grey in STATUS_CONFIG.

---

## Digital Copy Indicator

### Indicator type

| Option | Description | Selected |
|--------|-------------|----------|
| Small icon overlay | Subtle icon in a corner of cover image area | |
| Badge in card body | Small text badge or icon below the image, near metadata | ✓ |
| Dot indicator | Tiny colored dot in card corner | |

**User's choice:** Badge in card body.

### Indicator detail level

| Option | Description | Selected |
|--------|-------------|----------|
| Just presence | Icon + "Digital copy" label. Boolean | ✓ |
| File count | Icon + count like "2 files" | |
| You decide | Claude picks simplest approach | |

**User's choice:** Just presence.

---

## Skein Calc on Project Supplies

### Control layout

| Option | Description | Selected |
|--------|-------------|----------|
| Same CalculatorCard | Reuse full CalculatorCard component above supply table | ✓ |
| Compact inline bar | Simplified controls in a single row, skip fabric selector | |
| Settings popover | Gear icon opens popover with controls | |

**User's choice:** Same CalculatorCard.

### Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Persist to database | Changes save via server action | ✓ |
| View-only (session) | Local state only, reset on reload | |
| You decide | Claude picks based on adapter pattern | |

**User's choice:** Persist to database.

---

## File Upload Changes

### Zip scope

| Option | Description | Selected |
|--------|-------------|----------|
| Chart files only | .zip only for digital working copies | ✓ |
| All file uploads | Add .zip to both chart files and cover/session uploads | |
| You decide | Claude picks based on upload action logic | |

**User's choice:** Chart files only.
**Notes:** User asked about making max file size even larger for book PDFs. R2 supports 5GB per object. User has book PDFs up to 140.6MB but agreed to split those into individual patterns.

### Max file size

| Option | Description | Selected |
|--------|-------------|----------|
| 100MB | Generous single-user limit | |
| 50MB | Covers most book PDFs comfortably | ✓ |
| 25MB | Middle ground | |

**User's choice:** 50MB. Decided books should be split pattern-by-pattern anyway.

---

## Claude's Discretion

- Test strategy and plan structure/grouping
- Lucide icon for digital copy indicator
- Digital copy badge positioning in card body
- CalculatorCard wiring on project detail (server action approach)
- SizeBadge reuse approach on gallery cards
- BUG-03 supply sort investigation and fix

## Deferred Ideas

None — discussion stayed within phase scope.
