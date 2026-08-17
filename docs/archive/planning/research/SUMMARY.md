# Research Summary: v1.5 Statistics & Records

**Project:** Cross-Stitch Tracker — Milestone 5
**Domain:** Statistics dashboard, data visualization, personal records
**Researched:** 2026-05-17
**Confidence:** HIGH

## Executive Summary

v1.5 adds a full stats experience to the mature Next.js 16 app. Two new dependencies: Recharts 3.8.x (via `npx shadcn@latest add chart`) and date-fns 4.1.0. The architecture directly extends the existing dashboard pattern: Server Component page with `Promise.all`, pre-aggregated data passed as props to Client Component chart wrappers, `unstable_cache` with `revalidateTag("stats")` on session mutations.

No schema migrations needed — all data sources (StitchSession, Project, Chart, supply junction tables) already exist. The DesignOS reference specifies every visualization, so there is no design ambiguity.

## Stack Additions

| Technology | Version | Purpose |
|-----------|---------|---------|
| Recharts | 3.8.x | Bar charts, donut/pie, line charts (via shadcn chart component) |
| date-fns | 4.1.0 | Date arithmetic for calendar grids, month boundaries, interval generation |

**Not adding:** visx, nivo, Chart.js, dayjs, Framer Motion, any heatmap library.

**Key insight:** The DesignOS calendar is a month-view grid (CSS Grid + date-fns), NOT a GitHub-style heatmap. No heatmap library needed.

## Feature Table Stakes

10 table-stakes features identified — all represented in DesignOS spec:
- Lifetime hero counters, rolling time-window stats
- Monthly bar chart with drill-down
- Stitching calendar (daily activity grid)
- Session history table
- Personal bests / records / streaks
- Collection overview (status/size breakdowns)
- Stitch rate calculation
- Project-level session stats (already built in v1.2)

## Differentiators (unique value)

- "New record!" celebration toast on session log (Strava-inspired)
- Day-of-week pattern analysis
- Designer/genre breakdown stats
- Favourite supplies analysis (most-used thread colors)
- Stitching pace trends (month-over-month velocity)
- Estimated completion dates (when sufficient data)
- Year in Review (deferred to v1.6)

## Architecture Approach

Dedicated query layer in `src/lib/queries/stats/` (pure functions, no "use server"):
- DB-level `groupBy`/`aggregate` for time-series data
- In-memory for small collections (streaks, breakdowns)
- `unstable_cache` with tag-based invalidation (5-min TTL + on-demand via session mutations)
- Recharts components always Client Components with dynamic import
- Auth guard at page level, userId passed to query functions

## Critical Pitfalls

1. Charting library SSR — Recharts requires `"use client"` + skeleton loading states
2. Neon cold start — mitigated by existing `Promise.all` pattern; don't split into separate server actions
3. Timezone bugs — sessions store UTC, user expects local-time boundaries; handle at query level
4. Bundle size — dynamic imports + route-level code splitting essential
5. "Calculated at query time" constraint is compatible with SQL aggregation (don't store pre-computed columns, but DO use SQL GROUP BY)
6. Over-engineering the aggregation layer — start simple, optimize only if measured

## Suggested Build Order (4 phases)

1. **Stats Data Layer & Core Engine** — types, query functions, caching, timezone handling. No UI. Enables TDD.
2. **Stats Page Core UI (Overview Tab)** — hero counters, personal bests, monthly bar chart, collection breakdown. Recharts installed here.
3. **Stitching Calendar & Activity Tab** — CSS Grid calendar with month navigation, session history, stitch rate.
4. **Celebrations & Polish** — "New record!" toast, designer/genre/supply insights, pace trends.

## Open Questions for Planning

- Confirm `StitchSession.date` field type (timestamptz vs date) — determines timezone complexity
- Decide USER_TIMEZONE approach (hardcode Pacific vs env var)
- Pin exact Recharts version after shadcn install, remove caret
- CSS `conic-gradient` vs Recharts PieChart for status donut

---
*Research completed: 2026-05-17*
*Ready for requirements: yes*
