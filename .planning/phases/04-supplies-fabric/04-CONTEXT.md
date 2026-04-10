# Phase 4: Supplies & Fabric - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can track supplies (threads, beads, specialty items) and fabric linked to projects, with a pre-seeded DMC thread catalog (~500 colors with hex swatches) and an auto-generated shopping list showing unfulfilled supplies grouped by project. Full brand management with CRUD. Kitting auto-calculation, kitting progress indicators, supply statistics, and advanced brand management are deferred.

</domain>

<decisions>
## Implementation Decisions

### Supply Catalog Organization
- **D-01:** Tabbed layout on /supplies page — three tabs: Threads, Beads, Specialty Items. Each tab has type-specific columns and its own grid/table view toggle.
- **D-02:** Both grid and table views available for each tab, toggled per tab. Grid shows color swatch tiles (hex color, code, name). Table shows sortable rows with color swatch column.
- **D-03:** View mode preference persisted in localStorage per tab (e.g., threads=grid, beads=table). Same pattern as sidebar collapse state from Phase 1.
- **D-04:** Filtering for threads: color family dropdown (11 families from design types) + free-text search by code or name. Beads and specialty use search only (smaller catalogs).

### DMC Seeding & Brand Management
- **D-05:** DMC thread catalog (~500 colors with hex values and color families) pre-seeded via Prisma seed script. JSON fixture file in project, `npx prisma db seed` loads idempotently.
- **D-06:** Full SupplyBrand entity with CRUD — dedicated management page at /supplies/brands. Sortable table with name, website, supply type columns. Modal forms for create/edit. Follows Phase 3 designer page pattern.
- **D-07:** DMC is the only pre-seeded brand+catalog. Beads and specialty items are fully user-managed — users create their own Mill Hill beads, Kreinik braids, etc. via catalog forms.

### Project-Supply Linking
- **D-08:** Supplies tab on the project detail page (ProjectSuppliesTab pattern from design). Shows linked threads, beads, specialty items with quantities in sections.
- **D-09:** Inline search-and-add flow: type in a search field → dropdown shows matching catalog items with color swatches → click to add with default quantity 1. Similar to inline designer creation pattern from Phase 2.
- **D-10:** Each linked supply tracks required (pattern calls for), acquired (user has), and needed (calculated: required - acquired) quantities. Fulfillment status auto-computed (isFulfilled when acquired >= required). Matches design's ProjectThread/ProjectBead/ProjectSpecialty types.
- **D-11:** Bulk supply editor deferred to post-MVP. MVP: add supplies one at a time via inline search + edit quantities in the supplies tab.

### Shopping List
- **D-12:** Auto-generated shopping list at /shopping page, grouped by project. Shows unfulfilled supplies per project with color swatches and needed quantities.
- **D-13:** Inline fulfillment from shopping list — "Mark acquired" action on each item updates the junction record's acquired quantity directly.
- **D-14:** Fully fulfilled projects disappear from the shopping list. List shows only projects with unfulfilled needs.
- **D-15:** Shopping list includes fabric needs alongside supply needs — if a project has stitch dimensions but no linked fabric, show "Needs fabric: Xct, W″×H″".

### Fabric Management
- **D-16:** Separate /fabric page with FabricCatalog table — sortable by count, type, brand, color. Sidebar nav item under a "Supplies" group or alongside it.
- **D-17:** One fabric record per project (1:1 relationship via linkedProjectId on Fabric). Fabric is a standalone entity you create and then assign to a project.
- **D-18:** Fabric form fields: name, brand (from FabricBrand), count, type, color family, color type, shortest edge inches, longest edge inches, needToBuy flag, linked project.
- **D-19:** Auto-calculated fabric size shown on project detail page when project has stitch dimensions and linked fabric. Formula: (stitches ÷ fabric count) + 6″ (3″ margin each side). Shows "Fits" / "Too small" with required dimensions.
- **D-20:** Margin is fixed at 3 inches per side (standard cross-stitch framing recommendation). Not user-configurable in MVP.

### Claude's Discretion
- Exact Prisma schema field names and types for supply/fabric models (guided by design types)
- Supply tab sub-sections layout (threads/beads/specialty grouping within the tab)
- Empty states for catalog pages, supplies tab, and shopping list
- Color swatch rendering approach (CSS background-color from hex values)
- Inline search dropdown component design and keyboard navigation
- Fabric form layout and field ordering
- Sort direction defaults for catalog tables
- Shopping list item card/row design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Supply design components (visual/behavioral reference — rewrite for Next.js)
- `product-plan/sections/supply-tracking-and-shopping/types.ts` — Thread, Bead, SpecialtyItem, ProjectThread, ProjectBead, ProjectSpecialty, SupplyBrand, CatalogFilterState, KittingSupplySummary type definitions
- `product-plan/sections/supply-tracking-and-shopping/components/SupplyCatalog.tsx` — Catalog page with tabs, grid/table views, filtering
- `product-plan/sections/supply-tracking-and-shopping/components/SupplyDetailModal.tsx` — Supply detail view
- `product-plan/sections/supply-tracking-and-shopping/components/ProjectSuppliesTab.tsx` — Project detail supplies tab with quantity tracking
- `product-plan/sections/supply-tracking-and-shopping/sample-data.json` — Sample supply data with DMC entries
- `product-plan/sections/supply-tracking-and-shopping/supply-catalog.png` — Catalog page screenshot
- `product-plan/sections/supply-tracking-and-shopping/project-supplies-tab.png` — Supplies tab screenshot
- `product-plan/sections/supply-tracking-and-shopping/project-supplies-detail.png` — Supply detail screenshot

### Fabric design components
- `product-plan/sections/fabric-series-and-reference-data/types.ts` — Fabric, FabricBrand, FabricSizeCalculation, FabricCount, FabricType, FabricColorFamily, FabricColorType type definitions
- `product-plan/sections/fabric-series-and-reference-data/components/FabricCatalog.tsx` — Fabric list page
- `product-plan/sections/fabric-series-and-reference-data/components/FabricDetail.tsx` — Fabric detail page
- `product-plan/sections/fabric-series-and-reference-data/components/FabricFormModal.tsx` — Fabric create/edit form

### Existing code (extend, don't duplicate)
- `prisma/schema.prisma` — Current schema with Chart, Project, Designer, Genre models (add supply/fabric models)
- `src/lib/actions/` — Existing server action pattern (chart-actions, designer-actions, genre-actions)
- `src/lib/validations/` — Existing Zod schema pattern (chart.ts, auth.ts, upload.ts)
- `src/components/features/charts/chart-detail.tsx` — Detail page pattern (add supplies tab here)
- `src/app/(dashboard)/supplies/` — Placeholder page (replace with supply catalog)
- `src/app/(dashboard)/shopping/` — Placeholder page (replace with shopping list)

### Design system and patterns
- `src/components/ui/` — shadcn/ui components (Dialog, Tabs, Button, Input, Card, etc.)
- `src/components/features/designers/` — Phase 3 management page pattern (sortable table, modal forms, detail pages)
- `.claude/rules/base-ui-patterns.md` — Button/Link patterns, semantic tokens, no nested forms
- `.claude/rules/form-patterns.md` — Zod validation, date handling, upload checks

### Project requirements
- `.planning/REQUIREMENTS.md` — SUPP-01 through SUPP-04, REF-01, REF-02 define this phase's acceptance criteria
- `CROSS_STITCH_TRACKER_PLAN.md` section 5 — Entity relationships, data model for supplies and fabric

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` — shadcn/ui dialog components for modal forms
- `StatusBadge`, `SizeBadge` — reusable in project references on shopping list
- `DetailRow`, `InfoCard` — layout components from chart detail page
- Designer/Genre page pattern — sortable table with search, modal CRUD forms, detail pages
- `InlineDesignerDialog` — reference pattern for inline search-and-add dropdown
- `requireAuth()` guard — apply to all new server actions

### Established Patterns
- Server Components by default, Client Components only for interactivity
- Server Actions for mutations with Zod validation at boundaries
- `requireAuth()` guard on all actions
- ID-based routes: `/charts/[id]`, `/designers/[id]`, `/genres/[id]`
- Modal forms for create/edit operations
- Sortable tables with clickable column headers
- Prisma queries with `_count` for computed stats

### Integration Points
- Chart detail page needs a new Supplies tab
- Sidebar navigation needs updated items (Supplies group with sub-items or separate entries for Supplies, Fabric, Shopping)
- Prisma schema needs new models: SupplyBrand, Thread, Bead, SpecialtyItem, ProjectThread, ProjectBead, ProjectSpecialty, FabricBrand, Fabric
- Seed script for DMC catalog data

</code_context>

<specifics>
## Specific Ideas

- Color swatches should render the actual hex color from the DMC catalog — not just a label. The grid view is visually browsable like a paint swatch wall.
- Inline search dropdown for adding supplies should show the color swatch + code + name in each result — stitchers identify colors by sight as much as by number.
- Shopping list grouped by project mirrors how stitchers actually shop: "I need these supplies for Project X."
- Fabric size calculation with 3″ margins is the standard recommendation across cross-stitch communities.
- The /supplies/brands page follows the exact same pattern as /designers — sortable table, modal forms, consistent management UX.

</specifics>

<deferred>
## Deferred Ideas

- Bulk supply editor (BulkSupplyEditor from design) — paste a list of DMC numbers or multi-select to add many supplies at once. Deferred to post-MVP.
- Kitting auto-calculation (SUPP-05) — 8-condition kitting status. Explicitly deferred in roadmap.
- Kitting progress indicators — percentage bars, visual kitting dashboard
- Supply statistics — thread usage across projects, most common colors, etc.
- Advanced brand management — brand logos, cataloging, pre-seeded Mill Hill/Kreinik/Anchor catalogs
- Pre-seeded bead catalogs (Mill Hill) — data availability uncertain, user-managed for now
- User-configurable fabric margin — fixed at 3″ per side for MVP

</deferred>

---

*Phase: 04-supplies-fabric*
*Context gathered: 2026-04-10*
