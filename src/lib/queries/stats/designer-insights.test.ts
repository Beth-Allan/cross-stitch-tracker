import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));

describe("getDesignerInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty array when no designers exist", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getDesignerInsights } = await import("./designer-insights");
    const result = await getDesignerInsights("user-1", "all");

    expect(result).toEqual([]);
  });

  it("calculates completionRate as (FINISHED+FFO / total) * 100", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Alice" } },
      },
      {
        id: "p2",
        status: "FFO",
        chart: { designerId: "d1", designer: { id: "d1", name: "Alice" } },
      },
      {
        id: "p3",
        status: "IN_PROGRESS",
        chart: { designerId: "d1", designer: { id: "d1", name: "Alice" } },
      },
      {
        id: "p4",
        status: "FINISHED",
        chart: { designerId: "d2", designer: { id: "d2", name: "Bob" } },
      },
      {
        id: "p5",
        status: "UNSTARTED",
        chart: { designerId: "d2", designer: { id: "d2", name: "Bob" } },
      },
    ]);

    const { getDesignerInsights } = await import("./designer-insights");
    const result = await getDesignerInsights("user-1", "all");

    expect(result.length).toBeGreaterThanOrEqual(2);

    const alice = result.find((d) => d.designerId === "d1")!;
    expect(alice.totalProjects).toBe(3);
    expect(alice.completedProjects).toBe(2);
    expect(alice.completionRate).toBe(67);

    const bob = result.find((d) => d.designerId === "d2")!;
    expect(bob.totalProjects).toBe(2);
    expect(bob.completedProjects).toBe(1);
    expect(bob.completionRate).toBe(50);
  });

  it("includes fraction parts (totalProjects, completedProjects)", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p2",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p3",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p4",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p5",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p6",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p7",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p8",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p9",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p10",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p11",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p12",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p13",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p14",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p15",
        status: "IN_PROGRESS",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p16",
        status: "IN_PROGRESS",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
      {
        id: "p17",
        status: "IN_PROGRESS",
        chart: { designerId: "d1", designer: { id: "d1", name: "Test" } },
      },
    ]);

    const { getDesignerInsights } = await import("./designer-insights");
    const result = await getDesignerInsights("user-1", "all");

    expect(result[0].totalProjects).toBe(17);
    expect(result[0].completedProjects).toBe(14);
    expect(result[0].completionRate).toBe(82);
  });

  it("sorts by completionRate descending", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "High Rate" } },
      },
      {
        id: "p2",
        status: "FINISHED",
        chart: { designerId: "d1", designer: { id: "d1", name: "High Rate" } },
      },
      {
        id: "p3",
        status: "IN_PROGRESS",
        chart: { designerId: "d2", designer: { id: "d2", name: "Low Rate" } },
      },
      {
        id: "p4",
        status: "FINISHED",
        chart: { designerId: "d2", designer: { id: "d2", name: "Low Rate" } },
      },
      {
        id: "p5",
        status: "IN_PROGRESS",
        chart: { designerId: "d2", designer: { id: "d2", name: "Low Rate" } },
      },
      {
        id: "p6",
        status: "IN_PROGRESS",
        chart: { designerId: "d2", designer: { id: "d2", name: "Low Rate" } },
      },
    ]);

    const { getDesignerInsights } = await import("./designer-insights");
    const result = await getDesignerInsights("user-1", "all");

    expect(result[0].name).toBe("High Rate");
    expect(result[0].completionRate).toBe(100);
    expect(result[1].name).toBe("Low Rate");
    expect(result[1].completionRate).toBe(25);
  });
});
