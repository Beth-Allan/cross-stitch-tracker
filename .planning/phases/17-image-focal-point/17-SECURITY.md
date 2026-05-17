# Phase 17 — Image Focal Point: Security Audit

**Phase:** 17 — image-focal-point
**Audit Date:** 2026-05-17
**ASVS Level:** 1
**Auditor:** gsd-security-auditor
**Result:** SECURED — 8/8 threats closed

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-17-01 | Elevation of Privilege | mitigate | CLOSED | `src/lib/actions/focal-point-actions.ts:19` — `chart.project.userId !== user.id` ownership check; returns `{ success: false, error: "Chart not found" }` on mismatch |
| T-17-02 | Tampering | mitigate | CLOSED | `src/lib/validations/focal-point.ts:6-7` — `z.number().min(0).max(1).nullable()` on both x and y; `focal-point-actions.ts:37` catches `ZodError` and returns validation error; rejects NaN, Infinity, and out-of-range values |
| T-17-03 | Spoofing | mitigate | CLOSED | `focal-point-actions.ts:1` — `"use server"` directive (Next.js built-in CSRF protection); `focal-point-actions.ts:10` — `requireAuth()` called before any operation; `src/lib/auth-guard.ts:20` — checks `session?.user?.id` specifically, throws "Unauthorized" if absent |
| T-17-04 | Information Disclosure | accept | CLOSED | See Accepted Risks log below |
| T-17-05 | Information Disclosure | accept | CLOSED | See Accepted Risks log below |
| T-17-06 | Tampering | accept | CLOSED | See Accepted Risks log below |
| T-17-07 | Tampering | mitigate | CLOSED | `focal-point-editor.tsx:54-55` — `Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))` and same for y; client-side clamping at click handler; server-side Zod validation also enforces range (T-17-02) |
| T-17-08 | Denial of Service | accept | CLOSED | See Accepted Risks log below |

---

## Accepted Risks Log

| Threat ID | Category | Component | Rationale |
|-----------|----------|-----------|-----------|
| T-17-04 | Information Disclosure | focal-point-actions.ts | Focal point data is two float values (x/y coordinates 0-1). Contains no PII, no business-sensitive data, and no user-identifying information. Low-value target with no meaningful disclosure risk. |
| T-17-05 | Information Disclosure | display components (gallery-card, spotlight-card, currently-stitching-card, buried-treasures-section, genre-detail, designer-detail, project-accordion) | Focal point coordinates are visible in rendered CSS `object-position` inline styles, browser devtools, and HTML source. This is unavoidable and inconsequential — the values are two floats with no sensitive meaning. |
| T-17-06 | Tampering | CSS object-position (client-side) | Client-side CSS `object-position` is a presentation concern only. A user modifying their own browser's CSS cannot affect server-stored data or other users' views. Server data (focalPointX/Y in the database) remains authoritative. |
| T-17-08 | Denial of Service | focal-point-editor.tsx | Rapid clicking recalculates the pending `pendingPoint` state locally but only issues a server action call on explicit Save. `useTransition` serializes save calls and all action buttons are disabled (`isPending`) while a transition is in flight. No debounce is required. Risk is self-limiting to the authenticated user's own session. |

---

## Unregistered Flags

None. No `## Threat Flags` sections were present in any SUMMARY file (17-01, 17-02, 17-03). No new attack surface was flagged by the executor during implementation.

---

## Audit Notes

**requireAuth() verification:** `src/lib/auth-guard.ts` checks `session?.user?.id` (not merely `session?.user`) before returning. This ensures the JWT callbacks that thread `user.id` into the session are active — without them, every request would be rejected. This is the single source of truth for authentication checks per project conventions.

**Zod null-pair validation:** The schema includes a `.refine()` that enforces `(data.x === null) === (data.y === null)` — both coordinates must be set together or both null. This is stricter than the threat model required and eliminates a potential partial-update state where one coordinate is null and the other is not.

**Double validation (T-17-07 + T-17-02):** Coordinates are clamped client-side in `handleImageClick` and then independently range-validated server-side by Zod. Server-side validation is the enforcement layer; client-side clamping is defense-in-depth that improves UX by preventing submissions that would fail validation.

**Hero banner exclusion (D-06):** The blurred background `<Image>` in `hero-cover-banner.tsx` uses `object-cover` but is `aria-hidden="true"`, `opacity-60`, and `blur-[20px]`. It is explicitly excluded from focal point application. This is a documented architectural decision, not a gap.
