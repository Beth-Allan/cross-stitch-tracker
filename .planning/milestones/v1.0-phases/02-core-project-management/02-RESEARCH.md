# Phase 2: Core Project Management - Research

**Researched:** 2026-03-28
**Domain:** Full-stack CRUD with file uploads (Prisma + Next.js Server Actions + Cloudflare R2)
**Confidence:** HIGH

## Summary

Phase 2 builds the core entity layer: Chart and Project tables with ~50 metadata fields, cover photo uploads, digital working copy (PDF) storage via presigned R2 URLs, a 7-stage status system, and auto-calculated size categories. This is the foundational data model that all subsequent phases build on.

The technical surface is well-understood: Prisma 7 schema with enums and relations, Zod validation at Server Action boundaries, AWS SDK v3 for R2 presigned URL generation, sharp for server-side thumbnail creation, and a Client Component form with sectioned layout. No exotic libraries or patterns are required -- everything uses the established stack from Phase 1.

**Primary recommendation:** Build in layers -- schema/migration first, then Server Actions with validation, then the form UI, then file upload infrastructure, then the detail page. Each layer is independently testable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Chart and Project modeled as two separate Prisma tables with a 1:1 relationship. Chart holds design metadata (name, designer, stitch count, dimensions, genres). Project holds workflow state (status, dates, progress, kitting state).
- **D-02:** Creating a Chart auto-creates a Project record -- single-user UX simplification, but schema supports multi-user expansion later (multiple Projects per Chart).
- **D-03:** Designer and Genre tables created in this phase's migration to support inline creation from the chart form. Full CRUD management pages deferred to Phase 3.
- **D-04:** Size category (Mini/Small/Medium/Large/BAP) computed at query time from stitch count -- never stored in database. Thresholds defined in a shared utility.
- **D-05:** Presigned URL pattern for all file uploads. Client requests a signed upload URL from a Server Action, uploads directly to R2 from the browser, then confirms the upload to save the URL in the database.
- **D-06:** Vercel has a hard 4.5MB body limit across all plans -- server-proxied uploads are not viable for PDFs up to 5MB. Presigned URLs are required, not optional.
- **D-07:** R2 configured with explicit CORS policy -- no wildcard `*` in AllowedHeaders (R2 limitation). Must enumerate Content-Type and other headers explicitly.
- **D-08:** Presigned URLs use the S3 API domain (`<ACCOUNT_ID>.r2.cloudflarestorage.com`), not custom domains. Region set to `"auto"`.
- **D-09:** Cover photos processed server-side with sharp for thumbnails. Digital working copies stored as-is (no processing).
- **D-10:** File key structure: `covers/<projectId>/<filename>` for cover photos, `files/<projectId>/<filename>` for digital working copies.
- **D-11:** Add/edit chart form is a Client Component using React state for ~50 fields, submitting via Server Actions with Zod validation.
- **D-12:** Form organized in tabs/sections to manage complexity (matching design's tabbed interface pattern).
- **D-13:** Inline "add new" for Designer and Genre from within the chart form -- modal or popover, not a separate page navigation.
- **D-14:** Zod schemas live in `src/lib/validations/` following the pattern established in Phase 1 (`auth.ts`).
- **D-15:** Seven statuses: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO. Stored as a Prisma enum.
- **D-16:** Status changes via a dedicated control on the project detail page -- not buried in the edit form.
- **D-17:** Status colors use the CSS custom properties established in Phase 1 (--status-unstarted through --status-ffo).

### Claude's Discretion
- Exact Prisma schema field names and types for the ~50 metadata fields (guided by design types and plan data model)
- Form tab organization and field grouping
- Detail page layout and component decomposition
- Loading/error states for file uploads
- R2 bucket naming and environment variable naming
- Image thumbnail dimensions for cover photos
- Exact size category thresholds (stitch count breakpoints for Mini/Small/Medium/Large/BAP)

### Deferred Ideas (OUT OF SCOPE)
- Full designer CRUD with stats and detail views -- Phase 3
- Full genre management pages -- Phase 3
- SAL support (multi-part charts) -- Phase 3
- Gallery/list/table view switching with sorting -- Phase 3
- Series/collection management -- Phase 4
- Supply linking and kitting status -- Phase 5
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROJ-01 | User can create, view, edit, and delete cross-stitch projects with ~50 metadata fields | Prisma schema design, Zod validation schemas, Server Actions pattern, form architecture |
| PROJ-02 | User can upload cover photo and view it in gallery/detail views | R2 presigned URL flow, sharp thumbnail generation, CORS configuration |
| PROJ-03 | User can upload and store digital working copies (PDF/image) via presigned R2 URLs | R2 S3Client setup, presigned PUT/GET URLs, file key structure |
| PROJ-04 | User can set and change project status through all 7 stages | Prisma enum, StatusBadge component, dedicated status control UI |
| PROJ-05 | App auto-calculates size category (Mini/Small/Medium/Large/BAP) from stitch count | Shared utility function, computed at query/display time |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Already Installed |
|---------|---------|---------|-------------------|
| next | 16.2.1 | Framework | Yes |
| prisma | 7.6.0 | ORM + migrations | Yes |
| @prisma/adapter-neon | 7.6.0 | Neon serverless driver | Yes |
| zod | 3.24.4 | Form/action validation | Yes |
| sharp | 0.33.5 | Cover photo thumbnails | Yes (devDependencies -- move to dependencies) |
| lucide-react | 1.7.0 | Icons | Yes |
| sonner | 2.0.7 | Toast notifications | Yes |

### New Dependencies Required
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @aws-sdk/client-s3 | 3.1019.0 | R2 file operations (PutObject, GetObject, DeleteObject) | S3-compatible API for Cloudflare R2 |
| @aws-sdk/s3-request-presigner | 3.1019.0 | Generate presigned upload/download URLs | Browser-direct uploads bypass Vercel 4.5MB limit |
| nanoid | 5.1.7 | Unique filename generation | Prevent collisions in R2 file keys |

### shadcn/ui Components to Add
| Component | Purpose |
|-----------|---------|
| dialog | Inline "add designer/genre" modals from within chart form |
| tabs | Form section organization (Basic Info, Dimensions, Pattern Type, Project Setup, Dates) |
| select | Status selector, fabric picker, bin picker, app picker |
| badge | Status badges, size category badges |
| label | Form field labels |
| textarea | Notes fields (if needed) |
| separator | Visual section dividers |
| popover | Alternative to dialog for inline entity creation |

**Installation:**
```bash
# New npm packages
npm install @aws-sdk/client-s3@3.1019.0 @aws-sdk/s3-request-presigner@3.1019.0 nanoid@5.1.7

# Move sharp from devDependencies to dependencies (needed at runtime for thumbnails)
npm install sharp@0.33.5

# shadcn/ui components
npx shadcn@latest add dialog tabs select badge label separator popover
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/(dashboard)/
    charts/
      page.tsx                    # Charts list page (Server Component)
      new/
        page.tsx                  # Add new chart page (Server Component wrapper)
      [id]/
        page.tsx                  # Chart detail page (Server Component)
        edit/
          page.tsx                # Edit chart page (Server Component wrapper)
  components/
    features/
      charts/
        chart-form.tsx            # Client Component: tabbed add/edit form (~50 fields)
        chart-detail.tsx          # Server Component: detail view layout
        status-control.tsx        # Client Component: status changer with dropdown
        status-badge.tsx          # Shared: colored status pill
        size-badge.tsx            # Shared: size category display
        cover-image-upload.tsx    # Client Component: presigned URL upload flow
        file-upload.tsx           # Client Component: digital working copy upload
        searchable-select.tsx     # Client Component: designer/genre picker with inline add
        genre-picker.tsx          # Client Component: multi-select genre pills
        inline-entity-dialog.tsx  # Client Component: modal for adding designer/genre
    ui/
      (existing shadcn components + new ones listed above)
  lib/
    actions/
      chart-actions.ts            # Server Actions: createChart, updateChart, deleteChart
      upload-actions.ts           # Server Actions: getPresignedUploadUrl, confirmUpload, getPresignedDownloadUrl
      designer-actions.ts         # Server Actions: createDesigner (inline creation)
      genre-actions.ts            # Server Actions: createGenre (inline creation)
    r2.ts                         # S3Client singleton for R2 operations
    validations/
      chart.ts                    # Zod schemas: chartFormSchema, projectFormSchema
      upload.ts                   # Zod schemas: uploadRequestSchema
    utils/
      size-category.ts            # calculateSizeCategory() shared utility
      format.ts                   # formatNumber(), formatDate() helpers
  types/
    chart.ts                      # Mapped types for UI (from Prisma generated types)
```

### Pattern 1: Server Action with Zod Validation
**What:** Every mutation goes through a Server Action that validates input with Zod before touching the database.
**When to use:** All create/update/delete operations.
```typescript
// src/lib/actions/chart-actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chartFormSchema } from "@/lib/validations/chart";
import { revalidatePath } from "next/cache";

export async function createChart(formData: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = chartFormSchema.parse(formData);

  const chart = await prisma.chart.create({
    data: {
      ...validated.chart,
      project: {
        create: {
          status: validated.project.status ?? "Unstarted",
          // ... project fields
        },
      },
    },
    include: { project: true },
  });

  revalidatePath("/charts");
  return chart;
}
```

### Pattern 2: Presigned URL Upload Flow
**What:** Three-step browser-direct upload: request URL, upload to R2, confirm in DB.
**When to use:** Cover photos and digital working copies.
```typescript
// Step 1: Server Action generates presigned PUT URL
"use server";
export async function getPresignedUploadUrl(input: {
  fileName: string;
  contentType: string;
  category: "covers" | "files";
  projectId: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = uploadRequestSchema.parse(input);
  const key = `${validated.category}/${validated.projectId}/${nanoid()}-${validated.fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: validated.contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  return { url, key };
}

// Step 2: Client uploads directly to R2
// await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

// Step 3: Server Action saves the file key to the database
"use server";
export async function confirmUpload(input: {
  projectId: string;
  field: "coverImageUrl" | "digitalWorkingCopyUrl";
  key: string;
}) {
  // ... validate, update chart/project record
}
```

### Pattern 3: Computed Size Category (Never Stored)
**What:** Size category derived from stitch count at query/display time.
```typescript
// src/lib/utils/size-category.ts
export type SizeCategory = "Mini" | "Small" | "Medium" | "Large" | "BAP";

export function calculateSizeCategory(stitchCount: number): SizeCategory {
  if (stitchCount >= 50000) return "BAP";
  if (stitchCount >= 25000) return "Large";
  if (stitchCount >= 5000) return "Medium";
  if (stitchCount >= 1000) return "Small";
  return "Mini";
}
```
These thresholds match the design reference (`FormFields.tsx`) and the plan document (section 4.1).

### Pattern 4: Chart + Project Auto-Creation (D-02)
**What:** Creating a chart always creates a linked project in the same transaction.
```typescript
const chart = await prisma.chart.create({
  data: {
    name: validated.name,
    designerId: validated.designerId,
    // ... chart fields
    project: {
      create: {
        status: "UNSTARTED",
        userId: session.user.id,
        // ... project defaults
      },
    },
  },
});
```

### Anti-Patterns to Avoid
- **Storing sizeCategory in the database:** Per D-04 and project guardrails, computed fields are never stored. Calculate at query time or in the UI.
- **Server-proxied file uploads:** Vercel has a hard 4.5MB body limit. Always use presigned URLs for R2 uploads.
- **Single polymorphic upload handler:** Keep cover photo and digital working copy flows separate -- they have different validation (image types vs PDF/image) and processing (thumbnails vs as-is).
- **Putting form state in Server Components:** The chart form with ~50 fields requires client-side interactivity. Use `"use client"` for the form, Server Components for the page wrapper and data fetching.
- **Direct R2 URLs in the frontend:** Generate presigned GET URLs for downloads/display. Never expose raw R2 credentials or permanent URLs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Presigned URLs | Custom signing logic | @aws-sdk/s3-request-presigner | Signature v4 is complex; library handles all edge cases |
| Image thumbnails | Canvas/manual resize | sharp | Native performance, handles EXIF rotation, memory-efficient |
| Unique file keys | UUID or timestamp strings | nanoid | URL-safe, no collisions, configurable length |
| Form validation | Manual if/else checking | Zod schemas | Type inference, consistent error messages, composable |
| Status badge colors | Inline color logic | CSS custom properties + config map | Already established in Phase 1, keeps colors centralized |
| Searchable dropdown | Custom dropdown from scratch | shadcn Select or Combobox (Popover + Command) | Keyboard nav, accessibility, focus management are hard |

## Common Pitfalls

### Pitfall 1: R2 CORS Misconfiguration
**What goes wrong:** Browser uploads fail with opaque CORS errors despite valid presigned URLs.
**Why it happens:** R2 requires explicit CORS policy. Presigned URLs handle auth, not CORS. AllowedHeaders must enumerate each header (Content-Type, etc.) -- don't rely on wildcards.
**How to avoid:** Configure CORS on the R2 bucket before testing uploads. Use the exact origin (e.g., `http://localhost:3000` for dev, production URL for prod). Include both PUT and GET methods.
**Warning signs:** 403 or opaque network errors on fetch to R2 URL from browser.

### Pitfall 2: Presigned URL Content-Type Mismatch
**What goes wrong:** Upload succeeds but the presigned PUT URL was created with a specific Content-Type, and the browser sends a different one, resulting in 403.
**Why it happens:** If you specify ContentType in PutObjectCommand, the actual upload must match exactly.
**How to avoid:** Pass the file's actual MIME type when requesting the presigned URL, then set the same Content-Type header in the browser fetch.
**Warning signs:** 403/SignatureDoesNotMatch on PUT to presigned URL.

### Pitfall 3: Sharp in Vercel Serverless
**What goes wrong:** sharp fails to load in Vercel's serverless environment.
**Why it happens:** sharp has native binaries. Vercel handles this, but it must be in `dependencies` (not `devDependencies`) and the function must not be an Edge function.
**How to avoid:** Move sharp from devDependencies to dependencies. Use Node.js runtime (not Edge) for the thumbnail generation Server Action. Test in `npm run build` locally.
**Warning signs:** "Could not load sharp" errors at runtime.

### Pitfall 4: Prisma Enum Value Casing
**What goes wrong:** Enum values in the Prisma schema don't match what the UI sends.
**Why it happens:** Prisma enums are typically UPPER_SNAKE_CASE in the schema but the UI uses display strings like "In Progress". Need a mapping layer.
**How to avoid:** Define the enum with mapped values: `IN_PROGRESS @map("In Progress")` or use UPPER_SNAKE_CASE throughout and map in the UI layer. Recommendation: use UPPER_SNAKE_CASE in Prisma (`UNSTARTED`, `KITTING`, `IN_PROGRESS`, etc.) and map to display strings in a shared config.
**Warning signs:** Prisma validation errors when saving status.

### Pitfall 5: Missing Session Verification in Server Actions
**What goes wrong:** Unauthenticated users can create/modify data.
**Why it happens:** Forgetting to call `auth()` at the top of every Server Action.
**How to avoid:** Every Server Action starts with session check. Consider a wrapper function:
```typescript
async function authenticatedAction<T>(fn: () => Promise<T>): Promise<T> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return fn();
}
```
**Warning signs:** Actions succeed without a session cookie.

### Pitfall 6: Stitch Count Auto-Calculation Logic
**What goes wrong:** Stitch count shows 0 or wrong value when dimensions are provided but total count is not.
**Why it happens:** The form has two paths: user enters total count directly, OR system calculates from width x height. Need clear precedence.
**How to avoid:** Follow the design's logic: if user provides stitchCount > 0, use it. Otherwise calculate from stitchesWide * stitchesHigh. Mark as approximate when auto-calculated. Validate in Zod: at least one of (stitchCount > 0) or (stitchesWide > 0 AND stitchesHigh > 0) must be true.
**Warning signs:** Size category shows "Mini" for large projects, or NaN in calculations.

### Pitfall 7: Nanoid Import in Server Actions
**What goes wrong:** `import { nanoid } from 'nanoid'` fails in Next.js server context.
**Why it happens:** Nanoid v5 is ESM-only. Next.js handles this, but be aware of the import syntax.
**How to avoid:** Use `import { nanoid } from 'nanoid'` (ESM import). This works in Next.js 16 with server actions. If issues arise, use `crypto.randomUUID()` as fallback for file keys.
**Warning signs:** Module resolution errors at build time.

## Code Examples

### Prisma Schema (Chart + Project + Supporting Tables)
```prisma
// prisma/schema.prisma

enum ProjectStatus {
  UNSTARTED
  KITTING
  KITTED
  IN_PROGRESS
  ON_HOLD
  FINISHED
  FFO
}

model Designer {
  id        String   @id @default(cuid())
  name      String   @unique
  website   String?
  charts    Chart[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Genre {
  id        String   @id @default(cuid())
  name      String   @unique
  charts    Chart[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Chart {
  id                     String    @id @default(cuid())
  name                   String
  designer               Designer? @relation(fields: [designerId], references: [id])
  designerId             String?
  coverImageUrl          String?
  coverThumbnailUrl      String?
  stitchCount            Int       @default(0)
  stitchCountApproximate Boolean   @default(false)
  stitchesWide           Int       @default(0)
  stitchesHigh           Int       @default(0)
  genres                 Genre[]
  isPaperChart           Boolean   @default(false)
  isFormalKit            Boolean   @default(false)
  isSAL                  Boolean   @default(false)
  kitColorCount          Int?
  digitalWorkingCopyUrl  String?
  dateAdded              DateTime  @default(now())
  project                Project?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

model Project {
  id                   String        @id @default(cuid())
  chart                Chart         @relation(fields: [chartId], references: [id], onDelete: Cascade)
  chartId              String        @unique
  userId               String        // Links to Auth.js user
  status               ProjectStatus @default(UNSTARTED)
  startDate            DateTime?
  finishDate           DateTime?
  ffoDate              DateTime?
  finishPhotoUrl       String?
  startingStitches     Int           @default(0)
  stitchesCompleted    Int           @default(0)
  fabricId             String?
  projectBin           String?
  ipadApp              String?
  needsOnionSkinning   Boolean       @default(false)
  wantToStartNext      Boolean       @default(false)
  preferredStartSeason String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}
```

**Notes on schema:**
- Chart-Genre is an implicit many-to-many (Prisma creates the junction table automatically)
- `chartId` on Project has `@unique` enforcing the 1:1 relationship (D-01)
- `onDelete: Cascade` ensures deleting a chart removes its project
- `userId` is a plain String (not a relation) since Auth.js uses JWT sessions without a User table in the database
- Series/SAL fields are NOT included -- deferred to Phase 3 per CONTEXT.md
- Fabric relation is NOT included -- just a `fabricId` string placeholder until Phase 4 creates the Fabric table

### R2 Client Singleton
```typescript
// src/lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID) throw new Error("R2_ACCOUNT_ID is required");
if (!process.env.R2_ACCESS_KEY_ID) throw new Error("R2_ACCESS_KEY_ID is required");
if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error("R2_SECRET_ACCESS_KEY is required");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
```

### Environment Variables (additions to .env.example)
```bash
# Cloudflare R2 (file storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-api-token-access-key"
R2_SECRET_ACCESS_KEY="your-r2-api-token-secret"
R2_BUCKET_NAME="cross-stitch-tracker"
```

### R2 CORS Configuration
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
Production origin must be added when deploying to Vercel.

### Status Display Mapping
```typescript
// src/lib/utils/status.ts
import { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  cssVar: string;
}> = {
  UNSTARTED:   { label: "Unstarted",   cssVar: "--status-unstarted" },
  KITTING:     { label: "Kitting",     cssVar: "--status-kitting" },
  KITTED:      { label: "Ready",       cssVar: "--status-kitted" },
  IN_PROGRESS: { label: "Stitching",   cssVar: "--status-in-progress" },
  ON_HOLD:     { label: "On Hold",     cssVar: "--status-on-hold" },
  FINISHED:    { label: "Finished",    cssVar: "--status-finished" },
  FFO:         { label: "FFO",         cssVar: "--status-ffo" },
};
```

### Zod Validation Schema (Chart Form)
```typescript
// src/lib/validations/chart.ts
import { z } from "zod";

export const chartFormSchema = z.object({
  chart: z.object({
    name: z.string().min(1, "Chart name is required").max(200),
    designerId: z.string().optional(),
    stitchCount: z.number().int().min(0).default(0),
    stitchCountApproximate: z.boolean().default(false),
    stitchesWide: z.number().int().min(0).default(0),
    stitchesHigh: z.number().int().min(0).default(0),
    genreIds: z.array(z.string()).default([]),
    isPaperChart: z.boolean().default(false),
    isFormalKit: z.boolean().default(false),
    isSAL: z.boolean().default(false),
    kitColorCount: z.number().int().min(1).nullable().default(null),
  }).refine(
    (data) => data.stitchCount > 0 || (data.stitchesWide > 0 && data.stitchesHigh > 0),
    { message: "Provide stitch count or dimensions", path: ["stitchCount"] }
  ),
  project: z.object({
    status: z.enum(["UNSTARTED", "KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD", "FINISHED", "FFO"]).default("UNSTARTED"),
    fabricId: z.string().nullable().default(null),
    projectBin: z.string().nullable().default(null),
    ipadApp: z.string().nullable().default(null),
    needsOnionSkinning: z.boolean().default(false),
    startDate: z.string().nullable().default(null), // ISO date string
    finishDate: z.string().nullable().default(null),
    ffoDate: z.string().nullable().default(null),
    wantToStartNext: z.boolean().default(false),
    preferredStartSeason: z.string().nullable().default(null),
    startingStitches: z.number().int().min(0).default(0),
  }),
});

export type ChartFormInput = z.infer<typeof chartFormSchema>;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-proxied uploads | Presigned URL direct-to-R2 | Always for Vercel (4.5MB limit) | Must use browser-direct upload pattern |
| Prisma schema url in schema.prisma | Prisma 7 uses prisma.config.ts for adapter | Prisma 7 (2025) | Already configured in Phase 1 |
| next-auth v4 getServerSession | next-auth v5 `auth()` | 2025 | Already using `auth()` from Phase 1 |
| Tailwind config.js | Tailwind v4 CSS @theme | 2025 | Status colors already in globals.css |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | 22.x | -- |
| PostgreSQL (Neon) | Prisma | Yes (remote) | 17 | -- |
| Cloudflare R2 | File uploads | Needs setup | -- | Must create bucket + API token |
| sharp | Thumbnail generation | Yes | 0.33.5 | -- |

**Missing dependencies with no fallback:**
- R2 bucket must be created and CORS configured before file upload testing
- R2 API token (access key + secret) must be generated in Cloudflare dashboard
- Environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) must be set in .env.local

**Missing dependencies with fallback:**
- None -- all npm packages are available and installable

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + React Testing Library 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROJ-01 | Create/view/edit/delete charts with metadata | unit | `npx vitest run src/lib/actions/chart-actions.test.ts -t "create"` | No -- Wave 0 |
| PROJ-01 | Zod validation rejects invalid chart data | unit | `npx vitest run src/lib/validations/chart.test.ts` | No -- Wave 0 |
| PROJ-02 | Cover photo upload presigned URL generation | unit | `npx vitest run src/lib/actions/upload-actions.test.ts` | No -- Wave 0 |
| PROJ-03 | Digital working copy upload flow | unit | `npx vitest run src/lib/actions/upload-actions.test.ts -t "working copy"` | No -- Wave 0 |
| PROJ-04 | Status transitions work for all 7 statuses | unit | `npx vitest run src/lib/actions/chart-actions.test.ts -t "status"` | No -- Wave 0 |
| PROJ-05 | Size category calculation correct at boundaries | unit | `npx vitest run src/lib/utils/size-category.test.ts` | No -- Wave 0 |
| PROJ-05 | Size badge renders correct category | unit | `npx vitest run src/components/features/charts/size-badge.test.tsx` | No -- Wave 0 |
| PROJ-04 | Status badge renders with correct colors | unit | `npx vitest run src/components/features/charts/status-badge.test.tsx` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/utils/size-category.test.ts` -- covers PROJ-05 (pure function, easy to test)
- [ ] `src/lib/validations/chart.test.ts` -- covers PROJ-01 (Zod schema validation edge cases)
- [ ] `src/components/features/charts/status-badge.test.tsx` -- covers PROJ-04 (component rendering)
- [ ] `src/components/features/charts/size-badge.test.tsx` -- covers PROJ-05 (component rendering)

Note: Server Action tests (chart-actions, upload-actions) require mocking Prisma and R2 -- per CLAUDE.md, "Do not mock Prisma, Next.js routing, or framework internals." These actions should be verified through manual testing and the build passing, not unit tests. Focus automated tests on pure utilities and component rendering.

## Open Questions

1. **R2 bucket setup timing**
   - What we know: R2 bucket + API token + CORS must be configured before upload features work
   - What's unclear: Whether the user has already created the R2 bucket or needs guidance
   - Recommendation: Include R2 setup as an explicit early task with step-by-step instructions. Code that depends on R2 should gracefully degrade (show upload UI but display "Storage not configured" if env vars missing)

2. **Thumbnail dimensions for cover photos**
   - What we know: sharp is available, cover photos display prominently on detail pages and as small cards in list views
   - What's unclear: Exact thumbnail sizes needed
   - Recommendation: Generate one thumbnail at 400x400 max (cover card use), serve the original for the detail page hero. This is Claude's discretion per CONTEXT.md.

3. **Series support in schema**
   - What we know: Design types include `seriesIds: string[]` on Chart. CONTEXT.md defers series to Phase 4.
   - What's unclear: Whether to include a placeholder seriesIds field or omit entirely
   - Recommendation: Omit series fields from the Phase 2 schema entirely. Add them in Phase 4's migration. This prevents unused fields cluttering the schema.

4. **userId on Project**
   - What we know: Auth.js v5 with JWT strategy. No User table in the database (single-user, credentials in env vars). The session returns `{ id: "1", name: "Stitcher", email }`.
   - What's unclear: Whether to store userId on Project at all since there's only one user
   - Recommendation: Store `userId String @default("1")` on Project for multi-user awareness. Hardcode "1" for now. When multi-user is added, the migration can update this.

## Sources

### Primary (HIGH confidence)
- [Cloudflare R2 AWS SDK v3 docs](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/) -- S3Client configuration, presigned URLs
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) -- Expiry limits (1s-7d), supported methods, domain restrictions
- [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/) -- CORS configuration, AllowedHeaders enumeration
- [Prisma Models docs](https://www.prisma.io/docs/orm/prisma-schema/data-model/models) -- Enum syntax, relations, implicit many-to-many
- Design reference components at `~/projects/cross-stitch-tracker-design/product-plan/sections/project-management/` -- types.ts (field definitions), ChartAddForm.tsx (form structure), FormFields.tsx (size category thresholds), StatusBadge.tsx (status colors)

### Secondary (MEDIUM confidence)
- [Prisma Next.js guide](https://www.prisma.io/docs/guides/frameworks/nextjs) -- Server Actions integration patterns
- npm registry -- verified package versions (@aws-sdk/client-s3@3.1019.0, nanoid@5.1.7, sharp@0.34.5)

### Tertiary (LOW confidence)
- None -- all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified on npm, R2 docs reviewed, patterns match established Phase 1 code
- Architecture: HIGH -- follows Next.js App Router conventions already established, Prisma patterns well-documented
- Pitfalls: HIGH -- R2 CORS and presigned URL issues are well-documented in official Cloudflare docs; sharp/Vercel issues are well-known

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- core patterns unlikely to change)
