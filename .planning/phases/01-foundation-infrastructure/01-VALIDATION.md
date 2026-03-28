---
phase: 1
slug: foundation-infrastructure
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (installed in Plan 01-01, Task 1) |
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
| 01-01-01 | 01 | 1 | INFRA-04/05 | build+vitest | `npx prisma generate && npx tsc --noEmit && npx vitest run` | Plan 01-01 T1 | pending |
| 01-01-02 | 01 | 1 | INFRA-04/05 | build | `npm run build` | Plan 01-01 T2 | pending |
| 01-02-01 | 02 | 2 | INFRA-01 | type-check | `npx tsc --noEmit` | Plan 01-02 T1 | pending |
| 01-02-02 | 02 | 2 | INFRA-01 | build | `npm run build` | Plan 01-02 T2 | pending |
| 01-03-01 | 03 | 3 | INFRA-02/03 | type-check | `npx tsc --noEmit` | Plan 01-03 T1 | pending |
| 01-03-02 | 03 | 3 | INFRA-02/03 | build | `npm run build` | Plan 01-03 T2 | pending |
| 01-03-03 | 03 | 3 | INFRA-02/03 | manual | visual verification | Plan 01-03 T3 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `vitest` + `@vitejs/plugin-react` -- installed in Plan 01-01, Task 1, step 4
- [x] `vitest.config.ts` -- created in Plan 01-01, Task 1, step 5
- [x] `src/__tests__/setup.ts` -- created in Plan 01-01, Task 1, step 6
- [x] `"test"` script in package.json -- added in Plan 01-01, Task 1, step 7

*Wave 0 is addressed in Plan 01-01, Task 1 (first task of first plan).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App shell layout matches design on Mac | INFRA-03 | Visual comparison | Open localhost:3000, compare MainNav/TopBar/UserMenu against design screenshots |
| App shell layout usable on iPhone | INFRA-03 | Device testing | Open on iPhone or responsive mode at 390px width, verify no horizontal scroll |
| PWA installs to iPhone home screen | INFRA-04 | Device testing | Visit on iPhone Safari -> Share -> Add to Home Screen -> verify full-screen launch |
| Dark mode matches design tokens | INFRA-03 | Visual comparison | Toggle OS dark mode, verify emerald/amber/stone dark palette applies |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
