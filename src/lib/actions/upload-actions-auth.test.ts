/**
 * Every export of a `"use server"` file is a callable POST endpoint, so each one
 * needs its own proof that an unauthenticated caller gets nothing. The sibling
 * `chart-file-actions-auth.test.ts` covered its file; this one covers the upload
 * actions, whose exports act on caller-supplied object keys.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Auth returns null (unauthenticated) for all tests in this file
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSend = vi.fn();
const mockGetR2Client = vi.fn(() => ({ send: mockSend }));
vi.mock("@/lib/r2", () => ({
  getReadTarget: async () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
  getWriteTarget: () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("sharp", () => ({ default: vi.fn() }));
vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

describe("upload-actions unauthenticated rejection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPresignedUploadUrl throws Unauthorized when caller is not authenticated", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    await expect(
      getPresignedUploadUrl({
        fileName: "cover.png",
        contentType: "image/png",
        fileSize: 1024,
        category: "covers",
        projectId: "chart-1",
      }),
    ).rejects.toThrow("Unauthorized");

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("getPresignedDownloadUrl throws Unauthorized when caller is not authenticated", async () => {
    const { getPresignedDownloadUrl } = await import("./upload-actions");

    await expect(getPresignedDownloadUrl("files/chart-1/abc-pattern.pdf")).rejects.toThrow(
      "Unauthorized",
    );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("getPresignedImageUrls throws Unauthorized when caller is not authenticated", async () => {
    const { getPresignedImageUrls } = await import("./upload-actions");

    await expect(getPresignedImageUrls(["covers/chart-1/thumb-abc.webp"])).rejects.toThrow(
      "Unauthorized",
    );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("deleteFile throws Unauthorized when caller is not authenticated", async () => {
    const { deleteFile } = await import("./upload-actions");

    await expect(deleteFile("covers/chart-1/opt-abc.webp")).rejects.toThrow("Unauthorized");

    // Nothing may reach R2 — this is the export that removes objects.
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage throws Unauthorized when caller is not authenticated", async () => {
    const { processAndStoreImage } = await import("./upload-actions");

    await expect(
      processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers"),
    ).rejects.toThrow("Unauthorized");

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockPrisma.chart.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.chart.update).not.toHaveBeenCalled();
  });
});
