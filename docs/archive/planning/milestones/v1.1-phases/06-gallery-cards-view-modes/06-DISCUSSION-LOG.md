# Phase 6: Gallery Cards & View Modes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 06-gallery-cards-view-modes
**Areas discussed:** Filter & search scope, Card data mapping, Gallery page structure, Sort behaviour

---

## Filter & Search Scope

### Q1: How much of the AdvancedFilterBar should Phase 6 build?

| Option | Description | Selected |
|--------|-------------|----------|
| Search + status + size only | Matches GLRY-05 exactly. Simpler filter bar. Full 12-dimension bar comes in v1.2. | ✓ |
| Full bar structure, 3 filters enabled | Build full shell with architecture for BRWS-01 but only 3 dimensions active. | |
| Search + status + size + designer | Add designer as practical 4th filter for 500+ chart collection. | |

**User's choice:** Search + status + size only
**Notes:** Keep scope tight to GLRY-05 requirements.

### Q2: Where should the filter bar and view toggle sit on the page?

| Option | Description | Selected |
|--------|-------------|----------|
| Stacked: filters above, toggle+count below | Matches design screenshots. Clean visual hierarchy. | ✓ |
| Single row: filters left, toggle right | Compact but crowded. | |
| You decide | Claude picks. | |

**User's choice:** Stacked layout matching design screenshots.

### Q3: Should active filter chips appear below the filter bar?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with 'Clear all' | Dismissible chips below filter row, matching design. | ✓ |
| No chips — just highlight dropdowns | Simpler, dropdowns show selected state. | |
| You decide | Claude picks. | |

**User's choice:** Yes, with dismissible chips and "Clear all" link.

---

## Card Data Mapping

### Q4: What should WIP card footers show before session logging exists?

| Option | Description | Selected |
|--------|-------------|----------|
| Show what exists, skip what doesn't | Progress bar + supply summary. Skip session-dependent stats. | ✓ |
| Placeholder with 'Log sessions to see stats' | Subtle hint about coming features. | |
| Same as Unstarted layout until sessions exist | WIP uses kitting dots footer. | |

**User's choice:** Show what exists (progress bar, supply summary), skip session-dependent fields.

### Q5: What should Finished card footers show without session data?

| Option | Description | Selected |
|--------|-------------|----------|
| Completion dates + supply summary | Celebration border, 100% bar, dates, supply summary. | ✓ |
| Dates + stitch count + 'stats coming soon' | Explicit gap messaging. | |
| You decide | Claude picks. | |

**User's choice:** Celebration border + dates + supply summary, skip stats grid.

### Q6: Should Phase 6 compute kitting dot status from real data?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, compute from real data | Check junction tables for fabric/thread/beads/specialty status. | ✓ |
| Show dots but all as 'needed' | Always show empty circles. | |
| Skip kitting dots entirely | No dots on Unstarted cards. | |

**User's choice:** Compute from real junction table data.

### Q7: Should Phase 6 add a prepStep field and pipeline indicator?

| Option | Description | Selected |
|--------|-------------|----------|
| Skip prep pipeline for now | No new field, not in GLRY requirements. | ✓ |
| Add prepStep field and show it | New enum, new field, mini track. | |
| You decide | Claude picks. | |

**User's choice:** Skip — not in requirements, add later.

---

## Gallery Page Structure

### Q8: Should the gallery replace the /charts page entirely?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace /charts page entirely | Gallery IS the charts page. Three view modes. | ✓ |
| New /gallery route alongside /charts | Separate browse and manage pages. | |
| Replace but keep /charts as alias | Belt and suspenders. | |

**User's choice:** Replace entirely. Current table becomes the "table" view mode.

### Q9: How should edit/delete actions work on gallery cards?

| Option | Description | Selected |
|--------|-------------|----------|
| Click card → detail page, actions there | Cards are browse-only. Actions on detail page. | ✓ |
| Hover/kebab menu on each card | Small menu with Edit/Delete on hover. | |
| Actions only in table/list views | Gallery browse-only, table/list keep actions. | |

**User's choice:** Click card → detail page. No inline actions on cards.

### Q10: Page and nav naming

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 'Charts' everywhere | Consistent with domain model. | |
| Rename to 'Project Gallery' | Matches design mockup title. | |
| Heading says 'Gallery', nav says 'Charts' | Mixed approach. | |

**User's choice:** Other — Rename everything user-facing to "Projects" (not Charts or Gallery). Routes and code models stay unchanged.

### Q11: How deep should the Charts → Projects rename go?

| Option | Description | Selected |
|--------|-------------|----------|
| User-facing labels only | Nav, headings, buttons. Routes stay /charts, code stays Chart/Project. | ✓ |
| Labels + routes (/projects) | Full rename including URL paths. | |
| Defer the rename entirely | Keep Charts, add to backlog. | |

**User's choice:** User-facing labels only. Cosmetic rename.

---

## Sort Behaviour

### Q12: How should sorting work across view modes?

| Option | Description | Selected |
|--------|-------------|----------|
| Sort dropdown on all views | Dropdown on all views + column headers in table. Shared sort state. | ✓ |
| Dropdown for gallery/list, columns for table | Each view uses natural sort UI. State resets on switch. | |
| Sort state persists across view switches | Shared state with column highlight in table. | |

**User's choice:** Sort dropdown on all views, plus column headers in table.

### Q13: Should sort/filter state persist in URL params?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, all state in URL params | View mode, sort, direction, search, filters all in URL. | ✓ |
| View mode in URL, rest in client state | Only view mode persisted. | |
| You decide | Claude picks. | |

**User's choice:** All state in URL params. Refresh-safe, shareable.

### Q14: Default sort with no URL params?

| Option | Description | Selected |
|--------|-------------|----------|
| Date added, newest first | Most recently added appear first. | ✓ |
| Name, A-Z | Alphabetical. | |
| Status, then name | Groups by status. | |
| You decide | Claude picks. | |

**User's choice:** Date added, newest first.

---

## Claude's Discretion

- Gallery card grid responsive breakpoints
- List view column layout and responsive hiding
- Empty state design (scissors icon + message from design)
- Cover image placeholder gradients per status
- Kitting dot logic for determining "chart uses beads/specialty"
- URL param library choice (nuqs vs manual)
- Sort dropdown component implementation

## Deferred Ideas

- Full 12-dimension AdvancedFilterBar (BRWS-01, v1.2+)
- PrepStep field and pipeline indicator
- Session-dependent stats on WIP/Finished cards (Phase 9)
- Inline edit/delete on gallery cards
- Route rename /charts → /projects
