import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, assertSuccess, assertFailure } from "@/__tests__/mocks";

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

/** The chart row `deleteChart` reads before the cascade destroys it. */
function chartWithObjects(overrides: Record<string, unknown> = {}) {
  return {
    coverImageUrl: "covers/unsaved/raw-cover.png",
    coverThumbnailUrl: "covers/chart-1/thumb-abc.webp",
    files: [{ url: "files/chart-1/pattern.pdf" }, { url: "files/chart-1/floss.xsd" }],
    project: {
      userId: "user-1",
      sessions: [
        { photoKey: "sessions/session-1/opt-one.webp" },
        { photoKey: "sessions/session-2/opt-two.webp" },
        { photoKey: null },
      ],
    },
    ...overrides,
  };
}

/** The keys handed to the cleanup helper on the most recent call. */
function discardedKeys(): unknown {
  return mockDiscardStoredObjects.mock.calls.at(-1)?.[0];
}

describe("deleteChart storage cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDiscardStoredObjects.mockResolvedValue(undefined);
  });

  it("removes the cover, the thumbnail, every chart file and every session photo", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(chartWithObjects());
    mockPrisma.chart.delete.mockResolvedValueOnce({ id: "chart-1" });
    const { deleteChart } = await import("./chart-actions");

    const result = await deleteChart("chart-1");

    assertSuccess(result);
    expect(discardedKeys()).toEqual([
      "covers/unsaved/raw-cover.png",
      "covers/chart-1/thumb-abc.webp",
      "files/chart-1/pattern.pdf",
      "files/chart-1/floss.xsd",
      "sessions/session-1/opt-one.webp",
      "sessions/session-2/opt-two.webp",
    ]);
  });

  it("reads the keys before the row that holds them is deleted", async () => {
    const order: string[] = [];
    mockPrisma.chart.findUnique.mockImplementationOnce(async () => {
      order.push("read");
      return chartWithObjects();
    });
    mockPrisma.chart.delete.mockImplementationOnce(async () => {
      order.push("delete-row");
      return { id: "chart-1" };
    });
    mockDiscardStoredObjects.mockImplementationOnce(async () => {
      order.push("delete-objects");
    });
    const { deleteChart } = await import("./chart-actions");

    assertSuccess(await deleteChart("chart-1"));
    expect(order).toEqual(["read", "delete-row", "delete-objects"]);
  });

  it("removes nothing when the chart belongs to someone else", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce(
      chartWithObjects({ project: { userId: "someone-else", sessions: [] } }),
    );
    const { deleteChart } = await import("./chart-actions");

    assertFailure(await deleteChart("chart-1"));
    expect(mockPrisma.chart.delete).not.toHaveBeenCalled();
    expect(mockDiscardStoredObjects).not.toHaveBeenCalled();
  });

  it("skips the cleanup call for a chart that owns no objects", async () => {
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      coverImageUrl: null,
      coverThumbnailUrl: null,
      files: [],
      project: { userId: "user-1", sessions: [] },
    });
    mockPrisma.chart.delete.mockResolvedValueOnce({ id: "chart-1" });
    const { deleteChart } = await import("./chart-actions");

    assertSuccess(await deleteChart("chart-1"));
    expect(mockDiscardStoredObjects).not.toHaveBeenCalled();
  });
});
