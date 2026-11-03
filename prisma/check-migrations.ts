/**
 * A step of `npm run gate`, so it runs identically in CI and in the pre-push hook: fails when
 * replaying `prisma/migrations/` does not build what `schema.prisma` describes. `migrate diff` has
 * to replay into a real Postgres, and neither machine has one to spare, so this starts
 * `@prisma/dev`'s embedded Postgres in-process. It needs no Docker or service, and reaches no
 * database outside this process.
 *
 * The decisions live in `checkMigrations`, where they are tested; this file is I/O.
 */
import { spawn } from "node:child_process";
import { Worker } from "node:worker_threads";
import { startPrismaDevServer } from "@prisma/dev";
import { checkMigrations } from "../src/lib/utils/migration-check";

/** Far past the two seconds this takes: a stuck check must fail, never hang `git push` or CI. */
const TIME_LIMIT_MS = 120_000;

function log(message: string) {
  console.log(`[migrations] ${message}`);
}

/**
 * Ends the whole run from a thread of its own. The database runs on this one, so a statement that
 * never returns stops every timer here too, and nothing on this thread could act on one firing.
 */
function enforceTimeLimit() {
  const message = `[migrations] Stopped: no result after ${TIME_LIMIT_MS / 1000}s. A migration that never finishes stops it here.\n`;
  new Worker(
    `setTimeout(() => {
      require("node:fs").writeSync(2, ${JSON.stringify(message)});
      process.kill(${process.pid}, "SIGKILL");
    }, ${TIME_LIMIT_MS});`,
    { eval: true },
  ).unref();
}

/** Never a blocking spawn: the database lives in this process, and could not answer the command. */
function prisma(args: string[], shadowUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", ...args], {
      stdio: "inherit",
      env: { ...process.env, MIGRATIONS_CHECK_SHADOW_URL: shadowUrl },
    });
    child.on("error", reject);
    child.on("close", (code, signal) =>
      code === null ? reject(new Error(`prisma was stopped by ${signal}`)) : resolve(code),
    );
  });
}

async function startDatabase() {
  const server = await startPrismaDevServer({ persistenceMode: "stateless" });
  return {
    shadowUrl: server.shadowDatabase.connectionString,
    close: () => server.close(),
  };
}

enforceTimeLimit();
checkMigrations({ startDatabase, prisma, log }).then(
  (code) => process.exit(code),
  (error: unknown) => {
    log(`Could not run the check: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  },
);
