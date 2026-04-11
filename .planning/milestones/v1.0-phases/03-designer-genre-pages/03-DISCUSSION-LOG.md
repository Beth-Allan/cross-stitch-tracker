# Phase 3: Designer & Genre Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 03-designer-genre-pages
**Areas discussed:** Genre page approach, Detail view pattern, Navigation & routing, Delete behavior, Chart list on detail pages, Designer schema fields

---

## Genre Page Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror designer page | Full sortable table with columns: name, chart count. Search bar, add/edit/delete. Consistent with designer page. | ✓ |
| Simple tag manager | Compact list of genre names with inline edit/delete. Lighter weight, different pattern. | |

**User's choice:** Mirror designer page
**Notes:** User wants consistency between designer and genre management pages.

### Follow-up: Genre sorting

| Option | Description | Selected |
|--------|-------------|----------|
| Sort by name + chart count | Clickable column headers like the designer page | ✓ |
| Alphabetical only | Always sorted A-Z | |

**User's choice:** Sort by name + chart count

### Follow-up: Genre search

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include search | Consistent with designer page | ✓ |
| No search needed | List is short enough to scan | |

**User's choice:** Yes, include search

### Follow-up: Genre fields

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Keep genres simple as tags | ✓ |
| Name + optional description | Short description to distinguish similar genres | |
| Name + color tag | Visual color indicator like GitHub labels | |

**User's choice:** Name only

### Follow-up: Genre create/edit pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Modal form | Click add/edit, modal pops up. Consistent with inline designer dialog pattern. | ✓ |
| Inline in table | Empty row appears, type name, press Enter | |

**User's choice:** Modal form (for both create and edit)

---

## Detail View Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Modal (matches design) | Overlay showing designer info + charts. Quick open/close. | |
| Full page | Navigate to /designers/[id]. Bookmarkable, more room. | ✓ |

**User's choice:** Full page
**Notes:** Deviates from DesignOS DesignerDetailModal design. User prefers bookmarkable URLs and more room.

### Follow-up: Genre detail consistency

| Option | Description | Selected |
|--------|-------------|----------|
| Full page | Consistent with designer detail | ✓ |
| Modal | Simpler genre info might fit a modal | |

**User's choice:** Full page (consistent with designers)

### Follow-up: Chart links

| Option | Description | Selected |
|--------|-------------|----------|
| Link to chart detail | Chart names clickable, navigate to /charts/[id] | ✓ |
| View-only list | Informational only, no navigation | |

**User's choice:** Link to chart detail

### Follow-up: Edit flow

| Option | Description | Selected |
|--------|-------------|----------|
| Edit modal from detail page | Click Edit, modal opens pre-filled | ✓ |
| Inline editing on page | Fields become editable inputs | |

**User's choice:** Edit modal from detail page

### Follow-up: Stats shown

| Option | Description | Selected |
|--------|-------------|----------|
| All stats | Chart count, projects started, projects finished, top genre | ✓ |
| Chart count only | Simple count only | |

**User's choice:** All stats

---

## Navigation & Routing

| Option | Description | Selected |
|--------|-------------|----------|
| Own sidebar items | Add Designers and Genres as top-level items below Charts | ✓ |
| Grouped under 'Library' | Collapsible section containing Charts, Designers, Genres | |
| Accessible from Charts only | No sidebar items, accessed via Charts page | |

**User's choice:** Own sidebar items

### Follow-up: URL structure

| Option | Description | Selected |
|--------|-------------|----------|
| ID-based | /designers/clx1abc, /genres/clx2def | ✓ |
| Slug-based | /designers/mirabilia-designs, /genres/fantasy | |

**User's choice:** ID-based (consistent with /charts/[id])

---

## Delete Behavior

### Designer delete

| Option | Description | Selected |
|--------|-------------|----------|
| Unlink charts | Charts keep existing, designer field set to null | ✓ |
| Block if charts exist | Refuse until manually reassigned | |
| Confirm with count + type name | Warning + type confirmation | |

**User's choice:** Unlink charts

### Genre delete

| Option | Description | Selected |
|--------|-------------|----------|
| Remove tag from charts | Genre tag removed, charts keep other genres | ✓ |
| Block if charts tagged | Refuse until manually untagged | |

**User's choice:** Remove tag from charts

### Delete confirmation UX

| Option | Description | Selected |
|--------|-------------|----------|
| Warning with count | Show affected chart count in confirmation | ✓ |
| Simple confirmation | Just "Are you sure?" | |

**User's choice:** Warning with count

---

## Chart List on Detail Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Rich rows (matches design) | Cover thumbnail, name, status badge, stitch count, size category | ✓ |
| Simple rows | Just chart name and status | |

**User's choice:** Rich rows

---

## Designer Schema Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Name + website is enough | Keep model lean, stats computed at query time | |
| Add abbreviation | Short code (e.g., 'MIR') for compact displays | |
| Add notes field | Free-text for personal reference | ✓ |

**User's choice:** Add notes field
**Notes:** Personal reference for info like "Only sells through distributors", "Retired — OOP charts"

### Follow-up: Genre notes field

| Option | Description | Selected |
|--------|-------------|----------|
| Add notes field too | Consistent with designer model | |
| Name only | Genres are simple tags, notes likely unused | ✓ |

**User's choice:** Name only

---

## Claude's Discretion

- Empty state design
- Inline designer dialog sync with management page
- Table column widths and responsive breakpoints
- Loading/error states
- Cover thumbnail sizing
- Sort direction defaults
