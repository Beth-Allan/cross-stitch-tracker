import type { NextConfig } from "next";

import { canonicalHostRedirects } from "./src/lib/canonical-host";
import { contentSecurityPolicy } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Next 16.3 writes its own agent-rules block into CLAUDE.md on every `next dev`
  // and re-adds it if removed. CLAUDE.md is this repo's process authority, so it
  // stays ours to author — Beth's ruling, 2026-08-17. The block's advice (verify
  // bleeding-edge APIs before use) is already hard rule 8.
  agentRules: false,

  experimental: {
    // Next 16.4 stops `next dev`/`next build` once, when it detects a coding agent
    // and a newer Next carries a security fix — a red pre-push gate in whatever
    // session happens to be running, for a reason unrelated to its work. Noticing
    // advisories is the monthly dependency recurrence's job — Beth's ruling, 2026-10-24.
    agentUpgrade: false,
  },

  async redirects() {
    return canonicalHostRedirects();
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy({ isDev: process.env.NODE_ENV === "development" }),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
