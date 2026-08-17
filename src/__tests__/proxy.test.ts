import { describe, it, expect, vi } from "vitest";

// proxy.ts sits at the repo root, outside the `src/**` glob the runner collects,
// so its test cannot be colocated beside it.
vi.mock("next-auth", () => ({
  default: () => ({ auth: vi.fn(), handlers: {}, signIn: vi.fn(), signOut: vi.fn() }),
}));

const { proxy, config } = await import("../../proxy");

const matcher = new RegExp(`^${config.matcher[0]}$`);

describe("proxy", () => {
  it("exports the Auth.js handler as the proxy", () => {
    expect(proxy).toBeDefined();
  });
});

describe("the proxy matcher", () => {
  it.each([
    "/",
    "/charts",
    "/charts/abc123",
    "/charts/abc123/edit",
    "/stats",
    "/settings",
    "/supplies/brands",
    // Not a route today; the point is that a new one arrives gated by default.
    "/api/uploads",
    // Reaches the fence, where the authorized callback lets it through.
    "/login",
  ])("sends %s through the fence", (path) => {
    expect(matcher.test(path)).toBe(true);
  });

  it.each([
    // Auth.js's own endpoints must stay reachable or sign-in cannot happen.
    "/api/auth/session",
    "/api/auth/callback/credentials",
    "/_next/static/chunks/main.js",
    "/_next/image",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/manifest.webmanifest",
  ])("leaves %s outside it", (path) => {
    expect(matcher.test(path)).toBe(false);
  });
});
