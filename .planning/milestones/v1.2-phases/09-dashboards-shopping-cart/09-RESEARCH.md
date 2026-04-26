# Phase 9: Dashboards & Shopping Cart - Research

**Researched:** 2026-04-17
**Domain:** Dashboard UI composition, data aggregation queries, shopping cart state management
**Confidence:** HIGH

## Summary

Phase 9 builds three major UI surfaces -- Main Dashboard, Project Dashboard, and Shopping Cart -- on top of existing data models with zero schema changes. The work is predominantly frontend composition with server-side data-fetching functions, following patterns well-established in Phase 8's Pattern Dive.

The Main Dashboard replaces the current placeholder at `/` with a tabbed layout (Your Library / Progress), both tabs fetching data eagerly via `Promise.all()`. The Shopping Cart replaces the existing `ShoppingList` at `/shopping` with a project-selection architecture and tabbed supply views. All three surfaces have comprehensive DesignOS reference designs, an approved UI-SPEC, and locked implementation decisions from the context-gathering phase.

**Primary recommendation:** Structure plans around three independent data-fetching layers (dashboard-actions, project-dashboard-actions, shopping-cart-actions), each with corresponding TDD server action tests, then build UI components in dependency order: shared primitives first (SectionHeading, ScrollableRow, HeroStats), then section-level components, then page-level orchestration.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Main Dashboard and Project Dashboard live on a single route (`/`) with nuqs tab switching. Tab labels: "Your Library" (default) and "Progress". URL state via `?tab=progress` for deep-linking.
- **D-02:** Independent data-fetching functions per dashboard (`getMainDashboardData()`, `getProjectDashboardData()`) fetched via Promise.all() in the server component. Designed for easy route-splitting later.
- **D-03:** Matches the Pattern Dive tab precedent -- same Tabs component, same nuqs URL state pattern, same eager-fetch approach.
- **D-04:** Currently Stitching uses custom `CurrentlyStitchingCard` components (compact, progress-focused, 280px fixed-width, horizontal scroll with arrows). NOT the full GalleryCard.
- **D-05:** Start Next section reuses the existing `GalleryCard` component. Display top 2 per design.
- **D-06:** Buried Treasures uses a dynamic threshold -- oldest 10% of unstarted charts, display top 5, sorted oldest-first.
- **D-07:** Spotlight uses server-side random on page load. "Shuffle" button calls a server action to re-fetch a new random project. Zero client state management.
- **D-08:** Quick Add menu provides shortcuts to create charts, supplies, designers, or log stitches. "Log Stitches" reuses the existing LogSessionModal from Phase 8.
- **D-09:** New Shopping Cart fully replaces the existing Shopping List at `/shopping`. Same nav position, new architecture with project selection + supply type tabs.
- **D-10:** Default state: no projects selected on first visit. Last selection persisted via localStorage so return visits restore the user's previous picks. Must filter out stale project IDs (deleted/completed).
- **D-11:** Supply needs aggregated across selected projects. Tab badges show unfulfilled item counts per supply type (SHOP-04).
- **D-12:** "Mark Acquired" interaction retained from existing ShoppingList -- per-item buttons, server action pattern.
- **D-13:** Progress buckets as collapsible accordion sections with chevrons, collapsed by default. Stacked horizontal bar chart summary above the accordions shows distribution at a glance.
- **D-14:** Hero stats bar as responsive auto-fit grid of 6 individual stat cards (`minmax(140px, 1fr)`).
- **D-15:** Finished tab sort default: `finishDate` (most recent first). Sort dropdown offers: finish date, start-to-finish duration, stitch count, stitching days.

### Claude's Discretion
- Collection Stats sidebar/inline layout responsive breakpoints
- Empty state messaging for sections with no data
- Exact Quick Add menu component (dropdown, speed dial, or popover)
- Shopping Cart project selection component specifics
- Loading skeleton designs for dashboard sections
- Stacked bar chart implementation details (CSS, charting library, or SVG)
- "View all" link destinations (Pattern Dive filtered views)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | User sees "Currently Stitching" section showing active WIPs with progress, sorted by most recently worked on | Data action: query IN_PROGRESS/ON_HOLD projects with latest session date; Custom CurrentlyStitchingCard component per D-04; ScrollableRow for horizontal layout |
| DASH-02 | User sees "Start Next" section showing projects flagged as ready/want-to-start | Data action: query projects where `wantToStartNext=true` with UNSTARTED/KITTED status; Reuse GalleryCard per D-05; Top 2 display |
| DASH-03 | User sees "Buried Treasures" section surfacing oldest unstarted charts | Data action: query all UNSTARTED charts, compute oldest 10%, take top 5 per D-06; Custom BuriedTreasuresSection component |
| DASH-04 | User sees "Spotlight" card featuring random project with refresh | Server action for random project selection; SpotlightCard component; Shuffle server action per D-07 |
| DASH-05 | User sees Collection Stats sidebar | Aggregate query for counts, totals, most-recent-finish, largest-project; CollectionStatsSidebar with mobile collapse |
| DASH-06 | User can access Quick Add menu to create charts/supplies/designers/log stitches | QuickAddMenu dropdown component; "Log Stitches" opens existing LogSessionModal per D-08; Others navigate to add forms |
| PROJ-01 | User sees hero stats bar (total WIPs, avg progress, closest to completion, finished this year/all time, total stitches) | Data action with aggregate Prisma queries; HeroStats auto-fit grid per D-14 |
| PROJ-02 | User sees Progress Breakdown tab with projects grouped into progress buckets with stacked bar | Data action to compute bucket assignments; ProgressBreakdownTab with CSS stacked bar and collapsible accordions per D-13 |
| PROJ-03 | User can sort projects within progress buckets | Client-side sorting within ProgressBreakdownTab; 5 sort options from DesignOS reference |
| PROJ-04 | User sees Finished tab with rich per-project stats | Data action for finished projects with session aggregations; FinishedTab with expandable cards |
| PROJ-05 | User can sort finished projects by finish date, duration, stitch count, or stitching days | Client-side sorting within FinishedTab per D-15; Sort dropdown |
| SHOP-01 | User can select which projects to shop for | ProjectSelectionList with checkbox toggles; localStorage persistence per D-10; Stale ID filtering |
| SHOP-02 | User sees aggregated supply needs across selected projects in tabbed view | Client-side filtering of server-fetched supply data by selected project IDs; Tabbed SupplyTab component |
| SHOP-03 | User can mark individual supply quantities as acquired | Enhanced `updateSupplyAcquired` server action with quantity parameter; QuantityControl stepper component |
| SHOP-04 | Tab badges show unfulfilled item counts per supply type | Client-side count computation from filtered supply data per D-11; Badge component on tab triggers |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dashboard data aggregation | Frontend Server (SSR) | Database | Server component fetches aggregated data via Prisma queries in server actions; no API layer needed for single-user app |
| Tab state management | Browser / Client | -- | nuqs manages URL query params for tab switching; purely client-side |
| Dashboard section rendering | Browser / Client | Frontend Server (SSR) | Most sections need interactivity (scroll, expand, sort); server components pass data as props |
| Shopping cart project selection | Browser / Client | -- | Selection state in localStorage; client-side filtering of pre-fetched data |
| Supply acquisition mutations | Frontend Server (SSR) | Database | Server actions with requireAuth() for quantity updates; revalidatePath for cache busting |
| Spotlight random selection | Frontend Server (SSR) | Database | Server-side random query avoids client-side randomness hydration mismatch |
| Quick Add navigation | Browser / Client | -- | Menu triggers navigation or opens existing LogSessionModal; no server interaction |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | App Router SSR, server components, server actions | [VERIFIED: package.json] Project framework |
| React | 19.2.5 | UI rendering | [VERIFIED: package.json] |
| Prisma | 7.7.0 | Database queries for dashboard aggregations | [VERIFIED: package.json] Existing ORM |
| nuqs | 2.8.9 | URL-persisted tab state for dashboard tabs | [VERIFIED: package.json] Already used for Pattern Dive and project detail tabs |
| @base-ui/react | 1.4.0 | UI component primitives (shadcn/ui v4 base) | [VERIFIED: package.json] |
| Tailwind CSS | 4.2.2 | Styling with semantic tokens | [VERIFIED: package.json] |
| lucide-react | 1.8.0 | Icons for dashboard sections, quick add, shopping cart | [VERIFIED: package.json] |
| zod | 3.24.4 | Server action input validation | [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast notifications for mark-acquired, spotlight shuffle errors | [VERIFIED: package.json] Existing pattern for server action feedback |
| vitest | 3.1.1 | Test framework | [VERIFIED: package.json] All TDD tests |
| @testing-library/react | 16.3.2 | Component testing (via `@/__tests__/test-utils`) | [VERIFIED: package.json] Existing test infrastructure |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS stacked bar chart | recharts / chart.js | Overkill for a single horizontal stacked bar; CSS `flex` with percentage widths is simpler, zero-dependency, matches DesignOS reference exactly |
| Client-side filtering (shopping) | Server-side per-request filtering | Client-side avoids round-trips when toggling project selection; all supply data pre-fetched on page load |
| localStorage for shopping selection | nuqs URL params | localStorage persists across browser sessions; URL params would lose selection on navigation; D-10 explicitly requires localStorage |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### System Architecture Diagram

```
User visits / (dashboard route)
    |
    v
Server Component (page.tsx)
    |
    +-- Promise.all([
    |       getMainDashboardData(),    --> Prisma: projects, charts, sessions
    |       getProjectDashboardData(), --> Prisma: projects, sessions, aggregates
    |   ])
    |
    +-- getPresignedImageUrls(keys)    --> R2: presigned URLs for cover images
    |
    v
DashboardTabs (client, nuqs ?tab=)
    |
    +-- tab="library" --> MainDashboard
    |       +-- CurrentlyStitching (ScrollableRow of custom cards)
    |       +-- StartNext (GalleryCard reuse)
    |       +-- CollectionStatsSidebar
    |       +-- BuriedTreasures (server-computed oldest 10%)
    |       +-- Spotlight (server-random, shuffle via server action)
    |       +-- QuickAddMenu (dropdown, opens LogSessionModal or navigates)
    |
    +-- tab="progress" --> ProjectDashboard
            +-- HeroStats (6 stat cards, auto-fit grid)
            +-- Sub-tabs: Progress Breakdown | Finished
            |       +-- ProgressBreakdownTab (stacked bar + accordions)
            |       +-- FinishedTab (expandable cards + sort/search)

User visits /shopping
    |
    v
Server Component (page.tsx)
    |
    +-- getShoppingCartData()          --> Prisma: projects + supplies + fabrics
    +-- getPresignedImageUrls(keys)
    |
    v
ShoppingCart (client)
    +-- ShoppingForBar (sticky, project chips)
    +-- Tabs: Projects | Threads | Beads | Specialty | Fabric | Shopping List
    +-- ProjectSelectionList (checkboxes, localStorage state)
    +-- SupplyTab (filtered by selected projects, quantity controls)
    +-- FabricTab (count preferences, stash matching)
    +-- ShoppingListTab (checklist view)
    +-- Server action: updateSupplyAcquired() --> Prisma update + revalidatePath
```

### Recommended Project Structure
```
src/
  app/(dashboard)/
    page.tsx                                     # Dashboard route (replaces placeholder)
    shopping/
      page.tsx                                   # Shopping Cart route (replaces ShoppingList)
  components/features/dashboard/
    dashboard-tabs.tsx                           # nuqs tab switcher (client)
    main-dashboard.tsx                           # Main Dashboard layout (server)
    currently-stitching-card.tsx                 # Compact WIP card (client)
    scrollable-row.tsx                           # Horizontal scroll with arrows (client)
    collection-stats-sidebar.tsx                # Stats sidebar (client, mobile collapse)
    spotlight-card.tsx                           # Featured project card (client)
    buried-treasures-section.tsx                # Oldest unstarted list (server)
    quick-add-menu.tsx                          # Dropdown menu (client)
    section-heading.tsx                         # Fraunces heading + emerald bar (server)
    project-dashboard.tsx                       # Project Dashboard layout (server)
    hero-stats.tsx                              # 6-stat auto-fit grid (server)
    progress-breakdown-tab.tsx                  # Stacked bar + accordions (client)
    bucket-project-row.tsx                      # Row within progress bucket (server)
    finished-tab.tsx                            # Expandable finished cards (client)
    finished-project-card.tsx                   # Individual finished card (client)
  components/features/shopping/
    shopping-cart.tsx                            # Full ShoppingCart replacement (client)
    project-selection-list.tsx                  # Checkbox project rows (client)
    shopping-for-bar.tsx                        # Sticky selected project chips (client)
    supply-tab.tsx                              # Reusable supply type tab (client)
    quantity-control.tsx                        # +/- stepper (client)
    fabric-tab.tsx                              # Fabric needs tab (client)
    shopping-list-tab.tsx                       # Checklist view (client)
  lib/actions/
    dashboard-actions.ts                        # getMainDashboardData, getSpotlightProject, etc.
    project-dashboard-actions.ts               # getProjectDashboardData (hero + buckets + finished)
    shopping-cart-actions.ts                    # getShoppingCartData, updateSupplyAcquired (enhanced)
  types/
    dashboard.ts                                # TypeScript interfaces for dashboard data
```

### Pattern 1: Eager Data Fetching with Promise.all()
**What:** Fetch all tab data in parallel in the server component, pass as props to client tab switcher
**When to use:** Multi-tab pages where all tabs share the same route
**Example:**
```typescript
// Source: Existing pattern in src/app/(dashboard)/charts/page.tsx
const [mainDashboard, projectDashboard] = await Promise.all([
  getMainDashboardData(),
  getProjectDashboardData(),
]);
const imageUrls = await getPresignedImageUrls(imageKeys);
```

### Pattern 2: nuqs Tab State with parseAsStringLiteral
**What:** URL-persisted tabs using nuqs, matching existing Pattern Dive precedent
**When to use:** Dashboard tab switching with deep-link support
**Example:**
```typescript
// Source: Existing pattern in src/components/features/charts/pattern-dive-tabs.tsx
// [VERIFIED: codebase grep]
export const DASHBOARD_TABS = ["library", "progress"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const [tab, setTab] = useQueryState(
  "tab",
  parseAsStringLiteral([...DASHBOARD_TABS]).withDefault("library"),
);
```

### Pattern 3: Server Action for Spotlight Shuffle
**What:** Server action that returns a random project, called on button click
**When to use:** When randomness must be server-side to avoid hydration mismatch
**Example:**
```typescript
// [ASSUMED] Pattern based on existing server action conventions
"use server";
export async function getSpotlightProject() {
  const user = await requireAuth();
  const count = await prisma.project.count({ where: { userId: user.id } });
  const skip = Math.floor(Math.random() * count);
  const project = await prisma.project.findFirst({
    where: { userId: user.id },
    skip,
    include: { chart: { include: { designer: true, genres: true } } },
  });
  return project;
}
```

### Pattern 4: localStorage Persistence with Stale ID Filtering (Shopping Cart)
**What:** Persist selected project IDs in localStorage, filter out deleted/completed IDs on hydration
**When to use:** Shopping cart project selection that survives page refreshes
**Example:**
```typescript
// [ASSUMED] Pattern based on D-10 decision
const STORAGE_KEY = "shopping-cart-selected-projects";

function usePersistedSelection(validProjectIds: Set<string>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      // Filter out stale IDs (deleted or completed projects)
      return new Set(stored.filter((id: string) => validProjectIds.has(id)));
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
  }, [selectedIds]);

  return [selectedIds, setSelectedIds] as const;
}
```

### Pattern 5: Enhanced Supply Acquisition (Quantity Stepper)
**What:** Update acquired quantity by arbitrary amount (not just mark-as-fully-acquired)
**When to use:** Shopping cart quantity control with +/- stepper
**Example:**
```typescript
// [VERIFIED: existing markSupplyAcquired in shopping-actions.ts sets to full quantity]
// New action needs a quantity parameter instead of setting to quantityRequired
export async function updateSupplyAcquired(
  type: "thread" | "bead" | "specialty",
  junctionId: string,
  acquiredQuantity: number,
) {
  await requireAuth();
  // Validate quantity >= 0 and <= quantityRequired
  // Update the junction table record
  revalidatePath("/shopping");
  return { success: true };
}
```

### Anti-Patterns to Avoid
- **Client-side random for Spotlight:** Would cause hydration mismatch between server HTML and client render. Use server-side random per D-07.
- **Waterfall data fetching:** Never fetch dashboard sections sequentially. Always use `Promise.all()` for parallel queries to avoid Neon cold start stacking.
- **Nested forms in Quick Add:** Quick Add menu opens a dropdown with action buttons. "Log Stitches" opens a modal with its own form. Never nest `<form>` elements.
- **Hardcoded color scales:** Use semantic tokens (`bg-card`, `text-muted-foreground`) throughout. Exception: bucket accent colors use explicit color classes as defined in UI-SPEC (stone-300, amber-400, emerald-400, sky-400, violet-400, rose-400) since these are semantic to the bucket identity.
- **Fetching per-tab on tab switch:** Do not lazy-load tab data. D-02 explicitly requires eager fetching via Promise.all() -- all tab data is fetched once when the page loads.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL-persisted tabs | Custom query param parsing | nuqs `parseAsStringLiteral` | Already used in 3 places in codebase; handles history, serialization, defaults |
| Horizontal scroll with snap | Custom scroll logic | CSS `scroll-snap-type: x mandatory` + JS arrow buttons | Native browser behavior is smoother; DesignOS reference uses this exact pattern |
| Tab component | Custom tab markup | shadcn `Tabs` with `variant="line"` | Accessible, keyboard-navigable, ARIA-compliant; existing throughout app |
| Auth guard | Per-action auth checks | `requireAuth()` from `@/lib/auth-guard` | Single source of truth; ESLint enforces usage |
| Presigned image URLs | Direct R2 URL construction | `getPresignedImageUrls()` | Handles batching, caching, error fallbacks; used by every page with images |
| Toast notifications | Custom notification system | `sonner` toast | Already integrated, consistent UX |

**Key insight:** This phase is almost entirely UI composition on existing infrastructure. No new models, no new auth patterns, no new upload flows. The risk is in data-fetching query correctness (getting the right projects into the right sections) and UI fidelity to the DesignOS designs, not in infrastructure.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from Spotlight Random
**What goes wrong:** Using `Math.random()` in a component renders different values on server vs client
**Why it happens:** Server renders one random project, client hydrates with a different one
**How to avoid:** Per D-07, Spotlight uses server-side random only. The random project is selected in the server component's data-fetching function, not in the client component. Shuffle calls a server action.
**Warning signs:** Console hydration warnings mentioning the Spotlight card

### Pitfall 2: localStorage SSR Crash
**What goes wrong:** Accessing `localStorage` during server-side rendering throws ReferenceError
**Why it happens:** `localStorage` doesn't exist on the server
**How to avoid:** Guard with `typeof window !== "undefined"` check, or initialize state in a `useEffect`. The shopping cart's `usePersistedSelection` hook must handle SSR gracefully -- return empty set on server, hydrate from localStorage in an effect.
**Warning signs:** "localStorage is not defined" error during build or SSR

### Pitfall 3: Stale Shopping Cart Selections
**What goes wrong:** User returns to shopping cart and sees ghost projects that were deleted or completed
**Why it happens:** localStorage stores raw project IDs without validating against current database state
**How to avoid:** Per D-10, on hydration, filter stored IDs against the list of valid project IDs passed from the server component. Remove any IDs not in the valid set.
**Warning signs:** Empty project rows or missing supply data for selected projects

### Pitfall 4: N+1 Queries in Dashboard Aggregations
**What goes wrong:** Fetching session stats per-project in a loop creates N+1 database round trips
**Why it happens:** Naive implementation queries sessions for each WIP project separately
**How to avoid:** Use Prisma aggregate queries with `groupBy` or include session data in the main project query. For "last stitched" date, use a single query with `_max` aggregation on `StitchSession.date` grouped by `projectId`.
**Warning signs:** Dashboard page taking 5+ seconds to load, Neon connection pool exhaustion

### Pitfall 5: Progress Percent Calculation Edge Cases
**What goes wrong:** Division by zero when chart has `stitchCount = 0`, or percent > 100 when sessions exceed total
**Why it happens:** Some charts have no stitch count set; session logging doesn't enforce cumulative <= total
**How to avoid:** Guard with `stitchCount > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0`. Cap at 100%.
**Warning signs:** "NaN%" displayed on cards, or "150%" progress

### Pitfall 6: Neon Cold Start Waterfall
**What goes wrong:** Sequential queries each trigger a separate cold start, compounding latency
**Why it happens:** Neon serverless Postgres wakes per-connection
**How to avoid:** Already solved by D-02's `Promise.all()` pattern. But within each data-fetching function, also batch related queries with `Promise.all()` instead of awaiting sequentially. E.g., fetch hero stats aggregations in parallel, not serially.
**Warning signs:** Dashboard load times > 3 seconds in production

### Pitfall 7: Quick Add "Log Stitches" Double Modal
**What goes wrong:** Quick Add tries to render its own session logging UI
**Why it happens:** Forgetting that the LogSessionModal is already in TopBar from Phase 8
**How to avoid:** Per D-08, "Log Stitches" in Quick Add opens the EXISTING LogSessionModal. This means the Quick Add component needs to communicate with TopBar to open the modal. The simplest approach: Quick Add sets a shared state (via context or callback prop) that TopBar listens to. Alternatively, Quick Add can dispatch a custom event that TopBar handles.
**Warning signs:** Two different session logging modals in the app

## Code Examples

### Dashboard Data Action Structure
```typescript
// Source: Pattern from src/lib/actions/pattern-dive-actions.ts [VERIFIED: codebase]
"use server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function getMainDashboardData() {
  const user = await requireAuth();

  const [
    currentlyStitching,
    startNextProjects,
    allUnstarted,
    collectionStats,
    spotlightProject,
  ] = await Promise.all([
    getCurrentlyStitchingProjects(user.id),
    getStartNextProjects(user.id),
    getUnstartedCharts(user.id),
    getCollectionStats(user.id),
    getRandomSpotlightProject(user.id),
  ]);

  // Compute buried treasures from all unstarted (oldest 10%, top 5)
  const threshold = Math.ceil(allUnstarted.length * 0.1);
  const buriedTreasures = allUnstarted
    .sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime())
    .slice(0, Math.max(threshold, 1))
    .slice(0, 5);

  return { currentlyStitching, startNextProjects, buriedTreasures, collectionStats, spotlightProject };
}
```

### Currently Stitching Query Pattern
```typescript
// [ASSUMED] Based on existing session-actions.ts patterns
async function getCurrentlyStitchingProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: { in: ["IN_PROGRESS", "ON_HOLD"] },
    },
    include: {
      chart: {
        select: { id: true, name: true, stitchCount: true, coverThumbnailUrl: true },
        include: { designer: { select: { name: true } } },
      },
      sessions: {
        select: { date: true, stitchCount: true, timeSpentMinutes: true },
        orderBy: { date: "desc" },
      },
    },
  });

  return projects
    .map((p) => {
      const lastSession = p.sessions[0];
      const totalTime = p.sessions.reduce((sum, s) => sum + (s.timeSpentMinutes ?? 0), 0);
      const stitchingDays = new Set(p.sessions.map((s) => s.date.toISOString().split("T")[0])).size;
      const progressPercent = p.chart.stitchCount > 0
        ? Math.min(100, Math.round((p.stitchesCompleted / p.chart.stitchCount) * 100))
        : 0;

      return {
        projectId: p.id,
        chartId: p.chart.id,
        projectName: p.chart.name,
        designerName: p.chart.designer?.name ?? "Unknown",
        coverThumbnailUrl: p.chart.coverThumbnailUrl,
        status: p.status,
        stitchesCompleted: p.stitchesCompleted,
        totalStitches: p.chart.stitchCount,
        progressPercent,
        lastSessionDate: lastSession?.date ?? null,
        totalTimeMinutes: totalTime,
        stitchingDays,
      };
    })
    .sort((a, b) => {
      // Sort by most recently stitched (D-01 requirement)
      if (!a.lastSessionDate && !b.lastSessionDate) return 0;
      if (!a.lastSessionDate) return 1;
      if (!b.lastSessionDate) return -1;
      return b.lastSessionDate.getTime() - a.lastSessionDate.getTime();
    });
}
```

### Shopping Cart Data Action
```typescript
// [ASSUMED] Based on existing getShoppingList pattern in shopping-actions.ts
export async function getShoppingCartData() {
  const user = await requireAuth();

  // Fetch all projects with supply needs (including fulfilled ones for quantity control)
  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
      status: { notIn: ["FINISHED", "FFO"] }, // Only active projects for shopping
    },
    include: {
      chart: { select: { name: true, stitchesWide: true, stitchesHigh: true, coverThumbnailUrl: true } },
      chart: { include: { designer: { select: { name: true } } } },
      projectThreads: { include: { thread: { include: { brand: true } } } },
      projectBeads: { include: { bead: { include: { brand: true } } } },
      projectSpecialty: { include: { specialtyItem: { include: { brand: true } } } },
      fabric: true,
    },
  });

  // Aggregate supply needs across projects (group by supply item)
  // ... returns { projects, threads, beads, specialty, fabrics }
}
```

### DashboardTabs Component
```typescript
// Source: Pattern from src/components/features/charts/pattern-dive-tabs.tsx [VERIFIED: codebase]
"use client";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DASHBOARD_TABS = ["library", "progress"] as const;
type DashboardTab = (typeof DASHBOARD_TABS)[number];

interface DashboardTabsProps {
  libraryContent: React.ReactNode;
  progressContent: React.ReactNode;
}

export function DashboardTabs({ libraryContent, progressContent }: DashboardTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...DASHBOARD_TABS]).withDefault("library"),
  );

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as DashboardTab)}>
      <TabsList variant="line">
        <TabsTrigger value="library" className="min-h-11">Your Library</TabsTrigger>
        <TabsTrigger value="progress" className="min-h-11">Progress</TabsTrigger>
      </TabsList>
      <TabsContent value="library">{libraryContent}</TabsContent>
      <TabsContent value="progress">{progressContent}</TabsContent>
    </Tabs>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Simple shopping list grouped by project | Shopping cart with project selection + supply type tabs + quantity stepper | Phase 9 | Complete replacement of `/shopping` page |
| Placeholder dashboard page | Full Main Dashboard + Project Dashboard with tabs | Phase 9 | `/` route becomes the app's primary entry point |
| No per-supply quantity control | +/- stepper with acquired/total display | Phase 9 | Users can increment acquisition instead of marking as fully acquired |

**Deprecated/outdated:**
- `ShoppingList` component (`src/components/features/shopping/shopping-list.tsx`): Replaced by `ShoppingCart`. The existing `ShoppingList` and its `getShoppingList()` action can be removed after the new shopping cart is functional.
- `PlaceholderPage` on `/`: The current dashboard placeholder is fully replaced.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Spotlight server-side random can use Prisma `findFirst` with `skip` for random selection | Code Examples | If Prisma doesn't support efficient random skip on large tables, may need raw SQL `ORDER BY RANDOM() LIMIT 1` |
| A2 | Quick Add "Log Stitches" can communicate with TopBar's LogSessionModal via callback prop or shared state | Pitfalls | If prop threading is too deep, may need React context or a custom event approach |
| A3 | Shopping cart can pre-fetch all supply data and filter client-side without performance issues | Architecture Patterns | If user has 100+ projects with thousands of supplies, initial load may be too large; would need pagination or server-side filtering |
| A4 | Currently Stitching session data (last stitched, stitching days) can be computed from included sessions without a separate aggregation query | Code Examples | If projects have hundreds of sessions, including all sessions in the main query may be expensive; may need aggregate-only approach |

## Open Questions (RESOLVED)

1. **Quick Add Modal Communication**
   - What we know: "Log Stitches" in Quick Add must open the existing LogSessionModal which lives in TopBar
   - What's unclear: Best way to trigger the modal from Quick Add without deep prop threading
   - Recommendation: Pass an `onOpenLogModal` callback from the dashboard page through to QuickAddMenu. The page.tsx (or its layout) already renders TopBar with the modal. Alternatively, lift the LogSessionModal state to a shared context.
   - RESOLVED: Plans 07/08 use custom DOM event (`open-log-session-modal`) dispatched from Quick Add, listened by TopBar. Avoids prop threading entirely.

2. **Shopping Cart: Include Finished/FFO Projects?**
   - What we know: D-09 says "project selection"; the existing ShoppingList queries all projects with supplies
   - What's unclear: Whether finished projects should appear in the shopping cart project list
   - Recommendation: Exclude FINISHED/FFO from the project selection list (they've been completed; buying more supplies doesn't make sense). But this is a CONTEXT decision that should be confirmed.
   - RESOLVED: Plan 03 excludes FINISHED/FFO projects via `status: { notIn: ["FINISHED", "FFO"] }` filter. Aligns with recommendation.

3. **Dashboard Data Fetch Size**
   - What we know: Single user app with ~500 charts
   - What's unclear: Whether fetching all data for both dashboard tabs in one Promise.all() will be fast enough
   - Recommendation: Start with eager fetch (D-02); monitor. The data volume for a single user is modest. If it becomes slow, D-02 explicitly notes this is "designed for easy route-splitting later."
   - RESOLVED: D-02 mandates eager Promise.all() fetch. Single-user data volume is modest. Plans follow this pattern. Route-splitting path documented for future if needed.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified) -- Phase 9 is purely code/config changes using existing installed dependencies. No new tools, services, or CLI utilities needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.1.1 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm test -- --run --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Currently Stitching returns WIPs sorted by last stitched | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "currently stitching"` | Wave 0 |
| DASH-02 | Start Next returns flagged projects | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "start next"` | Wave 0 |
| DASH-03 | Buried Treasures computes oldest 10%, top 5 | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "buried treasures"` | Wave 0 |
| DASH-04 | Spotlight returns random project, shuffle re-fetches | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "spotlight"` | Wave 0 |
| DASH-05 | Collection Stats aggregates counts correctly | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "collection stats"` | Wave 0 |
| DASH-06 | Quick Add menu renders all action items | unit | `npx vitest run src/components/features/dashboard/quick-add-menu.test.tsx` | Wave 0 |
| PROJ-01 | Hero stats computes correct aggregations | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "hero stats"` | Wave 0 |
| PROJ-02 | Progress buckets assign projects correctly | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "progress buckets"` | Wave 0 |
| PROJ-03 | Bucket sort applies all 5 sort options | unit | `npx vitest run src/components/features/dashboard/progress-breakdown-tab.test.tsx` | Wave 0 |
| PROJ-04 | Finished projects include session stats | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "finished"` | Wave 0 |
| PROJ-05 | Finished sort applies 4 sort options | unit | `npx vitest run src/components/features/dashboard/finished-tab.test.tsx` | Wave 0 |
| SHOP-01 | Project selection toggles and persists | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "project selection"` | Wave 0 |
| SHOP-02 | Aggregated supply needs filter by selected projects | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "supply aggregation"` | Wave 0 |
| SHOP-03 | updateSupplyAcquired updates quantity | unit | `npx vitest run src/lib/actions/shopping-cart-actions.test.ts -t "update acquired"` | Wave 0 |
| SHOP-04 | Tab badges show unfulfilled counts | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "badge counts"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose` (affected files)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/actions/dashboard-actions.test.ts` -- covers DASH-01 through DASH-05
- [ ] `src/lib/actions/project-dashboard-actions.test.ts` -- covers PROJ-01, PROJ-02, PROJ-04
- [ ] `src/lib/actions/shopping-cart-actions.test.ts` -- covers SHOP-03
- [ ] `src/components/features/dashboard/quick-add-menu.test.tsx` -- covers DASH-06
- [ ] `src/components/features/dashboard/progress-breakdown-tab.test.tsx` -- covers PROJ-03
- [ ] `src/components/features/dashboard/finished-tab.test.tsx` -- covers PROJ-05
- [ ] `src/components/features/shopping/shopping-cart.test.tsx` -- covers SHOP-01, SHOP-02, SHOP-04
- [ ] `src/types/dashboard.ts` -- shared TypeScript interfaces
- [ ] Mock factories for dashboard data (extend existing `src/__tests__/mocks/factories.ts`)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Auth already handled by Auth.js v5 + requireAuth() |
| V3 Session Management | no | JWT session management already configured |
| V4 Access Control | yes | requireAuth() + userId filtering on all queries |
| V5 Input Validation | yes | Zod validation on updateSupplyAcquired server action |
| V6 Cryptography | no | No cryptographic operations |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on supply updates | Tampering | Verify junction record ownership via project.userId before updating quantityAcquired |
| Unvalidated quantity input | Tampering | Zod schema: `z.number().int().min(0).max(quantityRequired)` on updateSupplyAcquired |
| Cross-user data in dashboard queries | Information Disclosure | All Prisma queries filter by `userId` from requireAuth() |

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `prisma/schema.prisma`, existing server actions, existing component patterns
- DesignOS reference: `product-plan/sections/dashboards-and-views/` (MainDashboard.tsx, ProjectDashboard.tsx, ShoppingCart.tsx, types.ts)
- CONTEXT.md decisions D-01 through D-15
- UI-SPEC: Approved design contract with typography, spacing, color, interaction, and layout contracts

### Secondary (MEDIUM confidence)
- nuqs documentation via Context7 (`/47ng/nuqs`): `parseAsStringLiteral`, NuqsAdapter, server-side parsing
- Existing codebase patterns: Pattern Dive tabs, shopping list, session actions

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in prior phases
- Architecture: HIGH -- follows established patterns (Promise.all, nuqs tabs, server actions, presigned URLs)
- Pitfalls: HIGH -- identified from concrete codebase patterns and prior phase debugging experience
- Data queries: MEDIUM -- query structures are assumed based on existing patterns; edge cases around large datasets and aggregation performance need validation during TDD

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable -- no external dependency changes expected)

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity (scroll, expand, sort, tabs, selection)
- **Zod validation at boundaries** -- server actions for supply updates
- **Prisma schema is source of truth** -- no schema changes in this phase
- **Calculated fields at query time** -- progress percent, bucket assignment, collection stats all computed, never stored
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **TDD mandatory** -- tests before implementation in all plans
- **Impeccable gates** -- polish after UI plans, audit at phase boundary
- **Do NOT use `Button render={<Link>}`** -- use `LinkButton` for navigation
- **Do NOT nest `<form>` elements** -- Quick Add menu must use `type="button"` handlers
- **Do NOT use fallback user IDs** -- never `user.id ?? "1"`
- **Do NOT build UI without reading DesignOS reference first** -- canonical refs listed in CONTEXT.md
- **Pin exact versions** in package.json (no `^` or `~`)
- **Semantic design tokens** -- never hardcoded color scales (exception: bucket accent colors per UI-SPEC)
- **buttonVariants imported from `button-variants.ts`** in Server Components, not from `button.tsx`
