# Gallery Cards & Advanced Filtering

## Overview
A shared component library providing status-specific gallery cards and a reusable advanced filter bar. These components are used across the app — in the Chart Gallery, Pattern Dive, Project Dashboard, and Main Dashboard. The gallery card system renders three distinct card layouts based on project status group (WIP, Unstarted, Finished), while the filter component provides configurable filtering with dismissible chips.

## User Flows
- View projects as gallery cards with status-specific layouts (WIP, Unstarted, Finished variants)
- WIP cards show: progress bar, last stitched date, total time, latest photo
- Unstarted cards show: kitting checklist dots, size category, fabric needs, "Up Next" pill if flagged
- Finished cards show: completion date, total time, final photo, celebration accent border
- All cards share: cover image or gradient placeholder, project name (clickable), designer, genre tags (max 3 + overflow), status badge
- Use the advanced filter bar with configurable filter dimensions and dismissible chips
- Toggle between Gallery, List, and Table views
- Text search across project name, designer name, and chart code

## Components Provided
- `GalleryCard` — Status-aware card that renders WIP, Unstarted, or Finished layout based on statusGroup
- `GalleryGrid` — Responsive card grid with view mode toggle (gallery/list/table)
- `AdvancedFilterBar` — Configurable horizontal filter bar with dropdowns, search, dismissible chips, and "Clear all"

## Props Reference

### Key Data Entities
- `GalleryCardBase` — projectId, chartId, projectName, designerName, coverImageUrl, status, statusGroup, genres[], sizeCategory, stitchCount, threadColourCount, beadTypeCount, specialtyItemCount
- `WIPCardData` extends GalleryCardBase — progressPercent, stitchesCompleted, lastSessionDate, startDate, totalTimeMinutes, stitchingDays, latestPhotoUrl
- `UnstartedCardData` extends GalleryCardBase — fabricStatus, threadStatus, beadsStatus, specialtyStatus, kittingPercent, fabricNeeds, wantToStartNext, prepStep, needsOnionSkinning, dateAdded
- `FinishedCardData` extends GalleryCardBase — startDate, finishDate, ffoDate, totalTimeMinutes, stitchingDays, startToFinishDays, avgDailyStitches, finalPhotoUrl
- `AdvancedFilterState` — status[], sizeCategory[], designerId, genreId, seriesId, kittingStatus, completionBracket, yearStarted, yearFinished, storageLocationId, hasFabric, hasDigitalCopy, search
- `FilterConfig` — availableFilters[] (which dimensions are enabled in this context)
- `ActiveFilter` — dimension, label, value

### Key Callback Props
- `onNavigateToProject` — Called when the user clicks a project name link
- `onFilterChange` — Called when any filter dimension changes
- `onRemoveFilter` — Called when a single filter chip is dismissed
- `onClearAllFilters` — Called when "Clear all" is clicked
- `onViewModeChange` — Called when view mode changes (gallery/list/table)

### Type Enums
- `ProjectStatus`: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO
- `StatusGroup`: wip, unstarted, finished
- `ViewMode`: gallery, list, table
- `KittingFilterOption`: all, fully-kitted, partially-kitted, not-started
- `KittingItemStatus`: fulfilled, needed, not-applicable
- `CompletionBracket`: 0-25, 25-50, 50-75, 75-100
- `FilterDimension`: status, sizeCategory, designer, genre, series, kittingStatus, completionBracket, yearStarted, yearFinished, storageLocation, hasFabric, hasDigitalCopy

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
