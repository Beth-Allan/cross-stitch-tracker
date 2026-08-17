---
phase: 5
slug: foundation-quick-wins
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 5 — Validation Strategy

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
| 5-01-01 | 01 | 1 | STOR-01 | — | N/A | unit | `npx vitest run src/lib/validations/storage.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | STOR-02 | — | N/A | unit | `npx vitest run src/lib/actions/storage-location-actions.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 1 | STOR-03 | — | N/A | unit | `npx vitest run src/lib/actions/stitching-app-actions.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-04 | 01 | 1 | STOR-04 | — | N/A | unit | `npx vitest run src/lib/actions/stitching-app-actions.test.ts` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 1 | PROJ-01 | — | N/A | unit | `npx vitest run src/components/features/fabric` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | PROJ-02 | — | N/A | unit | `npx vitest run src/components/features/project-setup` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 2 | SUPP-02 | — | N/A | unit | `npx vitest run src/components/features/search-to-add` | ❌ W0 | ⬜ pending |
| 5-03-02 | 03 | 2 | SUPP-03 | — | N/A | unit | `npx vitest run src/components/features/cover-image` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for StorageLocation CRUD actions
- [ ] Test stubs for StitchingApp CRUD actions
- [ ] Test stubs for fabric selector component
- [ ] Test stubs for cover image display changes
- [ ] Test stubs for thread picker scroll behavior

*Existing test infrastructure covers framework setup — no new packages needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cover image letterboxing visual appearance | SUPP-03 | Visual rendering check | Upload tall/square/wide images, verify no cropping and bg-muted shows |
| Thread picker scroll UX | SUPP-02 | Browser scroll behavior | Add 5+ thread colours rapidly, verify search box stays visible |
| Fabric selector dropdown rendering | PROJ-01 | Visual option layout | Open fabric dropdown in chart form, verify name/count/type/brand visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
