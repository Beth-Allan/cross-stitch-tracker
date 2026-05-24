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

describe("getGenreInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty array when no genres exist", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", []);

    expect(result).toEqual([]);
  });

  it("ranks genres by total stitches from chart.stitchCount descending", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: {
          stitchCount: 1500,
          genres: [{ id: "g1", name: "Samplers" }],
        },
      },
      {
        id: "p2",
        chart: {
          stitchCount: 2000,
          genres: [{ id: "g2", name: "Animals" }],
        },
      },
      {
        id: "p3",
        chart: {
          stitchCount: 3000,
          genres: [
            { id: "g1", name: "Samplers" },
            { id: "g2", name: "Animals" },
          ],
        },
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", []);

    expect(result).toHaveLength(2);
    expect(result[0].genreId).toBe("g2");
    expect(result[0].name).toBe("Animals");
    expect(result[0].totalStitches).toBe(5000);
    expect(result[1].genreId).toBe("g1");
    expect(result[1].name).toBe("Samplers");
    expect(result[1].totalStitches).toBe(4500);
  });

  it("distributes chart stitchCount to all genres on that project's chart", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: {
          stitchCount: 1000,
          genres: [
            { id: "g1", name: "Samplers" },
            { id: "g2", name: "Holiday" },
          ],
        },
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", []);

    expect(result).toHaveLength(2);
    expect(result[0].totalStitches).toBe(1000);
    expect(result[1].totalStitches).toBe(1000);
  });

  it("respects limit parameter", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: { stitchCount: 300, genres: [{ id: "g1", name: "A" }] },
      },
      {
        id: "p2",
        chart: { stitchCount: 200, genres: [{ id: "g2", name: "B" }] },
      },
      {
        id: "p3",
        chart: { stitchCount: 100, genres: [{ id: "g3", name: "C" }] },
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", [], 2);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("A");
    expect(result[1].name).toBe("B");
  });

  it("queries all projects when statusGroups is empty (no status filter)", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getGenreInsights } = await import("./genre-insights");
    await getGenreInsights("user-1", []);

    const call = mockPrisma.project.findMany.mock.calls[0][0];
    expect(call.where).not.toHaveProperty("status");
    expect(call.include).not.toHaveProperty("sessions");
  });

  it("filters by resolved statuses when statusGroups is provided", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getGenreInsights } = await import("./genre-insights");
    await getGenreInsights("user-1", ["in-progress"]);

    const call = mockPrisma.project.findMany.mock.calls[0][0];
    expect(call.where.status).toEqual({
      in: ["KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD"],
    });
  });
});
