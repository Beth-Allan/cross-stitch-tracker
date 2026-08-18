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

const mockProcessAndStoreImage = vi.fn();
vi.mock("@/lib/actions/upload-actions", () => ({
  processAndStoreImage: (...args: unknown[]) => mockProcessAndStoreImage(...args),
}));

const mockDiscardStoredObjects = vi.fn();
vi.mock("@/lib/r2", () => ({
  discardStoredObjects: (...args: unknown[]) => mockDiscardStoredObjects(...args),
}));

const OPTIMIZED = {
  success: true,
  optimizedKey: "covers/chart-1/opt-new.webp",
  thumbnailKey: "covers/chart-1/thumb-new.webp",
};

/**
 * The keys the cleanup helper will actually act on from the most recent call.
 * Absent keys reach it as `null` by design, so they are not part of the subject.
 */
function discardedKeys(): unknown[] {
  const call = mockDiscardStoredObjects.mock.calls.at(-1);
  return call ? (call[0] as unknown[]).filter(Boolean) : [];
}

/** Every key the cleanup helper was asked to act on, across all of its calls. */
function allDiscardedKeys(): unknown[] {
  return mockDiscardStoredObjects.mock.calls.flatMap((call) =>
    (call[0] as unknown[]).filter(Boolean),
  );
}

/** The cover key the row was created with, which the pipeline's key pin requires it to match. */
function coverKeyOnCreate(): unknown {
  const call = mockPrisma.chart.create.mock.calls.at(-1);
  return call ? (call[0] as { data: { coverImageUrl: unknown } }).data.coverImageUrl : undefined;
}

/**
 * The cover keys written back to the row. `updateChart` also writes the form's
 * own fields inside its transaction, so the cover write is the later one.
 */
function coverKeysWritten(): unknown {
  const call = mockPrisma.chart.update.mock.calls.at(-1);
  return call ? (call[0] as { data: unknown }).data : undefined;
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

describe("chart-actions cover optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessAndStoreImage.mockResolvedValue(OPTIMIZED);
    mockDiscardStoredObjects.mockResolvedValue(undefined);
    mockPrisma.chart.update.mockResolvedValue({ id: "chart-1" });
    // Support interactive transactions (function arg) and batch transactions (array arg)
    mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function")
        return (fnOrArray as (tx: typeof mockPrisma) => unknown)(mockPrisma);
      return fnOrArray;
    });
  });

  describe("createChart", () => {
    it("puts a new cover through the shared image pipeline", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      await createChart(formData);

      expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
        "new-chart-id",
        "covers/unsaved/abc.png",
        "covers",
      );
    });

    it("records the optimized cover and its thumbnail on the chart", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockProcessAndStoreImage.mockResolvedValueOnce({
        success: true,
        optimizedKey: "covers/new-chart-id/opt-abc.webp",
        thumbnailKey: "covers/new-chart-id/thumb-abc.webp",
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      await createChart(formData);

      expect(mockPrisma.chart.update).toHaveBeenCalledWith({
        where: { id: "new-chart-id" },
        data: {
          coverImageUrl: "covers/new-chart-id/opt-abc.webp",
          coverThumbnailUrl: "covers/new-chart-id/thumb-abc.webp",
        },
      });
    });

    it("deletes the raw upload only after the row names the optimized copy", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      await createChart(formData);

      expect(discardedKeys()).toEqual(["covers/unsaved/abc.png"]);
      // Deleting first would leave the chart pointing at an object that is gone.
      expect(mockPrisma.chart.update.mock.invocationCallOrder[0]).toBeLessThan(
        mockDiscardStoredObjects.mock.invocationCallOrder[0],
      );
    });

    it("hands the pipeline exactly the key the new row records", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      await createChart(formData);

      // `processAndStoreImage` refuses a key the row does not already record, so the
      // two must be the same value or every new cover silently stops being optimized.
      expect(mockProcessAndStoreImage.mock.calls[0][1]).toBe(coverKeyOnCreate());
    });

    it("still saves the chart with a warning when recording the optimized cover fails", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockPrisma.chart.update.mockRejectedValueOnce(new Error("connection lost"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      const result = await createChart(formData);

      // The chart itself is already committed; reporting failure would have Beth
      // save a second copy of it.
      assertSuccess(result);
      expect(result.warning).toBe("Cover photo saved, but a smaller copy could not be made");
      consoleSpy.mockRestore();
    });

    it("drops the derivatives nothing will ever name when recording them fails", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockPrisma.chart.update.mockRejectedValueOnce(new Error("connection lost"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      await createChart(formData);

      // They are stored and named here and nowhere else — this is the only moment
      // anything can still name them. The raw upload stays: the row still names it.
      expect(allDiscardedKeys()).toEqual([
        "covers/chart-1/opt-new.webp",
        "covers/chart-1/thumb-new.webp",
      ]);
      consoleSpy.mockRestore();
    });

    it("does NOT optimize when no cover was uploaded", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      await createChart(validFormData);

      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
      expect(discardedKeys()).toEqual([]);
    });

    it("keeps the raw upload as the cover when optimization throws", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockProcessAndStoreImage.mockRejectedValueOnce(new Error("R2 down"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      const result = await createChart(formData);

      assertSuccess(result);
      expect(result.warning).toBe("Cover photo saved, but a smaller copy could not be made");
      expect(mockPrisma.chart.update).not.toHaveBeenCalled();
      expect(discardedKeys()).toEqual([]);
      consoleSpy.mockRestore();
    });

    it("keeps the raw upload as the cover when optimization reports failure without throwing", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });
      mockProcessAndStoreImage.mockResolvedValueOnce({ success: false, error: "Failed" });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      const result = await createChart(formData);

      assertSuccess(result);
      expect(result.warning).toBe("Cover photo saved, but a smaller copy could not be made");
      expect(discardedKeys()).toEqual([]);
      consoleSpy.mockRestore();
    });

    it("returns no warning when optimization succeeds", async () => {
      const { createChart } = await import("./chart-actions");
      mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-id" });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/unsaved/abc.png" },
      };

      const result = await createChart(formData);

      assertSuccess(result);
      expect(result.warning).toBeUndefined();
    });
  });

  describe("updateChart", () => {
    it("puts a replacement cover through the shared image pipeline", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        project: { userId: "user-1" },
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      await updateChart("chart-1", formData);

      expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
        "chart-1",
        "covers/chart-1/abc-new.png",
        "covers",
      );
    });

    it("records the optimized cover and its thumbnail on the chart", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      await updateChart("chart-1", formData);

      expect(coverKeysWritten()).toEqual({
        coverImageUrl: "covers/chart-1/opt-new.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-new.webp",
      });
    });

    it("hands the pipeline exactly the key the updated row records", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      await updateChart("chart-1", formData);

      const written = mockPrisma.chart.update.mock.calls[0][0] as {
        data: { coverImageUrl: unknown };
      };
      expect(mockProcessAndStoreImage.mock.calls[0][1]).toBe(written.data.coverImageUrl);
    });

    it("still saves the chart with a warning when recording the optimized cover fails", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockPrisma.chart.update
        .mockResolvedValueOnce({ id: "chart-1" })
        .mockRejectedValueOnce(new Error("connection lost"));
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
      expect(result.warning).toBe("Cover photo saved, but a smaller copy could not be made");
      // The unrecorded derivatives go; the raw upload and the old thumbnail stay,
      // because the row still names both.
      expect(allDiscardedKeys()).toEqual([
        "covers/chart-1/opt-new.webp",
        "covers/chart-1/thumb-new.webp",
        "covers/chart-1/opt-old.webp",
      ]);
      consoleSpy.mockRestore();
    });

    it("never deletes a submitted cover key that belongs to another chart", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });

      // The form only ever submits this chart's own fresh upload. A direct call can
      // submit any well-formed covers key, and that key is another chart's live cover.
      const result = await updateChart("chart-1", {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-2/opt-live.webp" },
      });

      assertSuccess(result);
      expect(allDiscardedKeys()).not.toContain("covers/chart-2/opt-live.webp");
      expect(discardedKeys()).toEqual([
        "covers/chart-1/opt-old.webp",
        "covers/chart-1/thumb-old.webp",
      ]);
    });

    it("does NOT optimize when the cover is unchanged", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-same.webp",
        project: { userId: "user-1" },
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/opt-same.webp" },
      };

      await updateChart("chart-1", formData);

      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    });

    it("does NOT optimize when the chart has never had a cover", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: null,
        project: { userId: "user-1" },
      });

      await updateChart("chart-1", validFormData);

      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    });

    it("removes the raw upload and both superseded objects once the row names the new pair", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });

      const formData = {
        ...validFormData,
        chart: { ...validFormData.chart, coverImageUrl: "covers/chart-1/abc-new.png" },
      };

      const result = await updateChart("chart-1", formData);

      assertSuccess(result);
      expect(discardedKeys()).toEqual([
        "covers/chart-1/opt-old.webp",
        "covers/chart-1/thumb-old.webp",
        "covers/chart-1/abc-new.png",
      ]);
      expect(mockPrisma.chart.update.mock.invocationCallOrder.at(-1)!).toBeLessThan(
        mockDiscardStoredObjects.mock.invocationCallOrder[0],
      );
    });

    it("keeps the raw upload and the old thumbnail when optimization reports failure", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockProcessAndStoreImage.mockResolvedValueOnce({ success: false, error: "Failed" });
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
      expect(result.warning).toBe("Cover photo saved, but a smaller copy could not be made");
      expect(discardedKeys()).toEqual(["covers/chart-1/opt-old.webp"]);
      consoleSpy.mockRestore();
    });

    it("keeps the raw upload and the old thumbnail when optimization throws", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });
      mockProcessAndStoreImage.mockRejectedValueOnce(new Error("R2 down"));
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
      expect(discardedKeys()).toEqual(["covers/chart-1/opt-old.webp"]);
      consoleSpy.mockRestore();
    });

    it("removes both objects when the cover is taken off the chart", async () => {
      const { updateChart } = await import("./chart-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        coverImageUrl: "covers/chart-1/opt-old.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
        project: { id: "project-1", userId: "user-1" },
      });

      // Removing the cover clears both fields on the form, so the row ends up
      // naming neither object.
      const result = await updateChart("chart-1", validFormData);

      assertSuccess(result);
      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
      expect(discardedKeys()).toEqual([
        "covers/chart-1/opt-old.webp",
        "covers/chart-1/thumb-old.webp",
      ]);
    });
  });
});
