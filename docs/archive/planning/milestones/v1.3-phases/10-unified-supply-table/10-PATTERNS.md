# Phase 10: Unified Supply Table - Pattern Map

**Mapped:** 2026-05-03
**Files analyzed:** 20 new files
**Analogs found:** 14 / 20

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/supply-table/types.ts` | types | -- | `src/types/supply.ts` | exact |
| `src/components/features/supply-table/supply-table.tsx` | component | event-driven | `src/components/features/charts/project-supplies-tab.tsx` | exact |
| `src/components/features/supply-table/supply-table.test.tsx` | test | -- | `src/components/features/supplies/supply-table-view.test.tsx` | role-match |
| `src/components/features/supply-table/supply-table-add-row.tsx` | component | event-driven | `src/components/features/supplies/search-to-add.tsx` | role-match |
| `src/components/features/supply-table/supply-table-add-row.test.tsx` | test | -- | `src/components/features/supplies/search-to-add.test.tsx` | exact |
| `src/components/features/supply-table/supply-table-data-row.tsx` | component | event-driven | `project-supplies-tab.tsx` (SupplyRow, lines 101-198) | exact |
| `src/components/features/supply-table/supply-table-data-row.test.tsx` | test | -- | `src/components/features/supplies/supply-table-view.test.tsx` | role-match |
| `src/components/features/supply-table/supply-table-section-divider.tsx` | component | request-response | `project-supplies-tab.tsx` (SupplySection, lines 203-297) | role-match |
| `src/components/features/supply-table/supply-table-footer.tsx` | component | request-response | `project-supplies-tab.tsx` (kitting summary, lines 318-340) | role-match |
| `src/components/features/supply-table/portal-autocomplete.tsx` | component | event-driven | `src/components/features/supplies/search-to-add.tsx` | exact |
| `src/components/features/supply-table/portal-autocomplete.test.tsx` | test | -- | `src/components/features/supplies/search-to-add.test.tsx` | exact |
| `src/components/features/supply-table/status-donut.tsx` | component | transform | -- | no-analog |
| `src/components/features/supply-table/status-donut.test.tsx` | test | -- | -- | no-analog |
| `src/components/features/supply-table/segmented-type-toggle.tsx` | component | event-driven | -- | no-analog |
| `src/components/features/supply-table/segmented-type-toggle.test.tsx` | test | -- | -- | no-analog |
| `src/components/features/supply-table/inline-create-dialog.tsx` | component | event-driven | `src/components/features/supplies/supply-form-modal.tsx` | role-match |
| `src/components/features/supply-table/inline-create-dialog.test.tsx` | test | -- | `src/components/features/supplies/supply-form-modal.test.tsx` | role-match |
| `src/components/features/supply-table/editable-number.tsx` | component | event-driven | `project-supplies-tab.tsx` (EditableNumber, lines 40-97) | exact |
| `src/components/features/supply-table/editable-number.test.tsx` | test | -- | -- | no-analog |
| `src/components/features/supply-table/local-state-adapter.ts` | service | CRUD | -- | no-analog |
| `src/components/features/supply-table/local-state-adapter.test.ts` | test | -- | -- | no-analog |
| `src/components/features/supply-table/use-supply-table.ts` | hook | event-driven | -- | no-analog |
| `src/components/features/supply-table/use-supply-table.test.ts` | test | -- | -- | no-analog |
| `src/components/features/supply-table/index.ts` | config | -- | `src/__tests__/mocks/index.ts` | role-match |
| `src/app/globals.css` (modified) | config | -- | existing animation block (lines 237-279) | exact |

## Pattern Assignments

### `supply-table/types.ts` (types, definitions)

**Analog:** `src/types/supply.ts`

**Imports pattern** (lines 1-11):
```typescript
import type {
  SupplyBrand,
  Thread,
  Bead,
  SpecialtyItem,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  ColorFamily,
  SupplyType,
} from "@/generated/prisma/client";
```

**Type export pattern** (lines 25-37):
```typescript
export type ThreadWithBrand = Thread & { brand: SupplyBrand };
export type BeadWithBrand = Bead & { brand: SupplyBrand };
export type SpecialtyItemWithBrand = SpecialtyItem & { brand: SupplyBrand };

export type ProjectThreadWithThread = ProjectThread & { thread: ThreadWithBrand };
export type ProjectBeadWithBead = ProjectBead & { bead: BeadWithBrand };
export type ProjectSpecialtyWithItem = ProjectSpecialty & {
  specialtyItem: SpecialtyItemWithBrand;
};
```

**Note:** New file will define `SupplyTableAdapter` interface, `SupplyRow`, `SupplySearchResult`, `CalcParams`, `CreateSupplyData`, and `SupplyType` (re-exported as string union). Import the existing types from `@/types/supply` where they match, define new ones for the adapter pattern.

---

### `supply-table/supply-table.tsx` (root component, event-driven)

**Analog:** `src/components/features/charts/project-supplies-tab.tsx`

**Imports pattern** (lines 1-27):
```typescript
"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import {
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CircleDot,
  Gem,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";
```

**Props interface pattern** (lines 300-307):
```typescript
interface ProjectSuppliesTabProps {
  projectId: string;
  threads: ProjectThreadWithThread[];
  beads: ProjectBeadWithBead[];
  specialty: ProjectSpecialtyWithItem[];
}
```

**Section rendering with typed data** (lines 471-615):
```typescript
{/* Thread Section */}
<div className="relative">
  <SupplySection
    title="Thread"
    icon={CircleDot}
    count={threads.length}
    fulfilledCount={fulfilledThreads}
    defaultOpen
    onAddClick={() => setAddingType("thread")}
    addLabel="Add threads"
    emptyText="No threads linked to this project"
  >
    {threads.map((pt) => {
      const thread = pt.thread;
      // ... per-row rendering
    })}
  </SupplySection>
</div>
```

**Error handling pattern with useCallback + useTransition** (lines 348-414):
```typescript
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
```

---

### `supply-table/supply-table-data-row.tsx` (data row, event-driven)

**Analog:** `project-supplies-tab.tsx` SupplyRow (lines 101-198)

**Row component pattern** (lines 100-198):
```typescript
function SupplyRow({
  hex,
  code,
  name,
  brand,
  stitchCount,
  quantityRequired,
  quantityAcquired,
  isFulfilled,
  quantityNeeded,
  onUpdateRequired,
  onUpdateAcquired,
  onRemove,
}: { /* typed props */ }) {
  const isLight = needsBorder(hex);

  return (
    <div className="group border-border flex items-center gap-3 border-b py-3 last:border-b-0">
      {/* Swatch */}
      <div
        className={`h-7 w-7 shrink-0 rounded-full shadow-sm ${isLight ? "ring-border ring-1" : ""}`}
        style={{ backgroundColor: hex }}
      />
      {/* ... fields ... */}
      {/* Remove - hover-reveal pattern */}
      <button
        onClick={onRemove}
        className="flex w-5 shrink-0 justify-center opacity-40 transition-opacity group-hover:opacity-100 focus:opacity-100"
        title="Remove from project"
        aria-label={`Remove ${brand} ${code} from project`}
      >
        <Trash2
          className="text-muted-foreground hover:text-destructive h-3.5 w-3.5 transition-colors"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
```

**Key difference for new component:** New version uses `<tr>/<td>` instead of `<div>` flex layout. Uses `EditableNumber` component import. Uses `StatusDonut` instead of binary check/warning icons. Delete button uses `opacity-0 group-hover:opacity-100` (fully hidden, not 40% opacity).

---

### `supply-table/editable-number.tsx` (click-to-edit cell, event-driven)

**Analog:** `project-supplies-tab.tsx` EditableNumber (lines 40-97)

**Full component to copy** (lines 40-97):
```typescript
function EditableNumber({
  value,
  onSave,
  className,
}: {
  value: number;
  onSave: (value: number) => void;
  className?: string;
}) {
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
        onBlur={() => {
          const num = parseInt(draft);
          if (!isNaN(num) && num >= 0) onSave(num);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className="bg-card text-foreground border-primary focus:ring-primary/40 w-12 rounded border px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`hover:bg-muted cursor-text rounded px-1.5 py-0.5 transition-colors ${className ?? ""}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}
```

**Enhancements for new version:** Add `ariaLabel` prop for accessibility. Add revert-on-invalid (reset `draft` to `String(value)` when parseInt fails, matching RESEARCH.md pattern). Export as named export for reuse.

---

### `supply-table/portal-autocomplete.tsx` (portal dropdown, event-driven)

**Analog:** `src/components/features/supplies/search-to-add.tsx`

**Debounced search pattern** (lines 100-135):
```typescript
useEffect(() => {
  let cancelled = false;
  setIsLoading(true);
  setFetchError(false);

  async function fetchItems() {
    try {
      let results: SupplyItem[];
      if (supplyType === "thread") {
        results = await getThreads(undefined, colorFamily || undefined, search || undefined);
      } else if (supplyType === "bead") {
        results = await getBeads(search || undefined);
      } else {
        results = await getSpecialtyItems(search || undefined);
      }
      if (!cancelled) {
        setItems(results);
        setHighlightIndex(-1);
        setIsLoading(false);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("SearchToAdd fetch failed:", error);
        setFetchError(true);
        setIsLoading(false);
      }
    }
  }

  const timer = setTimeout(fetchItems, 150);
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [search, supplyType, colorFamily]);
```

**Keyboard navigation pattern** (lines 208-234):
```typescript
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setHighlightIndex((prev) => {
      if (prev < 0) {
        for (let i = 0; i < displayItems.length; i++) {
          if (!existingSet.has(getItemId(displayItems[i]))) return i;
        }
        return 0;
      }
      return findNextAddableIndex(prev, 1);
    });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setHighlightIndex((prev) => {
      if (prev < 0) return prev;
      return findNextAddableIndex(prev, -1);
    });
  } else if (e.key === "Enter" && highlightIndex >= 0 && displayItems[highlightIndex]) {
    e.preventDefault();
    if (!existingSet.has(getItemId(displayItems[highlightIndex]))) {
      handleSelect(displayItems[highlightIndex]);
    }
  }
}
```

**Already-added items pattern** (lines 152-156, 308-344):
```typescript
const existingSet = new Set(existingIds);
const addable = items.filter((item) => !existingSet.has(getItemId(item)));
const alreadyAdded = items.filter((item) => existingSet.has(getItemId(item)));
const displayItems = [...addable, ...alreadyAdded].slice(0, 8);

// ... in render:
<button
  key={getItemId(item)}
  onClick={() => !isExisting && handleSelect(item)}
  disabled={isExisting || isPending}
  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
    isExisting
      ? "cursor-default opacity-50"
      : `hover:bg-muted ${highlightIndex >= 0 && index === highlightIndex ? "bg-muted" : ""}`
  }`}
>
```

**Key differences for new version:** Uses `position: fixed` + `getBoundingClientRect()` + `createPortal(el, document.body)` instead of `position: absolute`. No color family filter (D-04). Search calls `adapter.searchSupplies()` instead of server actions directly. Includes "+ Create X" inline create option (D-02).

---

### `supply-table/inline-create-dialog.tsx` (dialog form, event-driven)

**Analog:** `src/components/features/supplies/supply-form-modal.tsx`

**Dialog usage pattern** (from `src/components/ui/dialog.tsx` exports):
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
```

**Dialog structure pattern:**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Thread</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    {/* form fields */}
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={handleCreate}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### `supply-table/supply-table-section-divider.tsx` (section header)

**Analog:** `project-supplies-tab.tsx` SupplySection header (lines 228-257)

**Section header pattern** (lines 228-257):
```typescript
<button
  onClick={() => setIsOpen(!isOpen)}
  className="hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-3.5 transition-colors"
>
  <Icon className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
  <h3 className="font-heading text-foreground flex-1 text-left text-sm font-semibold">
    {title}
  </h3>
  <span className="flex items-center gap-2 text-xs">
    {count === 0 ? (
      <span className="text-muted-foreground">None</span>
    ) : /* ... count badge */ }
  </span>
</button>
```

**Key difference for new version:** Not a button (not collapsible). Uses `<tr><td colSpan={7}>` for table context. Different visual treatment from RESEARCH.md code examples (11px uppercase tracking, count pill with `bg-muted rounded-full`). Hidden when count is 0.

---

### `supply-table/supply-table-footer.tsx` (footer row)

**Analog:** `project-supplies-tab.tsx` kitting summary (lines 318-340)

**Summary calculation pattern** (lines 318-340):
```typescript
const totalItems = threads.length + beads.length + specialty.length;
const fulfilledThreads = threads.filter(
  (pt) => pt.quantityAcquired >= pt.quantityRequired,
).length;
// ... same for beads, specialty
const fulfilledTotal = fulfilledThreads + fulfilledBeads + fulfilledSpecialty;
```

---

## Shared Patterns

### Client Component "use client" Declaration
**Source:** `src/components/features/charts/project-supplies-tab.tsx` line 1
**Apply to:** `supply-table.tsx`, `supply-table-add-row.tsx`, `supply-table-data-row.tsx`, `portal-autocomplete.tsx`, `segmented-type-toggle.tsx`, `inline-create-dialog.tsx`, `editable-number.tsx`
```typescript
"use client";
```
**Do NOT apply to:** `types.ts`, `status-donut.tsx` (pure SVG, server-compatible), `local-state-adapter.ts`, `index.ts`, `supply-table-section-divider.tsx`, `supply-table-footer.tsx`

### Import Pattern for Test Files
**Source:** `src/components/features/supplies/search-to-add.test.tsx` lines 1-5
**Apply to:** All test files in `supply-table/`
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@/__tests__/test-utils";
import { createMockSupplyBrand, createMockThread } from "@/__tests__/mocks";
```

### Mock Setup Pattern (vi.mock for sonner)
**Source:** `src/components/features/supplies/search-to-add.test.tsx` lines 25-30
**Apply to:** All test files that render components using `toast`
```typescript
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
```

### Test Factory Usage
**Source:** `src/__tests__/mocks/factories.ts` lines 183-278
**Apply to:** All test files needing supply data
```typescript
import {
  createMockSupplyBrand,
  createMockThread,
  createMockBead,
  createMockSpecialtyItem,
  createMockProjectThread,
  createMockProjectBead,
  createMockProjectSpecialty,
} from "@/__tests__/mocks";

const dmcBrand = createMockSupplyBrand({ id: "brand-dmc", name: "DMC" });

const threadA: ThreadWithBrand = {
  ...createMockThread({ id: "t-1", colorCode: "310", colorName: "Black", hexColor: "#000000" }),
  brand: dmcBrand,
};
```

### ColorSwatch Reuse
**Source:** `src/components/features/supplies/color-swatch.tsx` lines 1-45
**Apply to:** `supply-table-data-row.tsx`, `portal-autocomplete.tsx`
```typescript
import { ColorSwatch } from "@/components/features/supplies/color-swatch";

// Usage:
<ColorSwatch hexColor={row.hexColor} size="sm" />
```

### needsBorder Duplication (Acceptable Debt per D-11)
**Source:** `src/components/features/supplies/color-swatch.tsx` lines 5-11
**Apply to:** Any file needing inline border detection without importing ColorSwatch
```typescript
function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.85;
}
```

### Skein Calculator Integration
**Source:** `src/lib/utils/skein-calculator.ts` lines 22-37
**Apply to:** `supply-table-add-row.tsx`, `use-supply-table.ts`
```typescript
import { calculateSkeins } from "@/lib/utils/skein-calculator";

// Usage with CalcParams defaults:
const need = calculateSkeins({
  stitchCount,
  strandCount: calcParams.strandCount ?? 2,
  fabricCount: calcParams.fabricCount ?? 14,
  overCount: calcParams.overCount ?? 1,
  wastePercent: calcParams.wastePercent ?? 20,
});
```

### Icon Imports from lucide-react
**Source:** `project-supplies-tab.tsx` lines 3-14
**Apply to:** Multiple supply-table components
```typescript
import {
  Trash2,       // delete button
  CircleDot,    // thread section icon
  Gem,          // bead section icon
  Sparkles,     // specialty section + auto-calc indicator
  Plus,         // add/create buttons
} from "lucide-react";
```

### Toast Error Handling
**Source:** `project-supplies-tab.tsx` lines 348-361
**Apply to:** All adapter-calling components
```typescript
import { toast } from "sonner";

// Pattern: try/catch + result.success check
try {
  const result = await adapter.remove(type, junctionId);
  if (result.success) {
    toast.success(`Removed ${code} from project`);
  } else {
    toast.error(result.error ?? "Something went wrong. Please try again.");
  }
} catch {
  toast.error("Something went wrong. Please try again.");
}
```

### EmptyState Component Reuse
**Source:** `src/components/ui/empty-state.tsx` lines 1-34
**Apply to:** `supply-table.tsx` (when no supplies exist)
```typescript
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

<EmptyState
  icon={Package}
  title="No supplies added yet"
  description="Start by adding threads, beads, or specialty items"
/>
```

### Animation CSS Pattern (globals.css)
**Source:** `src/app/globals.css` lines 237-279
**Apply to:** `src/app/globals.css` (modified -- add slideIn animation)
```css
/* Existing pattern to follow: */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.animate-skeleton-pulse {
  animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* New animation follows same pattern: */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.2s ease;
}

/* Add to existing reduced-motion block at line 270: */
@media (prefers-reduced-motion: reduce) {
  .animate-skeleton-pulse,
  .animate-shake,
  .animate-slide-in {
    animation: none;
  }
  /* ... */
}
```

### Tooltip Usage for Donut Hover
**Source:** `src/components/ui/tooltip.tsx` lines 1-54
**Apply to:** `supply-table-data-row.tsx` (wrapping StatusDonut)
```typescript
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Usage:
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <StatusDonut have={row.have} need={row.need} />
    </TooltipTrigger>
    <TooltipContent>{row.have} of {row.need}</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Dialog Component Usage
**Source:** `src/components/ui/dialog.tsx` lines 133-144
**Apply to:** `inline-create-dialog.tsx`
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
```

### Zod Validation Schemas for Supply Input
**Source:** `src/lib/validations/supply.ts` lines 101-132
**Apply to:** `inline-create-dialog.tsx` (validation before adapter.createSupply)
```typescript
// Existing schemas to reference (not import directly -- adapter validates):
export const createAndAddThreadSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  colorCode: z.string().trim().max(20).optional().default(""),
  hexColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#808080"),
  brandId: z.string().min(1, "Brand is required"),
  colorFamily: z.enum(COLOR_FAMILIES).optional().default("NEUTRAL"),
});
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `status-donut.tsx` | component | transform | No SVG rendering components exist in codebase; use RESEARCH.md Pattern 3 (SVG donut ring calculation) |
| `status-donut.test.tsx` | test | -- | No SVG component tests exist; test stroke-dasharray math and three states (empty/partial/complete) |
| `segmented-type-toggle.tsx` | component | event-driven | No toggle/radiogroup components exist in codebase; build with `role="radiogroup"` + `role="radio"` + `aria-checked` |
| `segmented-type-toggle.test.tsx` | test | -- | Test ARIA roles, sticky state, visual selection indicator |
| `editable-number.test.tsx` | test | -- | EditableNumber existed but had no tests; write tests for edit/save/cancel/blur/Escape/Enter flows |
| `local-state-adapter.ts` | service | CRUD | No adapter/strategy pattern exists in codebase; use RESEARCH.md Pattern 1 (adapter interface) with constructor params for initial data |
| `local-state-adapter.test.ts` | test | -- | Contract tests for adapter interface methods; verify add/update/remove/search/create |
| `use-supply-table.ts` | hook | event-driven | No custom hooks exist in features/; use RESEARCH.md Pattern 5 (keyboard flow state machine) for add-row state management |
| `use-supply-table.test.ts` | test | -- | Test hook with `renderHook` from `@/__tests__/test-utils`; verify state transitions and adapter calls |

## Metadata

**Analog search scope:** `src/components/features/`, `src/components/ui/`, `src/types/`, `src/lib/`, `src/__tests__/`, `src/app/`
**Files scanned:** 35+
**Pattern extraction date:** 2026-05-03
