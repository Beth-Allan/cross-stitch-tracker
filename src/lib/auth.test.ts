import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

// next-auth's entry pulls in next/server, which does not resolve under the test
// runner. Only the NextAuth() call needs it, and this file tests the config
// object rather than the instance it produces.
vi.mock("next-auth", () => ({
  default: () => ({ auth: vi.fn(), handlers: {}, signIn: vi.fn(), signOut: vi.fn() }),
}));

const { authConfig, authorizeCredentials } = await import("./auth");

const PASSWORD = "correct-horse-battery";
const HASH = bcrypt.hashSync(PASSWORD, 4);

let emailSeed = 0;
/** The rate limiter keys on email and its store is module-level, so each test needs its own. */
function configureAuthEnv(hash: string = HASH): string {
  const email = `beth-${emailSeed++}@example.com`;
  vi.stubEnv("AUTH_USER_EMAIL", email);
  vi.stubEnv("AUTH_USER_PASSWORD_HASH", hash);
  return email;
}

function request(pathname: string): NextRequest {
  return { nextUrl: new URL(`https://example.com${pathname}`) } as unknown as NextRequest;
}

function session(): Session {
  return {
    user: { id: "1", name: "Stitcher", email: "beth@example.com" },
    expires: "2099-01-01T00:00:00.000Z",
  } as Session;
}

describe("authorizeCredentials", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the single user for correct credentials", async () => {
    const email = configureAuthEnv();

    await expect(authorizeCredentials({ email, password: PASSWORD })).resolves.toEqual({
      id: "1",
      name: "Stitcher",
      email,
    });
  });

  it("returns null for a wrong password", async () => {
    const email = configureAuthEnv();

    await expect(authorizeCredentials({ email, password: "wrong" })).resolves.toBeNull();
  });

  it("returns null for an unknown email", async () => {
    configureAuthEnv();

    await expect(
      authorizeCredentials({ email: "stranger@example.com", password: PASSWORD }),
    ).resolves.toBeNull();
  });

  it("returns null when credentials are missing entirely", async () => {
    configureAuthEnv();

    await expect(authorizeCredentials({})).resolves.toBeNull();
  });

  it("throws when AUTH_USER_EMAIL is not set, rather than reporting bad credentials", async () => {
    vi.stubEnv("AUTH_USER_EMAIL", "");
    vi.stubEnv("AUTH_USER_PASSWORD_HASH", HASH);

    await expect(
      authorizeCredentials({ email: "beth@example.com", password: PASSWORD }),
    ).rejects.toThrow(/not configured/i);
  });

  it("throws when AUTH_USER_PASSWORD_HASH is not set", async () => {
    vi.stubEnv("AUTH_USER_EMAIL", "beth@example.com");
    vi.stubEnv("AUTH_USER_PASSWORD_HASH", "");

    await expect(
      authorizeCredentials({ email: "beth@example.com", password: PASSWORD }),
    ).rejects.toThrow(/not configured/i);
  });

  it("throws when the hash was mangled by .env interpolation", async () => {
    // `$` unescaped in .env.local leaves a truncated, unusable hash.
    const email = configureAuthEnv("2b10abcdef");

    await expect(authorizeCredentials({ email, password: PASSWORD })).rejects.toThrow(
      /not configured/i,
    );
  });

  it("does not spend rate-limit attempts on a misconfigured server", async () => {
    const email = `beth-misconfig@example.com`;
    vi.stubEnv("AUTH_USER_EMAIL", email);
    vi.stubEnv("AUTH_USER_PASSWORD_HASH", "");

    for (let i = 0; i < 10; i++) {
      await expect(authorizeCredentials({ email, password: PASSWORD })).rejects.toThrow();
    }

    vi.stubEnv("AUTH_USER_PASSWORD_HASH", HASH);
    await expect(authorizeCredentials({ email, password: PASSWORD })).resolves.not.toBeNull();
  });

  it("returns null for input that is not a login at all", async () => {
    configureAuthEnv();

    await expect(authorizeCredentials({ email: "nonsense", password: "x" })).resolves.toBeNull();
    await expect(authorizeCredentials({ email: 42, password: {} })).resolves.toBeNull();
  });

  it("rejects an email longer than an address can be, so the limiter cannot be flooded with one", async () => {
    configureAuthEnv();
    const oversized = `${"a".repeat(250)}@example.com`;

    await expect(
      authorizeCredentials({ email: oversized, password: PASSWORD }),
    ).resolves.toBeNull();
  });

  it("accepts a hash that arrived with surrounding whitespace", async () => {
    const email = configureAuthEnv(`  ${HASH}\n`);

    await expect(authorizeCredentials({ email, password: PASSWORD })).resolves.not.toBeNull();
  });

  it("treats the email case-insensitively, on both the match and the limiter", async () => {
    const email = configureAuthEnv();

    await expect(
      authorizeCredentials({ email: email.toUpperCase(), password: PASSWORD }),
    ).resolves.toMatchObject({ id: "1" });

    for (let i = 0; i < 4; i++) {
      await authorizeCredentials({ email: email.toUpperCase(), password: "wrong" });
    }
    await expect(authorizeCredentials({ email, password: PASSWORD })).resolves.toBeNull();
  });

  it("throttles after five attempts, even when the password is correct", async () => {
    const email = configureAuthEnv();

    for (let i = 0; i < 5; i++) {
      await expect(authorizeCredentials({ email, password: "wrong" })).resolves.toBeNull();
    }

    await expect(authorizeCredentials({ email, password: PASSWORD })).resolves.toBeNull();
  });
});

describe("authConfig.callbacks.authorized", () => {
  const authorized = authConfig.callbacks.authorized;

  it("lets a signed-out visitor reach the login page", async () => {
    expect(await authorized({ request: request("/login"), auth: null })).toBe(true);
  });

  it("refuses a signed-out visitor at the dashboard root", async () => {
    expect(await authorized({ request: request("/"), auth: null })).toBe(false);
  });

  it("refuses a signed-out visitor on a nested page", async () => {
    expect(await authorized({ request: request("/charts/abc123"), auth: null })).toBe(false);
  });

  it("refuses a session that carries no user", async () => {
    const empty = { expires: "2099-01-01T00:00:00.000Z" } as Session;

    expect(await authorized({ request: request("/stats"), auth: empty })).toBe(false);
  });

  it("refuses a session whose user has no id, exactly as requireAuth does", async () => {
    // If the jwt/session callbacks ever regress, the fence and the guard must
    // agree that this session is not signed in.
    const idless = {
      user: { name: "Stitcher", email: "beth@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as Session;

    expect(await authorized({ request: request("/stats"), auth: idless })).toBe(false);
  });

  it("admits a signed-in visitor", async () => {
    expect(await authorized({ request: request("/charts/abc123"), auth: session() })).toBe(true);
  });

  it("admits a signed-in visitor at the login page", async () => {
    expect(await authorized({ request: request("/login"), auth: session() })).toBe(true);
  });
});

describe("authConfig session threading", () => {
  it("puts the user id on the token at sign-in", () => {
    const token = authConfig.callbacks.jwt({
      token: {},
      user: { id: "1", email: "beth@example.com" },
    } as Parameters<typeof authConfig.callbacks.jwt>[0]);

    expect(token).toMatchObject({ id: "1" });
  });

  it("leaves an existing token untouched on later requests", () => {
    const token = authConfig.callbacks.jwt({ token: { id: "1" } } as unknown as Parameters<
      typeof authConfig.callbacks.jwt
    >[0]);

    expect(token).toMatchObject({ id: "1" });
  });

  it("copies the token id onto session.user.id, which requireAuth depends on", async () => {
    const result = await authConfig.callbacks.session({
      session: session(),
      token: { id: "42" },
    } as unknown as Parameters<typeof authConfig.callbacks.session>[0]);

    expect(result.user.id).toBe("42");
  });
});
