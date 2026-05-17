# Phase 17: Image Focal Point - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 12 (4 new, 8 modified)
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` (MODIFIED) | model | CRUD | Self (add 2 fields to Chart model) | exact |
| `src/lib/validations/focal-point.ts` (NEW) | config | request-response | `src/lib/validations/session.ts` | exact |
| `src/lib/actions/focal-point-actions.ts` (NEW) | service | CRUD | `src/lib/actions/chart-actions.ts` (updateProjectSettings) | exact |
| `src/lib/utils/focal-point.ts` (NEW) | utility | transform | `src/lib/utils/size-category.ts` | exact |
| `src/components/features/charts/project-detail/focal-point-editor.tsx` (NEW) | component | event-driven | `src/components/features/charts/project-detail/hero-kebab-menu.tsx` | role-match |
| `src/components/features/charts/project-detail/hero-cover-banner.tsx` (MODIFIED) | component | event-driven | Self (add editor integration) | exact |
| `src/components/features/charts/project-detail/project-detail-hero.tsx` (MODIFIED) | component | request-response | Self (pass focalPointX/Y through) | exact |
| `src/components/features/gallery/gallery-card.tsx` (MODIFIED) | component | request-response | Self (add objectPosition style) | exact |
| `src/components/features/gallery/gallery-types.ts` (MODIFIED) | config | N/A | Self (add 2 fields to GalleryCardData) | exact |
| `src/components/features/gallery/gallery-utils.ts` (MODIFIED) | utility | transform | Self (pass focal point in transformToGalleryCard) | exact |
| `src/components/features/dashboard/spotlight-card.tsx` (MODIFIED) | component | request-response | Self (add objectPosition style) | exact |
| `src/types/dashboard.ts` (MODIFIED) | config | N/A | Self (add focalPointX/Y to SpotlightProject) | exact |

## Pattern Assignments

### `src/lib/validations/focal-point.ts` (config, request-response)

**Analog:** `src/lib/validations/session.ts`

**Imports pattern** (lines 1):
```typescript
import { z } from "zod";
```

**Core schema pattern** (lines 3-15):
```typescript
export const sessionFormSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .refine((val) => new Date(val) <= new Date(), { message: "Date cannot be in the future" }),
  stitchCount: z
    .number()
    .int("Stitch count must be a whole number")
    .min(1, "Stitch count must be at least 1"),
  timeSpentMinutes: z.number().int().min(0, "Time cannot be negative").nullable().default(null),
  photoKey: z.string().nullable().default(null),
});

export type SessionFormInput = z.infer<typeof sessionFormSchema>;
```

**Key takeaway:** Export both the schema and its inferred type. Use `.min()` and `.max()` on numbers for range validation. New file should define `updateFocalPointSchema` with `chartId: z.string().min(1)`, `x: z.number().min(0).max(1).nullable()`, `y: z.number().min(0).max(1).nullable()`.

---

### `src/lib/actions/focal-point-actions.ts` (service, CRUD)

**Analog:** `src/lib/actions/chart-actions.ts` lines 493-521 (updateProjectSettings)

**Imports pattern** (lines 1-12):
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
```

**Auth + ownership check pattern** (lines 493-505):
```typescript
export async function updateProjectSettings(chartId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = updateProjectSettingsSchema.parse(formData);

    const project = await prisma.project.findUnique({
      where: { chartId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }
```

**Update + revalidation pattern** (lines 507-513):
```typescript
    await prisma.project.update({
      where: { chartId },
      data: validated,
    });

    revalidatePath(`/charts/${chartId}`);
    return { success: true as const };
```

**Error handling pattern** (lines 514-521):
```typescript
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateProjectSettings error:", error);
    return { success: false as const, error: "Failed to update project settings" };
  }
}
```

**Key takeaway:** The focal point action will update `Chart` (not `Project`), so ownership check should be: `chart.project.userId !== user.id` (since Chart is owned via Project). Use `revalidatePath("/charts")`, `revalidatePath(\`/charts/${chartId}\`)`, and `revalidatePath("/")` to cover gallery + detail + dashboard.

---

### `src/lib/utils/focal-point.ts` (utility, transform)

**Analog:** `src/lib/utils/size-category.ts`

**Full file pattern** (lines 1-32):
```typescript
export type SizeCategory = "Mini" | "Small" | "Medium" | "Large" | "BAP";

export const SIZE_COLORS: Record<SizeCategory, { bg: string; text: string }> = { ... };

export function calculateSizeCategory(stitchCount: number): SizeCategory {
  if (stitchCount >= 50_000) return "BAP";
  if (stitchCount >= 25_000) return "Large";
  ...
}
```

**Key takeaway:** Pure utility file. No "use client", no imports beyond types. Export a `getObjectPositionStyle(x, y)` function that returns `React.CSSProperties | undefined`. Keep it minimal and well-typed.

---

### `src/components/features/charts/project-detail/focal-point-editor.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx`

**Imports pattern** (lines 1-8):
```typescript
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
```

**State + useTransition pattern** (lines 34-37):
```typescript
export function HeroKebabMenu({ chartId, chartName }: HeroKebabMenuProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
```

**Server action call pattern with try/catch** (lines 39-57):
```typescript
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
```

**Button UI pattern** (lines 85-89):
```typescript
<Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
  Cancel
</Button>
<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
  {isPending ? "Deleting..." : "Delete Project"}
</Button>
```

**Key takeaway:** The focal point editor is more complex (click coordinate calculation, crop overlay, edit mode toggle) but follows the same patterns: `useState` for local UI state, `useTransition` + try/catch for server action calls, `toast` for feedback, `Button` for actions. The editor will also need `useRef<HTMLDivElement>` for coordinate calculation.

---

### `src/components/features/charts/project-detail/hero-cover-banner.tsx` (component, event-driven) -- MODIFIED

**Current full file** (lines 1-47):
```typescript
"use client";

import { useState } from "react";
import Image from "next/image";

interface HeroCoverBannerProps {
  imageUrl: string | null;
  chartName: string;
}

export function HeroCoverBanner({ imageUrl, chartName }: HeroCoverBannerProps) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) return null;

  return (
    <div className="bg-muted relative max-h-64 w-full overflow-hidden rounded-lg max-[767px]:max-h-40 md:max-h-48">
      <Image
        src={imageUrl}
        alt=""
        fill
        aria-hidden="true"
        className="scale-110 object-cover opacity-60 blur-[20px]"
        unoptimized
      />
      <Image
        src={imageUrl}
        alt={`Cover for ${chartName}`}
        width={1200}
        height={800}
        priority
        className="relative mx-auto max-h-64 w-full object-contain max-[767px]:max-h-40 md:max-h-48"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  );
}
```

**Key takeaway:** This component needs to accept new props: `chartId`, `focalPointX`, `focalPointY`, and render the `FocalPointEditor` as a child overlay. The container `<div>` with `relative` positioning is already perfect for absolute-positioned editor overlays.

---

### `src/components/features/gallery/gallery-card.tsx` (component, request-response) -- MODIFIED

**Image rendering pattern** (lines 171-179):
```typescript
<Image
  src={card.coverImageUrl!}
  alt={card.name}
  fill
  className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
  onError={() => setImgFailed(true)}
  unoptimized
/>
```

**Key takeaway:** Add `style={getObjectPositionStyle(card.focalPointX, card.focalPointY)}` to the Image component. The `GalleryCardData` type needs `focalPointX: number | null` and `focalPointY: number | null` fields added.

---

### `src/components/features/dashboard/spotlight-card.tsx` (component, request-response) -- MODIFIED

**Image rendering pattern** (lines 63-69):
```typescript
<img
  src={imageUrl}
  alt={project.projectName}
  loading="lazy"
  className="h-full w-full object-cover"
/>
```

**Key takeaway:** Add `style={getObjectPositionStyle(project.focalPointX, project.focalPointY)}` to the `<img>` element. The `SpotlightProject` type needs `focalPointX: number | null` and `focalPointY: number | null`.

---

### `src/components/features/gallery/gallery-utils.ts` -- transformToGalleryCard (MODIFIED)

**Transform function pattern** (lines 101-129):
```typescript
  return {
    chartId: chart.id,
    projectId: chart.project?.id ?? null,
    name: chart.name,
    designerName: chart.designer?.name ?? "Unknown",
    coverImageUrl: chart.coverImageUrl ? (imageUrls[chart.coverImageUrl] ?? null) : null,
    coverThumbnailUrl: chart.coverThumbnailUrl
      ? (imageUrls[chart.coverThumbnailUrl] ?? null)
      : null,
    status,
    ...
    dateAdded: chart.dateAdded,
  };
```

**Key takeaway:** Add `focalPointX: chart.focalPointX ?? null` and `focalPointY: chart.focalPointY ?? null` to the returned object. These fields come from the Chart model directly (no transformation needed). The `GalleryChartData` type in `src/types/chart.ts` inherits from `Chart` which will have the new fields after schema change.

---

## Shared Patterns

### Authentication / Ownership
**Source:** `src/lib/actions/chart-actions.ts` lines 493-505
**Apply to:** `focal-point-actions.ts`
```typescript
const user = await requireAuth();

// Ownership check for Chart (through Project)
const chart = await prisma.chart.findUnique({
  where: { id: chartId },
  include: { project: { select: { userId: true } } },
});
if (!chart || !chart.project || chart.project.userId !== user.id) {
  return { success: false as const, error: "Chart not found" };
}
```

### Error Handling
**Source:** `src/lib/actions/chart-actions.ts` lines 514-521
**Apply to:** `focal-point-actions.ts`
```typescript
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false as const, error: error.errors[0].message };
  }
  console.error("updateFocalPoint error:", error);
  return { success: false as const, error: "Failed to update focal point" };
}
```

### Server Action Call (client-side)
**Source:** `src/components/features/charts/project-detail/hero-kebab-menu.tsx` lines 39-57
**Apply to:** `focal-point-editor.tsx`
```typescript
const [isPending, startTransition] = useTransition();

function handleSave() {
  startTransition(async () => {
    try {
      const result = await updateFocalPoint(chartId, pendingPoint.x, pendingPoint.y);
      if (result.success) {
        toast.success("Focal point saved");
        setIsEditMode(false);
      } else {
        toast.error("Couldn't save focal point. Try again.");
      }
    } catch {
      toast.error("Couldn't save focal point. Try again.");
    }
  });
}
```

### Object-Position CSS Application
**Source:** New utility (pattern from RESEARCH.md, matching CSS spec)
**Apply to:** `gallery-card.tsx`, `spotlight-card.tsx`, `genre-detail.tsx`, `designer-detail.tsx`, `project-accordion.tsx`
```typescript
import { getObjectPositionStyle } from "@/lib/utils/focal-point";

// On any <Image> or <img> with object-cover:
style={getObjectPositionStyle(focalPointX, focalPointY)}
```

### Test Mock Setup
**Source:** `src/lib/actions/chart-actions-settings.test.ts` lines 1-25
**Apply to:** `focal-point-actions.test.ts`
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockProject } from "@/__tests__/mocks";

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

describe("updateFocalPoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have strong analogs in the codebase |

## Metadata

**Analog search scope:** `src/lib/actions/`, `src/lib/validations/`, `src/lib/utils/`, `src/components/features/charts/project-detail/`, `src/components/features/gallery/`, `src/components/features/dashboard/`, `src/types/`
**Files scanned:** ~30 (targeted by role)
**Pattern extraction date:** 2026-05-17
