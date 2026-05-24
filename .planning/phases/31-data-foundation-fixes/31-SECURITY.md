---
phase: 31
slug: data-foundation-fixes
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-24
---

# Phase 31 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client -> createSeries | Untrusted form data enters server action | Series name, totalCount, designerId, notes |
| client -> updateSeries | Untrusted form data + entity ID enters server action | Series name, totalCount, designerId, notes, series ID |
| client -> deleteSeries | Entity ID from client (could be forged) | Series ID |
| N/A (computeSeriesProgress) | Pure utility with no I/O — no trust boundary crossed | N/A |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-31-01 | Tampering | seriesSchema input | mitigate | Zod `.trim().min(1).max(200)` on name; Prisma parameterized queries | closed |
| T-31-02 | DoS | notes field | mitigate | Zod `.max(5000)` constraint on notes input | closed |
| T-31-03 | Information Disclosure | computeSeriesProgress | accept | Pure function operating on already-authenticated query results; no user input enters directly | closed |
| T-31-04 | Spoofing | All CRUD actions | mitigate | `requireAuth()` as first line of every action; throws "Unauthorized" if no session | closed |
| T-31-05 | Tampering | createSeries/updateSeries | mitigate | Zod `seriesSchema.parse()` validates all input at boundary | closed |
| T-31-06 | Tampering | deleteSeries ID param | accept | Single-user app; no ownership model on reference entities (matches Designer pattern) | closed |
| T-31-07 | Repudiation | CRUD mutations | accept | No audit log requirement; single-user app with low repudiation risk | closed |
| T-31-08 | DoS | Large notes field | mitigate | Zod `.max(5000)` on notes field (same control as T-31-02) | closed |
| T-31-SC | Tampering | npm/pip/cargo installs | accept | No new packages installed in this phase | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-31-01 | T-31-03 | Pure function with no I/O; data already authenticated upstream | gsd-secure-phase | 2026-05-24 |
| AR-31-02 | T-31-06 | Single-user app with no multi-tenant ownership model; consistent with Designer entity pattern | gsd-secure-phase | 2026-05-24 |
| AR-31-03 | T-31-07 | No audit log requirement; single-user app with negligible repudiation risk | gsd-secure-phase | 2026-05-24 |
| AR-31-04 | T-31-SC | No new dependencies added in this phase; supply chain surface unchanged | gsd-secure-phase | 2026-05-24 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-24 | 9 | 9 | 0 | gsd-secure-phase |

---

## Verification Evidence

| Threat ID | File | Line(s) | Evidence |
|-----------|------|---------|----------|
| T-31-01 | src/lib/validations/series.ts | 4 | `.trim().min(1, "Series name is required").max(200, "Series name too long")` |
| T-31-02 | src/lib/validations/series.ts | 13 | `.max(5000, "Notes too long")` |
| T-31-04 | src/lib/actions/series-actions.ts | 12, 38, 67, 92 | `await requireAuth()` on createSeries, updateSeries, deleteSeries, getSeriesWithStats |
| T-31-05 | src/lib/actions/series-actions.ts | 15, 40 | `seriesSchema.parse(formData)` on create and update |
| T-31-08 | src/lib/validations/series.ts | 13 | Same control as T-31-02 |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-24
