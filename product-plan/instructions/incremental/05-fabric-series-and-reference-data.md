# Milestone 5: Fabric, Series & Reference Data

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/fabric-series-and-reference-data/types.ts`

**Prerequisites:** Milestone 2 (Project Management) — charts and projects must exist for linking. Milestone 3 (Supply Tracking) recommended for full kitting context.

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Build the reference data layer — fabric inventory, fabric brands, designer catalog, series/collection tracking, and storage location management. This data feeds into dashboards, shopping lists, and project linking.

## Overview

Four sub-sections provide the reference data that enriches the rest of the app. The Fabric Catalog tracks fabric inventory with a size calculator that matches fabric to projects. The Designer page shows designer catalogs with stats computed from project data. Series management tracks collection completion with progress bars. Storage locations let users organize their physical supplies by location.

## Key Functionality

- **Fabric Catalog:** table view with filter bar (brand, count, type, colour family, need-to-buy), add/edit modal, fabric detail view
- **Fabric Size Calculator:** given a fabric's count and dimensions, determine which projects fit. Formula: required inches = (stitch dimension / fabric count) + 6 (3" margin each side)
- **Fabric Brands tab:** CRUD table for fabric brands (name, website, linked fabric count)
- **Designer page:** sortable table with stats (chart count, projects stitched, top genre), click to open detail modal
- **Designer Detail modal:** stats row, sortable chart list by this designer, click-through to chart detail
- **Series list:** card grid with completion progress bars and fraction labels (e.g., "3 of 7 finished")
- **Series detail:** member chart cards with progress, add/remove charts, inline rename
- **Storage locations:** simple CRUD list with project/fabric counts per location, click to view assigned items

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `FabricCatalog` | `sections/fabric-series-and-reference-data/components/FabricCatalog.tsx` | Fabric table with Brands tab |
| `FabricDetail` | `sections/fabric-series-and-reference-data/components/FabricDetail.tsx` | Fabric detail view with size calculator |
| `DesignerPage` | `sections/fabric-series-and-reference-data/components/DesignerPage.tsx` | Designer table with sort and filter |
| `DesignerDetailModal` | `sections/fabric-series-and-reference-data/components/DesignerDetailModal.tsx` | Designer stats + chart list modal |
| `SeriesList` | `sections/fabric-series-and-reference-data/components/SeriesList.tsx` | Series card grid with completion bars |
| `SeriesDetail` | `sections/fabric-series-and-reference-data/components/SeriesDetail.tsx` | Series member management |
| `StorageLocationList` | `sections/fabric-series-and-reference-data/components/StorageLocationList.tsx` | Storage location CRUD list |
| `StorageLocationDetail` | `sections/fabric-series-and-reference-data/components/StorageLocationDetail.tsx` | Projects/fabric at a location |

## Props Reference

### Key Types

```typescript
type FabricCount = 14 | 16 | 18 | 20 | 22 | 25 | 28 | 32 | 36 | 40
type FabricType = 'Aida' | 'Linen' | 'Lugana' | 'Evenweave' | 'Hardanger' | 'Congress Cloth' | 'Other'
type FabricColorType = 'White' | 'Cream' | 'Natural' | 'Neutrals' | 'Brights' | 'Pastels' | 'Dark' | 'Hand-dyed' | 'Overdyed'

interface FabricSizeCalculation {
  projectId: string; projectName: string;
  stitchesWide: number; stitchesHigh: number;
  requiredWidthInches: number; requiredHeightInches: number;
  fits: boolean;
}
```

### FabricCatalog Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onSaveFabric` | `(fabric: Partial<Fabric>) => void` | User adds or edits a fabric record |
| `onDeleteFabric` | `(fabricId: string) => void` | User deletes a fabric |
| `onSaveFabricBrand` | `(brand: Partial<FabricBrand>) => void` | User adds or edits a brand |
| `onUploadFabricPhoto` | `(fabricId: string, file: File) => void` | User uploads a fabric photo |
| `onCalculateSizeFits` | `(fabricId: string) => FabricSizeCalculation[]` | User opens size calculator |
| `onFabricFilterChange` | `(filters: FabricFilterState) => void` | User changes filter criteria |

### DesignerDetailModal Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onNavigateToChart` | `(chartId: string) => void` | User clicks a chart name |
| `onEditDesigner` | `(designerId: string) => void` | User clicks edit |
| `onDeleteDesigner` | `(designerId: string) => void` | User clicks delete |
| `onClose` | `() => void` | User closes the modal |

### SeriesDetail Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onRenameSeries` | `(seriesId: string, newName: string) => void` | User renames the series |
| `onAddChart` | `(seriesId: string, chartId: string) => void` | User adds a chart to the series |
| `onRemoveChart` | `(seriesId: string, chartId: string) => void` | User removes a chart |
| `onNavigateToChart` | `(chartId: string) => void` | User clicks a chart name |

## Expected User Flows

### 1. Manage Fabric Inventory
1. User navigates to the Fabric page
2. Table shows all fabric with columns: name, brand, count, type, colour, dimensions
3. User clicks "Add Fabric" and fills the modal: name, brand (with "Add new"), count (18ct), type (Aida), dimensions
4. User saves; fabric appears in the table
5. **Outcome:** Fabric record created with all metadata; available for project linking

### 2. Use the Size Calculator
1. User opens fabric detail for a 25ct Lugana, 18" x 22"
2. Size calculator panel shows which unassigned projects fit on this fabric
3. A project needing 15" x 19" at 25ct shows a green checkmark (fits)
4. A project needing 24" x 30" shows a red X (does not fit)
5. **Outcome:** User knows which projects their fabric can accommodate

### 3. Browse Designer Catalog
1. User navigates to the Designer page
2. Table lists designers with chart count and stitched count
3. User clicks "Mirabilia" to open the detail modal
4. Stats row shows: 12 charts, 3 started, 2 finished, top genre: Fantasy
5. Charts list below shows all 12 charts with status badges
6. **Outcome:** Designer portfolio visible with stats computed from project data

### 4. Track Series Completion
1. User views the Series list showing card grid with progress bars
2. "Mirabilia Zodiac" shows "3 of 12 finished" with 25% completion bar
3. User clicks to see member charts; clicks "Add Chart" to include a newly purchased pattern
4. **Outcome:** Series completion tracking updated; progress bar reflects new member

## Empty States

- **No fabric:** "No fabric in your stash yet. Add your first fabric to start tracking." with "Add Fabric" button
- **No designers:** "No designers yet. They'll appear here when you add charts." (designers are typically created via chart forms)
- **No series:** "No series yet. Create one to group related charts." with "Create Series" button
- **No storage locations:** "No storage locations. Create locations to organize your stash." with "Add Location" button
- **Size calculator no matches:** "No unassigned projects fit this fabric at its current count."

## Files to Reference

- `sections/fabric-series-and-reference-data/components/` — All screen design components
- `data-shapes/fabric-series-and-reference-data/types.ts` — TypeScript interfaces for Fabric, FabricBrand, Designer, Series, StorageLocation
- `product/sections/fabric-series-and-reference-data/spec.md` — Full specification
- `product/sections/fabric-series-and-reference-data/data.json` — Sample data
- `product/sections/fabric-series-and-reference-data/*.png` — Screenshots (fabric-catalog, designer, series, storage)

## Done When

- [ ] Fabric catalog renders as a filterable table with brand, count, type, colour family filters
- [ ] Fabric add/edit modal works with all fields including brand "Add new"
- [ ] Fabric detail view shows all metadata and the size calculator panel
- [ ] Size calculator correctly applies formula: (stitch dimension / count) + 6
- [ ] Fit indicator: green checkmark when fabric >= required, red X when not
- [ ] Fabric Brands tab lists brands with CRUD operations
- [ ] Designer page shows sortable table with computed stats (chart count, projects stitched)
- [ ] Designer detail modal shows stats row and sortable chart list
- [ ] Series list shows card grid with completion progress bars
- [ ] Series detail allows add/remove charts and inline rename
- [ ] Storage location CRUD works; clicking a location shows assigned projects/fabric
- [ ] Edit icons appear on hover (not always visible)
- [ ] Responsive: tables collapse to card lists on mobile
- [ ] Light and dark mode work correctly
