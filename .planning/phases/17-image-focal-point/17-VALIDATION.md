---
phase: 17
slug: image-focal-point
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
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
| 17-01-01 | 01 | 1 | IMG-01 | T-17-01 | requireAuth + ownership check | unit | `npm test -- src/lib/utils/focal-point.test.ts src/lib/validations/focal-point.test.ts` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | IMG-01 | T-17-01 | Zod validates 0-1 range, rejects NaN | unit | `npm test -- src/lib/actions/focal-point-actions.test.ts` | ❌ W0 | ⬜ pending |
| 17-02-01 | 02 | 2 | IMG-02 | — | N/A | unit | `npm test -- src/components/features/gallery/gallery-utils.test.ts` | ✅ | ⬜ pending |
| 17-02-02 | 02 | 2 | IMG-02 | — | N/A | unit | `npm test -- src/components/features/gallery/gallery-card.test.tsx src/components/features/dashboard/spotlight-card.test.tsx` | ✅ | ⬜ pending |
| 17-03-01 | 03 | 2 | IMG-01 | — | N/A | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx` | ❌ W0 | ⬜ pending |
| 17-03-02 | 03 | 2 | IMG-01 | — | N/A | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/utils/focal-point.test.ts` — stubs for getObjectPositionStyle utility (IMG-02c)
- [ ] `src/lib/actions/focal-point-actions.test.ts` — stubs for server action (IMG-01a/b/c)
- [ ] `src/components/features/charts/project-detail/focal-point-editor.test.tsx` — stubs for editor UI (IMG-01d/e)

*Existing infrastructure covers test framework — no new setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Click coordinates map correctly to image position | IMG-01 | Requires visual confirmation of marker placement relative to click | Open project detail, enter edit mode, click various positions, verify marker appears at click point |
| Crop preview matches gallery card rendering | IMG-01 | Visual fidelity comparison | Set focal point, compare preview overlay with actual gallery card in browse view |
| Touch/tap works on mobile viewports | IMG-01 | Device-specific interaction | Test on mobile viewport (375px), verify tap places marker correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
