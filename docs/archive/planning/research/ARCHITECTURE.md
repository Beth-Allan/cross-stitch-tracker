# Architecture Patterns: Series/Collection Integration

**Domain:** Cross-stitch chart series management added to existing tracker
**Researched:** 2026-05-24
**Confidence:** HIGH -- all patterns are established in the codebase; series follows identical conventions

## Recommended Architecture

Series integrates as a **peer entity to Designer and Genre** -- a named entity with a 1:many relationship to Chart, managed via the same CRUD page + detail page + chart form assignment pattern already used for designers/genres/storage/apps. No new architectural patterns are needed; this is pure reuse of established conventions.

### Data Model

```
Series
  id         String    @id @default(cuid())
  name       String    @unique
  totalCount Int?      // null = open-ended, number = fixed count (e.g. 15)
  designer   Designer? @relation(fields: [designerId], references: [id])
  designerId String?
  notes      String?
  charts     Chart[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

Chart (modified)
  + series    Series?  @relation(fields: [seriesId], references: [id])
  + seriesId  String?

Designer (modified)
  + series    Series[]
```

Key design decisions:

1. **`seriesId` on Chart, not on Project** -- a series is a collection of *designs*, not *work instances*. A chart belongs to "Mini Bottles" regardless of whether the user has started stitching it. Matches `designerId` placement on Chart.

2. **Optional `totalCount`** -- `null` means open-ended ("I keep discovering new ones"), a number means fixed-count ("12 of 12 Mini Bottles"). `memberCount` and `finishedCount` are computed at query time, consistent with the "calculated fields at query time, never stored" convention.

3. **Optional `designerId`** -- most series are by one designer (e.g. "Nora Corbett Fairies"), but cross-designer series exist. When set, the series detail page shows designer info. When null, it's inferred from the charts' designers or shown as "Multiple designers".

4. **`@unique` on name** -- consistent with Designer and Genre. Prevents accidental duplicates.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `Series` Prisma model | Data storage, FK relationships | Chart, Designer |
| `series-actions.ts` | Server actions: CRUD, queries | Prisma, auth-guard |
| `seriesSchema` (validation) | Zod validation at boundary | series-actions |
| `SeriesList` component | Management page: sortable card grid, search, CRUD modals | series-actions |
| `SeriesDetail` component | Detail page: header, progress bar, member chart list | series-actions |
| `SeriesFormModal` component | Create/edit series dialog | series-actions |
| `InlineSeriesDialog` | Inline create from chart form (name + optional totalCount) | series-actions, chart form |
| `SearchableSelect` (reused) | Series assignment in chart form | Chart form state |
| `SeriesTab` (Pattern Dive) | Series progress cards in Pattern Dive | series-actions, PatternDiveTabs |
| `MultiSelectDropdown` (reused) | Series filter on Browse tab | Gallery filters |
| `GalleryCardData` (extended) | Add `seriesName` field for display/filtering | Gallery pipeline |

### Data Flow

**Series CRUD (management page):**
```
/series page (Server Component)
  -> getSeriesWithStats() server action
  -> SeriesList (Client Component)
    -> SeriesFormModal (create/edit)
    -> DeleteConfirmationDialog (delete)
    -> All mutations call series-actions, revalidatePath
```

**Series assignment (chart form):**
```
Chart merged form receives series[] from page loader
  -> SearchableSelect with series options
  -> onAddNew triggers InlineSeriesDialog
    -> createSeries() server action
    -> Returns new series, auto-selects in form
  -> seriesId stored in form state
  -> Submitted with chart data via chartFormSchema
```

**Series progress (Pattern Dive):**
```
/charts page (Server Component)
  -> getSeriesWithProgress() in Promise.all alongside existing queries
  -> PatternDiveTabs receives seriesContent prop (new tab)
  -> SeriesTab renders progress cards
    -> Each card: name, progress bar, "X of Y finished" or "X charts"
    -> Click navigates to /series/[id] detail page
```

**Series filter (Browse tab):**
```
Gallery filters hook adds seriesFilter[] state (nuqs)
  -> filterAndSort adds series matching
  -> GalleryCardData includes seriesName/seriesId
  -> FilterBar renders MultiSelectDropdown for series
```

## Integration Points: New vs. Modified

### New Files (20-25 files)

| File | Pattern Source |
|------|---------------|
| `prisma/schema.prisma` (model Series + Chart.seriesId) | Designer model |
| `src/types/series.ts` | `src/types/designer.ts` |
| `src/lib/validations/series.ts` (or add to `chart.ts`) | `designerSchema` in `chart.ts` |
| `src/lib/actions/series-actions.ts` | `designer-actions.ts` |
| `src/app/(dashboard)/series/page.tsx` | `designers/page.tsx` |
| `src/app/(dashboard)/series/[id]/page.tsx` | `designers/[id]/page.tsx` |
| `src/app/(dashboard)/series/loading.tsx` | `designers/loading.tsx` |
| `src/components/features/series/series-list.tsx` | `designers/designer-list.tsx` |
| `src/components/features/series/series-detail.tsx` | `designers/designer-detail.tsx` |
| `src/components/features/series/series-form-modal.tsx` | `designers/designer-form-modal.tsx` |
| `src/components/features/charts/inline-series-dialog.tsx` | `inline-designer-dialog.tsx` (extended with totalCount) |
| `src/components/features/charts/series-tab.tsx` | Pattern Dive tab pattern |
| Test files for each of the above | Existing test patterns |

### Modified Files (10-15 files)

| File | Change | Reason |
|------|--------|--------|
| `prisma/schema.prisma` | Add Series model, seriesId to Chart, series[] to Designer | Data model |
| `src/types/chart.ts` | Add Series to ChartWithProject and GalleryChartData includes | Type flow |
| `src/lib/validations/chart.ts` | Add `seriesId` to chartFormSchema + `seriesSchema` | Validation |
| `src/lib/actions/chart-actions.ts` | Include series in getCharts/getChartsForGallery queries | Data fetching |
| `src/components/features/charts/use-chart-form.ts` | Add `seriesId` to ChartFormValues, wire series data | Form state |
| `src/components/features/charts/chart-merged-form.tsx` | Add series SearchableSelect + InlineSeriesDialog | Form UI |
| `src/components/features/charts/pattern-dive-tabs.tsx` | Add "Series" tab to PATTERN_DIVE_TABS | Tab addition |
| `src/app/(dashboard)/charts/page.tsx` | Add getSeriesWithProgress() to Promise.all, pass to SeriesTab | Data loading |
| `src/components/features/gallery/gallery-types.ts` | Add `seriesName` to GalleryCardData | Filter/display |
| `src/components/features/gallery/gallery-utils.ts` | Add `seriesName` to transformToGalleryCard, series filter to filterAndSort | Filter logic |
| `src/components/features/gallery/use-gallery-filters.ts` | Add `seriesFilter` query state | URL state |
| `src/components/features/gallery/filter-bar.tsx` | Add series MultiSelectDropdown | Filter UI |
| `src/components/shell/nav-items.ts` | Add Series item to Reference section | Navigation |
| `src/components/features/designers/designer-detail.tsx` | Show series list/count in detail | Enhancement |
| `src/lib/actions/designer-actions.ts` | Include series count in getDesigner | Query enhancement |

## Patterns to Follow

### Pattern 1: Entity CRUD (Designer/Genre pattern)

Series follows the exact same structure as Designer:

**Server actions:** `createSeries`, `updateSeries`, `deleteSeries`, `getSeries`, `getSeriesWithStats`, `getSeriesList`

**Deletion behavior:** `deleteSeries` nullifies `seriesId` on all Charts in the series (same as `deleteDesigner` nullifying `designerId`), then deletes the series. Uses `$transaction` for atomicity.

**Revalidation:** `revalidatePath("/series")`, `revalidatePath("/charts")`, `revalidatePath("/stats")` on mutations.

**Types pattern:**
```typescript
// src/types/series.ts
export type SeriesWithStats = {
  id: string;
  name: string;
  totalCount: number | null;
  designerName: string | null;
  notes: string | null;
  memberCount: number;       // computed: charts.length
  finishedCount: number;     // computed: charts with FINISHED/FFO status
  completionPercent: number; // computed: finishedCount / (totalCount ?? memberCount) * 100
};

export type SeriesDetail = {
  id: string;
  name: string;
  totalCount: number | null;
  designerName: string | null;
  designerId: string | null;
  notes: string | null;
  memberCount: number;
  finishedCount: number;
  completionPercent: number;
  charts: SeriesChart[];
};

export type SeriesChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  designerName: string | null;
  status: ProjectStatus | null;
  stitchesCompleted: number;
};
```

### Pattern 2: Chart Form Assignment (Designer SearchableSelect pattern)

Series assignment in the chart form follows the exact pattern of designer assignment:

```
1. Page loader fetches series list (alongside designers, genres, etc.)
2. SearchableSelect renders series options
3. "Add New" triggers InlineSeriesDialog (like InlineDesignerDialog)
4. New series created via server action
5. Return value auto-selects the new series
6. seriesId stored in form values, submitted with chart data
```

**InlineSeriesDialog** is slightly more complex than InlineNameDialog because it has:
- Name field (required)
- Total count field (optional number)
- Designer field (optional SearchableSelect -- reuses the same options from the form)

This makes it similar to InlineDesignerDialog (name + optional website) rather than InlineNameDialog (name only). Model after `InlineDesignerDialog` with additional fields.

### Pattern 3: Pattern Dive Tab Addition

Adding a Series tab to Pattern Dive follows the existing tab architecture:

```typescript
// pattern-dive-tabs.tsx
export const PATTERN_DIVE_TABS = ["browse", "whats-next", "series", "fabric", "storage"] as const;

// Tab position: after "What's Next", before "Fabric Requirements"
// Rationale: series browsing is a "discovery" action like What's Next, not a
// "planning" action like Fabric Requirements
```

The tab receives pre-fetched data from the Server Component page:

```typescript
// charts/page.tsx -- add to existing Promise.all
const [charts, whatsNextProjects, seriesProgress, fabricRequirements, storageGroups] =
  await Promise.all([
    getChartsForGallery(),
    getWhatsNextProjects(),
    getSeriesWithProgress(),  // NEW
    getFabricRequirements(),
    getStorageGroups(),
  ]);
```

### Pattern 4: Gallery Filter Addition

Series filter follows the same pattern as status and size filters:

```typescript
// use-gallery-filters.ts
const [seriesFilter, setSeriesFilter] = useQueryState(
  "series",
  parseAsArrayOf(parseAsString, ",").withDefault([]),
);
```

The filter options derive from card data (not a separate query):
```typescript
// Derive series options from existing gallery data
const seriesOptions = useMemo(() => {
  const names = new Set(cards.map(c => c.seriesName).filter(Boolean));
  return [...names].sort().map(name => ({ value: name, label: name }));
}, [cards]);
```

Extend search in filterAndSort to match series name:
```typescript
result = result.filter(
  (c) => c.name.toLowerCase().includes(q)
    || c.designerName.toLowerCase().includes(q)
    || (c.seriesName && c.seriesName.toLowerCase().includes(q)),
);
```

### Pattern 5: Management Page Layout (Card Grid vs Table)

The DesignOS design shows a **card grid** for the series management page (not a table like designers/genres). This is appropriate because:
- Series cards show progress bars (visual element not suited to table rows)
- 30 series is a manageable number for a card grid
- Matches the DesignOS screenshot exactly

The SeriesList component uses a responsive grid:
```
sm: 1 column
md: 2 columns
lg: 3 columns
```

Sort controls use pill buttons (Name | Completion | Members) positioned above the grid, matching the DesignOS design.

### Pattern 6: Delete Confirmation Dialog (Reuse)

`DeleteConfirmationDialog` already accepts `entityType` as `"designer" | "genre" | "brand" | "supply"`. Add `"series"` to the union. The dialog message: "This will remove X charts from the series. The charts themselves won't be deleted."

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing computed progress

**What:** Adding `memberCount`, `finishedCount`, or `completionPercent` columns to the Series model.
**Why bad:** Violates "calculated fields at query time" convention. Would go stale on chart status changes or series membership changes.
**Instead:** Compute at query time in server actions, same as designer's `chartCount`, `projectsStarted`, `projectsFinished`.

### Anti-Pattern 2: Junction table for Chart-Series relationship

**What:** Creating a `ChartSeries` junction table (many-to-many).
**Why bad:** A chart belongs to exactly zero or one series. This is 1:many (Series has many Charts), not many-to-many. A junction table adds complexity for no benefit.
**Instead:** Simple nullable FK `seriesId` on Chart, matching the `designerId` pattern.

### Anti-Pattern 3: Series as a Pattern Dive-only feature

**What:** Building series only as a Pattern Dive tab without a dedicated management page.
**Why bad:** Users need to create/edit/delete series independently of browsing. DesignOS shows a dedicated Series management page. Designers and genres have management + detail pages.
**Instead:** Full management page at `/series`, detail page at `/series/[id]`, plus Pattern Dive tab.

### Anti-Pattern 4: Using InlineNameDialog for series inline creation

**What:** Using the generic name-only dialog for series creation from the chart form.
**Why bad:** Series has `totalCount` and `designerId` fields that are useful to set at creation time. Name-only means navigating away to add these.
**Instead:** InlineSeriesDialog with name (required), total count (optional), designer (optional).

### Anti-Pattern 5: Confusing open-ended vs fixed progress display

**What:** Displaying "3 of 7 finished" for open-ended series with 7 charts.
**Why bad:** "7" implies a known total, but open-ended series may grow. Denominator is unstable.
**Instead:** Open-ended: "3 of 7 charts finished". Fixed-count (totalCount=15): "3 of 15 finished". Progress bar denominator: `totalCount ?? memberCount`. Label wording clarifies the difference.

## Build Order Recommendation

The build order minimizes rework by following the dependency chain:

### Phase A: Data Model + Server Actions (foundation)
1. Prisma schema: Series model + Chart.seriesId FK + Designer.series relation
2. Types: `src/types/series.ts`
3. Validation: `seriesSchema` in `src/lib/validations/chart.ts`
4. Server actions: `series-actions.ts` (CRUD + queries)
5. Tests for server actions

**Rationale:** Everything else depends on data model and actions. No UI can proceed without these.

### Phase B: Series Management Page
1. `/series` page + SeriesList component (card grid with sort/search)
2. SeriesFormModal (create/edit dialog)
3. `/series/[id]` detail page + SeriesDetail component
4. DeleteConfirmationDialog integration (extend entityType union)
5. Navigation: Add "Series" to Reference section in nav-items
6. Tests for components

**Rationale:** Management page is standalone -- no dependency on chart form or Pattern Dive. Users need to create series before assigning charts.

### Phase C: Chart Form Integration
1. Add `seriesId` to ChartFormValues and chartFormSchema
2. Add series to page loaders (getCharts, chart create/edit pages)
3. InlineSeriesDialog component
4. Wire SearchableSelect + InlineSeriesDialog in chart-merged-form
5. Draft persistence: validate seriesId in stale ID check
6. Tests

**Rationale:** Depends on Phase A and B. This is where users assign charts to series.

### Phase D: Pattern Dive + Browse Integration
1. SeriesTab component for Pattern Dive
2. getSeriesWithProgress() query
3. Add Series tab to PatternDiveTabs
4. Wire into charts/page.tsx Promise.all
5. Extend GalleryCardData with seriesName
6. Extend gallery-utils filterAndSort with series filter
7. Add series filter to use-gallery-filters + filter-bar
8. Tests

**Rationale:** Depends on Phases A-C (data model + charts have series assigned). Browse features are last because they need populated data.

### Phase E: Polish + Stats (optional for v1.8)
1. Designer detail: show series count
2. Series name on project detail overview tab
3. Series insights in stats dashboard (optional, could defer)
4. Polish pass

**Rationale:** Enhancement layer that refines existing pages.

## Scalability Considerations

| Concern | At 30 series | At 100+ series |
|---------|--------------|----------------|
| Management page | Card grid scrolls fine | Add search bar (designer list has one) |
| Pattern Dive tab | 30 cards renders fast | Consider "show top 10" or pagination |
| Browse filter | 30 items in dropdown fine | MultiSelectDropdown already handles long lists |
| Series detail | Max ~50 charts per series | Sortable list handles this well |

No scalability concerns at the user's scale (30+ series, 500+ charts). All patterns are proven at this scale.

## Sources

- Codebase analysis: `prisma/schema.prisma`, Designer/Genre entity patterns, Pattern Dive tab architecture, gallery filter system
- DesignOS: `product-plan/sections/fabric-series-and-reference-data/` (SeriesList.tsx, SeriesDetail.tsx, types.ts, series.png)
- Established conventions: `CLAUDE.md`, `.claude/rules/`
- Domain requirements: `CROSS_STITCH_TRACKER_PLAN.md` section 4.1 (Series Support)
- Project context: `.planning/PROJECT.md` (v1.8 milestone definition)
