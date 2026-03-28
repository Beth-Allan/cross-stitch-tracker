# Test Specs: Project Management

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test the chart gallery browsing experience, chart CRUD operations, view mode switching, filtering, and the detail page with tabs.

## User Flow Tests

### Browse Charts in Gallery View
**Scenario:** User lands on the Project Management page and browses their chart collection.

#### Success Path
**Steps:**
1. Navigate to the Project Management page
2. Observe the default gallery grid of chart cards

**Expected Results:**
- [ ] Gallery view is the default view mode
- [ ] Each card shows: cover image (or placeholder), chart name, designer name, stitch count, status badge, size category badge
- [ ] WIP cards show a progress bar and last session date
- [ ] Unstarted cards show kitting status summary
- [ ] Finished cards show finish date and finish photo
- [ ] Cards render in a responsive grid (1 col mobile, 2 tablet, 3-4 desktop)

#### Empty State
**Steps:**
1. Render the gallery with an empty charts array

**Expected Results:**
- [ ] An empty state message is displayed (no broken grid layout)

---

### Switch View Modes
**Scenario:** User toggles between gallery, list, and table views.

#### Success Path
**Steps:**
1. Click the "List" view toggle button
2. Observe the list view renders
3. Click the "Table" view toggle button
4. Observe the table view renders
5. Click the "Gallery" view toggle button

**Expected Results:**
- [ ] List view shows compact rows with thumbnail, name, designer, status, stitch count, progress
- [ ] Table view shows sortable columns with all visible fields
- [ ] Gallery view returns to the card grid
- [ ] `onViewModeChange` is called with the correct mode on each toggle
- [ ] The active view mode button is visually highlighted

---

### Filter Charts
**Scenario:** User applies filters to narrow down the chart collection.

#### Success Path
**Steps:**
1. Select "In Progress" from the status filter dropdown
2. Observe the filter chip appears below the filter bar
3. Select "Large" from the size category filter
4. Observe a second chip appears
5. Click the dismiss button on the "In Progress" chip

**Expected Results:**
- [ ] `onFilterChange` is called with updated filter state after each selection
- [ ] Active filters appear as dismissible chips below the filter bar
- [ ] Dismissing a chip removes that filter and calls `onFilterChange`
- [ ] "Clear all" button appears when any filter is active
- [ ] Clicking "Clear all" removes all chips and resets filter state

---

### Add a New Chart
**Scenario:** User adds a new chart to their collection via the modal form.

#### Success Path
**Steps:**
1. Click the "Add Chart" button
2. Modal opens on the "Basic Info" tab
3. Fill in: name ("Mystic Garden"), designer (select from dropdown), stitch count (45000), width (300), height (150)
4. Switch to the "Details" tab
5. Set status to "Unstarted", select genres, optionally set series
6. Click "Save"

**Expected Results:**
- [ ] Modal opens with two tabs: "Basic Info" and "Details"
- [ ] Designer field is a searchable select with existing designers
- [ ] Size category auto-calculates from stitch count (45000 = Large)
- [ ] `onSave` is called with the chart and project data
- [ ] Modal closes after save

#### Validation
**Steps:**
1. Open the add chart modal
2. Leave the name field empty
3. Click "Save"

**Expected Results:**
- [ ] Form shows validation errors for required fields (name, stitch count)
- [ ] `onSave` is not called until validation passes

---

### View Chart Detail
**Scenario:** User clicks a chart card to view its full detail page.

#### Success Path
**Steps:**
1. Click a chart card in the gallery
2. Detail page opens with the Overview tab active
3. Click the "Supplies" tab
4. Click the "Sessions" tab
5. Click the "Files" tab

**Expected Results:**
- [ ] Detail header shows: cover image, chart name, designer, stitch count, size category, status badge, genre tags (first genre + "+N" overflow)
- [ ] Overview tab displays all metadata, dates, and goals
- [ ] Supplies tab shows placeholder content (linked from Section 2)
- [ ] Sessions tab shows placeholder content (linked from Section 3)
- [ ] Files tab shows digital working copies and SAL parts
- [ ] Back button calls `onBack` to return to the gallery

---

### Delete a Chart
**Scenario:** User deletes a chart from the detail page.

#### Success Path
**Steps:**
1. Navigate to a chart's detail page
2. Click the "Delete" button
3. Confirmation dialog appears
4. Click "Confirm"

**Expected Results:**
- [ ] Confirmation dialog warns about permanent deletion
- [ ] `onDeleteChart` is called with the chart ID
- [ ] User is returned to the gallery after deletion

#### Cancel Path
**Steps:**
1. Click "Delete" on a chart detail page
2. Click "Cancel" in the confirmation dialog

**Expected Results:**
- [ ] Dialog closes without calling `onDeleteChart`
- [ ] User remains on the detail page

## Empty State Tests
- [ ] Gallery with no charts shows an empty state with "Add Chart" CTA
- [ ] Filter results with no matches shows "No charts match your filters" message
- [ ] Chart detail Files tab with no files shows upload prompt
- [ ] Chart detail with no SAL parts shows "Add SAL Part" prompt (only if chart.isSAL is true)

## Component Interaction Tests
- [ ] `StatusBadge` renders correct color for each of the 7 statuses
- [ ] `SizeBadge` renders correct label for each size category
- [ ] `FilterBar` dropdown options match the provided designers, genres, and statuses
- [ ] `ChartCard` truncates long chart names gracefully
- [ ] Genre tags on cards and detail show max 3 with "+N" overflow

## Edge Cases
- [ ] Chart with stitchCountApproximate=true shows "~" prefix on the stitch count
- [ ] Chart with 0 stitch count does not break size category calculation
- [ ] Very long designer names truncate in cards without breaking layout
- [ ] SAL chart shows SAL parts section in the Files tab; non-SAL chart does not
- [ ] Kitting status correctly reflects all supply dimensions (fabric, threads, beads, specialty)
