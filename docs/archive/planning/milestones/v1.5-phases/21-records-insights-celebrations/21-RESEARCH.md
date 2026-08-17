# Phase 21: Records, Insights & Celebrations - Research

**Researched:** 2026-05-18
**Domain:** Stats query layer, client celebration UX, data aggregation, URL state management
**Confidence:** HIGH

## Summary

Phase 21 fills the Records tab slot in `StatsPageShell`, delivering personal bests table, fastest completions by size category, celebration toasts/confetti on record breaks, supply/designer/genre insight lists, and completion estimates for active projects. All sections respond to a year-scope toggle (URL-driven via nuqs).

The implementation builds on the established stats architecture from Phases 18-20: query functions in `src/lib/queries/stats/`, `unstable_cache` with `revalidateTag("stats")`, `Promise.all` parallel fetching in the page Server Component, and passing data to feature components via props. The celebration system requires modifying the `createSession` server action to detect record-breaking and returning `brokenRecords` in its response, then handling that on the client with `canvas-confetti` + sonner custom toasts.

**Primary recommendation:** Structure implementation as 4 plans: (1) types + record/insight queries with TDD, (2) RecordsTable + YearScopeToggle + wiring, (3) insight lists + completion estimates, (4) celebration system (createSession detection + client confetti/toast). The celebration system is the highest-risk item due to modifying an existing production server action.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Records tab is a single scrollable page with sections (records table -> insights -> completion estimates). No sub-tabs.
- D-02: Segmented control at top (All-time | 2026 | 2025 | ...) scopes ALL sections. Available years auto-detected from session data.
- D-03: This is NOT a Year in Review -- YiR is a future phase.
- D-04: Personal bests use table layout. Rows = record types, columns = years. All-time column gets visual emphasis.
- D-05: Record types: Best Day, Best Session, Longest Streak, Current Streak.
- D-06: Fastest completions are rows in same table, separated by grouped divider. 5 size categories.
- D-07: 4 personal bests + 5 fastest completions = 9 rows total.
- D-08: Record detection happens server-side in createSession. Return `{ success, brokenRecords: [...] }`.
- D-09: Client-side confetti burst (canvas-confetti, gold/amber/emerald particles) + themed amber toast (sonner custom).
- D-10: Multiple broken records = multiple confetti bursts + stacked toasts.
- D-11: New dependency: `canvas-confetti` (~5KB). Pin exact version.
- D-12: Insights are list-based, not chart-based. Differentiated from Overview tab's bar charts.
- D-13: Top Thread Colors -- ranked by project count, show hex swatch (gray fallback when missing).
- D-14: Designer Completion Rates -- percentage + fraction (e.g., "82% (14/17)"). Clickable links.
- D-15: Most Stitched Genres -- ranked by total stitches. Clickable links.
- D-16: All insight sections respond to year scope toggle.
- D-17: Completion estimate formula: avg_per_day = total_stitches / days_since_first_session. Display as "~Month Year".
- D-18: Thresholds: totalStitches target set, >= 3 sessions, avg_per_day > 0.
- D-19: Show estimates in Records tab (list) AND project detail page (single line).
- D-20: Estimates respond to year scope toggle.

### Claude's Discretion
- Exact responsive breakpoint for records table (horizontal scroll vs stacked)
- Number of items in each insight list (top 10 recommended)
- Progress bar styling for completion estimates
- Empty state messaging when year has no records
- Whether "Current Streak" row shows values in year columns
- Confetti particle count and exact color mix
- Toast position (match existing sonner config: bottom-right)

### Deferred Ideas (OUT OF SCOPE)
- Gallery card completion estimates -- touches Phase 6 territory
- Year in Review -- future milestone, distinct from Records tab
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REC-01 | Personal bests board: most stitches/day, most/session, longest streak, current streak | Query layer: aggregate sessions by date/project, streak calculation via consecutive day logic |
| REC-02 | Personal bests link to associated project/session | Query returns projectId + chartId for each record; render as Next.js Link |
| REC-03 | "New record!" celebration toast when logging a session that beats a personal best | createSession action extension + canvas-confetti + sonner toast.custom() |
| REC-04 | Year-scoped records alongside all-time records | Year scope filter via nuqs URL state; queries accept optional year param for date boundaries |
| REC-05 | Fastest project completions by size category | Query completed projects (FINISHED/FFO) with finishDate - startDate; group by size category |
| INS-01 | Most-used thread colors with swatches | Query ProjectThread -> Thread with groupBy threadId, count projects; join hexColor |
| INS-02 | Designer breakdown: completion rate per designer | Query projects grouped by designerId; count total vs completed (FINISHED/FFO) |
| INS-03 | Genre distribution stats | Query Charts -> Genres with session stitchCount sum; group by genre |
| INS-05 | Estimated completion dates for active projects | Compute from stitchesCompleted, chart.stitchCount, avg pace from sessions; threshold gating |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Personal bests queries | API / Backend (Server Component) | -- | Prisma aggregation in query functions, cached server-side |
| Records table rendering | Browser / Client | -- | Interactive year scope toggle requires "use client" for table state |
| Year scope toggle (URL state) | Browser / Client | Frontend Server (SSR) | nuqs client hook + nuqs/server for initial parse in page.tsx |
| Insight list rendering | Frontend Server (SSR) | -- | Pure data display, no interactivity -- Server Components |
| Completion estimates | API / Backend | -- | Calculated fields from session aggregation |
| Record-breaking detection | API / Backend | -- | Server action logic after session insert |
| Celebration confetti/toast | Browser / Client | -- | DOM canvas animation + sonner toast, purely client-side |
| Year detection (available years) | API / Backend | -- | Query distinct years from StitchSession dates |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| canvas-confetti | 1.9.4 | Full-page confetti burst animation | [VERIFIED: npm registry] Only 5KB, no deps, battle-tested DOM-independent Canvas animation |
| @types/canvas-confetti | 1.9.0 | TypeScript declarations for confetti | [VERIFIED: npm registry] Dev dependency for type safety |
| nuqs | 2.8.9 | URL state for year scope toggle | [VERIFIED: package.json] Already installed, established project pattern |
| sonner | 2.0.7 | Themed celebration toasts | [VERIFIED: package.json] Already installed, Toaster configured at bottom-right |
| date-fns | 4.1.0 | Date arithmetic for streaks and boundaries | [VERIFIED: package.json] Already installed |
| @date-fns/tz | 1.4.1 | Timezone-aware date boundaries | [VERIFIED: package.json] Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prisma | 7.7.0 | Database queries for aggregation | All record/insight queries |
| next/cache (unstable_cache) | 16.x | Query caching with tag-based invalidation | All new query functions |
| lucide-react | 1.8.0 | Icons (Trophy, Flame, Timer, Zap, Palette, etc.) | Record type icons, section headings |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| canvas-confetti | react-confetti | react-confetti is a React component (heavier, SSR concerns); canvas-confetti is imperative and lightweight |
| nuqs URL state | React state | URL state preserves scope on refresh/share; matches existing project pattern |
| sonner toast.custom() | toast.success() | toast.custom() required for amber-themed styling (success uses green) |

**Installation:**
```bash
npm install canvas-confetti@1.9.4
npm install --save-dev @types/canvas-confetti@1.9.0
```

**Version verification:**
- canvas-confetti: 1.9.4 (latest on npm) [VERIFIED: npm registry]
- @types/canvas-confetti: 1.9.0 (latest on npm) [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```
[URL: ?tab=records&scope=2026]
        |
        v
[page.tsx (Server Component)]
  |--- statsSearchParamsCache.parse(searchParams) --> extract `scope`
  |--- getAvailableYears(userId) --> [2026, 2025]
  |--- Promise.all([
  |      getPersonalBests(userId, scope),
  |      getFastestCompletions(userId, scope),
  |      getThreadInsights(userId, scope),
  |      getDesignerInsights(userId, scope),
  |      getGenreInsights(userId, scope),
  |      getCompletionEstimates(userId, scope),
  |    ])
  |--- pass data to RecordsOverview (Server Component)
        |
        v
[RecordsOverview (Server Component)]
  |--- YearScopeToggle (Client) -- controls URL ?scope param
  |--- RecordsTable (Client) -- receives data as props
  |--- ThreadInsightList (Server) -- static list rendering
  |--- DesignerInsightList (Server) -- static list rendering
  |--- GenreInsightList (Server) -- static list rendering
  |--- CompletionEstimates (Server) -- static list rendering

[Celebration Flow:]
[LogSessionModal (Client)] --> createSession(formData)
        |
        v
[session-actions.ts createSession (Server)]
  |--- Insert session
  |--- recalculateProgress()
  |--- detectBrokenRecords(userId, sessionData) --> BrokenRecord[]
  |--- Return { success: true, session, brokenRecords }
        |
        v
[LogSessionModal (Client)] -- checks response.brokenRecords
  |--- if non-empty: fireCelebration(brokenRecords)
        |--- canvas-confetti burst(s) with 500ms stagger
        |--- sonner toast.custom() per broken record
```

### Recommended Project Structure
```
src/
├── lib/queries/stats/
│   ├── personal-bests.ts          # Best day, best session, streaks
│   ├── personal-bests.test.ts
│   ├��─ fastest-completions.ts     # By size category
│   ├── fastest-completions.test.ts
│   ├── thread-insights.ts         # Top thread colors by project count
│   ├── thread-insights.test.ts
│   ├── designer-insights.ts       # Completion rates per designer
│   ├── designer-insights.test.ts
│   ├── genre-insights.ts          # Total stitches per genre
│   ├── genre-insights.test.ts
│   ├── completion-estimates.ts    # Active project ETAs
│   ├── completion-estimates.test.ts
│   ├── available-years.ts         # Distinct years from session data
│   ├── available-years.test.ts
│   └── record-detection.ts        # Called by createSession post-insert
│   └── record-detection.test.ts
├── components/features/stats/
│   ├── records-overview.tsx        # Server Component layout
│   ├── records-table.tsx           # Client: table + year scope interaction
│   ├── records-table.test.tsx
│   ├── year-scope-toggle.tsx       # Client: segmented control
│   ├── year-scope-toggle.test.tsx
│   ├── thread-insight-list.tsx     # Server: ranked list with swatches
│   ├── thread-insight-list.test.tsx
│   ├── designer-insight-list.tsx   # Server: ranked with percentages
│   ├── designer-insight-list.test.tsx
│   ├── genre-insight-list.tsx      # Server: ranked by stitch count
│   ├── genre-insight-list.test.tsx
│   ├── completion-estimates.tsx    # Server: progress list
│   ├── completion-estimates.test.tsx
│   └── record-celebration.tsx      # Client: confetti + toast trigger
│   └── record-celebration.test.tsx
├── types/stats.ts                  # Extended with record/insight types
└── app/(dashboard)/stats/
    └── search-params.ts            # Extended with `scope` param
```

### Pattern 1: Year-Scoped Query with Cache
**What:** Queries accept a `scope` parameter ("all" | year number), construct date boundaries, and cache results with scope in the key.
**When to use:** All 6 new query functions for the Records tab.
**Example:**
```typescript
// Source: Established pattern from monthly-totals.ts + timezone.ts
import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";

async function computePersonalBests(userId: string, scope: string) {
  const tz = getUserTimezone(userId);

  // Build date boundaries based on scope
  let dateFilter: { gte?: Date; lt?: Date } | undefined;
  if (scope !== "all") {
    const year = parseInt(scope, 10);
    const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
    const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
    dateFilter = { gte: yearStart, lt: nextYearStart };
  }

  // Query with optional date filter
  // ...
}

export function getPersonalBests(userId: string, scope: string) {
  const isHistorical = scope !== "all" && parseInt(scope) < new Date().getFullYear();
  return unstable_cache(
    () => computePersonalBests(userId, scope),
    [`stats-personal-bests-${userId}-${scope}`],
    { tags: ["stats"], revalidate: isHistorical ? 3600 : 300 },
  )();
}
```

### Pattern 2: Record-Breaking Detection in Server Action
**What:** After inserting a session, compare against existing records to detect if any were broken.
**When to use:** Inside `createSession` in `session-actions.ts`.
**Example:**
```typescript
// Source: Pattern from createSession + hero-stats query layer
import { detectBrokenRecords } from "@/lib/queries/stats/record-detection";

// Inside createSession, after transaction:
const brokenRecords = await detectBrokenRecords(user.id, {
  date: new Date(validated.date),
  stitchCount: validated.stitchCount,
  projectId: validated.projectId,
});

return { success: true as const, session: returnSession, brokenRecords };
```

### Pattern 3: Celebration Client Component
**What:** Imperative confetti + toast triggered from session logging response.
**When to use:** In LogSessionModal after successful createSession response.
**Example:**
```typescript
// Source: canvas-confetti API docs + sonner toast.custom() docs
import confetti from "canvas-confetti";
import { toast } from "sonner";

export function fireCelebration(brokenRecords: BrokenRecord[]) {
  brokenRecords.forEach((record, index) => {
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#34d399", "#fbbf24", "#f59e0b", "#6ee7b7"],
        ticks: 100,
      });

      toast.custom((toastId) => (
        <CelebrationToast record={record} onDismiss={() => toast.dismiss(toastId)} />
      ), { duration: 5000 });
    }, index * 500);
  });
}
```

### Pattern 4: URL State for Year Scope
**What:** Year scope as URL search param, parsed server-side for data fetching, controlled client-side for interaction.
**When to use:** YearScopeToggle + page.tsx query orchestration.
**Example:**
```typescript
// In search-params.ts (server-side parsing):
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const statsSearchParamsCache = createSearchParamsCache({
  // ... existing params
  scope: parseAsString.withDefault("all"),
});

// In YearScopeToggle (client-side):
import { useQueryState, parseAsString } from "nuqs";

const [scope, setScope] = useQueryState("scope", parseAsString.withDefault("all"));
```

### Anti-Patterns to Avoid
- **Client-side data fetching for records:** All record/insight data must be server-fetched via queries and passed as props. Do NOT use useEffect + fetch for this data.
- **Storing records in a separate DB table:** Records are always computed from raw session data. No denormalization needed for this scale.
- **Putting celebration logic in a Server Component:** Confetti and toast are purely client-side DOM operations. Keep `fireCelebration` in a client utility.
- **Modifying createSession return type incompatibly:** The `brokenRecords` field must be additive (optional). Existing callers that don't check it must continue working.
- **Importing canvas-confetti at module level in SSR:** Use dynamic import or guard with `typeof window !== 'undefined'` to avoid build errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti animation | Custom Canvas particle system | `canvas-confetti` (1.9.4) | Handles RAF, particle physics, decay, gravity, cross-browser canvas |
| Toast stacking/positioning | Custom absolute-positioned notifications | `sonner` toast.custom() | Handles stacking, auto-dismiss timers, accessibility (aria-live), animation |
| URL state synchronization | useState + manual pushState + useEffect | `nuqs` (parseAsString) | Handles Next.js router integration, SSR, shallow updates, type safety |
| Streak calculation | Complex recursive CTE | Application-level consecutive day detection | Prisma doesn't support recursive CTEs; fetch ordered dates and iterate |
| Date boundary timezone handling | Manual UTC offset math | `@date-fns/tz` TZDate | Handles DST transitions, IANA timezone database |

**Key insight:** The streak calculation is the trickiest hand-roll temptation. SQL window functions could compute it, but Prisma 7 doesn't support raw SQL aggregations cleanly. Fetch all session dates for the user (ordered), then iterate in JS to find consecutive days. For a single-user app with moderate session counts (hundreds, not millions), this is efficient enough.

## Common Pitfalls

### Pitfall 1: Streak Calculation Off-by-One
**What goes wrong:** Counting "yesterday" and "today" as a 2-day streak when only today has a session.
**Why it happens:** Confusion between "days with sessions" and "gap between days". A streak of 1 means today only.
**How to avoid:** Define streak as "number of consecutive calendar days (in user timezone) with at least one session, counting backwards from most recent session day". Current streak includes today only if today has a session.
**Warning signs:** Streak shows 1 when user hasn't stitched today; streak shows 0 when user stitched today only.

### Pitfall 2: Race Condition in Record Detection
**What goes wrong:** Two rapid session logs could both detect a record break (comparing against the same old value).
**Why it happens:** Record detection queries happen after insert but before the next request's detection runs.
**How to avoid:** This is acceptable for a single-user app -- sessions are logged one at a time. No concurrency guard needed.
**Warning signs:** N/A for single-user app.

### Pitfall 3: Canvas-Confetti SSR Import Error
**What goes wrong:** `ReferenceError: document is not defined` during server rendering.
**Why it happens:** canvas-confetti accesses `document.createElement('canvas')` at import time.
**How to avoid:** Use dynamic import: `const confetti = (await import("canvas-confetti")).default;` inside the celebration function, OR keep the import only in a "use client" module that never runs server-side.
**Warning signs:** Build errors mentioning `document` or `window` not defined.

### Pitfall 4: Year Scope + Tab URL Conflict
**What goes wrong:** Switching between Stats tabs resets the year scope, or scope bleeds into other tabs.
**Why it happens:** Both `tab` and `scope` are URL params. Navigating tabs might clear unrelated params.
**How to avoid:** nuqs preserves unrelated params by default with shallow routing. Test that switching Overview -> Records -> Overview preserves `?scope=2026`.
**Warning signs:** Scope resets to "all" after tab navigation.

### Pitfall 5: Best Day Calculation Ignoring Timezone
**What goes wrong:** "Best day" uses UTC date boundaries, splitting a user's stitching day at midnight UTC instead of midnight local.
**Why it happens:** Grouping sessions by `DATE(date)` in UTC when user is in America/Edmonton (UTC-6/7).
**How to avoid:** Use `getUserTimezone()` + `TZDate` to compute local day boundaries, then SUM sessions within each local day. Established pattern in `hero-stats.ts`.
**Warning signs:** User's "best day" shows lower count than expected; sessions split across two UTC days.

### Pitfall 6: Fastest Completion for Projects Without StartDate
**What goes wrong:** Division by zero or negative days for projects where `startDate` is null.
**Why it happens:** Some projects may have `finishDate` set but no `startDate`.
**How to avoid:** Require BOTH `startDate` AND `finishDate` to be non-null for fastest completion calculation. Use the project's first session date as a fallback if startDate is null.
**Warning signs:** "Fastest completion: 0 days" or negative values in the table.

## Code Examples

### Record Detection Query (Personal Bests)
```typescript
// Source: Established pattern from hero-stats.ts + timezone.ts
async function detectBrokenRecords(
  userId: string,
  session: { date: Date; stitchCount: number; projectId: string },
): Promise<BrokenRecord[]> {
  const tz = getUserTimezone(userId);
  const sessionLocalDay = startOfDay(TZDate.tz(tz, session.date));
  const nextDay = addDays(sessionLocalDay, 1);

  // Sum all stitches for this day (including the just-inserted session)
  const todayTotal = await prisma.stitchSession.aggregate({
    where: {
      project: { userId },
      date: { gte: sessionLocalDay, lt: nextDay },
    },
    _sum: { stitchCount: true },
  });

  // Get previous best day (before today)
  const previousBestDay = await prisma.stitchSession.groupBy({
    by: ["date"], // Note: need application-level grouping by local day
    where: { project: { userId }, date: { lt: sessionLocalDay } },
    _sum: { stitchCount: true },
    orderBy: { _sum: { stitchCount: "desc" } },
    take: 1,
  });

  const records: BrokenRecord[] = [];
  const todayCount = todayTotal._sum.stitchCount ?? 0;
  const prevBest = previousBestDay[0]?._sum?.stitchCount ?? 0;

  if (todayCount > prevBest) {
    records.push({
      type: "bestDay",
      label: "Best Day",
      oldValue: prevBest,
      newValue: todayCount,
      unit: "stitches",
    });
  }

  // Best session comparison (simpler -- just compare stitchCount)
  const previousBestSession = await prisma.stitchSession.findFirst({
    where: { project: { userId }, id: { not: session.id } },
    orderBy: { stitchCount: "desc" },
    select: { stitchCount: true },
  });

  if (session.stitchCount > (previousBestSession?.stitchCount ?? 0)) {
    records.push({
      type: "bestSession",
      label: "Best Session",
      oldValue: previousBestSession?.stitchCount ?? 0,
      newValue: session.stitchCount,
      unit: "stitches",
    });
  }

  // Streak detection would go here...
  return records;
}
```

### Streak Calculation Pattern
```typescript
// Source: Application-level logic (Prisma doesn't support recursive CTEs)
async function computeStreaks(userId: string, tz: string) {
  // Fetch all distinct session dates, ordered descending
  const sessions = await prisma.stitchSession.findMany({
    where: { project: { userId } },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  // Convert to local date strings and deduplicate
  const localDates = [...new Set(
    sessions.map((s) => format(TZDate.tz(tz, s.date), "yyyy-MM-dd"))
  )].sort().reverse(); // Most recent first

  if (localDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Calculate streaks by iterating consecutive days
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  const today = format(TZDate.tz(tz), "yyyy-MM-dd");

  // Current streak: count backwards from today (or most recent day)
  const mostRecent = localDates[0];
  const daysSinceRecent = differenceInDays(parseISO(today), parseISO(mostRecent));
  if (daysSinceRecent > 1) {
    currentStreak = 0; // Streak is broken
  } else {
    for (let i = 1; i < localDates.length; i++) {
      const diff = differenceInDays(parseISO(localDates[i - 1]), parseISO(localDates[i]));
      if (diff === 1) currentStreak++;
      else break;
    }
  }

  // Longest streak: full scan
  for (let i = 1; i < localDates.length; i++) {
    const diff = differenceInDays(parseISO(localDates[i - 1]), parseISO(localDates[i]));
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}
```

### Thread Insight Query
```typescript
// Source: Prisma groupBy + join pattern
async function computeThreadInsights(userId: string, scope: string) {
  const tz = getUserTimezone(userId);
  const dateFilter = buildDateFilter(scope, tz); // reusable helper

  // Count distinct projects per thread
  const threadUsage = await prisma.projectThread.groupBy({
    by: ["threadId"],
    where: {
      project: {
        userId,
        ...(dateFilter ? { sessions: { some: { date: dateFilter } } } : {}),
      },
    },
    _count: { projectId: true },
    orderBy: { _count: { projectId: "desc" } },
    take: 10,
  });

  // Hydrate with thread details
  const threadIds = threadUsage.map((t) => t.threadId);
  const threads = await prisma.thread.findMany({
    where: { id: { in: threadIds } },
    include: { brand: { select: { name: true } } },
  });

  // Map and return
  return threadUsage.map((usage) => {
    const thread = threads.find((t) => t.id === usage.threadId)!;
    return {
      threadId: thread.id,
      brandName: thread.brand.name,
      colorCode: thread.colorCode,
      colorName: thread.colorName,
      hexColor: thread.hexColor,
      projectCount: usage._count.projectId,
    };
  });
}
```

### Completion Estimate Calculation
```typescript
// Source: D-17 formula from CONTEXT.md
interface CompletionEstimate {
  projectId: string;
  chartId: string;
  projectName: string;
  stitchesCompleted: number;
  totalStitches: number;
  percentComplete: number;
  estimatedDate: string; // "~Mon YYYY" format
  avgPerDay: number;
}

async function computeCompletionEstimates(userId: string, scope: string) {
  // Get active projects with stitch targets
  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: { in: ["IN_PROGRESS", "ON_HOLD"] },
      chart: { stitchCount: { gt: 0 } },
    },
    include: {
      chart: { select: { id: true, name: true, stitchCount: true } },
      sessions: { select: { date: true, stitchCount: true }, orderBy: { date: "asc" } },
    },
  });

  return projects
    .filter((p) => p.sessions.length >= 3) // Threshold: >= 3 sessions
    .map((p) => {
      const firstSession = p.sessions[0].date;
      const daysSinceFirst = differenceInDays(new Date(), firstSession);
      if (daysSinceFirst === 0) return null;

      const totalSessionStitches = p.sessions.reduce((sum, s) => sum + s.stitchCount, 0);
      const avgPerDay = totalSessionStitches / daysSinceFirst;
      if (avgPerDay <= 0) return null;

      const remaining = p.chart.stitchCount - p.stitchesCompleted;
      const daysToComplete = Math.ceil(remaining / avgPerDay);
      const estimatedDate = addDays(new Date(), daysToComplete);

      return {
        projectId: p.id,
        chartId: p.chart.id,
        projectName: p.chart.name,
        stitchesCompleted: p.stitchesCompleted,
        totalStitches: p.chart.stitchCount,
        percentComplete: Math.round((p.stitchesCompleted / p.chart.stitchCount) * 100),
        estimatedDate: `~${format(estimatedDate, "MMM yyyy")}`,
        avgPerDay: Math.round(avgPerDay * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => /* sort by soonest */ 0);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts for all data viz | List-based for ranked insights | Phase 21 design decision | Lighter, faster, avoids chart fatigue |
| Polling/refetch for live data | unstable_cache + revalidateTag on mutation | Phase 18 | Records data auto-refreshes when sessions change |
| Manual URLSearchParams | nuqs 2.8+ with createSearchParamsCache | Phase 20 | Type-safe server + client URL state |

**Deprecated/outdated:**
- React's `useSearchParams()` for stats -- replaced by nuqs throughout the stats section

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma `groupBy` with `_count` on projectThread works for thread usage ranking | Code Examples | Would need raw SQL or application-level counting |
| A2 | Single-user app means no concurrency issues in record detection | Pitfalls | Multiple browser tabs could theoretically conflict, but extremely unlikely |
| A3 | Session count per user is < 10,000 (streak calculation loads all dates) | Pitfalls | Could need pagination for very active stitchers over many years |

## Open Questions

1. **Best Day grouping with timezone**
   - What we know: Sessions store `date` as a DateTime (UTC timestamp). We need to group by local day.
   - What's unclear: Prisma 7 `groupBy` doesn't support timezone-aware date truncation. Need application-level grouping.
   - Recommendation: Fetch all sessions in scope, group by local date string in JS. For record detection (called per-session), only query today's total -- no groupBy needed.

2. **Year scope for "Current Streak"**
   - What we know: Current streak is inherently a live/all-time concept (D-05 in CONTEXT).
   - What's unclear: Should year-scoped view show `--` for current streak, or omit the row entirely?
   - Recommendation: Show `--` in year columns (per UI-SPEC), value only in All-time column.

3. **createSession return type backward compatibility**
   - What we know: LogSessionModal currently expects `{ success: true, session }` or `{ success: false, error }`.
   - What's unclear: Will adding `brokenRecords` require updating the type in other callers?
   - Recommendation: Add `brokenRecords?: BrokenRecord[]` as optional field. Only LogSessionModal reads it. Type update is additive and non-breaking.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| canvas-confetti | Celebration confetti | Not yet installed | -- (1.9.4 target) | Must install |
| @types/canvas-confetti | TypeScript types | Not yet installed | -- (1.9.0 target) | Must install |
| nuqs | Year scope toggle | Installed | 2.8.9 | -- |
| sonner | Celebration toasts | Installed | 2.0.7 | -- |
| date-fns | Date arithmetic | Installed | 4.1.0 | -- |
| @date-fns/tz | Timezone handling | Installed | 1.4.1 | -- |
| Prisma | Database queries | Installed | 7.7.0 | -- |

**Missing dependencies with no fallback:**
- `canvas-confetti` + `@types/canvas-confetti` -- must be installed in Wave 0 / Plan 1

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --testPathPattern=stats` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REC-01 | Personal bests query returns best day/session/streak | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | Wave 0 |
| REC-02 | Records include projectId + chartId for linking | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | Wave 0 |
| REC-03 | Record detection returns broken records from createSession | unit | `npx vitest run src/lib/queries/stats/record-detection.test.ts` | Wave 0 |
| REC-04 | Queries accept year scope and filter by date boundaries | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | Wave 0 |
| REC-05 | Fastest completions by size category | unit | `npx vitest run src/lib/queries/stats/fastest-completions.test.ts` | Wave 0 |
| INS-01 | Thread insights ranked by project count with hex colors | unit | `npx vitest run src/lib/queries/stats/thread-insights.test.ts` | Wave 0 |
| INS-02 | Designer completion rates as percentage + fraction | unit | `npx vitest run src/lib/queries/stats/designer-insights.test.ts` | Wave 0 |
| INS-03 | Genre insights ranked by total stitches | unit | `npx vitest run src/lib/queries/stats/genre-insights.test.ts` | Wave 0 |
| INS-05 | Completion estimates with threshold gating | unit | `npx vitest run src/lib/queries/stats/completion-estimates.test.ts` | Wave 0 |
| REC-03 (UI) | Celebration toast renders with record info | unit | `npx vitest run src/components/features/stats/record-celebration.test.tsx` | Wave 0 |
| REC-01 (UI) | RecordsTable renders all record rows | unit | `npx vitest run src/components/features/stats/records-table.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/queries/stats/ src/components/features/stats/`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/queries/stats/personal-bests.test.ts` -- covers REC-01, REC-02, REC-04
- [ ] `src/lib/queries/stats/fastest-completions.test.ts` -- covers REC-05
- [ ] `src/lib/queries/stats/record-detection.test.ts` -- covers REC-03
- [ ] `src/lib/queries/stats/thread-insights.test.ts` -- covers INS-01
- [ ] `src/lib/queries/stats/designer-insights.test.ts` -- covers INS-02
- [ ] `src/lib/queries/stats/genre-insights.test.ts` -- covers INS-03
- [ ] `src/lib/queries/stats/completion-estimates.test.ts` -- covers INS-05
- [ ] `src/lib/queries/stats/available-years.test.ts` -- covers year detection
- [ ] Install: `npm install canvas-confetti@1.9.4 && npm install -D @types/canvas-confetti@1.9.0`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | requireAuth() on all queries (established pattern) |
| V3 Session Management | no | No new session handling |
| V4 Access Control | yes | All queries filter by userId from auth (established pattern) |
| V5 Input Validation | yes | Year scope validated via nuqs parseAsString; no user-writable data |
| V6 Cryptography | no | No secrets or encryption in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on stats queries | Information Disclosure | All Prisma queries include `{ project: { userId } }` filter |
| URL param injection (scope) | Tampering | nuqs parses to string; queries validate year is numeric |
| XSS via thread color names | Tampering | React auto-escapes JSX output; hex values used only as backgroundColor style |

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/lib/queries/stats/*.ts` -- established query patterns
- Project codebase: `src/lib/actions/session-actions.ts` -- createSession structure
- Project codebase: `src/components/features/stats/stats-page-shell.tsx` -- recordsContent slot
- Project codebase: `prisma/schema.prisma` -- Thread.hexColor, Chart.stitchCount, Project model
- Context7: `/catdad/canvas-confetti` -- confetti API (particleCount, origin, colors, ticks)
- Context7: `/emilkowalski/sonner` -- toast.custom() API with toastId dismiss
- npm registry: canvas-confetti@1.9.4, @types/canvas-confetti@1.9.0

### Secondary (MEDIUM confidence)
- Context7: `/47ng/nuqs` -- parseAsString, useQueryState, createSearchParamsCache
- Project codebase: `product-plan/sections/stitching-sessions-and-statistics/` -- DesignOS reference

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified against npm registry and existing project deps
- Architecture: HIGH -- follows established patterns from Phases 18-20 exactly
- Pitfalls: HIGH -- identified from codebase patterns and timezone handling experience
- Query implementation: MEDIUM -- Prisma groupBy for thread insights is assumed (A1)

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable domain, no fast-moving dependencies)
