---
phase: 13
slug: supply-takeover
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-16
---

# Phase 13 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client -> createChartWithSupplies | Untrusted supply batch payload from form submission | Chart fields + supply arrays (threadIds, beadIds, specialtyIds, quantities) |
| Client -> catalog search/create actions | Adapter delegates search and inline-create to auth-guarded server actions | Search queries, create payloads (colorName, productCode, brandId) |
| Client -> localStorage | Draft data persisted locally for crash recovery | Form values + supply rows + calcParams (no server trust issue) |
| Adapter -> updateProjectSupplyQuantity | ServerActionAdapter sends recalculated values through existing server action | stitchCount, quantityRequired per junction row |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-13-01 | Elevation of Privilege | createChartWithSupplies | mitigate | `requireAuth()` at function entry; project created with `userId: user.id` | closed |
| T-13-02 | Tampering | batchSupplySchema input | mitigate | Zod validation: supplyId non-empty, need >= 1, stitchCount >= 0; `.max(500)` per type | closed |
| T-13-03 | Denial of Service | batch payload size | mitigate | `.max(500)` on each supply array in batchSupplySchema; Prisma FK constraints | closed |
| T-13-04 | Tampering | supply IDs -> non-existent catalog | accept | Prisma FK constraints throw on invalid supplyId; $transaction rolls back | closed |
| T-13-05 | Information Disclosure | SummaryBar | accept | Shows only user's own form values; no cross-user data | closed |
| T-13-06 | Tampering | CalculatorCard CalcParams | accept | Client-side state only; server validates independently | closed |
| T-13-07 | Spoofing | createChartWithSupplies call | mitigate | `requireAuth()` guard (same as T-13-01) | closed |
| T-13-08 | Tampering | supply payload from adapter.getRows() | mitigate | batchSupplySchema validates all fields at server boundary (same as T-13-02) | closed |
| T-13-09 | Information Disclosure | form.values in SummaryBar | accept | User's own form data; no server data exposure | closed |
| T-13-10 | Denial of Service | rapid mode toggles | accept | Synchronous state change; no server calls on toggle | closed |
| T-13-11 | Tampering | createFn field mapping | mitigate | Zod schemas on server actions reject malformed payloads; field mapping fixed in Plan 04 gap closure | closed |
| T-13-12 | Information Disclosure | draft auto-save localStorage | accept | localStorage is single-user; same security model as V1 drafts | closed |
| T-13-13 | Tampering | adapter recalculation | accept | Display-aid only; server action validates all field values via Zod | closed |
| T-13-14 | Denial of Service | bulk recalculation on calcParams | mitigate | Bounded by project thread row count; ref-based change detection prevents cascading recalculation | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-13-01 | T-13-04 | Prisma FK constraints provide DB-level enforcement; invalid IDs from client would require intentional tampering of search results | Plan author | 2026-05-16 |
| AR-13-02 | T-13-05 | SummaryBar renders form.values the user entered; no sensitive or cross-user data | Plan author | 2026-05-16 |
| AR-13-03 | T-13-06 | CalcParams are used for client display calculation only; server action validates supply quantities independently | Plan author | 2026-05-16 |
| AR-13-04 | T-13-09 | Same as AR-13-02; SummaryBar is read-only display of user's own input | Plan author | 2026-05-16 |
| AR-13-05 | T-13-10 | Activity toggle is pure React state; no network calls or server mutations | Plan author | 2026-05-16 |
| AR-13-06 | T-13-12 | localStorage is per-origin, single-user app; no cross-user access risk | Plan author | 2026-05-16 |
| AR-13-07 | T-13-13 | Recalculation is a display aid; quantityRequired is re-validated by Zod on server | Plan author | 2026-05-16 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-16 | 14 | 14 | 0 | gsd-secure-phase |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-16
