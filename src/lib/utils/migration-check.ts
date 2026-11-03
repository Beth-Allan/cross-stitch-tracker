export type ThrowawayDatabase = {
  /** What Prisma replays the migrations into. Wiped by the check, so never a real database. */
  shadowUrl: string;
  close: () => Promise<void>;
};

export type MigrationCheckSteps = {
  startDatabase: () => Promise<ThrowawayDatabase>;
  /** Runs one Prisma CLI command against that database and returns its exit code. */
  prisma: (args: string[], shadowUrl: string) => Promise<number>;
  log: (message: string) => void;
};

/**
 * Whether `prisma/migrations/` builds exactly what `schema.prisma` describes, returning the process
 * exit code. Since deploys apply migrations, a schema edit with no migration would otherwise pass
 * every other step and leave production's code asking for a column the database does not have.
 *
 * `--exit-code` is what makes this able to fail: without it `migrate diff` exits 0 on a difference
 * too (0 no difference, 2 a difference, 1 an error). Only a 0 passes.
 */
export async function checkMigrations(steps: MigrationCheckSteps): Promise<number> {
  const database = await steps.startDatabase();
  try {
    const code = await steps.prisma(
      [
        "migrate",
        "diff",
        "--config",
        "prisma/check-migrations.config.ts",
        "--from-migrations",
        "prisma/migrations",
        "--to-schema",
        "prisma/schema.prisma",
        "--exit-code",
      ],
      database.shadowUrl,
    );
    if (code === 0) {
      steps.log("prisma/migrations builds exactly what schema.prisma describes.");
      return 0;
    }
    steps.log(
      code === 2
        ? "prisma/migrations does not build what schema.prisma describes: the differences above are what a migration would have to do. A schema change needs its migration in the same pull request (docs/INTEGRATIONS.md, Writing a migration)."
        : `Could not compare the migrations with schema.prisma (prisma exited ${code}). A migration that cannot run on an empty database stops it here; the error above says which.`,
    );
    return 1;
  } finally {
    await database.close();
  }
}
