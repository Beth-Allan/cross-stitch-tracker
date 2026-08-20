import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createSupplyRollup, mockProjectSupplyGroups } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

type Row = { projectId: string; quantityRequired: number; quantityAcquired: number };

/**
 * Every expectation here is derived from `createSupplyRollup`, which states the rule as the JS
 * pass wrote it. A rollup that disagrees with the old behaviour fails, rather than agreeing with
 * a hand-typed number that was itself read off the new code.
 */
const referenceRollup = createSupplyRollup;

/** Feeds one fixture per junction into the six reads the helper makes. */
function mockJunctions(rows: { threads?: Row[]; beads?: Row[]; specialty?: Row[] }) {
  const all = [...(rows.threads ?? []), ...(rows.beads ?? []), ...(rows.specialty ?? [])];
  const forProject = (junction: Row[] | undefined, projectId: string) =>
    (junction ?? []).filter((r) => r.projectId === projectId);

  mockProjectSupplyGroups(
    mockPrisma,
    [...new Set(all.map((r) => r.projectId))].map((projectId) => ({
      projectId,
      threads: forProject(rows.threads, projectId),
      beads: forProject(rows.beads, projectId),
      specialty: forProject(rows.specialty, projectId),
    })),
  );
}

describe("summariseProjectSupplies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reproduces the JS pass for a mix of unstarted, partial and fulfilled rows", async () => {
    const threads: Row[] = [
      { projectId: "p1", quantityRequired: 3, quantityAcquired: 0 },
      { projectId: "p1", quantityRequired: 2, quantityAcquired: 1 },
      { projectId: "p1", quantityRequired: 4, quantityAcquired: 4 },
    ];
    mockJunctions({ threads });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads).toEqual(referenceRollup(threads));
  });

  it("caps an over-acquired row at what it required, as Math.min did", async () => {
    // A bare _sum of quantityAcquired would say 7 here; the kitting figure counts 2.
    const threads: Row[] = [{ projectId: "p1", quantityRequired: 2, quantityAcquired: 7 }];
    mockJunctions({ threads });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads.acquired).toBe(2);
    expect(result.get("p1")?.threads).toEqual(referenceRollup(threads));
  });

  it("caps per row, not against the project total", async () => {
    // One row over-acquired, one untouched: the surplus must not cover the shortfall.
    const threads: Row[] = [
      { projectId: "p1", quantityRequired: 2, quantityAcquired: 9 },
      { projectId: "p1", quantityRequired: 5, quantityAcquired: 0 },
    ];
    mockJunctions({ threads });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads).toEqual(referenceRollup(threads));
    expect(result.get("p1")?.threads.acquired).toBe(2);
    expect(result.get("p1")?.threads.allFulfilled).toBe(false);
  });

  it("reports allFulfilled only when no row is short", async () => {
    const fulfilled: Row[] = [
      { projectId: "p1", quantityRequired: 1, quantityAcquired: 1 },
      { projectId: "p1", quantityRequired: 2, quantityAcquired: 5 },
    ];
    mockJunctions({ threads: fulfilled });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads.allFulfilled).toBe(true);
    expect(result.get("p1")?.threads).toEqual(referenceRollup(fulfilled));
  });

  it("reports anyAcquired from the largest single row, not from a total", async () => {
    const threads: Row[] = [
      { projectId: "p1", quantityRequired: 4, quantityAcquired: 0 },
      { projectId: "p1", quantityRequired: 4, quantityAcquired: 1 },
    ];
    mockJunctions({ threads });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads.anyAcquired).toBe(true);
    expect(result.get("p1")?.threads).toEqual(referenceRollup(threads));
  });

  it("reports anyAcquired false when nothing has been gathered", async () => {
    const threads: Row[] = [
      { projectId: "p1", quantityRequired: 4, quantityAcquired: 0 },
      { projectId: "p1", quantityRequired: 2, quantityAcquired: 0 },
    ];
    mockJunctions({ threads });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")?.threads).toEqual(referenceRollup(threads));
    expect(result.get("p1")?.threads.anyAcquired).toBe(false);
  });

  it("keeps the three junctions apart, per project", async () => {
    const threads: Row[] = [
      { projectId: "p1", quantityRequired: 3, quantityAcquired: 3 },
      { projectId: "p2", quantityRequired: 1, quantityAcquired: 0 },
    ];
    const beads: Row[] = [{ projectId: "p1", quantityRequired: 2, quantityAcquired: 1 }];
    const specialty: Row[] = [{ projectId: "p2", quantityRequired: 4, quantityAcquired: 4 }];
    mockJunctions({ threads, beads, specialty });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.get("p1")).toEqual({
      threads: referenceRollup(threads.filter((r) => r.projectId === "p1")),
      beads: referenceRollup(beads),
      specialty: referenceRollup([]),
    });
    expect(result.get("p2")).toEqual({
      threads: referenceRollup(threads.filter((r) => r.projectId === "p2")),
      beads: referenceRollup([]),
      specialty: referenceRollup(specialty),
    });
  });

  it("leaves a project with no supply rows out of the map entirely", async () => {
    mockJunctions({ threads: [{ projectId: "p1", quantityRequired: 1, quantityAcquired: 0 }] });

    const { summariseProjectSupplies } = await import("./project-supplies");
    const result = await summariseProjectSupplies({ userId: "user-1" });

    expect(result.has("p2")).toBe(false);
  });

  describe("security", () => {
    it("scopes all six reads to the caller's projects", async () => {
      mockJunctions({});

      const { summariseProjectSupplies } = await import("./project-supplies");
      await summariseProjectSupplies({ userId: "user-1" });

      for (const junction of [
        mockPrisma.projectThread.groupBy,
        mockPrisma.projectBead.groupBy,
        mockPrisma.projectSpecialty.groupBy,
      ]) {
        expect(junction).toHaveBeenCalledTimes(2);
        for (const call of junction.mock.calls) {
          expect(call[0].where).toMatchObject({ project: { userId: "user-1" } });
        }
      }
    });

    it("carries the caller's status filter into every read", async () => {
      mockJunctions({});

      const { summariseProjectSupplies } = await import("./project-supplies");
      await summariseProjectSupplies({ userId: "user-1", status: { in: ["UNSTARTED"] } });

      expect(mockPrisma.projectThread.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: { userId: "user-1", status: { in: ["UNSTARTED"] } },
          }),
        }),
      );
    });
  });

  describe("the shortfall read", () => {
    it("compares the two columns rather than a fixed number", async () => {
      mockJunctions({});

      const { summariseProjectSupplies } = await import("./project-supplies");
      await summariseProjectSupplies({ userId: "user-1" });

      const [, shortfallCall] = mockPrisma.projectThread.groupBy.mock.calls;
      expect(shortfallCall[0].where.quantityAcquired).toEqual({
        lt: mockPrisma.projectThread.fields.quantityRequired,
      });
    });
  });
});

describe("totalSupplyRollup", () => {
  it("adds the three junctions into the one figure the kitting rule uses", async () => {
    const threads: Row[] = [{ projectId: "p1", quantityRequired: 3, quantityAcquired: 9 }];
    const beads: Row[] = [{ projectId: "p1", quantityRequired: 2, quantityAcquired: 1 }];
    const specialty: Row[] = [{ projectId: "p1", quantityRequired: 4, quantityAcquired: 0 }];

    const { totalSupplyRollup } = await import("./project-supplies");
    const combined = totalSupplyRollup({
      threads: referenceRollup(threads),
      beads: referenceRollup(beads),
      specialty: referenceRollup(specialty),
    });

    expect(combined).toEqual(referenceRollup([...threads, ...beads, ...specialty]));
  });

  it("is empty for a project with nothing recorded", async () => {
    const { totalSupplyRollup, EMPTY_PROJECT_SUPPLIES } = await import("./project-supplies");

    expect(totalSupplyRollup(EMPTY_PROJECT_SUPPLIES)).toEqual(referenceRollup([]));
  });
});
