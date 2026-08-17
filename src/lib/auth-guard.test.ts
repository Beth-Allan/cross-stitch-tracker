import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import type { Session } from "next-auth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

const { requireAuth } = await import("./auth-guard");
const { auth } = await import("@/lib/auth");

// `auth` is overloaded (middleware wrapper / route handler / session getter);
// auth-guard only ever calls the no-argument session form.
const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>;

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the signed-in user", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "1", name: "Stitcher", email: "beth@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as Session);

    await expect(requireAuth()).resolves.toMatchObject({ id: "1" });
  });

  it("rejects when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });

  it("rejects a session whose user carries no id", async () => {
    // The Auth.js v5 failure mode: without the jwt/session callbacks the session
    // has a user but no id, and every action must still fail closed.
    mockAuth.mockResolvedValue({
      user: { name: "Stitcher", email: "beth@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as Session);

    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });
});
