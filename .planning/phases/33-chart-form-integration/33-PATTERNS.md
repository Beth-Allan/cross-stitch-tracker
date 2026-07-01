# Phase 33: Chart Form Integration - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 9 new/modified files
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/charts/inline-series-dialog.tsx` | component | request-response | `src/components/features/charts/inline-name-dialog.tsx` | exact |
| `src/components/features/charts/inline-series-dialog.test.tsx` | test | request-response | `src/components/features/charts/inline-name-dialog.test.tsx` | exact |
| `src/components/features/charts/use-chart-form.ts` | hook | CRUD | self (existing file) | exact |
| `src/components/features/charts/use-chart-form.test.tsx` | test | CRUD | self (existing `handleAddStorageLocation` tests) | exact |
| `src/components/features/charts/chart-merged-form.tsx` | component | request-response | self (designer SearchableSelect block, lines 477-494) | exact |
| `src/lib/validations/chart.ts` | utility | transform | self (existing `designerId` field, line 9) | exact |
| `src/lib/actions/chart-actions.ts` | service | CRUD | self (existing `designerId` in create/update, lines 38, 261) | exact |
| `src/app/(dashboard)/charts/new/page.tsx` | controller | request-response | self (existing `Promise.all` data loading) | exact |
| `src/app/(dashboard)/charts/[id]/edit/page.tsx` | controller | request-response | self (existing `Promise.all` data loading) | exact |

## Pattern Assignments

### `src/components/features/charts/inline-series-dialog.tsx` (component, request-response)

**Analog:** `src/components/features/charts/inline-name-dialog.tsx` (110 lines)

This is the closest structural match -- a single-field controlled dialog with name validation. The series dialog is even simpler than InlineDesignerDialog (no website field), making InlineNameDialog the better template. Key differences: custom title "Add New Series", custom error "Series name is required", custom submit button "Add Series", and `onSubmit` signature passes `(name: string)`.

**Imports pattern** (lines 1-14):
```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-primitives/form-field";
```

**Props pattern** (lines 16-23):
```typescript
interface InlineNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName?: string;
  placeholder?: string;
  onSubmit: (name: string) => Promise<void>;
}
```

**Core dialog pattern** (lines 24-109):
- Controlled `open` prop only (no uncontrolled mode like InlineDesignerDialog -- per CONTEXT D-06, follow simple pattern)
- `prevOpenRef` trick to sync `initialName` on open (lines 37-39)
- `reset()` clears name + error on close (lines 43-46)
- `handleSubmit`: trim, validate non-empty, set pending, call `onSubmit`, reset + close on success, catch error message (lines 48-68)
- `form onSubmit={handleSubmit}` with `e.preventDefault(); e.stopPropagation()` to avoid bubbling to outer form

**Error handling pattern** (lines 63-65):
```typescript
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to create");
}
```

---

### `src/components/features/charts/inline-series-dialog.test.tsx` (test)

**Analog:** `src/components/features/charts/inline-name-dialog.test.tsx` (147 lines)

**Test imports pattern** (line 1):
```typescript
import { render, screen, act } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
```

**Test cases to replicate** (from lines 7-147):
1. Renders with title and empty input when open
2. Pre-fills input with `initialName`
3. Calls `onSubmit` with trimmed name and closes on submit
4. Shows error when submitting with empty name
5. Shows error when submitting with whitespace-only name
6. Shows server error when `onSubmit` throws
7. Closes without submitting when Cancel is clicked

---

### `src/components/features/charts/use-chart-form.ts` (hook, CRUD) -- MODIFY

**Analog:** Self -- `handleAddDesigner` pattern (lines 325-343)

**Add to ChartFormValues interface** (after line 22, mirror `designerId`):
```typescript
seriesId: string | null;
```

**Add series list state** (mirror `designers` state at line 164):
```typescript
const [seriesList, setSeriesList] = useState<SeriesWithStats[]>(initialSeries);
```

**handleAddSeries callback** -- mirror `handleAddDesigner` (lines 325-343):
```typescript
const handleAddDesigner = useCallback(
  async (name: string, website?: string) => {
    suppressUnloadRef.current = true;
    try {
      const result = await createDesigner({
        name,
        website: website ?? null,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      setDesigners((prev) => [...prev, result.designer]);
      setField("designerId", result.designer.id);
    } finally {
      suppressUnloadRef.current = false;
    }
  },
  [setField],
);
```

For series, the handler additionally passes `designerId` from current form values (D-04):
- `createSeries({ name, designerId: values.designerId })` -- auto-populate from chart's current designer
- On success: `setSeriesList((prev) => [...prev, newSeriesWithStats])` and `setField("seriesId", result.series.id)`

**buildInitialValues** -- add `seriesId` (mirror `designerId` at line 117):
```typescript
seriesId: data.seriesId,  // Chart model already has seriesId from Prisma
```

**submitForm formData** -- add `seriesId` to chart object (mirror `designerId` at line 209):
```typescript
chart: {
  name: values.name,
  designerId: values.designerId,
  seriesId: values.seriesId,   // ADD THIS
  ...
}
```

**Return object** -- expose `seriesList`, `handleAddSeries` (mirror `designers`/`handleAddDesigner`):
```typescript
return {
  ...existing,
  seriesList,
  handleAddSeries,
};
```

---

### `src/components/features/charts/use-chart-form.test.tsx` (test) -- MODIFY

**Analog:** Self -- `handleAddStorageLocation` tests (lines 39-79)

**Mock pattern** (add to existing mocks at top of file):
```typescript
vi.mock("@/lib/actions/series-actions", () => ({
  createSeries: vi.fn(),
}));
```

**Test pattern for handleAddSeries** (mirror handleAddStorageLocation at lines 39-79):
```typescript
describe("handleAddStorageLocation", () => {
  it("creates storage location and selects it when name is provided", async () => {
    (createStorageLocation as Mock).mockResolvedValue({
      success: true,
      location: { id: "sl-new", name: "Bin A", description: null },
    });

    const { result } = renderHook(() => useChartForm(defaultProps));

    await act(async () => {
      await result.current.handleAddStorageLocation("Bin A");
    });

    expect(createStorageLocation).toHaveBeenCalledWith({ name: "Bin A" });
    expect(result.current.values.storageLocationId).toBe("sl-new");
    expect(result.current.storageLocationsList).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "sl-new", name: "Bin A" })]),
    );
  });
```

Key differences for series: `createSeries` receives `{ name, designerId }` (D-04), and the test must verify `designerId` passthrough from current form values.

---

### `src/components/features/charts/chart-merged-form.tsx` (component) -- MODIFY

**Analog:** Self -- designer SearchableSelect + InlineDesignerDialog block (lines 477-494)

**Props addition** -- add `series` prop (mirror `designers` at line 126):
```typescript
interface ChartMergedFormProps {
  designers: Designer[];
  series: SeriesWithStats[];  // ADD THIS
  genres: Genre[];
  ...
}
```

**Dialog state** -- add series dialog state (mirror designer state at lines 173-175):
```typescript
const [designerDialogOpen, setDesignerDialogOpen] = useState(false);
const [designerDialogName, setDesignerDialogName] = useState("");
// ADD:
const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
const [seriesDialogName, setSeriesDialogName] = useState("");
```

**Options** -- add series options (mirror designer options at lines 406-409):
```typescript
const designerOptions = form.designers.map((d) => ({
  value: d.id,
  label: d.name,
}));
// ADD:
const seriesOptions = form.seriesList.map((s) => ({
  value: s.id,
  label: s.name,
}));
```

**JSX placement** -- between Cover Image (line 496-505) and Genres (line 507-519):
```tsx
<FormField label="Designer" htmlFor="designer">
  <SearchableSelect
    options={designerOptions}
    value={form.values.designerId}
    onChange={(v) => form.setField("designerId", v)}
    onAddNew={(searchTerm) => {
      setDesignerDialogName(searchTerm);
      setDesignerDialogOpen(true);
    }}
    placeholder="Select designer..."
  />
  <InlineDesignerDialog
    open={designerDialogOpen}
    onOpenChange={setDesignerDialogOpen}
    initialName={designerDialogName}
    onSubmit={form.handleAddDesigner}
  />
</FormField>
```

Series field mirrors this exact pattern with:
- `label="Series"`, `placeholder="Select series..."`
- `InlineSeriesDialog` instead of `InlineDesignerDialog`

---

### `src/lib/validations/chart.ts` (utility) -- MODIFY

**Analog:** Self -- `designerId` field (line 9)

**Pattern to copy:**
```typescript
designerId: z.string().nullable().default(null),
// ADD:
seriesId: z.string().nullable().default(null),
```

---

### `src/lib/actions/chart-actions.ts` (service, CRUD) -- MODIFY

**Analog:** Self -- `designerId` in `createChartAndProject` (line 38) and `updateChart` (line 261)

**Create pattern** (line 38):
```typescript
const result = await tx.chart.create({
  data: {
    name: chart.name,
    designerId: chart.designerId,
    // ADD: seriesId: chart.seriesId,
```

**Update pattern** (line 261):
```typescript
await tx.chart.update({
  where: { id: chartId },
  data: {
    name: chart.name,
    designerId: chart.designerId,
    // ADD: seriesId: chart.seriesId,
```

---

### `src/app/(dashboard)/charts/new/page.tsx` (controller) -- MODIFY

**Analog:** Self -- existing `Promise.all` data loading (lines 9-17)

**Pattern to copy:**
```typescript
import { getDesigners } from "@/lib/actions/designer-actions";
// ADD: import { getSeriesWithStats } from "@/lib/actions/series-actions";

const [designers, genres, storageLocations, stitchingApps, unassignedFabrics] = await Promise.all([
  getDesigners(),
  getGenres(),
  getStorageLocationsWithStats(),
  getStitchingAppsWithStats(),
  getUnassignedFabrics(),
]);
// Destructure becomes:
const [designers, genres, storageLocations, stitchingApps, unassignedFabrics, series] = await Promise.all([
  ...existing,
  getSeriesWithStats(),  // ADD
]);

// Pass to form:
<ChartMergedForm
  designers={designers}
  series={series}   // ADD
  ...
/>
```

---

### `src/app/(dashboard)/charts/[id]/edit/page.tsx` (controller) -- MODIFY

**Analog:** Self -- same `Promise.all` pattern (lines 18-26)

Same addition as new page: add `getSeriesWithStats()` to `Promise.all`, pass `series` through `EditChartPageClient` to `ChartMergedForm`.

Also must update `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` props interface to accept and pass `series`.

---

## Shared Patterns

### Inline Entity Creation (SearchableSelect + Dialog + Hook)
**Source:** Designer flow across 3 files
**Apply to:** Series field (exact mirror)

The established 3-layer pattern:
1. **Form component** (`chart-merged-form.tsx`): dialog open state + name state, `SearchableSelect` with `onAddNew` callback, `InlineDialog` with `onSubmit={form.handleAddEntity}`
2. **Hook** (`use-chart-form.ts`): `handleAddEntity` calls server action, appends to local entity list, selects new ID via `setField`
3. **Dialog** (`inline-*-dialog.tsx`): controlled open, name input, validation, calls `onSubmit` prop

### Authentication
**Source:** `src/lib/auth-guard.ts` via `requireAuth()`
**Apply to:** No new server actions needed -- `createSeries` already calls `requireAuth()`. The form calls `createSeries` from the hook, which is already protected.

### Error Handling in Inline Creation
**Source:** `use-chart-form.ts` lines 325-343
**Apply to:** `handleAddSeries`
```typescript
try {
  const result = await createSeries({ name, designerId: values.designerId });
  if (!result.success) {
    throw new Error(result.error);
  }
  // update state
} finally {
  suppressUnloadRef.current = false;
}
```
The `throw` propagates to the dialog's catch handler, which displays the error message inline.

### Zod Validation at Boundary
**Source:** `src/lib/validations/chart.ts` line 9
**Apply to:** Add `seriesId: z.string().nullable().default(null)` to `chartFormSchema.chart`

## No Analog Found

No files in this phase lack a close match. Every file either exists already (modification) or has an exact structural template in the codebase.

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/lib/actions/`, `src/lib/validations/`, `src/app/(dashboard)/charts/`, `src/types/`
**Files scanned:** 18
**Pattern extraction date:** 2026-05-25
