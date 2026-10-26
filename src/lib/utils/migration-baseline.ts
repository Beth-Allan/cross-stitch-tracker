/**
 * The migration that describes everything `prisma db push` built between the March migration and
 * the day deploys began applying migrations. Production and the preview branch already hold all of
 * it, so it is recorded as applied there rather than executed; on an empty database it runs like
 * any other migration.
 */
export const BASELINE_MIGRATION = "20261026002357_baseline_db_push_era";

export type DeployTarget = { host: string; database: string };

function parsePostgresUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "postgresql:" || url.protocol === "postgres:" ? url : null;
  } catch {
    return null;
  }
}

/** A Neon endpoint's pooled host is its direct host with `-pooler` on the first label. */
function endpointOf(url: URL): string {
  const [first, ...rest] = url.hostname.split(".");
  return [first.replace(/-pooler$/, ""), ...rest].join(".");
}

const databaseOf = (url: URL) => url.pathname.replace(/^\//, "");

/**
 * Checks the connection string `prisma migrate deploy` will use before anything touches the
 * database. Neon's pooler cannot hold the session-level advisory lock migrations take, so a pooled
 * host is refused. And the migration must reach the database this deployment's app reads
 * (`DATABASE_URL`): both variables are scoped per Vercel environment, so a mismatch means one of
 * them was saved for the wrong environment — the way a preview would end up migrating production.
 * Messages name hosts at most — never a value, which carries the password into the build log.
 */
export function readDeployTarget(
  directUrl: string | undefined,
  databaseUrl: string | undefined,
): { ok: true; target: DeployTarget } | { ok: false; message: string } {
  if (!directUrl?.trim()) {
    return {
      ok: false,
      message:
        "DIRECT_URL is not set for this environment. Migrations need Neon's direct (unpooled) connection string.",
    };
  }
  const direct = parsePostgresUrl(directUrl);
  if (!direct) return { ok: false, message: "DIRECT_URL is not a PostgreSQL connection string." };

  if (direct.hostname.includes("-pooler")) {
    return {
      ok: false,
      message: `DIRECT_URL points at Neon's connection pooler (${direct.hostname}). Migrations need the direct connection — the same address without "-pooler".`,
    };
  }

  if (!databaseUrl?.trim()) {
    return {
      ok: false,
      message:
        "DATABASE_URL is not set for this environment, so there is no app database to check DIRECT_URL against.",
    };
  }
  const app = parsePostgresUrl(databaseUrl);
  if (!app) return { ok: false, message: "DATABASE_URL is not a PostgreSQL connection string." };

  if (endpointOf(direct) !== endpointOf(app) || databaseOf(direct) !== databaseOf(app)) {
    return {
      ok: false,
      message: `DIRECT_URL and DATABASE_URL name different databases (${direct.hostname}/${databaseOf(direct)} vs ${app.hostname}/${databaseOf(app)}), so migrations would not reach the database this deployment reads. Check which Vercel environments each variable is saved for.`,
    };
  }

  return { ok: true, target: { host: direct.hostname, database: databaseOf(direct) } };
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

export type DeploySteps = {
  readState: () => Promise<DatabaseState>;
  /** Runs one Prisma CLI command and returns its exit code. */
  prisma: (args: string[]) => number;
  log: (message: string) => void;
};

/**
 * The deploy-time sequence, returning the process exit code. The order is the safety: a baseline
 * is recorded only after `migrate diff --exit-code` reports no difference (exit 0 — without
 * `--exit-code` it exits 0 on a difference too), and `migrate deploy` runs only once recording has
 * succeeded. Every refusal happens before Prisma changes the schema; the most a failure can leave
 * behind is a migration correctly recorded ahead of a baseline that was not.
 */
export async function deployMigrations(folder: string[], steps: DeploySteps): Promise<number> {
  const toRecord = migrationsToRecord(folder, await steps.readState());

  if (toRecord.length > 0) {
    steps.log(
      `This database was built before migrations were tracked. Checking it matches schema.prisma before recording: ${toRecord.join(", ")}`,
    );
    const diff = steps.prisma([
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--exit-code",
    ]);
    if (diff === 2) {
      steps.log(
        "The database does not match schema.prisma (differences above), so nothing was recorded or changed. Either it was altered outside migrations — a drift question for Beth, never something to force — or an earlier deploy to an empty database stopped partway: look in _prisma_migrations for a row with no finished_at.",
      );
      return 1;
    }
    if (diff !== 0) {
      steps.log(
        `Could not compare the database with schema.prisma (prisma exited ${diff}), so nothing was recorded or changed.`,
      );
      return 1;
    }
    for (const name of toRecord) {
      if (steps.prisma(["migrate", "resolve", "--applied", name]) !== 0) {
        steps.log(`Recording ${name} as applied failed; nothing after it was attempted.`);
        return 1;
      }
    }
  }

  return steps.prisma(["migrate", "deploy"]);
}
