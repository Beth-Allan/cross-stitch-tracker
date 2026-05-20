import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { FocalPointEditor } from "./focal-point-editor";

// vi.hoisted runs before vi.mock hoisting — safe to reference in mock factories
const { mockUpdateFocalPoint, mockToast } = vi.hoisted(() => ({
  mockUpdateFocalPoint: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/actions/focal-point-actions", () => ({
  updateFocalPoint: (...args: unknown[]) => mockUpdateFocalPoint(...args),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

const defaultProps = {
  chartId: "chart-123",
  initialFocalPoint: null,
  imageUrl: "https://example.com/image.jpg",
};

describe("FocalPointEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateFocalPoint.mockResolvedValue({ success: true });
  });

  it("renders trigger button when imageUrl is provided", () => {
    render(<FocalPointEditor {...defaultProps} />);
    expect(screen.getByRole("button", { name: /set focal point/i })).toBeInTheDocument();
  });

  it("does NOT render trigger button when imageUrl is null", () => {
    render(<FocalPointEditor {...defaultProps} imageUrl={null} />);
    expect(screen.queryByRole("button", { name: /set focal point/i })).not.toBeInTheDocument();
  });

  it("enters edit mode when trigger button is clicked", () => {
    render(<FocalPointEditor {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Action bar buttons should appear
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset to center/i })).toBeInTheDocument();

    // Trigger button should be hidden in edit mode
    expect(screen.queryByRole("button", { name: /set focal point/i })).not.toBeInTheDocument();
  });

  it("exits edit mode when Cancel is clicked", () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Action bar should disappear, trigger should reappear
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /set focal point/i })).toBeInTheDocument();
  });

  it("shows marker after clicking on image area", () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Find the click area
    const clickArea = screen.getByRole("button", {
      name: /click to place focal point/i,
    });

    // Mock getBoundingClientRect for coordinate calculation
    vi.spyOn(clickArea, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    // Click at 50%, 50% position
    fireEvent.click(clickArea, { clientX: 200, clientY: 150 });

    // Verify aria-live region announces the position
    expect(screen.getByText(/focal point set at 50%, 50%/i)).toBeInTheDocument();
  });

  it("calls updateFocalPoint with coordinates when Save is clicked", async () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Place a marker
    const clickArea = screen.getByRole("button", {
      name: /click to place focal point/i,
    });
    vi.spyOn(clickArea, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.click(clickArea, { clientX: 100, clientY: 75 });

    // Save
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateFocalPoint).toHaveBeenCalledWith("chart-123", 0.25, 0.25);
    });
  });

  it("calls updateFocalPoint with null when Reset to Center is clicked", async () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Reset
    fireEvent.click(screen.getByRole("button", { name: /reset to center/i }));

    await waitFor(() => {
      expect(mockUpdateFocalPoint).toHaveBeenCalledWith("chart-123", null, null);
    });
  });

  it("does not call updateFocalPoint when Cancel is clicked", () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Cancel
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockUpdateFocalPoint).not.toHaveBeenCalled();
  });

  it("shows error toast and stays in edit mode when save returns failure", async () => {
    mockUpdateFocalPoint.mockResolvedValueOnce({ success: false, error: "Chart not found" });
    render(<FocalPointEditor {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    vi.spyOn(clickArea, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.click(clickArea, { clientX: 200, clientY: 150 });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Chart not found");
    });
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows error toast and stays in edit mode when save throws", async () => {
    mockUpdateFocalPoint.mockRejectedValueOnce(new Error("Network error"));
    render(<FocalPointEditor {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    vi.spyOn(clickArea, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.click(clickArea, { clientX: 200, clientY: 150 });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Couldn't save focal point. Try again.");
    });
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows error toast when reset fails", async () => {
    mockUpdateFocalPoint.mockResolvedValueOnce({ success: false, error: "Failed to update" });
    render(<FocalPointEditor {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset to center/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to update");
    });
    expect(screen.getByRole("button", { name: /reset to center/i })).toBeInTheDocument();
  });

  it("has Save button disabled when no focal point has been placed", () => {
    render(<FocalPointEditor {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("restores existing focal point when entering edit mode", () => {
    render(<FocalPointEditor {...defaultProps} initialFocalPoint={{ x: 0.3, y: 0.7 }} />);
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    expect(screen.getByText(/focal point set at 30%, 70%/i)).toBeInTheDocument();
  });

  it("exits edit mode on Escape key", () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Press Escape on the wrapper
    fireEvent.keyDown(screen.getByRole("button", { name: /cancel/i }), {
      key: "Escape",
    });

    // Should exit edit mode
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /set focal point/i })).toBeInTheDocument();
  });

  describe("focal point editor split (UX-10)", () => {
    it("renders FocalPointClickArea component in edit mode", () => {
      render(<FocalPointEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
      expect(screen.getByRole("button", { name: /click to place focal point/i })).toBeInTheDocument();
    });

    it("renders action bar with Save/Cancel/Reset buttons in edit mode", () => {
      render(<FocalPointEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /reset to center/i })).toBeInTheDocument();
    });

    it("action bar does NOT have class 'absolute'", () => {
      const { container } = render(<FocalPointEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
      const actionBar = screen.getByRole("button", { name: /save/i }).closest("div.border-t");
      expect(actionBar).toBeTruthy();
      expect(actionBar!.className).not.toContain("absolute");
    });

    it("action bar has border-t class for visual treatment", () => {
      const { container } = render(<FocalPointEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
      const actionBar = screen.getByRole("button", { name: /save/i }).closest("div.border-t");
      expect(actionBar).toBeTruthy();
      expect(actionBar!.className).toContain("border-t");
    });

    it("click area has absolute inset-0 class", () => {
      render(<FocalPointEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
      const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
      expect(clickArea.className).toContain("absolute");
      expect(clickArea.className).toContain("inset-0");
    });
  });
});
