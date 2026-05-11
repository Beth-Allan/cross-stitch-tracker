# Phase 11: Supply Table on Project Detail - Pattern Map

**Mapped:** 2026-05-10
**Files analyzed:** 5 (2 new, 3 modified)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/supply-table/server-action-adapter.ts` | service (adapter) | request-response (CRUD delegation) | `src/components/features/supply-table/local-state-adapter.ts` | exact |
| `src/components/features/supply-table/server-action-adapter.test.ts` | test | unit | `src/components/features/supply-table/local-state-adapter.test.ts` | exact |
| `src/components/features/supply-table/types.ts` | type contract | N/A | self (extend Result type) | exact |
| `src/components/features/charts/project-detail/supplies-tab.tsx` | component (wrapper) | request-response | self (current 457-line version being replaced) | exact |
| `src/components/features/charts/project-detail/supplies-tab.test.tsx` | test | integration | self (rewrite for new component) | exact |

## Pattern Assignments

### `src/components/features/supply-table/server-action-adapter.ts` (adapter, request-response)

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

**Core adapter class pattern** (lines 19-74 -- class structure with interface implementation):
```typescript
export class LocalStateAdapter implements SupplyTableAdapter {
  constructor(
    initialThreads: SupplySearchResult[],
    initialBeads: SupplySearchResult[],
    initialSpecialty: SupplySearchResult[],
  ) {
    // constructor body
  }

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    // ... build row, store it
    return { success: true };
  }

  async addBead(beadId: string, quantity: number, need: number): Promise<Result> {
    // ... build row, store it
    return { success: true };
  }

  async addSpecialty(itemId: string, need: number): Promise<Result> {
    // ... build row, store it
    return { success: true };
  }

  async updateQuantity(type: SupplyType, junctionId: string, field: string, value: number): Promise<Result> {
    // ... find row, update field
    return { success: true };
  }

  async remove(type: SupplyType, junctionId: string): Promise<Result> {
    // ... find and delete
    return { success: true };
  }

  async createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult> {
    // ... create and return result
  }
}
```

**Key difference for ServerActionAdapter:** Constructor takes `projectId: string` and `refreshFn: () => void` instead of search pools. Each method wraps a server action call, maps field names, and calls `refreshFn()` on success.

**Type switch pattern for dispatching to correct supply type** (lines 168-188):
```typescript
private getPool(type: SupplyType): SupplySearchResult[] {
  switch (type) {
    case "THREAD":
      return this.searchPool.threads;
    case "BEAD":
      return this.searchPool.beads;
    case "SPECIALTY":
      return this.searchPool.specialty;
  }
}
```

**Server action signatures the adapter must call** (from `supply-actions.ts`):

Add operations (lines 394-502):
```typescript
// addThreadToProject expects:
addThreadToProject({
  projectId,
  threadId,
  stitchCount,
  quantityRequired,
  quantityAcquired: 0,
})
// returns: { success: true, record: ProjectThread } | { success: false, error: string }

// addBeadToProject expects:
addBeadToProject({
  projectId,
  beadId,
  quantityRequired,
  quantityAcquired: 0,
})
// returns: { success: true, record: ProjectBead } | { success: false, error: string }

// addSpecialtyToProject expects:
addSpecialtyToProject({
  projectId,
  specialtyItemId,
  quantityRequired,
  quantityAcquired: 0,
})
// returns: { success: true, record: ProjectSpecialty } | { success: false, error: string }
```

Update operation (lines 505-567):
```typescript
updateProjectSupplyQuantity(
  id: string,                              // junction ID
  type: "thread" | "bead" | "specialty",   // lowercase!
  formData: unknown,                       // { quantityRequired?, quantityAcquired?, stitchCount?, isNeedOverridden? }
)
// returns: { success: true } | { success: false, error: string }
```

Remove operations (lines 569-642):
```typescript
removeProjectThread(id: string)
removeProjectBead(id: string)
removeProjectSpecialty(id: string)
// all return: { success: true } | { success: false, error: string }
```

Search operations (lines 119-312):
```typescript
getThreads(brandId?: string, colorFamily?: string, search?: string)
// returns: Array<Thread & { brand: SupplyBrand }> -- sorted by colorCode

getBeads(search?: string)
// returns: Array<Bead & { brand: SupplyBrand }> -- ordered by productCode

getSpecialtyItems(search?: string)
// returns: Array<SpecialtyItem & { brand: SupplyBrand }> -- ordered by productCode
```

Create-and-add operations (lines 677-825):
```typescript
createAndAddThread({
  projectId, name, colorCode?, hexColor?, brandId, colorFamily?,
})
// returns: { success: true, record: { thread, link } } | { success: false, error }

createAndAddBead({
  projectId, name, code?, brandId,
})
// returns: { success: true, record: { bead, link } } | { success: false, error }

createAndAddSpecialty({
  projectId, name, code?, brandId,
})
// returns: { success: true, record: { item, link } } | { success: false, error }
```

**Field name mapping (critical -- Pitfall 1 from RESEARCH.md):**
```typescript
// Adapter field names -> Server action field names
// "stitchCount" -> { stitchCount: value }
// "need"        -> { quantityRequired: value, isNeedOverridden: true }  // Pitfall 2!
// "have"        -> { quantityAcquired: value }

// SupplyType case mapping (Pitfall 6):
// "THREAD"    -> "thread"
// "BEAD"      -> "bead"
// "SPECIALTY" -> "specialty"
```

**Search result transformation (Pitfall 3 -- type shapes differ):**
```typescript
// ThreadWithBrand -> SupplySearchResult mapping:
// t.id         -> id
// "THREAD"     -> type
// t.colorCode  -> code
// t.colorName  -> name
// t.brand.name -> brandName
// t.brandId    -> brandId
// t.hexColor   -> hexColor

// BeadWithBrand -> SupplySearchResult mapping:
// b.productCode -> code
// b.colorName   -> name

// SpecialtyItemWithBrand -> SupplySearchResult mapping:
// s.productCode -> code
// s.colorName   -> name
```

---

### `src/components/features/supply-table/server-action-adapter.test.ts` (test, unit)

**Analog:** `src/components/features/supply-table/local-state-adapter.test.ts`

**Test file structure** (lines 1-16 -- imports, factory function):
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

**Test organization pattern** (lines 18-206 -- describe blocks per method):
```typescript
describe("LocalStateAdapter", () => {
  let adapter: LocalStateAdapter;

  beforeEach(() => {
    // setup adapter with test data
  });

  describe("searchSupplies", () => {
    it('returns matching threads for query "310"', async () => { /* ... */ });
    it("returns empty array for no matches", async () => { /* ... */ });
  });

  describe("addThread", () => {
    it("adds thread to internal state and returns success", async () => {
      const result = await adapter.addThread("t1", 500, 2);
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateQuantity", () => {
    it("returns failure for invalid junctionId", async () => {
      const result = await adapter.updateQuantity("THREAD", "nonexistent", "stitchCount", 500);
      expect(result).toEqual({ success: false, error: "Supply not found" });
    });
  });
});
```

**Key difference for ServerActionAdapter tests:** Mock the server actions with `vi.mock("@/lib/actions/supply-actions")` instead of using real data. Verify correct argument shape passed to each action. Test field mapping (`need` -> `quantityRequired` + `isNeedOverridden`).

**Server action mock pattern** (from existing `supplies-tab.test.tsx` lines 13-27):
```typescript
vi.mock("@/lib/actions/supply-actions", () => ({
  addThreadToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-junction-id" } })),
  addBeadToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-junction-id" } })),
  addSpecialtyToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-junction-id" } })),
  updateProjectSupplyQuantity: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectThread: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectBead: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectSpecialty: vi.fn(() => Promise.resolve({ success: true })),
  getThreads: vi.fn(() => Promise.resolve([])),
  getBeads: vi.fn(() => Promise.resolve([])),
  getSpecialtyItems: vi.fn(() => Promise.resolve([])),
  createAndAddThread: vi.fn(() => Promise.resolve({ success: true, record: { thread: {}, link: {} } })),
  createAndAddBead: vi.fn(() => Promise.resolve({ success: true, record: { bead: {}, link: {} } })),
  createAndAddSpecialty: vi.fn(() => Promise.resolve({ success: true, record: { item: {}, link: {} } })),
}));
```

---

### `src/components/features/supply-table/types.ts` (type contract, modification)

**Analog:** self -- extend existing `Result` type

**Current Result type** (line 68):
```typescript
export type Result = { success: true } | { success: false; error: string };
```

**Target change** (add optional `id` for animation wiring -- D-07/D-08):
```typescript
export type Result = { success: true; id?: string } | { success: false; error: string };
```

This is a backward-compatible change -- `id` is optional so `LocalStateAdapter` and `useSupplyTable` continue to work without modification.

---

### `src/components/features/charts/project-detail/supplies-tab.tsx` (component, REPLACED)

**Analog:** self (current 457-line version) + `src/components/features/supply-table/supply-table.tsx` (SupplyTable being mounted)

**Client component directive** (line 1):
```typescript
"use client";
```

**Imports pattern from current file** (lines 1-30):
```typescript
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// ... component imports
import type {
  ProjectDetailProps,
  SupplySortOption,
} from "./types";
```

**New file imports will include:**
```typescript
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SupplyTable } from "@/components/features/supply-table";
import type { SupplyRow, CalcParams } from "@/components/features/supply-table";
import { ServerActionAdapter } from "@/components/features/supply-table/server-action-adapter";
import type { ProjectDetailProps, SupplySortOption } from "./types";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";
```

**Sort toggle UI pattern** (current file lines 353-377 -- carry over to new component per D-04):
```typescript
<div className="flex items-center justify-end gap-1">
  <button
    onClick={() => setSortOption("added")}
    aria-pressed={sortOption === "added"}
    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      sortOption === "added"
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted"
    }`}
  >
    Added
  </button>
  <button
    onClick={() => setSortOption("alpha")}
    aria-pressed={sortOption === "alpha"}
    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      sortOption === "alpha"
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted"
    }`}
  >
    A-Z
  </button>
</div>
```

**Sort logic to extract** (current file lines 108-113):
```typescript
function sortItems(items: SupplyRowData[], sortOption: SupplySortOption): SupplyRowData[] {
  if (sortOption === "alpha") {
    return [...items].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  return items; // "added" = insertion order (already from server)
}
```
Note: The new version will sort `SupplyRow[]` instead of `SupplyRowData[]` but the comparison logic is identical.

**Data transform helpers to reuse** (current file lines 49-106 -- transform Prisma junction types to display rows):
```typescript
// threadToRowData maps: pt.thread.colorCode -> code, pt.thread.colorName -> name, etc.
// beadToRowData maps: pb.bead.productCode -> code, pb.bead.colorName -> name, etc.
// specialtyToRowData maps: ps.specialtyItem.productCode -> code, ps.specialtyItem.colorName -> name, etc.
```
These transform into `SupplyRow` format (from `supply-table/types.ts`) instead of the old `SupplyRowData` format.

**CalcParams derivation** (current file lines 133-138):
```typescript
const [settings] = useState<CalculatorSettings>({
  strandCount: project.strandCount,
  overCount: project.overCount,
  fabricCount: project.fabric?.count ?? 14,
  wastePercent: project.wastePercent,
});
```
New version uses `CalcParams` type from supply-table/types.ts instead of `CalculatorSettings`. Per D-01, derived as read-only (no `setSettings`).

**Parent mounting pattern** (from `project-detail-page.tsx` lines 75-77):
```typescript
<SuppliesTab chartId={chart.id} project={project} supplies={supplies} />
```
Props interface stays the same -- `chartId`, `project`, `supplies`.

---

### `src/components/features/charts/project-detail/supplies-tab.test.tsx` (test, REPLACED)

**Analog:** self (current test file, rewrite for new component)

**Test infrastructure pattern** (lines 1-50):
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SuppliesTab } from "./supplies-tab";
import type { ProjectDetailProps } from "./types";
import type { ProjectThreadWithThread } from "@/types/supply";
import {
  createMockSupplyBrand,
  createMockThread,
  createMockProjectThread,
} from "@/__tests__/mocks/factories";

// Mock server actions
vi.mock("@/lib/actions/supply-actions", () => ({
  // ... all supply actions mocked
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));
```

**Mock data factory pattern** (lines 51-89):
```typescript
const mockBrand = createMockSupplyBrand({ id: "brand-1", name: "DMC" });

function makeThread(overrides?: Partial<ProjectThreadWithThread>): ProjectThreadWithThread {
  return {
    ...createMockProjectThread({
      id: overrides?.id ?? "pt-1",
      stitchCount: overrides?.stitchCount ?? 500,
      quantityRequired: overrides?.quantityRequired ?? 2,
      quantityAcquired: overrides?.quantityAcquired ?? 1,
    }),
    thread: {
      ...createMockThread({
        id: "thread-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
      }),
      brand: mockBrand,
    },
    ...overrides,
  };
}

const defaultProject: NonNullable<ProjectDetailProps["chart"]["project"]> = {
  id: "proj-1",
  userId: "user-1",
  status: "IN_PROGRESS",
  startDate: null,
  finishDate: null,
  ffoDate: null,
  startingStitches: 0,
  stitchesCompleted: 0,
  strandCount: 2,
  overCount: 2,
  wastePercent: 20,
  storageLocation: null,
  stitchingApp: null,
  fabric: null,
};
```

**Test assertion pattern** (lines 91-180):
```typescript
describe("SuppliesTab", () => {
  it("renders empty state message when no supplies", () => {
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads: [], beads: [], specialty: [] }}
      />,
    );
    expect(screen.getByText("No supplies added yet")).toBeInTheDocument();
  });
});
```

---

## Shared Patterns

### Data Revalidation (router.refresh)
**Source:** `src/components/features/charts/project-detail/supplies-tab.tsx` line 280
**Apply to:** ServerActionAdapter (call on success), SuppliesTab (pass router.refresh as refreshFn)
```typescript
const router = useRouter();
// On successful mutation:
router.refresh();
```

### Toast Error Feedback
**Source:** `src/components/features/supply-table/supply-table.tsx` lines 79-84
**Apply to:** ServerActionAdapter (adapter error handling), SupplyTable (already handled)
```typescript
const result = await adapter.updateQuantity(type, junctionId, field, value);
if (!result.success) {
  toast.error(result.error ?? "Couldn't update value. Try again.");
}
```

### Mock Factory Pattern for Supply Tests
**Source:** `src/__tests__/mocks/factories.ts` (lines 183-280)
**Apply to:** Both test files
```typescript
import {
  createMockSupplyBrand,
  createMockThread,
  createMockBead,
  createMockSpecialtyItem,
  createMockProjectThread,
  createMockProjectBead,
  createMockProjectSpecialty,
} from "@/__tests__/mocks/factories";
```

### Animation CSS (slideIn)
**Source:** `src/app/globals.css` lines 281-283
**Apply to:** SupplyTable DataRow via `isNew` prop (already wired)
```css
.animate-slide-in {
  animation: slideIn 0.2s ease;
}
```
The animation chain: adapter returns `{ success: true, id: "..." }` -> SupplyTable adds ID to `newRowIds` Set -> DataRow checks `isNew={newRowIds.has(row.id)}` -> applies `animate-slide-in` class -> clear after 250ms timeout.

### Prisma Junction Types (supply data shapes)
**Source:** `src/types/supply.ts` lines 25-37
**Apply to:** SuppliesTab data transform, ServerActionAdapter search result mapping
```typescript
export type ThreadWithBrand = Thread & { brand: SupplyBrand };
export type BeadWithBrand = Bead & { brand: SupplyBrand };
export type SpecialtyItemWithBrand = SpecialtyItem & { brand: SupplyBrand };

export type ProjectThreadWithThread = ProjectThread & { thread: ThreadWithBrand };
export type ProjectBeadWithBead = ProjectBead & { bead: BeadWithBrand };
export type ProjectSpecialtyWithItem = ProjectSpecialty & { specialtyItem: SpecialtyItemWithBrand };
```

## No Analog Found

No files in this phase lack an analog. All 5 files have exact matches:
- ServerActionAdapter mirrors LocalStateAdapter (same interface, different backend)
- SuppliesTab replaces itself (same props, simpler implementation)
- Tests follow established project patterns

## Metadata

**Analog search scope:** `src/components/features/supply-table/`, `src/components/features/charts/project-detail/`, `src/lib/actions/`, `src/types/`, `src/__tests__/mocks/`
**Files scanned:** 14
**Pattern extraction date:** 2026-05-10
