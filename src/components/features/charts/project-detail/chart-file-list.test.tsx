import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { ChartFileList } from "./chart-file-list";
import { addChartFile } from "@/lib/actions/chart-file-actions";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import { ACCEPTED_CHART_FILE_LABEL } from "@/lib/validations/upload";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock server actions
vi.mock("@/lib/actions/chart-file-actions", () => ({
  addChartFile: vi.fn(),
  deleteChartFile: vi.fn(),
  getChartFileDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

const mockFiles = [
  {
    id: "file-1",
    url: "files/chart-1/abc-pattern.pdf",
    filename: "pattern.pdf",
    mimeType: "application/pdf",
    fileSize: 2048000,
    label: null,
    notes: null,
    createdAt: new Date("2026-01-15T10:00:00Z"),
  },
  {
    id: "file-2",
    url: "files/chart-1/def-photo.png",
    filename: "reference-photo.png",
    mimeType: "image/png",
    fileSize: 512000,
    label: "Reference Photo",
    notes: null,
    createdAt: new Date("2026-01-10T10:00:00Z"),
  },
];

describe("ChartFileList", () => {
  it("renders file rows when files exist", () => {
    render(<ChartFileList chartId="chart-1" files={mockFiles} />);

    expect(screen.getByText("pattern.pdf")).toBeInTheDocument();
    expect(screen.getByText("Reference Photo")).toBeInTheDocument();
    // File sizes should render
    expect(screen.getByText("2.0 MB")).toBeInTheDocument();
    expect(screen.getByText("500.0 KB")).toBeInTheDocument();
  });

  it("renders empty state when no files", () => {
    render(<ChartFileList chartId="chart-1" files={[]} />);

    expect(screen.getByText("No working copies yet")).toBeInTheDocument();
    expect(screen.getByText(/Upload your digital pattern files/)).toBeInTheDocument();
  });

  it("shows 'Add Files' button in section header", () => {
    render(<ChartFileList chartId="chart-1" files={mockFiles} />);

    expect(screen.getByRole("button", { name: /Add Files/i })).toBeInTheDocument();
  });
});

describe("ChartFileList uploads", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    vi.mocked(getPresignedUploadUrl).mockResolvedValue({
      success: true as const,
      url: "https://r2.example.com/presigned",
      key: "files/chart-1/abc-winter-robin.xsd",
    });
    vi.mocked(addChartFile).mockResolvedValue({
      success: true as const,
      file: {
        id: "file-3",
        chartId: "chart-1",
        url: "files/chart-1/abc-winter-robin.xsd",
        filename: "winter-robin.xsd",
        mimeType: "application/octet-stream",
        fileSize: 5000,
        label: null,
        notes: null,
        createdAt: new Date(),
      },
    });
  });

  function selectFile(file: File) {
    render(<ChartFileList chartId="chart-1" files={[]} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(file, "size", { value: 5000 });
    fireEvent.change(input, { target: { files: [file] } });
  }

  it("uploads a Pattern Maker file under the type the server accepts (CHF-002)", async () => {
    selectFile(new File(["<xml/>"], "winter-robin.xsd", { type: "text/xml" }));

    await waitFor(() => {
      expect(vi.mocked(getPresignedUploadUrl)).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "winter-robin.xsd",
          contentType: "application/octet-stream",
        }),
      );
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://r2.example.com/presigned",
      expect.objectContaining({ headers: { "Content-Type": "application/octet-stream" } }),
    );
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it("refuses a .zip, which is not a chart file (CHF-003)", async () => {
    selectFile(new File(["zip"], "patterns.zip", { type: "application/zip" }));

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        `Unsupported file type. Accepted: ${ACCEPTED_CHART_FILE_LABEL}`,
      );
    });

    expect(vi.mocked(getPresignedUploadUrl)).not.toHaveBeenCalled();
  });
});
