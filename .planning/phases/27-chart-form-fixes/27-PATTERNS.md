# Phase 27: Chart Form Fixes - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 11 (files to modify/create)
**Analogs found:** 11 / 11

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/charts/chart-merged-form.tsx` | component | request-response | self (storage location dialog wiring, lines 166-169 + 567-580) | exact |
| `src/components/features/charts/chart-merged-form.test.tsx` | test | N/A | self (existing test file) | exact |
| `src/components/features/charts/use-chart-form.ts` | hook | request-response | self (handleAddDesigner already exists, line 325) | exact |
| `src/components/features/charts/use-chart-form.test.tsx` | test | N/A | self (existing test file) | exact |
| `src/components/features/charts/form-primitives/searchable-select.tsx` | component | event-driven | self (focus/popover management) | exact |
| `src/components/features/charts/form-primitives/searchable-select.test.tsx` | test | N/A | self (existing test file) | exact |
| `src/components/features/charts/form-primitives/stitch-count-fields.tsx` | component | transform | self (existing hint rendering pattern, lines 41-43 + 97-109) | exact |
| `src/components/features/supply-table/supply-table.tsx` | component | CRUD | self (column width configuration, lines 166-182) | exact |
| `src/components/features/supply-table/supply-table-data-row.tsx` | component | CRUD | self (Need column rendering, lines 78-89) | exact |
| `src/components/features/designers/designer-detail.tsx` | component | request-response | self (ChartRow thumbnail rendering, lines 301-315) | exact |
| `src/lib/actions/designer-actions.ts` | service | CRUD | self (getDesigner query, lines 93-131) | exact |

## Pattern Assignments

### `src/components/features/charts/chart-merged-form.tsx` (component, request-response)

**BUG-01: Wire InlineDesignerDialog — copy storage location dialog pattern**

**Analog:** Self — storage location inline dialog wiring (lines 166-169)

**State declaration pattern** (lines 166-169):
```typescript
const [storageDialogOpen, setStorageDialogOpen] = useState(false);
const [storageDialogName, setStorageDialogName] = useState("");
const [appDialogOpen, setAppDialogOpen] = useState(false);
const [appDialogName, setAppDialogName] = useState("");
```
New code should add two more `useState` vars following this exact pattern:
```typescript
const [designerDialogOpen, setDesignerDialogOpen] = useState(false);
const [designerDialogName, setDesignerDialogName] = useState("");
```

**SearchableSelect + dialog JSX pattern** (lines 562-601):
```tsx
<FormField label="Storage Location" htmlFor="storage-location">
  <SearchableSelect
    options={storageOptions}
    value={form.values.storageLocationId}
    onChange={(v) => form.setField("storageLocationId", v)}
    onAddNew={(searchTerm) => {
      setStorageDialogName(searchTerm);
      setStorageDialogOpen(true);
    }}
    placeholder="Select storage location..."
  />
  <InlineNameDialog
    open={storageDialogOpen}
    onOpenChange={setStorageDialogOpen}
    title="Add Storage Location"
    initialName={storageDialogName}
    placeholder="e.g. Project Bin A"
    onSubmit={form.handleAddStorageLocation}
  />
</FormField>
```
The Designer field (line 466-474) should follow this same pattern but use `InlineDesignerDialog` instead of `InlineNameDialog`, passing `form.handleAddDesigner` as onSubmit.

**Current Designer field wiring to replace** (lines 466-474):
```tsx
<FormField label="Designer" htmlFor="designer">
  <SearchableSelect
    options={designerOptions}
    value={form.values.designerId}
    onChange={(v) => form.setField("designerId", v)}
    onAddNew={(searchTerm) => void form.handleAddDesigner(searchTerm)}
    placeholder="Select designer..."
  />
</FormField>
```
Change `onAddNew` to open the dialog (like storage location) instead of calling handler directly.

**Import pattern** — add `InlineDesignerDialog`:
```typescript
import { InlineDesignerDialog } from "./inline-designer-dialog";
```
(This import does not currently exist in chart-merged-form.tsx)

---

### `src/components/features/charts/inline-designer-dialog.tsx` (component, event-driven)

**No modifications needed.** This component already fully supports controlled mode via `open`/`onOpenChange`/`initialName` props (lines 16-22). The BUG-01 fix is purely about wiring in chart-merged-form.tsx.

**Controlled dialog interface** (lines 16-22):
```typescript
interface InlineDesignerDialogProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialName?: string;
  onSubmit: (name: string, website?: string) => Promise<void>;
}
```

---

### `src/components/features/charts/use-chart-form.ts` (hook, request-response)

**No modifications needed for BUG-01.** `handleAddDesigner` (lines 325-343) already accepts `(name: string, website?: string)` which matches `InlineDesignerDialog.onSubmit` signature.

**Existing handler** (lines 325-343):
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

---

### `src/components/features/charts/form-primitives/searchable-select.tsx` (component, event-driven)

**BUG-02: Tab focus fix**

**Analog:** Self — current Popover/Command wiring (lines 47-108)

**Current focus structure** (lines 47-67):
```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-controls={open ? listboxId : undefined}
    disabled={disabled}
    className={cn(
      "border-border bg-background flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
      "focus:border-primary focus:ring-ring focus:ring-2 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      !selectedLabel && "text-muted-foreground",
    )}
  >
    <span className="truncate">{selectedLabel ?? placeholder}</span>
    <ChevronDown className="text-muted-foreground ml-2 size-4 shrink-0" />
  </PopoverTrigger>
  <PopoverContent className="w-(--anchor-width) p-0" align="start" sideOffset={4}>
    <Command>
      <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
```
Fix needs to ensure that when `PopoverTrigger` receives focus (tab navigation) and the user starts typing, the Popover opens and `CommandInput` receives focus. This is likely handled by adding an `onKeyDown` handler to `PopoverTrigger` that opens the popover on printable key input, or by using `onOpenChange` to auto-focus the CommandInput.

---

### `src/components/features/charts/form-primitives/stitch-count-fields.tsx` (component, transform)

**BUG-05: Add supply stitch total hint**

**Analog:** Self — existing hint text pattern (lines 41-43) and size category display (lines 97-109)

**Existing hint pattern** (lines 41-43):
```typescript
const hint = isAutoCalculated
  ? `Auto-calculated from ${stitchesWide.toLocaleString()} x ${stitchesHigh.toLocaleString()}. Clear to enter an exact count.`
  : "Leave empty to auto-calculate from dimensions";
```

**Existing badge rendering below stitch count** (lines 97-109):
```tsx
{effectiveCount > 0 && sizeCategory && (
  <div className="mt-2 flex items-center gap-2">
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${SIZE_COLORS[sizeCategory].bg} ${SIZE_COLORS[sizeCategory].text}`}
    >
      {sizeCategory}
    </span>
    {isAutoCalculated && (
      <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
        Auto-calculated
      </span>
    )}
  </div>
)}
```

New supply total hint should be placed below this block. Props interface needs a new `supplyStitchTotal?: number` prop. Display pattern per UI-SPEC:
```tsx
{supplyStitchTotal > 0 && (
  <p className="text-muted-foreground mt-1.5 text-xs">
    Supply total: {supplyStitchTotal.toLocaleString()} stitches
  </p>
)}
```

**FormField hint/aria pattern** (from form-field.tsx lines 1-49):
```tsx
// hint prop renders as:
<p id={hintId} className="text-muted-foreground/70 mt-1 text-xs">{hint}</p>

// For aria-describedby linkage, the stitch-count input (line 91-95) uses:
aria-describedby={
  [errors?.stitchCount && "stitch-count-error", "stitch-count-hint"]
    .filter(Boolean)
    .join(" ") || undefined
}
```
Supply hint should get an id (e.g. `stitch-count-supply-hint`) and be added to `aria-describedby` list.

---

### `src/components/features/supply-table/supply-table.tsx` (component, CRUD)

**BUG-06: Widen Need column**

**Analog:** Self — column width configuration (lines 166-182)

**Current column widths** (lines 166-182):
```tsx
<th scope="col" style={{ width: "44%" }} className={HEADER_CLASS}>
  Colour
</th>
<th scope="col" style={{ width: "14%" }} className={HEADER_CLASS}>
  Stitches
</th>
<th scope="col" style={{ width: "24px" }} className={HEADER_CLASS} />
<th scope="col" style={{ width: "13%" }} className={HEADER_CLASS}>
  Need
</th>
<th scope="col" style={{ width: "10%" }} className={HEADER_CLASS}>
  Have
</th>
<th scope="col" style={{ width: "6%" }} className={HEADER_CLASS}>
  Status
</th>
<th scope="col" style={{ width: "32px" }} className={HEADER_CLASS} />
```
Change: Colour from `"44%"` to `"41%"`, Need from `"13%"` to `"16%"`. All other columns unchanged.

---

### `src/components/features/supply-table/supply-table-data-row.tsx` (component, CRUD)

**BUG-06: No code changes needed** — the Need column rendering (lines 78-89) will automatically benefit from the parent table's wider column width. The content already uses `flex items-center gap-1` layout that will expand to fill available space.

**Current Need column** (lines 78-89):
```tsx
<td className="border-muted border-b px-3 py-[5px] [font-variant-numeric:tabular-nums]">
  <div className="flex items-center gap-1">
    <EditableNumber
      value={row.need}
      onSave={(v) => onUpdateQuantity(row.type, row.id, "need", v)}
      ariaLabel={`Need for ${row.code}`}
    />
    <span className="text-muted-foreground text-xs">{UNIT_LABELS[row.type]}</span>
    {showAutoCalc && (
      <Sparkles className="text-primary inline h-3 w-3" data-testid="auto-calc-indicator" />
    )}
  </div>
</td>
```

---

### `src/components/features/designers/designer-detail.tsx` (component, request-response)

**BUG-04: Designer detail thumbnails**

**Analog:** Self — ChartRow thumbnail rendering (lines 301-315)

**Current thumbnail rendering** (lines 301-315):
```tsx
{chart.coverThumbnailUrl ? (
  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={chart.coverThumbnailUrl}
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
```
The rendering code looks correct. Bug investigation needs to focus on the data layer — either the query is returning wrong thumbnails or the URLs are stale/mismatched.

---

### `src/lib/actions/designer-actions.ts` (service, CRUD)

**BUG-04: Designer query investigation**

**Analog:** Self — getDesigner query (lines 93-131)

**Current query** (lines 96-114):
```typescript
const designer = await prisma.designer.findUnique({
  where: { id },
  include: {
    charts: {
      select: {
        id: true,
        name: true,
        coverThumbnailUrl: true,
        focalPointX: true,
        focalPointY: true,
        stitchCount: true,
        stitchesWide: true,
        stitchesHigh: true,
        project: { select: { status: true, stitchesCompleted: true } },
        genres: { select: { name: true } },
      },
    },
  },
});
```

**Data mapping** (lines 118-130):
```typescript
const charts = designer.charts.map((c) => ({
  id: c.id,
  name: c.name,
  coverThumbnailUrl: c.coverThumbnailUrl,
  focalPointX: c.focalPointX,
  focalPointY: c.focalPointY,
  stitchCount: c.stitchCount,
  stitchesWide: c.stitchesWide,
  stitchesHigh: c.stitchesHigh,
  status: c.project?.status ?? null,
  stitchesCompleted: c.project?.stitchesCompleted ?? 0,
  genres: c.genres,
}));
```
Query correctly selects `coverThumbnailUrl` from the `charts` relation. Debug approach: verify data in database matches what's rendered. Could be a thumbnail generation race (cover uploaded but thumbnail not yet generated).

---

## Shared Patterns

### Test Infrastructure
**Source:** All existing test files
**Apply to:** All test files in this phase

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
```

### Mock Factories
**Source:** `src/__tests__/mocks/factories.ts`
**Apply to:** designer-detail tests, chart-merged-form tests

```typescript
import { createMockDesignerChart } from "@/__tests__/mocks";

// Usage:
createMockDesignerChart({
  id: "c1",
  name: "Test Chart",
  coverThumbnailUrl: "https://example.com/thumb.jpg",
  // ...overrides
});
```

### Navigation Mocks
**Source:** `src/components/features/designers/designer-detail.test.tsx` (lines 16-18)
**Apply to:** Any test involving router navigation

```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
```

### Toast Mocks
**Source:** `src/components/features/designers/designer-detail.test.tsx` (lines 20-22)
**Apply to:** Any test involving toast notifications

```typescript
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

### Command/Popover Mocks for SearchableSelect Tests
**Source:** `src/components/features/charts/form-primitives/searchable-select.test.tsx` (lines 7-54)
**Apply to:** Tests that render SearchableSelect

Extensive mocks replace cmdk and popover with simplified DOM elements. See file for full mock implementations.

### Inline Dialog Controlled Pattern
**Source:** `src/components/features/charts/inline-name-dialog.tsx` (lines 24-109) and `src/components/features/charts/inline-designer-dialog.tsx` (lines 24-125)
**Apply to:** BUG-01 wiring

Both dialogs follow identical patterns:
1. Controlled `open`/`onOpenChange` props
2. `initialName` synced on open via `prevOpenRef` pattern
3. `reset()` on close
4. `handleSubmit` with trim validation, pending state, error handling
5. Dialog as JSX sibling to trigger (not nested inside form)

### FormField Hint Text
**Source:** `src/components/features/charts/form-primitives/form-field.tsx` (lines 38-47)
**Apply to:** BUG-05 supply total hint

```tsx
// Hints render below the field children with mt-1 spacing:
{error ? (
  <p id={errorId} role="alert" className="text-destructive mt-1 text-xs">{error}</p>
) : hint ? (
  <p id={hintId} className="text-muted-foreground/70 mt-1 text-xs">{hint}</p>
) : null}
```
The supply hint in stitch-count-fields.tsx should be placed **after** the FormField's children (inside the `<FormField>` or after the size badge block) using the same `text-xs text-muted-foreground` classes from the UI-SPEC.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | All 5 bugs modify existing files with clear self-analogs |

## Metadata

**Analog search scope:** `src/components/features/charts/`, `src/components/features/supply-table/`, `src/components/features/designers/`, `src/lib/actions/`, `src/__tests__/mocks/`
**Files scanned:** 35+
**Pattern extraction date:** 2026-05-20
