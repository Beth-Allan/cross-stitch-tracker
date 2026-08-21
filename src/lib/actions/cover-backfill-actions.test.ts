/**
 * The one-off conversion of the covers already in the library (item P16). Both
 * exports are callable POST endpoints, so each carries its own unauthenticated
 * proof, and the conversion is exercised through the real
 * `cover-optimization` helper — the ordering it guarantees (the row stops naming
 * an object before that object is deleted) is the point of the item.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, assertSuccess, assertFailure } from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
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

const PRE_P15_CHART = {
  id: "chart-1",
  name: "Winter Robin",
  coverImageUrl: "covers/unsaved/abc-phone-photo.jpg",
  coverThumbnailUrl: "covers/unsaved/thumb-abc.webp",
  project: { userId: "user-1" },
};

/** The keys the cleanup helper was actually asked to act on; absent ones arrive as `null`. */
function discardedKeys(): unknown[] {
  const call = mockDiscardStoredObjects.mock.calls.at(-1);
  return call ? (call[0] as unknown[]).filter(Boolean) : [];
}

describe("getCoversNeedingOptimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("throws Unauthorized when the caller is not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { getCoversNeedingOptimization } = await import("./cover-backfill-actions");

    await expect(getCoversNeedingOptimization()).rejects.toThrow("Unauthorized");
    expect(mockPrisma.chart.findMany).not.toHaveBeenCalled();
  });

  it("asks only for the caller's own charts that have a cover", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getCoversNeedingOptimization } = await import("./cover-backfill-actions");

    await getCoversNeedingOptimization();

    const where = mockPrisma.chart.findMany.mock.calls[0][0].where;
    expect(where.project).toEqual({ userId: "user-1" });
    expect(where.coverImageUrl).toEqual({ not: null });
  });

  it("returns the charts still on an unconverted cover and leaves out the converted ones", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([
      PRE_P15_CHART,
      {
        id: "chart-2",
        name: "Already Done",
        coverImageUrl: "covers/chart-2/opt-x.webp",
        coverThumbnailUrl: "covers/chart-2/thumb-x.webp",
      },
      {
        id: "chart-3",
        name: "Legacy Key",
        coverImageUrl: "https://example.com/old.jpg",
        coverThumbnailUrl: null,
      },
    ]);
    const { getCoversNeedingOptimization } = await import("./cover-backfill-actions");

    const result = await getCoversNeedingOptimization();

    assertSuccess(result);
    expect(result.charts).toEqual([
      { id: "chart-1", name: "Winter Robin" },
      { id: "chart-3", name: "Legacy Key" },
    ]);
  });
});

describe("optimizeExistingCover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockProcessAndStoreImage.mockResolvedValue(OPTIMIZED);
    mockPrisma.chart.update.mockResolvedValue({ id: "chart-1" });
    mockPrisma.chart.findMany.mockResolvedValue([]);
  });

  it("throws Unauthorized when the caller is not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    await expect(optimizeExistingCover("chart-1")).rejects.toThrow("Unauthorized");
    expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
  });

  it("refuses a chart that is not the caller's, without reading a single object", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      ...PRE_P15_CHART,
      project: { userId: "someone-else" },
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    expect(mockPrisma.chart.update).not.toHaveBeenCalled();
  });

  it("refuses a chart that does not exist", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(null);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(result.cause).toBe("chart");
    expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
  });

  it("reports a chart with no cover instead of processing one", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      ...PRE_P15_CHART,
      coverImageUrl: null,
      coverThumbnailUrl: null,
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
  });

  it("skips a cover that is already converted, re-encoding nothing", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      id: "chart-1",
      name: "Already Done",
      coverImageUrl: "covers/chart-1/opt-old.webp",
      coverThumbnailUrl: "covers/chart-1/thumb-old.webp",
      project: { userId: "user-1" },
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertSuccess(result);
    expect(result.status).toBe("skipped");
    expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    expect(mockDiscardStoredObjects).not.toHaveBeenCalled();
  });

  it("passes the pipeline exactly the key the row records", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    await optimizeExistingCover("chart-1");

    expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
      "chart-1",
      "covers/unsaved/abc-phone-photo.jpg",
      "covers",
    );
  });

  it("points the row at both derivatives", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertSuccess(result);
    expect(result.status).toBe("converted");
    expect(mockPrisma.chart.update).toHaveBeenCalledWith({
      where: { id: "chart-1" },
      data: {
        coverImageUrl: "covers/chart-1/opt-new.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-new.webp",
      },
    });
  });

  it("deletes the original and its old thumbnail only after the row has stopped naming them", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    await optimizeExistingCover("chart-1");

    expect(discardedKeys()).toEqual([
      "covers/unsaved/abc-phone-photo.jpg",
      "covers/unsaved/thumb-abc.webp",
    ]);
    expect(mockPrisma.chart.update.mock.invocationCallOrder[0]).toBeLessThan(
      mockDiscardStoredObjects.mock.invocationCallOrder[0],
    );
  });

  it("keeps a superseded key that another chart's row still names, rather than deleting its cover", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    mockPrisma.chart.findMany.mockResolvedValueOnce([
      { coverImageUrl: "covers/unsaved/abc-phone-photo.jpg", coverThumbnailUrl: null },
    ]);
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    await optimizeExistingCover("chart-1");

    expect(discardedKeys()).toEqual(["covers/unsaved/thumb-abc.webp"]);
  });

  it("leaves the row alone and reports the chart in words Beth can read when the picture is gone", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    mockProcessAndStoreImage.mockResolvedValueOnce({
      success: false,
      error: "Original image not found in storage",
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(result.error).toBe("its photo is no longer in storage");
    expect(result.cause).toBe("chart");
    expect(mockPrisma.chart.update).not.toHaveBeenCalled();
    expect(mockDiscardStoredObjects).not.toHaveBeenCalled();
  });

  it("never hands back an internal message for a reason it does not recognise", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    mockProcessAndStoreImage.mockResolvedValueOnce({
      success: false,
      error: "Invalid storage key",
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(result.error).not.toMatch(/storage key/i);
    expect(result.error).toMatch(/photo/i);
    expect(result.cause).toBe("chart");
  });

  it("leaves the row alone when the pipeline throws", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    mockProcessAndStoreImage.mockRejectedValueOnce(new Error("R2 unreachable"));
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(result.cause).toBe("unknown");
    expect(mockPrisma.chart.update).not.toHaveBeenCalled();
    expect(mockDiscardStoredObjects).not.toHaveBeenCalled();
  });

  it("does not blame the chart for a failure nothing about the chart explains", async () => {
    // The generic pipeline failure is what a broken bucket or a denied credential
    // flattens to, so the caller must be able to tell it from "this picture is
    // gone" — five of these in a row mean storage, five of those mean five charts.
    mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
    mockProcessAndStoreImage.mockResolvedValueOnce({
      success: false,
      error: "Failed to process image",
    });
    const { optimizeExistingCover } = await import("./cover-backfill-actions");

    const result = await optimizeExistingCover("chart-1");

    assertFailure(result);
    expect(result.cause).toBe("unknown");
    expect(result.error).toBe("its photo could not be shrunk this time");
  });

  describe("cache invalidation", () => {
    it("optimizeExistingCover calls revalidateTag('stats') after a successful conversion", async () => {
      mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
      const { optimizeExistingCover } = await import("./cover-backfill-actions");
      const { revalidateTag } = await import("next/cache");

      const result = await optimizeExistingCover("chart-1");

      assertSuccess(result);
      expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("stats", { expire: 0 });
    });

    it("optimizeExistingCover does not invalidate when the conversion fails", async () => {
      mockPrisma.chart.findUnique.mockResolvedValueOnce(PRE_P15_CHART);
      mockProcessAndStoreImage.mockResolvedValueOnce({ success: false, error: "nope" });
      const { optimizeExistingCover } = await import("./cover-backfill-actions");
      const { revalidateTag } = await import("next/cache");

      assertFailure(await optimizeExistingCover("chart-1"));
      expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled();
    });
  });
});
