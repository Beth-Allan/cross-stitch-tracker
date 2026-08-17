# Phase 15: Chart File Management - Research

**Researched:** 2026-05-16
**Domain:** File upload infrastructure, Prisma schema migration, multi-file UI
**Confidence:** HIGH

## Summary

This phase replaces a single `digitalWorkingCopyUrl` string field on the Chart model with a proper `ChartFile` table supporting multiple file attachments per chart. The existing R2 presigned-URL upload infrastructure, file validation schemas, and delete patterns provide nearly complete building blocks -- the main work is (1) schema migration with data preservation, (2) new server actions for ChartFile CRUD, (3) a multi-file upload component for the chart form, and (4) a file management section on the project detail page.

The codebase already handles single-file uploads via presigned URLs (generate URL, client PUTs directly to R2, server confirms and records the key). This pattern extends naturally to multi-file by creating a `ChartFile` record per upload rather than writing to a scalar column. The existing `ALLOWED_FILE_TYPES` already includes `application/octet-stream` for cross-stitch pattern formats, and `MAX_FILE_SIZE` is 10MB.

**Primary recommendation:** Add the `ChartFile` model to schema.prisma, run `prisma migrate dev` to generate and apply the migration (including a data migration step for existing `digitalWorkingCopyUrl` values), then build new server actions and UI components following established patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** New `ChartFile` table with fields: id, chartId, url, filename, mimeType, fileSize, label (optional, defaults to filename), notes (optional), createdAt
- **D-02:** Label is optional -- defaults to original filename if not provided
- **D-03:** No manual sort order -- files display chronologically (newest first by createdAt)
- **D-04:** Allowed file types are an explicit allowlist: JPEG, PNG, WebP (images), PDF (documents), .pat (PCStitch), .xsd (Pattern Maker), .css (CrossStitch), .saga (Saga)
- **D-05:** File upload is available during chart creation (in the merged form) -- multi-file input with `multiple` attribute
- **D-06:** Full file management (listing, deletion, editing labels/notes) lives on project detail overview tab only
- **D-07:** Deletion requires a confirmation dialog before removing
- **D-08:** Multi-file upload supported (select multiple files at once)
- **D-09:** Keep the kitting checklist item -- shows "check Digital Copy -- N files attached" (or "Not uploaded")
- **D-10:** Full file list appears in its own section below the kitting card
- **D-11:** Each file displays as a compact row: file-type icon + label + file size
- **D-12:** Clicking a file row directly downloads/opens in new tab (PDFs open, others download)
- **D-13:** Auto-migrate existing `digitalWorkingCopyUrl` data to ChartFile rows (label defaults to "Working Copy")
- **D-14:** Drop the `digitalWorkingCopyUrl` column immediately after data migration -- clean break, no deprecated field

### Claude's Discretion
- File-type icon design (can use simple emoji or SVG icons based on MIME type)
- Exact upload progress indicator style
- Presigned URL generation pattern (follow existing `upload-actions.ts` conventions)
- R2 key naming scheme for chart files
- Error handling UX for failed uploads

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FILE-01 | User can attach multiple digital working copy files to a single chart | ChartFile table (one-to-many on Chart), multi-file upload component, `addChartFiles` server action |
| FILE-02 | User can add/remove individual working copy files without affecting others | Independent ChartFile records, `deleteChartFile` server action with R2 cleanup, confirmation dialog |
| FILE-03 | User can see all attached working copies listed on the project detail page | `ChartFileList` component on overview tab, presigned download URLs generated server-side |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| File storage (bytes) | CDN / Static (R2) | -- | Files stored in Cloudflare R2 via presigned PUT |
| File metadata persistence | Database | -- | ChartFile records in PostgreSQL via Prisma |
| Upload orchestration | Browser / Client | API / Backend | Client uploads directly to R2; server generates presigned URL and confirms DB record |
| File listing & display | Frontend Server (SSR) | Browser / Client | Server fetches ChartFile records + generates presigned GET URLs; client handles interactions |
| File deletion | API / Backend | CDN / Static (R2) | Server action deletes DB record + R2 object |
| Schema migration | Database | -- | Prisma migrate creates table, moves data, drops old column |
| File type validation | Browser / Client | API / Backend | Client validates before upload; server validates in presigned URL generation |

## Standard Stack

### Core (already installed -- no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.7.0 (installed) / 7.8.0 (latest) | ORM, schema migration | Already used project-wide [VERIFIED: package.json] |
| @aws-sdk/client-s3 | 3.1033.0 | R2 file operations (PUT, GET, DELETE) | Already used in upload-actions.ts [VERIFIED: package.json] |
| @aws-sdk/s3-request-presigner | 3.1033.0 | Presigned URL generation | Already used in upload-actions.ts [VERIFIED: package.json] |
| Zod | 3.24.4 | Server action input validation | Already used project-wide [VERIFIED: package.json] |
| nanoid | 5.1.9 | Unique ID generation for R2 keys | Already used in upload-actions.ts [VERIFIED: package.json] |
| Lucide React | (installed) | FileText, FileCode, Image, File icons | Already used throughout UI [VERIFIED: codebase] |

### Supporting (no new installs needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast notifications for upload success/error | Upload completion feedback |
| sharp | 0.34.5 | NOT used for chart files (no image processing needed) | Only for cover images |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct R2 presigned URLs | Next.js API route upload | Presigned is already proven, avoids server memory pressure for large files |
| Storing full URLs in DB | Storing R2 keys (current pattern) | Keys are smaller, presigned URLs generated on demand with expiry -- already the established pattern |

**Installation:** No new packages required. Zero new dependencies.

## Architecture Patterns

### System Architecture Diagram

```
User selects files in browser
        |
        v
[Client: ChartFileUpload component]
        |
        | 1. For each file: call getPresignedUploadUrl(fileName, contentType, fileSize, "files", chartId)
        v
[Server Action: getPresignedUploadUrl]
        |
        | 2. Validates file type/size, generates R2 key, returns presigned PUT URL
        v
[Client: fetch(presignedUrl, { method: "PUT", body: file })]
        |
        | 3. Direct upload to R2 (bypasses server)
        v
[Cloudflare R2 Bucket]
        |
        | 4. Client calls addChartFile(chartId, key, filename, mimeType, fileSize)
        v
[Server Action: addChartFile]
        |
        | 5. Creates ChartFile record in DB, revalidates path
        v
[PostgreSQL: ChartFile table]
```

**Download flow:**
```
Server Component (page.tsx)
  -> Fetches ChartFile records for chart
  -> Generates presigned GET URLs for each file key
  -> Passes file list + URLs to client ChartFileList component
```

**Delete flow:**
```
User clicks delete -> Confirmation dialog -> deleteChartFile server action
  -> Verifies ownership (chart.project.userId === user.id)
  -> Deletes R2 object
  -> Deletes ChartFile record
  -> Revalidates path
```

### Recommended Project Structure

```
prisma/
  schema.prisma                    # Add ChartFile model
  migrations/                      # New migration with data migration SQL
src/
  lib/
    actions/
      chart-file-actions.ts        # NEW: addChartFile, deleteChartFile, getChartFiles
    validations/
      upload.ts                    # Update: add ALLOWED_CHART_FILE_EXTENSIONS
  components/features/charts/
    project-detail/
      chart-file-list.tsx          # NEW: File list section (client)
      chart-file-row.tsx           # NEW: Individual file row (client)
      file-type-icon.tsx           # NEW: Icon by MIME type (server-safe)
      delete-file-dialog.tsx       # NEW: Confirmation dialog (client)
      overview-tab.tsx             # MODIFY: Add file count to kitting, render file list
      types.ts                     # MODIFY: Update ProjectDetailProps
    form-primitives/
      chart-file-upload.tsx        # NEW: Multi-file upload for creation form
      file-upload.tsx              # DEPRECATE/REMOVE: Old single-file upload
    chart-merged-form.tsx          # MODIFY: Replace FileUpload with ChartFileUpload
    use-chart-form.ts             # MODIFY: Remove digitalFileUrl, add file handling
  types/
    chart.ts                       # MODIFY: Remove digitalWorkingCopyUrl from types
```

### Pattern 1: ChartFile Model Schema

**What:** New Prisma model for file metadata
**When to use:** Always -- this is the core data model change

```prisma
// Source: Derived from D-01 + existing Prisma patterns in schema.prisma
model ChartFile {
  id        String   @id @default(cuid())
  chart     Chart    @relation(fields: [chartId], references: [id], onDelete: Cascade)
  chartId   String
  url       String   // R2 storage key (not a full URL)
  filename  String   // Original filename
  mimeType  String
  fileSize  Int      // Bytes
  label     String?  // Optional display label; defaults to filename in UI
  notes     String?  // Optional notes
  createdAt DateTime @default(now())

  @@index([chartId])
}
```

Chart model gains: `files ChartFile[]` relation and loses `digitalWorkingCopyUrl`.

### Pattern 2: Server Action for File Addition

**What:** Create ChartFile record after successful R2 upload
**When to use:** After client confirms file is in R2

```typescript
// Source: Following existing confirmUpload pattern in upload-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

const addChartFileSchema = z.object({
  chartId: z.string().min(1),
  url: z.string().min(1),         // R2 key
  filename: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  label: z.string().trim().max(255).nullable().default(null),
});

export async function addChartFile(input: unknown) {
  const user = await requireAuth();
  const validated = addChartFileSchema.parse(input);

  // Verify ownership
  const chart = await prisma.chart.findUnique({
    where: { id: validated.chartId },
    select: { id: true, project: { select: { userId: true } } },
  });
  if (!chart || chart.project?.userId !== user.id) {
    return { success: false as const, error: "Chart not found" };
  }

  const file = await prisma.chartFile.create({
    data: {
      chartId: validated.chartId,
      url: validated.url,
      filename: validated.filename,
      mimeType: validated.mimeType,
      fileSize: validated.fileSize,
      label: validated.label,
    },
  });

  revalidatePath(`/charts/${validated.chartId}`);
  return { success: true as const, file };
}
```

### Pattern 3: Multi-File Upload Component

**What:** Client component with `<input type="file" multiple>` that uploads files sequentially or in parallel
**When to use:** In chart creation form and project detail page

Key behaviors:
- Accept attribute matches ALLOWED_FILE_TYPES + extension hints (.pat, .xsd, .css, .saga)
- Each file gets its own presigned URL, uploads independently
- Track per-file upload state (idle/uploading/complete/error)
- On completion, call `addChartFile` for each successful upload
- During chart CREATION: files upload to R2 with a temporary key, then get linked after chart is created

### Pattern 4: Data Migration

**What:** SQL migration to move existing `digitalWorkingCopyUrl` data into ChartFile records
**When to use:** Part of the schema migration

```sql
-- After creating ChartFile table:
INSERT INTO "ChartFile" ("id", "chartId", "url", "filename", "mimeType", "fileSize", "label", "createdAt")
SELECT
  gen_random_uuid()::text,
  "id",
  "digitalWorkingCopyUrl",
  'Working Copy',
  'application/octet-stream',
  0,
  'Working Copy',
  CURRENT_TIMESTAMP
FROM "Chart"
WHERE "digitalWorkingCopyUrl" IS NOT NULL;

-- Then drop the column:
ALTER TABLE "Chart" DROP COLUMN "digitalWorkingCopyUrl";
```

Note: `fileSize` is 0 for migrated records since we don't know the actual size of existing files. The `id` generation uses PostgreSQL's `gen_random_uuid()` cast to text -- but since the project uses `cuid()`, we should use a Prisma seed script or `nanoid`-style generation instead. The planner should decide between:
1. SQL-only migration (simplest, use `gen_random_uuid()` which produces valid text IDs)
2. Prisma seed script for data migration (more control, proper cuid generation)

### Anti-Patterns to Avoid

- **Storing full presigned URLs in the database:** URLs expire. Store R2 keys only; generate presigned URLs on demand.
- **Uploading through the Next.js server:** Use presigned PUT URLs for direct client-to-R2 upload. Avoids server memory/timeout issues with large files.
- **Deleting R2 files without deleting DB records (or vice versa):** Always do both in the same action. If R2 delete fails, log but don't block DB deletion (file becomes orphaned but user isn't stuck).
- **Nested forms for file upload in chart creation:** The chart form is already a `<form>`. File upload must use `<input>` within the existing form or be triggered via button click handlers.
- **Blocking chart creation on file upload completion:** Files can be added after chart creation. During create flow, upload files then link them post-creation using the returned chartId.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Presigned URL generation | Custom signing logic | `@aws-sdk/s3-request-presigner` | Already working in `upload-actions.ts` |
| File type validation | Custom MIME detection | Browser `File.type` + accept attribute + server-side allowlist | Browser provides MIME; server validates |
| Confirmation dialog | Custom modal | Existing `Dialog` component + `DeleteConfirmationDialog` pattern | Battle-tested pattern in codebase |
| Unique file key generation | Custom UUID logic | `nanoid` (already used) | Collision-resistant, URL-safe |
| File size formatting | Manual byte conversion | Small utility function (bytes to KB/MB) | Trivial but consistent |

**Key insight:** This phase has zero new npm dependencies. Every building block exists -- the work is composition and wiring, not invention.

## Common Pitfalls

### Pitfall 1: Chart Creation Race Condition
**What goes wrong:** Files are uploaded to R2 before the chart exists (no chartId yet), so the presigned URL uses a placeholder key or the `addChartFile` call has no valid chartId.
**Why it happens:** The creation form allows file upload before form submission, but the chart doesn't exist until the form submits.
**How to avoid:** Two approaches: (a) Upload with a temporary/placeholder key (e.g., `files/unsaved/{nanoid}-filename`) then move/re-key after chart creation, or (b) Upload to R2 during form interaction but only create ChartFile records after `createChart` returns the chartId. Option (b) is simpler -- store R2 keys in component state, pass them to `createChartWithFiles`.
**Warning signs:** "Chart not found" errors during file upload in creation flow.

### Pitfall 2: MIME Type for Pattern Files
**What goes wrong:** Cross-stitch pattern files (.pat, .xsd, .css, .saga) all report as `application/octet-stream` from the browser's File API. The `.css` extension confusingly maps to `text/css` MIME type.
**Why it happens:** These are proprietary binary formats without registered MIME types. Browser guesses based on extension.
**How to avoid:** Validate by file extension in addition to MIME type. Accept `application/octet-stream` AND `text/css` for .css files. The existing `ALLOWED_FILE_TYPES` already includes `application/octet-stream`.
**Warning signs:** Users can't upload .css CrossStitch files because the browser reports them as `text/css`.

### Pitfall 3: Migration Ordering
**What goes wrong:** Dropping `digitalWorkingCopyUrl` before data migration causes data loss. Or, the migration is applied to production before the new code is deployed, causing `Chart.digitalWorkingCopyUrl` reads to fail.
**Why it happens:** Schema and code deploy at the same time on Vercel, but if the migration runs first, old code can't read the removed column.
**How to avoid:** Since this deploys atomically on Vercel (code + DB migrate together via `prisma migrate deploy`), this is only a risk during local development. Use a single migration file that (1) creates ChartFile table, (2) migrates data, (3) drops column -- all in one transaction.
**Warning signs:** "Unknown column digitalWorkingCopyUrl" errors after migration.

### Pitfall 4: Orphaned R2 Files on Chart Deletion
**What goes wrong:** When a chart is deleted (via `deleteChart`), the ChartFile records are cascade-deleted by Prisma, but the actual files in R2 remain as orphans.
**Why it happens:** `onDelete: Cascade` only handles DB records, not storage.
**How to avoid:** Update `deleteChart` to first fetch all ChartFile URLs, delete R2 objects, then delete the chart. Or accept orphans and add a cleanup job later. For MVP, logging a warning is acceptable.
**Warning signs:** R2 storage growing without bound after chart deletions.

### Pitfall 5: Forgetting to Update All `digitalWorkingCopyUrl` References
**What goes wrong:** After migration, some file still references `digitalWorkingCopyUrl` and causes TypeScript errors or runtime failures.
**Why it happens:** ~15 files reference this field (types, actions, components, tests, mocks).
**How to avoid:** Let TypeScript catch it -- after removing the field from schema.prisma and regenerating the Prisma client, all references will fail type-checking. Fix them methodically.
**Warning signs:** `npm run build` fails with type errors after schema change.

## Code Examples

### File Size Formatter

```typescript
// Source: Common utility pattern
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
```

### FileTypeIcon Component (from UI-SPEC)

```typescript
// Source: 15-UI-SPEC.md + Lucide icon library
import { File, FileCode, FileText, Image } from "lucide-react";

const ICON_MAP: Record<string, { icon: typeof File; className: string }> = {
  "application/pdf": { icon: FileText, className: "text-red-500" },
  "image/jpeg": { icon: Image, className: "text-blue-500" },
  "image/png": { icon: Image, className: "text-blue-500" },
  "image/webp": { icon: Image, className: "text-blue-500" },
};

// Extension-based fallback for pattern files (all report as application/octet-stream)
const EXT_ICON = { icon: FileCode, className: "text-purple-500" };
const PATTERN_EXTENSIONS = [".pat", ".xsd", ".css", ".saga"];

export function FileTypeIcon({ mimeType, filename }: { mimeType: string; filename: string }) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const mapped = ICON_MAP[mimeType];
  if (mapped) {
    const Icon = mapped.icon;
    return <Icon className={`size-4 ${mapped.className}`} aria-hidden="true" />;
  }
  if (PATTERN_EXTENSIONS.includes(ext)) {
    const Icon = EXT_ICON.icon;
    return <Icon className={`size-4 ${EXT_ICON.className}`} aria-hidden="true" />;
  }
  return <File className="text-muted-foreground size-4" aria-hidden="true" />;
}
```

### Delete File Dialog (following existing pattern)

```typescript
// Source: Adapted from src/components/features/designers/delete-confirmation-dialog.tsx
"use client";

import { useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onConfirm: () => Promise<void>;
}

export function DeleteFileDialog({ open, onOpenChange, filename, onConfirm }: DeleteFileDialogProps) {
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
          <DialogTitle>Remove Working Copy</DialogTitle>
          <DialogDescription>
            This will permanently delete &ldquo;{filename}&rdquo; from this chart. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete File"}
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
| Single `digitalWorkingCopyUrl` on Chart | `ChartFile` table (one-to-many) | This phase | Supports multiple files per chart |
| `confirmUpload` writes to Chart column | `addChartFile` creates dedicated record | This phase | Decoupled file tracking from chart fields |
| `VALID_CHART_FIELDS` gating in confirmUpload | Not needed for chart files | This phase | Chart file uploads bypass the old field-update pattern |

**Deprecated/outdated after this phase:**
- `digitalWorkingCopyUrl` field on Chart model (removed)
- `FileUpload` component (single-file, replaced by `ChartFileUpload`)
- `confirmUpload` action for working copies (replaced by `addChartFile`)
- `VALID_CHART_FIELDS` entry for `digitalWorkingCopyUrl` (removed)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `gen_random_uuid()` is available in Neon PostgreSQL for data migration | Architecture Patterns (Pattern 4) | Migration SQL fails; use Prisma seed script instead |
| A2 | Cross-stitch .css files report as `text/css` from browser File API | Common Pitfalls (Pitfall 2) | Users blocked from uploading .css pattern files if we only accept `application/octet-stream` |
| A3 | R2 delete failures are non-critical (orphaned files acceptable for MVP) | Common Pitfalls (Pitfall 4) | Storage grows unbounded; add cleanup later |

## Open Questions

1. **Chart creation file upload timing**
   - What we know: Chart doesn't have an ID until form submits. Current `FileUpload` uses `projectId: chartId || "unsaved"` as the R2 key prefix.
   - What's unclear: Should we keep the "unsaved" prefix pattern or upload with a temp prefix and then not bother moving files (R2 keys are opaque)?
   - Recommendation: Keep the "unsaved" prefix for creation-flow uploads. After chart is created, pass the uploaded keys + metadata to `addChartFile` with the real chartId. The R2 key retains "unsaved" in the path but this is invisible to users. Simpler than moving files in R2.

2. **File count in gallery/kitting queries**
   - What we know: The kitting checklist needs file count. Currently it checks `!!chart.digitalWorkingCopyUrl`.
   - What's unclear: Should we eager-load file count with `_count` in the main chart query, or separate query?
   - Recommendation: Use Prisma `_count` on the `files` relation in `getChart()`. This adds minimal overhead and avoids a second query.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILE-01 | addChartFile creates record with correct fields | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "creates"` | No (Wave 0) |
| FILE-01 | Multi-file upload component handles multiple files | unit | `npx vitest run src/components/features/charts/form-primitives/chart-file-upload.test.tsx` | No (Wave 0) |
| FILE-02 | deleteChartFile removes record + R2 object | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "delete"` | No (Wave 0) |
| FILE-02 | deleteChartFile rejects unauthorized user | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "unauthorized"` | No (Wave 0) |
| FILE-02 | Delete dialog shows filename and confirms | unit | `npx vitest run src/components/features/charts/project-detail/delete-file-dialog.test.tsx` | No (Wave 0) |
| FILE-03 | ChartFileList renders file rows with correct data | unit | `npx vitest run src/components/features/charts/project-detail/chart-file-list.test.tsx` | No (Wave 0) |
| FILE-03 | Overview tab shows file count in kitting checklist | unit | `npx vitest run src/components/features/charts/project-detail/overview-tab.test.tsx -t "file"` | Partial (existing test file) |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/actions/chart-file-actions.test.ts` -- covers FILE-01, FILE-02
- [ ] `src/components/features/charts/form-primitives/chart-file-upload.test.tsx` -- covers FILE-01
- [ ] `src/components/features/charts/project-detail/chart-file-list.test.tsx` -- covers FILE-03
- [ ] `src/components/features/charts/project-detail/delete-file-dialog.test.tsx` -- covers FILE-02

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` on all server actions |
| V3 Session Management | no | N/A (handled at app level) |
| V4 Access Control | yes | Ownership check: `chart.project.userId === user.id` before any file operation |
| V5 Input Validation | yes | Zod schemas at server action boundary; file type + size validation |
| V6 Cryptography | no | N/A (using R2 presigned URLs with built-in signing) |

### Known Threat Patterns for File Upload

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unrestricted file upload (malicious executable) | Tampering | Strict allowlist of MIME types + extension validation; no server-side execution |
| Path traversal in filename | Tampering | Sanitize filename (strip `/` and `\`); already done in `getPresignedUploadUrl` |
| IDOR: accessing other user's files | Elevation of Privilege | Ownership verification via `chart.project.userId` before any operation |
| Storage exhaustion (unlimited uploads) | Denial of Service | 10MB per-file limit; consider per-chart file count limit (not in requirements but recommended) |
| Presigned URL reuse/sharing | Information Disclosure | 10-minute PUT expiry, 1-hour GET expiry; URLs are per-key |

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` -- Current Chart model structure [VERIFIED: codebase read]
- `src/lib/actions/upload-actions.ts` -- Existing presigned URL pattern [VERIFIED: codebase read]
- `src/lib/validations/upload.ts` -- File type allowlist, size limits [VERIFIED: codebase read]
- `src/components/features/charts/form-primitives/file-upload.tsx` -- Existing single-file upload [VERIFIED: codebase read]
- `src/components/features/designers/delete-confirmation-dialog.tsx` -- Delete dialog pattern [VERIFIED: codebase read]
- `15-UI-SPEC.md` -- Approved visual/interaction contract [VERIFIED: codebase read]
- `15-CONTEXT.md` -- Locked implementation decisions [VERIFIED: codebase read]
- Context7 `/prisma/prisma` -- Migration syntax [VERIFIED: Context7 lookup]

### Secondary (MEDIUM confidence)
- `package.json` -- Verified installed versions of all libraries [VERIFIED: codebase read]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new deps
- Architecture: HIGH -- extending proven patterns (presigned URL upload, Prisma model, server actions)
- Pitfalls: HIGH -- identified from direct codebase analysis of existing upload flow + migration needs

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stable -- no external dependency changes expected)
