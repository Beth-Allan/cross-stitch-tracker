import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChartFileUpload } from "./chart-file-upload";
import { ACCEPTED_CHART_FILE_LABEL } from "@/lib/validations/upload";

// Mock the upload action
vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));

// Mock fetch for presigned URL PUT
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";

const mockGetPresignedUploadUrl = vi.mocked(getPresignedUploadUrl);

describe("ChartFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it("renders 'Upload Working Copies' button when no files uploaded", () => {
    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={vi.fn()} />);

    expect(screen.getByText("Upload Working Copies")).toBeInTheDocument();
  });

  it("renders file rows for each completed upload", () => {
    const files = [
      {
        key: "files/unsaved/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
      },
      {
        key: "files/unsaved/def-photo.png",
        filename: "photo.png",
        mimeType: "image/png",
        fileSize: 2048,
      },
    ];

    render(<ChartFileUpload uploadedFiles={files} onFilesChange={vi.fn()} />);

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
    expect(screen.getByText("photo.png")).toBeInTheDocument();
    expect(screen.getByText("1.0 KB")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
  });

  it("calls onFilesChange with updated file list when upload completes", async () => {
    const onFilesChange = vi.fn();
    mockGetPresignedUploadUrl.mockResolvedValue({
      success: true as const,
      url: "https://r2.example.com/presigned",
      key: "files/unsaved/xyz-newfile.pdf",
    });

    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={onFilesChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "newfile.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 5000 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([
        {
          key: "files/unsaved/xyz-newfile.pdf",
          filename: "newfile.pdf",
          mimeType: "application/pdf",
          fileSize: 5000,
        },
      ]);
    });
  });

  it("shows error message for invalid file type", async () => {
    const onFilesChange = vi.fn();

    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={onFilesChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "malware.exe", { type: "application/x-msdownload" });
    Object.defineProperty(file, "size", { value: 5000 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText(`Unsupported file type. Accepted: ${ACCEPTED_CHART_FILE_LABEL}`),
      ).toBeInTheDocument();
    });

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("shows error message for file exceeding 50MB", async () => {
    const onFilesChange = vi.fn();

    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={onFilesChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "huge.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 51 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("File exceeds 50MB limit.")).toBeInTheDocument();
    });

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("refuses a .zip, which is not a chart file (CHF-003)", async () => {
    const onFilesChange = vi.fn();

    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={onFilesChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["zip-content"], "patterns.zip", { type: "application/zip" });
    Object.defineProperty(file, "size", { value: 5000 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText(`Unsupported file type. Accepted: ${ACCEPTED_CHART_FILE_LABEL}`),
      ).toBeInTheDocument();
    });

    expect(mockGetPresignedUploadUrl).not.toHaveBeenCalled();
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("uploads a Pattern Maker file under the type the server accepts (CHF-002)", async () => {
    const onFilesChange = vi.fn();
    mockGetPresignedUploadUrl.mockResolvedValue({
      success: true as const,
      url: "https://r2.example.com/presigned",
      key: "files/unsaved/abc-winter-robin.xsd",
    });

    render(<ChartFileUpload uploadedFiles={[]} onFilesChange={onFilesChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    // What a browser reports for a Pattern Maker chart: it sees XML, not a pattern.
    const file = new File(["<xml/>"], "winter-robin.xsd", { type: "text/xml" });
    Object.defineProperty(file, "size", { value: 5000 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([
        {
          key: "files/unsaved/abc-winter-robin.xsd",
          filename: "winter-robin.xsd",
          mimeType: "application/octet-stream",
          fileSize: 5000,
        },
      ]);
    });

    expect(mockGetPresignedUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "winter-robin.xsd",
        contentType: "application/octet-stream",
      }),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://r2.example.com/presigned",
      expect.objectContaining({ headers: { "Content-Type": "application/octet-stream" } }),
    );
  });

  it("allows removing an uploaded file from the list", () => {
    const onFilesChange = vi.fn();
    const files = [
      {
        key: "files/unsaved/abc-test.pdf",
        filename: "test.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
      },
      {
        key: "files/unsaved/def-photo.png",
        filename: "photo.png",
        mimeType: "image/png",
        fileSize: 2048,
      },
    ];

    render(<ChartFileUpload uploadedFiles={files} onFilesChange={onFilesChange} />);

    const removeButtons = screen.getAllByLabelText(/Remove/);
    fireEvent.click(removeButtons[0]);

    expect(onFilesChange).toHaveBeenCalledWith([
      {
        key: "files/unsaved/def-photo.png",
        filename: "photo.png",
        mimeType: "image/png",
        fileSize: 2048,
      },
    ]);
  });
});
