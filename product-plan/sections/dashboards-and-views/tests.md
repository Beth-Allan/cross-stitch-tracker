# Test Specs: Dashboards & Views

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test the four dashboard pages: Main Dashboard sections and quick actions, Pattern Dive tabs and filtering, Project Dashboard progress buckets and finished gallery, and Shopping Cart aggregation with mark-as-acquired.

## User Flow Tests

### Main Dashboard — Browse Home Screen
**Scenario:** User lands on the app and sees the Main Dashboard.

#### Success Path
**Steps:**
1. Navigate to the Main Dashboard (home page)
2. Scroll through all sections

**Expected Results:**
- [ ] "Recently Added" row shows last 10 charts as horizontally scrollable gallery cards
- [ ] "Currently Stitching" row shows active WIP projects with progress bars, sorted by most recently worked on
- [ ] "Buried Treasures" section shows the 5 oldest unstarted charts with date added and "days in library" count
- [ ] "Rediscover This One" spotlight shows a large featured card with cover image, designer, genres, status, and CTA button
- [ ] Collection stats section shows key numbers
- [ ] Goals summary shows upcoming milestones and planned starts
- [ ] All sections stack vertically with generous spacing (48px+)
- [ ] Section headings use Fraunces with subtle emerald accent underline
- [ ] No tabs on this page

---

### Main Dashboard — Quick Actions
**Scenario:** User uses the quick-add menu to perform common actions.

#### Success Path
**Steps:**
1. Click the "Log Stitches" quick action button
2. Click the "Add Chart" quick action button
3. Click the "Add Fabric" quick action button

**Expected Results:**
- [ ] `onQuickAdd` is called with "logStitches" for Log Stitches
- [ ] `onQuickAdd` is called with "chart" for Add Chart
- [ ] `onQuickAdd` is called with "fabric" for Add Fabric
- [ ] Quick action buttons use emerald (Log Stitches), amber (Add Chart), stone (Add Fabric) accents

---

### Pattern Dive — Browse with Filters
**Scenario:** User uses Pattern Dive to browse their full library with advanced filtering.

#### Success Path
**Steps:**
1. Navigate to Pattern Dive, Browse tab is active by default
2. Apply status filter: "In Progress"
3. Apply size filter: "BAP"
4. Switch to What's Next tab
5. Switch to Fabric Requirements tab
6. Switch to Storage View tab

**Expected Results:**
- [ ] Browse tab shows full gallery with advanced filter bar (all dimensions available)
- [ ] Filter changes call `onFilterChange` with updated state
- [ ] What's Next tab shows kitted/want-to-start projects sorted by priority
- [ ] Fabric Requirements table shows project name, stitch dimensions, calculated fabric sizes at 14ct, 18ct, 25ct, 28ct
- [ ] Fabric size cells use emerald text when matching fabric exists, stone otherwise
- [ ] Storage View shows collapsible sections per storage location with item counts

---

### Project Dashboard — In Progress
**Scenario:** User reviews their active projects and progress.

#### Success Path
**Steps:**
1. Navigate to Project Dashboard, In Progress tab active
2. Observe the hero stats row
3. Browse progress buckets

**Expected Results:**
- [ ] Hero stat row shows: total WIPs, average progress, closest to completion
- [ ] Hero stat numbers use JetBrains Mono font
- [ ] Progress buckets group projects by completion range (0-25%, 25-50%, 50-75%, 75-100%)
- [ ] Each bucket shows project cards with progress bars and key stats
- [ ] Clicking a project name calls `onNavigateToProject`

---

### Shopping Cart — Browse and Acquire
**Scenario:** User reviews shopping needs and marks items as acquired.

#### Success Path
**Steps:**
1. Navigate to Shopping Cart, Threads tab active
2. Observe thread needs grouped by thread (combined across projects)
3. Expand a thread row to see per-project breakdown
4. Hover over a row and click "Mark as acquired"
5. Switch to the Summary tab
6. Click "Copy to clipboard"

**Expected Results:**
- [ ] Threads tab shows: DMC code, color swatch (16px hex circle), color name, quantity needed, acquired, remaining, project names
- [ ] Same thread needed by multiple projects shows combined quantity with expandable breakdown
- [ ] `onMarkAcquired` is called with type "thread", threadId, and quantity
- [ ] Tab badges show count of unfulfilled items
- [ ] Summary tab shows cross-project overview with total items
- [ ] "Copy to clipboard" generates a text shopping list
- [ ] "Mark as acquired" button appears on hover (edit-on-hover pattern)

## Empty State Tests
- [ ] Main Dashboard with no charts shows welcome message with "Add your first chart" CTA
- [ ] Main Dashboard with no WIPs shows "Currently Stitching" row with "Start a project" prompt
- [ ] Buried Treasures with fewer than 5 unstarted charts shows all available
- [ ] Pattern Dive Browse with no filter results shows "No projects match your filters"
- [ ] Shopping Cart with no unfulfilled needs shows "Shopping list is empty" on each tab
- [ ] Shopping Cart tab badges show 0 when all items are fulfilled

## Component Interaction Tests
- [ ] Spotlight "Rediscover This One" card is visually larger than standard cards with stone border
- [ ] `onRefreshSpotlight` loads a different random project
- [ ] Fabric Requirements table is sortable by any column
- [ ] Storage View sections collapse/expand with chevron toggle
- [ ] Shopping Cart per-project filter narrows all tabs to one project's needs
- [ ] Progress bucket headers show range labels and project counts

## Edge Cases
- [ ] Main Dashboard with exactly 10 recent charts fills the row without overflow issues
- [ ] Spotlight with a project that has no cover image shows gradient placeholder
- [ ] Fabric Requirements with a project that has 0 stitch dimensions shows "N/A" for calculations
- [ ] Shopping Cart thread with 0 remaining (fully acquired) shows fulfilled indicator
- [ ] Storage View with unassigned projects groups them under "No Location"
- [ ] Very long project names truncate in all dashboard cards and table cells
