/**
 * Files display newest-first. The sibling chart-file-list.test.tsx asserts the filenames are
 * present but never their order, so the sort is only covered here.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ChartFileList } from "./chart-file-list";

vi.mock("@/lib/actions/chart-file-actions", () => ({
  addChartFile: vi.fn(),
  deleteChartFile: vi.fn(),
  getChartFileDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

describe("ChartFileList — D-03 sort order", () => {
  it("renders files newest-first regardless of prop array order", () => {
    // Deliberately pass files OLDEST first to prove the component re-sorts them
    const files = [
      {
        id: "file-old",
        url: "files/chart-1/old.pdf",
        filename: "oldest-file.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
        label: null,
        notes: null,
        createdAt: new Date("2026-01-01T10:00:00Z"), // oldest
      },
      {
        id: "file-mid",
        url: "files/chart-1/mid.pdf",
        filename: "middle-file.pdf",
        mimeType: "application/pdf",
        fileSize: 2048,
        label: null,
        notes: null,
        createdAt: new Date("2026-01-15T10:00:00Z"), // middle
      },
      {
        id: "file-new",
        url: "files/chart-1/new.pdf",
        filename: "newest-file.pdf",
        mimeType: "application/pdf",
        fileSize: 4096,
        label: null,
        notes: null,
        createdAt: new Date("2026-02-01T10:00:00Z"), // newest
      },
    ];

    render(<ChartFileList chartId="chart-1" files={files} />);

    const allFilenames = screen
      .getAllByText(/\.(pdf|png|pat|xsd|css|saga)/)
      .map((el) => el.textContent);

    const newestIdx = allFilenames.findIndex((t) => t?.includes("newest-file"));
    const middleIdx = allFilenames.findIndex((t) => t?.includes("middle-file"));
    const oldestIdx = allFilenames.findIndex((t) => t?.includes("oldest-file"));

    // newest should appear before middle, middle before oldest
    expect(newestIdx).toBeLessThan(middleIdx);
    expect(middleIdx).toBeLessThan(oldestIdx);
  });
});
