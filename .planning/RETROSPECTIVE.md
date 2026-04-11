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

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 4 |
| Plans | 23 |
| Tasks | 44 |
| Tests | 395 |
| LOC | 48k |
| Days | 22 |
| Quick tasks | 12 |
| Backlog items | 15 |
