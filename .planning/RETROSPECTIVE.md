# Retrospective

## Milestone: v1.0 — MVP "Replace Notion"

**Shipped:** 2026-04-11
**Phases:** 4 | **Plans:** 23 | **Tasks:** 44
**Timeline:** 22 days (2026-03-20 → 2026-04-11)
**Tests:** 395 | **LOC:** 48k TypeScript

### What Was Built

- Authenticated app shell with responsive sidebar, PWA manifest, emerald/amber/stone design system
- Full chart CRUD with ~50 fields, 7-stage status system, R2 cover photos, presigned URL downloads
- Designer and genre management pages with sortable tables, search, CRUD modals, detail views
- Supply tracking: 459-color DMC catalog, thread/bead/specialty/fabric CRUD, project linking, shopping lists
- Deployed to Vercel with Neon PostgreSQL and Cloudflare R2

### What Worked

- **TDD throughout** — 395 tests caught real bugs (Prisma client drift, hydration mismatches, supply query crashes). Tests as documentation.
- **GSD workflow** — Phase→Plan→Execute cycle kept work organized and resumable across sessions. Quick tasks for ad-hoc fixes without overhead.
- **Design-first approach** — DesignOS components in `product-plan/` meant zero UI guesswork. Every page had a spec.
- **Bleeding-edge rules** — `.claude/rules/` with Context7 lookups prevented Next.js 16 / Prisma 7 / shadcn v4 footguns. Saved hours.
- **Impeccable quality gates** — Polish + audit passes at phase boundaries caught accessibility, semantic token, and performance issues systematically.
- **MVP restructure (day 18)** — Pivoting from 9-phase waterfall to 4-milestone plan got the app deployed instead of stuck in planning.

### What Was Inefficient

- **Progress table drift** — ROADMAP.md progress table wasn't always updated after plan execution, requiring manual corrections during milestone audit.
- **Phase 4 plan count (10 plans)** — Supplies + fabric was the biggest phase. Several gap-closure plans (08, 09, 10) were reactive fixes that could have been caught in initial planning.
- **Smoke test at deploy time** — 15 issues found when deploying. Earlier local testing with prod-like env would have caught CSP headers, upload limits, etc.
- **Presigned URL oversight** — Designer/genre detail pages render R2 keys directly as `src` instead of resolving presigned URLs. Caught late, not fixed in M1.

### Patterns Established

- **Server/client split** — Server Components by default; `"use client"` only for hooks/events
- **buttonVariants in non-client file** — Avoids Next.js 16 "imported from client module" error
- **Lazy R2/Prisma singletons** — Graceful degradation when env vars missing
- **Three junction tables** — ProjectThread, ProjectBead, ProjectSpecialty (not polymorphic)
- **Semantic design tokens** — bg-card, text-muted-foreground, etc. (never hardcoded colors)
- **requireAuth() guard** — Single source of truth for all server actions
- **Feature branch + PR** — All code changes through CI (branch protection enforced)

### Key Lessons

1. **Deploy earlier** — Real usage found issues that tests and audits couldn't. The MVP restructure was the right call.
2. **Plan gap-closure upfront** — Budget 1-2 plans per phase for "fix what we missed" instead of bolting them on.
3. **Test with prod-like env locally** — R2, CSP headers, upload limits, and file type validation all broke at deploy.
4. **Keep ROADMAP progress table in sync** — Automate or make it part of the executor commit flow.
5. **Presigned URLs everywhere** — Any page rendering R2 keys needs server-side URL resolution. Don't assume only the charts page needs it.

## Milestone: v1.1 — Browse & Organize

**Shipped:** 2026-04-16
**Phases:** 3 | **Plans:** 20 | **Tasks:** 33
**Timeline:** 5 days (2026-04-11 → 2026-04-15)
**Tests:** 867 | **PRs:** #7, #15, #16

### What Was Built

- Storage location and stitching app CRUD with dedicated management pages and detail views
- DB-backed dropdowns with inline "Add New" for storage, app, and fabric in chart form
- Gallery cards with status-specific footers, 3 view modes (gallery/list/table), sorting, search, and filtering
- Project detail page with hero banner, interactive status badge, tabbed Overview + Supplies layout
- Per-colour stitch counts with auto-calculated skein estimates (fabric count, strand count, 20% waste factor)
- Supply workflow redesign with SearchToAdd inline create, color family filter, and visual InfoCard aesthetic
- DMC catalog completed to 495 threads (Blanc, Ecru, 1-149 filled)

### What Worked

- **Multi-agent PR review** — pr-review-toolkit caught real issues (ownership bypass, error swallowing, transaction safety) across 3 review rounds on Phase 5.
- **Impeccable quality gates** — audit + critique + re-critique cycle on Phase 6 caught ARIA violations, touch target issues, and semantic token drift. Scores improved 14→28/40.
- **Gap closure plans** — Explicitly budgeting 2 gap-closure plans per phase (learned from v1.0) reduced reactive scrambling.
- **Visual verification checkpoints** — Phase 7 plan 06 included explicit browser verification before proceeding, catching layout and data issues early.
- **Velocity improvement** — 4 plans/day vs 1 plan/day in v1.0. Phase familiarity + established patterns + fewer unknowns.

### What Was Inefficient

- **REQUIREMENTS.md traceability drift** — 12 of 19 requirements were still "Pending" despite being built. Traceability table wasn't updated during execution.
- **ROADMAP progress table drift (again)** — Phase 7 showed "6/8 Gap closure" at milestone close despite all 8 plans being complete. Same issue as v1.0.
- **Summary one-liner quality** — Several SUMMARY.md files had malformed one-liners (bug rule references instead of descriptions), making automated extraction unreliable.
- **Skein formula required late correction** — Initial constant (6.0) was ~4x too high; corrected to 1.3 in gap closure plan after UAT. Should have validated against community calculators during research.

### Patterns Established

- **InlineNameEdit + DeleteEntityDialog** — Reusable CRUD pattern for entity management pages (storage, apps)
- **SearchableSelect with inline create** — Chart form pattern for DB-backed dropdowns with "Add New" dialog
- **Gallery URL state with localStorage fallback** — nuqs for URL params, localStorage for view mode persistence
- **Status-specific card footers** — Data-driven footer rendering based on project status group
- **Native `<select>` in floating panels** — Simpler than shadcn Select inside SearchToAdd; avoids z-index/portal issues

### Key Lessons

1. **Update traceability during execution** — Don't defer requirement checkbox updates to milestone close. Mark complete when the plan ships.
2. **Validate formulas during research** — Domain-specific calculations (skein formula) need real-world validation before implementation, not after UAT.
3. **Summary one-liners need enforcement** — Malformed summaries break automation. The executor should validate one-liner format.
4. **Gap closure budget works** — 2 plans per phase for "fix what we missed" is the right default. Phase 5 used 3 (the extra was a genuine gap), Phase 7 used 2.
5. **Multi-agent review is worth the cost** — 3 rounds on Phase 5 was expensive but caught critical auth bypass. 1 round on Phases 6-7 was sufficient for lower-risk changes.

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Phases | 4 | 3 |
| Plans | 23 | 20 |
| Tasks | 44 | 33 |
| Tests | 395 | 867 |
| Days | 22 | 5 |
| Plans/day | ~1 | ~4 |
| Quick tasks | 12 | 1 |
| Backlog items | 15 | 25+ |
| PRs | 6 | 3 |
