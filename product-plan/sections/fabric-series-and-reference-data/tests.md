# Test Specs: Fabric, Series & Reference Data

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test fabric catalog CRUD with filtering, fabric detail with size calculator, designer browsing and detail modals, series management with completion tracking, and storage location CRUD.

## User Flow Tests

### Browse and Filter Fabric Catalog
**Scenario:** User browses their fabric stash with filters.

#### Success Path
**Steps:**
1. Navigate to the Fabric page
2. Observe the default table view of all fabrics
3. Select "18ct" from the count filter
4. Select "Aida" from the type filter
5. Toggle the "Need to buy" filter

**Expected Results:**
- [ ] Table shows columns: name, brand, count, type, color, dimensions, linked project, need-to-buy status
- [ ] Sorting works on any column (name alphabetically, count numerically)
- [ ] `onFabricFilterChange` is called with updated filter state
- [ ] Active filters narrow the table results
- [ ] Hover on a row reveals edit and delete icons

---

### Add a Fabric
**Scenario:** User adds a new fabric to their stash.

#### Success Path
**Steps:**
1. Click "Add Fabric" button
2. Modal opens with all fields
3. Fill in: name ("28ct Cashel Linen Antique White"), brand (select "Zweigart"), count (28), type (Linen), color family (Cream), color type (Cream), shortest edge (18), longest edge (24)
4. Optionally link to a project and check "Need to buy"
5. Click "Save"

**Expected Results:**
- [ ] Modal has generous padding (px-8 py-6)
- [ ] Brand is a searchable select with "Add new" option
- [ ] Count dropdown shows options with "ct" suffix (e.g., "28ct")
- [ ] `onSaveFabric` is called with the fabric data
- [ ] Modal closes after save

---

### View Fabric Detail with Size Calculator
**Scenario:** User views a fabric's detail page and uses the size calculator.

#### Success Path
**Steps:**
1. Click a fabric name in the catalog table
2. Fabric Detail page opens
3. Observe the Size Calculator panel
4. Review the "Other Projects at This Count" section

**Expected Results:**
- [ ] Detail shows all metadata: name, brand, count, type, color, dimensions, photo, need-to-buy
- [ ] If linked to a project: shows project name (clickable), status, and fabric usage
- [ ] Size Calculator lists unassigned projects with required dimensions at this fabric's count
- [ ] Size formula: required inches = (stitch dimension / fabric count) + 6
- [ ] Fit indicator: green checkmark if fabric dimensions >= required, red X if not
- [ ] "Other Projects at This Count" shows all projects regardless of fit

---

### View Designer Detail
**Scenario:** User browses designers and views a designer's full catalog.

#### Success Path
**Steps:**
1. Navigate to the Designer page
2. Click a designer name to open the detail modal
3. Sort the designer's charts by stitch count
4. Click a chart name to navigate to Chart Detail

**Expected Results:**
- [ ] Designer table shows: name, website, chart count, projects stitched, genres
- [ ] Detail modal header: designer name, website link
- [ ] Stats row: total charts, projects started, projects finished, most common genre
- [ ] Charts list shows compact cards: name, stitch count, size category, project status
- [ ] Charts sortable by: name, stitch count, status
- [ ] `onNavigateToChart` is called when clicking a chart name

---

### Manage Series
**Scenario:** User creates a series and adds charts to it.

#### Success Path
**Steps:**
1. Navigate to the Series page
2. Click "Add Series" and enter "Woodland Seasons"
3. Click into the new series
4. Click "Add Chart to Series"
5. Search for and select a chart
6. Observe the completion bar updates

**Expected Results:**
- [ ] `onCreateSeries` is called with "Woodland Seasons"
- [ ] Series cards show: name, member count, completion progress bar, fraction (e.g., "0 of 0 finished")
- [ ] Series Detail shows member chart cards with status badges and progress bars
- [ ] "Add Chart to Series" opens a searchable select of charts not in this series
- [ ] `onAddChart` is called with seriesId and chartId
- [ ] Completion bar uses emerald fill on stone track
- [ ] Remove icon on each member card triggers confirmation then `onRemoveChart`

## Empty State Tests
- [ ] Fabric catalog with no fabrics shows empty state with "Add Fabric" CTA
- [ ] Designer page with no designers shows empty state
- [ ] Series list with no series shows "Create your first series" prompt
- [ ] Series detail with no members shows "Add charts to this series" message
- [ ] Storage locations with no locations shows "Add Location" CTA
- [ ] Fabric Detail with no linked project shows the size calculator without usage comparison

## Component Interaction Tests
- [ ] Edit icons appear on hover only (not always visible) for fabric rows, designer rows, and brands
- [ ] Fabric count dropdown shows common counts with "ct" suffix
- [ ] "Add new" brand inline opens a compact form (name + website)
- [ ] Series completion bars update dynamically when members change status
- [ ] Storage location detail groups items by projects and fabric
- [ ] Designer stats use Source Sans 3 for numbers (not JetBrains Mono)

## Edge Cases
- [ ] Fabric with dimensions 0x0 does not break size calculator
- [ ] Deleting a fabric brand that has linked fabrics shows a warning
- [ ] Deleting a series removes the grouping but does not delete the charts
- [ ] Designer with 0 charts shows "No charts yet" in the detail modal
- [ ] Storage location with 0 assigned items shows empty but deletable
- [ ] Very long fabric names truncate in the table without breaking layout
