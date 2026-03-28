# Dashboards & Views

## Overview
Four dashboard pages that provide the main navigation experience for the app. The Main Dashboard is a library-style home screen showcasing the collection. Pattern Dive is a deep library browser with advanced filtering. Project Dashboard focuses on active work with progress buckets. Shopping Cart aggregates all supply and fabric needs across projects.

## User Flows
- **Main Dashboard**: View recently added charts, currently stitching projects, buried treasures, a random spotlight project, collection stats, goals summary, and quick-add actions
- **Pattern Dive**: Browse all projects with advanced filtering (Browse tab), see what to start next (What's Next tab), review fabric requirements across counts (Fabric Requirements tab), view projects grouped by storage location (Storage View tab)
- **Project Dashboard**: Review in-progress projects in progress buckets (In Progress tab), browse finished projects with stats (Finished tab)
- **Shopping Cart**: See all unfulfilled thread/bead/specialty/fabric needs across projects, mark items as acquired, copy shopping lists to clipboard

## Components Provided
- `MainDashboard` — Home screen with stacked sections: recently added, currently stitching, start next, buried treasures, spotlight, collection stats, goals summary, and quick-add menu
- `PatternDive` — Four-tab library browser: Browse (gallery + advanced filtering), What's Next, Fabric Requirements, Storage View
- `ProjectDashboard` — Two-tab active work view: In Progress (progress buckets with hero stats), Finished (gallery with finish stats)
- `ShoppingCart` — Five-tab shopping aggregator: Threads, Beads, Specialty, Fabric, Summary with per-project filter and mark-as-acquired

## Props Reference

### Key Data Entities
- `RecentChart` — chartId, projectId, name, designerName, coverImageUrl, status, dateAdded, stitchCount, sizeCategory
- `BuriedTreasure` — chartId, projectId, name, designerName, coverImageUrl, dateAdded, daysInLibrary, sizeCategory, genres[]
- `SpotlightProject` — projectId, chartId, name, designerName, coverImageUrl, status, genres[], sizeCategory, stitchCount, progressPercent
- `CollectionStats` — totalProjects, totalWIP, totalOnHold, totalUnstarted, totalFinished, totalStitchesCompleted, mostRecentFinish, largestProject
- `GoalsSummary` — upcomingMilestones[], plannedStarts[]
- `WhatsNextProject` — projectId, name, designerName, status, kittingPercent, sizeCategory, priorityRanking, preferredStartTiming
- `FabricRequirementRow` — projectId, projectName, stitchesWide, stitchesHigh, assignedFabricId, matchingFabrics[]
- `StorageGroup` — locationId, locationName, items[]
- `ProgressBucket` — id, label, range, projects[]
- `FinishedProject` — projectId, name, designerName, fabricDescription, startDate, finishDate, startToFinishDays, stitchingDays, totalStitches, avgDailyStitches
- `ShoppingThreadNeed` / `ShoppingBeadNeed` / `ShoppingSpecialtyNeed` — supply details with totalRequired, totalAcquired, totalRemaining, projects[]
- `ShoppingFabricNeed` — description, count, type, colorPreference, linkedProjectName, matchingFabrics[]

### Key Callback Props
- `onQuickAdd` — Called when user selects a quick-add action (chart, fabric, floss, beads, specialty, designer, logStitches)
- `onNavigateToProject` — Called when user clicks a project name
- `onViewSpotlight` / `onRefreshSpotlight` — Spotlight card interaction
- `onFilterChange` / `onRemoveFilter` / `onClearAllFilters` — Pattern Dive filter management
- `onAssignFabric` — Assign a stash fabric to a project in Fabric Requirements or Shopping Cart
- `onMarkAcquired` — Mark a supply quantity as acquired in Shopping Cart
- `onMarkFabricAcquired` — Mark a fabric as acquired
- `onClearCompleted` — Clear all completed items from shopping list

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
