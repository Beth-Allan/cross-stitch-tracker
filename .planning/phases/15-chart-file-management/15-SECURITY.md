---
phase: 15
slug: chart-file-management
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-17
---

# Phase 15 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client -> Server Action | Untrusted file metadata (chartId, filename, mimeType, fileSize) | User-supplied strings, validated by Zod |
| Server Action -> R2 | Presigned URLs scoped to specific keys | R2 object keys, upload/download URLs |
| Client -> R2 (presigned PUT) | File content uploaded directly to R2 | Binary file data, limited by presigned URL scope |
| Client download -> getChartFileDownloadUrl | User requests presigned URL for a file | Ownership checked server-side before URL generation |
| Client delete -> deleteChartFile | User requests file deletion | Ownership checked server-side before operation |
| Migration SQL -> Database | Direct SQL modifies production data | Must be idempotent |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-15-01 | Spoofing | addChartFile | mitigate | requireAuth() + chart.project.userId ownership check before DB write | closed |
| T-15-02 | Tampering | addChartFile | mitigate | Zod validation at boundary; MIME allowlist in presigned URL generation | closed |
| T-15-03 | Elevation of Privilege | deleteChartFile | mitigate | file.chart.project.userId === user.id before delete | closed |
| T-15-04 | Information Disclosure | getChartFileDownloadUrl | mitigate | Ownership check before presigned GET URL; 1-hour expiry | closed |
| T-15-05 | Denial of Service | addChartFile | accept | 10MB per-file via presigned URL; no count limit (single-user app) | closed |
| T-15-06 | Tampering | ChartFileUpload | mitigate | Client extension + MIME validation; server-side MIME allowlist | closed |
| T-15-07 | Denial of Service | ChartFileUpload | accept | 10MB enforced by presigned URL; no count limit (single-user app) | closed |
| T-15-08 | Spoofing | createChart (fileKeys) | mitigate | requireAuth() in creation actions; fileKeys scoped via presigned URLs | closed |
| T-15-09 | Information Disclosure | ChartFileList download | mitigate | getChartFileDownloadUrl checks ownership; 1-hour URL expiry | closed |
| T-15-10 | Elevation of Privilege | ChartFileList delete | mitigate | deleteChartFile verifies chart.project.userId === user.id | closed |
| T-15-11 | Repudiation | File deletion | accept | No audit log (single-user app; acceptable risk) | closed |
| T-15-12 | Information Disclosure | Data migration | accept | URL strings copied to ChartFile table; same access controls apply | closed |
| T-15-13 | Tampering | Schema drop | mitigate | Migration-before-drop order; NOT EXISTS idempotency guard | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-15-01 | T-15-05, T-15-07 | No per-chart file count limit; 10MB per-file enforced. Single-user app, DoS risk is self-inflicted. | Plan author | 2026-05-17 |
| AR-15-02 | T-15-11 | No audit log for file deletions. Single-user app — user is the only actor. | Plan author | 2026-05-17 |
| AR-15-03 | T-15-12 | Migration copies existing URLs to new table. Access controls unchanged. | Plan author | 2026-05-17 |

---

## Notes

- Client uses `ALLOWED_CHART_FILE_TYPES` from `upload.ts`; server uses `ALLOWED_FILE_TYPES` from same module. Both currently contain identical 6 MIME types. If these diverge in future, server-side check could silently mismatch. Consider consolidating to single constant.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-17 | 13 | 13 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-17
