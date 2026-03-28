# Milestone 7: Dashboards & Views

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/dashboards-and-views/types.ts`

**Prerequisites:** Milestone 6 (Gallery Cards) — shared card and filter components are consumed by all four dashboards. Milestones 2-5 provide the underlying data.

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

Build the four dashboard pages that provide the primary browsing, planning, and shopping experience — tying together data from all previous milestones into purpose-built views.

## Overview

Four dashboards, each served by the sidebar navigation:

1. **Main Dashboard** (home screen) — library-style overview with recently added charts, currently stitching projects, buried treasures, a "Rediscover This One" spotlight, collection stats, and quick actions.
2. **Pattern Dive** (Charts deep browser) — four tabs: Browse (full gallery with advanced filtering), What's Next (kitted/flagged projects), Fabric Requirements (calculated size table), Storage View (projects grouped by location).
3. **Project Dashboard** (active work) — two tabs: In Progress (WIP gallery with hero stats and progress buckets) and Finished (completed projects gallery with rich stats).
4. **Shopping Cart** — six tabs: project-first shopping model with Threads, Beads, Specialty, Fabric, Summary tabs plus a sticky "Shopping for" project selector bar.

## Key Functionality

### Main Dashboard
- **Recently Added** row: horizontal scroll of last 10 charts as gallery cards
- **Currently Stitching** row: WIP cards sorted by most recently worked on
- **Buried Treasures:** 5 oldest unstarted charts with "days in library" count
- **Rediscover This One:** random spotlight with large featured card and CTA
- **Collection Stats** card: totals for WIP, Unstarted, Finished, and overall stitches
- **Goals Summary:** upcoming milestones and planned starts (teaser from Milestone 8)
- **Quick Actions:** "Log Stitches," "Add Chart," "Add Fabric" in the page header
- No tabs — all sections stack vertically with generous spacing

### Pattern Dive (4 tabs)
- **Browse:** reuses GalleryGrid + AdvancedFilterBar from Milestone 6 with all filter dimensions
- **What's Next:** kitted/flagged projects sorted by priority with kitting completion and size info
- **Fabric Requirements:** table of projects with calculated fabric sizes at 14ct, 18ct, 25ct, 28ct; sortable; shows matching fabric from stash
- **Storage View:** collapsible sections grouped by storage location with project/fabric items

### Project Dashboard (2 tabs)
- **In Progress:** hero stats row (total WIPs, average progress, closest to completion), progress buckets (0-25%, 25-50%, 50-75%, 75-100%), sort options
- **Finished:** hero stats (finished this year, all-time), gallery of finished projects with rich stats (start-to-finish days, stitching days, avg daily stitches, colour count)

### Shopping Cart (6 tabs)
- **Sticky "Shopping for" bar:** project selector at top to filter all tabs to one project's needs
- **Threads tab:** all unfulfilled thread needs grouped by thread (combined quantities across projects, expandable project breakdown)
- **Beads tab:** same format for beads
- **Specialty tab:** same format for specialty items
- **Fabric tab:** fabrics marked need-to-buy + unassigned projects needing fabric, with matching stash indicators
- **Summary tab:** cross-project overview with total items to buy, per-project shopping lists, "Copy to clipboard" button
- Tab count badges for unfulfilled items
- "Mark as acquired" action on individual items

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `MainDashboard` | `sections/dashboards-and-views/components/MainDashboard.tsx` | Home screen with stacked sections |
| `PatternDive` | `sections/dashboards-and-views/components/PatternDive.tsx` | Library browser (4 tabs) |
| `ProjectDashboard` | `sections/dashboards-and-views/components/ProjectDashboard.tsx` | Active work tracker (2 tabs) |
| `ShoppingCart` | `sections/dashboards-and-views/components/ShoppingCart.tsx` | Supply shopping (6 tabs) |

## Props Reference

### Key Types

```typescript
interface CollectionStats {
  totalProjects: number; totalWIP: number; totalOnHold: number;
  totalUnstarted: number; totalFinished: number; totalStitchesCompleted: number;
}
interface FabricRequirementRow {
  projectId: string; projectName: string;
  stitchesWide: number; stitchesHigh: number;
  assignedFabricId: string | null; matchingFabrics: MatchingFabric[];
}
interface ShoppingThreadNeed {
  threadId: string; colorCode: string; colorName: string; hexColor: string;
  totalRequired: number; totalAcquired: number; totalRemaining: number;
  projects: { projectId: string; projectName: string; quantityNeeded: number }[];
}
```

### MainDashboard Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onQuickAdd` | `(action: QuickAddAction) => void` | User selects a quick-add action |
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |
| `onViewSpotlight` | `(projectId: string) => void` | User clicks "Check it out" on spotlight |
| `onRefreshSpotlight` | `() => void` | User requests a new random spotlight |
| `onNavigateToGoals` | `() => void` | User clicks "View all goals" |

### PatternDive Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |
| `onFilterChange` | `(filters: AdvancedFilterState) => void` | User changes Browse tab filters |
| `onViewModeChange` | `(mode: ViewMode) => void` | User toggles view mode |
| `onAssignFabric` | `(projectId: string, fabricId: string) => void` | User assigns fabric in Fabric Requirements |

### ShoppingCart Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onMarkAcquired` | `(type, itemId, quantity) => void` | User marks a supply as acquired |
| `onMarkFabricAcquired` | `(fabricId: string) => void` | User marks a fabric as acquired |
| `onAssignFabric` | `(projectId: string, fabricId: string) => void` | User assigns stash fabric to a project |
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |
| `onClearCompleted` | `() => void` | User clears all completed shopping items |

## Expected User Flows

### 1. Explore the Main Dashboard
1. User opens the app; Main Dashboard loads as the home screen
2. "Currently Stitching" row shows their active WIP projects with progress bars
3. "Buried Treasures" reminds them of charts waiting in the stash
4. "Rediscover This One" spotlights a random project with a "Check it out" button
5. User clicks "Log Stitches" quick action to log a session
6. **Outcome:** At-a-glance view of the entire collection with quick entry points

### 2. Plan What to Stitch Next
1. User navigates to Pattern Dive and opens the "What's Next" tab
2. Projects that are kitted or flagged as want-to-start appear sorted by priority
3. User checks the "Fabric Requirements" tab to see which projects fit available fabric
4. User opens "Storage View" to find a project in "Bin A"
5. **Outcome:** Informed decision about the next project to start

### 3. Shop for Supplies
1. User navigates to Shopping Cart
2. Threads tab shows all unfulfilled thread needs with colour swatches and quantities
3. User selects "Project X" in the "Shopping for" bar to filter to that project's needs
4. User marks 3 threads as acquired after a store visit
5. User opens Summary tab and copies the text shopping list to clipboard
6. **Outcome:** Organised shopping experience with fulfillment tracking

### 4. Review Active Work
1. User opens Project Dashboard, In Progress tab
2. Hero stats show: 5 WIPs, 43% average progress, "Autumn Garden" closest at 87%
3. Progress buckets group projects: 2 at 75-100%, 1 at 50-75%, 2 at 0-25%
4. User switches to Finished tab to see completed projects with rich stats
5. **Outcome:** Clear picture of active work and accomplishments

## Empty States

- **Main Dashboard, no projects:** "Welcome to Cross Stitch Tracker! Add your first chart to get started." with prominent "Add Chart" CTA
- **Currently Stitching, none active:** "No active projects. Start stitching to see them here!"
- **Buried Treasures, none unstarted:** Section hidden (don't show empty)
- **Pattern Dive Browse, no results:** "No projects match your filters." with "Clear all" link
- **What's Next, none ready:** "No projects are kitted or flagged as next. Keep kitting!"
- **Shopping Cart, nothing to buy:** "All supplies acquired! Your stash is fully stocked." with emerald checkmark
- **Project Dashboard, no WIPs:** "No works in progress. Start a project to track it here."
- **Finished tab, none finished:** "No finished projects yet. Your first finish will appear here!"

## Files to Reference

- `sections/dashboards-and-views/components/` — All dashboard components
- `data-shapes/dashboards-and-views/types.ts` — TypeScript interfaces (imports from gallery-cards-and-advanced-filtering and fabric-series types)
- `product/sections/dashboards-and-views/spec.md` — Full specification
- `product/sections/dashboards-and-views/data.json` — Sample data
- `product/sections/dashboards-and-views/*.png` — Screenshots (main-dashboard, pattern-dive, project-dashboard, shopping-cart)

## Done When

- [ ] Main Dashboard renders as the default landing page with all sections stacked vertically
- [ ] Recently Added row scrolls horizontally with gallery cards
- [ ] Currently Stitching shows WIP cards sorted by last stitched date
- [ ] Buried Treasures shows the 5 oldest unstarted charts with "days in library" count
- [ ] Rediscover spotlight shows a random project with refresh capability
- [ ] Quick actions (Log Stitches, Add Chart, Add Fabric) work from the header
- [ ] Pattern Dive Browse tab reuses GalleryGrid + AdvancedFilterBar from Milestone 6
- [ ] What's Next tab shows kitted/flagged projects sorted by priority
- [ ] Fabric Requirements table shows calculated sizes at multiple fabric counts
- [ ] Storage View shows collapsible location groups
- [ ] Project Dashboard In Progress tab shows hero stats, progress buckets, and sort options
- [ ] Project Dashboard Finished tab shows finished cards with rich stats
- [ ] Shopping Cart shows 6 tabs with count badges for unfulfilled items
- [ ] "Shopping for" project selector filters all Shopping Cart tabs
- [ ] Thread/bead/specialty tabs group needs by supply with expandable project breakdowns
- [ ] "Mark as acquired" updates quantities on individual items
- [ ] Summary tab has "Copy to clipboard" for text shopping list
- [ ] Hero stat numbers use JetBrains Mono; all other text uses Source Sans 3
- [ ] Section headings on Main Dashboard use Fraunces with emerald accent underline
- [ ] Responsive: horizontal scroll rows become stacks on mobile, tables collapse to cards
- [ ] Light and dark mode work correctly
