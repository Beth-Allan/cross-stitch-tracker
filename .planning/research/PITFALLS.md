# Domain Pitfalls

**Domain:** Statistics dashboard, visual charts, personal bests -- adding charting library and aggregate queries to existing Next.js App Router application
**Researched:** 2026-05-17
**Confidence:** HIGH (verified against project codebase patterns, Neon documentation, charting library ecosystem research, Next.js App Router streaming docs)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Charting Library Hydration Mismatch in App Router

**What goes wrong:**
Charting libraries (Recharts, Visx, Chart.js) use browser APIs (DOM measurement, `window.innerWidth`, `ResizeObserver`) internally. When rendered in a Server Component or pre-rendered during SSR, the server output differs from client output, causing React hydration mismatches and console errors. In App Router, this manifests as either a runtime error or visual flash where charts render incorrectly then re-render.

**Why it happens:**
Next.js App Router renders Server Components on the server by default. Chart components that measure container width or use `window` produce different output server-side (where these APIs don't exist) vs client-side. The project's existing pattern is "Server Components by default, 'use client' only for interactivity" -- a chart component *requires* client-side rendering but developers may forget to properly isolate it.

**Consequences:**
- Hydration mismatch warnings flooding the console
- Charts flash or render at wrong dimensions on first paint
- In worst case, React bails out of hydration and re-renders entire subtree, causing CLS (Cumulative Layout Shift)
- Responsive container sizing breaks because server has no viewport dimensions

**Prevention:**
```tsx
// CORRECT: Dynamic import with ssr: false for chart wrapper
import dynamic from "next/dynamic";

const MonthlyBarChart = dynamic(
  () => import("@/components/features/stats/monthly-bar-chart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={240} />,
  }
);
```

Always create a dedicated client component file for each chart type, mark it `"use client"`, and import it via `next/dynamic` with `ssr: false` from the Server Component page. The `loading` prop provides the skeleton that streams with the page shell.

**Detection:**
- Console warning: "Text content does not match server-rendered HTML"
- Charts visually "jump" on page load
- `ResponsiveContainer` (Recharts) renders at 0 width initially

---

### Pitfall 2: Neon Cold Start Waterfall on Multiple Aggregate Queries

**What goes wrong:**
The statistics page requires 6-10+ aggregate queries (lifetime totals, monthly breakdowns, personal bests, designer stats, genre stats). If these run sequentially, Neon's cold start (300-800ms) compounds with each query's execution time. A stats page with 8 queries taking 100ms each becomes 800ms + 300-800ms cold start = 1.1-1.6 seconds blocking before any content renders.

**Why it happens:**
Neon scales compute to zero after 5 minutes of inactivity. The first query after idle triggers a cold start. The project already uses `Promise.all()` for the main dashboard (decision D-02 in PROJECT.md) -- but a new developer adding stats queries might not follow this pattern, or might split queries across separate server actions called from different Suspense boundaries, each triggering its own cold start if the connection wasn't warmed.

The project uses `@prisma/adapter-neon` (HTTP-based serverless driver), which means each Prisma call is a separate HTTP request to Neon -- there's no persistent TCP connection to amortize cold start across. However, Neon's compute wakes on first request and stays warm for subsequent requests in the same invocation.

**Consequences:**
- Stats page takes 2-3 seconds on cold start instead of 0.5-1 second
- User sees blank loading state for too long after inactivity
- If queries are split across multiple server actions in separate Suspense boundaries, each boundary may appear independently slow

**Prevention:**
```typescript
// CORRECT: Single server action, single cold start, parallel queries
export async function getStatsDashboardData(): Promise<StatsDashboardData> {
  const user = await requireAuth();

  // All queries fire in parallel -- Neon wakes once, handles all
  const [lifetime, monthly, records, designers, genres] = await Promise.all([
    getLifetimeStats(user.id),
    getMonthlyActivity(user.id),
    getPersonalBests(user.id),
    getDesignerInsights(user.id),
    getGenreBreakdown(user.id),
  ]);

  return { lifetime, monthly, records, designers, genres };
}
```

Keep the existing `Promise.all()` pattern. Bundle related queries into a single server action per logical "section" of the stats page. The first query in the batch warms Neon; subsequent queries in the same `Promise.all()` hit a warm compute.

**Detection:**
- Stats page consistently slow after 5+ minutes of inactivity
- Individual Suspense boundaries resolving sequentially instead of together
- Network waterfall visible in browser DevTools showing sequential DB calls

---

### Pitfall 3: Bundle Size Explosion from Charting Library

**What goes wrong:**
Adding Recharts naively imports the entire library (~50KB gzipped, ~165KB parsed). Combined with its D3 subdependencies, the client bundle for the stats page balloons by 100-200KB. Since this project has had *zero new npm dependencies* added in the last two milestones (v1.3 and v1.4 both achieved this), a single charting library could represent 30-50% growth in client JavaScript.

**Why it happens:**
Recharts bundles all chart types together. Importing `import { BarChart, LineChart, AreaChart } from 'recharts'` pulls the entire library unless you use specific subpath imports. Tree-shaking helps but isn't perfect with Recharts' internal D3 dependencies. Additionally, if chart components aren't properly code-split, they bloat the shared chunk used across all pages.

**Consequences:**
- Time-to-Interactive increases on all pages if chart code lands in shared bundle
- Stats page JavaScript exceeds reasonable budget (target: <200KB for page-specific JS)
- Mobile performance degrades (single-user app but used on iPhone)
- Build time increases noticeably

**Prevention:**

1. **Route-level code splitting**: Chart components only load on the `/stats` route. Use `next/dynamic` with `ssr: false` -- this automatically code-splits.

2. **Consider Visx over Recharts**: Visx is modular by design (~15KB for what you actually use). You import only the packages needed: `@visx/bar`, `@visx/axis`, `@visx/scale`. Trade-off: steeper learning curve, more manual work, but dramatically smaller bundle.

3. **Audit with bundle analyzer**:
```bash
# After adding chart library
ANALYZE=true npm run build
# Check that chart code only appears in stats page chunk
```

4. **CSS-first for simple visualizations**: The project already has CSS-only `ProgressBar` and SVG `StatusDonut`. Continue using CSS for bar charts, donuts, and simple counters. Only reach for a library for complex interactive charts (heatmap calendar, time-series with tooltips).

**Detection:**
- `npm run build` output shows significantly larger first-load JS
- Lighthouse Performance score drops
- Bundle analyzer shows recharts/d3 in shared chunks

---

### Pitfall 4: "Calculated at Query Time" Constraint Meets N-Thousand Sessions

**What goes wrong:**
The project constraint is "calculated fields at query time, never stored in DB." For basic stats (project count, total stitches), this works fine with 500 projects. But time-series statistics require aggregating *all sessions* -- potentially thousands of records -- on every page load. Monthly bar charts need `GROUP BY month` across the full session history. Personal bests need scanning all sessions to find maximums. As session count grows, query time grows linearly.

**Why it happens:**
The existing dashboard fetches all projects with their sessions included (`include: { sessions: { ... } }`) and aggregates in-memory in JavaScript. This pattern (established in `project-dashboard-actions.ts`) works because project count is bounded (~500) and sessions per project are manageable. But a *global* stats view aggregating across ALL sessions for ALL projects simultaneously is a different magnitude.

With 500 projects and an average of 20 sessions each = 10,000 sessions to scan. A power user stitching daily for 2 years = 730+ sessions per project. The constraint says "don't store aggregates" but doesn't say "don't use SQL aggregation" -- the distinction matters.

**Consequences:**
- Stats page response time grows linearly with session count
- Neon pageserver overhead compounds on large sequential scans
- In-memory aggregation in JS burns server CPU and increases response size (serializing thousands of session objects)
- Eventually hits Vercel function timeout (10s default, 60s max on free tier)

**Prevention:**

Use **SQL-level aggregation** (Prisma `aggregate()` and `groupBy()`) rather than fetching all records and aggregating in JavaScript. This keeps the "calculated at query time" spirit while being dramatically more efficient:

```typescript
// BAD: Fetch all sessions, aggregate in JS
const sessions = await prisma.stitchSession.findMany({ where: { ... } });
const monthlyTotals = sessions.reduce((acc, s) => { /* group by month */ }, {});

// GOOD: Let PostgreSQL do the aggregation
const monthlyTotals = await prisma.stitchSession.groupBy({
  by: ["date"], // Note: need raw query for date_trunc
  where: { project: { userId: user.id } },
  _sum: { stitchCount: true },
});

// BEST: Use $queryRaw for date_trunc when Prisma groupBy can't express it
const monthly = await prisma.$queryRaw`
  SELECT date_trunc('month', date) AS month,
         SUM("stitchCount") AS total_stitches,
         COUNT(*) AS session_count
  FROM "StitchSession"
  WHERE "projectId" IN (SELECT id FROM "Project" WHERE "userId" = ${userId})
  GROUP BY month
  ORDER BY month
`;
```

The constraint "never stored in DB" is about not adding `totalStitchesThisMonth` columns -- it doesn't prohibit efficient SQL aggregation computed fresh on each request.

**Detection:**
- Stats page response time >500ms with moderate session count
- Server action returning >100KB of serialized data
- Prisma query logging shows `findMany` returning thousands of rows for stats

---

### Pitfall 5: Timezone Bugs in Date-Based Aggregation

**What goes wrong:**
Sessions are stored with a `DateTime` field (`date` column). When aggregating by day/week/month, timezone handling determines which "day" a session belongs to. A session logged at 11pm Pacific (06:00 UTC next day) will be counted in the wrong day/month if aggregation uses UTC. Monthly charts show wrong boundaries. "Stitches today" counter is wrong near midnight. Day-of-week heatmaps shift by one day.

**Why it happens:**
PostgreSQL stores `DateTime` as `timestamptz` (UTC internally). `date_trunc('day', date)` truncates in UTC by default. The user is in a single timezone but the app doesn't explicitly handle timezone conversion in queries. The existing code does `s.date.toISOString().split("T")[0]` for counting "distinct stitching days" -- this works for counting *unique* days (off-by-one is unlikely to create duplicates) but fails for *boundary accuracy* in charts.

The session form stores dates as ISO strings validated by Zod. When Prisma stores them, they're UTC. The 8-hour offset between Pacific time and UTC means sessions between 4pm-midnight Pacific are stored as "next day" in UTC.

**Consequences:**
- Monthly bar chart shows slightly wrong totals at month boundaries
- "Personal best: most stitches in a day" could split a single day's work across two days
- Day-of-week analysis (e.g., "you stitch most on Saturdays") shifts by a day
- User notices discrepancy between what they logged and what charts show
- Subtle: may not be caught in testing if tests use UTC-friendly timestamps

**Prevention:**

1. **Establish a canonical timezone**: Since this is single-user, define a `USER_TIMEZONE` constant (e.g., `'America/Los_Angeles'`) and use it consistently in all date aggregation.

2. **Use AT TIME ZONE in raw queries**:
```sql
SELECT date_trunc('day', date AT TIME ZONE 'America/Los_Angeles') AS local_day,
       SUM("stitchCount") AS stitches
FROM "StitchSession"
WHERE ...
GROUP BY local_day
ORDER BY local_day
```

3. **In-memory alternative** (if avoiding raw SQL): Convert to local date strings *before* grouping:
```typescript
function toLocalDateKey(date: Date, tz: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: tz }); // "2026-05-17"
}
```

4. **Test with boundary timestamps**: Always include a test case with a session at 11:30pm local time to verify it groups into the correct day.

**Detection:**
- Session logged "today" doesn't appear in "today's stats" near midnight
- Monthly totals don't match when manually counted
- Day-of-week pattern seems shifted by one

---

## Moderate Pitfalls

### Pitfall 6: Information Overload on Stats Dashboard

**What goes wrong:**
Shipping all planned stats (lifetime counters, collection overview, activity charts, velocity trends, designer insights, genre insights, personal bests) on a single page creates cognitive overload. The user is overwhelmed rather than delighted. Information density that works in a Notion database feels cluttered in a designed dashboard.

**Prevention:**
- Progressive disclosure: show hero stats immediately, hide deep-dive sections behind expandable cards or tab navigation
- Limit to 3-4 "glanceable" stats above the fold
- Use the existing `DashboardTabs` pattern (Main/Progress tabs) to segment stats into logical sections
- Ship minimal viable stats first (lifetime totals + monthly chart), add depth in later iterations

### Pitfall 7: Stale Suspense Boundaries Blocking Interactive Content

**What goes wrong:**
Wrapping each stats section in its own `<Suspense>` boundary seems correct for streaming, but if 8 sections each show their own loading skeleton, the page becomes a seizure of popping-in content. Alternatively, a single Suspense boundary around everything means the user sees nothing until ALL queries resolve.

**Prevention:**
- Group related stats into 2-3 logical Suspense boundaries (not 1, not 8)
- Above-the-fold hero stats in the first boundary (resolves fastest -- simple counts)
- Charts and breakdowns in a second boundary (heavier queries)
- Personal bests / deep insights in a third boundary (can load last)
- Use consistent skeleton heights to avoid layout shift as sections resolve

### Pitfall 8: Recharts ResponsiveContainer Race Condition

**What goes wrong:**
Recharts' `<ResponsiveContainer>` measures its parent container width on mount. When used inside a dynamically imported component with `ssr: false`, the container may not have its final layout dimensions when the chart mounts (especially inside Suspense boundaries that just resolved). Chart renders at width=0 or a stale width.

**Prevention:**
```tsx
// Add explicit width/height to the container wrapper
<div className="h-[240px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
</div>
```
- Always wrap `ResponsiveContainer` in a div with explicit dimensions via CSS
- Alternatively, skip `ResponsiveContainer` entirely and pass explicit `width`/`height` props to the chart, computed from a `useRef` + `useLayoutEffect` measurement (the pattern already used for focal point)

### Pitfall 9: Over-Engineering the Stats Computation Layer

**What goes wrong:**
Building an abstraction layer ("StatsEngine" class, generic aggregation pipelines, pluggable metric definitions) before knowing which stats users actually check. The abstraction adds complexity without proven value. When requirements change (and they will -- "actually I want rolling 7-day average not 30-day"), the abstraction fights you.

**Prevention:**
- Start with one function per stat section: `getLifetimeStats()`, `getMonthlyActivity()`, `getPersonalBests()` -- simple, readable, independent
- Share helpers for common patterns (timezone conversion, date range filtering) but don't build a framework
- The existing project pattern is clear: `dashboard-actions.ts` has plain functions that call Prisma directly. Follow that pattern for stats.
- If duplication emerges across 3+ stat functions, *then* extract a shared utility. Not before.

### Pitfall 10: Personal Bests Records Without Idempotent Detection

**What goes wrong:**
"New record!" celebrations fire when logging a session that beats a previous best. But if the detection logic runs after every session mutation (create, edit, delete), edge cases emerge: editing a record-setting session to reduce its count should revoke the record. Deleting the record-holding session means a *different* session is now the record. Re-calculating on every mutation is expensive if scanning all sessions.

**Prevention:**
- Calculate personal bests *at display time* (in the stats page server action), not on session mutation
- The "New record!" toast should compare the just-logged session against *current* bests calculated fresh, not against a stored record value
- Never store "is_record" flags on sessions -- calculate dynamically (aligns with "calculated at query time" constraint)
- For the toast: return `newRecords: string[]` from `createSession` action by doing a quick comparison query inline

---

## Minor Pitfalls

### Pitfall 11: Chart Tooltip Z-Index Conflicts

**What goes wrong:**
Recharts tooltips use absolute positioning. In a page with sticky headers, modals (sonner toasts), and the existing portal autocomplete pattern, tooltip z-index conflicts are likely.

**Prevention:**
- Set explicit `wrapperStyle={{ zIndex: 50 }}` on Recharts `<Tooltip>` component
- Test tooltip visibility when page is scrolled (sticky TopBar at z-40)
- Test with toasts active simultaneously

### Pitfall 12: Empty States for New Users vs Power Users

**What goes wrong:**
Stats components assume data exists. A user with zero sessions sees broken charts (empty axes, "NaN%" labels, division by zero). The existing app handles empty states well elsewhere, but new chart components may not.

**Prevention:**
- Every chart wrapper checks `data.length === 0` and renders an encouraging empty state
- Stats functions return explicit `null` or sentinel values when insufficient data
- Test with: 0 sessions, 1 session, sessions only in current month (no historical data)

### Pitfall 13: Presigned URL Expiration on Long-Idle Stats Page

**What goes wrong:**
If the stats page displays project cover images (linked from personal bests, top projects), presigned R2 URLs expire after their TTL. User leaves stats page open, returns hours later, images are broken.

**Prevention:**
- This is an existing pattern in the app (all images use presigned URLs)
- For stats page specifically, images are decorative context -- use `coverThumbnailUrl` (small) not full images
- The existing page-level `getPresignedImageUrls()` pattern handles this -- just follow it consistently

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Stats computation engine | Pitfall 4 (in-memory aggregation), Pitfall 9 (over-engineering) | Use SQL groupBy/aggregate, keep functions simple and independent |
| Hero counters & lifetime stats | Pitfall 2 (cold start waterfall) | Bundle into single Promise.all() call |
| Monthly bar chart | Pitfall 1 (hydration), Pitfall 5 (timezone), Pitfall 3 (bundle) | dynamic import, AT TIME ZONE, consider CSS-first or Visx |
| Heatmap calendar | Pitfall 1 (hydration), Pitfall 5 (timezone) | Dedicated client component, explicit timezone handling |
| Personal bests board | Pitfall 10 (idempotent detection), Pitfall 4 (scanning all sessions) | Calculate at display time with SQL MAX/aggregate |
| "New record!" toast | Pitfall 10 (edge cases on edit/delete) | Fresh comparison in createSession, no stored flags |
| Charting library integration | Pitfall 3 (bundle size), Pitfall 8 (ResponsiveContainer) | Dynamic import, explicit container dimensions |
| Dashboard layout | Pitfall 6 (information overload), Pitfall 7 (Suspense strategy) | Progressive disclosure, 2-3 Suspense groups |
| Collection breakdowns (designer/genre) | Pitfall 4 (scanning all projects+charts) | Prisma groupBy with count, not findMany + JS filter |

## Sources

- [Neon latency benchmarks](https://neon.com/docs/guides/benchmarking-latency)
- [Neon connection pooling docs](https://neon.com/docs/connect/connection-pooling)
- [Neon performance tips](https://neon.com/blog/performance-tips-for-neon-postgres)
- [Prisma query optimization](https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance)
- [Prisma aggregation/groupBy docs](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing)
- [Next.js streaming and Suspense guide](https://nextjs.org/docs/app/guides/streaming)
- [Next.js hydration error reference](https://nextjs.org/docs/messages/react-hydration-error)
- [Recharts SSR issue #2918](https://github.com/recharts/recharts/issues/2918)
- [Recharts bundle size issue #7018](https://github.com/recharts/recharts/issues/7018)
- [PostgreSQL date_trunc timezone handling](https://neon.com/postgresql/postgresql-date-functions/postgresql-date_trunc)
- [Recharts vs Visx comparison (PkgPulse)](https://www.pkgpulse.com/guides/recharts-vs-chartjs-vs-nivo-vs-visx-react-charting-2026)
