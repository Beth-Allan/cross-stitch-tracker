# Project Management

## Overview
The core section of Cross Stitch Tracker. Users manage their full chart and project stash here — adding charts with rich metadata, tracking project status through the lifecycle, managing designers and genres, and browsing their collection through gallery, list, and table views with filtering.

## User Flows
- Browse charts in gallery (default), list, or table view with a view mode toggle
- Filter charts via horizontal filter bar: status, size category, designer, genre; active filters shown as dismissible chips
- Click a chart card to view the full detail page with tabs: Overview, Supplies, Sessions, Files
- Add a new chart via tabbed modal (Basic Info + Details tabs)
- Edit an existing chart via the same tabbed modal
- Delete a chart with confirmation dialog
- Manage designers, genres, and series (add/edit/delete)
- Upload digital working copies (PDF/image) to a chart
- Add SAL parts to SAL charts (part number, PDF, release date)
- View auto-calculated fields: size category, progress %, kitting status, stitches remaining

## Components Provided
- `ChartGallery` — Main gallery/list/table view with view mode toggle and filter bar
- `ChartCard` — Status-aware gallery card showing cover image, name, designer, stitch count, status badge, and size category
- `ChartListRow` — Compact list row with thumbnail, name, designer, status, stitch count, progress
- `ChartDetail` — Full detail page with tabs (Overview, Supplies, Sessions, Files) and header with chart metadata
- `ChartFormModal` — Tabbed add/edit modal for chart and project data (Basic Info + Details)
- `ChartAddForm` — Standalone add chart form (alternative to modal)
- `FilterBar` — Horizontal filter bar with dropdowns for status, size category, designer, genre
- `StatusBadge` — Color-coded status badge component
- `SizeBadge` — Size category badge (Mini, Small, Medium, Large, BAP)
- `FormFields` — Shared form field components used across modals

## Props Reference

### Key Data Entities
- `Chart` — id, name, designerId, coverImageUrl, stitchCount, stitchCountApproximate, stitchesWide, stitchesHigh, sizeCategory, genres[], seriesIds[], isPaperChart, isFormalKit, isSAL, salParts[], digitalWorkingCopyUrl, dateAdded
- `Project` — id, chartId, status, startDate, finishDate, ffoDate, finishPhotoUrl, startingStitches, stitchesCompleted, progressPercent, stitchesRemaining, fabricId, projectBin, ipadApp, needsOnionSkinning, kittingComplete, kittingPercent, kittingNeeds[], wantToStartNext, lastSessionDate
- `Designer` — id, name, website
- `Genre` — id, name
- `Series` — id, name, totalInSeries
- `FilterState` — status[], sizeCategory[], designerId, genreId, seriesId

### Key Callback Props
- `onSaveChart` — Called when the user submits the add/edit chart form
- `onDeleteChart` — Called when the user confirms chart deletion
- `onUpdateProjectStatus` — Called when the user updates a project's status
- `onViewChart` — Called when the user navigates to a chart detail page
- `onFilterChange` — Called when filter state changes
- `onViewModeChange` — Called when view mode changes (gallery/list/table)
- `onUploadFile` — Called when the user uploads a digital working copy
- `onAddSALPart` — Called when the user adds a SAL part

### Type Enums
- `ProjectStatus`: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO
- `SizeCategory`: Mini (<1K), Small (1K-4,999), Medium (5K-24,999), Large (25K-49,999), BAP (50K+)
- `ViewMode`: gallery, list, table

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
