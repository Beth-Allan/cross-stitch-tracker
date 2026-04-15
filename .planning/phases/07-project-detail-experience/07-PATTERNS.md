# Phase 7: Project Detail Experience - Pattern Map

**Mapped:** 2026-04-15
**Files analyzed:** 20 new/modified files
**Analogs found:** 18 / 20

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/utils/skein-calculator.ts` | utility | transform | `src/lib/utils/fabric-calculator.ts` | exact |
| `src/lib/utils/skein-calculator.test.ts` | test | transform | `src/lib/utils/fabric-calculator.test.ts` | exact |
| `prisma/schema.prisma` (Project model) | model | CRUD | `prisma/schema.prisma` (existing Project) | exact |
| `prisma/schema.prisma` (ProjectThread) | model | CRUD | `prisma/schema.prisma` (existing ProjectThread) | exact |
| `src/lib/validations/supply.ts` | config | request-response | `src/lib/validations/supply.ts` (existing) | exact |
| `src/types/supply.ts` | config | -- | `src/types/supply.ts` (existing) | exact |
| `src/lib/actions/supply-actions.ts` (new actions) | service | CRUD | `src/lib/actions/supply-actions.ts` (existing) | exact |
| `src/lib/actions/chart-actions.ts` (settings update) | service | CRUD | `src/lib/actions/chart-actions.ts` `updateChartStatus` | exact |
| `src/app/(dashboard)/charts/[id]/page.tsx` | controller | request-response | `src/app/(dashboard)/charts/[id]/page.tsx` (existing) | exact |
| `src/components/features/charts/project-detail/types.ts` | config | -- | `src/components/features/gallery/gallery-types.ts` | role-match |
| `src/components/features/charts/project-detail/project-detail-hero.tsx` | component | request-response | `src/components/features/charts/chart-detail.tsx` (header section) | role-match |
| `src/components/features/charts/project-detail/hero-cover-banner.tsx` | component | request-response | `src/components/features/charts/chart-detail.tsx` `CoverImage` (lines 166-195) | exact |
| `src/components/features/charts/project-detail/hero-status-badge.tsx` | component | event-driven | `src/components/features/charts/status-control.tsx` | exact |
| `src/components/features/charts/project-detail/hero-kebab-menu.tsx` | component | event-driven | `src/components/shell/user-menu.tsx` | role-match |
| `src/components/features/charts/project-detail/project-tabs.tsx` | component | event-driven | `src/components/features/gallery/use-gallery-filters.ts` (nuqs pattern) | role-match |
| `src/components/features/charts/project-detail/overview-tab.tsx` | component | request-response | `src/components/features/charts/chart-detail.tsx` `OverviewTab` (lines 248-346) | exact |
| `src/components/features/charts/project-detail/supplies-tab.tsx` | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` | exact |
| `src/components/features/charts/project-detail/calculator-settings-bar.tsx` | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` (kitting summary, lines 427-469) | role-match |
| `src/components/features/charts/project-detail/supply-section.tsx` | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` `SupplySection` (lines 203-297) | exact |
| `src/components/features/charts/project-detail/supply-row.tsx` | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` `SupplyRow` (lines 101-199) | exact |
| `src/components/features/charts/project-detail/supply-footer-totals.tsx` | component | request-response | `src/components/features/charts/project-supplies-tab.tsx` (kitting summary) | role-match |
| `src/components/features/charts/project-detail/inline-supply-create.tsx` | component | event-driven | `src/components/features/charts/inline-name-dialog.tsx` | exact |
| `src/components/features/charts/editable-number.tsx` (extracted) | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` `EditableNumber` (lines 40-97) | exact |
| `src/components/features/supplies/search-to-add.tsx` (enhanced) | component | event-driven | `src/components/features/supplies/search-to-add.tsx` (existing) | exact |

## Pattern Assignments

### `src/lib/utils/skein-calculator.ts` (utility, transform)

**Analog:** `src/lib/utils/fabric-calculator.ts`

**Imports pattern** (lines 1-1):
```typescript
// No imports needed - pure math utility, same as fabric-calculator
```

**Core pattern** (lines 7-19):
```typescript
const MARGIN_INCHES = 6;

export function calculateRequiredFabricSize(
  stitchesWide: number,
  stitchesHigh: number,
  fabricCount: number,
): { requiredWidthInches: number; requiredHeightInches: number } {
  return {
    requiredWidthInches: Math.round((stitchesWide / fabricCount + MARGIN_INCHES) * 100) / 100,
    requiredHeightInches: Math.round((stitchesHigh / fabricCount + MARGIN_INCHES) * 100) / 100,
  };
}
```

**Key conventions:**
- Named export of pure functions (no default exports)
- JSDoc comment block explaining the formula derivation
- Module-level constants for magic numbers
- Return typed objects, not primitives
- No "use client" / "use server" directives (importable everywhere)

---

### `src/lib/utils/skein-calculator.test.ts` (test, transform)

**Analog:** `src/lib/utils/fabric-calculator.test.ts`

**Imports pattern** (lines 1-2):
```typescript
import { describe, it, expect } from "vitest";
import { calculateRequiredFabricSize, doesFabricFit } from "./fabric-calculator";
```

**Core test pattern** (lines 4-24):
```typescript
describe("calculateRequiredFabricSize", () => {
  it("calculates required size for 100x150 on 14ct", () => {
    const result = calculateRequiredFabricSize(100, 150, 14);
    // (100/14) + 6 = 13.14, (150/14) + 6 = 16.71
    expect(result.requiredWidthInches).toBeCloseTo(13.14, 2);
    expect(result.requiredHeightInches).toBeCloseTo(16.71, 2);
  });

  it("includes 3-inch margin on each side (6 inches total)", () => {
    // 140 stitches on 14ct = exactly 10 inches + 6 = 16
    const result = calculateRequiredFabricSize(140, 140, 14);
    expect(result.requiredWidthInches).toBe(16);
    expect(result.requiredHeightInches).toBe(16);
  });
});
```

**Key conventions:**
- Colocated test file (`foo.test.ts` next to `foo.ts`)
- Comments show the expected math inline for verification
- Use `toBeCloseTo` for floating point, `toBe` for exact integers
- Tests cover edge cases (zero values, boundary conditions)
- Descriptive `it` strings showing inputs and expected outputs

---

### `prisma/schema.prisma` — Project model additions (model, CRUD)

**Analog:** Existing `Project` model (lines 65-90) and `ProjectThread` model (lines 175-188)

**New fields on Project** (after line 83):
```prisma
model Project {
  // ... existing fields ...

  // Calculator settings (phase 7)
  strandCount    Int    @default(2)    // 1-6, default 2
  overCount      Int    @default(2)    // 1 or 2, default 2
  wastePercent   Int    @default(20)   // 0-50, default 20%
}
```

**New field on ProjectThread** (after line 183):
```prisma
model ProjectThread {
  // ... existing fields ...
  isNeedOverridden  Boolean  @default(false)
}
```

**Key conventions:**
- Int with `@default(N)` for settings with known defaults
- Boolean with `@default(false)` for flag fields
- Comment explaining range/purpose inline

---

### `src/lib/validations/supply.ts` — New schemas (config, request-response)

**Analog:** Existing `src/lib/validations/supply.ts` (lines 56-90)

**Existing pattern for project-supply schema** (lines 56-63):
```typescript
export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: z.number().int().min(0).default(0),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export type ProjectThreadInput = z.infer<typeof projectThreadSchema>;
```

**Existing update schema pattern** (lines 84-90):
```typescript
export const updateQuantitySchema = z.object({
  quantityRequired: z.number().int().min(1).optional(),
  quantityAcquired: z.number().int().min(0).optional(),
  stitchCount: z.number().int().min(0).optional(),
});

export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
```

**Key conventions:**
- `z.object({})` with explicit field validators
- `.int().min(N).default(N)` for integer fields with defaults
- `.optional()` for partial update schemas
- Export both schema and inferred type on consecutive lines

---

### `src/lib/actions/supply-actions.ts` — New actions (service, CRUD)

**Analog:** `src/lib/actions/supply-actions.ts` existing patterns

**Server action scaffold** (lines 1-6):
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
```

**Create + link pattern** (lines 369-394 — `addThreadToProject`):
```typescript
export async function addThreadToProject(formData: unknown) {
  await requireAuth();

  try {
    const validated = projectThreadSchema.parse(formData);
    const record = await prisma.projectThread.create({ data: validated });
    revalidatePath(`/charts/${validated.projectId}`);
    revalidatePath("/shopping");
    return { success: true as const, record };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (isP2002(error)) {
      return {
        success: false as const,
        error: "This thread is already linked to this project",
      };
    }
    console.error("addThreadToProject error:", error);
    return {
      success: false as const,
      error: "Failed to add thread to project",
    };
  }
}
```

**Update pattern** (lines 450-489 — `updateProjectSupplyQuantity`):
```typescript
export async function updateProjectSupplyQuantity(
  id: string,
  type: "thread" | "bead" | "specialty",
  formData: unknown,
) {
  await requireAuth();

  try {
    const validated = updateQuantitySchema.parse(formData);

    if (type === "thread") {
      await prisma.projectThread.update({
        where: { id },
        data: validated,
      });
    } else if (type === "bead") {
      // ... same pattern
    }

    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateProjectSupplyQuantity error:", error);
    return {
      success: false as const,
      error: "Failed to update supply quantity",
    };
  }
}
```

**Read with ordering pattern** (lines 539-564 — `getProjectSupplies`):
```typescript
export async function getProjectSupplies(projectId: string) {
  await requireAuth();

  const [threads, beads, specialty] = await Promise.all([
    prisma.projectThread.findMany({
      where: { projectId },
      include: { thread: { include: { brand: true } } },
    }),
    // ...
  ]);

  return { threads: sortedThreads, beads, specialty };
}
```

**Key conventions:**
- `"use server"` directive at file top
- `await requireAuth()` as first line in every action
- Zod parse at boundary: `schema.parse(formData)`
- Return `{ success: true as const, ... }` or `{ success: false as const, error: "..." }`
- Catch ZodError first, then P2002 (unique violation), then generic
- `revalidatePath()` after mutations
- `console.error` for unexpected errors

---

### `src/lib/actions/chart-actions.ts` — `updateProjectSettings` (service, CRUD)

**Analog:** `src/lib/actions/chart-actions.ts` `updateChartStatus` (lines 247-279)

**Auth + ownership check pattern** (lines 247-265):
```typescript
export async function updateChartStatus(chartId: string, status: string) {
  const user = await requireAuth();

  try {
    const validatedStatus = z.enum(PROJECT_STATUSES as [string, ...string[]]).parse(status);

    // Scope update to owned projects only
    const project = await prisma.project.findUnique({
      where: { chartId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.project.update({
      where: { chartId },
      data: { status: validatedStatus as (typeof PROJECT_STATUSES)[number] },
    });

    revalidatePath(`/charts/${chartId}`);
    return { success: true as const };
  } catch (error) {
    // ...
  }
}
```

**Key conventions:**
- `const user = await requireAuth()` (stores user for ownership check)
- Ownership verification before mutation: `findUnique` + `userId !== user.id`
- Revalidate specific chart path after update

---

### `src/app/(dashboard)/charts/[id]/page.tsx` ��� Expanded data fetch (controller, request-response)

**Analog:** `src/app/(dashboard)/charts/[id]/page.tsx` (existing, lines 1-19)

**Full file** (lines 1-19):
```typescript
import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { getProjectSupplies } from "@/lib/actions/supply-actions";
import { ChartDetail } from "@/components/features/charts/chart-detail";

export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = await getChart(id);
  if (!chart) notFound();

  // Resolve R2 keys to presigned URLs server-side
  const [projectSupplies, imageUrls] = await Promise.all([
    chart.project ? getProjectSupplies(chart.project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
  ]);

  return <ChartDetail chart={chart} projectSupplies={projectSupplies} imageUrls={imageUrls} />;
}
```

**Key conventions:**
- Server Component (no "use client")
- `await params` (Next.js 16 async params)
- `notFound()` for missing data
- `Promise.all` for parallel data fetching
- Pass all data as props to a single client component

---

### `src/components/features/charts/project-detail/types.ts` (config)

**Analog:** `src/components/features/gallery/gallery-types.ts`

**Const array + type pattern** (lines 18-19, 23-32):
```typescript
export const VIEW_MODES = ["gallery", "list", "table"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const SORT_FIELDS = [
  "dateAdded",
  "name",
  // ...
] as const;
export type SortField = (typeof SORT_FIELDS)[number];
```

**Interface pattern** (lines 39-64):
```typescript
export interface GalleryCardData {
  chartId: string;
  projectId: string | null;
  // ... typed fields
}
```

**Key conventions:**
- `as const` arrays for enum-like values
- Derive types from const arrays: `(typeof X)[number]`
- Re-export Prisma types for convenience
- Import from `@/generated/prisma/client` for Prisma types

---

### `src/components/features/charts/project-detail/project-detail-hero.tsx` (component, request-response)

**Analog:** `src/components/features/charts/chart-detail.tsx` header section (lines 92-162)

**Client component with sub-components pattern** (lines 1-5, 81-161):
```typescript
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// ...

export function ChartDetail({ chart, projectSupplies, imageUrls = {} }: ChartDetailProps) {
  const project = chart.project;
  const status = project?.status ?? "UNSTARTED";
  // ... derived state

  return (
    <div className="space-y-6">
      <BackToGalleryLink />
      <div className="flex flex-col gap-6 lg:flex-row">
        <CoverImage ... />
        <div className="flex-1 space-y-3">
          <StatusBadge status={status} size="md" />
          <h1 className="font-heading text-foreground text-2xl font-semibold">{chart.name}</h1>
          {/* ... metadata */}
          <div className="flex items-center gap-2 pt-2">
            <LinkButton href={`/charts/${chart.id}/edit`} variant="outline">
              <Pencil className="size-4" data-icon="inline-start" />
              Edit
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Key conventions:**
- `"use client"` for interactivity
- `font-heading` for Fraunces headings, semantic tokens for colors
- `LinkButton` for navigation-that-looks-like-button (never `Button render={<Link>}`)
- Lucide icons with `data-icon="inline-start"` in buttons
- Inline sub-components in same file for tightly coupled pieces

---

### `src/components/features/charts/project-detail/hero-cover-banner.tsx` (component, request-response)

**Analog:** `src/components/features/charts/chart-detail.tsx` `CoverImage` function (lines 166-195)

**Image with error handling pattern** (lines 166-195):
```typescript
function CoverImage({
  coverImageUrl,
  chartName,
}: {
  coverImageUrl: string | null;
  chartName: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (coverImageUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={coverImageUrl}
        alt={`Cover for ${chartName}`}
        className="bg-muted aspect-[4/3] max-h-80 w-full rounded-lg object-contain lg:w-80"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="bg-muted flex max-h-80 w-full items-center justify-center rounded-lg lg:w-80">
      {/* fallback */}
    </div>
  );
}
```

**Key conventions:**
- `useState(false)` for image error tracking
- `onError={() => setImgError(true)}` fallback
- `/* eslint-disable-next-line @next/next/no-img-element */` for presigned URLs (not optimizable by Next Image)
- `object-contain` to preserve aspect ratio (D-01: never crop)
- `alt` text follows `Cover for {chartName}` pattern

---

### `src/components/features/charts/project-detail/hero-status-badge.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/status-control.tsx` (full file, lines 1-81)

**Interactive Select with optimistic update pattern** (lines 22-80):
```typescript
export function StatusControl({ chartId, currentStatus }: StatusControlProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    const validStatus = newStatus as ProjectStatus;
    const previousStatus = status;
    setStatus(validStatus); // Optimistic

    startTransition(async () => {
      try {
        const result = await updateChartStatus(chartId, validStatus);
        if (result.success) {
          toast.success(`Status changed to ${STATUS_CONFIG[validStatus].label}`);
          return;
        }
        setStatus(previousStatus); // Rollback
        toast.error("Something went wrong. Please try again.");
      } catch {
        setStatus(previousStatus); // Rollback
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[status].dotClass}`}
            />
            {STATUS_CONFIG[status].label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PROJECT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {/* ... */}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**Key conventions:**
- `STATUS_CONFIG` and `PROJECT_STATUSES` from `@/lib/utils/status`
- Optimistic update: save previous, set new, rollback on failure
- `startTransition` wraps async server action calls
- `toast.success` / `toast.error` for feedback
- Color dots use `STATUS_CONFIG[status].dotClass`

---

### `src/components/features/charts/project-detail/hero-kebab-menu.tsx` (component, event-driven)

**Analog:** `src/components/shell/user-menu.tsx` (DropdownMenu pattern, lines 1-59)

**DropdownMenu pattern** (lines 34-58):
```typescript
<DropdownMenu>
  <DropdownMenuTrigger
    aria-label="User menu"
    className="hover:bg-accent focus-visible:ring-ring flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 py-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    {/* icon trigger */}
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" sideOffset={8} className="w-56">
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleAction}>
      <LogOut className="h-4 w-4" strokeWidth={1.5} />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Delete dialog pattern** (from `chart-detail.tsx` lines 199-246):
```typescript
function DeleteChartDialog({ chartId, chartName }: { chartId: string; chartName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteChart(chartId);
        if (result.success) {
          toast.success("Chart deleted");
          setOpen(false);
          router.push("/charts");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }
  // Dialog with DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
}
```

**Key conventions:**
- `aria-label` on trigger button
- `min-h-11 min-w-11` for 44px touch targets
- `align="end"` + `sideOffset={8}` for positioning
- Icon in `DropdownMenuItem` with `h-4 w-4 strokeWidth={1.5}`
- Delete action opens a confirmation `Dialog` (not inline)
- Dialog stays open on failure (retry-able)

---

### `src/components/features/charts/project-detail/project-tabs.tsx` (component, event-driven)

**Analog:** `src/components/features/gallery/use-gallery-filters.ts` (nuqs pattern, lines 1-28)

**nuqs URL state pattern** (lines 1-3, 25-28):
```typescript
"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";

// ...
const [view, setViewRaw] = useQueryState(
  "view",
  parseAsStringLiteral([...VIEW_MODES]).withDefault("gallery"),
);
```

**shadcn Tabs component** (from `src/components/ui/tabs.tsx`):
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Controlled tabs with nuqs:
<Tabs value={tab} onValueChange={(val) => setTab(val as TabValue)}>
  <TabsList variant="line">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="supplies">Supplies</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="supplies">...</TabsContent>
</Tabs>
```

**Key conventions:**
- `parseAsStringLiteral([...VALUES])` for validated enum URL params
- `.withDefault("overview")` for default tab
- `Tabs` component uses `value` + `onValueChange` for controlled mode
- `variant="line"` for underline-style tabs (not pill)

---

### `src/components/features/charts/project-detail/overview-tab.tsx` (component, request-response)

**Analog:** `src/components/features/charts/chart-detail.tsx` `OverviewTab` function (lines 248-346)

**Status-aware section rendering pattern** (lines 250-346):
```typescript
function OverviewTab({ chart }: { chart: ChartWithProject }) {
  const project = chart.project;
  const { count: effectiveStitchCount } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const showProgress =
    project && ["IN_PROGRESS", "ON_HOLD", "FINISHED", "FFO"].includes(project.status);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {showProgress && project && (
        <InfoCard icon={Scissors} title="Stitching Progress">
          <div className="space-y-1">
            <ProgressBar value={project.stitchesCompleted} max={effectiveStitchCount} className="mb-4" />
            <DetailRow label="Completed" value={`${formatNumber(project.stitchesCompleted)} stitches`} />
            <DetailRow label="Remaining" value={`${formatNumber(Math.max(0, effectiveStitchCount - project.stitchesCompleted))} stitches`} />
          </div>
        </InfoCard>
      )}
      {/* ... more InfoCards for Pattern Details, Project Setup, Dates */}
    </div>
  );
}
```

**InfoCard + DetailRow composition** (from `info-card.tsx` lines 12-22):
```typescript
export function InfoCard({ icon: Icon, title, children, className }: InfoCardProps) {
  return (
    <div className={cn("bg-card border-border overflow-hidden rounded-xl border", className)}>
      <div className="border-border flex items-center gap-2 border-b px-5 py-3.5">
        <Icon className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
        <h3 className="font-heading text-foreground text-sm font-semibold">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
```

**Key conventions:**
- Conditional rendering based on `project.status` values
- `InfoCard` wraps each section with icon + heading
- `DetailRow` for label-value pairs inside InfoCards
- `formatNumber()` using `Intl.NumberFormat` for stitch counts
- `formatDate()` / `formatDateOnly()` for date display
- Grid layout: `grid grid-cols-1 gap-6 lg:grid-cols-2`

---

### `src/components/features/charts/project-detail/supplies-tab.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx` (lines 299-end)

**Main supplies component with mutation handlers** (lines 308-425):
```typescript
export function ProjectSuppliesTab({
  projectId,
  threads,
  beads,
  specialty,
}: ProjectSuppliesTabProps) {
  const [addingType, setAddingType] = useState<"thread" | "bead" | "specialty" | null>(null);
  const [, startTransition] = useTransition();

  // Kitting summary calculations
  const totalItems = threads.length + beads.length + specialty.length;
  const fulfilledThreads = threads.filter(
    (pt) => pt.quantityAcquired >= pt.quantityRequired,
  ).length;
  // ...

  // Already-linked IDs for filtering search results
  const linkedThreadIds = threads.map((pt) => pt.threadId);

  const handleRemoveThread = useCallback((id: string, brandCode: string) => {
    startTransition(async () => {
      try {
        const result = await removeProjectThread(id);
        if (result.success) {
          toast.success(`Removed ${brandCode} from project`);
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (id: string, type: "thread" | "bead" | "specialty", field: string, value: number) => {
      startTransition(async () => {
        try {
          const result = await updateProjectSupplyQuantity(id, type, { [field]: value });
          if (!result.success) {
            toast.error(result.error ?? "Something went wrong. Please try again.");
          }
        } catch {
          toast.error("Something went wrong. Please try again.");
        }
      });
    },
    [],
  );
  // ...
}
```

**Key conventions:**
- `useCallback` for all mutation handlers (passed as props to child components)
- `startTransition` wraps server action calls
- `toast.success`/`toast.error` for user feedback
- Derived state computed in-component (fulfillment counts, percentages)
- `linkedIds` array passed to SearchToAdd for filtering

---

### `src/components/features/charts/project-detail/calculator-settings-bar.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx` kitting summary (lines 427-469) + `EditableNumber` pattern (lines 40-97)

**Compact inline display + editing pattern** (lines 427-469):
```typescript
<div className="border-border bg-card overflow-hidden rounded-xl border">
  <div className="px-5 py-4">
    <h3 className="font-heading text-foreground mb-3 text-sm font-semibold">
      Supply Kitting
    </h3>
    {/* Inline editable values */}
  </div>
</div>
```

**EditableNumber inline editing** (lines 40-97):
```typescript
function EditableNumber({ value, onSave, className }: { value: number; onSave: (value: number) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { /* validate + save */ }}
        onKeyDown={(e) => { /* Enter to save, Escape to cancel */ }}
        className="bg-card text-foreground border-primary focus:ring-primary/40 w-12 rounded border px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className={`hover:bg-muted cursor-text rounded px-1.5 py-0.5 transition-colors ${className ?? ""}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}
```

**Key conventions:**
- Settings bar uses `bg-muted rounded-lg px-4 py-3` (per UI-SPEC)
- Labels use `text-sm uppercase tracking-wider font-semibold`
- Each setting uses `EditableNumber` pattern (click to edit, Enter/Escape)
- Horizontal flex layout with gaps for inline controls

---

### `src/components/features/charts/project-detail/supply-section.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx` `SupplySection` (lines 203-297)

**Collapsible section with header pattern** (lines 203-297):
```typescript
function SupplySection({
  title,
  icon: Icon,
  count,
  fulfilledCount,
  defaultOpen,
  children,
  onAddClick,
  addLabel,
  emptyText,
}: { /* ... typed props */ }) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? count > 0);
  const allFulfilled = count > 0 && fulfilledCount === count;

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-3.5 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        )}
        <Icon className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        <h3 className="font-heading text-foreground flex-1 text-left text-sm font-semibold">
          {title}
        </h3>
        <span className="flex items-center gap-2 text-xs">
          {/* fulfillment indicator */}
        </span>
      </button>

      {isOpen && (
        <div className="border-border border-t px-5 pb-4">
          {count === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-2 text-sm">{emptyText}</p>
              <button type="button" onClick={onAddClick}
                className="text-primary hover:text-primary/80 mx-auto flex items-center gap-1.5 text-sm font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" />
                {addLabel}
              </button>
            </div>
          ) : (
            <>
              <div className="pt-1">{children}</div>
              <button type="button" onClick={onAddClick}
                className="text-primary hover:text-primary/80 mt-3 flex items-center gap-1.5 text-sm font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add more
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

**Key conventions:**
- `useState(defaultOpen ?? count > 0)` for initial collapse state
- Chevron icon toggles between `ChevronDown` and `ChevronRight`
- `bg-card border-border rounded-xl` card wrapper
- `type="button"` on add buttons (avoids form submission)
- `e.stopPropagation()` when add button is inside collapsible header area
- Empty state with centered text + add button

---

### `src/components/features/charts/project-detail/supply-row.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx` `SupplyRow` (lines 101-199)

**Two-line supply row pattern** (lines 101-199):
```typescript
function SupplyRow({
  hex, code, name, brand,
  stitchCount, quantityRequired, quantityAcquired,
  isFulfilled, quantityNeeded,
  onUpdateRequired, onUpdateAcquired, onRemove,
}: { /* typed props */ }) {
  const isLight = needsBorder(hex);

  return (
    <div className="group border-border flex items-center gap-3 border-b py-3 last:border-b-0">
      {/* Swatch */}
      <div
        className={`h-7 w-7 shrink-0 rounded-full shadow-sm ${isLight ? "ring-border ring-1" : ""}`}
        style={{ backgroundColor: hex }}
      />
      {/* Code + Name */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm">
          <span className="font-medium">{brand} {code}</span>
          <span className="text-muted-foreground"> — {name}</span>
        </p>
      </div>
      {/* Quantities with EditableNumber */}
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <EditableNumber value={quantityRequired} onSave={onUpdateRequired} />
        <EditableNumber value={quantityAcquired} onSave={onUpdateAcquired} />
      </div>
      {/* Fulfillment indicator */}
      {/* Remove button */}
      <button onClick={onRemove} className="flex w-5 shrink-0 justify-center opacity-40 transition-opacity group-hover:opacity-100" aria-label={`Remove ${brand} ${code} from project`}>
        <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5 transition-colors" strokeWidth={1.5} />
      </button>
    </div>
  );
}
```

**`needsBorder` helper** (line 31-36):
```typescript
function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}
```

**Key conventions:**
- `group` class on row for hover-reveal of trash button
- Color swatch: `rounded-full`, inline `backgroundColor`, conditional `ring-1` for light colors
- `truncate` on name text, `min-w-0 flex-1` for overflow handling
- `aria-label` on remove button with color identification
- `opacity-40 group-hover:opacity-100` for progressive disclosure of delete
- `tabular-nums font-mono` for numeric columns (new in phase 7)

---

### `src/components/features/charts/project-detail/inline-supply-create.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/inline-name-dialog.tsx` (full file, lines 1-109)

**Dialog with form, error handling, and pending state** (lines 24-109):
```typescript
export function InlineNameDialog({
  open, onOpenChange, title, initialName = "", placeholder = "Enter name", onSubmit,
}: InlineNameDialogProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const reset = () => { setName(""); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = name.trim();
    if (!trimmedName) { setError("Name is required"); return; }

    setIsPending(true);
    setError(null);
    try {
      await onSubmit(trimmedName);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="entity-name" required error={error ?? undefined}>
            <Input id="entity-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} autoFocus />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Key conventions:**
- `open` / `onOpenChange` controlled dialog pattern
- `e.preventDefault()` + `e.stopPropagation()` on form submit (prevents outer form interference)
- Client-side validation before server call (`.trim()` + empty check)
- `setError(err instanceof Error ? err.message : "Failed to create")` for error display
- `isPending` disables buttons during submission
- Reset state on dialog close
- `FormField` wrapper for label + error display

---

### `src/components/features/charts/editable-number.tsx` (extracted component)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx` `EditableNumber` (lines 40-97)

This is a direct extraction. See the full code excerpt under the calculator-settings-bar section above.

**Additional requirement from UI-SPEC:** Add `ariaLabel` prop:
```typescript
export function EditableNumber({
  value, onSave, className, ariaLabel,
}: {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  // ... same implementation, add aria-label={ariaLabel} to input
}
```

---

### `src/components/features/supplies/search-to-add.tsx` (enhanced component)

**Analog:** `src/components/features/supplies/search-to-add.tsx` (existing, lines 1-80+)

**Click-outside with timestamp guard** (lines 70-80):
```typescript
useEffect(() => {
  const mountedAt = Date.now();

  function handleMouseDown(e: MouseEvent) {
    if (Date.now() - mountedAt < 200) return;
    if (ref.current && !ref.current.contains(e.target as Node)) {
      onClose();
    }
  }
  // ...
}, [onClose]);
```

**Key enhancements needed:**
1. Positioning: Change `bottom-0` to `bottom-full mb-1` for flip-up (fix 999.0.15)
2. Highlight: Only show keyboard highlight after arrow key use, not `highlightIndex=0` on mount (fix 999.0.16)
3. Scroll: Add `scrollIntoView` when items are added (fix 999.0.13)
4. Inline create: Add `"+ Create [search text]"` option at bottom when no results match

---

## Shared Patterns

### Authentication (all server actions)
**Source:** `src/lib/auth-guard.ts` via `requireAuth()`
**Apply to:** All new/modified server actions (`updateProjectSettings`, `createAndAddThread`, etc.)
```typescript
import { requireAuth } from "@/lib/auth-guard";

export async function someAction(formData: unknown) {
  const user = await requireAuth();
  // ... user.id available for ownership checks
}
```

### Optimistic Updates with Rollback (all interactive components)
**Source:** `src/components/features/charts/status-control.tsx` (lines 25-45)
**Apply to:** HeroStatusBadge, SupplyRow, CalculatorSettingsBar, EditableNumber consumers
```typescript
const [isPending, startTransition] = useTransition();

function handleChange(newValue: string) {
  const previous = currentValue;
  setCurrentValue(newValue); // Optimistic
  startTransition(async () => {
    try {
      const result = await serverAction(id, newValue);
      if (!result.success) {
        setCurrentValue(previous); // Rollback
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      setCurrentValue(previous); // Rollback
      toast.error("Something went wrong. Please try again.");
    }
  });
}
```

### Server Action Return Types (all actions)
**Source:** `src/lib/actions/supply-actions.ts` (pattern across all actions)
**Apply to:** All new server actions
```typescript
// Success: return { success: true as const, [data] }
// Failure: return { success: false as const, error: "Human-readable message" }
```

### Semantic Token Usage (all UI components)
**Source:** `src/components/features/charts/chart-detail.tsx`, `info-card.tsx`, `detail-row.tsx`
**Apply to:** All new components
```typescript
// Cards: "bg-card border-border rounded-xl"
// Text: "text-foreground", "text-muted-foreground"
// Headings: "font-heading text-foreground text-sm font-semibold"
// Labels: "text-muted-foreground text-xs font-semibold tracking-wider uppercase"
// Interactive: "hover:bg-muted", "transition-colors"
```

### Test Infrastructure (all test files)
**Source:** `src/lib/actions/supply-actions.test.ts` (lines 1-34) and `src/components/features/charts/project-supplies-tab.test.tsx` (lines 1-46)
**Apply to:** All new test files

**Server action test setup:**
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockThread, ... } from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
```

**Component test setup:**
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";

// Mock server actions as vi.fn().mockResolvedValue({ success: true })
vi.mock("@/lib/actions/supply-actions", () => ({
  removeProjectThread: (...args: unknown[]) => mockRemoveProjectThread(...args),
  // ...
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
```

### Status Config (hero, overview, badges)
**Source:** `src/lib/utils/status.ts` (full file)
**Apply to:** HeroStatusBadge, OverviewTab, celebration treatments
```typescript
import { STATUS_CONFIG, PROJECT_STATUSES } from "@/lib/utils/status";
// STATUS_CONFIG[status].label, .bgClass, .textClass, .dotClass, .darkBgClass
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/charts/project-detail/supply-footer-totals.tsx` | component | request-response | No existing footer totals component; derive pattern from the kitting summary card in `project-supplies-tab.tsx` (lines 427-469) but the "column totals" row is genuinely new UI. Use `tabular-nums font-mono` for numeric columns, `bg-muted rounded-lg` bar styling from UI-SPEC. |
| `src/components/features/charts/project-detail/calculator-settings-bar.tsx` | component | event-driven | No existing settings toolbar; closest analog is the kitting summary card. The "compact spreadsheet toolbar" aesthetic (uppercase labels, inline editable values) is new to this codebase. Follow UI-SPEC spacing (px-4 py-3, bg-muted rounded-lg) and RESEARCH Pattern 4 for optimistic updates. |

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/components/features/gallery/`, `src/components/features/supplies/`, `src/components/shell/`, `src/components/ui/`, `src/lib/actions/`, `src/lib/utils/`, `src/lib/validations/`, `src/types/`, `prisma/`
**Files scanned:** 45+ source files read for pattern extraction
**Pattern extraction date:** 2026-04-15
