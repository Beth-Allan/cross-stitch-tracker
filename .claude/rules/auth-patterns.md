---
globs:
  - "src/lib/auth*.ts"
  - "src/lib/actions/**/*.ts"
---

# Auth.js v5 Patterns

> Patterns for Auth.js v5 (next-auth 5.0.0-beta.32) with JWT strategy.
> Last updated: 2026-03-29

## Session user.id requires JWT + session callbacks

Auth.js v5 does NOT pass `user.id` into the session by default. Without callbacks, `session.user` only has `name`, `email`, `image`.

The callbacks in `src/lib/auth.ts` thread `id` through:

```ts
callbacks: {
  jwt({ token, user }) {
    if (user?.id) token.id = user.id;
    return token;
  },
  session({ session, token }) {
    if (token.id) session.user.id = token.id as string;
    return session;
  },
},
```

**Do not remove these callbacks.** Without them, `requireAuth()` will reject every request.

## The `authorized` callback IS the outer fence

`proxy.ts` re-exports `auth` and carries the matcher, but Auth.js defaults `authorized` to `true`
— so without this callback the middleware fetches the session, discards the answer, and every
route passes while looking exactly like a working fence:

```ts
authorized({ request, auth }) {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) return true;
  return Boolean(auth?.user?.id);
}
```

`user.id`, not `user` — the same predicate `requireAuth()` enforces, so the fence and the guard
cannot disagree about who is signed in if the `jwt`/`session` callbacks ever regress.

Adding a path to `PUBLIC_PATHS` makes it unauthenticated, exactly like adding one to the
matcher's exclusion list. `docs/process/security-checklist.md` §2 covers both. **The fence
protects pages, never server actions** — action ids are global, so a POST to the public `/login`
can invoke any action; `requireAuth()` is what stops it.

## Rate limiting belongs inside `authorize()`, not at a caller

The Credentials provider has two entry paths — the login form action's `signIn()` **and** a
direct `POST /api/auth/callback/credentials`, which the matcher necessarily excludes. A limit
applied in the form action alone leaves bcrypt guessing unthrottled on the second. So
`recordAttempt()` is called only from `authorizeCredentials`, before `bcrypt.compare`;
`peekRateLimit()` is the read-only companion the form action uses to name the wait.

That also makes `authorizeCredentials` an **unauthenticated boundary**, so it parses with
`loginSchema` before anything else touches the input — the limiter keys on the parsed,
normalized email, never on raw request text. `rate-limit.ts` caps how many keys it will track
for the same reason.

## requireAuth pattern

All server actions import `requireAuth()` from `src/lib/auth-guard.ts`:

```ts
import { requireAuth } from "@/lib/auth-guard";
```

- Checks `user.id` exists, not just `user`
- Single source of truth — do NOT define local copies in action files
- ESLint blocks importing `@/lib/auth` directly in action files (`no-restricted-imports`)
- Never use fallback values like `user.id ?? "1"`

## Login flow

Single-user credentials from env vars. After changing `AUTH_USER_EMAIL` or `AUTH_USER_PASSWORD_HASH`, users must log out and back in — the JWT persists old claims until re-issued.

## .env.local bcrypt gotcha

Next.js interpolates `$` in env values. Bcrypt hashes contain `$`. Escape as `\$`:

```
AUTH_USER_PASSWORD_HASH=\$2b\$10\$abc...
```

`authorizeCredentials` checks the hash's shape and **throws** when it is missing or mangled, so
this mistake now surfaces as "a server setting is wrong" on the login page instead of hiding as
"Invalid credentials".
