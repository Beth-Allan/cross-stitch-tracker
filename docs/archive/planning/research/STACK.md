# Technology Stack

**Project:** Cross Stitch Tracker v1.8 — Series & Collections
**Researched:** 2026-05-24
**Confidence:** HIGH

## Verdict: No New Dependencies Required

Series/collection management is architecturally identical to designers, genres, storage locations, and stitching apps — all entities the project already handles well. Every capability needed for series exists in the current stack. Adding dependencies would be net-negative (bundle growth, maintenance burden, zero capability gain).

## Existing Stack — Fully Sufficient

### Core Framework (no changes)
| Technology | Version | Purpose | Series Role |
|------------|---------|---------|-------------|
| Next.js | 16.2.4 | App Router, Server Components | Series pages, server actions, data fetching |
| TypeScript | 5.9.3 | Type safety | Series types, Zod schemas |
| Prisma | 7.7.0 | ORM + migrations | Series model, Chart relation, queries |
| PostgreSQL (Neon) | — | Database | Series table, indexes |

### UI Layer (no changes)
| Technology | Version | Purpose | Series Role |
|------------|---------|---------|-------------|
| Tailwind CSS | 4.2.3 | Styling | Series cards, progress bars, detail pages |
| shadcn/ui v4 | (Base UI 1.4.1) | Component primitives | Tabs, Dialog, Command (SearchableSelect) |
| lucide-react | 1.8.0 | Icons | Library icon for series list (already used in DesignOS design) |
| nuqs | 2.8.9 | URL state management | Series tab in Pattern Dive, series filter param on Browse |
| cmdk | 1.1.1 | Command palette / combobox | SearchableSelect for series picker in chart form |

### Data Layer (no changes)
| Technology | Version | Purpose | Series Role |
|------------|---------|---------|-------------|
| Zod | 3.24.4 | Validation | Series create/update schemas |
| next-auth | 5.0.0-beta.30 | Auth | requireAuth() on series actions |

## Reusable Patterns — Already Built

These existing patterns directly apply to series with zero new code infrastructure:

| Pattern | Used By | Series Application |
|---------|---------|-------------------|
| `SearchableSelect` + inline "Add New" | Designer, StorageLocation, StitchingApp, FabricBrand | Series picker on chart form |
| `InlineNameEdit` | StorageLocation, StitchingApp | Series rename on detail page |
| `DeleteEntityDialog` | StorageLocation, StitchingApp | Series delete confirmation |
| `MultiSelectDropdown` | Status filter, Size filter on Browse tab | Series filter on Browse tab |
| `PatternDiveTabs` | Browse, What's Next, Fabric, Storage | Add "Series" tab |
| Server action pattern (requireAuth + Zod + Prisma) | All 15+ action files | series-actions.ts |
| Entity detail page layout (`/storage/[id]`, `/apps/[id]`) | Storage, Apps | `/series/[id]` page |
| Entity list page layout (`/storage`, `/apps`) | Storage, Apps | `/series` management page |
| Progress bar (CSS `width: ${percent}%`) | Gallery cards, project detail | Series completion progress |
| nuqs URL state (`parseAsStringLiteral`) | Pattern Dive tabs, gallery sort | Series tab + filter |

## What NOT to Add

| Temptation | Why NOT | What to Use Instead |
|------------|---------|-------------------|
| React Query / TanStack Query | Server Components + server actions already handle all data | Prisma queries in Server Components |
| drag-and-drop library (dnd-kit) | Series ordering is alphabetical/by-completion, not manual | `useMemo` sort like SeriesList design |
| Charting library for progress | Simple CSS progress bars match the design | `div` with `width: ${percent}%` (already used) |
| State management (Zustand, Jotai) | Series has no complex client state | React `useState` + server actions |
| Form library (react-hook-form) | Chart form uses controlled state; series form is just a name field | Inline `useState` like `InlineNameEdit` |
| Animation library (framer-motion) | Progress bars use CSS `transition-all` (per DesignOS design) | Tailwind `transition-all` class |
| Virtualization (react-window) | Series collections are small (tens, not hundreds) | Simple `.map()` rendering |

## Schema Addition (Prisma — no new deps)

Series requires one new model and one new field on Chart. This follows the exact pattern of Designer-to-Chart:

```prisma
model Series {
  id          String   @id @default(cuid())
  name        String
  totalCount  Int?     // Optional: total charts in series (for "8 of 15")
  designer    Designer? @relation(fields: [designerId], references: [id])
  designerId  String?
  userId      String
  charts      Chart[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, name])
}
```

Chart gets: `series Series? @relation(fields: [seriesId], references: [id])` + `seriesId String?`

This mirrors Designer (optional many-to-one from Chart), with the addition of `userId` for ownership (like StorageLocation/StitchingApp) and `totalCount` for open-ended vs. known-size series.

## Integration Points

### 1. Chart Form — SearchableSelect (existing component)
The chart form already uses `SearchableSelect` for designer, storage location, and stitching app. Series is the same pattern: optional single-select with "Add New" inline creation. The DesignOS `ChartAddForm.tsx` already shows this field.

### 2. Pattern Dive — New Tab (extend existing component)
`PatternDiveTabs` currently has 4 tabs. Adding "Series" means:
- Add `"series"` to `PATTERN_DIVE_TABS` const
- Add `Library` icon import (already available in lucide-react)
- Add `seriesContent` prop
- Server Component in `charts/page.tsx` fetches series data in existing `Promise.all()`

### 3. Browse Tab Filter — MultiSelectDropdown (existing component)
`FilterBar` currently has status and size filters. Adding series filter follows the same `MultiSelectDropdown` pattern with series options passed as props.

### 4. Series Management Pages — Entity CRUD (existing pattern)
`/series` and `/series/[id]` follow the identical layout pattern as `/storage` and `/apps`:
- List page with entity cards + add button
- Detail page with `InlineNameEdit`, `DeleteEntityDialog`, and member list

### 5. Series Progress — Calculated at Query Time (existing convention)
`completionPercent`, `finishedCount`, `memberCount` are computed from the Chart/Project relation at query time, never stored. This matches the project's "calculated fields at query time" convention.

## Installation

```bash
# No new packages to install.
# Only schema change needed:
npx prisma db push
npx prisma generate
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Series-Chart relation | Direct FK on Chart (like designerId) | Junction table (many-to-many) | Requirements say a chart belongs to ONE series. M:M adds complexity with no use case. |
| Series total count | Optional `totalCount` field | Always count from linked charts | Some series have charts the user doesn't own yet. "8 of 15" needs the 15 from somewhere. |
| Series progress storage | Calculated at query time | Stored `completionPercent` field | Project convention is calculated fields. Avoids staleness. Series are small (tens of charts max). |
| Series ownership | `userId` field (like StorageLocation) | No ownership field | Multi-user-aware architecture requires it. Matches established pattern. |
| Series designer link | Optional FK to Designer | No designer link | Many series are by one designer. Saves clicking into series to find out. Useful for "Designer X's series" views. |

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| No new deps needed | HIGH | Examined all 7 series features against existing component inventory; every pattern exists |
| Schema design | HIGH | Mirrors Designer model (validated over 30 phases); totalCount follows requirements glossary |
| Integration points | HIGH | Each integration uses an existing, tested component with identical usage pattern |
| Reusable components | HIGH | Verified InlineNameEdit, DeleteEntityDialog, SearchableSelect, MultiSelectDropdown source code |

## Sources

- Prisma schema: `prisma/schema.prisma` (current state)
- DesignOS series components: `product-plan/sections/fabric-series-and-reference-data/components/SeriesList.tsx`, `SeriesDetail.tsx`
- DesignOS types: `product-plan/sections/fabric-series-and-reference-data/types.ts`
- DesignOS chart form: `product-plan/sections/project-management/components/ChartAddForm.tsx` (series field)
- Existing entity patterns: `src/components/features/storage/`, `src/components/features/apps/`
- Pattern Dive tabs: `src/components/features/charts/pattern-dive-tabs.tsx`
- Filter bar: `src/components/features/gallery/filter-bar.tsx`
- SearchableSelect: `src/components/features/charts/form-primitives/searchable-select.tsx`
- Requirements: `CROSS_STITCH_TRACKER_PLAN.md` section 4.1 (Series Support)
