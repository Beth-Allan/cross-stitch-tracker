# Phase 29: UI Polish - Pattern Map

**Mapped:** 2026-05-23
**Files analyzed:** 14 new/modified files
**Analogs found:** 14 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/utils/status.ts` | config | transform | self (modify in place) | exact |
| `src/lib/utils/size-category.ts` | config | transform | self (modify in place) | exact |
| `src/components/features/gallery/gallery-types.ts` | type | N/A | self (modify in place) | exact |
| `src/components/features/gallery/gallery-card.tsx` | component | request-response | self (modify in place) | exact |
| `src/components/features/gallery/gallery-grid.tsx` | component | request-response | `gallery-card.tsx` (size badge pattern) | exact |
| `src/components/features/gallery/gallery-utils.ts` | utility | transform | self (modify in place) | exact |
| `src/types/chart.ts` | type | N/A | self (modify in place) | exact |
| `src/lib/actions/chart-actions.ts` | service | CRUD | self (modify gallery query) | exact |
| `src/components/features/charts/project-detail/supplies-tab.tsx` | component | request-response | self + `calculator-settings-bar.tsx` | exact |
| `src/lib/validations/upload.ts` | config | transform | self (modify in place) | exact |
| `src/app/(dashboard)/charts/[id]/page.tsx` | controller | request-response | self (add fabric fetch) | exact |
| `src/lib/validations/supply.ts` | config | transform | self (extend schema) | exact |
| `src/__tests__/mocks/factories.ts` | test | N/A | self (add hasDigitalCopy) | exact |
| `src/components/features/charts/status-badge.test.tsx` (NEW) | test | N/A | `gallery-card.test.tsx` | role-match |

## Pattern Assignments

### `src/lib/utils/status.ts` (config, transform)

**Analog:** Self -- modify `UNSTARTED` entry only

**Existing pattern** (lines 13-21) -- replace `bg-muted`/`text-muted-foreground` with slate:
```typescript
UNSTARTED: {
  label: "Unstarted",
  cssVar: "--status-unstarted",
  bgClass: "bg-muted",                    // -> "bg-slate-50"
  textClass: "text-muted-foreground",      // -> "text-slate-700 dark:text-slate-300"
  dotClass: "bg-muted-foreground/60",      // -> "bg-slate-500"
  darkBgClass: "",                         // -> "dark:bg-slate-900/40"
},
```

**Color pattern from other statuses** (lines 23-28) -- follow identical structure:
```typescript
KITTING: {
  label: "Kitting",
  cssVar: "--status-kitting",
  bgClass: "bg-amber-50",
  textClass: "text-amber-700 dark:text-amber-300",
  dotClass: "bg-amber-500",
  darkBgClass: "dark:bg-amber-950/40",
},
```

---

### `src/lib/utils/size-category.ts` (config, transform)

**Analog:** Self -- lighten all bg values from `-100` to `-50`

**Current pattern** (lines 3-12):
```typescript
export const SIZE_COLORS: Record<SizeCategory, { bg: string; text: string }> = {
  Mini: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Small: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Large: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  BAP: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};
```

Change: Replace all `-100` with `-50`. Keep `-900/30` dark mode shades unchanged.

---

### `src/components/features/gallery/gallery-types.ts` (type, N/A)

**Analog:** Self -- add `hasDigitalCopy` field to `GalleryCardData`

**Existing interface** (lines 40-65):
```typescript
export interface GalleryCardData extends OptionalFocalPoint {
  chartId: string;
  // ... existing fields ...
  dateAdded: Date;
  // ADD: hasDigitalCopy: boolean;
}
```

---

### `src/components/features/gallery/gallery-card.tsx` (component, request-response)

**Analog:** Self -- two changes: (1) replace inline grey size badge with `SIZE_COLORS`, (2) add digital copy indicator in card body

**Size badge -- current inline grey** (lines 197-208):
```tsx
<div className="absolute top-3 right-3">
  <Tooltip>
    <TooltipTrigger
      render={<span />}
      className="bg-background/90 text-muted-foreground cursor-default rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
    >
      {card.sizeCategory}
    </TooltipTrigger>
    <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
  </Tooltip>
</div>
```
Replace `bg-background/90 text-muted-foreground` with `SIZE_COLORS[card.sizeCategory].bg` and `SIZE_COLORS[card.sizeCategory].text`. Import `SIZE_COLORS` from `@/lib/utils/size-category`.

**Digital copy indicator -- insertion point** (after line 230, below stitch count, before GenreTags):
```tsx
{card.hasDigitalCopy && (
  <div className="flex items-center gap-1">
    <FileText className="text-primary size-3.5" aria-hidden="true" />
    <span className="text-muted-foreground text-xs">Digital copy</span>
  </div>
)}
```
Pattern follows existing metadata elements: `text-muted-foreground text-xs` for secondary info, `flex items-center gap-1` for icon+label.

---

### `src/components/features/gallery/gallery-grid.tsx` (component, request-response)

**Analog:** `gallery-card.tsx` size badge replacement pattern

**List view size badge -- grey classes** (lines 289-298):
```tsx
<TooltipTrigger
  render={<span />}
  className="bg-muted text-muted-foreground cursor-default rounded-full px-2 py-0.5 text-center text-[10px] font-bold tracking-widest uppercase"
>
```
Replace `bg-muted text-muted-foreground` with `SIZE_COLORS[card.sizeCategory].bg` and `.text`.

**Table view size badge -- text-only grey** (lines 431-440):
```tsx
<TooltipTrigger
  render={<span />}
  className="text-muted-foreground cursor-default text-xs"
>
```
Replace `text-muted-foreground` with `SIZE_COLORS[card.sizeCategory].text`. Optionally add bg for consistency.

---

### `src/components/features/gallery/gallery-utils.ts` (utility, transform)

**Analog:** Self -- add `hasDigitalCopy` mapping to `transformToGalleryCard`

**Current transform return** (lines 101-131):
```typescript
return {
  chartId: chart.id,
  // ... existing fields ...
  dateAdded: chart.dateAdded,
  // ADD: hasDigitalCopy: (chart._count?.files ?? 0) > 0,
};
```

---

### `src/types/chart.ts` (type, N/A)

**Analog:** Self -- add `_count` to `GalleryChartData`

**Current type** (lines 52-56):
```typescript
export type GalleryChartData = Chart & {
  project: GalleryProjectData | null;
  designer: Designer | null;
  genres: Genre[];
  // ADD: _count?: { files: number };
};
```

---

### `src/lib/actions/chart-actions.ts` (service, CRUD)

**Analog:** Self -- add `_count` to gallery Prisma query

**Current gallery query** (lines 461-492):
```typescript
export async function getChartsForGallery() {
  const user = await requireAuth();
  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      // ... existing includes ...
      designer: true,
      genres: true,
      // ADD: _count: { select: { files: true } },
    },
    orderBy: { dateAdded: "desc" },
  });
}
```

---

### `src/components/features/charts/project-detail/supplies-tab.tsx` (component, request-response)

**Analog:** `calculator-settings-bar.tsx` for persistence pattern; `calculator-card.tsx` for UI component

**Persistence pattern from calculator-settings-bar.tsx** (lines 51-73):
```typescript
const handleSettingChange = useCallback(
  (field: keyof CalculatorSettings, value: number) => {
    const newSettings = { ...settingsRef.current, [field]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    startTransition(async () => {
      try {
        const result = await updateProjectSettings(chartId, { [field]: value });
        if (!result.success) {
          setLocalSettings(settings);
          onSettingsChange(settings);
          toast.error("Couldn't save settings. Please try again.");
        }
      } catch (error) {
        console.error("CalculatorSettingsBar save failed:", error);
        setLocalSettings(settings);
        onSettingsChange(settings);
        toast.error("Couldn't save settings. Please try again.");
      }
    });
  },
  [chartId, settings, onSettingsChange],
);
```

**CalculatorCard props** (lines 14-19 of calculator-card.tsx):
```typescript
interface CalculatorCardProps {
  calcParams: CalcParams;
  onCalcParamsChange: (params: CalcParams) => void;
  fabricId: string | null;
  onFabricChange: (fabricId: string | null, fabricCount?: number) => void;
  fabricOptions: FabricOption[];
}
```

**SuppliesTab needs:** Add CalculatorCard above supply table with `onCalcParamsChange` and `onFabricChange` callbacks that call `updateProjectSettings` with optimistic update + rollback. Receive `fabricOptions` and `chartId` as new props.

**Current SuppliesTab props** (lines 17-20):
```typescript
interface SuppliesTabProps {
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
  // ADD: chartId: string;
  // ADD: fabricOptions: FabricOption[];
}
```

---

### `src/lib/validations/upload.ts` (config, transform)

**Analog:** Self -- modify constants

**Current values** (lines 5-35):
```typescript
export const ALLOWED_FILE_TYPES = [
  // ... existing ...
  // ADD: "application/zip", "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_TYPES = [
  // ... existing ...
  // ADD: "application/zip", "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_EXTENSIONS = [
  // ... existing ...
  // ADD: ".zip",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // -> 50 * 1024 * 1024
```

**Error message** (line 50):
```typescript
.max(MAX_FILE_SIZE, "File is too large. Maximum size is 10MB.")
// -> "File is too large. Maximum size is 50MB."
```

---

### `src/app/(dashboard)/charts/[id]/page.tsx` (controller, request-response)

**Analog:** `src/app/(dashboard)/charts/[id]/edit/page.tsx` for fabric options fetching

**Edit page pattern** (edit/page.tsx lines 7, 24):
```typescript
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
// ...
getUnassignedFabrics(chart.project?.id),
```

**Project detail page needs:** Add `getUnassignedFabrics` to the `Promise.all` and pass result through to `ProjectDetailPage` as a new prop.

**Current Promise.all** (lines 24-52):
```typescript
const [
  projectSupplies,
  imageUrls,
  // ...
  // ADD: unassignedFabrics,
] = await Promise.all([
  // ... existing ...
  // ADD: chart.project ? getUnassignedFabrics(chart.project.id) : [],
]);
```

---

### `src/lib/validations/supply.ts` (config, transform)

**Analog:** Self -- extend `updateProjectSettingsSchema`

**Current schema** (lines 93-97):
```typescript
export const updateProjectSettingsSchema = z.object({
  strandCount: z.number().int().min(1).max(6).optional(),
  overCount: z.union([z.literal(1), z.literal(2)]).optional(),
  wastePercent: z.number().int().min(0).max(50).optional(),
  // CONSIDER ADDING: fabricId: z.string().min(1).nullable().optional(),
});
```

---

### `src/__tests__/mocks/factories.ts` (test, N/A)

**Analog:** Self -- add `hasDigitalCopy` to `createMockGalleryCard`

**Current factory** (lines 375-405):
```typescript
export function createMockGalleryCard(overrides?: Partial<GalleryCardData>): GalleryCardData {
  return {
    // ... existing fields ...
    dateAdded: new Date("2026-01-15"),
    // ADD: hasDigitalCopy: false,
    ...overrides,
  };
}
```

---

### `src/components/features/charts/status-badge.test.tsx` (NEW test file)

**Analog:** `src/components/features/gallery/gallery-card.test.tsx`

**Test file imports pattern** (gallery-card.test.tsx lines 1-4):
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it, vi } from "vitest";
import { GalleryCard } from "./gallery-card";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";
```

**Simple component test pattern** (no mocks needed for StatusBadge -- pure presentational):
```typescript
import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders UNSTARTED with slate classes", () => {
    const { container } = render(<StatusBadge status="UNSTARTED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-slate-50");
    expect(badge.className).toContain("text-slate-700");
  });
});
```

---

## Shared Patterns

### Authentication (requireAuth)
**Source:** `src/lib/auth-guard.ts`
**Apply to:** `chart-actions.ts` (already uses it), `upload-actions.ts` (already uses it)
**Note:** No new server actions created in this phase. All modifications are to files that already call `requireAuth()`.

### Optimistic Update + Rollback
**Source:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx` (lines 51-73)
**Apply to:** `supplies-tab.tsx` when wiring CalculatorCard persistence
```typescript
startTransition(async () => {
  try {
    const result = await updateProjectSettings(chartId, { [field]: value });
    if (!result.success) {
      rollbackToServerState();
      toast.error("Couldn't save settings. Please try again.");
    }
  } catch (error) {
    console.error("Save failed:", error);
    rollbackToServerState();
    toast.error("Couldn't save settings. Please try again.");
  }
});
```

### Test Mock Setup for Server Actions
**Source:** `src/components/features/charts/project-detail/supplies-tab.test.tsx` (lines 22-51)
**Apply to:** Any new test file that tests components calling server actions
```typescript
vi.mock("@/lib/actions/chart-actions", () => ({
  updateProjectSettings: vi.fn(() => Promise.resolve({ success: true })),
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
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

### Config-Driven Badge Colors
**Source:** `src/lib/utils/status.ts` (STATUS_CONFIG) and `src/lib/utils/size-category.ts` (SIZE_COLORS)
**Apply to:** All badge rendering in `gallery-card.tsx`, `gallery-grid.tsx`, `status-badge.tsx`, `size-badge.tsx`
**Pattern:** Centralized config object keyed by enum/union type, consumed by badge component via lookup:
```typescript
const config = STATUS_CONFIG[status];
// or
const colors = SIZE_COLORS[category];
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have exact analogs -- this phase modifies existing code only |

## Metadata

**Analog search scope:** `src/components/features/gallery/`, `src/components/features/charts/`, `src/lib/utils/`, `src/lib/actions/`, `src/lib/validations/`, `src/types/`, `src/app/(dashboard)/charts/`, `src/__tests__/mocks/`
**Files scanned:** 18 source files read, 6 grep searches
**Pattern extraction date:** 2026-05-23
