# Auth.js v5 Patterns

> Patterns for Auth.js v5 (next-auth 5.0.0-beta.30) with JWT strategy.
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
