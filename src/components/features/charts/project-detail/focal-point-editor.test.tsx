import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { FocalPointEditor } from "./focal-point-editor";

// Mock server action
const mockUpdateFocalPoint = vi.fn();
vi.mock("@/lib/actions/focal-point-actions", () => ({
  updateFocalPoint: (...args: unknown[]) => mockUpdateFocalPoint(...args),
}));

// Mock sonner toast
const mockToast = { success: vi.fn(), error: vi.fn() };
vi.mock("sonner", () => ({
  toast: mockToast,
}));

const defaultProps = {
  chartId: "chart-123",
  initialFocalPointX: null,
  initialFocalPointY: null,
  imageUrl: "https://example.com/image.jpg",
};

describe("FocalPointEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateFocalPoint.mockResolvedValue({ success: true });
  });

  it("renders trigger button when imageUrl is provided", () => {
    render(<FocalPointEditor {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /set focal point/i }),
    ).toBeInTheDocument();
  });

  it("does NOT render trigger button when imageUrl is null", () => {
    render(<FocalPointEditor {...defaultProps} imageUrl={null} />);
    expect(
      screen.queryByRole("button", { name: /set focal point/i }),
    ).not.toBeInTheDocument();
  });

  it("enters edit mode when trigger button is clicked", () => {
    render(<FocalPointEditor {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));

    // Action bar buttons should appear
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset to center/i }),
    ).toBeInTheDocument();

    // Trigger button should be hidden in edit mode
    expect(
      screen.queryByRole("button", { name: /set focal point/i }),
    ).not.toBeInTheDocument();
  });

  it("exits edit mode when Cancel is clicked", () => {
    render(<FocalPointEditor {...defaultProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /set focal point/i }));
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Action bar should disappear, trigger should reappear
    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /set focal point/i }),
    ).toBeInTheDocument();
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
    fireEvent.click(
      screen.getByRole("button", { name: /reset to center/i }),
    );

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
    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /set focal point/i }),
    ).toBeInTheDocument();
  });
});
