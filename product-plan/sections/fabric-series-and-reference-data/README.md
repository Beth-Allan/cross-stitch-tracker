# Fabric, Series & Reference Data

## Overview
CRUD management for fabric inventory, fabric brands, designers, series/collections, and storage locations. This section provides the reference data layer that feeds into dashboards, shopping, and project linking. Users can track their fabric stash, browse designers and their catalogs, manage series with completion tracking, and define custom storage locations for organizing physical supplies.

## User Flows
- Browse the fabric catalog in a sortable, filterable table (by brand, count, type, color family, need-to-buy)
- View fabric detail with metadata, linked project, size calculator, and other projects at this count
- Add/edit fabric via modal form with brand, count, type, color, dimensions, linked project, need-to-buy
- Manage fabric brands (add/edit/delete with linked fabric count)
- Browse designers in a sortable table (name, website, chart count, projects stitched, genres)
- View designer detail modal with stats row and all charts by that designer
- Browse series as cards with completion progress bars
- View series detail with member charts, add/remove charts, rename/delete series
- Manage storage locations (simple CRUD list with assigned project/fabric counts)

## Components Provided
- `FabricCatalog` — Table view of all fabrics with filter bar and add button
- `FabricDetail` — Detail page with metadata, linked project, size calculator panel, and projects at this count
- `FabricFormModal` — Add/edit modal with brand, count, type, color, dimensions, linked project, need-to-buy
- `DesignerPage` — Table listing all designers with sort, filter, and detail modal trigger
- `DesignerDetailModal` — Designer detail with stats row and sortable chart list
- `DesignerFormModal` — Add/edit designer modal
- `SeriesList` — Card/list view of series with completion bars and add button
- `SeriesDetail` — Series detail with member chart cards, add/remove, rename, delete
- `StorageLocationList` — Simple CRUD list of storage locations with counts
- `StorageLocationDetail` — Location detail showing all assigned projects and fabric

## Props Reference

### Key Data Entities
- `Fabric` — id, name, brandId, photoUrl, count, type, colorFamily, colorType, shortestEdgeInches, longestEdgeInches, linkedProjectId, needToBuy
- `FabricBrand` — id, name, website
- `FabricSizeCalculation` — projectId, projectName, stitchesWide, stitchesHigh, requiredWidthInches, requiredHeightInches, fits
- `Designer` — id, name, website, chartCount, projectsStarted, projectsFinished, topGenre
- `DesignerChart` — id, chartName, stitchCount, sizeCategory, projectStatus, progressPercent, coverImageUrl
- `Series` — id, name, memberCount, finishedCount, completionPercent
- `SeriesMember` — chartId, chartName, designerName, stitchCount, coverImageUrl, projectStatus, progressPercent
- `StorageLocation` — id, name, projectCount
- `StorageLocationDetail` — location, projects[]

### Key Callback Props
- `onSaveFabric` / `onDeleteFabric` — Fabric CRUD
- `onSaveFabricBrand` / `onDeleteFabricBrand` — Brand CRUD
- `onCalculateSizeFits` — Calculate which projects fit on a given fabric
- `onNavigateToProject` / `onNavigateToChart` — Navigation callbacks
- `onRenameSeries` / `onDeleteSeries` / `onAddChart` / `onRemoveChart` — Series management
- `onAddLocation` / `onRenameLocation` / `onDeleteLocation` — Storage CRUD

### Type Enums
- `FabricCount`: 14, 16, 18, 20, 22, 25, 28, 32, 36, 40
- `FabricType`: Aida, Linen, Lugana, Evenweave, Hardanger, Congress Cloth, Other
- `FabricColorFamily`: White, Cream, Blue, Green, Pink, Purple, Red, Yellow, Brown, Gray, Black, Multi
- `FabricColorType`: White, Cream, Natural, Neutrals, Brights, Pastels, Dark, Hand-dyed, Overdyed

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
