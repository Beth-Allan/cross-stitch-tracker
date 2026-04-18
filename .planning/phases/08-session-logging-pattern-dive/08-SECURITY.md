---
phase: 8
slug: session-logging-pattern-dive
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-16
---

# Phase 8 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client -> Server Action | Untrusted form data (session log, fabric assignment) crosses into server-side processing | Session form fields, projectId, fabricId |
| Session -> Project | Session mutations must only affect projects owned by the authenticated user | userId ownership check |
| R2 Upload | Client uploads photo directly to R2 via presigned URL | File bytes + content type |
| Database migration | One-time SQL UPDATE modifying project data | startingStitches field |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-08-01 | Tampering | sessionFormSchema | mitigate | Zod `.trim().min(1)` on projectId, date refine, stitchCount `.min(1)` | closed |
| T-08-02 | Tampering | uploadRequestSchema | mitigate | `category === "sessions"` branch checks `ALLOWED_IMAGE_TYPES` in `upload-actions.ts:50-57` | closed |
| T-08-03 | Elevation of Privilege | createSession | mitigate | `project.userId !== user.id` guard in `session-actions.ts:60` | closed |
| T-08-04 | Elevation of Privilege | updateSession | mitigate | Session traversal to project ownership check in `session-actions.ts:109` | closed |
| T-08-05 | Elevation of Privilege | deleteSession | mitigate | Same ownership traversal pattern in `session-actions.ts:159` | closed |
| T-08-06 | Tampering | sessionFormSchema | mitigate | Same as T-08-01 — `sessionFormSchema` Zod validation | closed |
| T-08-07 | Tampering | stitchesCompleted | mitigate | All mutations in `$transaction`; `recalculateProgress` aggregates from DB, never reads client input | closed |
| T-08-08 | Information Disclosure | getSessionsForProject | mitigate | Project ownership verified before `stitchSession.findMany` | closed |
| T-08-09 | Spoofing | LogSessionModal | mitigate | `requireAuth()` in server actions; modal is UI-only with no data access | closed |
| T-08-10 | Denial of Service | Photo upload | mitigate | `MAX_FILE_SIZE` 10MB cap; `ALLOWED_IMAGE_TYPES` enforced | closed |
| T-08-11 | Information Disclosure | activeProjects | accept | Picker filters by `userId` — single-user app | closed |
| T-08-12 | Information Disclosure | getSessionsForProject | mitigate | Ownership check before returning data (same as T-08-08) | closed |
| T-08-13 | Information Disclosure | getAllSessions | mitigate | `where: { project: { userId: user.id } }` | closed |
| T-08-14 | Elevation of Privilege | assignFabricToProject | mitigate | `project.userId !== user.id` guard in `pattern-dive-actions.ts:302` | closed |
| T-08-15 | Information Disclosure | getFabricRequirements | mitigate | `where: { project: { userId: user.id } }` | closed |
| T-08-16 | Information Disclosure | getStorageGroups | mitigate | Projects filtered by `userId`; owned fabrics by `linkedProject.userId` | closed |
| T-08-17 | Tampering | assignFabricToProject | mitigate | `fabric.linkedProjectId` check inside `$transaction` prevents stealing | closed |
| T-08-18 | Tampering | sessionFormSchema | mitigate | `.trim()` before `.min(1)` on projectId prevents whitespace bypass | closed |
| T-08-19 | Tampering | stitchesCompleted display | mitigate | Read-only when `sessionCount > 0`; writes only via `recalculateProgress` aggregate | closed |
| T-08-20 | Tampering | Data migration | accept | Idempotent additive SQL; already executed; no runtime input surface | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-08-01 | T-08-11 | Active projects picker filters by `userId` — only shows authenticated user's own projects. Single-user app removes cross-user concern. | Beth Allan | 2026-04-16 |
| AR-08-02 | T-08-20 | Data migration is idempotent additive SQL that only sets `startingStitches` where currently 0. Already executed; no runtime input surface. | Beth Allan | 2026-04-16 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-16 | 20 | 19 | 1 | gsd-security-auditor |
| 2026-04-16 | 20 | 20 | 0 | manual fix (T-08-02 sessions content-type enforcement) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-16
