# Test Specs: Stitching Sessions & Statistics

Framework-agnostic UI behavior test specs. Adapt to your testing setup.

## Overview
Test session logging, statistics display, bar chart drill-down, calendar navigation, session history editing, and the Year in Review page.

## User Flow Tests

### Log a Stitching Session
**Scenario:** User logs a stitching session via the FAB or header button.

#### Success Path
**Steps:**
1. Click the FAB (floating action button) at the bottom-right of the stats page
2. Modal opens with: date (defaults to today), project select, stitch count, optional photo, optional time
3. Select a project from the searchable dropdown (filtered to active projects only)
4. Enter stitch count: 250
5. Optionally set time spent: 1 hour 30 minutes
6. Click "Save"

**Expected Results:**
- [ ] Modal opens with today's date pre-filled
- [ ] Project select shows only "In Progress" and "On Hold" projects
- [ ] Project select is searchable by project name
- [ ] `onSaveSession` is called with { date, projectId, stitchCount: 250, timeSpentMinutes: 90 }
- [ ] Modal closes after save
- [ ] Stats on the page refresh (hero stats update)

#### Validation
**Steps:**
1. Open the log session modal
2. Leave stitch count empty
3. Click "Save"

**Expected Results:**
- [ ] Validation error shows on stitch count (required field)
- [ ] `onSaveSession` is not called

---

### Browse Statistics Page
**Scenario:** User scrolls through the statistics dashboard.

#### Success Path
**Steps:**
1. Navigate to the Stitching Sessions & Statistics page
2. Scroll through the page sections

**Expected Results:**
- [ ] Hero stats row shows: stitches today, this week, this month, this year in large JetBrains Mono numbers
- [ ] Personal best cards show achievement styling: subtle emerald glow border, trophy icon
- [ ] Monthly bar chart renders bars for each month of the current year in emerald fill
- [ ] Stitching calendar shows a monthly grid with project names and stitch counts per day
- [ ] Project stats cards show: total by status, started/finished this year, closest to completion, largest project
- [ ] Supply stats show: most-used DMC color, project using most colors, total unique DMC colors
- [ ] Session history table is sortable with columns: date, project, stitches, time, photo indicator

---

### Bar Chart Drill-Down
**Scenario:** User clicks a month bar in the stitch chart to see daily breakdown.

#### Success Path
**Steps:**
1. Click the "March" bar in the monthly stitch chart
2. Popover appears with daily breakdown

**Expected Results:**
- [ ] `onRequestDailyBreakdown` is called with month "March" and current year
- [ ] Popover/tooltip shows each day with sessions: date, stitch count, project name
- [ ] Popover stays contextual to the chart (no full-page navigation)
- [ ] Clicking elsewhere closes the popover

---

### Edit a Session
**Scenario:** User edits an existing session from the history table.

#### Success Path
**Steps:**
1. Click a session row in the session history table
2. Log modal opens pre-filled with the session data
3. Change stitch count from 250 to 300
4. Click "Save"

**Expected Results:**
- [ ] Modal opens with existing session data pre-filled (date, project, stitch count, time)
- [ ] `onSaveSession` is called with the updated session data (including the session ID)
- [ ] Stats recalculate after edit

#### Delete a Session
**Steps:**
1. Click a session row to open the edit modal
2. Click "Delete" button
3. Confirmation dialog appears
4. Click "Confirm"

**Expected Results:**
- [ ] Delete button is visible within the edit modal
- [ ] Confirmation dialog warns about recalculating progress
- [ ] `onDeleteSession` is called with the session ID
- [ ] Project's progress recalculates after deletion

---

### Navigate Stitching Calendar
**Scenario:** User browses different months on the stitching calendar.

#### Success Path
**Steps:**
1. View the stitching calendar showing the current month
2. Click the left arrow to go to the previous month
3. Observe the calendar updates

**Expected Results:**
- [ ] Calendar shows a monthly grid with day cells
- [ ] Day cells show project name (truncated) and stitch count, color-coded by project
- [ ] Empty days are blank
- [ ] `onCalendarMonthChange` is called with the new month and year
- [ ] Previous/next arrows navigate between months

## Empty State Tests
- [ ] Stats page with no sessions shows zero values in hero stats (not NaN or errors)
- [ ] Personal bests section shows placeholder when no sessions exist
- [ ] Monthly chart shows empty bars for months with no data
- [ ] Calendar shows blank grid for months with no sessions
- [ ] Session history table shows "No sessions logged yet" empty state
- [ ] Project Sessions tab with no sessions shows "Log your first session" CTA

## Component Interaction Tests
- [ ] Hero stat numbers use JetBrains Mono font
- [ ] Personal best cards are visually distinct from regular stat cards (emerald glow, trophy icon)
- [ ] Session history table sorts by date descending by default
- [ ] Photo indicator shows camera icon only when session has a photo
- [ ] Calendar cells are color-coded by project for visual distinction
- [ ] FAB remains visible while scrolling the stats page

## Edge Cases
- [ ] Session with 0 stitch count is handled gracefully (edge case for corrections)
- [ ] Session with timeSpentMinutes = null displays without time column content
- [ ] Calendar month with 31 days renders correctly
- [ ] Calendar month starting on different weekdays aligns correctly
- [ ] Very long project names truncate in calendar cells and session table
- [ ] Year in Review handles years with no session data gracefully
