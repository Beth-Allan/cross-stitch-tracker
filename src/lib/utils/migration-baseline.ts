/**
 * The migration that describes everything `prisma db push` built between the March migration and
 * item R-2. Production and the preview branch already hold all of it, so it is recorded as applied
 * there rather than executed; on an empty database it runs like any other migration.
 */
export const BASELINE_MIGRATION = "20261026002357_baseline_db_push_era";

export type DeployTarget = { host: string; database: string };

/**
 * Checks the connection string `prisma migrate deploy` will use (`prisma.config.ts` reads
 * `DIRECT_URL`) before anything touches the database. Neon's pooler cannot hold the session-level
 * advisory lock migrations take, so a pooled host is refused here with a plain message instead of
 * failing obscurely mid-deploy. Messages name the host at most — never the value, which carries the
 * password and would land in the build log.
 */
export function readDeployTarget(
  directUrl: string | undefined,
): { ok: true; target: DeployTarget } | { ok: false; message: string } {
  if (!directUrl?.trim()) {
    return {
      ok: false,
      message:
        "DIRECT_URL is not set for this environment. Migrations need Neon's direct (unpooled) connection string.",
    };
  }

  let url: URL;
  try {
    url = new URL(directUrl.trim());
  } catch {
    return { ok: false, message: "DIRECT_URL is not a PostgreSQL connection string." };
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    return { ok: false, message: "DIRECT_URL is not a PostgreSQL connection string." };
  }

  if (url.hostname.includes("-pooler")) {
    return {
      ok: false,
      message: `DIRECT_URL points at Neon's connection pooler (${url.hostname}). Migrations need the direct connection — the same address without "-pooler".`,
    };
  }

  return { ok: true, target: { host: url.hostname, database: url.pathname.replace(/^\//, "") } };
}

/**
 * Neon's connection strings say `sslmode=require`. `pg` 8 treats that as `verify-full` and warns
 * that `pg` 9 will downgrade it to libpq's meaning, which skips certificate checks. Pinning
 * `verify-full` keeps today's guarantee through that upgrade.
 */
export function withVerifiedTls(connectionString: string): string {
  const url = new URL(connectionString);
  if (url.searchParams.get("sslmode") !== "require") return connectionString;
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export type DatabaseState = {
  /** Names in `_prisma_migrations` that finished and were not rolled back. */
  appliedMigrations: string[];
  /** Whether the database holds any table besides `_prisma_migrations`. */
  holdsAppTables: boolean;
};

/**
 * Which migrations to record as applied, without running them, before `migrate deploy`.
 *
 * A database that already holds the app but has no record of the baseline was built by
 * `db push`: executing the baseline there would try to create tables that exist, fail the deploy,
 * and leave a failed row that blocks every deploy after it. Recording is limited to the baseline
 * and what precedes it — a later migration is real work and must run. An empty database records
 * nothing, so every file runs and builds it from scratch.
 *
 * @throws when `folder` lacks the baseline — the plan would otherwise be a guess.
 */
export function migrationsToRecord(
  folder: string[],
  state: DatabaseState,
  baseline: string = BASELINE_MIGRATION,
): string[] {
  if (!folder.includes(baseline)) {
    throw new Error(`The baseline migration ${baseline} is missing from prisma/migrations.`);
  }
  if (!state.holdsAppTables || state.appliedMigrations.includes(baseline)) return [];

  return folder
    .filter((name) => name <= baseline && !state.appliedMigrations.includes(name))
    .sort();
}
