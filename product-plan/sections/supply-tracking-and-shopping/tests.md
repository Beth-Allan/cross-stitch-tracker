# Test Specs: Supply Tracking & Shopping

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test the supply catalog browsing and CRUD, project-supply linking with quantity management, kitting progress calculation, and the bulk supply editor.

## User Flow Tests

### Browse Supply Catalog
**Scenario:** User navigates the supply catalog and switches between tabs and views.

#### Success Path
**Steps:**
1. Navigate to the Supply Tracking page
2. Observe the Thread tab is active by default with swatch grid view
3. Click the "Beads" tab
4. Click the table view toggle
5. Type "DMC" in the search field

**Expected Results:**
- [ ] Thread tab shows color swatches in a grid layout by default
- [ ] Beads tab renders bead entries with product codes and color swatches
- [ ] Table view shows sortable columns: swatch, code, name, brand, color family
- [ ] Search filters the table to show matching entries
- [ ] `onFilterChange` is called with updated search text
- [ ] `onViewModeChange` is called with "table"

---

### Add a Supply to the Catalog
**Scenario:** User adds a new thread to the catalog.

#### Success Path
**Steps:**
1. Click "Add Thread" button on the Thread tab
2. Modal opens with fields: color code, color name, brand (searchable select), hex color, color family
3. Select brand "DMC" from the dropdown
4. Fill in code "3726", name "Antique Mauve - Dark", hex "#7D3C5D", color family "Purple"
5. Click "Save"

**Expected Results:**
- [ ] Add modal opens with empty fields
- [ ] Brand select is searchable with an "Add new" option
- [ ] `onAddThread` is called with the thread data
- [ ] Modal closes after save

#### Add New Brand Inline
**Steps:**
1. Open the add thread modal
2. In the brand select, type a brand name that does not exist
3. Click "Add new" option
4. Enter brand name and optional website

**Expected Results:**
- [ ] "Add new" option appears at the bottom of the brand dropdown
- [ ] Inline brand form appears for name and website
- [ ] `onAddBrand` is called with the new brand data
- [ ] New brand is selected in the dropdown after creation

---

### Link Supplies to a Project
**Scenario:** User adds supplies to a project from the Chart Detail Supplies tab.

#### Success Path
**Steps:**
1. Navigate to a Chart Detail page and open the "Supplies" tab
2. Observe the kitting progress bar and summary at the top
3. Click the search-to-add interface
4. Type "310" to search the thread catalog
5. Select "DMC 310 - Black" from results
6. Set quantity required to 5, quantity acquired to 3
7. Click "Add"

**Expected Results:**
- [ ] Kitting progress bar shows overall percentage with plain-language summary
- [ ] Three collapsible sections appear: Thread, Beads, Specialty
- [ ] Search returns matching catalog entries by code or name
- [ ] `onAddProjectThread` is called with projectId, threadId, and quantities
- [ ] New supply row appears with swatch, code, name, required (5), acquired (3), needed (2), fulfillment indicator (amber warning)

---

### Edit Supply Quantities Inline
**Scenario:** User updates quantities for a supply already linked to a project.

#### Success Path
**Steps:**
1. On the Supplies tab, find an existing thread row
2. Click the "acquired" quantity field
3. Change the value from 3 to 5
4. Press Enter or click away to confirm

**Expected Results:**
- [ ] Quantity field becomes editable on click
- [ ] `onUpdateProjectThread` is called with the updated quantity
- [ ] Fulfillment indicator updates (emerald checkmark when acquired >= required)
- [ ] Kitting progress bar recalculates

---

### Bulk Supply Editor
**Scenario:** User opens the full-page bulk editor for heavy supply data entry.

#### Success Path
**Steps:**
1. On the Supplies tab, click "Open Bulk Editor"
2. Full-page editor opens with the project name in the header
3. Use search-add at the top to add 3 threads quickly
4. Edit quantities inline for each
5. Click "Back" to return to Chart Detail

**Expected Results:**
- [ ] `onOpenBulkEditor` is called with the project ID
- [ ] Editor shows supplies grouped by type (Thread, Beads, Specialty)
- [ ] Search-add works the same as the Supplies tab
- [ ] All quantity edits trigger appropriate update callbacks
- [ ] "Back" button calls `onBack` to return to Chart Detail

## Empty State Tests
- [ ] Supply catalog with no threads shows empty state with "Add Thread" CTA
- [ ] Supplies tab with no linked supplies shows "Add supplies to start kitting" message
- [ ] Kitting progress shows 0% with appropriate summary when no supplies are linked
- [ ] Bulk editor with no linked supplies shows search-add interface prominently

## Component Interaction Tests
- [ ] Color swatches render as small circles using the hex color from the supply record
- [ ] Fulfillment indicators use: emerald for fulfilled, amber for partially acquired, stone for not started
- [ ] Kitting progress bar percentage matches the calculated overallPercent from KittingSupplySummary
- [ ] Collapsible sections in Supplies tab expand/collapse independently
- [ ] Cross-reference modal shows which other projects use a selected color

## Edge Cases
- [ ] Supply with quantityRequired = 0 does not show a divide-by-zero in fulfillment
- [ ] Very long color names truncate gracefully in grid and table views
- [ ] Searching by numeric code sorts results numerically (310 before 3710)
- [ ] Removing the last supply from a project updates kitting progress to 0%
- [ ] Adding a supply that is already linked to the project shows a duplicate warning
