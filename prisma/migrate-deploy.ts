/**
 * Applies pending migrations as the last step of a Vercel build (`npm run build:deploy`, named by
 * `vercel.json`). Each Vercel environment migrates the database its own `DIRECT_URL` names —
 * Preview its Neon branch, Production the main branch — and the first line printed says which.
 *
 * Before `migrate deploy`, a database built by `db push` has the baseline recorded as applied
 * (see `migrationsToRecord`), but only once Prisma confirms it matches `schema.prisma` exactly.
 * Any refusal here exits before a single row is written, so the deploy fails and the site keeps
 * serving the previous deployment.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import {
  migrationsToRecord,
  readDeployTarget,
  withVerifiedTls,
  type DatabaseState,
} from "../src/lib/utils/migration-baseline";

function stop(message: string): never {
  console.error(`[migrate] ${message}`);
  process.exit(1);
}

function prisma(args: string[]): number {
  return spawnSync("npx", ["prisma", ...args], { stdio: "inherit" }).status ?? 1;
}

async function readState(directUrl: string): Promise<DatabaseState> {
  const client = new Client({ connectionString: withVerifiedTls(directUrl) });
  await client.connect();
  try {
    const tables = await client.query<{ app_tables: number; tracked: boolean }>(`
      SELECT
        (SELECT count(*)::int FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name <> '_prisma_migrations') AS app_tables,
        to_regclass('public."_prisma_migrations"') IS NOT NULL AS tracked`);
    const { app_tables, tracked } = tables.rows[0];
    const applied = tracked
      ? await client.query<{ migration_name: string }>(`
          SELECT migration_name FROM "_prisma_migrations"
          WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`)
      : { rows: [] };
    return {
      holdsAppTables: app_tables > 0,
      appliedMigrations: applied.rows.map((row) => row.migration_name),
    };
  } finally {
    await client.end();
  }
}

async function main() {
  const directUrl = process.env.DIRECT_URL;
  const result = readDeployTarget(directUrl);
  if (!result.ok) stop(result.message);

  const { host, database } = result.target;
  console.log(
    `[migrate] Vercel environment "${process.env.VERCEL_ENV ?? "none"}" → database "${database}" at ${host}`,
  );

  const folder = readdirSync(join(process.cwd(), "prisma/migrations"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const toRecord = migrationsToRecord(folder, await readState(directUrl!));

  if (toRecord.length > 0) {
    console.log(
      `[migrate] This database was built before migrations were tracked. Checking it matches schema.prisma before recording: ${toRecord.join(", ")}`,
    );
    const diff = prisma([
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--exit-code",
    ]);
    if (diff !== 0) {
      stop(
        "The database does not match schema.prisma (differences above), so nothing was recorded or changed. This is a drift question for Beth, not something to force.",
      );
    }
    for (const name of toRecord) {
      if (prisma(["migrate", "resolve", "--applied", name]) !== 0) {
        stop(`Recording ${name} as applied failed; nothing after it was attempted.`);
      }
    }
  }

  process.exit(prisma(["migrate", "deploy"]));
}

main().catch((error: unknown) => {
  stop(
    `Could not read the database's migration state: ${error instanceof Error ? error.message : String(error)}`,
  );
});
