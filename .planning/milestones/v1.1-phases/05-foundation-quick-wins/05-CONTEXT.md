# Phase 5: Foundation & Quick Wins - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage storage locations and stitching apps as proper database entities with dedicated management pages, link unassigned fabrics to projects from the chart form, and benefit from a complete DMC thread catalog and two UX bug fixes (cover image aspect ratio, thread picker scroll). This phase converts hardcoded string arrays into full CRUD entities and wires the existing fabric model into the chart form.

</domain>

<decisions>
## Implementation Decisions

### Storage & App Management Pages
- **D-01:** Dedicated sidebar nav items for both Storage Locations (MapPin icon, already in design) and Stitching Apps (Tablet icon). Placed between Fabric and Sessions in the nav order.
- **D-02:** Stitching Apps mirrors the StorageLocationList/StorageLocationDetail design pattern -- same list layout with name, project count, inline rename, click-through detail page showing assigned projects. No separate design exists; follow storage design exactly.
- **D-03:** Both get dedicated routes at `/storage` and `/apps` with their own pages and detail views.

### Cover Image Display
- **D-04:** Switch from `object-cover` to `object-contain` with `bg-muted` background for letterbox areas. Full image always visible, no cropping.
- **D-05:** Increase container height from `h-32` (128px) to `h-48` (192px). Applies to chart detail page cover display and upload preview in the chart form.

### Fabric Selector
- **D-06:** Reuse existing `SearchableSelect` component for fabric selection in the chart form's Project Setup section. Each option shows fabric name, count, type, and brand. Filter to only unassigned fabrics (`linkedProjectId IS NULL`), plus the currently linked fabric if editing.
- **D-07:** When no unassigned fabrics exist, show "No unassigned fabrics" message with a link to the /fabric page. No inline fabric creation from the chart form.

### Data Model
- **D-08:** New `StorageLocation` and `StitchingApp` Prisma models with: `id`, `name` (required), `description` (optional), `userId`, `createdAt`, `updatedAt`. One-to-many relation to Project.
- **D-09:** Delete behavior: set FK to null on associated projects (unlink, not cascade delete) with a confirmation dialog showing the count of affected projects.
- **D-10:** Start fresh -- migration drops old text fields (`projectBin`, `ipadApp`) from Project and adds FK fields (`storageLocationId`, `stitchingAppId`). No auto-migration of existing text values.

### Claude's Discretion
- DMC catalog completion approach (sourcing, validating, and formatting missing entries 1-149)
- Thread colour picker `scrollIntoView` implementation (which element to scroll, timing, smooth vs instant)
- Exact Prisma schema naming conventions (relation names, index names)
- Detail page layout for Stitching Apps (mirroring StorageLocationDetail from design)
- Empty states for all new management pages
- SearchableSelect option rendering for fabric display (text formatting, layout of name/count/type/brand)
- Whether to update `SearchableSelect` in project-setup-section or create a new fabric-specific picker component

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Storage & App design reference (visual/behavioral -- rewrite for Next.js)
- `product-plan/sections/fabric-series-and-reference-data/components/StorageLocationList.tsx` -- List page with inline add, inline rename, delete confirmation, project count display
- `product-plan/sections/fabric-series-and-reference-data/components/StorageLocationDetail.tsx` -- Detail page with back nav, inline name edit, assigned project list with status badges
- `product-plan/sections/fabric-series-and-reference-data/storage.png` -- Storage page screenshot showing nav placement and list layout
- `product-plan/sections/fabric-series-and-reference-data/types.ts` -- StorageLocation, StorageLocationProject, StorageLocationDetail type definitions

### Existing code to extend
- `src/components/features/charts/sections/project-setup-section.tsx` -- Current hardcoded arrays (lines 11-12), disabled fabric placeholder (lines 67-75), SearchableSelect integration
- `src/components/features/charts/use-chart-form.ts` -- Form state for projectBin/ipadApp fields
- `src/components/features/charts/form-primitives/cover-image-upload.tsx` -- Current h-32 + object-cover (line 196, 201)
- `src/components/features/supplies/search-to-add.tsx` -- Thread picker lacking scrollIntoView (line 218)
- `src/components/shell/nav-items.ts` -- Current sidebar nav items (add Storage + Apps entries)
- `prisma/schema.prisma` -- Project model with `projectBin: String?` and `ipadApp: String?` (lines 79-80)
- `prisma/fixtures/dmc-threads.json` -- Current DMC seed data (starts at 150, missing 1-149)
- `prisma/seed.ts` -- Idempotent upsert pattern for DMC seeding

### Fabric integration (model ready, just needs chart form wiring)
- `src/lib/actions/fabric-actions.ts` -- Existing fabric CRUD (createFabric, updateFabric handle linkedProjectId)
- `src/components/features/fabric/fabric-form-modal.tsx` -- Existing fabric form with project selector

### Established patterns to follow
- `src/components/features/designers/` -- Phase 3 management page pattern (sortable table/list, modal/inline forms, detail pages)
- `src/lib/actions/designer-actions.ts` -- Server action pattern with requireAuth + Zod validation
- `.claude/rules/base-ui-patterns.md` -- Button/Link, semantic tokens, no nested forms
- `.claude/rules/form-patterns.md` -- Zod trim+min, date validation, upload checks
- `.claude/rules/server-client-split.md` -- Server Components default, client only for interactivity

### Project requirements
- `.planning/REQUIREMENTS.md` -- STOR-01 through STOR-04, PROJ-01, PROJ-02, SUPP-02, SUPP-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SearchableSelect` component (form-primitives/) -- used for project bin and iPad app pickers, reusable for fabric selector with richer option rendering
- `StorageLocationList` and `StorageLocationDetail` design components -- direct visual reference for implementation
- Designer/Genre page pattern -- sortable list with CRUD, detail pages, established in Phase 3
- `InlineDesignerDialog` -- reference for inline entity creation from form context
- `StatusBadge`, `SizeBadge` -- reusable on storage/app detail pages for project listings
- `requireAuth()` guard -- apply to all new server actions

### Established Patterns
- Server Components by default, Client Components only for interactivity
- Server Actions for mutations with Zod validation at boundaries
- `requireAuth()` guard on all actions
- ID-based routes: `/charts/[id]`, `/designers/[id]`, `/genres/[id]` -- extend to `/storage/[id]`, `/apps/[id]`
- Inline editing pattern from design (InlineNameEdit component in StorageLocationList)
- `SearchableSelect` with `onAddNew` callback for inline entity creation from dropdowns
- DMC seed via JSON fixture + idempotent upsert in seed.ts

### Integration Points
- Sidebar nav needs 2 new items: Storage (MapPin) and Apps (Tablet) between Fabric and Sessions
- Project model needs 2 new FK fields replacing 2 text fields (migration)
- Chart form's project-setup-section needs fabric SearchableSelect wired to real data
- Cover image container height + object-fit change in cover-image-upload.tsx
- Thread picker needs scrollIntoView call in search-to-add.tsx handleSelect
- DMC fixture file needs ~30 new entries prepended (1-149 range gaps + Blanc)

</code_context>

<specifics>
## Specific Ideas

- Storage and App management pages should feel identical to the existing Designer/Genre pages -- same visual weight, same interaction patterns. Consistency matters more than novelty here.
- The design's inline rename (click pencil, type in place, Enter to save) is a nice touch -- keep it rather than opening a modal for rename.
- Cover image letterboxing with `bg-muted` should feel clean, not like a broken image. The muted background blends with the card surface.
- Fabric selector should show enough info that you can distinguish "14ct White Aida" from "14ct Antique White Aida" at a glance -- count + type + brand + colour.

</specifics>

<deferred>
## Deferred Ideas

- Sort order for storage locations and stitching apps -- could add drag-and-drop reordering later
- Inline fabric creation from chart form -- decided against for now, link to /fabric instead
- Storage location icons or color coding -- could differentiate locations visually in a future phase
- Stitching app platform info (iOS, Android, macOS) -- description field covers this for now

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 05-foundation-quick-wins*
*Context gathered: 2026-04-11*
