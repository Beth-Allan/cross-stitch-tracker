# Stitching Sessions & Statistics

## Overview
Quick daily stitch session logging with a comprehensive statistics engine. Users log stitches after each session (date, project, count, optional photo, optional time), which auto-updates project progress. A single scrollable stats page displays all metrics, charts, calendar, personal bests, and session history. Includes a Year in Review summary and per-project session tabs.

## User Flows
- Log a stitching session via FAB or header button: date, project, stitch count, optional photo, optional time
- Browse the scrollable stats page with hero stats, personal bests, monthly bar chart, stitching calendar, project/supply stats, and session history
- Click a month bar in the chart to see a daily breakdown popover
- Navigate between calendar months to see per-day session details
- View per-project sessions on the Chart Detail Sessions tab with mini stats summary
- Edit or delete a session by clicking a row in the session history table
- Browse Year in Review with yearly hero stats, monthly pace, project timeline, top projects, and highlights

## Components Provided
- `StitchingDashboard` — Main scrollable stats page combining all stat card groups, chart, calendar, and session history
- `HeroStats` — Large stat numbers row: stitches today, this week, this month, this year (JetBrains Mono)
- `PersonalBests` — Achievement-styled cards with glow/trophy icon for records (most stitches in a day, longest streak)
- `MonthlyChart` — Bar chart of monthly stitch totals with click-to-drill-down popover
- `StitchingCalendar` — Monthly grid showing project name and stitch count per day with month navigation
- `StatCards` — Project and supply statistics cards
- `SessionHistory` — Sortable table of all sessions (date, project, stitches, time, photo indicator)
- `LogSessionModal` — Compact session logging/editing modal with date, project select, stitch count, photo, time
- `ProjectSessionsTab` — Chart Detail Sessions tab with project-scoped session table and mini stats summary
- `YearInReview` — Yearly summary page with hero stats, monthly pace, project timeline, top projects, highlights

## Props Reference

### Key Data Entities
- `StitchSession` — id, projectId, date, stitchCount, photoUrl, timeSpentMinutes
- `ActiveProject` — id, chartName, coverImageUrl, status, stitchCount, stitchesCompleted, progressPercent
- `HeroStats` — stitchesToday, stitchesThisWeek, stitchesThisMonth, stitchesThisYear
- `PersonalBest` — label, value, date, endDate, projectName
- `MonthlyStitchTotal` — month, year, totalStitches
- `CalendarDay` — date, sessions[] (projectId, projectName, stitchCount)
- `ProjectSessionSummary` — totalStitches, sessionsLogged, averagePerSession, firstSessionDate, lastSessionDate
- `YearInReviewData` — year, heroStats, monthlyTotals, monthlyPace, projectTimeline, highlights, topProjects, favouriteSupplies

### Key Callback Props
- `onSaveSession` — Called when the user submits the log session modal (create or edit)
- `onDeleteSession` — Called when the user deletes a session
- `onUploadPhoto` — Called when the user uploads a progress photo
- `onRequestDailyBreakdown` — Called when the user clicks a month bar for daily breakdown
- `onCalendarMonthChange` — Called when the user navigates to a different calendar month
- `onNavigateToProject` — Called when the user clicks a project name
- `onYearChange` — Called when Year in Review year is changed

## Visual Reference
See the screenshot .png files in this directory for the target UI design.
