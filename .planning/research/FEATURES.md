# Feature Research

**Domain:** Cross-stitch project management — Milestone 2: Browse & Organize
**Researched:** 2026-04-11
**Confidence:** HIGH (existing designs + domain research + existing codebase analysis)

## Feature Landscape

### Table Stakes (Users Expect These)

Features the user has already designed in DesignOS and explicitly requested. Missing any of these means the milestone feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Gallery card view with cover images | Visual browsing is the primary upgrade over Notion's flat table. 500+ charts need visual recognition. | HIGH | Three status-specific card variants (WIP/Unstarted/Finished) already fully designed in `product-plan/sections/gallery-cards-and-advanced-filtering/`. Each variant has distinct footer content: progress bars, kitting dots, celebration borders. |
| View mode toggle (gallery/list/table) | Users need different densities for different tasks: visual browsing (gallery), scanning (list), data analysis (table). This is standard in Ravelry, Notion, and every project management tool. | MEDIUM | All three modes designed in GalleryGrid.tsx. Gallery = card grid, List = compact rows with status dots, Table = sortable columns. View mode should persist in URL params or localStorage. |
| Table view with column sorting | Table view without sorting is useless for 500+ items. Users need to sort by name, designer, status, size, progress, stitch count, colours. | MEDIUM | Sort logic already designed (7 sort fields). Desktop table hides columns responsively (max-md, max-sm, max-lg, max-xl breakpoints). |
| Storage location CRUD (replacing hardcoded arrays) | Currently `projectBin` is a free-text string with hardcoded defaults ["Bin A", "Bin B", "Bin C", "Bin D"]. No rename, no delete, no project count. "Add New" creates "New Location" with no way to manage it. | MEDIUM | Need new `StorageLocation` model in Prisma. Designs exist: StorageLocationList with inline add/edit/delete, StorageLocationDetail with project list. Replace hardcoded array in project-setup-section.tsx with DB-backed select. |
| Wire fabric selector into chart form | Fabric CRUD exists (Phase 4) but the chart form shows a disabled "Phase 5" placeholder (`project-setup-section.tsx:67-74`). Users expect to assign fabric to projects. | LOW | Fetch unassigned fabrics (where `linkedProjectId` is null OR matches current project), populate SearchableSelect. Save `linkedProjectId` on Fabric model. Schema already supports this via `Fabric.linkedProjectId`. |
| Complete DMC catalog (1-149 + Blanc) | Current seed has 459 colours starting at DMC 150. Missing ~47 colours (DMC 1-149 plus Blanc). Incomplete catalog means supply linking fails for common colours. | LOW | Need to source hex values for DMC 1-149 + Blanc. Add to `prisma/fixtures/dmc-threads.json`. Run as a data migration. Ecru already exists in the seed. |
| Cover image aspect ratio fix | Backlog item 999.6: `h-32 + object-cover` crops tall/square images into narrow strips on the chart detail page. Users upload varied image ratios. | LOW | Use `object-contain` with a max-height or responsive aspect ratio. Affects `cover-image-upload.tsx:155` area. The gallery cards use `aspect-[4/3]` which handles this well; the fix is for the detail page and list views. |
| Thread colour picker scroll UX fix | Backlog item 999.0.13: adding thread colours doesn't auto-scroll to keep the search box/+Add button visible. When adding from a long list, the UI jumps and the user loses context. | LOW | Add `scrollIntoView` on the SearchToAdd component or newly added supply rows. The `search-to-add.tsx` component has no scroll management currently. |

### Differentiators (Competitive Advantage)

Features that go beyond what Notion, spreadsheets, or printable trackers offer. Aligned with core value: "manage charts and supplies faster than Notion."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-colour stitch counts with automatic skein calculator | No cross-stitch tracker (app or spreadsheet) integrates per-colour stitch counts directly into the supply linking flow. The user enters stitch count per colour and the app auto-calculates skeins needed based on fabric count, strand count, and stitch type. This replaces manual math that stitchers currently do on thread-bare.com or PC Stitch. | HIGH | Schema already has `ProjectThread.stitchCount` field (default 0). Need: (1) per-colour stitch count input in supply tab, (2) skein calculation engine, (3) auto-populate `quantityRequired` from calculation, (4) manual override toggle. Formula: `skeinsNeeded = ceil(stitchCount / stitchesPerSkein)` where `stitchesPerSkein` varies by fabric count + strand count. See "Skein Calculator" section below. |
| Status-specific card content | Unlike generic card grids, each card variant shows contextually relevant data. WIP cards show progress bar + last stitched. Unstarted cards show kitting checklist dots + prep pipeline. Finished cards show completion stats + celebration border. This surfaces the right info without clicking through. | HIGH | Already fully designed. Three card footer components with distinct layouts. The kitting dots (fulfilled/needed/not-applicable) provide at-a-glance supply readiness that no competing tool offers in card view. |
| Kitting checklist dots on unstarted cards | Visual dots showing fabric/thread/beads/specialty fulfillment status -- check (fulfilled), circle (needed), dash (not-applicable). Users can immediately see what a project still needs without opening it. | MEDIUM | Part of the UnstartedCardData type. Requires computing kitting status from junction tables (do required supplies exist? are quantities met?). The `KittingItemStatus` enum is already defined. |
| "Up Next" pill badge | Kitted projects flagged with `wantToStartNext: true` get a pulsing emerald "Up next" pill on their gallery card. Surfaces the user's intent without needing a separate queue view. | LOW | Already designed. Uses existing `Project.wantToStartNext` boolean. Just needs to render on the card when conditions are met. |
| Celebration border on finished projects | Finished cards get a violet border; FFO cards get a rose border with glow shadow. Provides emotional reward for completing projects -- important for motivation in a hobby tracker. | LOW | Already designed with exact CSS. `celebrationBorder()` and `celebrationRing()` functions in GalleryCard.tsx design. |
| Supply entry workflow rework (insertion order preservation) | Current supply entry loses insertion order -- items appear alphabetically or by ID. Stitchers enter supplies in chart order (reading the pattern page). Maintaining insertion order during entry makes it easier to verify nothing was skipped. | MEDIUM | Backlog item 999.0.7. The detail page can sort independently. Consider a `sortOrder` field on junction tables, or use `createdAt` ordering during entry mode. A dedicated "set up project" flow that combines chart creation + supply entry is a future consideration. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Advanced filter bar in M2 | The AdvancedFilterBar is designed (12 filter dimensions, dismissible chips). Tempting to ship with gallery cards. | 12 filter dimensions is massive scope. Needs dropdown options populated from DB (designers, genres, series, storage locations). Series and kitting status calculations don't exist yet. Shipping half-baked filters is worse than no filters. | Defer AdvancedFilterBar to M3 (Pattern Dive). For M2, provide: text search, status filter dropdown, size filter dropdown. These three cover 80% of browsing needs with 20% of the effort. |
| Drag-and-drop card reordering | Users may want custom sort orders. Project management tools like Trello support this. | Requires persistent sort positions per view, per user. Complex state management for no clear user request. The project plan says "ideally drag-and-drop widgets" for dashboards, not for card ordering. | Provide sort-by options (name, date added, status, size, progress). Users can already find things via sort + search. |
| Real-time collaborative editing | Multi-user awareness is an architectural constraint, but no second user exists. | Adds WebSocket complexity, conflict resolution, optimistic UI for something that's single-user. | Keep the single-user architecture. Multi-user can be added later if needed. |
| Inline card editing | Quick-edit fields directly on gallery cards (status change, progress update). | Cards are already information-dense. Inline editing adds hover states, click targets, and form validation to every card. Breaks the "click through to detail" mental model. | Cards link to detail page. Status changes happen on detail page where full context is available. |
| Auto-calculated kitting status | The design includes kitting percent and status computation. Tempting to build the full 8-condition kitting assessment. | PROJECT.md explicitly defers this: "8-condition status is complex; MVP tracks supplies without auto-computing 'kitted'". The conditions include digital copy, project bag, stash check, all threads, fabric, beads, specialty items, onion skinning. | Show simple supply fulfillment dots (have/need per supply type) without computing a composite "kitting %" status. The dots give 80% of the information. Full kitting calc is a future milestone. |
| Collapsible projects in shopping list | Backlog item 999.0.12. The shopping list gets long fast with many projects. | This is a shopping list UX improvement, not a browse & organize feature. Including it bloats M2 scope. | Defer to a quick-fix sprint. The collapsible pattern is straightforward to add later. |

## Skein Calculator Reference

The skein calculator is the most technically interesting feature in M2. Here is the domain knowledge for implementation.

### Core Formula

```
skeinsNeeded = ceil(colourStitchCount / adjustedStitchesPerSkein)
```

### Stitches Per Skein Lookup

Based on research from thread-bare.com, The Fresh Cross Stitch, and Cross Stitch Style Arte. Values assume ideal conditions (no waste):

| Fabric Count | 1 Strand | 2 Strands | 3 Strands |
|-------------|----------|-----------|-----------|
| 11ct        | 3,600    | 1,800     | 1,200     |
| 14ct        | 5,000    | 2,500     | 1,667     |
| 16ct        | 5,800    | 2,900     | 1,933     |
| 18ct        | 6,600    | 3,300     | 2,200     |
| 22ct        | 8,000    | 4,000     | 2,667     |
| 25ct        | 9,000    | 4,500     | 3,000     |
| 28ct        | 10,000   | 5,000     | 3,333     |
| 32ct        | 12,000   | 6,000     | 4,000     |

**Simplified formula (from The Fresh Cross Stitch):**
```
stitchesPerSkein = 17 * 2.5 * fabricCount * (6 / strands)
```

**Note on evenweave/linen:** Stitched "over two threads," so 28ct linen behaves like 14ct Aida. The effective count = fabric count / 2 for these fabric types. The app should auto-detect this based on fabric type (Linen, Lugana, Evenweave = over-two; Aida, Hardanger = over-one).

### Waste Factor

Apply a 20% waste reduction (conservative, accounts for thread starts/stops, knots, and confetti stitching):
```
adjustedStitchesPerSkein = stitchesPerSkein * 0.80
```

### Data Model Impact

- `ProjectThread.stitchCount` already exists (Int, default 0) -- use this for per-colour stitch counts
- Need new fields on Project or a project-level config: `fabricCount` (from linked Fabric), `strandCount` (new field, default 2), `stitchType` (cross/backstitch/mixed -- future)
- The `quantityRequired` can be auto-calculated from stitchCount OR manually overridden
- Need a `quantityAutoCalculated` boolean or similar to track whether the user manually set the value

### UX Flow

1. User links thread colours to project (existing flow)
2. User enters stitch count per colour (new input alongside existing quantity fields)
3. App auto-calculates `quantityRequired` (skeins) based on project's fabric count + strand count
4. Calculated value shown with "(auto)" label; user can click to override manually
5. If stitch count changes, recalculate unless manually overridden
6. Sum of per-colour stitch counts shown as project total (validates against chart's total stitch count)

## Feature Dependencies

```
[Storage Location CRUD]
    +-- enables --> [Gallery Card: storage location display]
    +-- enables --> [View mode filter by storage location (M3)]

[Wire Fabric Selector]
    +-- enables --> [Skein Calculator: fabric count auto-detection]
    +-- enables --> [Gallery Card: fabric needs display on Unstarted cards]

[Per-Colour Stitch Counts]
    +-- requires --> [Existing supply linking (done in v1.0)]
    +-- enables --> [Skein Calculator auto-calculation]
    +-- enables --> [Gallery Card: supply summary counts]

[Complete DMC Catalog]
    +-- enables --> [Per-Colour Stitch Counts: all colours available for linking]
    +-- standalone data migration, no code dependencies

[Gallery Cards]
    +-- requires --> [Status-specific data queries]
    +-- requires --> [Cover image URLs (done in v1.0)]
    +-- enhanced-by --> [Storage Location CRUD]
    +-- enhanced-by --> [Wire Fabric Selector]

[View Mode Toggle]
    +-- requires --> [Gallery Cards]
    +-- includes --> [List view + Table view with sorting]

[Cover Image Aspect Ratio Fix]
    +-- standalone CSS fix, no dependencies

[Thread Picker Scroll UX Fix]
    +-- standalone UX fix, no dependencies
```

### Dependency Notes

- **Gallery Cards require status-specific data queries:** The card variants need computed fields (progress %, kitting item status, supply counts) that don't exist in current chart queries. Need new server-side data aggregation.
- **Skein Calculator benefits from Fabric Selector:** If fabric is linked, the calculator can auto-detect fabric count. Without it, user must manually enter fabric count per project.
- **DMC Catalog completion is independent:** Pure data task. Should be done early so per-colour stitch counts work with all colours from the start.
- **Bug fixes are independent:** Cover image aspect ratio and thread picker scroll are isolated CSS/JS fixes that can happen anytime.

## Phase Recommendations

### Phase 5a: Foundation & Data (ship first)

Build the data infrastructure that other features depend on.

- [ ] Complete DMC catalog (data migration) -- unblocks accurate supply linking
- [ ] Storage Location CRUD (new Prisma model + pages) -- unblocks gallery card location display and replaces hacky hardcoded arrays
- [ ] Wire fabric selector into chart form -- unblocks skein calculator auto-detection
- [ ] Cover image aspect ratio fix -- quick win, visible improvement
- [ ] Thread colour picker scroll UX fix -- quick win, UX improvement

### Phase 5b: Gallery & Views (ship second)

Build the visible browsing experience that defines M2.

- [ ] Gallery card components (three status-specific variants)
- [ ] Status-specific data queries (progress %, kitting dots, supply counts)
- [ ] Gallery grid with responsive card layout
- [ ] List view (compact rows)
- [ ] Table view with column sorting
- [ ] View mode toggle with URL param persistence
- [ ] Basic search + status/size filters (NOT the full AdvancedFilterBar)
- [ ] Empty state for no results

### Phase 5c: Skein Calculator & Supply Workflow (ship third)

The most complex feature, depends on fabric selector being wired.

- [ ] Per-colour stitch count input in supply tab
- [ ] Skein calculation engine (lookup table + waste factor)
- [ ] Auto-populate quantityRequired from calculation
- [ ] Manual override toggle for quantityRequired
- [ ] Project-level strandCount field (default 2)
- [ ] Sum validation (per-colour totals vs chart total stitch count)
- [ ] Supply entry ordering improvements

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Gallery cards (3 variants) | HIGH | HIGH | P1 |
| View mode toggle (gallery/list/table) | HIGH | MEDIUM | P1 |
| Table sorting | HIGH | LOW | P1 |
| Storage location CRUD | HIGH | MEDIUM | P1 |
| Wire fabric selector | HIGH | LOW | P1 |
| Complete DMC catalog | MEDIUM | LOW | P1 |
| Per-colour stitch counts | HIGH | MEDIUM | P1 |
| Skein calculator | HIGH | MEDIUM | P1 |
| Cover image aspect ratio fix | MEDIUM | LOW | P1 |
| Thread picker scroll fix | MEDIUM | LOW | P1 |
| Supply entry order preservation | MEDIUM | MEDIUM | P2 |
| Basic search/filters | MEDIUM | MEDIUM | P1 |
| "Up Next" pill badge | LOW | LOW | P1 (trivial, designed) |
| Celebration borders | LOW | LOW | P1 (trivial, designed) |
| Advanced filter bar (12 dimensions) | MEDIUM | HIGH | P3 (defer to M3) |
| Collapsible shopping list projects | MEDIUM | LOW | P3 (defer to quick-fix) |

**Priority key:**
- P1: Must have for M2 launch
- P2: Should have, add if time allows
- P3: Defer to later milestone or quick-fix

## Competitor Feature Analysis

| Feature | Notion (current system) | XStitch Plus | Ravelry | Our Approach |
|---------|------------------------|-------------|---------|--------------|
| Gallery cards | Basic gallery view, no status-specific content | Project thumbnails only | Pattern thumbnails with metadata | Status-specific cards with progress bars, kitting dots, celebration borders |
| View modes | Gallery, list, table, board, calendar | Single list view | Grid + list | Gallery/list/table with toggle, URL persistence |
| Storage location | Dropdown property (flat) | Not available | Not applicable | Dedicated CRUD with project count, detail view showing assigned projects |
| Fabric linking | Relation property | Not available | Yarn weight filters | SearchableSelect dropdown, auto-detect fabric count for calculations |
| Skein calculator | Manual formula in notes | Not available | Yardage calculator (yarn) | Integrated per-colour calculation with auto-populate, linked to fabric count |
| Supply tracking | Relation + rollup properties (slow, fragile) | Floss inventory only | Stash tracking (yarn) | Three junction tables with quantities, fulfillment indicators, shopping list generation |
| Per-colour stitch counts | Manual entry in each relation record | Not available | Not available | Inline entry in supply tab with sum validation against total |

## Sources

- [Thread-Bare Skein Estimator](https://www.thread-bare.com/tools/cross-stitch-skein-estimator) -- skein calculation methodology
- [The Fresh Cross Stitch Thread Calculator](https://thefreshcrossstitch.com/blogs/tips-and-resources/thread-calculator-how-much-thread-do-i-need) -- stitches per skein formula: `17 * 2.5 * fabric_count * (6 / strands)`
- [Cross Stitch Style Arte](https://crossstitchstylearte.com/how-to-calculate-the-exact-amount-of-thread-needed-for-any-cross-stitch-project/) -- stitches per skein by fabric count reference
- [Lord Libidan Skein Calculator](https://lordlibidan.com/calculate-the-number-of-required-skeins/) -- empirical skein yield data
- [Stitchmate Thread Calculator](https://stitchmate.app/tools/thread-usage-calculator) -- cross-reference on calculation approach
- [Stash App DeepWiki](https://deepwiki.com/stashapp/stash/3.5-list-and-grid-views) -- list/grid view design patterns (URL persistence, zoom levels, selection management)
- [Sirious Stitches Inventory Tracking](https://sirithre.com/inventory-tracking-cross-stitch-patterns-wips-and-materials/) -- cross-stitch inventory management patterns
- Existing DesignOS designs in `product-plan/sections/gallery-cards-and-advanced-filtering/` -- authoritative UI spec
- Existing DesignOS designs in `product-plan/sections/fabric-series-and-reference-data/` -- storage location UI spec

---
*Feature research for: Cross-stitch project management -- Milestone 2: Browse & Organize*
*Researched: 2026-04-11*
