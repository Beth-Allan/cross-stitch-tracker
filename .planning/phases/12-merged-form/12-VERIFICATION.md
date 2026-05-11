---
phase: 12-merged-form
verified: 2026-05-11T22:08:00Z
status: human_needed
score: 4/4 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Visually confirm section dividers are visible between field groups"
    expected: "Four subtle horizontal lines separate Identity / Pattern / Workflow / Timeline groups"
    why_human: "WR-01 from code review: <hr> elements carry both border-t and border-none classes. border-none may override border-t in Tailwind v4 CSS source order, causing dividers to be completely invisible. Automated tests only check DOM presence (querySelectorAll('hr').length === 4), not rendering."
  - test: "Complete Task 3 visual checkpoint — full form review at /charts/new"
    expected: "All checklist items in Plan 03 Task 3 pass: title, back link, 720px layout, required dots, PatternTypeCards behavior, FileUpload presence, milestone marker, sticky save bar, Save Draft flow, draft restore toast"
    why_human: "Plan 03 Task 3 is a blocking human-verify checkpoint that was explicitly left pending in 12-03-SUMMARY.md. No automated substitute exists for visual and interactive UX verification."
---

# Phase 12: Merged Form Verification Report

**Phase Goal:** Users can create a chart+project through a single continuous page with clear field grouping and a polished form experience
**Verified:** 2026-05-11T22:08:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| SC-1 | User fills out chart+project fields on a single scrolling page (720px max-width) with field groups separated by dividers — no chart/project split | VERIFIED | `chart-merged-form.tsx:178` — `max-w-[720px]`, 4 field groups (Identity/Pattern/Workflow/Timeline) with `<hr>` dividers. Integration test "renders 4 section dividers" passes. Page at `/charts/new` renders `ChartMergedForm` (not `ChartAddForm`). |
| SC-2 | User selects pattern type via a 2x2 card grid and sees relevant sub-fields expand based on selection | VERIFIED | `pattern-type-cards.tsx` — 2×2 grid with Paper/Digital (radio) and Kit/SAL (checkbox). Kit card expands `Colours in kit` input via `max-h-20/max-h-0` CSS transition. 12 passing tests verify mutual exclusion, independent toggles, expand/collapse. Wired in `chart-merged-form.tsx:262-274`. |
| SC-3 | User sees green dot indicators on required fields (Chart Name, Status) and a sticky save bar at the bottom with Save Draft and Create buttons | VERIFIED | `form-field.tsx:28-33` — `bg-primary` 6px rounded-full before label, no red asterisk. Chart Name and Status have `required` prop. `sticky-save-bar.tsx` — `role="toolbar"`, contextual hint text, Save Draft and Create buttons with disabled states. 9 passing sticky bar tests + integration tests confirm both required dots and save bar render. |
| SC-4 | User can upload a digital working copy in the Workflow section of the form | VERIFIED | `chart-merged-form.tsx:350-355` — `<FileUpload onUploadComplete={(key) => form.setField("digitalFileUrl", key)} onRemove={() => form.setField("digitalFileUrl", null)} />` in Workflow group. Integration test "renders FileUpload for digital working copy" passes. |

**Score: 4/4 truths verified**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/features/charts/form-primitives/pattern-type-cards.tsx` | 2x2 card selector with radio/checkbox hybrid | VERIFIED | 162 lines, exports `PatternTypeCards`, full ARIA (`role="radiogroup"`, `role="radio"`, `role="checkbox"`, `aria-checked`), Kit expand animation |
| `src/components/features/charts/form-primitives/pattern-type-cards.test.tsx` | Card behavior tests | VERIFIED | 12 tests, all passing — covers ARIA roles, mutual exclusion, expand/collapse, callbacks, default state |
| `src/components/features/charts/form-primitives/sticky-save-bar.tsx` | Fixed-bottom save bar | VERIFIED | 55 lines, exports `StickySaveBar`, `role="toolbar"`, `z-100`, contextual hint, disabled states |
| `src/components/features/charts/form-primitives/sticky-save-bar.test.tsx` | Save bar state tests | VERIFIED | 9 tests, all passing — hint text, button disabled states, callbacks, ARIA |
| `src/components/features/charts/form-primitives/form-field.tsx` | Green dot required indicator | VERIFIED | `bg-primary mr-1.5 inline-block size-1.5 rounded-full` before label; no `text-destructive ml-0.5` asterisk |
| `src/components/features/charts/form-primitives/genre-picker.tsx` | Font-medium on selected chips | VERIFIED | Line 63: `border-primary/30 bg-primary/10 text-primary font-medium` |
| `src/components/features/charts/use-draft-persistence.ts` | saveDraft/loadDraft/clearDraft + DRAFT_KEY | VERIFIED | 71 lines, all 4 exports present, 3 try/catch wrappers, stale ID detection for designerId/storageLocationId/stitchingAppId/fabricId (CR-01 fixed in commit 404907a) |
| `src/components/features/charts/use-draft-persistence.test.ts` | Draft persistence unit tests | VERIFIED | 15 tests, all passing — happy paths, stale IDs (4 fields including fabricId), error cases, schema evolution |
| `src/components/features/charts/chart-merged-form.tsx` | Merged form shell | VERIFIED | 455 lines, exports `ChartMergedForm`, composes all Plan 01-02 primitives, 4 field groups, draft hydration on mount, clearDraft on success |
| `src/components/features/charts/chart-merged-form.test.tsx` | Integration tests | VERIFIED | 18 tests, all passing — layout, required indicators, submission flow, draft save/restore/clear |
| `src/app/(dashboard)/charts/new/page.tsx` | Page wiring to merged form | VERIFIED | Imports and renders `ChartMergedForm`; no `ChartAddForm` reference; all data-fetching props passed unchanged |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `pattern-type-cards.tsx` | `useChartForm` hook | `onFormatChange`, `onFormalKitChange`, `onSALChange`, `onKitColorCountChange` props | VERIFIED | Props interface matches existing `PatternTypeFieldsProps` contract; all 4 callbacks wired in `chart-merged-form.tsx:265-274` |
| `sticky-save-bar.tsx` | form submission | `onSubmit` → `formRef.current?.requestSubmit()` | VERIFIED | `chart-merged-form.tsx:447` — `onSubmit={() => formRef.current?.requestSubmit()}` triggers the `<form onSubmit={form.handleSubmit}>` native submit |
| `chart-merged-form.tsx` | `useChartForm` | `useChartForm(` call | VERIFIED | Line 80: `const form = useChartForm({ mode: "create", designers, genres, storageLocations, stitchingApps, onSuccess })` — hook unchanged per D-11 |
| `chart-merged-form.tsx` | `PatternTypeCards` | `<PatternTypeCards` render | VERIFIED | Lines 262-274, all props wired to `form.values.*` and `form.setField(...)` |
| `chart-merged-form.tsx` | `StickySaveBar` | `<StickySaveBar` render | VERIFIED | Lines 444-451, `chartName={form.values.name}`, `onSubmit`, `isSubmitting={form.isPending}` |
| `chart-merged-form.tsx` | `use-draft-persistence` | `saveDraft`, `loadDraft`, `clearDraft` calls | VERIFIED | `saveDraft(form.values)` line 148; `loadDraft(defaultValues, designerIds, storageIds, appIds, fabricIds)` line 128; `clearDraft()` line 65 |
| `page.tsx` | `ChartMergedForm` | import + render | VERIFIED | Import line 6, JSX render lines 20-26 with full props |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `chart-merged-form.tsx` | `form.values.name` | `useChartForm` state via `form.setField("name", e.target.value)` | Yes — user input | FLOWING |
| `chart-merged-form.tsx` | `form.values.digitalFileUrl` | `FileUpload.onUploadComplete → form.setField("digitalFileUrl", key)` | Yes — R2 upload key | FLOWING |
| `chart-merged-form.tsx` | draft hydration | `loadDraft()` → `form.setField(key, val)` loop | Yes — localStorage | FLOWING |
| `sticky-save-bar.tsx` | hint text | `chartName.trim()` boolean | Yes — derives from form state | FLOWING |
| `use-draft-persistence.ts` | `saveDraft` | `localStorage.setItem(DRAFT_KEY, JSON.stringify(values))` | Yes — serializes real form values | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Method | Result | Status |
|----------|--------|--------|--------|
| 54 tests across all phase 12 files | `vitest run` on all 4 test files | 54/54 passing, 0 failing | PASS |
| `pattern-type-cards.tsx` exports `PatternTypeCards` | File read + test output | Exported, 12 tests green | PASS |
| `sticky-save-bar.tsx` exports `StickySaveBar` | File read + test output | Exported, 9 tests green | PASS |
| `use-draft-persistence.ts` exports all 4 symbols | File read + test output | `saveDraft`, `loadDraft`, `clearDraft`, `DRAFT_KEY` all present, 15 tests green | PASS |
| `chart-merged-form.tsx` renders FileUpload for FORM-05 | grep + integration test | `<FileUpload` at line 351, test "renders FileUpload for digital working copy" passes | PASS |
| All 9 documented TDD commits exist | `git log` on commit hashes | All 9 hashes verified in repo history | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FORM-01 | Plan 03 | Single continuous page (720px max-width) with field groups separated by dividers — no chart/project split | VERIFIED | `max-w-[720px]` wrapper, 4 `<hr>` dividers, page route renders `ChartMergedForm` |
| FORM-02 | Plan 01, 03 | Pattern type via 2x2 card grid with expandable sub-fields | VERIFIED | `PatternTypeCards` with Paper/Digital radio, Kit/SAL checkbox, Kit expand animation (note: REQUIREMENTS.md used "Chart Only/Digital Only/Kit/Subscription" — D-02 in 12-CONTEXT.md documents "Subscription" was a misnomer; SAL is correct) |
| FORM-03 | Plan 01, 02, 03 | Sticky save bar with Save Draft and Create buttons + draft persistence | VERIFIED | `StickySaveBar` component, `use-draft-persistence.ts` functions, all wired in `ChartMergedForm` |
| FORM-04 | Plan 01, 03 | Green dot indicators on required fields (Chart Name, Status) only | VERIFIED | `form-field.tsx` green dot (no asterisk), Chart Name + Status have `required` prop, integration tests confirm both |
| FORM-05 | Plan 03 | Digital working copy upload in Workflow section | VERIFIED | `<FileUpload>` in Workflow group, wired to `form.setField("digitalFileUrl", key)` |

**Note:** REQUIREMENTS.md traceability table still shows all FORM-01 through FORM-05 as "Pending" — this is an administrative tracking gap. The code fully implements all 5 requirements. The status column update is a docs-only task.

---

### Anti-Patterns Found

| File | Issue | Severity | Impact |
|------|-------|----------|--------|
| `chart-merged-form.tsx:247,283,358,415` | `<hr className="border-border/50 my-6 border-t border-none" />` — `border-none` may override `border-t` in Tailwind v4, making dividers invisible | WARNING (WR-01 from code review) | Visual: FORM-01 field group separation may not render. Requires human visual confirmation. |
| `chart-merged-form.tsx:144-153` | `setSaveDraftLabel("Saving...")` is set then immediately overwritten in same sync event; React 18 batches updates — "Saving..." never renders | INFO (WR-02/IN-02 from code review) | Dead code; `isSavingDraft` state never activates Save Draft button's disabled state. UX refinement only, does not block goal. |

No TODO/FIXME/placeholder stubs found in phase 12 files.

---

### Human Verification Required

#### 1. Section Divider Visibility

**Test:** Run `npm run dev`, navigate to `http://localhost:3000/charts/new`, and visually inspect whether horizontal lines appear between the Identity, Pattern, Workflow, and Timeline field groups.
**Expected:** Four visible subtle horizontal lines separate the four field groups.
**Why human:** WR-01 CSS conflict: `border-none` may override `border-t` in Tailwind v4, causing all four `<hr>` dividers to render as invisible. Automated tests only confirm `<hr>` DOM presence — they cannot catch zero-height, zero-border rendering. If dividers are invisible, fix: remove `border-none` from the `<hr>` class strings.

#### 2. Full Form Visual Checkpoint (Plan 03, Task 3 — blocking gate)

**Test:** Follow the full checklist in Plan 03 Task 3 at `/charts/new`:
1. Confirm title "Add New Chart", subtitle, back link arrow
2. Confirm 720px centered layout with responsive padding
3. Confirm Chart Name and Status fields have a small green dot before the label (not a red asterisk)
4. Confirm PatternTypeCards 2x2 grid: Paper Chart, Digital (default selected), Kit, SAL
5. Click Paper Chart — Digital deselects; click Kit — expands "Colours in kit" input with animation
6. Confirm Digital Working Copy (FileUpload) is present in Workflow section
7. Confirm milestone marker: green-tinted card, "Project details filled in. Ready for supplies?", "Add supplies →" link
8. Confirm sticky save bar at bottom: "Enter a chart name to enable saving" hint, both buttons disabled
9. Type a chart name — hint changes to "Ready to save at any point", buttons enable
10. Click Save Draft — briefly shows "Saved!"; navigate away; return — draft restores with toast
11. Fill Chart Name + Status, click Create — submits and redirects to /charts
12. Confirm selected genre chips appear bolder than unselected chips

**Expected:** All 12 checklist items pass.
**Why human:** This is a blocking `checkpoint:human-verify` gate in Plan 03 Task 3, documented as pending in 12-03-SUMMARY.md. Visual appearance, animation smoothness, interactive state transitions, and UX flow cannot be verified programmatically.

---

### Gaps Summary

No code gaps found. All 4 ROADMAP success criteria are verified with substantive, wired, data-flowing artifacts and 54 passing tests. The critical code review finding (CR-01: missing fabricId stale check) was fixed in commit `404907a` before this verification.

Outstanding items are visual/interactive quality concerns that require human eyes:
- WR-01 CSS conflict may make section dividers invisible (fixable with a one-line CSS change)
- Task 3 visual checkpoint was explicitly left pending at the end of phase execution

The phase is code-complete. Human visual approval unblocks it for `gsd:ship`.

---

_Verified: 2026-05-11T22:08:00Z_
_Verifier: Claude (gsd-verifier)_
