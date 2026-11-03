import { defineConfig } from "prisma/config";

/**
 * Prisma's config for `npm run check:migrations` alone. It names the throwaway database
 * `prisma/check-migrations.ts` starts and nothing else, because Prisma wipes whatever it replays
 * migrations into: `prisma.config.ts`, which names real databases, must never take part.
 */
export default defineConfig({
  datasource: {
    shadowDatabaseUrl: process.env["MIGRATIONS_CHECK_SHADOW_URL"],
  },
});
