import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { ViewToggleBar } from "./view-toggle-bar";
import type { ViewMode, SortField, SortDir } from "./gallery-types";

describe("ViewToggleBar", () => {
  const defaultProps = {
    view: "gallery" as ViewMode,
    onViewChange: vi.fn(),
    sort: "dateAdded" as SortField,
    dir: "desc" as SortDir,
    onSortChange: vi.fn(),
    totalCount: 42,
    filteredCount: 42,
    hasActiveFilters: false,
  };

  it("shows total projects count when no filters active", () => {
    render(<ViewToggleBar {...defaultProps} />);
    expect(screen.getByText("42 projects")).toBeInTheDocument();
  });

  it("shows filtered of total when filters active", () => {
    render(
      <ViewToggleBar
        {...defaultProps}
        filteredCount={15}
        hasActiveFilters={true}
      />,
    );
    expect(screen.getByText("15 of 42 projects")).toBeInTheDocument();
  });

  it("renders 3 view buttons with sr-only labels", () => {
    render(<ViewToggleBar {...defaultProps} />);
    expect(screen.getByText("Cards view")).toBeInTheDocument();
    expect(screen.getByText("List view")).toBeInTheDocument();
    expect(screen.getByText("Table view")).toBeInTheDocument();
  });

  it("active view button has active styling", () => {
    render(<ViewToggleBar {...defaultProps} view="gallery" />);
    // Find the button that contains the "Cards view" sr-only text
    const cardsButton = screen.getByText("Cards view").closest("button");
    expect(cardsButton).toBeInTheDocument();
    expect(cardsButton!.className).toContain("shadow-sm");
  });

  it("calls onViewChange with correct mode when button clicked", () => {
    const onViewChange = vi.fn();
    render(
      <ViewToggleBar {...defaultProps} onViewChange={onViewChange} />,
    );

    const listButton = screen.getByText("List view").closest("button");
    fireEvent.click(listButton!);

    expect(onViewChange).toHaveBeenCalledWith("list");
  });

  it("renders SortDropdown", () => {
    render(<ViewToggleBar {...defaultProps} />);
    // SortDropdown renders a button with "Sort by" in its aria-label
    expect(
      screen.getByRole("button", { name: /sort by/i }),
    ).toBeInTheDocument();
  });

  it("includes tooltip strings for view modes", () => {
    render(<ViewToggleBar {...defaultProps} />);
    // Tooltips are on the buttons via title attribute
    const cardsButton = screen.getByText("Cards view").closest("button");
    expect(cardsButton).toHaveAttribute(
      "title",
      "Visual cards with cover images and status details",
    );
  });
});
