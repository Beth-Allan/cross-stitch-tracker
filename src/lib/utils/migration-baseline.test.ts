import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  BASELINE_MIGRATION,
  migrationsToRecord,
  readDeployTarget,
  withVerifiedTls,
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

describe("readDeployTarget", () => {
  it("refuses when DIRECT_URL is not set", () => {
    const result = readDeployTarget(undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/DIRECT_URL is not set/);
  });

  it("refuses when DIRECT_URL is blank", () => {
    expect(readDeployTarget("   ").ok).toBe(false);
  });

  it("refuses a value that is not a connection string, without echoing it", () => {
    const result = readDeployTarget(`not a url ${PASSWORD}`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/not a PostgreSQL connection string/);
      expect(result.message).not.toContain(PASSWORD);
    }
  });

  it("refuses a non-PostgreSQL scheme", () => {
    expect(readDeployTarget("mysql://u:p@host.example/db").ok).toBe(false);
  });

  it("refuses Neon's pooled host, naming the host but never the password", () => {
    const result = readDeployTarget(
      `postgresql://owner:${PASSWORD}@ep-calm-sea-123-pooler.c-3.us-west-2.aws.neon.tech/app?sslmode=require`,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/pooler/);
      expect(result.message).toContain("ep-calm-sea-123-pooler.c-3.us-west-2.aws.neon.tech");
      expect(result.message).not.toContain(PASSWORD);
    }
  });

  it("returns the host and database for a direct connection string", () => {
    const result = readDeployTarget(
      `postgresql://owner:${PASSWORD}@ep-calm-sea-123.c-3.us-west-2.aws.neon.tech/cross_stitch_tracker?sslmode=require&channel_binding=require`,
    );
    expect(result).toEqual({
      ok: true,
      target: {
        host: "ep-calm-sea-123.c-3.us-west-2.aws.neon.tech",
        database: "cross_stitch_tracker",
      },
    });
  });

  it("accepts the postgres:// scheme as well", () => {
    expect(readDeployTarget("postgres://u:p@localhost:5432/app").ok).toBe(true);
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
