import { describe, expect, it, vi, beforeEach } from "vitest";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createMockPrisma, assertSuccess, assertFailure } from "@/__tests__/mocks";
import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_CHART_FILE_TYPES,
  ALLOWED_CHART_FILE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  uploadRequestSchema,
} from "@/lib/validations/upload";

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
  getReadTarget: async () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
  getWriteTarget: () => ({ client: mockGetR2Client(), bucket: "test-bucket" }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));

const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from("processed-image-data"));
const mockWebp = vi.fn().mockReturnValue({ toBuffer: mockToBuffer });
const mockResize = vi.fn().mockReturnValue({ webp: mockWebp });
const mockMetadata = vi.fn().mockResolvedValue({ format: "png", width: 800, height: 600 });
const mockSharp = vi.fn().mockReturnValue({ resize: mockResize, metadata: mockMetadata });
vi.mock("sharp", () => ({ default: mockSharp }));

vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

type SentCommand = { name: string; Bucket: string; Key: string };

/** Every S3 command the action issued, by type and by the object it addressed. */
function sentCommands(): SentCommand[] {
  return mockSend.mock.calls.map(([command]) => ({
    name: (command as { constructor: { name: string } }).constructor.name,
    Bucket: (command as { input: { Bucket: string } }).input.Bucket,
    Key: (command as { input: { Key: string } }).input.Key,
  }));
}

function presignedKeys(): string[] {
  return vi
    .mocked(getSignedUrl)
    .mock.calls.map((call) => (call[1] as unknown as { input: { Key: string } }).input.Key);
}

function imageResponse(body = "fake-image-data") {
  return {
    ContentLength: body.length,
    Body: {
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from(body);
      },
    },
  };
}

describe("upload-actions failure modes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset implementation queues (clearAllMocks only clears call history, not mockOnce queues)
    mockSend.mockReset();
    mockSharp.mockReset();
    mockResize.mockReset();
    mockWebp.mockReset();
    mockToBuffer.mockReset();
    mockMetadata.mockReset();
    // Restore default implementations
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
    mockSharp.mockReturnValue({ resize: mockResize, metadata: mockMetadata });
    mockMetadata.mockResolvedValue({ format: "png", width: 800, height: 600 });
    mockResize.mockReturnValue({ webp: mockWebp });
    mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(Buffer.from("processed-image-data"));
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/raw.png",
      project: { userId: "user-1" },
    });
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

      assertFailure(result);
      expect(result.error).toContain("Invalid image type");
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

      assertFailure(result);
      expect(result.error).toContain("Invalid image type");
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

      assertFailure(result);
      expect(result.error).toContain("Invalid file type");
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

      assertFailure(result);
      expect(result.error).toContain("not configured");
    });

    it("returns validation-specific message on Zod validation failure (not 'storage not configured')", async () => {
      const { getPresignedUploadUrl } = await import("./upload-actions");

      const result = await getPresignedUploadUrl({});

      assertFailure(result);
      expect(typeof result.error).toBe("string");
      // Must NOT say "storage not configured" for a validation error
      expect(result.error).not.toContain("not configured");
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

      assertFailure(result);
      expect(result.error).not.toContain("not configured");
      expect(result.error).toBe("Failed to generate upload URL");
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

      const result = await getPresignedDownloadUrl("files/chart-1/abc-pattern.pdf");

      assertFailure(result);
      expect(result.error).toContain("not configured");
    });

    it("returns generic error and logs on unexpected R2 error", async () => {
      const { getPresignedDownloadUrl } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("Unexpected timeout"));

      const result = await getPresignedDownloadUrl("files/chart-1/abc-pattern.pdf");

      assertFailure(result);
      expect(result.error).not.toContain("not configured");
      expect(result.error).toBe("Failed to generate download URL");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
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

      assertSuccess(result);
      expect(result.optimizedKey).toContain(".webp");
      expect(result.optimizedKey).toContain("opt-");
      expect(result.thumbnailKey).toContain(".webp");
      expect(result.thumbnailKey).toContain("thumb-");
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
      mockPrisma.chart.findUnique.mockResolvedValueOnce({
        id: "chart-1",
        coverImageUrl: "covers/chart-1/missing.png",
        project: { userId: "user-1" },
      });
      mockSend.mockRejectedValueOnce(new Error("NoSuchKey"));

      const result = await processAndStoreImage("chart-1", "covers/chart-1/missing.png", "covers");

      assertFailure(result);
      expect(result.error).toBeDefined();
    });

    it("returns error when response.Body is null", async () => {
      const { processAndStoreImage } = await import("./upload-actions");
      mockSend.mockResolvedValueOnce({ Body: null });

      const result = await processAndStoreImage("chart-1", "covers/chart-1/raw.png", "covers");

      assertFailure(result);
      expect(result.error).toBe("Original image not found in storage");
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

      const result = await deleteFile("files/chart-1/abc-pattern.pdf");

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

      const result = await getPresignedImageUrls([
        null,
        undefined,
        "",
        "covers/chart-1/thumb-key1.webp",
      ]);

      expect(result).toEqual({
        "covers/chart-1/thumb-key1.webp": "https://presigned.example.com/key1",
      });
      // getSignedUrl should only be called once (for "key1"), not for nulls/empties
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("returns presigned URLs for valid keys", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      vi.mocked(getSignedUrl)
        .mockResolvedValueOnce("https://presigned.example.com/key1")
        .mockResolvedValueOnce("https://presigned.example.com/key2");

      const result = await getPresignedImageUrls([
        "covers/chart-1/thumb-key1.webp",
        "covers/chart-2/thumb-key2.webp",
      ]);

      expect(result).toEqual({
        "covers/chart-1/thumb-key1.webp": "https://presigned.example.com/key1",
        "covers/chart-2/thumb-key2.webp": "https://presigned.example.com/key2",
      });
    });

    it("deduplicates keys", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      vi.mocked(getSignedUrl).mockResolvedValueOnce("https://presigned.example.com/key1");

      const result = await getPresignedImageUrls([
        "covers/chart-1/thumb-key1.webp",
        "covers/chart-1/thumb-key1.webp",
        "covers/chart-1/thumb-key1.webp",
      ]);

      expect(result).toEqual({
        "covers/chart-1/thumb-key1.webp": "https://presigned.example.com/key1",
      });
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it("handles partial failures gracefully (returns successful results only)", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(getSignedUrl)
        .mockResolvedValueOnce("https://presigned.example.com/good-key")
        .mockRejectedValueOnce(new Error("S3 error for bad-key"));

      const result = await getPresignedImageUrls([
        "covers/chart-1/thumb-good.webp",
        "covers/chart-2/thumb-bad.webp",
      ]);

      expect(result).toEqual({
        "covers/chart-1/thumb-good.webp": "https://presigned.example.com/good-key",
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("returns empty record when R2 is not configured (graceful degradation)", async () => {
      const { getPresignedImageUrls } = await import("./upload-actions");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockGetR2Client.mockImplementation(() => {
        throw new Error("R2 environment variables not configured");
      });

      const result = await getPresignedImageUrls(["covers/chart-1/thumb-key1.webp"]);

      expect(result).toEqual({});
      consoleSpy.mockRestore();
    });
  });
});

describe("upload validation constants", () => {
  it("MAX_FILE_SIZE is 50MB", () => {
    expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
  });

  it("accepts 50MB file in uploadRequestSchema", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "large-pattern.pdf",
      contentType: "application/pdf",
      fileSize: 50 * 1024 * 1024,
      category: "files",
      projectId: "p1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects file over 50MB", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "huge-file.pdf",
      contentType: "application/pdf",
      fileSize: 50 * 1024 * 1024 + 1,
      category: "files",
      projectId: "p1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("50MB");
    }
  });

  it("ALLOWED_FILE_TYPES includes zip MIME types", () => {
    expect(ALLOWED_FILE_TYPES).toContain("application/zip");
    expect(ALLOWED_FILE_TYPES).toContain("application/x-zip-compressed");
  });

  it("ALLOWED_CHART_FILE_TYPES includes zip MIME types", () => {
    expect(ALLOWED_CHART_FILE_TYPES).toContain("application/zip");
    expect(ALLOWED_CHART_FILE_TYPES).toContain("application/x-zip-compressed");
  });

  it("ALLOWED_CHART_FILE_EXTENSIONS includes .zip", () => {
    expect(ALLOWED_CHART_FILE_EXTENSIONS).toContain(".zip");
  });

  it("ALLOWED_IMAGE_TYPES does NOT include zip", () => {
    expect(ALLOWED_IMAGE_TYPES).not.toContain("application/zip");
    expect(ALLOWED_IMAGE_TYPES).not.toContain("application/x-zip-compressed");
  });
});

describe("upload action zip type enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
  });

  it("accepts zip content type for files category", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "patterns.zip",
      contentType: "application/zip",
      fileSize: 1024,
      category: "files",
      projectId: "p1",
    });

    assertSuccess(result);
    expect(result.url).toBeDefined();
  });

  it("rejects zip content type for covers category", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "patterns.zip",
      contentType: "application/zip",
      fileSize: 1024,
      category: "covers",
      projectId: "p1",
    });

    assertFailure(result);
    expect(result.error).toContain("Invalid image type");
  });

  it("rejects zip content type for sessions category", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "patterns.zip",
      contentType: "application/zip",
      fileSize: 1024,
      category: "sessions",
      projectId: "p1",
    });

    assertFailure(result);
    expect(result.error).toContain("Invalid image type");
  });
});

describe("upload-actions object key discipline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
    vi.mocked(getSignedUrl).mockResolvedValue("https://presigned.example.com/test");
  });

  it("builds the object key from a sanitized filename", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "Winter Robin (2).png",
      contentType: "image/png",
      fileSize: 1024,
      category: "covers",
      projectId: "chart-1",
    });

    assertSuccess(result);
    expect(result.key).toBe("covers/chart-1/test-nano-id-Winter-Robin-2-.png");
  });

  it("rejects a projectId that would add a segment to the object key", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");

    const result = await getPresignedUploadUrl({
      fileName: "cover.png",
      contentType: "image/png",
      fileSize: 1024,
      category: "covers",
      projectId: "chart-1/../files",
    });

    assertFailure(result);
    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
  });

  it("deleteFile refuses a key outside the app's namespace", async () => {
    const { deleteFile } = await import("./upload-actions");

    const result = await deleteFile("../../some-other-bucket-object");

    assertFailure(result);
    expect(result.error).toBe("Invalid storage key");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("deleteFile targets exactly the bucket and key it was given", async () => {
    const { deleteFile } = await import("./upload-actions");

    const result = await deleteFile("covers/chart-1/opt-abc.webp");

    assertSuccess(result);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(sentCommands()).toEqual([
      { name: "DeleteObjectCommand", Bucket: "test-bucket", Key: "covers/chart-1/opt-abc.webp" },
    ]);
  });

  it("getPresignedDownloadUrl refuses a malformed key", async () => {
    const { getPresignedDownloadUrl } = await import("./upload-actions");

    const result = await getPresignedDownloadUrl("covers/chart-1/nested/abc.png");

    assertFailure(result);
    expect(result.error).toBe("Invalid storage key");
    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
  });

  it("getPresignedImageUrls drops malformed keys and presigns the rest", async () => {
    const { getPresignedImageUrls } = await import("./upload-actions");

    const result = await getPresignedImageUrls([
      "covers/chart-1/thumb-abc.webp",
      "not-a-key",
      "covers/chart-1/nested/deep.webp",
    ]);

    expect(Object.keys(result)).toEqual(["covers/chart-1/thumb-abc.webp"]);
    expect(presignedKeys()).toEqual(["covers/chart-1/thumb-abc.webp"]);
  });
});

describe("upload-actions ownership scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
    mockSharp.mockReturnValue({ resize: mockResize, metadata: mockMetadata });
    mockResize.mockReturnValue({ webp: mockWebp });
    mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(Buffer.from("processed-image-data"));
    mockMetadata.mockResolvedValue({ format: "png", width: 800, height: 600 });
  });

  it("processAndStoreImage refuses a key that is not the chart's own cover", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/abc-raw.png",
      project: { userId: "user-1" },
    });

    const result = await processAndStoreImage(
      "chart-1",
      "covers/chart-2/abc-someone-elses.png",
      "covers",
    );

    assertFailure(result);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage refuses a key that is not the session's own photo", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.stitchSession.findUnique.mockResolvedValue({
      id: "session-1",
      photoKey: "sessions/project-1/abc-raw.png",
      project: { userId: "user-1" },
    });

    const result = await processAndStoreImage(
      "session-1",
      "sessions/project-2/abc-someone-elses.png",
      "sessions",
    );

    assertFailure(result);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage refuses a key from a different category", async () => {
    const { processAndStoreImage } = await import("./upload-actions");

    const result = await processAndStoreImage("chart-1", "files/chart-1/abc-raw.png", "covers");

    assertFailure(result);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage refuses a chart the caller does not own", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/abc-raw.png",
      project: { userId: "someone-else" },
    });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertFailure(result);
    expect(result.error).toBe("Chart not found");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage refuses a session the caller does not own", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.stitchSession.findUnique.mockResolvedValue({
      id: "session-1",
      photoKey: "sessions/project-1/abc-raw.png",
      project: { userId: "someone-else" },
    });

    const result = await processAndStoreImage(
      "session-1",
      "sessions/project-1/abc-raw.png",
      "sessions",
    );

    assertFailure(result);
    expect(result.error).toBe("Session not found");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("processAndStoreImage reads the raw key and writes the derivative under the entity", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.stitchSession.findUnique.mockResolvedValue({
      id: "session-1",
      photoKey: "sessions/project-1/abc-raw.png",
      project: { userId: "user-1" },
    });
    mockSend.mockResolvedValueOnce(imageResponse());

    const result = await processAndStoreImage(
      "session-1",
      "sessions/project-1/abc-raw.png",
      "sessions",
    );

    assertSuccess(result);
    // A session records one key, so one derivative is written. The thumbnail this
    // used to produce alongside it was an orphan from the moment it was stored.
    expect(sentCommands()).toEqual([
      { name: "GetObjectCommand", Bucket: "test-bucket", Key: "sessions/project-1/abc-raw.png" },
      {
        name: "PutObjectCommand",
        Bucket: "test-bucket",
        Key: "sessions/session-1/opt-test-nano-id.webp",
      },
    ]);
    expect(result.thumbnailKey).toBeNull();
  });

  it("processAndStoreImage writes both derivatives for a cover, which records both", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/abc-raw.png",
      project: { userId: "user-1" },
    });
    mockSend.mockResolvedValueOnce(imageResponse());

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertSuccess(result);
    expect(sentCommands().map((command) => command.Key)).toEqual([
      "covers/chart-1/abc-raw.png",
      "covers/chart-1/opt-test-nano-id.webp",
      "covers/chart-1/thumb-test-nano-id.webp",
    ]);
    expect(result.thumbnailKey).toBe("covers/chart-1/thumb-test-nano-id.webp");
  });
});

describe("upload-actions size and format enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
    mockSharp.mockReturnValue({ resize: mockResize, metadata: mockMetadata });
    mockResize.mockReturnValue({ webp: mockWebp });
    mockWebp.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(Buffer.from("processed-image-data"));
    mockMetadata.mockResolvedValue({ format: "png", width: 800, height: 600 });
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      coverImageUrl: "covers/chart-1/abc-raw.png",
      project: { userId: "user-1" },
    });
  });

  it("refuses an object whose declared length exceeds the cap, before reading its bytes", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    let bodyRead = false;
    const destroy = vi.fn();
    mockSend.mockResolvedValueOnce({
      ContentLength: MAX_FILE_SIZE + 1,
      Body: {
        destroy,
        [Symbol.asyncIterator]: async function* () {
          bodyRead = true;
          yield Buffer.from("fake-image-data");
        },
      },
    });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertFailure(result);
    expect(bodyRead).toBe(false);
    expect(mockSharp).not.toHaveBeenCalled();
    // Refusing without consuming the stream would hold the socket until it timed out.
    expect(destroy).toHaveBeenCalled();
  });

  it("stops reading when the bytes exceed the cap even if the declared length was a lie", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    let chunksYielded = 0;
    mockSend.mockResolvedValueOnce({
      ContentLength: 1024,
      Body: {
        [Symbol.asyncIterator]: async function* () {
          // Bounded so a missing cap fails the assertion instead of hanging the suite.
          for (let i = 0; i < MAX_FILE_SIZE / (1024 * 1024) + 10; i += 1) {
            chunksYielded += 1;
            yield Buffer.alloc(1024 * 1024);
          }
        },
      },
    });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertFailure(result);
    expect(chunksYielded).toBeLessThanOrEqual(MAX_FILE_SIZE / (1024 * 1024) + 1);
    expect(mockSharp).not.toHaveBeenCalled();
  });

  it("refuses bytes that do not decode as an allowed image format", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockSend.mockResolvedValueOnce(imageResponse());
    mockMetadata.mockResolvedValue({ format: "gif", width: 800, height: 600 });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertFailure(result);
    const puts = sentCommands().filter((command) => command.name === "PutObjectCommand");
    expect(puts).toEqual([]);
  });

  it("accepts bytes that decode as an allowed image format", async () => {
    const { processAndStoreImage } = await import("./upload-actions");
    mockSend.mockResolvedValueOnce(imageResponse());
    mockMetadata.mockResolvedValue({ format: "jpeg", width: 800, height: 600 });

    const result = await processAndStoreImage("chart-1", "covers/chart-1/abc-raw.png", "covers");

    assertSuccess(result);
  });
});
