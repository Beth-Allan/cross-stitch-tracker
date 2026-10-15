import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";
import { CANONICAL_ORIGIN, canonicalHostRedirects } from "./canonical-host";

/** Next's own host test: the `has` value compiled as an anchored regex (prepare-destination). */
function redirectsHost(hostname: string): boolean {
  return canonicalHostRedirects().some((redirect) =>
    redirect.has?.some(
      (condition) => condition.type === "host" && new RegExp(`^${condition.value}$`).test(hostname),
    ),
  );
}

describe("canonicalHostRedirects", () => {
  it("sends the project's default vercel.app alias to the canonical origin, path included", () => {
    expect(canonicalHostRedirects()).toContainEqual(
      expect.objectContaining({
        source: "/:path*",
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: false,
      }),
    );
    expect(redirectsHost("cross-stitch-tracker.vercel.app")).toBe(true);
  });

  it("leaves the canonical host alone, which would otherwise loop", () => {
    expect(redirectsHost(new URL(CANONICAL_ORIGIN).hostname)).toBe(false);
  });

  it("leaves preview deployments and look-alike hosts alone", () => {
    expect(redirectsHost("cross-stitch-tracker-git-fix-thing-adolwyn.vercel.app")).toBe(false);
    expect(redirectsHost("cross-stitch-trackerXvercelXapp")).toBe(false);
    expect(redirectsHost("evil.cross-stitch-tracker.vercel.app")).toBe(false);
  });
});

describe("next.config", () => {
  it("applies the canonical-host redirects", async () => {
    expect(await nextConfig.redirects?.()).toEqual(canonicalHostRedirects());
  });
});
