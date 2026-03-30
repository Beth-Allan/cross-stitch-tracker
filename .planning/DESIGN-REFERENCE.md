# Design Reference Map

Every UI component in this project has a DesignOS reference in `product-plan/sections/`.
**Read the design before building.** See CLAUDE.md "UI Implementation Rules" for the full process.

## Shared Resources

- **Design tokens:** `product-plan/design-system/tokens.css`
- **Typography:** `product-plan/design-system/fonts.md`
- **Colors:** `product-plan/design-system/tailwind-colors.md`
- **App shell:** `product-plan/shell/`

---

## project-management (Phase 2)

### Components
- `product-plan/sections/project-management/components/ChartAddForm.tsx` — full-page add form
- `product-plan/sections/project-management/components/ChartFormModal.tsx` — tabbed edit modal
- `product-plan/sections/project-management/components/FormFields.tsx` — shared form sub-components (SearchableSelect, GenrePicker, CoverImageUpload, StitchCountFields, PatternTypeFields, StartPreferenceFields, Checkbox, FormField, SectionHeading)
- `product-plan/sections/project-management/components/ChartDetail.tsx` — chart detail page
- `product-plan/sections/project-management/components/ChartGallery.tsx` — gallery grid view
- `product-plan/sections/project-management/components/ChartCard.tsx` — gallery card
- `product-plan/sections/project-management/components/ChartListRow.tsx` — list/table row
- `product-plan/sections/project-management/components/FilterBar.tsx` — filter controls
- `product-plan/sections/project-management/components/StatusBadge.tsx` — status badge
- `product-plan/sections/project-management/components/SizeBadge.tsx` — size category badge

### Screenshots
- `product-plan/sections/project-management/chart-add-form.png`
- `product-plan/sections/project-management/chart-detail.png`
- `product-plan/sections/project-management/chart-edit-modal.png`
- `product-plan/sections/project-management/chart-gallery.png`

### Types & Docs
- `product-plan/sections/project-management/types.ts`
- `product-plan/sections/project-management/README.md`

---

## supply-tracking-and-shopping (Phase 3)

### Components
- `product-plan/sections/supply-tracking-and-shopping/components/SupplyCatalog.tsx`
- `product-plan/sections/supply-tracking-and-shopping/components/SupplyDetailModal.tsx`
- `product-plan/sections/supply-tracking-and-shopping/components/ProjectSuppliesTab.tsx`
- `product-plan/sections/supply-tracking-and-shopping/components/BulkSupplyEditor.tsx`

### Screenshots
- `product-plan/sections/supply-tracking-and-shopping/bulk-supply-editor.png`
- `product-plan/sections/supply-tracking-and-shopping/project-supplies-detail.png`
- `product-plan/sections/supply-tracking-and-shopping/project-supplies-tab.png`
- `product-plan/sections/supply-tracking-and-shopping/supply-catalog.png`
- `product-plan/sections/supply-tracking-and-shopping/supply-detail.png`

### Types & Docs
- `product-plan/sections/supply-tracking-and-shopping/types.ts`
- `product-plan/sections/supply-tracking-and-shopping/README.md`

---

## stitching-sessions-and-statistics (Phase 4)

### Components
- `product-plan/sections/stitching-sessions-and-statistics/components/StitchingDashboard.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/LogSessionModal.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/SessionHistory.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/HeroStats.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/StatCards.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/MonthlyChart.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/StitchingCalendar.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/YearInReview.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/PersonalBests.tsx`
- `product-plan/sections/stitching-sessions-and-statistics/components/ProjectSessionsTab.tsx`

### Screenshots
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-overview.png`
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-calendar.png`
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-sessions.png`
- `product-plan/sections/stitching-sessions-and-statistics/stitching-dashboard-year-in-review.png`
- `product-plan/sections/stitching-sessions-and-statistics/project-sessions-tab.png`

### Types & Docs
- `product-plan/sections/stitching-sessions-and-statistics/types.ts`
- `product-plan/sections/stitching-sessions-and-statistics/README.md`

---

## fabric-series-and-reference-data (Phase 5)

### Components
- `product-plan/sections/fabric-series-and-reference-data/components/FabricCatalog.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/FabricDetail.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/FabricFormModal.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerPage.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerDetailModal.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/DesignerFormModal.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/SeriesDetail.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/StorageLocationList.tsx`
- `product-plan/sections/fabric-series-and-reference-data/components/StorageLocationDetail.tsx`

### Screenshots
- `product-plan/sections/fabric-series-and-reference-data/fabric-catalog.png`
- `product-plan/sections/fabric-series-and-reference-data/designer.png`
- `product-plan/sections/fabric-series-and-reference-data/series.png`
- `product-plan/sections/fabric-series-and-reference-data/storage.png`

### Types & Docs
- `product-plan/sections/fabric-series-and-reference-data/types.ts`
- `product-plan/sections/fabric-series-and-reference-data/README.md`

---

## gallery-cards-and-advanced-filtering (Phase 6)

### Components
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/GalleryCard.tsx`
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/GalleryGrid.tsx`
- `product-plan/sections/gallery-cards-and-advanced-filtering/components/AdvancedFilterBar.tsx`

### Screenshots
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-cards.png`
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-list.png`
- `product-plan/sections/gallery-cards-and-advanced-filtering/gallery-table.png`

### Types & Docs
- `product-plan/sections/gallery-cards-and-advanced-filtering/types.ts`
- `product-plan/sections/gallery-cards-and-advanced-filtering/README.md`

---

## dashboards-and-views (Phase 7)

### Components
- `product-plan/sections/dashboards-and-views/components/MainDashboard.tsx`
- `product-plan/sections/dashboards-and-views/components/PatternDive.tsx`
- `product-plan/sections/dashboards-and-views/components/ProjectDashboard.tsx`
- `product-plan/sections/dashboards-and-views/components/ShoppingCart.tsx`

### Screenshots
- `product-plan/sections/dashboards-and-views/main-dashboard.png`
- `product-plan/sections/dashboards-and-views/pattern-dive.png`
- `product-plan/sections/dashboards-and-views/project-dashboard.png`
- `product-plan/sections/dashboards-and-views/shopping-cart.png`

### Types & Docs
- `product-plan/sections/dashboards-and-views/types.ts`
- `product-plan/sections/dashboards-and-views/README.md`

---

## goals-and-plans (Phase 8)

### Components
- `product-plan/sections/goals-and-plans/components/GoalsAndPlans.tsx`
- `product-plan/sections/goals-and-plans/components/ProjectGoalsPanel.tsx`

### Screenshots
- `product-plan/sections/goals-and-plans/goals-tab.png`
- `product-plan/sections/goals-and-plans/plans-tab.png`
- `product-plan/sections/goals-and-plans/rotations-tab.png`
- `product-plan/sections/goals-and-plans/achievements-tab.png`
- `product-plan/sections/goals-and-plans/project-goals-panel.png`

### Types & Docs
- `product-plan/sections/goals-and-plans/types.ts`
- `product-plan/sections/goals-and-plans/README.md`
