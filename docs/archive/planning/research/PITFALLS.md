# Domain Pitfalls: Series & Collection Management

**Domain:** Adding series/collection entity to existing cross-stitch tracker
**Researched:** 2026-05-24
**Codebase version:** v1.7 (2,283 tests, ~110k LOC, ~20 entities)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Chart form seriesId breaks draft persistence

**What goes wrong:** Adding `seriesId` to `ChartFormValues` (currently 24 fields) without updating draft persistence causes stale drafts to silently lose the field, or worse, crash on load when the shape doesn't match.

**Why it happens:** Draft persistence in `use-draft-persistence.ts` uses a V2 format with `ChartFormValues` serialized to localStorage. The `loadDraft()` function merges saved values with defaults and nulls out stale reference IDs (`validDesignerIds`, `validStorageIds`, etc.). A new `seriesId` field needs the same stale-ID-nulling treatment, and the list of valid series IDs must be passed from the server component.

**Consequences:** User saves a draft with series selected, series gets deleted before they return, draft loads with an orphaned seriesId that doesn't match any option in SearchableSelect. The selector shows the ID as selected but with no label, or the form submits with a dangling FK.

**Prevention:**
1. Add `seriesId: string | null` to `ChartFormValues` with `default(null)` so existing drafts merge cleanly
2. Add `validSeriesIds: string[]` parameter to `loadDraft()` / `loadDraftV2()` and null out stale series references
3. Pass series list from the server page components (`charts/new/page.tsx` and `charts/[id]/edit/page.tsx`) where designers/genres are already fetched

**Detection:** Test with a saved draft that references a deleted series. If it loads without error but the SearchableSelect shows blank/broken, the stale-ID check is missing.

**Phase impact:** Must be addressed in the chart form integration phase, not as an afterthought.

---

### Pitfall 2: Pattern Dive tab addition breaks eager data loading

**What goes wrong:** Adding a 5th tab (Series) to Pattern Dive means the `charts/page.tsx` server component must fetch series data alongside the existing 4 datasets. The current `Promise.all` fetches all 4 tab datasets eagerly. Adding a 5th query increases cold-start latency on a page that's already doing 4 parallel queries + a presigned URL batch.

**Why it happens:** The current architecture in `charts/page.tsx`:
```typescript
const [charts, whatsNextProjects, fabricRequirements, storageGroups] = await Promise.all([
  getChartsForGallery(),
  getWhatsNextProjects(),
  getFabricRequirements(),
  getStorageGroups(),
]);
```
All tabs are rendered server-side and passed as `browseContent`, `whatsNextContent`, etc. to `PatternDiveTabs`. Adding series data requires another query in this batch AND another content prop to the tab component.

**Consequences:** If the series query is slow or fails, it blocks the entire page. The `PatternDiveTabs` component interface grows from 4 content props to 5. The `imageKeys` collection at lines 25-30 must also include series member thumbnails. With 500+ charts and 30+ series, the presigned URL batch grows.

**Prevention:**
1. Add series query to the existing `Promise.all` -- this is the established pattern, and one additional query is acceptable
2. Add `seriesContent` prop to `PatternDiveTabs` following the existing prop pattern
3. Update `PATTERN_DIVE_TABS` const array and `TAB_CONFIG` in `pattern-dive-tabs.tsx` -- both are exhaustive (note the `contentMap` object must be extended)
4. Include series member thumbnail URLs in the `imageKeys` collection
5. Verify the presigned URL batch doesn't get unreasonably large (currently covers all 4 tabs' images in one call)

**Detection:** If Pattern Dive load time increases noticeably (>200ms), profile the series query independently.

---

### Pitfall 3: Gallery filter state explosion from adding series dimension

**What goes wrong:** Adding a "Series" filter to the Browse tab requires touching 6+ tightly coupled files that form the gallery filter pipeline, and missing any one of them creates a silent filter that doesn't work.

**Why it happens:** The gallery filter system spans:
1. `gallery-types.ts` -- `GalleryCardData` interface (needs `seriesId: string | null` and `seriesName: string | null`)
2. `gallery-utils.ts` -- `transformToGalleryCard()` function (needs series data from query)
3. `gallery-utils.ts` -- `filterAndSort()` function (needs series filter logic)
4. `use-gallery-filters.ts` -- new `seriesFilter` URL state via nuqs
5. `filter-bar.tsx` -- new `MultiSelectDropdown` for series
6. `filter-chips.tsx` -- series chips with remove handler
7. `project-gallery.tsx` -- wire new filter state through
8. `chart-actions.ts` -- `getChartsForGallery()` must include series in query

**Consequences:** The `GalleryChartData` type in `types/chart.ts` doesn't currently include series. Adding it requires changing the Prisma query in `getChartsForGallery()` to include series data. But the Chart model doesn't have a seriesId yet (that's the schema migration). If you build the UI before the schema, the types won't match. If you add the schema first, existing tests break.

**Prevention:**
1. Schema migration (add `seriesId` to Chart, create Series model) MUST come before gallery filter work
2. Add `seriesName` to `GalleryCardData` interface -- it's a flat string like `designerName`, not a relation
3. Add series to `getChartsForGallery()` include -- `series: { select: { id: true, name: true } }` parallel to existing `designer: true`
4. Follow the exact same pattern as the existing Status and Size filters for the URL state: `parseAsArrayOf(parseAsString, ",")` with `toggleSeries` callback
5. Update `clearFilters` to also clear series filter
6. Update `hasActiveFilters` check to include series

**Detection:** After adding the filter, test: (1) filtering by series shows only charts in that series, (2) the filter chip appears and can be removed, (3) clearing all filters clears series too, (4) the URL contains `?series=SeriesName` when active.

---

### Pitfall 4: seriesId on Chart vs. Series-to-Chart many-to-many relationship decision

**What goes wrong:** Choosing the wrong cardinality for Chart-to-Series causes either a premature data model constraint (1:many) or unnecessary complexity (many:many).

**Why it happens:** The DesignOS types show `Series` with `memberCount`/`finishedCount` and `SeriesMember` linking chartId to series. The PROJECT.md requirements say "series membership" (singular). But the domain reality is: a chart could theoretically belong to multiple series (e.g., "Mini Bottles" AND "Celtic Collection"), though this is rare.

**Consequences:**
- **1:many (seriesId FK on Chart):** Simpler schema, simpler queries, simpler form (SearchableSelect, not multi-select). But if a chart legitimately belongs to two series, the user is stuck.
- **Many:many (junction table):** More complex schema, query includes become nested, form needs a multi-select instead of SearchableSelect, progress tracking becomes complex.

**Prevention:** Use 1:many (`seriesId` nullable FK on Chart). Rationale:
1. The DesignOS design shows a single SearchableSelect for series assignment, not a multi-picker
2. The user's domain description says "a collection of independent but related patterns" -- charts belong to ONE series
3. The existing pattern for designer (1:many FK on Chart) is the established codebase convention
4. If many:many is ever needed, migrating from FK to junction table is straightforward -- the reverse is painful
5. Keep `seriesId` nullable since most charts won't belong to a series

**Detection:** Ask the user: "Can a chart belong to multiple series?" If "no" (expected), 1:many is correct.

---

### Pitfall 5: Zod schema and chart-actions transaction miss seriesId

**What goes wrong:** Adding `seriesId` to the Prisma schema but forgetting to thread it through the Zod validation schema (`chartFormSchema`) and both `createChartAndProject()` / `updateChart()` actions means the field is silently dropped on save.

**Why it happens:** The save pipeline has 4 layers that must all handle seriesId:
1. `chartFormSchema` in `lib/validations/chart.ts` -- Zod schema for form validation
2. `createChartAndProject()` helper in `chart-actions.ts` -- the shared creation function used by both `createChart()` and `createChartWithSupplies()`
3. `updateChart()` in `chart-actions.ts` -- the edit save path (separate from create)
4. `ChartFormValues` interface in `use-chart-form.ts` -- the client-side form state type

Currently, `createChartAndProject()` explicitly lists every field in the `tx.chart.create({ data: { ... } })` call (lines 37-65). It does NOT use a spread -- each field is explicitly mapped. This means adding `seriesId` to Prisma without adding it to the create data object means it's silently ignored.

**Consequences:** User selects a series in the form, saves, and the series assignment is lost. No error thrown -- the field is simply not in the Prisma create/update data object.

**Prevention:**
1. Add `seriesId: z.string().nullable().default(null)` to the `chart` object in `chartFormSchema`
2. Add `seriesId: chart.seriesId` to the `tx.chart.create({ data: { ... } })` in `createChartAndProject()`
3. Add `seriesId: chart.seriesId` to the `tx.chart.update({ data: { ... } })` in `updateChart()`
4. Add `seriesId: string | null` to `ChartFormValues`
5. Write a test that creates a chart with seriesId and verifies it persists

**Detection:** Integration test: create chart with series -> fetch chart -> assert seriesId matches.

---

## Moderate Pitfalls

### Pitfall 6: Series progress calculation for open-ended vs. fixed collections

**What goes wrong:** Series with a known total (e.g., "7 Mini Bottles") calculate progress differently from open-ended series (e.g., "Nora Corbett Fairies" where the designer keeps releasing new ones). Treating them identically produces misleading percentages.

**Why it happens:** The DesignOS shows "3 of 7 finished (43%)" but the PROJECT.md says "optional total count." If totalCount is null, what does the progress bar show? If it's based on finished/memberCount, an open-ended series with 3 of 3 owned shows 100% -- but there are 20 more patterns the user doesn't own yet.

**Prevention:**
- Series model needs `totalCount: Int?` (nullable)
- When `totalCount` is set: progress = `finishedCount / totalCount`, display "X of Y finished (Z%)"
- When `totalCount` is null: display "X charts (Y finished)" without a percentage or progress bar
- The progress bar should only appear when `totalCount` is set
- The DesignOS design shows "X of Y finished" -- adapt to "X charts (Y finished)" when no total

**Detection:** Create an open-ended series with 3 charts, 2 finished. If the UI shows "67%" that's misleading -- it should show "3 charts, 2 finished" or similar.

---

### Pitfall 7: Cache invalidation gaps when series assignments change

**What goes wrong:** The stats dashboard, Pattern Dive, and gallery all cache data. Changing a chart's series assignment must invalidate all affected caches, but the current `revalidatePath` calls in `updateChart()` don't know about a `/series` page or the Pattern Dive series tab.

**Why it happens:** The existing cache invalidation in `updateChart()` (lines 348-350):
```typescript
revalidatePath("/charts");
revalidatePath(`/charts/${chartId}`);
revalidatePath("/fabric");
```
This doesn't include `/series` or `/series/[id]`. Pattern Dive is at `/charts` so it gets revalidated, but if series data is fetched separately or cached with tags, it could go stale.

**Prevention:**
1. Add `revalidatePath("/series")` to `createChart()`, `updateChart()`, and `deleteChart()`
2. Add `revalidatePath(\`/series/${seriesId}\`)` when a chart's series assignment changes in `updateChart()`
3. If the series management page has its own detail pages, add those paths too
4. Consider whether stats cache needs `revalidateTag("stats")` when series changes (probably not in v1.8, but note for future stats-by-series)

---

### Pitfall 8: Series deletion orphans seriesId on charts

**What goes wrong:** Deleting a series without clearing `seriesId` on associated charts leaves dangling foreign keys that crash the gallery filter and chart form.

**Why it happens:** The designer deletion pattern in `designer-actions.ts` (lines 76-81) explicitly nulls out `designerId` on charts before deleting the designer in a `$transaction`:
```typescript
await prisma.$transaction([
  prisma.chart.updateMany({
    where: { designerId: id },
    data: { designerId: null },
  }),
  prisma.designer.delete({ where: { id } }),
]);
```
Series deletion MUST follow this exact pattern. If you rely on Prisma's `onDelete: SetNull` instead, it works at the DB level but you miss the `revalidatePath` calls and tests won't verify the behavior.

**Prevention:**
1. Follow the designer deletion pattern exactly: `$transaction` with `updateMany` + `delete`
2. Include revalidation for affected paths inside the action
3. Test: delete series -> verify charts previously in that series have `seriesId: null` -> verify gallery filter doesn't show the deleted series

---

### Pitfall 9: PatternDiveTabs exhaustive type check breaks on new tab

**What goes wrong:** The `PatternDiveTabs` component uses a typed literal union `PATTERN_DIVE_TABS` and an explicit `contentMap` object. Adding "series" to the union without updating all references causes TypeScript errors -- but the nuqs URL state migration is the subtle part.

**Why it happens:** Four linked type-level structures must be updated together:
1. `PATTERN_DIVE_TABS = ["browse", "whats-next", "fabric", "storage"] as const` -- add `"series"`
2. `TAB_CONFIG` array -- add `{ value: "series", label: "Series", icon: Library }`
3. `PatternDiveTabsProps` interface -- add `seriesContent: React.ReactNode`
4. `contentMap` object inside the component -- add `series: seriesContent`

The nuqs `parseAsStringLiteral` on the tab state will also need the new value in its array.

**Prevention:** TypeScript will catch most of this automatically because:
- The `contentMap` type is `Record<PatternDiveTab, React.ReactNode>` -- adding to the union without adding the key is a compile error
- The `TAB_CONFIG` has `as const` so missing entries are visually obvious

But: decide on tab ordering. The DesignOS design suggests Series is a browsing-oriented tab. Place it after Browse (position 2) or after Storage View (position 5). Position 5 (last) is safest since it doesn't shift existing tab indices for bookmarked URLs.

**Detection:** Build check (`npm run build`) will catch type errors. Manual test: navigate to Pattern Dive and verify all 5 tabs render.

---

### Pitfall 10: Series SearchableSelect placement in chart form

**What goes wrong:** The chart form already has ~50 fields in scrolling sections. Adding a series selector in the wrong location creates visual clutter and breaks the logical grouping of fields.

**Why it happens:** The form layout has logical sections (name/designer at top, stitch counts, genres, pattern type, project settings, files, notes). Series is logically related to designer (metadata about the chart) but could also be seen as project-level data. Placing it wrong confuses users.

**Prevention:**
- Place series selector directly below the designer field (same metadata section)
- Use the same `SearchableSelect` component pattern with `onAddNew` for inline series creation
- Do NOT add it to the project settings section (series is a chart property, not a project property -- it's in the `chart` Zod schema, not `project`)
- The InlineNameDialog reusable component already exists for quick-add -- reuse it for inline series creation (exactly like storage locations and stitching apps use it)

**Detection:** Load the chart form -- series selector should be visually grouped with designer, not buried below pattern type checkboxes.

---

### Pitfall 11: Series management page inconsistent with designer/genre patterns

**What goes wrong:** Building the series management page without following the established designer/genre page patterns creates inconsistent navigation and CRUD UX.

**Why it happens:** Designers and genres both have:
- List page at `/designers` and `/genres`
- Detail page at `/designers/[id]` and `/genres/[id]`
- Sidebar navigation under "Reference" section
- `InlineNameEdit` + `DeleteConfirmationDialog` reusable patterns
- `getDesignersWithStats()` / `getGenresWithStats()` for list queries
- Dedicated types in `types/designer.ts` / `types/genre.ts`
- Full test coverage of CRUD actions

Series pages must follow this exact structure or the app feels inconsistent.

**Prevention:**
1. Add `/series` and `/series/[id]` routes under `app/(dashboard)/series/`
2. Add "Series" to `navigationSections` in `nav-items.ts` under "Reference" section (with `Library` icon from lucide)
3. Create `types/series.ts` with `SeriesWithStats` and `SeriesDetail` types (parallel to genre types)
4. Create `series-actions.ts` following `designer-actions.ts` structure exactly
5. Create components in `components/features/series/` following the genre component structure
6. Use `InlineNameEdit` for rename, `DeleteConfirmationDialog` for deletion with chart-count warning
7. Series has extra fields vs. designer/genre: `totalCount` (optional int) and `designerId` (optional FK). The detail page is more complex (shows member charts with progress), but the list page follows the same card layout as the DesignOS mock.

---

## Minor Pitfalls

### Pitfall 12: getChartsForGallery query performance with series join

**What goes wrong:** Adding `series: { select: { name: true } }` to the already-complex `getChartsForGallery` query adds another join. With 500+ charts, this could increase query time.

**Prevention:** The join is simple (nullable FK lookup), and Prisma/PostgreSQL handles this efficiently. The existing query already joins designer, genres (many-to-many), project (with 3 supply sub-queries), and file count. One more nullable FK join is negligible. However, add a database index on `Chart.seriesId` in the schema:
```prisma
@@index([seriesId])
```

---

### Pitfall 13: Series detail "Add Chart" modal excludes already-assigned charts

**What goes wrong:** The DesignOS SeriesDetail component shows an "Add Chart" modal that searches charts. If it shows charts already in the series, users get confused when selecting one that's already a member.

**Prevention:**
- The "Add Chart" modal query should filter by `seriesId: null` (charts not in any series) OR allow reassignment with confirmation
- Since the data model is 1:many, adding a chart to this series implicitly removes it from any other series -- surface this to the user
- Consider showing "Currently in: [Other Series]" next to charts that are already assigned elsewhere
- The SearchableSelect in the chart form handles the normal case; the series detail "Add Chart" is for bulk management

---

### Pitfall 14: Stats dashboard series breakdown deferred

**What goes wrong:** Adding series to the system creates an expectation that stats will show series-level insights (like designer/genre breakdowns). If the stats page doesn't acknowledge series at all, it feels incomplete.

**Prevention:** For v1.8, do NOT add series to the stats dashboard. The existing stats queries (`designer-breakdown.ts`, `genre-breakdown.ts`) are complex cached computations. Adding series breakdown is a separate milestone concern. But DO add `revalidateTag("stats")` to series mutations so that when stats-by-series is eventually added, the cache invalidation is already wired.

---

### Pitfall 15: Series totalCount validation edge cases

**What goes wrong:** A series with `totalCount: 5` but 7 assigned charts has confusing semantics. Is the totalCount wrong, or does the user own extras?

**Prevention:**
- `totalCount` represents the total number of charts in the series that exist (published by designer), not the number the user owns
- Allow `memberCount > totalCount` -- the user might have more charts assigned than the series officially has (data entry flexibility)
- Display: "7 of 5" looks wrong. Consider capping the progress bar at 100% while showing the real count, or showing "7 charts (series has 5 total)"
- Validation: `totalCount` must be a positive integer when provided. Don't enforce `memberCount <= totalCount` at the database level.

---

### Pitfall 16: Series optional designer link

**What goes wrong:** Some series are by a single designer (e.g., "Mini Bottles by Nora Corbett"), others span multiple designers (e.g., "Seasonal Samplers" collected across designers). Adding `designerId` to Series without clear semantics confuses users.

**Prevention:**
- Make `designerId` optional on Series (nullable FK, same pattern as Chart.designerId)
- When set, display as "Series by [Designer]" with link to designer detail
- When null, display just the series name
- Do NOT auto-set from member charts (series with mixed designers should have null designerId)
- The chart form already has a designer selector that's separate from series -- keep them independent

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Schema migration (Series model + Chart.seriesId) | FK constraint prevents deletion without nulling references | Follow designer deletion pattern: `$transaction([updateMany, delete])` |
| Series CRUD actions | Missing `revalidatePath` for downstream pages | Check all paths: `/charts`, `/charts/[id]`, `/series`, `/series/[id]` |
| Chart form integration | SeriesId missing from Zod schema, create/update actions, draft persistence | Thread through all 4 layers: Zod -> actions -> form values -> draft |
| Gallery series filter | Missing from `clearFilters` or `hasActiveFilters` | Add to both, plus FilterChips component |
| Pattern Dive Series tab | Series query added to Promise.all but presigned URLs not updated | Include series member thumbnails in imageKeys collection |
| Series management pages | Inconsistent with designer/genre page patterns | Mirror designer-actions.ts structure, use same reusable components |
| Chart form new/edit page data loading | Series list not fetched in server component | Add `getSeries()` to the Promise.all in both `new/page.tsx` and `[id]/edit/page.tsx` |
| InlineSeriesDialog | Building from scratch instead of reusing InlineNameDialog | InlineNameDialog already handles name-only creation -- reuse it |
| Series detail page chart list | Not showing presigned image URLs for thumbnails | Use `getPresignedImageUrls()` for member chart thumbnails |
| Existing tests | chart-actions tests don't include seriesId in mock data | Update test fixtures to include `seriesId: null` default |

---

## Integration Checklist

Condensed "did you touch everything" checklist for adding seriesId to the existing codebase:

### Schema Layer
- [ ] `Series` model in `schema.prisma` (id, name, totalCount?, designerId?, userId, timestamps)
- [ ] `seriesId` FK on `Chart` model (nullable, with `@@index([seriesId])`)
- [ ] `onDelete: SetNull` on the Chart->Series relation (or handle explicitly in action code)
- [ ] `prisma db push` + `prisma generate` on both dev and production Neon branches

### Validation Layer
- [ ] `seriesId: z.string().nullable().default(null)` in `chartFormSchema.chart`
- [ ] Series create/update schemas (name required, totalCount optional positive int, designerId optional)

### Action Layer
- [ ] `series-actions.ts`: CRUD (create, update, delete, get, getSeriesWithStats, getSeriesDetail)
- [ ] `chart-actions.ts`: `createChartAndProject()` includes `seriesId` in data object
- [ ] `chart-actions.ts`: `updateChart()` includes `seriesId` in update data object
- [ ] `chart-actions.ts`: `getChartsForGallery()` includes `series: { select: { id: true, name: true } }`
- [ ] `chart-actions.ts`: `getChart()` includes series in query
- [ ] `pattern-dive-actions.ts`: new `getSeriesWithProgress()` query for Pattern Dive tab

### Type Layer
- [ ] `types/series.ts`: SeriesWithStats, SeriesDetail, SeriesMember types
- [ ] `types/chart.ts`: GalleryChartData updated to include optional series
- [ ] `gallery-types.ts`: GalleryCardData includes `seriesId: string | null` and `seriesName: string | null`

### Component Layer
- [ ] Chart form: SearchableSelect for series + InlineNameDialog for inline create
- [ ] Gallery: FilterBar, FilterChips, use-gallery-filters, gallery-utils all updated for series
- [ ] Pattern Dive: PatternDiveTabs extended with 5th tab
- [ ] Series management: list page, detail page, form/dialog components

### Page Layer
- [ ] `charts/new/page.tsx`: fetch series in Promise.all, pass to ChartMergedForm
- [ ] `charts/[id]/edit/page.tsx`: fetch series in Promise.all, pass to ChartMergedForm
- [ ] `charts/page.tsx`: fetch series progress in Promise.all, add series tab content
- [ ] `app/(dashboard)/series/page.tsx` and `[id]/page.tsx`: new routes

### Navigation
- [ ] `nav-items.ts`: add Series to Reference section with Library icon

### Cache Invalidation
- [ ] Series mutations revalidate `/series`, `/charts`, affected `/charts/[id]`
- [ ] Chart mutations that change seriesId revalidate `/series` and `/series/[id]`

### Draft Persistence
- [ ] `use-draft-persistence.ts`: handle `seriesId` in load/save, null stale IDs
- [ ] Chart form: pass `validSeriesIds` to draft loading

### Tests
- [ ] Series CRUD action tests (create, update, delete, get) following designer-actions.test.ts patterns
- [ ] Chart action tests updated with seriesId in test fixtures
- [ ] Gallery filter tests for series dimension
- [ ] Pattern Dive series tab rendering tests
- [ ] Draft persistence with seriesId stale-ID handling
- [ ] Series deletion cascading null-out test

---

## Sources

- Direct codebase analysis of:
  - `prisma/schema.prisma` (current schema, ~20 entities)
  - `src/lib/actions/chart-actions.ts` (create/update/delete/query patterns, 537 lines)
  - `src/lib/actions/designer-actions.ts` (CRUD pattern to follow for series)
  - `src/lib/validations/chart.ts` (Zod schema structure, chartFormSchema)
  - `src/components/features/charts/chart-merged-form.tsx` (form integration points, 24 fields)
  - `src/components/features/charts/pattern-dive-tabs.tsx` (tab architecture, nuqs state)
  - `src/components/features/gallery/` (filter pipeline: 8 tightly coupled files)
  - `src/components/features/charts/use-draft-persistence.ts` (V2 draft format, stale-ID handling)
  - `src/app/(dashboard)/charts/` (page-level data loading, Promise.all patterns)
  - `src/components/shell/nav-items.ts` (navigation structure, Reference section)
  - `product-plan/sections/fabric-series-and-reference-data/` (DesignOS specs: SeriesList, SeriesDetail)
  - `product-plan/sections/fabric-series-and-reference-data/series.png` (design screenshot)
  - `product-plan/sections/fabric-series-and-reference-data/types.ts` (Series/SeriesMember interfaces)
