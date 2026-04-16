# Phase 7: Project Detail Experience - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesigned project detail page with a hero cover image, tabbed layout (Overview + Supplies), inline skein calculator, and streamlined supply management. Users can enter per-colour stitch counts, see auto-calculated skein estimates, manage supplies with insertion-order display, and quick-add items not in the catalog. The page should feel warm, data-dense, and delightful — "pulling a beloved pattern out of your stash."

This phase also folds in backlog items 999.0.2 (skein calculator), 999.0.10 (quick-add missing supplies), 999.0.13 (thread picker scroll), 999.0.15 (SearchToAdd panel positioning), and 999.0.16 (SearchToAdd highlight conflict).

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Visual Design
- **D-01:** Full-width hero banner with cover image at page top. Must handle square and vertical patterns gracefully using `object-contain` with a tinted/blurred background fill — never crop the image.
- **D-02:** When no cover image exists, skip the banner entirely. Show a compact, metadata-forward hero layout. Don't fake visual weight with gradients or placeholders.
- **D-03:** Tabbed layout below the hero — **Overview** tab (progress, pattern details, dates, project setup) and **Supplies** tab. Active tab state persists in URL params.
- **D-04:** Hero shows: chart name, designer name, interactive status badge, stitch count, size badge, and progress percentage (if WIP). Data-dense but clean.
- **D-05:** Visual direction: warm + tactile + data-dense with strong typography. Whimsical touches (celebration borders, status-specific accents) but information-dense. Notion's information density married to a craft journal's personality.
- **D-06:** Overview tab is status-aware — sections reorder and emphasise based on project status. WIP: progress first. Unstarted: kitting readiness checklist. Finished: celebration/completion stats.
- **D-07:** Kebab menu (three-dot) in hero for overflow actions (delete, future features). Edit stays visible as a primary action — placement at Claude's discretion (e.g., floating action, action bar, visible button alongside kebab).
- **D-08:** Status control integrated into the hero — clickable status badge with clear visual affordance (chevron, dropdown indicator, or edit icon). Must be discoverable, not a hidden easter egg.

### Supply Row & Calculator UX
- **D-09:** Default to stitch count entry when adding/editing a supply. Stitch count field is prominent; auto-calculates skeins. If user doesn't have stitch counts, they clear the field and enter skeins directly. One row layout handles all three entry paths (stitch count → auto-calc, direct skeins, manual guess).
- **D-10:** Auto-calculated skeins fill the 'Need' field and are immediately editable as an override. A small indicator shows the value was auto-calculated (covers CALC-03 manual override).
- **D-11:** Same row structure across all supply types with different labels/units: threads → skeins, beads → packages, specialty → quantity. Consistent layout, type-specific terminology.
- **D-12:** Both header + footer totals — running stitch count total in each supply section header, detailed column totals (total stitches, total skeins, total acquired) in a footer summary row.
- **D-13:** When stitch count changes after a manual override: recalculate and warn if the new result differs from the overridden value. Show "calc suggests X" indicator; user decides whether to accept. Override is never silently overwritten.
- **D-14:** Two-line supply row layout. Line 1: swatch + colour code + name (identity). Line 2: stitches → calculated skeins | Need | Have | fulfillment status. Dense but readable.
- **D-15:** Calculation formula (waste factor, strand count, over count) is adjustable at the project level only. Individual supply rows only input stitch count — no per-row formula controls.

### Project-Level Calculator Settings
- **D-16:** Settings bar at the top of the Supplies tab showing: Strands (default 2), Over count (1 or 2), Fabric count (from linked fabric or default), Waste factor (20%). All editable inline.
- **D-17:** Settings bar appears contextually — hidden until the first stitch count is entered on any supply, then persists. Progressive disclosure: projects with only direct-entry skeins don't see calculator settings.
- **D-18:** "Over 1 / Over 2" toggle in the settings bar. Default: over 2 (most common for evenweave/linen). Affects the calculation formula for all supply rows.
- **D-19:** When no fabric is linked, default to 14ct. Show "Fabric: 14ct (default)" with a hint to link a fabric for accuracy.

### Quick-Add & Entry Order
- **D-20:** Inline create for missing catalog items. When SearchToAdd finds no results, show "+ Create [search text]" at the bottom. Opens a minimal inline form (mirroring InlineNameDialog pattern) without navigating away from the detail page.
- **D-21:** Supplies display in insertion order by default (order added). Sort toggle lets user switch between "Added" (insertion order) and "A-Z" (alphabetical). Insertion order is the default because it matches reading through a chart's supply list.
- **D-22:** Backlog UX fixes (999.0.13 thread picker scroll, 999.0.15 SearchToAdd panel positioning, 999.0.16 highlight conflict) are baked into the supply redesign, not patched onto the old code separately.

### Claude's Discretion
- Edit button placement within the hero/page layout
- Hero visual treatment for non-landscape images (blurred bg fill, subtle gradient, etc.)
- Celebration and status-specific visual accents (borders, glows, colors) across project statuses
- Component architecture — how to split the detail page into manageable components
- Tab component implementation (URL state approach, lazy loading strategy)
- Inline supply create form fields, validation, and error handling
- Responsive layout behavior on mobile (hero stacking, tab navigation, two-line rows)
- Exact skein calculation formula (stitches × strand coverage × fabric factor × waste factor)
- How "over 1/2" affects the formula mathematically

### Folded Todos
- **999.0.2:** Per-colour stitch counts & skein calculator — core feature of this phase
- **999.0.10:** Quick-add missing supplies from detail page — inline create in SearchToAdd
- **999.0.13:** Thread picker scroll UX — baked into supply redesign
- **999.0.15:** SearchToAdd panel positioning — baked into supply redesign
- **999.0.16:** SearchToAdd highlight conflict — baked into supply redesign

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition & reimagined scope
- `.planning/notes/phase-7-reimagined.md` — Key insights: calculator is inline, three entry paths, cross-supply-type pattern, page needs visual love
- `.planning/REQUIREMENTS.md` — CALC-01 through CALC-05 (skein calculator), SUPP-01 (insertion order)

### Current detail page implementation (being redesigned)
- `src/components/features/charts/chart-detail.tsx` — Current detail page: cover image, metadata, status control, overview InfoCards, supplies
- `src/components/features/charts/project-supplies-tab.tsx` — Current supply management: collapsible sections, SupplyRow, EditableNumber, SearchToAdd integration
- `src/app/(dashboard)/charts/[id]/page.tsx` — Server Component page: data fetching, presigned URLs, supplies query
- `src/components/features/charts/status-control.tsx` — Current standalone status control (will be integrated into hero)

### Supply and search components (being redesigned)
- `src/components/features/supplies/search-to-add.tsx` — Current SearchToAdd (scroll, positioning, highlight issues to fix)
- `src/components/features/charts/inline-name-dialog.tsx` — Pattern reference for inline entity creation

### Data model (schema fields relevant to calculator)
- `prisma/schema.prisma` — Project model (storageLocation, stitchingApp, fabric relations), ProjectThread (stitchCount field exists), ProjectBead, ProjectSpecialty

### Design references
- `product-plan/sections/dashboards-and-views/components/ProjectDashboard.tsx` — Design reference for project-level dashboard (hero stats, progress breakdown patterns)
- `product-plan/sections/dashboards-and-views/project-dashboard.png` — Screenshot of designed project dashboard

### Established patterns to follow
- `.claude/rules/base-ui-patterns.md` — Button/Link, semantic tokens, no nested forms
- `.claude/rules/server-client-split.md` — Server Components default, client only for interactivity
- `.claude/rules/component-implementation.md` — Component conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EditableNumber` component (in project-supplies-tab.tsx) — inline number editing with click-to-edit, already used for quantities
- `SupplyRow` component — existing row with swatch, code, name, quantities; will be redesigned but structure is a starting point
- `SupplySection` component — collapsible section with count/fulfilled summary; adaptable for new layout
- `SearchToAdd` component — search + add supplies, needs UX fixes baked in
- `InlineNameDialog` component — pattern for inline entity creation from forms
- `StatusBadge`, `SizeBadge`, `ProgressBar` — reusable in hero area
- `InfoCard` and `DetailRow` — may be adapted or replaced for overview tab
- `BackToGalleryLink` — client component reading localStorage for back navigation
- `StatusControl` — status dropdown, will be redesigned into hero badge

### Established Patterns
- Server Component page.tsx fetches data → passes to Client Component for interactivity
- Presigned image URLs resolved server-side
- `router.refresh()` after mutations to revalidate Server Component data
- `startTransition` + `useCallback` for supply mutation handlers
- Kitting progress calculated client-side from supply data (fulfilled counts, percentage)

### Integration Points
- `/charts/[id]/page.tsx` — will need expanded data fetching (strand count, over count, order metadata)
- `prisma/schema.prisma` — may need new fields on Project (strandCount, overCount) and sort order on junction tables
- Supply section headers — new settings bar and totals integration
- `SearchToAdd` — needs inline create capability and UX fixes
- Tab state persistence in URL params (new URL param for active tab)

</code_context>

<specifics>
## Specific Ideas

- Cover image hero should feel like a magazine spread — the pattern is the star, metadata complements it
- The settings bar (Strands / Over / Fabric / Waste) should feel like a spreadsheet toolbar — compact, informational, not modal
- "Calc suggests X" indicator when override differs should be subtle (tooltip or small text), not alarming
- Two-line supply rows should feel like a ledger — colour identity on top, numbers on bottom
- Insertion order matters because users read through a chart's supply list linearly and want to verify nothing was skipped
- The compact hero (no cover) should still feel warm — strong typography and status accent colours carry the visual weight
- Status-aware overview is the "ooh" factor — WIP pages feel active and progress-focused, Finished pages feel celebratory

</specifics>

<deferred>
## Deferred Ideas

- **User-level default fabric count** — global settings preference for default count (e.g., "I usually stitch on 16ct"). Needs a user settings page. Future phase.
- **Bulk/speed entry mode** — POS-terminal-style rapid supply entry. Deferred to evaluate after real usage with the one-at-a-time approach.
- **Per-row strand count override** — decided project-level only for this phase. If users need mixed strand counts per colour, revisit.
- **Fabric-adjusted recalculation** — auto-adjusting between chart's reference fabric and actual fabric. Parked per reimagined notes.
- **Per-row stitch type** — backstitch, french knots, etc. affect thread usage differently (CALC-06 in v1.2+). Deferred.

### Reviewed Todos (not folded)
- 999.0.14: Project Bin & iPad App management — separate concern, not part of detail page redesign
- 999.0.17: StorageLocation/StitchingApp multi-user hardening — infrastructure, not UX
- 999.0.18: Test infrastructure cleanup for $transaction — dev tooling, not feature work
- 999.0.19: Refactor clickable card rows — storage/app pages, not detail page

</deferred>

---

*Phase: 07-project-detail-experience*
*Context gathered: 2026-04-15*
