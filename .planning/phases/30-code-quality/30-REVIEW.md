---
phase: 30-code-quality
reviewed: 2026-05-24T15:10:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/app/(dashboard)/charts/[id]/page.tsx
  - src/app/globals.css
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/editable-number.tsx
  - src/components/features/charts/status-badge.tsx
  - src/components/features/charts/whats-next-tab.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/sessions/log-session-modal.tsx
  - src/components/features/supply-table/editable-number.tsx
  - src/components/features/supply-table/inline-create-dialog.tsx
  - src/components/features/supply-table/local-state-adapter.ts
  - src/components/hooks/use-rejection-flash.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/session-actions.ts
  - src/lib/actions/supply-actions.ts
  - src/lib/actions/upload-actions.ts
  - src/lib/constants.ts
  - src/lib/utils/status.ts
  - src/lib/validations/supply.ts
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 30: Code Review Report

**Reviewed:** 2026-05-24T15:10:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Phase 30 is a well-scoped code quality pass. The CSS variable migration is correctly structured, the `useRejectionFlash` hook extraction is clean with proper timer cleanup, the `DEFAULT_SUPPLY_HEX` constant extraction is complete (all 8 source occurrences migrated), and the silent-failure fixes add appropriate `console.error`/`console.warn` logging without breaking existing error flows.

The R2 orphan cleanup additions in session-actions and chart-actions are correctly placed (fire-and-forget with `.catch()` logging, only triggered after successful processing). The `darkBgClass` removal from `STATUS_CONFIG` is complete with no remaining consumers.

Two warnings found: a copy-paste error in dark mode CSS variables, and a semantic mismatch in the log-session-modal color replacement. One informational note on test coupling.

## Warnings

### WR-01: Dark mode `--status-on-hold-dot` and `--status-on-hold-text` are identical values

**File:** `src/app/globals.css:284-285`
**Issue:** Both `--status-on-hold-dot` and `--status-on-hold-text` are set to `oklch(0.837 0.128 66.29)` (orange-300). Every other status has distinct dot and text values in dark mode (dot is *-400, text is *-300). The original code used `bg-orange-400` with no dark override for the dot, meaning in dark mode the dot was orange-400 — a stronger, more saturated indicator. Setting both to orange-300 makes the progress dot and adjacent text visually indistinguishable.

This is also a regression from the original behavior: the dot was orange-400 in all modes previously, but is now orange-300 in dark mode.

**Fix:**
```css
  --status-on-hold-dot: oklch(0.75 0.183 55.934); /* orange-400 */
  --status-on-hold-text: oklch(0.837 0.128 66.29); /* orange-300 */
```

This aligns with the pattern used by all other statuses (dot one shade darker than text in dark mode).

### WR-02: Log-session-modal replaces semantic `text-primary` / `bg-primary/10` with status-specific colors

**File:** `src/components/features/sessions/log-session-modal.tsx:321,473,483`
**Issue:** The selected project highlight, "Replace photo" link, and "Add progress photo" hover state previously used `text-primary` / `bg-primary/10` (emerald, the app brand color). They now use `--status-in-progress-text` / `--status-in-progress-bg` (sky). Per D-04 this is intentional, but there is a functional concern: this modal is also used to LOG sessions for projects that are ON_HOLD (a user can log sessions for paused projects). Hardcoding "in-progress" status colors for all interactive elements in the modal creates a semantic disconnect when the user is editing a session for an on-hold or finished project.

If the intent is "use the stitching activity color regardless of project status," the current approach works but should have a code comment explaining this choice. If the intent is "match project status," the implementation needs to be dynamic.

**Fix:** Add a brief "why" comment at one of the usage sites:

```tsx
// Active stitching context — session logging is always an "in progress" activity
// regardless of the project's lifecycle status
className={`... ${
  project.projectId === selectedProjectId
    ? "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]"
    : "text-foreground"
}`}
```

Alternatively, consider reverting to `text-primary` / `bg-primary/10` for the interactive affordances (selected state, hover) since those represent UI selection state rather than domain status. The star icon and kitting bar in `whats-next-tab.tsx` are legitimate status color uses; the modal's interactive highlights are not.

## Info

### IN-01: Tests assert on CSS class strings containing arbitrary value syntax

**File:** `src/components/features/charts/status-badge.test.tsx:27`, `src/components/features/charts/project-detail/hero-status-badge.test.tsx:52`
**Issue:** Tests assert `toContain("bg-[var(--status-kitted-dot)]")` — coupling tests to Tailwind implementation details. If the CSS variable approach is ever refactored (e.g., moving to a `data-status` attribute or theme-aware utility classes), every test must be updated. Previously, tests asserted on the Tailwind class name (`bg-emerald-500`) which was equally coupled but to a more stable abstraction.

**Fix:** Consider testing the visual result via `getComputedStyle` in integration tests, or accept this coupling as intentional (tests verify the CSS variable migration is wired correctly). No action required — this is a tradeoff acknowledgment.

---

_Reviewed: 2026-05-24T15:10:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
