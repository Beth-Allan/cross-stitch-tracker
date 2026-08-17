import type { NextConfig } from "next";

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
          // Content-Security-Policy baseline
          // - unsafe-eval is needed for Next.js dev mode hot reload
          // - Tighten as features are added: replace unsafe-inline with nonces,
          //   remove unsafe-eval in production, add specific connect-src origins
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://*.r2.cloudflarestorage.com; connect-src 'self' https://*.r2.cloudflarestorage.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
