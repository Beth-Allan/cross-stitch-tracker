# Security Checklist

**Status:** Standing artifact from the workflow overhaul (2026-08-16; Beth's requirement that
security review happens because the process consults this file, never because she asks).
**Who consults it:** every review layer (session-protocol §5) — the per-PR auto-review sweeps
the diff against it; `/review` and `/stage-review` run it as an explicit pass; the
whole-codebase audit sweeps the repo against it. Findings are fixed before merge or become a
maintenance-ledger row with Beth's word on the record.

Distilled from the vibe-coding security checklist categories — foundations · access control ·
inputs & data · integrity · operations — made concrete for this repo. Changing this file is a
gate-config change (drift, session-protocol §6).

## 1. Foundations

- [ ] No secrets in the diff: `.env*` files, `AUTH_SECRET`, `DATABASE_URL`, R2 keys, bcrypt
      hashes. `.env` files are never committed.
- [ ] Nothing secret reaches the client bundle: `NEXT_PUBLIC_` only for genuinely public
      values; server-only modules (`db.ts`, `auth.ts`, R2 clients) never imported from
      `"use client"` files.
- [ ] Errors are sanitized: no raw error objects or stack traces to the client; server logs
      carry context without credentials (the Phase 22 pattern — generic client message,
      `console.error` server-side).
- [ ] Errors fail closed: a thrown error on an auth or ownership path denies access, never
      falls through to the happy path.
- [ ] Dependencies pinned exact; a new package is justified in the PR; `npm audit` findings
      are fixed or ledgered (the recurring ~monthly maintenance row owns the cadence).

## 2. Access control

- [ ] **The outer fence still gates the routes it should.** It is two files, and both are
      load-bearing: `proxy.ts` — Next.js 16's middleware rename, re-exporting Auth.js's `auth`
      with a matcher that excludes `api/auth`, `_next/*`, icons and the manifest — decides which
      requests reach the fence, and the **`authorized` callback in `src/lib/auth.ts`** decides
      what happens to them. Auth.js defaults `authorized` to `true`, so a fence missing that
      callback passes every request while looking exactly like a working one (the defect item P1
      closed). Anything added to the matcher's exclusion list **or** to the callback's public-path
      set is unauthenticated from then on, and nothing else in the app will say so. Both
      review-gated.
- [ ] Every server action and API route calls `requireAuth()` from `@/lib/auth-guard` and
      checks `user.id` exists. Fallback IDs (`user.id ?? "1"`) are banned. No local copies of
      the guard.
- [ ] Every query and mutation touching user data filters by ownership — directly via `userId`
      where the model carries one (`Project`, `StorageLocation`, `StitchingApp`), or by
      traversing the project relation where it does not. **`Chart.project` and
      `Fabric.linkedProjectId` are both optional**, so those two have rows with no ownership
      path at all; a query over either that does not traverse a project is unscoped by
      construction (`docs/CONCERNS.md`). Single-user today; nothing may assume it.
- [ ] The Auth.js v5 JWT/session callbacks in `src/lib/auth.ts` stay intact —
      `session.user.id` threading is load-bearing (`.claude/rules/auth-patterns.md`); without
      it `requireAuth()` rejects everything. The file is review-gated.
- [ ] Rate limiting (`src/lib/rate-limit.ts`) still covers login **at `authorizeCredentials`**,
      not at a caller. The Credentials provider is reachable both through the login form action
      and directly at `POST /api/auth/callback/credentials`, which the matcher must exclude, so a
      limit applied anywhere but inside `authorize()` leaves the second path unthrottled (the
      defect item P1 closed). `recordAttempt()` is the enforcing call and belongs there alone;
      `peekRateLimit()` is read-only and may be called for messaging. Any new public or
      unauthenticated endpoint is considered for it.

## 3. Inputs & data

- [ ] Zod parses at every boundary — server actions and API routes validate before use;
      `.trim()` before `.min(1)`; date strings validated; empty-to-null normalization explicit.
- [ ] File uploads validated **server-side**, not just in the browser: MIME allowlist, size
      caps (50MB), extension/key sanitization. Presigned R2 URLs are scoped and short-lived;
      `response.ok` checked on every upload fetch.
- [ ] No raw SQL without an ownership check and a safety comment; the Prisma API is preferred
      always.
- [ ] User-supplied strings are never interpolated unsanitized into R2 object keys, file
      paths, or URLs; no unvalidated redirects.

## 4. Integrity

- [ ] Multi-step writes that must be atomic use `$transaction`.
- [ ] Cache correctness: `unstable_cache` keys scoped so nothing bleeds across users or
      entities; every mutation that changes stats-visible data calls `revalidateTag("stats")`
      — the trap that produced 999.41 and 999.42.
- [ ] R2 object lifecycle: replace and delete paths clean up the old object (orphan history:
      999.50, 999.52); cleanup failures are logged, never bare-caught.
- [ ] No bare `catch {}` / `.catch(() => {})` in new code — failures log with `console.error`
      (Phase 35). Recorded exception: localStorage reads may stay silent (Beth's ruling,
      Phase 35 D-03).
- [ ] No test weakened, skipped, or deleted to get green (hard rule 2); schema migrations go
      through the review-gated path.

## 5. Operations

- [ ] Merge = production deploy: layer-1 auto-review passed, Vercel preview shown to Beth for
      UI changes (D-13), gated cores fresh-reviewed (§5 layer 3) — all **before** merge.
- [ ] Vercel env vars scoped correctly (preview vs production) for anything the change adds;
      R2-on-preview is a tracked build item because previews without images break the D-13
      ritual.
- [ ] Neon backup/restore posture is known and current — an audit sweep target; if unknown,
      that is a ledger row, not a shrug.
- [ ] Production incident path known: a bad merge on main is reverted immediately
      (session-protocol §9 recovery), then fixed forward.

## Known-good structure (verify unchanged; don't re-litigate)

`requireAuth()` on all actions · Zod at all boundaries · `rate-limit.ts` on login · the
Phase 22 error-sanitization pattern · R2 orphan cleanup for session photos and chart covers
(Phase 30). **Genuinely under-tested going into the audit:** file-upload/R2 hardening breadth,
Auth.js beta session behavior, errors failing closed, Neon backup/restore.
