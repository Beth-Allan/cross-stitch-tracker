---
phase: 06
slug: gallery-cards-view-modes
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-14
---

# Phase 06 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client URL params → gallery state | Untrusted URL params parsed by nuqs typed parsers into view/sort/filter state | View mode, sort field/dir, search text, status/size arrays |
| server action → Prisma | getChartsForGallery scoped by authenticated userId | Chart + project + supply count data |
| presigned image URL → img src | R2 presigned URLs rendered in img tags with onError fallback | Temporary image URLs (15min TTL) |
| card data → rendered HTML | All card text values (name, designer, genre) rendered via React JSX | Auto-escaped strings, no injection risk |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01 | Information Disclosure | getChartsForGallery | mitigate | Query scoped by `userId` from `requireAuth()` — `where: { project: { userId: user.id } }` in chart-actions.ts:329 | closed |
| T-06-02 | Tampering | URL search params | mitigate | nuqs `parseAsStringLiteral` validates against `VIEW_MODES`, `SORT_FIELDS`, `SORT_DIRS` constants; invalid params fall back to defaults | closed |
| T-06-03 | Spoofing | getChartsForGallery | mitigate | `requireAuth()` validates JWT session before any data access (chart-actions.ts:326) | closed |
| T-06-04 | Tampering | img onError | accept | Image load failure shows CoverPlaceholder fallback; no user data exposed. Low severity. | closed |
| T-06-05 | Information Disclosure | presigned URLs in img src | accept | Presigned URLs are temporary (15min TTL) and scoped to authenticated user's images. Existing pattern from Phase 2. | closed |
| T-06-06 | Tampering | search input | accept | Search is client-side `.includes()` comparison only. React auto-escapes rendered values. No injection risk. | closed |
| T-06-07 | Tampering | dropdown options | accept | Options are hardcoded from `STATUS_CONFIG` and `SizeCategory` constants, not user-provided. | closed |
| T-06-08 | Tampering | table sort headers | accept | Sort state managed client-side against typed SortField enum; invalid values rejected by nuqs parser. | closed |
| T-06-09 | Information Disclosure | charts page.tsx | mitigate | Same control as T-06-01: `getChartsForGallery` scoped by `requireAuth()` userId. Server Component passes data to client via props. | closed |
| T-06-10 | Denial of Service | client filtering 500+ cards | accept | Client-side `useMemo` filtering of ~500 items is well within React performance bounds for single user. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-04 | Image load failure is cosmetic (shows placeholder). No data exposure. | Phase 6 threat model | 2026-04-14 |
| AR-06-02 | T-06-05 | Presigned URL pattern established in Phase 2; TTL-scoped, auth-gated. | Phase 6 threat model | 2026-04-14 |
| AR-06-03 | T-06-06 | Client-side search with React JSX escaping. No server interaction. | Phase 6 threat model | 2026-04-14 |
| AR-06-04 | T-06-07 | Dropdown values are compile-time constants. | Phase 6 threat model | 2026-04-14 |
| AR-06-05 | T-06-08 | Sort state uses typed enum with nuqs validation. | Phase 6 threat model | 2026-04-14 |
| AR-06-06 | T-06-10 | Single-user app with ~500 items. useMemo prevents re-computation. | Phase 6 threat model | 2026-04-14 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-14 | 10 | 10 | 0 | Claude (gsd-secure-phase) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-14
