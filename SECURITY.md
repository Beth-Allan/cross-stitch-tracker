# SECURITY.md

---

## Phase 8 — Session Logging & Pattern Dive

**Audit Date:** 2026-04-16
**ASVS Level:** 1
**Auditor:** gsd-security-auditor
**Result:** SECURED — 0 open, 20 closed

### Threat Verification

| Threat ID | Category               | Disposition | Status | Evidence                                                                                                                                                                                                                                                                                                                       |
| --------- | ---------------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T-08-01   | Tampering              | mitigate    | CLOSED | `src/lib/validations/session.ts:9` `.min(1, "Stitch count must be at least 1")`, line 5 date refine, line 4 `.trim().min(1, "Project is required")`                                                                                                                                                                            |
| T-08-02   | Tampering              | mitigate    | CLOSED | `src/lib/actions/upload-actions.ts:50-57` — added `category === "sessions"` branch checking `ALLOWED_IMAGE_TYPES`, matching the "covers" enforcement pattern. Test added in `upload-actions.test.ts`.                                                                                                                          |
| T-08-03   | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:60` `if (!project \|\| project.userId !== user.id)`                                                                                                                                                                                                                                        |
| T-08-04   | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:109` `if (!existing \|\| !existing.project \|\| existing.project.userId !== user.id)`                                                                                                                                                                                                      |
| T-08-05   | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:159` same ownership traversal pattern as updateSession                                                                                                                                                                                                                                     |
| T-08-06   | Tampering              | mitigate    | CLOSED | Same schema as T-08-01 — `sessionFormSchema` in `src/lib/validations/session.ts`                                                                                                                                                                                                                                               |
| T-08-07   | Tampering              | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:64,116,166` all mutations wrapped in `prisma.$transaction`; `recalculateProgress` aggregates from DB, never reads client input                                                                                                                                                             |
| T-08-08   | Information Disclosure | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:190-195` project ownership verified before `stitchSession.findMany`                                                                                                                                                                                                                        |
| T-08-09   | Spoofing               | mitigate    | CLOSED | `src/lib/auth-guard.ts:18-21` `requireAuth()` throws "Unauthorized" if no session; modal is UI-only with no data access                                                                                                                                                                                                        |
| T-08-10   | Denial of Service      | mitigate    | CLOSED | `src/lib/validations/upload.ts:22` `.max(MAX_FILE_SIZE, "File is too large. Maximum size is 10MB.")`; `ALLOWED_IMAGE_TYPES` defined at line 3                                                                                                                                                                                  |
| T-08-11   | Information Disclosure | accept      | CLOSED | Active projects picker filters by `userId`: `src/lib/actions/session-actions.ts:274` `where: { userId: user.id, status: { in: [...ACTIVE_STATUSES] } }`                                                                                                                                                                        |
| T-08-12   | Information Disclosure | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:190-195` ownership check before returning session data (same as T-08-08)                                                                                                                                                                                                                   |
| T-08-13   | Information Disclosure | mitigate    | CLOSED | `src/lib/actions/session-actions.ts:236` `where: { project: { userId: user.id } }` in `getAllSessions`                                                                                                                                                                                                                         |
| T-08-14   | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/pattern-dive-actions.ts:302` `if (!project \|\| project.userId !== user.id)` before fabric assignment                                                                                                                                                                                                         |
| T-08-15   | Information Disclosure | mitigate    | CLOSED | `src/lib/actions/pattern-dive-actions.ts:100` `where: { project: { userId: user.id } }` in `getFabricRequirements`                                                                                                                                                                                                             |
| T-08-16   | Information Disclosure | mitigate    | CLOSED | `src/lib/actions/pattern-dive-actions.ts:209` `where: { userId: user.id }` for projects; line 223 `linkedProject: { userId: user.id }` for owned fabrics. Note: unassigned fabrics (`linkedProjectId: null`) are visible to all authenticated users — acknowledged in 08-06-SUMMARY.md as correct behavior for single-user app |
| T-08-17   | Tampering              | mitigate    | CLOSED | `src/lib/actions/pattern-dive-actions.ts:310-314` checks `fabric.linkedProjectId` is null or equals current project inside `$transaction` before linking                                                                                                                                                                       |
| T-08-18   | Tampering              | mitigate    | CLOSED | `src/lib/validations/session.ts:4` `z.string().trim().min(1, "Project is required")` — `.trim()` applied before `.min(1)`                                                                                                                                                                                                      |
| T-08-19   | Tampering              | mitigate    | CLOSED | `src/components/features/charts/project-detail/overview-tab.tsx:72-79` renders read-only span when `sessionCount > 0`; `stitchesCompleted` only written by `recalculateProgress` via aggregate                                                                                                                                 |
| T-08-20   | Tampering              | accept      | CLOSED | Migration already run; idempotent additive SQL, no user input surface                                                                                                                                                                                                                                                          |

### Open Threats

None — all threats closed.

### Accepted Risks Log

| Threat ID | Category               | Rationale                                                                                                                                      |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| T-08-11   | Information Disclosure | Active projects picker filters by `userId` — only shows the authenticated user's own projects. Single-user app removes any cross-user concern. |
| T-08-20   | Tampering              | Data migration is idempotent additive SQL that only sets `startingStitches` where currently 0. Already executed; no runtime input surface.     |

### Unregistered Flags

The 08-06-SUMMARY.md "Decisions Made" section notes that unassigned fabrics (`linkedProjectId: null`) are returned by `getStorageGroups` without a `userId` scope check. This maps to T-08-16 and is documented there. No unregistered flag — the SUMMARY section is labeled "Decisions Made", not "Threat Flags".

---

## Phase 4 — Supplies & Fabric

**Audit Date:** 2026-04-11
**ASVS Level:** 1
**Auditor:** gsd-security-auditor

### Threat Verification

| Threat ID  | Category               | Disposition | Status | Evidence                                                                                                                                                                                                                                                                                                          |
| ---------- | ---------------------- | ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-04-02    | Tampering              | mitigate    | CLOSED | `src/lib/validations/supply.ts`: `.trim().min(1).max(N)` on all string fields; hex regex `/^#[0-9A-Fa-f]{6}$/` on Thread, Bead, SpecialtyItem; enum constraints via `z.enum(SUPPLY_TYPES)` and `z.enum(COLOR_FAMILIES)`                                                                                           |
| T-04-04    | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/supply-actions.ts`: `await requireAuth()` is first statement in all 24 exported functions covering CRUD for Thread, Bead, SpecialtyItem, SupplyBrand, and all junction operations                                                                                                                |
| T-04-05    | Tampering              | mitigate    | CLOSED | `src/lib/actions/supply-actions.ts`: all mutation functions call `.parse()` on the appropriate Zod schema (`threadSchema`, `beadSchema`, `specialtyItemSchema`, `supplyBrandSchema`, `projectThreadSchema`, `projectBeadSchema`, `projectSpecialtySchema`, `updateQuantitySchema`) before any Prisma operation    |
| T-04-06    | Tampering              | mitigate    | CLOSED | `src/lib/actions/supply-actions.ts:updateProjectSupplyQuantity`: Prisma `update({ where: { id } })` throws P2025 for nonexistent IDs, caught in error handler and returned as failure response. `markSupplyAcquired` does explicit `findUnique` before update (`shopping-actions.ts:151,160,169`)                 |
| T-04-09    | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/fabric-actions.ts`: `await requireAuth()` is first statement in all 9 exported functions (createFabricBrand, updateFabricBrand, deleteFabricBrand, getFabricBrands, createFabric, updateFabric, deleteFabric, getFabric, getFabrics)                                                             |
| T-04-10    | Tampering              | mitigate    | CLOSED | `src/lib/validations/fabric.ts`: `count: z.number().int().min(1)`, `type: z.enum(FABRIC_TYPES)` (8 values), `colorFamily: z.enum(FABRIC_COLOR_FAMILIES)` (12 values), `colorType: z.enum(FABRIC_COLOR_TYPES)` (9 values), `shortestEdgeInches: z.number().min(0)`, `longestEdgeInches: z.number().min(0)`         |
| T-04-13    | Tampering              | mitigate    | CLOSED | Hex validated by Zod regex before storage; React renders `style={{ backgroundColor: hexColor }}` as a CSS property string — browser treats this as CSS, not HTML markup. No raw HTML injection API used anywhere in `color-swatch.tsx:41`, `search-to-add.tsx:228`, `project-supplies-tab.tsx:137`                |
| T-04-14    | Spoofing               | mitigate    | CLOSED | `supply-form-modal.tsx` and `fabric-form-modal.tsx` submit via server actions which each call `requireAuth()` as first statement                                                                                                                                                                                  |
| T-04-17    | Tampering              | mitigate    | CLOSED | `src/lib/validations/supply.ts`: `quantityAcquired: z.number().int().min(0)` and `quantityRequired: z.number().int().min(1)` in all three junction schemas and `updateQuantitySchema`                                                                                                                             |
| T-04-19    | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/supply-actions.ts`: addThreadToProject (line 369), addBeadToProject (line 395), addSpecialtyToProject (line 422), updateProjectSupplyQuantity (line 451), removeProjectThread (line 490), removeProjectBead (line 506), removeProjectSpecialty (line 522) — all call `await requireAuth()` first |
| T-04-20    | Elevation of Privilege | mitigate    | CLOSED | `src/lib/actions/shopping-actions.ts:143`: `markSupplyAcquired` calls `await requireAuth()` first; then `findUnique` for each type with explicit `if (!record) return { success: false, error: "Record not found" }` guard before update                                                                          |
| T-04-09-01 | Spoofing               | mitigate    | CLOSED | `src/lib/actions/fabric-actions.ts:11`: `createFabricBrand` calls `await requireAuth()` as first statement                                                                                                                                                                                                        |
| T-04-09-02 | Tampering              | mitigate    | CLOSED | `src/lib/validations/fabric.ts:41-44`: `fabricBrandSchema` validates `name: z.string().trim().min(1, "Brand name is required").max(200, "Brand name too long")`                                                                                                                                                   |

### Accepted Risks Log

| Threat ID  | Category        | Rationale                                                                                                                                         |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-04-01    | Tampering       | Hex color in `prisma/fixtures/dmc-threads.json` is a committed static fixture, not user input. No runtime validation required.                    |
| T-04-03    | DoS             | `prisma/seed.ts` is a one-time admin CLI operation, not exposed as an endpoint.                                                                   |
| T-04-07    | Info Disclosure | `getShoppingList` is single-user; no cross-user leakage possible by design.                                                                       |
| T-04-08    | DoS             | `getShoppingList` queries a bounded dataset (~500 threads). No pagination required at current scale.                                              |
| T-04-11    | Tampering       | `linkedProjectId` has `@unique` constraint in `prisma/schema.prisma:244` — database enforces one-to-one; single-user app removes cross-user risk. |
| T-04-12    | Tampering       | localStorage view mode is cosmetic only; affects no data or auth state.                                                                           |
| T-04-15    | Tampering       | Fabric `[id]` URL param passed to `getFabric(id)` — Prisma returns `null` for nonexistent IDs, resulting in 404. No data leakage.                 |
| T-04-16    | Info Disclosure | Fabric detail data is behind `requireAuth()`; single-user app has no cross-user exposure surface.                                                 |
| T-04-18    | Tampering       | Search input uses Prisma `contains` queries with parameterized bindings — no raw SQL; injection not possible.                                     |
| T-04-21    | Tampering       | Junction IDs are single-user, server-rendered CUIDs; Prisma P2025 on nonexistent IDs caught and returned as failure.                              |
| T-04-08-01 | Tampering       | localStorage view preference in supply/fabric catalog is cosmetic only.                                                                           |
| T-04-09-03 | Info Disclosure | Error messages use generic strings ("Failed to create brand", "Failed to create fabric") — no sensitive data exposed.                             |
| T-04-10-01 | N/A             | No security surface identified. No verification required.                                                                                         |

### Unregistered Flags

None. No `## Threat Flags` sections were present in any Phase 4 plan summary (04-01 through 04-10).

---

**Phase:** 3 — Designer & Genre Pages
**Audit Date:** 2026-04-08
**ASVS Level:** 1
**Auditor:** gsd-security-auditor (automated)

---

## Threat Verification

| Threat ID  | Category                                    | Disposition | Status | Evidence                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-03-01    | Elevation of Privilege                      | mitigate    | CLOSED | `requireAuth()` is first call in all actions: designer-actions.ts lines 11, 36, 65, 94, 177, 198 / genre-actions.ts lines 11, 36, 65, 94, 139, 158                                                                                                                    |
| T-03-02    | Tampering                                   | mitigate    | CLOSED | `designerSchema.parse(formData)` on `unknown` input — chart.ts:59-63: name `.trim().min(1).max(200)`, website `.url()`, notes `.max(5000)`. `genreSchema.parse(formData)` — chart.ts:67-69: name `.trim().min(1).max(100)`                                            |
| T-03-03    | Tampering (XSS)                             | mitigate    | CLOSED | All output via JSX text nodes (React auto-escape) throughout designer-detail.tsx, genre-detail.tsx, designer-list.tsx, genre-list.tsx. No raw HTML injection pattern used anywhere in phase output. Zod max-length caps payload: notes <= 5000, name <= 200/100 chars |
| T-03-04    | Information Disclosure (IDOR)               | accept      | CLOSED | Accepted — single-user app; requireAuth() guards all data access; see Accepted Risks Log                                                                                                                                                                              |
| T-03-05    | Denial of Service                           | mitigate    | CLOSED | `requireAuth()` at designer-actions.ts:65 and genre-actions.ts:65. `$transaction` confirmed: designer-actions.ts:76-83 (updateMany + delete), genre-actions.ts:76-82 (update disconnect + delete)                                                                     |
| T-03-06    | Tampering (SQL injection)                   | mitigate    | CLOSED | All IDs passed as `where: { id }` to Prisma parameterized queries — designer-actions.ts:40,68,97 / genre-actions.ts:40,68,97. No raw SQL anywhere in phase                                                                                                            |
| T-03-07    | Tampering (DesignerFormModal)               | mitigate    | CLOSED | Client calls `createDesigner(formData)` / `updateDesigner(id, formData)`; server runs `designerSchema.parse(formData)` as primary validation — designer-actions.ts:14,39                                                                                              |
| T-03-08    | Spoofing (designers page)                   | mitigate    | CLOSED | `getDesignersWithStats()` calls `requireAuth()` at designer-actions.ts:177 as first operation; page at designers/page.tsx:5                                                                                                                                           |
| T-03-09    | Tampering (GenreFormModal)                  | mitigate    | CLOSED | Client calls `createGenre` / `updateGenre`; server runs `genreSchema.parse(formData)` at genre-actions.ts:14,39 as primary validation                                                                                                                                 |
| T-03-10    | Spoofing (genres page)                      | mitigate    | CLOSED | `getGenresWithStats()` calls `requireAuth()` at genre-actions.ts:139 as first operation; page at genres/page.tsx:5                                                                                                                                                    |
| T-03-11    | Tampering (delete from detail)              | mitigate    | CLOSED | Both delete actions call `requireAuth()` first, then `findUnique` to confirm entity exists before `$transaction` delete — designer-actions.ts:65-91, genre-actions.ts:65-91                                                                                           |
| T-03-12    | Spoofing (detail page route)                | mitigate    | CLOSED | `getDesigner` calls `requireAuth()` at designer-actions.ts:94; `getGenre` at genre-actions.ts:94 — both before any Prisma query                                                                                                                                       |
| T-03-13    | Information Disclosure (non-existent ID)    | mitigate    | CLOSED | designers/[id]/page.tsx:12 and genres/[id]/page.tsx:12 call `notFound()` when action returns null — no distinction between wrong format vs absent ID                                                                                                                  |
| T-03-14    | Denial of Service (malformed URL ID)        | accept      | CLOSED | Accepted — Prisma `findUnique` with a malformed CUID returns null (no crash); `notFound()` called at page layer; see Accepted Risks Log                                                                                                                               |
| T-03-05-01 | Elevation of Privilege (gap closure delete) | mitigate    | CLOSED | `deleteDesigner` and `deleteGenre` carried `requireAuth()` before gap closure wiring. designer-list.tsx:78, genre-list.tsx:256 invoke the same protected actions                                                                                                      |
| T-03-05-02 | Tampering (ID in delete call)               | accept      | CLOSED | Accepted — single-user app; IDs are CUIDs set by Prisma; see Accepted Risks Log                                                                                                                                                                                       |

---

## Unregistered Flags

None. No `## Threat Flags` sections were present in any Phase 3 plan summary (03-01 through 03-05).

---

## Accepted Risks Log

| Threat ID  | Risk                                | Rationale                                                                                                     | Owner      |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| T-03-04    | IDOR on designer/genre IDs          | Single-user application. Auth guard ensures only the authenticated user can reach any data. No multi-tenancy. | Beth Allan |
| T-03-14    | Malformed ID in URL                 | Prisma handles gracefully (returns null); notFound() called; no crash or information disclosure.              | Beth Allan |
| T-03-05-02 | Attacker-supplied ID in delete call | Single-user app. CUIDs are cryptographically random and not guessable. All delete actions are auth-guarded.   | Beth Allan |

---

## Notes

- `src/lib/validations/designer.ts` and `src/lib/validations/genre.ts` do not exist as separate files. Both schemas (`designerSchema`, `genreSchema`) live in `src/lib/validations/chart.ts`. This is a naming inconsistency in the file plan list, not a security gap — actions import from the correct path.
- The `website` field on DesignerDetail is rendered as a direct `href` on an anchor tag. Zod `.url()` validation enforces a valid URL format before storage, blocking javascript: URI injection at the input boundary. Consistent with ASVS Level 1.
- All external links use `rel="noopener noreferrer"` (designer-detail.tsx:138, designer-list.tsx:333 and :403) — correct open-redirect hygiene for `target="_blank"` links.
