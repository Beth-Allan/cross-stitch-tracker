# Chart Form Rebuild — Design Spec

**Date:** 2026-03-28
**Scope:** Ground-up rebuild of chart add/edit form UI to match DesignOS design
**Approach:** Delete existing form components, rebuild from design reference with refinements

---

## 1. Context

The chart form was built during Phase 2 plans 01-04 without following the DesignOS design reference. The result diverges from the design in ~15 significant ways: wrong input types (checkboxes instead of radios), missing sub-components (size badges, inline genre add), disconnected upload components, missing visual patterns (section borders, dimension labels), and generic fallbacks where custom interactions were specified.

This rebuild replaces the form UI layer only. Server actions (`chart-actions.ts`), Zod schemas (`chart.ts`), types (`chart.ts`), and route pages stay as-is with minor updates.

### Design Reference (Source of Truth)

| File                                                                     | Purpose                   |
| ------------------------------------------------------------------------ | ------------------------- |
| `product-plan/sections/project-management/components/ChartAddForm.tsx`   | Full-page add form layout |
| `product-plan/sections/project-management/components/ChartFormModal.tsx` | Tabbed edit modal layout  |
| `product-plan/sections/project-management/components/FormFields.tsx`     | All shared sub-components |
| `product-plan/sections/project-management/chart-add-form.png`            | Add form screenshot       |
| `product-plan/sections/project-management/chart-edit-modal.png`          | Edit modal screenshot     |
| `product-plan/sections/project-management/types.ts`                      | TypeScript interfaces     |

---

## 2. Architecture

### Component Structure

```
src/components/features/charts/
  ├── use-chart-form.ts              # Hook: all form state, handlers, validation, submit
  ├── chart-add-form.tsx             # Full-page add form shell (Client Component)
  ├── chart-edit-modal.tsx           # Tabbed edit modal shell (Client Component)
  ├── sections/
  │   ├── basic-info-section.tsx     # Name, Designer, Cover Image, Digital Working Copy
  │   ├── stitch-count-section.tsx   # Dimensions + Total + Size badge + auto-calc
  │   ├── genre-section.tsx          # GenrePicker + Series (disabled, Phase 5)
  │   ├── pattern-type-section.tsx   # Radio group + conditional Kit Colours + SAL
  │   ├── project-setup-section.tsx  # Status, Fabric (disabled), Bin, App, Onion Skinning
  │   ├── dates-section.tsx          # Start / Finish / FFO in 3-col grid
  │   ├── goals-section.tsx          # Want to start next + Preferred Start composite
  │   └── notes-section.tsx          # Textarea for freeform notes
  ├── form-primitives/
  │   ├── form-field.tsx             # Label + hint + error wrapper
  │   ├── section-heading.tsx        # Section divider (border-t + uppercase heading)
  │   ├── styled-checkbox.tsx        # Wrapper around shadcn Checkbox
  │   ├── searchable-select.tsx      # Wrapper around shadcn Popover + Command (cmdk)
  │   ├── genre-picker.tsx           # Pill toggles + inline text input add
  │   ├── cover-image-upload.tsx     # Drop zone (existing component, rewired)
  │   ├── file-upload.tsx            # Button upload (existing component, rewired)
  │   ├── stitch-count-fields.tsx    # W × H inputs + total + size badge + hints
  │   ├── pattern-type-fields.tsx    # Radio group + conditional Kit Colours reveal
  │   └── start-preference-fields.tsx # Period select + Year select composite
  ├── inline-designer-dialog.tsx     # Dialog for creating designers (name + website)
  ├── chart-add-form.test.tsx        # Integration tests (colocated per CLAUDE.md convention)
  └── chart-edit-modal.test.tsx      # Edit modal behavior tests (colocated)
```

### Layers

1. **Form primitives** — reusable input components. Each wraps shadcn primitives (Checkbox, Input, Label, Select) or builds a custom interaction (GenrePicker, StitchCountFields). No form state awareness.
2. **Sections** — compose primitives into field groups with SectionHeading dividers. Receive values and handlers via props from the hook.
3. **Surfaces** — `chart-add-form.tsx` and `chart-edit-modal.tsx` compose sections into their respective layouts. Both consume `useChartForm`.
4. **Hook** — `useChartForm` owns all form state, validation, dirty tracking, and submit logic.

### Data Flow

```
Route page (Server Component)
  → fetches designers, genres, chart data (if editing)
  → renders Client form component with data as props

Client form component (chart-add-form or chart-edit-modal)
  → calls useChartForm({ mode, initialData, designers, genres, onSuccess })
  → hook returns: values, handlers, errors, isPending, isDirty, handleSubmit
  → composes sections, passing relevant slices of hook return
  → sections compose primitives with values + onChange

Submit flow:
  → handleSubmit → Zod parse → field errors OR server action call
  → server action returns success/error
  → success: toast + redirect (add) or toast + close (edit)
  → error: toast with error message, form re-enabled
```

### DRY Enforcement

| Concern                    | Single Location               | Consumers                           |
| -------------------------- | ----------------------------- | ----------------------------------- |
| Form state (20+ fields)    | `useChartForm` hook           | Both surfaces                       |
| Validation + error mapping | `useChartForm` hook           | Both surfaces                       |
| Field layout per section   | `sections/*.tsx`              | Both surfaces compose same sections |
| Input styling/behavior     | `form-primitives/*.tsx`       | Sections                            |
| Server action calls        | `chart-actions.ts` (existing) | Hook                                |
| Design tokens              | `globals.css` semantic tokens | All components                      |

---

## 3. Design Token Rules

All components use semantic tokens from `globals.css`. No hardcoded Tailwind color names (emerald-600, stone-200, etc.) except inside config lookup tables.

| DesignOS Hardcoded                         | Rebuild Uses                                                        |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `bg-emerald-600`, `hover:bg-emerald-700`   | `bg-primary`, `hover:bg-primary/90`                                 |
| `text-emerald-700`, `text-emerald-600`     | `text-primary`                                                      |
| `bg-emerald-50`, `bg-emerald-50/50`        | `bg-primary/10`                                                     |
| `border-emerald-300`, `border-emerald-500` | `border-primary`, `focus:border-primary`                            |
| `ring-emerald-500/40`                      | `ring-ring`                                                         |
| `accent-emerald-600`                       | `accent-primary` (via shadcn Checkbox)                              |
| `bg-stone-100`, `text-stone-600`           | `bg-muted`, `text-muted-foreground`                                 |
| `text-stone-400`, `text-stone-500`         | `text-muted-foreground` (or `text-muted-foreground/70` for lighter) |
| `border-stone-200`                         | `border-border`                                                     |
| `bg-white`                                 | `bg-background` or `bg-card`                                        |
| `text-stone-900`                           | `text-foreground`                                                   |
| Status badge colors                        | Via `STATUS_CONFIG` in `status.ts` (existing)                       |
| Size badge colors                          | New `SIZE_CONFIG` lookup table, same pattern as `STATUS_CONFIG`     |
| Genre pill selected                        | `bg-primary/10 text-primary border-primary/30`                      |
| Genre pill unselected                      | `bg-muted text-muted-foreground border-border`                      |

**Dark mode:** Semantic tokens handle light/dark automatically. Components that use opacity variants (e.g., `bg-primary/10`) work in both modes. Size and status badge lookup tables must include dark variants.

---

## 4. Two Form Surfaces

### 4a. ChartAddForm (Full Page)

**Route:** `/charts/new`
**Container:** `p-5 lg:p-8 max-w-2xl mx-auto`

**Header:**

- Back link: `← Charts` (ArrowLeft icon + text, links to `/charts`)
- Styled: `text-muted-foreground hover:text-foreground`, arrow nudges left on hover (`group-hover:-translate-x-0.5`)
- Page title: `h1`, Fraunces serif (`font-fraunces`), `text-2xl font-semibold text-foreground`

**Body:** `<form>` with `space-y-5`, sections in order:

1. BasicInfoSection
2. StitchCountSection
3. GenreSection
4. PatternTypeSection
5. ProjectSetupSection
6. DatesSection
7. GoalsSection
8. NotesSection

**Footer:** `mt-8 pt-5 border-t border-border`

- Cancel: ghost button, links to `/charts`
- Submit: `bg-primary text-primary-foreground`, label "Add Chart"
- Right-aligned, `gap-3`
- Submit shows spinner when `isPending`, disabled during submission

### 4b. ChartEditModal (Tabbed Modal)

**Trigger:** opened from chart detail page or chart list
**Implementation:** Uses shadcn `<Dialog>` (Radix) for focus trapping, escape handling, ARIA attributes, and overlay click — restyled to match the DesignOS visual design.
**Overlay:** `DialogOverlay` styled as `bg-black/40 backdrop-blur-sm`
**Panel:** `DialogContent` styled as `bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border/60 p-0` (reset default padding, sections control their own)
**Close behavior:** Overlay click and Escape key trigger close, but if `isDirty` is true, show `window.confirm("You have unsaved changes. Discard?")` before closing. Radix Dialog exposes `onOpenChange` which we intercept for this check.

**Header:** `px-6 pt-5 pb-0`

- Title: "Edit Chart", Fraunces serif, `text-lg font-semibold`
- X close button top-right (also respects isDirty check)

**Tab bar:** `px-6 mt-4 border-b border-border`

- Two tabs: "Basic Info" (default), "Details"
- Active: `border-b-2 border-primary text-primary`
- Inactive: `text-muted-foreground border-transparent`

**Tab content:** `flex-1 overflow-y-auto px-6 py-5`

- **Basic Info tab:**
  - BasicInfoSection
  - StitchCountSection

- **Details tab:**
  - GenreSection
  - PatternTypeSection
  - ProjectSetupSection
  - DatesSection
  - GoalsSection
  - NotesSection

Form state persists across tab switches (state lives in hook, not in tab content).

**Footer:** `px-6 py-4 border-t border-border`

- Cancel: ghost button, closes modal
- Submit: "Save Changes", same primary style as add form
- Right-aligned, `gap-3`

---

## 5. Shared Hook: useChartForm

```typescript
interface UseChartFormOptions {
  mode: "create" | "edit";
  initialData?: ChartWithProject; // includes chart.id and project.id for edit mode
  designers: Designer[];
  genres: Genre[];
  onSuccess: (chartId: string) => void;
}

// In edit mode, initialData.id (chartId) and initialData.project.id (projectId)
// are passed to the updateChart server action. The hook extracts these internally.

interface UseChartFormReturn {
  // Chart fields
  values: {
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
    seriesIds: string[]; // disabled, empty for now
    isPaperChart: boolean;
    isFormalKit: boolean;
    kitColorCount: number | null;
    isSAL: boolean;
    notes: string;
    // Project fields
    status: ProjectStatus;
    fabricId: string | null; // disabled, null for now
    projectBin: string | null;
    ipadApp: string | null;
    needsOnionSkinning: boolean;
    startDate: string;
    finishDate: string;
    ffoDate: string;
    wantToStartNext: boolean;
    preferredStartSeason: string | null;
    startingStitches: number;
  };

  // Handlers — sections destructure what they need
  // For number fields (stitchesWide, stitchCount, kitColorCount, startingStitches),
  // setField accepts the raw string from the input and coerces to number internally
  // (parseInt with fallback to 0, or null for nullable fields like kitColorCount).
  setField: <K extends keyof Values>(key: K, value: Values[K]) => void;

  // Computed
  effectiveStitchCount: number;
  sizeCategory: SizeCategory | null;
  isAutoCalculated: boolean;

  // Form meta
  errors: Record<string, string>; // field path → friendly error message
  isPending: boolean;
  isDirty: boolean;
  handleSubmit: (e: FormEvent) => void;

  // Entity lists (mutable — updated after inline creation)
  designers: Designer[];
  genres: Genre[];

  // Inline creation handlers
  handleAddDesigner: (name: string, website?: string) => Promise<void>;
  handleAddGenre: (name: string) => Promise<void>;
}
```

**Dirty tracking:** Compare current values to initial values (deep equality on the values object). Used for unsaved changes warning.

**Unsaved changes warning:** See Section 11 for full details. `beforeunload` for browser navigation, `window.confirm()` for in-app navigation via cancel/back buttons.

**Validation error messages:** Friendly, not dev-speak. Examples:

- "Chart name is required" (not "chart.name: Required")
- "Enter a stitch count or both dimensions" (not "Refinement failed")
- "Kit color count must be a positive number" (not "Expected number, received NaN")

Error mapping lives in the hook — a `formatErrors` function translates Zod issue paths to friendly strings.

**Auto-calculation logic:**

- When `stitchesWide > 0 && stitchesHigh > 0 && stitchCount === 0`: effective count = W × H
- `stitchCountApproximate` set to `true` for auto-calculated values
- `sizeCategory` computed from effective count using thresholds: Mini (<1K), Small (1K-5K), Medium (5K-25K), Large (25K-50K), BAP (50K+)

---

## 6. Form Primitives

### 6a. FormField

Wrapper rendering a label above children with optional hint and error.

- Label: `text-xs uppercase tracking-wider text-muted-foreground`, uses shadcn `<Label>`
- Hint: `text-xs text-muted-foreground/70 mt-1`
- Error: `text-xs text-destructive mt-1` (replaces hint when error present)
- Props: `label`, `hint?`, `error?`, `required?`, `children`
- `required` adds a visually-hidden "(required)" for screen readers, no asterisk in visual design

### 6b. SectionHeading

`h2` styled as: `text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-5 pb-3 border-t border-border/60`

Props: `title: string`, `showBorder?: boolean` (defaults to `true`). BasicInfoSection passes `showBorder={false}` since it's always the first section. All other sections use the default. No CSS `:first-child` trick needed — explicit props are clearer and work regardless of DOM nesting.

### 6c. StyledCheckbox

Wrapper around shadcn `<Checkbox>` with:

- Emerald accent via semantic tokens
- Label in `text-sm text-foreground` with hover transition
- `<label>` wraps both checkbox and text for full clickable area
- Proper `aria-checked` (provided by shadcn)

### 6d. SearchableSelect

Wrapper around shadcn `<Popover>` + `<Command>` (cmdk):

- Trigger: button styled to match input appearance (`border-border bg-background`)
- ChevronDown icon on right
- Command input with search icon
- Items: `text-sm`, selected item shows checkmark + `bg-primary/10 text-primary`
- Hover: `bg-primary/5`
- "Add new" button at bottom of list (below separator): `text-primary`, "+" icon + quoted search term
- Clear button (X) appears outside trigger when value is selected
- Props: `options: Array<{value, label}>`, `value`, `onChange`, `onAddNew?`, `placeholder?`, `disabled?`

### 6e. GenrePicker

Pill toggle grid with inline add:

- Container: `flex flex-wrap gap-2`
- Selected pill: `bg-primary/10 border-primary/30 text-primary`
- Unselected pill: `bg-muted border-border text-muted-foreground`, hover: `border-border/80`
- All pills: `text-xs px-3 py-1.5 rounded-full border transition-colors`
- "Add" button: dashed border pill at end of row
- Clicking "Add": replaces the dashed pill with an inline `<input>`, `autoFocus`, `w-40`, `rounded-full`, `border-primary/30`
- Enter: calls `onAddGenre(name)`, resets input, hides
- Escape/blur: cancels without saving
- Props: `genres: Genre[]`, `selectedIds: string[]`, `onToggle`, `onAddGenre`

### 6f. CoverImageUpload

Existing component (`cover-image-upload.tsx`), rewired into form:

- Drop zone: `border-2 border-dashed border-border rounded-lg p-6 text-center`
- Hover: `border-primary/50`
- Icon: ImagePlus, `text-muted-foreground/50`, hover: `text-primary/60`
- Text: "Drop an image here or click to upload" / "PNG, JPG up to 5MB"
- States: idle, uploading (spinner), complete (thumbnail preview + remove button), error
- Graceful degradation: if R2 not configured, shows upload UI but displays friendly error on attempt ("File storage not configured yet — uploads will be available soon")
- Props: `value: string | null`, `onChange`, `onError`

### 6g. FileUpload

Existing component (`file-upload.tsx`), rewired for digital working copy:

- Button-style upload (no drag-drop)
- States: idle, uploading, complete (filename + remove), error
- Same R2 graceful degradation
- Props: `value: string | null`, `onChange`, `onError`, `accept?`, `maxSize?`

### 6h. StitchCountFields

Composite of two FormField instances:

**Dimensions (stitches):**

- Two number inputs in flex row with inline labels: `[width input] w × [height input] h`
- Inputs use `flex-1`, separator labels use `shrink-0 text-sm text-muted-foreground px-2`

**Total Stitch Count:**

- Single number input
- Placeholder: shows calculated count (`toLocaleString()`) when dimensions set, otherwise "0"
- Dynamic hint: "Leave empty to auto-calculate from dimensions" when empty, "Auto-calculated from W × H. Clear to enter an exact count." when auto-calculated
- When effective count > 0, renders badge row below:
  - Size badge: pill using `SIZE_CONFIG` lookup (same pattern as `STATUS_CONFIG`)
  - If auto-calculated: amber indicator pill `bg-secondary/10 text-secondary` — "Auto-calculated"

### 6i. PatternTypeFields

Composite with three parts:

1. **Format radio group:** `<fieldset>` with two native `<input type="radio">` — "Digital Chart" (default) / "Paper Chart"
   - `flex gap-4`, `accent-primary`
   - Proper `<legend>` for screen readers (visually hidden, SectionHeading serves as visual label)
   - **Decision:** Native radio inputs, not shadcn RadioGroup (which is not installed). For two options, native `<input type="radio">` with `accent-primary` is KISS-compliant and avoids adding a dependency for minimal gain. If more radio groups appear later, revisit.

2. **Formal Kit checkbox** (StyledCheckbox):
   - When checked: reveals Kit Colours number input at `ml-6`
   - Unchecking resets `kitColorCount` to null

3. **SAL checkbox** (StyledCheckbox): independent

### 6j. StartPreferenceFields

Two selects in `grid grid-cols-2 gap-3`:

**Period select:** grouped `<optgroup>`:

- "Season": Spring, Summer, Fall, Winter
- "Month": January–December
- Default: "Any time"

**Year select:** 2026–2030, default: "Year"

Stored as combined string: "Spring 2027" (both), "2027" (year only), null (neither).

**Internal state management:** StartPreferenceFields manages its own two-select local state internally (`period` and `year`). On change, it combines them into a single string and calls `setField('preferredStartSeason', combined)`. In edit mode, it parses `initialData.preferredStartSeason` back into the two parts on mount. This keeps the hook's values flat and the Zod schema unchanged.

---

## 7. Section Components

Each section receives props from `useChartForm` return and composes primitives.

### 7a. BasicInfoSection

- SectionHeading: "Basic Info" (first in form, no border-t)
- FormField: Chart Name — `<Input>` text, required, placeholder "e.g. Enchanted Forest Sampler"
- FormField: Designer — SearchableSelect with `onAddNew` opening InlineDesignerDialog
- FormField: Cover Image — CoverImageUpload
- FormField: Digital Working Copy — FileUpload

### 7b. StitchCountSection

- SectionHeading: "Stitch Count & Dimensions"
- StitchCountFields composite (handles its own FormField wrappers internally)

### 7c. GenreSection

- SectionHeading: "Genre(s)"
- GenrePicker
- FormField: Series — SearchableSelect, **disabled** with hint "Available in Phase 5"

### 7d. PatternTypeSection

- SectionHeading: "Pattern Type"
- PatternTypeFields composite

### 7e. ProjectSetupSection

- SectionHeading: "Project Setup"
- FormField: Status — shadcn `<Select>` with 7 status options
- FormField: Fabric — SearchableSelect, **disabled** with hint "Available in Phase 5"
- Grid `grid-cols-2 gap-4`:
  - FormField: Project Bin — `<Select>` with options: none, Bin A, Bin B, Bin C, Bin D
  - FormField: iPad App — `<Select>` with options: none, Markup R-XP, Saga, MacStitch
- StyledCheckbox: Needs Onion Skinning

### 7f. DatesSection

- SectionHeading: "Dates"
- Grid `grid-cols-1 sm:grid-cols-3 gap-4`:
  - FormField: Start Date — `<Input type="date">`
  - FormField: Finish Date — `<Input type="date">`
  - FormField: FFO Date — `<Input type="date">`

### 7g. GoalsSection

- SectionHeading: "Goals & Planning"
- StyledCheckbox: Want to start next
- StartPreferenceFields composite

### 7h. NotesSection

- SectionHeading: "Notes"
- FormField: Notes — shadcn `<Textarea>`, 3 rows, placeholder "Any additional notes about this chart..."

---

## 8. Inline Entity Creation

### Designer (Dialog)

Uses shadcn `<Dialog>` component:

- Title: "Add New Designer"
- Fields: Name (required), Website (optional URL)
- Buttons: Cancel, "Add Designer" (primary)
- On submit: calls `createDesigner` server action, adds to local designers list, auto-selects in SearchableSelect
- Validation: Zod `designerSchema` (existing)

### Genre (Inline)

No dialog — inline text input in the GenrePicker pill row:

- Appears when "Add" dashed pill is clicked
- `autoFocus`, Enter submits, Escape cancels
- On submit: calls `createGenre` server action, adds to local genres list, auto-selects
- Validation: Zod `genreSchema` (existing)

### Error handling for inline creation

Both designer and genre creation can fail (server action returns `{ success: false, error }`). On failure:

- Show toast with the error message
- Do NOT add the entity to the local list or auto-select it
- Keep the creation UI open (dialog stays open for designer, inline input stays visible for genre) so the user can retry or correct
- GenrePicker blur-to-cancel: use `relatedTarget` check — only cancel if focus moves _outside_ the GenrePicker component, not to another element within it (e.g., a genre pill click shouldn't cancel the inline add)

---

## 9. Validation & Error Display

### Error mapping

The hook maps Zod issue paths to friendly messages:

| Zod Path                         | Friendly Message                                |
| -------------------------------- | ----------------------------------------------- |
| `chart.name`                     | "Chart name is required"                        |
| `chart.stitchCount` (refinement) | "Enter a stitch count or both width and height" |
| `chart.kitColorCount`            | "Kit color count must be a positive number"     |
| `project.status`                 | "Please select a status"                        |
| `project.startDate`              | "Invalid date format"                           |
| (any other)                      | "This field has an error" (fallback)            |

### Display

- Errors appear below the field input (inside FormField wrapper) in `text-destructive`
- Error replaces hint text when present
- Errors clear when the field value changes
- All fields with errors get `border-destructive` on their input

### Submit validation flow

1. User clicks submit
2. Hook runs `chartFormSchema.safeParse(values)`
3. If invalid: maps errors to friendly messages, sets `errors` state, does NOT call server action
4. If valid: sets `isPending`, calls server action
5. Server action error: toast with error, re-enables form
6. Server action success: toast, calls `onSuccess` (which redirects or closes modal)

---

## 10. Accessibility

- **Radio groups:** wrapped in `<fieldset>` with `<legend>` (visually hidden, SectionHeading serves as visual label)
- **Required fields:** `aria-required="true"` on inputs, `aria-describedby` linking to error/hint text
- **Error announcements:** error messages use `role="alert"` for screen reader announcement
- **Keyboard navigation:**
  - SearchableSelect: handled by cmdk (arrow keys, Enter, Escape)
  - GenrePicker: pills are buttons, Tab navigates between them, Space/Enter toggles
  - Inline genre input: Enter submits, Escape cancels
  - Tab navigation in edit modal: arrow keys or click to switch tabs
- **Focus management:**
  - Edit modal: focus trapped within modal, initial focus on first input
  - After inline entity creation: focus returns to the triggering element
  - After error: focus moves to first field with error

---

## 11. Unsaved Changes Warning

- `beforeunload` event listener added when `isDirty` is true, removed when false — covers browser refresh, tab close, and external navigation
- For Next.js App Router client-side navigation: a custom `useUnsavedChanges(isDirty)` hook that uses `window.addEventListener('beforeunload', ...)`. App Router does not expose `router.events` like Pages Router, so client-side route interception uses `window.confirm()` in the cancel/back button handlers and Link `onClick` interceptors where applicable.
- Warning text: browser default for `beforeunload` (cannot be customized); `window.confirm("You have unsaved changes. Leave anyway?")` for in-app navigation
- The warning fires for both add and edit surfaces

---

## 12. What Stays Untouched

| File                                            | Status                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/lib/actions/chart-actions.ts`              | No changes                                                                                  |
| `src/lib/validations/chart.ts`                  | May need extension — see note below                                                         |
| `src/types/chart.ts`                            | No changes                                                                                  |
| `src/lib/utils/status.ts`                       | No changes                                                                                  |
| `src/app/(dashboard)/charts/new/page.tsx`       | Import change only: `ChartForm` → `ChartAddForm` (already fetches designers/genres)         |
| `src/app/(dashboard)/charts/[id]/edit/page.tsx` | Import change only: `ChartForm` → `ChartEditModal` (already fetches chart/designers/genres) |

**Upload URL gap:** The hook tracks `coverImageUrl`, `coverThumbnailUrl`, and `digitalFileUrl` in values, but the Zod `chartFormSchema` doesn't validate these fields. For create mode (chart doesn't exist yet), upload URLs must be included in the form submission data so the server action can store them on the new chart record. The implementation plan should extend the Zod schema to include these three optional URL fields, and update `createChart`/`updateChart` actions to persist them. This is a small, contained change to the existing actions.

---

## 13. Files to Delete

The following files from the old implementation will be removed:

| File                                                      | Reason                                 |
| --------------------------------------------------------- | -------------------------------------- |
| `src/components/features/charts/chart-form.tsx`           | Replaced by new architecture           |
| `src/components/features/charts/searchable-select.tsx`    | Rebuilt in form-primitives/            |
| `src/components/features/charts/genre-picker.tsx`         | Rebuilt in form-primitives/            |
| `src/components/features/charts/inline-entity-dialog.tsx` | Replaced by inline-designer-dialog.tsx |
| `src/components/features/charts/chart-form.test.tsx`      | Rewritten as colocated test files      |

**Kept and rewired:**
| File | Status |
|------|--------|
| `src/components/features/charts/cover-image-upload.tsx` | Moved to form-primitives/, updated props |
| `src/components/features/charts/file-upload.tsx` | Moved to form-primitives/, updated props |

---

## 14. Testing Strategy

**Test files** are colocated per CLAUDE.md convention:

- `chart-add-form.test.tsx` — add form integration + behavior
- `chart-edit-modal.test.tsx` — edit modal integration + behavior

**Mocking approach:** Mock server action imports (`chart-actions`, `designer-actions`, `genre-actions`) at the module level. Do NOT mock Prisma, Next.js routing, or framework internals (per CLAUDE.md). Use `@/__tests__/test-utils` for render helpers.

### Integration tests (form submission flows)

- Submit add form with valid data → `createChart` server action called with correct shape
- Submit add form with empty name → "Chart name is required" error displayed
- Submit add form with no stitch count and no dimensions → stitch count error displayed
- Submit edit form with pre-populated data → `updateChart` server action called with updated values
- Inline designer creation fails → toast error shown, designer not added to list

### Behavior tests (complex interactions)

- Enter width + height with empty stitch count → auto-calculated count shown in placeholder, size badge appears, "Auto-calculated" indicator shown
- Enter manual stitch count → overrides auto-calculation, badge updates
- Check "Formal Kit" → Kit Colours input appears; uncheck → input disappears, value reset
- Click genre pill → toggles selection; click "Add" → inline input appears; type + Enter → genre created and selected
- Switch tabs in edit modal → field values persist
- Modify any field → `isDirty` becomes true

### Not tested

- Individual primitive rendering/styling (visual, not behavioral)
- SearchableSelect internals (cmdk library responsibility)
- Server action implementation (tested separately in their own colocated tests)
- Dark mode appearance (visual regression, not unit test territory)
