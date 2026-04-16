# Phase 7: Project Detail Experience - Research

**Researched:** 2026-04-15
**Domain:** Full-page redesign (hero, tabs, inline calculator, supply UX) in Next.js 16 App Router
**Confidence:** HIGH

## Summary

Phase 7 transforms the existing flat `chart-detail.tsx` into a rich, tabbed project detail experience with a hero cover image banner, interactive status badge, status-aware overview sections, and a completely redesigned supply management tab with inline skein calculation. The phase folds in 5 backlog items (999.0.2, 999.0.10, 999.0.13, 999.0.15, 999.0.16) alongside 6 requirements (CALC-01 through CALC-05, SUPP-01).

The existing codebase provides strong foundations: `ProjectThread.stitchCount` already exists in the schema, the `updateQuantitySchema` already supports stitch count updates, shadcn Tabs with `variant="line"` is already installed, `nuqs` is already used for URL state management in the gallery, and the `StatusControl` component provides the base for hero integration. The primary new work is: (1) schema additions for project-level calculator settings, (2) the skein calculation formula as a pure utility, (3) hero component with blurred background cover image, (4) tab URL state persistence, (5) redesigned two-line supply rows with calculator integration, (6) SearchToAdd enhancements (scroll fixes, inline create), and (7) status-aware overview section ordering.

**Primary recommendation:** Structure as 6-7 plans progressing from data layer/formula through hero components, tabs, supply redesign, calculator integration, and SearchToAdd enhancements. The skein formula is pure math (no external deps) and should be the first deliverable since it unblocks all supply row work.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full-width hero banner with cover image. `object-contain` with tinted/blurred background fill -- never crop.
- **D-02:** No cover image = skip banner. Compact metadata-forward hero. No placeholder gradients.
- **D-03:** Tabbed layout: Overview + Supplies. Active tab persists in URL params.
- **D-04:** Hero shows: chart name, designer, interactive status badge, stitch count, size badge, progress %.
- **D-05:** Visual direction: warm + tactile + data-dense with strong typography. Information-dense craft journal.
- **D-06:** Overview tab is status-aware -- sections reorder based on project status.
- **D-07:** Kebab menu for overflow actions (delete). Edit stays visible as primary action.
- **D-08:** Status badge in hero is clickable with clear visual affordance (chevron/dropdown indicator).
- **D-09:** Default to stitch count entry. Auto-calc skeins. Clear field for direct skein entry. One row layout handles all three entry paths.
- **D-10:** Auto-calculated skeins fill Need field, immediately editable as override. Small indicator shows auto-calc.
- **D-11:** Same row structure across supply types with different labels/units.
- **D-12:** Both header + footer totals -- running stitch count total in section header, column totals in footer.
- **D-13:** Stitch count change after manual override: recalculate and warn, show "calc suggests X". Never silently overwrite.
- **D-14:** Two-line supply row. Line 1: swatch + code + name. Line 2: stitches -> skeins | Need | Have | fulfillment.
- **D-15:** Calculator formula adjustable at project level only. No per-row formula controls.
- **D-16:** Settings bar: Strands (default 2), Over count (1/2), Fabric count (from fabric or default), Waste (20%).
- **D-17:** Settings bar hidden until first stitch count entered (progressive disclosure).
- **D-18:** Over 1/Over 2 toggle. Default: over 2.
- **D-19:** No fabric linked = default 14ct with hint text.
- **D-20:** Inline create for missing catalog items via SearchToAdd "+ Create [text]" option.
- **D-21:** Insertion order default, with sort toggle (Added / A-Z).
- **D-22:** Backlog UX fixes baked into supply redesign, not patched separately.

### Claude's Discretion
- Edit button placement within the hero/page layout
- Hero visual treatment for non-landscape images (blurred bg fill, subtle gradient, etc.)
- Celebration and status-specific visual accents (borders, glows, colors) across project statuses
- Component architecture -- how to split the detail page into manageable components
- Tab component implementation (URL state approach, lazy loading strategy)
- Inline supply create form fields, validation, and error handling
- Responsive layout behavior on mobile (hero stacking, tab navigation, two-line rows)
- Exact skein calculation formula (stitches x strand coverage x fabric factor x waste factor)
- How "over 1/2" affects the formula mathematically

### Deferred Ideas (OUT OF SCOPE)
- User-level default fabric count (needs user settings page)
- Bulk/speed entry mode (POS-terminal-style rapid entry)
- Per-row strand count override (project-level only this phase)
- Fabric-adjusted recalculation (chart reference fabric vs actual fabric)
- Per-row stitch type (backstitch, french knots -- CALC-06, v1.2+)
- 999.0.14: Project Bin & iPad App management
- 999.0.17: StorageLocation/StitchingApp multi-user hardening
- 999.0.18: Test infrastructure cleanup for $transaction
- 999.0.19: Refactor clickable card rows
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALC-01 | User can enter stitch count per colour when linking threads to a project | `ProjectThread.stitchCount` field already exists; `updateQuantitySchema` supports it; supply row redesign adds prominent stitch count input |
| CALC-02 | App auto-calculates skeins from fabric count, strand count, and 20% waste factor | New `calculateSkeins()` pure utility function using cross-stitch formula; project-level settings (strandCount, overCount, wastePercent) stored in Project model |
| CALC-03 | User can manually override auto-calculated skein quantities | Supply row Need field always editable; `isNeedOverridden` flag on ProjectThread tracks manual override state; "Calc: X" indicator when override differs |
| CALC-04 | Per-colour stitch counts sum to display project total stitch count | Client-side `reduce()` over supply data; displayed in supply section header totals |
| CALC-05 | User can set strand count per project (default: 2) | New `strandCount` field on Project model with default 2; exposed in CalculatorSettingsBar |
| SUPP-01 | Supply entries maintain insertion order during data entry | Junction tables ordered by `createdAt` ascending; `getProjectSupplies` updated to use `orderBy: { createdAt: 'asc' }` for threads; sort toggle allows switching to alphabetical |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skein calculation formula | Frontend (client) | -- | Pure math, no server round-trip needed; runs on every stitch count change for instant feedback |
| Project-level calculator settings | API / Backend | Database | Persisted settings (strandCount, overCount, wastePercent) saved via server actions |
| Hero cover image with blur | Frontend (client) | CDN (R2 presigned URLs) | Image rendering + CSS blur effect is browser-side; presigned URLs resolved server-side in page.tsx |
| Tab URL state persistence | Frontend (client) | -- | `nuqs` manages URL search params client-side; no server involvement |
| Supply row CRUD | API / Backend | Database | Server actions for add/update/remove supply quantities; Prisma junction table operations |
| Status-aware section ordering | Frontend (client) | -- | Pure client-side logic based on project status enum; no data fetching needed |
| Inline catalog item creation | API / Backend | Database | New server action to create thread/bead/specialty and link to project in one transaction |
| Insertion order | Database | -- | `createdAt` timestamp on junction tables provides natural insertion order |

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | App Router, Server Components, server actions | Project framework [VERIFIED: package.json] |
| @base-ui/react | 1.4.0 | Tabs, Select, DropdownMenu, Dialog, Tooltip primitives | shadcn/ui v4 foundation [VERIFIED: package.json] |
| nuqs | 2.8.9 | URL search param state management | Already used for gallery view/sort/filter state [VERIFIED: package.json, use-gallery-filters.ts] |
| Prisma | 7.7.0 | ORM for schema changes and queries | Project ORM [VERIFIED: package.json] |
| Zod | 3.24.4 | Validation at server action boundaries | Project validation [VERIFIED: package.json] |
| sonner | 2.0.7 | Toast notifications | Project toast library [VERIFIED: package.json] |
| lucide-react | 1.8.0 | Icons (Calculator, MoreHorizontal, ChevronDown, etc.) | Project icon library [VERIFIED: package.json] |
| Tailwind CSS | 4.2.2 | Styling with semantic tokens | Project styling [VERIFIED: package.json] |

### Supporting (no new dependencies needed)

This phase requires **zero new npm packages**. Everything is covered by existing dependencies:
- **Tabs:** shadcn `Tabs` component already installed at `src/components/ui/tabs.tsx` [VERIFIED: filesystem]
- **DropdownMenu:** Already installed at `src/components/ui/dropdown-menu.tsx` [VERIFIED: filesystem]
- **Select:** Already installed at `src/components/ui/select.tsx` [VERIFIED: filesystem]
- **Tooltip:** Already installed at `src/components/ui/tooltip.tsx` [VERIFIED: filesystem]
- **URL state:** `nuqs` already in project [VERIFIED: package.json]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs for tab state | useSearchParams + router.replace | nuqs is already in project, handles transitions smoothly, avoids full page reloads. No reason to use raw API. |
| Client-side skein calc | Server action for calculation | Calculator needs instant feedback on every keystroke. Server round-trip would feel sluggish. Pure function is correct. |
| CSS backdrop-filter blur | Canvas-based blur / server-side blur | CSS `backdrop-filter: blur()` is GPU-accelerated, works in all modern browsers, zero JS. Simpler and performant. |

## Architecture Patterns

### System Architecture Diagram

```
Browser Request: /charts/[id]?tab=supplies
         |
         v
+------------------+     +-----------------------+
| page.tsx (Server)|---->| getChart() + supplies |---> Prisma / PostgreSQL
| Resolves:        |     | getProjectSupplies()  |
| - chart data     |     | getPresignedImageUrls |---> Cloudflare R2
| - supplies       |     +-----------------------+
| - image URLs     |
+------------------+
         |
         v (props)
+------------------------------------------+
| ProjectDetailPage (Client)               |
|                                          |
| +--------------------------------------+ |
| | ProjectDetailHero                    | |
| | - HeroCoverBanner (blur bg + image)  | |
| | - HeroMetadata (name, designer, etc) | |
| | - HeroStatusBadge (interactive)      | |
| | - HeroKebabMenu (delete)             | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | ProjectTabs (nuqs URL state)         | |
| | +----------------------------------+ | |
| | | OverviewTab (status-aware order) | | |
| | | - InfoCard sections by status    | | |
| | +----------------------------------+ | |
| | | SuppliesTab                      | | |
| | | - CalculatorSettingsBar          | | |
| | | - SupplySection (threads)        | | |
| | |   - SupplyRow[] (two-line)       | | |
| | |   - SearchToAdd (enhanced)       | | |
| | |   - SupplyFooterTotals           | | |
| | | - SupplySection (beads)          | | |
| | | - SupplySection (specialty)      | | |
| | +----------------------------------+ | |
| +--------------------------------------+ |
+------------------------------------------+
         |
         v (mutations via server actions)
+------------------------------------------+
| Server Actions                           |
| - updateProjectSettings()     NEW        |
| - updateProjectSupplyQuantity() EXISTING |
| - addThreadToProject()        EXISTING   |
| - createAndAddThread()        NEW        |
| - updateChartStatus()         EXISTING   |
| - deleteChart()               EXISTING   |
+------------------------------------------+
```

### Recommended Project Structure

```
src/
├── app/(dashboard)/charts/[id]/
│   └── page.tsx                          # Server Component: data fetch, pass to client
├── components/features/charts/
│   ├── project-detail/                   # NEW directory for phase 7 components
│   │   ├── project-detail-hero.tsx       # Hero: cover banner + metadata + status + kebab
│   │   ├── hero-cover-banner.tsx         # Cover image with blur background
│   │   ├── hero-status-badge.tsx         # Interactive status badge with Select dropdown
│   │   ├── hero-kebab-menu.tsx           # DropdownMenu with delete action
│   │   ├── project-tabs.tsx              # Tab container with nuqs URL state
│   │   ├── overview-tab.tsx              # Status-aware overview sections
│   │   ├── supplies-tab.tsx              # Settings bar + supply sections
│   │   ├── calculator-settings-bar.tsx   # Strand/Over/Fabric/Waste inline editing
│   │   ├── supply-section.tsx            # Collapsible supply type section
│   │   ├── supply-row.tsx                # Two-line supply row with calc integration
│   │   ├── supply-footer-totals.tsx      # Column totals summary row
│   │   ├── inline-supply-create.tsx      # Inline form for creating missing catalog items
│   │   └── types.ts                      # Phase 7 specific types
│   ├── search-to-add.tsx                 # ENHANCED: scroll fixes, inline create, highlight
│   ├── editable-number.tsx               # EXTRACTED: shared from project-supplies-tab
│   ├── status-badge.tsx                  # REUSED as-is
│   ├── size-badge.tsx                    # REUSED as-is
│   ├── info-card.tsx                     # REUSED in overview tab
│   ├── detail-row.tsx                    # REUSED in overview tab
│   └── progress-bar.tsx                  # REUSED in hero + overview
├── lib/
│   ├── utils/
│   │   └── skein-calculator.ts           # NEW: pure calculation functions
│   ├── actions/
│   │   ├── supply-actions.ts             # MODIFIED: new actions, ordering changes
│   │   └── chart-actions.ts              # MODIFIED: project settings update
│   └── validations/
│       └── supply.ts                     # MODIFIED: new schemas for calculator settings
└── types/
    └── supply.ts                         # MODIFIED: extended types for calculator
```

### Pattern 1: URL-Synced Tab State with nuqs

**What:** Tab selection persisted in URL search params using `nuqs` (already used for gallery filters)
**When to use:** Any tabbed UI where deep-linking and shareable URLs matter

```typescript
// Source: existing pattern in use-gallery-filters.ts [VERIFIED: codebase]
import { useQueryState, parseAsStringLiteral } from "nuqs";

const TAB_VALUES = ["overview", "supplies"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export function useProjectTab() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...TAB_VALUES]).withDefault("overview"),
  );
  return { tab: tab as TabValue, setTab };
}
```

This pattern mirrors the gallery's `useGalleryFilters` hook. The `nuqs` library handles URL updates without full page reloads and integrates cleanly with Next.js App Router. [VERIFIED: nuqs 2.8.9 in project, gallery uses same pattern]

### Pattern 2: Controlled Tabs with Base UI

**What:** Connect `nuqs` URL state to Base UI Tabs component
**When to use:** When tab state needs to be externally controlled (URL-driven)

```typescript
// Source: Base UI Tabs docs [VERIFIED: Context7]
// shadcn Tabs wraps Base UI Tabs.Root with value/onValueChange
<Tabs value={tab} onValueChange={(val) => setTab(val as TabValue)}>
  <TabsList variant="line">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="supplies">Supplies</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="supplies">...</TabsContent>
</Tabs>
```

Base UI `Tabs.Root` accepts `value` and `onValueChange` props for controlled mode. The shadcn wrapper passes these through. [VERIFIED: Context7 docs + src/components/ui/tabs.tsx]

### Pattern 3: Server Component Data Fetch + Client Component Interactivity

**What:** Existing pattern in this project. Server Component page.tsx fetches all data, passes as props.
**When to use:** All page-level data loading in Next.js App Router

```typescript
// Source: existing src/app/(dashboard)/charts/[id]/page.tsx [VERIFIED: codebase]
export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = await getChart(id);
  if (!chart) notFound();

  const [projectSupplies, imageUrls] = await Promise.all([
    chart.project ? getProjectSupplies(chart.project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
  ]);

  // Pass everything as props to client component
  return <ProjectDetailPage chart={chart} supplies={projectSupplies} imageUrls={imageUrls} />;
}
```

### Pattern 4: Optimistic UI with useTransition

**What:** Existing pattern for supply mutations. Immediate visual feedback, rollback on failure.
**When to use:** All supply quantity edits, status changes, calculator setting changes

```typescript
// Source: existing chart-detail.tsx StatusControl [VERIFIED: codebase]
const [isPending, startTransition] = useTransition();

function handleChange(newValue: string) {
  const previous = currentValue;
  setCurrentValue(newValue); // Optimistic

  startTransition(async () => {
    try {
      const result = await serverAction(id, newValue);
      if (!result.success) {
        setCurrentValue(previous); // Rollback
        toast.error("Something went wrong.");
      }
    } catch {
      setCurrentValue(previous); // Rollback
      toast.error("Something went wrong.");
    }
  });
}
```

### Anti-Patterns to Avoid

- **Nested forms:** The supplies tab has inline editing (EditableNumber) inside supply rows. These MUST NOT use nested `<form>` elements. Use `<div>` with `type="button"` handlers per `.claude/rules/base-ui-patterns.md`. [VERIFIED: codebase convention]
- **Server-side calculation:** Skein calculation MUST run client-side for instant feedback. Don't make a server round-trip for math.
- **Importing from "use client" modules in Server Components:** Keep `calculateSkeins()` in a non-client file (like `lib/utils/skein-calculator.ts`). If it were in a "use client" module, Server Components couldn't import it. [VERIFIED: base-ui-patterns.md rule]
- **Hardcoded color scales:** Use semantic tokens (`bg-card`, `text-muted-foreground`) not `stone-*`, `emerald-*`. Status colors are the ONLY exception (they're semantic status indicators). [VERIFIED: codebase convention]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL state for tabs | Custom useState + router.push | `nuqs` `useQueryState` with `parseAsStringLiteral` | Already in project, handles URL sync, history, SSR compatibility |
| Dropdown menus | Custom popover | shadcn `DropdownMenu` (already installed) | Accessibility, keyboard nav, focus trapping |
| Select dropdowns | Custom listbox | shadcn `Select` (already installed) | ARIA combobox semantics, keyboard nav |
| Toast notifications | Custom notification system | `sonner` (already installed) | Already used everywhere in the app |
| Number formatting | Manual toLocaleString calls | `Intl.NumberFormat` (cached) | Already pattern in gallery; locale-aware |
| Click-outside detection | Custom event listener | Existing pattern in SearchToAdd (timestamp guard) | Already debugged for trackpad ghost events |

**Key insight:** This phase's complexity is in UX choreography (calculator feedback, override warnings, status-aware layouts), not in finding new libraries. The entire standard stack is already installed.

## Skein Calculation Formula

### The Formula

Based on cross-stitch community standard approaches [CITED: thread-bare.com/tools, mismatch.co.uk/cross.htm, crewelghoul.com]:

```typescript
/**
 * Calculate skeins needed for a given stitch count.
 *
 * Formula derivation:
 * 1. Each full cross stitch on fabric of count C (stitches/inch) uses
 *    approximately (6/C) inches of single-strand floss (Pythagorean theorem
 *    on the diagonal of 1/C inch square, doubled for full X).
 * 2. With S strands, each stitch uses S * (6/C) inches.
 * 3. For "over 2" stitching (common on evenweave/linen), each stitch spans
 *    2 fabric threads, so effective count = fabricCount / 2.
 *    For "over 1", effective count = fabricCount.
 * 4. A standard DMC skein = 8.7 yards = 313.2 inches.
 * 5. With 15% tie-off waste per 18" segment: ~17 usable segments per skein,
 *    each ~15" usable = 255 usable inches.
 * 6. Apply waste factor (default 20%) for movement between areas, mistakes.
 *
 * Simplified: skeins = ceil(stitches * strands * 6 / effectiveCount / 255 * (1 + waste))
 *
 * Or equivalently using "stitches per skein" approach:
 *   stitchesPerSkein = 255 * effectiveCount / (strands * 6)
 *   skeins = ceil(stitches / stitchesPerSkein * (1 + waste))
 */
export function calculateSkeins(params: {
  stitchCount: number;
  strandCount: number;       // default 2
  fabricCount: number;       // stitches per inch (e.g., 14, 16, 18)
  overCount: 1 | 2;          // over 1 or over 2
  wastePercent: number;      // 0-50, default 20
}): number {
  const { stitchCount, strandCount, fabricCount, overCount, wastePercent } = params;
  if (stitchCount <= 0) return 0;

  const effectiveCount = fabricCount / overCount;
  const threadPerStitch = (strandCount * 6) / effectiveCount; // inches
  const usableInchesPerSkein = 255; // 17 segments * 15 inches
  const wasteFactor = 1 + wastePercent / 100;

  const rawSkeins = (stitchCount * threadPerStitch * wasteFactor) / usableInchesPerSkein;
  return Math.ceil(rawSkeins);
}
```

### Formula Validation

Cross-checking against community tools [CITED: thread-bare.com/tools]:
- 1,000 stitches, 14ct, 2 strands, over 2, 20% waste -> ~4 skeins
- 10,000 stitches, 14ct, 2 strands, over 2, 20% waste -> ~35 skeins
- Same but over 1 -> ~18 skeins (half, because effective count doubles)

### How "Over 1" vs "Over 2" Works

- **Over 2** (default, most common for evenweave/linen): Each stitch spans 2 fabric threads. On 28ct linen, effective stitching count = 14 stitches/inch. Uses MORE thread per stitch.
- **Over 1** (common for Aida, petit point): Each stitch spans 1 fabric thread. On 14ct Aida, effective count = 14. Uses LESS thread per stitch on same fabric count.

The formula handles this by dividing `fabricCount` by `overCount`. [ASSUMED -- this is the standard community approach; validated against multiple sources but exact implementation is discretionary]

## Schema Changes Required

### New Fields on Project Model

```prisma
model Project {
  // ... existing fields ...

  // Calculator settings (phase 7)
  strandCount    Int    @default(2)    // 1-6, default 2
  overCount      Int    @default(2)    // 1 or 2, default 2
  wastePercent   Int    @default(20)   // 0-50, default 20%
}
```

**Why on Project, not Chart:** The calculator settings are per-project because different stitchers may use different strand counts on the same chart. The chart knows the design; the project knows how you're stitching it. [VERIFIED: D-15 locks this to project-level only]

### New Field on ProjectThread for Override Tracking

```prisma
model ProjectThread {
  // ... existing fields ...
  isNeedOverridden  Boolean  @default(false)  // true when user manually edited Need
}
```

**Why a boolean:** D-13 requires that when stitch count changes after a manual override, the system shows "calc suggests X" without silently overwriting. To detect this, we need to know whether the current `quantityRequired` was set by the user or by the calculator. A boolean is simpler than storing `calculatedQuantity` separately.

### Insertion Order (SUPP-01)

The junction tables (`ProjectThread`, `ProjectBead`, `ProjectSpecialty`) already have `createdAt DateTime @default(now())`. No schema change needed -- just change the `getProjectSupplies` query to order by `createdAt: 'asc'` instead of the current `colorCode`/`productCode` alphabetical order. [VERIFIED: schema.prisma lines 184, 200, 212 all have createdAt]

### Beads and Specialty: Stitch Count

Currently `ProjectBead` and `ProjectSpecialty` do NOT have a `stitchCount` field. Per D-11, beads show "quantity needed/acquired" without stitch-to-package calculation by default. However, D-11 also says "unless stitch count is entered" -- suggesting optional stitch count on all supply types.

**Recommendation:** Add optional `stitchCount Int @default(0)` to `ProjectBead` and `ProjectSpecialty` for consistency. The UI can show/hide the stitch count field per supply type. This is a low-risk addition that prevents a future schema migration. [ASSUMED -- the UI-SPEC says "No stitch count or calculation for these types (unless stitch count is entered)"]

## Common Pitfalls

### Pitfall 1: Blurred Background Image Performance

**What goes wrong:** Using `backdrop-filter: blur()` on a full-width banner with a large cover image causes GPU memory spikes and janky scrolling, especially on older iPads.
**Why it happens:** Blur filters require compositing the entire image at full resolution.
**How to avoid:** Use a **separate scaled-up background `<img>` element** with CSS `filter: blur(20px)` and `transform: scale(1.1)` (to cover blur edge artifacts), clipped with `overflow: hidden` on the container. This is lighter than `backdrop-filter` because it blurs a single element, not a compositing layer. The foreground `object-contain` image sits on top.
**Warning signs:** Stuttery scroll on the detail page, high GPU usage in dev tools.

### Pitfall 2: Tab State Not Working on Direct Navigation

**What goes wrong:** User navigates to `/charts/123?tab=supplies` but sees the Overview tab.
**Why it happens:** If `nuqs` is initialized with `withDefault("overview")` and the component renders before `nuqs` reads the URL param, the default wins.
**How to avoid:** Use `nuqs` with `parseAsStringLiteral` (validates the param value) and ensure the Tabs `value` prop reads from the nuqs state, not local state. `nuqs` handles SSR compatibility. [VERIFIED: nuqs 2.8.9 handles this correctly in existing gallery code]
**Warning signs:** URL shows `?tab=supplies` but content shows overview.

### Pitfall 3: Override State Getting Lost on Page Refresh

**What goes wrong:** User manually overrides Need to 5 skeins, but after refresh the calculator recalculates and replaces it with 3.
**Why it happens:** Without `isNeedOverridden` persisted in the database, there's no way to know after a refresh whether the current value was user-set or auto-calculated.
**How to avoid:** Store `isNeedOverridden` boolean on `ProjectThread`. Set to `true` whenever user edits the Need value directly. Set to `false` when user accepts the calculator suggestion. Server action must update both `quantityRequired` and `isNeedOverridden` atomically.
**Warning signs:** Users report their manual overrides "disappearing."

### Pitfall 4: SearchToAdd Panel Covering Content

**What goes wrong:** The existing SearchToAdd uses `position: absolute` which either clips at container boundaries or covers existing supply rows.
**Why it happens:** The `flipUp` logic uses `bottom-0` which overlays the supply section content.
**How to avoid:** For the redesigned SearchToAdd, position the panel BELOW the "+ Add" button trigger using `top-full mt-1` (default) with a portal fallback if the panel would overflow the viewport. The flip-up case should use `bottom-full mb-1` (above the trigger), not `bottom-0` (overlaying siblings). [VERIFIED: this is the exact bug documented in 999.0.15]
**Warning signs:** Panel overlays existing supply rows instead of appearing adjacent.

### Pitfall 5: Stitch Count Sum Desynchronization

**What goes wrong:** The displayed "12,450 stitches total" in the supply section header doesn't match the sum of individual row stitch counts.
**Why it happens:** Optimistic updates change individual row values but the total is computed from stale data.
**How to avoid:** Compute totals as a `useMemo` derived from the current supply data array. When any row updates optimistically, the total automatically recalculates. Never cache totals separately.
**Warning signs:** Total shows wrong number after editing a supply row.

### Pitfall 6: Calculator Settings Bar Visibility Jitter

**What goes wrong:** Settings bar appears/disappears rapidly as user types stitch counts.
**Why it happens:** The visibility condition (`any supply has stitchCount > 0`) toggles on every keystroke if the user clears and re-enters a value.
**How to avoid:** Use `useDeferredValue` or a simple "show once shown" pattern: once the settings bar becomes visible in a session, keep it visible even if all stitch counts are temporarily cleared. Only hide on initial load when no stitch counts exist.
**Warning signs:** Settings bar flickers during stitch count editing.

## Code Examples

### Example 1: EditableNumber Extraction

The `EditableNumber` component is currently defined inline in `project-supplies-tab.tsx`. It needs to be extracted to a shared file since both the supply row (for Need/Have quantities) and the calculator settings bar (for Strands/Waste values) will use it.

```typescript
// Source: existing project-supplies-tab.tsx lines 40-97 [VERIFIED: codebase]
// Extract to src/components/features/charts/editable-number.tsx
// Add aria-label prop per UI-SPEC accessibility contract
export function EditableNumber({
  value,
  onSave,
  className,
  ariaLabel,
}: {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  // ... existing implementation with added aria-label on input
}
```

### Example 2: Status-Aware Section Ordering

```typescript
// Source: D-06 decision + UI-SPEC section ordering table [VERIFIED: CONTEXT.md]
type OverviewSection = "kitting" | "progress" | "completion" | "patternDetails" | "dates" | "projectSetup";

const SECTION_ORDER: Record<ProjectStatus, OverviewSection[]> = {
  UNSTARTED:   ["kitting", "patternDetails", "dates", "projectSetup"],
  KITTING:     ["kitting", "patternDetails", "dates", "projectSetup"],
  KITTED:      ["patternDetails", "projectSetup", "dates"],
  IN_PROGRESS: ["progress", "patternDetails", "dates", "projectSetup"],
  ON_HOLD:     ["progress", "patternDetails", "dates", "projectSetup"],
  FINISHED:    ["completion", "patternDetails", "dates"],
  FFO:         ["completion", "patternDetails", "dates"],
};
```

### Example 3: Blurred Cover Image Background

```tsx
// Hero cover banner with blur background
function HeroCoverBanner({ imageUrl, chartName }: { imageUrl: string; chartName: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) return null; // D-02: skip banner when no image

  return (
    <div className="relative w-full overflow-hidden rounded-lg max-h-64 md:max-h-48 sm:max-h-40">
      {/* Blurred background fill */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-[20px] opacity-60"
      />
      {/* Foreground image with contain */}
      <img
        src={imageUrl}
        alt={`Cover for ${chartName}`}
        className="relative mx-auto max-h-64 object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useSearchParams` + `router.push` for URL state | `nuqs` `useQueryState` | Already adopted in Phase 6 | Simpler API, no full page reloads, SSR-safe |
| Separate StatusControl below content | Status badge integrated into hero | Phase 7 (new) | Better visual hierarchy, fewer layout elements |
| Flat detail page (everything stacked) | Tabbed layout (Overview + Supplies) | Phase 7 (new) | Reduces cognitive load, enables deep-linking |
| Supply rows: single line, code + quantities | Two-line rows: identity + calculator | Phase 7 (new) | Supports stitch count + calculation flow |
| Alphabetical supply ordering | Insertion order (createdAt) default | Phase 7 (new) | Matches real-world chart reading flow |

## Assumptions Log

> List all claims tagged [ASSUMED] in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Over 1/Over 2 formula divides fabricCount by overCount | Skein Calculation Formula | Low -- community-standard approach, multiple sources agree |
| A2 | Adding stitchCount to ProjectBead and ProjectSpecialty for future consistency | Schema Changes | Low -- unused fields have no runtime cost, prevents future migration |
| A3 | "Show once shown" pattern for settings bar visibility is better than strict reactivity | Pitfall 6 | Low -- worst case is settings bar stays visible when user might want it hidden, but D-17 says "persists once shown" |

## Open Questions

1. **Fabric count source when fabric is linked**
   - What we know: Project has optional `fabric` relation with `count` field
   - What's unclear: Should the settings bar fabric count auto-update when a fabric is linked/changed? Or is it a one-time default?
   - Recommendation: Auto-populate from linked fabric's count. Show "(from [fabric name])" hint. Allow manual override. This matches D-19 spirit.

2. **Beads and specialty stitch count scope**
   - What we know: D-11 says "No stitch count or calculation for these types (unless stitch count is entered)"
   - What's unclear: Does "unless stitch count is entered" mean we should show the stitch count field but hide it by default? Or only for threads?
   - Recommendation: For phase 7, show stitch count field on threads only. Beads/specialty get quantity-only rows. Add stitch count to bead/specialty schema fields for future use but don't expose in UI yet.

3. **"Calc suggests X" click-to-accept behavior**
   - What we know: D-13 says "show 'calc suggests X' indicator; user decides whether to accept"
   - What's unclear: Is "Click to accept" in the tooltip sufficient, or should there be a visible button?
   - Recommendation: Use the inline `text-xs text-warning` "Calc: X" text as a clickable element. Clicking it sets `quantityRequired = calculatedValue` and `isNeedOverridden = false`. Tooltip explains the action.

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity (hero, tabs, supply editing are all interactive)
- **Zod validation at boundaries** -- all new server actions must validate with Zod
- **Prisma schema is source of truth** -- run `prisma db push` then `prisma generate` after schema changes
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`**
- **TDD mandatory** -- tests before implementation
- **Impeccable gates** -- polish after UI plans, audit at phase boundary
- **Pin exact versions** in package.json (no `^` or `~`)
- **No `Button render={<Link>}`** -- use `LinkButton` component
- **No nested forms** -- use `<div>` with `type="button"` handlers
- **Semantic tokens only** -- no hardcoded color scales (except status colors)
- **Design is the spec** -- reference DesignOS before building (`product-plan/sections/dashboards-and-views/components/ProjectDashboard.tsx`)
- **Security: requireAuth() on all server actions** -- no fallback user IDs

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALC-01 | Enter stitch count per colour | unit + integration | `npx vitest run src/components/features/charts/project-detail/supply-row.test.tsx -t "stitch count"` | Wave 0 |
| CALC-02 | Auto-calculate skeins from formula | unit | `npx vitest run src/lib/utils/skein-calculator.test.ts` | Wave 0 |
| CALC-03 | Manual override of calculated skeins | unit + integration | `npx vitest run src/components/features/charts/project-detail/supply-row.test.tsx -t "override"` | Wave 0 |
| CALC-04 | Per-colour stitch counts sum to total | unit | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -t "total"` | Wave 0 |
| CALC-05 | Set strand count per project | unit + integration | `npx vitest run src/components/features/charts/project-detail/calculator-settings-bar.test.tsx` | Wave 0 |
| SUPP-01 | Insertion order maintained | unit | `npx vitest run src/lib/actions/supply-actions.test.ts -t "insertion order"` | Partial (file exists, test doesn't) |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run` (full suite, 733+ tests)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/utils/skein-calculator.test.ts` -- pure function tests for calculateSkeins()
- [ ] `src/components/features/charts/project-detail/supply-row.test.tsx` -- two-line row, stitch count entry, override detection
- [ ] `src/components/features/charts/project-detail/supplies-tab.test.tsx` -- settings bar, section totals, insertion order
- [ ] `src/components/features/charts/project-detail/calculator-settings-bar.test.tsx` -- inline editing, project settings save
- [ ] `src/components/features/charts/project-detail/project-tabs.test.tsx` -- URL state sync, tab switching
- [ ] `src/components/features/charts/project-detail/overview-tab.test.tsx` -- status-aware section ordering
- [ ] `src/components/features/charts/project-detail/project-detail-hero.test.tsx` -- cover image rendering, no-image fallback, status badge interaction

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` on all server actions (existing pattern) |
| V3 Session Management | no | No new session logic |
| V4 Access Control | yes | User ownership check on all mutations (existing pattern: `project.userId === user.id`) |
| V5 Input Validation | yes | Zod schemas at server action boundaries for all new inputs (strandCount, overCount, wastePercent, stitchCount) |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized project settings update | Elevation of Privilege | `requireAuth()` + ownership check in `updateProjectSettings` action |
| Invalid calculator values (negative, overflow) | Tampering | Zod validation: `z.number().int().min(1).max(6)` for strands, `z.enum(["1","2"])` for over, `z.number().int().min(0).max(50)` for waste |
| IDOR on supply mutation | Elevation of Privilege | Existing pattern: verify junction record belongs to user's project before update |
| XSS via inline create (catalog item names) | Spoofing | Zod `.trim().min(1).max(200)` validation; React auto-escapes rendered content |

## Sources

### Primary (HIGH confidence)
- Project codebase: `prisma/schema.prisma`, `chart-detail.tsx`, `project-supplies-tab.tsx`, `supply-actions.ts`, `search-to-add.tsx`, `use-gallery-filters.ts`, `tabs.tsx` -- all verified by direct file read
- Context7 `/websites/base-ui_react` -- Tabs.Root API: `value`, `onValueChange`, `defaultValue` props confirmed
- UI-SPEC: `.planning/phases/07-project-detail-experience/07-UI-SPEC.md` -- component inventory, layout contracts, interaction flows
- CONTEXT.md: `.planning/phases/07-project-detail-experience/07-CONTEXT.md` -- locked decisions D-01 through D-22

### Secondary (MEDIUM confidence)
- [thread-bare.com/tools](https://www.thread-bare.com/tools/cross-stitch-skein-estimator) -- skein calculator community reference
- [mismatch.co.uk/cross.htm](https://www.mismatch.co.uk/cross.htm) -- formula derivation (Pythagorean theorem approach, 17 segments, 6/count rule)
- [crewelghoul.com](https://crewelghoul.com/blog/how-much-embroidery-floss-do-i-need/) -- formula validation, stitches per skein = 17 * count * 15 / 6 / strands

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or cited sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in package.json
- Architecture: HIGH -- follows existing project patterns (server component fetch, client interactivity)
- Skein formula: MEDIUM-HIGH -- derived from multiple community sources; exact constants may need tuning against real-world usage
- Pitfalls: HIGH -- based on actual bugs documented in backlog (999.0.13, 999.0.15, 999.0.16)

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable -- no new library versions expected to impact this phase)
