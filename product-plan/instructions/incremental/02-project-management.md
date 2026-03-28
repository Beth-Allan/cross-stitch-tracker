# Milestone 2: Project Management

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/project-management/types.ts`

**Prerequisites:** Milestone 1 (Shell) — navigation and design tokens must be in place.

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

Build the core chart and project CRUD system — the backbone of the entire app. Users manage their full cross stitch library here: adding charts, tracking project status through the lifecycle, and browsing their collection.

## Overview

Project Management provides the primary data entry and browsing experience. Users add charts with rich metadata (~50 fields across chart and project records), browse their collection in gallery/list/table views, filter by status/size/designer/genre, view detailed project pages with tabs, and edit or delete charts. Auto-calculated fields (size category, progress %, kitting status) reduce manual bookkeeping.

## Key Functionality

- **Chart Gallery** with three view modes: gallery (card grid), list (compact rows), table (sortable columns)
- **Filter bar** with dropdowns for status, size category, designer, genre; active filters shown as dismissible chips
- **Chart Detail** page with tabs: Overview, Supplies (placeholder), Sessions (placeholder), Files
- **Add Chart** full-page form with tabbed sections: Basic Info, Details
- **Edit Chart** modal with same tabbed structure
- **Delete chart** with confirmation dialog
- **Status system** with 7 statuses: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO
- **Auto-calculated fields:** size category from stitch count (Mini < 1K, Small 1-5K, Medium 5-25K, Large 25-50K, BAP 50K+), progress %, kitting status
- **Designer, genre, series management** inline (add/edit from within chart forms)
- **SAL support**: multi-part charts with part numbers and release dates
- **File uploads**: digital working copies (PDF/image)

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `ChartGallery` | `sections/project-management/components/ChartGallery.tsx` | Main gallery with filter bar and view toggle |
| `ChartDetail` | `sections/project-management/components/ChartDetail.tsx` | Detail page with tabs (Overview, Supplies, Sessions, Files) |
| `ChartAddForm` | `sections/project-management/components/ChartAddForm.tsx` | Full-page add form with tabbed sections |
| `ChartEditModal` | `sections/project-management/components/ChartEditModal.tsx` | Tabbed modal for editing existing charts |
| `StatusBadge` | `sections/project-management/components/StatusBadge.tsx` | Colour-coded status pill |
| `SizeBadge` | `sections/project-management/components/SizeBadge.tsx` | Size category label |

## Props Reference

### Key Types

```typescript
type ProjectStatus = 'Unstarted' | 'Kitting' | 'Kitted' | 'In Progress' | 'On Hold' | 'Finished' | 'FFO'
type SizeCategory = 'Mini' | 'Small' | 'Medium' | 'Large' | 'BAP'
type ViewMode = 'gallery' | 'list' | 'table'
```

### ChartGallery Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onSaveChart` | `(chart: Partial<Chart>) => void` | User submits add/edit form |
| `onDeleteChart` | `(chartId: string) => void` | User confirms deletion |
| `onUpdateProjectStatus` | `(projectId: string, status: ProjectStatus) => void` | User changes project status |
| `onViewChart` | `(chartId: string) => void` | User clicks a chart card to view detail |
| `onFilterChange` | `(filters: FilterState) => void` | User changes filter selections |
| `onViewModeChange` | `(mode: ViewMode) => void` | User toggles gallery/list/table |

### ChartDetail Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onBack` | `() => void` | User navigates back to gallery |
| `onEdit` | `(chartId: string) => void` | User clicks edit button |
| `onDelete` | `(chartId: string) => void` | User clicks delete button |
| `onUpdateStatus` | `(projectId: string, status: ProjectStatus) => void` | User changes status from detail page |
| `onUploadFile` | `(chartId: string, file: File) => void` | User uploads a digital working copy |
| `onAddSALPart` | `(chartId: string, part: Partial<SALPart>) => void` | User adds a SAL part |

### ChartAddForm / ChartEditModal Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onSave` | `(chartData: Partial<Chart>, projectData: Partial<Project>) => void` | User saves the form |
| `onClose` / `onCancel` | `() => void` | User cancels or closes |
| `onAddDesigner` | `(name: string) => void` | User creates a new designer inline |
| `onAddGenre` | `(name: string) => void` | User creates a new genre inline |
| `onAddSeries` | `(name: string) => void` | User creates a new series inline |
| `onAddFabric` | `() => void` | User opens fabric creation from form |

## Expected User Flows

### 1. Browse and Filter Charts
1. User navigates to Charts from sidebar
2. Gallery view loads showing all charts as cards
3. User selects "In Progress" from the status filter
4. Filter chip appears; gallery updates to show only WIP projects
5. User toggles to table view for a sortable spreadsheet experience
6. **Outcome:** Filtered view with dismissible chips; view mode persists during session

### 2. Add a New Chart
1. User clicks "Add Chart" in the top bar or gallery header
2. Full-page form opens with Tab 1: Basic Info (name, designer, cover image, stitch count, dimensions)
3. User fills basic info, switches to Tab 2: Details (status, genres, series, fabric, dates)
4. User creates a new designer inline via "Add new" in the designer select
5. User saves the form
6. **Outcome:** Chart and project records created; gallery refreshes with the new card

### 3. View Chart Detail
1. User clicks a chart card in the gallery
2. Detail page loads with header (cover image, name, designer, status, size, genres)
3. Overview tab shows all metadata and dates
4. Files tab shows digital working copies and SAL parts
5. **Outcome:** Full chart information visible with tabs for related data

### 4. Edit and Delete a Chart
1. From the detail page, user clicks the edit button
2. Tabbed edit modal opens pre-filled with current data
3. User changes the status from "Unstarted" to "Kitting" and saves
4. Alternatively, user clicks delete, confirms in the dialog
5. **Outcome:** Chart updated or removed; gallery reflects the change

## Empty States

- **No charts yet:** Centered illustration with "Your stash is empty" message and a prominent "Add Your First Chart" CTA button
- **No filter results:** "No charts match your filters" message with "Clear filters" link
- **Empty detail tabs:** Supplies tab shows "Link supplies in the Supplies section"; Sessions tab shows "Log your first session in Stats"

## Files to Reference

- `sections/project-management/components/` — All screen design components
- `data-shapes/project-management/types.ts` — TypeScript interfaces for Chart, Project, Designer, Genre, Series, FilterState
- `product/sections/project-management/spec.md` — Full specification
- `product/sections/project-management/data.json` — Sample data
- `product/sections/project-management/*.png` — Screenshots (chart-gallery, chart-detail, chart-add-form, chart-edit-modal)

## Done When

- [ ] Charts page renders with gallery view as default
- [ ] View toggle switches between gallery, list, and table views
- [ ] Filter bar works for status, size category, designer, and genre
- [ ] Active filters display as dismissible chips; "Clear all" removes them
- [ ] Add chart form creates a chart + project record with all fields
- [ ] Inline designer/genre/series creation works from within the form
- [ ] Chart detail page shows all metadata across tabs
- [ ] Edit modal updates chart data; delete dialog removes it
- [ ] Status badges render with correct colour per status
- [ ] Size category auto-calculates from stitch count
- [ ] Progress % auto-calculates from stitchesCompleted / stitchCount
- [ ] SAL parts can be added and viewed on the Files tab
- [ ] Responsive: cards stack on mobile, table scrolls horizontally
- [ ] Light and dark mode work correctly
