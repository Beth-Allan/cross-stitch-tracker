---
phase: 8
slug: session-logging-pattern-dive
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SESS-01 | T-8-01 | Verify project ownership before create | unit | `npx vitest run src/lib/actions/session-actions.test.ts -t "createSession"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SESS-02 | — | N/A | unit | `npx vitest run src/components/shell/top-bar.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SESS-03 | — | N/A | unit | `npx vitest run src/components/features/sessions/project-sessions-tab.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SESS-04 | T-8-01 | Verify project ownership before update/delete | unit | `npx vitest run src/lib/actions/session-actions.test.ts -t "updateSession\|deleteSession"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SESS-05 | T-8-05 | Atomic recalc prevents race conditions | unit | `npx vitest run src/lib/actions/session-actions.test.ts -t "recalculate"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SESS-06 | — | N/A | unit | `npx vitest run src/lib/actions/session-actions.test.ts -t "photo"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PDIV-01 | — | N/A | unit | `npx vitest run src/components/shell/nav-items.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PDIV-02 | — | N/A | unit | `npx vitest run src/components/features/charts/pattern-dive-tabs.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PDIV-03 | — | N/A | unit | `npx vitest run src/components/features/charts/whats-next-tab.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PDIV-04 | — | N/A | unit | `npx vitest run src/components/features/charts/fabric-requirements-tab.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | PDIV-05 | — | N/A | unit | `npx vitest run src/components/features/charts/storage-view-tab.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/actions/session-actions.test.ts` — stubs for SESS-01, SESS-04, SESS-05, SESS-06
- [ ] `src/lib/actions/pattern-dive-actions.test.ts` — stubs for PDIV-03, PDIV-04, PDIV-05
- [ ] `src/lib/validations/session.test.ts` — stubs for SESS-01 validation
- [ ] `src/components/features/sessions/log-session-modal.test.tsx` — stubs for SESS-01, SESS-02, SESS-04
- [ ] `src/components/features/sessions/project-sessions-tab.test.tsx` — stubs for SESS-03
- [ ] `src/components/features/charts/pattern-dive-tabs.test.tsx` — stubs for PDIV-01, PDIV-02
- [ ] `src/components/features/charts/whats-next-tab.test.tsx` — stubs for PDIV-03
- [ ] `src/components/features/charts/fabric-requirements-tab.test.tsx` — stubs for PDIV-04
- [ ] `src/components/features/charts/storage-view-tab.test.tsx` — stubs for PDIV-05
- [ ] Update `createMockPrisma()` in `src/__tests__/mocks/factories.ts` — include `stitchSession` model methods and `createMockStitchSession` factory

*Existing infrastructure covers test framework — Wave 0 focuses on stubs and mock factories only.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| LogSessionModal opens from TopBar click | SESS-02 | Requires browser interaction across shell | Open app, click "Log Stitches" in TopBar, verify modal opens |
| Tab switching persists URL state | PDIV-02 | Requires browser URL verification | Navigate Pattern Dive, switch tabs, verify `?tab=` param updates |
| Progress photo renders after upload | SESS-06 | Requires R2 integration + visual check | Log session with photo, verify thumbnail appears in session list |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
