# Phase 34: Browse & Pattern Dive Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 34-browse-pattern-dive-integration
**Areas discussed:** Tab placement & icon, Series card style, Browse series filter

---

## Tab Placement & Icon

### Tab Position

| Option | Description | Selected |
|--------|-------------|----------|
| After Browse (2nd) | Browse → Series → What's Next → Fabric → Storage. Puts collection-browsing tabs together. | |
| After What's Next (3rd) | Browse → What's Next → Series → Fabric → Storage. Groups browsing/planning tabs, then reference tabs. | ✓ |
| Last (5th) | Browse → What's Next → Fabric → Storage → Series. Appends without disturbing existing order. | |

**User's choice:** After What's Next (3rd)

### Tab Icon

| Option | Description | Selected |
|--------|-------------|----------|
| Library | Matches the DesignOS empty state icon for series. Represents a collection/catalog. Distinctive from other tab icons. | ✓ |
| BookOpen | Evokes a pattern book — series are groups of charts. Slightly more craft-specific than Library. | |
| Layers3 | Stacked layers suggesting grouped items. Note: Layers is already used by Fabric tab. | |
| You decide | Let Claude pick the best option. | |

**User's choice:** Library

### Tab Label

| Option | Description | Selected |
|--------|-------------|----------|
| Series | Matches the sidebar nav item, the /series page title, and all prior phase terminology. | ✓ |
| Collections | More user-friendly browsing term, but introduces naming inconsistency. | |

**User's choice:** Series

---

## Series Card Style

### Card Reuse

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse /series cards | Same SeriesCard component from Phase 32 — progress bar, designer name, stats row. Consistent look. | ✓ |
| Simplified cards | Lighter cards — just name + progress bar + count. No designer name, no percentage. | |
| You decide | Let Claude pick based on DesignOS spec and existing tab density. | |

**User's choice:** Reuse /series cards

### Sort Pills

| Option | Description | Selected |
|--------|-------------|----------|
| Include sort pills | Same sort bar pattern from /series page (Phase 32 D-05/D-06). | ✓ |
| Fixed order (name ascending) | Simpler. Other Pattern Dive tabs don't have sort controls. | |
| You decide | Let Claude choose based on what other Pattern Dive tabs do. | |

**User's choice:** Include sort pills

### Create Button

| Option | Description | Selected |
|--------|-------------|----------|
| No create button | Pattern Dive is for browsing, not management. Empty state can link to /series. | ✓ |
| Include create button | Matches DesignOS SeriesList "Add Series" button. | |

**User's choice:** No create button

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Icon + message + link | Library icon, "No series yet", and a text link to the Series page. | ✓ |
| Icon + message only | Library icon and "No series yet". Simple, no navigation guidance. | |
| You decide | Let Claude pick based on existing Pattern Dive tab patterns. | |

**User's choice:** Icon + message + link

---

## Browse Series Filter

### Filter Type

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-select dropdown | Same MultiSelectDropdown pattern as Status and Size. Select one or more series. | ✓ |
| Single-select dropdown | Pick one series at a time. Different pattern from Status/Size. | |
| You decide | Let Claude choose based on consistency. | |

**User's choice:** Multi-select dropdown

### Unassigned Option

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include "Unassigned" | Lets users find charts with no series. Useful for organizing with 500+ charts. | ✓ |
| No, series-only | Filter only shows named series. Selecting none shows all charts. | |

**User's choice:** Yes, include "Unassigned"

### Filter Position

| Option | Description | Selected |
|--------|-------------|----------|
| After Size (last) | Search → Status → Size → Series. Appends without changing existing order. | ✓ |
| Before Status (first dropdown) | Search → Series → Status → Size. Broadest organizational filter first. | |
| You decide | Let Claude pick based on typical filter usage patterns. | |

**User's choice:** After Size (last)

### Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Add to chart query | Include series in getChartsForGallery(). Single query, no extra fetch. | ✓ |
| Fetch series separately | Call getSeriesWithStats() in parallel. Two data sources. | |

**User's choice:** Add to chart query

---

## Claude's Discretion

None — user made all decisions directly.

## Deferred Ideas

None — discussion stayed within phase scope.
