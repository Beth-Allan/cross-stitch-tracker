---
phase: 3
slug: designer-genre-pages
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-08
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client -> Server Action | Untrusted form data crosses into server action | Designer/Genre form fields (name, website, notes) |
| Server Action -> Database | Validated data passed to Prisma queries | Zod-validated strings, IDs |
| URL params -> Server query | Dynamic [id] route parameter used in Prisma query | Entity ID (string) |
| Client -> Server Action (delete) | Delete actions from list/detail pages | Entity ID (string) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-03-01 | Elevation of Privilege | All server actions | mitigate | `requireAuth()` as first call in every action; test coverage verifies auth rejection | closed |
| T-03-02 | Tampering | create/update actions | mitigate | `designerSchema.parse()` / `genreSchema.parse()` on `unknown` input; name trimmed + max-length; website `.url()`; notes max 5000 | closed |
| T-03-03 | Tampering (XSS) | name/notes fields | mitigate | React auto-escapes JSX text output; Zod max-length prevents extreme payloads; no raw HTML injection | closed |
| T-03-04 | Information Disclosure | IDOR on designer/genre IDs | accept | Single-user app with auth guard; all entities belong to the one user | closed |
| T-03-05 | Denial of Service | deleteDesigner, deleteGenre | mitigate | Auth guard prevents unauth access; `$transaction` ensures atomicity | closed |
| T-03-06 | Tampering (SQL injection) | ID parameters | mitigate | Prisma parameterized queries; IDs via `where: { id }` | closed |
| T-03-07 | Tampering | DesignerFormModal submission | mitigate | Server-side Zod validation is primary; client-side is convenience only | closed |
| T-03-08 | Spoofing | Designer page route | mitigate | `getDesignersWithStats` calls `requireAuth()` | closed |
| T-03-09 | Tampering | GenreFormModal submission | mitigate | Server-side Zod validation is primary; client form is convenience only | closed |
| T-03-10 | Spoofing | Genre page route | mitigate | `getGenresWithStats` calls `requireAuth()` | closed |
| T-03-11 | Tampering | Delete from detail page | mitigate | Auth + existence check + `$transaction` atomicity | closed |
| T-03-12 | Spoofing | Detail page routes | mitigate | `getDesigner`/`getGenre` call `requireAuth()` as first operation | closed |
| T-03-13 | Information Disclosure | Non-existent entity ID | mitigate | `notFound()` returns 404; no information leakage about "near" IDs | closed |
| T-03-14 | Denial of Service | Malformed ID in URL | accept | Prisma returns null for non-existent IDs; `notFound()` called; no crash | closed |
| T-03-05-01 | Elevation of Privilege | Delete actions (gap closure) | mitigate | Actions already call `requireAuth()`; gap closure only wired client UI to existing protected actions | closed |
| T-03-05-02 | Tampering | Delete IDs (gap closure) | accept | Single-user app; IDs are CUIDs, not guessable | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-04 | Single-user app with auth guard; all designers/genres belong to the one user implicitly. IDOR not exploitable. | gsd-security-auditor | 2026-04-08 |
| AR-03-02 | T-03-14 | Prisma safely handles non-existent IDs (returns null); `notFound()` called; no crash or resource exhaustion. | gsd-security-auditor | 2026-04-08 |
| AR-03-03 | T-03-05-02 | Single-user app; all designers/genres belong to the user. IDs are CUIDs, not guessable. No multi-tenant isolation needed. | gsd-security-auditor | 2026-04-08 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-08 | 16 | 16 | 0 | gsd-security-auditor (sonnet) |

---

## Observations

1. **Validation schema location** — Both `designerSchema` and `genreSchema` live in `src/lib/validations/chart.ts`, not in separate files. No security gap, just a naming convention choice.
2. **External URL in href** — Designer `website` field rendered as anchor `href`. Zod `.url()` blocks `javascript:` URIs at input time, and all external links carry `rel="noopener noreferrer"`. Sound at ASVS Level 1.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-08
