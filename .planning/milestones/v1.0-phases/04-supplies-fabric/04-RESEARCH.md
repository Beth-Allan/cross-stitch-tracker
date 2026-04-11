# Phase 4: Supplies & Fabric - Research

**Researched:** 2026-04-10
**Domain:** Supply catalog management, project-supply linking, fabric tracking, auto-generated shopping lists
**Confidence:** HIGH

## Summary

Phase 4 adds the second major data domain to the cross-stitch tracker: supplies (threads, beads, specialty items) and fabric. This builds heavily on patterns already established in Phases 2-3 (CRUD server actions, Zod validation, modal forms, sortable tables, detail pages). The primary technical challenges are: (1) designing the Prisma schema for 9 new models plus 3 junction tables with computed fields, (2) seeding ~500 DMC thread colors from a JSON fixture, (3) building a tabbed catalog UI with grid/table views and color swatches, (4) inline search-and-add for project-supply linking, and (5) an auto-generated shopping list aggregating unfulfilled supplies across projects.

The existing codebase provides strong patterns to follow. The designer page (Phase 3) establishes the management page pattern with sortable tables, modal CRUD, and detail pages. The chart detail page establishes the detail page with sections. Server actions follow a consistent pattern with `requireAuth()`, Zod validation, Prisma queries, and `revalidatePath`. Test factories and shared mocks are already centralized.

**Primary recommendation:** Follow existing Phase 2-3 patterns exactly. The schema design and DMC seed data are the foundations everything else depends on -- do those first. The shopping list is a read-only aggregation view that queries unfulfilled junction records grouped by project -- no new models needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Tabbed layout on /supplies page -- three tabs: Threads, Beads, Specialty Items. Each tab has type-specific columns and its own grid/table view toggle.
- **D-02:** Both grid and table views available for each tab, toggled per tab. Grid shows color swatch tiles (hex color, code, name). Table shows sortable rows with color swatch column.
- **D-03:** View mode preference persisted in localStorage per tab (e.g., threads=grid, beads=table). Same pattern as sidebar collapse state from Phase 1.
- **D-04:** Filtering for threads: color family dropdown (11 families from design types) + free-text search by code or name. Beads and specialty use search only (smaller catalogs).
- **D-05:** DMC thread catalog (~500 colors with hex values and color families) pre-seeded via Prisma seed script. JSON fixture file in project, `npx prisma db seed` loads idempotently.
- **D-06:** Full SupplyBrand entity with CRUD -- dedicated management page at /supplies/brands. Sortable table with name, website, supply type columns. Modal forms for create/edit. Follows Phase 3 designer page pattern.
- **D-07:** DMC is the only pre-seeded brand+catalog. Beads and specialty items are fully user-managed -- users create their own Mill Hill beads, Kreinik braids, etc. via catalog forms.
- **D-08:** Supplies tab on the project detail page (ProjectSuppliesTab pattern from design). Shows linked threads, beads, specialty items with quantities in sections.
- **D-09:** Inline search-and-add flow: type in a search field -> dropdown shows matching catalog items with color swatches -> click to add with default quantity 1. Similar to inline designer creation pattern from Phase 2.
- **D-10:** Each linked supply tracks required (pattern calls for), acquired (user has), and needed (calculated: required - acquired) quantities. Fulfillment status auto-computed (isFulfilled when acquired >= required). Matches design's ProjectThread/ProjectBead/ProjectSpecialty types.
- **D-11:** Bulk supply editor deferred to post-MVP. MVP: add supplies one at a time via inline search + edit quantities in the supplies tab.
- **D-12:** Auto-generated shopping list at /shopping page, grouped by project. Shows unfulfilled supplies per project with color swatches and needed quantities.
- **D-13:** Inline fulfillment from shopping list -- "Mark acquired" action on each item updates the junction record's acquired quantity directly.
- **D-14:** Fully fulfilled projects disappear from the shopping list. List shows only projects with unfulfilled needs.
- **D-15:** Shopping list includes fabric needs alongside supply needs -- if a project has stitch dimensions but no linked fabric, show "Needs fabric: Xct, W x H".
- **D-16:** Separate /fabric page with FabricCatalog table -- sortable by count, type, brand, color. Sidebar nav item under a "Supplies" group or alongside it.
- **D-17:** One fabric record per project (1:1 relationship via linkedProjectId on Fabric). Fabric is a standalone entity you create and then assign to a project.
- **D-18:** Fabric form fields: name, brand (from FabricBrand), count, type, color family, color type, shortest edge inches, longest edge inches, needToBuy flag, linked project.
- **D-19:** Auto-calculated fabric size shown on project detail page when project has stitch dimensions and linked fabric. Formula: (stitches / fabric count) + 6 inches (3 inch margin each side). Shows "Fits" / "Too small" with required dimensions.
- **D-20:** Margin is fixed at 3 inches per side (standard cross-stitch framing recommendation). Not user-configurable in MVP.

### Claude's Discretion
- Exact Prisma schema field names and types for supply/fabric models (guided by design types)
- Supply tab sub-sections layout (threads/beads/specialty grouping within the tab)
- Empty states for catalog pages, supplies tab, and shopping list
- Color swatch rendering approach (CSS background-color from hex values)
- Inline search dropdown component design and keyboard navigation
- Fabric form layout and field ordering
- Sort direction defaults for catalog tables
- Shopping list item card/row design

### Deferred Ideas (OUT OF SCOPE)
- Bulk supply editor (BulkSupplyEditor from design) -- deferred to post-MVP
- Kitting auto-calculation (SUPP-05) -- 8-condition kitting status
- Kitting progress indicators -- percentage bars, visual kitting dashboard
- Supply statistics -- thread usage across projects, most common colors, etc.
- Advanced brand management -- brand logos, cataloging, pre-seeded Mill Hill/Kreinik/Anchor catalogs
- Pre-seeded bead catalogs (Mill Hill) -- data availability uncertain, user-managed for now
- User-configurable fabric margin -- fixed at 3 inches per side for MVP
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPP-01 | App pre-seeds full DMC thread catalog (~500 colors with hex swatches) | DMC JSON data available from multiple sources (seanockert/rgb-to-dmc has ~500 entries with hex, name, code). Prisma seed script via package.json `prisma.seed` config. JSON fixture file + idempotent upsert. |
| SUPP-02 | User can browse and manage thread, bead, and specialty item databases | Tabbed catalog page with grid/table views per tab. SupplyBrand CRUD at /supplies/brands. Standard CRUD server actions following designer-actions.ts pattern. |
| SUPP-03 | User can link supplies to projects with per-project quantities | Three junction tables (ProjectThread, ProjectBead, ProjectSpecialty) with required/acquired/needed fields. Inline search-and-add on chart detail page's new Supplies tab. |
| SUPP-04 | App auto-generates shopping list showing unfulfilled supplies grouped by project | Read-only aggregation page at /shopping. Query junction records where acquired < required, grouped by project. No new models needed. |
| REF-01 | User can create, view, edit, and delete fabric records with brand, count, type, color, dimensions | Fabric model + FabricBrand model. Separate /fabric page with sortable table. Modal create/edit form. Detail page with metadata grid. |
| REF-02 | App auto-calculates required fabric size from stitch dimensions and fabric count | Pure calculation: (stitches / count) + 6 inches. Displayed on fabric detail page and project detail page. No stored fields needed -- computed at render time. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity
- **Zod validation at boundaries** -- server actions, API routes
- **Prisma schema is source of truth** -- run `prisma generate` after changes
- **Three junction tables for supplies** -- not polymorphic (explicitly stated in CLAUDE.md)
- **Calculated fields at query time** -- never stored in DB (applies to needed quantity, isFulfilled, fabric size)
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **TDD mandatory** -- tests before implementation in all plans
- **Pin exact versions** in package.json (no `^` or `~`)
- **Do NOT use `Button render={<Link>}`** -- use `LinkButton` component
- **Do NOT add "use client" unless genuinely needed**
- **Do NOT build UI without reading DesignOS reference first**
- **Impeccable gates** -- polish after UI plans, audit at phase boundaries
- **Security review** -- this phase touches server actions and user data

## Standard Stack

### Core (already installed -- no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.2 | App Router, server components, server actions | Project framework [VERIFIED: package.json] |
| Prisma | 7.6.0 | ORM, schema, migrations, seed | Project ORM [VERIFIED: package.json] |
| Zod | 3.24.4 | Validation at server action boundaries | Project validation library [VERIFIED: package.json] |
| React | 19.2.4 | UI rendering | Project UI library [VERIFIED: package.json] |
| lucide-react | 1.7.0 | Icons (CircleDot, Gem, Sparkles, ShoppingCart, etc.) | Project icon library [VERIFIED: package.json] |
| sonner | 2.0.7 | Toast notifications | Project notification library [VERIFIED: package.json] |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component testing | Via `@/__tests__/test-utils` wrapper [VERIFIED: package.json] |
| @testing-library/user-event | 14.5.2 | User interaction simulation | Form and interaction tests [VERIFIED: package.json] |
| vitest | 3.1.1 | Test runner | `npm test` [VERIFIED: package.json] |

**No new packages required.** This phase uses only what is already installed. The DMC color data will be a JSON fixture file committed to the repo, not an npm package.

## Architecture Patterns

### Recommended Project Structure (new files)

```
prisma/
  schema.prisma              # Add 9 new models + 3 junction tables
  seed.ts                    # New: seed script for DMC data
  fixtures/
    dmc-threads.json         # New: ~500 DMC colors with hex values
src/
  types/
    supply.ts                # New: supply-related TypeScript types
    fabric.ts                # New: fabric-related TypeScript types
  lib/
    validations/
      supply.ts              # New: Zod schemas for supply/brand/junction
      fabric.ts              # New: Zod schemas for fabric/fabric-brand
    actions/
      supply-actions.ts      # New: CRUD for threads, beads, specialty, brands
      supply-actions.test.ts # New: server action tests
      fabric-actions.ts      # New: CRUD for fabric, fabric brands
      fabric-actions.test.ts # New: server action tests
      shopping-actions.ts    # New: shopping list queries + fulfillment
      shopping-actions.test.ts
  components/
    features/
      supplies/
        supply-catalog.tsx          # Tabbed catalog page component
        supply-catalog.test.tsx
        supply-grid-view.tsx        # Grid view for color swatches
        supply-table-view.tsx       # Table view with sortable headers
        supply-form-modal.tsx       # Create/edit supply modal
        supply-form-modal.test.tsx
        supply-brand-list.tsx       # Brand management table
        supply-brand-list.test.tsx
        supply-brand-form-modal.tsx # Brand create/edit modal
        color-swatch.tsx            # Reusable color swatch component
        search-to-add.tsx           # Inline search dropdown for linking
      fabric/
        fabric-catalog.tsx          # Fabric list page component
        fabric-catalog.test.tsx
        fabric-detail.tsx           # Fabric detail page
        fabric-detail.test.tsx
        fabric-form-modal.tsx       # Fabric create/edit form modal
        fabric-form-modal.test.tsx
        fabric-brand-list.tsx       # Fabric brand management
        fabric-size-calculator.tsx  # Size calculation display
      charts/
        project-supplies-tab.tsx    # New tab on chart detail page
        project-supplies-tab.test.tsx
      shopping/
        shopping-list.tsx           # Shopping list page component
        shopping-list.test.tsx
  app/(dashboard)/
    supplies/
      page.tsx                # Replace placeholder with catalog
      brands/
        page.tsx              # Supply brand management page
    fabric/
      page.tsx                # New: fabric catalog page
      [id]/
        page.tsx              # New: fabric detail page
    shopping/
      page.tsx                # Replace placeholder with shopping list
```

### Pattern 1: Server Action Pattern (follow exactly)

**What:** Every mutation follows the established pattern from designer-actions.ts
**When to use:** All supply, fabric, brand, and junction CRUD operations

```typescript
// Source: src/lib/actions/designer-actions.ts (existing pattern)
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { threadSchema } from "@/lib/validations/supply";

export async function createThread(formData: unknown) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const thread = await prisma.thread.create({ data: validated });
    revalidatePath("/supplies");
    return { success: true as const, thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (error && typeof error === "object" && "code" in error &&
        (error as { code: string }).code === "P2002") {
      return { success: false as const, error: "A thread with that code already exists for this brand" };
    }
    console.error("createThread error:", error);
    return { success: false as const, error: "Failed to create thread" };
  }
}
```
[VERIFIED: matches existing designer-actions.ts pattern]

### Pattern 2: Prisma Schema -- Junction Tables with Computed Fields

**What:** Three junction tables linking projects to supplies, with quantity tracking
**When to use:** ProjectThread, ProjectBead, ProjectSpecialty models

```prisma
// Source: CONTEXT.md D-10 + CROSS_STITCH_TRACKER_PLAN.md section 4.2
model ProjectThread {
  id               String  @id @default(cuid())
  project          Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  thread           Thread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  threadId         String
  stitchCount      Int     @default(0)
  quantityRequired Int     @default(1)
  quantityAcquired Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([projectId, threadId])
}
```
[VERIFIED: matches design type definitions in supply-tracking-and-shopping/types.ts]

**Important:** `quantityNeeded` and `isFulfilled` are NOT stored -- they are computed at query time per CLAUDE.md convention. `quantityNeeded = quantityRequired - quantityAcquired` and `isFulfilled = quantityAcquired >= quantityRequired`.

### Pattern 3: Idempotent Prisma Seed Script

**What:** Seed DMC thread catalog using `prisma db seed` with upsert
**When to use:** Initial database setup and re-seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import dmcThreads from "./fixtures/dmc-threads.json";

const prisma = new PrismaClient();

async function main() {
  // Upsert DMC brand
  const dmcBrand = await prisma.supplyBrand.upsert({
    where: { name: "DMC" },
    update: {},
    create: { name: "DMC", website: "https://www.dmc.com", supplyType: "THREAD" },
  });

  // Upsert each thread
  for (const thread of dmcThreads) {
    await prisma.thread.upsert({
      where: {
        brandId_colorCode: { brandId: dmcBrand.id, colorCode: thread.colorCode },
      },
      update: { colorName: thread.colorName, hexColor: thread.hexColor, colorFamily: thread.colorFamily },
      create: {
        brandId: dmcBrand.id,
        colorCode: thread.colorCode,
        colorName: thread.colorName,
        hexColor: thread.hexColor,
        colorFamily: thread.colorFamily,
      },
    });
  }

  console.log(`Seeded ${dmcThreads.length} DMC threads`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
```

**package.json addition needed:**
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```
[ASSUMED: Prisma 7 seed config -- needs verification that `tsx` runner works with Prisma 7]

### Pattern 4: Color Swatch Rendering

**What:** CSS background-color from hex values with light-color border detection
**When to use:** Thread/bead color display in grid, table, and search results

```typescript
// Source: product-plan/sections/supply-tracking-and-shopping/components/ProjectSuppliesTab.tsx
function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

// Usage in JSX:
<div
  className={`w-7 h-7 rounded-full shadow-sm ${
    needsBorder(hexColor) ? "ring-1 ring-stone-200 dark:ring-stone-600" : ""
  }`}
  style={{ backgroundColor: hexColor }}
/>
```
[VERIFIED: pattern used consistently in all design components]

### Pattern 5: Fabric Size Calculation (Pure Function)

**What:** Calculate required fabric dimensions from stitch dimensions and fabric count
**When to use:** Fabric detail page, project detail page

```typescript
// Formula from D-19/D-20: (stitches / count) + 6 (3" margin each side)
export function calculateRequiredFabricSize(
  stitchesWide: number,
  stitchesHigh: number,
  fabricCount: number,
): { requiredWidthInches: number; requiredHeightInches: number } {
  return {
    requiredWidthInches: (stitchesWide / fabricCount) + 6,
    requiredHeightInches: (stitchesHigh / fabricCount) + 6,
  };
}

export function doesFabricFit(
  fabric: { shortestEdgeInches: number; longestEdgeInches: number },
  required: { requiredWidthInches: number; requiredHeightInches: number },
): boolean {
  // Compare in both orientations
  const fitsNormal =
    fabric.shortestEdgeInches >= required.requiredWidthInches &&
    fabric.longestEdgeInches >= required.requiredHeightInches;
  const fitsRotated =
    fabric.longestEdgeInches >= required.requiredWidthInches &&
    fabric.shortestEdgeInches >= required.requiredHeightInches;
  return fitsNormal || fitsRotated;
}
```
[VERIFIED: matches FabricDetail.tsx design component calculation at line 37-40]

### Anti-Patterns to Avoid
- **Storing computed fields in DB:** `quantityNeeded` and `isFulfilled` must be computed at query time, not stored. Same for fabric size calculations. [CLAUDE.md: "Calculated fields at query time -- never stored in DB"]
- **Polymorphic junction table:** Do NOT create a single `ProjectSupply` table with a `type` discriminator. CLAUDE.md explicitly says "Three junction tables for supplies -- not polymorphic."
- **Pre-seeding beads/specialty items:** Only DMC threads are pre-seeded (D-07). Beads and specialty items are user-managed.
- **Nested forms:** The inline search-to-add dropdown inside the ProjectSuppliesTab must NOT use nested `<form>` elements. Use `<div>` with `type="button"` handlers per base-ui-patterns.md.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color swatch rendering | Custom color picker / canvas | CSS `background-color` with hex string | Simple, performant, matches design reference exactly |
| Toast notifications | Custom notification system | `sonner` (already installed) | Established in project, consistent UX |
| Modal dialogs | Custom modal | shadcn/ui `Dialog` | Already used in designer/genre forms |
| Sortable tables | Custom sort logic from scratch | Follow designer-list.tsx pattern | Proven pattern with useSortableData or useState-based sorting |
| Form validation | Custom validators | Zod schemas | Project convention, type-safe, server-side validated |
| DMC color data | Web scraping or API calls | Static JSON fixture committed to repo | Deterministic, offline-capable, no external dependency |

**Key insight:** This phase adds volume (9 models, many pages) but introduces no fundamentally new patterns. Every UI component and server action follows a pattern already established in Phases 2-3. The risk is scope, not complexity.

## Common Pitfalls

### Pitfall 1: Prisma Migrate with Many New Models
**What goes wrong:** Adding 9+ models in one migration can cause conflicts if the migration is interrupted or if the schema has errors.
**Why it happens:** Large schema changes are harder to debug when migration fails partway.
**How to avoid:** Run `npx prisma validate` before `npx prisma migrate dev`. Consider grouping into 2 migrations: (1) supply models + junction tables, (2) fabric models. But a single migration is fine if validated first.
**Warning signs:** `prisma migrate dev` fails with unclear error messages.

### Pitfall 2: Seed Script Idempotency
**What goes wrong:** Running `prisma db seed` twice creates duplicate DMC entries.
**Why it happens:** Using `create` instead of `upsert` or failing to set proper unique constraints.
**How to avoid:** Use `upsert` with a compound unique key (`brandId` + `colorCode` for threads). Add `@@unique([brandId, colorCode])` to the Thread model. Test seed idempotency by running it twice.
**Warning signs:** Duplicate entries in the thread catalog after re-seeding.

### Pitfall 3: N+1 Queries in Shopping List
**What goes wrong:** Shopping list loads slowly because it fetches each project's supplies in separate queries.
**Why it happens:** Querying projects first, then looping to fetch their supplies individually.
**How to avoid:** Use Prisma `include` to eagerly load project threads/beads/specialty in a single query with nested relations. Filter at the Prisma level: `where: { quantityAcquired: { lt: prisma.raw("quantityRequired") } }` -- or more practically, filter in application code after a single inclusive query.
**Warning signs:** Multiple sequential database queries for a single page load.

### Pitfall 4: Fabric 1:1 Relationship Enforcement
**What goes wrong:** Multiple fabrics get linked to the same project, or the `linkedProjectId` unique constraint is missing.
**Why it happens:** D-17 specifies 1:1 via `linkedProjectId` on Fabric, but without a unique index, Prisma allows multiple fabrics per project.
**How to avoid:** Add `@unique` to `linkedProjectId` on the Fabric model. Make `linkedProjectId` nullable (fabric can exist unassigned) with `@unique` to enforce at-most-one.
**Warning signs:** "Unique constraint failed" errors or silently allowing multiple fabrics per project.

### Pitfall 5: Color Family Assignment for DMC Seed Data
**What goes wrong:** The JSON fixture file needs a `colorFamily` field for each thread, but the raw DMC data sources only provide hex/RGB values.
**Why it happens:** The seanockert/rgb-to-dmc source has hex values but no color family classification.
**How to avoid:** Either (1) include color family in the fixture file by pre-classifying colors using hue ranges from hex values, or (2) write a classification function that maps hex values to the 11 color families (Black, White, Red, Orange, Yellow, Green, Blue, Purple, Brown, Gray, Neutral). The design types define exactly these 11 families.
**Warning signs:** All threads showing as "uncategorized" or wrong family assignments.

### Pitfall 6: View Mode Persistence Across Server/Client Boundary
**What goes wrong:** localStorage is used for persisting grid/table view preferences (D-03), but Server Components cannot access localStorage.
**Why it happens:** The catalog page renders on the server first, then hydrates client-side.
**How to avoid:** The catalog component with view toggle must be a Client Component (it needs `useState` for the active tab and view mode anyway). Read localStorage in a `useEffect` on mount to restore saved preference. Default to a sensible value (e.g., grid for threads, table for beads) for the initial server render.
**Warning signs:** Hydration mismatch if view mode differs between server render and client hydration.

## Code Examples

### Example 1: Prisma Schema for Supply Models

```prisma
// Source: design types.ts + CONTEXT.md decisions

enum SupplyType {
  THREAD
  BEAD
  SPECIALTY
}

enum ColorFamily {
  BLACK
  WHITE
  RED
  ORANGE
  YELLOW
  GREEN
  BLUE
  PURPLE
  BROWN
  GRAY
  NEUTRAL
}

model SupplyBrand {
  id         String     @id @default(cuid())
  name       String     @unique
  website    String?
  supplyType SupplyType
  threads    Thread[]
  beads      Bead[]
  specialtyItems SpecialtyItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Thread {
  id          String      @id @default(cuid())
  brand       SupplyBrand @relation(fields: [brandId], references: [id])
  brandId     String
  colorCode   String
  colorName   String
  hexColor    String
  colorFamily ColorFamily
  projectThreads ProjectThread[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([brandId, colorCode])
}

model Bead {
  id          String      @id @default(cuid())
  brand       SupplyBrand @relation(fields: [brandId], references: [id])
  brandId     String
  productCode String
  colorName   String
  hexColor    String
  colorFamily ColorFamily
  projectBeads ProjectBead[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([brandId, productCode])
}

model SpecialtyItem {
  id          String      @id @default(cuid())
  brand       SupplyBrand @relation(fields: [brandId], references: [id])
  brandId     String
  productCode String
  colorName   String
  description String      @default("")
  hexColor    String
  projectSpecialty ProjectSpecialty[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([brandId, productCode])
}

model ProjectThread {
  id               String  @id @default(cuid())
  project          Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  thread           Thread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  threadId         String
  stitchCount      Int     @default(0)
  quantityRequired Int     @default(1)
  quantityAcquired Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([projectId, threadId])
}

model ProjectBead {
  id               String  @id @default(cuid())
  project          Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  bead             Bead    @relation(fields: [beadId], references: [id], onDelete: Cascade)
  beadId           String
  quantityRequired Int     @default(1)
  quantityAcquired Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([projectId, beadId])
}

model ProjectSpecialty {
  id               String       @id @default(cuid())
  project          Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  specialtyItem    SpecialtyItem @relation(fields: [specialtyItemId], references: [id], onDelete: Cascade)
  specialtyItemId  String
  quantityRequired Int          @default(1)
  quantityAcquired Int          @default(0)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@unique([projectId, specialtyItemId])
}
```
[VERIFIED: aligns with design types.ts, CLAUDE.md "three junction tables" convention, and CONTEXT.md D-10]

### Example 2: Prisma Schema for Fabric Models

```prisma
// Source: fabric-series-and-reference-data/types.ts + CONTEXT.md D-16 through D-20

model FabricBrand {
  id      String   @id @default(cuid())
  name    String   @unique
  website String?
  fabrics Fabric[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Fabric {
  id                 String           @id @default(cuid())
  name               String
  brand              FabricBrand      @relation(fields: [brandId], references: [id])
  brandId            String
  photoUrl           String?
  count              Int
  type               String
  colorFamily        String
  colorType          String
  shortestEdgeInches Float            @default(0)
  longestEdgeInches  Float            @default(0)
  needToBuy          Boolean          @default(false)
  linkedProject      Project?         @relation(fields: [linkedProjectId], references: [id])
  linkedProjectId    String?          @unique
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}
```
[VERIFIED: matches Fabric type definition with 1:1 via `@unique` on linkedProjectId per D-17]

**Note on fabric enums:** The design defines `FabricCount`, `FabricType`, `FabricColorFamily`, `FabricColorType` as TypeScript union types. For the Prisma schema, use `Int` for count and `String` for type/colorFamily/colorType -- validate with Zod at the server action boundary rather than Prisma enums. This avoids migration headaches when adding new fabric types later.

### Example 3: Project Model Additions

```prisma
// Add to existing Project model:
model Project {
  // ... existing fields ...
  projectThreads    ProjectThread[]
  projectBeads      ProjectBead[]
  projectSpecialty  ProjectSpecialty[]
  fabric            Fabric?
}
```
[VERIFIED: Project model currently exists at line 69-87 of schema.prisma]

### Example 4: Shopping List Query Pattern

```typescript
// Source: design pattern from CONTEXT.md D-12 through D-14
export async function getShoppingList() {
  await requireAuth();

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { projectThreads: { some: {} } },
        { projectBeads: { some: {} } },
        { projectSpecialty: { some: {} } },
      ],
    },
    include: {
      chart: { select: { name: true, stitchesWide: true, stitchesHigh: true } },
      projectThreads: {
        include: { thread: { include: { brand: true } } },
      },
      projectBeads: {
        include: { bead: { include: { brand: true } } },
      },
      projectSpecialty: {
        include: { specialtyItem: { include: { brand: true } } },
      },
      fabric: true,
    },
  });

  // Filter to only projects with unfulfilled supplies or missing fabric
  return projects
    .map((p) => ({
      projectId: p.id,
      projectName: p.chart.name,
      unfulfilledThreads: p.projectThreads.filter((pt) => pt.quantityAcquired < pt.quantityRequired),
      unfulfilledBeads: p.projectBeads.filter((pb) => pb.quantityAcquired < pb.quantityRequired),
      unfulfilledSpecialty: p.projectSpecialty.filter((ps) => ps.quantityAcquired < ps.quantityRequired),
      needsFabric: !p.fabric && p.chart.stitchesWide > 0 && p.chart.stitchesHigh > 0,
      stitchesWide: p.chart.stitchesWide,
      stitchesHigh: p.chart.stitchesHigh,
    }))
    .filter(
      (p) =>
        p.unfulfilledThreads.length > 0 ||
        p.unfulfilledBeads.length > 0 ||
        p.unfulfilledSpecialty.length > 0 ||
        p.needsFabric,
    );
}
```

### Example 5: Zod Validation Schemas

```typescript
// Source: existing chart.ts validation pattern + design types
import { z } from "zod";

const SUPPLY_TYPES = ["THREAD", "BEAD", "SPECIALTY"] as const;
const COLOR_FAMILIES = [
  "BLACK", "WHITE", "RED", "ORANGE", "YELLOW",
  "GREEN", "BLUE", "PURPLE", "BROWN", "GRAY", "NEUTRAL",
] as const;

export const supplyBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(200),
  website: z.string().url("Must be a valid URL").nullable().default(null),
  supplyType: z.enum(SUPPLY_TYPES),
});

export const threadSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  colorCode: z.string().trim().min(1, "Color code is required").max(50),
  colorName: z.string().trim().min(1, "Color name is required").max(200),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  colorFamily: z.enum(COLOR_FAMILIES),
});

export const projectThreadSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().min(1),
  stitchCount: z.number().int().min(0).default(0),
  quantityRequired: z.number().int().min(1).default(1),
  quantityAcquired: z.number().int().min(0).default(0),
});
```
[VERIFIED: follows existing designerSchema/genreSchema pattern in chart.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma 6 `@prisma/client` imports | Prisma 7: `from "../src/generated/prisma/client"` | Prisma 7 (2025) | Import path for seed script must use relative path, not `@prisma/client` [VERIFIED: generator output in schema.prisma] |
| `package.json` `prisma.seed` with `ts-node` | `prisma.seed` with `tsx` or `ts-node --compiler-options` | Current | Need `tsx` or equivalent TS runner for seed script [ASSUMED] |

## DMC Seed Data Strategy

**Source:** The seanockert/rgb-to-dmc repository provides a JSON file with ~500 DMC thread entries containing floss number, description, hex values, and RGB values. [CITED: github.com/seanockert/rgb-to-dmc]

**Missing field:** The raw data does NOT include `colorFamily`. The fixture file must add this field. Options:
1. **Recommended:** Pre-classify all ~500 colors into the 11 color families using hue/saturation/lightness ranges. This is a one-time manual/scripted effort and produces deterministic results.
2. Write the classification into the seed script itself based on hex-to-HSL conversion.

**Color family classification heuristics (from hex):**
- Black: lightness < 10%
- White: lightness > 90% and saturation < 15%
- Gray: saturation < 15% and 10% < lightness < 90%
- Neutral: saturation < 25% and lightness between 40-80%
- Red: hue 345-15 degrees
- Orange: hue 15-45 degrees
- Yellow: hue 45-70 degrees
- Green: hue 70-170 degrees
- Blue: hue 170-260 degrees
- Purple: hue 260-345 degrees
- Brown: saturation < 60% and hue 15-45 and lightness < 50%

[ASSUMED: These hue ranges are approximate. The fixture file should be reviewed manually for accuracy, especially edge cases between Brown/Orange/Red.]

**Fixture file format:**
```json
[
  {
    "colorCode": "310",
    "colorName": "Black",
    "hexColor": "#000000",
    "colorFamily": "BLACK"
  },
  {
    "colorCode": "blanc",
    "colorName": "White",
    "hexColor": "#FFFFFF",
    "colorFamily": "WHITE"
  }
]
```

## Sidebar Navigation Updates

The current navigation in `src/components/shell/nav-items.ts` already has "Supplies" and "Shopping" entries. [VERIFIED: nav-items.ts lines 25-28]

**Changes needed:**
- Add "Fabric" nav item (new page at `/fabric`)
- Consider grouping Supplies + Fabric + Shopping under a visual separator or section header
- Keep existing "Supplies" pointing to `/supplies` (the catalog page)

## Assumptions Log

> List all claims tagged [ASSUMED] in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma 7 seed script uses `tsx` runner via `package.json` `prisma.seed` config | Architecture Patterns, Pattern 3 | LOW -- fallback to `ts-node` or `node --loader` is straightforward |
| A2 | DMC color family classification heuristics based on HSL ranges will produce accurate assignments | DMC Seed Data Strategy | MEDIUM -- some colors (dusty pinks, teals, browns) may be miscategorized. Manual review of fixture file recommended. |
| A3 | The seanockert/rgb-to-dmc JSON has ~500 entries covering the full standard DMC catalog | DMC Seed Data Strategy | LOW -- multiple sources confirm DMC has ~453-500 standard colors |

## Open Questions

1. **DMC fixture data curation**
   - What we know: Raw hex/name data is available from multiple sources
   - What's unclear: Which source has the most accurate hex values (sources disagree slightly on exact hex codes)
   - Recommendation: Use seanockert/rgb-to-dmc as base, add colorFamily field. Cross-reference with the design's sample-data.json for the 15 threads already defined there.

2. **Fabric page placement in navigation**
   - What we know: D-16 says "Sidebar nav item under a 'Supplies' group or alongside it"
   - What's unclear: Whether to create a collapsible nav group or just add as a flat item
   - Recommendation: Add as flat item between Supplies and Shopping for simplicity. Grouping can be added later in Phase 5+ if navigation grows.

3. **Seed script runner for Prisma 7**
   - What we know: Prisma 7 uses `prisma.seed` in package.json. The generated client is at `src/generated/prisma/client`.
   - What's unclear: Whether `tsx` is already available or needs installing
   - Recommendation: Check if `tsx` is installed (`npx tsx --version`), install if needed as devDependency. Alternative: use `npx ts-node --esm` if tsx is problematic.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL (Neon) | Data layer | Conditional | -- | Uses lazy Prisma proxy, degrades gracefully [VERIFIED: Phase 2 decision] |
| tsx or ts-node | Seed script | Needs check | -- | Use `node --loader ts-node/esm` or compile TS first |
| Node.js | Everything | Yes | -- | -- |

**Missing dependencies with no fallback:**
- None -- all external dependencies already available from Phases 1-3

**Missing dependencies with fallback:**
- tsx runner: If not installed, add as devDependency (`npm install --save-exact --save-dev tsx`)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUPP-01 | DMC catalog seeded with ~500 colors | integration (seed script) | Manual verify after `npx prisma db seed` | Wave 0 |
| SUPP-02a | Thread/bead/specialty CRUD server actions | unit | `npx vitest run src/lib/actions/supply-actions.test.ts` | Wave 0 |
| SUPP-02b | Supply catalog UI with tabs, grid/table views | unit | `npx vitest run src/components/features/supplies/supply-catalog.test.tsx` | Wave 0 |
| SUPP-02c | Supply brand CRUD | unit | `npx vitest run src/lib/actions/supply-actions.test.ts` (brand tests) | Wave 0 |
| SUPP-03a | Junction table CRUD (link/unlink/update quantities) | unit | `npx vitest run src/lib/actions/supply-actions.test.ts` (junction tests) | Wave 0 |
| SUPP-03b | Project supplies tab with inline add | unit | `npx vitest run src/components/features/charts/project-supplies-tab.test.tsx` | Wave 0 |
| SUPP-04 | Shopping list shows unfulfilled supplies grouped by project | unit | `npx vitest run src/components/features/shopping/shopping-list.test.tsx` | Wave 0 |
| REF-01a | Fabric CRUD server actions | unit | `npx vitest run src/lib/actions/fabric-actions.test.ts` | Wave 0 |
| REF-01b | Fabric catalog, detail, and form UI | unit | `npx vitest run src/components/features/fabric/fabric-catalog.test.tsx` | Wave 0 |
| REF-02 | Fabric size calculation | unit | `npx vitest run src/lib/utils/fabric-calculator.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` (full suite is fast at ~4 seconds)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/actions/supply-actions.test.ts` -- covers SUPP-02, SUPP-03
- [ ] `src/lib/actions/fabric-actions.test.ts` -- covers REF-01
- [ ] `src/lib/actions/shopping-actions.test.ts` -- covers SUPP-04
- [ ] `src/components/features/supplies/supply-catalog.test.tsx` -- covers SUPP-02b
- [ ] `src/components/features/charts/project-supplies-tab.test.tsx` -- covers SUPP-03b
- [ ] `src/components/features/fabric/fabric-catalog.test.tsx` -- covers REF-01b
- [ ] `src/components/features/shopping/shopping-list.test.tsx` -- covers SUPP-04
- [ ] `src/lib/utils/fabric-calculator.test.ts` -- covers REF-02
- [ ] Test factory additions to `src/__tests__/mocks/factories.ts` -- supply/fabric mock creators
- [ ] Mock Prisma additions to `createMockPrisma()` -- thread, bead, specialtyItem, supplyBrand, projectThread, projectBead, projectSpecialty, fabric, fabricBrand models

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` guard on all server actions -- existing pattern |
| V3 Session Management | no | Handled by Auth.js at app level |
| V4 Access Control | yes | Single-user, but all queries scoped via `requireAuth()` |
| V5 Input Validation | yes | Zod schemas at all server action boundaries |
| V6 Cryptography | no | No sensitive data encryption needed for supply/fabric data |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Missing auth on new server actions | Elevation of Privilege | Every action calls `requireAuth()` as first line |
| Hex color injection in style attributes | Tampering | Validate hex format with Zod regex `/^#[0-9A-Fa-f]{6}$/` |
| Malicious brand/supply names | Tampering | Zod `.trim().min(1).max(200)` on all string inputs; React auto-escapes in JSX |
| SQL injection via Prisma queries | Tampering | Prisma uses parameterized queries by default |
| Over-fetching supply data | Information Disclosure | All queries behind `requireAuth()`; single-user app mitigates risk |

## Sources

### Primary (HIGH confidence)
- Existing codebase: `prisma/schema.prisma`, `src/lib/actions/designer-actions.ts`, `src/lib/validations/chart.ts` -- established patterns
- Design components: `product-plan/sections/supply-tracking-and-shopping/types.ts` and components -- UI specification
- Design components: `product-plan/sections/fabric-series-and-reference-data/types.ts` and components -- fabric specification
- `CROSS_STITCH_TRACKER_PLAN.md` section 4.2 -- entity relationships and junction table design
- `CONTEXT.md` decisions D-01 through D-20 -- locked user decisions

### Secondary (MEDIUM confidence)
- [seanockert/rgb-to-dmc](https://github.com/seanockert/rgb-to-dmc) -- DMC thread color JSON data with hex values (~500 colors)
- [Wolfram Data Repository: DMC Thread Colors](https://datarepository.wolframcloud.com/resources/JonMcLoone_DMC-Thread-Colors/) -- 454 DMC colors in CSV/JSON format

### Tertiary (LOW confidence)
- DMC color family classification heuristics -- based on general color theory, not verified against DMC's official family groupings

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, all patterns established
- Architecture: HIGH -- follows existing Phase 2-3 patterns exactly
- Schema design: HIGH -- guided by design types and CLAUDE.md conventions
- DMC seed data: MEDIUM -- source data available but color family classification needs curation
- Pitfalls: HIGH -- based on concrete codebase analysis and Prisma documentation

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable -- no fast-moving dependencies)
