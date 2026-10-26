/**
 * Applies pending migrations as the last step of a Vercel build (`npm run build:deploy`, named by
 * `vercel.json`). Each Vercel environment migrates the database its own variables name — Preview
 * its Neon branch, Production the main branch — and the first line printed says which.
 *
 * The URL checked here is the one every Prisma command below uses: `prisma.config.ts`'s datasource,
 * imported rather than re-read from the environment, so the check and the migration cannot
 * disagree. The decisions live in `deployMigrations`, where they are tested; this file is I/O.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import prismaConfig from "../prisma.config";
import {
  deployMigrations,
  readDeployTarget,
  withVerifiedTls,
  type DatabaseState,
} from "../src/lib/utils/migration-baseline";

function log(message: string) {
  console.log(`[migrate] ${message}`);
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

async function main(): Promise<number> {
  const directUrl = prismaConfig.datasource?.url;
  const result = readDeployTarget(directUrl, process.env.DATABASE_URL);
  if (!result.ok) {
    log(result.message);
    return 1;
  }

  const { host, database } = result.target;
  log(
    `Vercel environment "${process.env.VERCEL_ENV ?? "none"}" → database "${database}" at ${host}`,
  );

  const folder = readdirSync(join(process.cwd(), "prisma/migrations"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return deployMigrations(folder, { readState: () => readState(directUrl!), prisma, log });
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    log(
      `Stopped before migrating anything: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  },
);
