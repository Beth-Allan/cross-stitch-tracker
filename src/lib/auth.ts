import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { recordAttempt } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

/**
 * Paths the outer fence lets through unauthenticated. Everything else the
 * matcher covers needs a session.
 *
 * `/login` is also the configured `pages.signIn`, which Auth.js already refuses
 * to redirect to itself, so listing it changes nothing today — it states the
 * intent and is where a second public path would go.
 */
const PUBLIC_PATHS = new Set(["/login"]);

/** A whole, unmangled bcrypt hash — the shape `.env`'s `$` interpolation destroys when it is not escaped. */
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Verify the single user's credentials.
 *
 * Both login entry paths reach this: the login form action's `signIn()` call and
 * a direct `POST /api/auth/callback/credentials`, which the proxy matcher must
 * exclude. It is therefore the only place the rate limit can throttle both.
 *
 * Exported so the auth core can be tested without instantiating NextAuth.
 */
export async function authorizeCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
): Promise<{ id: string; name: string; email: string } | null> {
  const expectedEmail = process.env.AUTH_USER_EMAIL?.trim().toLowerCase();
  // Trimmed because an env var pasted into a dashboard often arrives with a
  // trailing newline, and bcrypt would reject the hash without saying why.
  const expectedHash = process.env.AUTH_USER_PASSWORD_HASH?.trim();

  // Checked before the rate limit so a broken deploy cannot lock the real user
  // out, and thrown rather than returned so a misconfigured server does not
  // diagnose as a mistyped password. Auth.js wraps this as CallbackRouteError,
  // which is not client-safe, so the public endpoint still reveals only
  // "Configuration" while the login form can name the cause.
  if (!expectedEmail || !expectedHash || !BCRYPT_HASH.test(expectedHash)) {
    throw new Error(
      "Auth is not configured: AUTH_USER_EMAIL and AUTH_USER_PASSWORD_HASH must be set, and the hash must be a complete bcrypt hash",
    );
  }

  // The same Zod boundary the form action uses. This function is also reachable
  // unauthenticated at POST /api/auth/callback/credentials, so nothing past here
  // — the rate-limiter key above all — may be raw request input.
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;

  // Before bcrypt, so a guessing run costs the attacker nothing to reject.
  if (!recordAttempt(email).allowed) return null;

  if (email === expectedEmail && (await bcrypt.compare(password, expectedHash))) {
    return { id: "1", name: "Stitcher", email };
  }

  // Generic failure: don't reveal which field is wrong.
  return null;
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    // The outer fence. Without this callback Auth.js treats every request as
    // authorized, and `proxy.ts` fetches the session only to discard it.
    authorized({ request, auth }) {
      if (PUBLIC_PATHS.has(request.nextUrl.pathname)) return true;
      // `user.id`, not `user`: the same predicate `requireAuth()` enforces, so
      // the fence and the guard never disagree about who is signed in.
      return Boolean(auth?.user?.id);
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
