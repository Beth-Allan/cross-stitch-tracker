import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, assertSuccess } from "@/__tests__/mocks";

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
  revalidateTag: vi.fn(),
}));

const mockGenerateThumbnail = vi.fn();
vi.mock("@/lib/actions/upload-actions", () => ({
  generateThumbnail: (...args: unknown[]) => mockGenerateThumbnail(...args),
}));

const mockDiscardStoredObjects = vi.fn();
vi.mock("@/lib/r2", () => ({
  discardStoredObjects: (...args: unknown[]) => mockDiscardStoredObjects(...args),
}));

/**
 * The keys the cleanup helper will actually act on from the most recent call.
 * Absent keys reach it as `null` by design, so they are not part of the subject.
 */
function discardedKeys(): unknown[] {
  const call = mockDiscardStoredObjects.mock.calls.at(-1);
  return call ? (call[0] as unknown[]).filter(Boolean) : [];
}

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
    mockDiscardStoredObjects.mockResolvedValue(undefined);
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

      assertSuccess(result);
      expect(result.warning).toBe("Thumbnail could not be generated");
      consoleSpy.mockRestore();
    });

    it("succeeds with warning when generateThumbnail reports failure without throwing", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockGenerateThumbnail.mockResolvedValueOnce({ success: false, error: "Failed" });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/p1/abc.png" },
      };

      const result = await createChart(formData);

      assertSuccess(result);
      expect(result.warning).toBe("Thumbnail could not be generated");
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

      assertSuccess(result);
      expect(result.warning).toBeUndefined();
    });
  });

  describe("updateChart", () => {
    it("calls generateThumbnail when coverImageUrl changes", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-old.png",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      await updateChart("chart-1", formData);

      expect(mockGenerateThumbnail).toHaveBeenCalledWith("chart-1", "covers/chart-1/abc-new.png");
    });

    it("does NOT call generateThumbnail when coverImageUrl is unchanged", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-same.png",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-same.png" },
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

    it("removes the superseded cover and thumbnail once the new thumbnail exists", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-old.png",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
      mockGenerateThumbnail.mockResolvedValueOnce({
        success: true,
        thumbnailKey: "covers/chart-1/thumb-new.webp",
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      const result = await updateChart("chart-1", formData);

      assertSuccess(result);
      expect(discardedKeys()).toEqual([
        "covers/chart-1/abc-old.png",
        "covers/chart-1/thumb-old.webp",
      ]);
    });

    it("keeps the old thumbnail when regeneration reports failure — the chart still shows it", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-old.png",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
      mockGenerateThumbnail.mockResolvedValueOnce({ success: false, error: "Failed" });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Replacing a cover leaves the form's thumbnail field alone, so the payload
      // still carries the old key — and the row goes on naming it.
      const formData = {
        ...validFormData,
        chart: {
          ...validFormData.chart,
          coverImageUrl: "covers/chart-1/abc-new.png",
          coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        },
      };

      const result = await updateChart("chart-1", formData);

      assertSuccess(result);
      expect(result.warning).toBe("Thumbnail could not be generated");
      expect(discardedKeys()).toEqual(["covers/chart-1/abc-old.png"]);
      expect(discardedKeys()).not.toContain("covers/chart-1/thumb-old.webp");
      consoleSpy.mockRestore();
    });

    it("removes both objects when the cover is taken off the chart", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-old.png",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });

      // Removing the cover clears both fields on the form, so the row ends up
      // naming neither object.
      const result = await updateChart("chart-1", validFormData);

      assertSuccess(result);
      expect(mockGenerateThumbnail).not.toHaveBeenCalled();
      expect(discardedKeys()).toEqual([
        "covers/chart-1/abc-old.png",
        "covers/chart-1/thumb-old.webp",
      ]);
    });

    it("keeps the old thumbnail when regeneration throws", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/abc-old.png",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
      mockGenerateThumbnail.mockRejectedValueOnce(new Error("R2 down"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await updateChart("chart-1", {
        ...validFormData,
        chart: {
          ...validFormData.chart,
          coverImageUrl: "covers/chart-1/abc-new.png",
          coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        },
      });

      assertSuccess(result);
      expect(discardedKeys()).toEqual(["covers/chart-1/abc-old.png"]);
      consoleSpy.mockRestore();
    });
  });
});
