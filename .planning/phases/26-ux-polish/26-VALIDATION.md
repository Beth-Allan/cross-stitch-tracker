---
phase: 26
slug: ux-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern {changed file}`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | UX-01 | — | N/A | unit | `npm test -- --testPathPattern clickable-card` | ✅ | ⬜ pending |
| 26-01-02 | 01 | 1 | UX-02 | — | N/A | unit | `npm test -- --testPathPattern search-to-add` | ✅ | ⬜ pending |
| 26-01-03 | 01 | 1 | UX-03 | — | N/A | unit | `npm test -- --testPathPattern editable-number` | ✅ | ⬜ pending |
| 26-01-04 | 01 | 1 | UX-04 | — | N/A | unit | `npm test -- --testPathPattern inline-create` | ✅ | ⬜ pending |
| 26-01-05 | 01 | 1 | UX-05 | — | N/A | unit | `npm test -- --testPathPattern supply-table` | ✅ | ⬜ pending |
| 26-02-01 | 02 | 1 | UX-06, UX-07 | — | N/A | unit | `npm test -- --testPathPattern focal-point` | ✅ | ⬜ pending |
| 26-02-02 | 02 | 1 | UX-08, UX-09 | — | N/A | unit | `npm test -- --testPathPattern bucket-project` | ❌ W0 | ⬜ pending |
| 26-02-03 | 02 | 1 | UX-10 | — | N/A | unit | `npm test -- --testPathPattern focal-point` | ✅ | ⬜ pending |
| 26-03-01 | 03 | 1 | UX-11 | — | N/A | unit | `npm test -- --testPathPattern pattern-dive` | ✅ | ⬜ pending |
| 26-03-02 | 03 | 1 | UX-12 | — | N/A | unit | `npm test -- --testPathPattern what-s-next` | ✅ | ⬜ pending |
| 26-03-03 | 03 | 1 | UX-13 | — | N/A | unit | `npm test -- --testPathPattern what-s-next` | ✅ | ⬜ pending |
| 26-03-04 | 03 | 1 | UX-14 | — | N/A | unit | `npm test -- --testPathPattern what-s-next` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/features/dashboard/bucket-project-row.test.tsx` — stubs for UX-08/UX-09 (focal point in bucket cards)

*Existing infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Focal point action bar visual positioning | UX-10 | Visual layout verification | Open project detail, enable focal point edit, verify action bar does not overlap bottom 25% of image |
| What's Next card visual match with gallery cards | UX-14 | Visual design consistency | Compare What's Next cards against Browse tab gallery cards side-by-side |
| Keyboard highlight visual activation | UX-02 | Keyboard interaction timing | Type in SearchToAdd, verify no highlight on initial render; press arrow key, verify highlight appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
