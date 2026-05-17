---
phase: 16-input-dashboard-fixes
fixed_at: 2026-05-17T22:04:00Z
review_path: .planning/phases/16-input-dashboard-fixes/16-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 16: Code Review Fix Report

**Fixed at:** 2026-05-17T22:04:00Z
**Source review:** .planning/phases/16-input-dashboard-fixes/16-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Non-null assertion crash in portal-autocomplete.tsx

**Files modified:** `src/components/features/supply-table/portal-autocomplete.tsx`
**Commit:** 7f152b2
**Applied fix:** Added `if (!anchorRef.current) return;` null guard inside `updatePosition` function. The non-null assertion (`!`) was unsafe because the function is registered as a scroll/resize event listener and could fire after the anchor element is unmounted.

### WR-01: Hardcoded color classes in spotlight-card.tsx

**Files modified:** `src/components/features/dashboard/spotlight-card.tsx`
**Commit:** b1fc17f
**Applied fix:** Replaced hardcoded `bg-emerald-500`/`text-emerald-600` on the progress bar with semantic `bg-primary`/`text-primary` tokens (which map to emerald in the theme). Added a comment documenting the amber accent as an intentional decorative exception since it has no semantic token equivalent.

### WR-02: Unused chartId prop in SuppliesTab

**Files modified:** `src/components/features/charts/project-detail/supplies-tab.tsx`, `src/components/features/charts/project-detail/project-detail-page.tsx`, `src/components/features/charts/project-detail/supplies-tab.test.tsx`
**Commit:** 63977b3
**Applied fix:** Removed `chartId: string` from SuppliesTabProps interface, removed `chartId={chart.id}` from the callsite in project-detail-page.tsx, and removed all `chartId="chart-1"` from test renders (14 instances).

### WR-03: Null designerName renders empty span in spotlight-card.tsx

**Files modified:** `src/components/features/dashboard/spotlight-card.tsx`
**Commit:** f509bf0
**Applied fix:** Wrapped the designer name span in `{project.designerName && (...)}` conditional rendering so it does not render an empty element that occupies flex gap space when designerName is null.

### WR-04: Duplicated display-item sorting logic

**Files modified:** `src/components/features/supply-table/portal-autocomplete.tsx`, `src/components/features/supply-table/supply-table-add-row.tsx`, `src/components/features/supply-table/portal-autocomplete.test.tsx`, `src/components/features/supply-table/supply-table-add-row.test.tsx`
**Commit:** f63f973
**Applied fix:** Removed the duplicated sorting `useMemo` from PortalAutocomplete and changed its `items` prop to `displayItems` (pre-sorted by parent). The parent SupplyTableAddRow now computes `displayItems` once and passes it to the portal, eliminating the risk of sort logic diverging between keyboard navigation and rendering. All tests updated and passing (34/34).

---

_Fixed: 2026-05-17T22:04:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
