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

const mockSend = vi.fn();
const mockGetR2Client = vi.fn();
vi.mock("@/lib/r2", () => ({
  getR2Client: (...args: unknown[]) => mockGetR2Client(...args),
  R2_BUCKET_NAME: "test-bucket",
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));

const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from("processed-image-data"));
const mockWebp = vi.fn().mockReturnValue({ toBuffer: mockToBuffer });
const mockResize = vi.fn().mockReturnValue({ webp: mockWebp });
const mockSharp = vi.fn().mockReturnValue({ resize: mockResize });
vi.mock("sharp", () => ({ default: mockSharp }));

vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

describe("upload-actions failure modes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset implementation queues (clearAllMocks only clears call history, not mockOnce queues)
    mockSend.mockReset();
    mockSharp.mockReset();
    mockResize.mockReset();
    mockWebp.mockReset();
    mockToBuffer.mockReset();
    // Restore default implementations
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
    mockSharp.mockReturnValue({ resize: mockResize });
    mockResize.mockReturnValue({ webp: mockWebp });
    mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(Buffer.from("processed-image-data"));
  });

  describe("getPresignedUploadUrl", () => {
    it("returns error for invalid image type on covers category", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({
        fileName: "test.exe",
        contentType: "application/x-msdownload",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid image type");
      }
    });

    it("returns error for invalid image type on sessions category", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({
        fileName: "document.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        category: "sessions",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid image type");
      }
    });

    it("returns error for invalid file type on files category", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({
        fileName: "test.exe",
        contentType: "application/x-msdownload",
        fileSize: 1024,
        category: "files",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid file type");
      }
    });

    it("returns error when R2 is not configured", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedUploadUrl({
        fileName: "photo.png",
        contentType: "image/png",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not configured");
      }
    });

    it("returns validation-specific message on Zod validation failure (not 'storage not configured')", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        // Must NOT say "storage not configured" for a validation error
        expect(result.error).not.toContain("not configured");
      }
    });

    it("returns generic error and logs console.error on unexpected R2 error", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("Unexpected S3 timeout"));

      const result = await getPresignedUploadUrl({
        fileName: "photo.png",
        contentType: "image/png",
        fileSize: 1024,
        category: "covers",
        projectId: "p1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).not.toContain("not configured");
        expect(result.error).toBe("Failed to generate upload URL");
      }
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("returns 'not configured' error when R2 is not configured", async () => {
      const { getPresignedDownloadUrl } = await import("./upload-actions");
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedDownloadUrl("some-key");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not configured");
      }
    });

    it("returns generic error and logs on unexpected R2 error", async () => {
      const { getPresignedDownloadUrl } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("Unexpected timeout"));

      const result = await getPresignedDownloadUrl("some-key");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).not.toContain("not configured");
        expect(result.error).toBe("Failed to generate download URL");
      }
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("confirmUpload", () => {
    it("returns error for invalid field name", async () => {
      const { confirmUpload } = await import("./upload-actions");

      const result = await confirmUpload({
        chartId: "c1",
        field: "hackerField",
        key: "k1",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid field");
      }
    });

    it("returns error on DB failure during update", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "c1",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockRejectedValueOnce(new Error("DB error"));

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverImageUrl",
        key: "k1",
      });

      expect(result).toEqual({ success: false, error: "Failed to confirm upload" });
    });

    it("triggers processAndStoreImage for coverImageUrl and updates DB with optimized keys", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "c1",
        project: { userId: "user-1" },
      });
      // First call: initial DB update with raw key
      mockPrisma.chart.update.mockResolvedValue({});
      // Mock R2 to return an image body for processAndStoreImage
      const mockBody = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("fake-image-data");
        },
      };
      mockSend
        .mockResolvedValueOnce({ Body: mockBody }) // GetObjectCommand (fetch original)
        .mockResolvedValueOnce({}) // PutObjectCommand (upload optimized)
        .mockResolvedValueOnce({}) // PutObjectCommand (upload thumbnail)
        .mockResolvedValueOnce({}); // DeleteObjectCommand (delete raw)

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverImageUrl",
        key: "covers/c1/raw-image.png",
      });

      expect(result.success).toBe(true);
      // DB should be updated with optimized key (second call updates with processed keys)
      const updateCalls = mockPrisma.chart.update.mock.calls;
      expect(updateCalls.length).toBeGreaterThanOrEqual(2);
      // Second update should have optimized keys containing .webp
      const secondUpdate = updateCalls[1][0];
      expect(secondUpdate.data.coverImageUrl).toContain(".webp");
      expect(secondUpdate.data.coverThumbnailUrl).toContain("thumb-");
    });

    it("still succeeds when processAndStoreImage fails (graceful fallback with raw image)", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "c1",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValue({});
      // R2 GetObject fails -- processAndStoreImage will fail
      mockSend.mockRejectedValueOnce(new Error("R2 fetch failed"));

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverImageUrl",
        key: "covers/c1/raw-image.png",
      });

      // Upload still confirmed -- raw key preserved in DB
      expect(result.success).toBe(true);
    });

    it("does NOT trigger processAndStoreImage for coverThumbnailUrl", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "c1",
        project: { userId: "user-1" },
      });
      mockPrisma.chart.update.mockResolvedValue({});

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverThumbnailUrl",
        key: "covers/c1/thumb-existing.webp",
      });

      expect(result.success).toBe(true);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("rejects when chart does not exist", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce(null);

      const result = await confirmUpload({
        chartId: "nonexistent",
        field: "coverImageUrl",
        key: "covers/c1/image.png",
      });

      expect(result).toEqual({ success: false, error: "Chart not found" });
    });

    it("rejects when chart belongs to different user", async () => {
      const { confirmUpload } = await import("./upload-actions");
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "c1",
        project: { userId: "other-user" },
      });

      const result = await confirmUpload({
        chartId: "c1",
        field: "coverImageUrl",
        key: "covers/c1/image.png",
      });

      expect(result).toEqual({ success: false, error: "Chart not found" });
    });
  });

  describe("processAndStoreImage", () => {
    it("produces optimized and thumbnail WebP, uploads both to R2, returns keys without deleting raw", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      const mockBody = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("fake-image-data");
        },
      };
      mockSend
        .mockResolvedValueOnce({ Body: mockBody }) // GetObjectCommand
        .mockResolvedValueOnce({}) // PutObjectCommand (optimized)
        .mockResolvedValueOnce({}); // PutObjectCommand (thumbnail)

      const result = await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.optimizedKey).toContain(".webp");
        expect(result.optimizedKey).toContain("opt-");
        expect(result.thumbnailKey).toContain(".webp");
        expect(result.thumbnailKey).toContain("thumb-");
      }
      // 3 R2 calls: 1 get + 2 puts (no delete — caller's responsibility)
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it("calls sharp with correct resize params for optimized version (1200px width)", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      const mockBody = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("fake-image-data");
        },
      };
      mockSend
        .mockResolvedValueOnce({ Body: mockBody })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      // First sharp call: optimized (1200, null, { withoutEnlargement: true })
      expect(mockResize).toHaveBeenCalledWith(1200, null, { withoutEnlargement: true });
      // Second sharp call: thumbnail (400, 400, { fit: "cover", withoutEnlargement: true })
      expect(mockResize).toHaveBeenCalledWith(400, 400, { fit: "cover", withoutEnlargement: true });
      // Both should call webp with quality 80
      expect(mockWebp).toHaveBeenCalledWith({ quality: 80 });
    });

    it("returns error when R2 GetObject fails (original not found)", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      mockSend.mockRejectedValueOnce(new Error("NoSuchKey"));

      const result = await processAndStoreImage("chart-1", "covers/chart-1/missing.png", "covers");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("returns error when response.Body is null", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      mockSend.mockResolvedValueOnce({ Body: null });

      const result = await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Original image not found in storage");
      }
    });

    it("returns error when Sharp processing throws and does NOT delete original", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      const mockBody = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("fake-image-data");
        },
      };
      mockSend.mockResolvedValueOnce({ Body: mockBody }); // GetObjectCommand succeeds
      // Sharp throws during processing
      mockSharp.mockImplementationOnce(() => {
        throw new Error("Sharp decode error: unsupported format");
      });

      const result = await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      expect(result.success).toBe(false);
      // Only 1 R2 call (get), no delete since processing failed
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("does not delete raw original (caller responsibility)", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      const mockBody = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("fake-image-data");
        },
      };
      mockSend
        .mockResolvedValueOnce({ Body: mockBody })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      // Get + 2 Puts = 3. A Delete would make it 4.
      expect(mockSend).toHaveBeenCalledTimes(3);
    });
  });

  describe("deleteFile", () => {
    it("returns error when R2 send fails", async () => {
      const { deleteFile } = await import("./upload-actions");
      mockSend.mockRejectedValueOnce(new Error("R2 send failed"));

      const result = await deleteFile("some-key");

      expect(result).toEqual({ success: false, error: "Failed to delete file" });
    });
  });

  describe("getPresignedImageUrls", () => {
    it("returns empty record for empty array", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");

      const result = await getPresignedImageUrls([]);

      expect(result).toEqual({});
    });

    it("filters out null and undefined keys", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      vi.mocked(getSignedUrl).mockResolvedValueOnce("https://presigned.example.com/key1");

      const result = await getPresignedImageUrls([null, undefined, "", "key1"]);

      expect(result).toEqual({ key1: "https://presigned.example.com/key1" });
      // getSignedUrl should only be called once (for "key1"), not for nulls/empties
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("returns presigned URLs for valid keys", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      vi.mocked(getSignedUrl)
        .mockResolvedValueOnce("https://presigned.example.com/key1")
        .mockResolvedValueOnce("https://presigned.example.com/key2");

      const result = await getPresignedImageUrls(["key1", "key2"]);

      expect(result).toEqual({
        key1: "https://presigned.example.com/key1",
        key2: "https://presigned.example.com/key2",
      });
    });

    it("deduplicates keys", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      vi.mocked(getSignedUrl).mockResolvedValueOnce("https://presigned.example.com/key1");

      const result = await getPresignedImageUrls(["key1", "key1", "key1"]);

      expect(result).toEqual({ key1: "https://presigned.example.com/key1" });
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("handles partial failures gracefully (returns successful results only)", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(getSignedUrl)
        .mockResolvedValueOnce("https://presigned.example.com/good-key")
        .mockRejectedValueOnce(new Error("S3 error for bad-key"));

      const result = await getPresignedImageUrls(["good-key", "bad-key"]);

      expect(result).toEqual({ "good-key": "https://presigned.example.com/good-key" });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("returns empty record when R2 is not configured (graceful degradation)", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedImageUrls(["key1"]);

      expect(result).toEqual({});
      consoleSpy.mockRestore();
    });
  });
});
