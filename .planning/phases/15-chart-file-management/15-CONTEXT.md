# Phase 15: Chart File Management - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage multiple digital working copy files per chart instead of a single URL. Includes schema migration from `digitalWorkingCopyUrl` to a `ChartFile` table, upload during chart creation, and a file management interface on the project detail page.

</domain>

<decisions>
## Implementation Decisions

### File metadata & schema
- **D-01:** New `ChartFile` table with fields: id, chartId, url, filename, mimeType, fileSize, label (optional, defaults to filename), notes (optional), createdAt
- **D-02:** Label is optional — defaults to original filename if not provided
- **D-03:** No manual sort order — files display chronologically (newest first by createdAt)
- **D-04:** Allowed file types are an explicit allowlist: JPEG, PNG, WebP (images), PDF (documents), .pat (PCStitch), .xsd (Pattern Maker), .css (CrossStitch), .saga (Saga)

### Add/remove UX
- **D-05:** File upload is available during chart creation (in the merged form) — multi-file input with `multiple` attribute
- **D-06:** Full file management (listing, deletion, editing labels/notes) lives on project detail overview tab only
- **D-07:** Deletion requires a confirmation dialog before removing
- **D-08:** Multi-file upload supported (select multiple files at once)

### Display on project detail
- **D-09:** Keep the kitting checklist item — shows "✓ Digital Copy — N files attached" (or "Not uploaded")
- **D-10:** Full file list appears in its own section below the kitting card
- **D-11:** Each file displays as a compact row: file-type icon + label + file size
- **D-12:** Clicking a file row directly downloads/opens in new tab (PDFs open, others download)

### Migration strategy
- **D-13:** Auto-migrate existing `digitalWorkingCopyUrl` data to ChartFile rows (label defaults to "Working Copy")
- **D-14:** Drop the `digitalWorkingCopyUrl` column immediately after data migration — clean break, no deprecated field

### Claude's Discretion
- File-type icon design (can use simple emoji or SVG icons based on MIME type)
- Exact upload progress indicator style
- Presigned URL generation pattern (follow existing `upload-actions.ts` conventions)
- R2 key naming scheme for chart files
- Error handling UX for failed uploads

</decisions>

<specifics>
## Specific Ideas

- Pattern file formats (.pat, .xsd, .css, .saga) are cross-stitch software specific — the allowlist reflects actual stitcher workflows
- The current single-URL flow in `use-chart-form.ts` maps `digitalFileUrl` → `digitalWorkingCopyUrl` — this needs to become multi-file aware
- With 500+ charts, some may already have `digitalWorkingCopyUrl` populated — migration must preserve these

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & data model
- `prisma/schema.prisma` — Current Chart model (line 41-63), `digitalWorkingCopyUrl` field to be replaced
- `.planning/REQUIREMENTS.md` — FILE-01, FILE-02, FILE-03 requirements

### Existing upload infrastructure
- `src/lib/actions/upload-actions.ts` — Presigned URL generation, field-based chart update pattern, file validation
- `src/lib/r2.ts` — R2 client setup, bucket configuration
- `src/lib/validations/upload.ts` — Existing upload validation schemas and allowed types

### Current UI integration points
- `src/components/features/charts/project-detail/overview-tab.tsx` — Kitting section with digital copy status (line 112-113)
- `src/components/features/charts/use-chart-form.ts` — Chart form hook, `digitalFileUrl` → `digitalWorkingCopyUrl` mapping (line 117)
- `src/components/features/charts/project-detail/types.ts` — ProjectDetail type with `digitalWorkingCopyUrl` field (line 64)

### Test mocks
- `src/__tests__/mocks/factories.ts` — Chart mock factory includes `digitalWorkingCopyUrl` (line 144)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `upload-actions.ts` presigned URL pattern: generates URL → client uploads → server updates DB field. Extend for ChartFile creation.
- `getR2Client()` / `R2_BUCKET_NAME` in `src/lib/r2.ts` — existing R2 infrastructure, no new setup needed
- `uploadRequestSchema` in `src/lib/validations/upload.ts` — extend ALLOWED_FILE_TYPES with pattern formats
- Existing `ALLOWED_IMAGE_TYPES` covers JPEG/PNG/WebP already

### Established Patterns
- File uploads use presigned URLs (no server-side file handling) — keep this pattern
- `VALID_CHART_FIELDS` array in upload-actions.ts gates which fields can be updated — pattern needs rethinking for multi-file
- Server actions use `requireAuth()` + Zod validation at boundary
- Confirmation dialogs exist in the codebase (used for project deletion)

### Integration Points
- Chart creation form (`use-chart-form.ts`) — needs multi-file upload field instead of single URL
- Chart actions (`chart-actions.ts` lines 42, 248) — create/update chart writes `digitalWorkingCopyUrl`, needs ChartFile creation instead
- Overview tab (`overview-tab.tsx`) — add file list section below kitting card
- ~15 files reference `digitalWorkingCopyUrl` — all need updating during migration

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-chart-file-management*
*Context gathered: 2026-05-16*
