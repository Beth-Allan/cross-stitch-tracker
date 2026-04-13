import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockDesigner } from "@/__tests__/mocks";

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

describe("designer-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated user
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } });
  });

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createDesigner", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createDesigner } = await import("./designer-actions");

      await expect(createDesigner({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateDesigner", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateDesigner } = await import("./designer-actions");

      await expect(updateDesigner("d1", { name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteDesigner", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteDesigner } = await import("./designer-actions");

      await expect(deleteDesigner("d1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getDesigner", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getDesigner } = await import("./designer-actions");

      await expect(getDesigner("d1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getDesignersWithStats", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getDesignersWithStats } = await import("./designer-actions");

      await expect(getDesignersWithStats()).rejects.toThrow("Unauthorized");
    });
  });

  describe("createDesigner", () => {
    it("creates a designer with notes field and returns success", async () => {
      const mockDesigner = createMockDesigner({
        name: "Shannon Christine",
        notes: "Great designs",
      });
      mockPrisma.designer.create.mockResolvedValueOnce(mockDesigner);
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "Shannon Christine", notes: "Great designs" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.designer.name).toBe("Shannon Christine");
        expect(result.designer.notes).toBe("Great designs");
      }
      expect(mockPrisma.designer.create).toHaveBeenCalledWith({
        data: { name: "Shannon Christine", website: null, notes: "Great designs" },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.designer.create.mockRejectedValueOnce(p2002Error);
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "Duplicate" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A designer with that name already exists");
      }
    });

    it("returns validation error for empty name", async () => {
      const { createDesigner } = await import("./designer-actions");

      const result = await createDesigner({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Designer name is required");
      }
    });
  });

  describe("updateDesigner", () => {
    it("validates input and updates the record", async () => {
      const updatedDesigner = createMockDesigner({ id: "d1", name: "Updated Name" });
      mockPrisma.designer.update.mockResolvedValueOnce(updatedDesigner);
      const { updateDesigner } = await import("./designer-actions");

      const result = await updateDesigner("d1", { name: "Updated Name" });

      expect(result.success).toBe(true);
      expect(mockPrisma.designer.update).toHaveBeenCalledWith({
        where: { id: "d1" },
        data: { name: "Updated Name", website: null, notes: null },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      mockPrisma.designer.update.mockRejectedValueOnce(p2002Error);
      const { updateDesigner } = await import("./designer-actions");

      const result = await updateDesigner("d1", { name: "Existing Designer" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("A designer with that name already exists");
      }
    });

    it("returns validation error for invalid input", async () => {
      const { updateDesigner } = await import("./designer-actions");

      const result = await updateDesigner("d1", { name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Designer name is required");
      }
    });
  });

  describe("deleteDesigner", () => {
    it("calls $transaction to unlink charts then delete", async () => {
      mockPrisma.designer.findUnique.mockResolvedValueOnce({
        ...createMockDesigner({ id: "d1" }),
        _count: { charts: 3 },
      });
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteDesigner } = await import("./designer-actions");

      const result = await deleteDesigner("d1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        mockPrisma.chart.updateMany({
          where: { designerId: "d1" },
          data: { designerId: null },
        }),
        mockPrisma.designer.delete({ where: { id: "d1" } }),
      ]);
    });

    it("returns error for non-existent ID", async () => {
      mockPrisma.designer.findUnique.mockResolvedValueOnce(null);
      const { deleteDesigner } = await import("./designer-actions");

      const result = await deleteDesigner("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Designer not found");
      }
    });
  });

  describe("getDesigner", () => {
    it("returns designer with charts and computed stats", async () => {
      const designerData = {
        id: "d1",
        name: "Test Designer",
        website: "https://example.com",
        notes: "Some notes",
        charts: [
          {
            id: "c1",
            name: "Chart 1",
            coverThumbnailUrl: null,
            stitchCount: 5000,
            stitchesWide: 100,
            stitchesHigh: 50,
            project: { status: "IN_PROGRESS", stitchesCompleted: 1000 },
            genres: [{ name: "Fantasy" }, { name: "Animals" }],
          },
          {
            id: "c2",
            name: "Chart 2",
            coverThumbnailUrl: null,
            stitchCount: 3000,
            stitchesWide: 60,
            stitchesHigh: 50,
            project: { status: "FINISHED", stitchesCompleted: 3000 },
            genres: [{ name: "Fantasy" }],
          },
          {
            id: "c3",
            name: "Chart 3",
            coverThumbnailUrl: null,
            stitchCount: 2000,
            stitchesWide: 40,
            stitchesHigh: 50,
            project: null,
            genres: [],
          },
        ],
      };
      mockPrisma.designer.findUnique.mockResolvedValueOnce(designerData);
      const { getDesigner } = await import("./designer-actions");

      const result = await getDesigner("d1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("d1");
      expect(result!.chartCount).toBe(3);
      expect(result!.projectsStarted).toBe(2); // IN_PROGRESS + FINISHED
      expect(result!.projectsFinished).toBe(1); // FINISHED only
      expect(result!.topGenre).toBe("Fantasy"); // appears 2x
      expect(result!.charts).toHaveLength(3);
    });

    it("returns null for non-existent ID", async () => {
      mockPrisma.designer.findUnique.mockResolvedValueOnce(null);
      const { getDesigner } = await import("./designer-actions");

      const result = await getDesigner("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getDesignersWithStats", () => {
    it("returns designers with chartCount mapped from _count", async () => {
      mockPrisma.designer.findMany.mockResolvedValueOnce([
        {
          id: "d1",
          name: "Designer A",
          website: null,
          notes: null,
          _count: { charts: 5 },
        },
        {
          id: "d2",
          name: "Designer B",
          website: "https://example.com",
          notes: "A note",
          _count: { charts: 0 },
        },
      ]);
      const { getDesignersWithStats } = await import("./designer-actions");

      const result = await getDesignersWithStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "d1",
        name: "Designer A",
        website: null,
        notes: null,
        chartCount: 5,
      });
      expect(result[1]).toEqual({
        id: "d2",
        name: "Designer B",
        website: "https://example.com",
        notes: "A note",
        chartCount: 0,
      });
    });
  });

  describe("getDesigner (error handling)", () => {
    it("throws on DB error (handled by error boundary)", async () => {
      mockPrisma.designer.findUnique.mockRejectedValueOnce(new Error("DB error"));
      const { getDesigner } = await import("./designer-actions");

      await expect(getDesigner("d1")).rejects.toThrow("DB error");
    });
  });

  describe("getDesignersWithStats (error handling)", () => {
    it("throws on DB error (handled by error boundary)", async () => {
      mockPrisma.designer.findMany.mockRejectedValueOnce(new Error("DB error"));
      const { getDesignersWithStats } = await import("./designer-actions");

      await expect(getDesignersWithStats()).rejects.toThrow("DB error");
    });
  });

  describe("getDesigners (error handling)", () => {
    it("throws on DB error (handled by error boundary)", async () => {
      mockPrisma.designer.findMany.mockRejectedValueOnce(new Error("DB connection lost"));
      const { getDesigners } = await import("./designer-actions");

      await expect(getDesigners()).rejects.toThrow("DB connection lost");
    });
  });
});
