---
phase: 1
slug: foundation-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | INFRA-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | INFRA-03 | build+manual | `npm run build` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | INFRA-04 | manual | lighthouse PWA audit | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 1 | INFRA-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitejs/plugin-react` — install test framework
- [ ] `vitest.config.ts` — configure for Next.js App Router
- [ ] `src/__tests__/` — test directory structure

*Wave 0 tasks will be included in the first plan.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App shell layout matches design on Mac | INFRA-03 | Visual comparison | Open localhost:3000, compare MainNav/TopBar/UserMenu against design screenshots |
| App shell layout usable on iPhone | INFRA-03 | Device testing | Open on iPhone or responsive mode at 390px width, verify no horizontal scroll |
| PWA installs to iPhone home screen | INFRA-04 | Device testing | Visit on iPhone Safari → Share → Add to Home Screen → verify full-screen launch |
| Dark mode matches design tokens | INFRA-03 | Visual comparison | Toggle OS dark mode, verify emerald/amber/stone dark palette applies |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
