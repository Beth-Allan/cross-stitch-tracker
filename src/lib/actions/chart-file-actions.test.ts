import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  assertSuccess,
  assertFailure,
  unvalidatedPayload,
} from "@/__tests__/mocks";
import {
  ACCEPTED_CHART_FILE_LABEL,
  ALLOWED_CHART_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  resolveChartFileContentType,
  type AddChartFileInput,
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
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/download"),
}));

describe("chart-file-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({ ContentLength: 5000, ContentType: "application/pdf" });
  });

  describe("addChartFile", () => {
    it("creates record with correct fields when user owns the chart", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue({
        id: "chart-1",
        project: { userId: "user-1" },
      });

      const mockFile = {
        id: "file-1",
        chartId: "chart-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 5000,
        label: null,
        notes: null,
        createdAt: new Date(),
      };
      mockPrisma.chartFile.create.mockResolvedValue(mockFile);

      const result = await addChartFile({
        chartId: "chart-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        label: null,
      });

      assertSuccess(result);
      expect(result.file).toEqual(mockFile);
      expect(mockPrisma.chartFile.create).toHaveBeenCalledWith({
        data: {
          chartId: "chart-1",
          url: "files/chart-1/abc-test.pdf",
          filename: "test.pdf",
          mimeType: "application/pdf",
          fileSize: 5000,
          label: null,
        },
      });
    });

    it("returns error 'Chart not found' when chart does not exist", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue(null);

      const result = await addChartFile({
        chartId: "nonexistent",
        url: "files/x/abc.pdf",
        filename: "test.pdf",
        label: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Chart not found");
    });

    it("returns error 'Chart not found' when user does not own the chart", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      mockPrisma.chart.findUnique.mockResolvedValue({
        id: "chart-1",
        project: { userId: "other-user" },
      });

      const result = await addChartFile({
        chartId: "chart-1",
        url: "files/chart-1/abc.pdf",
        filename: "test.pdf",
        label: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Chart not found");
    });

    it("returns Zod error for invalid input (missing chartId)", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      const result = await addChartFile(
        unvalidatedPayload<AddChartFileInput>({
          url: "files/x/abc.pdf",
          filename: "test.pdf",
          mimeType: "application/pdf",
          fileSize: 1000,
        }),
      );

      assertFailure(result);
      expect(result.error).toBeDefined();
    });

    it("rejects url that does not start with files/ prefix", async () => {
      const { addChartFile } = await import("./chart-file-actions");

      const result = await addChartFile(
        unvalidatedPayload<AddChartFileInput>({
          chartId: "chart-1",
          url: "covers/other-chart/image.png",
          filename: "image.png",
          mimeType: "image/png",
          fileSize: 1000,
          label: null,
        }),
      );

      assertFailure(result);
      expect(result.error).toBe("Invalid file path");
    });
  });

  describe("deleteChartFile", () => {
    it("deletes R2 object and DB record when user owns the chart", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });
      mockPrisma.chartFile.delete.mockResolvedValue({ id: "file-1" });

      const result = await deleteChartFile("file-1");

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
      expect(mockPrisma.chartFile.delete).toHaveBeenCalledWith({
        where: { id: "file-1" },
      });
    });

    it("returns error when user does not own the chart", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        chart: { id: "chart-1", project: { userId: "other-user" } },
      });

      const result = await deleteChartFile("file-1");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });

    it("returns error when file does not exist", async () => {
      const { deleteChartFile } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue(null);

      const result = await deleteChartFile("nonexistent");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });
  });

  describe("getChartFileDownloadUrl", () => {
    it("returns presigned URL for owned file", async () => {
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });

      const result = await getChartFileDownloadUrl("file-1");

      assertSuccess(result);
      expect(result.url).toBe("https://presigned.example.com/download");
      expect(result.filename).toBe("test.pdf");
      expect(result.mimeType).toBe("application/pdf");
    });

    it("returns error for unauthorized access", async () => {
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "other-user" } },
      });

      const result = await getChartFileDownloadUrl("file-1");

      assertFailure(result);
      expect(result.error).toBe("File not found");
    });

    it("returns structured error when R2 is not configured", async () => {
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const { getChartFileDownloadUrl } = await import("./chart-file-actions");

      mockPrisma.chartFile.findUnique.mockResolvedValue({
        id: "file-1",
        url: "files/chart-1/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        chart: { id: "chart-1", project: { userId: "user-1" } },
      });

      vi.mocked(getSignedUrl).mockRejectedValueOnce(
        new Error("R2 environment variables not configured"),
      );

      const result = await getChartFileDownloadUrl("file-1");

      assertFailure(result);
      expect(result.error).toBe("File storage is not configured.");
    });
  });
});

describe("chart-file-actions write-path integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({ ContentLength: 5000, ContentType: "application/pdf" });
    mockPrisma.chart.findUnique.mockResolvedValue({
      id: "chart-1",
      project: { userId: "user-1" },
    });
    mockPrisma.chartFile.create.mockResolvedValue({ id: "file-1" });
  });

  function sentCommands() {
    return mockSend.mock.calls.map(([command]) => ({
      name: (command as { constructor: { name: string } }).constructor.name,
      Key: (command as { input: { Key: string } }).input.Key,
    }));
  }

  it("refuses a key belonging to a different chart", async () => {
    const { addChartFile } = await import("./chart-file-actions");

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-2/abc-pattern.pdf",
      filename: "pattern.pdf",
      label: null,
    });

    assertFailure(result);
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("refuses a key with no object behind it", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSend.mockRejectedValueOnce(Object.assign(new Error("NotFound"), { name: "NotFound" }));

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-pattern.pdf",
      filename: "pattern.pdf",
      label: null,
    });

    assertFailure(result);
    expect(result.error).toBe("That upload could not be found in storage.");
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("records the size and type the stored object actually has", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({ ContentLength: 4096, ContentType: "application/pdf" });

    const result = await addChartFile(
      unvalidatedPayload<AddChartFileInput>({
        chartId: "chart-1",
        url: "files/chart-1/abc-pattern.pdf",
        filename: "pattern.pdf",
        label: null,
        // What a client claims about its own upload is not evidence.
        mimeType: "image/png",
        fileSize: 1,
      }),
    );

    assertSuccess(result);
    expect(mockPrisma.chartFile.create).toHaveBeenCalledWith({
      data: {
        chartId: "chart-1",
        url: "files/chart-1/abc-pattern.pdf",
        filename: "pattern.pdf",
        mimeType: "application/pdf",
        fileSize: 4096,
        label: null,
      },
    });
  });

  it("refuses an object over the size cap and removes it rather than leaving it orphaned", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({
      ContentLength: MAX_FILE_SIZE + 1,
      ContentType: "application/pdf",
    });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-huge.pdf",
      filename: "huge.pdf",
      label: null,
    });

    assertFailure(result);
    expect(result.error).toContain("too large");
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
    expect(sentCommands()).toEqual([
      { name: "HeadObjectCommand", Key: "files/chart-1/abc-huge.pdf" },
      { name: "DeleteObjectCommand", Key: "files/chart-1/abc-huge.pdf" },
    ]);
  });

  it("refuses a zip, which is not a chart file (CHF-003)", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({ ContentLength: 2048, ContentType: "application/zip" });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-pack.zip",
      filename: "pack.zip",
      label: null,
    });

    assertFailure(result);
    expect(result.error).toBe(`Unsupported file type. Accepted: ${ACCEPTED_CHART_FILE_LABEL}`);
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("refuses the generic type for a name that is not an accepted file", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({
      ContentLength: 2048,
      ContentType: "application/octet-stream",
    });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-installer.exe",
      filename: "installer.exe",
      label: null,
    });

    assertFailure(result);
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("applies the same rule the browser applied, for every accepted file", async () => {
    const { addChartFile } = await import("./chart-file-actions");

    for (const extension of ALLOWED_CHART_FILE_EXTENSIONS) {
      vi.clearAllMocks();
      mockPrisma.chart.findUnique.mockResolvedValue({
        id: "chart-1",
        project: { userId: "user-1" },
      });
      mockPrisma.chartFile.create.mockResolvedValue({ id: "file-1" });
      const stored = resolveChartFileContentType(`pattern${extension}`, "text/xml") as string;
      mockSend.mockResolvedValueOnce({ ContentLength: 2048, ContentType: stored });

      const result = await addChartFile({
        chartId: "chart-1",
        url: `files/chart-1/abc-pattern${extension}`,
        filename: `pattern${extension}`,
        label: null,
      });

      assertSuccess(result);
    }
  });

  it("stores a blank label as no label, like every other optional text field", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({ ContentLength: 2048, ContentType: "application/pdf" });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-pattern.pdf",
      filename: "pattern.pdf",
      label: "   ",
    });

    assertSuccess(result);
    expect(mockPrisma.chartFile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ label: null }) }),
    );
  });

  it("accepts a pattern file stored as the generic binary type", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({
      ContentLength: 2048,
      ContentType: "application/octet-stream",
    });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-winter.saga",
      filename: "winter.saga",
      label: null,
    });

    assertSuccess(result);
  });

  it("refuses a stored type outside the allowlist, whatever the filename claims", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({ ContentLength: 2048, ContentType: "text/html" });

    const result = await addChartFile({
      chartId: "chart-1",
      // A caller picks this field freely, so it cannot be what decides the answer.
      url: "files/chart-1/abc-page.html",
      filename: "page.pdf",
      label: null,
    });

    assertFailure(result);
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("refuses an empty object rather than listing a file that downloads as nothing", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockSend.mockResolvedValueOnce({ ContentLength: 0, ContentType: "application/pdf" });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-empty.pdf",
      filename: "empty.pdf",
      label: null,
    });

    assertFailure(result);
    expect(mockPrisma.chartFile.create).not.toHaveBeenCalled();
  });

  it("leaves a rejected key's object alone when a saved file already points at it", async () => {
    const { addChartFile } = await import("./chart-file-actions");
    mockPrisma.chartFile.findFirst.mockResolvedValue({
      id: "file-1",
      url: "files/chart-1/abc-pattern.pdf",
    });
    mockSend.mockResolvedValueOnce({ ContentLength: 2048, ContentType: "text/html" });

    const result = await addChartFile({
      chartId: "chart-1",
      url: "files/chart-1/abc-pattern.pdf",
      filename: "pattern.pdf",
      label: null,
    });

    assertFailure(result);
    expect(sentCommands().filter((command) => command.name === "DeleteObjectCommand")).toEqual([]);
  });

  it("getChartFileDownloadUrl refuses a stored url that is not one of this app's keys", async () => {
    const { getChartFileDownloadUrl } = await import("./chart-file-actions");
    mockPrisma.chartFile.findUnique.mockResolvedValue({
      id: "file-1",
      url: "../elsewhere",
      filename: "test.pdf",
      mimeType: "application/pdf",
      chart: { id: "chart-1", project: { userId: "user-1" } },
    });

    const result = await getChartFileDownloadUrl("file-1");

    assertFailure(result);
  });

  it("deleteChartFile removes the database row before the storage object", async () => {
    const { deleteChartFile } = await import("./chart-file-actions");
    const order: string[] = [];
    mockPrisma.chartFile.findUnique.mockResolvedValue({
      id: "file-1",
      url: "files/chart-1/abc-test.pdf",
      chart: { id: "chart-1", project: { userId: "user-1" } },
    });
    mockPrisma.chartFile.delete.mockImplementation(async () => {
      order.push("db");
      return { id: "file-1" };
    });
    mockSend.mockImplementation(async () => {
      order.push("r2");
      return {};
    });

    const result = await deleteChartFile("file-1");

    expect(result.success).toBe(true);
    // Reversed order: a failure now leaves an orphaned object, which the app
    // already tolerates, instead of a record pointing at a deleted file.
    expect(order).toEqual(["db", "r2"]);
  });

  it("deleteChartFile still reports success when the storage object cannot be removed", async () => {
    const { deleteChartFile } = await import("./chart-file-actions");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.chartFile.findUnique.mockResolvedValue({
      id: "file-1",
      url: "files/chart-1/abc-test.pdf",
      chart: { id: "chart-1", project: { userId: "user-1" } },
    });
    mockPrisma.chartFile.delete.mockResolvedValue({ id: "file-1" });
    mockSend.mockRejectedValue(new Error("R2 unreachable"));

    const result = await deleteChartFile("file-1");

    expect(result.success).toBe(true);
    expect(mockPrisma.chartFile.delete).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
