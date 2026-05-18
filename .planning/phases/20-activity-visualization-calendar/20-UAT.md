---
status: complete
phase: 20-activity-visualization-calendar
source: 20-01-SUMMARY.md, 20-02-SUMMARY.md, 20-03-SUMMARY.md, 20-04-SUMMARY.md
started: 2026-05-17T20:00:00Z
updated: 2026-05-17T20:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Activity Tab Layout
expected: Navigate to Stats page, click "Activity" tab. Five sections appear in order: pace cards, monthly chart, day-of-week chart, stitching calendar, session history table.
result: pass

### 2. Pace Cards Display
expected: Pace cards strip shows 5 metrics with green accent: 7-Day Avg, 30-Day Avg, 90-Day Avg, vs Last Month (with +/-/0% and trend arrow), Stitch Rate. Numeric values use monospace alignment.
result: pass

### 3. Monthly Stitch Chart with Year Nav
expected: 12-bar chart showing monthly totals. Left/right arrows navigate years. Current month's bar is full opacity, others slightly faded. Empty year shows "No stitching data for [year]".
result: issue
reported: "Current month's bar is not full opacity."
severity: cosmetic

### 4. Monthly Bar Drill-Down
expected: Click a non-zero bar — animated panel expands below showing daily breakdown: date, project name (clickable link to project page), stitch count. Click same bar again — panel collapses. Click different bar — switches to that month.
result: pass

### 5. Day of Week Chart
expected: Compact bar chart showing Mon-Sun average stitches per day. Display-only — no click interactions. Shows "No stitching data yet" if empty.
result: pass

### 6. Stitching Calendar
expected: Month-view grid starting Monday. Color-coded project session pills on days with activity. Today has green circle indicator and tinted background. Prev/next arrows navigate months. Legend below shows color swatches + project names.
result: pass

### 7. Calendar & Table Project Links
expected: Session pills in calendar and project names in session table link to the correct project page (URL uses chartId, not projectId). Clicking a link navigates to the project detail page.
result: pass

### 8. Session History Table
expected: Table with Date, Project, Stitches, Time, Photo columns. Click Date/Stitches/Time headers to sort. Project filter dropdown narrows results. Pagination shows "Page N of M" with Previous/Next buttons. Photo column shows camera icon for sessions with photos.
result: pass

### 9. No Duplicate Headings
expected: "Session History" heading appears only once (in the card header). No duplicate heading inside the table area. Similarly, monthly chart and calendar handle their own headings without duplication from the layout wrapper.
result: pass

### 10. Back-Navigation State Sync
expected: From Activity tab, click into a project via any link. Press browser back button. Charts and calendar reflect the correct data — no stale state from previous navigation.
result: pass

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Current month's bar is full opacity, others slightly faded"
  status: failed
  reason: "User reported: Current month's bar is not full opacity."
  severity: cosmetic
  test: 3
  artifacts: []
  missing: []
