# Quick Task Plan: Wire generateThumbnail into cover upload flow

**Task:** 999.0.6 followup — Auto-generate thumbnails on cover upload + display fallback
**Date:** 2026-04-11
**Quick ID:** 260411-kip

## Problem

`generateThumbnail()` in `upload-actions.ts:218` exists but is never called. When a user uploads a cover image, `coverImageUrl` is saved but `coverThumbnailUrl` stays null. Charts show placeholder icons instead of thumbnails.

## Approach

Three changes:
1. **Wire generation**: Call `generateThumbnail` in `createChart`, `updateChart`, and `confirmUpload` when a cover image is saved
2. **Display fallback**: Resolve `coverImageUrl` as presigned URL fallback when `coverThumbnailUrl` is null (charts list page)
3. **Tests**: Verify generation is triggered and failures don't block saves

## Tasks

### Task 1: Tests for thumbnail generation wiring

**Files:** `src/lib/actions/chart-actions.test.ts` (new), `src/lib/actions/upload-actions.test.ts` (edit)

Tests to add:
- `createChart` calls `generateThumbnail` when `coverImageUrl` is provided
- `createChart` succeeds even when `generateThumbnail` fails
- `createChart` does NOT call `generateThumbnail` when `coverImageUrl` is null
- `updateChart` calls `generateThumbnail` when `coverImageUrl` changes
- `updateChart` does NOT call `generateThumbnail` when `coverImageUrl` unchanged
- `confirmUpload` calls `generateThumbnail` when field is "coverImageUrl"
- `confirmUpload` does NOT call `generateThumbnail` for other fields

### Task 2: Wire generateThumbnail into chart-actions.ts

**File:** `src/lib/actions/chart-actions.ts`

- Import `generateThumbnail` from upload-actions
- `createChart`: After `prisma.chart.create`, if `chart.coverImageUrl` is truthy, call `generateThumbnail(created.id, chart.coverImageUrl)` in try/catch (log error, don't fail save)
- `updateChart`: Add `coverImageUrl` to ownership check select. After update, if `chart.coverImageUrl` differs from existing, call `generateThumbnail(chartId, chart.coverImageUrl)` in try/catch

### Task 3: Wire generateThumbnail into confirmUpload

**File:** `src/lib/actions/upload-actions.ts`

- In `confirmUpload`: After successful DB update, if `input.field === "coverImageUrl"`, call `generateThumbnail(input.chartId, input.key)` in try/catch

### Task 4: Add coverImageUrl fallback in charts list

**Files:** `src/app/(dashboard)/charts/page.tsx`, `src/components/features/charts/chart-list.tsx`

- `page.tsx`: Resolve both `coverThumbnailUrl` AND `coverImageUrl` keys via `getPresignedImageUrls`
- `chart-list.tsx`: Prefer thumbnail URL, fall back to cover image URL when thumbnail is null

## Out of Scope

- Designer/genre detail pages (pre-existing issue: they use raw R2 keys as img src, not presigned URLs)
- Backfill script for existing charts (fallback handles display; thumbnails auto-generate on next edit)
