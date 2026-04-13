# Architecture Research

**Domain:** Cross-stitch project management — Milestone 2 (Browse & Organize)
**Researched:** 2026-04-11
**Confidence:** HIGH

## System Overview

Milestone 2 adds gallery browsing, storage location management, and supply entry improvements to an existing Next.js 16 App Router codebase. The architecture extends existing patterns rather than introducing new ones.

```
┌���──────────────────────────��─────────────────────────────────────────┐
│                        Route Layer (App Router)                      │
├───────────────────────────────────���─────────────────────────────────┤
│  ┌───────────┐  ┌────��───────┐  ┌──────────┐  ┌─���───────────────┐  │
│  │ /charts   │  │ /charts/   │  │ /settings │  │ /settings/      │  │
│  │ page.tsx  │  │ [id]/      │  │ /storage  │  │ /storage/[id]   │  │
│  │ (MODIFY)  │  │ page.tsx   │  │ (NEW)     │  │ (NEW)           │  │
│  └─────┬─────┘  └─────┬──────┘  └──���──┬─────┘  └────────┬────────┘  │
│        │              │              │               │              │
├────────┴──────────────┴���─────────────┴───────────────┴──────────────┤
│                     Feature Components                               │
├────────��──────────────────────────��─────────────────────────────────┤
│  ┌─────────────┐ ┌──────��─────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ GalleryGrid │ │ GalleryCard│ │ StorageLoc   │ │ SkeinCalc    ���  │
│  │ (NEW)       │ │ (NEW)      │ │ List/Detail  │ │ (NEW util)   │  │
│  │ "use client"�� │ "use client│ │ (NEW)        │ │ server-side  │  │
│  └──────┬──────┘ └──────┬─────┘ └──────┬───────┘ └──────┬───────┘  │
│         │              │              │               │              │
│  ┌──────────────┐ ┌��───────────┐ ┌────���─────────┐                   │
│  │ ViewMode     │ │ Supply     │ │ FabricSelect │                   │
���  │ Switcher     │ │ Entry      │ │ (MODIFY)     │                   │
│  ��� (NEW)        │ │ (MODIFY)   │ │              │                   │
│  └──────────────┘ └────────────┘ └────��─────────┘                   │
├────────��────────────────────────────────────────────────────────────┤
│                     Server Actions                                   │
│  ┌──────────────┐ ┌───────��──────┐ ┌──────────────┐                 │
│  │ chart-actions│ │ storage-     │ │ supply-      │                 │
│  │ (MODIFY)     │ │ actions (NEW)│ │ actions      │                 │
│  │ gallery query│ │ CRUD         │ │ (MODIFY)     │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 ���
├─────────���────────────────────────────────────��──────────────────────┤
│                     Database (Prisma 7 / Neon)                       │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────────────┐     │
│  │ Chart     │  │ StorageLoc    │  │ ProjectThread            │     │
│  │ Project   │  │ (NEW model)   │  │ (stitchCount field       │     │
│  �� (existing)│  │               │  │  already exists)         │     │
│  └───────���───┘  └────────���──────┘  └─���────────────────────────┘     │
└─────────────────────────────────────────────────────────────────��───┘
```

### Component Responsibilities

| Component | Responsibility | New vs Modified |
|-----------|----------------|-----------------|
| `/charts/page.tsx` | Server Component: fetches gallery data, resolves images, passes to GalleryGrid | **MODIFY** -- replace ChartList with GalleryGrid |
| `GalleryGrid` | Client Component: renders gallery/list/table views, manages sort state | **NEW** |
| `GalleryCard` | Client Component: status-specific card layouts (WIP/Unstarted/Finished) | **NEW** |
| `ViewModeSwitcher` | Client Component: gallery/list/table toggle, persists to localStorage | **NEW** |
| `/settings/storage/` | Server Component: fetches storage locations | **NEW route** |
| `StorageLocationList` | Client Component: inline CRUD for storage locations | **NEW** |
| `StorageLocationDetail` | Client Component: shows projects in a location | **NEW** |
| `storage-actions.ts` | Server Actions: StorageLocation CRUD | **NEW** |
| `skein-calculator.ts` | Pure utility: calculates skeins from stitch count + fabric count | **NEW** |
| `ProjectSuppliesTab` | Client Component: supply entry with per-colour stitch counts | **MODIFY** |
| `SearchToAdd` | Client Component: thread picker with scroll fix | **MODIFY** |
| `ProjectSetupSection` | Client Component: fabric selector + storage location dropdown | **MODIFY** |
| `cover-image-upload.tsx` | Client Component: fix aspect ratio preview | **MODIFY** |

## Data Model Changes

### New Model: StorageLocation

The `projectBin` field on `Project` is currently a free-text `String?` with hardcoded dropdown options in `project-setup-section.tsx`. This needs to become a proper entity to support CRUD management.

```prisma
model StorageLocation {
  id        String    @id @default(cuid())
  name      String    @unique
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**Migration strategy:** Add `StorageLocation` model, add optional `storageLocationId` to `Project`, write a data migration script that creates `StorageLocation` rows from existing distinct `projectBin` values and links projects, then drop the `projectBin` column.

```prisma
model Project {
  // ... existing fields ...
  // projectBin           String?            // REMOVE after migration
  storageLocation      StorageLocation?   @relation(fields: [storageLocationId], references: [id], onDelete: SetNull)
  storageLocationId    String?
  // ... rest of fields ...
}
```

**Why `onDelete: SetNull`:** Deleting a storage location should not cascade-delete projects. The location reference simply becomes null, matching the design spec ("Projects in this location won't be deleted").

### No New Fields for Per-Colour Stitch Counts

`ProjectThread` already has `stitchCount Int @default(0)` at line 181 of `schema.prisma`. The field exists but the UI does not expose it for editing beyond display. This is a UI-only change -- wire up inline editing of `stitchCount` in the `SupplyRow` component within `project-supplies-tab.tsx`.

### No New Fields for Skein Calculator

Skein calculation is a **pure function** computed at render time from: `stitchCount` (per-colour on ProjectThread), `fabric.count` (from linked Fabric), and strand count (default 2 for cross stitch). This follows the existing "calculated fields at query time, never stored" convention.

### DMC Catalog Completion

No schema changes. The seed fixture `prisma/fixtures/dmc-threads.json` currently has 459 entries starting at DMC 150 (confirmed: first entry is `B5200`, first numeric is `150`). Needs approximately 149 additional entries (DMC 1-149 plus Blanc). A re-seed with the upsert-based `seed.ts` handles this idempotently.

### Fabric Selector Wiring

No schema changes. `Fabric` already has `linkedProjectId String? @unique` relating it to a `Project`. The chart form's `ProjectSetupSection` currently shows a disabled placeholder with text "Phase 5" -- this needs to be wired to a `SearchableSelect` that queries unassigned fabrics (using existing `SearchableSelect` component from `form-primitives/`).

## Recommended Project Structure

Changes within existing structure (no new top-level folders):

```
src/
├── app/(dashboard)/
│   ├── charts/
│   │   └── page.tsx                    # MODIFY: swap ChartList for GalleryGrid
│   └── settings/
│       ├── page.tsx                    # MODIFY: add link to storage locations
│       └── storage/
│           ├── page.tsx                # NEW: storage location list
│           └── [id]/
│               └── page.tsx            # NEW: storage location detail
├── components/features/
│   ├── charts/
│   │   ├── gallery-grid.tsx            # NEW: main gallery view switcher
│   │   ├── gallery-card.tsx            # NEW: status-specific card component
��   │   ├── view-mode-switcher.tsx      # NEW: gallery/list/table toggle
│   │   ├── chart-list.tsx              # KEEP: repurpose as table/list view within gallery-grid
│   │   ├── project-supplies-tab.tsx    # MODIFY: add stitch count editing + skein display
│   │   ├── form-primitives/
│   │   │   ├── cover-image-upload.tsx  # MODIFY: fix aspect ratio
│   │   │   └── fabric-select.tsx       # NEW: fabric picker for chart form
│   │   └── sections/
│   │       └── project-setup-section.tsx # MODIFY: wire fabric + storage location selectors
│   ├── storage/
│   │   ├── storage-location-list.tsx   # NEW
│   │   └─�� storage-location-detail.tsx # NEW
│   └── supplies/
│       └── search-to-add.tsx           # MODIFY: scroll UX fix
├── lib/
│   ├─��� actions/
│   │   ├── chart-actions.ts            # MODIFY: add gallery data query
��   │   ├── storage-actions.ts          # NEW: StorageLocation CRUD
│   │   ├── supply-actions.ts           # MODIFY: stitch count update in updateProjectSupplyQuantity
│   │   └── fabric-actions.ts           # MODIFY: add getUnassignedFabrics query
│   ├── utils/
│   │   └── skein-calculator.ts         # NEW: pure calculation function
│   └── validations/
│       └── storage.ts                  # NEW: Zod schemas for storage
├── types/
│   ├── gallery.ts                      # NEW: GalleryCardData discriminated union types
│   └── storage.ts                      # NEW: StorageLocation types
└── prisma/
    ��── schema.prisma                   # MODIFY: add StorageLocation, update Project
    ├── fixtures/
    │   └── dmc-threads.json            # MODIFY: add DMC 1-149 + Blanc
    └── migrations/
        └── YYYYMMDD_add_storage/       # NEW: migration for StorageLocation
```

### Structure Rationale

- **`components/features/storage/`**: New feature folder following existing pattern (`features/charts/`, `features/designers/`, `features/fabric/`, etc.)
- **`settings/storage/` route**: Storage locations are "reference data management" -- settings page is the right home, matching how the DesignOS design shows it alongside other reference data management
- **Gallery types in `types/gallery.ts`**: The DesignOS types file (`product-plan/sections/gallery-cards-and-advanced-filtering/types.ts`) defines rich discriminated unions (WIPCardData, UnstartedCardData, FinishedCardData) that need project-specific adaptations for the real data model
- **`skein-calculator.ts` as utility**: Pure function with no DB dependency, easily testable, follows existing `size-category.ts` and `fabric-calculator.ts` patterns in `lib/utils/`

## Architectural Patterns

### Pattern 1: Gallery Data Aggregation Query

**What:** A single server-side query that joins Chart + Project + Designer + Genre + supply counts + Fabric to produce gallery card data, avoiding N+1 queries.
**When to use:** The charts page needs to display rich card data for 500+ charts. Each card needs status, designer name, genre names, supply counts, fabric status, and for WIP cards even progress data.
**Trade-offs:** One complex Prisma include vs multiple simple queries. At 500 charts, the single query wins because it avoids 500+ round trips. The data transformation from Prisma result to `GalleryCardData` discriminated union happens in the Server Component before passing to the client.

**Example:**
```typescript
// In chart-actions.ts -- new gallery query
export async function getGalleryData() {
  const user = await requireAuth();

  const charts = await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      designer: true,
      genres: true,
      project: {
        include: {
          fabric: { select: { count: true, type: true, name: true } },
          storageLocation: { select: { id: true, name: true } },
          _count: {
            select: {
              projectThreads: true,
              projectBeads: true,
              projectSpecialty: true,
            },
          },
        },
      },
    },
    orderBy: { dateAdded: "desc" },
  });

  return charts.map(transformToGalleryCard);
}

// Transform Prisma row to discriminated union
function transformToGalleryCard(chart: ChartWithFullIncludes): GalleryCardData {
  const status = chart.project?.status ?? "UNSTARTED";
  const statusGroup = getStatusGroup(status); // maps to 'wip' | 'unstarted' | 'finished'

  const base = {
    projectId: chart.project?.id ?? chart.id,
    chartId: chart.id,
    projectName: chart.name,
    designerName: chart.designer?.name ?? "Unknown",
    coverImageUrl: chart.coverThumbnailUrl ?? chart.coverImageUrl,
    status: formatStatus(status),
    genres: chart.genres.map(g => g.name),
    sizeCategory: calculateSizeCategory(getEffectiveStitchCount(...).count),
    stitchCount: getEffectiveStitchCount(chart.stitchCount, chart.stitchesWide, chart.stitchesHigh).count,
    threadColourCount: chart.project?._count.projectThreads ?? 0,
    beadTypeCount: chart.project?._count.projectBeads ?? 0,
    specialtyItemCount: chart.project?._count.projectSpecialty ?? 0,
  };

  // Return status-group-specific shape
  switch (statusGroup) {
    case 'wip': return { ...base, statusGroup: 'wip', progressPercent: ..., ... } as WIPCardData;
    case 'unstarted': return { ...base, statusGroup: 'unstarted', fabricStatus: ..., ... } as UnstartedCardData;
    case 'finished': return { ...base, statusGroup: 'finished', finishDate: ..., ... } as FinishedCardData;
  }
}
```

### Pattern 2: View Mode Persistence via localStorage

**What:** Store the selected view mode (gallery/list/table) in localStorage so it persists across page navigations and refreshes.
**When to use:** User preference that doesn't need server-side persistence for a single-user app. Avoids a DB column for a UI preference.
**Trade-offs:** First-load flash is possible (SSR renders default view, client hydrates with stored preference). Mitigation: render skeleton/default view during the first render pass, apply stored preference in useEffect. The backlog item 999.5 already documents this exact pattern issue for the supplies page.

**Example:**
```typescript
// In view-mode-switcher.tsx
function useViewMode(defaultMode: ViewMode = "gallery"): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("charts-view-mode") as ViewMode | null;
    if (stored && ["gallery", "list", "table"].includes(stored)) {
      setMode(stored);
    }
    setHydrated(true);
  }, []);

  const updateMode = useCallback((newMode: ViewMode) => {
    setMode(newMode);
    localStorage.setItem("charts-view-mode", newMode);
  }, []);

  return [mode, updateMode, hydrated]; // hydrated flag for skeleton control
}
```

### Pattern 3: Inline CRUD for Reference Data (StorageLocation)

**What:** Storage locations use inline editing (add/rename/delete directly in the list) rather than modal forms, matching the DesignOS design.
**When to use:** Simple entities with 1-2 fields. Storage locations have only a `name`. No need for a modal form when inline editing is faster.
**Trade-offs:** Inline editing requires careful focus management and keyboard handling (Enter to save, Escape to cancel, blur to cancel). The DesignOS designs (`StorageLocationList.tsx`, `StorageLocationDetail.tsx`) already spec this pattern with `InlineNameEdit`. More complex than a modal but better UX for single-field entities.

**Data flow:**
```
User clicks "Add Location"
  -> AddLocationInline renders (focus on input)
  -> User types name + Enter
  -> Client calls createStorageLocation server action
  -> Server validates with Zod (.trim().min(1)), creates in DB
  -> revalidatePath("/settings/storage")
  -> List re-renders with new location
```

### Pattern 4: Skein Calculator as Pure Computed Utility

**What:** A pure function that takes `(stitchCount, fabricCount, strandCount)` and returns `{ skeinsNeeded: number }`. Displayed alongside per-colour stitch counts in the supply tab.
**When to use:** Any time per-colour stitch count and fabric count are known. The calculation is deterministic and cheap -- no reason to store the result.
**Trade-offs:** Requires fabric to be linked to the project for accurate fabric count. Without a linked fabric, fall back to 14-count (most common). User can see the assumption and it changes once fabric is linked.

**Formula (from cross-stitch community data):**
```typescript
// Stitches per 8m DMC skein at different fabric counts (average efficiency, 2 strands)
// Source: Lord Libidan community test data
const STITCHES_PER_SKEIN: Record<number, number> = {
  10: 1250, 11: 1375, 12: 1500, 14: 1750,
  16: 1950, 18: 2250, 20: 2500, 22: 2750,
  25: 3000, 28: 3250, 32: 3500, 36: 3750, 40: 4000,
};

export function calculateSkeinsNeeded(
  stitchCount: number,
  fabricCount: number = 14,
  strandCount: number = 2,
): number {
  if (stitchCount <= 0) return 0;
  const baseStitches = STITCHES_PER_SKEIN[fabricCount]
    ?? STITCHES_PER_SKEIN[14]; // fallback
  // Base data assumes 2 strands; adjust proportionally
  const adjustedStitches = baseStitches * (2 / strandCount);
  return Math.ceil(stitchCount / adjustedStitches);
}
```

## Data Flow

### Gallery Cards Data Flow

```
ChartsPage (Server Component)
    |
    +-- getGalleryData() --- Prisma query with deep includes ---> PostgreSQL
    |   |
    |   +-- transformToGalleryCard() -- maps DB rows to discriminated union types
    |       +-- WIPCardData (In Progress, On Hold)
    |       +-- UnstartedCardData (Unstarted, Kitting, Kitted)
    |       +-- FinishedCardData (Finished, FFO)
    |
    +-- getPresignedImageUrls() -- batch resolve R2 keys ---> R2
    |
    +-- <GalleryGrid cards={...} imageUrls={...} />
            |
            +-- ViewModeSwitcher -- localStorage for persistence
            |
            +-- ViewMode switch:
                +-- "gallery" -> GalleryCard grid (status-specific footers)
                +-- "list"    -> Compact rows with context line
                +-- "table"   -> Sortable table with column headers
```

**Key difference from current architecture:** The existing `ChartsPage` fetches charts and passes to `ChartList` which renders a table-only view. The new flow adds the gallery data transformation layer and the view mode switcher.

### Storage Location CRUD Flow

```
/settings/storage (Server Component)
    |
    +-- getStorageLocations() --- Prisma query with _count ---> PostgreSQL
    |
    +-- <StorageLocationList locations={...} />  ("use client")
            |
            +-- Add: createStorageLocation(name) -> revalidatePath
            +-- Rename: updateStorageLocation(id, name) -> revalidatePath
            +-- Delete: deleteStorageLocation(id) -> revalidatePath
                        (sets Project.storageLocationId to null via onDelete: SetNull)

/settings/storage/[id] (Server Component)
    |
    +-- getStorageLocationDetail(id) --- Prisma query ---> PostgreSQL
    |   +-- includes projects with status + fabric info
    |
    +-- <StorageLocationDetail detail={...} />
```

### Per-Colour Stitch Count + Skein Display Flow

```
ChartDetail page (existing)
    |
    +-- fetches project supplies (existing)
    +-- fetches linked fabric (NEW: include in query)
    |
    +-- ProjectSuppliesTab (existing, MODIFY)
            |
            +-- SupplyRow (existing, MODIFY)
            |   +-- Inline editable stitchCount field (NEW EditableNumber)
            |   +-- Auto-calculated skeins display (NEW)
            |   |   +-- calculateSkeinsNeeded(stitchCount, fabric?.count ?? 14)
            |   +-- updateProjectSupplyQuantity action (existing, already accepts stitchCount)
            |
            +-- Sum per-colour stitchCounts -> display total (NEW)
                +-- Compare to chart.stitchCount for validation hint
                    ("Per-colour total: 45,000 / Chart total: 50,000")
```

**Important discovery:** The `updateProjectSupplyQuantity` action already handles generic field updates via a `{ [field]: value }` pattern. The `stitchCount` field exists on `ProjectThread` in the schema. The validation schema in `supply.ts` may need updating to allow `stitchCount` in the update payload.

### Fabric Selector Flow

```
ChartAddForm / ChartEditModal
    |
    +-- ProjectSetupSection (existing, MODIFY)
            |
            +-- StorageLocation dropdown (NEW -- replaces hardcoded projectBin)
            |   +-- getStorageLocations() server action (fetched by parent page)
            |   +-- Uses existing SearchableSelect component
            |
            +-- Fabric selector (NEW -- replaces disabled placeholder)
                +-- getUnassignedFabrics() server action
                    +-- Prisma: Fabric WHERE linkedProjectId IS NULL
                        OR linkedProjectId = currentProjectId (for edit case)
                +-- Uses existing SearchableSelect component
                +-- On select: links fabric via updateFabric(fabricId, { linkedProjectId })
```

### Cover Image Aspect Ratio Fix Flow

The issue is in `cover-image-upload.tsx` where the preview container uses `h-32` with `object-cover`, which crops tall/square images into a narrow strip.

```
CoverImageUpload (existing, MODIFY)
    |
    +-- Preview container: h-32 -> min-h-32 max-h-48
        +-- img: object-cover -> object-contain with bg-muted background
            (preserves full image visibility without cropping)

ChartDetail CoverImage (existing, already uses aspect-[4/3])
    +-- No change needed -- already correct
```

### Thread Picker Scroll Fix Flow

```
SearchToAdd (existing, MODIFY)
    |
    +-- On item added to project:
        +-- Call scrollIntoView on the search input container
            (keeps the search box and "+ Add more" button visible)
        +-- Alternative: scroll the results list to keep input pinned at top
```

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Charts page -> GalleryGrid | Server Component passes props to Client Component | Gallery data transformed server-side, images resolved server-side via presigned URLs |
| GalleryCard -> Router | `Link` component to `/charts/[id]` | Cards link to chart detail page; no callback needed, use `<Link>` |
| ProjectSetupSection -> StorageLocation | Server action fetches locations for dropdown | Replace hardcoded `DEFAULT_BIN_OPTIONS` array with DB-backed list |
| ProjectSetupSection -> Fabric | Server action fetches unassigned fabrics | Replace disabled "Phase 5" placeholder with working `SearchableSelect` |
| SupplyRow -> SkeinCalculator | Pure function call at render time | Needs fabric count from project's linked fabric (passed as prop from parent) |
| StorageLocation CRUD -> Project | `onDelete: SetNull` relationship | Deleting a location nulls the FK reference, project is preserved |
| DMC seed -> Thread table | Prisma upsert during seed | Idempotent -- existing 459 rows untouched, ~149 new rows added |

### Key Dependencies Between Features

```
StorageLocation model -----> Project.storageLocationId -----> ProjectSetupSection dropdown
                                                         +--> GalleryCard filter options (deferred to M3)

Fabric selector wiring -----> Skein calculator (needs fabric.count for accurate calculation)
                         +--> Gallery cards (UnstartedCardData.fabricStatus computation)

Per-colour stitch counts ---> Skein calculator display
                         +--> Total stitch count validation hint
                         +--> Gallery cards (threadColourCount already works via _count)

DMC catalog completion -----> SearchToAdd (more colours available to search)
                              No code changes needed, purely data

Cover image fix ------------> Gallery cards (better images in gallery view)
                              Independent of other features
```

## Anti-Patterns

### Anti-Pattern 1: Client-Side Gallery Data Fetching

**What people do:** Fetch gallery data on the client with `useEffect` + `useState`, add loading spinners.
**Why it's wrong:** With 500+ charts, this creates a loading waterfall (page shell -> JS download -> fetch -> render). Server Components eliminate this by streaming HTML with data already included.
**Do this instead:** Fetch all gallery data in the Server Component (`page.tsx`), transform it server-side, pass as props to the client `GalleryGrid` component. The page renders with data on first paint.

### Anti-Pattern 2: Storing Computed Skein Counts in the Database

**What people do:** Add a `skeinsRequired` column to `ProjectThread` and update it whenever stitch count or fabric changes.
**Why it's wrong:** Violates the "calculated fields at query time" convention. Creates sync bugs when fabric count changes but skein counts aren't recalculated.
**Do this instead:** Calculate skeins as a pure function at render time. Cheap to compute, always consistent with current fabric + stitch count.

### Anti-Pattern 3: Separate API Routes for Storage Location CRUD

**What people do:** Create `/api/storage-locations/` REST endpoints.
**Why it's wrong:** Server Actions are the established pattern in this codebase. Every existing action file uses `"use server"` + `requireAuth()` + Zod. API routes add unnecessary abstraction and bypass the existing auth guard + Zod validation patterns.
**Do this instead:** Server Actions in `storage-actions.ts` following the exact same pattern as `designer-actions.ts` (which is the closest analog -- simple entity CRUD).

### Anti-Pattern 4: URL-Based View Mode State

**What people do:** Store view mode in URL search params (`?view=gallery`).
**Why it's wrong:** With Server Components, changing search params triggers a full server re-render and data re-fetch. Also pollutes browser history with preference toggles.
**Do this instead:** localStorage for view mode persistence. It's a UI preference, not shareable state. The data doesn't change between view modes -- only the presentation does.

### Anti-Pattern 5: Creating a New "Project Setup" Flow

**What people do:** Build a multi-step wizard for project setup that combines chart creation + supply entry + fabric assignment.
**Why it's wrong:** Over-engineers the backlog item 999.0.7 ("rework project supply entry workflow"). The existing chart form + detail page pattern works. The improvement is about insertion order and inline creation, not a new flow.
**Do this instead:** Improve the existing supply entry within the chart detail page: maintain insertion order, add `scrollIntoView`, allow inline supply creation from the search panel.

## Scaling Considerations

Not a primary concern for this single-user app, but noting the gallery-specific consideration:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 500 charts (current) | Single aggregation query with includes is fine. No pagination needed. All view modes render full dataset. |
| 2000+ charts | Consider cursor-based pagination or virtual scrolling for gallery view. Table view would need pagination first (more DOM nodes). |
| Image-heavy gallery | Thumbnail-first strategy already in place (`coverThumbnailUrl` preferred). Consider lazy loading for gallery cards below the fold. |

### First Bottleneck: Presigned URL Batch Resolution

With 500+ charts, resolving presigned URLs for all cover images/thumbnails is the most expensive operation in the gallery page. Current approach: batch resolve via `getPresignedImageUrls()`. This already exists and works. Gallery cards should prefer `coverThumbnailUrl` (smaller files, faster load) with fallback to `coverImageUrl`.

## Build Order Recommendation

Based on dependency analysis:

1. **StorageLocation model + migration** -- foundational; ProjectSetupSection and gallery cards depend on it
2. **DMC catalog completion** -- data-only, no code dependencies, can run in parallel with #1
3. **Storage location CRUD** -- new route + actions, establishes the pattern for the new model
4. **Gallery types + data aggregation query** -- server-side data transformation layer
5. **Gallery cards + view mode switcher** -- largest UI feature, depends on types from #4
6. **Wire fabric selector into chart form** -- connects existing fabric model to chart form
7. **Per-colour stitch counts + skein calculator** -- extends existing supply tab, benefits from fabric selector (#6)
8. **Supply entry workflow improvements** -- ordering, inline creation from search panel
9. **Cover image aspect ratio fix** -- small CSS change, independent
10. **Thread picker scroll UX fix** -- small JS fix (scrollIntoView), independent

Items 1-2 can run in parallel. Items 9-10 are independent small fixes that can slot anywhere in the sequence.

## Sources

- Existing codebase analysis: `prisma/schema.prisma`, `src/components/features/charts/`, `src/lib/actions/`
- DesignOS gallery cards: `product-plan/sections/gallery-cards-and-advanced-filtering/` (types.ts, GalleryCard.tsx, GalleryGrid.tsx)
- DesignOS storage locations: `product-plan/sections/fabric-series-and-reference-data/components/StorageLocation*.tsx`
- DesignOS storage types: `product-plan/sections/fabric-series-and-reference-data/types.ts`
- Skein calculation data: [Lord Libidan -- stitches per 8m skein](https://lordlibidan.com/how-many-stitches-can-you-get-out-of-a-8m-skein/)
- Cross-stitch calculator references: [thread-bare.com](https://www.thread-bare.com/tools/cross-stitch-skein-estimator), [cross-stitched.com](https://cross-stitched.com/en-us/pages/cross-stitch-calculator)
- DMC fixture gap analysis: `prisma/fixtures/dmc-threads.json` -- 459 entries, starts at DMC 150/B5200, missing 1-149 + Blanc

---
*Architecture research for: Cross-stitch tracker M2 (Browse & Organize)*
*Researched: 2026-04-11*
