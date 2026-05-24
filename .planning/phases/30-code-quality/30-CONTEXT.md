# Phase 30: Code Quality - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminate technical debt across the codebase: resolve remaining TypeScript errors, replace silent error patterns with proper logging/feedback, clean up R2 photo orphans on replace, centralize status colors as CSS custom properties, and extract shared constants and hooks. No new features, no new pages — pure code quality improvements on existing shipped code.

Requirements: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06

</domain>

<decisions>
## Implementation Decisions

### Status color centralization (QUAL-04)
- **D-01:** Define CSS custom properties for all 7 statuses in `globals.css` using oklch color space. Light and dark variants defined in `:root` and `.dark` selectors respectively. Properties named `--status-{name}-bg`, `--status-{name}-dot`, `--status-{name}-text`.
- **D-02:** Update `STATUS_CONFIG` in `src/lib/utils/status.ts` to reference CSS variables via `bg-[var(--status-kitting-bg)]` syntax instead of raw Tailwind classes (`bg-amber-50`).
- **D-03:** All status color consumers must be updated: `status-badge.tsx`, `gallery-card.tsx` (completion bar), `bucket-project-row.tsx`, `whats-next-tab.tsx`, and `log-session-modal.tsx` (6 emerald locations). All consume from `STATUS_CONFIG`.
- **D-04:** The emerald classes in `log-session-modal.tsx` represent the IN_PROGRESS status color (active stitching), not a generic accent. Unify with `--status-in-progress-*` variables.
- **D-05:** SIZE_COLORS in `size-category.ts` stay as Tailwind classes — already centralized in one file, no scattered duplicates to fix. Out of scope for CSS variable treatment.

### Silent failure cleanup (QUAL-02)
- **D-06:** Scope limited to the 3 QUAL-02 targets only: `upload-actions.ts:155`, `charts/[id]/page.tsx:50`, and `log-session-modal.tsx:166,229,249`. Do not expand to the ~20 client-component `catch {}` blocks (those are optimistic UI rollbacks with toast feedback already).
- **D-07:** All 3 locations get `console.error` added for developer debugging visibility.
- **D-08:** `log-session-modal.tsx` catch blocks additionally get `toast.error()` for user feedback (modal already imports toast from sonner).
- **D-09:** Chart page `.catch(() => null)` on completion estimate: add `console.error` but keep returning `null` — the page still loads without the estimate section. Graceful degradation is correct for non-critical data.

### R2 photo orphan handling (QUAL-03)
- **D-10:** When a session photo is replaced (new `photoKey !== existing.photoKey`), delete the old photo from R2 AFTER the new photo is successfully optimized and the DB is updated. Fire-and-forget with `console.warn` on failure (same pattern as raw file cleanup).
- **D-11:** Scope includes both session photo replacement AND chart cover photo replacement — same pattern, same fix shape, two action files.
- **D-12:** If the old photo delete fails, log and move on. No retry mechanism — orphans from failed deletes are acceptable at this scale (single user, rare operation).

### Shared extractions (QUAL-05, QUAL-06)
- **D-13:** `DEFAULT_SUPPLY_HEX` (`"#79796e"`) extracted to `src/lib/constants.ts`. All 8 source file occurrences updated to import from there. Test files can reference the constant too for consistency.
- **D-14:** `useRejectionFlash` hook extracted to `src/components/hooks/use-rejection-flash.ts`. Returns `{ showRejection, triggerRejection }`. Optional `duration` param (default 600ms). Both `charts/editable-number.tsx` and `supply-table/editable-number.tsx` consume it.

### TypeScript error fix (QUAL-01)
- **D-15:** The original 18 errors in 3 test files (dashboard-tabs, chart-actions, shopping-cart-actions) are already resolved from prior phases. Only 1 remaining error in `status-groups.test.ts:36` — fix with `as unknown as StatusGroup[]` cast pattern for intentionally-invalid test input.

### Claude's Discretion
- Test strategy and plan structure/grouping.
- Exact oklch color values for the CSS custom properties (match current visual appearance of Tailwind classes).
- Whether to create `src/lib/constants.ts` as a new file or add to an existing constants location.
- Ordering of work across plans (parallel where possible).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Status colors
- `src/lib/utils/status.ts` — STATUS_CONFIG with current Tailwind class definitions for all 7 statuses
- `src/app/globals.css` — Where CSS custom properties will be defined
- `.claude/rules/base-ui-patterns.md` §Semantic design tokens — Token naming conventions

### Silent failures
- `src/lib/actions/upload-actions.ts` — Line 155, silent `.catch(() => {})`
- `src/app/(dashboard)/charts/[id]/page.tsx` — Line 50, `.catch(() => null)` on estimate
- `src/components/features/charts/log-session-modal.tsx` — Lines 166, 229, 249, bare `catch {}`

### R2 photo handling
- `src/lib/actions/session-actions.ts` — Lines 193-209 (photo replace logic), line 263 (delete cleanup)
- `src/lib/actions/chart-actions.ts` — Chart cover photo update flow
- `src/lib/actions/upload-actions.ts` — `deleteFile` and `processAndStoreImage` functions

### Shared extractions
- `src/components/features/charts/editable-number.tsx` — Rejection flash pattern (lines 30-62)
- `src/components/features/supply-table/editable-number.tsx` — Duplicate rejection flash (lines 36-77)
- `src/lib/validations/supply.ts` — Line 109, `#79796e` default
- `src/lib/actions/supply-actions.ts` — Lines 778, 830, `#79796e` fallback

### TypeScript error
- `src/lib/utils/status-groups.test.ts` — Line 36, intentionally-invalid type cast

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `STATUS_CONFIG` in `status.ts`: Already the single config object for status metadata — just needs CSS variable values instead of raw classes
- `deleteFile` in `upload-actions.ts`: R2 deletion utility already exists and is used elsewhere with `.catch(err => console.warn(...))`
- `toast` from sonner: Already imported in log-session-modal for success feedback

### Established Patterns
- Fire-and-forget R2 cleanup: `deleteFile(key).catch(err => console.warn("[R2]...", key, err))` — used in session-actions delete and raw file cleanup
- CSS custom properties: `globals.css` already defines `--background`, `--foreground`, `--card`, etc. for the design system
- Hook extraction: Project has `src/components/hooks/` as a pattern (e.g., `use-gallery-filters.ts` exists in features/)

### Integration Points
- `globals.css` `:root` / `.dark` selectors — add status color properties alongside existing design tokens
- `STATUS_CONFIG` consumers — 5 component files currently import and use this config
- `src/lib/constants.ts` — new file, but follows `src/lib/` organization pattern

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 30-Code Quality*
*Context gathered: 2026-05-24*
