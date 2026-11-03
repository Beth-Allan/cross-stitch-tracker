/**
 * A step of `npm run gate`, so it runs identically in CI and in the pre-push hook: fails when
 * `prisma/migrations/` does not build exactly what `schema.prisma` describes. `migrate diff` has to
 * replay the migrations into a real Postgres, and neither machine has one to spare, so this starts
 * `@prisma/dev`'s embedded Postgres in-process. It needs no Docker or service, reaches no database
 * outside this process, and is gone when the process ends.
 *
 * The decisions live in `checkMigrations`, where they are tested; this file is I/O.
 */
import { spawn } from "node:child_process";
import { startPrismaDevServer } from "@prisma/dev";
import { checkMigrations } from "../src/lib/utils/migration-check";

/** Far past the two seconds this takes: a stuck check should fail, never hang `git push` or CI. */
const PRISMA_TIMEOUT_MS = 120_000;

function log(message: string) {
  console.log(`[migrations] ${message}`);
}

/** Never a blocking spawn: the database lives in this process, and could not answer the command. */
function prisma(args: string[], shadowUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["prisma", ...args], {
      stdio: "inherit",
      env: { ...process.env, MIGRATIONS_CHECK_SHADOW_URL: shadowUrl },
      timeout: PRISMA_TIMEOUT_MS,
    });
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function startDatabase() {
  const server = await startPrismaDevServer({ persistenceMode: "stateless" });
  return {
    shadowUrl: server.shadowDatabase.connectionString,
    close: () => server.close(),
  };
}

checkMigrations({ startDatabase, prisma, log }).then(
  (code) => process.exit(code),
  (error: unknown) => {
    log(`Could not run the check: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  },
);
