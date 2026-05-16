# Phase 12: Merged Form - Research

**Researched:** 2026-05-11
**Domain:** Form architecture, client-side state management, localStorage persistence, accessible card selectors
**Confidence:** HIGH

## Summary

Phase 12 replaces the existing `chart-add-form.tsx` shell (190 lines, 8 section components) with a new `chart-merged-form.tsx` that reorganizes fields into 4 divider-separated groups on a single 720px page. The core hook (`use-chart-form.ts`, 390+ lines) remains unchanged -- it already handles all state, validation, submission, inline entity creation, and beforeunload warnings. The existing form primitives (SearchableSelect, CoverImageUpload, FileUpload, GenrePicker, StitchCountFields, StyledCheckbox, StartPreferenceFields) carry over unchanged.

New components to build: `PatternTypeCards` (2x2 card selector with radio/checkbox hybrid behavior), `StickySaveBar` (fixed-bottom bar with save hint + dual buttons), and `FormField` modification (green dot replacing red asterisk). A `useDraftPersistence` hook handles localStorage save/restore on explicit button press. No schema changes, no server action changes, no new dependencies.

**Primary recommendation:** Structure plans around the 3 new components + FormField modification + form shell assembly + draft persistence hook. Keep `useChartForm` untouched -- the merged form is purely a layout/presentation change on top of the same hook.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** UI-level mapping only -- keep 3 existing booleans (isPaperChart, isFormalKit, isSAL) unchanged. No schema migration
- **D-02:** 4 cards in 2x2 grid: Paper Chart, Digital, Kit, SAL. "Subscription" was a misnomer -- SAL/Stitch-Along is correct
- **D-03:** Paper/Digital mutually exclusive (opposite values of isPaperChart). Kit/SAL independent toggles
- **D-04:** Kit card expands to show "Colours in kit" numeric input. Paper, Digital, SAL have no sub-fields
- **D-05:** Radio-style check circles for Paper/Digital, checkbox-style for Kit/SAL
- **D-06:** Save Draft persists to localStorage only -- zero schema changes, zero server interaction
- **D-07:** Auto-hydrate from localStorage on return to /charts/new
- **D-08:** Handle stale reference IDs gracefully (fallback to null for missing references)
- **D-09:** Clear localStorage draft on successful Create
- **D-10:** Hybrid approach -- keep everything in src/components/features/charts/
- **D-11:** Keep use-chart-form.ts unchanged
- **D-12:** Build chart-merged-form.tsx as new shell
- **D-13:** Add pattern-type-cards.tsx as new form primitive
- **D-14:** Add sticky-save-bar.tsx as new component
- **D-15:** Old components stay live until Phase 14 cleanup
- **D-16:** Update /charts/new page to render new form
- **D-17:** Keep GenrePicker as-is (already chip toggles matching sketch)
- **D-18:** Check font-weight 500 on selected genre chips (already in code: `font-weight: 500` via class)

### Claude's Discretion
- Form group wrapper component design (divider-separated sections)
- Required dot indicator implementation (CSS pseudo-element vs component prop)
- localStorage serialization format and debounce strategy for Save Draft
- Stale ID detection approach on draft hydration
- Save-readiness hint text logic
- How the milestone marker at the end connects to Phase 13's supply takeover entry point
- Test strategy for new components

### Deferred Ideas (OUT OF SCOPE)
- Supply takeover transition (Phase 13)
- Edit mode using merged form layout (Phase 14)
- Removal of deprecated components (Phase 14)
- "Subscription" as distinct from SAL
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FORM-01 | Single continuous page (720px max-width) with field groups separated by dividers | Layout contract in UI-SPEC, existing page structure in chart-add-form.tsx already 720px-ish (max-w-2xl = 672px), upgraded to exact 720px |
| FORM-02 | Pattern type via 2x2 card grid with expandable sub-fields | PatternTypeCards component spec, CSS patterns from sketch findings, accessibility ARIA patterns |
| FORM-03 | Sticky save bar at bottom with Save Draft and Create buttons | StickySaveBar component spec, localStorage persistence hook, save-readiness hint logic |
| FORM-04 | Green dot indicators on required fields (Chart Name, Status) | FormField modification, existing `required` prop already wired, just visual swap |
| FORM-05 | Digital working copy upload in Workflow section | FileUpload component already exists, just relocated to Workflow group in new layout |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form state management | Browser / Client | -- | useChartForm hook manages all state client-side |
| Form validation | Browser / Client | API / Backend | Zod client-side validation + server-side revalidation in createChart action |
| Draft persistence | Browser / Client | -- | localStorage only per D-06, no server interaction |
| Pattern type selection | Browser / Client | -- | Pure UI state mapping to existing boolean fields |
| Save bar and submit | Browser / Client | API / Backend | Client triggers server action, server validates + persists |
| File upload | Browser / Client | CDN / Static | Client gets presigned URL, uploads to R2 directly |
| Data fetching (page load) | Frontend Server (SSR) | Database / Storage | Server component fetches designers, genres, etc. |

## Standard Stack

### Core (already installed -- no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.4 | App Router, server components, page routing | Project framework [VERIFIED: package.json] |
| React | 19.2.5 | Client component rendering, hooks | Project runtime [VERIFIED: package.json] |
| Zod | (installed) | Form validation schema | Project validation layer [VERIFIED: chart.ts] |
| sonner | 2.0.7 | Toast notifications | Project toast library [VERIFIED: package.json] |
| lucide-react | 1.8.0 | Icon library (Check, ArrowLeft, etc.) | Project icon set [VERIFIED: package.json] |
| Vitest | 3.1.1 | Test framework | Project test runner [VERIFIED: package.json] |
| @testing-library/react | (installed) | Component testing | Via test-utils wrapper [VERIFIED: test-utils.tsx] |

### Supporting (no changes needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @base-ui/react | (installed) | Underlying UI primitives for shadcn | Used via shadcn components (Dialog, Button, etc.) |
| Tailwind CSS | v4 | Styling | All component styling [VERIFIED: project stack] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage for drafts | IndexedDB | Overkill for single JSON blob; localStorage is simpler, well-tested in this codebase |
| Custom card selector | react-aria RadioGroup | Extra dep; simple enough to build with native ARIA attributes |
| Form library (react-hook-form) | Custom useChartForm hook | Hook already exists and works well; switching would be a rewrite |

**Installation:** No new packages needed. Zero new dependencies per project convention.

## Architecture Patterns

### System Architecture Diagram

```
/charts/new (Server Component)
    |
    | fetches designers, genres, storageLocations, stitchingApps, fabrics
    v
ChartMergedForm (Client Component)
    |
    |--- useChartForm() hook (unchanged)
    |       |--- form state (values, errors, dirty, isPending)
    |       |--- validation (chartFormSchema.safeParse)
    |       |--- submission (createChart server action)
    |       |--- inline entity creation (designer, genre, storage, app)
    |
    |--- useDraftPersistence() hook (NEW)
    |       |--- saveDraft(): serialize values -> localStorage "chart-draft"
    |       |--- loadDraft(): parse localStorage -> validate IDs -> return values
    |       |--- clearDraft(): remove localStorage key
    |
    |--- Form Layout (4 groups + dividers)
    |       |--- Identity Group (FormField, SearchableSelect, CoverImageUpload, GenrePicker)
    |       |--- Pattern Group (StitchCountFields, PatternTypeCards [NEW], StyledCheckbox)
    |       |--- Workflow Group (FormField+select, SearchableSelect x2, FileUpload)
    |       |--- Timeline Group (dates, notes, toggles, StartPreferenceFields)
    |       |--- Milestone Marker (static placeholder)
    |
    |--- StickySaveBar (NEW) - fixed bottom
            |--- Save hint text (reactive to form.values.name)
            |--- Save Draft button -> useDraftPersistence.saveDraft()
            |--- Create button -> form.handleSubmit()
```

### Recommended Project Structure

```
src/components/features/charts/
  chart-merged-form.tsx           # NEW: form shell (replaces chart-add-form.tsx role)
  chart-merged-form.test.tsx      # NEW: integration tests
  use-draft-persistence.ts        # NEW: localStorage save/load/clear hook
  use-draft-persistence.test.ts   # NEW: hook unit tests
  form-primitives/
    form-field.tsx                 # MODIFIED: green dot instead of red asterisk
    pattern-type-cards.tsx         # NEW: 2x2 card selector
    pattern-type-cards.test.tsx    # NEW: card behavior tests
    sticky-save-bar.tsx            # NEW: fixed bottom bar
    sticky-save-bar.test.tsx       # NEW: bar state tests
    ... (existing primitives unchanged)
  sections/                        # UNCHANGED: stays live until Phase 14
  chart-add-form.tsx              # UNCHANGED: stays live until Phase 14
```

### Pattern 1: Card Selector with Mixed Radio/Checkbox Behavior

**What:** A 2x2 grid where Paper/Digital function as a radio group (mutually exclusive) while Kit/SAL function as independent checkboxes. All four are visually similar cards but have different selection semantics.

**When to use:** When a set of options has both exclusive and additive selections that need visual unity.

**Example:**
```typescript
// Source: UI-SPEC.md + sketch findings
interface PatternTypeCardsProps {
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

// Accessibility: Paper/Digital wrapped in role="radiogroup"
// Kit/SAL use role="checkbox" + aria-checked independently
// Check circles: radio style (round empty/filled) for format pair
// Checkbox style (square empty/checked) for Kit/SAL
```

### Pattern 2: Sticky Save Bar Outside Form Element

**What:** A fixed-bottom bar with Save Draft and Create buttons. The bar lives visually outside the scrolling form but logically belongs to it.

**When to use:** Long forms where the submit action must always be visible.

**Example:**
```typescript
// Source: UI-SPEC.md
// The bar renders OUTSIDE the <form> element (fixed positioning)
// But the Create button calls form.handleSubmit() directly
// Save Draft calls useDraftPersistence.saveDraft(form.values)

// Important: form has pb-20 (80px) clearance at bottom to prevent
// content being hidden behind the fixed bar
```

### Pattern 3: Draft Persistence with Stale ID Detection

**What:** On Save Draft button click, serialize current form values to localStorage. On page load, check for existing draft and hydrate form if found.

**When to use:** When users may leave and return to a long form.

**Example:**
```typescript
// Source: CONTEXT.md D-06 through D-09
const DRAFT_KEY = "chart-draft";

function saveDraft(values: ChartFormValues): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // localStorage may be full or unavailable -- fail silently
  }
}

function loadDraft(
  validDesignerIds: string[],
  validStorageIds: string[],
  validAppIds: string[],
): ChartFormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChartFormValues;
    // Stale ID detection: null out IDs that no longer exist
    if (parsed.designerId && !validDesignerIds.includes(parsed.designerId)) {
      parsed.designerId = null;
    }
    if (parsed.storageLocationId && !validStorageIds.includes(parsed.storageLocationId)) {
      parsed.storageLocationId = null;
    }
    if (parsed.stitchingAppId && !validAppIds.includes(parsed.stitchingAppId)) {
      parsed.stitchingAppId = null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}
```

### Anti-Patterns to Avoid

- **Wrapping StickySaveBar inside the `<form>`:** Fixed positioning inside a form can cause layout issues and the bar needs to span full viewport width.
- **Auto-save on every keystroke:** D-06 specifies explicit Save Draft button only. No debounced auto-save.
- **Moving useChartForm logic into the new shell:** D-11 locks the hook as unchanged. The shell is a thin layout layer.
- **Using `<button type="submit">` for Save Draft:** Save Draft must NOT trigger form submission/validation. Use `type="button"` with onClick.
- **Building PatternTypeCards as 4 separate components:** Keep as one component with internal logic for the radio/checkbox hybrid. Simpler props interface.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Existing Zod schema + useChartForm | Already works, tested, handles error formatting |
| File upload | Custom upload flow | Existing FileUpload + CoverImageUpload | Complex presigned URL + progress + validation already handled |
| Select with search | Custom dropdown | Existing SearchableSelect | Portal positioning, keyboard nav, inline creation already solved |
| Toast notifications | Custom notification system | sonner (toast) | Already integrated, consistent UX |
| Icons | SVG files or icon font | lucide-react | Already installed, tree-shakeable, consistent |

**Key insight:** This phase is 90% layout reorganization and 10% new logic (pattern cards + draft persistence). The field components are battle-tested -- don't rebuild them.

## Common Pitfalls

### Pitfall 1: StickySaveBar z-index conflicts

**What goes wrong:** Fixed-bottom bar gets covered by SearchableSelect dropdowns or Dialog overlays.
**Why it happens:** SearchableSelect uses portal positioning (`position: fixed` + high z-index). Dialog overlays use z-50.
**How to avoid:** StickySaveBar at z-100 (per UI-SPEC). Verify dropdowns render above the bar when open.
**Warning signs:** Clicking Save Draft/Create doesn't work when a select dropdown was recently open.

### Pitfall 2: Form submission from Save Draft button

**What goes wrong:** Clicking Save Draft triggers form validation and submission instead of localStorage save.
**Why it happens:** Button inside `<form>` defaults to `type="submit"`.
**How to avoid:** Save Draft button MUST have `type="button"`. Create button can use `type="button"` with explicit `onClick={() => form.handleSubmit(syntheticEvent)}` OR be `type="submit"` inside the form.
**Warning signs:** Validation errors appear when clicking Save Draft.

### Pitfall 3: Draft hydration overwriting empty form before user sees it

**What goes wrong:** Form flickers -- renders empty, then immediately fills with draft data, causing layout shift.
**Why it happens:** localStorage read happens in useEffect (after first render), so initial render shows empty form.
**How to avoid:** Read draft synchronously in a `useState` initializer, or show a brief loading state. Since localStorage is sync, a `useState(() => loadDraft(...) ?? defaultValues)` pattern works.
**Warning signs:** Flash of empty form fields on page load when draft exists.

### Pitfall 4: Pattern card animation not working on initial Digital selection

**What goes wrong:** Digital card appears selected on load but no transition fires.
**Why it happens:** Default state is `isPaperChart: false` (Digital selected). If you rely on transition from unselected->selected, there's no transition on mount.
**How to avoid:** Set selected styles statically for initial state, only animate subsequent changes.
**Warning signs:** Digital card looks unstyled or has wrong border on first render.

### Pitfall 5: Genre chip font-weight not matching spec on selected state

**What goes wrong:** Selected genre chips don't show `font-weight: 500` per D-18.
**Why it happens:** GenrePicker already carries over unchanged -- need to verify the existing code has the weight.
**How to avoid:** The existing code has no explicit `font-medium` on selected chips. The class is `border-primary/30 bg-primary/10 text-primary` without weight. Need to add `font-medium` to selected chip class.
**Warning signs:** Visual audit catches lighter-weight text on selected genres.

### Pitfall 6: Stale draft causing type errors after schema evolution

**What goes wrong:** If a future phase adds fields to ChartFormValues, old drafts in localStorage won't have those fields, causing undefined values.
**Why it happens:** localStorage persists indefinitely with no versioning.
**How to avoid:** When loading draft, merge with default values so missing fields get defaults. Use spread: `{ ...buildInitialValues(), ...parsedDraft }`.
**Warning signs:** Form crashes on load for users who saved a draft in an earlier version.

## Code Examples

### FormField Green Dot Modification

```typescript
// Source: UI-SPEC.md Required Dot Indicator section
// Current: red asterisk (*) via <span className="text-destructive ml-0.5">*</span>
// New: green 6px dot

{required && (
  <>
    <span
      className="bg-primary mr-1.5 inline-block size-1.5 rounded-full align-middle relative -top-px"
      aria-hidden="true"
    />
    <span className="sr-only"> (required)</span>
  </>
)}
```

### PatternTypeCards Single Card

```typescript
// Source: UI-SPEC.md Pattern Type Cards section + sketch CSS patterns
<button
  type="button"
  role="radio" // or "checkbox" for Kit/SAL
  aria-checked={isSelected}
  onClick={() => onSelect()}
  className={cn(
    "border rounded-md py-3 px-4 bg-card cursor-pointer transition-all duration-150 text-left w-full",
    "hover:border-primary/30",
    isSelected && "border-primary bg-primary/[0.03] ring-1 ring-primary",
    !isSelected && "border-border"
  )}
>
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="text-xs text-muted-foreground">{description}</div>}
    </div>
    {/* Check circle */}
    <div className={cn(
      "size-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
      isSelected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border"
    )}>
      {isSelected && <Check className="size-3" />}
    </div>
  </div>
  {/* Kit expandable sub-field */}
  {hasExpandableContent && (
    <div className={cn(
      "overflow-hidden transition-all",
      isSelected ? "max-h-20 opacity-100 mt-3 duration-250 ease-in" : "max-h-0 opacity-0 duration-200 ease-out"
    )}>
      {expandableContent}
    </div>
  )}
</button>
```

### StickySaveBar Structure

```typescript
// Source: UI-SPEC.md Sticky Save Bar section
<div
  role="toolbar"
  aria-label="Form actions"
  className="fixed bottom-0 left-0 right-0 z-100 border-t border-border bg-card"
>
  <div className="max-w-[720px] mx-auto flex items-center py-3 px-4">
    <p className="mr-auto text-xs text-muted-foreground">
      {chartName ? "Ready to save at any point" : "Enter a chart name to enable saving"}
    </p>
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        disabled={!chartName || isSavingDraft}
        onClick={onSaveDraft}
      >
        {saveDraftLabel}
      </Button>
      <Button
        type="button"
        disabled={!chartName || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Creating..." : "Create"}
      </Button>
    </div>
  </div>
</div>
```

### Milestone Marker (Static Placeholder)

```typescript
// Source: UI-SPEC.md Milestone Marker section
<div className="rounded-lg bg-primary/5 border border-primary/15 p-4 px-6 flex items-center gap-3">
  <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
    <Check className="size-3.5" />
  </div>
  <p className="text-sm font-medium flex-1">
    Project details filled in. Ready for supplies?
  </p>
  {/* Static in Phase 12 -- functional in Phase 13 */}
  <span className="text-primary text-sm font-medium opacity-50">
    Add supplies
  </span>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Section wrappers with SectionHeading | Direct field groups with `<hr>` dividers | Phase 12 | Removes visual noise of bold uppercase headings between every 2-3 fields |
| Radio buttons + checkboxes for pattern type | Visual card selector | Phase 12 | Better scanability, touch targets, visual hierarchy |
| Bottom button row (Cancel + Add Chart) | Sticky save bar (hint + Save Draft + Create) | Phase 12 | Always visible, draft persistence, clearer save state |
| Red asterisk for required fields | Green 6px dot | Phase 12 | Softer, matches emerald accent, sketch-validated |

**Deprecated/outdated:**
- `SectionHeading` component: Not used in merged form (stays for old form until Phase 14)
- `PatternTypeFields` component: Replaced by PatternTypeCards (stays for old form until Phase 14)
- Old form sections (basic-info-section, etc.): Content reused but wrappers not needed in new layout

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GenrePicker selected state lacks `font-medium` class (needs adding per D-18) | Common Pitfalls | LOW -- visual only, easily fixed during assembly |
| A2 | z-100 is sufficient to layer StickySaveBar above all other page elements | Architecture | LOW -- can adjust if conflicts found during testing |
| A3 | `useState(() => loadDraft())` works for sync localStorage read to avoid flash | Common Pitfalls | LOW -- standard React pattern, well-documented |

## Open Questions

1. **How should Create button trigger form validation?**
   - What we know: Currently the form uses `<form onSubmit={form.handleSubmit}>` with a submit button inside. The new layout has StickySaveBar outside the form element.
   - What's unclear: Should the Create button be inside the `<form>` (requires nesting fixed bar inside form), or should it call `form.handleSubmit` with a synthetic event?
   - Recommendation: Keep `<form>` wrapping the field content + StickySaveBar. The sticky bar can be inside the form if styled with `fixed` positioning. This preserves native form submission and Enter-to-submit behavior. Alternatively, since the existing `handleSubmit` takes a FormEvent and calls `e.preventDefault()`, a synthetic event works too.

2. **Should draft loading use the hook's initial state or a separate hydration step?**
   - What we know: `useChartForm` initializes from `buildInitialValues()`. Draft loading needs to override this.
   - What's unclear: Whether to pass initialData to useChartForm (would require hook changes, violates D-11), or to call `setField` for each field after mount.
   - Recommendation: Create `useDraftPersistence` that returns loaded values. In `ChartMergedForm`, compute initial values before calling `useChartForm` -- OR use a `useEffect` to bulk-set fields after mount via a new `setValues` exposed from the hook. Since D-11 says hook unchanged, the cleanest path is: detect draft in the form shell, and if found, render `useChartForm` with a synthetic `initialData` that matches the draft shape. This doesn't change the hook -- it uses the existing `initialData` prop path.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + @testing-library/react |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/components/features/charts/pattern-type-cards.test.tsx` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Single page renders all 4 field groups with dividers | integration | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "renders"` | Wave 0 |
| FORM-02 | Pattern cards: Paper/Digital mutual exclusion, Kit expands sub-field, SAL toggles | unit | `npx vitest run src/components/features/charts/form-primitives/pattern-type-cards.test.tsx` | Wave 0 |
| FORM-03 | Sticky bar: save hint updates, Save Draft persists, Create submits | unit + integration | `npx vitest run src/components/features/charts/form-primitives/sticky-save-bar.test.tsx` | Wave 0 |
| FORM-04 | Green dot on Chart Name and Status, not on other fields | unit | `npx vitest run src/components/features/charts/form-primitives/form-field.test.tsx` | Wave 0 |
| FORM-05 | Digital working copy upload in Workflow section | integration | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "workflow"` | Wave 0 |
| DRAFT | localStorage save/load/clear + stale ID handling | unit | `npx vitest run src/components/features/charts/use-draft-persistence.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/components/features/charts/ --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/components/features/charts/form-primitives/pattern-type-cards.test.tsx` -- covers FORM-02
- [ ] `src/components/features/charts/form-primitives/sticky-save-bar.test.tsx` -- covers FORM-03
- [ ] `src/components/features/charts/form-primitives/form-field.test.tsx` -- covers FORM-04 (file exists but no green dot tests yet)
- [ ] `src/components/features/charts/use-draft-persistence.test.ts` -- covers DRAFT
- [ ] `src/components/features/charts/chart-merged-form.test.tsx` -- covers FORM-01, FORM-05 (integration)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- form is behind existing auth guard (page-level) |
| V3 Session Management | no | N/A -- no session changes |
| V4 Access Control | no | N/A -- existing requireAuth() in server actions unchanged |
| V5 Input Validation | yes | Existing Zod schema (chartFormSchema) validates all inputs server-side |
| V6 Cryptography | no | N/A -- no crypto operations |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage tampering | Tampering | Server-side Zod validation on submit -- localStorage is convenience only, not trusted |
| XSS via draft content | Tampering | React escapes all rendered values; no raw HTML injection used |
| Large localStorage payload (DoS) | Denial of Service | try/catch on setItem; form values are bounded by Zod maxlength constraints |

No new attack surface introduced. All mutations go through existing server actions with existing auth guards and Zod validation.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `use-chart-form.ts`, `chart-add-form.tsx`, `form-field.tsx`, `pattern-type-fields.tsx`, all form primitives, `/charts/new/page.tsx`, `chart.ts` validation schema
- `.planning/phases/12-merged-form/12-UI-SPEC.md` -- complete visual contract
- `.planning/phases/12-merged-form/12-CONTEXT.md` -- locked decisions
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` -- design CSS patterns and HTML structures

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` -- FORM-01 through FORM-05 requirement definitions
- Existing localStorage patterns in `shopping-list-tab.tsx` and `shopping-cart.tsx` -- try/catch pattern established

### Tertiary (LOW confidence)
- None -- all claims verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all verified in package.json
- Architecture: HIGH -- extends existing patterns, codebase fully inspected
- Pitfalls: HIGH -- identified from concrete code inspection (z-index, button types, existing genre chip styles)

**Research date:** 2026-05-11
**Valid until:** 2026-06-11 (stable -- no external dependency changes expected)
