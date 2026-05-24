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

describe("getThreadInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty array when no project threads exist", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([]);

    const { getThreadInsights } = await import("./thread-insights");
    const result = await getThreadInsights("user-1", []);

    expect(result).toEqual([]);
  });

  it("returns threads ranked by project count descending", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([
      { threadId: "t1", _count: { projectId: 10 } },
      { threadId: "t2", _count: { projectId: 5 } },
      { threadId: "t3", _count: { projectId: 2 } },
    ]);
    mockPrisma.thread.findMany.mockResolvedValue([
      {
        id: "t1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        brand: { name: "DMC" },
      },
      {
        id: "t2",
        colorCode: "321",
        colorName: "Red",
        hexColor: "#FF0000",
        brand: { name: "DMC" },
      },
      {
        id: "t3",
        colorCode: "blanc",
        colorName: "White",
        hexColor: "#FFFFFF",
        brand: { name: "DMC" },
      },
    ]);

    const { getThreadInsights } = await import("./thread-insights");
    const result = await getThreadInsights("user-1", []);

    expect(result).toHaveLength(3);
    expect(result[0].threadId).toBe("t1");
    expect(result[0].projectCount).toBe(10);
    expect(result[0].brandName).toBe("DMC");
    expect(result[0].colorCode).toBe("310");
    expect(result[0].hexColor).toBe("#000000");
    expect(result[1].projectCount).toBe(5);
    expect(result[2].projectCount).toBe(2);
  });

  it("includes brandName, colorCode, colorName, hexColor from thread + brand", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([
      { threadId: "t1", _count: { projectId: 3 } },
    ]);
    mockPrisma.thread.findMany.mockResolvedValue([
      {
        id: "t1",
        colorCode: "500",
        colorName: "Medium Blue",
        hexColor: "#3366CC",
        brand: { name: "Anchor" },
      },
    ]);

    const { getThreadInsights } = await import("./thread-insights");
    const result = await getThreadInsights("user-1", []);

    expect(result[0]).toEqual({
      threadId: "t1",
      brandName: "Anchor",
      colorCode: "500",
      colorName: "Medium Blue",
      hexColor: "#3366CC",
      projectCount: 3,
    });
  });

  it("respects limit parameter", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([
      { threadId: "t1", _count: { projectId: 10 } },
    ]);
    mockPrisma.thread.findMany.mockResolvedValue([
      {
        id: "t1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        brand: { name: "DMC" },
      },
    ]);

    const { getThreadInsights } = await import("./thread-insights");
    await getThreadInsights("user-1", [], 5);

    expect(mockPrisma.projectThread.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    );
  });

  it("queries all projects when statusGroups is empty (no status filter)", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([]);

    const { getThreadInsights } = await import("./thread-insights");
    await getThreadInsights("user-1", []);

    const call = mockPrisma.projectThread.groupBy.mock.calls[0][0];
    expect(call.where.project).toEqual({ userId: "user-1" });
  });

  it("filters by resolved statuses when statusGroups is provided", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([]);

    const { getThreadInsights } = await import("./thread-insights");
    await getThreadInsights("user-1", ["not-started"]);

    const call = mockPrisma.projectThread.groupBy.mock.calls[0][0];
    expect(call.where.project).toEqual({
      userId: "user-1",
      status: { in: ["UNSTARTED"] },
    });
  });

  it("does not include session-gated where clause", async () => {
    mockPrisma.projectThread.groupBy.mockResolvedValue([]);

    const { getThreadInsights } = await import("./thread-insights");
    await getThreadInsights("user-1", []);

    const call = mockPrisma.projectThread.groupBy.mock.calls[0][0];
    expect(call.where.project).not.toHaveProperty("sessions");
  });
});
