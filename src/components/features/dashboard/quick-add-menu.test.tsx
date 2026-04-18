import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { QuickAddMenu } from "./quick-add-menu";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("QuickAddMenu", () => {
  it("renders 'Quick Add' trigger button", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    expect(screen.getByText("Quick Add")).toBeInTheDocument();
  });

  it("renders 8 action items when menu is open", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    // Open the menu
    fireEvent.click(screen.getByText("Quick Add"));

    // All 8 items
    expect(screen.getByText("Log Stitches")).toBeInTheDocument();
    expect(screen.getByText("New Chart")).toBeInTheDocument();
    expect(screen.getByText("New Thread")).toBeInTheDocument();
    expect(screen.getByText("New Bead")).toBeInTheDocument();
    expect(screen.getByText("New Specialty")).toBeInTheDocument();
    expect(screen.getByText("New Fabric")).toBeInTheDocument();
    expect(screen.getByText("New Designer")).toBeInTheDocument();
    expect(screen.getByText("New Genre")).toBeInTheDocument();
  });

  it("'Log Stitches' item has a border-b separator", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    fireEvent.click(screen.getByText("Quick Add"));

    const logStitchesButton = screen.getByText("Log Stitches").closest("button");
    expect(logStitchesButton?.className).toContain("border-b");
  });

  it("calls onLogStitches callback when 'Log Stitches' is clicked", () => {
    const mockOnLogStitches = vi.fn();
    render(<QuickAddMenu onLogStitches={mockOnLogStitches} />);

    fireEvent.click(screen.getByText("Quick Add"));
    fireEvent.click(screen.getByText("Log Stitches"));

    expect(mockOnLogStitches).toHaveBeenCalledTimes(1);
  });
});
