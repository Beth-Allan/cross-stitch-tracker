# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

### Section 1: Project Management
- **Chart** — Cross stitch pattern with full metadata (used in: project-management, gallery-cards)
- **Project** — User's working instance of a chart (used in: project-management, dashboards)
- **Designer** — Pattern designer with name and website (used in: project-management, fabric-series)
- **Genre** — Classification tag for charts (used in: project-management)

### Section 2: Supply Tracking & Shopping
- **Thread** — Embroidery thread record with colour swatch (used in: supply-tracking, shopping-cart)
- **Bead** — Glass bead record (used in: supply-tracking, shopping-cart)
- **SpecialtyItem** — Metallic thread/braid record (used in: supply-tracking, shopping-cart)
- **ProjectThread/ProjectBead/ProjectSpecialty** — Supply-to-project junction with quantities (used in: supply-tracking)

### Section 3: Stitching Sessions & Statistics
- **StitchSession** — Session log entry with stitch count and optional photo/time (used in: stitching-sessions)
- **HeroStats** — Pre-calculated headline numbers (used in: stitching-sessions)
- **PersonalBest** — Record-setting achievement (used in: stitching-sessions)
- **YearInReviewData** — Yearly summary stats, timeline, highlights (used in: stitching-sessions)

### Section 4: Fabric, Series & Reference Data
- **Fabric** — Fabric inventory record with brand, count, dimensions (used in: fabric-series)
- **FabricBrand** — Fabric manufacturer (used in: fabric-series)
- **Series** — Named collection of related charts (used in: fabric-series)
- **StorageLocation** — Physical storage location (used in: fabric-series, dashboards)

### Section 5: Gallery Cards & Advanced Filtering
- **GalleryProject** — Unified project shape for gallery card rendering (used in: gallery-cards, dashboards)
- **FilterConfig** — Available filter dimensions (used in: gallery-cards)

### Section 6: Dashboards & Views
- **DashboardData** — Main dashboard sections data (used in: dashboards)
- **ShoppingCartData** — Aggregated supply needs (used in: dashboards)

### Section 7: Goals & Plans
- **Goal** — Measurable goal with progress tracking (used in: goals-and-plans)
- **Plan** — Scheduled stitching plan (used in: goals-and-plans)
- **Rotation** — Multi-project rotation system (used in: goals-and-plans)
- **Achievement** — Auto-tracked trophy case entry (used in: goals-and-plans)

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions:

- `sections/project-management/types.ts`
- `sections/supply-tracking-and-shopping/types.ts`
- `sections/stitching-sessions-and-statistics/types.ts`
- `sections/fabric-series-and-reference-data/types.ts`
- `sections/gallery-cards-and-advanced-filtering/types.ts`
- `sections/dashboards-and-views/types.ts`
- `sections/goals-and-plans/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.
