import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getGenreBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no genres exist for user", async () => {
    mockPrisma.genre.findMany.mockResolvedValue([]);

    const { getGenreBreakdown } = await import("./genre-breakdown");
    const result = await getGenreBreakdown("user-1");

    expect(result).toEqual([]);
  });

  it("returns genres sorted by chart count descending", async () => {
    mockPrisma.genre.findMany.mockResolvedValue([
      { id: "g1", name: "Samplers", _count: { charts: 15 } },
      { id: "g2", name: "Florals", _count: { charts: 8 } },
      { id: "g3", name: "Animals", _count: { charts: 3 } },
    ]);

    const { getGenreBreakdown } = await import("./genre-breakdown");
    const result = await getGenreBreakdown("user-1");

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ genreId: "g1", name: "Samplers", count: 15 });
    expect(result[1]).toEqual({ genreId: "g2", name: "Florals", count: 8 });
    expect(result[2]).toEqual({ genreId: "g3", name: "Animals", count: 3 });
  });

  it("respects limit parameter (default 10)", async () => {
    mockPrisma.genre.findMany.mockResolvedValue([]);

    const { getGenreBreakdown } = await import("./genre-breakdown");
    await getGenreBreakdown("user-1");

    // Verify findMany was called with take: 10 (default limit)
    expect(mockPrisma.genre.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });

  it("each item has genreId, name, and count fields", async () => {
    mockPrisma.genre.findMany.mockResolvedValue([
      { id: "g1", name: "Samplers", _count: { charts: 12 } },
    ]);

    const { getGenreBreakdown } = await import("./genre-breakdown");
    const result = await getGenreBreakdown("user-1");

    expect(result[0]).toHaveProperty("genreId", "g1");
    expect(result[0]).toHaveProperty("name", "Samplers");
    expect(result[0]).toHaveProperty("count", 12);
  });
});
