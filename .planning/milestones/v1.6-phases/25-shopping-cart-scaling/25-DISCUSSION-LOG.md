# Phase 25: Shopping Cart Scaling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 25-shopping-cart-scaling
**Areas discussed:** Search & status grouping, Supply search in By Supply view, Selection behavior with filtering

---

## Search & Status Grouping

### Q1: Where should the project search input live?

| Option | Description | Selected |
|--------|-------------|----------|
| Above the view toggle | Single search input at the top, filters both By Project and By Supply views. Keeps it simple — one search box for the whole page. | ✓ |
| Inside each view tab | Separate search per view — project name search in By Project, supply search in By Supply. More targeted but duplicates the pattern. | |
| In the project accordion header | Search input embedded in the 'X of Y projects selected' header bar, only visible in By Project view. Supply search handled separately. | |

**User's choice:** Above the view toggle
**Notes:** None

### Q2: How should status groups be displayed in the project list?

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible sections | Each status gets a collapsible header (e.g., 'Kitting (12)' / 'Stitching (8)'). All expanded by default. Lets users focus on one status at a time. | ✓ |
| Visual separators only | Sticky section headers between status groups but no collapse. Lighter touch — shows all projects with clear boundaries. Simpler to implement. | |
| You decide | Claude picks the approach that fits best with the existing accordion pattern. | |

**User's choice:** Collapsible sections
**Notes:** None

### Q3: What order should status groups appear in?

| Option | Description | Selected |
|--------|-------------|----------|
| Workflow order | Kitting → Stitching → On Hold → Unstarted → other. Matches the natural shopping workflow — kitting projects need supplies most urgently. | ✓ |
| By project count | Largest group first. Since you have 75+ projects in kitting, that would float to the top naturally. | |
| You decide | Claude picks a sensible order based on the workflow context. | |

**User's choice:** Workflow order
**Notes:** None

### Q4: When searching, should status groups still be visible?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — filter within groups | Search narrows results but groups remain. Typing 'dragon' shows matching projects under their respective status sections. Empty groups auto-hide. | ✓ |
| No — flat filtered list | Search collapses grouping into a single flat list of matches. Simpler but loses the status context while searching. | |

**User's choice:** Yes — filter within groups
**Notes:** None

---

## Supply Search in By Supply View

### Q1: What kind of search/filter should the By Supply view have?

| Option | Description | Selected |
|--------|-------------|----------|
| Text search by code/name | Single text input that filters across all supply sections — type 'DMC 310' or 'black' to find matching supplies. Simple, covers the main use case of finding a specific color. | ✓ |
| Type filter tabs | Toggle tabs for Threads / Beads / Specialty / Fabric to show one type at a time instead of all sections. | |
| Both text search + type filter | Text search combined with type filter tabs. Most powerful but adds more UI complexity. | |

**User's choice:** Text search by code/name
**Notes:** None

### Q2: Should the supply search filter across all supply types or per-section?

| Option | Description | Selected |
|--------|-------------|----------|
| Across all types | One search filters everything — typing 'Mill Hill' would show matching beads even if you're scrolled past threads. Empty sections auto-hide. | ✓ |
| Per-section only | Each supply section (Threads, Beads, Specialty) gets its own search. More granular but adds 3 search inputs. | |

**User's choice:** Across all types
**Notes:** None

### Q3: Should supply search also match project names?

| Option | Description | Selected |
|--------|-------------|----------|
| Supply fields only | Match on brand name, color code, and color name. Keeps it focused — project filtering happens in the project search above. | ✓ |
| Include project names | Also match on the project name shown under each supply. Useful but overlaps with By Project view's purpose. | |

**User's choice:** Supply fields only
**Notes:** None

---

## Selection Behavior with Filtering

### Q1: When search is active, what should 'Select All' do?

| Option | Description | Selected |
|--------|-------------|----------|
| Select visible only | Only selects projects matching the current search. Typing 'dragon' then 'Select All' selects only dragon projects. | ✓ |
| Select all projects | Always selects every project regardless of search filter. Search is purely visual. | |

**User's choice:** Select visible only
**Notes:** None

### Q2: Should selected projects persist through search/filter changes?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — persist selection | Searching doesn't deselect anything. You can search 'dragon', select those, clear search, search 'fairy', select those too. | ✓ |
| No — clear hidden selections | Filtering hides AND deselects non-matching projects. Simpler but forces one search-select cycle at a time. | |

**User's choice:** Yes — persist selection
**Notes:** None

### Q3: How should selection counters work when filtered?

| Option | Description | Selected |
|--------|-------------|----------|
| Both counts | '3 of 12 visible selected (5 total selected)' — shows both filtered and total. Makes hidden selections transparent. | ✓ |
| Visible count only | '3 of 12 selected' — always shows count against visible projects. Simpler but hides hidden selections. | |
| You decide | Claude picks the clearest wording. | |

**User's choice:** Both counts
**Notes:** None

### Q4: Per-group 'Select all' buttons?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — per-group select | Each collapsible status group header has a 'Select all' link. Makes it easy to grab all kitting projects at once. | ✓ |
| No — global only | Only the top-level 'Select All' button. Users toggle individually or select everything. | |

**User's choice:** Yes — per-group select
**Notes:** None

---

## Claude's Discretion

- Search input styling and debounce timing
- Collapsible section animation approach
- Whether supply search shares the same input as project search or is separate
- Performance approach (virtualization vs. search-to-reduce)
- Supply search input positioning relative to section headers

## Deferred Ideas

None — discussion stayed within phase scope.
