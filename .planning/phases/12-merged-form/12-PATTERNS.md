# Phase 12: Merged Form - Pattern Map

**Mapped:** 2026-05-10
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/charts/chart-merged-form.tsx` | component (form shell) | request-response | `src/components/features/charts/chart-add-form.tsx` | exact |
| `src/components/features/charts/chart-merged-form.test.tsx` | test | request-response | `src/components/features/charts/chart-add-form.test.tsx` | exact |
| `src/components/features/charts/form-primitives/pattern-type-cards.tsx` | component (form primitive) | event-driven | `src/components/features/charts/form-primitives/pattern-type-fields.tsx` | exact |
| `src/components/features/charts/form-primitives/pattern-type-cards.test.tsx` | test | event-driven | `src/components/features/charts/form-primitives/searchable-select.test.tsx` | role-match |
| `src/components/features/charts/form-primitives/sticky-save-bar.tsx` | component (toolbar) | event-driven | `src/components/features/charts/chart-add-form.tsx` (button bar, lines 179-186) | partial |
| `src/components/features/charts/form-primitives/sticky-save-bar.test.tsx` | test | event-driven | `src/components/features/charts/chart-add-form.test.tsx` | role-match |
| `src/components/features/charts/use-draft-persistence.ts` | hook (utility) | file-I/O (localStorage) | `src/components/features/shopping/shopping-cart.tsx` (`usePersistedSelection`, lines 20-51) | exact |
| `src/components/features/charts/use-draft-persistence.test.ts` | test | file-I/O (localStorage) | `src/components/features/gallery/use-gallery-filters.test.ts` (view persistence tests, lines 316-384) | exact |
| `src/components/features/charts/form-primitives/form-field.tsx` | component (modification) | event-driven | Self (current implementation) | exact |
| `src/components/features/charts/form-primitives/genre-picker.tsx` | component (modification) | event-driven | Self (current implementation, line 63) | exact |
| `src/app/(dashboard)/charts/new/page.tsx` | page (modification) | request-response | Self (current implementation) | exact |

## Pattern Assignments

### `src/components/features/charts/chart-merged-form.tsx` (component, request-response)

**Analog:** `src/components/features/charts/chart-add-form.tsx` (190 lines)

**Imports pattern** (lines 1-19):
```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Designer, Fabric, FabricBrand, Genre } from "@/generated/prisma/client";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { useChartForm } from "./use-chart-form";
// Section imports will be replaced by direct form primitive imports
```

**Props pattern** (lines 20-26):
```typescript
interface ChartAddFormProps {
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
}
```

**Hook initialization pattern** (lines 37-46):
```typescript
const router = useRouter();

const form = useChartForm({
  mode: "create",
  designers,
  genres,
  storageLocations,
  stitchingApps,
  onSuccess: () => {
    router.push("/charts");
  },
});
```

**Cancel guard pattern** (lines 48-53):
```typescript
const handleCancel = () => {
  if (form.isDirty) {
    if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
  }
  router.push("/charts");
};
```

**Layout wrapper pattern** (lines 56-66):
```typescript
<div className="mx-auto max-w-2xl p-5 lg:p-8">
  <Link
    href="/charts"
    className="group text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
  >
    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
    Charts
  </Link>

  <h1 className="font-heading text-foreground mb-6 text-2xl font-semibold">Add New Chart</h1>
```

**Form element + field wiring pattern** (lines 67-87):
```typescript
<form onSubmit={form.handleSubmit} className="space-y-5">
  {/* Fields wire to form hook via form.setField("fieldName", value) */}
  {/* Errors wire via form.errors["chart.name"] or form.errors["project.status"] */}
  <FormField label="Chart Name" htmlFor="chart-name" required error={form.errors["chart.name"]}>
    <Input
      id="chart-name"
      value={form.values.name}
      onChange={(e) => form.setField("name", e.target.value)}
      placeholder="e.g. Enchanted Forest Sampler"
      aria-required="true"
      aria-invalid={!!form.errors["chart.name"]}
    />
  </FormField>
```

**Form-level error display pattern** (lines 173-177):
```typescript
{form.errors._form && (
  <p role="alert" className="text-destructive text-sm">
    {form.errors._form}
  </p>
)}
```

**Button bar pattern** (lines 179-186):
```typescript
<div className="border-border mt-8 flex justify-end gap-3 border-t pt-5">
  <Button type="button" variant="ghost" onClick={handleCancel}>
    Cancel
  </Button>
  <Button type="submit" disabled={form.isSubmitDisabled}>
    {form.isSuccess ? "Added!" : form.isPending ? "Adding..." : "Add Chart"}
  </Button>
</div>
```

**Key changes for merged form:**
- Layout changes from `max-w-2xl` to `max-w-[720px]`; adds `pb-20` for sticky bar clearance
- Sections replaced by inline field groups with `<hr>` dividers
- Button bar replaced by StickySaveBar (separate component)
- Add subtitle below h1
- Wire PatternTypeCards instead of PatternTypeSection

---

### `src/components/features/charts/chart-merged-form.test.tsx` (test, request-response)

**Analog:** `src/components/features/charts/chart-add-form.test.tsx` (267 lines)

**Test file structure** (lines 1-58):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartAddForm } from "./chart-add-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateChart = vi.fn();
const mockUpdateChart = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: (...args: unknown[]) => mockCreateChart(...args),
  updateChart: (...args: unknown[]) => mockUpdateChart(...args),
}));

// ... additional action mocks for designer, genre, storage, stitching, upload

const defaultFormProps = {
  designers: mockDesigners,
  genres: mockGenres,
  storageLocations: [],
  stitchingApps: [],
  unassignedFabrics: [],
};

describe("ChartAddForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
```

**Render + section assertion pattern** (lines 60-71):
```typescript
it("renders all 8 form sections", () => {
  render(<ChartAddForm {...defaultFormProps} />);

  expect(screen.getByText("Basic Info")).toBeInTheDocument();
  // ... check for all section headings or field labels
});
```

**Validation error test pattern** (lines 79-93):
```typescript
it("shows validation error when submitting with empty name", async () => {
  const user = userEvent.setup();
  render(<ChartAddForm {...defaultFormProps} />);

  await user.click(screen.getByRole("button", { name: /add chart/i }));

  await waitFor(() => {
    expect(screen.getByText("Chart name is required")).toBeInTheDocument();
  });
  expect(mockCreateChart).not.toHaveBeenCalled();
});
```

**Submit + redirect test pattern** (lines 110-135):
```typescript
it("calls createChart with valid data and redirects on success", async () => {
  mockCreateChart.mockResolvedValue({ success: true, chartId: "new-id" });

  const user = userEvent.setup();
  render(<ChartAddForm {...defaultFormProps} />);

  await user.type(screen.getByLabelText(/chart name/i), "My Test Chart");
  await user.type(screen.getByLabelText(/total stitch count/i), "10000");
  await user.click(screen.getByRole("button", { name: /add chart/i }));

  await waitFor(() => {
    expect(mockCreateChart).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith("/charts");
  });
});
```

**Button state test pattern** (lines 177-192):
```typescript
it("disables submit button during pending state", async () => {
  mockCreateChart.mockReturnValue(new Promise(() => {}));

  const user = userEvent.setup();
  render(<ChartAddForm {...defaultFormProps} />);

  await user.type(screen.getByLabelText(/chart name/i), "Test Chart");
  await user.type(screen.getByLabelText(/total stitch count/i), "5000");
  await user.click(screen.getByRole("button", { name: /add chart/i }));

  await waitFor(() => {
    const button = screen.getByRole("button", { name: /adding/i });
    expect(button).toBeDisabled();
  });
});
```

---

### `src/components/features/charts/form-primitives/pattern-type-cards.tsx` (component, event-driven)

**Analog:** `src/components/features/charts/form-primitives/pattern-type-fields.tsx` (90 lines)

**Props interface pattern** (lines 8-18):
```typescript
interface PatternTypeFieldsProps {
  isPaperChart: boolean;
  isFormalKit: boolean;
  isSAL: boolean;
  kitColorCount: number | null;
  onFormatChange: (isPaper: boolean) => void;
  onFormalKitChange: (checked: boolean) => void;
  onSALChange: (checked: boolean) => void;
  onKitColorCountChange: (value: string) => void;
  errors?: { kitColorCount?: string };
}
```

**Radio group pattern** (lines 35-58):
```typescript
<fieldset>
  <legend className="sr-only">Chart Format</legend>
  <div className="flex gap-4">
    <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        name={groupId}
        checked={!isPaperChart}
        onChange={() => onFormatChange(false)}
        className="accent-primary"
      />
      Digital Chart
    </label>
    {/* ... Paper radio ... */}
  </div>
</fieldset>
```

**Kit expandable sub-field pattern** (lines 62-85):
```typescript
<StyledCheckbox
  checked={isFormalKit}
  onChange={(checked) => {
    onFormalKitChange(checked);
    if (!checked) onKitColorCountChange("");
  }}
  label="Formal Kit"
/>
{isFormalKit && (
  <div className="ml-6">
    <FormField label="Kit Colours" htmlFor="kit-color-count" error={errors?.kitColorCount}>
      <Input
        id="kit-color-count"
        type="number"
        min={1}
        value={kitColorCount ?? ""}
        onChange={(e) => onKitColorCountChange(e.target.value)}
        placeholder="Number of colours"
        className="max-w-[200px]"
      />
    </FormField>
  </div>
)}
```

**Key changes for cards:**
- Same props interface (reuse exact same contract -- same prop names, same types)
- Visual rendering changes from radio+checkbox to card grid with check circles
- Kit expand uses CSS max-height transition instead of conditional mount
- Wrap Paper/Digital in `role="radiogroup"`, Kit/SAL use `role="checkbox"`

---

### `src/components/features/charts/form-primitives/sticky-save-bar.tsx` (component, event-driven)

**Analog:** Button bar in `src/components/features/charts/chart-add-form.tsx` (lines 179-186)

**Button bar from analog:**
```typescript
<div className="border-border mt-8 flex justify-end gap-3 border-t pt-5">
  <Button type="button" variant="ghost" onClick={handleCancel}>
    Cancel
  </Button>
  <Button type="submit" disabled={form.isSubmitDisabled}>
    {form.isSuccess ? "Added!" : form.isPending ? "Adding..." : "Add Chart"}
  </Button>
</div>
```

**Button import pattern** (from analog):
```typescript
import { Button } from "@/components/ui/button";
```

**Key changes for sticky bar:**
- Fixed positioning: `fixed bottom-0 left-0 right-0 z-100`
- Background: `bg-card border-t border-border`
- Inner content max-width centered: `max-w-[720px] mx-auto`
- Add save-readiness hint text (left-aligned, `mr-auto`)
- Save Draft button: `type="button"` with `variant="ghost"` -- calls localStorage save, NOT form submit
- Create button: `type="button"` -- calls `onSubmit` prop (not native form submit)
- Both disabled when chart name is empty
- `role="toolbar" aria-label="Form actions"`

---

### `src/components/features/charts/use-draft-persistence.ts` (hook, localStorage)

**Analog:** `src/components/features/shopping/shopping-cart.tsx` `usePersistedSelection` (lines 20-51)

**localStorage persistence pattern** (lines 20-51):
```typescript
const STORAGE_KEY = "shopping-cart-selected-projects";

function usePersistedSelection(validProjectIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (!Array.isArray(parsed)) return;
      const validSet = new Set(validProjectIds);
      const filtered = parsed.filter((id) => validSet.has(id));
      if (filtered.length > 0) setSelectedIds(new Set(filtered));
    } catch {
      // localStorage may be unavailable
    }
  }, [validProjectIds]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
    } catch {
      // localStorage may be unavailable
    }
  }, [selectedIds]);

  return [selectedIds, setSelectedIds] as const;
}
```

**Key patterns to copy:**
- `try/catch` around every `localStorage` call with comment `// localStorage may be unavailable`
- Stale ID filtering: `parsed.filter((id) => validSet.has(id))` -- draft persistence needs same pattern for designerId, storageLocationId, stitchingAppId
- `hydratedRef` to prevent double-reads

**Key changes for draft persistence:**
- Not a reactive hook (no auto-save on state change) -- explicit `saveDraft()` / `loadDraft()` / `clearDraft()` functions per D-06
- Returns loaded values to caller, not internal state
- Stale ID detection nulls out missing IDs instead of filtering from array
- Key: `"chart-draft"` instead of project selection

---

### `src/components/features/charts/use-draft-persistence.test.ts` (test, localStorage)

**Analog:** `src/components/features/gallery/use-gallery-filters.test.ts` (lines 316-384)

**localStorage test pattern** (lines 316-384):
```typescript
describe("view mode persistence", () => {
  const VIEW_STORAGE_KEY = "gallery-view-mode";

  beforeEach(() => {
    localStorage.clear();
  });

  it("setView writes the chosen view mode to localStorage", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.setView("table"));
    expect(localStorage.getItem(VIEW_STORAGE_KEY)).toBe("table");
  });

  it("initializes from localStorage when no URL param is present", async () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "list");

    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => Promise.resolve());
    expect(result.current.view).toBe("list");
  });

  it("invalid localStorage value falls back to gallery default", async () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "invalid");

    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => Promise.resolve());
    expect(result.current.view).toBe("gallery");
  });
});
```

**Key patterns to copy:**
- `beforeEach(() => localStorage.clear())`
- Direct `localStorage.setItem()` / `localStorage.getItem()` assertions
- Test both save, restore, and invalid/stale data handling
- Use `renderHook` from `@/__tests__/test-utils` for hook tests

---

### `src/components/features/charts/form-primitives/form-field.tsx` (modification)

**Current implementation** (lines 1-48):
```typescript
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, required, htmlFor, children }: FormFieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-muted-foreground text-xs tracking-wider uppercase",
          error && "text-destructive",
        )}
      >
        {label}
        {required && (
          <>
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-muted-foreground/70 mt-1 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
```

**Specific change (lines 29-33):** Replace red asterisk with green dot:
```typescript
// CURRENT (lines 29-33):
<span className="text-destructive ml-0.5" aria-hidden="true">
  *
</span>

// NEW:
<span
  className="bg-primary mr-1.5 inline-block size-1.5 rounded-full align-middle relative -top-px"
  aria-hidden="true"
/>
```

Note: The green dot goes BEFORE the label text (prefix with `mr-1.5`), while the red asterisk was AFTER (suffix with `ml-0.5`). The `<span className="sr-only"> (required)</span>` stays unchanged.

---

### `src/components/features/charts/form-primitives/genre-picker.tsx` (modification)

**Current selected chip class** (line 63):
```typescript
"border-primary/30 bg-primary/10 text-primary"
```

**Change:** Add `font-medium` to selected state per D-18:
```typescript
"border-primary/30 bg-primary/10 text-primary font-medium"
```

---

### `src/app/(dashboard)/charts/new/page.tsx` (modification)

**Current implementation** (lines 1-28):
```typescript
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { getStitchingAppsWithStats } from "@/lib/actions/stitching-app-actions";
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
import { ChartAddForm } from "@/components/features/charts/chart-add-form";

export default async function NewChartPage() {
  const [designers, genres, storageLocations, stitchingApps, unassignedFabrics] = await Promise.all(
    [
      getDesigners(),
      getGenres(),
      getStorageLocationsWithStats(),
      getStitchingAppsWithStats(),
      getUnassignedFabrics(),
    ],
  );

  return (
    <ChartAddForm
      designers={designers}
      genres={genres}
      storageLocations={storageLocations}
      stitchingApps={stitchingApps}
      unassignedFabrics={unassignedFabrics}
    />
  );
}
```

**Change:** Replace `ChartAddForm` import with `ChartMergedForm`. Same data fetching, same props. Only the import line and JSX component name change.

---

## Shared Patterns

### Button Import
**Source:** `src/components/ui/button.tsx`
**Apply to:** `sticky-save-bar.tsx`, `chart-merged-form.tsx`
```typescript
import { Button } from "@/components/ui/button";
```

### FormField Wrapper
**Source:** `src/components/features/charts/form-primitives/form-field.tsx`
**Apply to:** `chart-merged-form.tsx` (all labeled fields)
```typescript
import { FormField } from "./form-primitives/form-field";

<FormField label="Chart Name" htmlFor="chart-name" required error={form.errors["chart.name"]}>
  <Input id="chart-name" value={form.values.name} onChange={(e) => form.setField("name", e.target.value)} />
</FormField>
```

### useChartForm Hook Wiring
**Source:** `src/components/features/charts/use-chart-form.ts` (return type, lines 372-393)
**Apply to:** `chart-merged-form.tsx`
```typescript
// Hook return shape -- all field wiring uses these:
const form = useChartForm({ mode: "create", designers, genres, storageLocations, stitchingApps, onSuccess });

form.values.fieldName        // read
form.setField("fieldName", v) // write
form.errors["chart.name"]    // error for chart fields
form.errors["project.status"] // error for project fields
form.errors._form            // form-level error
form.isPending               // submission in progress
form.isSuccess               // submission succeeded
form.isSubmitDisabled         // computed: name empty or pending or success
form.isDirty                 // any field changed
form.handleSubmit            // form onSubmit handler
form.designers               // live list (includes inline-created)
form.genres                  // live list (includes inline-created)
form.storageLocationsList    // live list
form.stitchingAppsList       // live list
form.handleAddDesigner       // inline creation callbacks
form.handleAddGenre
form.handleAddStorageLocation
form.handleAddStitchingApp
```

### localStorage Try/Catch Pattern
**Source:** `src/components/features/shopping/shopping-cart.tsx` (lines 28-38)
**Apply to:** `use-draft-persistence.ts`
```typescript
try {
  const stored = localStorage.getItem(KEY);
  if (!stored) return null;
  const parsed = JSON.parse(stored) as ExpectedType;
  // validate shape
  return parsed;
} catch {
  // localStorage may be unavailable
  return null;
}
```

### Test Setup Pattern (Client Component with Server Actions)
**Source:** `src/components/features/charts/chart-add-form.test.tsx` (lines 1-54)
**Apply to:** `chart-merged-form.test.tsx`
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateChart = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: (...args: unknown[]) => mockCreateChart(...args),
  updateChart: (...args: unknown[]) => vi.fn()(...args),
}));

// Mock all action modules used by useChartForm
vi.mock("@/lib/actions/designer-actions", () => ({ createDesigner: vi.fn() }));
vi.mock("@/lib/actions/genre-actions", () => ({ createGenre: vi.fn() }));
vi.mock("@/lib/actions/storage-location-actions", () => ({ createStorageLocation: vi.fn() }));
vi.mock("@/lib/actions/stitching-app-actions", () => ({ createStitchingApp: vi.fn() }));
vi.mock("@/lib/actions/upload-actions", () => ({ getPresignedUploadUrl: vi.fn() }));
```

### Test Setup Pattern (Hook with localStorage)
**Source:** `src/components/features/gallery/use-gallery-filters.test.ts` (lines 316-330)
**Apply to:** `use-draft-persistence.test.ts`
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@/__tests__/test-utils";

const DRAFT_KEY = "chart-draft";

beforeEach(() => {
  localStorage.clear();
});
```

### Icon Usage
**Source:** `src/components/features/charts/chart-add-form.tsx` (line 5)
**Apply to:** `pattern-type-cards.tsx` (Check icon), `chart-merged-form.tsx` (ArrowLeft)
```typescript
import { ArrowLeft, Check } from "lucide-react";
```

### cn Utility
**Source:** `src/lib/utils.ts`
**Apply to:** All new components
```typescript
import { cn } from "@/lib/utils";
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have strong analogs in the existing codebase |

Every new file has an exact or role-match analog. The milestone marker is a static JSX element within `chart-merged-form.tsx` with no behavioral analog needed (pure presentational, spec in UI-SPEC.md).

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/components/features/shopping/`, `src/components/features/gallery/`, `src/app/(dashboard)/charts/new/`
**Files scanned:** 35+ in charts directory, 10 in shopping, 5 in gallery
**Pattern extraction date:** 2026-05-10
