# Stack Research: Milestone 2 — Browse & Organize

**Domain:** Cross-stitch project management — gallery views, view modes, skein calculation, storage CRUD, DMC data, UX fixes
**Researched:** 2026-04-11
**Confidence:** HIGH

## Executive Summary

Milestone 2 requires **zero new dependencies**. Every feature can be built with the existing stack. The gallery cards, view mode switching, sorting, and table views are all implemented in the DesignOS designs using plain React state + CSS Grid + Tailwind — no data table library needed. The skein calculator is pure arithmetic. Storage locations require a schema migration but no new packages. DMC catalog "completion" is a data correction, not a code change. The cover image fix and thread picker scroll UX are CSS/DOM adjustments.

This is a build milestone, not an integration milestone.

## Recommended Stack Changes

### New Dependencies: NONE

No new packages to install. The existing stack covers all M2 needs.

### Schema Additions Required

| Change | Purpose | Why |
|--------|---------|-----|
| `StorageLocation` model | Replace hardcoded `DEFAULT_BIN_OPTIONS` array in `project-setup-section.tsx` | Currently project bins are ephemeral client-side strings. CRUD needs persistence. |
| `StitchingApp` model | Replace hardcoded `DEFAULT_APP_OPTIONS` array | Same problem — apps are client-state-only, can't be managed. |
| `ProjectThread.stitchCount` field | Already exists (`Int @default(0)`) | Schema already has this — just needs UI to expose it. |

The `ProjectThread` model already has a `stitchCount` field (line 182 of schema.prisma). The per-colour stitch count feature is a UI/calculation problem, not a data model problem.

## Feature-by-Feature Stack Analysis

### 1. Gallery Cards with Status-Specific Layouts

**What's needed:** Three card variants (WIP, Unstarted, Finished) with cover images, progress bars, kitting dots, and celebration borders.

**Stack assessment:** Fully covered by existing stack.
- CSS Grid for responsive card layout (`repeat(auto-fill, minmax(280px, 340px))` per design)
- Tailwind for status-specific styling (already have 7 status colors in design tokens)
- `next/image` for optimized cover photos (already used via R2 presigned URLs)
- `sharp` already installed for thumbnail generation
- No animation library needed — Tailwind transitions + `tw-animate-css` cover hover/pulse effects

**Confidence:** HIGH — Design components in `product-plan/sections/gallery-cards-and-advanced-filtering/` are pure React + Tailwind, no external deps.

### 2. Gallery / List / Table View Modes with Sorting

**What's needed:** Three view modes (gallery grid, compact list rows, full data table) with client-side sorting.

**Stack assessment:** Fully covered by existing stack.
- View mode toggle: same pattern as supply catalog's existing grid/table toggle (`supply-catalog.tsx` lines 20, 610-635)
- Table sorting: the design's `TableView` in `GalleryGrid.tsx` implements sorting with plain React state (`useState<SortField>`, `useState<SortDir>`) — does NOT use @tanstack/react-table
- View persistence: `localStorage` + URL search params (same pattern as supplies page)

**@tanstack/react-table: NOT needed for M2.** The design spec implements table sorting with ~30 lines of custom code. The library adds value when you need pagination, column resizing, grouping, virtual scrolling, or server-side sorting. M2's table is a simple sortable list of ~500 items rendered client-side. Adding react-table here would over-engineer the solution.

**When to add it:** Milestone 3's Pattern Dive (library browser with filtering) or if the table needs column visibility toggling, multi-column sorting, or pagination. Reassess at M3 planning.

**Confidence:** HIGH — Existing supply catalog already demonstrates this exact pattern.

### 3. Per-Colour Stitch Counts & Automatic Skein Calculator

**What's needed:** Per-thread stitch count entry on `ProjectThread`, automatic skein calculation based on fabric count and strand count.

**Stack assessment:** Pure arithmetic — no external library needed.

**Skein calculation formula (verified from multiple cross-stitch sources):**

```
skeinsNeeded = ceil(stitchCountForColour / stitchesPerSkein * safetyMultiplier)
```

Where `stitchesPerSkein` is a lookup based on fabric count (using 2 strands, the standard):

| Fabric Count | Stitches per Skein (2 strands) | Source |
|--------------|-------------------------------|--------|
| 14-count | ~220 | Community consensus |
| 16-count | ~260 | Community consensus |
| 18-count | ~290 | Community consensus, eponases.com experiment |
| 25-count (over 2) | ~220 | Equivalent to 12.5ct |
| 28-count (over 2) | ~250 | Equivalent to 14ct |
| 32-count (over 2) | ~280 | Equivalent to 16ct |

**Safety multiplier:** 1.2 (20% — industry standard for thread tails and waste).

**Implementation approach:**
- Store a reference table of stitches-per-skein as a TypeScript constant (not a DB table — well-known reference data)
- Formula variables: `fabricCount` (from linked Fabric), `strandCount` (default 2, could add to ProjectThread), `stitchCount` (per colour, already in schema)
- Calculate at query time (per project convention — never store calculated values)
- Label results as "estimated" with manual override option on `quantityRequired`

**Schema notes:**
- `ProjectThread.stitchCount` — already exists, `Int @default(0)`
- May want to add `strandCount Int @default(2)` to `ProjectThread` for non-standard projects
- Fabric `count` field already exists on `Fabric` model and links to Project via `linkedProjectId`

**Confidence:** MEDIUM on lookup values — The stitches-per-skein values are approximate and vary by stitcher technique. Multiple sources agree within ~10%. The formula itself is definitive; the lookup values are community consensus, not manufacturer-specified.

### 4. Storage Location Management (CRUD)

**What's needed:** Replace hardcoded arrays (`DEFAULT_BIN_OPTIONS`, `DEFAULT_APP_OPTIONS`) with proper database-backed CRUD.

**Stack assessment:** Standard Prisma model + server actions. Identical pattern to existing Designer and Genre CRUD.

**Current state (from `project-setup-section.tsx`):**
```typescript
const DEFAULT_BIN_OPTIONS = ["Bin A", "Bin B", "Bin C", "Bin D"];
const DEFAULT_APP_OPTIONS = ["Markup R-XP", "Saga", "MacStitch"];
```
These are client-side-only. Adding "New Location" creates a state entry that doesn't persist. This is backlog item 999.0.14.

**What's needed:**
- `StorageLocation` model (id, name, createdAt, updatedAt)
- `StitchingApp` model (id, name, createdAt, updatedAt)
- Server actions for create/update/delete (same pattern as designers)
- Update `Project.projectBin` from `String?` to a relation to `StorageLocation`
- Update `Project.ipadApp` from `String?` to a relation to `StitchingApp`
- Migration to move existing string values to new tables

No new dependencies — this is the same CRUD pattern used 6+ times already in the codebase.

**Confidence:** HIGH

### 5. Wire Fabric Selector into Chart Form

**What's needed:** Replace the disabled "Phase 5" placeholder in `project-setup-section.tsx` with a working fabric dropdown.

**Stack assessment:** No new deps. The existing `SearchableSelect` component + fabric server actions already exist.

**Current state:** `project-setup-section.tsx` line 67-74 has a hardcoded disabled placeholder. Fabric CRUD already works (`/fabrics` page). The `Fabric` model has `linkedProjectId` for 1:1 project linking.

**What's needed:**
- Fetch unassigned fabrics (where `linkedProjectId IS NULL` or equals current project)
- Wire into `SearchableSelect` options
- On selection, update `Fabric.linkedProjectId`
- Show linked fabric details (count, type, size)

**Confidence:** HIGH — All building blocks exist.

### 6. Complete DMC Catalog

**What's needed:** Fill gaps in the DMC thread fixture.

**Critical finding: DMC standard 6-strand floss does NOT have numbers 1-149.** The backlog item "DMC 1-149 including Blanc, Ecru" is based on a misunderstanding of the DMC numbering system.

**Current fixture analysis:**
- 459 colors in `prisma/fixtures/dmc-threads.json`
- Has: White, Ecru, B5200, and all standard colors 150-3866
- Missing: "Blanc" (French name for White — some patterns reference "Blanc" vs "White")
- The lowest standard DMC floss numbers are 150, 151, 152...
- Numbers 1-35 are reserved for DMC metallic/specialty threads (Diamant), NOT standard floss
- Numbers 36-149 do not exist in the DMC product line

**What actually needs to happen:**
1. Add "Blanc" as an entry (hex #FCFBF8, same as White) — many patterns use this name
2. Cross-reference against the GitHub `rgb-to-dmc` dataset (447 colors) and the full DMC catalog (489-500 colors depending on region) to identify genuinely missing colors
3. Verify the 459-color fixture against DMC's US catalog of 489 — the delta of ~30 colors may include regional exclusives or recently added colors
4. Consider adding the 10 "missing from US site" colors reported by community: 13, 14, 15, 16, 17, 18, 677, 734, 822, 988 (these are apparently valid but hard to source)

**Data source for completion:** The `rgb-to-dmc` GitHub repo (https://github.com/seanockert/rgb-to-dmc/blob/master/rgb-dmc.json) provides a verified JSON dataset. Cross-reference with the existing fixture to find genuine gaps.

**No new dependencies needed** — this is a seed data file update.

**Confidence:** HIGH for the finding that DMC 1-149 don't exist as standard floss. MEDIUM for the exact count of missing colors — needs a diff between our fixture and the authoritative list.

### 7. Cover Image Aspect Ratio Fix

**What's needed:** Fix `h-32 + object-cover` cropping tall/square images into narrow strips.

**Stack assessment:** Pure CSS fix. No new deps.

**Current state:** `cover-image-upload.tsx` line ~155 uses fixed height container with `object-cover`, which clips non-landscape images badly.

**Design spec approach:** Gallery cards use `aspect-[4/3]` containers (GalleryCard.tsx line 473), which is better than fixed height. The detail page uses `aspect-[4/3] max-h-80` (chart-detail.tsx line 187).

**Fix:** Replace fixed `h-32` with `aspect-[4/3]` or use `object-contain` with a background color. This is a Tailwind class change.

**Confidence:** HIGH

### 8. Thread Colour Picker Scroll UX Fix

**What's needed:** Auto-scroll to keep search box/+Add button visible when adding thread colours.

**Stack assessment:** Native DOM `scrollIntoView()` — no library needed.

**Fix location:** `search-to-add.tsx` and/or `project-supplies-tab.tsx`. After adding an item, call `element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on the search input or add button.

**Confidence:** HIGH

### 9. Supply Entry Workflow Rework

**What's needed:** Maintain insertion order during entry, streamlined project setup flow.

**Stack assessment:** No new deps. This is a UX restructure of existing components.

**Current state:** Supplies are added via `SearchToAdd` in `project-supplies-tab.tsx`. Order is determined by the database (createdAt). The rework needs:
- Preserve insertion order in the UI during entry (use `createdAt` or add a `sortOrder` field)
- Consider a dedicated "set up project" flow combining chart + supply entry
- Detail page can sort independently of entry order

**Potential schema addition:** `sortOrder Int?` on junction tables if insertion order must be explicitly tracked separate from `createdAt`. But `createdAt` sorting likely suffices.

**Confidence:** HIGH — UI flow change, not a technology change.

## What NOT to Add for M2

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@tanstack/react-table` | Over-engineered for M2's simple sortable table. Design spec implements sorting in ~30 lines. 500-row client-side sort is trivial. | Custom sort with `useState` + `Array.sort()` (matches design spec) |
| `react-virtualized` / `@tanstack/virtual` | Only needed for 10k+ items. 500 charts render fine without virtualization. | Standard React rendering |
| `framer-motion` | Gallery card hover effects are simple CSS transitions. No complex animations in M2. | Tailwind transitions + `tw-animate-css` |
| Any chart/graph library | M2 has no charts or graphs. Progress bars are Tailwind width classes. | `w-[${percent}%]` on a div |
| `@dnd-kit/core` | No drag-and-drop in M2 scope. | Not needed until M4 dashboard widgets |
| `nuqs` / `next-usequerystate` | URL state management lib. Existing `useSearchParams` + `router.replace` pattern works. | Continue existing pattern from supply catalog |
| `date-fns` | M2 date formatting is simple (`toLocaleDateString`). | Native `Intl.DateTimeFormat` (already used in chart-list.tsx) |
| `lodash` | No complex data transforms needed. Native array methods suffice. | `Array.sort()`, `Array.filter()`, `Array.reduce()` |

## Existing Stack Sufficiency Matrix

| M2 Feature | Existing Tech | New Tech Needed | Confidence |
|------------|--------------|-----------------|------------|
| Gallery cards | React + Tailwind + CSS Grid | None | HIGH |
| View mode switching | useState + localStorage + URL params | None | HIGH |
| Table sorting | useState + Array.sort() | None | HIGH |
| Skein calculator | Pure TypeScript arithmetic | None | HIGH |
| Storage location CRUD | Prisma + server actions + Zod | Schema migration only | HIGH |
| Fabric selector wiring | SearchableSelect + Fabric model | None | HIGH |
| DMC catalog completion | Seed data JSON fixture | Data update only | HIGH |
| Cover image aspect ratio | Tailwind CSS classes | None | HIGH |
| Thread picker scroll UX | DOM scrollIntoView() | None | HIGH |
| Supply workflow rework | React component restructure | None | HIGH |

## Version Compatibility Notes

No new packages means no new compatibility concerns. Current installed versions:

| Package | Installed Version | M2 Notes |
|---------|------------------|----------|
| Next.js | 16.2.2 | No M2-specific concerns |
| Prisma | 7.6.0 | Schema migration for StorageLocation/StitchingApp models |
| React | 19.2.4 | No M2-specific concerns |
| Tailwind | 4.2.2 | `aspect-[4/3]` works natively in v4, needed for gallery cards |
| sharp | 0.33.5 | Already installed (devDep), used for thumbnail generation |
| cmdk | 1.1.1 | Already installed, powers SearchableSelect for fabric selector |
| lucide-react | 1.7.0 | Gallery card icons (Scissors, Clock, Calendar, Check, etc.) already available |

## Sources

- **Skein calculation formula:** [Cross Stitch Style Arte](https://crossstitchstylearte.com/how-to-calculate-the-exact-amount-of-thread-needed-for-any-cross-stitch-project/) — stitches-per-skein lookup table by fabric count, MEDIUM confidence
- **Skein calculation formula:** [Eponases blog](https://www.eponases.com/blog/2014/01/cross-stitch-stitches-per-skein/) — experimental measurement ~3000 stitches/skein on 18ct, MEDIUM confidence
- **Skein calculators (formula cross-reference):** [Thread-bare estimator](https://www.thread-bare.com/tools/cross-stitch-skein-estimator), [Lord Libidan calculator](https://lordlibidan.com/calculate-the-number-of-required-skeins/), [Textile Calculator](https://textilecalculator.com/cross-stitch-skein-calculator/)
- **DMC catalog scope:** [How many DMC threads are there](https://lordlibidan.com/how-many-dmc-threads-are-there/) — 500 solid colors, 489 available US, HIGH confidence
- **DMC numbering:** [Maydel Craft DMC guide](https://maydel.com/2021/01/13/demystifying-dmc-part-1-6-strand-floss/) — numbering system, missing US colors list, HIGH confidence
- **DMC catalog data:** [rgb-to-dmc GitHub](https://github.com/seanockert/rgb-to-dmc/blob/master/rgb-dmc.json) — 447-color JSON with hex codes, verified against existing fixture
- **Design spec (gallery):** `product-plan/sections/gallery-cards-and-advanced-filtering/` — GalleryCard.tsx, GalleryGrid.tsx, AdvancedFilterBar.tsx, types.ts
- **Existing patterns (view modes):** `src/components/features/supplies/supply-catalog.tsx` — grid/table view toggle, localStorage persistence, URL param sync
- **Existing patterns (chart list):** `src/components/features/charts/chart-list.tsx` — current table/card layout being replaced
- **Schema reference:** `prisma/schema.prisma` — ProjectThread.stitchCount already exists (line 182), Fabric.linkedProjectId for selector (line 243)

---
*Stack research for: Milestone 2 — Browse & Organize*
*Researched: 2026-04-11*
