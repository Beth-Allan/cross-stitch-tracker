# Chart Form Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ground-up rebuild of chart add/edit form UI to match DesignOS design — deleting the old 651-line monolith and replacing it with a composable architecture: shared hook + 8 section components + 10 form primitives + 2 surfaces.

**Architecture:** `useChartForm` hook owns all state/validation/submission. Section components compose form primitives into field groups. Two surface components (`ChartAddForm` full-page, `ChartEditModal` tabbed dialog) compose sections into their respective layouts, both consuming the same hook. Upload components are moved to `form-primitives/` and rewired.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, shadcn/ui (@base-ui/react), cmdk, Zod, Tailwind CSS 4 semantic tokens, Vitest + RTL

**Spec:** `docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md`

**Design references (read before each task that touches UI):**

- `product-plan/sections/project-management/components/ChartAddForm.tsx`
- `product-plan/sections/project-management/components/ChartFormModal.tsx`
- `product-plan/sections/project-management/components/FormFields.tsx`
- `product-plan/sections/project-management/chart-add-form.png`
- `product-plan/sections/project-management/chart-edit-modal.png`

---

## File Map

### Files to delete

| File                                                      | Reason                                 |
| --------------------------------------------------------- | -------------------------------------- |
| `src/components/features/charts/chart-form.tsx`           | Replaced by new architecture           |
| `src/components/features/charts/chart-form.test.tsx`      | Replaced by new colocated tests        |
| `src/components/features/charts/searchable-select.tsx`    | Rebuilt in form-primitives/            |
| `src/components/features/charts/genre-picker.tsx`         | Rebuilt in form-primitives/            |
| `src/components/features/charts/inline-entity-dialog.tsx` | Replaced by inline-designer-dialog.tsx |

### Files to move

| From                                                    | To                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/components/features/charts/cover-image-upload.tsx` | `src/components/features/charts/form-primitives/cover-image-upload.tsx` |
| `src/components/features/charts/file-upload.tsx`        | `src/components/features/charts/form-primitives/file-upload.tsx`        |

### Files to create

| File                                                                         | Responsibility                     |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| `src/components/features/charts/form-primitives/form-field.tsx`              | Label + hint + error wrapper       |
| `src/components/features/charts/form-primitives/section-heading.tsx`         | Section divider heading            |
| `src/components/features/charts/form-primitives/styled-checkbox.tsx`         | Checkbox with label wrapper        |
| `src/components/features/charts/form-primitives/searchable-select.tsx`       | Popover + Command combobox         |
| `src/components/features/charts/form-primitives/genre-picker.tsx`            | Pill toggles + inline add          |
| `src/components/features/charts/form-primitives/stitch-count-fields.tsx`     | W×H + total + size badge           |
| `src/components/features/charts/form-primitives/pattern-type-fields.tsx`     | Radio + kit + SAL                  |
| `src/components/features/charts/form-primitives/start-preference-fields.tsx` | Period + year selects              |
| `src/components/features/charts/sections/basic-info-section.tsx`             | Name, Designer, Cover, File        |
| `src/components/features/charts/sections/stitch-count-section.tsx`           | Dimensions + count                 |
| `src/components/features/charts/sections/genre-section.tsx`                  | Genres + Series (disabled)         |
| `src/components/features/charts/sections/pattern-type-section.tsx`           | Format + Kit + SAL                 |
| `src/components/features/charts/sections/project-setup-section.tsx`          | Status, Fabric, Bin, App           |
| `src/components/features/charts/sections/dates-section.tsx`                  | Start/Finish/FFO                   |
| `src/components/features/charts/sections/goals-section.tsx`                  | Want to start + preference         |
| `src/components/features/charts/sections/notes-section.tsx`                  | Textarea                           |
| `src/components/features/charts/inline-designer-dialog.tsx`                  | Dialog for new designers           |
| `src/components/features/charts/use-chart-form.ts`                           | All form state, validation, submit |
| `src/components/features/charts/chart-add-form.tsx`                          | Full-page add form surface         |
| `src/components/features/charts/chart-edit-modal.tsx`                        | Tabbed edit modal surface          |
| `src/components/features/charts/chart-add-form.test.tsx`                     | Add form integration tests         |
| `src/components/features/charts/chart-edit-modal.test.tsx`                   | Edit modal behavior tests          |

### Files to modify

| File                                            | Change                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `src/lib/validations/chart.ts`                  | Add coverImageUrl, coverThumbnailUrl, digitalFileUrl optional fields |
| `src/lib/actions/chart-actions.ts`              | Persist upload URL fields in create/update                           |
| `src/app/(dashboard)/charts/new/page.tsx`       | Import ChartAddForm instead of ChartForm                             |
| `src/app/(dashboard)/charts/[id]/edit/page.tsx` | Import ChartEditModal instead of ChartForm                           |

---

## Task 1: Cleanup and Directory Scaffolding

**Files:**

- Delete: `src/components/features/charts/chart-form.tsx`
- Delete: `src/components/features/charts/chart-form.test.tsx`
- Delete: `src/components/features/charts/searchable-select.tsx`
- Delete: `src/components/features/charts/genre-picker.tsx`
- Delete: `src/components/features/charts/inline-entity-dialog.tsx`
- Create dirs: `src/components/features/charts/form-primitives/`, `src/components/features/charts/sections/`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/components/features/charts/form-primitives
mkdir -p src/components/features/charts/sections
```

- [ ] **Step 2: Delete old form files**

```bash
rm src/components/features/charts/chart-form.tsx
rm src/components/features/charts/chart-form.test.tsx
rm src/components/features/charts/searchable-select.tsx
rm src/components/features/charts/genre-picker.tsx
rm src/components/features/charts/inline-entity-dialog.tsx
```

- [ ] **Step 3: Move upload components to form-primitives/**

```bash
mv src/components/features/charts/cover-image-upload.tsx src/components/features/charts/form-primitives/cover-image-upload.tsx
mv src/components/features/charts/file-upload.tsx src/components/features/charts/form-primitives/file-upload.tsx
```

- [ ] **Step 4: Verify structure**

```bash
ls -la src/components/features/charts/
ls -la src/components/features/charts/form-primitives/
ls -la src/components/features/charts/sections/
```

Expected: `form-primitives/` has `cover-image-upload.tsx` and `file-upload.tsx`. `sections/` is empty. Old files are gone.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/features/charts/
git commit -m "refactor: delete old chart form, scaffold new directory structure

Move upload components to form-primitives/, delete monolithic chart-form.tsx
and its helpers (searchable-select, genre-picker, inline-entity-dialog).
Create sections/ and form-primitives/ directories for new architecture."
```

---

## Task 2: Extend Zod Schema and Server Actions for Upload URLs

**Files:**

- Modify: `src/lib/validations/chart.ts`
- Modify: `src/lib/actions/chart-actions.ts`

- [ ] **Step 1: Add upload URL fields to Zod schema**

In `src/lib/validations/chart.ts`, add three optional URL fields to the `chart` object inside `chartFormSchema`, after the `designerId` field:

```typescript
      coverImageUrl: z.string().url().nullable().default(null),
      coverThumbnailUrl: z.string().url().nullable().default(null),
      digitalFileUrl: z.string().url().nullable().default(null),
```

- [ ] **Step 2: Update createChart to persist upload URLs**

In `src/lib/actions/chart-actions.ts`, in the `createChart` function's `prisma.chart.create` data block, add after the `designerId` line:

```typescript
        coverImageUrl: chart.coverImageUrl,
        coverThumbnailUrl: chart.coverThumbnailUrl,
        digitalWorkingCopyUrl: chart.digitalFileUrl,
```

Note: The Zod field is `digitalFileUrl` but the Prisma column is `digitalWorkingCopyUrl`. The mapping happens here.

- [ ] **Step 3: Update updateChart to persist upload URLs**

In `src/lib/actions/chart-actions.ts`, in the `updateChart` function's `prisma.chart.update` data block, add the same three lines after `designerId`:

```typescript
        coverImageUrl: chart.coverImageUrl,
        coverThumbnailUrl: chart.coverThumbnailUrl,
        digitalWorkingCopyUrl: chart.digitalFileUrl,
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds (route pages will fail because ChartForm import is broken — that's expected since we deleted it in Task 1. We'll fix routes in Task 14).

Actually, since the route pages import the deleted `ChartForm`, the build will fail. That's fine — we'll fix it at the end. Instead verify the schema:

```bash
npx tsc --noEmit src/lib/validations/chart.ts src/lib/actions/chart-actions.ts 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/chart.ts src/lib/actions/chart-actions.ts
git commit -m "feat: add upload URL fields to chart form schema and server actions

Add coverImageUrl, coverThumbnailUrl, digitalFileUrl to Zod schema.
Map digitalFileUrl to Prisma's digitalWorkingCopyUrl in create/update."
```

---

## Task 3: FormField and SectionHeading Primitives

**Files:**

- Create: `src/components/features/charts/form-primitives/form-field.tsx`
- Create: `src/components/features/charts/form-primitives/section-heading.tsx`

<read_first>

- product-plan/sections/project-management/components/FormFields.tsx (FormField and SectionHeading components)
  </read_first>

- [ ] **Step 1: Create FormField primitive**

Create `src/components/features/charts/form-primitives/form-field.tsx`:

```tsx
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
        {required && <span className="sr-only"> (required)</span>}
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

- [ ] **Step 2: Create SectionHeading primitive**

Create `src/components/features/charts/form-primitives/section-heading.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  showBorder?: boolean;
}

export function SectionHeading({ title, showBorder = true }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-muted-foreground pt-5 pb-3 text-xs font-semibold tracking-widest uppercase",
        showBorder && "border-border/60 border-t",
      )}
    >
      {title}
    </h2>
  );
}
```

- [ ] **Step 3: Verify no type errors**

```bash
npx tsc --noEmit src/components/features/charts/form-primitives/form-field.tsx src/components/features/charts/form-primitives/section-heading.tsx 2>&1
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/charts/form-primitives/form-field.tsx src/components/features/charts/form-primitives/section-heading.tsx
git commit -m "feat: add FormField and SectionHeading form primitives

FormField wraps label + hint/error with a11y attributes.
SectionHeading renders bordered section dividers with uppercase title."
```

---

## Task 4: StyledCheckbox Primitive

**Files:**

- Create: `src/components/features/charts/form-primitives/styled-checkbox.tsx`

<read_first>

- product-plan/sections/project-management/components/FormFields.tsx (Checkbox component)
  </read_first>

Note: No shadcn Checkbox is installed. The DesignOS design uses a native `<input type="checkbox">` with `accent-emerald-600`. Per KISS (and because native checkboxes with `accent-primary` work well), we'll use a native checkbox with semantic styling rather than installing a new shadcn component.

- [ ] **Step 1: Create StyledCheckbox**

Create `src/components/features/charts/form-primitives/styled-checkbox.tsx`:

```tsx
"use client";

import { useId } from "react";

interface StyledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function StyledCheckbox({ checked, onChange, label, disabled }: StyledCheckboxProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="group flex cursor-pointer items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="border-border accent-primary focus:ring-ring size-4 rounded focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span className="text-foreground group-hover:text-foreground/80 text-sm transition-colors">
        {label}
      </span>
    </label>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/charts/form-primitives/styled-checkbox.tsx
git commit -m "feat: add StyledCheckbox form primitive

Native checkbox with accent-primary styling and label wrapper."
```

---

## Task 5: SearchableSelect Primitive

**Files:**

- Create: `src/components/features/charts/form-primitives/searchable-select.tsx`

<read_first>

- product-plan/sections/project-management/components/FormFields.tsx (SearchableSelect component)
- src/components/ui/popover.tsx
- src/components/ui/command.tsx
  </read_first>

- [ ] **Step 1: Create SearchableSelect using shadcn Popover + Command**

Create `src/components/features/charts/form-primitives/searchable-select.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  onAddNew?: (searchTerm: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Select...",
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
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
        <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(value === option.value && "bg-primary/10 text-primary")}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAddNew(search);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="text-primary"
                    >
                      <Plus className="mr-2 size-4" />
                      Add &ldquo;{search || "new"}&rdquo;
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit src/components/features/charts/form-primitives/searchable-select.tsx 2>&1
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/charts/form-primitives/searchable-select.tsx
git commit -m "feat: add SearchableSelect form primitive

Popover + Command (cmdk) combobox with search, selection, clear, and
optional 'Add new' action. Uses semantic tokens throughout."
```

---

## Task 6: GenrePicker Primitive

**Files:**

- Create: `src/components/features/charts/form-primitives/genre-picker.tsx`

<read_first>

- product-plan/sections/project-management/components/FormFields.tsx (GenrePicker component)
  </read_first>

- [ ] **Step 1: Create GenrePicker**

Create `src/components/features/charts/form-primitives/genre-picker.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Genre {
  id: string;
  name: string;
}

interface GenrePickerProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  onAddGenre: (name: string) => Promise<void>;
}

export function GenrePicker({ genres, selectedIds, onToggle, onAddGenre }: GenrePickerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const trimmed = newName.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddGenre(trimmed);
      setNewName("");
      setIsAdding(false);
    } catch {
      // Keep input open on error so user can retry
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only cancel if focus moves outside the GenrePicker container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsAdding(false);
      setNewName("");
    }
  };

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const selected = selectedIds.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            onClick={() => onToggle(genre.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              selected
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground hover:border-border/80",
            )}
          >
            {genre.name}
          </button>
        );
      })}
      {isAdding ? (
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSubmit();
            }
            if (e.key === "Escape") {
              setIsAdding(false);
              setNewName("");
            }
          }}
          onBlur={handleBlur}
          autoFocus
          placeholder="Genre name"
          disabled={isSubmitting}
          className="border-primary/30 bg-background focus:ring-ring w-40 rounded-full border px-3 py-1.5 text-xs focus:ring-2 focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="border-border text-muted-foreground hover:border-primary/30 hover:text-primary rounded-full border border-dashed px-3 py-1.5 text-xs transition-colors"
        >
          + Add
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/charts/form-primitives/genre-picker.tsx
git commit -m "feat: add GenrePicker form primitive

Pill toggle grid with inline text input for adding new genres.
Uses relatedTarget blur check to prevent premature cancel."
```

---

## Task 7: StitchCountFields, PatternTypeFields, and StartPreferenceFields

**Files:**

- Create: `src/components/features/charts/form-primitives/stitch-count-fields.tsx`
- Create: `src/components/features/charts/form-primitives/pattern-type-fields.tsx`
- Create: `src/components/features/charts/form-primitives/start-preference-fields.tsx`

<read_first>

- product-plan/sections/project-management/components/FormFields.tsx (StitchCountFields, PatternTypeFields, StartPreferenceFields)
- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (sections 6h, 6i, 6j)
  </read_first>

- [ ] **Step 1: Create StitchCountFields**

Create `src/components/features/charts/form-primitives/stitch-count-fields.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";

const SIZE_CONFIG: Record<string, { bg: string; text: string }> = {
  Mini: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Small: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Large: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  BAP: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

interface StitchCountFieldsProps {
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCountChange: (value: string) => void;
  errors?: {
    stitchesWide?: string;
    stitchesHigh?: string;
    stitchCount?: string;
  };
}

export function StitchCountFields({
  stitchesWide,
  stitchesHigh,
  stitchCount,
  onWidthChange,
  onHeightChange,
  onCountChange,
  errors,
}: StitchCountFieldsProps) {
  const { count: effectiveCount, approximate: isAutoCalculated } = getEffectiveStitchCount(
    stitchCount,
    stitchesWide,
    stitchesHigh,
  );
  const sizeCategory = effectiveCount > 0 ? calculateSizeCategory(effectiveCount) : null;

  const hint = isAutoCalculated
    ? `Auto-calculated from ${stitchesWide.toLocaleString()} × ${stitchesHigh.toLocaleString()}. Clear to enter an exact count.`
    : "Leave empty to auto-calculate from dimensions";

  return (
    <div className="space-y-4">
      <FormField label="Dimensions (stitches)" htmlFor="stitches-wide" error={errors?.stitchesWide}>
        <div className="flex items-center gap-2">
          <Input
            id="stitches-wide"
            type="number"
            min={0}
            value={stitchesWide || ""}
            onChange={(e) => onWidthChange(e.target.value)}
            placeholder="Width"
            className="flex-1"
          />
          <span className="text-muted-foreground shrink-0 px-2 text-sm">w ×</span>
          <Input
            id="stitches-high"
            type="number"
            min={0}
            value={stitchesHigh || ""}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="Height"
            className="flex-1"
          />
          <span className="text-muted-foreground shrink-0 px-2 text-sm">h</span>
        </div>
      </FormField>

      <FormField
        label="Total Stitch Count"
        htmlFor="stitch-count"
        hint={hint}
        error={errors?.stitchCount}
      >
        <Input
          id="stitch-count"
          type="number"
          min={0}
          value={stitchCount || ""}
          onChange={(e) => onCountChange(e.target.value)}
          placeholder={isAutoCalculated ? effectiveCount.toLocaleString() : "0"}
        />
        {effectiveCount > 0 && sizeCategory && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${SIZE_CONFIG[sizeCategory].bg} ${SIZE_CONFIG[sizeCategory].text}`}
            >
              {sizeCategory}
            </span>
            {isAutoCalculated && (
              <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-[10px] font-medium">
                Auto-calculated
              </span>
            )}
          </div>
        )}
      </FormField>
    </div>
  );
}
```

- [ ] **Step 2: Create PatternTypeFields**

Create `src/components/features/charts/form-primitives/pattern-type-fields.tsx`:

```tsx
"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { StyledCheckbox } from "./styled-checkbox";

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

export function PatternTypeFields({
  isPaperChart,
  isFormalKit,
  isSAL,
  kitColorCount,
  onFormatChange,
  onFormalKitChange,
  onSALChange,
  onKitColorCountChange,
  errors,
}: PatternTypeFieldsProps) {
  const groupId = useId();

  return (
    <div className="space-y-3">
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
          <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={groupId}
              checked={isPaperChart}
              onChange={() => onFormatChange(true)}
              className="accent-primary"
            />
            Paper Chart
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
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
      </div>

      <StyledCheckbox checked={isSAL} onChange={onSALChange} label="SAL (Stitch-Along)" />
    </div>
  );
}
```

- [ ] **Step 3: Create StartPreferenceFields**

Create `src/components/features/charts/form-primitives/start-preference-fields.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

const START_PERIODS = [
  { group: "Season", items: ["Spring", "Summer", "Fall", "Winter"] },
  {
    group: "Month",
    items: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
];

const START_YEARS = [2026, 2027, 2028, 2029, 2030];

interface StartPreferenceFieldsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function parsePreference(value: string | null): {
  period: string;
  year: string;
} {
  if (!value) return { period: "", year: "" };
  const parts = value.split(" ");
  if (parts.length === 2) return { period: parts[0], year: parts[1] };
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return { period: "", year: parts[0] };
  return { period: parts[0], year: "" };
}

function combinePreference(period: string, year: string): string | null {
  if (period && year) return `${period} ${year}`;
  if (year) return year;
  return null;
}

export function StartPreferenceFields({ value, onChange }: StartPreferenceFieldsProps) {
  const parsed = parsePreference(value);
  const [period, setPeriod] = useState(parsed.period);
  const [year, setYear] = useState(parsed.year);

  // Sync from external value changes (e.g. form reset)
  useEffect(() => {
    const p = parsePreference(value);
    setPeriod(p.period);
    setYear(p.year);
  }, [value]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    onChange(combinePreference(newPeriod, year));
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    onChange(combinePreference(period, newYear));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={period}
        onChange={(e) => handlePeriodChange(e.target.value)}
        className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
      >
        <option value="">Any time</option>
        {START_PERIODS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
      >
        <option value="">Year</option>
        {START_YEARS.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/features/charts/form-primitives/stitch-count-fields.tsx src/components/features/charts/form-primitives/pattern-type-fields.tsx src/components/features/charts/form-primitives/start-preference-fields.tsx
git commit -m "feat: add StitchCountFields, PatternTypeFields, StartPreferenceFields

StitchCountFields: W×H inputs + total + auto-calc + size badge.
PatternTypeFields: native radio group + formal kit + SAL checkboxes.
StartPreferenceFields: period/year composite select with internal parse."
```

---

## Task 8: Rewire Upload Components

**Files:**

- Modify: `src/components/features/charts/form-primitives/cover-image-upload.tsx`
- Modify: `src/components/features/charts/form-primitives/file-upload.tsx`

The upload components were moved in Task 1. They need their styling updated to use semantic tokens where they currently use hardcoded colors.

- [ ] **Step 1: Update CoverImageUpload to use semantic tokens**

In `src/components/features/charts/form-primitives/cover-image-upload.tsx`, replace the hardcoded Tailwind colors in the className strings:

Replace `border-stone-200 dark:border-stone-700` with `border-border` (appears in preview container and drop zone).

Replace `border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20` with `border-primary bg-primary/10`.

Replace `hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-stone-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20` with `hover:border-primary/50 hover:bg-primary/5`.

Replace `text-stone-400` with `text-muted-foreground/50`.

Replace `text-stone-500 dark:text-stone-400` with `text-muted-foreground`.

Replace `text-stone-400` (file type hint) with `text-muted-foreground/70`.

- [ ] **Step 2: Update FileUpload to use semantic tokens**

In `src/components/features/charts/form-primitives/file-upload.tsx`, replace:

Replace `border-stone-200 dark:border-stone-700` with `border-border`.

Replace `text-stone-500` with `text-muted-foreground`.

Replace `text-stone-700 dark:text-stone-300` with `text-foreground`.

Replace `text-stone-400 hover:text-stone-600 dark:hover:text-stone-300` with `text-muted-foreground hover:text-foreground`.

Also remove the `void currentFileUrl;` line and the `currentFileUrl` prop — the spec says the component takes `value: string | null` instead. Update the interface:

```tsx
interface FileUploadProps {
  chartId?: string;
  currentFileName?: string | null;
  onUploadComplete: (key: string, fileName: string) => void;
  onRemove: () => void;
}
```

And remove `currentFileUrl` from the destructuring.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/charts/form-primitives/cover-image-upload.tsx src/components/features/charts/form-primitives/file-upload.tsx
git commit -m "refactor: update upload components to use semantic design tokens

Replace hardcoded stone/emerald colors with semantic tokens (border-border,
text-muted-foreground, bg-primary/10, etc.). Remove unused currentFileUrl prop."
```

---

## Task 9: InlineDesignerDialog

**Files:**

- Create: `src/components/features/charts/inline-designer-dialog.tsx`

<read_first>

- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (section 8)
  </read_first>

- [ ] **Step 1: Create InlineDesignerDialog**

Create `src/components/features/charts/inline-designer-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-primitives/form-field";

interface InlineDesignerDialogProps {
  trigger: React.ReactNode;
  onSubmit: (name: string, website?: string) => Promise<void>;
}

export function InlineDesignerDialog({ trigger, onSubmit }: InlineDesignerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const reset = () => {
    setName("");
    setWebsite("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Designer name is required");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      await onSubmit(trimmedName, website.trim() || undefined);
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create designer");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Designer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="designer-name" required error={error ?? undefined}>
            <Input
              id="designer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Designer name"
              autoFocus
            />
          </FormField>
          <FormField label="Website" htmlFor="designer-website" hint="Optional">
            <Input
              id="designer-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Designer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/charts/inline-designer-dialog.tsx
git commit -m "feat: add InlineDesignerDialog for creating designers

shadcn Dialog with name (required) and website (optional) fields.
Keeps dialog open on error for retry. Resets on close."
```

---

## Task 10: useChartForm Hook

**Files:**

- Create: `src/components/features/charts/use-chart-form.ts`

<read_first>

- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (section 5)
- src/lib/validations/chart.ts
- src/lib/actions/chart-actions.ts
- src/types/chart.ts
  </read_first>

- [ ] **Step 1: Create the useChartForm hook**

Create `src/components/features/charts/use-chart-form.ts`:

```tsx
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { SizeCategory } from "@/lib/utils/size-category";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import { chartFormSchema } from "@/lib/validations/chart";
import { createChart, updateChart } from "@/lib/actions/chart-actions";
import { createDesigner } from "@/lib/actions/designer-actions";
import { createGenre } from "@/lib/actions/genre-actions";
import { z } from "zod";

export interface ChartFormValues {
  name: string;
  designerId: string | null;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  digitalFileUrl: string | null;
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  stitchCountApproximate: boolean;
  genreIds: string[];
  isPaperChart: boolean;
  isFormalKit: boolean;
  kitColorCount: number | null;
  isSAL: boolean;
  notes: string;
  status: ProjectStatus;
  fabricId: string | null;
  projectBin: string | null;
  ipadApp: string | null;
  needsOnionSkinning: boolean;
  startDate: string;
  finishDate: string;
  ffoDate: string;
  wantToStartNext: boolean;
  preferredStartSeason: string | null;
  startingStitches: number;
}

interface UseChartFormOptions {
  mode: "create" | "edit";
  initialData?: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  onSuccess: (chartId: string) => void;
}

const ERROR_MAP: Record<string, string> = {
  "chart.name": "Chart name is required",
  "chart.stitchCount": "Enter a stitch count or both width and height",
  "chart.kitColorCount": "Kit color count must be a positive number",
  "project.status": "Please select a status",
  "project.startDate": "Invalid date format",
  "project.finishDate": "Invalid date format",
  "project.ffoDate": "Invalid date format",
};

function formatErrors(zodError: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const path = issue.path.join(".");
    errors[path] = ERROR_MAP[path] ?? "This field has an error";
  }
  return errors;
}

function buildInitialValues(data?: ChartWithProject): ChartFormValues {
  if (!data) {
    return {
      name: "",
      designerId: null,
      coverImageUrl: null,
      coverThumbnailUrl: null,
      digitalFileUrl: null,
      stitchesWide: 0,
      stitchesHigh: 0,
      stitchCount: 0,
      stitchCountApproximate: false,
      genreIds: [],
      isPaperChart: false,
      isFormalKit: false,
      kitColorCount: null,
      isSAL: false,
      notes: "",
      status: "UNSTARTED" as ProjectStatus,
      fabricId: null,
      projectBin: null,
      ipadApp: null,
      needsOnionSkinning: false,
      startDate: "",
      finishDate: "",
      ffoDate: "",
      wantToStartNext: false,
      preferredStartSeason: null,
      startingStitches: 0,
    };
  }

  const project = data.project;
  return {
    name: data.name,
    designerId: data.designerId,
    coverImageUrl: data.coverImageUrl,
    coverThumbnailUrl: data.coverThumbnailUrl,
    digitalFileUrl: data.digitalWorkingCopyUrl,
    stitchesWide: data.stitchesWide,
    stitchesHigh: data.stitchesHigh,
    stitchCount: data.stitchCount,
    stitchCountApproximate: data.stitchCountApproximate,
    genreIds: data.genres.map((g) => g.id),
    isPaperChart: data.isPaperChart,
    isFormalKit: data.isFormalKit,
    kitColorCount: data.kitColorCount,
    isSAL: data.isSAL,
    notes: data.notes ?? "",
    status: (project?.status ?? "UNSTARTED") as ProjectStatus,
    fabricId: project?.fabricId ?? null,
    projectBin: project?.projectBin ?? null,
    ipadApp: project?.ipadApp ?? null,
    needsOnionSkinning: project?.needsOnionSkinning ?? false,
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    finishDate: project?.finishDate ? new Date(project.finishDate).toISOString().split("T")[0] : "",
    ffoDate: project?.ffoDate ? new Date(project.ffoDate).toISOString().split("T")[0] : "",
    wantToStartNext: project?.wantToStartNext ?? false,
    preferredStartSeason: project?.preferredStartSeason ?? null,
    startingStitches: project?.startingStitches ?? 0,
  };
}

export function useChartForm({
  mode,
  initialData,
  designers: initialDesigners,
  genres: initialGenres,
  onSuccess,
}: UseChartFormOptions) {
  const initial = useMemo(() => buildInitialValues(initialData), [initialData]);
  const [values, setValues] = useState<ChartFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
  const [genres, setGenres] = useState<Genre[]>(initialGenres);

  // Dirty tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initial);
  }, [values, initial]);

  // Computed stitch count values
  const { count: effectiveStitchCount, approximate: isAutoCalculated } = useMemo(
    () => getEffectiveStitchCount(values.stitchCount, values.stitchesWide, values.stitchesHigh),
    [values.stitchCount, values.stitchesWide, values.stitchesHigh],
  );

  const sizeCategory: SizeCategory | null = useMemo(
    () => (effectiveStitchCount > 0 ? calculateSizeCategory(effectiveStitchCount) : null),
    [effectiveStitchCount],
  );

  // Clear field error when value changes
  const setField = useCallback(
    <K extends keyof ChartFormValues>(key: K, value: ChartFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Clear errors for this field — check both chart.X and project.X paths
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`chart.${key}`];
        delete updated[`project.${key}`];
        return updated;
      });
    },
    [],
  );

  // Submit
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const formData = {
        chart: {
          name: values.name,
          designerId: values.designerId,
          coverImageUrl: values.coverImageUrl,
          coverThumbnailUrl: values.coverThumbnailUrl,
          digitalFileUrl: values.digitalFileUrl,
          stitchCount: values.stitchCount,
          stitchCountApproximate: values.stitchCountApproximate,
          stitchesWide: values.stitchesWide,
          stitchesHigh: values.stitchesHigh,
          genreIds: values.genreIds,
          isPaperChart: values.isPaperChart,
          isFormalKit: values.isFormalKit,
          isSAL: values.isSAL,
          kitColorCount: values.isFormalKit ? values.kitColorCount : null,
          notes: values.notes || null,
        },
        project: {
          status: values.status,
          fabricId: values.fabricId,
          projectBin: values.projectBin,
          ipadApp: values.ipadApp,
          needsOnionSkinning: values.needsOnionSkinning,
          startDate: values.startDate || null,
          finishDate: values.finishDate || null,
          ffoDate: values.ffoDate || null,
          wantToStartNext: values.wantToStartNext,
          preferredStartSeason: values.preferredStartSeason,
          startingStitches: values.startingStitches,
        },
      };

      // Client-side validation
      const result = chartFormSchema.safeParse(formData);
      if (!result.success) {
        setErrors(formatErrors(result.error));
        return;
      }

      setIsPending(true);
      try {
        let response;
        if (mode === "create") {
          response = await createChart(formData);
        } else {
          response = await updateChart(initialData!.id, formData);
        }

        if (!response.success) {
          setErrors({ _form: response.error });
          return;
        }

        const chartId =
          mode === "create" && "chartId" in response ? response.chartId : initialData!.id;
        onSuccess(chartId);
      } catch {
        setErrors({ _form: "An unexpected error occurred" });
      } finally {
        setIsPending(false);
      }
    },
    [values, mode, initialData, onSuccess],
  );

  // Inline entity creation
  const handleAddDesigner = useCallback(
    async (name: string, website?: string) => {
      const result = await createDesigner({
        name,
        website: website ?? null,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      setDesigners((prev) => [...prev, result.designer]);
      setField("designerId", result.designer.id);
    },
    [setField],
  );

  const handleAddGenre = useCallback(async (name: string) => {
    const result = await createGenre({ name });
    if (!result.success) {
      throw new Error(result.error);
    }
    setGenres((prev) => [...prev, result.genre]);
    setValues((prev) => ({
      ...prev,
      genreIds: [...prev.genreIds, result.genre.id],
    }));
  }, []);

  // Beforeunload warning
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return {
    values,
    setField,
    effectiveStitchCount,
    sizeCategory,
    isAutoCalculated,
    errors,
    isPending,
    isDirty,
    handleSubmit,
    designers,
    genres,
    handleAddDesigner,
    handleAddGenre,
  };
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit src/components/features/charts/use-chart-form.ts 2>&1
```

Expected: No errors (or minor issues to fix).

- [ ] **Step 3: Commit**

```bash
git add src/components/features/charts/use-chart-form.ts
git commit -m "feat: add useChartForm hook for shared form state

Owns all 25+ form fields, Zod validation with friendly error mapping,
dirty tracking, beforeunload warning, inline designer/genre creation,
and server action submission for both create and edit modes."
```

---

## Task 11: Section Components

**Files:**

- Create: all 8 section files in `src/components/features/charts/sections/`

<read_first>

- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (section 7)
- product-plan/sections/project-management/components/ChartAddForm.tsx
  </read_first>

- [ ] **Step 1: Create BasicInfoSection**

Create `src/components/features/charts/sections/basic-info-section.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { CoverImageUpload } from "../form-primitives/cover-image-upload";
import { FileUpload } from "../form-primitives/file-upload";
import { InlineDesignerDialog } from "../inline-designer-dialog";
import type { Designer } from "@/generated/prisma/client";

interface BasicInfoSectionProps {
  name: string;
  designerId: string | null;
  coverImageUrl: string | null;
  digitalFileUrl: string | null;
  designers: Designer[];
  onNameChange: (value: string) => void;
  onDesignerChange: (value: string | null) => void;
  onCoverImageChange: (key: string) => void;
  onCoverImageRemove: () => void;
  onDigitalFileChange: (key: string, fileName: string) => void;
  onDigitalFileRemove: () => void;
  onAddDesigner: (name: string, website?: string) => Promise<void>;
  errors?: { name?: string };
}

export function BasicInfoSection({
  name,
  designerId,
  coverImageUrl,
  digitalFileUrl,
  designers,
  onNameChange,
  onDesignerChange,
  onCoverImageChange,
  onCoverImageRemove,
  onDigitalFileChange,
  onDigitalFileRemove,
  onAddDesigner,
  errors,
}: BasicInfoSectionProps) {
  const designerOptions = designers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <div>
      <SectionHeading title="Basic Info" showBorder={false} />
      <div className="space-y-4">
        <FormField label="Chart Name" htmlFor="chart-name" required error={errors?.name}>
          <Input
            id="chart-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Enchanted Forest Sampler"
            aria-required="true"
            aria-invalid={!!errors?.name}
          />
        </FormField>

        <FormField label="Designer" htmlFor="designer">
          <SearchableSelect
            options={designerOptions}
            value={designerId}
            onChange={onDesignerChange}
            placeholder="Select designer..."
            onAddNew={(searchTerm) => {
              // Open the designer dialog — handled via the dialog trigger
            }}
          />
          <InlineDesignerDialog
            trigger={
              <button type="button" className="text-primary mt-1 text-xs hover:underline">
                + Add new designer
              </button>
            }
            onSubmit={onAddDesigner}
          />
        </FormField>

        <FormField label="Cover Image">
          <CoverImageUpload
            currentImageUrl={coverImageUrl}
            onUploadComplete={onCoverImageChange}
            onRemove={onCoverImageRemove}
          />
        </FormField>

        <FormField label="Digital Working Copy">
          <FileUpload
            currentFileName={digitalFileUrl ? digitalFileUrl.split("/").pop() : null}
            onUploadComplete={onDigitalFileChange}
            onRemove={onDigitalFileRemove}
          />
        </FormField>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create StitchCountSection**

Create `src/components/features/charts/sections/stitch-count-section.tsx`:

```tsx
import { SectionHeading } from "../form-primitives/section-heading";
import { StitchCountFields } from "../form-primitives/stitch-count-fields";

interface StitchCountSectionProps {
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCountChange: (value: string) => void;
  errors?: {
    stitchesWide?: string;
    stitchesHigh?: string;
    stitchCount?: string;
  };
}

export function StitchCountSection(props: StitchCountSectionProps) {
  return (
    <div>
      <SectionHeading title="Stitch Count & Dimensions" />
      <StitchCountFields {...props} />
    </div>
  );
}
```

- [ ] **Step 3: Create GenreSection**

Create `src/components/features/charts/sections/genre-section.tsx`:

```tsx
import { SectionHeading } from "../form-primitives/section-heading";
import { GenrePicker } from "../form-primitives/genre-picker";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { FormField } from "../form-primitives/form-field";
import type { Genre } from "@/generated/prisma/client";

interface GenreSectionProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  onAddGenre: (name: string) => Promise<void>;
}

export function GenreSection({ genres, selectedIds, onToggle, onAddGenre }: GenreSectionProps) {
  return (
    <div>
      <SectionHeading title="Genre(s)" />
      <div className="space-y-4">
        <GenrePicker
          genres={genres}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onAddGenre={onAddGenre}
        />
        <FormField label="Series" hint="Available in Phase 5">
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Not available yet"
            disabled
          />
        </FormField>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create PatternTypeSection**

Create `src/components/features/charts/sections/pattern-type-section.tsx`:

```tsx
import { SectionHeading } from "../form-primitives/section-heading";
import { PatternTypeFields } from "../form-primitives/pattern-type-fields";

interface PatternTypeSectionProps {
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

export function PatternTypeSection(props: PatternTypeSectionProps) {
  return (
    <div>
      <SectionHeading title="Pattern Type" />
      <PatternTypeFields {...props} />
    </div>
  );
}
```

- [ ] **Step 5: Create ProjectSetupSection**

Create `src/components/features/charts/sections/project-setup-section.tsx`:

```tsx
"use client";

import type { ProjectStatus } from "@/generated/prisma/client";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";

const BIN_OPTIONS = ["Bin A", "Bin B", "Bin C", "Bin D"];
const APP_OPTIONS = ["Markup R-XP", "Saga", "MacStitch"];

interface ProjectSetupSectionProps {
  status: ProjectStatus;
  projectBin: string | null;
  ipadApp: string | null;
  needsOnionSkinning: boolean;
  onStatusChange: (value: string) => void;
  onBinChange: (value: string | null) => void;
  onAppChange: (value: string | null) => void;
  onOnionSkinningChange: (checked: boolean) => void;
  errors?: { status?: string };
}

export function ProjectSetupSection({
  status,
  projectBin,
  ipadApp,
  needsOnionSkinning,
  onStatusChange,
  onBinChange,
  onAppChange,
  onOnionSkinningChange,
  errors,
}: ProjectSetupSectionProps) {
  return (
    <div>
      <SectionHeading title="Project Setup" />
      <div className="space-y-4">
        <FormField label="Status" htmlFor="status" error={errors?.status}>
          <select
            id="status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fabric" hint="Available in Phase 5">
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Not available yet"
            disabled
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Project Bin" htmlFor="project-bin">
            <select
              id="project-bin"
              value={projectBin ?? ""}
              onChange={(e) => onBinChange(e.target.value || null)}
              className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">None</option>
              {BIN_OPTIONS.map((bin) => (
                <option key={bin} value={bin}>
                  {bin}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="iPad App" htmlFor="ipad-app">
            <select
              id="ipad-app"
              value={ipadApp ?? ""}
              onChange={(e) => onAppChange(e.target.value || null)}
              className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">None</option>
              {APP_OPTIONS.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <StyledCheckbox
          checked={needsOnionSkinning}
          onChange={onOnionSkinningChange}
          label="Needs Onion Skinning"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create DatesSection**

Create `src/components/features/charts/sections/dates-section.tsx`:

```tsx
import { Input } from "@/components/ui/input";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";

interface DatesSectionProps {
  startDate: string;
  finishDate: string;
  ffoDate: string;
  onStartDateChange: (value: string) => void;
  onFinishDateChange: (value: string) => void;
  onFfoDateChange: (value: string) => void;
  errors?: {
    startDate?: string;
    finishDate?: string;
    ffoDate?: string;
  };
}

export function DatesSection({
  startDate,
  finishDate,
  ffoDate,
  onStartDateChange,
  onFinishDateChange,
  onFfoDateChange,
  errors,
}: DatesSectionProps) {
  return (
    <div>
      <SectionHeading title="Dates" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="Start Date" htmlFor="start-date" error={errors?.startDate}>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </FormField>
        <FormField label="Finish Date" htmlFor="finish-date" error={errors?.finishDate}>
          <Input
            id="finish-date"
            type="date"
            value={finishDate}
            onChange={(e) => onFinishDateChange(e.target.value)}
          />
        </FormField>
        <FormField label="FFO Date" htmlFor="ffo-date" error={errors?.ffoDate}>
          <Input
            id="ffo-date"
            type="date"
            value={ffoDate}
            onChange={(e) => onFfoDateChange(e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create GoalsSection**

Create `src/components/features/charts/sections/goals-section.tsx`:

```tsx
import { SectionHeading } from "../form-primitives/section-heading";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { StartPreferenceFields } from "../form-primitives/start-preference-fields";

interface GoalsSectionProps {
  wantToStartNext: boolean;
  preferredStartSeason: string | null;
  onWantToStartChange: (checked: boolean) => void;
  onPreferenceChange: (value: string | null) => void;
}

export function GoalsSection({
  wantToStartNext,
  preferredStartSeason,
  onWantToStartChange,
  onPreferenceChange,
}: GoalsSectionProps) {
  return (
    <div>
      <SectionHeading title="Goals & Planning" />
      <div className="space-y-4">
        <StyledCheckbox
          checked={wantToStartNext}
          onChange={onWantToStartChange}
          label="Want to start next"
        />
        <StartPreferenceFields value={preferredStartSeason} onChange={onPreferenceChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create NotesSection**

Create `src/components/features/charts/sections/notes-section.tsx`:

```tsx
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <div>
      <SectionHeading title="Notes" />
      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Any additional notes about this chart..."
        />
      </FormField>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/features/charts/sections/
git commit -m "feat: add all 8 chart form section components

BasicInfoSection, StitchCountSection, GenreSection, PatternTypeSection,
ProjectSetupSection, DatesSection, GoalsSection, NotesSection.
Each composes form primitives into field groups with SectionHeading dividers."
```

---

## Task 12: ChartAddForm Surface

**Files:**

- Create: `src/components/features/charts/chart-add-form.tsx`

<read_first>

- product-plan/sections/project-management/components/ChartAddForm.tsx
- product-plan/sections/project-management/chart-add-form.png
- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (section 4a)
  </read_first>

- [ ] **Step 1: Create ChartAddForm**

Create `src/components/features/charts/chart-add-form.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Designer, Genre } from "@/generated/prisma/client";
import type { ProjectStatus } from "@/generated/prisma/client";
import { useChartForm } from "./use-chart-form";
import { BasicInfoSection } from "./sections/basic-info-section";
import { StitchCountSection } from "./sections/stitch-count-section";
import { GenreSection } from "./sections/genre-section";
import { PatternTypeSection } from "./sections/pattern-type-section";
import { ProjectSetupSection } from "./sections/project-setup-section";
import { DatesSection } from "./sections/dates-section";
import { GoalsSection } from "./sections/goals-section";
import { NotesSection } from "./sections/notes-section";

interface ChartAddFormProps {
  designers: Designer[];
  genres: Genre[];
}

export function ChartAddForm({ designers, genres }: ChartAddFormProps) {
  const router = useRouter();

  const form = useChartForm({
    mode: "create",
    designers,
    genres,
    onSuccess: () => {
      router.push("/charts");
    },
  });

  const handleCancel = () => {
    if (form.isDirty) {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
    }
    router.push("/charts");
  };

  return (
    <div className="mx-auto max-w-2xl p-5 lg:p-8">
      <Link
        href="/charts"
        className="group text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Charts
      </Link>

      <h1 className="font-fraunces text-foreground mb-6 text-2xl font-semibold">Add New Chart</h1>

      <form onSubmit={form.handleSubmit} className="space-y-5">
        <BasicInfoSection
          name={form.values.name}
          designerId={form.values.designerId}
          coverImageUrl={form.values.coverImageUrl}
          digitalFileUrl={form.values.digitalFileUrl}
          designers={form.designers}
          onNameChange={(v) => form.setField("name", v)}
          onDesignerChange={(v) => form.setField("designerId", v)}
          onCoverImageChange={(key) => form.setField("coverImageUrl", key)}
          onCoverImageRemove={() => {
            form.setField("coverImageUrl", null);
            form.setField("coverThumbnailUrl", null);
          }}
          onDigitalFileChange={(key) => form.setField("digitalFileUrl", key)}
          onDigitalFileRemove={() => form.setField("digitalFileUrl", null)}
          onAddDesigner={form.handleAddDesigner}
          errors={{
            name: form.errors["chart.name"],
          }}
        />

        <StitchCountSection
          stitchesWide={form.values.stitchesWide}
          stitchesHigh={form.values.stitchesHigh}
          stitchCount={form.values.stitchCount}
          onWidthChange={(v) => form.setField("stitchesWide", parseInt(v) || 0)}
          onHeightChange={(v) => form.setField("stitchesHigh", parseInt(v) || 0)}
          onCountChange={(v) => form.setField("stitchCount", parseInt(v) || 0)}
          errors={{
            stitchCount: form.errors["chart.stitchCount"],
          }}
        />

        <GenreSection
          genres={form.genres}
          selectedIds={form.values.genreIds}
          onToggle={(id) => {
            const ids = form.values.genreIds.includes(id)
              ? form.values.genreIds.filter((g) => g !== id)
              : [...form.values.genreIds, id];
            form.setField("genreIds", ids);
          }}
          onAddGenre={form.handleAddGenre}
        />

        <PatternTypeSection
          isPaperChart={form.values.isPaperChart}
          isFormalKit={form.values.isFormalKit}
          isSAL={form.values.isSAL}
          kitColorCount={form.values.kitColorCount}
          onFormatChange={(isPaper) => form.setField("isPaperChart", isPaper)}
          onFormalKitChange={(checked) => form.setField("isFormalKit", checked)}
          onSALChange={(checked) => form.setField("isSAL", checked)}
          onKitColorCountChange={(v) =>
            form.setField("kitColorCount", v ? parseInt(v) || null : null)
          }
          errors={{
            kitColorCount: form.errors["chart.kitColorCount"],
          }}
        />

        <ProjectSetupSection
          status={form.values.status}
          projectBin={form.values.projectBin}
          ipadApp={form.values.ipadApp}
          needsOnionSkinning={form.values.needsOnionSkinning}
          onStatusChange={(v) => form.setField("status", v as ProjectStatus)}
          onBinChange={(v) => form.setField("projectBin", v)}
          onAppChange={(v) => form.setField("ipadApp", v)}
          onOnionSkinningChange={(v) => form.setField("needsOnionSkinning", v)}
          errors={{
            status: form.errors["project.status"],
          }}
        />

        <DatesSection
          startDate={form.values.startDate}
          finishDate={form.values.finishDate}
          ffoDate={form.values.ffoDate}
          onStartDateChange={(v) => form.setField("startDate", v)}
          onFinishDateChange={(v) => form.setField("finishDate", v)}
          onFfoDateChange={(v) => form.setField("ffoDate", v)}
          errors={{
            startDate: form.errors["project.startDate"],
            finishDate: form.errors["project.finishDate"],
            ffoDate: form.errors["project.ffoDate"],
          }}
        />

        <GoalsSection
          wantToStartNext={form.values.wantToStartNext}
          preferredStartSeason={form.values.preferredStartSeason}
          onWantToStartChange={(v) => form.setField("wantToStartNext", v)}
          onPreferenceChange={(v) => form.setField("preferredStartSeason", v)}
        />

        <NotesSection notes={form.values.notes} onNotesChange={(v) => form.setField("notes", v)} />

        {form.errors._form && (
          <p role="alert" className="text-destructive text-sm">
            {form.errors._form}
          </p>
        )}

        <div className="border-border mt-8 flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.isPending}>
            {form.isPending ? "Adding..." : "Add Chart"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/charts/chart-add-form.tsx
git commit -m "feat: add ChartAddForm full-page surface component

Composes 8 sections with useChartForm hook. Back link, Fraunces heading,
scrolling sections layout, cancel with dirty check, submit with spinner."
```

---

## Task 13: ChartEditModal Surface

**Files:**

- Create: `src/components/features/charts/chart-edit-modal.tsx`

<read_first>

- product-plan/sections/project-management/components/ChartFormModal.tsx
- product-plan/sections/project-management/chart-edit-modal.png
- docs/superpowers/specs/2026-03-28-chart-form-rebuild-design.md (section 4b)
  </read_first>

- [ ] **Step 1: Create ChartEditModal**

Create `src/components/features/charts/chart-edit-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import { useChartForm } from "./use-chart-form";
import { BasicInfoSection } from "./sections/basic-info-section";
import { StitchCountSection } from "./sections/stitch-count-section";
import { GenreSection } from "./sections/genre-section";
import { PatternTypeSection } from "./sections/pattern-type-section";
import { ProjectSetupSection } from "./sections/project-setup-section";
import { DatesSection } from "./sections/dates-section";
import { GoalsSection } from "./sections/goals-section";
import { NotesSection } from "./sections/notes-section";
import { cn } from "@/lib/utils";

interface ChartEditModalProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type TabId = "basic" | "details";

export function ChartEditModal({
  chart,
  designers,
  genres,
  open,
  onOpenChange,
  onSuccess,
}: ChartEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const form = useChartForm({
    mode: "edit",
    initialData: chart,
    designers,
    genres,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleClose = () => {
    if (form.isDirty) {
      if (!window.confirm("You have unsaved changes. Discard?")) return;
    }
    onOpenChange(false);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Details" },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="border-border/60 flex max-h-[90vh] max-w-2xl flex-col border p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-fraunces text-foreground text-lg font-semibold">Edit Chart</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1 transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-border mt-4 flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-4 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <form onSubmit={form.handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === "basic" && (
              <div className="space-y-5">
                <BasicInfoSection
                  name={form.values.name}
                  designerId={form.values.designerId}
                  coverImageUrl={form.values.coverImageUrl}
                  digitalFileUrl={form.values.digitalFileUrl}
                  designers={form.designers}
                  onNameChange={(v) => form.setField("name", v)}
                  onDesignerChange={(v) => form.setField("designerId", v)}
                  onCoverImageChange={(key) => form.setField("coverImageUrl", key)}
                  onCoverImageRemove={() => {
                    form.setField("coverImageUrl", null);
                    form.setField("coverThumbnailUrl", null);
                  }}
                  onDigitalFileChange={(key) => form.setField("digitalFileUrl", key)}
                  onDigitalFileRemove={() => form.setField("digitalFileUrl", null)}
                  onAddDesigner={form.handleAddDesigner}
                  errors={{ name: form.errors["chart.name"] }}
                />
                <StitchCountSection
                  stitchesWide={form.values.stitchesWide}
                  stitchesHigh={form.values.stitchesHigh}
                  stitchCount={form.values.stitchCount}
                  onWidthChange={(v) => form.setField("stitchesWide", parseInt(v) || 0)}
                  onHeightChange={(v) => form.setField("stitchesHigh", parseInt(v) || 0)}
                  onCountChange={(v) => form.setField("stitchCount", parseInt(v) || 0)}
                  errors={{
                    stitchCount: form.errors["chart.stitchCount"],
                  }}
                />
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-5">
                <GenreSection
                  genres={form.genres}
                  selectedIds={form.values.genreIds}
                  onToggle={(id) => {
                    const ids = form.values.genreIds.includes(id)
                      ? form.values.genreIds.filter((g) => g !== id)
                      : [...form.values.genreIds, id];
                    form.setField("genreIds", ids);
                  }}
                  onAddGenre={form.handleAddGenre}
                />
                <PatternTypeSection
                  isPaperChart={form.values.isPaperChart}
                  isFormalKit={form.values.isFormalKit}
                  isSAL={form.values.isSAL}
                  kitColorCount={form.values.kitColorCount}
                  onFormatChange={(isPaper) => form.setField("isPaperChart", isPaper)}
                  onFormalKitChange={(checked) => form.setField("isFormalKit", checked)}
                  onSALChange={(checked) => form.setField("isSAL", checked)}
                  onKitColorCountChange={(v) =>
                    form.setField("kitColorCount", v ? parseInt(v) || null : null)
                  }
                  errors={{
                    kitColorCount: form.errors["chart.kitColorCount"],
                  }}
                />
                <ProjectSetupSection
                  status={form.values.status}
                  projectBin={form.values.projectBin}
                  ipadApp={form.values.ipadApp}
                  needsOnionSkinning={form.values.needsOnionSkinning}
                  onStatusChange={(v) => form.setField("status", v as ProjectStatus)}
                  onBinChange={(v) => form.setField("projectBin", v)}
                  onAppChange={(v) => form.setField("ipadApp", v)}
                  onOnionSkinningChange={(v) => form.setField("needsOnionSkinning", v)}
                  errors={{ status: form.errors["project.status"] }}
                />
                <DatesSection
                  startDate={form.values.startDate}
                  finishDate={form.values.finishDate}
                  ffoDate={form.values.ffoDate}
                  onStartDateChange={(v) => form.setField("startDate", v)}
                  onFinishDateChange={(v) => form.setField("finishDate", v)}
                  onFfoDateChange={(v) => form.setField("ffoDate", v)}
                  errors={{
                    startDate: form.errors["project.startDate"],
                    finishDate: form.errors["project.finishDate"],
                    ffoDate: form.errors["project.ffoDate"],
                  }}
                />
                <GoalsSection
                  wantToStartNext={form.values.wantToStartNext}
                  preferredStartSeason={form.values.preferredStartSeason}
                  onWantToStartChange={(v) => form.setField("wantToStartNext", v)}
                  onPreferenceChange={(v) => form.setField("preferredStartSeason", v)}
                />
                <NotesSection
                  notes={form.values.notes}
                  onNotesChange={(v) => form.setField("notes", v)}
                />
              </div>
            )}

            {form.errors._form && (
              <p role="alert" className="text-destructive mt-4 text-sm">
                {form.errors._form}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="border-border flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.isPending}>
              {form.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/charts/chart-edit-modal.tsx
git commit -m "feat: add ChartEditModal tabbed dialog surface component

shadcn Dialog with Basic Info and Details tabs. Same sections as add form,
shared via useChartForm hook. isDirty guard on close, form persists across tabs."
```

---

## Task 14: Update Route Pages

**Files:**

- Modify: `src/app/(dashboard)/charts/new/page.tsx`
- Modify: `src/app/(dashboard)/charts/[id]/edit/page.tsx`

- [ ] **Step 1: Update new chart page**

In `src/app/(dashboard)/charts/new/page.tsx`, change the import from `ChartForm` to `ChartAddForm`:

Replace:

```tsx
import { ChartForm } from "@/components/features/charts/chart-form";
```

With:

```tsx
import { ChartAddForm } from "@/components/features/charts/chart-add-form";
```

Replace:

```tsx
return <ChartForm mode="add" designers={designers} genres={genres} />;
```

With:

```tsx
return <ChartAddForm designers={designers} genres={genres} />;
```

- [ ] **Step 2: Update edit chart page**

The edit page currently renders the form directly. With the new architecture, the edit modal should be triggered from the chart detail page, not from a dedicated route. However, to maintain the existing URL structure and keep things working, we'll adapt the edit page to render the modal in an "always open" state that redirects back on close.

In `src/app/(dashboard)/charts/[id]/edit/page.tsx`:

Replace the entire file content with:

```tsx
import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getDesigners } from "@/lib/actions/designer-actions";
import { getGenres } from "@/lib/actions/genre-actions";
import { EditChartPageClient } from "./edit-client";

export default async function EditChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [chart, designers, genres] = await Promise.all([getChart(id), getDesigners(), getGenres()]);

  if (!chart) notFound();

  return <EditChartPageClient chart={chart} designers={designers} genres={genres} />;
}
```

- [ ] **Step 3: Create EditChartPageClient**

Create `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import type { Designer, Genre } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import { ChartEditModal } from "@/components/features/charts/chart-edit-modal";

interface EditChartPageClientProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
}

export function EditChartPageClient({ chart, designers, genres }: EditChartPageClientProps) {
  const router = useRouter();

  return (
    <ChartEditModal
      chart={chart}
      designers={designers}
      genres={genres}
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push(`/charts/${chart.id}`);
        }
      }}
      onSuccess={() => {
        router.push(`/charts/${chart.id}`);
      }}
    />
  );
}
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds. All imports resolve.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/charts/new/page.tsx src/app/(dashboard)/charts/[id]/edit/page.tsx src/app/(dashboard)/charts/[id]/edit/edit-client.tsx
git commit -m "feat: wire route pages to new ChartAddForm and ChartEditModal

/charts/new renders ChartAddForm directly.
/charts/[id]/edit renders ChartEditModal in always-open mode,
redirecting to chart detail on close or success."
```

---

## Task 15: Integration Tests — ChartAddForm

**Files:**

- Create: `src/components/features/charts/chart-add-form.test.tsx`

- [ ] **Step 1: Write add form integration tests**

Create `src/components/features/charts/chart-add-form.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartAddForm } from "./chart-add-form";

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

vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
}));

vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

const mockDesigners = [
  { id: "d1", name: "Designer One", website: null, createdAt: new Date(), updatedAt: new Date() },
];

const mockGenres = [
  { id: "g1", name: "Sampler", createdAt: new Date(), updatedAt: new Date() },
  { id: "g2", name: "Landscape", createdAt: new Date(), updatedAt: new Date() },
];

describe("ChartAddForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 8 form sections", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Stitch Count & Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Genre(s)")).toBeInTheDocument();
    expect(screen.getByText("Pattern Type")).toBeInTheDocument();
    expect(screen.getByText("Project Setup")).toBeInTheDocument();
    expect(screen.getByText("Dates")).toBeInTheDocument();
    expect(screen.getByText("Goals & Planning")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("shows Add Chart submit button", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByRole("button", { name: /add chart/i })).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty name", async () => {
    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    // Fill in stitch count to avoid that error
    const countInput = screen.getByLabelText(/total stitch count/i);
    await user.type(countInput, "5000");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Chart name is required")).toBeInTheDocument();
    });
    expect(mockCreateChart).not.toHaveBeenCalled();
  });

  it("shows stitch count error when no count or dimensions provided", async () => {
    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    const nameInput = screen.getByLabelText(/chart name/i);
    await user.type(nameInput, "Test Chart");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter a stitch count or both width and height")).toBeInTheDocument();
    });
    expect(mockCreateChart).not.toHaveBeenCalled();
  });

  it("calls createChart with valid data and redirects on success", async () => {
    mockCreateChart.mockResolvedValue({
      success: true,
      chartId: "new-id",
    });

    const user = userEvent.setup();
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    await user.type(screen.getByLabelText(/chart name/i), "My Test Chart");
    await user.type(screen.getByLabelText(/total stitch count/i), "10000");

    await user.click(screen.getByRole("button", { name: /add chart/i }));

    await waitFor(() => {
      expect(mockCreateChart).toHaveBeenCalledTimes(1);
    });

    const callArg = mockCreateChart.mock.calls[0][0];
    expect(callArg.chart.name).toBe("My Test Chart");
    expect(callArg.chart.stitchCount).toBe(10000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/charts");
    });
  });

  it("renders genre pills from provided genres", () => {
    render(<ChartAddForm designers={mockDesigners} genres={mockGenres} />);

    expect(screen.getByText("Sampler")).toBeInTheDocument();
    expect(screen.getByText("Landscape")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --reporter=verbose src/components/features/charts/chart-add-form.test.tsx 2>&1
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/charts/chart-add-form.test.tsx
git commit -m "test: add ChartAddForm integration tests

Tests section rendering, validation error display (empty name, missing
stitch count), successful submission with redirect, and genre pill rendering."
```

---

## Task 16: Integration Tests — ChartEditModal

**Files:**

- Create: `src/components/features/charts/chart-edit-modal.test.tsx`

- [ ] **Step 1: Write edit modal integration tests**

Create `src/components/features/charts/chart-edit-modal.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ChartEditModal } from "./chart-edit-modal";
import type { ChartWithProject } from "@/types/chart";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockUpdateChart = vi.fn();
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: vi.fn(),
  updateChart: (...args: unknown[]) => mockUpdateChart(...args),
}));

vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
}));

vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

const mockChart: ChartWithProject = {
  id: "chart-1",
  name: "Test Chart",
  designerId: null,
  coverImageUrl: null,
  coverThumbnailUrl: null,
  stitchCount: 5000,
  stitchCountApproximate: false,
  stitchesWide: 100,
  stitchesHigh: 50,
  isPaperChart: false,
  isFormalKit: false,
  isSAL: false,
  kitColorCount: null,
  digitalWorkingCopyUrl: null,
  notes: null,
  dateAdded: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  project: {
    id: "proj-1",
    chartId: "chart-1",
    userId: "1",
    status: "IN_PROGRESS",
    startDate: new Date("2026-01-15"),
    finishDate: null,
    ffoDate: null,
    fabricId: null,
    projectBin: null,
    ipadApp: null,
    needsOnionSkinning: false,
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  designer: null,
  genres: [],
};

const mockDesigners = [
  { id: "d1", name: "Designer One", website: null, createdAt: new Date(), updatedAt: new Date() },
];

const mockGenres = [{ id: "g1", name: "Sampler", createdAt: new Date(), updatedAt: new Date() }];

describe("ChartEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with pre-populated chart name", () => {
    render(
      <ChartEditModal
        chart={mockChart}
        designers={mockDesigners}
        genres={mockGenres}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Test Chart")).toBeInTheDocument();
  });

  it("shows Basic Info and Details tabs", () => {
    render(
      <ChartEditModal
        chart={mockChart}
        designers={mockDesigners}
        genres={mockGenres}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("shows Save Changes button", () => {
    render(
      <ChartEditModal
        chart={mockChart}
        designers={mockDesigners}
        genres={mockGenres}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls updateChart with correct chartId on submit", async () => {
    mockUpdateChart.mockResolvedValue({ success: true });
    const onOpenChange = vi.fn();

    const user = userEvent.setup();
    render(
      <ChartEditModal
        chart={mockChart}
        designers={mockDesigners}
        genres={mockGenres}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateChart).toHaveBeenCalledTimes(1);
      expect(mockUpdateChart.mock.calls[0][0]).toBe("chart-1");
    });
  });

  it("switches tabs and preserves field values", async () => {
    const user = userEvent.setup();
    render(
      <ChartEditModal
        chart={mockChart}
        designers={mockDesigners}
        genres={mockGenres}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Verify initial value on Basic Info tab
    expect(screen.getByDisplayValue("Test Chart")).toBeInTheDocument();

    // Switch to Details tab
    await user.click(screen.getByText("Details"));

    // Switch back to Basic Info
    await user.click(screen.getByText("Basic Info"));

    // Name should still be there
    expect(screen.getByDisplayValue("Test Chart")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run all chart tests**

```bash
npm test -- --reporter=verbose src/components/features/charts/ 2>&1
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/charts/chart-edit-modal.test.tsx
git commit -m "test: add ChartEditModal integration tests

Tests pre-populated values, tab rendering, Save Changes button,
updateChart server action call, and tab switching value persistence."
```

---

## Task 17: Full Build Verification

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: No type errors.

- [ ] **Step 2: Run full test suite**

```bash
npm test 2>&1
```

Expected: All tests pass.

- [ ] **Step 3: Run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds.

- [ ] **Step 4: Run Prettier**

```bash
npm run format
```

- [ ] **Step 5: Final commit if formatting changed anything**

```bash
git add -A
git diff --cached --stat
# Only commit if there are changes
git commit -m "style: format chart form rebuild files" 2>/dev/null || true
```

---

## Spec Coverage Checklist

| Spec Section                                           | Task(s)          | Covered |
| ------------------------------------------------------ | ---------------- | ------- |
| Architecture (hook + sections + primitives + surfaces) | Tasks 3-13       | Yes     |
| Design token rules (no hardcoded colors)               | Tasks 3-8, 12-13 | Yes     |
| ChartAddForm (full page)                               | Task 12          | Yes     |
| ChartEditModal (tabbed dialog)                         | Task 13          | Yes     |
| useChartForm hook (all state, validation, submit)      | Task 10          | Yes     |
| FormField primitive                                    | Task 3           | Yes     |
| SectionHeading primitive                               | Task 3           | Yes     |
| StyledCheckbox primitive                               | Task 4           | Yes     |
| SearchableSelect primitive                             | Task 5           | Yes     |
| GenrePicker primitive                                  | Task 6           | Yes     |
| CoverImageUpload (moved + rewired)                     | Task 8           | Yes     |
| FileUpload (moved + rewired)                           | Task 8           | Yes     |
| StitchCountFields                                      | Task 7           | Yes     |
| PatternTypeFields                                      | Task 7           | Yes     |
| StartPreferenceFields                                  | Task 7           | Yes     |
| InlineDesignerDialog                                   | Task 9           | Yes     |
| 8 section components                                   | Task 11          | Yes     |
| Zod schema upload URL extension                        | Task 2           | Yes     |
| Server action upload URL persistence                   | Task 2           | Yes     |
| Route page updates                                     | Task 14          | Yes     |
| Integration tests (add form)                           | Task 15          | Yes     |
| Integration tests (edit modal)                         | Task 16          | Yes     |
| Accessibility (aria, fieldset, role=alert)             | Throughout       | Yes     |
| Dirty tracking + beforeunload                          | Task 10          | Yes     |
| Friendly error messages                                | Task 10          | Yes     |
| DRY (shared hook, sections, primitives)                | Architecture     | Yes     |
| Files to delete                                        | Task 1           | Yes     |
