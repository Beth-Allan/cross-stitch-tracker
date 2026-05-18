# Phase 20: Activity Visualization & Calendar - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 20-Activity Visualization & Calendar
**Areas discussed:** Monthly chart interaction, Calendar implementation, Session history table, Pace & pattern metrics

---

## Monthly Chart Interaction

### Chart Engine

| Option | Description | Selected |
|--------|-------------|----------|
| Recharts BarChart | Consistent with existing size/designer/genre charts. Gets tooltips, animations, responsive container for free. | ✓ |
| CSS bars (DesignOS style) | Matches the DesignOS MonthlyChart.tsx exactly. More control over popover positioning, but introduces a second charting approach. | |
| You decide | Let Claude pick based on what works best with the existing codebase. | |

**User's choice:** Recharts BarChart
**Notes:** Consistency with Phase 18/19 chart approach was the deciding factor.

### Drill-Down Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Inline expand below chart | Clicking a bar expands a panel directly below the chart showing that month's daily sessions. Clean, no floating elements. | ✓ |
| Popover near bar (DesignOS style) | A floating card appears anchored near the clicked bar. Matches DesignOS closely, but trickier to position responsively. | |
| Navigate to filtered view | Clicking a bar scrolls to / filters the session history table to show only that month's sessions. | |

**User's choice:** Inline expand below chart
**Notes:** None

### Time Range

| Option | Description | Selected |
|--------|-------------|----------|
| Current calendar year (Jan-Dec) | Shows all 12 months of the current year. Matches DesignOS heading "Monthly Stitches — 2026". | ✓ |
| Rolling 12 months | Shows the last 12 months from today. Always has data density. | |
| You decide | Let Claude pick based on data patterns. | |

**User's choice:** Current calendar year (Jan-Dec)
**Notes:** None

### Year Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Year selector | Small prev/next year arrows near the heading. Lets users compare across years. | ✓ |
| Current year only | Simpler, no navigation needed. | |
| You decide | Let Claude pick. | |

**User's choice:** Year selector
**Notes:** None

---

## Calendar Implementation

### Data Loading

| Option | Description | Selected |
|--------|-------------|----------|
| Fetch per month | Initial load only fetches current month. Navigating triggers a server action. Calendar data cached per-month with long TTL. | ✓ |
| Preload current + adjacent | Fetch current month plus previous and next on initial load. Smoother UX but more complex. | |
| All months up front | Fetch full year of calendar data in initial page load. Simplest but could be slow. | |

**User's choice:** Fetch per month
**Notes:** None

### Project Colors

| Option | Description | Selected |
|--------|-------------|----------|
| Chart CSS variables | Use existing --chart-1 through --chart-5 design tokens, cycling through them. Consistent with Recharts chart colors. | ✓ |
| DesignOS hardcoded palette | Use the 5-color palette from StitchingCalendar.tsx. Different from chart tokens. | |
| You decide | Let Claude pick based on visual consistency. | |

**User's choice:** Chart CSS variables
**Notes:** None

### Day Click Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to project detail | Clicking project pill takes you to /projects/[id]. Matches INS-06 requirement. | ✓ |
| Expand day detail inline | Clicking shows expanded view of that day's sessions without leaving page. | |
| You decide | Let Claude pick. | |

**User's choice:** Navigate to project detail
**Notes:** None

### Mobile Responsiveness

| Option | Description | Selected |
|--------|-------------|----------|
| Compact grid with truncation | Keep 7-column grid but shrink cells. Show stitch count dots/indicators instead of full project pills. | ✓ |
| Hide calendar on mobile | Show calendar only on md+ breakpoints. Show simple list on mobile. | |
| You decide | Let Claude pick. | |

**User's choice:** Compact grid with truncation
**Notes:** None

---

## Session History Table

### Pagination

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side pagination | Fetch 20-25 sessions per page with prev/next controls. Sorting server-side. Scales well. | ✓ |
| Load more button | Initial load of 25, append on click. Simpler but sorting is awkward. | |
| Client-side (all at once) | Fetch all sessions, sort/paginate client-side. Won't scale. | |

**User's choice:** Server-side pagination
**Notes:** None

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Part of Activity tab | Section within Activity tab below calendar. Keeps all activity content together. | ✓ |
| Separate Sessions tab | Put in existing Sessions placeholder slot. Matches DesignOS tab structure. | |
| Rename Activity tab with sub-sections | Add sub-navigation within Activity tab. | |

**User's choice:** Part of Activity tab
**Notes:** None

### Edit Functionality

| Option | Description | Selected |
|--------|-------------|----------|
| View only | Stats page for viewing/analysis only. Editing lives on project detail page. | ✓ |
| Edit button per row | Matches DesignOS. Clicking would open modal or navigate to edit flow. | |
| You decide | Let Claude pick. | |

**User's choice:** View only
**Notes:** None

### Filtering

| Option | Description | Selected |
|--------|-------------|----------|
| Sort only | Sortable by Date, Stitches, Time columns. No filter dropdowns. | |
| Sort + project filter | Add a project dropdown filter above the table for project-specific views. | ✓ |
| You decide | Let Claude pick. | |

**User's choice:** Sort + project filter
**Notes:** User opted for the filter to enable analyzing stitching patterns on specific projects.

---

## Pace & Pattern Metrics

### Day-of-Week Visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Small bar chart (7 bars) | Compact Recharts BarChart showing average stitches per day of week. Consistent with existing charts. | ✓ |
| Radar/spider chart | 7-point radar chart. Visually distinctive but harder to read exact values. | |
| You decide | Let Claude pick. | |

**User's choice:** Small bar chart (7 bars, Mon-Sun)
**Notes:** None

### Rolling Averages & Pace Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Stats cards row | Horizontal compact stat cards similar to Phase 19 metrics bar. Shows 7/30/90-day avg + MoM trend with arrow. | ✓ |
| Line chart overlay | Recharts LineChart showing rolling average trends over time. | |
| Integrated into monthly chart | Add rolling average lines overlaid on monthly bar chart. | |

**User's choice:** Stats cards row
**Notes:** None

### Stitch Rate Placement

| Option | Description | Selected |
|--------|-------------|----------|
| In the pace cards row | Add stitch rate as one of the stats cards alongside rolling averages. | ✓ |
| In monthly chart drill-down | Show stitch rate in the inline expand when clicking a monthly bar. | |
| You decide | Let Claude pick. | |

**User's choice:** In the pace cards row
**Notes:** None

### Activity Tab Layout Order

| Option | Description | Selected |
|--------|-------------|----------|
| Pace → Monthly → Day-of-week → Calendar → Sessions | Progressive detail: summary metrics first, yearly view, patterns, calendar, full log. | ✓ |
| Monthly → Pace → Calendar → Day-of-week → Sessions | Big visual (monthly bars) as hero element. | |
| You decide | Let Claude determine flow. | |

**User's choice:** Pace cards → Monthly chart → Day-of-week chart → Calendar → Session table
**Notes:** None

---

## Claude's Discretion

- Exact sessions per page count (20 vs 25)
- Inline expand panel design for monthly chart drill-down
- Day-of-week chart positioning relative to monthly chart
- Calendar compact mode breakpoint
- Project filter dropdown component choice
- Whether pace cards use MetricsBar pattern or lighter approach
- Animation/transitions for expand/collapse

## Deferred Ideas

None — discussion stayed within phase scope
