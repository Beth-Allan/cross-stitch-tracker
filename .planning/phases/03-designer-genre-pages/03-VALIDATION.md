---
phase: 3
slug: designer-genre-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PROJ-06 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PROJ-07 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Designer action tests — CRUD operations with auth guard and validation
- [ ] Genre action tests — CRUD operations with auth guard and validation
- [ ] Designer page component tests — rendering, interactions, empty states
- [ ] Genre page component tests — rendering, interactions, empty states
- [ ] Detail page tests — chart list rendering, edit/delete flows

*Existing test infrastructure (Vitest, test-utils, mock factories) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar navigation ordering | PROJ-06/07 | Visual layout verification | Confirm Designers and Genres appear below Charts in sidebar |
| Cover thumbnail rendering | PROJ-06/07 | Image loading behavior | Check chart thumbnails display on detail pages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
