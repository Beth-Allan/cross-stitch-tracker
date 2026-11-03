import { describe, it, expect, vi } from "vitest";
import { checkMigrations } from "./migration-check";

const SHADOW_URL = "postgres://postgres:postgres@localhost:51215/template1";

function steps(prismaExit: number | (() => Promise<number>) = 0) {
  const close = vi.fn(async () => {});
  const messages: string[] = [];
  const prisma = vi.fn(async (_args: string[], _shadowUrl: string) =>
    typeof prismaExit === "number" ? prismaExit : prismaExit(),
  );
  return {
    close,
    messages,
    prisma,
    steps: {
      startDatabase: async () => ({ shadowUrl: SHADOW_URL, close }),
      prisma,
      log: (message: string) => messages.push(message),
    },
  };
}

describe("checkMigrations", () => {
  it("passes when Prisma finds no difference", async () => {
    const { steps: s } = steps(0);

    expect(await checkMigrations(s)).toBe(0);
  });

  it("compares the migrations with the schema on the throwaway database, through its own config", async () => {
    const { steps: s, prisma } = steps(0);

    await checkMigrations(s);

    expect(prisma).toHaveBeenCalledExactlyOnceWith(
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
      SHADOW_URL,
    );
  });

  it("fails on a difference, and says a schema change needs its migration", async () => {
    const { steps: s, messages } = steps(2);

    expect(await checkMigrations(s)).toBe(1);
    expect(messages.join(" ")).toContain("needs its migration");
  });

  it.each([1, 137])("fails when Prisma exits %i, without calling it a difference", async (code) => {
    const { steps: s, messages } = steps(code);

    expect(await checkMigrations(s)).toBe(1);
    expect(messages.join(" ")).toContain(`prisma exited ${code}`);
    expect(messages.join(" ")).not.toContain("needs its migration");
  });

  it("closes the database after a pass and after a failure", async () => {
    const passed = steps(0);
    const failed = steps(2);

    await checkMigrations(passed.steps);
    await checkMigrations(failed.steps);

    expect(passed.close).toHaveBeenCalledOnce();
    expect(failed.close).toHaveBeenCalledOnce();
  });

  it("closes the database when running Prisma throws, and does not pass", async () => {
    const { steps: s, close } = steps(async () => {
      throw new Error("spawn failed");
    });

    await expect(checkMigrations(s)).rejects.toThrow("spawn failed");
    expect(close).toHaveBeenCalledOnce();
  });

  it("does not pass when the database will not start, and never runs Prisma", async () => {
    const { steps: s, prisma } = steps(0);
    const noDatabase = {
      ...s,
      startDatabase: async () => {
        throw new Error("no database");
      },
    };

    await expect(checkMigrations(noDatabase)).rejects.toThrow("no database");
    expect(prisma).not.toHaveBeenCalled();
  });
});
