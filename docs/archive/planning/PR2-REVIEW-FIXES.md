# PR #2 Review Fixes (2026-03-29)

Findings from 4-agent parallel review. Fix before merge.

## Critical (must fix)

### 1. Bare catch in getPresignedUploadUrl misreports all errors
- **File:** `src/lib/actions/upload-actions.ts:66-71`
- **Fix:** Separate Zod validation from R2 operations. Discriminate "not configured" from other errors. Log all errors.

### 2. Bare catch in getPresignedDownloadUrl — identical problem
- **File:** `src/lib/actions/upload-actions.ts:119-124`
- **Fix:** Same as #1.

### 3. getChart/getCharts propagate raw Prisma errors
- **File:** `src/lib/actions/chart-actions.ts:178-194`
- **Fix:** Add try/catch, log error server-side, throw sanitized error message.

### 4. getDesigners/getGenres same unguarded query problem
- **Files:** `src/lib/actions/designer-actions.ts:27`, `src/lib/actions/genre-actions.ts:27`
- **Fix:** Same as #3.

## High (should fix)

### 5. Zod .url() validation rejects R2 keys (functional bug)
- **File:** `src/lib/validations/chart.ts:8-10`
- **Fix:** Change `coverImageUrl`, `coverThumbnailUrl`, `digitalFileUrl` from `.url()` to `.string()` since R2 keys are storage paths, not URLs.

### 6. R2_BUCKET_NAME silently falls back to hardcoded default
- **File:** `src/lib/r2.ts:30`
- **Fix:** Log a warning when fallback is used, or validate alongside other R2 env vars.

### 7. use-chart-form.ts bare catch swallows error details
- **File:** `src/components/features/charts/use-chart-form.ts:240-241`
- **Fix:** Add error variable and `console.error` before showing generic message.

### 8. Zod status enum hardcoded instead of derived from PROJECT_STATUSES
- **File:** `src/lib/validations/chart.ts`
- **Fix:** Import `PROJECT_STATUSES` from `@/lib/utils/status` and use `z.enum(PROJECT_STATUSES as [string, ...string[]])`.

## Important (next session)

### 9. updateChart auth guard not tested
### 10. No success-path tests for createChart/updateChart
### 11. No tests for designer-actions.ts or genre-actions.ts
### 12. Upload constants (ALLOWED_FILE_TYPES, MAX_FILE_SIZE) not wired into schema
### 13. Duplicated effective stitch count logic in createChart and updateChart
