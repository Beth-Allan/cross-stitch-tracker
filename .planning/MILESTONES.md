# Milestones

## v1.1 Browse & Organize (Shipped: 2026-04-16)

**Delivered:** A browsable, visually rich collection experience with gallery views, project detail pages, and an integrated skein calculator.

**Stats:** 3 phases, 20 plans, 33 tasks | 225 commits | 867 tests | 5 days (2026-04-11 → 2026-04-15)

**Key accomplishments:**

1. **Storage & app management** — Full CRUD pages for storage locations and stitching apps with detail views showing assigned projects
2. **Chart form integration** — DB-backed dropdowns with inline "Add New" for storage, app, and fabric selection; DMC catalog completed to 495 threads
3. **Gallery experience** — Status-specific gallery cards (WIP progress, kitting dots, celebration borders) with gallery/list/table views, sorting, search, and filtering
4. **Project detail page** — Hero cover banner with blur background, interactive status badge, tabbed Overview + Supplies layout
5. **Skein calculator** — Per-colour stitch counts with auto-calculated skein estimates from fabric count, strand count, and 20% waste factor
6. **Supply workflow redesign** — SearchToAdd with inline create, color family filter, insertion-order entry, and visual redesign matching InfoCard aesthetic

**PRs:** #7 (Phase 5), #15 (Phase 6), #16 (Phase 7)

---

## v1.0 MVP — Replace Notion (Shipped: 2026-04-11)

**Delivered:** A fully functional cross-stitch project tracker replacing Notion, deployed to Vercel with Neon DB and Cloudflare R2 storage.

**Stats:** 4 phases, 23 plans, 44 tasks | 48k LOC TypeScript | 395 tests | 22 days (2026-03-20 → 2026-04-11)

**Key accomplishments:**

1. **Foundation** — Next.js 16 + Prisma 7 + Tailwind v4 scaffold with Auth.js v5 single-user auth, responsive app shell, and PWA manifest
2. **Chart management** — Full CRUD with ~50 fields, 7-stage status system, cover photos via presigned R2 URLs, size auto-calculation, inline designer/genre creation
3. **Designer & genre pages** — Dedicated management pages with sortable tables, search, CRUD modals, detail views with computed stats
4. **Supply tracking** — Pre-seeded DMC catalog (459 colors), thread/bead/specialty/fabric CRUD, project-supply linking with quantities, auto-generated shopping lists
5. **Quality** — TDD throughout, security audit (26 threats reviewed), impeccable UI audits, 12 smoke-test fixes post-deploy
6. **Deployed** — Live at Vercel with Neon prod DB, R2 CORS configured, 15 backlog items captured for M2

**Tech debt (8 minor items):** See `milestones/v1.0-MILESTONE-AUDIT.md`

---
