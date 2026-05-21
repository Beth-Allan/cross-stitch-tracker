# Phase 26: UX Polish - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 18 modified + 1 new
**Analogs found:** 18 / 19

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/features/designers/designer-list.tsx` | component | request-response | Self (existing code) | exact |
| `src/components/features/genres/genre-list.tsx` | component | request-response | `designer-list.tsx` (sibling) | exact |
| `src/components/features/gallery/gallery-card.tsx` | component | request-response | Self (existing code) | exact |
| `src/components/features/supply-table/editable-number.tsx` | component | event-driven | `charts/editable-number.tsx` (sibling variant) | exact |
| `src/components/features/charts/editable-number.tsx` | component | event-driven | `supply-table/editable-number.tsx` (sibling variant) | exact |
| `src/components/features/charts/whats-next-tab.tsx` | component | request-response | `gallery/gallery-card.tsx` (styling reference) | role-match |
| `src/components/features/shopping/shopping-for-bar.tsx` | component | event-driven | Self (existing code) | exact |
| `src/components/features/supply-table/portal-autocomplete.tsx` | component | event-driven | Self (existing code) | exact |
| `src/components/features/supply-table/use-supply-table.ts` | hook | event-driven | Self (existing code) | exact |
| `src/components/features/supply-table/supply-table-add-row.tsx` | component | event-driven | Self (existing code) | exact |
| `src/components/features/supply-table/inline-create-dialog.tsx` | component | event-driven | Self (existing code) | exact |
| `src/components/features/charts/project-detail/focal-point-editor.tsx` | component | event-driven | Self (existing code, refactor) | exact |
| `src/components/features/charts/project-detail/focal-point-click-area.tsx` | component | event-driven | `focal-point-editor.tsx` (extracted from) | exact |
| `src/components/features/charts/project-detail/hero-cover-banner.tsx` | component | request-response | Self (existing code) | exact |
| `src/components/features/charts/form-primitives/cover-image-upload.tsx` | component | event-driven | Self (existing code) | exact |
| `src/components/features/dashboard/bucket-project-row.tsx` | component | request-response | `gallery/gallery-card.tsx` (focal point pattern) | role-match |
| `src/components/features/stats/thread-insight-list.tsx` | component | request-response | `stats/designer-insight-list.tsx` | exact |
| `src/types/dashboard.ts` | type | N/A | Self (existing type, extends pattern) | exact |
| `src/lib/actions/project-dashboard-actions.ts` | service | CRUD | Self (existing query extension) | exact |

## Pattern Assignments

### `src/components/features/designers/designer-list.tsx` (component, ARIA enhancement)

**Analog:** Self + WAI-ARIA group pattern

**Current DesignerRow structure** (lines 324-382) -- add `role="group"` + `aria-labelledby`:
```typescript
function DesignerRow({
  designer,
  onEdit,
  onDelete,
}: {
  designer: DesignerWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/designers/${designer.id}`}
          className="text-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          {designer.name}
        </Link>
      </td>
      {/* ... cells ... */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-40 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label={`Edit ${designer.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${designer.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
```

**Modification pattern:** Add `role="group"` and `aria-labelledby` to `<tr>`, add `id` to the name `<Link>`. Action buttons already have `aria-label`s (lines 367, 375).

**Current DesignerCard structure** (lines 387-442) -- same ARIA pattern for mobile:
```typescript
function DesignerCard({ designer, onEdit, onDelete }) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link href={`/designers/${designer.id}`} /* ... */ >
            {designer.name}
          </Link>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {/* buttons already have aria-labels */}
        </div>
      </div>
    </div>
  );
}
```

---

### `src/components/features/genres/genre-list.tsx` (component, ARIA enhancement)

**Analog:** `src/components/features/designers/designer-list.tsx` -- identical structure

**GenreRow** (lines 67-111) -- same pattern as DesignerRow. Already has `aria-label` on buttons (lines 94, 101). Needs `role="group"` + `aria-labelledby` on `<tr>` and `id` on name `<Link>`.

**GenreCard** (lines 115-159) -- same pattern as DesignerCard. Already has `aria-label` on buttons (lines 141, 149). Needs `role="group"` + `aria-labelledby` on outer `<div>` and `id` on name `<Link>`.

---

### `src/components/features/gallery/gallery-card.tsx` (component, link target extension)

**Analog:** Self

**Current image + name structure** (lines 164-243):
```typescript
export function GalleryCard({ card }: GalleryCardProps) {
  return (
    <div className={`group bg-card hover:shadow-foreground/8 flex flex-col ...`}>
      {/* Cover image area -- NOT wrapped in Link */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasRealImage ? (
          <Image
            src={card.coverImageUrl!}
            alt={card.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] ..."
            style={getObjectPositionStyle(card.focalPointX, card.focalPointY)}
            onError={() => setImgFailed(true)}
            unoptimized
          />
        ) : (
          <CoverPlaceholder status={card.status} />
        )}
        {/* badges ... */}
      </div>

      {/* Card body */}
      <div className="bg-card flex flex-1 flex-col gap-1.5 p-4">
        {/* Project name link -- ONLY this is clickable */}
        <Link href={`/charts/${card.chartId}`} className="font-heading ...">
          {card.name}
        </Link>
        {/* ... */}
      </div>
    </div>
  );
}
```

**Modification pattern:** Wrap the image `<div>` in a `<Link>` (D-02). No nested interactives since gallery cards have no action buttons. The `<Link>` in the body can remain as-is or be converted to a `<span>` within the body's text area to avoid duplicate link targets.

---

### `src/components/features/supply-table/editable-number.tsx` (component, rejection flash)

**Analog:** Self

**Current rejection behavior** (lines 59-66) -- silently reverts on invalid:
```typescript
onBlur={() => {
  const num = parseInt(draft);
  if (!isNaN(num) && num >= 0) {
    setOptimistic(num);
    onSave(num);
  } else {
    setDraft(String(displayValue));
  }
  setEditing(false);
}}
```

**Current read-mode button** (lines 82-94):
```typescript
<button
  onClick={() => {
    setDraft(String(displayValue));
    setEditing(true);
  }}
  className={`hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5 [font-variant-numeric:tabular-nums] transition-colors ${className ?? ""}`}
  title="Click to edit"
  aria-label={ariaLabel}
>
  {displayValue}
</button>
```

**Modification pattern (D-05):** Add `showRejection` state (`useState(false)`), set true in the else branch with `setTimeout(() => setShowRejection(false), 600)`, apply `border-destructive animate-shake border` to the read-mode button when `showRejection` is true. Use existing `animate-shake` from `globals.css`.

---

### `src/components/features/charts/editable-number.tsx` (component, rejection flash)

**Analog:** `src/components/features/supply-table/editable-number.tsx` -- same pattern

**Current rejection behavior** (lines 46-52):
```typescript
onBlur={() => {
  const num = parseInt(draft);
  if (!isNaN(num) && num >= min && (max === undefined || num <= max)) {
    onSave(num);
  }
  setEditing(false);
}}
```

**Current read-mode button** (lines 65-76):
```typescript
<button
  onClick={() => {
    setDraft(String(value));
    setEditing(true);
  }}
  className={`hover:bg-muted min-h-11 min-w-11 cursor-text rounded px-1.5 py-0.5 font-mono tabular-nums transition-colors ${className ?? ""}`}
  title="Click to edit"
>
  {formatDisplay ? formatDisplay(value) : value}
</button>
```

**Modification pattern:** Identical to supply-table variant. Add `showRejection` state + `animate-shake border-destructive` flash.

---

### `src/components/features/supply-table/portal-autocomplete.tsx` (component, keyboard-gated highlight)

**Analog:** Self

**Current highlight rendering** (lines 102-113):
```typescript
displayItems.map((item, index) => {
  const disabled = isDisabled(item);
  const highlighted = index === highlightIndex;
  const itemId = `portal-autocomplete-item-${item.id}`;
  return (
    <div
      key={item.id}
      id={itemId}
      role="option"
      aria-selected={highlighted}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted || undefined}
      /* ... */
      className={`... ${highlighted ? "bg-muted" : ""}`}
    >
```

**Modification pattern (UX-01):** Accept new `hasUsedArrowKeys` prop. Gate `highlighted` as `const highlighted = hasUsedArrowKeys && index === highlightIndex`. Also gate `aria-selected` on `hasUsedArrowKeys`.

---

### `src/components/features/supply-table/use-supply-table.ts` (hook, keyboard tracking)

**Analog:** Self

**Current moveHighlight** (lines 103-123):
```typescript
const moveHighlight = useCallback(
  (direction: 1 | -1, displayItems: SupplySearchResult[], existingIds: Set<string>) => {
    setHighlightIndex((prev) => {
      if (direction === 1 && prev < 0) {
        for (let i = 0; i < displayItems.length; i++) {
          if (!existingIds.has(displayItems[i].id)) return i;
        }
        return prev;
      }
      // ...
    });
  },
  [],
);
```

**Current reset on search change** (lines 98-101):
```typescript
useEffect(() => {
  setHighlightIndex(-1);
}, [searchResults]);
```

**Modification pattern (UX-01):** Add `hasUsedArrowKeys` state (`useState(false)`). Set `true` inside `moveHighlight`. Reset to `false` in the `searchResults` useEffect. Export from hook.

---

### `src/components/features/supply-table/supply-table-add-row.tsx` (component, commit button + aria-activedescendant)

**Analog:** Self

**Current aria-activedescendant** (lines 207-212):
```typescript
aria-activedescendant={
  highlightIndex >= 0 && displayItems[highlightIndex]
    ? `portal-autocomplete-item-${displayItems[highlightIndex].id}`
    : undefined
}
```

**Modification pattern (UX-01):** Gate `aria-activedescendant` on `hasUsedArrowKeys && highlightIndex >= 0`. Destructure `hasUsedArrowKeys` from `useSupplyTable()`.

**Commit button pattern (UX-07):** Add a visible Check icon button in the add row, visible when `selectedItem` is truthy. Use `lucide-react` Check icon (already available in the project).

**Button pattern from project** -- icon-only button styling:
```typescript
// From designer-list.tsx lines 363-370
<button
  type="button"
  onClick={onEdit}
  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
  aria-label={`Edit ${designer.name}`}
>
  <Pencil className="h-3.5 w-3.5" />
</button>
```

---

### `src/components/features/supply-table/inline-create-dialog.tsx` (component, contextual labels)

**Analog:** Self

**Current generic labels** (lines 61-69):
```typescript
const typeLabel =
  supplyType === "THREAD" ? "thread" : supplyType === "BEAD" ? "bead" : "specialty item";

return (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Create Supply</DialogTitle>
        <DialogDescription>Create a new {typeLabel} and add it to the table.</DialogDescription>
      </DialogHeader>
```

**Current field labels** (lines 74-78, 100-105):
```typescript
<label htmlFor="inline-create-name" className="text-foreground mb-1 block text-sm font-medium">
  Name
</label>
// ...
<label htmlFor="inline-create-code" className="text-foreground mb-1 block text-sm font-medium">
  Code
</label>
```

**Modification pattern (UX-08):** Add a `LABEL_MAP` keyed by `SupplyType` with `title`, `nameLabel`, `namePlaceholder`, `codeLabel`, `codePlaceholder`. Replace static strings with lookups from the map.

---

### `src/components/features/charts/project-detail/focal-point-editor.tsx` (component, refactor split)

**Analog:** Self

**Current action bar** (lines 162-179) -- `absolute bottom-0` blocks image clicks:
```typescript
{isEditMode && (
  <div className="border-border bg-card/90 animate-in slide-in-from-bottom-1 absolute right-0 bottom-0 left-0 z-20 mt-2 flex items-center gap-2 rounded-b-lg border-t p-2 backdrop-blur-sm duration-200">
    <Button size="sm" onClick={handleSave} disabled={isPending || !pendingPoint}>
      {isPending ? "Saving..." : "Save"}
    </Button>
    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
      Cancel
    </Button>
    <Button size="sm" variant="ghost" onClick={handleReset} disabled={isPending} className="ml-auto">
      Reset to Center
    </Button>
  </div>
)}
```

**Current click area** (lines 131-158) -- overlay inside banner:
```typescript
{isEditMode && (
  <div
    ref={containerRef}
    className="absolute inset-0 z-10 cursor-crosshair"
    role="button"
    tabIndex={0}
    aria-label="Click to place focal point"
    onClick={handleImageClick}
    /* ... */
  >
    {pendingPoint && containerSize.width > 0 && (
      <>
        <CropGuideOverlay /* ... */ />
        <FocalPointMarker x={pendingPoint.x} y={pendingPoint.y} />
      </>
    )}
  </div>
)}
```

**Modification pattern (D-09, D-10):** Extract click area to `FocalPointClickArea` (new file). Keep `FocalPointEditor` as state owner returning `<>{clickArea}{actionBar}</>`. The action bar becomes a non-absolute sibling (remove `absolute bottom-0`, keep visual treatment). Parent `HeroCoverBanner` renders them: click area inside the relative image container, action bar as sibling below.

---

### `src/components/features/charts/project-detail/focal-point-click-area.tsx` (NEW component)

**Analog:** `focal-point-editor.tsx` lines 131-158 (extracted from)

**Pattern to copy:**
```typescript
"use client";

// Extracted click overlay from FocalPointEditor
// Receives: isEditMode, pendingPoint, containerSize, onImageClick, onKeyDown, containerRef
// Renders: absolute inset-0 overlay with cursor-crosshair, CropGuideOverlay, FocalPointMarker

import { FocalPointMarker } from "./focal-point-marker";
import { CropGuideOverlay } from "./crop-guide-overlay";

interface FocalPointClickAreaProps {
  pendingPoint: { x: number; y: number } | null;
  containerSize: { width: number; height: number };
  onImageClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}
```

---

### `src/components/features/charts/project-detail/hero-cover-banner.tsx` (component, layout restructure)

**Analog:** Self

**Current structure** (lines 32-63) -- FocalPointEditor renders entirely inside the relative container:
```typescript
return (
  <div className="bg-muted relative max-h-64 w-full overflow-hidden rounded-lg ...">
    {/* blur bg */}
    <Image /* ... */ />
    {/* foreground */}
    <Image /* ... */ />
    {/* Focal point editor overlay */}
    <FocalPointEditor
      chartId={chartId}
      initialFocalPoint={/* ... */}
      imageUrl={imageUrl}
    />
  </div>
);
```

**Modification pattern (D-09):** FocalPointEditor returns two pieces. The click area renders inside the banner's relative container. The action bar renders as a sibling below the banner container. Simplest approach: FocalPointEditor returns a Fragment with two children; parent renders click area inside the `<div>` and action bar outside.

---

### `src/components/features/charts/form-primitives/cover-image-upload.tsx` (component, dynamic aspect ratio)

**Analog:** Self

**Current fixed-height preview** (lines 198-215):
```typescript
<div className="border-border bg-muted relative h-48 overflow-hidden rounded-lg border-2">
  <img
    src={preview}
    alt="Cover image preview"
    className="h-full w-full object-contain"
    onError={() => setImgError(true)}
  />
  <button /* remove button */ />
</div>
```

**Modification pattern (D-11):** Add `aspectRatio` state. Use `onLoad` handler on `<img>` to capture `naturalWidth/naturalHeight`. Apply `style={{ aspectRatio, maxHeight: "18rem" }}` to container. Keep `h-48` as fallback when `aspectRatio` is null. The `onLoad` handler:
```typescript
onLoad={(e) => {
  const img = e.currentTarget;
  setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`);
}}
```

---

### `src/components/features/dashboard/bucket-project-row.tsx` (component, focal point)

**Analog:** `src/components/features/gallery/gallery-card.tsx` lines 172-179

**Gallery card focal point pattern** (already implemented):
```typescript
import { getObjectPositionStyle } from "@/lib/utils/focal-point";

<Image
  src={card.coverImageUrl!}
  alt={card.name}
  fill
  className="object-cover ..."
  style={getObjectPositionStyle(card.focalPointX, card.focalPointY)}
/>
```

**Current BucketProjectRow image** (lines 31-34):
```typescript
<img
  src={imageUrl}
  alt={project.projectName}
  loading="lazy"
  className="h-full w-full object-cover"
/>
```

**Modification pattern (UX-09):** Import `getObjectPositionStyle`, add `style={getObjectPositionStyle(project.focalPointX, project.focalPointY)}` to `<img>`. Requires BucketProject type and query updates first.

---

### `src/components/features/stats/thread-insight-list.tsx` (component, rank numbers)

**Analog:** `src/components/features/stats/designer-insight-list.tsx` lines 24-29

**Designer insight rank pattern:**
```typescript
{items.map((item, index) => (
  <div key={item.designerId} className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
        {index + 1}.
      </span>
      <Link /* ... */ />
    </div>
    {/* ... stats ... */}
  </div>
))}
```

**Current thread insight item** (lines 23-44) -- no rank number:
```typescript
{items.map((item) => (
  <div key={item.threadId} className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      {/* color swatch */}
      <span className="text-foreground text-sm">
        {item.brandName} {item.colorCode} -- {item.colorName}
      </span>
    </div>
    <span className="text-muted-foreground font-mono text-xs whitespace-nowrap tabular-nums">
      {item.projectCount} {item.projectCount === 1 ? "project" : "projects"}
    </span>
  </div>
))}
```

**Modification pattern (D-13, D-14):** Add `(item, index)` to map callback. Insert rank number span matching designer pattern: `<span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">{index + 1}.</span>`. No hover/cursor-pointer/links (confirmed).

---

### `src/components/features/charts/whats-next-tab.tsx` (component, kitting label + card styling)

**Analog:** Self (kitting label), `gallery-card.tsx` (card styling reference)

**Current kitting label** (lines 184-185):
```typescript
<p className="text-muted-foreground/70 mt-0.5 text-xs">
  {project.kittingPercent === 100 ? "Fully kitted" : "Kitting"}
</p>
```

**Modification pattern (D-06) -- three-state:**
```typescript
{project.kittingPercent === 100
  ? "Fully kitted"
  : project.kittingPercent === 0
    ? "Not kitted"
    : "Kitting"}
```

**Gallery card CSS patterns for UX-14** (from `gallery-card.tsx`):
- Card wrapper: `bg-card hover:shadow-foreground/8 flex flex-col overflow-hidden rounded-xl transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-lg`
- Image area: `relative aspect-[4/3] overflow-hidden`
- Card body: `bg-card flex flex-1 flex-col gap-1.5 p-4`
- Name link: `font-heading text-foreground ... text-sm leading-snug font-semibold`
- Border: `border-border border`

---

### `src/components/features/shopping/shopping-for-bar.tsx` (component, pill styling)

**Analog:** Self

**Current pill styling** (line 36):
```typescript
<span
  key={project.projectId}
  className="bg-selected text-selected-foreground flex items-center gap-1 rounded-full px-3 py-1 text-sm"
>
```

**Modification pattern (D-07, D-08):** Change `rounded-full` to `rounded-lg`, add `border border-selected-border`. Add why-comment per D-08: `// Intentionally deviates from DesignOS rounded-full pills -- squared chips better fit shopping cart UI convention.`

---

### `src/types/dashboard.ts` (type, extension)

**Analog:** Self -- existing `extends OptionalFocalPoint` pattern

**Pattern from other dashboard types** (lines 6, 23, 37, 50):
```typescript
export interface CurrentlyStitchingProject extends OptionalFocalPoint {
export interface StartNextProject extends OptionalFocalPoint {
export interface BuriedTreasure extends OptionalFocalPoint {
export interface SpotlightProject extends OptionalFocalPoint {
```

**Current BucketProject** (lines 101-113) -- does NOT extend OptionalFocalPoint:
```typescript
export interface BucketProject {
  projectId: string;
  chartId: string;
  // ... fields ...
}
```

**Modification pattern:** Add `extends OptionalFocalPoint` to match sibling types.

---

### `src/lib/actions/project-dashboard-actions.ts` (service, query extension)

**Analog:** Self -- existing select pattern

**Current chart select** (lines 73-80):
```typescript
chart: {
  select: {
    id: true,
    name: true,
    stitchCount: true,
    coverThumbnailUrl: true,
    designer: { select: { name: true } },
    genres: { select: { name: true } },
  },
},
```

**Current bucket project mapping** (lines 160-172):
```typescript
bucketProjectsMap.get(bucketId)!.push({
  projectId: p.id,
  chartId: p.chart.id,
  projectName: p.chart.name,
  designerName: p.chart.designer?.name ?? null,
  coverThumbnailUrl: p.chart.coverThumbnailUrl,
  status: p.status,
  progressPercent,
  totalStitches: p.chart.stitchCount,
  stitchesCompleted: p.stitchesCompleted,
  lastSessionDate: lastSession?.date ?? null,
  stitchingDays,
});
```

**Modification pattern (UX-09):** Add `focalPointX: true, focalPointY: true` to chart select. Add `focalPointX: p.chart.focalPointX ?? null, focalPointY: p.chart.focalPointY ?? null` to bucket project mapping.

---

### `src/components/features/supplies/supply-catalog.tsx` (component, flash fix)

**Analog:** Self

**Current initialization** (lines 189-213):
```typescript
// Initialize view modes: URL param > localStorage > default
const [viewModes, setViewModes] = useState<Record<SupplyTab, ViewMode>>(() => {
  const modes = { ...DEFAULT_VIEWS };
  if (initialView) {
    modes.threads = initialView;
  }
  return modes;
});

// Restore non-active tab preferences from localStorage (no flash since they're not visible)
useEffect(() => {
  const restored = { ...viewModes };
  let changed = false;
  for (const tab of TAB_CONFIG) {
    if (tab.key === "threads" && initialView) continue;
    const stored = localStorage.getItem(STORAGE_KEYS[tab.key]);
    if (stored === "grid" || stored === "table") {
      restored[tab.key] = stored;
      changed = true;
    }
  }
  if (changed) setViewModes(restored);
}, []);
```

**Issue:** The `initialView` prop only applies to `threads` tab. When threads tab lacks URL param OR user's stored preference differs from `DEFAULT_VIEWS`, the active tab flashes between default and stored preference.

**Modification pattern (UX-04):** Read localStorage synchronously in the `useState` initializer for the active tab as well (not just in the `useEffect`). This avoids the flash because `useState` initializer runs before first paint.

---

## Shared Patterns

### ARIA Group Pattern
**Source:** WAI-ARIA practices + D-01/D-04
**Apply to:** `designer-list.tsx` (DesignerRow, DesignerCard), `genre-list.tsx` (GenreRow, GenreCard)
```typescript
// On container element (tr or div):
role="group"
aria-labelledby={`name-id-${entity.id}`}

// On name element (Link):
id={`name-id-${entity.id}`}

// Action buttons already have aria-label -- no changes needed
aria-label={`Edit ${entity.name}`}
aria-label={`Delete ${entity.name}`}
```

### Rejection Flash Pattern
**Source:** D-05 + existing `animate-shake` in `globals.css`
**Apply to:** Both `editable-number.tsx` variants (supply-table and charts)
```typescript
const [showRejection, setShowRejection] = useState(false);

// In rejection branch of onBlur:
setShowRejection(true);
setTimeout(() => setShowRejection(false), 600);

// On read-mode button:
className={cn(
  "hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5 ...",
  showRejection && "border-destructive animate-shake border"
)}
```

### Focal Point Application Pattern
**Source:** `src/components/features/gallery/gallery-card.tsx` lines 11, 178
**Apply to:** `bucket-project-row.tsx`
```typescript
import { getObjectPositionStyle } from "@/lib/utils/focal-point";

<img
  src={imageUrl}
  className="h-full w-full object-cover"
  style={getObjectPositionStyle(project.focalPointX, project.focalPointY)}
/>
```

### Semantic Design Tokens
**Source:** `.claude/rules/base-ui-patterns.md`
**Apply to:** All modified files
```
// CORRECT tokens used throughout codebase:
bg-card, bg-background, bg-muted, bg-primary/5, bg-destructive/10
border-border, border-destructive, border-primary
text-foreground, text-muted-foreground, text-destructive
bg-selected, text-selected-foreground, border-selected-border

// NEVER use hardcoded scales (already present violations to note but not introduced):
// bucket-project-row.tsx line 44: "text-emerald-700 dark:text-emerald-400" (pre-existing)
// whats-next-tab.tsx line 117: "hover:border-emerald-200" (pre-existing)
```

### Test Pattern
**Source:** `@/__tests__/test-utils` convention
**Apply to:** All test files
```typescript
import { render, screen, fireEvent } from "@/__tests__/test-utils";
// NOT from "@testing-library/react"
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All 19 files have close analogs in the existing codebase |

## Metadata

**Analog search scope:** `src/components/features/`, `src/types/`, `src/lib/actions/`, `src/lib/utils/`
**Files scanned:** 19 target files + 3 analog references
**Pattern extraction date:** 2026-05-19
