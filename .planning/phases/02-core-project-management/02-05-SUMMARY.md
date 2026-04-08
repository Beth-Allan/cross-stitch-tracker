---
phase: 02-core-project-management
plan: 05
subsystem: verification
tags: [human-testing, uat, bug-fixes]

requires:
  - phase: 02-01
    provides: Prisma schema, R2 client, Zod validations
  - phase: 02-02
    provides: Chart CRUD server actions, upload actions
  - phase: 02-03
    provides: Chart form UI, inline entity creation
  - phase: 02-04
    provides: Chart detail page, list page, delete dialog
provides:
  - Human-verified chart lifecycle (create, view, edit, delete)
  - 8 bug fixes found during UAT
  - Confirmed graceful R2 degradation when unconfigured
---

# Plan 02-05 Summary: Human Verification

## What Was Done

Human verification of the full chart lifecycle (PROJ-01 through PROJ-05) in the browser. Found and fixed 8 issues during testing.

## Issues Found & Fixed

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | `buttonVariants()` runtime error on /charts | Server component importing from `"use client"` module (Next.js 16 boundary enforcement) | Extracted `buttonVariants` to shared `button-variants.ts` |
| 2 | "Add New" showed as `Add "new"` with smart quotes | Fallback `search \|\| "new"` produced literal text with HTML entities | Changed to plain `Add New` text |
| 3 | Adding designer triggered stitch count validation | React portal submit event bubbled through React tree to outer form | Added `e.stopPropagation()` in dialog submit handler |
| 4 | Dimensions showed "300 x 400" | Missing dimension labels | Changed to `300w × 400h` |
| 5 | Designer showed "by Name" | Wrong label prefix | Changed to `Designer: Name` |
| 6 | BAP badge grey on detail page | `SizeBadge` used hardcoded grey, not colored styling | Added `SIZE_COLORS` map matching form's colored badges |
| 7 | Delete dialog: destructive button visually dominant | "Keep Chart" used `ghost` variant (too subtle) | Changed to `outline` variant (retains `autoFocus`) |
| 8 | Next.js 16.2.1 showing "(stale)" | Patch update available | Updated to 16.2.2, pinned |

## Verification Results

| Requirement | Status | Notes |
|-------------|--------|-------|
| PROJ-01: Chart CRUD | Verified | Create, view, edit, delete all working |
| PROJ-02: Cover photo upload | Skipped | R2 not configured; graceful degradation confirmed |
| PROJ-03: Digital working copy | Skipped | R2 not configured; graceful degradation confirmed |
| PROJ-04: Status system | Verified | All 7 statuses work, immediate badge update |
| PROJ-05: Size category | Verified | Auto-calculation and colored badges working |

## Known Gaps

- **R2 uploads untested** — PROJ-02 and PROJ-03 upload paths need verification when R2 is configured (planned for deployment setup after Phase 4)
- **List view is basic table** — intentional; gallery card system is Phase 5

## Files Changed

- `src/components/ui/button-variants.ts` (new — shared CVA definitions)
- `src/components/ui/button.tsx` (imports from button-variants)
- `src/components/ui/link-button.tsx` (imports from button-variants)
- `src/components/features/charts/form-primitives/searchable-select.tsx` (Add New text)
- `src/components/features/charts/inline-designer-dialog.tsx` (stopPropagation)
- `src/components/features/charts/chart-detail.tsx` (designer label, dimensions, delete dialog)
- `src/components/features/charts/size-badge.tsx` (colored badges)
- `.claude/rules/base-ui-patterns.md` (documented buttonVariants pattern)
- `.claude/rules/bleeding-edge-libs.md` (documented Next.js 16 footgun)
- `package.json` (Next.js 16.2.2 pinned)

## Duration

Human verification session with 8 bug fixes applied inline.
