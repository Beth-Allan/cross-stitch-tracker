---
phase: 29
slug: ui-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-23
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern='<pattern>' --bail` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern='<pattern>' --bail`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-XX-01 | TBD | TBD | UI-01 | — | N/A | unit | `npm test -- --testPathPattern='status-badge\|size-badge\|gallery'` | ✅ | ⬜ pending |
| 29-XX-02 | TBD | TBD | UI-02 | — | N/A | unit | `npm test -- --testPathPattern='gallery'` | ❌ W0 | ⬜ pending |
| 29-XX-03 | TBD | TBD | UI-03 | — | N/A | unit | `npm test -- --testPathPattern='supply-table\|sort'` | ❌ W0 | ⬜ pending |
| 29-XX-04 | TBD | TBD | UI-04 | — | N/A | unit | `npm test -- --testPathPattern='calculator'` | ✅ | ⬜ pending |
| 29-XX-05 | TBD | TBD | UI-05 | — | N/A | unit+integration | `npm test -- --testPathPattern='upload\|chart-actions'` | ✅ | ⬜ pending |
| 29-XX-06 | TBD | TBD | BUG-03 | — | N/A | unit | `npm test -- --testPathPattern='supply\|sort'` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. No new test framework or fixture setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Colored pills visually match design spec colors | UI-01 | Visual color accuracy | Compare rendered pills against design spec palette |
| Digital copy indicator visible on gallery cards | UI-02 | Visual indicator layout | Upload a digital copy, verify indicator appears on gallery card |
| File upload works for .zip files up to 50MB | UI-05 | File size/type integration | Upload a 50MB .zip file as digital working copy |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
