# Phase 05 Security Report

**Phase:** 05 — Foundation & Quick Wins
**ASVS Level:** 1
**Date:** 2026-04-12
**Threats Closed:** 18/18
**Threats Open:** 0/18

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-05-01 | Elevation of Privilege | mitigate | CLOSED | `requireAuth()` called at line 11, 29, 50, 79, 100 in storage-location-actions.ts — every exported function guarded |
| T-05-02 | Elevation of Privilege | mitigate | CLOSED | `requireAuth()` called at line 10, 29, 50, 79, 100 in stitching-app-actions.ts — every exported function guarded |
| T-05-03 | Tampering | mitigate | CLOSED | `z.string().trim().min(1).max(200)` on `name` field in storageLocationSchema (storage.ts line 4) — server-boundary Zod validation |
| T-05-04 | Tampering | mitigate | CLOSED | `prisma.$transaction([updateMany, delete])` at storage-location-actions.ts line 62 — atomic unlink+delete; `requireAuth()` gate present on deleteStorageLocation |
| T-05-05 | Information Disclosure | accept | CLOSED | Accepted: single-user app, no multi-tenant leakage risk. `getStorageLocationsWithStats` now also filters by `userId` (line 84: `where: { userId: user.id }`) as a defense-in-depth improvement from code review fix WR-02 |
| T-05-06 | Tampering | mitigate | CLOSED | Zod `storageLocationSchema` / `stitchingAppSchema` validate all name inputs at server boundary with trim+min(1)+max(200) |
| T-05-07 | Spoofing | accept | CLOSED | Accepted: single-user app, CUID IDs non-guessable, requireAuth on all actions |
| T-05-08 | Denial of Service | accept | CLOSED | Accepted: low risk in single-user app; server-side Zod prevents empty entries |
| T-05-09 | Tampering | mitigate | CLOSED | `stitchingAppSchema` (storage.ts line 10) — `z.string().trim().min(1).max(200)` validates stitching app names at server boundary |
| T-05-10 | Spoofing | accept | CLOSED | Accepted: single-user app, CUID IDs, requireAuth on all actions |
| T-05-11 | Tampering | mitigate | CLOSED | chart-actions.ts fabric linking uses `prisma.fabric.update({ where: { id: project.fabricId } })` — Prisma FK constraint validates fabric existence; getUnassignedFabrics scopes through project ownership |
| T-05-12 | Tampering | mitigate | CLOSED | chartFormSchema (chart.ts lines 32–34): `storageLocationId`, `stitchingAppId`, `fabricId` all declared as `z.string().nullable().default(null)` — Zod validates at server boundary; Prisma FK constraints enforce referential integrity |
| T-05-13 | Information Disclosure | accept | CLOSED | Accepted: single-user app. `getUnassignedFabrics` has `requireAuth()` (fabric-actions.ts line 219) and filters via `NOT: { linkedProject: { userId: { not: user.id } } }` |
| T-05-14a | Tampering | accept | CLOSED | Accepted: static DMC fixture file validated by tests for structure, completeness, and no duplicate codes |
| T-05-15a | Denial of Service | accept | CLOSED | Accepted: client-side scrollIntoView only, no server impact |
| T-05-14b | Tampering | mitigate | CLOSED | `createStorageLocation` uses `storageLocationSchema.parse()` (line 14) with `requireAuth()` (line 11) — existing Zod validation + auth gate apply to onAddNew path |
| T-05-15b | Tampering | mitigate | CLOSED | `createStitchingApp` uses `stitchingAppSchema.parse()` (line 14) with `requireAuth()` (line 11) — same Zod validation + auth gate |
| T-05-07-01 | Tampering | mitigate | CLOSED | searchable-select.tsx line 88: `onAddNew(search.trim())` passes trimmed value; use-chart-form.ts lines 308, 330: `if (!name.trim()) return;` guards — defense in depth with server-side Zod validation in actions |
| T-05-07-02 | Spoofing | accept | CLOSED | Accepted: handlers invoke requireAuth() via server actions; empty-name guard is a UX measure only |
| T-05-08-01 | Tampering | accept | CLOSED | Accepted: use-chart-form.ts trim guards (lines 308, 330) reject empty strings; server-side Zod validates at action boundary |
| T-05-08-02 | Denial of Service | accept | CLOSED | Accepted: pure read-only getBoundingClientRect DOM measurement on mount |

---

## Code Review Fix Verification (CR-01 / CR-02 / CR-03 from 05-REVIEW.md)

The context notes three critical code review findings that were already fixed. Verified in implementation:

**CR-01 — storage-location-actions.ts userId scoping:**
- `updateStorageLocation`: `where: { id, userId: user.id }` (line 35) — CONFIRMED
- `deleteStorageLocation`: ownership check `existing.userId !== user.id` before transaction (lines 54–59) — CONFIRMED
- `getStorageLocationDetail`: `where: { id, userId: user.id }` (line 105) — CONFIRMED
- `getStorageLocationsWithStats`: `where: { userId: user.id }` (line 84) — CONFIRMED

**CR-02 — stitching-app-actions.ts userId scoping:**
- `updateStitchingApp`: `where: { id, userId: user.id }` (line 35) — CONFIRMED
- `deleteStitchingApp`: ownership check `existing.userId !== user.id` before transaction (lines 54–59) — CONFIRMED
- `getStitchingAppDetail`: `where: { id, userId: user.id }` (line 105) — CONFIRMED
- `getStitchingAppsWithStats`: `where: { userId: user.id }` (line 84) — CONFIRMED

**CR-03 — Project.userId @default("1") removed:**
- `prisma/schema.prisma` line 71: `userId String` — no `@default("1")` present — CONFIRMED

**WR-03 — fabric-actions.ts ownership scoping:**
- `updateFabric`: checks `existing.linkedProject.userId !== user.id` (line 133) — CONFIRMED
- `deleteFabric`: checks `existing.linkedProject.userId !== user.id` (line 177) — CONFIRMED
- `getFabric`: checks `fabric.linkedProject.userId !== user.id` (line 207) — CONFIRMED
- `getUnassignedFabrics`: filters `NOT: { linkedProject: { userId: { not: user.id } } }` (line 229) — CONFIRMED

---

## Unregistered Flags

No unregistered threat flags were present in any SUMMARY.md `## Threat Flags` section. All summaries document code quality deviations and build fixes only — none raise new attack surface not already covered in the threat register.

---

## Accepted Risks Log

| Threat ID | Risk Accepted | Rationale |
|-----------|---------------|-----------|
| T-05-05 | No multi-tenant isolation in getStorageLocationsWithStats | Single-user app; only one user can authenticate. Defense-in-depth userId filter now present anyway. |
| T-05-07 | CUID-based URL enumeration on /storage/[id] | Single-user app; requireAuth blocks unauthenticated access to all actions |
| T-05-08 | Rapid-fire inline add (DoS) | Single-user app; Zod prevents empty entries; no rate-limiting needed |
| T-05-10 | CUID-based URL enumeration on /apps/[id] | Same as T-05-07 |
| T-05-13 | getUnassignedFabrics returns all unassigned fabrics | Single-user app; all fabrics belong to the authenticated user |
| T-05-14a | DMC fixture data integrity | Static file validated by automated tests; no runtime write path |
| T-05-15a | scrollIntoView client-side only | No server impact; pure UX enhancement |
| T-05-07-02 | Empty name guard in use-chart-form is UX-only | Server actions enforce Zod validation + requireAuth independently |
| T-05-08-01 | SearchableSelect passes empty string to onAddNew | Handler guards and Zod trim+min(1) prevent empty entity creation |
| T-05-08-02 | getBoundingClientRect read on mount | Read-only DOM query; no performance or security concern |
