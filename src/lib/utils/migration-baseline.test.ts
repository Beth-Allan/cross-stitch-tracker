import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  BASELINE_MIGRATION,
  deployMigrations,
  migrationsToRecord,
  readDeployTarget,
  withVerifiedTls,
  type DatabaseState,
} from "./migration-baseline";

const MARCH = "20260328163529_add_chart_project_designer_genre";
const LATER = "20261101000000_add_indexes";
const FOLDER = [MARCH, BASELINE_MIGRATION, LATER];
const PASSWORD = "npg_s3cretValue";

describe("BASELINE_MIGRATION", () => {
  it("names a migration that exists in prisma/migrations", () => {
    expect(
      existsSync(join(process.cwd(), "prisma/migrations", BASELINE_MIGRATION, "migration.sql")),
    ).toBe(true);
  });
});

const HOST = "ep-calm-sea-123.c-3.us-west-2.aws.neon.tech";
const POOLED_HOST = "ep-calm-sea-123-pooler.c-3.us-west-2.aws.neon.tech";
const OTHER_HOST = "ep-jolly-tide-456.c-3.us-west-2.aws.neon.tech";
const url = (host: string, database = "cross_stitch_tracker") =>
  `postgresql://owner:${PASSWORD}@${host}/${database}?sslmode=require&channel_binding=require`;

describe("readDeployTarget", () => {
  it("refuses when DIRECT_URL is not set", () => {
    const result = readDeployTarget(undefined, url(POOLED_HOST));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/DIRECT_URL is not set/);
  });

  it("refuses when DIRECT_URL is blank", () => {
    expect(readDeployTarget("   ", url(POOLED_HOST)).ok).toBe(false);
  });

  it("refuses a value that is not a connection string, without echoing it", () => {
    const result = readDeployTarget(`not a url ${PASSWORD}`, url(POOLED_HOST));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/not a PostgreSQL connection string/);
      expect(result.message).not.toContain(PASSWORD);
    }
  });

  it("refuses a non-PostgreSQL scheme", () => {
    expect(readDeployTarget("mysql://u:p@host.example/db", url(POOLED_HOST)).ok).toBe(false);
  });

  it("refuses Neon's pooled host, naming the host but never the password", () => {
    const result = readDeployTarget(url(POOLED_HOST), url(POOLED_HOST));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/pooler/);
      expect(result.message).toContain(POOLED_HOST);
      expect(result.message).not.toContain(PASSWORD);
    }
  });

  it("returns the host and database when DIRECT_URL is the direct twin of the app's pooled URL", () => {
    expect(readDeployTarget(url(HOST), url(POOLED_HOST))).toEqual({
      ok: true,
      target: { host: HOST, database: "cross_stitch_tracker" },
    });
  });

  it("accepts a DATABASE_URL that is itself direct, and the postgres:// scheme", () => {
    expect(
      readDeployTarget("postgres://u:p@localhost:5432/app", "postgres://u:p@localhost:5432/app").ok,
    ).toBe(true);
  });

  it("refuses when DATABASE_URL is not set — there is no app database to match", () => {
    const result = readDeployTarget(url(HOST), undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/DATABASE_URL is not set/);
  });

  it("refuses when DIRECT_URL names a different Neon endpoint from the app's — a preview pointed at production", () => {
    const result = readDeployTarget(url(OTHER_HOST), url(POOLED_HOST));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/different databases/);
      expect(result.message).toContain(OTHER_HOST);
      expect(result.message).toContain(POOLED_HOST);
      expect(result.message).not.toContain(PASSWORD);
    }
  });

  it("refuses when the endpoint matches but the database name does not", () => {
    expect(readDeployTarget(url(HOST, "other_db"), url(POOLED_HOST)).ok).toBe(false);
  });
});

describe("deployMigrations", () => {
  const DIFF = [
    "migrate",
    "diff",
    "--from-config-datasource",
    "--to-schema",
    "prisma/schema.prisma",
    "--exit-code",
  ];

  function steps(state: DatabaseState, exitCodes: Record<string, number> = {}) {
    const calls: string[][] = [];
    return {
      calls,
      steps: {
        readState: async () => state,
        prisma: (args: string[]) => {
          calls.push(args);
          return exitCodes[args.slice(0, 2).join(" ")] ?? 0;
        },
        log: () => {},
      },
    };
  }

  const PUSH_ERA: DatabaseState = { appliedMigrations: [MARCH], holdsAppTables: true };

  it("only runs migrate deploy on a database that needs nothing recorded", async () => {
    const { calls, steps: s } = steps({
      appliedMigrations: [MARCH, BASELINE_MIGRATION],
      holdsAppTables: true,
    });
    expect(await deployMigrations(FOLDER, s)).toBe(0);
    expect(calls).toEqual([["migrate", "deploy"]]);
  });

  it("compares with --exit-code, records the baseline, then deploys — in that order", async () => {
    const { calls, steps: s } = steps(PUSH_ERA);
    expect(await deployMigrations(FOLDER, s)).toBe(0);
    expect(calls).toEqual([
      DIFF,
      ["migrate", "resolve", "--applied", BASELINE_MIGRATION],
      ["migrate", "deploy"],
    ]);
  });

  it("records nothing and deploys nothing when the database differs from schema.prisma", async () => {
    const { calls, steps: s } = steps(PUSH_ERA, { "migrate diff": 2 });
    expect(await deployMigrations(FOLDER, s)).toBe(1);
    expect(calls).toEqual([DIFF]);
  });

  it("records nothing and deploys nothing when the comparison itself fails", async () => {
    const { calls, steps: s } = steps(PUSH_ERA, { "migrate diff": 1 });
    expect(await deployMigrations(FOLDER, s)).toBe(1);
    expect(calls).toEqual([DIFF]);
  });

  it("tells a failed comparison apart from a real difference", async () => {
    const messages: string[] = [];
    const differs = steps(PUSH_ERA, { "migrate diff": 2 }).steps;
    const broken = steps(PUSH_ERA, { "migrate diff": 1 }).steps;
    await deployMigrations(FOLDER, { ...differs, log: (m) => messages.push(m) });
    await deployMigrations(FOLDER, { ...broken, log: (m) => messages.push(m) });
    expect(messages.find((m) => /does not match schema\.prisma/.test(m))).toBeDefined();
    expect(messages.find((m) => /could not compare/i.test(m))).toBeDefined();
  });

  it("stops before migrate deploy when recording fails", async () => {
    const { calls, steps: s } = steps(PUSH_ERA, { "migrate resolve": 1 });
    expect(await deployMigrations(FOLDER, s)).toBe(1);
    expect(calls).not.toContainEqual(["migrate", "deploy"]);
  });

  it("returns migrate deploy's own exit code", async () => {
    const { steps: s } = steps(
      { appliedMigrations: [], holdsAppTables: false },
      {
        "migrate deploy": 1,
      },
    );
    expect(await deployMigrations(FOLDER, s)).toBe(1);
  });
});

describe("withVerifiedTls", () => {
  it("pins Neon's sslmode=require to verify-full, keeping every other parameter", () => {
    const pinned = new URL(
      withVerifiedTls(
        "postgresql://u:p@ep-a.neon.tech/app?sslmode=require&channel_binding=require",
      ),
    );
    expect(pinned.searchParams.get("sslmode")).toBe("verify-full");
    expect(pinned.searchParams.get("channel_binding")).toBe("require");
    expect(pinned.password).toBe("p");
  });

  it("leaves a connection string without sslmode=require unchanged", () => {
    const local = "postgresql://u:p@localhost:5432/app";
    expect(withVerifiedTls(local)).toBe(local);
  });
});

describe("migrationsToRecord", () => {
  it("records nothing on an empty database — migrate deploy builds it from the files", () => {
    expect(migrationsToRecord(FOLDER, { appliedMigrations: [], holdsAppTables: false })).toEqual(
      [],
    );
  });

  it("records only the baseline when the March migration is already recorded", () => {
    expect(
      migrationsToRecord(FOLDER, { appliedMigrations: [MARCH], holdsAppTables: true }),
    ).toEqual([BASELINE_MIGRATION]);
  });

  it("records every migration up to the baseline when the database has no record at all", () => {
    expect(migrationsToRecord(FOLDER, { appliedMigrations: [], holdsAppTables: true })).toEqual([
      MARCH,
      BASELINE_MIGRATION,
    ]);
  });

  it("records nothing once the baseline is recorded", () => {
    expect(
      migrationsToRecord(FOLDER, {
        appliedMigrations: [MARCH, BASELINE_MIGRATION],
        holdsAppTables: true,
      }),
    ).toEqual([]);
  });

  it("never records a migration that comes after the baseline — those must actually run", () => {
    expect(
      migrationsToRecord(FOLDER, { appliedMigrations: [], holdsAppTables: true }),
    ).not.toContain(LATER);
  });

  it("orders what it records by name, whatever order the folder listing came in", () => {
    expect(
      migrationsToRecord([LATER, BASELINE_MIGRATION, MARCH], {
        appliedMigrations: [],
        holdsAppTables: true,
      }),
    ).toEqual([MARCH, BASELINE_MIGRATION]);
  });

  it("throws when the baseline is missing from the folder rather than guessing", () => {
    expect(() =>
      migrationsToRecord([MARCH, LATER], { appliedMigrations: [], holdsAppTables: true }),
    ).toThrow(BASELINE_MIGRATION);
  });
});
