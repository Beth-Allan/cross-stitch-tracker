# Pitfalls Research

**Domain:** Adding gallery cards, view modes, skein calculator, storage CRUD, and supply workflow improvements to existing cross-stitch management app
**Researched:** 2026-04-11
**Confidence:** HIGH (verified against existing codebase patterns, DesignOS designs, and domain research)

## Critical Pitfalls

### Pitfall 1: Gallery Card Data Shape Mismatch with Existing Schema

**What goes wrong:**
The DesignOS `GalleryCardData` types require fields that do not yet exist in the database or current query responses. Specifically:
- `WIPCardData` needs `progressPercent`, `lastSessionDate`, `totalTimeMinutes`, `stitchingDays`, `latestPhotoUrl` -- all of which come from stitching sessions (Milestone 3, not yet built).
- `UnstartedCardData` needs `fabricStatus`, `threadStatus`, `beadsStatus`, `specialtyStatus`, `prepStep`, `kittingPercent` -- none of which are stored fields.
- `FinishedCardData` needs `startToFinishDays`, `avgDailyStitches`, `stitchingDays`, `totalTimeMinutes` -- again, session-dependent.

If gallery cards are built to the full DesignOS spec, they will show empty/zero data for every session-dependent field until M3 ships.

**Why it happens:**
The DesignOS designs were built as a full-vision spec. Gallery cards are in M2 but stitching sessions are in M3. Building the card UI without acknowledging the data gap leads to either broken layouts or wasted effort on placeholder logic.

**How to avoid:**
Build gallery cards in two tiers:
1. **M2 tier**: Use only data available now -- chart metadata, project status, supply counts from junction tables, fabric linkage, dates. WIP cards show stitch progress from `stitchesCompleted`/`stitchCount` but skip session-derived stats (time, daily avg, last session date). Finished cards show dates but skip time/session stats.
2. **M3 tier**: After sessions ship, enrich cards with session-derived data.

Design the `GalleryCardData` builder as a server-side function that gracefully handles missing session data with null/0 defaults. The UI should hide stat rows when their values are null rather than showing "0 days" or "0m".

**Warning signs:**
- Gallery card footers showing "0h" or "0 stitching days" for active projects
- Card layout collapsing because conditional sections have no data
- Large blocks of hardcoded placeholder data in the card builder

**Phase to address:**
Phase 5 (Gallery Cards) -- design the data builder with explicit "session data unavailable" awareness

---

### Pitfall 2: N+1 Query Explosion for Gallery Card Supply Counts

**What goes wrong:**
The current `getCharts()` query does `include: { project: true, designer: true, genres: true }` but does NOT include supply junction tables. Gallery cards need `threadColourCount`, `beadTypeCount`, and `specialtyItemCount` for every card. Naively fetching these per-card creates N+1 queries -- with 500+ charts, that is 1500+ additional queries against Neon (which has HTTP round-trip overhead per query).

**Why it happens:**
The existing query was built for the simple table list view which only needs chart name, designer, status, and size. Gallery cards need much richer data. Adding `include: { projectThreads: true, projectBeads: true, projectSpecialty: true }` to the main query would load full supply details for every chart, sending far more data than needed (the cards only need counts, not full supply objects).

**How to avoid:**
Use Prisma's `_count` feature for the gallery query:
```typescript
include: {
  project: {
    include: {
      _count: {
        select: {
          projectThreads: true,
          projectBeads: true,
          projectSpecialty: true,
        }
      },
      fabric: { select: { id: true } },  // just need existence check
    }
  },
  designer: true,
  genres: true,
}
```

This gives `project._count.projectThreads` etc. as integers in a single query. For kitting status (fulfilled vs needed), use a separate aggregation query that counts fulfilled items rather than loading all junction rows.

Create a dedicated `getChartsForGallery()` server action separate from the existing `getCharts()` -- do not bloat the existing action.

**Warning signs:**
- Charts page taking 3+ seconds to load after gallery cards are added
- Neon dashboard showing spike in query count per request
- Vercel function duration increasing noticeably

**Phase to address:**
Phase 5 (Gallery Cards) -- build the gallery query as a new, purpose-built server action

---

### Pitfall 3: Skein Calculator Formula Complexity Underestimation

**What goes wrong:**
The skein calculator seems simple ("divide stitch count by stitches-per-skein") but the formula has multiple interacting variables that, if hardcoded wrong, produce wildly inaccurate results. Variables include:
- **Fabric count**: 14ct gets ~1,800 stitches/skein; 18ct gets ~3,300; 11ct gets only ~1,500 (with 2 strands)
- **Strand count**: 1 strand doubles coverage; 3 strands cuts it by ~40%
- **Stitch type**: Cross stitches, backstitch, half stitches, and french knots all use different amounts of thread
- **Waste factor**: 15-25% for start/stop/carry inefficiency
- **Over-two stitching**: Linen/evenweave stitched over two threads effectively halves the fabric count for stitch sizing

Getting the formula wrong means the user buys too many or too few skeins -- both are frustrating.

**Why it happens:**
Developers unfamiliar with cross-stitch treat it as a simple division. But fabric count, strand count, and stitch type all interact multiplicatively. The `ProjectThread` table already has a `stitchCount` field (per-colour stitch count) and `quantityRequired` (skeins), but there is no stored fabric count, strand count, or stitch type to feed the formula.

**How to avoid:**
1. The calculator should be a **helper/suggestion tool**, not a hard constraint. Auto-calculate skeins as a suggestion; let the user override `quantityRequired` manually.
2. Store fabric count on the `Fabric` model (already exists as `count` field) and ensure the fabric selector wires it through.
3. Default strand count to 2 (industry standard for 14-18ct) with an override per thread colour or per project.
4. Use the well-established lookup table approach rather than a continuous formula:

| Fabric Count | Stitches per Skein (2 strands, 20% waste) |
|---|---|
| 11 | ~1,440 |
| 14 | ~1,800 |
| 16 | ~2,320 |
| 18 | ~2,640 |
| 22 | ~3,200 |
| 28 (over 2) | ~1,800 (same as 14ct) |

5. For backstitch colours, display a note: "Backstitch uses less thread than cross stitches -- calculator assumes cross stitches" rather than trying to build a multi-stitch-type formula in M2.

**Warning signs:**
- User entering stitch counts but seeing wildly wrong skein suggestions
- Calculator not accounting for the fabric already linked to the project
- No way to override the calculated value

**Phase to address:**
Phase with per-colour stitch counts feature -- the skein calculator is tightly coupled to this

---

### Pitfall 4: View Mode State Loss on Navigation

**What goes wrong:**
User selects "gallery" view mode, navigates to a chart detail page, presses back, and the view resets to the default (probably "table" since that is the current list format). This is extremely annoying with 500+ charts because the user loses their scroll position AND their preferred view.

**Why it happens:**
If view mode is stored only in React state (`useState`), it is lost on navigation. If stored in URL search params without proper handling, the back button may not restore it correctly. If stored in localStorage, there is a flash-of-wrong-content on initial render (server renders default, client hydrates with localStorage value -- this is the exact bug noted in backlog item 999.5).

**How to avoid:**
Use URL search params as the source of truth for view mode: `/charts?view=gallery`. This naturally survives navigation and back-button. Use `nuqs` (type-safe URL state management for Next.js App Router) to manage this cleanly, since it handles:
- Server-side access via `createSearchParamsCache`
- Client-side updates without full page reloads
- Type safety with built-in parsers

The charts page.tsx is a Server Component that can read searchParams directly and pass the initial view mode to the client component. No localStorage needed, no hydration flash.

For scroll position preservation: Next.js App Router does NOT restore scroll position by default on back navigation when the page re-renders from a Server Component. Consider using `router.push` with shallow routing or caching the charts page data more aggressively.

**Warning signs:**
- View mode resetting after every chart detail visit
- Flash of table view before gallery view appears
- Scroll jumping to top on back navigation

**Phase to address:**
Phase 5 (Gallery/View Modes) -- implement URL-based view mode from the start

---

### Pitfall 5: DMC Catalog Completion Without Data Validation

**What goes wrong:**
The current fixture has 459 threads starting at DMC 150. Adding DMC 1-149 (plus Blanc, Ecru, and any other gaps) requires sourcing accurate hex colors, color names, and color family assignments for ~150+ additional threads. If this data is sourced from unreliable internet lists, colours will be wrong, which makes the colour swatches misleading.

DMC has discontinued and reintroduced colours over the years. Some colour codes (e.g., DMC 1-35) are newer additions. Using an outdated list could include discontinued colours or miss current ones.

**Why it happens:**
It seems like a simple data entry task. But DMC colour data is not open-source -- it is proprietary. Online lists vary in accuracy. Hex values are approximations that differ between sources.

**How to avoid:**
1. Source from multiple cross-stitch community databases and cross-reference. Thread-bare.com, Lord Libidan, and Stitchmate all maintain DMC databases.
2. Validate hex values against at least two sources.
3. Keep the seed as a JSON fixture (current pattern) and add a `source` or `verified` comment.
4. Run the seed as an idempotent upsert (current pattern with `upsert` is correct).
5. Test that no duplicate `brandId_colorCode` entries exist after seeding.
6. Include DMC "Blanc" and "Ecru" (already in fixture as non-numeric codes -- good) plus any colour families for the new threads.

**Warning signs:**
- Colour swatches that look obviously wrong (bright pink listed as "brown family")
- Duplicate thread entries after re-seeding
- Users seeing unfamiliar thread codes that do not match their physical skeins

**Phase to address:**
Phase with DMC catalog completion -- should be early in M2 since other features depend on a complete catalog

---

### Pitfall 6: Storage Location Migration Breaking Existing Data

**What goes wrong:**
Project Bin is currently a free-text `String?` field on `Project`. The backlog calls for "proper CRUD" to replace the "hardcoded arrays." If this is migrated to a `StorageLocation` model with a foreign key, all existing `projectBin` string values ("Bin A", "Bin B", etc.) become orphaned. The migration must create StorageLocation records for each unique existing value AND update the foreign key -- a two-step data migration that is easy to get wrong.

**Why it happens:**
The easy path is to create the new model and add a `storageLocationId` FK to Project, then deal with data migration "later." But if the old `projectBin` column is dropped or ignored, existing project data loses its storage info.

**How to avoid:**
1. Create the `StorageLocation` model with `id`, `name`, `sortOrder`, `createdAt`, `updatedAt`.
2. Write a Prisma migration that:
   a. Creates the table
   b. Seeds it from `SELECT DISTINCT projectBin FROM Project WHERE projectBin IS NOT NULL`
   c. Adds `storageLocationId` FK to Project (nullable initially)
   d. Updates Project rows to point to the matching StorageLocation
3. Keep `projectBin` column temporarily until migration is verified.
4. Only drop `projectBin` in a follow-up migration after confirming no data loss.
5. Apply the same pattern for iPad App if it gets CRUD treatment.

**Warning signs:**
- `projectBin` values showing as null after migration
- Duplicate storage locations (e.g., "Bin A" and "Bin A " with trailing space)
- Chart form broken because FK references a table that has no data yet

**Phase to address:**
Phase with storage location management -- must be done before gallery cards since cards may display storage location

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fetching all 500+ charts without pagination | Simple implementation, good for gallery browsing | Memory pressure on client, slow initial paint as dataset grows to 1000+ | Acceptable for M2 at 500 charts; add virtual scrolling or pagination if it exceeds 800 |
| Hardcoding skein formula constants | Quick to build | Hard to update when user discovers better values for their stitching style | Acceptable if constants are in a single config file, not scattered across components |
| Storing view mode in localStorage instead of URL | No server-side changes needed | Hydration flash (bug 999.5), not shareable, lost on device switch | Never -- use URL params from the start |
| Calculating kitting status client-side from supply counts | Avoids new DB column | Recalculated on every render; logic duplicated between card builder and detail page | Acceptable if the calculation function is shared (`lib/utils/kitting-status.ts`) |
| Adding `strandCount` and `stitchType` to ProjectThread later | Ship skein calculator faster with defaults | Incomplete data means recalculating when fields are added; user has to re-enter data | Acceptable for M2 -- default 2 strands, cross stitch. Add fields in a later milestone if user requests. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Neon (free tier) | Fetching all charts + all supply counts in separate queries (N+1) causes cold-start latency spike of 3-5s | Use Prisma `_count` in includes for a single query; consider `Promise.all` for independent queries |
| Cloudflare R2 presigned URLs | Generating presigned URLs for 500+ cover images in gallery view (one per chart) | Current pattern fetches all keys at once via `getPresignedImageUrls` -- this is correct but must include thumbnail keys. For gallery cards, always prefer `coverThumbnailUrl` over `coverImageUrl` to reduce bandwidth. |
| Vercel serverless function | Gallery page with 500 charts + presigned URLs + supply counts may exceed 10s timeout on cold start | Move heavy data assembly to a single well-structured query; use Suspense boundaries to stream cards progressively |
| URL search params (nuqs) | Wrapping NuqsAdapter in a Client Component that contains the entire page tree, forcing everything client-side | NuqsAdapter goes in root layout (already a client boundary concern); use `createSearchParamsCache` for server-side access |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading full-resolution cover images in gallery grid | Gallery loads slowly, high bandwidth on mobile | Always use `coverThumbnailUrl` in gallery/list views; thumbnails already exist from the Phase 4 auto-generation feature | Noticeable at 50+ charts with images; critical at 200+ |
| Re-rendering all 500 card components on filter/sort change | UI jank, dropped frames when toggling view mode | Memoize `GalleryCard` with `React.memo`; use `useMemo` for sorted/filtered card arrays; avoid passing new object references as props on each render | Noticeable at 100+ cards; painful at 300+ |
| Fetching supply counts separately per chart for kitting dots | Quadratic query time (500 charts x 3 supply types) | Batch via Prisma `_count` in the main gallery query include | Breaks immediately at 100+ charts on Neon free tier |
| Client-side sorting of 500+ cards with complex comparators | Sort feels sluggish; table header click has perceptible delay | Keep sort logic simple (numeric/string compare); avoid computing derived values inside the sort comparator -- pre-compute sort keys | Noticeable at 500+ with complex multi-field sorts |
| Inline image loading in table/list views | Table rows jump as images load; layout shift | Use fixed-size containers (`aspect-[4/3]` in gallery, fixed `h-10 w-10` in list); use `loading="lazy"` on images outside viewport | Immediately visible with mixed image/no-image charts |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storage location CRUD without auth guard | Any unauthenticated request could modify storage locations | Every new server action must call `requireAuth()` first -- existing pattern is solid, just follow it |
| Exposing full R2 keys in gallery card data sent to client | R2 object keys could reveal internal storage structure | Current pattern resolves keys to presigned URLs server-side -- maintain this. Never send raw R2 keys to the client. |
| Skein calculator accepting negative stitch counts | Could produce negative skein values or division errors | Validate stitch count as `z.number().int().min(0)` in the Zod schema; clamp calculator output to minimum 0 |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Gallery cards all looking identical without cover images | 500 charts with no photos = a wall of identical gradient placeholders; user cannot visually scan | Show chart name prominently in the placeholder area; vary placeholder gradient by status (already in DesignOS design); encourage cover photo uploads via an "add photo" affordance on cards |
| View mode toggle without remembering sort preference | User sorts by designer in table view, switches to gallery, switches back -- sort resets | Persist sort field and direction in URL params alongside view mode (`?view=table&sort=designer&dir=asc`) |
| Per-colour stitch count entry as a separate workflow from supply linking | User adds 30 threads, then has to go back and enter stitch counts for each one separately | Allow stitch count entry inline during the supply addition flow (the `SearchToAdd` component already adds supplies; extend it to accept an optional stitch count field) |
| Skein calculator showing fractional skeins without rounding guidance | "You need 1.3 skeins" -- user does not know if they should buy 1 or 2 | Always round up to nearest whole skein for the "buy" recommendation; show the precise value as supplementary info |
| Fabric selector showing all fabrics including ones linked to other projects | User sees fabrics they have already assigned elsewhere, gets confused | Filter the fabric dropdown to show only unassigned fabrics (where `linkedProjectId IS NULL`) plus the currently linked fabric (if editing) |
| Thread picker losing scroll position when adding items (backlog 999.0.13) | After adding a thread colour, the list scrolls back to top; user loses their place in a long DMC catalog | Call `scrollIntoView` on the search input after each add; or anchor scroll position before the add and restore after |

## "Looks Done But Isn't" Checklist

- [ ] **Gallery Cards:** Status-specific footer rendering tested for ALL 7 statuses -- not just the 3 status groups. Edge cases: Kitted status needs distinct treatment from Unstarted/Kitting; On Hold needs distinct treatment from In Progress.
- [ ] **View Mode Toggle:** URL params update on toggle AND persist through navigation. Test: switch to gallery, click a chart, press back -- should still be gallery view.
- [ ] **Skein Calculator:** Handles edge cases: 0 stitch count (no division by zero), no fabric linked (cannot determine fabric count -- show "link fabric first"), fabric count of 0 (defensive guard).
- [ ] **Storage Location CRUD:** Migration tested with existing data. Verify all current `projectBin` values are preserved. Test: create chart with "Bin A", run migration, confirm chart still shows "Bin A".
- [ ] **Fabric Selector:** Shows "no unassigned fabrics" empty state. Does not accidentally unlink a fabric from another project when assigning. Test: assign fabric to project A, open project B's form -- fabric should not appear.
- [ ] **DMC Catalog:** All 500+ threads load in the search-to-add component without performance degradation. Test: type "1" in search -- should show DMC 1, 10, 100, etc. without lag.
- [ ] **Cover Image Aspect Ratio:** Fix works for all aspect ratios: landscape (wide), portrait (tall), square. Test with actual cross-stitch chart photos which are often very tall/narrow.
- [ ] **Supply Entry Order:** Insertion order maintained during entry session. Test: add DMC 321, 310, 3801 in that order -- should display in that order, not alphabetically sorted, during the entry session.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Gallery query N+1 causing timeouts | LOW | Replace per-card queries with `_count` include; single server action change, no schema change |
| Skein formula producing wrong values | LOW | Update constants in config file; no data migration needed since `quantityRequired` is manually overridable |
| Storage location migration losing data | MEDIUM | If `projectBin` column was kept, query old values and re-run migration fix. If dropped, requires DB restore from backup. |
| View mode state loss | LOW | Add URL param support; purely UI change, no data impact |
| DMC catalog with wrong hex values | MEDIUM | Re-seed with corrected fixture file; upsert pattern means existing links are preserved, only colours change |
| Gallery cards showing broken layout for missing session data | LOW | Add null checks and conditional rendering; hide sections with no data rather than showing zeros |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Gallery card data shape mismatch | Phase 5 (Gallery Cards) | Card builder has explicit null handling for session data; no "0 days" displayed for projects without sessions |
| N+1 query explosion | Phase 5 (Gallery Cards) | Single `getChartsForGallery()` action with `_count` includes; page loads in <2s with 500 charts |
| Skein calculator formula errors | Per-colour stitch counts phase | Calculator tested against known values (e.g., 14ct, 2 strands, 1800 stitches = 1 skein); manual override works |
| View mode state loss | Phase 5 (View Modes) | URL contains `?view=gallery` after toggle; survives navigation and back button |
| DMC catalog data quality | DMC completion phase (early in M2) | Fixture file has 500+ entries; verified against two external sources; no duplicate colorCodes |
| Storage location migration | Storage location phase | All existing `projectBin` values accessible via new `StorageLocation` records; old column preserved until verified |
| Cover image aspect ratio | Cover image fix phase (can be early quick fix) | `object-contain` or `aspect-ratio` approach tested with landscape, portrait, and square images |
| Thread picker scroll UX | Supply entry phase | `scrollIntoView` fires after each add; user's place is maintained |
| Fabric selector showing assigned fabrics | Fabric selector phase | Dropdown query filters by `linkedProjectId IS NULL OR linkedProjectId = currentProjectId` |

## Sources

- Existing codebase analysis: `prisma/schema.prisma`, `src/lib/actions/chart-actions.ts`, `src/components/features/charts/project-supplies-tab.tsx`, `product-plan/sections/gallery-cards-and-advanced-filtering/`
- [Thread-Bare Skein Estimator](https://www.thread-bare.com/tools/cross-stitch-skein-estimator) -- skein calculation reference
- [The Fresh Cross Stitch Thread Calculator](https://thefreshcrossstitch.com/blogs/tips-and-resources/thread-calculator-how-much-thread-do-i-need) -- stitches-per-skein by fabric count data
- [Lord Libidan Skein Calculator](https://lordlibidan.com/calculate-the-number-of-required-skeins/) -- calculation methodology
- [nuqs - Type-safe URL state for React](https://nuqs.dev/) -- URL state management for view modes
- [Next.js useSearchParams docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) -- Suspense boundary requirements
- DMC fixture analysis: 459 threads starting at DMC 150, missing 1-149 range (confirmed via `prisma/fixtures/dmc-threads.json`)
- DesignOS gallery card types: `product-plan/sections/gallery-cards-and-advanced-filtering/types.ts` -- identifies all data requirements

---
*Pitfalls research for: M2 Browse & Organize milestone*
*Researched: 2026-04-11*
