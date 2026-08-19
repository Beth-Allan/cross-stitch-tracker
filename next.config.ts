import type { NextConfig } from "next";

import { contentSecurityPolicy } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Next 16.3 writes its own agent-rules block into CLAUDE.md on every `next dev`
  // and re-adds it if removed. CLAUDE.md is this repo's process authority, so it
  // stays ours to author — Beth's ruling, 2026-08-17. The block's advice (verify
  // bleeding-edge APIs before use) is already hard rule 8.
  agentRules: false,

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
