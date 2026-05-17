---
phase: 17
slug: image-focal-point
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-17
nyquist_completed: 2026-05-17
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --reporter=dot` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=dot`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | IMG-01 | T-17-01 | requireAuth + ownership check | unit | `npm test -- src/lib/utils/focal-point.test.ts src/lib/actions/focal-point-actions.test.ts` | ✅ | ✅ green |
| 17-01-02 | 01 | 1 | IMG-01 | T-17-01 | Zod validates 0-1 range, rejects NaN | unit | `npm test -- src/lib/actions/focal-point-actions.test.ts` | ✅ | ✅ green |
| 17-02-01 | 02 | 2 | IMG-02 | — | N/A | unit | `npm test -- src/components/features/gallery/gallery-utils.test.ts` | ✅ | ✅ green |
| 17-02-02 | 02 | 2 | IMG-02 | — | N/A | unit | `npm test -- src/components/features/gallery/gallery-card.test.tsx src/components/features/dashboard/spotlight-card.test.tsx src/components/features/dashboard/currently-stitching-card.test.tsx src/components/features/shopping/project-accordion.test.tsx` | ✅ | ✅ green |
| 17-03-01 | 03 | 2 | IMG-01 | — | N/A | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx` | ✅ | ✅ green |
| 17-03-02 | 03 | 2 | IMG-01 | — | N/A | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All wave 0 stubs created and promoted to full tests during execution:

- [x] `src/lib/utils/focal-point.test.ts` — 8 tests for getObjectPositionStyle utility (IMG-02c)
- [x] `src/lib/actions/focal-point-actions.test.ts` — 11 tests for server action (IMG-01a/b/c)
- [x] `src/components/features/charts/project-detail/focal-point-editor.test.tsx` — 13 tests for editor UI (IMG-01d/e)

*Existing infrastructure covers test framework — no new setup needed.*

---

## Nyquist Gap Analysis (2026-05-17)

### Gaps Identified

The original 51 tests covered IMG-01 thoroughly and IMG-02 partially. Three secondary display contexts under IMG-02 (D-07: all object-cover contexts respect focal point) had no behavioral assertions — only type-correct fixtures with `focalPointX: null`.

| Gap | Component | Gap Type | Requirement |
|-----|-----------|----------|-------------|
| spotlight-card focal point not tested | `spotlight-card.test.tsx` | missing behavioral test | IMG-02 |
| currently-stitching-card focal point not tested | `currently-stitching-card.test.tsx` | missing behavioral test | IMG-02 |
| project-accordion focal point not tested | `project-accordion.test.tsx` | missing behavioral test | IMG-02 |

### Gap Tests Added

| File | Tests Added | Command | Status |
|------|-------------|---------|--------|
| `src/components/features/dashboard/spotlight-card.test.tsx` | 2 (applies/omits objectPosition) | `npm test -- src/components/features/dashboard/spotlight-card.test.tsx` | ✅ green |
| `src/components/features/dashboard/currently-stitching-card.test.tsx` | 2 (applies/omits objectPosition) | `npm test -- src/components/features/dashboard/currently-stitching-card.test.tsx` | ✅ green |
| `src/components/features/shopping/project-accordion.test.tsx` | 2 (applies/omits objectPosition) | `npm test -- src/components/features/shopping/project-accordion.test.tsx` | ✅ green |

### Final Test Count

| File | Tests (Phase 17) | Status |
|------|-----------------|--------|
| `src/lib/utils/focal-point.test.ts` | 8 | ✅ |
| `src/lib/actions/focal-point-actions.test.ts` | 11 | ✅ |
| `src/components/features/gallery/gallery-utils.test.ts` | 2 (focal point) | ✅ |
| `src/components/features/gallery/gallery-card.test.tsx` | 2 (focal point) | ✅ |
| `src/components/features/charts/project-detail/focal-point-editor.test.tsx` | 13 | ✅ |
| `src/components/features/dashboard/spotlight-card.test.tsx` | 2 (gap fill) | ✅ |
| `src/components/features/dashboard/currently-stitching-card.test.tsx` | 2 (gap fill) | ✅ |
| `src/components/features/shopping/project-accordion.test.tsx` | 2 (gap fill) | ✅ |
| **Total new tests** | **57** | **✅ all green** |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Click coordinates map correctly to image position | IMG-01 | Requires visual confirmation of marker placement relative to click | Open project detail, enter edit mode, click various positions, verify marker appears at click point |
| Crop preview matches gallery card rendering | IMG-01 | Visual fidelity comparison | Set focal point, compare preview overlay with actual gallery card in browse view |
| Touch/tap works on mobile viewports | IMG-01 | Device-specific interaction | Test on mobile viewport (375px), verify tap places marker correctly |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete — 2026-05-17 (Nyquist gap analysis + 6 gap tests added)
