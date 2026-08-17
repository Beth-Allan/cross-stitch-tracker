# Phase 32: Series Management Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 32-series-management-pages
**Areas discussed:** Progress display, Series card content, Detail page chart list, Navigation & sidebar

---

## Progress Display

### Card progress bar style

| Option | Description | Selected |
|--------|-------------|----------|
| Single bar: finished/owned | One progress bar showing stitching completion. Matches DesignOS screenshot. | |
| Dual bars stacked | Two thin progress bars: owned/total + finished/owned. More info but complex. | |
| Single bar + text stat | One progress bar for finished/owned, plus text stat below for owned/total when set. | ✓ |

**User's choice:** Single bar + text stat
**Notes:** Keeps DesignOS visual clean while surfacing collection completeness data.

### Detail page header progress

| Option | Description | Selected |
|--------|-------------|----------|
| Same as card | Single progress bar + text stats, matching card treatment. | ✓ |
| Two explicit bars | Both owned/total and finished/owned as separate labeled bars. | |

**User's choice:** Same as card (Recommended)

### Open-ended series display

| Option | Description | Selected |
|--------|-------------|----------|
| "3 of 8 finished" only | Progress bar shows finished/owned, no owned/total line. | |
| "8 charts, 3 finished" | Matches D-03 from Phase 31. | |
| "3 finished · 8 charts" | Finished first, chart count second. | ✓ |

**User's choice:** "3 finished · 8 charts"
**Notes:** Finished count first because it's the primary metric users care about.

---

## Series Card Content

### Designer name on cards

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, below the name | Small text line under series name (e.g., "by Nora Corbett"). | ✓ |
| No, keep cards minimal | Match DesignOS exactly — designer on detail page only. | |
| Only if set | Show when designerId non-null, skip when null. | |

**User's choice:** Yes, below the name (Recommended)

### Completion sort dimension

| Option | Description | Selected |
|--------|-------------|----------|
| Finished percentage | Sort by finishedCount/ownedCount — stitching progress. | ✓ |
| Owned percentage | Sort by ownedCount/totalCount — collection completeness. | |
| Both as separate options | Split into Stitching and Collection sort options. | |

**User's choice:** Finished percentage (Recommended)

### Sort label for chart count

| Option | Description | Selected |
|--------|-------------|----------|
| Charts | App's term for what gets assigned to a series. | ✓ |
| Members | Matches DesignOS design exactly. | |
| Owned | Matches dual progress language. | |

**User's choice:** Charts

---

## Detail Page Chart List

### Inline editing scope

| Option | Description | Selected |
|--------|-------------|----------|
| Name + totalCount + notes | Match full form fields with inline editing. | ✓ |
| Name only | Only inline-rename per DesignOS. Other fields via modal. | |
| Full modal edit | Pencil icon opens form modal with all fields. | |

**User's choice:** Name + totalCount + notes (Recommended)

### Designer field editing

| Option | Description | Selected |
|--------|-------------|----------|
| Small edit link/icon | Designer as link + pencil icon → SearchableSelect. | ✓ |
| Part of inline editing | Inline dropdown alongside name and totalCount. | |
| Defer to form modal | Separate edit modal for designer only. | |

**User's choice:** Small edit link/icon (Recommended)

### Add Chart flow

| Option | Description | Selected |
|--------|-------------|----------|
| Defer to Phase 33 | Chart assignment via chart form in Phase 33. No add button here. | ✓ |
| Build here with SearchableSelect | Chart picker on detail page now. | |
| Simple hint | Show "Assign from chart form" text instead of button. | |

**User's choice:** Defer to Phase 33 (Recommended)

### Chart row clickability

| Option | Description | Selected |
|--------|-------------|----------|
| Clickable rows | Navigate to /charts/[id]. Matches designer detail pattern. | ✓ |
| Link icon only | Static row with explicit link icon. | |

**User's choice:** Clickable rows (Recommended)

---

## Navigation & Sidebar

### Sidebar placement

| Option | Description | Selected |
|--------|-------------|----------|
| Reference section | Alongside Designers, Genres, etc. | |
| Projects section | Alongside Dashboard, Pattern Dive, Shopping. | ✓ |
| Don't add yet | Wait for Phase 34. | |

**User's choice:** Projects section
**Notes:** User sees Series as a primary browsing entry point, not just reference data.

### URL structure

| Option | Description | Selected |
|--------|-------------|----------|
| /series and /series/[id] | Clean, matches /designers pattern. | ✓ |
| /collections and /collections/[id] | More general term. | |
| /charts/series and /charts/series/[id] | Nested under charts. | |

**User's choice:** /series and /series/[id] (Recommended)

### Loading skeleton

| Option | Description | Selected |
|--------|-------------|----------|
| Yes | Card skeletons matching grid layout. | ✓ |
| No | Default loading behavior. | |

**User's choice:** Yes (Recommended)

---

## Claude's Discretion

None — all areas were decided by the user.

## Deferred Ideas

None — discussion stayed within phase scope.
