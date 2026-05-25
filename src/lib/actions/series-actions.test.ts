import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockSeries,
  assertSuccess,
  assertFailure,
} from "@/__tests__/mocks";

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

const mockComputeSeriesProgress = vi.fn();
vi.mock("@/lib/utils/series-progress", () => ({
  computeSeriesProgress: (...args: unknown[]) => mockComputeSeriesProgress(...args),
}));

describe("series-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  describe("auth guard", () => {
    it("rejects unauthenticated calls to createSeries", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createSeries } = await import("./series-actions");

      await expect(createSeries({ name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to updateSeries", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateSeries } = await import("./series-actions");

      await expect(updateSeries("s1", { name: "Test" })).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to deleteSeries", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteSeries } = await import("./series-actions");

      await expect(deleteSeries("s1")).rejects.toThrow("Unauthorized");
    });

    it("rejects unauthenticated calls to getSeriesWithStats", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getSeriesWithStats } = await import("./series-actions");

      await expect(getSeriesWithStats()).rejects.toThrow("Unauthorized");
    });
  });

  describe("createSeries", () => {
    it("creates a series and returns success", async () => {
      const mockSeries = createMockSeries({
        name: "Nora Corbett Fairies",
        notes: "Beautiful fairy designs",
      });
      mockPrisma.series.create.mockResolvedValueOnce(mockSeries);
      const { createSeries } = await import("./series-actions");

      const result = await createSeries({
        name: "Nora Corbett Fairies",
        notes: "Beautiful fairy designs",
      });

      assertSuccess(result);
      expect(result.series.name).toBe("Nora Corbett Fairies");
      expect(result.series.notes).toBe("Beautiful fairy designs");
      expect(mockPrisma.series.create).toHaveBeenCalledWith({
        data: {
          name: "Nora Corbett Fairies",
          totalCount: null,
          designerId: null,
          notes: "Beautiful fairy designs",
        },
      });
    });

    it("returns validation error for empty name", async () => {
      const { createSeries } = await import("./series-actions");

      const result = await createSeries({ name: "" });

      assertFailure(result);
      expect(result.error).toBe("Series name is required");
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.series.create.mockRejectedValueOnce(p2002Error);
      const { createSeries } = await import("./series-actions");

      const result = await createSeries({ name: "Duplicate" });

      assertFailure(result);
      expect(result.error).toBe("A series with that name already exists");
    });

    it("returns generic error on unexpected failure", async () => {
      mockPrisma.series.create.mockRejectedValueOnce(new Error("DB exploded"));
      const { createSeries } = await import("./series-actions");

      const result = await createSeries({ name: "Test" });

      assertFailure(result);
      expect(result.error).toBe("Failed to create series");
    });
  });

  describe("updateSeries", () => {
    it("validates input and updates the record", async () => {
      const updatedSeries = createMockSeries({ id: "s1", name: "Updated Name" });
      mockPrisma.series.update.mockResolvedValueOnce(updatedSeries);
      const { updateSeries } = await import("./series-actions");

      const result = await updateSeries("s1", { name: "Updated Name" });

      assertSuccess(result);
      expect(mockPrisma.series.update).toHaveBeenCalledWith({
        where: { id: "s1" },
        data: { name: "Updated Name", totalCount: null, designerId: null, notes: null },
      });
    });

    it("returns error for duplicate name (P2002)", async () => {
      const p2002Error = Object.assign(new Error("Unique constraint"), {
        code: "P2002",
      });
      mockPrisma.series.update.mockRejectedValueOnce(p2002Error);
      const { updateSeries } = await import("./series-actions");

      const result = await updateSeries("s1", { name: "Existing Series" });

      assertFailure(result);
      expect(result.error).toBe("A series with that name already exists");
    });

    it("returns validation error for invalid input", async () => {
      const { updateSeries } = await import("./series-actions");

      const result = await updateSeries("s1", { name: "" });

      assertFailure(result);
      expect(result.error).toBe("Series name is required");
    });

    it("returns generic error on unexpected failure", async () => {
      mockPrisma.series.update.mockRejectedValueOnce(new Error("Connection lost"));
      const { updateSeries } = await import("./series-actions");

      const result = await updateSeries("s1", { name: "Valid Name" });

      assertFailure(result);
      expect(result.error).toBe("Failed to update series");
    });
  });

  describe("deleteSeries", () => {
    it("calls $transaction to unlink charts then delete", async () => {
      mockPrisma.series.findUnique.mockResolvedValueOnce(createMockSeries({ id: "s1" }));
      mockPrisma.$transaction.mockResolvedValueOnce([{}, {}]);
      const { deleteSeries } = await import("./series-actions");

      const result = await deleteSeries("s1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.chart.updateMany).toHaveBeenCalledWith({
        where: { seriesId: "s1" },
        data: { seriesId: null },
      });
      expect(mockPrisma.series.delete).toHaveBeenCalledWith({
        where: { id: "s1" },
      });
    });

    it("returns error for non-existent ID", async () => {
      mockPrisma.series.findUnique.mockResolvedValueOnce(null);
      const { deleteSeries } = await import("./series-actions");

      const result = await deleteSeries("nonexistent");

      assertFailure(result);
      expect(result.error).toBe("Series not found");
    });

    it("returns generic error when transaction fails", async () => {
      mockPrisma.series.findUnique.mockResolvedValueOnce(createMockSeries({ id: "s1" }));
      mockPrisma.$transaction.mockRejectedValueOnce(new Error("Lock timeout"));
      const { deleteSeries } = await import("./series-actions");

      const result = await deleteSeries("s1");

      assertFailure(result);
      expect(result.error).toBe("Failed to delete series");
    });
  });

  describe("getSeriesWithStats", () => {
    it("returns mapped results with computeSeriesProgress applied", async () => {
      const seriesData = [
        {
          id: "s1",
          name: "Fantasy Series",
          totalCount: 10,
          designerId: "d1",
          notes: "A great series",
          designer: { name: "Shannon Christine" },
          charts: [
            { project: { status: "FINISHED" } },
            { project: { status: "IN_PROGRESS" } },
            { project: null },
          ],
        },
        {
          id: "s2",
          name: "Animal Series",
          totalCount: null,
          designerId: null,
          notes: null,
          designer: null,
          charts: [],
        },
      ];
      mockPrisma.series.findMany.mockResolvedValueOnce(seriesData);
      mockComputeSeriesProgress
        .mockReturnValueOnce({ ownedCount: 3, finishedCount: 1, totalCount: 10 })
        .mockReturnValueOnce({ ownedCount: 0, finishedCount: 0, totalCount: null });

      const { getSeriesWithStats } = await import("./series-actions");

      const result = await getSeriesWithStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "s1",
        name: "Fantasy Series",
        totalCount: 10,
        designerId: "d1",
        designerName: "Shannon Christine",
        notes: "A great series",
        progress: { ownedCount: 3, finishedCount: 1, totalCount: 10 },
      });
      expect(result[1]).toEqual({
        id: "s2",
        name: "Animal Series",
        totalCount: null,
        designerId: null,
        designerName: null,
        notes: null,
        progress: { ownedCount: 0, finishedCount: 0, totalCount: null },
      });

      expect(mockComputeSeriesProgress).toHaveBeenCalledTimes(2);
      expect(mockComputeSeriesProgress).toHaveBeenCalledWith(seriesData[0].charts, 10);
      expect(mockComputeSeriesProgress).toHaveBeenCalledWith(seriesData[1].charts, null);
    });

    it("propagates errors from findMany", async () => {
      mockPrisma.series.findMany.mockRejectedValueOnce(new Error("DB unavailable"));
      const { getSeriesWithStats } = await import("./series-actions");

      await expect(getSeriesWithStats()).rejects.toThrow("DB unavailable");
    });
  });

  describe("getSeriesDetail", () => {
    it("requires authentication", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getSeriesDetail } = await import("./series-actions");

      await expect(getSeriesDetail("s1")).rejects.toThrow("Unauthorized");
    });

    it("returns null for non-existent ID", async () => {
      mockPrisma.series.findUnique.mockResolvedValueOnce(null);
      const { getSeriesDetail } = await import("./series-actions");

      const result = await getSeriesDetail("nonexistent");

      expect(result).toBeNull();
    });

    it("returns enriched series with charts, progress, and designerName", async () => {
      const dbSeries = {
        id: "s1",
        name: "Fairy Collection",
        totalCount: 12,
        designerId: "d1",
        notes: "Beautiful series",
        designer: { id: "d1", name: "Nora Corbett" },
        charts: [
          {
            id: "c1",
            name: "Spring Fairy",
            coverThumbnailUrl: "/thumb.jpg",
            coverImageUrl: "/full.jpg",
            focalPointX: 50,
            focalPointY: 30,
            stitchCount: 15000,
            stitchesWide: 150,
            stitchesHigh: 200,
            project: { status: "FINISHED", stitchesCompleted: 15000 },
          },
          {
            id: "c2",
            name: "Winter Fairy",
            coverThumbnailUrl: null,
            coverImageUrl: null,
            focalPointX: null,
            focalPointY: null,
            stitchCount: 8000,
            stitchesWide: 100,
            stitchesHigh: 80,
            project: null,
          },
        ],
      };
      mockPrisma.series.findUnique.mockResolvedValueOnce(dbSeries);
      mockComputeSeriesProgress.mockReturnValueOnce({
        ownedCount: 2,
        finishedCount: 1,
        totalCount: 12,
      });

      const { getSeriesDetail } = await import("./series-actions");
      const result = await getSeriesDetail("s1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("s1");
      expect(result!.name).toBe("Fairy Collection");
      expect(result!.designerName).toBe("Nora Corbett");
      expect(result!.designerId).toBe("d1");
      expect(result!.notes).toBe("Beautiful series");
      expect(result!.totalCount).toBe(12);
      expect(result!.progress).toEqual({
        ownedCount: 2,
        finishedCount: 1,
        totalCount: 12,
      });
      expect(result!.charts).toHaveLength(2);
    });

    it("charts include focalPoint, coverImageUrl, dimensions, and mapped status", async () => {
      const dbSeries = {
        id: "s1",
        name: "Test Series",
        totalCount: null,
        designerId: null,
        notes: null,
        designer: null,
        charts: [
          {
            id: "c1",
            name: "Chart With Project",
            coverThumbnailUrl: "/thumb.jpg",
            coverImageUrl: "/cover.jpg",
            focalPointX: 40,
            focalPointY: 60,
            stitchCount: 10000,
            stitchesWide: 200,
            stitchesHigh: 150,
            project: { status: "IN_PROGRESS", stitchesCompleted: 3000 },
          },
          {
            id: "c2",
            name: "Chart Without Project",
            coverThumbnailUrl: null,
            coverImageUrl: null,
            focalPointX: null,
            focalPointY: null,
            stitchCount: 5000,
            stitchesWide: 100,
            stitchesHigh: 50,
            project: null,
          },
        ],
      };
      mockPrisma.series.findUnique.mockResolvedValueOnce(dbSeries);
      mockComputeSeriesProgress.mockReturnValueOnce({
        ownedCount: 2,
        finishedCount: 0,
        totalCount: null,
      });

      const { getSeriesDetail } = await import("./series-actions");
      const result = await getSeriesDetail("s1");

      const chart1 = result!.charts[0];
      expect(chart1.focalPointX).toBe(40);
      expect(chart1.focalPointY).toBe(60);
      expect(chart1.coverImageUrl).toBe("/cover.jpg");
      expect(chart1.stitchesWide).toBe(200);
      expect(chart1.stitchesHigh).toBe(150);
      expect(chart1.status).toBe("IN_PROGRESS");
      expect(chart1.stitchesCompleted).toBe(3000);

      const chart2 = result!.charts[1];
      expect(chart2.focalPointX).toBeNull();
      expect(chart2.focalPointY).toBeNull();
      expect(chart2.coverImageUrl).toBeNull();
      expect(chart2.status).toBeNull();
      expect(chart2.stitchesCompleted).toBe(0);
    });

    it("computes progress via computeSeriesProgress", async () => {
      const dbSeries = {
        id: "s1",
        name: "Test",
        totalCount: 5,
        designerId: null,
        notes: null,
        designer: null,
        charts: [
          {
            id: "c1",
            name: "A",
            coverThumbnailUrl: null,
            coverImageUrl: null,
            focalPointX: null,
            focalPointY: null,
            stitchCount: 1000,
            stitchesWide: 50,
            stitchesHigh: 50,
            project: { status: "FINISHED", stitchesCompleted: 1000 },
          },
        ],
      };
      mockPrisma.series.findUnique.mockResolvedValueOnce(dbSeries);
      mockComputeSeriesProgress.mockReturnValueOnce({
        ownedCount: 1,
        finishedCount: 1,
        totalCount: 5,
      });

      const { getSeriesDetail } = await import("./series-actions");
      await getSeriesDetail("s1");

      expect(mockComputeSeriesProgress).toHaveBeenCalledWith(dbSeries.charts, 5);
    });
  });
});
