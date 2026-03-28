# Milestone 4: Stitching Sessions & Statistics

**Provide alongside:** `product-overview.md`, `design-system/`, `data-shapes/stitching-sessions-and-statistics/types.ts`

**Prerequisites:** Milestone 2 (Project Management) — projects must exist to log sessions against.

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

Build the session logging and statistics engine so users can track their daily stitching, see comprehensive stats, and review their stitching history across calendar and chart views.

## Overview

Users log stitching sessions quickly — date, project, stitch count, optional photo and time. Logging a session auto-updates the linked project's progress. The Stats page is a four-tab dashboard: Overview (hero stats, personal bests, monthly chart, project/supply stats), Calendar (monthly grid of stitching days), Sessions (sortable history table), and Year in Review (annual retrospective). The Chart Detail Sessions tab shows per-project sessions and a mini stats summary.

## Key Functionality

- **Log Session modal:** compact form with date, project select (active projects only), stitch count, optional photo upload, optional time spent
- **Auto-updating progress:** saving a session recalculates the linked project's stitchesCompleted, progressPercent, and stitchesRemaining
- **Stitching Dashboard** with 4 tabs:
  - **Overview:** hero stats row (today, week, month, year), personal bests, monthly bar chart, project stats, supply stats
  - **Calendar:** monthly grid with project name and stitch count per day, month navigation
  - **Sessions:** sortable table of all sessions (date, project, stitches, time, photo indicator)
  - **Year in Review:** yearly retrospective with hero stats, monthly chart, project timeline, top projects, favourite supplies, highlights
- **Hero stats** use JetBrains Mono for numbers; all other text uses Source Sans 3
- **Personal best cards** with achievement styling: subtle emerald glow, trophy icon
- **Monthly bar chart** with click-to-drill-down: clicking a month bar shows a popover with daily breakdown
- **Session editing:** click a session row to re-open the log modal pre-filled; delete available within
- **Year selector** for reviewing past years
- **Chart Detail Sessions tab:** per-project session table with mini stats summary

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `StitchingDashboard` | `sections/stitching-sessions-and-statistics/components/StitchingDashboard.tsx` | Four-tab dashboard (Overview, Calendar, Sessions, Year in Review) |
| `ProjectSessionsTab` | `sections/stitching-sessions-and-statistics/components/ProjectSessionsTab.tsx` | Chart Detail embed with per-project sessions |
| `LogSessionModal` | `sections/stitching-sessions-and-statistics/components/LogSessionModal.tsx` | Compact modal for create/edit session |
| `HeroStats` | `sections/stitching-sessions-and-statistics/components/HeroStats.tsx` | Large stat numbers row |
| `PersonalBests` | `sections/stitching-sessions-and-statistics/components/PersonalBests.tsx` | Achievement-styled best-of cards |
| `MonthlyChart` | `sections/stitching-sessions-and-statistics/components/MonthlyChart.tsx` | Bar chart with drill-down popover |
| `StitchingCalendar` | `sections/stitching-sessions-and-statistics/components/StitchingCalendar.tsx` | Monthly grid calendar |
| `SessionHistory` | `sections/stitching-sessions-and-statistics/components/SessionHistory.tsx` | Sortable session table |
| `YearInReview` | `sections/stitching-sessions-and-statistics/components/YearInReview.tsx` | Annual retrospective page |

## Props Reference

### Key Types

```typescript
interface StitchSession {
  id: string; projectId: string; date: string;
  stitchCount: number; photoUrl: string | null; timeSpentMinutes: number | null;
}
interface HeroStats {
  stitchesToday: number; stitchesThisWeek: number;
  stitchesThisMonth: number; stitchesThisYear: number;
}
interface YearInReviewData {
  year: number; availableYears: number[];
  heroStats: YearlyHeroStats; monthlyTotals: MonthlyStitchTotal[];
  projectTimeline: ProjectTimelineEntry[]; topProjects: TopProject[];
  favouriteSupplies: FavouriteSupply[]; highlights: YearHighlight[];
}
```

### StitchingDashboard Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onSaveSession` | `(session: Partial<StitchSession>) => void` | User submits the log session modal |
| `onDeleteSession` | `(sessionId: string) => void` | User deletes a session |
| `onUploadPhoto` | `(sessionId: string, file: File) => void` | User attaches a progress photo |
| `onRequestDailyBreakdown` | `(month: string, year: number) => DailyBreakdown[]` | User clicks a month bar |
| `onCalendarMonthChange` | `(month: number, year: number) => void` | User navigates calendar months |
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |

### YearInReview Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onYearChange` | `(year: number) => void` | User selects a different year |
| `onNavigateToProject` | `(projectId: string) => void` | User clicks a project name |

### ProjectSessionsTab Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onSaveSession` | `(session: Partial<StitchSession>) => void` | User logs a session from project detail |
| `onDeleteSession` | `(sessionId: string) => void` | User deletes a session |
| `onUploadPhoto` | `(sessionId: string, file: File) => void` | User uploads a photo |

## Expected User Flows

### 1. Log a Stitching Session
1. User clicks "Log Stitches" in the top bar (or FAB on Stats page)
2. Modal opens with today's date pre-filled
3. User selects a project, enters 450 stitches, optionally adds a photo
4. User saves; modal closes
5. **Outcome:** Session recorded; project progress auto-updates; hero stats refresh

### 2. Browse Statistics
1. User navigates to Stats from the sidebar
2. Overview tab shows: hero stats row, personal bests, monthly bar chart, project and supply stats
3. User clicks the "March" bar in the chart; popover shows daily breakdown for March
4. User switches to Calendar tab and navigates to a previous month
5. **Outcome:** Comprehensive stats visible at a glance with drill-down capability

### 3. Review the Year
1. User switches to the Year in Review tab
2. Current year's retrospective loads: total stitches, stitching days, top projects, monthly pace
3. User selects a previous year from the year picker
4. Stats update to reflect that year's data
5. **Outcome:** Annual retrospective with project timeline and highlights

### 4. Edit or Delete a Session
1. User goes to the Sessions tab and clicks a session row
2. Log modal opens pre-filled with the session's data
3. User corrects the stitch count and saves (or clicks delete and confirms)
4. **Outcome:** Session updated or removed; project progress recalculated

## Empty States

- **No sessions logged:** "Start tracking your stitching! Log your first session." with prominent "Log Session" button
- **Empty calendar month:** Cells show as blank/empty; no error message needed
- **No Year in Review data:** "No stitching data for [year]. Log sessions to build your review!" with link to log
- **Empty project sessions tab:** "No sessions for this project yet. Log your first session." with "Log Session" button

## Files to Reference

- `sections/stitching-sessions-and-statistics/components/` — All screen design components
- `data-shapes/stitching-sessions-and-statistics/types.ts` — TypeScript interfaces for StitchSession, HeroStats, PersonalBest, CalendarDay, YearInReviewData
- `product/sections/stitching-sessions-and-statistics/spec.md` — Full specification
- `product/sections/stitching-sessions-and-statistics/data.json` — Sample data
- `product/sections/stitching-sessions-and-statistics/*.png` — Screenshots (dashboard-overview, dashboard-calendar, dashboard-sessions, dashboard-year-in-review, project-sessions-tab)

## Done When

- [ ] Log session modal works: create, edit, and delete sessions
- [ ] Project progress (stitchesCompleted, progressPercent, stitchesRemaining) auto-updates on session save/delete
- [ ] Overview tab: hero stats render with JetBrains Mono numbers
- [ ] Personal bests display with achievement styling (emerald glow, trophy icon)
- [ ] Monthly bar chart renders with emerald bars; clicking a bar shows daily breakdown popover
- [ ] Calendar tab shows monthly grid with project names and stitch counts per day
- [ ] Calendar supports month-by-month navigation
- [ ] Sessions tab shows a sortable table (date, project, stitches, time, photo indicator)
- [ ] Year in Review tab shows annual stats with year selector
- [ ] Chart Detail Sessions tab shows per-project sessions and mini stats summary
- [ ] Project select in log modal filters to active projects (In Progress / On Hold)
- [ ] Photo upload works for session progress photos
- [ ] Responsive: stat cards stack on mobile, calendar collapses to list on narrow screens
- [ ] Light and dark mode work correctly
