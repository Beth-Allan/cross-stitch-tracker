# Phase 4: Supplies & Fabric - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 04-Supplies & Fabric
**Areas discussed:** Supply catalog & DMC seeding, Project-supply linking flow, Shopping list & fulfillment, Fabric management

---

## Supply Catalog & DMC Seeding

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed by type | Three tabs: Threads, Beads, Specialty Items. Type-specific columns per tab. | ✓ |
| Single unified list | One searchable list with type filter dropdown. | |
| Separate pages per type | /supplies/threads, /supplies/beads, /supplies/specialty. | |

**User's choice:** Tabbed by type
**Notes:** Matches design's SupplyCatalog component. Natural separation since threads (500+ DMC) vastly outnumber beads and specialty items.

| Option | Description | Selected |
|--------|-------------|----------|
| Color swatch grid | Grid of color tiles showing hex swatch, DMC number, color name. | |
| Table with swatch column | Standard sortable table with small color circle in each row. | |
| Both grid and table views | Toggle between grid and table views per tab. | ✓ |

**User's choice:** Both grid and table views
**Notes:** Design supports CatalogViewMode: 'grid' | 'table'. More flexible for different browsing needs.

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-seed DMC only, manual add others | DMC pre-seeded, brand is just a text field. Lean. | |
| Brand catalog with pre-seeded DMC + Mill Hill | Pre-seed DMC threads and Mill Hill beads. | |
| Brand entity with CRUD | Full SupplyBrand table with its own management page. | ✓ |

**User's choice:** Brand entity with CRUD
**Notes:** User chose the more comprehensive option. Full brand management from the start, following the designer page pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Prisma seed script | JSON fixture + npx prisma db seed. Standard, idempotent. | ✓ |
| Database migration | SQL INSERT in migration file. | |
| Runtime seed on first request | Check and seed on app start. | |

**User's choice:** Prisma seed script

| Option | Description | Selected |
|--------|-------------|----------|
| Color family + search | Filter by 11 color families + free-text search. | ✓ |
| Color family + brand + search | Add brand filter alongside. | |
| Full filter bar | Reusable filter bar with dismissible chips. | |

**User's choice:** Color family + search

| Option | Description | Selected |
|--------|-------------|----------|
| Simple management page | Sortable table at /supplies/brands with modal forms. | ✓ |
| Section within supplies page | Manage Brands tab on /supplies. | |
| Settings-style page | Under /settings/brands. | |

**User's choice:** Simple management page
**Notes:** Follows Phase 3 designer page pattern for consistency.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, fully user-managed | No pre-seeded beads/specialty. Users add their own. | ✓ |
| Pre-seed Mill Hill beads too | Source and pre-seed Mill Hill catalog. | |
| You decide | Claude picks. | |

**User's choice:** Yes, fully user-managed

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage per tab | Remember grid vs table per tab. | ✓ |
| Single preference for all tabs | One toggle for all tabs. | |
| You decide | Claude picks. | |

**User's choice:** localStorage per tab

---

## Project-Supply Linking Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Tab on project detail | Supplies tab on project detail page. Contextual to project. | ✓ |
| Both directions | Tab on project detail AND section on supply detail page. | |
| Dedicated linking page | Standalone /projects/[id]/supplies page. | |

**User's choice:** Tab on project detail

| Option | Description | Selected |
|--------|-------------|----------|
| Inline search with dropdown | Type → dropdown with swatches → click to add. | ✓ |
| Modal catalog picker | Full catalog modal for multi-select. | |
| You decide | Claude picks. | |

**User's choice:** Inline search with dropdown

| Option | Description | Selected |
|--------|-------------|----------|
| Defer bulk editor | MVP: add one at a time. Bulk editor post-MVP. | ✓ |
| Include bulk editor | Full BulkSupplyEditor from design. | |
| Simplified bulk add | Multi-select modal, add with quantity 1. | |

**User's choice:** Defer bulk editor

| Option | Description | Selected |
|--------|-------------|----------|
| Required + acquired fields | Per-supply required, acquired, needed (calculated). | ✓ |
| Just required, checkbox for acquired | Required qty + checkbox. | |
| You decide | Claude picks. | |

**User's choice:** Required + acquired fields

---

## Shopping List & Fulfillment

| Option | Description | Selected |
|--------|-------------|----------|
| By project | Unfulfilled supplies grouped under project names. | ✓ |
| By supply type | Grouped by Threads/Beads/Specialty across projects. | |
| Both views with toggle | Toggle between grouping modes. | |

**User's choice:** By project
**Notes:** Matches SUPP-04 requirement and how stitchers actually shop.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, inline fulfillment | Mark acquired action updates junction record directly. | ✓ |
| Link to project detail | Navigate to project to update quantities. | |
| You decide | Claude picks. | |

**User's choice:** Yes, inline fulfillment

| Option | Description | Selected |
|--------|-------------|----------|
| Project disappears from list | Fulfilled projects don't appear. | ✓ |
| Show with checkmark | Fulfilled projects remain with green checkmark. | |
| You decide | Claude picks. | |

**User's choice:** Project disappears from list

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include fabric | Show fabric needs in shopping list. | ✓ |
| Supplies only | Shopping list only shows thread/bead/specialty. | |
| You decide | Claude picks. | |

**User's choice:** Yes, include fabric

---

## Fabric Management

| Option | Description | Selected |
|--------|-------------|----------|
| One fabric per project | 1:1 via linkedProjectId. Simple model. | ✓ |
| Fabric catalog, pick per project | Reusable catalog, multiple projects share fabric. | |
| You decide | Claude picks. | |

**User's choice:** One fabric per project

| Option | Description | Selected |
|--------|-------------|----------|
| Separate /fabric page | Dedicated page with FabricCatalog table. | ✓ |
| Tab on /supplies page | Fourth tab on supplies page. | |
| You decide | Claude picks. | |

**User's choice:** Separate /fabric page

| Option | Description | Selected |
|--------|-------------|----------|
| Show on project detail | Auto-calc on project page when fabric linked. | ✓ |
| Show on fabric form | Show calc inline in fabric form. | |
| Both places | Show on project detail and fabric form. | |

**User's choice:** Show on project detail

| Option | Description | Selected |
|--------|-------------|----------|
| 3 inches each side | Standard 3″ framing margin, 6″ added total. | ✓ |
| User-configurable margin | Default 3″, adjustable in settings. | |
| You decide | Claude picks. | |

**User's choice:** 3 inches each side

---

## Claude's Discretion

- Exact Prisma schema field names and types for supply/fabric models
- Supply tab sub-sections layout
- Empty states for all new pages
- Color swatch rendering approach
- Inline search dropdown component design
- Fabric form layout and field ordering
- Sort direction defaults
- Shopping list item card/row design

## Deferred Ideas

- Bulk supply editor — post-MVP
- Kitting auto-calculation (8 conditions) — explicitly deferred in roadmap
- Supply statistics — future phase
- Pre-seeded bead catalogs — data availability uncertain
- User-configurable fabric margin — fixed at 3″ for MVP
