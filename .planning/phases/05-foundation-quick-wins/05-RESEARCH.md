# Phase 5: Foundation & Quick Wins - Research

**Researched:** 2026-04-11
**Domain:** CRUD entity management, Prisma schema migration, DMC thread data, UI bug fixes
**Confidence:** HIGH

## Summary

Phase 5 adds two new Prisma models (StorageLocation, StitchingApp), builds management pages for both, replaces hardcoded string arrays in the chart form with FK-linked dropdowns, wires the existing fabric model into the chart form, completes the DMC thread catalog, and fixes two UX bugs (cover image cropping, thread picker scroll).

This is predominantly a "patterns already established" phase. The Designer/Genre management pages from Phase 3 provide an exact template for StorageLocation and StitchingApp pages. The DesignOS StorageLocationList/StorageLocationDetail components provide the visual spec. The DMC catalog completion is a data-only task. The two UX fixes are surgical CSS/JS changes.

**Primary recommendation:** Follow the Designer page pattern (Server Component page -> Client Component list/detail) for both Storage and App management pages. Use the established server action pattern (requireAuth + Zod + revalidatePath). The migration must drop `projectBin`/`ipadApp` text fields and add FK relations to the new models.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dedicated sidebar nav items for both Storage Locations (MapPin icon) and Stitching Apps (Tablet icon). Placed between Fabric and Sessions in the nav order.
- **D-02:** Stitching Apps mirrors the StorageLocationList/StorageLocationDetail design pattern -- same list layout with name, project count, inline rename, click-through detail page showing assigned projects. No separate design exists; follow storage design exactly.
- **D-03:** Both get dedicated routes at `/storage` and `/apps` with their own pages and detail views.
- **D-04:** Switch from `object-cover` to `object-contain` with `bg-muted` background for letterbox areas. Full image always visible, no cropping.
- **D-05:** Increase container height from `h-32` (128px) to `h-48` (192px). Applies to chart detail page cover display and upload preview in the chart form.
- **D-06:** Reuse existing `SearchableSelect` component for fabric selection in the chart form's Project Setup section. Each option shows fabric name, count, type, and brand. Filter to only unassigned fabrics (`linkedProjectId IS NULL`), plus the currently linked fabric if editing.
- **D-07:** When no unassigned fabrics exist, show "No unassigned fabrics" message with a link to the /fabric page. No inline fabric creation from the chart form.
- **D-08:** New `StorageLocation` and `StitchingApp` Prisma models with: `id`, `name` (required), `description` (optional), `userId`, `createdAt`, `updatedAt`. One-to-many relation to Project.
- **D-09:** Delete behavior: set FK to null on associated projects (unlink, not cascade delete) with a confirmation dialog showing the count of affected projects.
- **D-10:** Start fresh -- migration drops old text fields (`projectBin`, `ipadApp`) from Project and adds FK fields (`storageLocationId`, `stitchingAppId`). No auto-migration of existing text values.

### Claude's Discretion
- DMC catalog completion approach (sourcing, validating, and formatting missing entries 1-149)
- Thread colour picker `scrollIntoView` implementation (which element to scroll, timing, smooth vs instant)
- Exact Prisma schema naming conventions (relation names, index names)
- Detail page layout for Stitching Apps (mirroring StorageLocationDetail from design)
- Empty states for all new management pages
- SearchableSelect option rendering for fabric display (text formatting, layout of name/count/type/brand)
- Whether to update `SearchableSelect` in project-setup-section or create a new fabric-specific picker component

### Deferred Ideas (OUT OF SCOPE)
- Sort order for storage locations and stitching apps (drag-and-drop reordering)
- Inline fabric creation from chart form (link to /fabric instead)
- Storage location icons or color coding
- Stitching app platform info (iOS, Android, macOS) -- description field covers this for now
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STOR-01 | User can create, rename, and delete storage locations | Prisma model (D-08), server actions pattern from designer-actions.ts, inline add/rename from StorageLocationList design, delete with unlink (D-09) |
| STOR-02 | User can view a storage location's detail page with assigned projects | Route at `/storage/[id]`, StorageLocationDetail design component, same pattern as `/designers/[id]` |
| STOR-03 | User can assign storage location and stitching app to a project via dropdown | SearchableSelect already in project-setup-section.tsx, replace hardcoded arrays with DB-backed options via FK fields |
| STOR-04 | User can create, rename, and delete stitching app entries | Mirror StorageLocation exactly (D-02), same model shape, same UI pattern, route at `/apps` and `/apps/[id]` |
| PROJ-01 | User can link an unassigned fabric to a project from the project form | SearchableSelect with fabric data (D-06), filter `linkedProjectId IS NULL`, fabric CRUD already exists |
| PROJ-02 | Cover images display with correct aspect ratio without cropping distortion | `object-contain` + `bg-muted` (D-04), `h-48` container (D-05), affects cover-image-upload.tsx and chart-detail.tsx |
| SUPP-02 | Thread colour picker auto-scrolls to keep search/add controls visible | `scrollIntoView` in search-to-add.tsx after handleSelect, polyfill already in test setup |
| SUPP-03 | DMC thread catalog includes all standard colours (filling ~30 gaps plus Blanc) | Add missing entries to dmc-threads.json, existing seed.ts upsert pattern handles idempotent seeding |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity
- **Zod validation at boundaries** -- all server actions
- **TDD mandatory** -- tests before implementation
- **requireAuth()** on all server actions, no fallback user IDs
- **Pin exact versions** in package.json
- **DesignOS is the spec** -- read design before building
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`**
- **Semantic design tokens** -- never hardcoded color scales
- **No `Button render={<Link>}`** -- use `LinkButton` or `buttonVariants()`
- **No nested `<form>` elements**
- **Prisma schema is source of truth** -- run `prisma generate` after changes

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7 | ORM + migrations | Already used, schema is source of truth [VERIFIED: codebase] |
| Zod | (installed) | Validation schemas | Already used at all boundaries [VERIFIED: codebase] |
| Next.js | 16 | App Router pages + server actions | Framework [VERIFIED: codebase] |
| lucide-react | (installed) | Icons (MapPin, Tablet, Pencil, Trash2, etc.) | Already used throughout [VERIFIED: codebase] |
| cmdk | (installed) | Command palette (SearchableSelect uses it) | Already used in form primitives [VERIFIED: codebase] |
| sonner | (installed) | Toast notifications | Already used for success/error feedback [VERIFIED: codebase] |

### No New Dependencies

This phase requires zero new packages. All functionality is achievable with the existing stack. [VERIFIED: codebase analysis]

## Architecture Patterns

### Recommended Project Structure

```
prisma/
  schema.prisma                  # Add StorageLocation + StitchingApp models
  fixtures/dmc-threads.json      # Expand with missing entries
  seed.ts                        # Already handles idempotent upsert

src/
  app/(dashboard)/
    storage/
      page.tsx                   # Server Component: fetch + render list
      [id]/page.tsx              # Server Component: fetch + render detail
    apps/
      page.tsx                   # Same pattern as storage
      [id]/page.tsx              # Same pattern as storage

  components/features/
    storage/
      storage-location-list.tsx  # Client Component: list with inline add/rename/delete
      storage-location-list.test.tsx
      storage-location-detail.tsx # Client Component: detail with project list
      storage-location-detail.test.tsx
      inline-name-edit.tsx       # Shared inline edit component (reused by apps)
      inline-name-edit.test.tsx
      delete-entity-dialog.tsx   # Shared delete confirmation (reused by apps)
      delete-entity-dialog.test.tsx
    apps/
      stitching-app-list.tsx     # Mirrors storage-location-list
      stitching-app-list.test.tsx
      stitching-app-detail.tsx   # Mirrors storage-location-detail
      stitching-app-detail.test.tsx

  lib/
    actions/
      storage-location-actions.ts  # CRUD + getWithStats + getDetail
      storage-location-actions.test.ts
      stitching-app-actions.ts     # CRUD + getWithStats + getDetail
      stitching-app-actions.test.ts
    validations/
      storage.ts                   # Zod schemas for both entities

  types/
    storage.ts                     # TypeScript types for both entities

  components/shell/
    nav-items.ts                   # Add Storage + Apps nav entries
```

### Pattern 1: Management Page (Server Component -> Client Component)

**What:** Server Component page fetches data, passes to Client Component for interactivity.
**When to use:** All management pages (designers, genres, storage, apps).
**Example:**

```typescript
// src/app/(dashboard)/storage/page.tsx (Server Component)
// Source: existing pattern from src/app/(dashboard)/designers/page.tsx [VERIFIED: codebase]
import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { StorageLocationList } from "@/components/features/storage/storage-location-list";

export default async function StorageLocationsPage() {
  const locations = await getStorageLocationsWithStats();
  return <StorageLocationList locations={locations} />;
}
```

### Pattern 2: Server Action with requireAuth + Zod

**What:** Every mutation goes through requireAuth, Zod validation, Prisma operation, revalidatePath.
**When to use:** All CRUD operations.
**Example:**

```typescript
// Source: existing pattern from src/lib/actions/designer-actions.ts [VERIFIED: codebase]
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

const storageLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(500).nullable().default(null),
});

export async function createStorageLocation(formData: unknown) {
  const user = await requireAuth();
  try {
    const validated = storageLocationSchema.parse(formData);
    const location = await prisma.storageLocation.create({
      data: { ...validated, userId: user.id },
    });
    revalidatePath("/storage");
    return { success: true as const, location };
  } catch (error) {
    // P2002 = unique constraint, ZodError = validation
    // Follow established error handling pattern
  }
}
```

### Pattern 3: Inline Name Edit Component

**What:** Click pencil icon -> input replaces text -> Enter saves, Escape cancels.
**When to use:** StorageLocation and StitchingApp list rows and detail page headers.
**Example:** The DesignOS `InlineNameEdit` component from `StorageLocationList.tsx` provides the exact interaction spec. Key behaviors: auto-focus + auto-select on mount, Enter to save (trim), Escape to cancel, blur to cancel, onMouseDown (not onClick) on save/cancel buttons to prevent blur race condition. [VERIFIED: design reference]

### Pattern 4: Delete with Unlink Confirmation

**What:** Delete entity, set FK to null on associated projects, show affected count in dialog.
**When to use:** Deleting StorageLocation or StitchingApp.
**Example:**

```typescript
// Server action
export async function deleteStorageLocation(id: string) {
  const user = await requireAuth();
  // Transaction: unlink projects, then delete
  await prisma.$transaction([
    prisma.project.updateMany({
      where: { storageLocationId: id },
      data: { storageLocationId: null },
    }),
    prisma.storageLocation.delete({ where: { id } }),
  ]);
  revalidatePath("/storage");
  return { success: true as const };
}
```

### Anti-Patterns to Avoid
- **Hardcoded string arrays for entity data:** This is exactly what Phase 5 eliminates. `DEFAULT_BIN_OPTIONS` and `DEFAULT_APP_OPTIONS` in project-setup-section.tsx must be replaced with database-backed options. [VERIFIED: codebase line 11-12]
- **Inline entity creation for fabric:** Decision D-07 explicitly says no inline fabric creation from chart form. Show "No unassigned fabrics" message + link to /fabric instead.
- **window.confirm for delete:** The DesignOS design uses `window.confirm`, but the codebase already has a proper `DeleteConfirmationDialog` component in `src/components/features/designers/`. Use that pattern -- it shows affected count. [VERIFIED: codebase]
- **Duplicate InlineNameEdit per feature:** Extract a shared component that both storage and apps pages use, rather than duplicating the inline edit logic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Searchable dropdown | Custom autocomplete | Existing `SearchableSelect` component (cmdk-based) | Already handles keyboard nav, search filtering, "Add New" callback [VERIFIED: codebase] |
| Toast notifications | Custom notification system | `sonner` (already installed) | Already used throughout the app [VERIFIED: codebase] |
| Delete confirmation | window.confirm | Existing `DeleteConfirmationDialog` pattern from designers | Accessible, shows affected count, follows app's visual style [VERIFIED: codebase] |
| Status badges on detail pages | Custom badge component | Existing `StatusBadge` component | Already handles all project statuses with correct colors [VERIFIED: codebase] |

**Key insight:** This phase is almost entirely "wire up existing patterns for new entities." The risk is doing too much custom work instead of following established templates.

## Common Pitfalls

### Pitfall 1: Migration Data Loss
**What goes wrong:** Dropping `projectBin` and `ipadApp` text fields loses existing data.
**Why it happens:** Decision D-10 explicitly says "start fresh -- no auto-migration of existing text values."
**How to avoid:** This is intentional. Document in the migration that existing text values are not migrated. The user accepted this tradeoff.
**Warning signs:** N/A -- accepted behavior.

### Pitfall 2: Fabric Selector Showing Assigned Fabrics
**What goes wrong:** The fabric dropdown shows fabrics already linked to other projects.
**Why it happens:** Missing the `linkedProjectId IS NULL` filter.
**How to avoid:** Query must filter `WHERE linkedProjectId IS NULL OR linkedProjectId = currentProjectId`. The second condition ensures editing a project shows its currently linked fabric. [VERIFIED: decision D-06]
**Warning signs:** User sees fabrics in the dropdown that are already used by other projects.

### Pitfall 3: Cover Image Changes Missing Locations
**What goes wrong:** Fixing `object-cover` in upload preview but missing the chart detail page, or vice versa.
**Why it happens:** The `object-cover` class appears in 3 locations that need changes.
**How to avoid:** All locations that need updating:
1. `cover-image-upload.tsx` line 196 (container `h-32` -> `h-48`) and line 201 (`object-cover` -> `object-contain`)
2. `cover-image-upload.tsx` line 192 (resolving state container `h-32` -> `h-48`)
3. `cover-image-upload.tsx` line 231 (drop zone `h-32` -> `h-48`)
4. `chart-detail.tsx` line 187 (`object-cover` -> `object-contain`, add `bg-muted`)
Note: `cover-thumbnail.tsx` line 20 uses `object-cover` for 10x10 thumbnails -- do NOT change this, small thumbnails work fine with cover. [VERIFIED: codebase grep]
**Warning signs:** Image still crops in one view but not another.

### Pitfall 4: Chart Form Doesn't Pass New FK Fields
**What goes wrong:** New storage/app dropdowns work visually but data isn't saved.
**Why it happens:** The form data flow goes: `useChartForm` values -> `chartFormSchema` validation -> `createChart`/`updateChart` -> Prisma. ALL layers need the new fields (`storageLocationId`, `stitchingAppId`, `fabricId`).
**How to avoid:** Update in order:
1. Prisma schema (add FK fields)
2. `chartFormSchema` in `validations/chart.ts` (add new fields)
3. `ChartFormValues` interface in `use-chart-form.ts` (add new fields)
4. `buildInitialValues` function (populate from existing data)
5. `handleSubmit` function (include in `formData.project`)
6. `createChart`/`updateChart` server actions (save FK fields)
7. `ProjectSetupSection` component (add new dropdowns)
**Warning signs:** Form submits successfully but new fields are null in database.

### Pitfall 5: DMC Data Quality Issues
**What goes wrong:** Missing or incorrect hex colors, wrong color family assignments, duplicate entries.
**Why it happens:** DMC thread data from web sources is often inconsistent.
**How to avoid:** Cross-reference multiple sources. The existing fixture uses a consistent format. Use the same structure. The seed.ts upsert pattern will update existing entries if re-run. [VERIFIED: codebase]
**Warning signs:** Colors look wrong in the thread picker, or search doesn't find expected threads.

### Pitfall 6: SearchableSelect Doesn't Show Rich Fabric Info
**What goes wrong:** Fabric dropdown shows just the fabric name, but user can't distinguish "14ct White Aida" from "14ct Antique White Aida."
**Why it happens:** `SearchableSelect` uses `{ value: string, label: string }` options. Fabric needs richer display.
**How to avoid:** Format the label to include key distinguishing info: `"${fabric.name} - ${fabric.count}ct ${fabric.type} (${brand.name})"`. This uses the existing `label` field without modifying the `SearchableSelect` component. [VERIFIED: decision D-06 specifies "fabric name, count, type, and brand"]
**Warning signs:** User can't tell fabrics apart in the dropdown.

## Code Examples

### Prisma Schema Addition

```prisma
// Source: Decision D-08 + existing Project model pattern [VERIFIED: CONTEXT.md + codebase]
model StorageLocation {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  projects    Project[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model StitchingApp {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  projects    Project[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Updated Project model (replace text fields with FK relations)
model Project {
  // ... existing fields ...
  // REMOVE: projectBin String?
  // REMOVE: ipadApp String?
  // ADD:
  storageLocation   StorageLocation? @relation(fields: [storageLocationId], references: [id])
  storageLocationId String?
  stitchingApp      StitchingApp?    @relation(fields: [stitchingAppId], references: [id])
  stitchingAppId    String?
  // ... rest of existing fields ...
}
```

### Nav Items Update

```typescript
// Source: src/components/shell/nav-items.ts [VERIFIED: codebase]
import { MapPin, Tablet } from "lucide-react";

// Add between Fabric and Sessions:
{ label: "Storage", href: "/storage", icon: MapPin },
{ label: "Apps", href: "/apps", icon: Tablet },
```

### Cover Image Fix

```typescript
// cover-image-upload.tsx: Change h-32 to h-48, object-cover to object-contain + bg-muted
// Source: Decision D-04, D-05 [VERIFIED: CONTEXT.md]

// Preview container (line 196):
<div className="border-border bg-muted relative h-48 overflow-hidden rounded-lg border-2">
  <img
    src={preview}
    alt="Cover image preview"
    className="h-full w-full object-contain"
    onError={() => setImgError(true)}
  />

// chart-detail.tsx CoverImage component (line 187):
<img
  src={coverImageUrl}
  alt={`Cover for ${chartName}`}
  className="bg-muted aspect-[4/3] max-h-80 w-full rounded-lg object-contain lg:w-80"
  onError={() => setImgError(true)}
/>
```

### Thread Picker ScrollIntoView

```typescript
// Source: search-to-add.tsx handleSelect function [VERIFIED: codebase]
// After successful add in handleSelect (around line 156):
async function handleSelect(item: SupplyItem) {
  startTransition(async () => {
    try {
      // ... existing add logic ...
      if (result.success) {
        toast.success(`Added ${item.brand.name} ${getItemCode(item)} to project`);
        onAdded();
        // Scroll to keep search/add controls visible
        // Use setTimeout to allow React to re-render the list
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
        // Don't close - user may want to add more
      }
    } catch { /* ... */ }
  });
}
```

Note: The current `handleSelect` calls `onClose()` after adding. For SUPP-02, we need to either (a) keep the picker open after adding so the user can add more, or (b) scroll the parent container. The CONTEXT.md says "auto-scrolls to keep search/add controls visible when adding items" which implies the picker stays open and the parent list scrolls. [ASSUMED]

### Fabric Selector Integration

```typescript
// Source: Decision D-06 + existing SearchableSelect pattern [VERIFIED: CONTEXT.md + codebase]
// In project-setup-section.tsx, replace the disabled fabric placeholder:

<FormField label="Fabric">
  <SearchableSelect
    options={unassignedFabrics.map((f) => ({
      value: f.id,
      label: `${f.name} - ${f.count}ct ${f.type} (${f.brand.name})`,
    }))}
    value={fabricId}
    onChange={onFabricChange}
    placeholder={unassignedFabrics.length === 0 ? "No unassigned fabrics" : "Select fabric..."}
    disabled={unassignedFabrics.length === 0}
  />
  {unassignedFabrics.length === 0 && (
    <p className="text-muted-foreground mt-1 text-xs">
      <Link href="/fabric" className="text-primary hover:underline">Add fabric</Link> to assign to this project
    </p>
  )}
</FormField>
```

## DMC Catalog Completion Research

### Current State
- **459 entries** in `prisma/fixtures/dmc-threads.json` [VERIFIED: codebase analysis]
- **Non-numeric codes present:** B5200, White, Ecru [VERIFIED: codebase]
- **Numeric range:** 150-3866 (with significant gaps above 150 that are expected -- DMC numbers are not continuous) [VERIFIED: codebase]
- **Missing:** Blanc (distinct from White and B5200), plus DMC numbers 1-35 [VERIFIED: web research]

### What Actually Needs Adding

DMC standard 6-strand embroidery floss numbering: [CITED: dmc.crazyartzone.com, cyberstitchers.com]

1. **Blanc** -- a distinct white thread (code "Blanc"), different from "White" and "B5200" which are already present. Hex ~#FFFFFF, colorFamily WHITE.
2. **DMC 1-35** -- These are relatively newer colors added to the DMC lineup. They include tins, driftwoods, tender greens, apple greens, chartreuse, yellow plums, shrimp, alizarins, lavenders, eggplants, blueberries, and fuschias. ~35 entries with verified hex codes from crazyartzone.com.
3. **DMC 48-125 (variegated)** -- These are multi-color/variegated threads. They change color along the skein. Whether to include them depends on whether the user works with variegated threads. There are approximately 18 classic variegated colors (48, 51, 52, 53, 57, 61, 62, 67, 69, 75, 90, 92, 93, 94, 99, 105, 106, 107, 111, 115, 121, 125). Assigning a single hex color is problematic since they blend multiple colors.
4. **DMC 36-47, 126-149** -- These numbers **do not exist** as standard DMC threads. The numbering jumps from 35 to the variegated range and then to 150. [VERIFIED: multiple web sources confirm no threads in these ranges]

### Recommendation for DMC Completion

Add **Blanc + DMC 1-35** (~36 entries). This fulfills SUPP-03 ("filling ~30 gaps plus Blanc").

For variegated threads (48-125): **Defer.** They're a different product category, have no single representative hex color, and the REQUIREMENTS.md says "~30 gaps" which matches the 1-35 range + Blanc. If the user wants variegated threads, it's a separate future task.

Verified hex colors for DMC 1-35 are available from [dmc.crazyartzone.com](https://dmc.crazyartzone.com/) -- a DMC-to-RGB conversion chart that includes these newer colors. [CITED: dmc.crazyartzone.com]

### DMC 1-35 Data (from crazyartzone.com)

| Code | Name | Hex | ColorFamily |
|------|------|-----|-------------|
| Blanc | Blanc | #FCFBF8 | WHITE |
| 1 | White Tin | #E3E3E6 | GRAY |
| 2 | Tin | #D7D7D8 | GRAY |
| 3 | Tin Medium | #B8B8BB | GRAY |
| 4 | Tin Dark | #AEAEB1 | GRAY |
| 5 | Driftwood Light | #E3CCBE | BROWN |
| 6 | Driftwood Medium Light | #DCC6B8 | BROWN |
| 7 | Driftwood | #8F7B6E | BROWN |
| 8 | Driftwood Dark | #6A5046 | BROWN |
| 9 | Cocoa Very Dark | #552014 | BROWN |
| 10 | Tender Green Very Light | #EDFED9 | GREEN |
| 11 | Tender Green Light | #E2EDB5 | GREEN |
| 12 | Tender Green | #CDD99A | GREEN |
| 13 | Nile Green Medium Light | #BFF6E0 | GREEN |
| 14 | Apple Green Pale | #D0FBB2 | GREEN |
| 15 | Apple Green | #D1EDA4 | GREEN |
| 16 | Chartreuse Light | #C9C258 | GREEN |
| 17 | Yellow Plum Light | #E5E272 | YELLOW |
| 18 | Yellow Plum | #D9D56D | YELLOW |
| 19 | Autumn Gold Medium Light | #F7C95F | YELLOW |
| 20 | Shrimp | #F7AF93 | ORANGE |
| 21 | Alizarin Light | #D79982 | RED |
| 22 | Alizarin | #BC604E | RED |
| 23 | Apple Blossom | #EDE2ED | PURPLE |
| 24 | White Lavender | #E0D7EE | PURPLE |
| 25 | Lavender Ultra Light | #DAD2E9 | PURPLE |
| 26 | Lavender Pale | #D7CAE6 | PURPLE |
| 27 | White Violet | #F0EEF9 | PURPLE |
| 28 | Eggplant Medium Light | #9086A9 | PURPLE |
| 29 | Eggplant | #674076 | PURPLE |
| 30 | Blueberry Medium Light | #7D77A5 | BLUE |
| 31 | Blueberry | #50518D | BLUE |
| 32 | Blueberry Dark | #4D2E8A | BLUE |
| 33 | Fuschia | #9C599C | PURPLE |
| 34 | Fuschia Dark | #7D3064 | PURPLE |
| 35 | Fuschia Very Dark | #46052D | PURPLE |

[CITED: dmc.crazyartzone.com]

**ColorFamily assignments** above are my recommendations based on hex values and existing patterns in the fixture. [ASSUMED] The user may want to verify these -- particularly the borderline cases like Chartreuse (GREEN vs YELLOW) and Shrimp (ORANGE vs RED).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded string arrays for bins/apps | Database-backed FK relations | This phase | Enables proper CRUD, per-entity detail pages, project associations |
| `object-cover` for cover images | `object-contain` with `bg-muted` letterboxing | This phase | Tall/square images visible without cropping |
| `h-32` (128px) cover containers | `h-48` (192px) cover containers | This phase | More image area, less claustrophobic |
| Disabled "Phase 5" fabric placeholder | Active SearchableSelect with unassigned fabrics | This phase | Users can finally link fabrics to projects |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Thread picker should stay open after adding (not close) to support multi-add workflow | Code Examples (scrollIntoView) | Minor -- different scroll target if picker closes. Current code calls `onClose()` after each add, contradicting the scroll requirement. Need to verify desired behavior with user. |
| A2 | DMC ColorFamily assignments for 1-35 threads | DMC Catalog Completion | Low -- easy to adjust in fixture. Borderline cases: Chartreuse (GREEN?), Shrimp (ORANGE?), Apple Blossom (PURPLE vs NEUTRAL?) |
| A3 | Variegated threads (48-125) excluded from scope | DMC Catalog Completion | Medium -- if user expects a "complete" catalog with variegated, ~18 more entries needed. But SUPP-03 says "~30 gaps" which aligns with just 1-35 + Blanc. |

## Open Questions

1. **Thread picker scroll behavior**
   - What we know: SUPP-02 says "auto-scrolls to keep search/add controls visible when adding items." Currently `handleSelect` calls `onClose()` after adding each item.
   - What's unclear: Should the picker stay open for multi-add, or does the scroll apply to the parent container (the supply list where the "+Add more" button lives)?
   - Recommendation: The picker should stay open after adding (remove `onClose()` call). Scroll the parent supply list container to keep the "+Add more" button visible as the list grows. This matches the UX intent from backlog item 999.0.13.

2. **Fabric linking on chart creation vs edit**
   - What we know: Fabric has `linkedProjectId` as a one-to-one FK to Project. Linking a fabric means setting `linkedProjectId` on the Fabric record.
   - What's unclear: During chart creation, the Project doesn't exist yet. Fabric linking may need to happen after project creation, as a second step.
   - Recommendation: In `createChart` action, after creating the chart+project, update the fabric's `linkedProjectId`. In `updateChart`, handle both linking a new fabric and unlinking the old one.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STOR-01 | Create/rename/delete storage locations | unit | `npx vitest run src/lib/actions/storage-location-actions.test.ts -x` | Wave 0 |
| STOR-01 | Storage location list UI interactions | unit | `npx vitest run src/components/features/storage/storage-location-list.test.tsx -x` | Wave 0 |
| STOR-02 | Storage location detail page | unit | `npx vitest run src/components/features/storage/storage-location-detail.test.tsx -x` | Wave 0 |
| STOR-03 | Assign storage/app via dropdown | unit | `npx vitest run src/components/features/charts/sections/project-setup-section.test.tsx -x` | Wave 0 |
| STOR-04 | Create/rename/delete stitching apps | unit | `npx vitest run src/lib/actions/stitching-app-actions.test.ts -x` | Wave 0 |
| STOR-04 | Stitching app list UI interactions | unit | `npx vitest run src/components/features/apps/stitching-app-list.test.tsx -x` | Wave 0 |
| PROJ-01 | Fabric selector shows unassigned fabrics | unit | `npx vitest run src/components/features/charts/sections/project-setup-section.test.tsx -x` | Wave 0 |
| PROJ-02 | Cover image uses object-contain | unit | `npx vitest run src/components/features/charts/form-primitives/cover-image-upload.test.tsx -x` | Wave 0 |
| SUPP-02 | Thread picker scrollIntoView | unit | `npx vitest run src/components/features/supplies/search-to-add.test.tsx -x` | Wave 0 |
| SUPP-03 | DMC catalog completeness | unit | `npx vitest run prisma/fixtures/dmc-threads.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/actions/storage-location-actions.test.ts` -- covers STOR-01
- [ ] `src/lib/actions/stitching-app-actions.test.ts` -- covers STOR-04
- [ ] `src/components/features/storage/storage-location-list.test.tsx` -- covers STOR-01, STOR-02
- [ ] `src/components/features/storage/storage-location-detail.test.tsx` -- covers STOR-02
- [ ] `src/components/features/apps/stitching-app-list.test.tsx` -- covers STOR-04
- [ ] `src/components/features/apps/stitching-app-detail.test.tsx` -- covers STOR-04
- [ ] `src/components/features/charts/sections/project-setup-section.test.tsx` -- covers STOR-03, PROJ-01 (test may partially exist, needs expansion)
- [ ] `src/components/features/charts/form-primitives/cover-image-upload.test.tsx` -- covers PROJ-02 (test may partially exist, needs expansion)
- [ ] `src/components/features/supplies/search-to-add.test.tsx` -- covers SUPP-02 (test may partially exist, needs expansion)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- no new auth flows |
| V3 Session Management | no | N/A -- no session changes |
| V4 Access Control | yes | `requireAuth()` on all new server actions [VERIFIED: established pattern] |
| V5 Input Validation | yes | Zod schemas at server action boundaries [VERIFIED: established pattern] |
| V6 Cryptography | no | N/A -- no crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized CRUD on storage/app entities | Elevation of Privilege | `requireAuth()` guard on every server action |
| Name injection (XSS via entity names) | Tampering | React escapes output by default; Zod `.trim()` + `.max()` limits input |
| Mass deletion via ID enumeration | Tampering | `requireAuth()` + single-user app (low risk) |
| Fabric linking to wrong project | Tampering | Server-side validation that fabric is unassigned before linking |

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- Prisma schema, existing server actions, components, design files all directly examined
- **DesignOS references** -- StorageLocationList.tsx, StorageLocationDetail.tsx, storage.png, types.ts
- **CONTEXT.md decisions** -- All 10 locked decisions verified against codebase feasibility

### Secondary (MEDIUM confidence)
- [dmc.crazyartzone.com](https://dmc.crazyartzone.com/) -- DMC-to-RGB conversion chart, used for hex colors of DMC 1-35
- [cyberstitchers.com](https://www.cyberstitchers.com/stitching_tools/floss_checklist) -- DMC floss checklist confirming thread numbering ranges

### Tertiary (LOW confidence)
- DMC ColorFamily assignments for threads 1-35 -- based on hex value analysis, not official DMC categorization [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all patterns established in prior phases
- Architecture: HIGH -- exact template exists in designers/genres, DesignOS design spec exists
- Pitfalls: HIGH -- identified from direct codebase analysis of all affected files
- DMC data: MEDIUM -- hex values verified from web source, but ColorFamily assignments are assumed

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable -- no external dependencies changing)
