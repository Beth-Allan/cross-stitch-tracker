# Feature Landscape

**Domain:** Series/collection management for cross-stitch project tracking
**Researched:** 2026-05-24
**Confidence:** HIGH (cross-referenced DesignOS spec, competitor apps, book/hobby tracker patterns, Ravelry)

## Table Stakes

Features a stitcher expects from series management. Missing = feature feels incomplete or confusing.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Series CRUD (name, edit, delete) | Bare minimum to organize collections into named groups | Low | Follows established Designer/Genre CRUD pattern already in app. DesignOS has SeriesList + SeriesDetail designs. |
| Chart-to-series assignment from chart form | Primary workflow is "I'm adding a chart and want to tag it to a series" | Low | Use existing SearchableSelect pattern with inline "Add New" (same as designer/genre). One chart belongs to one series. |
| Series progress display ("8 of 15" or "8 charts") | Core value proposition of series tracking -- seeing how complete you are | Low | Two modes: fixed-total (user sets expected count, e.g., "15 in this series") and open-ended (just count owned charts). DesignOS shows `finishedCount of memberCount`. |
| Series list/management page | Dedicated place to browse, sort, and manage all series | Low | DesignOS SeriesList has sort by name/completion/members and card-based grid layout. Mirrors Designer/Genre management pages. |
| Series detail page with member chart list | Click into a series to see all its charts, their status, and progress | Med | DesignOS SeriesDetail shows member cards with thumbnails, status badges, WIP progress bars, and ability to add/remove charts. Follows DesignerDetail pattern. |
| Series filter on Browse tab | When browsing 500+ charts, filter by series to see just one collection | Low | Add to existing FilterBar alongside status and size multi-select dropdowns. Uses same MultiSelectDropdown component. |
| Pattern Dive Series tab | Central "series progress dashboard" within Pattern Dive | Med | New tab alongside Browse/What's Next/Fabric/Storage. Shows series progress cards with completion bars. |
| Optional designer link on series | Most series come from one designer, but not always | Low | Optional FK to Designer. Displayed on series cards and detail page. Helps with attribution. |
| Remove chart from series (from series detail) | Users will make mistakes assigning charts and need to fix them | Low | Confirmation dialog clarifying "chart won't be deleted, just unlinked." DesignOS shows this with trash icon on hover. |
| Optional total count on series | "Celtic Santas" has 12 total patterns; user may only own 8. Want to see "8 of 12 owned, 5 of 12 finished." | Low | Nullable integer. When null, progress is just "N charts" (open-ended). When set, enables "owned vs total" and "finished vs total" framing. |

## Differentiators

Features that set this apart from the basic "tag your charts" approach. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dual progress tracking (owned vs finished) | With optional total count, show both "8 of 12 owned" AND "5 of 12 finished." Most trackers only track one dimension. | Low | Key insight: a stitcher may own 8 of 12 charts in a series but only have finished 5. Both numbers matter -- one for collecting, one for completing. |
| Series progress bar on series cards | Visual completion bar on every series card in the list and Pattern Dive tab | Low | DesignOS already specifies this. Emerald progress bar matching the app's design system. Satisfying visual feedback. |
| Per-member status badges in series detail | Each chart in the series shows its project status (Unstarted/Kitting/WIP/Finished/FFO) and WIP progress | Low | DesignOS shows status badges + inline progress bars for WIP charts. Reuse existing StatusBadge and SizeBadge components. |
| Sort series by completion | "Show me my most-complete series first" -- motivational for finishing collections | Low | DesignOS sort controls include completion percentage. Helps prioritize which series to focus on. |
| Series stats integration | Surface series data in the Stats page (e.g., "3 series completed this year," "most active series") | Med | Extends existing stats queries. Not in initial scope but valuable for stitchers who collect by series. Defer to future milestone. |
| Bulk chart assignment to series | Select multiple charts from Browse tab and assign them to a series in one action | High | Useful for initial data entry when user has 30+ series to populate, but complex UI. Defer -- individual assignment from chart form is sufficient for steady-state workflow. |
| Series stitch total | Aggregate total stitches across all charts in a series; show as headline stat on series detail | Low | Computed at query time from member chart stitch counts. Gives a sense of series scale ("this series is 180,000 stitches total"). |
| Multi-series membership | Allow a chart to belong to multiple series | Med | Current requirement says one series per chart (M:1 via optional FK). Multi-series would need a junction table. Not needed for this user's workflow -- series are distinct designer collections. |

## Anti-Features

Features to explicitly NOT build. These create complexity without matching how stitchers actually work.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Series ordering within a series | Imposing an order on charts within a series (e.g., "chart 3 of 12") adds data entry burden for no practical benefit. Stitchers work on whichever chart appeals to them, not sequentially. | Sort by name, status, or stitch count in the series detail view. Let display order be dynamic. |
| Series-level supply aggregation | Calculating total supplies needed across all charts in a series is technically cool but practically useless. Each chart is an independent project with its own supplies. | Keep supply tracking per-project. Surface per-chart supply status in the series member list if useful. |
| Series-level session logging | "Log a session for the Celtic Santas series" makes no sense. Sessions are always for a specific project. | Keep session logging per-project. Series progress updates automatically as member projects progress. |
| Automatic series detection | Trying to guess which charts belong together based on designer/name patterns. Too error-prone with 500+ charts and would create false groupings. | Manual assignment via SearchableSelect. User knows their collection best. |
| Series hierarchy / nested series | "Celtic Santas" inside a "Celtic Collection" parent series. Over-engineering for a flat list of ~30 series. | Flat series list. If a designer has multiple series, the optional designer link provides implicit grouping. |
| Series cover images | Adding cover photo management to series adds storage and UI complexity for minimal value. The card grid with progress bars is sufficiently informative. | Show thumbnails of member charts on the series card or detail page instead. The series card in DesignOS works well without a cover image. |
| Drag-and-drop series reordering | Custom ordering of the series list via drag-and-drop. Over-engineered for ~30 series with good sort options. | Sort by name, completion, or member count covers all practical needs. |
| SAL-to-series conversion | SALs (multi-part single projects) and series (multiple independent projects) are fundamentally different concepts. Converting between them would create data integrity issues. | Keep SAL and Series as completely separate concepts. A SAL part is NOT a series member. |

## Feature Dependencies

```
Series model (Prisma schema)
  -> Chart-to-series FK
    -> Chart form SearchableSelect integration
    -> Series filter on Browse tab
  -> Series CRUD actions
    -> Series management page
    -> Series detail page
  -> Pattern Dive Series tab (depends on series model + CRUD)
```

Key dependency chain: Schema first, then CRUD actions, then UI in parallel (form integration + management pages + Pattern Dive tab + Browse filter).

All series features depend on existing infrastructure:
- SearchableSelect component (chart form pattern)
- FilterBar + MultiSelectDropdown (Browse tab)
- PatternDiveTabs (tab container)
- DesignerDetail pattern (detail page structure)
- StatusBadge, SizeBadge (member chart display)
- InlineNameEdit pattern (series rename)
- DeleteConfirmationDialog (series deletion)

## MVP Recommendation

Prioritize (all table stakes, ship together as one coherent feature):

1. **Series model + CRUD** -- Prisma schema, server actions, Zod validation
2. **Chart form integration** -- SearchableSelect with inline "Add New" for series
3. **Series management page** -- List with sort controls, add modal (mirrors Designers page)
4. **Series detail page** -- Member chart list with status, progress, add/remove (mirrors DesignerDetail)
5. **Pattern Dive Series tab** -- Progress cards with completion bars
6. **Browse tab series filter** -- MultiSelectDropdown for series

Defer:
- **Series stats integration**: Adds query complexity; series progress is visible enough on the Series tab and detail pages. Ship in a future milestone if wanted.
- **Bulk chart assignment**: Individual assignment covers steady-state; user can add charts one-by-one during initial setup. Tedious for 30 series but only happens once.
- **Multi-series membership**: User's series are distinct designer collections with no overlap. If needed later, migrate FK to junction table.
- **Series stitch total**: Nice-to-have stat but not blocking. Can add to series detail page in a polish pass.

## Sources

- DesignOS design specs: `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx`, `SeriesDetail.tsx`
- DesignOS types: `product-plan/sections/fabric-series-and-reference-data/types.ts` (Series, SeriesMember interfaces)
- Existing app patterns: DesignerDetail, FilterBar, PatternDiveTabs, SearchableSelect
- Project requirements: `CROSS_STITCH_TRACKER_PLAN.md` Section 4.1 (Series Support)
- Cross-stitch app ecosystem: Cross Stitch Journal, X-Stitch Plus, StashCache, MyCozyApp, Pattern Keeper
- Analogous domains: Ravelry (bundles/favorites/queue), Figure Case (hobby collection grouping), book series tracker apps (Bookly, Book Tracker)
- UX patterns: Progress tracker design best practices (UXPin)
