import { describe, it, expect, beforeEach, vi } from "vitest";

const { FakeAuthError } = vi.hoisted(() => {
  // Stands in for Auth.js's AuthError so `instanceof` matches inside the action;
  // next-auth's entry cannot be imported under the test runner (it pulls next/server).
  class FakeAuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  }
  return { FakeAuthError };
});

vi.mock("next-auth", () => ({ AuthError: FakeAuthError }));
vi.mock("@/lib/auth", () => ({ signIn: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ peekRateLimit: vi.fn() }));

const { loginAction } = await import("./actions");
const { signIn } = await import("@/lib/auth");
const { peekRateLimit } = await import("@/lib/rate-limit");

function credentials(email: string, password: string): FormData {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  return form;
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(peekRateLimit).mockReturnValue({ allowed: true });
  });

  it("rejects a malformed email without attempting a sign-in", async () => {
    const result = await loginAction(undefined, credentials("not-an-email", "hunter2"));

    expect(result.error).toMatch(/valid email/i);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("rejects an empty password without attempting a sign-in", async () => {
    const result = await loginAction(undefined, credentials("beth@example.com", ""));

    expect(result.error).toMatch(/password is required/i);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("tells the user how long to wait when the limiter is already blocking", async () => {
    vi.mocked(peekRateLimit).mockReturnValue({ allowed: false, retryAfter: 18 });

    const result = await loginAction(undefined, credentials("beth@example.com", "hunter2"));

    expect(peekRateLimit).toHaveBeenCalledWith("beth@example.com");
    expect(result.error).toBe("Too many attempts. Try again in 18 seconds.");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("signs in with the validated credentials", async () => {
    const result = await loginAction(undefined, credentials("beth@example.com", "hunter2"));

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "beth@example.com",
      password: "hunter2",
      redirectTo: "/",
    });
    expect(result).toEqual({});
  });

  it("reports bad credentials generically", async () => {
    vi.mocked(signIn).mockRejectedValue(new FakeAuthError("CredentialsSignin"));

    const result = await loginAction(undefined, credentials("beth@example.com", "hunter2"));

    expect(result.error).toBe("Invalid credentials");
  });

  it("distinguishes a misconfigured server from a wrong password", async () => {
    vi.mocked(signIn).mockRejectedValue(new FakeAuthError("CallbackRouteError"));

    const result = await loginAction(undefined, credentials("beth@example.com", "hunter2"));

    expect(result.error).toMatch(/server/i);
    expect(result.error).not.toBe("Invalid credentials");
  });

  it("falls back to a generic message for any other auth error", async () => {
    vi.mocked(signIn).mockRejectedValue(new FakeAuthError("MissingCSRF"));

    const result = await loginAction(undefined, credentials("beth@example.com", "hunter2"));

    expect(result.error).toBe("Something went wrong");
  });

  it("re-throws the framework redirect that a successful sign-in raises", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    vi.mocked(signIn).mockRejectedValue(redirect);

    await expect(
      loginAction(undefined, credentials("beth@example.com", "hunter2")),
    ).rejects.toThrow(redirect);
  });
});
