import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import { CoverImageUpload } from "./cover-image-upload";

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
  getPresignedDownloadUrl: vi.fn().mockResolvedValue({
    success: true,
    url: "https://example.com/test-image.jpg",
  }),
}));

vi.mock("@/lib/validations/upload", () => ({
  ALLOWED_IMAGE_TYPES: ["image/png", "image/jpeg", "image/webp"],
  MAX_FILE_SIZE: 10 * 1024 * 1024,
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("CoverImageUpload - cover image display fixes", () => {
  const defaultProps = {
    onUploadComplete: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("resolving state container", () => {
    it("has h-48 class (not h-32)", () => {
      const { container } = render(
        <CoverImageUpload {...defaultProps} currentImageUrl="covers/some-key.jpg" />,
      );

      // Resolving state shows a loading spinner in a dashed border container
      const resolvingContainer = container.querySelector(".border-dashed");
      expect(resolvingContainer).toBeTruthy();
      expect(resolvingContainer!.className).toContain("h-48");
      expect(resolvingContainer!.className).not.toContain("h-32");
    });
  });

  describe("complete state with preview", () => {
    it("preview container has h-48 class (not h-32)", async () => {
      // Use a direct URL (not an R2 key) to skip resolving state
      render(
        <CoverImageUpload {...defaultProps} currentImageUrl="https://example.com/test-image.jpg" />,
      );

      const img = screen.getByAltText("Cover image preview");
      const container = img.closest("div");
      expect(container!.className).toContain("h-48");
      expect(container!.className).not.toContain("h-32");
    });

    it("preview img has object-contain class (not object-cover)", async () => {
      render(
        <CoverImageUpload {...defaultProps} currentImageUrl="https://example.com/test-image.jpg" />,
      );

      const img = screen.getByAltText("Cover image preview");
      expect(img.className).toContain("object-contain");
      expect(img.className).not.toContain("object-cover");
    });

    it("preview container has bg-muted class", async () => {
      render(
        <CoverImageUpload {...defaultProps} currentImageUrl="https://example.com/test-image.jpg" />,
      );

      const img = screen.getByAltText("Cover image preview");
      const container = img.closest("div");
      expect(container!.className).toContain("bg-muted");
    });
  });

  describe("drop zone (idle state)", () => {
    it("has h-48 class (not h-32)", () => {
      render(<CoverImageUpload {...defaultProps} />);

      const dropZone = screen.getByRole("button", {
        name: /upload cover image/i,
      });
      expect(dropZone.className).toContain("h-48");
      expect(dropZone.className).not.toContain("h-32");
    });
  });
});
