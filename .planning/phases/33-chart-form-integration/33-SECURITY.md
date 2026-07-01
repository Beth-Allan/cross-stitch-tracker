---
phase: 33
slug: chart-form-integration
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-01
---

# Phase 33 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client form → server action | seriesId from form input crosses to chart-actions | string (nullable FK) |
| inline dialog → createSeries | name from user input crosses to series-actions | string (entity name) |
| server component → client component | series data fetched server-side, passed as props | SeriesWithStats[] |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-33-01 | Tampering | chart-actions seriesId | mitigate | Zod validates `z.string().nullable()` at form boundary (chart.ts:10); Prisma FK constraint rejects invalid IDs (schema.prisma:76-77) | closed |
| T-33-02 | Spoofing | createSeries from hook | accept | createSeries already calls requireAuth(); no new auth surface | closed |
| T-33-03 | Information Disclosure | designerId passthrough | accept | designerId is already in form state, owned by the authenticated user; no new exposure | closed |
| T-33-04 | Information Disclosure | getSeriesWithStats in page | accept | Series list is user-scoped (requireAuth in action); no cross-user data exposure | closed |
| T-33-05 | Denial of Service | Promise.all in page | accept | getSeriesWithStats is a single query; existing pattern used by 5 other fetches in same Promise.all | closed |
| T-33-SC | Tampering | npm/pip/cargo installs | accept | No new packages installed in this phase | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-33-01 | T-33-02 | createSeries already calls requireAuth(); no new auth surface added by hook caller | orchestrator | 2026-07-01 |
| AR-33-02 | T-33-03 | designerId already in form state, user-owned; passthrough to createSeries does not expose new data | orchestrator | 2026-07-01 |
| AR-33-03 | T-33-04 | getSeriesWithStats is user-scoped via requireAuth; single-user app, no cross-user exposure | orchestrator | 2026-07-01 |
| AR-33-04 | T-33-05 | Single lightweight query added to existing Promise.all with 5 other fetches; negligible DoS impact | orchestrator | 2026-07-01 |
| AR-33-05 | T-33-SC | No new packages installed in this phase; supply chain attack surface unchanged | orchestrator | 2026-07-01 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-01 | 6 | 6 | 0 | orchestrator |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-01
