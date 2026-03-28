---
phase: quick
plan: 260328-igi
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/rate-limit.ts
  - src/lib/auth.ts
  - src/app/(auth)/login/actions.ts
  - src/lib/db.ts
autonomous: true
must_haves:
  truths:
    - "Rate limit message shown to user instead of generic 'Invalid credentials'"
    - "Missing AUTH_USER_EMAIL or AUTH_USER_PASSWORD_HASH logs error and returns null"
    - "authorize callback does not crash on malformed env vars"
    - "Non-CredentialsSignin AuthErrors are logged server-side"
    - "Missing DATABASE_URL gives clear error message"
    - "Dead authorized callback is removed"
  artifacts:
    - path: "src/lib/auth.ts"
      provides: "Hardened authorize with try-catch, env var validation, no dead code"
    - path: "src/app/(auth)/login/actions.ts"
      provides: "Rate limit check before signIn, error logging"
    - path: "src/lib/rate-limit.ts"
      provides: "In-memory rate limiter with serverless limitation comment"
    - path: "src/lib/db.ts"
      provides: "Explicit DATABASE_URL guard"
  key_links:
    - from: "src/app/(auth)/login/actions.ts"
      to: "src/lib/rate-limit.ts"
      via: "checkRateLimit called before signIn"
      pattern: "checkRateLimit.*before.*signIn"
---

<objective>
Fix 7 critical and high severity auth/security issues from phase 1 code review.

Purpose: Harden the auth layer so rate limiting actually works for users, env var issues produce clear errors instead of crashes, and dead code is removed.
Output: Four hardened files with no behavioral regressions.
</objective>

<execution_context>
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/rate-limit.ts
@src/lib/auth.ts
@src/app/(auth)/login/actions.ts
@src/lib/db.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix login action — rate limit before signIn, log errors</name>
  <files>src/app/(auth)/login/actions.ts</files>
  <action>
Restructure loginAction to fix issues #1, #3, and #5:

1. Import `checkRateLimit` from `@/lib/rate-limit` into actions.ts.
2. After Zod validation succeeds, call `checkRateLimit(parsed.data.email)` BEFORE calling `signIn`. If not allowed, return `{ error: "Too many attempts. Try again in ${retryAfter} seconds." }` directly — this bypasses Auth.js error wrapping entirely.
3. Remove the rate limit check from auth.ts authorize (it moves here).
4. In the AuthError catch block, add `console.error("Auth error:", error.type, error.message)` for ALL AuthError types (not just non-CredentialsSignin). Keep the existing user-facing messages unchanged ("Invalid credentials" for CredentialsSignin, "Something went wrong" for others).
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>Rate limit check happens before signIn so the message reaches the user. All AuthErrors logged server-side.</done>
</task>

<task type="auto">
  <name>Task 2: Harden auth.ts — try-catch, env validation, remove dead code</name>
  <files>src/lib/auth.ts, src/lib/rate-limit.ts</files>
  <action>
Fix issues #2, #4, and #6 in auth.ts, and #1 comment in rate-limit.ts:

**src/lib/auth.ts:**
1. Remove the `checkRateLimit`/`resetRateLimit` imports and all rate limit logic from `authorize` (moved to actions.ts in Task 1). Keep the `resetRateLimit` call — actually, move `resetRateLimit(email)` to actions.ts too (call it after successful signIn... but signIn redirects on success and throws NEXT_REDIRECT). Instead: remove resetRateLimit from authorize entirely. The rate limiter's 30s cooldown window handles reset naturally for a single-user app.
2. Wrap the entire `authorize` body in try-catch. On catch, log `console.error("authorize error:", error)` and return `null` (generic failure, no info leak).
3. At the top of `authorize`, before any logic, validate env vars:
   ```
   if (!process.env.AUTH_USER_EMAIL || !process.env.AUTH_USER_PASSWORD_HASH) {
     console.error("Missing AUTH_USER_EMAIL or AUTH_USER_PASSWORD_HASH environment variables")
     return null
   }
   ```
4. Remove the `authorized` callback entirely (lines 46-48) — it is dead code without middleware.ts.
5. Remove the now-unused imports of `checkRateLimit` and `resetRateLimit`.

**src/lib/rate-limit.ts:**
1. Add a comment at the top of the file: `// NOTE: In-memory store — resets on serverless cold start. Acceptable for single-user app. For multi-user, replace with Redis or similar persistent store.`
2. Remove the `resetRateLimit` export (no longer used anywhere).
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>authorize wrapped in try-catch, env vars validated with logging, authorized callback removed, rate-limit.ts has serverless caveat comment.</done>
</task>

<task type="auto">
  <name>Task 3: Add DATABASE_URL guard in db.ts</name>
  <files>src/lib/db.ts</files>
  <action>
Fix issue #7:

Replace the non-null assertion `process.env.DATABASE_URL!` with an explicit guard:

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Check your .env.local file."
  )
}
```

Place this before the `new PrismaNeon()` call. Pass `process.env.DATABASE_URL` (no `!`) to the adapter constructor.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Missing DATABASE_URL throws a clear, actionable error message instead of a cryptic crash.</done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. `npx tsc --noEmit` passes
3. Manual smoke test: login page loads, valid credentials sign in, invalid credentials show "Invalid credentials"
</verification>

<success_criteria>
- All 7 issues addressed across 4 files
- No TypeScript errors
- Build passes
- No behavioral regressions (login still works)
</success_criteria>

<output>
After completion, create `.planning/quick/260328-igi-fix-critical-and-high-auth-security-issu/260328-igi-SUMMARY.md`
</output>
