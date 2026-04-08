import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockGenre } from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("genre-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated user
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createGenre", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createGenre } = await import("./genre-actions");

      await expect(createGenre({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateGenre", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateGenre } = await import("./genre-actions");

      await expect(updateGenre("g1", { name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteGenre", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteGenre } = await import("./genre-actions");

      await expect(deleteGenre("g1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getGenre", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getGenre } = await import("./genre-actions");

      await expect(getGenre("g1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getGenresWithStats", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getGenresWithStats } = await import("./genre-actions");

      await expect(getGenresWithStats()).rejects.toThrow("Unauthorized");
    });
  });

  describe("createGenre", () => {
    it("creates a genre and returns success", async () => {
      const mockGenre = createMockGenre({ name: "Fantasy" });
      mockPrisma.genre.create.mockResolvedValueOnce(mockGenre);
      const { createGenre } = await import("./genre-actions");

      const result = await createGenre({ name: "Fantasy" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.genre.name).toBe("Fantasy");
      }
      expect(mockPrisma.genre.create).toHaveBeenCalledWith({
        data: { name: "Fantasy" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.genre.create.mockRejectedValueOnce(p2002Error);
      const { createGenre } = await import("./genre-actions");

      const result = await createGenre({ name: "Duplicate" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A genre with that name already exists");
      }
    });

    it("returns validation error for empty name", async () => {
      const { createGenre } = await import("./genre-actions");

      const result = await createGenre({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Genre name is required");
      }
    });
  });

  describe("updateGenre", () => {
    it("validates input and updates the record", async () => {
      const updatedGenre = createMockGenre({ id: "g1", name: "Updated Genre" });
      mockPrisma.genre.update.mockResolvedValueOnce(updatedGenre);
      const { updateGenre } = await import("./genre-actions");

      const result = await updateGenre("g1", { name: "Updated Genre" });

      expect(result.success).toBe(true);
      expect(mockPrisma.genre.update).toHaveBeenCalledWith({
        where: { id: "g1" },
        data: { name: "Updated Genre" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.genre.update.mockRejectedValueOnce(p2002Error);
      const { updateGenre } = await import("./genre-actions");

      const result = await updateGenre("g1", { name: "Existing Genre" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A genre with that name already exists");
      }
    });

    it("returns validation error for empty name", async () => {
      const { updateGenre } = await import("./genre-actions");

      const result = await updateGenre("g1", { name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Genre name is required");
      }
    });
  });

  describe("deleteGenre", () => {
    it("calls $transaction to disconnect charts then delete", async () => {
      mockPrisma.genre.findUnique.mockResolvedValueOnce(
        createMockGenre({ id: "g1", _count: { charts: 2 } } as Partial<any>),
      );
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteGenre } = await import("./genre-actions");

      const result = await deleteGenre("g1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.genre.update({
          where: { id: "g1" },
          data: { charts: { set: [] } },
        }),
        mockPrisma.genre.delete({ where: { id: "g1" } }),
      ]);
    });

    it("returns error for non-existent ID", async () => {
      mockPrisma.genre.findUnique.mockResolvedValueOnce(null);
      const { deleteGenre } = await import("./genre-actions");

      const result = await deleteGenre("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Genre not found");
      }
    });
  });

  describe("getGenre", () => {
    it("returns genre with charts and chartCount", async () => {
      const genreData = {
        id: "g1",
        name: "Fantasy",
        _count: { charts: 2 },
        charts: [
          {
            id: "c1",
            name: "Dragon Chart",
            coverThumbnailUrl: null,
            stitchCount: 5000,
            stitchesWide: 100,
            stitchesHigh: 50,
            project: { status: "IN_PROGRESS", stitchesCompleted: 1000 },
          },
          {
            id: "c2",
            name: "Unicorn Chart",
            coverThumbnailUrl: "https://example.com/thumb.jpg",
            stitchCount: 3000,
            stitchesWide: 60,
            stitchesHigh: 50,
            project: null,
          },
        ],
      };
      mockPrisma.genre.findUnique.mockResolvedValueOnce(genreData);
      const { getGenre } = await import("./genre-actions");

      const result = await getGenre("g1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("g1");
      expect(result!.name).toBe("Fantasy");
      expect(result!.chartCount).toBe(2);
      expect(result!.charts).toHaveLength(2);
      expect(result!.charts[0].name).toBe("Dragon Chart");
    });

    it("returns null for non-existent ID", async () => {
      mockPrisma.genre.findUnique.mockResolvedValueOnce(null);
      const { getGenre } = await import("./genre-actions");

      const result = await getGenre("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getGenresWithStats", () => {
    it("returns genres with chartCount mapped from _count", async () => {
      mockPrisma.genre.findMany.mockResolvedValueOnce([
        {
          id: "g1",
          name: "Fantasy",
          _count: { charts: 10 },
        },
        {
          id: "g2",
          name: "Animals",
          _count: { charts: 3 },
        },
      ]);
      const { getGenresWithStats } = await import("./genre-actions");

      const result = await getGenresWithStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "g1",
        name: "Fantasy",
        chartCount: 10,
      });
      expect(result[1]).toEqual({
        id: "g2",
        name: "Animals",
        chartCount: 3,
      });
    });
  });

  describe("getGenres (existing - error handling)", () => {
    it("returns empty array and logs on Prisma error", async () => {
      const { getGenres } = await import("./genre-actions");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockPrisma.genre.findMany.mockRejectedValueOnce(new Error("DB connection lost"));

      const result = await getGenres();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("getGenres error:", expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
