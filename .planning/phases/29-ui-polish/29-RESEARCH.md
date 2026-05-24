# Phase 29: UI Polish - Research

**Researched:** 2026-05-23
**Domain:** UI component polish, gallery cards, supply management, file uploads
**Confidence:** HIGH

## Summary

Phase 29 is a polish phase touching four distinct areas: (1) colored status/size pills on gallery cards, (2) digital copy indicator on gallery cards, (3) skein calculator controls on project detail supplies tab, and (4) file upload improvements. All changes modify existing components -- no new pages or data models.

The codebase is well-structured for these changes. Status and size color configs are centralized (`STATUS_CONFIG`, `SIZE_COLORS`), the `SizeBadge` component already exists and is used elsewhere but not on gallery cards, the `CalculatorSettingsBar` already exists with persistence logic but is unused, and upload validation is centralized in a single file. The sort controls for BUG-03 already exist and appear functional in code -- the bug needs investigation.

**Primary recommendation:** Three parallel plans -- (1) gallery card visual polish (status/size colors + digital copy indicator), (2) supply tab improvements (calculator card + sort fix), (3) file upload changes. All are independent.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Give `Unstarted` status a slate/stone color instead of grey (`bg-muted`). Use slate-50/slate-700 (light) and slate-900/slate-300 (dark). All other 6 statuses already have colors -- no changes to those.
- **D-02:** Update `STATUS_CONFIG` in `src/lib/utils/status.ts` to replace the `bg-muted`/`text-muted-foreground` classes on the `UNSTARTED` entry with slate-toned classes.
- **D-03:** Replace the hardcoded grey inline classes on the gallery card size badge with the existing `SIZE_COLORS` from `src/lib/utils/size-category.ts`. The `SizeBadge` component exists and is used on project detail -- reuse it on gallery cards.
- **D-04:** Lighten the `SIZE_COLORS` to use -50 shade backgrounds instead of the current -100. Keep same hues.
- **D-05:** Add `hasDigitalCopy: boolean` field to `GalleryCardData` (derived from `_count.files > 0` in the gallery query). No file count -- just presence/absence.
- **D-06:** Display a small badge in the card body area (below cover image). Icon + "Digital copy" label. Not an overlay on the image.
- **D-07:** Investigate whether supply sort bug is sorting not working, controls not visible, or something else. Fix whatever is broken.
- **D-08:** Reuse the full `CalculatorCard` component on the project detail Supplies tab, positioned above the supply table.
- **D-09:** Changes to calculator params persist to database via server action, not view-only.
- **D-10:** Fabric selector in CalculatorCard shows the project's assigned fabric. If none assigned, shows available user fabrics.
- **D-11:** Increase `MAX_FILE_SIZE` from 10MB to 50MB. Update error message accordingly.
- **D-12:** Add `.zip` support to chart file uploads only: add zip MIME types to `ALLOWED_CHART_FILE_TYPES`, add `.zip` to `ALLOWED_CHART_FILE_EXTENSIONS`.

### Claude's Discretion
- Test strategy and plan structure/grouping.
- Exact icon choice for the digital copy indicator (Lucide icon selection).
- Layout of digital copy badge within the card body.
- How to wire CalculatorCard on project detail -- may need new server action or extend existing.
- Whether to extract `SizeBadge` usage directly into gallery card or refactor to use shared component.
- Fix approach for BUG-03 supply sort.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Status and size pills on gallery cards and Pattern Dive use colored styling instead of grey | STATUS_CONFIG update for UNSTARTED, SIZE_COLORS lightened to -50, SizeBadge reuse on gallery-card and gallery-grid |
| UI-02 | Gallery cards show indicator when a digital working copy has been uploaded | GalleryCardData.hasDigitalCopy field, Prisma _count query, FileText icon in card body |
| UI-03 | Project supplies card includes skein calculation adjustment controls (count, over 1/2, waste) | CalculatorCard reuse with persistence via updateProjectSettings, fabric options from getUnassignedFabrics |
| UI-04 | File upload limit increased to 15MB | MAX_FILE_SIZE constant and error message update (user chose 50MB per D-11) |
| UI-05 | .zip files accepted as valid upload format for digital working copies | ALLOWED_CHART_FILE_TYPES, ALLOWED_CHART_FILE_EXTENSIONS, and ALLOWED_FILE_TYPES updates |
| BUG-03 | User can sort supplies by Added order and A-Z on project detail Supplies tab | Sort controls exist, sortSupplyRows function exists -- investigate and fix what's broken |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- TDD mandatory -- tests before implementation
- Server Components by default, `"use client"` only for interactivity
- Zod validation at boundaries
- Semantic design tokens (no hardcoded color scales like `stone-*`, `emerald-*`)
- Import test utils from `@/__tests__/test-utils`
- Pin exact versions in package.json
- No `Button render={<Link>}` -- use `LinkButton`
- Colocated tests (`foo.test.tsx` next to `foo.tsx`)
- Comment conventions: no WHAT-comments, no JSX section markers

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Status/size pill colors | Client (gallery components) | Config (status.ts, size-category.ts) | Color config is shared utility, rendering is client-side |
| Digital copy indicator | Database query | Client (gallery card) | Prisma query provides data, client renders conditional badge |
| Skein calculator on project detail | Client (CalculatorCard) | API (updateProjectSettings) | Interactive UI with server action persistence |
| Supply sort fix | Client (supplies-tab) | -- | Sort logic is client-side, data comes pre-sorted from server |
| File upload limits | API (upload validation) | Client (file picker accept) | Server validates size/type, client constrains file picker |

## Standard Stack

No new libraries needed. All changes use existing project dependencies.

### Core (Already Installed)
| Library | Purpose | Why Standard |
|---------|---------|--------------|
| lucide-react | Icon for digital copy indicator | Already used throughout (Sparkles, Plus, etc.) |
| @base-ui/react | Tooltip for size badge | Already wrapping size badges in gallery |
| sonner | Toast for calc param save errors | Already used by CalculatorSettingsBar pattern |

### Supporting
No new supporting libraries needed.

### Alternatives Considered
None -- this phase uses only existing infrastructure.

## Architecture Patterns

### System Architecture Diagram

```
Gallery Page (/charts)
  |
  v
getChartsForGallery() --- Prisma query (needs _count.files added)
  |
  v
transformToGalleryCard() --- maps Prisma data to GalleryCardData (needs hasDigitalCopy)
  |
  v
GalleryCard / GalleryGrid --- renders StatusBadge (reads STATUS_CONFIG)
                              renders SizeBadge (reads SIZE_COLORS)
                              renders digital copy indicator (conditional)

Project Detail Page (/charts/[id])
  |
  v
page.tsx --- fetches chart + supplies + fabric options (needs getUnassignedFabrics added)
  |
  v
ProjectDetailPage --- passes data to SuppliesTab
  |
  v
SuppliesTab --- renders CalculatorCard (new) + sort controls (existing) + SupplyTable
  |
  v
updateProjectSettings() --- persists calc param changes to database

Upload Flow
  |
  v
upload.ts --- centralized constants (MAX_FILE_SIZE, ALLOWED_*_TYPES)
  |
  v
chart-file-upload.tsx / chart-file-list.tsx --- client-side validation
  |
  v
upload-actions.ts --- server-side validation (checks ALLOWED_FILE_TYPES)
```

### Pattern 1: Config-Driven Badge Colors
**What:** Status and size colors are defined in centralized config objects (`STATUS_CONFIG`, `SIZE_COLORS`), consumed by badge components.
**When to use:** Any badge that needs consistent per-category coloring across multiple views.
**Example:**
```typescript
// Source: src/lib/utils/status.ts (existing pattern)
export const STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
  darkBgClass: string;
}> = {
  UNSTARTED: {
    label: "Unstarted",
    bgClass: "bg-slate-50",          // was bg-muted
    textClass: "text-slate-700 dark:text-slate-300",  // was text-muted-foreground
    dotClass: "bg-slate-500",        // was bg-muted-foreground/60
    darkBgClass: "dark:bg-slate-900/40",  // was ""
  },
  // ... other statuses unchanged
};
```

### Pattern 2: Server Action Persistence for Calc Params
**What:** Interactive controls update local state immediately, then persist via server action with optimistic rollback on failure.
**When to use:** Any inline-editable setting that needs database persistence.
**Example:**
```typescript
// Source: src/components/features/charts/project-detail/calculator-settings-bar.tsx (existing)
const handleSettingChange = useCallback(
  (field: keyof CalculatorSettings, value: number) => {
    const newSettings = { ...settingsRef.current, [field]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    startTransition(async () => {
      try {
        const result = await updateProjectSettings(chartId, { [field]: value });
        if (!result.success) {
          setLocalSettings(settings);  // rollback
          onSettingsChange(settings);
          toast.error("Couldn't save settings. Please try again.");
        }
      } catch (error) {
        setLocalSettings(settings);  // rollback
        onSettingsChange(settings);
        toast.error("Couldn't save settings. Please try again.");
      }
    });
  },
  [chartId, settings, onSettingsChange],
);
```

### Pattern 3: Prisma _count for Derived Booleans
**What:** Use `_count` with `select` to derive boolean flags without fetching related records.
**When to use:** When you need presence/absence of related records, not the records themselves.
**Example:**
```typescript
// Needed for hasDigitalCopy
const charts = await prisma.chart.findMany({
  include: {
    // ... existing includes ...
    _count: { select: { files: true } },
  },
});
// In transform: hasDigitalCopy = chart._count.files > 0
```

### Anti-Patterns to Avoid
- **Hardcoded grey for "no color assigned" badges:** Use a deliberate color (slate for Unstarted) instead of semantic neutrals (`bg-muted`). Muted classes mean "secondary info," not "no status."
- **Duplicating badge rendering in gallery views:** Gallery card, list view, and table view each have inline size badge rendering. Use the shared `SizeBadge` component or at minimum apply `SIZE_COLORS` consistently.
- **Server-side validation gap for zip files:** Adding zip to client-side `ALLOWED_CHART_FILE_TYPES` without also adding to server-side `ALLOWED_FILE_TYPES` will cause server rejection. See Pitfall 1 below.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calc param persistence | Custom save logic | Existing `updateProjectSettings` action | Already validates with Zod, handles auth, revalidates path |
| Fabric options fetching | Custom Prisma query | Existing `getUnassignedFabrics(projectId)` | Already handles ownership, linked/unlinked filtering |
| Badge color config | Inline Tailwind classes | `STATUS_CONFIG` / `SIZE_COLORS` lookup objects | Single source of truth across all views |
| Size badge rendering | Inline span with classes | `SizeBadge` component | Already handles size calculation, color lookup, formatting |

**Key insight:** This phase is almost entirely wiring existing infrastructure together. The `CalculatorCard`, `SizeBadge`, `StatusBadge`, `updateProjectSettings`, and `getUnassignedFabrics` already exist -- the work is connecting them to new locations.

## Common Pitfalls

### Pitfall 1: Server-Side Zip Upload Rejection
**What goes wrong:** Adding `.zip` to `ALLOWED_CHART_FILE_TYPES` and `ALLOWED_CHART_FILE_EXTENSIONS` (client-side) but not to `ALLOWED_FILE_TYPES` (server-side) causes the server action to reject zip uploads with "Invalid file type."
**Why it happens:** D-12 says "Do NOT add zip to `ALLOWED_FILE_TYPES` (covers/sessions stay image-only)" -- but `ALLOWED_FILE_TYPES` is checked for `category === "files"` (chart files), not for covers or sessions. Those categories check `ALLOWED_IMAGE_TYPES` separately.
**How to avoid:** Add `"application/zip"` and `"application/x-zip-compressed"` to BOTH `ALLOWED_CHART_FILE_TYPES` AND `ALLOWED_FILE_TYPES`. The covers/sessions categories are already gated by `ALLOWED_IMAGE_TYPES` checks, so adding zip to `ALLOWED_FILE_TYPES` does not affect them.
**Warning signs:** Zip files pass client-side validation but fail on server with type error. [VERIFIED: codebase inspection of upload-actions.ts lines 79-87]

### Pitfall 2: Unused CalculatorSettingsBar Already Exists
**What goes wrong:** Building a new persistence layer for calc params on the supplies tab when one already exists.
**Why it happens:** `CalculatorSettingsBar` (`src/components/features/charts/project-detail/calculator-settings-bar.tsx`) was built with full `updateProjectSettings` persistence, optimistic updates, and rollback -- but is NOT imported by any production component. It has tests but is dead code.
**How to avoid:** D-08 says to use `CalculatorCard` (the chart form component with fabric selector), not `CalculatorSettingsBar`. The `CalculatorCard` is a UI component that takes `onCalcParamsChange` and `onFabricChange` callbacks. The persistence logic from `CalculatorSettingsBar` should be adapted into the SuppliesTab wrapper, or `CalculatorSettingsBar`'s patterns should be studied for the optimistic update approach.
**Warning signs:** Two different calculator UIs on the same page, or missing persistence. [VERIFIED: codebase inspection -- CalculatorSettingsBar has zero production imports]

### Pitfall 3: Gallery Data Type Chain Mismatch
**What goes wrong:** Adding `hasDigitalCopy` to `GalleryCardData` but forgetting to update the full type chain: `GalleryChartData` (in `types/chart.ts`) must include `_count` in its type, `getChartsForGallery` must include `_count` in the Prisma query, and `transformToGalleryCard` must map it.
**Why it happens:** Three files in the chain: `types/chart.ts` (type), `chart-actions.ts` (query), `gallery-utils.ts` (transform). Missing any one breaks the chain silently (TypeScript will catch it, but the three locations are easy to miss).
**How to avoid:** Update all three together: (1) `GalleryChartData` type adds `_count?: { files: number }`, (2) `getChartsForGallery` adds `_count: { select: { files: true } }`, (3) `transformToGalleryCard` maps `hasDigitalCopy: (chart._count?.files ?? 0) > 0`.
**Warning signs:** TypeScript errors about missing `_count` property, or `hasDigitalCopy` always false. [VERIFIED: codebase inspection]

### Pitfall 4: SizeBadge Gallery Card vs Tooltip Integration
**What goes wrong:** The existing `SizeBadge` component doesn't include a tooltip, but the gallery card's inline size badge is wrapped in a `<Tooltip>` + `<TooltipTrigger>`. Simply dropping in `<SizeBadge>` loses the tooltip.
**Why it happens:** `SizeBadge` was designed for contexts where a tooltip isn't needed (project detail hero, designer/genre detail). Gallery cards need the tooltip because the badge is small and the size categories need explanation.
**How to avoid:** Either (a) wrap `SizeBadge` in a `Tooltip`/`TooltipTrigger` in the gallery card, or (b) apply `SIZE_COLORS` directly to the existing tooltip-wrapped span. Option (a) may require `SizeBadge` to accept `className` and `render` overrides for the `TooltipTrigger`. Option (b) is simpler -- just replace the grey classes with `SIZE_COLORS[card.sizeCategory]`.
**Warning signs:** Size badge on gallery card loses its hover tooltip. [VERIFIED: codebase inspection -- SizeBadge has no tooltip, gallery card has inline tooltip wrapper]

### Pitfall 5: SuppliesTab Needs Fabric Options Data
**What goes wrong:** `CalculatorCard` requires `fabricOptions` prop but `SuppliesTab` currently receives only `project` and `supplies`. There's no fabric options data flowing down.
**Why it happens:** The chart form gets fabric options via `unassignedFabrics` passed as a prop from the edit page. The project detail page doesn't fetch fabric options.
**How to avoid:** Either (a) add `getUnassignedFabrics(project.id)` to the page-level data fetching in `charts/[id]/page.tsx` and pass it through `ProjectDetailPage` to `SuppliesTab`, or (b) fetch fabric options client-side in `SuppliesTab` via `useEffect`. Option (a) is cleaner (server-side data fetch), but requires prop threading through `ProjectDetailPage`. Option (b) requires a client-callable fabric action.
**Warning signs:** `CalculatorCard` renders with empty fabric dropdown. [VERIFIED: codebase inspection -- page.tsx does not call getUnassignedFabrics]

### Pitfall 6: D-11 vs Requirement Mismatch on Upload Size
**What goes wrong:** UI-04 requirement says "File upload limit increased to 15MB" but D-11 from discussion says 50MB.
**Why it happens:** The user decided during discussion that 50MB is more appropriate than 15MB. The REQUIREMENTS.md was written before the discussion.
**How to avoid:** Follow D-11 (50MB) -- discussion decisions supersede initial requirement text. The planner should note this for the verifier.
**Warning signs:** Verifier fails the phase because it checks against REQUIREMENTS.md text. [VERIFIED: REQUIREMENTS.md says "15MB", CONTEXT.md D-11 says "50MB"]

## Code Examples

### STATUS_CONFIG Update (D-01, D-02)
```typescript
// Source: src/lib/utils/status.ts — update UNSTARTED entry
UNSTARTED: {
  label: "Unstarted",
  cssVar: "--status-unstarted",
  bgClass: "bg-slate-50",
  textClass: "text-slate-700 dark:text-slate-300",
  dotClass: "bg-slate-500",
  darkBgClass: "dark:bg-slate-900/40",
},
```

### SIZE_COLORS Update (D-04)
```typescript
// Source: src/lib/utils/size-category.ts — lighten all bg from -100 to -50
Mini: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
Small: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
Medium: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
Large: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
BAP: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
```

### Gallery Card Size Badge Replacement (D-03)
```tsx
// Replace inline grey badge (gallery-card.tsx lines 198-208) with SIZE_COLORS
// Option: Apply SIZE_COLORS directly to existing tooltip-wrapped span
<Tooltip>
  <TooltipTrigger
    render={<span />}
    className={`${SIZE_COLORS[card.sizeCategory].bg} ${SIZE_COLORS[card.sizeCategory].text} cursor-default rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase`}
  >
    {card.sizeCategory}
  </TooltipTrigger>
  <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
</Tooltip>
```

### Digital Copy Indicator (D-05, D-06)
```tsx
// Source: UI-SPEC — in gallery-card.tsx card body, after stitch count
{card.hasDigitalCopy && (
  <div className="flex items-center gap-1">
    <FileText className="text-primary size-3.5" aria-hidden="true" />
    <span className="text-muted-foreground text-xs">Digital copy</span>
  </div>
)}
```

### GalleryChartData Type Update
```typescript
// Source: src/types/chart.ts — add _count to GalleryChartData
export type GalleryChartData = Chart & {
  project: GalleryProjectData | null;
  designer: Designer | null;
  genres: Genre[];
  _count?: { files: number };  // for hasDigitalCopy derivation
};
```

### Upload Validation Updates (D-11, D-12)
```typescript
// Source: src/lib/validations/upload.ts
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = [
  // ... existing types ...
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_TYPES = [
  // ... existing types ...
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ALLOWED_CHART_FILE_EXTENSIONS = [
  // ... existing extensions ...
  ".zip",
] as const;

// Update error message
.max(MAX_FILE_SIZE, "File is too large. Maximum size is 50MB.")
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Grey bg-muted for UNSTARTED | Slate-50/700 colored badge | This phase | All gallery views show colored UNSTARTED badge |
| -100 shade size badge backgrounds | -50 shade (lighter, more muted) | This phase | Visual hierarchy: status badges bold, size badges subtle |
| Inline grey size badge on gallery cards | SIZE_COLORS from shared config | This phase | Consistent coloring across gallery, detail, designer, genre pages |
| No digital copy indicator | FileText icon + "Digital copy" label | This phase | Users can identify projects with uploaded patterns at a glance |
| 10MB upload limit | 50MB upload limit | This phase | Covers individual patterns and reasonable PDFs |
| No zip support | .zip accepted for chart files | This phase | Users can upload zipped pattern bundles |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | BUG-03 supply sort controls exist and function correctly in code -- the bug may be a visibility/UX issue rather than a logic bug | Common Pitfalls | Low -- investigation task will identify root cause |
| A2 | Prisma `_count` with `select` works in the existing Prisma 7 setup for the gallery query | Architecture Patterns | Low -- _count is a stable Prisma feature, but Prisma 7 import paths should be verified |
| A3 | `updateProjectSettings` schema needs no changes for calc param persistence (already accepts strandCount, overCount, wastePercent) | Architecture Patterns | None -- verified by reading schema definition |
| A4 | `updateProjectSettings` does NOT handle fabricId changes -- a separate mechanism is needed | Common Pitfalls | Medium -- fabric change on CalculatorCard requires either extending updateProjectSettings or using a separate action |

## Open Questions (RESOLVED)

1. **BUG-03: What exactly is broken with supply sorting?** — RESOLVED: Investigate during execution. TDD approach writes tests for both sort modes first, then fixes whatever fails.

2. **Fabric change persistence on CalculatorCard** — RESOLVED: The CalculatorCard on the project detail Supplies tab persists numeric calc params only (fabricCount, strandCount, overCount, wastePercent) via `updateProjectSettings`. Fabric assignment (fabricId) is a separate concern handled by the chart form's save action. The fabric selector in CalculatorCard is a lookup tool — selecting a fabric updates the count for immediate calculation but does not reassign the project's fabric. This is intentional: fabric assignment is a higher-intent action that belongs in the chart edit form.

3. **Gallery grid size badge update scope** — RESOLVED: Apply colored SIZE_COLORS to all three gallery views (card, list, table) for consistency. ROADMAP says "gallery cards and Pattern Dive" which uses all three views.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | STATUS_CONFIG UNSTARTED uses slate classes | unit | `npm test -- --run src/lib/utils/status.ts` | No (status.ts has no test file -- config object, test via StatusBadge) |
| UI-01 | SIZE_COLORS uses -50 shade backgrounds | unit | `npm test -- --run src/lib/utils/size-category.test.ts` | Yes (needs new assertions) |
| UI-01 | Gallery card renders colored size badge | unit | `npm test -- --run src/components/features/gallery/gallery-card.test.tsx` | Yes (needs new assertions) |
| UI-01 | StatusBadge UNSTARTED renders slate classes | unit | `npm test -- --run src/components/features/charts/status-badge.test.tsx` | No (Wave 0 gap) |
| UI-02 | Gallery card shows digital copy indicator when hasDigitalCopy=true | unit | `npm test -- --run src/components/features/gallery/gallery-card.test.tsx` | Yes (needs new tests) |
| UI-02 | Gallery card hides indicator when hasDigitalCopy=false | unit | `npm test -- --run src/components/features/gallery/gallery-card.test.tsx` | Yes (needs new tests) |
| UI-02 | transformToGalleryCard maps _count.files to hasDigitalCopy | unit | `npm test -- --run src/components/features/gallery/gallery-utils.test.ts` | Yes (needs new tests) |
| UI-03 | CalculatorCard renders on project detail supplies tab | unit | `npm test -- --run src/components/features/charts/project-detail/supplies-tab.test.tsx` | Yes (needs new tests) |
| UI-03 | Calc param changes persist via updateProjectSettings | unit | `npm test -- --run src/lib/actions/chart-actions-settings.test.ts` | Yes (existing tests cover action) |
| UI-04 | MAX_FILE_SIZE is 50MB | unit | `npm test -- --run src/lib/actions/upload-actions.test.ts` | Yes (needs assertion update) |
| UI-05 | Zip MIME types accepted for chart files | unit | `npm test -- --run src/lib/actions/upload-actions.test.ts` | Yes (needs new tests) |
| BUG-03 | Supply sort controls produce correct sort order | unit | `npm test -- --run src/components/features/charts/project-detail/supplies-tab.test.tsx` | Yes (needs investigation + tests) |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/charts/status-badge.test.tsx` -- verify UNSTARTED renders slate classes
- [ ] `createMockGalleryCard` factory needs `hasDigitalCopy` field added

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | -- |
| V3 Session Management | no | -- |
| V4 Access Control | yes (marginal) | Existing requireAuth() on upload and updateProjectSettings actions |
| V5 Input Validation | yes | Zod schemas: uploadRequestSchema, updateProjectSettingsSchema |
| V6 Cryptography | no | -- |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Zip bomb upload | Denial of Service | R2 storage has per-object size limits (50MB cap); no server-side extraction |
| Malicious MIME type spoofing | Tampering | Both MIME type AND file extension validated; chart files are stored, not executed |
| Oversized file upload | DoS | Zod schema enforces MAX_FILE_SIZE server-side (not just client) |

No new auth/security patterns needed. All affected server actions already use `requireAuth()`. The file upload increase from 10MB to 50MB is within R2's per-object limits (5GB max).

## Sources

### Primary (HIGH confidence)
- Codebase inspection of all referenced files (verified file contents, type chains, import graphs)
- Existing test files for patterns and mock factories

### Secondary (MEDIUM confidence)
- UI-SPEC (29-UI-SPEC.md) for visual specifications
- CONTEXT.md for locked decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all existing infrastructure
- Architecture: HIGH -- all code paths inspected, type chains verified
- Pitfalls: HIGH -- found critical server-side zip validation gap, identified unused CalculatorSettingsBar, verified data flow gaps

**Research date:** 2026-05-23
**Valid until:** 2026-06-23 (stable -- no dependency changes expected)
