# Test Specs: Gallery Cards & Advanced Filtering

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test the three gallery card variants (WIP, Unstarted, Finished), the advanced filter bar with configurable dimensions and dismissible chips, and the view mode toggle.

## User Flow Tests

### Render WIP Gallery Cards
**Scenario:** In Progress and On Hold projects render with WIP card layout.

#### Success Path
**Steps:**
1. Render a GalleryCard with statusGroup "wip" and status "In Progress"
2. Observe the card layout

**Expected Results:**
- [ ] Card shows: cover image (or gradient placeholder with scissors motif), project name, designer name, status badge
- [ ] Progress bar is visible with emerald fill on stone track
- [ ] Last stitched date is displayed
- [ ] Total time invested is shown (formatted from totalTimeMinutes)
- [ ] Latest session photo or gradient placeholder is displayed
- [ ] Genre tags show max 3 with "+N" overflow for additional genres
- [ ] Status badge uses sky background for "In Progress", orange for "On Hold"
- [ ] Clicking the project name calls `onNavigateToProject`; clicking elsewhere does nothing

---

### Render Unstarted Gallery Cards
**Scenario:** Unstarted, Kitting, and Kitted projects render with Unstarted card layout.

#### Success Path
**Steps:**
1. Render a GalleryCard with statusGroup "unstarted" and status "Kitted", wantToStartNext=true

**Expected Results:**
- [ ] Card shows kitting checklist: small filled/empty dots for fabric, threads, beads, specialty
- [ ] Size category badge is visible
- [ ] Fabric needs summary is displayed
- [ ] "Up Next" animated pill appears (emerald background, subtle pulse) because wantToStartNext is true and status is Kitted
- [ ] Kitting dots use: filled for fulfilled, empty for needed, hidden for not-applicable

---

### Render Finished Gallery Cards
**Scenario:** Finished and FFO projects render with Finished card layout.

#### Success Path
**Steps:**
1. Render a GalleryCard with statusGroup "finished" and status "Finished"

**Expected Results:**
- [ ] Completion date is prominently displayed
- [ ] Total stitching time is shown
- [ ] Final photo is prominently displayed (larger than WIP photo)
- [ ] Subtle celebration accent border: violet shimmer for Finished, rose for FFO
- [ ] Start-to-finish days and average daily stitches are shown

---

### Use Advanced Filter Bar
**Scenario:** User applies multiple filters and manages active filter chips.

#### Success Path
**Steps:**
1. Render the AdvancedFilterBar with all filter dimensions enabled
2. Select "In Progress" and "On Hold" from the status multi-select
3. Select "Large" and "BAP" from the size category multi-select
4. Type "garden" in the text search field
5. Observe the filter chips appear
6. Click the dismiss button on the "In Progress" chip
7. Click "Clear all"

**Expected Results:**
- [ ] Status filter shows multi-select checkboxes for all 7 statuses
- [ ] Size category shows multi-select for Mini, Small, Medium, Large, BAP
- [ ] Designer and genre use searchable selects
- [ ] `onFilterChange` is called after each filter change
- [ ] Active filters appear as dismissible chips below the filter bar
- [ ] Chips show the filter label (e.g., "Status: In Progress")
- [ ] `onRemoveFilter` is called with the dimension when a chip is dismissed
- [ ] "Clear all" link appears when any filter is active
- [ ] `onClearAllFilters` resets all filters and removes all chips
- [ ] Text search field is always visible

---

### Toggle View Modes
**Scenario:** User switches between Gallery, List, and Table views.

#### Success Path
**Steps:**
1. Click the "List" button in the segmented toggle
2. Click the "Table" button
3. Click the "Gallery" button

**Expected Results:**
- [ ] Gallery shows responsive card grid (1 col mobile, 2 tablet, 3-4 desktop)
- [ ] List shows compact horizontal rows with key info
- [ ] Table shows full data table with sortable columns
- [ ] `onViewModeChange` is called with the correct mode
- [ ] Active view button is visually highlighted in the segmented group
- [ ] All numbers in table view use Source Sans 3 font

## Empty State Tests
- [ ] GalleryGrid with empty cards array shows appropriate empty state
- [ ] Filter bar with no active filters hides the chips row and "Clear all" link
- [ ] Filter bar auto-hides when the view has fewer than 8 items (per spec)

## Component Interaction Tests
- [ ] Gradient placeholders use correct status colors: stone (Unstarted), amber (Kitting), emerald (Kitted), sky (In Progress), orange (On Hold), violet (Finished), rose (FFO)
- [ ] Genre tags cap at 3 visible with "+N" overflow count
- [ ] Status badges use status color as background with white text
- [ ] Filter chips use stone background with x dismiss button
- [ ] Searchable selects in filter bar match the pattern from Section 1 forms
- [ ] "Up Next" pill only appears on Kitted cards with wantToStartNext=true

## Edge Cases
- [ ] Card with no cover image shows status-driven gradient placeholder with scissors motif
- [ ] Card with 0 genres shows no genre tags section (no empty row)
- [ ] Card with genres count > 3 shows first 3 + "+N" overflow badge
- [ ] Filter bar with only 1 available dimension renders gracefully (no empty dropdowns)
- [ ] Very long project names truncate with ellipsis on cards
- [ ] stitchCountApproximate=true renders "~" prefix on stitch count display
- [ ] Dark mode: gradient placeholders darken, filter bar uses dark stone background
