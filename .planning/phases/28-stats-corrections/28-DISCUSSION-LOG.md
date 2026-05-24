# Phase 28: Stats Corrections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 28-stats-corrections
**Areas discussed:** Records data scope, Total stitches meaning, Chart + list consolidation, Days-in-library placement

---

## Records Data Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full library (Recommended) | Show all threads/designers/genres across 500+ charts regardless of sessions | ✓ |
| Session-gated only | Keep current behavior — insights only reflect projects actively stitched | |
| Hybrid: library + session overlay | Library-wide data with session-active highlights | |

**User's choice:** Full library, with status filter pills for narrowing
**Notes:** "Full library is most important, but it might be nice to be able to filter the stats - so whole library, or filtered to stitching only, finished only, kitting only, etc. It should always be all time - the year review that's in a future feature will have the yearly stat breakdowns."

### Follow-up: Filter UX

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown near year toggle | Replace/supplement YearScopeToggle with dropdown | |
| Pill/chip row | Horizontal row of status pills | ✓ |
| You decide | Claude picks | |

**User's choice:** Pill/chip row
**Notes:** "We just said all time always, so why is there a year toggle? I like the pill-chip row I think."

### Follow-up: Filter mode

| Option | Description | Selected |
|--------|-------------|----------|
| Single-select with 'All' | One active pill at a time | |
| Multi-select toggles | Toggle multiple statuses on/off | ✓ |
| You decide | Claude picks | |

### Follow-up: Status grouping

| Option | Description | Selected |
|--------|-------------|----------|
| All 7 statuses | Full status system as pills | |
| Grouped statuses (Recommended) | All, Not Started, In Progress, Complete | ✓ |
| You decide | Claude picks | |

### Follow-up: Tab placement

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, move insights to Overview | Overview gets insights + filter pills. Records keeps session achievements. | ✓ |
| Different arrangement | Alternative layout | |

**User's choice:** Move insights to Overview
**Notes:** "I don't think things like full-library insights should be on the sessions/records tab. That tab is for things like 'the most colours, highest stitch count...' and things like that. Data about most popular threads, most stitches per colour, designers, etc should be on the regular stats page, no?"

---

## Total Stitches Meaning

| Option | Description | Selected |
|--------|-------------|----------|
| Library stitch total | Sum of all charts' totalStitchCount | |
| Rename existing counter | Rename to 'Stitches Logged' | |
| Both stats side by side | Show both library total and session total | ✓ |

**User's choice:** Both stats, but in different locations

### Follow-up: Placement

| Option | Description | Selected |
|--------|-------------|----------|
| 5th lifetime counter card | Expand grid to 5 cards | |
| Replace current total | Library total replaces session total in lifetime counters | ✓ |
| You decide | Claude picks | |

### Follow-up: Session total fate

| Option | Description | Selected |
|--------|-------------|----------|
| 5 cards — keep both | Expand to 5 lifetime counter cards | |
| Drop session total | Yearly total in metrics bar is close enough | |
| You decide | Claude picks | |

**User's choice:** (Other) "Move the all time session total to records and leave lifetime total stitches in all projects on the overview"

---

## Chart + List Consolidation

| Option | Description | Selected |
|--------|-------------|----------|
| Remove RankedList, chart only (Recommended) | Chart Y-axis already shows names. Remove redundant list. | |
| Remove chart, keep list only | Replace chart with just the ranked list | |
| Merge: chart bars + inline counts | Keep chart, add counts on bars, remove list | ✓ |

**User's choice:** Merge — wanted clickable names from the list within the chart
**Notes:** "I'd like the names of designers/genres clickable from the list within the chart - the list below the chart has them clickable, but I'd like them clickable IN the chart."

### Follow-up: Clickability + bar labels

| Option | Description | Selected |
|--------|-------------|----------|
| Tooltip only (Recommended) | Hover/tap shows exact count. Clean bars. | ✓ |
| Count labels on bars | Exact count at end of each bar | |
| You decide | Claude picks | |

**Notes:** "If it's too complicated to make them clickable, then we don't need to have them clickable (at least for this first version). 2.0 can look at making them clickable. Tooltips are ok."

---

## Days-in-Library Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Days since first chart added | Count from earliest chart's createdAt | |
| Average days per chart | Mean time charts have been in library | |
| Both — I'll clarify | Specific meaning in mind | |

**User's choice:** (Other) "It's doing the right thing right now, the issue is that the formatting is bad. 23 - 23 days in library is how it reads right now. It should have 23 in larger letters (like it is now) and then 'days in library' in the smaller letters (just remove the second 23)."

### Follow-up: Location

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard fix only | Fix Buried Treasures formatting, no stats page stat | ✓ |
| Dashboard fix + stats page stat | Fix dashboard AND add new stats counter | |
| Stats page only | Add stats counter, leave dashboard as-is | |

---

## Claude's Discretion

- STAT-02 integer axes: `allowDecimals={false}` on all numeric chart axes
- Test strategy and plan structure/grouping
- Exact nuqs param names for status filter URL state
- Session stitch total hero stat styling on Records tab
- Whether to keep RankedList component or remove it
- Layout adjustments for insights moving to Overview

## Deferred Ideas

- Clickable designer/genre names on chart Y-axis — future version
- Year scoping for Records tab — deferred to Year in Review feature
