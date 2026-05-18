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
    const result = await getGenreInsights("user-1", "all");

    expect(result).toEqual([]);
  });

  it("ranks genres by total stitches (sum of session stitchCounts) descending", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: {
          genres: [{ id: "g1", name: "Samplers" }],
        },
        sessions: [{ stitchCount: 1000 }, { stitchCount: 500 }],
      },
      {
        id: "p2",
        chart: {
          genres: [{ id: "g2", name: "Animals" }],
        },
        sessions: [{ stitchCount: 2000 }],
      },
      {
        id: "p3",
        chart: {
          genres: [
            { id: "g1", name: "Samplers" },
            { id: "g2", name: "Animals" },
          ],
        },
        sessions: [{ stitchCount: 3000 }],
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", "all");

    expect(result).toHaveLength(2);
    expect(result[0].genreId).toBe("g2");
    expect(result[0].name).toBe("Animals");
    expect(result[0].totalStitches).toBe(5000);
    expect(result[1].genreId).toBe("g1");
    expect(result[1].name).toBe("Samplers");
    expect(result[1].totalStitches).toBe(4500);
  });

  it("distributes project stitches to all genres on that project's chart", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: {
          genres: [
            { id: "g1", name: "Samplers" },
            { id: "g2", name: "Holiday" },
          ],
        },
        sessions: [{ stitchCount: 1000 }],
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", "all");

    expect(result).toHaveLength(2);
    expect(result[0].totalStitches).toBe(1000);
    expect(result[1].totalStitches).toBe(1000);
  });

  it("respects limit parameter", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chart: { genres: [{ id: "g1", name: "A" }] },
        sessions: [{ stitchCount: 300 }],
      },
      {
        id: "p2",
        chart: { genres: [{ id: "g2", name: "B" }] },
        sessions: [{ stitchCount: 200 }],
      },
      {
        id: "p3",
        chart: { genres: [{ id: "g3", name: "C" }] },
        sessions: [{ stitchCount: 100 }],
      },
    ]);

    const { getGenreInsights } = await import("./genre-insights");
    const result = await getGenreInsights("user-1", "all", 2);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("A");
    expect(result[1].name).toBe("B");
  });
});
