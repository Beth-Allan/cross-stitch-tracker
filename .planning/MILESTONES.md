# Milestones

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
