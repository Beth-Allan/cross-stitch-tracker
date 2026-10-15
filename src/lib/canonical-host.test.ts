import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";
import { CANONICAL_ORIGIN, canonicalHostRedirects } from "./canonical-host";

describe("canonicalHostRedirects", () => {
  const redirects = canonicalHostRedirects();

  it("sends the project's default vercel.app alias to the canonical origin, path included", () => {
    expect(redirects).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "cross-stitch-tracker.vercel.app" }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: false,
    });
  });

  it("never matches the canonical host itself, which would loop", () => {
    const canonicalHost = new URL(CANONICAL_ORIGIN).host;
    for (const redirect of redirects) {
      expect(redirect.has).not.toContainEqual({ type: "host", value: canonicalHost });
    }
  });

  it("only ever matches by host, so preview deployments are left alone", () => {
    for (const redirect of redirects) {
      expect(redirect.has?.every((condition) => condition.type === "host")).toBe(true);
    }
  });
});

describe("next.config", () => {
  it("applies the canonical-host redirects", async () => {
    expect(await nextConfig.redirects?.()).toEqual(canonicalHostRedirects());
  });
});
