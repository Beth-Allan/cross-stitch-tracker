# Supply Tracking & Shopping

## Overview
The supply catalog and project-supply linking system. Users browse and manage their thread, bead, and specialty item databases, link supplies to projects with per-project quantities, and see auto-calculated kitting status. The dedicated section page is a supply catalog with three tabs (Thread, Beads, Specialty). Supplies are also linked and managed from the Chart Detail Supplies tab and a dedicated full-page bulk supply editor.

## User Flows
- Browse the supply catalog via three tabs: Thread, Beads, Specialty
- Toggle between swatch grid view (default) and searchable table view within each tab
- Filter supplies by brand, color family, or search by code/name
- Add a new thread, bead, or specialty item to the catalog via modal
- Manage supply brands inline (searchable select with "Add new")
- Quick-add supplies to a project from the Chart Detail Supplies tab (search catalog, select, set quantities)
- Open a full-page bulk supply editor for heavy data entry when kitting
- Set per-supply quantities: required, acquired, and per-color stitch count
- View auto-calculated kitting progress and fulfillment status per supply
- Delete a supply from a project with confirmation

## Components Provided
- `SupplyCatalog` — Tabbed catalog page (Thread, Beads, Specialty) with grid/table toggle, filtering, and add/edit modals
- `SupplyDetailModal` — Detail view for a single supply showing swatch, code, name, brand, color family, and linked projects
- `ProjectSuppliesTab` — Chart Detail Supplies tab with kitting progress bar, collapsible supply sections, inline quantity editing, and search-to-add
- `BulkSupplyEditor` — Full-page editor for bulk supply entry with search-add at top and grouped inline editing

## Props Reference

### Key Data Entities
- `Thread` — id, brandId, colorCode, colorName, hexColor, colorFamily
- `Bead` — id, brandId, productCode, colorName, hexColor, colorFamily
- `SpecialtyItem` — id, brandId, productCode, colorName, description, hexColor
- `ProjectThread` / `ProjectBead` / `ProjectSpecialty` — id, projectId, supplyId, stitchCount, quantityRequired, quantityAcquired, quantityNeeded, isFulfilled
- `SupplyBrand` — id, name, website, supplyType
- `KittingSupplySummary` — totalThreads, fulfilledThreads, totalBeads, fulfilledBeads, totalSpecialty, fulfilledSpecialty, overallPercent, needsSummary[]

### Key Callback Props
- `onAddThread` / `onEditThread` / `onDeleteThread` — Catalog thread CRUD
- `onAddBead` / `onEditBead` / `onDeleteBead` — Catalog bead CRUD
- `onAddSpecialtyItem` / `onEditSpecialtyItem` / `onDeleteSpecialtyItem` — Catalog specialty CRUD
- `onAddBrand` / `onEditBrand` — Brand management
- `onAddProjectThread` / `onUpdateProjectThread` / `onRemoveProjectThread` — Project-supply linking
- `onOpenBulkEditor` — Navigate to the full-page bulk editor
- `onFilterChange` — Catalog filter state changes
- `onViewModeChange` — Grid/table toggle

### Type Enums
- `SupplyType`: thread, bead, specialty
- `ColorFamily`: Black, White, Red, Orange, Yellow, Green, Blue, Purple, Brown, Gray, Neutral
- `CatalogViewMode`: grid, table

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
