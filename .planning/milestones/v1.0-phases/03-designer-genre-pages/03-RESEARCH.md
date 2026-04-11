# Phase 3: Designer & Genre Pages - Research

**Researched:** 2026-04-07
**Domain:** CRUD management pages (list + detail + forms) for Designer and Genre entities
**Confidence:** HIGH

## Summary

Phase 3 adds dedicated management pages for Designers and Genres -- entities that already exist in the database and have basic create/list server actions from Phase 2. The work involves: (1) extending the Prisma schema (add `notes` field to Designer), (2) extending server actions with update/delete/getById operations and computed stats, (3) building list pages with sortable tables, search, and modal forms, (4) building detail pages at `/designers/[id]` and `/genres/[id]` with associated charts, (5) adding sidebar navigation items, and (6) wiring delete with confirmation dialogs.

This phase is architecturally straightforward because all patterns are already established: Server Component pages with data fetching, Client Components for interactivity, server actions with requireAuth + Zod validation, Dialog components for modals, and ID-based dynamic routes. The DesignOS reference provides a complete visual spec for the designer page; genre pages mirror the same pattern with fewer columns.

**Primary recommendation:** Follow the existing Phase 2 patterns exactly -- Server Component pages, client-side sortable tables, modal forms using existing Dialog/FormField primitives, and server actions with Zod validation. Extend `_count` in Prisma queries for computed stats rather than separate queries.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Genre management page mirrors the designer page layout -- sortable table with columns for name and chart count, search bar, modal forms for create/edit
- **D-02:** Genre table supports sorting by name and chart count (clickable column headers), consistent with the designer page
- **D-03:** Genre search bar included for consistency with designer page, even though the list is smaller
- **D-04:** Genre model stays as name-only (no description or color field) -- genres are simple tags
- **D-05:** Genre creation and editing both use modal forms, consistent with the inline designer dialog pattern already built in Phase 2
- **D-06:** Designer and genre detail views are full pages (not modals), at `/designers/[id]` and `/genres/[id]` -- bookmarkable URLs and more room for content. This deviates from the DesignOS DesignerDetailModal design.
- **D-07:** Detail pages show computed stats: chart count, projects started, projects finished, top genre (for designers). Genre detail shows chart count.
- **D-08:** Edit is triggered via an edit button on the detail page, opening a modal form with pre-filled fields
- **D-09:** Chart names in the detail page table link to the chart detail page (`/charts/[id]`)
- **D-10:** Rich chart rows on detail pages -- cover thumbnail, chart name, status badge, stitch count, and size category. Matches the DesignerChart type from the design reference.
- **D-11:** Designers and Genres get their own top-level sidebar items, positioned below Charts
- **D-12:** ID-based URLs: `/designers/[id]`, `/genres/[id]` -- consistent with `/charts/[id]` pattern, no slug generation needed
- **D-13:** Deleting a designer unlinks associated charts (sets designerId to null) -- no data loss, charts keep existing
- **D-14:** Deleting a genre removes the tag from associated charts (many-to-many disconnect) -- charts keep other genre tags
- **D-15:** Delete confirmation dialogs show a warning with the affected chart count (e.g., "15 charts will be unlinked")
- **D-16:** Add a `notes` field (optional free-text) to the Designer model for personal reference (e.g., "Only sells through distributors", "Retired -- OOP charts")
- **D-17:** Genre model stays as-is (name only, no notes field)

### Claude's Discretion
- Empty state design for no designers/genres yet
- Inline designer dialog sync with management page form/validation
- Exact table column widths and responsive breakpoints
- Loading/error states for detail pages
- Cover thumbnail sizing in chart list rows
- Sort direction defaults (A-Z for names, high-to-low for counts)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROJ-06 | User can create, edit, and delete designers and link them to projects | Extend existing designer-actions.ts with update/delete/getById; add notes field to schema; build list page with sortable table and modal forms; build detail page at /designers/[id] |
| PROJ-07 | User can create, edit, and manage genre tags and apply them to projects | Extend existing genre-actions.ts with update/delete/getById; build list page mirroring designer pattern; build detail page at /genres/[id] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Server Components by default -- "use client" only for interactivity
- Zod validation at boundaries -- server actions, API routes
- Prisma schema is source of truth -- run `prisma generate` after changes
- Calculated fields at query time -- never stored in DB
- Colocated tests -- `foo.test.tsx` next to `foo.tsx`
- Import test utils from `@/__tests__/test-utils` -- not `@testing-library/react`
- Prettier handles formatting
- Pin exact versions in package.json
- TDD mandatory -- tests before implementation
- Do NOT use `Button render={<Link>}` -- use `LinkButton` for navigation
- Do NOT nest `<form>` elements
- Use semantic design tokens (bg-card, border-border, text-muted-foreground)
- `buttonVariants` must be imported from `button-variants.ts` in Server Components
- Always read DesignOS reference before building UI

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| Next.js | 16.2.2 | App Router, Server Components, dynamic routes | [VERIFIED: package.json] |
| Prisma | 7.6.0 | ORM, schema migrations, `_count` for relation counts | [VERIFIED: package.json] |
| Zod | 3.24.4 | Schema validation at action boundaries | [VERIFIED: package.json] |
| @base-ui/react | 1.3.0 | Dialog primitives via shadcn/ui wrapper | [VERIFIED: package.json] |
| lucide-react | 1.7.0 | Icons (Search, Plus, Pencil, Trash2, ExternalLink, Users, Palette, ChevronUp, ChevronDown) | [VERIFIED: package.json] |
| sonner | 2.0.7 | Toast notifications for mutation feedback | [VERIFIED: package.json] |

### No New Dependencies

This phase requires **zero new packages**. All needed UI primitives (Dialog, Input, Textarea, Button, LinkButton), icons, validation, and data access are already available.

## Architecture Patterns

### New Route Structure
```
src/app/(dashboard)/
  designers/
    page.tsx                   # Server Component — list page
    [id]/
      page.tsx                 # Server Component — detail page
  genres/
    page.tsx                   # Server Component — list page
    [id]/
      page.tsx                 # Server Component — detail page
```

### New Component Structure
```
src/components/features/
  designers/
    designer-list.tsx          # Client — sortable table + search + modals
    designer-list.test.tsx
    designer-detail.tsx        # Client — detail view with chart list + edit/delete
    designer-detail.test.tsx
    designer-form-modal.tsx    # Client — create/edit modal form
    designer-form-modal.test.tsx
    delete-confirmation-dialog.tsx  # Client — shared delete confirm
    delete-confirmation-dialog.test.tsx
  genres/
    genre-list.tsx             # Client — sortable table + search + modals
    genre-list.test.tsx
    genre-detail.tsx           # Client — detail view with chart list
    genre-detail.test.tsx
    genre-form-modal.tsx       # Client — create/edit modal form
    genre-form-modal.test.tsx
```

### New Server Actions and Validations
```
src/lib/actions/
  designer-actions.ts          # Extend: updateDesigner, deleteDesigner, getDesigner, getDesignersWithStats
  genre-actions.ts             # Extend: updateGenre, deleteGenre, getGenre, getGenresWithStats
src/lib/validations/
  chart.ts                     # Extend: designerSchema with notes field; add designerUpdateSchema, genreUpdateSchema
```

### Pattern 1: Server Component Page with Client List
**What:** Page.tsx (Server Component) fetches data and passes to client list component [VERIFIED: matches charts/page.tsx pattern]
**When to use:** Every list and detail page
**Example:**
```typescript
// src/app/(dashboard)/designers/page.tsx (Server Component)
import { getDesignersWithStats } from "@/lib/actions/designer-actions";
import { DesignerList } from "@/components/features/designers/designer-list";

export default async function DesignersPage() {
  const designers = await getDesignersWithStats();
  return <DesignerList designers={designers} />;
}
```

### Pattern 2: Prisma _count for Computed Stats
**What:** Use Prisma `include: { _count: { select: { charts: true } } }` to get relation counts without separate queries [VERIFIED: Prisma 7 generated types include DesignerCountOutputType with charts field]
**When to use:** List pages needing chart counts, detail pages needing stats
**Example:**
```typescript
// In designer-actions.ts
const designers = await prisma.designer.findMany({
  include: { _count: { select: { charts: true } } },
  orderBy: { name: "asc" },
});
// Each designer has designer._count.charts: number
```

### Pattern 3: Computed Stats via Prisma Queries
**What:** For designer detail stats (projectsStarted, projectsFinished, topGenre), query through the Chart->Project relation [VERIFIED: schema shows Chart has project relation]
**When to use:** Designer detail page stats (D-07)
**Example:**
```typescript
// getDesigner action — single query with nested includes
const designer = await prisma.designer.findUnique({
  where: { id },
  include: {
    _count: { select: { charts: true } },
    charts: {
      include: {
        project: { select: { status: true } },
        genres: { select: { name: true } },
      },
      select: {
        id: true,
        name: true,
        coverThumbnailUrl: true,
        stitchCount: true,
        stitchesWide: true,
        stitchesHigh: true,
        project: { select: { status: true, stitchesCompleted: true } },
        genres: { select: { name: true } },
      },
    },
  },
});
// Compute projectsStarted, projectsFinished, topGenre in JS from charts data
```

### Pattern 4: Delete with Unlink (D-13, D-14)
**What:** Designer delete sets `designerId` to null on charts. Genre delete disconnects from many-to-many. [VERIFIED: schema shows Chart.designerId is optional (String?) and genres is implicit many-to-many]
**When to use:** Delete operations
**Example:**
```typescript
// Designer delete — Prisma's onDelete is not set, so manually unlink
await prisma.$transaction([
  prisma.chart.updateMany({
    where: { designerId: id },
    data: { designerId: null },
  }),
  prisma.designer.delete({ where: { id } }),
]);

// Genre delete — disconnect from charts, then delete
await prisma.$transaction([
  prisma.genre.update({
    where: { id },
    data: { charts: { set: [] } }, // disconnect all
  }),
  prisma.genre.delete({ where: { id } }),
]);
```

### Pattern 5: Sortable Table (Client Component)
**What:** Client-side sorting with clickable column headers, following DesignerPage.tsx design reference [VERIFIED: DesignOS reference uses useState + useMemo for sort/filter]
**When to use:** Designer and genre list pages
**Key decisions:**
- Sort state: `{ key: string; dir: 'asc' | 'desc' }` in useState
- Default: name ascending (A-Z) for both designers and genres
- Filtering: client-side text search on name field
- No server-side sorting needed (single-user app, datasets are small)

### Pattern 6: Modal Form with Controlled State
**What:** Dialog component wrapping a form with controlled inputs, pre-filled for edit mode [VERIFIED: matches InlineDesignerDialog pattern already in codebase]
**When to use:** Create and edit modals for designers and genres
**Key points:**
- Reuse existing Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter from `src/components/ui/dialog.tsx`
- Reuse FormField from `src/components/features/charts/form-primitives/form-field.tsx`
- Use Input from `src/components/ui/input.tsx` and Textarea from `src/components/ui/textarea.tsx`
- Call server actions directly, handle errors in try/catch
- Use `useTransition` for pending state during mutations

### Anti-Patterns to Avoid
- **Don't add genres to nav-items as a sub-item of Charts** -- D-11 says top-level sidebar items for both Designers and Genres, positioned below Charts
- **Don't use `render` prop on Button for Link** -- Use `LinkButton` per project rules (base-ui-patterns.md)
- **Don't store computed stats (chart count, topGenre) in the database** -- CLAUDE.md: "Calculated fields at query time"
- **Don't create new Dialog variants** -- reuse existing shadcn/ui Dialog components
- **Don't build separate API routes** -- use server actions for all mutations, consistent with Phase 2
- **Don't use server-side sorting/pagination** -- dataset is small (single user, likely <100 designers), client-side is simpler and faster
- **Don't nest forms** -- the delete confirmation dialog inside a detail page must not nest `<form>` elements

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialogs | Custom portal/overlay | `Dialog`/`DialogContent` from `src/components/ui/dialog.tsx` | Accessibility, focus trap, backdrop, animations already handled |
| Form field layout | Custom label+input+error wrapper | `FormField` from `src/components/features/charts/form-primitives/form-field.tsx` | Consistent error display, accessibility labels |
| Status badges | New badge component | `StatusBadge` from `src/components/features/charts/status-badge.tsx` | Already matches design system |
| Size category | Manual size string | `SizeBadge` from `src/components/features/charts/size-badge.tsx` | Consistent color coding |
| Toast notifications | Custom notification system | `toast` from `sonner` (already installed and used) | Consistent UX |
| Navigation link-button | `Button render={<Link>}` | `LinkButton` from `src/components/ui/link-button.tsx` | Avoids hydration mismatch |

**Key insight:** Phase 3 has no novel UI primitives. Everything builds on Phase 2's component library. The work is composition, not creation.

## Schema Migration

### Designer Model Change (D-16)
Add optional `notes` field to the Designer model:

```prisma
model Designer {
  id        String   @id @default(cuid())
  name      String   @unique
  website   String?
  notes     String?          // NEW: optional free-text notes
  charts    Chart[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

[VERIFIED: current schema in prisma/schema.prisma does not have notes field on Designer]

**Migration command:** `npx prisma migrate dev --name add-designer-notes`

### Genre Model (D-17)
No schema changes. Genre stays as name-only. [VERIFIED: current schema matches decision]

## Validation Schema Extensions

### Designer Schema Update
```typescript
// Extend existing designerSchema in src/lib/validations/chart.ts
export const designerSchema = z.object({
  name: z.string().trim().min(1, "Designer name is required").max(200, "Designer name too long"),
  website: z.string().url("Must be a valid URL").nullable().default(null),
  notes: z.string().max(5000, "Notes too long").nullable().default(null),  // NEW
});
```
[VERIFIED: current designerSchema only has name and website fields]

### Genre Schema
No changes needed -- genreSchema already has name with trim+min validation. [VERIFIED: current genreSchema is correct as-is]

## Revalidation Strategy

Server actions that mutate designers/genres need to revalidate relevant paths:

| Action | Paths to Revalidate | Reason |
|--------|---------------------|--------|
| createDesigner | `/designers` | New item in list |
| updateDesigner | `/designers`, `/designers/[id]` | List and detail both stale |
| deleteDesigner | `/designers`, `/charts` | List changes, charts may lose designer link |
| createGenre | `/genres` | New item in list |
| updateGenre | `/genres`, `/genres/[id]` | List and detail both stale |
| deleteGenre | `/genres`, `/charts` | List changes, charts may lose genre tag |

[VERIFIED: chart-actions.ts already uses revalidatePath pattern from next/cache]

## Sidebar Navigation Extension

Add two items to `src/components/shell/nav-items.ts` after "Charts":

```typescript
import { Paintbrush, Tags } from "lucide-react"; // or Palette, Tag

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Charts", href: "/charts", icon: Scissors },
  { label: "Designers", href: "/designers", icon: Paintbrush },  // NEW
  { label: "Genres", href: "/genres", icon: Tags },               // NEW
  { label: "Supplies", href: "/supplies", icon: Package },
  // ... rest
];
```

[VERIFIED: nav-items.ts currently has 7 items, Designers and Genres not present]

**Icon choice (Claude's discretion):** `Paintbrush` for designers (creative/artisan connotation), `Tags` for genres (labeling/categorization). Both available in lucide-react 1.7.0. [ASSUMED: icon names exist in lucide-react -- verify at implementation time]

## Common Pitfalls

### Pitfall 1: Prisma _count With Select
**What goes wrong:** Using both `include` and `select` in the same query level causes Prisma to error.
**Why it happens:** Prisma 7 doesn't allow mixing `include` and `select` at the same level.
**How to avoid:** Use either `include` (adds to all fields) or `select` (picks specific fields) at each level. For the list query, `include: { _count: { select: { charts: true } } }` works because `_count` is in `include`. For the detail query with specific chart fields, use nested `select` within `include.charts.select`. [VERIFIED: Prisma docs pattern]
**Warning signs:** TypeScript error about `include` and `select` being mutually exclusive.

### Pitfall 2: Unique Constraint on Designer/Genre Names
**What goes wrong:** Creating a designer or genre with a duplicate name hits Prisma unique constraint error (P2002).
**Why it happens:** Both Designer.name and Genre.name have `@unique` in schema. [VERIFIED: prisma/schema.prisma]
**How to avoid:** Catch Prisma P2002 errors in server actions and return user-friendly messages like "A designer with that name already exists."
**Warning signs:** Unhandled PrismaClientKnownRequestError with code P2002.

### Pitfall 3: Delete Race Condition
**What goes wrong:** If a user is viewing a designer detail page while another tab deletes it, the page shows an error.
**Why it happens:** Server component fetched stale data.
**How to avoid:** Use `notFound()` in the detail page when `getDesigner` returns null (same as chart detail page pattern). [VERIFIED: charts/[id]/page.tsx uses this pattern]
**Warning signs:** Blank page or unhandled error after deletion.

### Pitfall 4: Dialog Form State Persistence
**What goes wrong:** Opening a dialog to edit designer A, closing without saving, then opening to edit designer B shows designer A's data.
**Why it happens:** React state persists between dialog opens if the component isn't unmounted.
**How to avoid:** Reset form state when dialog opens using a `useEffect` keyed on the entity being edited (same pattern as InlineDesignerDialog). [VERIFIED: inline-designer-dialog.tsx handles this with prevOpenRef]
**Warning signs:** Stale form data visible when opening edit dialogs.

### Pitfall 5: Prisma Transaction for Delete+Unlink
**What goes wrong:** Deleting a designer without first unlinking charts causes a foreign key constraint error.
**Why it happens:** Charts reference designerId, and Prisma has no cascade delete configured on the Designer->Chart relation. [VERIFIED: schema shows no onDelete on Chart.designer relation]
**How to avoid:** Use `prisma.$transaction()` to first `updateMany` charts to null designerId, then delete the designer.
**Warning signs:** PrismaClientKnownRequestError about foreign key constraint.

### Pitfall 6: Server Component vs Client Component Boundary
**What goes wrong:** Trying to use hooks (useState, useTransition) in a Server Component page.tsx.
**Why it happens:** The sortable table, search, and modal state require client-side interactivity.
**How to avoid:** Keep page.tsx as Server Components (data fetching only). Pass data as props to "use client" list/detail components that handle all interactivity. [VERIFIED: this is the established pattern in charts/page.tsx]
**Warning signs:** "useState can only be used in a Client Component" error.

## Code Examples

### Server Action: getDesignersWithStats
```typescript
// Source: Pattern derived from existing designer-actions.ts + Prisma _count
// [VERIFIED: _count.charts exists in Prisma generated types]
"use server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export type DesignerWithStats = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  chartCount: number;
};

export async function getDesignersWithStats(): Promise<DesignerWithStats[]> {
  await requireAuth();
  try {
    const designers = await prisma.designer.findMany({
      include: { _count: { select: { charts: true } } },
      orderBy: { name: "asc" },
    });
    return designers.map((d) => ({
      id: d.id,
      name: d.name,
      website: d.website,
      notes: d.notes,
      chartCount: d._count.charts,
    }));
  } catch (error) {
    console.error("getDesignersWithStats error:", error);
    return [];
  }
}
```

### Server Action: deleteDesigner
```typescript
// Source: Pattern from chart-actions.ts deleteChart + transaction for unlink
// [VERIFIED: Chart.designerId is nullable String?]
export async function deleteDesigner(id: string) {
  await requireAuth();
  try {
    const designer = await prisma.designer.findUnique({
      where: { id },
      include: { _count: { select: { charts: true } } },
    });
    if (!designer) {
      return { success: false as const, error: "Designer not found" };
    }
    await prisma.$transaction([
      prisma.chart.updateMany({
        where: { designerId: id },
        data: { designerId: null },
      }),
      prisma.designer.delete({ where: { id } }),
    ]);
    revalidatePath("/designers");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteDesigner error:", error);
    return { success: false as const, error: "Failed to delete designer" };
  }
}
```

### Server Action: updateDesigner
```typescript
// Source: Pattern from chart-actions.ts updateChart
export async function updateDesigner(id: string, formData: unknown) {
  await requireAuth();
  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/designers");
    revalidatePath(`/designers/${id}`);
    return { success: true as const, designer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false as const, error: "A designer with that name already exists" };
    }
    console.error("updateDesigner error:", error);
    return { success: false as const, error: "Failed to update designer" };
  }
}
```

### Delete Confirmation Dialog Pattern
```typescript
// Source: Adapted from chart-detail.tsx DeleteChartDialog
// [VERIFIED: uses existing Dialog components]
"use client";
import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({
  open, onOpenChange, title, description, onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DesignerDetailModal (DesignOS design) | Full detail page at /designers/[id] | D-06 decision | More room for content, bookmarkable URLs |
| Prisma include for counts | Prisma _count select | Prisma 4+ | Efficient single query for relation counts |
| Client-side fetch for mutations | Server actions with revalidatePath | Next.js 14+ | No API routes needed, automatic cache invalidation |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Paintbrush` and `Tags` icons exist in lucide-react 1.7.0 | Sidebar Navigation Extension | Low -- easy to swap icons at implementation |
| A2 | Prisma $transaction with array syntax works in Prisma 7.6.0 | Pattern 4: Delete with Unlink | Medium -- if API changed, would need sequential awaits instead |
| A3 | Prisma P2002 error code for unique constraint unchanged in v7 | Pitfall 2 | Low -- well-established Prisma error code |

## Open Questions

1. **InlineDesignerDialog sync (Claude's discretion)**
   - What we know: InlineDesignerDialog in chart form creates designers. The new designer management page also creates designers via a modal.
   - What's unclear: Should the inline dialog validation be updated to include notes, or keep it simple (name+website only)?
   - Recommendation: Keep InlineDesignerDialog as-is (name+website) since it's for quick creation from the chart form. Notes can be added later from the designer management page. No code changes needed to the existing dialog.

2. **Empty state design (Claude's discretion)**
   - What we know: Charts page has a detailed empty state with a cross-stitch grid pattern.
   - What's unclear: Should designers/genres empty states be equally elaborate?
   - Recommendation: Simpler empty states -- icon + "No designers yet" text + "Add Designer" button. These are secondary pages, not the main entry point.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified) -- this phase is purely code/config changes using already-installed packages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vitest.config.ts) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROJ-06a | createDesigner with notes field | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "create"` | Partial (exists but needs notes test) |
| PROJ-06b | updateDesigner validates and persists | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "update"` | No -- Wave 0 |
| PROJ-06c | deleteDesigner unlinks charts | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "delete"` | No -- Wave 0 |
| PROJ-06d | getDesignersWithStats returns computed counts | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "stats"` | No -- Wave 0 |
| PROJ-06e | Designer list renders table with sort/search | unit | `npx vitest run src/components/features/designers/designer-list.test.tsx` | No -- Wave 0 |
| PROJ-06f | Designer form modal validates and submits | unit | `npx vitest run src/components/features/designers/designer-form-modal.test.tsx` | No -- Wave 0 |
| PROJ-06g | Designer detail shows stats and charts | unit | `npx vitest run src/components/features/designers/designer-detail.test.tsx` | No -- Wave 0 |
| PROJ-07a | updateGenre validates and persists | unit | `npx vitest run src/lib/actions/genre-actions.test.ts -t "update"` | No -- Wave 0 |
| PROJ-07b | deleteGenre disconnects from charts | unit | `npx vitest run src/lib/actions/genre-actions.test.ts -t "delete"` | No -- Wave 0 |
| PROJ-07c | Genre list renders table with sort/search | unit | `npx vitest run src/components/features/genres/genre-list.test.tsx` | No -- Wave 0 |
| PROJ-07d | Genre form modal validates and submits | unit | `npx vitest run src/components/features/genres/genre-form-modal.test.tsx` | No -- Wave 0 |
| PROJ-07e | Genre detail shows stats and charts | unit | `npx vitest run src/components/features/genres/genre-detail.test.tsx` | No -- Wave 0 |
| AUTH | All new actions reject unauthenticated calls | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "auth"` | Partial |
| UNIQUE | Duplicate name returns friendly error | unit | `npx vitest run src/lib/actions/designer-actions.test.ts -t "duplicate"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Extend `src/__tests__/mocks/factories.ts` -- add `createMockDesignerWithStats`, `createMockGenreWithStats`, `createMockDesignerChart` factories
- [ ] Extend `src/__tests__/mocks/factories.ts` -- add `designer.findUnique`, `designer.update`, `designer.delete`, `genre.findUnique`, `genre.update`, `genre.delete`, `chart.updateMany` to `createMockPrisma()`
- [ ] Framework install: none needed -- Vitest already configured

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` guard on every server action |
| V3 Session Management | no | Handled by Auth.js middleware (Phase 1) |
| V4 Access Control | yes | All queries scoped to authenticated user |
| V5 Input Validation | yes | Zod schemas at server action boundary |
| V6 Cryptography | no | No new crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized CRUD on designers/genres | Elevation of Privilege | `requireAuth()` in every action [VERIFIED: existing pattern] |
| Zod bypass via malformed input | Tampering | `.parse()` on unknown input [VERIFIED: existing pattern] |
| XSS via designer name/notes | Tampering | React auto-escapes JSX output; Zod max-length prevents extreme payloads |
| IDOR on designer/genre IDs | Information Disclosure | Single-user app mitigates risk; all designers/genres belong to the user implicitly |
| Mass deletion via ID enumeration | Denial of Service | Auth guard prevents unauthenticated access; single-user mitigates |

**Note:** This is a single-user app with credentials auth, so IDOR risk is minimal. The `requireAuth()` guard is sufficient. No per-user scoping is needed on designers/genres because there is only one user.

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` -- current Designer, Genre, Chart models verified
- `src/lib/actions/designer-actions.ts` -- existing create/list pattern verified
- `src/lib/actions/genre-actions.ts` -- existing create/list pattern verified
- `src/lib/validations/chart.ts` -- existing designerSchema and genreSchema verified
- `src/components/features/charts/inline-designer-dialog.tsx` -- modal form pattern verified
- `src/components/features/charts/chart-detail.tsx` -- detail page pattern verified
- `src/app/(dashboard)/charts/page.tsx` -- list page pattern verified
- `src/app/(dashboard)/charts/[id]/page.tsx` -- dynamic route pattern verified
- `src/components/shell/nav-items.ts` -- navigation structure verified
- `src/generated/prisma/models/Designer.ts` -- _count type exists (DesignerCountOutputType)
- `src/generated/prisma/models/Genre.ts` -- _count type exists (GenreCountOutputType)
- `product-plan/sections/fabric-series-and-reference-data/` -- DesignOS reference components and types verified
- `product-plan/sections/fabric-series-and-reference-data/designer.png` -- visual design verified

### Secondary (MEDIUM confidence)
- Prisma $transaction array syntax -- well-established pattern across Prisma versions [ASSUMED: works in 7.6.0]
- Prisma P2002 error code for unique constraints [ASSUMED: unchanged in v7]

### Tertiary (LOW confidence)
- lucide-react icon names (Paintbrush, Tags) -- [ASSUMED: available in 1.7.0, verify at implementation]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all verified in package.json
- Architecture: HIGH -- follows established patterns from Phases 1-2, all verified in codebase
- Pitfalls: HIGH -- all derived from verified schema constraints and existing code patterns
- Validation: HIGH -- test infrastructure verified, factories exist and need minor extension

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable -- no dependency changes expected)
