import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { FilterChips } from "./filter-chips";

describe("FilterChips", () => {
  const defaultProps = {
    search: "",
    statusFilter: [] as string[],
    sizeFilter: [] as string[],
    seriesFilter: [] as string[],
    seriesNames: {} as Record<string, string>,
    onRemoveSearch: vi.fn(),
    onRemoveStatus: vi.fn(),
    onRemoveSize: vi.fn(),
    onRemoveSeries: vi.fn(),
    onClearAll: vi.fn(),
  };

  it("returns null when no filters active", () => {
    const { container } = render(<FilterChips {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders search chip with search text", () => {
    render(<FilterChips {...defaultProps} search="unicorn" />);
    expect(screen.getByText(/search: unicorn/i)).toBeInTheDocument();
  });

  it("renders status chip with display label", () => {
    render(<FilterChips {...defaultProps} statusFilter={["IN_PROGRESS"]} />);
    // Should show "Status: Stitching" (from STATUS_CONFIG), not "Status: IN_PROGRESS"
    expect(screen.getByText(/status: stitching/i)).toBeInTheDocument();
  });

  it("renders size chip", () => {
    render(<FilterChips {...defaultProps} sizeFilter={["BAP"]} />);
    expect(screen.getByText(/size: bap/i)).toBeInTheDocument();
  });

  it("calls onRemoveStatus when X clicked on status chip", () => {
    const onRemoveStatus = vi.fn();
    render(
      <FilterChips {...defaultProps} statusFilter={["FINISHED"]} onRemoveStatus={onRemoveStatus} />,
    );

    const removeButton = screen.getByRole("button", {
      name: /remove.*status.*finished/i,
    });
    fireEvent.click(removeButton);
    expect(onRemoveStatus).toHaveBeenCalledWith("FINISHED");
  });

  it("calls onRemoveSearch when X clicked on search chip", () => {
    const onRemoveSearch = vi.fn();
    render(<FilterChips {...defaultProps} search="test" onRemoveSearch={onRemoveSearch} />);

    const removeButton = screen.getByRole("button", {
      name: /remove.*search/i,
    });
    fireEvent.click(removeButton);
    expect(onRemoveSearch).toHaveBeenCalledWith();
  });

  it("renders Clear all link that calls onClearAll", () => {
    const onClearAll = vi.fn();
    render(<FilterChips {...defaultProps} search="something" onClearAll={onClearAll} />);
    const clearAll = screen.getByText("Clear all");
    fireEvent.click(clearAll);
    expect(onClearAll).toHaveBeenCalled();
  });

  it("renders 'Series: {name}' chip for named series filter", () => {
    render(<FilterChips {...defaultProps} seriesFilter={["s1"]} seriesNames={{ s1: "Dragons" }} />);
    expect(screen.getByText("Series: Dragons")).toBeInTheDocument();
  });

  it("renders 'Series: Unassigned' chip for __unassigned__ filter", () => {
    render(
      <FilterChips
        {...defaultProps}
        seriesFilter={["__unassigned__"]}
        seriesNames={{ __unassigned__: "Unassigned" }}
      />,
    );
    expect(screen.getByText("Series: Unassigned")).toBeInTheDocument();
  });

  it("hasFilters includes seriesFilter check", () => {
    const { container } = render(
      <FilterChips {...defaultProps} seriesFilter={["s1"]} seriesNames={{ s1: "Dragons" }} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("chip aria-label follows 'Remove Series: {name} filter' pattern", () => {
    render(<FilterChips {...defaultProps} seriesFilter={["s1"]} seriesNames={{ s1: "Dragons" }} />);
    expect(
      screen.getByRole("button", { name: "Remove Series: Dragons filter" }),
    ).toBeInTheDocument();
  });
});
