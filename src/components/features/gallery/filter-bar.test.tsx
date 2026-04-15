import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
  const defaultProps = {
    search: "",
    onSearchChange: vi.fn(),
    statusFilter: [] as string[],
    onStatusToggle: vi.fn(),
    sizeFilter: [] as string[],
    onSizeToggle: vi.fn(),
  };

  it("renders search input with placeholder", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", () => {
    const onSearchChange = vi.fn();
    render(<FilterBar {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(input, { target: { value: "roses" } });
    expect(onSearchChange).toHaveBeenCalledWith("roses");
  });

  it("renders Status and Size dropdown triggers", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /size/i })).toBeInTheDocument();
  });

  it("renders search icon in the search input area", () => {
    const { container } = render(<FilterBar {...defaultProps} />);
    // Search icon (lucide Search) is an SVG inside the search wrapper
    const searchWrapper = container.querySelector("[data-search-wrapper]");
    expect(searchWrapper).toBeInTheDocument();
    const svg = searchWrapper!.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows search value in the input", () => {
    render(<FilterBar {...defaultProps} search="dragon" />);
    const input = screen.getByPlaceholderText("Search projects...") as HTMLInputElement;
    expect(input.value).toBe("dragon");
  });
});
