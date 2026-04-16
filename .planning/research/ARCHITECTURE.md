# Architecture Research

**Domain:** Cross-stitch project management -- Milestone 3 (Track & Measure)
**Researched:** 2026-04-16
**Confidence:** HIGH

## System Overview

Milestone 3 adds session logging, dashboards, and progress tracking to the existing codebase. This is the first milestone that introduces a **write-heavy interactive model** (StitchSession) alongside **aggregation-heavy read pages** (dashboards). The architecture must handle:

1. A new Prisma model (StitchSession) with CRUD + aggregation queries
2. A global-access modal (Log Session) triggered from multiple locations
3. Three new dashboard pages with complex multi-table read queries
4. Auto-updating progress on Project when sessions are logged
5. Pattern Dive: evolving the existing Charts page with additional tabs

```
+------------------------------------------------------------------------+
|                        Route Layer (App Router)                         |
+------------------------------------------------------------------------+
| +-------------+ +----------+ +----------+ +----------+ +-------------+ |
| | / (home)    | | /charts  | | /charts/ | | /projects| | /shopping   | |
| | page.tsx    | | page.tsx | | [id]     | | page.tsx | | page.tsx    | |
| | REPLACE:    | | RENAME:  | | MODIFY:  | | NEW:     | | MODIFY:     | |
| | MainDash    | | Pattern  | | Sessions | | Project  | | Shopping    | |
| |             | | Dive     | | tab      | | Dash     | | Cart v2     | |
| +------+------+ +-----+----+ +----+-----+ +----+-----+ +------+------+ |
|        |              |            |            |              |        |
+--------+--------------+------------+------------+--------------+--------+
|                   Feature Components Layer                              |
+------------------------------------------------------------------------+
| NEW:                          | MODIFIED:         | REUSED:             |
| +------------------+          | +-----------+     | +---------------+   |
| | MainDashboard    |          | | project-  |     | | GalleryGrid   |   |
| | (Server+Client)  |          | | detail    |     | | GalleryCard   |   |
| +------------------+          | | page.tsx  |     | | FilterBar     |   |
| | PatternDiveTabs  |          | +-----------+     | | ViewToggle    |   |
| | (Client)         |          | | project-  |     | | gallery-utils |   |
| +------------------+          | | gallery   |     | +---------------+   |
| | ProjectDashboard |          | | .tsx      |     |                     |
| | (Server+Client)  |          | +-----------+     |                     |
| +------------------+          | | shopping- |     |                     |
| | LogSessionModal  |          | | list.tsx  |     |                     |
| | (Client, global) |          | +-----------+     |                     |
| +------------------+          |                   |                     |
| | SessionsTab      |          |                   |                     |
| | (Client)         |          |                   |                     |
| +------------------+          |                   |                     |
| | WhatsNextTab     |          |                   |                     |
| | FabricReqTab     |          |                   |                     |
| | StorageViewTab   |          |                   |                     |
| +------------------+          |                   |                     |
+------------------------------------------------------------------------+
|                   Server Actions Layer                                  |
+------------------------------------------------------------------------+
| NEW:                          | MODIFIED:                              |
| +------------------+          | +-----------------+                    |
| | session-actions  |          | | chart-actions   |                    |
| | .ts (CRUD +      |          | | .ts (progress   |                    |
| | aggregation)     |          | | update, new     |                    |
| +------------------+          | | query fns)      |                    |
| | dashboard-       |          | +-----------------+                    |
| | queries.ts       |          | | shopping-       |                    |
| | (read-only       |          | | actions.ts      |                    |
| | aggregations)    |          | | (upgrade)       |                    |
| +------------------+          | +-----------------+                    |
+------------------------------------------------------------------------+
|                   Database (Prisma 7 / Neon)                           |
+------------------------------------------------------------------------+
| NEW:                          | MODIFIED:                              |
| +------------------+          | +------------------+                   |
| | StitchSession    |          | | Project          |                   |
| | (write-heavy)    |          | | (stitchesComp-   |                   |
| +------------------+          | |  leted updated   |                   |
|                               | |  by session sum) |                   |
|                               | +------------------+                   |
+------------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | New vs Modified |
|-----------|----------------|-----------------|
| `/ (dashboard page)` | Server Component: fetch dashboard data, render MainDashboard | **REPLACE** placeholder |
| `/charts` (Pattern Dive) | Server Component: fetch gallery + tab-specific data; rename route display | **MODIFY** heavily |
| `/projects` (Project Dashboard) | Server Component: fetch hero stats + progress buckets + finished | **NEW route** |
| `/charts/[id]` Sessions tab | Client Component: session table + mini stats inside project tabs | **MODIFY** add tab |
| `/shopping` | Server Component: upgrade to ShoppingCart v2 with tabs | **MODIFY** |
| `LogSessionModal` | Client Component: global modal accessible from header, FAB, project detail | **NEW** (global) |
| `session-actions.ts` | Server Actions: create/update/delete session + progress recalculation | **NEW** |
| `dashboard-queries.ts` | Read-only query functions: collection stats, progress buckets, etc. | **NEW** |
| `MainDashboard` | Client Component: Currently Stitching, Start Next, Buried Treasures, Spotlight | **NEW** |
| `PatternDiveTabs` | Client Component: Browse (existing gallery), What's Next, Fabric Reqs, Storage | **NEW** wrapping existing |
| `ProjectDashboard` | Client Component: hero stats, progress breakdown, finished tab | **NEW** |
| `WhatsNextTab` | Client Component: pre-filtered project list for kitted/flagged projects | **NEW** |
| `FabricRequirementsTab` | Client Component: fabric size calculator per project | **NEW** |
| `StorageViewTab` | Client Component: projects grouped by storage location | **NEW** |
| `SessionsTab` | Client Component: per-project session history with mini stats | **NEW** |

## Data Model Changes

### New Model: StitchSession

```prisma
model StitchSession {
  id               String   @id @default(cuid())
  project          Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  date             DateTime
  stitchCount      Int
  photoUrl         String?
  timeSpentMinutes Int?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([projectId, date])
}
```

**Key decisions:**

- **`date` as DateTime (not String):** Prisma/Postgres date comparisons and groupBy work natively. The design shows `date` as a date-only string in the UI, but we store as `DateTime` with time zeroed for aggregation performance. Alternatively, store as `@db.Date` if Prisma 7 supports it (needs verification) -- otherwise `DateTime` with midnight convention works.
- **`@@index([projectId, date])`:** Every dashboard query either filters by projectId or groups by date. This compound index covers the two hottest access patterns.
- **`onDelete: Cascade`:** When a project is deleted, its sessions should go too.
- **No `userId` on StitchSession:** The project already has `userId`. Sessions are scoped through the project's ownership. All session queries should join through Project for auth.
- **`photoUrl` is R2 key:** Same pattern as cover images -- presigned URLs resolved server-side.

### Modified Model: Project

```prisma
model Project {
  // ... existing fields ...
  sessions StitchSession[]  // NEW relation
  // stitchesCompleted remains Int @default(0) -- updated when sessions change
}
```

**Progress update strategy:** `stitchesCompleted` on Project is recalculated as `startingStitches + SUM(sessions.stitchCount)` after every session create/update/delete. This keeps the "calculated at query time" principle while avoiding expensive aggregation in every gallery card render. The recalculation happens inside the session server action's transaction.

## Integration Patterns

### 1. Log Session Modal -- Global State Access

The LogSessionModal needs to be accessible from 3+ locations:
- TopBar "Log Stitches" button (already exists as toast placeholder)
- FAB (floating action button) on mobile
- Project detail page Sessions tab

**Implementation approach: Context provider at dashboard layout level.**

```
src/app/(dashboard)/layout.tsx
  -> <SessionModalProvider>     // NEW context provider
       <AppShell>
         {children}
       </AppShell>
     </SessionModalProvider>
```

The `SessionModalProvider` manages:
- `isOpen` state
- `preselectedProjectId` (when opened from project detail)
- `activeProjects` list (fetched once, passed down)
- `openModal(projectId?: string)` function exposed via context

**Why context over URL state:** The modal is an overlay, not a route. URL state (nuqs) would pollute the URL and cause unnecessary page transitions. Context is the correct pattern for transient UI state that doesn't need to survive page reloads.

**Why not a global store (zustand/jotai):** Single-user app with one modal. React context is sufficient and avoids a new dependency.

```typescript
// src/components/features/sessions/session-modal-context.tsx
"use client";

const SessionModalContext = createContext<{
  openLogSession: (projectId?: string) => void;
} | null>(null);

export function useLogSession() {
  const ctx = useContext(SessionModalContext);
  if (!ctx) throw new Error("useLogSession must be used within SessionModalProvider");
  return ctx;
}
```

The TopBar and FAB call `openLogSession()`. The project detail Sessions tab calls `openLogSession(projectId)`.

### 2. Session Create Flow -- Data Flow

```
User fills LogSessionModal
  -> Client calls createSession(formData) server action
  -> Server action:
     1. requireAuth()
     2. Validate with Zod (projectId, date, stitchCount, optional time/photo)
     3. Verify project ownership (project.userId === user.id)
     4. prisma.$transaction:
        a. Create StitchSession record
        b. Recalculate stitchesCompleted:
           SUM = await prisma.stitchSession.aggregate({
             _sum: { stitchCount: true },
             where: { projectId }
           })
           await prisma.project.update({
             where: { id: projectId },
             data: { stitchesCompleted: startingStitches + sum }
           })
     5. revalidatePath("/charts/[chartId]")
     6. revalidatePath("/")  // dashboard
     7. revalidatePath("/projects")  // project dashboard
     8. Return { success: true }
  -> Client: close modal, toast success
```

**Why transaction:** The session creation and progress recalculation must be atomic. If the sum update fails, the session shouldn't exist.

**Why revalidatePath over revalidateTag:** The existing codebase uses `revalidatePath` consistently. Switching to tags would require refactoring all existing actions. Stay consistent.

### 3. Pattern Dive -- Evolving the Charts Page

The existing `/charts/page.tsx` renders `ProjectGallery` with gallery/list/table views. Pattern Dive adds 3 new tabs (What's Next, Fabric Requirements, Storage View) while keeping Browse as the default tab.

**Route structure stays the same:** `/charts` is the route. The page title and subtitle change to "Pattern Dive". The existing `ProjectGallery` becomes the Browse tab content.

**Tab implementation:**
```
/charts/page.tsx (Server Component)
  -> Fetch gallery data (existing getChartsForGallery)
  -> Fetch What's Next data (new query)
  -> Fetch Fabric Requirements data (new query)
  -> Fetch Storage View data (new query)
  -> Pass all data to PatternDiveClient

PatternDiveClient (Client Component)
  -> URL-persisted tab state via nuqs: ?tab=browse|whats-next|fabric|storage
  -> Browse tab renders existing ProjectGallery internals
  -> Other tabs render new components
```

**Reuse strategy:**
- `GalleryCard`, `GalleryGrid`, `ViewToggleBar`, `FilterBar`, `FilterChips` -- reused directly for Browse tab
- `gallery-utils.ts` (`transformToGalleryCard`, `SIZE_CATEGORIES`, etc.) -- reused
- `use-gallery-filters.ts` -- reused within Browse tab
- `gallery-types.ts` (`GalleryCardData`, `ViewMode`, `SortField`) -- reused

**New components needed:**
- `PatternDiveClient` -- tab container with nuqs-driven tab state
- `WhatsNextTab` -- filtered/sorted list of kitted + flagged projects
- `FabricRequirementsTab` -- fabric calculator per project with stash matching
- `StorageViewTab` -- collapsible groups by storage location

### 4. Dashboard Pages -- Query Strategy for Neon Free Tier

**Constraint:** Neon free tier has 0.25 vCPU, 512MB RAM, and cold starts after 5 minutes of inactivity. Dashboard queries must be efficient.

**Strategy: Fetch-and-compute in Server Components.**

All dashboard data is derived from existing tables (Chart, Project, Fabric, StorageLocation) plus the new StitchSession table. Rather than running many small queries, use a small number of comprehensive queries and compute derived values in TypeScript.

#### Main Dashboard Query Plan

```typescript
// dashboard-queries.ts

export async function getMainDashboardData(userId: string) {
  // Query 1: All projects with chart info (single query, ~20 entities for 500 charts)
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      chart: {
        select: {
          id: true, name: true, stitchCount: true,
          coverImageUrl: true, coverThumbnailUrl: true,
          designerId: true, designer: { select: { name: true } },
          genres: { select: { name: true } },
          dateAdded: true, stitchesWide: true, stitchesHigh: true,
        },
      },
      storageLocation: { select: { name: true } },
      fabric: { select: { id: true } },
      projectThreads: { select: { quantityRequired: true, quantityAcquired: true } },
      projectBeads: { select: { quantityRequired: true, quantityAcquired: true } },
      projectSpecialty: { select: { quantityRequired: true, quantityAcquired: true } },
    },
  });

  // Compute all dashboard sections from the single result set:
  // - currentlyStitching: status === IN_PROGRESS
  // - startNext: wantToStartNext === true
  // - buriedTreasures: status === UNSTARTED, ordered by dateAdded ASC, limit 5
  // - spotlight: random from collection (Math.random() on the array)
  // - collectionStats: counts by status, SUM of stitchesCompleted
  // - recentCharts: ordered by dateAdded DESC, limit 8

  return { currentlyStitching, startNext, buriedTreasures, ... };
}
```

**Why one big query:** For 500 charts, this is ~500 rows with joins. PostgreSQL handles this in <100ms. Multiple small queries (one per section) would cause 6+ round trips to Neon, which is expensive after cold start (~100ms per query). Single query + JS computation is faster and uses fewer connection pool slots.

**Caveat:** The `getChartsForGallery` query already fetches similar data. For Pattern Dive, we can reuse or extend it. For Main Dashboard, we need slightly different includes (genres for buried treasures, dateAdded for recently added).

#### Project Dashboard Query Plan

```typescript
export async function getProjectDashboardData(userId: string) {
  // Query 1: All projects with progress data
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      chart: {
        select: {
          name: true, stitchCount: true, coverImageUrl: true, coverThumbnailUrl: true,
          designer: { select: { name: true } },
          genres: { select: { name: true } },
        },
      },
      fabric: { select: { name: true, brand: { select: { name: true } }, count: true } },
    },
  });

  // Query 2: Session aggregates per project (for stitching days, last stitched date)
  const sessionStats = await prisma.stitchSession.groupBy({
    by: ["projectId"],
    _count: { id: true },            // stitching days (approximate)
    _sum: { stitchCount: true },
    _max: { date: true },            // last stitched date
  });

  // Merge and compute:
  // - heroStats (totalWIPs, averageProgress, closestToCompletion, etc.)
  // - progressBuckets (0%, 0-25%, 25-50%, 50-75%, 75-100%, finished)
  // - finishedProjects with expanded stats
}
```

**Why groupBy for sessions:** `groupBy` pushes aggregation to PostgreSQL. Fetching all sessions and computing in JS would be wasteful (could be thousands of rows over time). The `groupBy` returns one row per project.

**Note on "stitching days":** The `_count` on sessions gives session count, not unique days. For accurate "stitching days," we'd need `SELECT COUNT(DISTINCT date) FROM StitchSession WHERE projectId = ?`. Prisma doesn't support `COUNT(DISTINCT)` in `groupBy`. Options:
1. Use raw SQL: `prisma.$queryRaw` for this specific metric
2. Approximate with session count (good enough for v1.2, refine in v1.3 stats engine)
3. Add a computed `uniqueDays` in application code after fetching sessions

**Recommendation:** Use session count as "stitching sessions" for v1.2. Reserve accurate "stitching days" for v1.3 when the full statistics engine is built. This avoids raw SQL in v1.2.

#### Pattern Dive Tab Queries

```typescript
// What's Next: reuses the main project query, filters to kitting/kitted/flagged
// Fabric Requirements: projects + fabric stash
export async function getFabricRequirements(userId: string) {
  const [projects, fabrics] = await Promise.all([
    prisma.project.findMany({
      where: { userId, chart: { stitchesWide: { gt: 0 }, stitchesHigh: { gt: 0 } } },
      include: {
        chart: { select: { name: true, stitchesWide: true, stitchesHigh: true } },
        fabric: { select: { id: true } },
      },
    }),
    prisma.fabric.findMany({
      where: { linkedProjectId: null },  // unlinked fabric = available stash
      include: { brand: true },
    }),
  ]);
  // Compute matches in JS (fabric size >= required size for each count)
}

// Storage View: projects + fabrics grouped by storage location
export async function getStorageGroups(userId: string) {
  return prisma.storageLocation.findMany({
    where: { userId },
    include: {
      projects: {
        include: {
          chart: { select: { name: true, coverThumbnailUrl: true } },
          fabric: { select: { name: true } },
        },
      },
    },
  });
}
```

### 5. Progress Auto-Update Strategy

When a session is created/updated/deleted, `Project.stitchesCompleted` must be recalculated.

**Formula:** `stitchesCompleted = startingStitches + SUM(all sessions' stitchCount)`

**Implementation in session-actions.ts:**

```typescript
async function recalculateProgress(tx: PrismaClient, projectId: string) {
  const { _sum } = await tx.stitchSession.aggregate({
    _sum: { stitchCount: true },
    where: { projectId },
  });
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: { startingStitches: true },
  });
  await tx.project.update({
    where: { id: projectId },
    data: {
      stitchesCompleted: (project?.startingStitches ?? 0) + (_sum.stitchCount ?? 0),
    },
  });
}
```

This runs inside the same `$transaction` as the session create/update/delete, ensuring consistency.

**What about gallery cards?** Gallery cards show `stitchesCompleted` and calculate progress percentage client-side. Since `stitchesCompleted` is always up-to-date after session mutations, gallery cards automatically reflect the latest progress after revalidation.

### 6. Shopping Cart Upgrade

The existing shopping page fetches unfulfilled supplies grouped by project. The v1.2 upgrade adds:
- Project selection sidebar
- Tabbed supply types (threads, beads, specialty, fabric)
- Fabric-to-stash matching

**Architectural change:** The existing `getShoppingList()` returns project-grouped data. The new ShoppingCart design wants supply-type-grouped data with cross-project aggregation.

**New query approach:**

```typescript
export async function getShoppingCartData(userId: string) {
  // Reuse existing getShoppingList() for the project list
  // Add: aggregate by supply across projects for the supply-type tabs
  const [threads, beads, specialty] = await Promise.all([
    prisma.projectThread.findMany({
      where: {
        project: { userId },
        quantityAcquired: { lt: prisma.projectThread.fields.quantityRequired },
      },
      include: {
        thread: { include: { brand: true } },
        project: { select: { chart: { select: { name: true } } } },
      },
    }),
    // Similar for beads and specialty
  ]);

  // Group threads by threadId, aggregate quantities across projects
}
```

**Note:** The `quantityAcquired < quantityRequired` filter is not directly supported in Prisma `where` as a field comparison. The existing approach fetches all and filters in JS. This is fine for the data volumes (hundreds of supply links, not thousands).

## New File Organization

```
src/
  app/(dashboard)/
    page.tsx                           # REPLACE: Main Dashboard (was placeholder)
    charts/
      page.tsx                         # MODIFY: Pattern Dive (was ProjectGallery)
    projects/
      page.tsx                         # NEW: Project Dashboard
      loading.tsx                      # NEW: skeleton
    shopping/
      page.tsx                         # MODIFY: Shopping Cart v2
    sessions/
      page.tsx                         # KEEP: placeholder for now (full stats in v1.3)
  components/features/
    dashboard/
      main-dashboard.tsx               # NEW: Main Dashboard page component
      currently-stitching-card.tsx      # NEW: WIP card for dashboard
      buried-treasures-section.tsx      # NEW: longest-waiting unstarted
      spotlight-card.tsx               # NEW: random project spotlight
      collection-stats-sidebar.tsx     # NEW: stat summary
      scrollable-row.tsx               # NEW: horizontal scroll with arrows
      quick-add-menu.tsx               # NEW: dropdown for quick actions
    pattern-dive/
      pattern-dive-client.tsx          # NEW: tab container
      whats-next-tab.tsx               # NEW
      fabric-requirements-tab.tsx      # NEW
      storage-view-tab.tsx             # NEW
    project-dashboard/
      project-dashboard.tsx            # NEW: page component
      hero-stats.tsx                   # NEW: stat cards row
      progress-breakdown-tab.tsx       # NEW: buckets
      finished-tab.tsx                 # NEW: completed projects
    sessions/
      session-modal-context.tsx        # NEW: React context provider
      log-session-modal.tsx            # NEW: modal component
      sessions-tab.tsx                 # NEW: project detail tab
    shopping/
      shopping-cart.tsx                # NEW: upgraded shopping page (replaces shopping-list.tsx)
  lib/actions/
    session-actions.ts                 # NEW: StitchSession CRUD
    dashboard-queries.ts              # NEW: read-only aggregation functions
```

## Patterns to Follow

### Pattern 1: Server Component Page + Client Feature Component

The v1.1 pattern that works well: Server Component page fetches data, passes as props to a Client Component that handles interactivity.

```typescript
// page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await getMainDashboardData();
  const imageUrls = await getPresignedImageUrls(imageKeys);
  return <MainDashboard {...data} imageUrls={imageUrls} />;
}

// main-dashboard.tsx (Client Component)
"use client";
export function MainDashboard({ ... }: MainDashboardProps) {
  // All interactivity here
}
```

### Pattern 2: Optimistic Update for Session Logging

Session logging should feel instant. Use `useTransition` + optimistic state:

```typescript
const [isPending, startTransition] = useTransition();

function handleSave(session: SessionFormData) {
  startTransition(async () => {
    try {
      const result = await createSession(session);
      if (result.success) {
        toast.success("Session logged!");
        closeModal();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong.");
    }
  });
}
```

### Pattern 3: Shared Image Resolution

Cover images need presigned URLs. Dashboard queries fetch image keys; the page.tsx resolves them before passing to components. Same pattern as `/charts/page.tsx`:

```typescript
const imageKeys = projects.flatMap(p => [
  p.chart.coverImageUrl,
  p.chart.coverThumbnailUrl,
]);
const imageUrls = await getPresignedImageUrls(imageKeys);
```

### Pattern 4: Tab State via nuqs

Pattern Dive uses URL-persisted tab state (consistent with project detail tabs):

```typescript
import { useQueryState } from "nuqs";

const [tab, setTab] = useQueryState("tab", {
  defaultValue: "browse",
  parse: (v) => ["browse", "whats-next", "fabric", "storage"].includes(v) ? v : "browse",
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Aggregation for Dashboard Stats

**What:** Fetching all sessions client-side and computing stats in the browser.
**Why bad:** Session count grows unboundedly. With daily logging for 2+ years, that's 700+ sessions. Sending all of them to the client wastes bandwidth and battery.
**Instead:** Compute aggregates server-side with Prisma `aggregate`/`groupBy`, send only the results.

### Anti-Pattern 2: Separate Prisma Queries per Dashboard Section

**What:** Running 6+ individual `findMany` calls for each dashboard section.
**Why bad:** Each query is a round trip to Neon. After cold start (5min idle), that's 6x100ms+ = 600ms+ before any rendering.
**Instead:** Fetch the full project dataset once, compute sections in TypeScript. One round trip.

### Anti-Pattern 3: Storing Computed Progress Redundantly

**What:** Adding `progressPercent` as a stored field on Project.
**Why bad:** Must be kept in sync with `stitchesCompleted` and chart's `stitchCount`. Double bookkeeping.
**Instead:** `stitchesCompleted` is the stored value (updated via session sum). Percentage is calculated at display time: `Math.round((stitchesCompleted / stitchCount) * 100)`.

### Anti-Pattern 4: LogSessionModal as a Route

**What:** Making `/log-session` a page or parallel route.
**Why bad:** It's a modal overlay, not a destination. Opening it from the header shouldn't navigate away from the current page.
**Instead:** React context at the layout level with a portal-rendered Dialog.

### Anti-Pattern 5: Raw SQL for Simple Aggregations

**What:** Using `$queryRaw` for counts and sums that Prisma supports natively.
**Why bad:** Loses type safety, must maintain raw SQL strings.
**Instead:** Use Prisma's `aggregate`, `groupBy`, and `count`. Reserve `$queryRaw` only for `COUNT(DISTINCT)` if/when needed in v1.3.

## Build Order (Dependency-Informed)

The build order must respect data dependencies: sessions must exist before dashboards can show session-derived data.

### Phase 8: Session Logging + Pattern Dive

1. **StitchSession schema** -- `prisma db push` + `prisma generate`
2. **Session server actions** -- CRUD + progress recalculation
3. **LogSessionModal** -- UI component + Zod validation
4. **SessionModalProvider** -- context at layout level
5. **Wire TopBar button** -- replace toast placeholder with `openLogSession()`
6. **Sessions tab on project detail** -- add third tab to project-detail-page
7. **Pattern Dive tabs** -- refactor /charts to Pattern Dive with Browse + 3 new tabs
   - Browse reuses existing gallery infrastructure
   - What's Next, Fabric Requirements, Storage View are new

**Why sessions first:** Pattern Dive doesn't depend on sessions, but building sessions first establishes the data foundation. The dashboard (Phase 9) depends on both sessions and the query patterns established here.

### Phase 9: Dashboards + Shopping Cart Upgrade

1. **Dashboard query functions** -- `dashboard-queries.ts`
2. **Main Dashboard** -- replace placeholder / page
3. **Project Dashboard** -- new /projects route
4. **Shopping Cart upgrade** -- tabbed supply types, fabric matching
5. **Nav updates** -- add /projects to nav, rename /charts label

**Why dashboards after sessions:** Main Dashboard shows "Currently Stitching" cards with last-session info. Project Dashboard shows progress buckets with stitching-day counts. Both depend on StitchSession data.

## Navigation Changes

Current nav structure needs updates:

```typescript
// nav-items.ts changes:
{
  label: "Projects",
  items: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },        // KEEP (new content)
    { label: "Pattern Dive", href: "/charts", icon: Scissors },      // RENAME from "Projects"
    { label: "Project Dashboard", href: "/projects", icon: BarChart3 },  // NEW
    { label: "Shopping", href: "/shopping", icon: ShoppingCart },     // KEEP
  ],
},
```

**Note:** The "Statistics" nav item (`/stats`) remains as a placeholder for v1.3. The "Sessions" nav item (`/sessions`) could be repurposed as a standalone session log viewer or kept as placeholder.

## Scalability Considerations

| Concern | At 500 charts (now) | At 1,000 sessions | At 5,000 sessions |
|---------|---------------------|--------------------|--------------------|
| Dashboard load | <200ms (single query) | <200ms (aggregate only) | <200ms (aggregate only) |
| Session list load | N/A | 50 rows paginated | 50 rows paginated |
| Gallery load | ~200ms (existing) | No change | No change |
| Progress recalc | <50ms | <50ms (single aggregate) | <50ms (single aggregate) |
| Neon cold start | +200ms first query | Same | Same |

**Key insight:** The aggregation strategy (server-side `aggregate`/`groupBy`) scales well because PostgreSQL handles the heavy lifting. The main risk is Neon cold starts, which affect the first page load after 5 minutes of inactivity. This is a hosting constraint, not an architecture one.

## Sources

- Prisma 7 aggregate/groupBy docs: Context7 (HIGH confidence)
- Existing codebase patterns: direct code inspection (HIGH confidence)
- Design components: `product-plan/sections/dashboards-and-views/` and `product-plan/sections/stitching-sessions-and-statistics/` (HIGH confidence)
- Neon free tier specs: verified from existing deployment constraints (HIGH confidence)
