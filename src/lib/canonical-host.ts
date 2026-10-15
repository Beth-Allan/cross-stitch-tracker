import type { NextConfig } from "next";

type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * The one address the app is served from. It must match the origin the R2 bucket's CORS
 * policy allows: a browser refuses a presigned PUT from any other origin at the preflight,
 * so on a second address every upload fails while every page still works.
 */
export const CANONICAL_ORIGIN = "https://cross-stitch-tracker-adolwyn.vercel.app";

/**
 * Other production hostnames Vercel serves this project on. Each is forwarded to
 * `CANONICAL_ORIGIN` rather than added to the bucket's CORS list, so the app keeps a single
 * front door and its session cookie lives on one host.
 */
const ALIAS_HOSTS = ["cross-stitch-tracker.vercel.app"];

/**
 * Matched by host only, so preview deployments (each on its own hostname) are untouched.
 * Temporary rather than permanent: a cached 308 outlives any later change to these hosts.
 */
export function canonicalHostRedirects(): Redirect[] {
  return ALIAS_HOSTS.map((host) => ({
    source: "/:path*",
    has: [{ type: "host", value: host }],
    destination: `${CANONICAL_ORIGIN}/:path*`,
    permanent: false,
  }));
}
