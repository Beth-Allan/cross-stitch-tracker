import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth to return authenticated session
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockGenerateThumbnail = vi.fn();
vi.mock("@/lib/actions/upload-actions", () => ({
  generateThumbnail: (...args: unknown[]) => mockGenerateThumbnail(...args),
}));

const validFormData = {
  chart: {
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    digitalFileUrl: null,
    stitchCount: 5000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 50,
    genreIds: [],
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    notes: null,
  },
  project: {
    status: "UNSTARTED",
    storageLocationId: null,
    stitchingAppId: null,
    needsOnionSkinning: false,
    startDate: null,
    finishDate: null,
    ffoDate: null,
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
  },
};

describe("chart-actions thumbnail generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateThumbnail.mockResolvedValue({ success: true, thumbnailKey: "thumb-key" });
    // Support interactive transactions (function arg) and batch transactions (array arg)
    mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function")
        return (fnOrArray as (tx: typeof mockPrisma) => unknown)(mockPrisma);
      return fnOrArray;
    });
  });

  describe("createChart", () => {
    it("calls generateThumbnail when coverImageUrl is provided", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/p1/abc.png" },
      };

      await createChart(formData);

      expect(mockGenerateThumbnail).toHaveBeenCalledWith("new-chart-id", "covers/p1/abc.png");
    });

    it("does NOT call generateThumbnail when coverImageUrl is null", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      await createChart(validFormData);

      expect(mockGenerateThumbnail).not.toHaveBeenCalled();
    });

    it("succeeds with warning when generateThumbnail fails", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockGenerateThumbnail.mockRejectedValueOnce(new Error("R2 down"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/p1/abc.png" },
      };

      const result = await createChart(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.warning).toBe("Thumbnail could not be generated");
      }
      consoleSpy.mockRestore();
    });

    it("returns no warning when thumbnail succeeds", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/p1/abc.png" },
      };

      const result = await createChart(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.warning).toBeUndefined();
      }
    });
  });

  describe("updateChart", () => {
    it("calls generateThumbnail when coverImageUrl changes", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/old.png",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/new.png" },
      };

      await updateChart("chart-1", formData);

      expect(mockGenerateThumbnail).toHaveBeenCalledWith("chart-1", "covers/new.png");
    });

    it("does NOT call generateThumbnail when coverImageUrl is unchanged", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/same.png",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/same.png" },
      };

      await updateChart("chart-1", formData);

      expect(mockGenerateThumbnail).not.toHaveBeenCalled();
    });

    it("does NOT call generateThumbnail when coverImageUrl is null", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: null,
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      await updateChart("chart-1", validFormData);

      expect(mockGenerateThumbnail).not.toHaveBeenCalled();
    });
  });
});
