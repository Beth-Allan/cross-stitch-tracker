# SECURITY.md

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
