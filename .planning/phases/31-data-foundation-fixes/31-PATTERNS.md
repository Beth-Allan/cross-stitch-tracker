# Phase 31: Data Foundation & Fixes - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 8 (6 create, 2 modify)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` (modify) | model | CRUD | `prisma/schema.prisma` Designer model (lines 23-31) | exact |
| `src/lib/validations/series.ts` (create) | config | request-response | `src/lib/validations/chart.ts` designerSchema (lines 107-113) | exact |
| `src/lib/actions/series-actions.ts` (create) | service | CRUD | `src/lib/actions/designer-actions.ts` (full file) | exact |
| `src/lib/actions/series-actions.test.ts` (create) | test | CRUD | `src/lib/actions/designer-actions.test.ts` (full file) | exact |
| `src/lib/utils/series-progress.ts` (create) | utility | transform | `src/lib/utils/status-groups.ts` (pure function + status sets) | role-match |
| `src/lib/utils/series-progress.test.ts` (create) | test | transform | `src/lib/utils/status-groups.test.ts` (full file) | role-match |
| `src/types/series.ts` (create) | model | -- | `src/types/designer.ts` (full file) | exact |
| `src/__tests__/mocks/factories.ts` (modify) | test | -- | `src/__tests__/mocks/factories.ts` createMockDesigner (lines 31-41) | exact |

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD) - MODIFY

**Analog:** Same file, Designer model (lines 23-31)

**Schema pattern** (lines 23-31):
```prisma
model Designer {
  id        String   @id @default(cuid())
  name      String   @unique
  website   String?
  notes     String?
  charts    Chart[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Relation pattern** (Chart model, lines 44-45):
```prisma
  designer               Designer? @relation(fields: [designerId], references: [id])
  designerId             String?
```

**Apply:** Add Series model after Designer (same structure with `totalCount Int?`, `designerId String?`). Add `series Series? @relation(...)` + `seriesId String?` on Chart. Add `series Series[]` on Designer.

---

### `src/lib/validations/series.ts` (config, request-response)

**Analog:** `src/lib/validations/chart.ts` lines 107-113

**Imports pattern** (line 1):
```typescript
import { z } from "zod";
```

**Schema pattern** (lines 107-113):
```typescript
export const designerSchema = z.object({
  name: z.string().trim().min(1, "Designer name is required").max(200, "Designer name too long"),
  website: z.string().url("Must be a valid URL").nullable().default(null),
  notes: z.string().max(5000, "Notes too long").nullable().default(null),
});

export type DesignerInput = z.infer<typeof designerSchema>;
```

**Apply:** Replace `website` with `totalCount: z.number().int().min(1).nullable().default(null)` and add `designerId: z.string().nullable().default(null)`. Keep name + notes fields. Export `SeriesInput` type.

---

### `src/lib/actions/series-actions.ts` (service, CRUD)

**Analog:** `src/lib/actions/designer-actions.ts` (full file, 198 lines)

**Imports pattern** (lines 1-8):
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { designerSchema } from "@/lib/validations/chart";
import type { DesignerWithStats, DesignerDetail } from "@/types/designer";
```

**Create pattern** (lines 10-33):
```typescript
export async function createDesigner(formData: unknown) {
  await requireAuth();

  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.create({ data: validated });
    revalidatePath("/designers");
    return { success: true as const, designer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A designer with that name already exists" };
    }
    console.error("createDesigner error:", error);
    return { success: false as const, error: "Failed to create designer" };
  }
}
```

**Update pattern** (lines 35-62):
```typescript
export async function updateDesigner(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/designers");
    revalidatePath(`/designers/${id}`);
    return { success: true as const, designer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A designer with that name already exists" };
    }
    console.error("updateDesigner error:", error);
    return { success: false as const, error: "Failed to update designer" };
  }
}
```

**Delete with unlink pattern** (lines 64-91):
```typescript
export async function deleteDesigner(id: string) {
  await requireAuth();

  try {
    const designer = await prisma.designer.findUnique({
      where: { id },
      include: { _count: { select: { charts: true } } },
    });
    if (!designer) {
      return { success: false as const, error: "Designer not found" };
    }

    await prisma.$transaction([
      prisma.chart.updateMany({
        where: { designerId: id },
        data: { designerId: null },
      }),
      prisma.designer.delete({ where: { id } }),
    ]);

    revalidatePath("/designers");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteDesigner error:", error);
    return { success: false as const, error: "Failed to delete designer" };
  }
}
```

**Get with stats pattern** (lines 177-191):
```typescript
export async function getDesignersWithStats(): Promise<DesignerWithStats[]> {
  await requireAuth();

  const designers = await prisma.designer.findMany({
    include: { _count: { select: { charts: true } } },
    orderBy: { name: "asc" },
  });
  return designers.map((d) => ({
    id: d.id,
    name: d.name,
    website: d.website,
    notes: d.notes,
    chartCount: d._count.charts,
  }));
}
```

**Apply:** Replicate all 5 patterns for Series. Delete uses `seriesId` instead of `designerId`. Get with stats should include `designer: { select: { name: true } }` for eager designer name loading plus `computeSeriesProgress()` call.

---

### `src/lib/actions/series-actions.test.ts` (test, CRUD)

**Analog:** `src/lib/actions/designer-actions.test.ts` (full file, 382 lines)

**Test setup pattern** (lines 1-28):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockDesigner,
  assertSuccess,
  assertFailure,
} from "@/__tests__/mocks";

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

describe("designer-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });
```

**Auth guard test pattern** (lines 31-66):
```typescript
  describe("auth guard", () => {
    it("rejects unauthenticated calls to createDesigner", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createDesigner } = await import("./designer-actions");

      await expect(createDesigner({ name: "Test" })).rejects.toThrow("Unauthorized");
    });
  });
```

**Create test pattern** (lines 68-106):
```typescript
  describe("createDesigner", () => {
    it("creates a designer with notes field and returns success", async () => {
      const mockDesigner = createMockDesigner({
        name: "Shannon Christine",
        notes: "Great designs",
      });
      mockPrisma.designer.create.mockResolvedValueOnce(mockDesigner);
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "Shannon Christine", notes: "Great designs" });

      assertSuccess(result);
      expect(result.designer.name).toBe("Shannon Christine");
      expect(mockPrisma.designer.create).toHaveBeenCalledWith({
        data: { name: "Shannon Christine", website: null, notes: "Great designs" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.designer.create.mockRejectedValueOnce(p2002Error);
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "Duplicate" });

      assertFailure(result);
      expect(result.error).toBe("A designer with that name already exists");
    });

    it("returns validation error for empty name", async () => {
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "" });

      assertFailure(result);
      expect(result.error).toBe("Designer name is required");
    });
  });
```

**Delete test pattern** (lines 144-173):
```typescript
  describe("deleteDesigner", () => {
    it("calls $transaction to unlink charts then delete", async () => {
      mockPrisma.designer.findUnique.mockResolvedValueOnce({
        ...createMockDesigner({ id: "d1" }),
        _count: { charts: 3 },
      });
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteDesigner } = await import("./designer-actions");

      const result = await deleteDesigner("d1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.chart.updateMany({
          where: { designerId: "d1" },
          data: { designerId: null },
        }),
        mockPrisma.designer.delete({ where: { id: "d1" } }),
      ]);
    });

    it("returns error for non-existent ID", async () => {
      mockPrisma.designer.findUnique.mockResolvedValueOnce(null);
      const { deleteDesigner } = await import("./designer-actions");

      const result = await deleteDesigner("nonexistent");

      assertFailure(result);
      expect(result.error).toBe("Designer not found");
    });
  });
```

**Apply:** Replicate full test structure substituting series-specific fields. Add `createMockSeries` factory usage. Include dynamic import pattern for module isolation.

---

### `src/lib/utils/series-progress.ts` (utility, transform)

**Analog:** `src/lib/utils/status-groups.ts` (pure function with status constants)

**Imports and constants pattern** (lines 1-11):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_GROUPS = ["not-started", "in-progress", "complete"] as const;

export type StatusGroup = (typeof STATUS_GROUPS)[number];

const STATUS_GROUP_MAP: Record<StatusGroup, ProjectStatus[]> = {
  "not-started": ["UNSTARTED"],
  "in-progress": ["KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD"],
  complete: ["FINISHED", "FFO"],
};
```

**Pure function pattern** (lines 16-18):
```typescript
export function resolveStatusFilter(groups: StatusGroup[]): ProjectStatus[] {
  return groups.flatMap((group) => STATUS_GROUP_MAP[group] ?? []);
}
```

**Apply:** Define `FINISHED_STATUSES` Set, export `SeriesProgress` type, implement `computeSeriesProgress()` as pure function operating on chart array + optional totalCount. No side effects, no imports beyond type.

---

### `src/lib/utils/series-progress.test.ts` (test, transform)

**Analog:** `src/lib/utils/status-groups.test.ts` (full file, 59 lines)

**Pure utility test pattern** (lines 1-59):
```typescript
import { describe, it, expect } from "vitest";
import { resolveStatusFilter, STATUS_GROUPS } from "./status-groups";
import type { StatusGroup } from "./status-groups";

describe("resolveStatusFilter", () => {
  it("returns empty array for empty input", () => {
    expect(resolveStatusFilter([])).toEqual([]);
  });

  it('maps "not-started" to ["UNSTARTED"]', () => {
    expect(resolveStatusFilter(["not-started"])).toEqual(["UNSTARTED"]);
  });

  it("combines multiple groups", () => {
    expect(resolveStatusFilter(["not-started", "complete"])).toEqual([
      "UNSTARTED",
      "FINISHED",
      "FFO",
    ]);
  });
});
```

**Apply:** Test `computeSeriesProgress` with: empty charts array, charts with null project, mixed statuses (FINISHED + FFO = finished), totalCount null vs set, 0 charts edge case. Import directly, no mocks needed.

---

### `src/types/series.ts` (model, type definitions)

**Analog:** `src/types/designer.ts` (full file, 35 lines)

**Type definition pattern** (full file):
```typescript
import type { ProjectStatus } from "@/generated/prisma/client";
import type { OptionalFocalPoint } from "@/types/focal-point";

export type DesignerWithStats = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  chartCount: number;
};

export type DesignerChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
  genres: { name: string }[];
};

export type DesignerDetail = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  chartCount: number;
  projectsStarted: number;
  projectsFinished: number;
  topGenre: string | null;
  charts: DesignerChart[];
};
```

**Apply:** Define `SeriesProgress`, `SeriesWithStats` (includes progress + designerName), `SeriesDetail` (extends with charts array), `SeriesChart` (chart projection with status).

---

### `src/__tests__/mocks/factories.ts` (test, mock factories) - MODIFY

**Analog:** Same file, `createMockDesigner` (lines 31-41) and `createMockPrisma` (lines 430+)

**Entity factory pattern** (lines 31-41):
```typescript
export function createMockDesigner(overrides?: Partial<Designer>): Designer {
  return {
    id: "d1",
    name: "Test Designer",
    website: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**Mock Prisma entity pattern** (lines 451-457):
```typescript
    designer: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
```

**Chart factory** (lines 135-158 — needs `seriesId: null` added):
```typescript
export function createMockChart(overrides?: Partial<Chart>): Chart {
  return {
    id: "chart-1",
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    focalPointX: null,
    focalPointY: null,
    stitchCount: 5000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 50,
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    dateAdded: new Date(),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**Apply:** 
1. Add `createMockSeries` factory after `createMockDesigner` (same shape: id, name, totalCount: null, designerId: null, notes: null, timestamps)
2. Add `series: { create, findMany, findUnique, update, delete }` to `createMockPrisma()`
3. Add `seriesId: null` to `createMockChart` return object

---

## Shared Patterns

### Authentication Guard
**Source:** `src/lib/auth-guard.ts` (imported via `requireAuth`)
**Apply to:** All server action functions in `series-actions.ts`
```typescript
import { requireAuth } from "@/lib/auth-guard";

// First line of every action:
await requireAuth();
```

### Error Handling (P2002 + Zod + Generic)
**Source:** `src/lib/actions/designer-actions.ts` lines 18-32
**Apply to:** `createSeries`, `updateSeries`
```typescript
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A series with that name already exists" };
    }
    console.error("createSeries error:", error);
    return { success: false as const, error: "Failed to create series" };
  }
```

### Path Revalidation
**Source:** `src/lib/actions/designer-actions.ts` lines 16, 44-45, 84-85
**Apply to:** All mutation actions in `series-actions.ts`
```typescript
// Create/Update:
revalidatePath("/series");

// Delete (also unlinks charts):
revalidatePath("/series");
revalidatePath("/charts");
```

### Test Dynamic Import Pattern
**Source:** `src/lib/actions/designer-actions.test.ts` (every test uses this)
**Apply to:** All tests in `series-actions.test.ts`
```typescript
const { createSeries } = await import("./series-actions");
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| -- | -- | -- | All files have exact or role-match analogs in the codebase |

## Metadata

**Analog search scope:** `src/lib/actions/`, `src/lib/validations/`, `src/lib/utils/`, `src/types/`, `src/__tests__/mocks/`, `prisma/`
**Files scanned:** 12 (targeted by CONTEXT.md canonical refs)
**Pattern extraction date:** 2026-05-24
