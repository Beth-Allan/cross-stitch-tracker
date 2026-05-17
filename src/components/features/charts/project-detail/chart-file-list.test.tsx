import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ChartFileList } from "./chart-file-list";

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
