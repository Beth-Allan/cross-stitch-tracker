---
phase: 15-chart-file-management
reviewed: 2026-05-16T20:30:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/form-primitives/chart-file-upload.tsx
  - src/components/features/charts/form-primitives/chart-file-upload.test.tsx
  - src/components/features/charts/info-card.tsx
  - src/components/features/charts/project-detail/chart-file-list.tsx
  - src/components/features/charts/project-detail/chart-file-list.test.tsx
  - src/components/features/charts/project-detail/chart-file-row.tsx
  - src/components/features/charts/project-detail/delete-file-dialog.tsx
  - src/components/features/charts/project-detail/delete-file-dialog.test.tsx
  - src/components/features/charts/project-detail/file-type-icon.tsx
  - src/components/features/charts/project-detail/overview-tab.tsx
  - src/components/features/charts/project-detail/overview-tab.test.tsx
  - src/components/features/charts/project-detail/types.ts
  - src/components/features/charts/use-chart-form.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/chart-file-actions.ts
  - src/lib/actions/chart-file-actions.test.ts
  - src/lib/actions/upload-actions.ts
  - src/lib/actions/upload-actions.test.ts
  - src/lib/utils/format-file-size.ts
  - src/lib/utils/format-file-size.test.ts
  - src/lib/validations/chart.ts
  - src/lib/validations/upload.ts
  - src/scripts/migrate-working-copies.sql
  - src/types/chart.ts
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-05-16T20:30:00Z
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Phase 15 implements chart file management -- a ChartFile model, upload/download/delete server actions, file list UI on project detail, and integration into the chart creation form. The implementation is well-structured with proper auth guards, Zod validation, and ownership verification on all server actions. However, there is a critical MIME type mismatch between client and server validation that will cause `.css` cross-stitch pattern file uploads to fail silently, plus several warnings around accessibility, ownership edge cases, and missing keyboard support.

## Critical Issues

### CR-01: MIME type mismatch between client and server validation causes .css file uploads to fail

**File:** `src/lib/validations/upload.ts:5-11`
**Issue:** The server-side `ALLOWED_FILE_TYPES` array (used by `getPresignedUploadUrl` when `category === "files"`) does NOT include `"text/css"`. However, `ALLOWED_CHART_FILE_TYPES` (used by client-side validation in `chart-file-upload.tsx` and `chart-file-list.tsx`) DOES include `"text/css"`. This means `.css` cross-stitch pattern files pass client validation but are rejected by the server action with "Invalid file type", creating a broken upload flow where users see the upload start (spinner) then fail with an opaque error.

**Fix:**
```typescript
// src/lib/validations/upload.ts, line 5-11
export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream", // .saga, .oxs, .xsd (cross-stitch software formats)
  "text/css", // .css CrossStitch files report as text/css in browsers
] as const;
```

## Warnings

### WR-01: Ownership check fails open for charts without a project

**File:** `src/lib/actions/chart-file-actions.ts:38-39`
**Issue:** The ownership check `if (!chart || chart.project?.userId !== user.id)` correctly rejects when `chart` is null or when the project belongs to another user. However, the schema allows charts to exist without a project (`project Project?`). If a chart has no project (orphaned state), `chart.project` is `null`, so `chart.project?.userId` is `undefined`, and `undefined !== user.id` evaluates to `true` -- correctly blocking access. This is safe but relies on implicit truthiness. The same pattern at line 69 uses `file.chart.project?.userId !== user.id` which also handles the null case safely. No action strictly required, but explicit handling would be clearer.

**Fix:** This is actually safe as-is because `undefined !== "user-1"` is `true`, which triggers the rejection. However, adding an explicit check improves readability:
```typescript
if (!chart || !chart.project || chart.project.userId !== user.id) {
  return { success: false as const, error: "Chart not found" };
}
```

### WR-02: ChartFileRow has nested interactive elements inside role="link" (ARIA violation)

**File:** `src/components/features/charts/project-detail/chart-file-row.tsx:24-29`
**Issue:** The outer `div` has `role="link"` and `onClick`, but contains nested `<button>` elements for download and delete. This is an ARIA violation -- interactive elements must not be nested inside other interactive elements. Screen readers will not announce the nested buttons correctly. Additionally, the `div` with `role="link"` lacks `tabIndex={0}` and keyboard event handling (`onKeyDown` for Enter/Space), making it inaccessible to keyboard-only users.

**Fix:** Either use a proper `<a>` or `<button>` as the outer element with nested button handling via `stopPropagation` (already done), or restructure so the clickable area is separate from the action buttons:
```tsx
// Option: Make the row a regular div, add a separate clickable filename link
<div className="group flex min-h-10 items-center gap-2 rounded-sm px-2 py-2 hover:bg-muted">
  <FileTypeIcon ... />
  <button
    type="button"
    className="min-w-0 flex-1 truncate text-sm text-left hover:underline"
    onClick={() => onDownload(file.id)}
    aria-label={`Open ${file.filename}`}
  >
    {file.label || file.filename}
  </button>
  {/* action buttons remain as siblings, not nested */}
</div>
```

### WR-03: Stale closure risk in handleFileSelect for sequential uploads

**File:** `src/components/features/charts/form-primitives/chart-file-upload.tsx:175-188`
**Issue:** The `handleFileSelect` function captures `uploadedFiles` in its closure (via `useCallback` deps). When uploading multiple files sequentially in the loop, each call to `uploadSingleFile` completes and adds to `results`, but if another file selection happens while uploads are in-flight, `uploadedFiles` could be stale by the time `onFilesChange([...uploadedFiles, ...results])` is called at line 185. The result would be that previously uploaded files get dropped from the list.

**Fix:** Use a functional updater pattern or read the current state at the time of the call:
```typescript
// Instead of:
onFilesChange([...uploadedFiles, ...results]);

// Use a callback that receives current state:
// (requires onFilesChange to accept a callback, or read from a ref)
// Simplest fix: accumulate results and call once at the end (already done),
// but guard against concurrent calls with a ref:
const currentFilesRef = useRef(uploadedFiles);
currentFilesRef.current = uploadedFiles;
// ...then in handleFileSelect:
onFilesChange([...currentFilesRef.current, ...results]);
```

### WR-04: Migration script references column that no longer exists in schema

**File:** `src/scripts/migrate-working-copies.sql:7-17`
**Issue:** The migration script references `c."digitalWorkingCopyUrl"` which has been removed from `prisma/schema.prisma` in this same phase. The script's comment says "Run BEFORE dropping the digitalWorkingCopyUrl column from Chart" -- but since `prisma db push` (the project's migration strategy) will already have removed the column, the script order is unclear. If someone runs `prisma db push` first (as is standard in this project), the column is gone and this script will fail with a column-not-found error. The script should be run BEFORE the schema change is pushed, but there's no enforcement of this order.

**Fix:** Add explicit ordering documentation or convert to a Prisma migration that handles both steps atomically. At minimum, add a pre-flight check:
```sql
-- Add guard at top of script:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Chart' AND column_name = 'digitalWorkingCopyUrl'
  ) THEN
    RAISE NOTICE 'Column already dropped -- migration already applied or schema pushed first. Skipping.';
    RETURN;
  END IF;
  -- ...migration INSERT here...
END $$;
```

## Info

### IN-01: formatFileSize does not handle negative inputs

**File:** `src/lib/utils/format-file-size.ts:1-6`
**Issue:** `Math.log(negative)` returns `NaN`, causing the function to return `"NaN undefined"` for negative input. While Zod schemas enforce positive integers for `fileSize`, a defensive check would prevent confusing output if the function is reused elsewhere.

**Fix:**
```typescript
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
```

### IN-02: Module-level mutable counter in chart-file-upload.tsx

**File:** `src/components/features/charts/form-primitives/chart-file-upload.tsx:52-56`
**Issue:** `fileIdCounter` is module-level state that increments indefinitely. While this doesn't cause bugs (it's only used for React keys/local IDs), it persists across route navigations in the SPA. A more idiomatic approach would use a ref or `crypto.randomUUID()`.

**Fix:** Replace with `crypto.randomUUID()` or keep as-is (low impact):
```typescript
function generateFileId(): string {
  return `upload-${crypto.randomUUID()}`;
}
```

---

_Reviewed: 2026-05-16T20:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
