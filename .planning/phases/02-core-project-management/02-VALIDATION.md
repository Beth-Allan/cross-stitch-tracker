---
phase: 2
slug: core-project-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PROJ-01 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PROJ-04 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | PROJ-05 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | PROJ-01 | component | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PROJ-02, PROJ-03 | integration | `npm test -- --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for size category utility (PROJ-05)
- [ ] Test stubs for status enum and transitions (PROJ-04)
- [ ] Test stubs for Zod validation schemas (PROJ-01)
- [ ] Test stubs for R2 presigned URL generation (PROJ-02, PROJ-03)
- [ ] Existing vitest infrastructure covers framework needs — no new install required

*Existing infrastructure covers test framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cover photo displays in detail view | PROJ-02 | Visual rendering in browser | Upload cover photo, verify image renders at correct size on detail page |
| Digital file download via presigned URL | PROJ-03 | Requires R2 bucket and browser download | Upload PDF, click download, verify file opens correctly |
| R2 CORS configuration | PROJ-02, PROJ-03 | Infrastructure config, not code | Verify CORS headers allow upload from localhost and production domain |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
