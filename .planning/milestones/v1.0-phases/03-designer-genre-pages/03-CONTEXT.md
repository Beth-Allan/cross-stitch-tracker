# Phase 3: Designer & Genre Pages - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage designers and genres with dedicated pages — list, create, edit, delete — not just inline creation from the chart form. Designer detail pages show associated charts with rich metadata. Genre pages mirror the designer page pattern for consistency.

</domain>

<decisions>
## Implementation Decisions

### Genre Page Approach
- **D-01:** Genre management page mirrors the designer page layout — sortable table with columns for name and chart count, search bar, modal forms for create/edit
- **D-02:** Genre table supports sorting by name and chart count (clickable column headers), consistent with the designer page
- **D-03:** Genre search bar included for consistency with designer page, even though the list is smaller
- **D-04:** Genre model stays as name-only (no description or color field) — genres are simple tags
- **D-05:** Genre creation and editing both use modal forms, consistent with the inline designer dialog pattern already built in Phase 2

### Detail View Pattern
- **D-06:** Designer and genre detail views are full pages (not modals), at `/designers/[id]` and `/genres/[id]` — bookmarkable URLs and more room for content. This deviates from the DesignOS DesignerDetailModal design.
- **D-07:** Detail pages show computed stats: chart count, projects started, projects finished, top genre (for designers). Genre detail shows chart count.
- **D-08:** Edit is triggered via an edit button on the detail page, opening a modal form with pre-filled fields
- **D-09:** Chart names in the detail page table link to the chart detail page (`/charts/[id]`)

### Chart List on Detail Pages
- **D-10:** Rich chart rows on detail pages — cover thumbnail, chart name, status badge, stitch count, and size category. Matches the DesignerChart type from the design reference.

### Navigation & Routing
- **D-11:** Designers and Genres get their own top-level sidebar items, positioned below Charts
- **D-12:** ID-based URLs: `/designers/[id]`, `/genres/[id]` — consistent with `/charts/[id]` pattern, no slug generation needed

### Delete Behavior
- **D-13:** Deleting a designer unlinks associated charts (sets designerId to null) — no data loss, charts keep existing
- **D-14:** Deleting a genre removes the tag from associated charts (many-to-many disconnect) — charts keep other genre tags
- **D-15:** Delete confirmation dialogs show a warning with the affected chart count (e.g., "15 charts will be unlinked")

### Designer Schema Fields
- **D-16:** Add a `notes` field (optional free-text) to the Designer model for personal reference (e.g., "Only sells through distributors", "Retired — OOP charts")
- **D-17:** Genre model stays as-is (name only, no notes field)

### Claude's Discretion
- Empty state design for no designers/genres yet
- Inline designer dialog sync with management page form/validation
- Exact table column widths and responsive breakpoints
- Loading/error states for detail pages
- Cover thumbnail sizing in chart list rows
- Sort direction defaults (A-Z for names, high-to-low for counts)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design components (visual/behavioral reference — rewrite for Next.js)
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerPage.tsx` — Designer list page with sortable table, search, filters
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerDetailModal.tsx` — Designer detail layout (adapt to full page instead of modal)
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerFormModal.tsx` — Designer add/edit form modal
- `product-plan/sections/fabric-series-and-reference-data/designer.png` — Designer page screenshot
- `product-plan/sections/fabric-series-and-reference-data/types.ts` — Designer, DesignerChart, DesignerPageProps, DesignerDetailModalProps type definitions

### Existing code (extend, don't duplicate)
- `prisma/schema.prisma` — Designer and Genre models (add notes field to Designer)
- `src/lib/actions/designer-actions.ts` — Existing createDesigner and getDesigners actions (needs edit, delete, getById)
- `src/lib/actions/genre-actions.ts` — Existing createGenre and getGenres actions (needs edit, delete, getById)
- `src/lib/validations/chart.ts` — Existing designerSchema and genreSchema (extend for edit)
- `src/components/features/charts/inline-designer-dialog.tsx` — Existing inline designer creation dialog (reference for form pattern)

### Design system and patterns
- `src/components/ui/` — shadcn/ui components (Dialog, Button, Input, Card, etc.)
- `src/components/features/charts/chart-detail.tsx` — Chart detail page pattern (reference for detail page layout)
- `src/components/features/charts/status-badge.tsx` — Status badge component (reuse in chart list rows)
- `src/components/features/charts/size-badge.tsx` — Size category badge (reuse in chart list rows)
- `.claude/rules/base-ui-patterns.md` — Button/Link patterns, semantic tokens, no nested forms

### Project requirements
- `.planning/REQUIREMENTS.md` — PROJ-06 (designer CRUD), PROJ-07 (genre management)
- `CROSS_STITCH_TRACKER_PLAN.md` section 5 — Entity relationships (Chart->Designer, Chart<->Genre)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `InlineDesignerDialog` — modal form for creating designers from chart form (reuse pattern for management page modals)
- `StatusBadge`, `SizeBadge` — reuse in chart list rows on detail pages
- `DetailRow`, `InfoCard` — layout components from chart detail page
- `FormField` — form primitive from chart form components
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` — shadcn/ui dialog components already in use

### Established Patterns
- Server Components by default, Client Components only for interactivity
- Server Actions for mutations with Zod validation at boundaries
- `requireAuth()` guard on all actions
- ID-based routes: `/charts/[id]` pattern already established
- Prisma queries with computed counts via `_count` or aggregations

### Integration Points
- Sidebar navigation (`src/components/features/shell/`) — add Designers and Genres items
- Dashboard route group `src/app/(dashboard)/` — new `/designers` and `/genres` route folders
- Existing Designer/Genre Prisma models — extend with notes field, add new queries
- Existing server actions — extend with update, delete, getById operations

</code_context>

<specifics>
## Specific Ideas

- Design shows sortable column headers with chevron indicators — follow the DesignerPage.tsx SortableHeader pattern
- Delete confirmation should explicitly say "Charts will NOT be deleted" to reduce anxiety
- Designer notes field is for personal reference (distributor info, OOP status, etc.)
- Rich chart rows with cover thumbnails give a visual preview without leaving the detail page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-designer-genre-pages*
*Context gathered: 2026-04-07*
