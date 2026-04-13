# Project Research Summary

**Project:** Cross-Stitch Tracker — Milestone 2: Browse & Organize
**Domain:** Hobby project management app — gallery views, view modes, skein calculation, storage CRUD, DMC data, UX fixes
**Researched:** 2026-04-11
**Confidence:** HIGH

## Executive Summary

Milestone 2 is a build milestone, not an integration milestone. Every feature can be implemented with the existing stack — no new dependencies needed. The core deliverable is replacing the current flat table view with a rich gallery browsing experience: three status-specific card variants (WIP/Unstarted/Finished), three view modes (gallery/list/table), and the infrastructure (StorageLocation CRUD, fabric selector wiring) those cards depend on. The existing DesignOS designs in `product-plan/sections/gallery-cards-and-advanced-filtering/` are the authoritative spec and drive all UI decisions.

The standout differentiator is the per-colour stitch count and skein calculator feature. No competing cross-stitch tracker (app or spreadsheet) integrates per-colour stitch counts directly into the supply linking flow. The schema already has the `ProjectThread.stitchCount` field; this is a UI and calculation problem, not a data model problem. The recommended approach is to build the calculator as a pure utility function with a lookup table rather than a continuous formula, display results as suggestions with manual override, and default to 2 strands/cross stitch for M2 (defer stitch-type breakdowns to a later milestone).

The primary risk is building gallery cards against the full DesignOS spec without acknowledging that session-derived data (stitching time, last session date, daily average) does not exist until Milestone 3. Cards must be built in an M2 tier that gracefully handles null session data, with hidden stat rows rather than misleading zeros. The secondary risk is an N+1 query explosion for supply counts: the gallery query must use Prisma `_count` includes rather than per-card fetches. View mode state must be URL-based (`?view=gallery`) from the start — localStorage produces a hydration flash that is already documented as a known bug.

## Key Findings

### Recommended Stack

Zero new dependencies. The existing stack (Next.js 16, Prisma 7, Tailwind 4, shadcn/ui v4, React 19, Auth.js v5) covers all M2 needs. The only changes are schema additions (new `StorageLocation` and `StitchingApp` models, replacing string fields with FK relations) and a data migration to populate those tables from existing `projectBin` values. The `ProjectThread.stitchCount` field already exists. Skein calculation is pure TypeScript arithmetic. Gallery card layout is CSS Grid + Tailwind. View mode persistence belongs in URL search params, not localStorage.

**Core technologies — no changes, just usage:**
- **Prisma 7 + Neon**: Schema migration for `StorageLocation`; `_count` includes for gallery query performance
- **Next.js 16 App Router**: Server Components for gallery data aggregation; Client Components for view switching, inline CRUD
- **Tailwind 4**: `aspect-[4/3]` for cover image containers; existing design tokens for status-specific card styling
- **shadcn/ui v4 + cmdk**: Existing `SearchableSelect` for fabric and storage location dropdowns
- **React 19 `useState` + URL params**: View mode and sort state — no external state lib needed

**What NOT to add:** `@tanstack/react-table` (design spec implements sorting in ~30 lines), `framer-motion` (Tailwind transitions suffice), `nuqs` (URL params via native Next.js pattern), any chart/graph library, any virtualization library.

### Expected Features

**Must have (table stakes):**
- Gallery card view with cover images — three status-specific variants (WIP/Unstarted/Finished), each with distinct footer content
- View mode toggle (gallery/list/table) with URL param persistence — standard in every project management tool
- Table view with column sorting — 7 sort fields, useless without sorting at 500+ charts
- Storage location CRUD — replace hardcoded arrays with DB-backed `StorageLocation` model
- Wire fabric selector into chart form — Phase 4 built fabric CRUD; the chart form has a disabled "Phase 5" placeholder that must ship in M2
- Complete DMC catalog — 459 entries exist starting at DMC 150; Blanc and ~30 genuinely missing colours need to be added (DMC 1-149 do NOT exist as standard floss — this is a misconception in the backlog item)
- Cover image aspect ratio fix (backlog 999.6) — `object-contain` with max-height replaces the broken `h-32 + object-cover`
- Thread picker scroll UX fix (backlog 999.0.13) — `scrollIntoView` on `SearchToAdd` after each add

**Should have (differentiators):**
- Per-colour stitch counts with automatic skein calculator — no competitor offers this integrated into supply linking; schema already supports it
- Status-specific card content (progress bars, kitting dots, celebration borders) — surfaces right info without clicking through
- Kitting checklist dots on unstarted cards — at-a-glance supply readiness
- "Up Next" pill badge — trivial to implement, designed, uses existing `wantToStartNext` boolean
- Supply entry insertion order preservation — stitchers enter in chart order; losing order forces re-verification

**Defer (M3+):**
- Advanced filter bar (12 filter dimensions, AdvancedFilterBar component) — defer to M3 Pattern Dive
- Drag-and-drop card reordering — no clear user request, complex state for minimal gain
- Collapsible shopping list projects (backlog 999.0.12) — not a browse & organize feature
- Stitch type breakdowns in skein calculator (backstitch, french knots) — default to cross stitch for M2
- Multi-step "project setup" wizard — improve existing flow inline, not a new flow

### Architecture Approach

M2 extends existing patterns rather than introducing new ones. The charts page becomes a Server Component that runs a single deep aggregation query, transforms results to a `GalleryCardData` discriminated union (WIPCardData | UnstartedCardData | FinishedCardData), and passes typed props to the client `GalleryGrid` component. A new `settings/storage/` route handles StorageLocation CRUD following the existing Designer CRUD pattern exactly. The skein calculator is a pure utility function in `lib/utils/skein-calculator.ts` computed at render time, never stored.

**Major components:**
1. **`GalleryGrid` (NEW, client)** — view mode switcher, sort state, renders gallery/list/table views
2. **`GalleryCard` (NEW, client)** — status-specific card layouts; M2-tier hides session-derived fields when null
3. **`getGalleryData()` server action (NEW)** — single aggregation query with `_count` includes; transforms to discriminated union
4. **`StorageLocationList/Detail` (NEW, client)** — inline CRUD following Designer pattern; `onDelete: SetNull` preserves projects
5. **`skein-calculator.ts` (NEW, pure util)** — `calculateSkeinsNeeded(stitchCount, fabricCount, strandCount)` using lookup table
6. **`ProjectSetupSection` (MODIFY)** — wire fabric `SearchableSelect` + storage location dropdown to replace disabled placeholders
7. **`ProjectSuppliesTab` (MODIFY)** — add inline `stitchCount` editing + auto-calculated skein display per thread colour

### Critical Pitfalls

1. **Gallery card data shape mismatch with DesignOS full spec** — Build M2-tier cards that hide session-derived fields (time, last session, daily average) when null rather than showing zeros. Session data arrives in M3; design the card builder with explicit `null` awareness now.

2. **N+1 query explosion for supply counts** — Create a dedicated `getChartsForGallery()` action using Prisma `_count` includes (`projectThreads`, `projectBeads`, `projectSpecialty`). Never fetch supply details per-card. The current `getCharts()` query is insufficient for gallery data.

3. **View mode state loss on navigation** — Use URL search params (`?view=gallery&sort=designer&dir=asc`) as source of truth from day one. localStorage causes a hydration flash (already a known bug pattern on this project). URL params survive navigation, back button, and bookmarks.

4. **Storage location migration breaking existing data** — The `projectBin` string field must be migrated in two steps: (1) create `StorageLocation` rows from distinct existing values, (2) update FK references. Keep `projectBin` column until migration is verified; only drop it in a follow-up migration.

5. **Skein calculator formula underestimation** — The calculator is a suggestion tool, not a hard constraint. Use a lookup table indexed by fabric count (not a continuous formula). Default to 2 strands, cross stitch for M2. Apply 20% waste factor. Always round up. Let users override `quantityRequired` manually. Fabric must be linked for accurate calculation; fall back to 14-count default when unlinked.

6. **DMC catalog data quality risk** — The backlog claim "DMC 1-149" is a misconception (DMC 1-35 are Diamant specialty threads; 36-149 do not exist as standard floss). The real gap is ~30 missing colours including Blanc. Cross-reference against two sources before adding; run idempotent upsert; validate no duplicate `colorCode` entries.

## Implications for Roadmap

Based on dependency analysis across all research files, M2 splits naturally into three phases:

### Phase 5: Foundation & Quick Wins

**Rationale:** Data infrastructure comes first because gallery cards depend on `StorageLocation`, the skein calculator depends on the fabric selector, and DMC gaps block accurate supply linking. Quick-fix UX items (cover image, scroll) are fast, visible wins with no dependencies and can ship immediately.

**Delivers:** Replaced hardcoded arrays with DB-backed entities; all charts have accurate DMC supply data; two persistent UX bugs resolved; fabric selector live.

**Addresses (from FEATURES.md):**
- Storage location CRUD (replaces hardcoded `DEFAULT_BIN_OPTIONS`)
- Wire fabric selector into chart form
- Complete DMC catalog (data migration only)
- Cover image aspect ratio fix
- Thread picker scroll UX fix

**Avoids (from PITFALLS.md):**
- Storage location migration pitfall: two-step migration, keep `projectBin` until verified
- DMC data quality risk: cross-reference two sources, idempotent upsert

**Build order within phase:**
1. `StorageLocation` schema + migration (other features depend on it)
2. DMC catalog data update (independent, data-only)
3. Storage location CRUD (new route + server actions)
4. Wire fabric selector (`SearchableSelect` + `getUnassignedFabrics()`)
5. Cover image aspect ratio (CSS-only, Tailwind class change)
6. Thread picker scroll UX (`scrollIntoView` in `SearchToAdd`)

---

### Phase 6: Gallery Cards & View Modes

**Rationale:** This is the visual core of M2. Depends on Phase 5 completing `StorageLocation` so cards can display storage info. The gallery query, discriminated union types, and card components form a single logical unit. View mode toggle and sorting are inseparable from the gallery grid.

**Delivers:** Full gallery browsing experience replacing the existing flat table; three status-specific card variants; three view modes; column sorting; URL-based view state persistence.

**Addresses (from FEATURES.md):**
- Gallery card view (three status-specific variants: WIP, Unstarted, Finished)
- View mode toggle (gallery/list/table)
- Table view with column sorting
- Basic search + status/size filters (NOT the full 12-dimension AdvancedFilterBar)
- "Up Next" pill badge, celebration borders (trivial, designed, ship with cards)
- Kitting checklist dots on unstarted cards

**Avoids (from PITFALLS.md):**
- Gallery card data shape mismatch: M2-tier cards hide null session fields; no "0 days" for active projects
- N+1 query: dedicated `getChartsForGallery()` with `_count` includes, single query
- View mode state loss: URL search params from day one (`?view=gallery&sort=name&dir=asc`)
- Performance traps: `React.memo` on `GalleryCard`; `useMemo` for sorted arrays; thumbnail URLs over full images

**Build order within phase:**
1. `types/gallery.ts` — `GalleryCardData` discriminated union (M2-tier, session fields nullable)
2. `getChartsForGallery()` server action — aggregation query with `_count` includes
3. `GalleryCard` components — three status-specific variants
4. `GalleryGrid` + `ViewModeSwitcher` — client component with URL param state
5. List view + Table view with column sorting
6. Basic search/filter (text search + status + size)
7. `/charts/page.tsx` update — swap `ChartList` for `GalleryGrid`

---

### Phase 7: Skein Calculator & Supply Workflow

**Rationale:** Depends on fabric selector being wired (Phase 5) to detect fabric count automatically. The per-colour stitch count input extends the existing supply tab. This is the most complex M2 feature and should ship last so Phase 6's gallery work is not blocked.

**Delivers:** Integrated skein calculator in the supply tab; per-colour stitch count entry; auto-calculated `quantityRequired` with manual override; supply entry insertion order preservation; project total stitch count validation.

**Addresses (from FEATURES.md):**
- Per-colour stitch counts with automatic skein calculator
- Supply entry insertion order preservation (backlog 999.0.7)
- Sum validation (per-colour totals vs chart total stitch count)

**Avoids (from PITFALLS.md):**
- Skein formula underestimation: lookup table approach, 20% waste factor, manual override, clear fallback when no fabric linked
- Per-colour entry UX: allow stitch count input inline during supply addition, not as a separate step
- Fabric selector showing assigned fabrics: filter by `linkedProjectId IS NULL OR = currentProjectId`

**Build order within phase:**
1. `lib/utils/skein-calculator.ts` — pure function, unit tests first (TDD)
2. Schema: verify `ProjectThread.stitchCount` is editable; add `strandCount Int @default(2)` if needed
3. `SupplyRow` — inline editable `stitchCount` field + skein suggestion display
4. Supply actions — verify `updateProjectSupplyQuantity` accepts `stitchCount`
5. Per-colour total + validation hint (sum vs chart total)
6. Supply entry ordering improvements

---

### Phase Ordering Rationale

- Foundation first because `StorageLocation` unblocks both gallery cards (display) and the chart form (dropdowns); fabric selector unblocks skein calculator accuracy
- Gallery is phase 2 of 3 because it depends on Phase 5's schema but not Phase 7's calculator
- Skein calculator is phase 3 because it benefits from fabric selector (Phase 5) and is the most complex feature — not worth blocking gallery work
- Bug fixes (cover image, scroll) slot into Phase 5 for fast visible wins, not into their own phase

### Research Flags

Phases with standard patterns (skip additional research):
- **Phase 5 (Foundation):** All patterns are established. StorageLocation mirrors Designer CRUD exactly. DMC data task is sourcing + upsert. Fabric selector uses existing `SearchableSelect`. No research needed.
- **Phase 6 (Gallery/Views):** DesignOS designs are the spec. Architecture follows existing Server Component + Client Component split. View mode URL state uses existing `useSearchParams` + `router.replace` pattern.

Phases that may warrant targeted research during planning:
- **Phase 7 (Skein Calculator):** The skein calculation formula has domain nuances (over-two stitching on linen, waste factor calibration). Research is complete in STACK.md and FEATURES.md (lookup table provided, formula cross-referenced from 4+ sources). No additional research-phase needed, but the plan should include verified test cases against known values before implementation.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies. All decisions grounded in existing codebase patterns. Confirmed via schema inspection and component analysis. |
| Features | HIGH | DesignOS designs are the authoritative spec. Feature list directly reflects backlog items + design components + domain research cross-referenced against competitor tools. |
| Architecture | HIGH | Patterns match existing codebase exactly (Designer CRUD, supply catalog view mode, presigned URL resolution). Build order based on verified dependency analysis. |
| Pitfalls | HIGH | Pitfalls identified from codebase analysis (existing schema gaps, known bug items) + domain expertise (skein formula). Not speculative — grounded in real code. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact DMC missing colour count**: The fixture has 459 entries vs ~489 in the US catalog. The delta of ~30 needs a diff against an authoritative source (`rgb-to-dmc` GitHub repo). Not a blocker — the approach is clear; the exact list of additions will be determined during Phase 5 execution.
- **Skein lookup table values**: Values are community consensus (MEDIUM confidence on individual numbers, HIGH confidence on the approach). The 20% waste factor is a standard recommendation. The calculator is designed as a suggestion tool with manual override, so small inaccuracies in the lookup table are recoverable without data migration.
- **`strandCount` field decision**: Research recommends defaulting to 2 strands per project without adding a DB field for M2. If the user wants per-colour strand overrides, that requires a schema addition. Defer the decision to Phase 7 planning.
- **nuqs vs native URL params for view mode**: PITFALLS.md recommends nuqs for type-safe URL state; STACK.md recommends against adding it (existing `useSearchParams` + `router.replace` pattern works). Recommendation: use native pattern first; adopt nuqs only if URL state management becomes complex (multi-param coordination, type safety issues). Resolve during Phase 6 planning.

## Sources

### Primary (HIGH confidence)
- `product-plan/sections/gallery-cards-and-advanced-filtering/` — authoritative UI spec for gallery cards, view modes, sort fields
- `product-plan/sections/fabric-series-and-reference-data/` — StorageLocation UI spec
- `prisma/schema.prisma` — confirmed `ProjectThread.stitchCount` exists (line 182), `Fabric.linkedProjectId` exists, `projectBin` is String? on Project
- `src/components/features/supplies/supply-catalog.tsx` — existing grid/table toggle pattern, localStorage + URL param sync
- `src/components/features/charts/chart-list.tsx` — current chart table being replaced

### Secondary (MEDIUM confidence)
- [Thread-Bare Skein Estimator](https://www.thread-bare.com/tools/cross-stitch-skein-estimator) — skein calculation methodology
- [The Fresh Cross Stitch Thread Calculator](https://thefreshcrossstitch.com/blogs/tips-and-resources/thread-calculator-how-much-thread-do-i-need) — stitches per skein formula
- [Lord Libidan Skein Calculator](https://lordlibidan.com/calculate-the-number-of-required-skeins/) — empirical skein yield data
- [Lord Libidan DMC catalog](https://lordlibidan.com/how-many-dmc-threads-are-there/) — 500 solid colours, 489 US
- [Maydel Craft DMC guide](https://maydel.com/2021/01/13/demystifying-dmc-part-1-6-strand-floss/) — numbering system, missing US colours
- [rgb-to-dmc GitHub](https://github.com/seanockert/rgb-to-dmc/blob/master/rgb-dmc.json) — 447-colour JSON dataset for fixture cross-reference

### Tertiary (context / cross-reference)
- [Cross Stitch Style Arte](https://crossstitchstylearte.com/how-to-calculate-the-exact-amount-of-thread-needed-for-any-cross-stitch-project/) — stitches-per-skein lookup table by fabric count
- [nuqs - Type-safe URL state for React](https://nuqs.dev/) — URL state management option (evaluated, not recommended for M2)
- [Stash App DeepWiki](https://deepwiki.com/stashapp/stash/3.5-list-and-grid-views) — list/grid view patterns for reference

---
*Research completed: 2026-04-11*
*Ready for roadmap: yes*
