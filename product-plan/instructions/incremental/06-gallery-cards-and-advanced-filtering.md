# Milestone 6: Gallery Cards & Advanced Filtering

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/gallery-cards-and-advanced-filtering/types.ts`

**Prerequisites:** Milestone 2 (Project Management) — status system and project data must exist. Milestone 3 (Supply Tracking) recommended for kitting status on Unstarted cards.

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

Build the shared component library for gallery cards and filtering that is reused across the Charts page, Pattern Dive, Project Dashboard, Main Dashboard, and Shopping Cart.

## Overview

This milestone is a **component library**, not a standalone page. It provides three status-specific card variants (WIP, Unstarted, Finished), three view modes (gallery grid, list, table), and a configurable advanced filter bar. These components replace the simpler gallery from Milestone 2 and are consumed by Milestones 2 and 7. After building this milestone, retrofit the Charts page gallery to use these shared components.

## Key Functionality

- **Three card variants** based on status group:
  - **WIP cards** (In Progress, On Hold): progress bar, last stitched date, total time, latest session photo or gradient placeholder
  - **Unstarted cards** (Unstarted, Kitting, Kitted): kitting status checklist (dots for fabric, threads, beads, specialty), size badge, fabric needs summary, animated "Up Next" pill for kitted+flagged projects
  - **Finished cards** (Finished, FFO): completion date, total time, final photo prominent, celebration accent border (violet shimmer for Finished, rose for FFO)
- **Shared card elements:** cover image or status-driven gradient placeholder with scissors motif, project name (clickable), designer name, genre tags (max 3 + "+N" overflow), status badge
- **Gallery grid:** responsive cards (1 col mobile, 2 tablet, 3-4 desktop)
- **List view:** compact horizontal rows with key info
- **Table view:** full data table with sortable columns
- **Advanced filter bar** with configurable dimensions:
  - Status, size category, designer, genre, series, kitting status, completion bracket, year started, year finished, storage location, has fabric, has digital copy
  - Text search across project name, designer name, chart code
  - Active filters as dismissible chips with "Clear all"
  - Auto-shows when the view has 8+ items
- **Status gradient colours:** stone (Unstarted), amber (Kitting), emerald (Kitted), sky (In Progress), orange (On Hold), violet (Finished), rose (FFO)

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `GalleryView` | `sections/gallery-cards-and-advanced-filtering/components/GalleryView.tsx` | Top-level wrapper: filter bar + view mode + content |
| `GalleryGrid` | `sections/gallery-cards-and-advanced-filtering/components/GalleryGrid.tsx` | Responsive card grid |
| `GalleryCard` | `sections/gallery-cards-and-advanced-filtering/components/GalleryCard.tsx` | Status-specific card renderer (dispatches to WIP/Unstarted/Finished) |
| `ListView` | `sections/gallery-cards-and-advanced-filtering/components/ListView.tsx` | Compact row list |
| `TableView` | `sections/gallery-cards-and-advanced-filtering/components/TableView.tsx` | Sortable data table |
| `AdvancedFilterBar` | `sections/gallery-cards-and-advanced-filtering/components/AdvancedFilterBar.tsx` | Configurable filter bar with chips |

## Props Reference

### Key Types

```typescript
type StatusGroup = 'wip' | 'unstarted' | 'finished'
type GalleryCardData = WIPCardData | UnstartedCardData | FinishedCardData

interface FilterConfig {
  availableFilters: FilterDimension[]  // which filters to show in this context
}

type FilterDimension = 'status' | 'sizeCategory' | 'designer' | 'genre' | 'series'
  | 'kittingStatus' | 'completionBracket' | 'yearStarted' | 'yearFinished'
  | 'storageLocation' | 'hasFabric' | 'hasDigitalCopy'
```

### GalleryCard Props

| Prop | Type | Description |
|------|------|-------------|
| `card` | `GalleryCardData` | Union type — component reads `statusGroup` to pick the right layout |
| `onNavigateToProject` | `(projectId: string) => void` | Fired when user clicks the project name link |

### AdvancedFilterBar Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `FilterConfig` | Which filter dimensions are available |
| `filters` | `AdvancedFilterState` | Current filter values |
| `activeFilters` | `ActiveFilter[]` | Chips to display |
| `designerOptions` | `FilterOption[]` | Options for designer searchable select |
| `genreOptions` | `FilterOption[]` | Options for genre searchable select |
| `seriesOptions` | `FilterOption[]` | Options for series searchable select |
| `storageLocationOptions` | `FilterOption[]` | Options for storage location select |
| `onFilterChange` | `(filters: AdvancedFilterState) => void` | Fired when any filter changes |
| `onRemoveFilter` | `(dimension: FilterDimension) => void` | Fired when a chip is dismissed |
| `onClearAllFilters` | `() => void` | Fired when "Clear all" is clicked |

### GalleryGrid / GalleryView Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |
| `onViewModeChange` | `(mode: ViewMode) => void` | User toggles gallery/list/table |
| `onFilterChange` | `(filters: AdvancedFilterState) => void` | User changes filter selections |

## Expected User Flows

### 1. Browse with Status-Specific Cards
1. User views the gallery (from Charts page or Pattern Dive)
2. WIP projects show progress bars and latest session info
3. Unstarted projects show kitting checklists and "Up Next" pills for kitted projects
4. Finished projects show final photos with celebration accent borders
5. **Outcome:** Each card surfaces the most relevant info for its status group

### 2. Filter with Advanced Criteria
1. User opens a gallery with 50+ projects
2. Filter bar auto-appears; user selects "In Progress" status and "Large" size
3. Two chips appear: "In Progress" and "Large"
4. User dismisses the "Large" chip; gallery updates to show all In Progress projects
5. User clicks "Clear all"; all filters removed
6. **Outcome:** Powerful multi-dimensional filtering with visual feedback via chips

### 3. Switch View Modes
1. User is browsing in gallery mode and wants to see detailed data
2. User clicks the table icon in the segmented toggle
3. View switches to a sortable data table with all fields
4. User sorts by stitch count descending
5. **Outcome:** Same data, different presentation; view mode persists during session

## Empty States

- **No cards (empty gallery):** "No projects match your criteria." (when filters are active) or "Your collection is empty. Add your first chart!" (when no projects exist)
- **Filter no results:** "No matches. Try adjusting your filters." with "Clear all" link

## Files to Reference

- `sections/gallery-cards-and-advanced-filtering/components/` — All shared components
- `data-shapes/gallery-cards-and-advanced-filtering/types.ts` — TypeScript interfaces for GalleryCardData, AdvancedFilterState, FilterConfig
- `product/sections/gallery-cards-and-advanced-filtering/spec.md` — Full specification
- `product/sections/gallery-cards-and-advanced-filtering/data.json` — Sample data
- `product/sections/gallery-cards-and-advanced-filtering/*.png` — Screenshots (gallery-cards, gallery-list, gallery-table)

## Done When

- [ ] GalleryCard renders three distinct layouts based on statusGroup (wip, unstarted, finished)
- [ ] WIP cards show progress bar, last stitched date, total time, and latest photo or gradient
- [ ] Unstarted cards show kitting checklist dots, size badge, and "Up Next" pill (with pulse animation) when applicable
- [ ] Finished cards show completion date, total time, final photo, and celebration border (violet for Finished, rose for FFO)
- [ ] Gradient placeholders use status-specific colours with scissors motif
- [ ] Genre tags cap at 3 visible with "+N" overflow
- [ ] Only the project name is clickable (not the whole card)
- [ ] GalleryGrid renders responsive grid: 1 col mobile, 2 tablet, 3-4 desktop
- [ ] ListView renders compact horizontal rows
- [ ] TableView renders sortable columns with Source Sans 3 for numbers
- [ ] AdvancedFilterBar renders only the dimensions specified in FilterConfig
- [ ] Text search works across project name, designer name, and chart code
- [ ] Active filters display as dismissible chips; "Clear all" removes them
- [ ] Filter bar auto-appears when the view has 8+ items
- [ ] View mode toggle uses segmented button group (Gallery | List | Table)
- [ ] Charts page (Milestone 2) is retrofitted to use these shared components
- [ ] Responsive: filter bar wraps on mobile, cards stack to single column
- [ ] Light and dark mode work correctly
