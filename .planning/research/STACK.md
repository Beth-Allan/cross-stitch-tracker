# Technology Stack: v1.5 Statistics & Records

**Project:** Cross Stitch Tracker
**Researched:** 2026-05-17
**Confidence:** HIGH

## Executive Summary

v1.5 needs **one new npm dependency** (Recharts via shadcn/ui chart component) and **one utility library** (date-fns for date arithmetic). The key insight from reviewing the DesignOS reference: every visualization in the existing designs (MonthlyChart, StitchingCalendar, PersonalBests, YearInReview) is implemented as **CSS-only div-based charts** with calculated heights and inline styles. This was the right call for the initial design -- the bar charts are simple proportional divs, the calendar is a CSS grid, and progress bars are width-percentage divs.

However, the v1.5 milestone scope calls for "charting library integration for complex visualizations" including interactive tooltips, rolling averages overlaid on bar charts, day-of-week distribution, and collection breakdown donuts. These go beyond what CSS-only charts handle well. Recharts via the shadcn/ui `chart` component is the right choice: it is already the charting library that shadcn/ui wraps, uses Recharts v3 which supports React 19, and provides theme-aware tooltips and responsive containers that match the existing design system.

The calendar view in the designs is a **month-view calendar grid** (not a GitHub-style heatmap), so no heatmap library is needed. All calendar logic can be built with date-fns + CSS grid.

## Recommended Stack Additions

### Charting (NEW)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| recharts | 3.8.x | Interactive bar charts, donut/pie charts, line charts, radial bars | shadcn/ui ships a `chart` component that wraps Recharts v3. Not an abstraction layer -- you compose directly with Recharts components. React 19 supported via `peerDependencies: "^19.0.0"`. Already the ecosystem standard for shadcn-based apps. |
| shadcn/ui chart | (copy-paste) | ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend | Theme-aware chart wrapper that integrates CSS variables (`--chart-1` through `--chart-5`) with Recharts. Handles responsive sizing, tooltip styling consistent with design system. Installed via `npx shadcn@latest add chart`. |

### Date Utilities (NEW)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| date-fns | 4.1.0 | Date arithmetic for calendar grids, week boundaries, interval generation, month/year grouping | Functional API with excellent tree-shaking -- only imports used functions. No wrapper objects (unlike dayjs). Functions like `eachDayOfInterval`, `startOfWeek`, `format`, `differenceInCalendarMonths`, `getDay`, `startOfMonth`, `endOfMonth`, `isSameDay` are exactly what the calendar and time-series aggregation need. ESM-first in v4 with first-class TypeScript types. |

### NOT Adding

| Technology | Why Not |
|------------|---------|
| @uiw/react-heat-map | Designs show a month-view calendar grid, not a GitHub-style heatmap. No heatmap is in scope. |
| react-calendar-heatmap | Same -- no heatmap in designs. |
| visx / @visx/heatmap | Low-level D3 wrapper. Massive overkill for the chart types needed. 2-3x development time vs Recharts for equivalent output. |
| nivo | Beautiful defaults but large bundle size and heavy abstraction. Recharts is lighter and shadcn already wraps it. |
| Chart.js / react-chartjs-2 | Canvas-based (not SVG). Harder to style with Tailwind/CSS variables. No shadcn integration. |
| Apache ECharts | Overkill for single-user app. Heavy bundle. Imperative API doesn't fit React component model well. |
| dayjs | date-fns tree-shakes better for the specific functions needed. dayjs's plugin system adds complexity. |
| Framer Motion | CSS transitions sufficient for bar height animations and chart entry effects. The design reference uses inline `transition` properties, not spring physics. No animation library warranted. |
| react-sparklines | Recharts mini-AreaChart with hidden axes achieves the same result. One fewer dependency. |

## Integration Architecture

### Server/Client Split for Charts

Charts are interactive (tooltips, hover states, click handlers) so they must be Client Components. But the **data aggregation** happens server-side:

```
Server Component (stats page.tsx)
  --> Prisma queries: sessions, projects, supplies
  --> Server-side aggregation: group by month, calculate rolling averages, compute personal bests
  --> Pass pre-computed data as props

Client Component ("use client" chart wrapper)
  --> Receives aggregated data via props
  --> Renders Recharts components
  --> Handles tooltip interactions, hover states
```

This keeps the Recharts bundle out of the initial page load for users who navigate via SSR, and all expensive database queries + aggregation run on the server with zero client-side data processing.

### CSS Charts vs Recharts Decision Matrix

| Visualization | Use CSS-Only | Use Recharts | Rationale |
|---------------|-------------|-------------|-----------|
| Hero stat counters | Yes | -- | Pure text display, no chart needed |
| Monthly bar chart (basic) | Possible | **Yes** | Design shows interactive click-to-expand popover. Recharts tooltip/click handlers are more maintainable than custom DOM positioning. |
| Monthly bar chart (with rolling avg overlay) | -- | **Yes** | Line + bar combo chart. CSS-only would be painful. |
| Stitching calendar (month grid) | **Yes** | -- | CSS grid with date-fns for date math. The design is already a grid of clickable day cells. Recharts adds nothing here. |
| Personal bests cards | **Yes** | -- | Static card layout. Pure CSS. |
| Collection breakdown donut | -- | **Yes** | Recharts PieChart with innerRadius. Clean SVG with interactive segments. |
| Day-of-week distribution | -- | **Yes** | Recharts BarChart. Small bar chart with 7 bars. |
| Status breakdown donut | -- | **Yes** | Same as collection donut -- PieChart with innerRadius. |
| Year in Review bars | Possible | **Yes** | Consistency with Overview tab charts. Same component, different data. |
| Stitching pace line | -- | **Yes** | Recharts LineChart for trend visualization. |
| Project timeline (Gantt-style) | **Yes** | -- | The design uses positioned divs with percentage-based left/width. CSS is simpler and matches the design exactly. |
| Sparklines in stat cards | -- | **Yes** | Recharts AreaChart with height ~40px, no axes. Minimal config. |

### shadcn/ui Chart Theme Integration

The shadcn `chart` component uses CSS variables for colors:

```css
/* Already using semantic tokens -- extend for chart palette */
--chart-1: /* emerald-400 */
--chart-2: /* amber-400 */
--chart-3: /* sky-400 */
--chart-4: /* violet-400 */
--chart-5: /* rose-400 */
```

These map directly to the design's project color palette (emerald/blue/amber/violet/rose) used in the StitchingCalendar legend. The chart colors will be consistent across dark/light modes automatically.

### date-fns Usage Patterns

Key functions needed for statistics aggregation:

```typescript
import {
  eachDayOfInterval,      // Generate array of days for calendar grid
  eachMonthOfInterval,    // Generate month boundaries for bar charts
  startOfMonth,           // Month boundary for Prisma WHERE clauses
  endOfMonth,             // Month boundary for Prisma WHERE clauses
  startOfWeek,            // Week boundary for "this week" hero stat
  format,                 // Display formatting ("MMM yyyy", "EEE", etc.)
  getDay,                 // Day-of-week for distribution chart
  differenceInCalendarDays, // Streak calculation
  isSameDay,              // Today highlight in calendar
  subMonths,              // Rolling average window
  parseISO,               // Parse stored date strings
} from 'date-fns'
```

All functions are individually importable. Tree-shaking ensures only used functions end up in the bundle. Server-side aggregation uses these for Prisma query boundaries; client-side uses `format` for display labels.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Charting | Recharts 3 (via shadcn) | visx | visx is lower-level D3 primitives -- 2-3x dev time for same result. No shadcn integration. |
| Charting | Recharts 3 (via shadcn) | nivo | Larger bundle, heavier abstraction. Recharts gives more control over custom rendering. |
| Charting | Recharts 3 (via shadcn) | CSS-only everything | Would work for simple bars but breaks down for combo charts (bar+line), interactive donuts, and sparklines. Maintenance burden grows as chart complexity increases. |
| Date utils | date-fns 4.1 | dayjs | dayjs needs plugins for locale/format features. date-fns tree-shakes better per-function. Functional API matches project style. |
| Date utils | date-fns 4.1 | Native Intl/Date | Missing `eachDayOfInterval`, `startOfWeek`, `differenceInCalendarDays`. Would need to reimplement 10+ utility functions. |
| Calendar | Custom CSS grid | fullcalendar | Massive library for a read-only calendar display. Our calendar is view-only with session data -- CSS grid + date-fns is sufficient. |
| Heatmap | Not needed | @uiw/react-heat-map | Design shows month-view calendar, not contribution graph. |
| Animation | CSS transitions | Framer Motion | Designs use `transition: 150ms` inline. No spring physics or complex sequences needed. CSS is sufficient and zero-dependency. |

## Installation

```bash
# Add shadcn chart component (installs recharts as dependency)
npx shadcn@latest add chart

# Pin recharts to exact version after shadcn install
# Check installed version and remove caret from package.json

# Date utilities
npm install date-fns@4.1.0
# Then remove caret from package.json (project convention: exact versions)
```

**Post-install checklist:**
1. Verify recharts version in package.json -- remove `^` prefix (project convention)
2. Verify date-fns version in package.json -- remove `^` prefix
3. Verify no React 19 peer dependency warnings
4. Add chart CSS variables to globals.css (shadcn installer may do this automatically)

## Bundle Impact Assessment

| Package | Gzipped Size | Tree-Shakeable | Import Pattern |
|---------|-------------|----------------|----------------|
| recharts | ~40KB gzipped (full) | Partial -- import specific chart types | `import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'` |
| date-fns | ~2-5KB typical usage | Excellent -- per-function imports | `import { format, startOfMonth } from 'date-fns'` |
| shadcn chart | ~2KB | Copy-paste component | `import { ChartContainer, ChartTooltip } from '@/components/ui/chart'` |

Total new JS: approximately 45KB gzipped. Acceptable for a single-user PWA. Charts are client-only components, so they only load on pages that use them (code-splitting via Next.js dynamic imports if needed).

## Confidence Assessment

| Claim | Confidence | Source |
|-------|------------|--------|
| Recharts 3.x supports React 19 | HIGH | GitHub package.json peerDependencies: `"^19.0.0"` |
| shadcn/ui chart uses Recharts v3 | HIGH | Official shadcn docs + GitHub issues |
| date-fns 4.1 is latest stable | HIGH | npm registry + GitHub releases |
| CSS-only calendar is sufficient | HIGH | DesignOS reference already implements it as CSS grid |
| No heatmap library needed | HIGH | DesignOS screenshots show month-view calendar, not contribution graph |
| CSS transitions sufficient for animations | HIGH | DesignOS reference uses inline `transition` properties |

## Sources

- [Recharts GitHub - peerDependencies](https://github.com/recharts/recharts/blob/main/package.json) -- React 19 support confirmed
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/radix/chart) -- Official docs, Recharts v3 integration
- [Recharts Documentation](https://recharts.org/) -- Context7 verified, 114 code snippets
- [date-fns Documentation](https://date-fns.org/) -- Context7 verified, 140 code snippets
- [date-fns v4 Release](https://blog.date-fns.org/v40-with-time-zone-support/) -- ESM-first, tree-shaking improvements
- DesignOS reference: `product-plan/sections/stitching-sessions-and-statistics/` -- All chart designs reviewed
