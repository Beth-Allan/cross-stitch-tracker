# Phase 26: UX Polish - Research

**Researched:** 2026-05-19
**Domain:** Accessibility (ARIA), visual consistency, component UX affordances
**Confidence:** HIGH

## Summary

Phase 26 is a pure polish phase: 14 UX fixes across existing components with no new pages, routes, or data models. The fixes span five domains -- ARIA compliance (card rows, keyboard navigation), visual feedback (EditableNumber rejection, kitting labels, thread insights), component affordances (commit button, contextual labels, dynamic aspect ratio), layout fixes (focal point action bar, supplies flash), and data correctness (fabric matching null handling, bucket project focal points).

All 14 requirements modify existing components with existing test coverage. The codebase already has all needed animations (`animate-shake`, `animate-slide-in`, `animate-skeleton-pulse`), semantic tokens (`bg-success-muted`, `bg-warning-muted`, `bg-selected`, `border-selected-border`, `border-destructive`, `bg-destructive/10`), and utilities (`getObjectPositionStyle`, `cn`, `buttonVariants`). No new dependencies are needed.

**Primary recommendation:** Group the 14 requirements into 3-4 plans based on component locality and dependency relationships. Most fixes are independent and can run in parallel.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Card row ARIA: Flat DOM with cosmetic hover + additive ARIA attributes. `role="group"` + `aria-labelledby` on card containers. All action buttons get `aria-label`s. Row hover stays cosmetic via `group-hover`.
- **D-02:** GalleryCard: Extend `<Link>` to wrap the image too (larger click target). No nested-interactive violation since no action buttons exist in gallery cards.
- **D-03:** BucketProjectRow and ChartRow in designer-detail are already correct -- no changes needed.
- **D-04:** DesignerRow/GenreRow and their mobile card equivalents need `role="group"` and `aria-label`s on action buttons. Structure is already correct (siblings, not nested).
- **D-05:** EditableNumber: Red border flash (600ms) + background tint during invalid draft. `border-destructive` class for ~600ms on rejection, plus `bg-destructive/10` while draft is invalid. Both supply-table and charts variants.
- **D-06:** Kitting label three-state: "Not kitted" at 0%, "Kitting" at 1-99%, "Fully kitted" at 100%.
- **D-07:** Shopping pills: `rounded-full` -> `rounded-lg` with `border border-selected-border`. Intentional DesignOS deviation.
- **D-08:** Code comment required for D-07 DesignOS deviation.
- **D-09:** Focal point: Split FocalPointEditor into FocalPointClickArea (overlay inside banner) + FocalPointActionBar (sibling below banner). 100% image surface clickable.
- **D-10:** Action bar keeps visual treatment: `border-t`, semi-transparent backdrop, slide animation -- renders as sibling below image.
- **D-11:** Cover image preview: Dynamic `aspect-ratio` from image natural dimensions via `onLoad` handler. `h-48` stays as skeleton/fallback. `max-h-72` cap.
- **D-12:** Hero banner (HeroCoverBanner) does NOT change -- `object-contain` + blur fill is intentional from Phase 17.
- **D-13:** ThreadInsightList: Add rank numbers matching DesignerInsightList/GenreInsightList. No interactive styling (no hover, no cursor-pointer, no links).
- **D-14:** Thread insight items have no interactive styling to remove -- fix is purely additive visual alignment.

### Claude's Discretion
- **UX-01:** Implementation approach for tracking arrow key usage vs mouse hover. Likely `hasUsedArrowKeys` state flag gating highlight class.
- **UX-04:** Investigation and fix for supplies page first-load view flash.
- **UX-07:** Icon choice, sizing, positioning of visible commit button in add row.
- **UX-08:** Label mapping per supply type for InlineCreateDialog.
- **UX-09:** Integration approach for applying focal point data to BucketProject cards.
- **UX-11:** Fix approach for null fabricCount short-circuit in pattern-dive-actions.
- **UX-14:** How closely to reuse GalleryCard vs. applying gallery card CSS patterns to What's Next cards.
- Plan structure and grouping of 14 requirements into plans/waves.
- Test strategy for each fix.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | SearchToAdd keyboard highlight only appears after arrow key use | `use-supply-table.ts` highlightIndex state + `portal-autocomplete.tsx` highlight rendering investigated. Need `hasUsedArrowKeys` flag. |
| UX-02 | Clickable card rows refactored for ARIA compliance | `designer-list.tsx`, `genre-list.tsx`, `gallery-card.tsx`, `bucket-project-row.tsx` all examined. Most already have `aria-label` on buttons; need `role="group"` + `aria-labelledby`. |
| UX-03 | EditableNumber shows visual feedback on rejected input | Both variants examined: supply-table and charts. Need `isInvalid` state + `showRejection` flash timer. |
| UX-04 | Supplies page eliminates first-load view flash | Supply catalog investigated: `initialView` from URL params already works for threads tab; localStorage read in `useEffect` causes flash for non-URL tabs. |
| UX-05 | What's Next kitting label three-state copy | `whats-next-tab.tsx` line 185 has two-state ternary. Need three-state. |
| UX-06 | Shopping-for bar pills match squared-off chip design | `shopping-for-bar.tsx` line 36: `rounded-full` needs `rounded-lg` + `border border-selected-border`. |
| UX-07 | Supply table add row has visible commit button | `supply-table-add-row.tsx` has no visible submit button. Check icon from lucide-react already available. |
| UX-08 | InlineCreateDialog labels contextual per supply type | `inline-create-dialog.tsx` uses generic "Name"/"Code" labels and "Create Supply" title. Need type-keyed label map. |
| UX-09 | BucketProject cards apply focal point styling | `bucket-project-row.tsx` img has no `style` prop. `BucketProject` type lacks focal point fields. Dashboard query doesn't select them. |
| UX-10 | Focal point action bar repositioned outside image | `focal-point-editor.tsx` action bar at line 163 uses `absolute bottom-0`. Split into two components. |
| UX-11 | Fabric matching handles null fabricCount | `pattern-dive-actions.ts` line 156-192: when `fabricCount` is null, falls through to else branch that does try all unassigned fabrics with `filter(f => f.fitsWidth || f.fitsHeight)` -- actually already handles it. Need to verify. |
| UX-12 | ThreadInsightList visual alignment with rank numbers | `thread-insight-list.tsx` has no rank numbers. `designer-insight-list.tsx` has `{index + 1}.` pattern to match. |
| UX-13 | Cover image preview uses dynamic aspect ratio | `cover-image-upload.tsx` line 199: fixed `h-48` container. Need `onLoad` handler + `aspect-ratio` CSS. |
| UX-14 | What's Next cards use gallery card styling | `whats-next-tab.tsx` uses horizontal row layout. GalleryCard uses vertical card stack with `aspect-[4/3]` image. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| ARIA attributes (UX-01, UX-02) | Browser / Client | -- | DOM attributes and event handlers are client-side concerns |
| Visual feedback (UX-03, UX-05, UX-06, UX-12, UX-14) | Browser / Client | -- | CSS classes and state-driven rendering |
| Component affordances (UX-07, UX-08) | Browser / Client | -- | UI element additions within existing client components |
| Layout restructure (UX-10, UX-13) | Browser / Client | -- | Component splitting and CSS changes |
| Data query extension (UX-09) | API / Backend | Browser / Client | Dashboard query needs `focalPointX`/`focalPointY` in select; then client applies `object-position` |
| Data logic fix (UX-11) | API / Backend | -- | Server action query logic in `pattern-dive-actions.ts` |
| SSR/hydration fix (UX-04) | Frontend Server (SSR) | Browser / Client | Server-side initialView prop already partially solves; client useEffect for localStorage |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16 | App Router, SSR, server components | Project framework [VERIFIED: package.json] |
| React | 19 | Component rendering, hooks, state management | Project framework [VERIFIED: package.json] |
| TypeScript | 5.x (strict) | Type safety | Project requirement [VERIFIED: CLAUDE.md] |
| Tailwind CSS | 4 | Styling with semantic tokens | Project styling layer [VERIFIED: package.json] |
| tw-animate-css | 1.4.0 | Animation utilities (`animate-in`, `slide-in-from-*`) | Already installed [VERIFIED: package.json] |
| lucide-react | installed | Icon library (Check, Plus, etc.) | Project icon library [VERIFIED: imports] |
| Vitest | installed | Testing framework | Project test framework [VERIFIED: test run] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | installed | Component testing | All component tests [VERIFIED: test-utils] |
| sonner | installed | Toast notifications | EditableNumber rejection feedback if toast added |

### Alternatives Considered
None -- this phase uses only existing project dependencies. No new libraries needed.

## Architecture Patterns

### System Architecture Diagram

```
UX-01,02,03,05,06,07,08,12,13,14   UX-04 (SSR assist)   UX-09,11 (data)
         |                                |                     |
    Client Components              Server Component        Server Actions
         |                           (supplies/page)      (dashboard, pattern-dive)
    [State + CSS changes]               |                     |
         |                        [initialView prop]    [Prisma select extension]
    Browser renders                     |                     |
    updated ARIA + visuals        SupplyCatalog            BucketProject type +
                                  [useEffect                query adds focalPoint
                                   localStorage]              fields
```

### Recommended Project Structure (no new files needed except component split)

```
src/components/features/
  charts/project-detail/
    focal-point-editor.tsx      # Refactored: state + action bar only
    focal-point-click-area.tsx  # NEW: extracted click overlay from editor
    hero-cover-banner.tsx       # Modified: renders both children
  supply-table/
    portal-autocomplete.tsx     # Modified: conditional highlight
    use-supply-table.ts         # Modified: hasUsedArrowKeys state
    supply-table-add-row.tsx    # Modified: commit button
    inline-create-dialog.tsx    # Modified: contextual labels
    editable-number.tsx         # Modified: rejection feedback
  charts/
    editable-number.tsx         # Modified: rejection feedback
    whats-next-tab.tsx          # Modified: kitting labels + gallery card layout
  shopping/
    shopping-for-bar.tsx        # Modified: pill styling
  dashboard/
    bucket-project-row.tsx      # Modified: focal point styling
  designers/
    designer-list.tsx           # Modified: ARIA attributes
  genres/
    genre-list.tsx              # Modified: ARIA attributes
  gallery/
    gallery-card.tsx            # Modified: Link wraps image
  stats/
    thread-insight-list.tsx     # Modified: rank numbers
  supplies/
    supply-catalog.tsx          # Modified: flash fix
src/types/
  dashboard.ts                  # Modified: BucketProject extends OptionalFocalPoint
src/lib/actions/
  project-dashboard-actions.ts  # Modified: select focalPointX/Y in chart query
  pattern-dive-actions.ts       # Investigated: may already be correct (see UX-11 analysis)
```

### Pattern 1: ARIA Group Pattern for Card Rows

**What:** Add `role="group"` and `aria-labelledby` to card containers that contain a name link + sibling action buttons, ensuring screen readers announce the group context.

**When to use:** Any card/row with a name link and separate action buttons that are visually associated but not DOM-nested.

**Example:**
```typescript
// Source: WAI-ARIA Practices, verified against existing codebase patterns
function DesignerRow({ designer, onEdit, onDelete }) {
  const nameId = `designer-name-${designer.id}`;
  return (
    <tr
      role="group"
      aria-labelledby={nameId}
      className="group hover:bg-muted/50 transition-colors"
    >
      <td className="px-4 py-3">
        <Link id={nameId} href={`/designers/${designer.id}`}>
          {designer.name}
        </Link>
      </td>
      {/* ... other cells ... */}
      <td>
        <button aria-label={`Edit ${designer.name}`} onClick={onEdit}>
          <Pencil />
        </button>
        <button aria-label={`Delete ${designer.name}`} onClick={onDelete}>
          <Trash2 />
        </button>
      </td>
    </tr>
  );
}
```

### Pattern 2: Keyboard-Gated Highlight

**What:** Track whether the user has pressed arrow keys to gate visual highlight display, preventing premature highlighting on dropdown open or mouse hover.

**When to use:** Autocomplete/combobox dropdowns where keyboard and mouse interaction coexist.

**Example:**
```typescript
// Source: Codebase pattern adapted from use-supply-table.ts
const [hasUsedArrowKeys, setHasUsedArrowKeys] = useState(false);

// In moveHighlight callback -- set flag when arrow keys are used
const moveHighlight = useCallback((direction, displayItems, existingIds) => {
  setHasUsedArrowKeys(true);
  setHighlightIndex((prev) => { /* existing logic */ });
}, []);

// Reset on new search or selection
useEffect(() => {
  setHighlightIndex(-1);
  setHasUsedArrowKeys(false);
}, [searchResults]);

// In PortalAutocomplete -- only show highlight when flag is true
const highlighted = hasUsedArrowKeys && index === highlightIndex;
```

### Pattern 3: Rejection Flash Animation

**What:** Show a brief visual flash (border + background) when an input value is rejected, using existing CSS animation classes.

**When to use:** EditableNumber or similar inline-edit components that silently revert invalid values.

**Example:**
```typescript
// Source: UI-SPEC UX-03 contract + existing globals.css animations
const [showRejection, setShowRejection] = useState(false);

function handleBlur() {
  const num = parseInt(draft);
  if (!isNaN(num) && num >= 0) {
    onSave(num);
  } else {
    setShowRejection(true);
    setTimeout(() => setShowRejection(false), 600);
  }
  setEditing(false);
}

// Read-mode button with rejection flash
<button
  className={cn(
    "hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5",
    showRejection && "border-destructive animate-shake border"
  )}
>
  {displayValue}
</button>
```

### Pattern 4: Dynamic Aspect Ratio from Image Dimensions

**What:** Capture image natural dimensions on load and apply CSS `aspect-ratio` to the container.

**When to use:** Image preview containers that should adapt to the uploaded image's proportions.

**Example:**
```typescript
// Source: UI-SPEC UX-13 contract
const [aspectRatio, setAspectRatio] = useState<string | null>(null);

<div
  className={cn("overflow-hidden rounded-lg border-2", !aspectRatio && "h-48")}
  style={aspectRatio ? { aspectRatio, maxHeight: "18rem" } : undefined}
>
  <img
    src={preview}
    className="h-full w-full object-contain"
    onLoad={(e) => {
      const img = e.currentTarget;
      setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`);
    }}
  />
</div>
```

### Anti-Patterns to Avoid
- **Nested interactive elements:** Never nest `<button>` or `<a>` inside another `<a>` or `<button>`. Use `role="group"` with sibling elements instead. [VERIFIED: D-01 through D-04 from CONTEXT.md]
- **Hardcoded color scales in new code:** Use semantic tokens (`text-selected-foreground`, `bg-destructive/10`) not raw Tailwind scales (`text-emerald-700`, `bg-red-100`). [VERIFIED: CLAUDE.md convention, QUAL-08 from Phase 24]
- **Adding `"use client"` unnecessarily:** All components being modified are already client components. Don't add it to new extracted components unless they need hooks. FocalPointClickArea will need it (uses event handlers). [VERIFIED: server-client-split.md rule]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shake animation | Custom CSS keyframes | Existing `.animate-shake` in globals.css | Already defined with 400ms duration, reduced-motion handling [VERIFIED: globals.css:274-291] |
| Slide-in animation | Custom animation | `animate-in slide-in-from-bottom-1` from tw-animate-css | Already used by popover, tooltip, dropdown-menu [VERIFIED: codebase grep] |
| Skeleton pulse | Custom loading animation | Existing `.animate-skeleton-pulse` in globals.css | Already defined with reduced-motion handling [VERIFIED: globals.css:260-272] |
| Focal point CSS utility | Manual object-position calc | `getObjectPositionStyle()` from `src/lib/utils/focal-point.ts` | Already tested, handles null gracefully [VERIFIED: focal-point.test.ts exists] |
| Button styling for commit | Custom button CSS | `buttonVariants` or inline semantic classes | Already standardized [VERIFIED: base-ui-patterns.md] |

## Common Pitfalls

### Pitfall 1: BucketProject Type Missing Focal Point Fields
**What goes wrong:** Adding `style={{ objectPosition: ... }}` to `bucket-project-row.tsx` without updating the `BucketProject` type and dashboard query means the data is undefined at runtime.
**Why it happens:** The `BucketProject` interface in `src/types/dashboard.ts` does NOT extend `OptionalFocalPoint` (unlike `CurrentlyStitchingProject`, `StartNextProject`, etc. which do). The `getProjectDashboardData` query in `project-dashboard-actions.ts` also doesn't `select` `focalPointX`/`focalPointY` from chart.
**How to avoid:** Three changes needed in sequence: (1) Update `BucketProject` type to extend `OptionalFocalPoint`, (2) add `focalPointX: true, focalPointY: true` to the chart select in the query, (3) populate the fields in the bucket project mapping.
**Warning signs:** TypeScript will error if the type is extended but the query doesn't provide the fields.

### Pitfall 2: Highlight Visibility Leak Through aria-activedescendant
**What goes wrong:** Even if visual highlight is gated by `hasUsedArrowKeys`, the `aria-activedescendant` attribute in `supply-table-add-row.tsx` still points to the first item, causing screen readers to announce a highlight that isn't visible.
**Why it happens:** `aria-activedescendant` is set based on `highlightIndex >= 0` without checking `hasUsedArrowKeys`.
**How to avoid:** Gate `aria-activedescendant` on `hasUsedArrowKeys && highlightIndex >= 0`.
**Warning signs:** Screen reader announces "option X selected" when dropdown opens without arrow key press.

### Pitfall 3: Focal Point Editor Split Breaks State Flow
**What goes wrong:** Splitting `FocalPointEditor` into two components (click area + action bar) means shared state (`isEditMode`, `pendingPoint`, `isPending`) needs to be lifted to the parent or passed via props.
**Why it happens:** Currently all state lives in one component. Splitting requires the parent (`HeroCoverBanner`) to own the edit state and pass it down to both children.
**How to avoid:** Lift `isEditMode`, `pendingPoint`, and handlers to `HeroCoverBanner`. Pass down as props to both `FocalPointClickArea` and `FocalPointActionBar`. Alternative: keep `FocalPointEditor` as the state owner and have it render both pieces, with the action bar rendered via a portal or passed as a child to the parent. The simplest approach: keep FocalPointEditor as state owner but change it to render two sibling outputs -- the click area overlay (rendered inside the banner's relative container via a prop/ref) and the action bar (rendered in normal flow). Since React components can return fragments, FocalPointEditor can return `<>{clickArea}{actionBar}</>` and the parent positions them.
**Warning signs:** Action bar doesn't respond to clicks, or click area doesn't update pending point.

### Pitfall 4: UX-04 Supply Catalog Flash Is Already Partially Solved
**What goes wrong:** Over-engineering the fix when the current implementation already handles the active tab via URL params.
**Why it happens:** The `initialView` prop from server-side `searchParams` already prevents flash for the threads tab. The flash only occurs when switching to beads/specialty tabs and the localStorage preference differs from the default.
**How to avoid:** The fix is minimal: for non-active tabs, the localStorage read happens in a `useEffect` that runs after hydration. Since those tabs aren't visible during the flash, the real issue is if the active tab's default doesn't match the stored preference. Solution: extend `initialView` to apply to the active tab's stored preference, or show a brief skeleton on the active tab's content area during the first render before localStorage is read.
**Warning signs:** Fix introduces a visible flash on other tabs or breaks the URL param flow.

### Pitfall 5: UX-11 Fabric Matching May Already Be Correct
**What goes wrong:** Implementing a "fix" that changes working behavior.
**Why it happens:** Looking at `pattern-dive-actions.ts` lines 156-192, the code already has two branches: when `fabricCount` is truthy (line 156-173, filters by exact count match), and when `fabricCount` is falsy (line 174-192, tries ALL unassigned fabrics and filters by size fit). The `else` branch at line 174 already handles null fabricCount by calculating required sizes using each fabric's own count.
**How to avoid:** Write a test that verifies the current behavior with null fabricCount. If the test passes showing correct candidates are returned, the "fix" is just adding test coverage, not a code change. If the test reveals the issue, fix accordingly.
**Warning signs:** Existing tests in `pattern-dive-actions.test.ts` may already cover this case.

### Pitfall 6: What's Next Card Restyling Scope Creep
**What goes wrong:** UX-14 becomes a massive rewrite of `whats-next-tab.tsx` when the intent is visual alignment, not functional change.
**Why it happens:** The current layout is a horizontal row (`flex items-center gap-4`). The UI-SPEC calls for vertical card stacks matching GalleryCard structure. This requires restructuring the JSX significantly.
**How to avoid:** Focus on the card container, image area, and text layout. Keep the existing data flow and sort logic untouched. The current `<Link>` wrapper stays as the card container -- just change its internal layout from horizontal to vertical. Reuse the GalleryCard CSS patterns (rounded-lg border, aspect-[4/3] image area, p-4 body) without importing GalleryCard itself (the data shapes are different).
**Warning signs:** Breaking the sort bar, star indicators, or kitting progress display.

## Code Examples

### UX-02: DesignerRow ARIA Enhancement
```typescript
// Source: Verified codebase structure + WAI-ARIA group pattern
function DesignerRow({ designer, onEdit, onDelete }) {
  const nameId = `designer-name-${designer.id}`;
  return (
    <tr
      role="group"
      aria-labelledby={nameId}
      className="group hover:bg-muted/50 transition-colors"
    >
      <td className="px-4 py-3">
        <Link
          id={nameId}
          href={`/designers/${designer.id}`}
          className="text-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          {designer.name}
        </Link>
      </td>
      {/* aria-labels already present on Edit/Delete buttons */}
    </tr>
  );
}
```

### UX-05: Three-State Kitting Label
```typescript
// Source: whats-next-tab.tsx line 185 + UI-SPEC UX-05 contract
<p className="text-muted-foreground/70 mt-0.5 text-xs">
  {project.kittingPercent === 100
    ? "Fully kitted"
    : project.kittingPercent === 0
      ? "Not kitted"
      : "Kitting"}
</p>
```

### UX-08: InlineCreateDialog Contextual Labels
```typescript
// Source: UI-SPEC UX-08 contract
const LABEL_MAP: Record<SupplyType, {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
}> = {
  THREAD: {
    title: "Create Thread",
    nameLabel: "Color Name",
    namePlaceholder: "e.g. Christmas Red",
    codeLabel: "Color Code",
    codePlaceholder: "e.g. 321 (optional)",
  },
  BEAD: {
    title: "Create Bead",
    nameLabel: "Bead Name",
    namePlaceholder: "e.g. Glass Seed Bead",
    codeLabel: "Product Code",
    codePlaceholder: "e.g. 02013 (optional)",
  },
  SPECIALTY: {
    title: "Create Specialty Item",
    nameLabel: "Product Name",
    namePlaceholder: "e.g. Kreinik Braid",
    codeLabel: "Product Code",
    codePlaceholder: "e.g. 002HL (optional)",
  },
};
```

### UX-09: BucketProject Focal Point Application
```typescript
// Source: Existing pattern from gallery-card.tsx + focal-point.ts utility
import { getObjectPositionStyle } from "@/lib/utils/focal-point";

// In bucket-project-row.tsx
<img
  src={imageUrl}
  alt={project.projectName}
  loading="lazy"
  className="h-full w-full object-cover"
  style={getObjectPositionStyle(project.focalPointX, project.focalPointY)}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `role="row"` for card groups | `role="group"` + `aria-labelledby` for non-table contexts | WAI-ARIA 1.2 | Cleaner semantics for card-based layouts |
| Fixed aspect ratio containers | CSS `aspect-ratio` property | Baseline 2021 | Native browser support, no JS needed for layout |
| `tw-animate` plugin (Tailwind 3) | `tw-animate-css` (Tailwind 4) | 2025 | CSS-first approach, no plugin config |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | UX-11 fabric matching already handles null fabricCount correctly via the else branch | Pitfall 5 | Moderate: may need actual code fix instead of just test coverage |
| A2 | `animate-in slide-in-from-bottom-1` from tw-animate-css will render the focal point action bar slide correctly as a non-absolute sibling | Architecture Patterns | Low: fallback to custom `.animate-slide-in` already in globals.css |
| A3 | DesignerRow/GenreRow action buttons already have `aria-label` attributes | Code review of designer-list.tsx/genre-list.tsx | Low: verified in source, but mobile cards need double-checking |

## Open Questions (RESOLVED)

1. **UX-11 Fabric Matching: Is This Actually Broken?**
   - What we know: The code has two branches -- `fabricCount` truthy uses exact count match, falsy uses all fabrics filtered by size fit. The CONTEXT.md says "null fabricCount short-circuits matching, returns zero candidates."
   - What's unclear: The code at line 174-192 does handle the null case by trying all fabrics. The requirement description may be based on stale understanding. Alternatively, the issue may be that `filter((f) => f.fitsWidth || f.fitsHeight)` at line 192 is too strict if stitch dimensions are such that no fabric fits.
   - Recommendation: Write a test with null fabricCount and verify actual behavior before writing a fix. If the code works correctly, the "fix" is adding test coverage (still satisfies UX-11).
   - RESOLVED: The falsy branch's `.filter((f) => f.fitsWidth || f.fitsHeight)` is more restrictive than the truthy branch (which shows all including non-fitting). Plan 03 Task 2 removes the filter to match truthy branch behavior, with test-first verification of actual behavior before applying the fix.

2. **UX-14 What's Next Card Restructuring Scope**
   - What we know: UI-SPEC specifies vertical card stack with `aspect-[4/3]` image, responsive grid, `bg-card border-border rounded-lg border` wrapper.
   - What's unclear: How much of the existing card content (star indicator, kitting progress bar, status badge) should change position vs. just get restyled.
   - Recommendation: Follow UI-SPEC layout precisely. Star indicator moves to image overlay or card header. Kitting progress moves to card footer. Status badge in footer matching GalleryCard pattern.
   - RESOLVED: Plan 02 Task 3 follows UI-SPEC layout precisely with specific placement for each element. Star indicator moves to image overlay (absolute top-right), kitting progress to card body, status badge to footer matching GalleryCard pattern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest via project) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run [file]` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Keyboard highlight gated by arrow key | unit | `npx vitest run src/components/features/supply-table/portal-autocomplete.test.tsx -x` | Yes |
| UX-02 | Card rows have role="group" + aria-labelledby | unit | `npx vitest run src/components/features/designers/designer-list.test.tsx -x` | Yes |
| UX-03 | EditableNumber shows rejection flash | unit | `npx vitest run src/components/features/supply-table/editable-number.test.tsx -x` | Yes |
| UX-04 | Supplies page no flash on load | unit | `npx vitest run src/components/features/supplies/supply-catalog.test.tsx -x` | Yes |
| UX-05 | Kitting label three-state | unit | `npx vitest run src/components/features/charts/whats-next-tab.test.tsx -x` | Yes |
| UX-06 | Shopping pills squared styling | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -x` | Yes |
| UX-07 | Visible commit button in add row | unit | `npx vitest run src/components/features/supply-table/supply-table-add-row.test.tsx -x` | Yes |
| UX-08 | Contextual labels per supply type | unit | `npx vitest run src/components/features/supply-table/inline-create-dialog.test.tsx -x` | Yes |
| UX-09 | BucketProject focal point applied | unit | `npx vitest run src/components/features/dashboard/bucket-project-row -- TBD` | No (needs creation) |
| UX-10 | Focal point action bar outside image | unit | `npx vitest run src/components/features/charts/project-detail/focal-point-editor.test.tsx -x` | Yes |
| UX-11 | Fabric matching null fabricCount | unit | `npx vitest run src/lib/actions/pattern-dive-actions.test.ts -x` | Yes |
| UX-12 | ThreadInsightList rank numbers | unit | `npx vitest run src/components/features/stats/thread-insight-list.test.tsx -x` | Yes |
| UX-13 | Cover image dynamic aspect ratio | unit | `npx vitest run src/components/features/charts/form-primitives/cover-image-upload.test.tsx -x` | Yes |
| UX-14 | What's Next gallery card styling | unit | `npx vitest run src/components/features/charts/whats-next-tab.test.tsx -x` | Yes |

### Sampling Rate
- **Per task commit:** `npx vitest run [modified test files] -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/dashboard/bucket-project-row.test.tsx` -- covers UX-09 (BucketProject focal point styling); no colocated test file exists for this component

## Security Domain

This phase does not introduce authentication, session management, access control, cryptography, or input validation changes. All modifications are to UI presentation, ARIA attributes, and one read-only query extension (adding select fields to an existing authenticated query).

Security domain: **Not applicable** -- no ASVS categories apply to this phase.

## Project Constraints (from CLAUDE.md)

Directives from CLAUDE.md that constrain this phase:

- **TDD mandatory** -- tests before implementation in all plans
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **Semantic design tokens only** -- no hardcoded color scales
- **Server Components by default** -- `"use client"` only for interactivity
- **No `Button render={<Link>}`** -- use `LinkButton` or `Link className={buttonVariants()}`
- **Comment conventions** -- D-08 deviation comment is allowed per comment-conventions.md (explains "why" for non-obvious choice)
- **Quality gates** -- `/impeccable:polish` after UI plans, `/impeccable:audit` at phase boundary
- **Pin exact versions** -- no new deps in this phase, so N/A
- **Check Context7 for bleeding-edge lib APIs** before using version-specific features

## Sources

### Primary (HIGH confidence)
- Codebase source files -- all 14 target files read and analyzed
- `globals.css` -- animation keyframes and semantic tokens verified
- `package.json` -- tw-animate-css 1.4.0 verified
- `26-CONTEXT.md` -- 14 locked decisions (D-01 through D-14)
- `26-UI-SPEC.md` -- component interaction contracts for all 14 requirements
- `REQUIREMENTS.md` -- UX-01 through UX-14 requirement definitions

### Secondary (MEDIUM confidence)
- WAI-ARIA group role pattern -- standard accessibility practice [CITED: w3.org/WAI/ARIA/apg/]
- CSS aspect-ratio property -- baseline browser support since 2021 [CITED: caniuse.com]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all existing project dependencies, no new libraries
- Architecture: HIGH -- all target files read, modification scope is clear
- Pitfalls: HIGH -- verified through source code analysis, edge cases identified
- UX-11 correctness: MEDIUM -- code appears to already handle null but needs test verification

**Research date:** 2026-05-19
**Valid until:** 2026-06-19 (stable -- polish phase, no external dependency changes)
