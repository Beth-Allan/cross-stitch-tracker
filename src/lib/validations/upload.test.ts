import { describe, expect, it } from "vitest";
import {
  ALLOWED_CHART_FILE_EXTENSIONS,
  ALLOWED_CHART_FILE_TYPES,
  MAX_STORAGE_KEY_LENGTH,
  parseStorageKey,
  resolveChartFileContentType,
  sanitizeUploadFileName,
  storageKeySchema,
  uploadRequestSchema,
} from "./upload";

describe("parseStorageKey", () => {
  it("splits a well-formed key into category, owner and name", () => {
    expect(parseStorageKey("covers/chart-1/abc123-My_Chart.png")).toEqual({
      category: "covers",
      owner: "chart-1",
      name: "abc123-My_Chart.png",
    });
  });

  it("accepts every category the app writes", () => {
    for (const category of ["covers", "files", "sessions"]) {
      expect(parseStorageKey(`${category}/entity-1/abc-file.png`)?.category).toBe(category);
    }
  });

  it("accepts the unsaved-chart owner segment a cover upload uses before the chart exists", () => {
    expect(parseStorageKey("covers/unsaved/abc-photo.jpg")?.owner).toBe("unsaved");
  });

  it("accepts keys already in storage whose name segment has spaces and parentheses", () => {
    expect(parseStorageKey("files/chart-1/abc-Winter Robin (2).pdf")?.name).toBe(
      "abc-Winter Robin (2).pdf",
    );
  });

  it("rejects an unknown category", () => {
    expect(parseStorageKey("secrets/chart-1/abc-file.png")).toBeNull();
  });

  it("rejects a key with the wrong number of segments", () => {
    expect(parseStorageKey("covers/chart-1")).toBeNull();
    expect(parseStorageKey("covers/chart-1/nested/abc-file.png")).toBeNull();
    expect(parseStorageKey("abc-file.png")).toBeNull();
  });

  it("rejects an owner segment carrying anything but id characters", () => {
    expect(parseStorageKey("covers/../abc-file.png")).toBeNull();
    expect(parseStorageKey("covers/chart 1/abc-file.png")).toBeNull();
    expect(parseStorageKey("covers/chart.1/abc-file.png")).toBeNull();
  });

  it("rejects an empty segment", () => {
    expect(parseStorageKey("covers//abc-file.png")).toBeNull();
    expect(parseStorageKey("covers/chart-1/")).toBeNull();
    expect(parseStorageKey("/chart-1/abc-file.png")).toBeNull();
  });

  it("rejects a relative name segment", () => {
    expect(parseStorageKey("covers/chart-1/.")).toBeNull();
    expect(parseStorageKey("covers/chart-1/..")).toBeNull();
  });

  it("rejects control characters anywhere in the key", () => {
    expect(parseStorageKey("covers/chart-1/abc\u0000file.png")).toBeNull();
    expect(parseStorageKey("covers/chart-1/abc\nfile.png")).toBeNull();
    expect(parseStorageKey("covers/chart-1/abc\u007ffile.png")).toBeNull();
  });

  it("rejects a key longer than the cap", () => {
    const overLong = `covers/chart-1/${"a".repeat(MAX_STORAGE_KEY_LENGTH)}.png`;
    expect(parseStorageKey(overLong)).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(parseStorageKey(undefined)).toBeNull();
    expect(parseStorageKey(null)).toBeNull();
    expect(parseStorageKey(42)).toBeNull();
    expect(parseStorageKey({ key: "covers/chart-1/abc.png" })).toBeNull();
  });
});

describe("storageKeySchema", () => {
  it("accepts a well-formed key", () => {
    expect(storageKeySchema.safeParse("sessions/project-1/abc-photo.jpg").success).toBe(true);
  });

  it("rejects a malformed key with a plain message", () => {
    const result = storageKeySchema.safeParse("covers/chart-1/nested/abc.png");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Invalid storage key");
    }
  });
});

describe("sanitizeUploadFileName", () => {
  it("keeps letters, digits, dots, dashes and underscores", () => {
    expect(sanitizeUploadFileName("Winter_Robin-2.png")).toBe("Winter_Robin-2.png");
  });

  it("replaces path separators so a name cannot add a key segment", () => {
    expect(sanitizeUploadFileName("../../etc/passwd")).toBe("etc-passwd");
    expect(sanitizeUploadFileName("folder\\file.pdf")).toBe("folder-file.pdf");
  });

  it("replaces spaces and punctuation that make object keys awkward to address", () => {
    expect(sanitizeUploadFileName("Winter Robin (2).pdf")).toBe("Winter-Robin-2-.pdf");
    expect(sanitizeUploadFileName("chart#1?draft.png")).toBe("chart-1-draft.png");
  });

  it("collapses runs of dashes rather than leaving a smear of them", () => {
    expect(sanitizeUploadFileName("a   b")).toBe("a-b");
  });

  it("strips leading dots so a sanitized name is never a relative path", () => {
    expect(sanitizeUploadFileName("..hidden.png")).toBe("hidden.png");
    expect(sanitizeUploadFileName(".")).toBe("file");
  });

  it("caps the length", () => {
    expect(sanitizeUploadFileName("a".repeat(400))).toHaveLength(100);
  });

  it("falls back to a placeholder when nothing usable survives", () => {
    expect(sanitizeUploadFileName("///")).toBe("file");
    expect(sanitizeUploadFileName("   ")).toBe("file");
  });

  it("produces a name segment that parseStorageKey accepts", () => {
    const name = sanitizeUploadFileName("Winter Robin (2)/../evil.pdf");
    expect(parseStorageKey(`files/chart-1/abc-${name}`)).not.toBeNull();
  });
});

describe("uploadRequestSchema projectId", () => {
  const base = {
    fileName: "chart.pdf",
    contentType: "application/pdf",
    fileSize: 1024,
    category: "files" as const,
  };

  it("accepts an id and the unsaved placeholder", () => {
    expect(uploadRequestSchema.safeParse({ ...base, projectId: "cml0k9x1" }).success).toBe(true);
    expect(uploadRequestSchema.safeParse({ ...base, projectId: "unsaved" }).success).toBe(true);
  });

  it("rejects a projectId that would add a segment to the object key", () => {
    expect(uploadRequestSchema.safeParse({ ...base, projectId: "a/b" }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ ...base, projectId: "../covers" }).success).toBe(false);
  });

  it("rejects a projectId long enough to pollute the key namespace", () => {
    expect(uploadRequestSchema.safeParse({ ...base, projectId: "a".repeat(65) }).success).toBe(
      false,
    );
  });
});

describe("resolveChartFileContentType", () => {
  it("keeps a self-describing type the app accepts", () => {
    expect(resolveChartFileContentType("chart.pdf", "application/pdf")).toBe("application/pdf");
    expect(resolveChartFileContentType("scan.png", "image/png")).toBe("image/png");
    expect(resolveChartFileContentType("scan.jpg", "image/jpeg")).toBe("image/jpeg");
  });

  it("stores a pattern file the browser cannot identify as the generic type (CHF-002)", () => {
    expect(resolveChartFileContentType("pattern.xsd", "text/xml")).toBe("application/octet-stream");
    expect(resolveChartFileContentType("pattern.pat", "")).toBe("application/octet-stream");
    expect(resolveChartFileContentType("pattern.saga", "application/x-saga")).toBe(
      "application/octet-stream",
    );
    expect(resolveChartFileContentType("pattern.oxs", "text/xml")).toBe("application/octet-stream");
    expect(resolveChartFileContentType("pattern.css", "text/css")).toBe("application/octet-stream");
  });

  it("refuses a zip, whatever the browser calls it (CHF-003)", () => {
    expect(resolveChartFileContentType("pack.zip", "application/zip")).toBeNull();
    expect(resolveChartFileContentType("pack.zip", "application/x-zip-compressed")).toBeNull();
    expect(resolveChartFileContentType("pack.zip", "application/octet-stream")).toBeNull();
  });

  it("refuses the generic type when the name is not one of the accepted files", () => {
    expect(resolveChartFileContentType("installer.exe", "application/octet-stream")).toBeNull();
    expect(resolveChartFileContentType("notes.txt", "text/plain")).toBeNull();
  });

  it("neutralises a renderable type rather than storing it as renderable", () => {
    expect(resolveChartFileContentType("chart.pdf", "text/html")).toBe("application/octet-stream");
    expect(resolveChartFileContentType("page.html", "text/html")).toBeNull();
  });

  it("reads the name case-insensitively and ignores charset parameters", () => {
    expect(resolveChartFileContentType("CHART.PDF", "application/PDF")).toBe("application/pdf");
    expect(resolveChartFileContentType("pattern.XSD", "text/xml; charset=utf-8")).toBe(
      "application/octet-stream",
    );
  });

  it("accepts an image with no extension on the strength of its own type", () => {
    expect(resolveChartFileContentType("screenshot", "image/webp")).toBe("image/webp");
    expect(resolveChartFileContentType("mystery", "application/octet-stream")).toBeNull();
  });

  it("only ever returns a type the server allows, for every accepted extension", () => {
    for (const extension of ALLOWED_CHART_FILE_EXTENSIONS) {
      const resolved = resolveChartFileContentType(`chart${extension}`, "application/unknown");
      expect(resolved).not.toBeNull();
      expect(ALLOWED_CHART_FILE_TYPES as readonly string[]).toContain(resolved);
    }
  });
});

describe("the one accepted-file list", () => {
  it("names the pattern formats Beth keeps and no zip (CHF-002, CHF-003)", () => {
    expect(ALLOWED_CHART_FILE_EXTENSIONS).toEqual(
      expect.arrayContaining([".xsd", ".pat", ".saga", ".oxs", ".pdf", ".png", ".jpg", ".webp"]),
    );
    expect(ALLOWED_CHART_FILE_EXTENSIONS).not.toContain(".zip");
    expect(ALLOWED_CHART_FILE_TYPES).not.toContain("application/zip");
    expect(ALLOWED_CHART_FILE_TYPES).not.toContain("application/x-zip-compressed");
  });

  it("stores nothing the browser would render", () => {
    for (const type of ALLOWED_CHART_FILE_TYPES) {
      expect(type).not.toMatch(/^text\/html|svg/);
    }
  });
});
