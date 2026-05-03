# Sketch Wrap-Up Summary

**Date:** 2026-05-03
**Sketches processed:** 4
**Design areas:** Supply Data Entry, Project Creation Form
**Skill output:** `.claude/skills/sketch-findings-cross-stitch-tracker/`

## Included Sketches
| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | supply-add-interaction | None (exploratory — fed into 002) | Supply Data Entry |
| 002 | supply-add-synthesis | Synthesis: Table + Auto-Calc | Supply Data Entry |
| 003 | wizard-flow | Synthesis: Merged Form + Supply Takeover | Project Creation Form |
| 004 | multi-supply-types | C: Grouped + Top Add Row | Supply Data Entry |

## Excluded Sketches
None.

## Design Direction
Fast, keyboard-driven supply entry using a compact fixed-width table. Three supply types (thread/beads/specialty) share one table with visual section grouping and a sticky segmented type toggle. Project creation uses a single merged form that transitions to supply takeover mode. All interaction follows the same keyboard loop regardless of supply type.

## Key Decisions

### Supply Data Entry (sketches 001, 002, 004)
- **Layout:** Fixed-width table, single-line rows, three grouped sections (Thread/Beads/Specialty) with divider headers + count badges
- **Add row:** Persistent at top of table with segmented type toggle (🧵/📿/✦). Toggle is sticky between adds.
- **Column adaptation:** Thread gets stitches+auto-need, beads get bead count+manual need, specialty gets just manual need
- **Keyboard flow:** Code → Enter (select) → qty → Enter (add) → loop. Same across all types.
- **Auto-calc:** Thread stitches → skeins (primary colour text). Beads/specialty default to 1, editable.
- **Status:** SVG donut rings proportional to have/need ratio
- **Dropdown:** position: fixed + getBoundingClientRect() (portal pattern)
- **Rejected:** Per-section add buttons, flat mixed list with type badges, tabs for supply types, disabled Need field

### Project Creation Form (sketch 003)
- **Layout:** Single 720px continuous form, no section cards, subtle `<hr>` dividers
- **Required fields:** Green dot indicator only on Chart Name and Status. No "optional" tags.
- **Pattern type cards:** 2-column selectable cards. Kit card expands to show colour count input.
- **Supply takeover:** Milestone marker → form collapses to sticky summary bar → supply table fills page
- **Save bar:** Sticky bottom bar with save-readiness hint + Save Draft / Create buttons
- **Calc panel:** Styled card with segmented controls (not flat settings bar)
- **Rejected:** Section cards with numbers, Chart/Project split, sidebar navigation, "optional" labels
