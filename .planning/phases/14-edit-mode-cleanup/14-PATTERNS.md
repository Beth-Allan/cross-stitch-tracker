# Phase 14: Edit Mode & Cleanup - Pattern Map

**Mapped:** 2026-05-16
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/charts/chart-merged-form.tsx` | component | request-response | Self (creation mode) | exact |
| `src/components/features/charts/form-primitives/sticky-save-bar.tsx` | component | request-response | Self (creation mode) | exact |
| `src/components/features/charts/manage-supplies-link.tsx` | component | request-response | N/A (trivial presentational) | N/A |
| `src/components/features/charts/list-row-kebab-menu.tsx` | component | request-response | `hero-kebab-menu.tsx` | exact |
| `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` | component | request-response | Self (current modal wrapper) | exact |
| `src/components/features/charts/chart-list.tsx` | component | request-response | Self (current inline buttons) | exact |
| `src/components/features/charts/list-row-kebab-menu.test.tsx` | test | N/A | `hero-kebab-menu.test.tsx` | exact |
| `src/components/features/charts/chart-merged-form.test.tsx` | test | N/A | Self (existing creation tests) | exact |

## Pattern Assignments

### `src/components/features/charts/list-row-kebab-menu.tsx` (NEW - component, request-response)

**Analog:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx`

**Imports pattern** (lines 1-22):
```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteChart } from "@/lib/actions/chart-actions";
```

**Props pattern** (lines 24-27):
```typescript
interface HeroKebabMenuProps {
  chartId: string;
  chartName: string;
}
```

**Core kebab + dialog pattern** (lines 34-96):
```typescript
export function HeroKebabMenu({ chartId, chartName }: HeroKebabMenuProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteChart(chartId);
        if (result.success) {
          toast.success("Project deleted");
          setDialogOpen(false);
          router.push("/charts");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("HeroKebabMenu delete failed:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Project actions"
          className="hover:bg-accent focus-visible:ring-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <MoreHorizontal className="text-muted-foreground size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem variant="destructive" onClick={() => setDialogOpen(true)}>
            <Trash2 className="size-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {chartName}?</DialogTitle>
            <DialogDescription>
              This will permanently delete this project and all its supplies. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Key differences for ListRowKebabMenu:**
- Add `Pencil` icon import and an "Edit Project" `DropdownMenuItem` with `onClick={() => router.push(\`/charts/${chartId}/edit\`)}`
- Delete handler should call `router.refresh()` instead of `router.push("/charts")` (user stays on list page)
- Trigger styling should be smaller (table row context, not hero) -- adapt from current inline button sizing in `chart-list.tsx` lines 307-325

---

### `src/components/features/charts/list-row-kebab-menu.test.tsx` (NEW - test)

**Analog:** `src/components/features/charts/project-detail/hero-kebab-menu.test.tsx`

**Test structure pattern** (lines 1-38):
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { HeroKebabMenu } from "./hero-kebab-menu";

vi.mock("@/lib/actions/chart-actions", () => ({
  deleteChart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("HeroKebabMenu", () => {
  it("renders trigger button with MoreHorizontal icon", () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger).toBeInTheDocument();
  });

  it('trigger has aria-label "Project actions"', () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    expect(screen.getByLabelText("Project actions")).toBeInTheDocument();
  });

  it("trigger has min-h-11 min-w-11 for 44px touch target", () => {
    render(<HeroKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });
});
```

**Key additions for ListRowKebabMenu tests:**
- Test "Edit Project" menu item presence and navigation call
- Test "Delete Project" menu item presence and dialog opening
- Test confirmation dialog content and button labels

---

### `src/components/features/charts/chart-merged-form.tsx` (MODIFY - component, request-response)

**Analog:** Self (current creation-only implementation)

**Props interface to extend** (lines 120-126):
```typescript
interface ChartMergedFormProps {
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
}
```
Add `mode?: "create" | "edit"` and `initialData?: ChartWithProject`.

**onSuccess callback pattern** (lines 203-209):
```typescript
const onSuccess = useCallback(
  (_chartId: string) => {
    submittedRef.current = true;
    clearDraft();
    router.push("/charts");
  },
  [router],
);
```
Edit mode variant: `router.push(\`/charts/${initialData!.id}\`)` + `toast.success("Changes saved")`, no `clearDraft()`.

**useChartForm invocation** (lines 212-221):
```typescript
const form = useChartForm({
  mode: "create",
  designers,
  genres,
  storageLocations,
  stitchingApps,
  onSuccess,
  getSupplyRows: () => adapterRef.current?.getRows() ?? [],
  onValidationError: () => setMode("form"),
});
```
Edit mode: `mode: "edit"`, `initialData`, `getSupplyRows: undefined`, `onValidationError: undefined`.

**Draft auto-save on unmount** (lines 233-239):
```typescript
useEffect(() => {
  return () => {
    if (!submittedRef.current && formValuesRef.current.name) {
      saveDraftV2(formValuesRef.current, supplyRowsRef.current, calcParamsRef.current);
    }
  };
}, []);
```
Must gate on `formMode === "create"` -- skip entirely in edit mode.

**Heading pattern** (lines 397-403):
```typescript
<h1 className="font-heading text-foreground mb-1 text-2xl font-semibold">
  Add New Chart
</h1>
<p className="text-muted-foreground mb-8 text-sm">
  Create a chart and set up your project
</p>
```
Edit mode: "Edit [chart name]" / "Update your chart and project details".

**Activity wrapper** (line 384):
```typescript
<Activity mode={mode === "form" ? "visible" : "hidden"}>
```
Edit mode: no Activity wrapper needed (no supply mode toggle). Render form content directly.

**Milestone marker** (lines 636-651):
```typescript
<div className="bg-primary/5 border-primary/15 flex items-center gap-3 rounded-lg border p-4 px-6">
  <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
    <Check className="size-3.5" />
  </div>
  <p className="flex-1 text-sm font-medium">
    Project details filled in. Ready for supplies?
  </p>
  <button type="button" ...>Add supplies &rarr;</button>
</div>
```
Edit mode: replace entire block with `<ManageSuppliesLink chartId={initialData!.id} />`.

**StickySaveBar invocation** (lines 706-713):
```typescript
<StickySaveBar
  chartName={form.values.name}
  onSaveDraft={handleSaveDraft}
  onSubmit={form.submitForm}
  isSubmitting={form.isPending}
  isSavingDraft={isSavingDraft}
  saveDraftLabel={saveDraftLabel}
/>
```
Edit mode: add `mode="edit"`, omit `onSaveDraft`/`isSavingDraft`/`saveDraftLabel`.

---

### `src/components/features/charts/form-primitives/sticky-save-bar.tsx` (MODIFY - component)

**Analog:** Self (current creation-only implementation)

**Current props interface** (lines 5-12):
```typescript
interface StickySaveBarProps {
  chartName: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  saveDraftLabel: string;
}
```
Add `mode?: "create" | "edit"`, make draft-related props optional.

**Current button labels** (lines 44-50):
```typescript
<Button type="button" variant="ghost" disabled={!canSave || isSavingDraft} onClick={onSaveDraft}>
  {saveDraftLabel}
</Button>
<Button type="button" disabled={!canSave || isSubmitting} onClick={onSubmit}>
  {isSubmitting ? "Creating..." : "Create"}
</Button>
```
Edit mode: hide Save Draft button entirely, change "Create"/"Creating..." to "Save Changes"/"Saving...".

---

### `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` (MODIFY - component)

**Analog:** Self (current ChartEditModal wrapper)

**Current implementation** (lines 1-47):
```typescript
"use client";

import { useRouter } from "next/navigation";
import type { Designer, Fabric, FabricBrand, Genre } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { ChartEditModal } from "@/components/features/charts/chart-edit-modal";

// ... props interface ...

export function EditChartPageClient({
  chart, designers, genres, storageLocations, stitchingApps, unassignedFabrics,
}: EditChartPageClientProps) {
  const router = useRouter();

  return (
    <ChartEditModal
      chart={chart}
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
      open={true}
      onOpenChange={(open) => { if (!open) router.push(`/charts/${chart.id}`); }}
      onSuccess={() => { router.push(`/charts/${chart.id}`); }}
    />
  );
}
```
Replace: swap `ChartEditModal` import for `ChartMergedForm` import, render `<ChartMergedForm mode="edit" initialData={chart} {...referenceData} />`. Remove `useRouter` (navigation handled inside form's onSuccess). Simplify to a thin pass-through wrapper.

---

### `src/components/features/charts/chart-list.tsx` (MODIFY - component)

**Analog:** Self (current inline button pattern)

**Current edit modal import + state** (lines 18, 52):
```typescript
import { ChartEditModal } from "./chart-edit-modal";
// ...
const [editingChart, setEditingChart] = useState<ChartWithProject | null>(null);
```
Remove both. Replace with `import { ListRowKebabMenu } from "./list-row-kebab-menu";`.

**Current inline buttons in ChartRow** (lines 306-326):
```typescript
<td className="px-4 py-3">
  <div className="flex items-center justify-end gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-40 md:group-hover:opacity-100">
    <button type="button" onClick={onEdit}
      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
      aria-label={`Edit ${chart.name}`}>
      <Pencil className="h-3.5 w-3.5" />
    </button>
    <button type="button" onClick={onDelete}
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
      aria-label={`Delete ${chart.name}`}>
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
</td>
```
Replace with: `<ListRowKebabMenu chartId={chart.id} chartName={chart.name} />`. Remove `onEdit`/`onDelete` props from `ChartRow`.

**Current ChartEditModal render block** (lines 202-222):
```typescript
{editingChart && (
  <ChartEditModal
    chart={editingChart}
    designers={designers}
    // ... more props ...
  />
)}
```
Remove entirely. The edit flow navigates to `/charts/[id]/edit` now.

**Delete confirmation dialog** (lines 224-248): Keep as-is in `ChartList` for the list-level delete dialog (used by `ChartCard` mobile), or move into `ListRowKebabMenu`. The delete dialog in `ChartList` is used by both desktop and mobile rows. After Phase 14, the `ListRowKebabMenu` handles its own dialog (like `HeroKebabMenu`), so this block can also be removed from `ChartList` if mobile cards also switch to kebab menus.

**Mobile ChartCard inline buttons** (lines 361-376): Same replacement -- use `ListRowKebabMenu` instead of inline pencil/trash buttons.

---

### `src/components/features/charts/manage-supplies-link.tsx` (NEW - presentational component)

**No analog needed** -- trivial presentational component. Follow project conventions:

**Convention pattern** (from project codebase):
```typescript
// Server Component by default (no "use client" needed -- pure presentational)
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ManageSuppliesLinkProps {
  chartId: string;
}

export function ManageSuppliesLink({ chartId }: ManageSuppliesLinkProps) {
  return (
    <div className="border-border rounded-lg border p-4">
      <p className="text-foreground text-sm">
        Supplies are managed on the project page
      </p>
      <Link
        href={`/charts/${chartId}?tab=supplies`}
        className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
      >
        Go to Supplies
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
```

Note: This component occupies the same DOM position as the milestone marker (lines 636-651 in `chart-merged-form.tsx`). Use semantic tokens only.

---

### `src/components/features/charts/chart-merged-form.test.tsx` (MODIFY - test)

**Analog:** Self (existing creation tests)

**Existing test setup pattern** (lines 1-65):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartMergedForm } from "./chart-merged-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";
import { DRAFT_KEY } from "./use-draft-persistence";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateChart = vi.fn();
const mockUpdateChart = vi.fn();
const mockCreateChartWithSupplies = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: (...args: unknown[]) => mockCreateChart(...args),
  updateChart: (...args: unknown[]) => mockUpdateChart(...args),
  createChartWithSupplies: (...args: unknown[]) => mockCreateChartWithSupplies(...args),
}));

// ... additional mocks for supply-actions, designer-actions, etc. ...

const defaultFormProps = {
  designers: mockDesigners,
  genres: mockGenres,
  storageLocations: [],
  stitchingApps: [],
  unassignedFabrics: [],
};
```

**Edit mode test data needed:**
```typescript
import { createMockChartWithRelations } from "@/__tests__/mocks";

const mockChart = createMockChartWithRelations({
  id: "c1",
  name: "Test Chart",
  // ... fields matching ChartWithProject type
});

const editFormProps = {
  ...defaultFormProps,
  mode: "edit" as const,
  initialData: mockChart,
};
```

**Edit mode test cases to add:**
- Renders "Edit [chart name]" heading instead of "Add New Chart"
- Shows "Save Changes" button instead of "Create"
- Hides "Save Draft" button
- Shows ManageSuppliesLink instead of milestone marker
- Does not load/save draft on mount/unmount
- Calls `updateChart` on submit (not `createChart`)

---

## Shared Patterns

### DropdownMenu + Dialog Composition
**Source:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx` (lines 59-94)
**Apply to:** `list-row-kebab-menu.tsx`
```typescript
// Pattern: DropdownMenu and Dialog are siblings (not nested).
// Dialog `open` state is controlled by local useState, set from DropdownMenuItem onClick.
// This avoids focus-management conflicts between the menu and dialog.
return (
  <>
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="..." className="...">
        <MoreHorizontal className="..." />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuItem onClick={() => router.push(...)}>Edit</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => setDialogOpen(true)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* confirmation content */}
    </Dialog>
  </>
);
```

### Delete Confirmation Dialog
**Source:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx` (lines 76-94)
**Apply to:** `list-row-kebab-menu.tsx`
```typescript
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete {chartName}?</DialogTitle>
      <DialogDescription>
        This will permanently delete this project and all its supplies. This cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
        {isPending ? "Deleting..." : "Delete Project"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Server Action Error Handling (delete flow)
**Source:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx` (lines 39-57)
**Apply to:** `list-row-kebab-menu.tsx`
```typescript
function handleDelete() {
  startTransition(async () => {
    try {
      const result = await deleteChart(chartId);
      if (result.success) {
        toast.success("Project deleted");
        setDialogOpen(false);
        router.push("/charts"); // or router.refresh() for list context
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("... delete failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  });
}
```

### Test Mock Setup
**Source:** `src/components/features/charts/chart-list.test.tsx` (lines 1-46) and `hero-kebab-menu.test.tsx` (lines 1-18)
**Apply to:** All new test files
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";

vi.mock("@/lib/actions/chart-actions", () => ({
  deleteChart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
```

### Form Mode Branching
**Source:** `src/components/features/charts/use-chart-form.ts` (lines 48-58)
**Apply to:** `chart-merged-form.tsx`
```typescript
interface UseChartFormOptions {
  mode: "create" | "edit";
  initialData?: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  storageLocations?: StorageLocationWithStats[];
  stitchingApps?: StitchingAppWithStats[];
  onSuccess: (chartId: string) => void;
  getSupplyRows?: () => SupplyRow[];
  onValidationError?: () => void;
}
```
The hook already branches on `mode` for submission (`createChart` vs `updateChart`). The form component needs to branch on mode for: heading text, save bar labels, supply section, draft persistence, and Activity wrapper.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/charts/manage-supplies-link.tsx` | component | presentational | Trivial new component -- no complex analog needed. Pattern from RESEARCH.md code examples is sufficient. |

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/app/(dashboard)/charts/`, `src/components/ui/`
**Files scanned:** 8 analog candidates examined
**Pattern extraction date:** 2026-05-16
