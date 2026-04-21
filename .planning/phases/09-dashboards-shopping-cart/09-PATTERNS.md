# Phase 9: Dashboards & Shopping Cart - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 28 new/modified files
**Analogs found:** 28 / 28

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(dashboard)/page.tsx` | route | request-response | `src/app/(dashboard)/charts/page.tsx` | exact |
| `src/app/(dashboard)/shopping/page.tsx` | route | request-response | `src/app/(dashboard)/charts/page.tsx` | exact |
| `src/lib/actions/dashboard-actions.ts` | service | CRUD (read-only aggregation) | `src/lib/actions/pattern-dive-actions.ts` | exact |
| `src/lib/actions/project-dashboard-actions.ts` | service | CRUD (read-only aggregation) | `src/lib/actions/pattern-dive-actions.ts` | exact |
| `src/lib/actions/shopping-cart-actions.ts` | service | CRUD | `src/lib/actions/shopping-actions.ts` | exact |
| `src/types/dashboard.ts` | types | N/A | `src/types/session.ts` | exact |
| `src/components/features/dashboard/dashboard-tabs.tsx` | component | request-response | `src/components/features/charts/pattern-dive-tabs.tsx` | exact |
| `src/components/features/dashboard/main-dashboard.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` | role-match |
| `src/components/features/dashboard/currently-stitching-card.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` (card rows) | role-match |
| `src/components/features/dashboard/scrollable-row.tsx` | component | event-driven | N/A (new utility) | no-analog |
| `src/components/features/dashboard/collection-stats-sidebar.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` | role-match |
| `src/components/features/dashboard/spotlight-card.tsx` | component | request-response | `src/components/features/gallery/gallery-card.tsx` | role-match |
| `src/components/features/dashboard/buried-treasures-section.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` | role-match |
| `src/components/features/dashboard/quick-add-menu.tsx` | component | event-driven | N/A (new dropdown) | no-analog |
| `src/components/features/dashboard/section-heading.tsx` | component | request-response | N/A (new primitive) | no-analog |
| `src/components/features/dashboard/project-dashboard.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` | role-match |
| `src/components/features/dashboard/hero-stats.tsx` | component | request-response | N/A (new stat grid) | no-analog |
| `src/components/features/dashboard/progress-breakdown-tab.tsx` | component | event-driven | `src/components/features/charts/whats-next-tab.tsx` | role-match |
| `src/components/features/dashboard/bucket-project-row.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` (card rows) | role-match |
| `src/components/features/dashboard/finished-tab.tsx` | component | event-driven | `src/components/features/charts/whats-next-tab.tsx` | exact |
| `src/components/features/dashboard/finished-project-card.tsx` | component | request-response | `src/components/features/charts/whats-next-tab.tsx` (card rows) | role-match |
| `src/components/features/shopping/shopping-cart.tsx` | component | event-driven | `src/components/features/shopping/shopping-list.tsx` | exact |
| `src/components/features/shopping/project-selection-list.tsx` | component | event-driven | N/A (new selection UI) | no-analog |
| `src/components/features/shopping/shopping-for-bar.tsx` | component | request-response | N/A (new sticky bar) | no-analog |
| `src/components/features/shopping/supply-tab.tsx` | component | request-response | `src/components/features/shopping/shopping-list.tsx` (SupplyRow) | exact |
| `src/components/features/shopping/quantity-control.tsx` | component | event-driven | N/A (new stepper) | no-analog |
| `src/components/features/shopping/fabric-tab.tsx` | component | request-response | `src/components/features/shopping/shopping-list.tsx` (FabricRow) | role-match |
| `src/components/features/shopping/shopping-list-tab.tsx` | component | request-response | `src/components/features/shopping/shopping-list.tsx` | role-match |

## Pattern Assignments

### `src/app/(dashboard)/page.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/charts/page.tsx`

**Server component page with Promise.all() eager fetch** (lines 1-51):
```typescript
// FULL PATTERN: server component that fetches all tab data in parallel
import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import {
  getWhatsNextProjects,
  getFabricRequirements,
  getStorageGroups,
} from "@/lib/actions/pattern-dive-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";
import { PatternDiveTabs } from "@/components/features/charts/pattern-dive-tabs";
// ... tab content component imports

export default async function ChartsPage() {
  // D-10: All four tab datasets fetched eagerly via Promise.all()
  const [charts, whatsNextProjects, fabricRequirements, storageGroups] = await Promise.all([
    getChartsForGallery(),
    getWhatsNextProjects(),
    getFabricRequirements(),
    getStorageGroups(),
  ]);

  // Collect all image keys that need presigned URLs across all tabs
  const imageKeys = [
    ...charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]),
    ...whatsNextProjects.map((p) => p.coverThumbnailUrl),
    // ... more image key collection
  ];
  const imageUrls = await getPresignedImageUrls(imageKeys);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pattern Dive</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Explore your collection...
        </p>
      </div>

      <PatternDiveTabs
        browseContent={<ProjectGallery charts={charts} imageUrls={imageUrls} hideHeader />}
        whatsNextContent={<WhatsNextTab projects={whatsNextProjects} imageUrls={imageUrls} />}
        // ... more tab content props
      />
    </div>
  );
}
```

**Key points for new page.tsx:**
- Replace placeholder with `Promise.all([getMainDashboardData(), getProjectDashboardData()])`
- Collect image keys from both dashboard datasets
- Pass pre-fetched data as props to `<DashboardTabs>` client component
- Page header styling: `font-heading text-2xl font-semibold`

---

### `src/app/(dashboard)/shopping/page.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/shopping/page.tsx` (existing) + `src/app/(dashboard)/charts/page.tsx`

**Existing shopping page structure** (lines 1-19):
```typescript
import { getShoppingList } from "@/lib/actions/shopping-actions";
import { ShoppingList } from "@/components/features/shopping/shopping-list";

export default async function ShoppingPage() {
  const projects = await getShoppingList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Shopping List</h1>
        <p className="text-muted-foreground text-sm">
          Supplies you still need, grouped by project.
        </p>
      </div>

      <ShoppingList projects={projects} />
    </div>
  );
}
```

**Key points for replacement:**
- Change import to `getShoppingCartData` from `shopping-cart-actions`
- Replace `<ShoppingList>` with `<ShoppingCart>`
- Update heading to "Shopping Cart"
- Add `getPresignedImageUrls` for project cover thumbnails

---

### `src/lib/actions/dashboard-actions.ts` (service, read-only aggregation)

**Analog:** `src/lib/actions/pattern-dive-actions.ts`

**Imports pattern** (lines 1-6):
```typescript
"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { WhatsNextProject, FabricRequirementRow, StorageGroup } from "@/types/session";
```

**Auth + query + transform pattern** (lines 12-85, getWhatsNextProjects):
```typescript
export async function getWhatsNextProjects(): Promise<WhatsNextProject[]> {
  const user = await requireAuth();

  const charts = await prisma.chart.findMany({
    where: {
      project: {
        userId: user.id,
        status: { in: ["UNSTARTED", "KITTED"] },
      },
    },
    include: {
      designer: { select: { name: true } },
      project: {
        select: {
          id: true,
          status: true,
          wantToStartNext: true,
          // ... related data
        },
      },
    },
  });

  const projects: WhatsNextProject[] = charts
    .filter((c) => c.project)
    .map((c) => {
      const p = c.project!;
      // ... computed fields
      return { /* mapped shape */ };
    });

  // Sort by ranking criteria
  projects.sort((a, b) => { /* sort logic */ });

  return projects;
}
```

**Key points for dashboard-actions:**
- Follow same `"use server"` + `requireAuth()` + Prisma query + map/transform pattern
- Return typed arrays (define types in `src/types/dashboard.ts`)
- Use `Promise.all()` within the function to batch related sub-queries
- `getMainDashboardData()` should call internal helper functions (like `getCurrentlyStitchingProjects`, `getStartNextProjects`, etc.) via `Promise.all()`
- `getSpotlightProject()` is a separate export (called on shuffle button click)
- All queries filter by `userId` from `requireAuth()`

---

### `src/lib/actions/project-dashboard-actions.ts` (service, read-only aggregation)

**Analog:** `src/lib/actions/pattern-dive-actions.ts` + `src/lib/actions/session-actions.ts`

**Aggregate query pattern from session-actions** (lines 327-351):
```typescript
export async function getProjectSessionStats(projectId: string) {
  const user = await requireAuth();

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });
  if (!project || project.userId !== user.id) {
    return { success: false as const, error: "Project not found" };
  }

  const aggregation = await prisma.stitchSession.aggregate({
    where: { projectId },
    _sum: { stitchCount: true },
    _count: { id: true },
    _min: { date: true },
  });

  const totalStitches = aggregation._sum.stitchCount ?? 0;
  const sessionsLogged = aggregation._count.id;
  const avgPerSession = sessionsLogged > 0 ? Math.round(totalStitches / sessionsLogged) : 0;
  const activeSince = aggregation._min.date ?? null;

  return { success: true as const, stats: { totalStitches, sessionsLogged, avgPerSession, activeSince } };
}
```

**Key points for project-dashboard-actions:**
- Use `prisma.stitchSession.aggregate()` with `_sum`, `_count`, `_min`, `_max` for hero stats
- Use `prisma.project.findMany()` with session includes for bucket assignment
- Progress percent calculation: `stitchCount > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0`
- For finished projects, include session stats per-project (stitching days via `Set` of date strings)

---

### `src/lib/actions/shopping-cart-actions.ts` (service, CRUD)

**Analog:** `src/lib/actions/shopping-actions.ts`

**Full shopping query pattern** (lines 71-139, getShoppingList):
```typescript
export async function getShoppingList(): Promise<ShoppingListProject[]> {
  await requireAuth();

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { projectThreads: { some: {} } },
        { projectBeads: { some: {} } },
        { projectSpecialty: { some: {} } },
      ],
    },
    include: {
      chart: {
        select: { name: true, stitchesWide: true, stitchesHigh: true },
      },
      projectThreads: {
        include: { thread: { include: { brand: true } } },
      },
      projectBeads: {
        include: { bead: { include: { brand: true } } },
      },
      projectSpecialty: {
        include: { specialtyItem: { include: { brand: true } } },
      },
      fabric: true,
    },
  });

  return projects.map((p) => {
    const unfulfilledThreads = p.projectThreads.filter(
      (pt) => pt.quantityAcquired < pt.quantityRequired,
    );
    // ... same pattern for beads, specialty
    return { /* mapped shape */ };
  });
}
```

**Mutation pattern** (lines 143-185, markSupplyAcquired):
```typescript
export async function markSupplyAcquired(
  type: "thread" | "bead" | "specialty",
  junctionId: string,
) {
  await requireAuth();

  try {
    if (type === "thread") {
      const record = await prisma.projectThread.findUnique({
        where: { id: junctionId },
      });
      if (!record) return { success: false as const, error: "Record not found" };
      await prisma.projectThread.update({
        where: { id: junctionId },
        data: { quantityAcquired: record.quantityRequired },
      });
    } else if (type === "bead") {
      // ... same pattern
    }

    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    console.error("markSupplyAcquired error:", error);
    return { success: false as const, error: "Failed to mark as acquired" };
  }
}
```

**Key points for shopping-cart-actions:**
- Extend `getShoppingList` to return ALL supplies (not just unfulfilled) for quantity control
- New `updateSupplyAcquired(type, junctionId, acquiredQuantity)` takes explicit quantity instead of setting to max
- Add ownership verification: query project via junction record, check `project.userId === user.id`
- Add Zod validation: `z.number().int().min(0)` on acquiredQuantity
- Include `coverThumbnailUrl` on chart select for project cards

---

### `src/types/dashboard.ts` (types)

**Analog:** `src/types/session.ts`

**Type definition pattern** (lines 1-110):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Session Row (for table display) ────────────────────────────────────────

export interface StitchSessionRow {
  id: string;
  projectId: string;
  projectName: string; // From chart.name via project relation
  date: Date;
  stitchCount: number;
  timeSpentMinutes: number | null;
  photoKey: string | null;
  createdAt: Date;
}

// ─── Pattern Dive Types ─────────────────────────────────────────────────────

export interface WhatsNextProject {
  chartId: string;
  chartName: string;
  coverThumbnailUrl: string | null;
  designerName: string | null;
  status: ProjectStatus;
  wantToStartNext: boolean;
  kittingPercent: number; // 0-100
  dateAdded: Date;
  totalStitches: number;
}
```

**Key points for dashboard.ts:**
- Follow same section-comment structure with `// ─── Section ───`
- Import `ProjectStatus` from `@/generated/prisma/client`
- Export interfaces for: `CurrentlyStitchingProject`, `CollectionStats`, `SpotlightProject`, `ProgressBucket`, `BucketProject`, `FinishedProject`, `HeroStatsData`, `MainDashboardData`, `ProjectDashboardData`, `ShoppingCartData`

---

### `src/components/features/dashboard/dashboard-tabs.tsx` (component, request-response)

**Analog:** `src/components/features/charts/pattern-dive-tabs.tsx`

**Full tab component pattern** (lines 1-59):
```typescript
"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Search, Star, Layers, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const PATTERN_DIVE_TABS = ["browse", "whats-next", "fabric", "storage"] as const;
export type PatternDiveTab = (typeof PATTERN_DIVE_TABS)[number];

const TAB_CONFIG = [
  { value: "browse" as const, label: "Browse", icon: Search },
  { value: "whats-next" as const, label: "What's Next", icon: Star },
  // ...
] as const;

interface PatternDiveTabsProps {
  browseContent: React.ReactNode;
  whatsNextContent: React.ReactNode;
  fabricContent: React.ReactNode;
  storageContent: React.ReactNode;
}

export function PatternDiveTabs({
  browseContent,
  whatsNextContent,
  fabricContent,
  storageContent,
}: PatternDiveTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...PATTERN_DIVE_TABS]).withDefault("browse"),
  );

  const contentMap: Record<PatternDiveTab, React.ReactNode> = {
    browse: browseContent,
    "whats-next": whatsNextContent,
    fabric: fabricContent,
    storage: storageContent,
  };

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as PatternDiveTab)}>
      <TabsList variant="line">
        {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="min-h-11 gap-1.5" aria-label={label}>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {PATTERN_DIVE_TABS.map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue} className="pt-6">
          {contentMap[tabValue]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

**Also reference simpler version:** `src/components/features/charts/project-detail/project-tabs.tsx` (lines 1-47) uses the same pattern without icon config.

**Key points for dashboard-tabs:**
- Export `DASHBOARD_TABS = ["library", "progress"] as const`
- Use `parseAsStringLiteral([...DASHBOARD_TABS]).withDefault("library")`
- Accept `libraryContent` and `progressContent` as `React.ReactNode` props
- Use `TabsList variant="line"` and `TabsTrigger className="min-h-11"`
- Tab labels: "Your Library" and "Progress" per D-01

---

### `src/components/features/dashboard/finished-tab.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/whats-next-tab.tsx`

**Client-side sorting tab with sort dropdown** (lines 1-60):
```typescript
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowUpDown, Scissors } from "lucide-react";
import type { WhatsNextProject } from "@/types/session";
// ... more imports

type WhatsNextSort = "kitting" | "oldest" | "newest" | "largest" | "smallest";

const SORT_OPTIONS: { value: WhatsNextSort; label: string }[] = [
  { value: "kitting", label: "Kitting Readiness" },
  { value: "oldest", label: "Oldest First" },
  // ...
];

function sortProjects(projects: WhatsNextProject[], sort: WhatsNextSort): WhatsNextProject[] {
  const sorted = [...projects];
  switch (sort) {
    case "kitting":
      sorted.sort((a, b) => { /* ... */ });
      break;
    // ... more cases
  }
  return sorted;
}

export function WhatsNextTab({ projects, imageUrls }: WhatsNextTabProps) {
  const [sort, setSort] = useState<WhatsNextSort>("kitting");
  const sorted = useMemo(() => sortProjects(projects, sort), [projects, sort]);

  if (projects.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No projects queued up...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as WhatsNextSort)}
            className="border-border bg-card text-foreground cursor-pointer rounded-lg border px-3 py-1.5 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Card list */}
      <div className="flex flex-col gap-3">
        {sorted.map((project) => (
          // ... card rows
        ))}
      </div>
    </div>
  );
}
```

**Key points for finished-tab and progress-breakdown-tab:**
- Same sort dropdown pattern with `<select>` element
- `useState` for sort + `useMemo` for sorted data
- Sort options are typed string literals
- Empty state: `text-muted-foreground py-12 text-center text-sm`
- Sort bar: `flex flex-wrap items-center justify-between gap-3`
- Card list gap: `flex flex-col gap-3`

---

### `src/components/features/shopping/shopping-cart.tsx` (component, event-driven)

**Analog:** `src/components/features/shopping/shopping-list.tsx`

**Client component with server action interaction** (lines 1-72):
```typescript
"use client";

import { Fragment, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { markSupplyAcquired } from "@/lib/actions/shopping-actions";
import type { ShoppingListProject } from "@/lib/actions/shopping-actions";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PackageOpen } from "lucide-react";

function SupplyRow({ type, junctionId, brandName, code, colorName, hexColor, need }: { /* ... */ }) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAcquired() {
    startTransition(async () => {
      try {
        const result = await markSupplyAcquired(type, junctionId);
        if (result.success) {
          toast.success(`${brandName} ${code} marked as acquired`);
        } else {
          toast.error(result.error ?? "Something went wrong.");
        }
      } catch {
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 py-2">
      {hexColor && <ColorSwatch hexColor={hexColor} size="md" />}
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">{brandName} {code}</p>
        <p className="text-muted-foreground truncate text-sm">{colorName}</p>
      </div>
      <span className="text-warning text-sm font-medium whitespace-nowrap">Need {need}</span>
      <Button size="sm" className="min-h-11 md:min-h-0" onClick={handleMarkAcquired} disabled={isPending}>
        {isPending ? "Marking..." : "Mark Acquired"}
      </Button>
    </div>
  );
}
```

**Empty state pattern** (lines 166-178):
```typescript
function EmptyAllCaughtUp() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <PackageOpen className="text-muted-foreground h-8 w-8" />
      </div>
      <h2 className="font-heading text-foreground mb-2 text-lg font-semibold">All caught up!</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Every supply across all your projects is acquired. Time to stitch!
      </p>
    </div>
  );
}
```

**Key points for shopping-cart:**
- `useTransition()` + `startTransition()` for server action calls
- `toast.success()` / `toast.error()` for feedback via sonner
- `isPending` state disables buttons during mutation
- New: Add localStorage state for project selection via `usePersistedSelection` hook
- New: Add tab switching for supply types (reuse Tabs component)
- New: Replace `SupplyRow` "Mark Acquired" with `QuantityControl` stepper
- Keep `ColorSwatch`, `StatusBadge`, `Card` component reuse

---

### `src/components/features/shopping/supply-tab.tsx` (component, request-response)

**Analog:** `src/components/features/shopping/shopping-list.tsx` (SupplyRow sub-component, lines 17-72)

**SupplyRow interaction pattern** (described above). New supply-tab should:
- Filter supplies by type (threads/beads/specialty)
- Show only supplies for selected projects
- Replace binary "Mark Acquired" with quantity stepper
- Keep same row layout: color swatch + name + code + quantity display

---

## Shared Patterns

### Authentication (All Server Actions)
**Source:** `src/lib/actions/pattern-dive-actions.ts`, lines 1-3
**Apply to:** `dashboard-actions.ts`, `project-dashboard-actions.ts`, `shopping-cart-actions.ts`
```typescript
"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
```
- Every exported function starts with `const user = await requireAuth();`
- All Prisma queries filter by `userId: user.id`

### Error Handling (Server Actions)
**Source:** `src/lib/actions/session-actions.ts`, lines 50-91
**Apply to:** All mutation server actions
```typescript
try {
  // ... main logic
  revalidatePath("/...");
  return { success: true as const };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false as const, error: error.errors[0].message };
  }
  console.error("actionName error:", error);
  return { success: false as const, error: "Failed to do X" };
}
```

### Server Action Mutation UI Pattern
**Source:** `src/components/features/shopping/shopping-list.tsx`, lines 34-49
**Apply to:** `shopping-cart.tsx`, `quantity-control.tsx`, `spotlight-card.tsx`
```typescript
const [isPending, startTransition] = useTransition();

function handleAction() {
  startTransition(async () => {
    try {
      const result = await serverAction(args);
      if (result.success) {
        toast.success("Success message");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  });
}
```

### nuqs Tab State
**Source:** `src/components/features/charts/pattern-dive-tabs.tsx`, lines 30-33
**Apply to:** `dashboard-tabs.tsx`, and potentially `progress-breakdown-tab.tsx` if sub-tabs are needed
```typescript
const [tab, setTab] = useQueryState(
  "tab",
  parseAsStringLiteral([...TAB_VALUES]).withDefault("defaultValue"),
);
```

### Tab Type Exports
**Source:** `src/components/features/charts/project-detail/types.ts`, lines 10-11
**Apply to:** Dashboard tab type definitions
```typescript
export const TAB_VALUES = ["overview", "supplies", "sessions"] as const;
export type TabValue = (typeof TAB_VALUES)[number];
```

### Presigned Image URL Collection
**Source:** `src/app/(dashboard)/charts/page.tsx`, lines 25-31
**Apply to:** `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/shopping/page.tsx`
```typescript
const imageKeys = [
  ...charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]),
  ...whatsNextProjects.map((p) => p.coverThumbnailUrl),
  // ... collect all keys from all data sources
];
const imageUrls = await getPresignedImageUrls(imageKeys);
```

### Empty State
**Source:** `src/components/features/shopping/shopping-list.tsx`, lines 166-178
**Apply to:** All dashboard sections (Currently Stitching, Start Next, Buried Treasures, Collection Stats)
```typescript
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="bg-muted mb-4 rounded-full p-4">
    <Icon className="text-muted-foreground h-8 w-8" />
  </div>
  <h2 className="font-heading text-foreground mb-2 text-lg font-semibold">Title</h2>
  <p className="text-muted-foreground max-w-md text-sm">Description</p>
</div>
```

### Server Action Test Setup
**Source:** `src/lib/actions/pattern-dive-actions.test.ts`, lines 1-25
**Apply to:** `dashboard-actions.test.ts`, `project-dashboard-actions.test.ts`, `shopping-cart-actions.test.ts`
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("action-name", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  it("rejects unauthenticated calls", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { actionName } = await import("./action-file");
    await expect(actionName()).rejects.toThrow("Unauthorized");
  });
});
```

### Component Test Setup
**Source:** `src/components/features/charts/whats-next-tab.test.tsx`, lines 1-36
**Apply to:** All dashboard component tests, shopping cart component tests
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import type { SomeType } from "@/types/dashboard";
import { ComponentName } from "./component-name";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeTestData(overrides: Partial<SomeType> = {}): SomeType {
  return {
    // ... defaults
    ...overrides,
  };
}
```

### Mock Factories Extension
**Source:** `src/__tests__/mocks/factories.ts`, lines 398-422
**Apply to:** New dashboard-specific factories in the same file
```typescript
export function createMockStitchSession(
  overrides?: Partial<{
    id: string;
    projectId: string;
    date: Date;
    stitchCount: number;
    timeSpentMinutes: number | null;
    photoKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>,
) {
  return {
    id: "session-1",
    projectId: "project-1",
    date: new Date("2026-04-10"),
    stitchCount: 150,
    timeSpentMinutes: 60,
    photoKey: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```
- `createMockPrisma()` will need `project.count` added for Spotlight random skip
- New factories needed: none required since existing `createMockProject`, `createMockChart`, `createMockStitchSession` cover all dashboard data needs

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns and DesignOS reference instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/dashboard/scrollable-row.tsx` | component | event-driven | No horizontal scroll-with-arrows component exists. Build using CSS `scroll-snap-type: x mandatory` + JS arrow click handlers per RESEARCH.md. |
| `src/components/features/dashboard/quick-add-menu.tsx` | component | event-driven | No dropdown menu component with mixed navigation + modal triggers exists. Build as a popover/dropdown with button items. Check DesignOS reference. |
| `src/components/features/dashboard/section-heading.tsx` | component | request-response | No reusable section heading with accent bar exists. Build as a simple server component: Fraunces `font-heading` + accent bar per DesignOS. |
| `src/components/features/dashboard/hero-stats.tsx` | component | request-response | No stat grid component exists. Build as auto-fit CSS grid `minmax(140px, 1fr)` with Card + JetBrains Mono numbers per D-14. |
| `src/components/features/shopping/project-selection-list.tsx` | component | event-driven | No checkbox selection list component exists. Build with toggle/checkbox rows. |
| `src/components/features/shopping/shopping-for-bar.tsx` | component | request-response | No sticky chip bar component exists. Build as a sticky div with removable project chips. |
| `src/components/features/shopping/quantity-control.tsx` | component | event-driven | No +/- stepper component exists. Build with decrement/increment buttons flanking a number display. |

## Metadata

**Analog search scope:** `src/app/(dashboard)/`, `src/components/features/`, `src/lib/actions/`, `src/types/`, `src/__tests__/mocks/`
**Files scanned:** 15 analog files read
**Pattern extraction date:** 2026-04-17
