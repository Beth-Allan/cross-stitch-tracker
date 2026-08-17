# Phase 8: Session Logging & Pattern Dive - Research

**Researched:** 2026-04-16
**Domain:** Full-stack CRUD (new data model + modal + tabs + data migration)
**Confidence:** HIGH

## Summary

Phase 8 delivers two distinct feature areas: (1) stitch session logging with automatic progress tracking, and (2) the Pattern Dive tabbed browsing experience. Both build heavily on established project patterns -- server actions with `requireAuth()` + Zod validation, nuqs URL state, Base UI tabs/dialog components, and R2 presigned uploads.

The session logging side introduces the first new Prisma model (`StitchSession`) since the supply models, requires `$transaction` for atomic progress recalculation (a pattern already used in chart-actions and supply-actions), a one-time data migration for `startingStitches`, and conditional read-only behavior on `EditableNumber`. The Pattern Dive side wraps the existing `ProjectGallery` as the Browse tab and adds three new data-view tabs, all eagerly fetched via `Promise.all()` in the server component.

**Primary recommendation:** Structure plans around two independent workstreams (sessions infrastructure + Pattern Dive tabs) that converge only at integration points (TopBar button, project detail page). The data model and server actions should be built first since Pattern Dive's What's Next tab depends on session-derived progress data.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Primary "Log Stitches" button lives in the TopBar as an always-visible emerald button next to the user menu. Opens the LogSessionModal overlay from anywhere in the app.
- **D-02:** When logging from project detail, the modal pre-fills the project and hides the project picker (locked to that project). When logging from TopBar or Sessions page, the full project picker is shown.
- **D-03:** The Sessions page (`/sessions`) is a global chronological session log showing all sessions across all projects, with a project name column and a Log button. Not just a landing page.
- **D-04:** `stitchesCompleted` is recalculated from sessions: `stitchesCompleted = startingStitches + sum(all session stitchCounts)`. The recalculation is wrapped in a `$transaction` with the session mutation (create/edit/delete) to stay atomic.
- **D-05:** One-time data migration: for projects where `stitchesCompleted > 0` and no sessions exist, copy `stitchesCompleted` to `startingStitches` so progress doesn't reset when session logging begins.
- **D-06:** Progress (stitchesCompleted) becomes read-only on the project detail page once sessions exist for that project. `startingStitches` remains editable for manual adjustments. Projects with no sessions retain the existing EditableNumber behavior.
- **D-07:** What's Next tab shows only Unstarted and Kitted projects. Kitting status (still gathering supplies) is excluded -- this is a "ready to stitch" view.
- **D-08:** Ranking logic: (1) `wantToStartNext = true` flagged projects pinned to top, (2) kitting completeness % descending (supplies acquired / required), (3) `dateAdded` ascending (oldest first). No priorityRanking number -- that depends on v1.3 goals.
- **D-09:** Existing `ProjectGallery` component wraps into the Browse tab unchanged. New tab navigation is added above it. Minimize changes to working gallery code.
- **D-10:** All four tab datasets fetched eagerly via `Promise.all()` in the server component page.tsx. Tab switching is instant with no loading spinners. Dataset is small (500 charts).
- **D-11:** Pattern Dive tabs use URL-persisted state with nuqs (`?tab=whats-next`), same pattern as existing ProjectTabs. Default tab is Browse.
- **D-12:** Nav label changes from "Projects" to "Pattern Dive". URL stays `/charts`. Page header becomes "Pattern Dive" with subtitle "Explore your collection, plan what's next, and find the right fabric".

### Claude's Discretion
- StitchSession model field names and types (following existing Prisma conventions)
- Session photo upload implementation details (reusing existing R2 presigned URL pattern)
- Fabric Requirements tab calculation details (3" margin formula from design reference)
- Storage View tab grouping implementation
- Empty state messaging for tabs with no data
- Sort options within each tab (follow design reference patterns)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SESS-01 | User can log a stitch session with date, project, stitch count, and optional time/photo | LogSessionModal design reference, StitchSession model, Zod schema, session server actions, R2 upload pattern |
| SESS-02 | User can access the Log Session modal from the header button, project detail, and dashboard | TopBar integration (existing toast placeholder), ProjectTabs Sessions tab, Dialog component |
| SESS-03 | User can view per-project session history with mini stats | ProjectSessionsTab design reference, aggregate queries, mini-stat card spec from UI-SPEC |
| SESS-04 | User can edit or delete an existing session | LogSessionModal edit mode, two-step delete confirmation, $transaction for atomic progress recalc |
| SESS-05 | Project progress auto-updates when sessions are created, edited, or deleted | $transaction pattern (already used in chart-actions/supply-actions), D-04 recalculation formula |
| SESS-06 | User can upload a progress photo with a session | R2 presigned URL pattern (upload-actions.ts), new "sessions" category in upload schema |
| PDIV-01 | Charts page renamed to "Pattern Dive" in navigation | nav-items.ts label change, page header update |
| PDIV-02 | Existing gallery becomes Browse tab with tab navigation | ProjectGallery wrapped unchanged, nuqs tab state, Pattern Dive tab infrastructure |
| PDIV-03 | What's Next tab showing kitting readiness ranking | D-07/D-08 ranking logic, kitting % calculation from supply junction tables |
| PDIV-04 | Fabric Requirements tab with stash matching | 3" margin formula, Fabric model matching logic, assign fabric action |
| PDIV-05 | Storage View tab grouped by storage location | StorageLocation grouping query, collapsible groups |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| StitchSession CRUD | API / Backend (server actions) | -- | Auth guard + Zod validation + atomic $transaction |
| Progress recalculation (D-04) | API / Backend (server actions) | Database | Sum aggregate + update wrapped in $transaction |
| Data migration (D-05) | Database | API / Backend | One-time SQL/script migration for startingStitches |
| LogSessionModal UI | Frontend Client | -- | Interactive form with state, project picker, file upload |
| Session photo upload | Frontend Client | API / Backend (presigned URL) | Client uploads to R2 via presigned URL, server confirms |
| Pattern Dive tabs | Frontend Client | Frontend Server (SSR) | nuqs URL state is client-side; data fetched server-side |
| Tab data fetching (D-10) | Frontend Server (SSR) | Database | Promise.all() in server component page.tsx |
| What's Next ranking | API / Backend | -- | Kitting % calculation from supply junction tables |
| Fabric Requirements matching | API / Backend | -- | Size calculation + fabric query in server action |
| Storage View grouping | API / Backend | -- | GroupBy storage location in server query |
| Nav label rename (D-12) | Frontend Server | -- | Static config change in nav-items.ts |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | App Router framework | [VERIFIED: npm ls] Project framework |
| Prisma | 7.7.0 | ORM with $transaction | [VERIFIED: npm ls] Project ORM, interactive transactions for atomic progress |
| nuqs | 2.8.9 | URL-persisted tab state | [VERIFIED: npm ls] Already used for ProjectTabs, gallery filters |
| @base-ui/react | 1.4.0 | Dialog, Tabs primitives | [VERIFIED: npm ls] shadcn/ui v4 foundation |
| zod | (project dep) | Schema validation | [VERIFIED: codebase] All server actions use Zod |
| lucide-react | (project dep) | Icons | [VERIFIED: codebase] All icons from lucide |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | (project dep) | Toast notifications | Error/success feedback for session CRUD |
| sharp | (project dep) | Image processing | Not needed -- session photos don't need thumbnails |
| @aws-sdk/client-s3 | (project dep) | R2 uploads | Presigned URL generation for session photos |

**No new dependencies needed.** All capabilities are covered by existing packages.

## Architecture Patterns

### System Architecture Diagram

```
User Action (Log Stitches button / Session tab / Sessions page)
    |
    v
LogSessionModal (Client Component)
    |-- [project picker] --> active projects list (passed as prop from server)
    |-- [photo upload] --> getPresignedUploadUrl() --> R2 PUT
    |-- [save] --> createSession() / updateSession() server action
    |                    |
    |                    v
    |             Server Action (requireAuth + Zod validate)
    |                    |
    |                    v
    |             prisma.$transaction {
    |               1. Create/Update/Delete StitchSession
    |               2. Aggregate: sum(stitchCount) WHERE projectId
    |               3. Update project.stitchesCompleted = startingStitches + sum
    |             }
    |                    |
    |                    v
    |             revalidatePath(/charts/[id], /sessions)
    |
    v
Pattern Dive Page (Server Component)
    |
    v
Promise.all([
    getChartsForGallery(),     --> Browse tab data
    getWhatsNextProjects(),     --> What's Next tab data
    getFabricRequirements(),    --> Fabric Requirements tab data
    getStorageGroups(),         --> Storage View tab data
    getPresignedImageUrls(),    --> Resolve R2 keys
])
    |
    v
PatternDiveTabs (Client Component, nuqs URL state)
    |-- Browse tab: <ProjectGallery> (unchanged)
    |-- What's Next tab: <WhatsNextTab>
    |-- Fabric Requirements tab: <FabricRequirementsTab>
    |-- Storage View tab: <StorageViewTab>
```

### Recommended Project Structure

```
prisma/
  schema.prisma              # Add StitchSession model
  migrations/                # D-05 data migration

src/
  lib/
    actions/
      session-actions.ts     # CRUD + progress recalculation
      session-actions.test.ts
      pattern-dive-actions.ts  # What's Next, Fabric Reqs, Storage queries
      pattern-dive-actions.test.ts
    validations/
      session.ts             # Zod schema for session form
      session.test.ts
      upload.ts              # Add "sessions" category (modify existing)
  
  components/features/
    sessions/
      log-session-modal.tsx          # Modal component
      log-session-modal.test.tsx
      project-sessions-tab.tsx       # Per-project session history
      project-sessions-tab.test.tsx
      session-table.tsx              # Shared table for project + global views
      session-table.test.tsx
    charts/
      pattern-dive-tabs.tsx          # Tab navigation wrapper
      pattern-dive-tabs.test.tsx
      whats-next-tab.tsx
      whats-next-tab.test.tsx
      fabric-requirements-tab.tsx
      fabric-requirements-tab.test.tsx
      storage-view-tab.tsx
      storage-view-tab.test.tsx
  
  app/(dashboard)/
    charts/page.tsx              # Evolve into Pattern Dive (server component)
    sessions/page.tsx            # Replace placeholder with real sessions page
```

### Pattern 1: Atomic Progress Recalculation ($transaction)

**What:** Every session mutation (create/edit/delete) recalculates `stitchesCompleted` atomically.
**When to use:** All session CRUD operations.
**Example:**

```typescript
// Source: Existing pattern from chart-actions.ts lines 27-80, adapted for sessions
// D-04 formula: stitchesCompleted = startingStitches + sum(all session stitchCounts)

async function recalculateProgress(tx: PrismaTransactionClient, projectId: string) {
  const result = await tx.stitchSession.aggregate({
    where: { projectId },
    _sum: { stitchCount: true },
  });
  
  const project = await tx.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { startingStitches: true },
  });
  
  await tx.project.update({
    where: { id: projectId },
    data: {
      stitchesCompleted: project.startingStitches + (result._sum.stitchCount ?? 0),
    },
  });
}
```

[VERIFIED: Prisma aggregate `_sum` works inside interactive transactions] [VERIFIED: existing $transaction pattern in chart-actions.ts and supply-actions.ts]

### Pattern 2: nuqs Tab URL State

**What:** Tab selection persisted in URL via nuqs, matching existing ProjectTabs pattern.
**When to use:** Pattern Dive tab navigation, matching `src/components/features/charts/project-detail/project-tabs.tsx`.
**Example:**

```typescript
// Source: Existing pattern from project-tabs.tsx
import { useQueryState, parseAsStringLiteral } from "nuqs";

const PATTERN_DIVE_TABS = ["browse", "whats-next", "fabric", "storage"] as const;
type PatternDiveTab = (typeof PATTERN_DIVE_TABS)[number];

const [tab, setTab] = useQueryState(
  "tab",
  parseAsStringLiteral([...PATTERN_DIVE_TABS]).withDefault("browse"),
);
```

[VERIFIED: nuqs 2.8.9 installed, parseAsStringLiteral pattern used in project-tabs.tsx]

### Pattern 3: Session Photo Upload (reuse R2 pattern)

**What:** Session photos use the same presigned URL flow as cover images.
**When to use:** When user attaches a progress photo to a session.
**Details:**
- Add `"sessions"` to the upload category enum in `src/lib/validations/upload.ts`
- R2 key format: `sessions/{projectId}/{nanoid}-{filename}`
- Store the R2 key in `StitchSession.photoKey`
- Resolve to presigned URL when displaying (same as cover images)
- Category validates as image-only (same rules as "covers")

[VERIFIED: upload-actions.ts pattern, upload.ts validation schema]

### Pattern 4: Global Modal via TopBar

**What:** LogSessionModal opens from TopBar button, replacing the current toast placeholder.
**When to use:** D-01 -- TopBar "Log Stitches" button.
**Details:**
- TopBar currently shows a `Button` with `onClick={() => toast("Coming soon", ...)}` (line 88-93 of top-bar.tsx)
- Replace with state to open LogSessionModal
- TopBar needs: `useState` for modal open, active projects list passed as prop
- The modal needs a way to get active projects -- either passed from layout or fetched on open
- **Recommendation:** Fetch active projects in the dashboard layout server component and pass through TopBar props. This avoids a client-side fetch on every modal open.

[VERIFIED: top-bar.tsx line 88-93 has the toast placeholder]

### Anti-Patterns to Avoid

- **Don't fetch tab data lazily per tab switch (D-10):** All four datasets fetched eagerly via `Promise.all()` in server component. No loading spinners on tab switch.
- **Don't modify ProjectGallery internals (D-09):** Wrap it as-is in the Browse tab. The gallery already manages its own filter/sort/view state via nuqs.
- **Don't store stitchesCompleted separately from sessions (D-04):** Always recalculate from sessions inside the same $transaction. Never update stitchesCompleted independently after sessions exist.
- **Don't use EditableNumber for progress when sessions exist (D-06):** Conditionally render read-only display vs EditableNumber based on session count.
- **Don't rename the `/charts` URL path:** Only the nav label and page header change (D-12). The route stays `/charts`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL-persisted tabs | Custom history.pushState | nuqs `parseAsStringLiteral` | Already used in project-tabs, handles SSR, type-safe |
| Modal dialog | Custom overlay div | Base UI Dialog component | Focus trap, escape handling, backdrop click, a11y |
| Image upload | Custom upload endpoint | Existing R2 presigned URL pattern | Already handles auth, validation, error cases, CORS |
| Toast notifications | Custom notification system | sonner (already installed) | Already integrated, consistent UX |
| Form validation | Manual field checks | Zod schemas | Type-safe, consistent error messages, server+client |
| Atomic DB updates | Manual locking/retries | Prisma `$transaction` | Database-level isolation, rollback on error |
| Tab components | Custom tab implementation | Base UI Tabs (shadcn/ui) | ARIA tab pattern, keyboard nav, existing styled components |

**Key insight:** Every building block for this phase already exists in the project. The session logging feature is a straightforward application of established patterns (server action + Zod + $transaction + Dialog + upload). Pattern Dive tabs are a data-fetching exercise with the existing gallery wrapped in a new tab container.

## Common Pitfalls

### Pitfall 1: nuqs Query Param Collision Between Pattern Dive Tabs and Gallery Filters

**What goes wrong:** Pattern Dive uses `?tab=browse` while ProjectGallery already uses nuqs for `?view=`, `?sort=`, `?search=`, `?status=`, `?size=`. If both share the URL, switching tabs could clear gallery filter state.
**Why it happens:** nuqs manages params independently by key, so there's no collision by default. But if the gallery's `useGalleryFilters` hook runs while the What's Next tab is active, it could cause unnecessary re-renders.
**How to avoid:** Since ProjectGallery is only rendered inside the Browse tab's `TabsContent`, its nuqs hooks only run when that tab is active. This should work out of the box. However, verify that switching away from Browse and back preserves filter state (nuqs persists in URL, so it should).
**Warning signs:** Gallery filters reset when switching tabs, or stale renders on tab switch.

### Pitfall 2: $transaction Timeout on Large Session Histories

**What goes wrong:** Aggregating all sessions for a project inside a transaction could be slow if a project has thousands of sessions.
**Why it happens:** Prisma interactive transactions have a default 5-second timeout. Aggregate + update is fast, but cold Neon connections add latency.
**How to avoid:** The aggregate query is indexed by `projectId` and very fast even at scale (a user might have 1000 sessions per project max). Neon cold start is the real risk -- use the same `Promise.all()` warm-up pattern used elsewhere. Default timeout is sufficient.
**Warning signs:** Transaction timeout errors in production, especially on first request after idle period.

### Pitfall 3: Data Migration (D-05) Overwrites Manual Edits

**What goes wrong:** The one-time migration copies `stitchesCompleted` to `startingStitches`. If a user has already manually set `startingStitches`, this overwrites it.
**Why it happens:** Migration doesn't check if `startingStitches` was previously set by the user.
**How to avoid:** Migration condition should be: `WHERE stitchesCompleted > 0 AND startingStitches = 0 AND NOT EXISTS (SELECT 1 FROM StitchSession WHERE projectId = Project.id)`. This only migrates projects that have progress but no existing `startingStitches` adjustment and no sessions.
**Warning signs:** User's manually entered `startingStitches` values are reset to `stitchesCompleted`.

### Pitfall 4: Upload Category Schema Breaking Existing Uploads

**What goes wrong:** Adding `"sessions"` to the upload category enum changes the Zod schema. If the change isn't additive, existing cover/file uploads break.
**Why it happens:** Zod `z.enum(["covers", "files"])` needs to become `z.enum(["covers", "files", "sessions"])`. This is purely additive and safe.
**How to avoid:** Just add the new value to the enum. Existing callers still pass "covers" or "files" -- no change needed there.
**Warning signs:** Upload tests fail after schema change.

### Pitfall 5: TopBar Active Projects List Staleness

**What goes wrong:** The active projects list passed to LogSessionModal is fetched server-side at page load. If a user creates a new project in another tab, the modal's project picker is stale.
**Why it happens:** Server components don't re-render on client-side navigation within the same layout.
**How to avoid:** For v1.2, this is acceptable -- the user can refresh the page. The dataset is small (500 charts) and updates are rare. Alternative: use `router.refresh()` after project creation, which already happens via `revalidatePath`.
**Warning signs:** Newly created projects don't appear in the Log Session modal picker.

### Pitfall 6: Conditional EditableNumber Causes Layout Shift

**What goes wrong:** Switching between EditableNumber (interactive) and static text (read-only) changes the element height/padding, causing layout shift on the overview tab.
**Why it happens:** EditableNumber has `min-h-11` and hover styles; a plain `<span>` doesn't.
**How to avoid:** Match the same `min-h-11 px-1.5 py-0.5 font-mono tabular-nums` classes on the read-only display element. The only difference should be removing the `cursor-text` hover state.
**Warning signs:** Content jumps when a session is first logged for a project.

## Code Examples

### StitchSession Prisma Model

```prisma
// Source: Following existing model conventions in schema.prisma
model StitchSession {
  id               String   @id @default(cuid())
  project          Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  date             DateTime
  stitchCount      Int
  timeSpentMinutes Int?
  photoKey         String?  // R2 storage key, resolved to presigned URL at display time
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([projectId])      // For aggregate queries and session history
  @@index([date])           // For chronological session page
}
```

[ASSUMED: Field names follow existing Prisma conventions. `photoKey` stores R2 key like `coverImageUrl` on Chart.]

Note: Project model needs `sessions StitchSession[]` relation added.

### Session Zod Validation Schema

```typescript
// Source: Following existing pattern from src/lib/validations/chart.ts
import { z } from "zod";

export const sessionFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  stitchCount: z.number().int().min(1, "Stitch count must be at least 1"),
  timeSpentMinutes: z.number().int().min(0).nullable().default(null),
  photoKey: z.string().nullable().default(null),
});

export type SessionFormInput = z.infer<typeof sessionFormSchema>;
```

[VERIFIED: Zod date validation pattern from form-patterns.md]

### Session Server Action (create with atomic progress)

```typescript
// Source: Following existing pattern from chart-actions.ts and supply-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { sessionFormSchema } from "@/lib/validations/session";

export async function createSession(formData: unknown) {
  const user = await requireAuth();
  const validated = sessionFormSchema.parse(formData);

  // Verify project belongs to user
  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
    select: { userId: true, chartId: true },
  });
  if (!project || project.userId !== user.id) {
    return { success: false as const, error: "Project not found" };
  }

  const session = await prisma.$transaction(async (tx) => {
    // 1. Create session
    const created = await tx.stitchSession.create({
      data: {
        projectId: validated.projectId,
        date: new Date(validated.date),
        stitchCount: validated.stitchCount,
        timeSpentMinutes: validated.timeSpentMinutes,
        photoKey: validated.photoKey,
      },
    });

    // 2. Recalculate progress (D-04)
    await recalculateProgress(tx, validated.projectId);

    return created;
  });

  revalidatePath(`/charts/${project.chartId}`);
  revalidatePath("/sessions");
  return { success: true as const, session };
}
```

[VERIFIED: requireAuth pattern, $transaction pattern, revalidatePath pattern from existing actions]

### What's Next Kitting Percentage Calculation

```typescript
// Source: D-08 ranking logic
// Kitting % = total acquired / total required across all supply types

function calculateKittingPercent(project: {
  projectThreads: { quantityRequired: number; quantityAcquired: number }[];
  projectBeads: { quantityRequired: number; quantityAcquired: number }[];
  projectSpecialty: { quantityRequired: number; quantityAcquired: number }[];
  fabric: { id: string } | null;
}): number {
  const supplies = [
    ...project.projectThreads,
    ...project.projectBeads,
    ...project.projectSpecialty,
  ];
  
  // Include fabric as a supply item (1 required, 1 acquired if linked)
  const fabricRequired = 1; // Always need fabric
  const fabricAcquired = project.fabric ? 1 : 0;
  
  const totalRequired = supplies.reduce((s, i) => s + i.quantityRequired, 0) + fabricRequired;
  const totalAcquired = supplies.reduce((s, i) => s + Math.min(i.quantityAcquired, i.quantityRequired), 0) + fabricAcquired;
  
  if (totalRequired === 0) return 100; // No supplies needed = fully kitted
  return Math.round((totalAcquired / totalRequired) * 100);
}
```

[ASSUMED: Fabric counts as one supply item for kitting percentage. This seems reasonable given D-08 mentions "kitting completeness %".]

### Fabric Requirements Size Calculation

```typescript
// Source: DesignOS PatternDive.tsx FabricRequirementsTab
const MARGIN_PER_SIDE = 3; // inches
const MARGIN_TOTAL = MARGIN_PER_SIDE * 2; // 6 inches

function calcFabricSize(stitches: number, count: number): number {
  return stitches / count + MARGIN_TOTAL;
}

// For a project with 200w x 300h stitches on 14ct fabric:
// Width = 200/14 + 6 = 20.3"
// Height = 300/14 + 6 = 27.4"
```

[VERIFIED: Formula from DesignOS PatternDive.tsx line 323-324]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual stitchesCompleted entry | Auto-calculated from sessions (D-04) | This phase | Progress is derived, not manually entered (once sessions exist) |
| "Projects" nav label + flat gallery | "Pattern Dive" with 4 tabbed views | This phase | Charts page evolves from list to multi-perspective browser |
| Toast placeholder "Coming soon" | Real LogSessionModal | This phase | TopBar button becomes functional |
| Sessions placeholder page | Full session chronological log | This phase | /sessions becomes a real page |

**Deprecated/outdated:**
- Direct `stitchesCompleted` editing via EditableNumber: Replaced by session-based calculation once sessions exist (D-06). EditableNumber remains for projects without sessions.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `photoKey` is the right field name for storing R2 keys on sessions (vs `photoUrl`) | Code Examples - StitchSession model | Low -- naming convention, easy to change. Existing pattern uses `coverImageUrl` which stores R2 keys despite the "Url" suffix, so either convention works. |
| A2 | Fabric counts as one item in kitting percentage calculation | Code Examples - Kitting % | Medium -- if excluded, percentages change for projects that need fabric. Design reference doesn't specify. |
| A3 | Session date stored as `DateTime` (not just date string) | Code Examples - StitchSession model | Low -- Prisma DateTime handles date-only values fine, and it allows timezone-aware display later. |
| A4 | No session-level userId needed (ownership via project relation) | Architecture Patterns | Low -- single-user app, project already has userId. Session ownership is implicit through project ownership. |

## Open Questions

1. **Active projects for LogSessionModal -- which statuses qualify?**
   - What we know: DesignOS shows "active projects" in the picker. The `ActiveProject` type from design has status as `'In Progress' | 'On Hold'`.
   - What's unclear: Should KITTING, KITTED, UNSTARTED projects also appear? A user might want to log a test stitch on a kitted project.
   - Recommendation: Include IN_PROGRESS, ON_HOLD, KITTING, and KITTED. Exclude UNSTARTED (no stitching has begun), FINISHED, and FFO (already done). This matches the "active" concept while being practical.

2. **Data migration timing (D-05) -- Prisma migration vs server action?**
   - What we know: Need to copy `stitchesCompleted` to `startingStitches` for projects with progress but no sessions.
   - What's unclear: Should this be a Prisma SQL migration (runs once on deploy) or a server-side script?
   - Recommendation: Prisma SQL migration. It's a one-time operation, idempotent, and runs automatically on deployment. Pattern: `UPDATE "Project" SET "startingStitches" = "stitchesCompleted" WHERE "stitchesCompleted" > 0 AND "startingStitches" = 0`.

3. **Session photo upload -- before or after session save?**
   - What we know: Design shows photo as optional field in the modal. Current cover image upload is a separate two-step flow (presigned URL, then confirm).
   - What's unclear: Should photo upload happen before save (user uploads, gets key, included in session create) or after (session created first, photo uploaded separately)?
   - Recommendation: Upload before save. User selects photo, client uploads to R2 via presigned URL, gets the key, includes it in the session form data. If upload fails, session saves without photo (toast error per UI-SPEC). This avoids orphaned sessions without photos.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SESS-01 | Create session with date, project, stitch count, time, photo | unit (action + component) | `npx vitest run src/lib/actions/session-actions.test.ts -t "createSession"` | Wave 0 |
| SESS-02 | Modal accessible from TopBar, project detail, sessions page | unit (component) | `npx vitest run src/components/shell/top-bar.test.tsx` | Wave 0 |
| SESS-03 | Per-project session history with mini stats | unit (component) | `npx vitest run src/components/features/sessions/project-sessions-tab.test.tsx` | Wave 0 |
| SESS-04 | Edit and delete session | unit (action) | `npx vitest run src/lib/actions/session-actions.test.ts -t "updateSession\|deleteSession"` | Wave 0 |
| SESS-05 | Progress auto-updates atomically | unit (action) | `npx vitest run src/lib/actions/session-actions.test.ts -t "recalculate"` | Wave 0 |
| SESS-06 | Photo upload with session | unit (action + component) | `npx vitest run src/lib/actions/session-actions.test.ts -t "photo"` | Wave 0 |
| PDIV-01 | Nav label renamed | unit (config) | `npx vitest run src/components/shell/nav-items.test.ts` | Wave 0 |
| PDIV-02 | Browse tab wraps gallery | unit (component) | `npx vitest run src/components/features/charts/pattern-dive-tabs.test.tsx` | Wave 0 |
| PDIV-03 | What's Next tab with ranking | unit (component + action) | `npx vitest run src/components/features/charts/whats-next-tab.test.tsx` | Wave 0 |
| PDIV-04 | Fabric Requirements tab | unit (component + action) | `npx vitest run src/components/features/charts/fabric-requirements-tab.test.tsx` | Wave 0 |
| PDIV-05 | Storage View tab | unit (component + action) | `npx vitest run src/components/features/charts/storage-view-tab.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/actions/session-actions.test.ts` -- covers SESS-01, SESS-04, SESS-05, SESS-06
- [ ] `src/lib/actions/pattern-dive-actions.test.ts` -- covers PDIV-03, PDIV-04, PDIV-05
- [ ] `src/lib/validations/session.test.ts` -- covers SESS-01 validation
- [ ] `src/components/features/sessions/log-session-modal.test.tsx` -- covers SESS-01, SESS-02, SESS-04
- [ ] `src/components/features/sessions/project-sessions-tab.test.tsx` -- covers SESS-03
- [ ] `src/components/features/charts/pattern-dive-tabs.test.tsx` -- covers PDIV-01, PDIV-02
- [ ] `src/components/features/charts/whats-next-tab.test.tsx` -- covers PDIV-03
- [ ] `src/components/features/charts/fabric-requirements-tab.test.tsx` -- covers PDIV-04
- [ ] `src/components/features/charts/storage-view-tab.test.tsx` -- covers PDIV-05
- [ ] Update `createMockPrisma()` in `src/__tests__/mocks/factories.ts` to include `stitchSession` model methods and `createMockStitchSession` factory

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes (implicit) | requireAuth() on all server actions -- already established |
| V3 Session Management | No | Auth.js JWT handles sessions -- no new session logic |
| V4 Access Control | Yes | Project ownership validation (project.userId === user.id) before session CRUD |
| V5 Input Validation | Yes | Zod schemas for session form data, upload validation |
| V6 Cryptography | No | No new crypto -- R2 presigned URLs use existing AWS SDK signing |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Session logged to another user's project | Elevation of Privilege | Verify `project.userId === user.id` before any session mutation |
| Negative stitch count to reduce progress | Tampering | Zod `z.number().int().min(1)` validation |
| Oversized photo upload | Denial of Service | Existing `MAX_FILE_SIZE` (10MB) in upload validation |
| SQL injection via session queries | Tampering | Prisma parameterized queries (built-in) |
| Direct stitchesCompleted manipulation | Tampering | D-06: read-only once sessions exist; recalculated atomically |

## Project Constraints (from CLAUDE.md)

**Enforced in this phase:**
- Server Components by default -- "use client" only for LogSessionModal, session table, Pattern Dive tabs, and interactive tab content
- Zod validation at boundaries -- session form data validated with Zod in server action
- Prisma schema is source of truth -- `prisma db push` then `prisma generate` after adding StitchSession model
- Three junction tables for supplies -- kitting % calculation uses existing ProjectThread/ProjectBead/ProjectSpecialty
- Calculated fields at query time -- stitchesCompleted recalculated from sessions, never stored independently (once sessions exist)
- Colocated tests -- `foo.test.tsx` next to `foo.tsx`
- Import test utils from `@/__tests__/test-utils`
- Pin exact versions -- no new deps needed, but verify if any are added
- TDD mandatory -- tests before implementation in all plans
- Impeccable gates -- `/impeccable:polish` after UI plans, `/impeccable:audit` before verify

**Guardrails active:**
- No `"use client"` unless genuinely needed (Pattern Dive page.tsx is server component)
- No `Button render={<Link>}` -- use LinkButton
- No nested `<form>` elements (LogSessionModal uses Dialog, not form-in-form)
- No fallback user IDs
- Check DesignOS before building UI (design references listed in CONTEXT.md canonical_refs)
- Do not duplicate requirements

## Sources

### Primary (HIGH confidence)
- Prisma schema (`prisma/schema.prisma`) -- verified current data model
- Existing server actions (`src/lib/actions/`) -- verified patterns for requireAuth, $transaction, revalidatePath
- Existing components (`src/components/`) -- verified TopBar, ProjectTabs, Dialog, Tabs, EditableNumber, ProjectGallery
- Upload actions (`src/lib/actions/upload-actions.ts`) -- verified R2 presigned URL pattern
- Upload validation (`src/lib/validations/upload.ts`) -- verified category enum
- DesignOS components -- verified LogSessionModal.tsx, ProjectSessionsTab.tsx, PatternDive.tsx
- nuqs 2.8.9 -- verified parseAsStringLiteral pattern via Context7 and existing project-tabs.tsx
- npm ls -- verified all package versions (Next.js 16.2.3, Prisma 7.7.0, nuqs 2.8.9, @base-ui/react 1.4.0, Vitest 3.1.1)

### Secondary (MEDIUM confidence)
- Prisma 7 `aggregate` inside interactive transactions -- confirmed via Context7 Prisma skills docs
- Test patterns for $transaction -- confirmed via supply-actions.test.ts mock patterns

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, no new deps
- Architecture: HIGH -- all patterns already established in the codebase
- Pitfalls: HIGH -- identified from codebase analysis and existing backlog items (STATE.md concerns about $transaction, Promise.all())

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable -- no library upgrades expected during this milestone)
