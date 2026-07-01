# Phase 32: Series Management Pages - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 10 (new/modified)
**Analogs found:** 10 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(dashboard)/series/page.tsx` | route | request-response | `src/app/(dashboard)/designers/page.tsx` | exact |
| `src/app/(dashboard)/series/[id]/page.tsx` | route | request-response | `src/app/(dashboard)/designers/[id]/page.tsx` | exact |
| `src/app/(dashboard)/series/loading.tsx` | route | request-response | `src/app/(dashboard)/designers/loading.tsx` | exact |
| `src/components/features/series/series-list.tsx` | component | CRUD | `src/components/features/designers/designer-list.tsx` | exact |
| `src/components/features/series/series-detail.tsx` | component | CRUD | `src/components/features/designers/designer-detail.tsx` | exact |
| `src/components/features/series/series-form-modal.tsx` | component | CRUD | `src/components/features/designers/designer-form-modal.tsx` | exact |
| `src/lib/actions/series-actions.ts` | service | CRUD | `src/lib/actions/designer-actions.ts` (getDesigner) | exact |
| `src/types/series.ts` | model | transform | `src/types/designer.ts` | exact |
| `src/components/features/designers/delete-confirmation-dialog.tsx` | component | CRUD | self (extend entityType) | exact |
| `src/components/shell/nav-items.ts` | config | static | self (add item) | exact |

## Pattern Assignments

### `src/app/(dashboard)/series/page.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/designers/page.tsx`

**Full pattern** (lines 1-7):
```typescript
import { getSeriesWithStats } from "@/lib/actions/series-actions";
import { SeriesList } from "@/components/features/series/series-list";

export default async function SeriesPage() {
  const series = await getSeriesWithStats();
  return <SeriesList series={series} />;
}
```

---

### `src/app/(dashboard)/series/[id]/page.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/designers/[id]/page.tsx`

**Full pattern** (lines 1-10):
```typescript
import { notFound } from "next/navigation";
import { getSeriesDetail } from "@/lib/actions/series-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { SeriesDetail } from "@/components/features/series/series-detail";

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesDetail(id);
  if (!series) notFound();
  const designers = await getDesigners();
  return <SeriesDetail series={series} designers={designers} />;
}
```

**Note:** Unlike designer detail, series detail also needs to fetch the designers list for the SearchableSelect dropdown (D-08). This mirrors how chart form pages pass designer options from server to client.

---

### `src/app/(dashboard)/series/loading.tsx` (route, request-response)

**Analog:** `src/app/(dashboard)/designers/loading.tsx`

**Skeleton structure pattern** (lines 1-37):
```typescript
export default function SeriesLoading() {
  return (
    <div className="space-y-6">
      {/* Header: title + button */}
      <div className="flex items-center justify-between">
        <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
      </div>

      {/* Sort bar placeholder */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted animate-skeleton-pulse h-6 w-20 rounded-full" />
        ))}
      </div>

      {/* Card grid - 6 cards matching CP-07 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-5">
            <div className="bg-muted animate-skeleton-pulse h-4 w-32 rounded" />
            <div className="bg-muted animate-skeleton-pulse mt-3 h-2 w-full rounded-full" />
            <div className="bg-muted animate-skeleton-pulse mt-2 h-3 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### `src/components/features/series/series-list.tsx` (component, CRUD)

**Analog:** `src/components/features/designers/designer-list.tsx`

**Imports pattern** (lines 1-23):
```typescript
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  Library,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriesFormModal } from "./series-form-modal";
import { DeleteConfirmationDialog } from "../designers/delete-confirmation-dialog";
import { deleteSeries } from "@/lib/actions/series-actions";
import type { SeriesWithStats } from "@/types/series";
```

**Sort state pattern** (designer-list.tsx lines 28-29, 100-104):
```typescript
type SortKey = "name" | "completion" | "charts";
type SortDir = "asc" | "desc";

const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });

function handleSort(key: SortKey) {
  setSort((prev) =>
    prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
  );
}
```

**Sort pills pattern** (designer-detail.tsx lines 199-226):
```typescript
<div className="flex items-center gap-1">
  {(
    [
      { key: "name" as SortKey, label: "Name" },
      { key: "completion" as SortKey, label: "Completion" },
      { key: "charts" as SortKey, label: "Charts" },
    ] as const
  ).map((opt) => (
    <button
      key={opt.key}
      type="button"
      onClick={() => handleSort(opt.key)}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        sort.key === opt.key
          ? "bg-success-muted text-success-muted-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {opt.label}
      {sort.key === opt.key &&
        (sort.dir === "asc" ? (
          <ChevronUp className="ml-0.5 inline h-3 w-3" />
        ) : (
          <ChevronDown className="ml-0.5 inline h-3 w-3" />
        ))}
    </button>
  ))}
</div>
```

**Delete handler pattern** (designer-list.tsx lines 85-98):
```typescript
async function handleDelete() {
  if (!deletingSeries) return;
  try {
    const result = await deleteSeries(deletingSeries.id);
    if (result.success) {
      toast.success("Series deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Something went wrong. Please try again.");
    }
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
}
```

**Empty state pattern** (designer-list.tsx lines 136-161):
```typescript
if (series.length === 0) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Series</h1>
      </div>
      <EmptyState
        icon={Library}
        title="No series added yet"
        description="Add your first series to start tracking collections."
        heading
      >
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Add Series
        </Button>
      </EmptyState>
      <SeriesFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
```

**Card grid layout** (from UI-SPEC CP-01):
```typescript
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {sortedSeries.map((s) => (
    <SeriesCard key={s.id} series={s} onDelete={() => setDeletingSeries(s)} />
  ))}
</div>
```

---

### `src/components/features/series/series-detail.tsx` (component, CRUD)

**Analog:** `src/components/features/designers/designer-detail.tsx`

**Imports pattern** (lines 1-25):
```typescript
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Pencil,
  Trash2,
  FileText,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { SearchableSelect } from "@/components/features/charts/form-primitives/searchable-select";
import { DeleteConfirmationDialog } from "../designers/delete-confirmation-dialog";
import { updateSeries, deleteSeries } from "@/lib/actions/series-actions";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import { getObjectPositionStyle } from "@/lib/utils/focal-point";
import type { SeriesDetail as SeriesDetailType, SeriesChart } from "@/types/series";
```

**Back link + header pattern** (designer-detail.tsx lines 117-173):
```typescript
<Link
  href="/series"
  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
>
  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
  Back to Series
</Link>

<div className="flex items-start justify-between">
  <div className="min-w-0 flex-1">
    <h1 className="font-heading text-2xl font-semibold">{series.name}</h1>
  </div>
  <div className="ml-4 flex shrink-0 items-center gap-1">
    <button type="button" onClick={() => setEditModalOpen(true)}
      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
      aria-label="Edit series name">
      <Pencil className="h-4 w-4" />
    </button>
    <button type="button" onClick={() => setDeleteDialogOpen(true)}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
      aria-label="Delete series">
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
</div>
```

**Chart row pattern** (designer-detail.tsx lines 283-354):
```typescript
function ChartRow({ chart }: { chart: SeriesChart }) {
  const { count: effectiveCount } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const progressPercent =
    chart.status === "IN_PROGRESS" && effectiveCount > 0
      ? Math.round((chart.stitchesCompleted / effectiveCount) * 100)
      : null;

  const thumbnailSrc = chart.coverThumbnailUrl ?? chart.coverImageUrl;

  return (
    <Link
      href={`/charts/${chart.id}`}
      className="border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      {thumbnailSrc ? (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          <img
            src={thumbnailSrc}
            alt={chart.name}
            className="h-full w-full object-cover"
            style={getObjectPositionStyle(chart.focalPointX, chart.focalPointY)}
          />
        </div>
      ) : (
        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ImageIcon className="text-muted-foreground/40 h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold">{chart.name}</p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{formatNumber(effectiveCount)} stitches</span>
          {effectiveCount > 0 && (
            <SizeBadge stitchCount={chart.stitchCount} stitchesWide={chart.stitchesWide} stitchesHigh={chart.stitchesHigh} />
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        {chart.status ? <StatusBadge status={chart.status} /> : <span className="text-muted-foreground text-xs">Not started</span>}
        {progressPercent !== null && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-muted-foreground text-xs">{progressPercent}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}
```

**Chart sort with status ordering** (designer-detail.tsx lines 32-99):
```typescript
const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0, KITTING: 1, KITTED: 2, UNSTARTED: 3, ON_HOLD: 4, FINISHED: 5, FFO: 6,
};

type ChartSortKey = "name" | "stitchCount" | "status";

const sortedCharts = useMemo(() => {
  const result = [...series.charts];
  result.sort((a, b) => {
    const dir = chartSort.dir === "asc" ? 1 : -1;
    switch (chartSort.key) {
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "stitchCount": {
        const aCount = getEffectiveStitchCount(a.stitchCount, a.stitchesWide, a.stitchesHigh).count;
        const bCount = getEffectiveStitchCount(b.stitchCount, b.stitchesWide, b.stitchesHigh).count;
        return dir * (aCount - bCount);
      }
      case "status": {
        const aOrd = a.status ? (STATUS_ORDER[a.status] ?? 99) : 99;
        const bOrd = b.status ? (STATUS_ORDER[b.status] ?? 99) : 99;
        return dir * (aOrd - bOrd);
      }
      default:
        return 0;
    }
  });
  return result;
}, [series.charts, chartSort]);
```

**Delete with redirect pattern** (designer-detail.tsx lines 101-113):
```typescript
async function handleDelete() {
  try {
    const result = await deleteSeries(series.id);
    if (result.success) {
      toast.success("Series deleted");
      router.push("/series");
    } else {
      toast.error(result.error ?? "Something went wrong. Please try again.");
    }
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
}
```

---

### `src/components/features/series/series-form-modal.tsx` (component, CRUD)

**Analog:** `src/components/features/designers/designer-form-modal.tsx`

**Full pattern** (lines 1-166):
```typescript
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/features/charts/form-primitives/form-field";
import { createSeries, updateSeries } from "@/lib/actions/series-actions";

interface SeriesFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: { id: string; name: string; totalCount: number | null; notes: string | null } | null;
}

export function SeriesFormModal({ open, onOpenChange, series }: SeriesFormModalProps) {
  const router = useRouter();
  const isEditing = !!series;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (series) { setName(series.name); }
      else { setName(""); }
      setNameError(null);
    }
  }, [open, series]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { setNameError("Series name is required"); return; }
    setNameError(null);

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateSeries(series.id, { name: trimmedName, /* ... */ })
          : await createSeries({ name: trimmedName, /* ... */ });
        if (result.success) {
          toast.success(isEditing ? "Series updated" : "Series created");
          router.refresh();
          onOpenChange(false);
        } else {
          if (result.error?.includes("already exists")) {
            setNameError(result.error);
          } else {
            toast.error(result.error ?? "Couldn't create series. Please try again.");
          }
        }
      } catch {
        toast.error("Couldn't create series. Please try again.");
      }
    });
  }
}
```

---

### `src/lib/actions/series-actions.ts` (service, CRUD) - ADD `getSeriesDetail`

**Analog:** `src/lib/actions/designer-actions.ts` (getDesigner function, lines 93-175)

**Query pattern** (designer-actions.ts lines 93-175):
```typescript
export async function getSeriesDetail(id: string): Promise<SeriesDetail | null> {
  await requireAuth();

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      designer: { select: { id: true, name: true } },
      charts: {
        select: {
          id: true,
          name: true,
          coverThumbnailUrl: true,
          coverImageUrl: true,
          focalPointX: true,
          focalPointY: true,
          stitchCount: true,
          stitchesWide: true,
          stitchesHigh: true,
          project: { select: { status: true, stitchesCompleted: true } },
        },
      },
    },
  });

  if (!series) return null;

  const charts: SeriesChart[] = series.charts.map((c) => ({
    id: c.id,
    name: c.name,
    coverThumbnailUrl: c.coverThumbnailUrl,
    coverImageUrl: c.coverImageUrl,
    focalPointX: c.focalPointX,
    focalPointY: c.focalPointY,
    stitchCount: c.stitchCount,
    stitchesWide: c.stitchesWide,
    stitchesHigh: c.stitchesHigh,
    status: c.project?.status ?? null,
    stitchesCompleted: c.project?.stitchesCompleted ?? 0,
  }));

  return {
    id: series.id,
    name: series.name,
    totalCount: series.totalCount,
    designerId: series.designerId,
    designerName: series.designer?.name ?? null,
    notes: series.notes,
    progress: computeSeriesProgress(series.charts, series.totalCount),
    charts,
  };
}
```

---

### `src/types/series.ts` (model, transform) - EXPAND `SeriesChart`

**Analog:** `src/types/designer.ts` (DesignerChart type, lines 7-20)

**Current SeriesChart** (needs expansion):
```typescript
export type SeriesChart = {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  status: ProjectStatus | null;
  stitchesCompleted: number;
  stitchCount: number;
};
```

**Target pattern** (from designer.ts DesignerChart, excluding genres):
```typescript
import type { OptionalFocalPoint } from "@/types/focal-point";

export type SeriesChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
};
```

---

### `src/components/features/designers/delete-confirmation-dialog.tsx` (component, CRUD) - EXTEND

**Self-modification:** Add `"series"` to entityType union and description case

**Current entityType** (line 20):
```typescript
entityType: "designer" | "genre" | "brand" | "supply";
```

**New entityType:**
```typescript
entityType: "designer" | "genre" | "brand" | "supply" | "series";
```

**New case in getDescription** (add after supply case):
```typescript
case "series":
  return `This will remove "${entityName}" from your collection. ${chartCount} chart(s) will be unassigned from this series. Charts will NOT be deleted.`;
```

---

### `src/components/shell/nav-items.ts` (config, static) - ADD Series

**Self-modification:** Add Series item to Projects section

**Import addition** (add `Library` to line 1 imports):
```typescript
import { Library } from "lucide-react";
```

**Item addition** (after Shopping in Projects section, line 34):
```typescript
{ label: "Series", href: "/series", icon: Library },
```

---

## Shared Patterns

### Authentication
**Source:** `src/lib/auth-guard.ts` (used by `series-actions.ts`)
**Apply to:** `getSeriesDetail` action (already established in Phase 31 actions)
```typescript
await requireAuth();
```

### Error Handling (Server Actions)
**Source:** `src/lib/actions/series-actions.ts` lines 14-33
**Apply to:** `getSeriesDetail` action
```typescript
try {
  // query logic
} catch (error) {
  // For query actions: return null (not found) or rethrow
  // For mutations: return { success: false, error: "message" }
  console.error("actionName error:", error instanceof Error ? error.message : String(error));
  return { success: false as const, error: "Failed to..." };
}
```

### Error Handling (Client Components)
**Source:** `src/components/features/designers/designer-list.tsx` lines 85-98
**Apply to:** All series client components that call server actions
```typescript
try {
  const result = await serverAction(args);
  if (result.success) {
    toast.success("Success message");
    router.refresh();
  } else {
    toast.error(result.error ?? "Something went wrong. Please try again.");
  }
} catch {
  toast.error("Something went wrong. Please try again.");
}
```

### Form Modal with useTransition
**Source:** `src/components/features/designers/designer-form-modal.tsx` lines 74-96
**Apply to:** `series-form-modal.tsx`
```typescript
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  try {
    const result = await action(formData);
    if (result.success) {
      toast.success("Success");
      router.refresh();
      onOpenChange(false);
    } else {
      if (result.error?.includes("already exists")) {
        setNameError(result.error);
      } else {
        toast.error(result.error ?? "Couldn't create series. Please try again.");
      }
    }
  } catch {
    toast.error("Couldn't create series. Please try again.");
  }
});
```

### Delete Confirmation Pattern
**Source:** `src/components/features/designers/delete-confirmation-dialog.tsx`
**Apply to:** Both series-list.tsx and series-detail.tsx
```typescript
<DeleteConfirmationDialog
  open={!!deletingSeries}
  onOpenChange={(open) => { if (!open) setDeletingSeries(null); }}
  title="Delete Series?"
  entityName={deletingSeries?.name ?? ""}
  chartCount={deletingSeries?.progress.ownedCount ?? 0}
  entityType="series"
  onConfirm={handleDelete}
/>
```

### Test Structure
**Source:** `src/components/features/designers/designer-list.test.tsx` lines 1-48
**Apply to:** All series component test files
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SeriesList } from "./series-list";

const mockDeleteSeries = vi.fn();
vi.mock("@/lib/actions/series-actions", () => ({
  deleteSeries: (...args: unknown[]) => mockDeleteSeries(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

### Mock Factory Pattern
**Source:** `src/__tests__/mocks/factories.ts` lines 57-68
**Apply to:** New `createMockSeriesWithStats` and `createMockSeriesChart` factories
```typescript
export function createMockSeriesWithStats(
  overrides?: Partial<SeriesWithStats>,
): SeriesWithStats {
  return {
    id: "series-1",
    name: "Test Series",
    totalCount: null,
    designerId: null,
    designerName: null,
    notes: null,
    progress: { ownedCount: 0, finishedCount: 0, totalCount: null },
    ...overrides,
  };
}

export function createMockSeriesChart(overrides?: Partial<SeriesChart>): SeriesChart {
  return {
    id: "chart-1",
    name: "Test Chart",
    coverThumbnailUrl: null,
    coverImageUrl: null,
    focalPointX: null,
    focalPointY: null,
    stitchCount: 5000,
    stitchesWide: 100,
    stitchesHigh: 50,
    status: null,
    stitchesCompleted: 0,
    ...overrides,
  };
}
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| -- | -- | -- | All files have exact analogs in the designer management pages |

---

## Metadata

**Analog search scope:** `src/app/(dashboard)/designers/`, `src/components/features/designers/`, `src/lib/actions/`, `src/types/`, `src/components/shell/`, `src/__tests__/mocks/`
**Files scanned:** 15 analog files read
**Pattern extraction date:** 2026-05-24
