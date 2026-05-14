# Phase 13: Supply Takeover - Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 8 (new/modified)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/supply-table/creation-flow-adapter.ts` | service | request-response + buffer | `src/components/features/supply-table/local-state-adapter.ts` | exact |
| `src/components/features/charts/form-primitives/summary-bar.tsx` | component | transform (derived display) | `src/components/features/charts/form-primitives/sticky-save-bar.tsx` | role-match |
| `src/components/features/charts/form-primitives/calculator-card.tsx` | component | event-driven (local state) | `src/components/features/charts/project-detail/calculator-settings-bar.tsx` | exact |
| `src/components/features/charts/chart-merged-form.tsx` | component | event-driven | (self - extending existing) | exact |
| `src/components/features/charts/use-chart-form.ts` | hook | request-response | (self - extending existing) | exact |
| `src/components/features/charts/use-draft-persistence.ts` | utility | file-I/O (localStorage) | (self - extending existing) | exact |
| `src/lib/actions/chart-actions.ts` | controller | CRUD + batch | (self - extending existing) | exact |
| `src/lib/validations/chart.ts` | config | transform | `src/lib/validations/supply.ts` | role-match |

## Pattern Assignments

### `src/components/features/supply-table/creation-flow-adapter.ts` (service, buffered adapter)

**Analog:** `src/components/features/supply-table/local-state-adapter.ts`

**Imports pattern** (lines 1-8):
```typescript
import type {
  SupplyTableAdapter,
  SupplyType,
  SupplyRow,
  SupplySearchResult,
  CreateSupplyData,
  Result,
} from "./types";
```

**Class structure pattern** (lines 19-47):
```typescript
export class LocalStateAdapter implements SupplyTableAdapter {
  private searchPool: {
    threads: SupplySearchResult[];
    beads: SupplySearchResult[];
    specialty: SupplySearchResult[];
  };

  private rows: {
    threads: Map<string, SupplyRow>;
    beads: Map<string, SupplyRow>;
    specialty: Map<string, SupplyRow>;
  };

  constructor(
    initialThreads: SupplySearchResult[],
    initialBeads: SupplySearchResult[],
    initialSpecialty: SupplySearchResult[],
  ) {
    this.searchPool = { ... };
    this.rows = { threads: new Map(), beads: new Map(), specialty: new Map() };
  }
```

**addThread pattern** (lines 57-75):
```typescript
async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
  const supply = this.searchPool.threads.find((t) => t.id === threadId);
  const id = crypto.randomUUID();
  const row: SupplyRow = {
    id,
    supplyId: threadId,
    type: "THREAD",
    code: supply?.code ?? "",
    name: supply?.name ?? "",
    brandName: supply?.brandName ?? "",
    hexColor: supply?.hexColor ?? "#000000",
    stitchCount,
    need,
    have: 0,
    isNeedOverridden: false,
  };
  this.rows.threads.set(id, row);
  return { success: true };
}
```

**getRows pattern** (lines 160-166):
```typescript
getRows(): SupplyRow[] {
  return [
    ...Array.from(this.rows.threads.values()),
    ...Array.from(this.rows.beads.values()),
    ...Array.from(this.rows.specialty.values()),
  ];
}
```

**Key differences for CreationFlowAdapter:**
- Constructor takes `onRowsChange: (rows: SupplyRow[]) => void` callback (not initial search pools)
- `searchSupplies` delegates to server actions (`getThreads`/`getBeads`/`getSpecialtyItems`) rather than filtering local pool
- `createSupply` calls catalog-only server actions (`createThread`/`createBead`/`createSpecialtyItem`)
- Adds `loadRows(rows: SupplyRow[])` for draft restore

**Secondary analog for search delegation:** `src/components/features/supply-table/server-action-adapter.ts` (lines 1-24):
```typescript
import {
  addThreadToProject,
  addBeadToProject,
  addSpecialtyToProject,
  updateProjectSupplyQuantity,
  removeProjectThread,
  removeProjectBead,
  removeProjectSpecialty,
  getThreads,
  getBeads,
  getSpecialtyItems,
  createAndAddThread,
  createAndAddBead,
  createAndAddSpecialty,
} from "@/lib/actions/supply-actions";
```

---

### `src/components/features/charts/form-primitives/summary-bar.tsx` (component, derived display)

**Analog:** `src/components/features/charts/form-primitives/sticky-save-bar.tsx`

**Imports and structure pattern** (lines 1-13):
```typescript
"use client";

import { Button } from "@/components/ui/button";

interface StickySaveBarProps {
  chartName: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  saveDraftLabel: string;
}
```

**Sticky positioning + semantic layout** (lines 27-54):
```typescript
return (
  <div
    role="toolbar"
    aria-label="Form actions"
    className="fixed bottom-0 left-0 right-0 z-100 border-t border-border bg-card"
  >
    <div className="max-w-[720px] mx-auto flex items-center py-3 px-4">
      <p className="mr-auto text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-center gap-3">
        ...
      </div>
    </div>
  </div>
);
```

**SummaryBar positioning (from D-17):** `sticky top-[48px] z-[90]` instead of `fixed bottom-0 z-100`.

---

### `src/components/features/charts/form-primitives/calculator-card.tsx` (component, event-driven local state)

**Analog:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx`

**Imports pattern** (lines 1-8):
```typescript
"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { EditableNumber } from "@/components/features/charts/editable-number";
import { updateProjectSettings } from "@/lib/actions/chart-actions";
import type { CalculatorSettings } from "./types";
```

**CalcParams state management** (lines 30-46):
```typescript
const [localSettings, setLocalSettings] = useState(settings);
const currentSettings = isPending ? localSettings : settings;
const settingsRef = useRef(currentSettings);
useEffect(() => {
  settingsRef.current = currentSettings;
}, [currentSettings]);
```

**Over count segmented control** (lines 126-149):
```typescript
<div className="flex items-center gap-2">
  <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
    OVER
  </span>
  <div className="flex gap-1">
    <button
      onClick={() => handleOverChange(1)}
      aria-pressed={currentSettings.overCount === 1}
      aria-label="Stitch over 1 thread"
      className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
        currentSettings.overCount === 1
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:bg-muted"
      }`}
    >
      1
    </button>
    <button
      onClick={() => handleOverChange(2)}
      aria-pressed={currentSettings.overCount === 2}
      aria-label="Stitch over 2 threads"
      className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
        currentSettings.overCount === 2
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:bg-muted"
      }`}
    >
      2
    </button>
  </div>
</div>
```

**Fabric dropdown pattern** from `searchable-select.tsx` (lines 31-121):
```typescript
export function SearchableSelect({
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Select...",
  disabled,
}: SearchableSelectProps) {
  // Full SearchableSelect implementation reused as-is for fabric picker
}
```

**Key differences for CalculatorCard:**
- No server persistence (all state is local via CalcParams prop + onChange callback)
- Styled as card (`rounded-xl border border-border bg-card p-4 shadow-sm` per D-13)
- Fabric dropdown uses `SearchableSelect` with `unassignedFabrics` options
- On fabric selection: auto-populates `fabricCount` from fabric's count property (D-10)

---

### `src/components/features/charts/chart-merged-form.tsx` (component, extending)

**Mode state + Activity toggle** -- new pattern, no direct analog in codebase. Pattern from RESEARCH.md:
```typescript
import { Activity } from "react";

const [mode, setMode] = useState<"form" | "supply">("form");

<Activity mode={mode === "form" ? "visible" : "hidden"}>
  <form ref={formRef} onSubmit={form.handleSubmit} className="space-y-5">
    {/* existing form content */}
  </form>
</Activity>

<Activity mode={mode === "supply" ? "visible" : "hidden"}>
  <SummaryBar ... />
  <CalculatorCard ... />
  <SupplyTable ... />
</Activity>
```

**Milestone marker refactoring** (existing lines 418-433) -- current pattern to modify:
```typescript
<div className="bg-primary/5 border-primary/15 flex items-center gap-3 rounded-lg border p-4 px-6">
  <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
    <Check className="size-3.5" />
  </div>
  <p className="flex-1 text-sm font-medium">
    Project details filled in. Ready for supplies?
  </p>
  <button
    type="button"
    disabled={!form.values.name || form.isPending}
    onClick={handleAddSupplies}
    className="text-primary text-sm font-medium hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-40"
  >
    {form.isPending && redirectToSuppliesRef.current ? "Creating..." : "Add supplies →"}
  </button>
</div>
```
Change: `onClick={handleAddSupplies}` becomes `onClick={() => setMode("supply")}`.

---

### `src/components/features/charts/use-chart-form.ts` (hook, extending)

**handleSubmit extension point** (lines 1-16 for imports, extend with supply payload):
```typescript
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { SizeCategory } from "@/lib/utils/size-category";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import { chartFormSchema } from "@/lib/validations/chart";
import { toast } from "sonner";
import { createChart, updateChart } from "@/lib/actions/chart-actions";
```

**Key changes:**
- Accept optional `getSupplyRows?: () => SupplyRow[]` in `UseChartFormOptions`
- In `handleSubmit`, after validation: `const supplyRows = getSupplyRows?.() ?? []`
- Call `createChartWithSupplies(formData, supplyRows)` instead of `createChart(formData)` when supplies present

---

### `src/components/features/charts/use-draft-persistence.ts` (utility, extending)

**Current structure** (full file, 70 lines):
```typescript
export const DRAFT_KEY = "chart-draft";

export function saveDraft(values: ChartFormValues): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // localStorage may be full or unavailable -- fail silently
  }
}

export function loadDraft(
  defaults: ChartFormValues,
  validDesignerIds: string[],
  validStorageIds: string[],
  validAppIds: string[],
  validFabricIds: string[] = [],
): ChartFormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChartFormValues>;
    const merged: ChartFormValues = { ...defaults, ...parsed };
    // Stale ID detection...
    return merged;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
```

**Extension pattern:**
- New `DraftV2` interface: `{ version: 2, form: ChartFormValues, supplies: SupplyRow[], calcParams: CalcParams }`
- Backward compat: `loadDraft` checks for `version` field; if missing, treat as v1 (form-only)
- New exports: `saveDraftWithSupplies(form, supplies, calcParams)` and `loadDraftV2(...)`

---

### `src/lib/actions/chart-actions.ts` (controller, extending with batch)

**Existing createChart transaction pattern** (lines 12-106):
```typescript
export async function createChart(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = chartFormSchema.parse(formData);
    const { chart, project } = validated;

    const created = await prisma.$transaction(async (tx) => {
      const result = await tx.chart.create({
        data: { ... },
        include: { project: true, designer: true, genres: true },
      });

      // Link fabric
      if (project.fabricId && result.project) {
        const targetFabric = await tx.fabric.findUnique({ ... });
        if (targetFabric?.linkedProject && targetFabric.linkedProject.userId !== user.id) {
          throw new Error("Fabric not found");
        }
        await tx.fabric.update({ ... });
      }

      return result;
    });

    // Thumbnail generation (outside transaction)
    revalidatePath("/charts");
    return { success: true as const, chartId: created.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createChart error:", error);
    return { success: false as const, error: "Failed to create chart" };
  }
}
```

**Extension:** New `createChartWithSupplies(formData, supplyPayload)` that adds `createMany` calls inside the transaction after chart+fabric creation.

---

### `src/lib/validations/chart.ts` (config, extending with batch supply schema)

**Analog:** `src/lib/validations/supply.ts` (lines 56-82):
```typescript
export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: z.number().int().min(0).default(0),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export const projectBeadSchema = z.object({
  projectId: z.string().min(1),
  beadId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});

export const projectSpecialtySchema = z.object({
  projectId: z.string().min(1),
  specialtyItemId: z.string().min(1),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});
```

**New batch schema pattern (no projectId -- injected server-side):**
```typescript
export const batchSupplySchema = z.object({
  threads: z.array(z.object({
    supplyId: z.string().min(1),
    stitchCount: z.number().int().min(0),
    need: z.number().int().min(1),
    isNeedOverridden: z.boolean(),
  })).max(500),
  beads: z.array(z.object({
    supplyId: z.string().min(1),
    need: z.number().int().min(1),
  })).max(500),
  specialty: z.array(z.object({
    supplyId: z.string().min(1),
    need: z.number().int().min(1),
  })).max(500),
});
```

---

## Shared Patterns

### Authentication
**Source:** `src/lib/auth-guard.ts` (via `src/lib/actions/chart-actions.ts` line 5)
**Apply to:** `createChartWithSupplies` server action (or extended `createChart`)
```typescript
import { requireAuth } from "@/lib/auth-guard";

export async function createChartWithSupplies(formData: unknown, supplyPayload: unknown) {
  const user = await requireAuth();
  // ...
}
```

### Error Handling (server actions)
**Source:** `src/lib/actions/chart-actions.ts` (lines 100-105)
**Apply to:** `createChartWithSupplies` server action
```typescript
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false as const, error: error.errors[0].message };
  }
  console.error("createChart error:", error);
  return { success: false as const, error: "Failed to create chart" };
}
```

### Zod Validation at Boundaries
**Source:** `src/lib/validations/chart.ts` + `src/lib/validations/supply.ts`
**Apply to:** New batch supply schema in `chart.ts`, validated in `createChartWithSupplies`
```typescript
const validated = chartFormSchema.parse(formData);
const supplies = batchSupplySchema.parse(supplyPayload);
```

### Component Test Structure
**Source:** `src/components/features/supply-table/local-state-adapter.test.ts` (lines 1-59)
**Apply to:** `creation-flow-adapter.test.ts`
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { LocalStateAdapter } from "./local-state-adapter";
import type { SupplySearchResult } from "./types";

function makeSearchResult(overrides: Partial<SupplySearchResult>): SupplySearchResult {
  return {
    id: "sr-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    brandId: "brand-1",
    hexColor: "#000000",
    ...overrides,
  };
}
```

### Server Action Test Structure
**Source:** `src/lib/actions/chart-actions.test.ts` (lines 1-45)
**Apply to:** Extended chart-actions tests for batch supply creation
```typescript
import { describe, expect, it, vi } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
```

### Component UI Test Structure
**Source:** `src/components/features/charts/chart-merged-form.test.tsx` (lines 1-60)
**Apply to:** `summary-bar.test.tsx`, `calculator-card.test.tsx`
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartMergedForm } from "./chart-merged-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";
```

### Segmented Control Pattern
**Source:** `src/components/features/supply-table/segmented-type-toggle.tsx` (lines 17-50)
**Apply to:** Calculator card's Over count control (and potentially Strands control)
```typescript
<div
  role="radiogroup"
  aria-label="Supply type"
  className="inline-flex rounded-md border border-border overflow-hidden"
>
  {SEGMENTS.map(({ type, label, icon: Icon }, index) => {
    const isActive = value === type;
    const isLast = index === SEGMENTS.length - 1;
    return (
      <button
        key={type}
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={() => onChange(type)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          !isLast ? "border-r border-border" : ""
        } ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  })}
</div>
```

### SearchableSelect Reuse
**Source:** `src/components/features/charts/form-primitives/searchable-select.tsx`
**Apply to:** Fabric dropdown in CalculatorCard (use as-is, no modification needed)
```typescript
<SearchableSelect
  options={fabricOptions}
  value={fabricId}
  onChange={handleFabricChange}
  placeholder="Select fabric..."
/>
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have strong analogs in the existing codebase |

**Note:** React `<Activity>` usage is new to this codebase (no existing analog), but the API is simple (`mode="visible"|"hidden"`) and well-documented in RESEARCH.md. The planner should reference RESEARCH.md Pattern 2 for Activity usage.

---

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/components/features/supply-table/`, `src/lib/actions/`, `src/lib/validations/`
**Files scanned:** 22 (direct reads)
**Pattern extraction date:** 2026-05-13
