---
phase: 12-merged-form
reviewed: 2026-05-11T14:30:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/app/(dashboard)/charts/new/page.tsx
  - src/components/features/charts/chart-merged-form.test.tsx
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/form-primitives/form-field.tsx
  - src/components/features/charts/form-primitives/genre-picker.tsx
  - src/components/features/charts/form-primitives/pattern-type-cards.test.tsx
  - src/components/features/charts/form-primitives/pattern-type-cards.tsx
  - src/components/features/charts/form-primitives/sticky-save-bar.test.tsx
  - src/components/features/charts/form-primitives/sticky-save-bar.tsx
  - src/components/features/charts/form-primitives/stitch-count-fields.tsx
  - src/components/features/charts/use-draft-persistence.test.ts
  - src/components/features/charts/use-draft-persistence.ts
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-05-11T14:30:00Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

The merged form implementation is well-structured overall: draft persistence has good error handling, PatternTypeCards has solid accessibility with ARIA roles, and the form validation pipeline through Zod is correct. However, there is one data-integrity bug in draft persistence (missing stale-ID check for fabricId), several dead-code / misleading-UI issues, and a CSS conflict on the section dividers that may hide them entirely.

## Critical Issues

### CR-01: Draft persistence does not validate fabricId against stale references

**File:** `src/components/features/charts/use-draft-persistence.ts:38-47`
**Issue:** `loadDraft` validates `designerId`, `storageLocationId`, and `stitchingAppId` against valid ID lists and nulls out stale references. But `fabricId` is not validated at all. If a user saves a draft with a fabric assigned, then that fabric is deleted or re-assigned before the draft is restored, the form will submit with a stale `fabricId` pointing to a non-existent or already-assigned fabric. This will cause a server error on submission (foreign key constraint violation) or silently create a broken project-fabric link.

The calling code in `chart-merged-form.tsx:94-97` passes `designerIds`, `storageIds`, and `appIds` but no `fabricIds`, confirming the gap.

**Fix:** Add a `validFabricIds` parameter to `loadDraft` and null out stale fabric IDs:

```ts
export function loadDraft(
  defaults: ChartFormValues,
  validDesignerIds: string[],
  validStorageIds: string[],
  validAppIds: string[],
  validFabricIds: string[], // add this parameter
): ChartFormValues | null {
  // ... existing code ...

  if (merged.fabricId && !validFabricIds.includes(merged.fabricId)) {
    merged.fabricId = null;
  }

  return merged;
}
```

And update the call site in `chart-merged-form.tsx`:

```ts
const fabricIds = unassignedFabrics.map((f) => f.id);
const draft = loadDraft(defaultValues, designerIds, storageIds, appIds, fabricIds);
```

Update tests in `use-draft-persistence.test.ts` to cover the new parameter.

## Warnings

### WR-01: Conflicting CSS classes on section dividers render invisible borders

**File:** `src/components/features/charts/chart-merged-form.tsx:246, 282, 357, 414`
**Issue:** The `<hr>` elements use `className="border-border/50 my-6 border-t border-none"`. In Tailwind, `border-none` sets `border-style: none` on all sides. This overrides `border-t` (which sets `border-top-width: 1px` but relies on a solid border style). Depending on Tailwind v4's CSS source order, `border-none` may win, causing the dividers to be completely invisible. If the intent is a visible divider line, remove `border-none`. If the intent is an invisible spacer, remove `border-t` and `border-border/50` to avoid confusion.

**Fix:**
```tsx
// If visible divider is intended:
<hr className="border-border/50 my-6 border-t" />

// If invisible spacer is intended:
<hr className="my-6 border-none" />
```

### WR-02: "Saving..." label in handleSaveDraft is dead code (never renders)

**File:** `src/components/features/charts/chart-merged-form.tsx:144-153`
**Issue:** `handleSaveDraft` sets `setSaveDraftLabel("Saving...")` then immediately calls the synchronous `saveDraft()` then `setSaveDraftLabel("Saved!")` in the same synchronous event handler. React 18+ batches all state updates within a synchronous event handler into a single render. The "Saving..." state is overwritten before React commits, so users will never see it. The `setIsSavingDraft(true)` is similarly never visible.

**Fix:** Either remove the intermediate "Saving..." state entirely (since `saveDraft` is synchronous and instant), or if you want to show a brief animation, use `requestAnimationFrame` or `setTimeout(0)` to split the renders:

```ts
const handleSaveDraft = useCallback(() => {
  saveDraft(form.values);
  setSaveDraftLabel("Saved!");
  setTimeout(() => {
    setSaveDraftLabel("Save Draft");
  }, 1000);
}, [form.values]);
```

### WR-03: Dimensions "required" indicator is misleading

**File:** `src/components/features/charts/form-primitives/stitch-count-fields.tsx:48`
**Issue:** The "Dimensions (stitches)" `FormField` has `required` set, which renders the green dot required indicator. However, the Zod schema (`chartFormSchema`) uses a `.refine()` that accepts _either_ stitchCount > 0 _or_ both dimensions > 0. Dimensions are not actually required when a total stitch count is provided. The required indicator tells users they must fill in dimensions, which is false.

**Fix:** Remove `required` from the Dimensions FormField, or change it to a conditional based on whether stitch count is populated:

```tsx
<FormField
  label="Dimensions (stitches)"
  htmlFor="stitches-wide"
  // required -- remove this; dimensions are optional when stitch count is provided
  error={errors?.stitchesWide}
>
```

### WR-04: Missing aria-describedby on chart name input

**File:** `src/components/features/charts/chart-merged-form.tsx:200-208`
**Issue:** The chart name `Input` sets `aria-invalid` when there's an error, but does not set `aria-describedby` to point at the error message element. The `FormField` renders the error `<p>` with `id="chart-name-error"`, but the `Input` doesn't reference it. Screen reader users will know the field is invalid but won't hear the error message. This pattern is correctly implemented in `stitch-count-fields.tsx` but missed here.

**Fix:**
```tsx
<Input
  id="chart-name"
  value={form.values.name}
  onChange={(e) => form.setField("name", e.target.value)}
  placeholder="e.g. Enchanted Forest Sampler"
  aria-required="true"
  aria-invalid={!!form.errors["chart.name"]}
  aria-describedby={form.errors["chart.name"] ? "chart-name-error" : undefined}
/>
```

### WR-05: No validation of draft data shape from localStorage

**File:** `src/components/features/charts/use-draft-persistence.ts:32`
**Issue:** `loadDraft` parses localStorage JSON with `JSON.parse(raw) as Partial<ChartFormValues>` and spreads it directly into defaults. The `as` cast provides zero runtime validation. If localStorage is tampered with (e.g., by a browser extension, or a different version of the app wrote incompatible data), values of wrong types will flow into form state. For example, if `stitchCount` is stored as a string `"abc"`, it will be passed to components expecting a number, potentially causing `NaN` propagation or runtime errors in calculations (e.g., `getEffectiveStitchCount`).

The Zod validation only runs at submit time, not at hydration. Type mismatches could cause component render errors before the user ever clicks Create.

**Fix:** Add a lightweight validation pass after parsing, or use a Zod schema to parse the draft:

```ts
const parsed = JSON.parse(raw);
if (typeof parsed !== "object" || parsed === null) return null;
// Coerce critical numeric fields
if (typeof parsed.stitchCount !== "number") delete parsed.stitchCount;
if (typeof parsed.stitchesWide !== "number") delete parsed.stitchesWide;
if (typeof parsed.stitchesHigh !== "number") delete parsed.stitchesHigh;
```

## Info

### IN-01: `as any` type assertion in draft hydration loop

**File:** `src/components/features/charts/chart-merged-form.tsx:136`
**Issue:** The draft hydration loop uses `form.setField(key, val as any)` to call a generically-typed setter with a dynamic key. This bypasses TypeScript's type safety. While the ESLint disable comment acknowledges this, it means a draft with wrong value types won't be caught at compile time.

**Fix:** Consider a dedicated `hydrateFromDraft(values: ChartFormValues)` method on the form hook that accepts a full values object and replaces state in one shot, avoiding the per-key loop entirely:

```ts
// In useChartForm:
const hydrateFromDraft = useCallback((draft: ChartFormValues) => {
  setValues(draft);
}, []);
```

### IN-02: `isSavingDraft` state variable is unused for its intended purpose

**File:** `src/components/features/charts/chart-merged-form.tsx:55-56`
**Issue:** `isSavingDraft` is set to `true` then `false` synchronously in `handleSaveDraft`, so it never has observable effect during render (see WR-02). It's passed to `StickySaveBar` which uses it to disable the Save Draft button, but since the state is always `false` at render time (synchronous batching), the disable never activates. The entire `isSavingDraft` state is effectively dead code.

**Fix:** Remove `isSavingDraft` state and the `isSavingDraft` prop from `StickySaveBar`, or restructure if actual async draft saving is planned.

---

_Reviewed: 2026-05-11T14:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
