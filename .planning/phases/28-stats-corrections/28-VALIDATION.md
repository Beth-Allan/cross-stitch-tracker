---
phase: 28
slug: stats-corrections
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-23
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern="stats"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="stats"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 1 | STAT-01 | — | N/A | unit | `npm test -- --testPathPattern="stats"` | TBD | ⬜ pending |
| TBD | TBD | 1 | STAT-02 | — | N/A | unit | `npm test -- --testPathPattern="stats"` | TBD | ⬜ pending |
| TBD | TBD | 1 | STAT-03 | — | N/A | unit | `npm test -- --testPathPattern="stats"` | TBD | ⬜ pending |
| TBD | TBD | 1 | STAT-04 | — | N/A | unit | `npm test -- --testPathPattern="stats"` | TBD | ⬜ pending |
| TBD | TBD | 1 | STAT-05 | — | N/A | unit | `npm test -- --testPathPattern="stats"` | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart Y-axis integer ticks visual | STAT-02 | Visual rendering in browser | Open stats page, verify Y-axis shows only integers |
| Bar label positioning | STAT-03 | Visual rendering in browser | Open collection breakdown, verify entity names on bars |
| Hero counter visual prominence | STAT-04 | Visual styling assessment | Open stats overview, verify large counter display |
| Days-in-library visual layout | STAT-05 | Visual styling assessment | Open stats overview, verify large number + small label layout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
