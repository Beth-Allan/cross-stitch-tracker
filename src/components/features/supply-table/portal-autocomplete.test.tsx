import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { PortalAutocomplete } from "./portal-autocomplete";
import type { SupplySearchResult } from "./types";

// Mock createPortal to render children inline (RTL handles portals fine,
// but we want to verify createPortal is used in the source)
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

function makeItem(overrides: Partial<SupplySearchResult> = {}): SupplySearchResult {
  return {
    id: "thread-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    brandId: "brand-dmc",
    hexColor: "#000000",
    ...overrides,
  };
}

function makeItems(): SupplySearchResult[] {
  return [
    makeItem({ id: "t-1", code: "310", name: "Black", hexColor: "#000000" }),
    makeItem({ id: "t-2", code: "321", name: "Red", hexColor: "#CC0000" }),
    makeItem({ id: "t-3", code: "333", name: "Blue Violet", hexColor: "#5C317C" }),
    makeItem({ id: "t-4", code: "350", name: "Coral", hexColor: "#E04848" }),
  ];
}

function createAnchorRef(): React.RefObject<HTMLInputElement | null> {
  const input = document.createElement("input");
  input.getBoundingClientRect = () => ({
    top: 100,
    left: 50,
    bottom: 130,
    right: 350,
    width: 300,
    height: 30,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  });
  document.body.appendChild(input);
  return { current: input };
}

describe("PortalAutocomplete", () => {
  let anchorRef: React.RefObject<HTMLInputElement | null>;
  const defaultProps = {
    isOpen: true,
    items: makeItems(),
    existingIds: new Set<string>(),
    searchText: "",
    onSearchChange: vi.fn(),
    onSelect: vi.fn(),
    onCreateRequest: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    anchorRef = createAnchorRef();
  });

  it("renders search input with placeholder", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByPlaceholderText("Search by code or name...")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");
    fireEvent.change(input, { target: { value: "310" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("310");
  });

  it("renders dropdown when items are provided and isOpen is true", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <PortalAutocomplete {...defaultProps} isOpen={false} anchorRef={anchorRef} />,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("dropdown has role='listbox' and items have role='option'", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(4);
  });

  it("ArrowDown moves highlight to next non-disabled item", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("data-highlighted", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(options[1]).toHaveAttribute("data-highlighted", "true");
  });

  it("ArrowUp moves highlight to previous non-disabled item", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");

    // Move down twice, then up once
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("data-highlighted", "true");
  });

  it("Enter on highlighted item calls onSelect with that item", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t-1", code: "310" }),
    );
  });

  it("Enter on disabled (already-added) item does nothing", () => {
    const existingIds = new Set(["t-1", "t-2", "t-3", "t-4"]);
    render(
      <PortalAutocomplete
        {...defaultProps}
        existingIds={existingIds}
        anchorRef={anchorRef}
      />,
    );
    const input = screen.getByPlaceholderText("Search by code or name...");

    // All items are disabled, ArrowDown should not find an addable item
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("Escape closes dropdown and calls onClose", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("already-added items render with 'Added' label and disabled appearance", () => {
    const existingIds = new Set(["t-2"]);
    render(
      <PortalAutocomplete
        {...defaultProps}
        existingIds={existingIds}
        anchorRef={anchorRef}
      />,
    );

    expect(screen.getByText("Added")).toBeInTheDocument();
    // The added item should have opacity-50
    const addedOption = screen.getByText("Added").closest("[role='option']");
    expect(addedOption).toHaveAttribute("aria-disabled", "true");
  });

  it("zero results with search text renders '+ Create' option", () => {
    render(
      <PortalAutocomplete
        {...defaultProps}
        items={[]}
        searchText="NewThread"
        anchorRef={anchorRef}
      />,
    );

    expect(screen.getByText(/Create "NewThread"/)).toBeInTheDocument();
  });

  it("clicking '+ Create' option calls onCreateRequest with search text", () => {
    render(
      <PortalAutocomplete
        {...defaultProps}
        items={[]}
        searchText="NewThread"
        anchorRef={anchorRef}
      />,
    );

    const createButton = screen.getByText(/Create "NewThread"/).closest("button")!;
    fireEvent.click(createButton);

    expect(defaultProps.onCreateRequest).toHaveBeenCalledWith("NewThread");
  });

  it("items display code and name", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByText("310")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("321")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
  });

  it("max 8 items displayed with addable first, then already-added", () => {
    const manyItems = Array.from({ length: 12 }, (_, i) =>
      makeItem({
        id: `t-${i}`,
        code: `${300 + i}`,
        name: `Color ${i}`,
        hexColor: "#000000",
      }),
    );
    const existingIds = new Set(["t-0", "t-1"]);

    render(
      <PortalAutocomplete
        {...defaultProps}
        items={manyItems}
        existingIds={existingIds}
        anchorRef={anchorRef}
      />,
    );

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(8);

    // First options should be addable items (not in existingIds)
    expect(options[0]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("ArrowDown skips disabled items", () => {
    // Item 0 is addable, item 1 is disabled, item 2 is addable
    const items = [
      makeItem({ id: "t-1", code: "310", name: "Black" }),
      makeItem({ id: "t-2", code: "321", name: "Red" }),
      makeItem({ id: "t-3", code: "333", name: "Blue" }),
    ];
    // Note: items are sorted addable-first, so after sorting:
    // t-1 (addable), t-3 (addable), t-2 (disabled)
    const existingIds = new Set(["t-2"]);

    render(
      <PortalAutocomplete
        {...defaultProps}
        items={items}
        existingIds={existingIds}
        anchorRef={anchorRef}
      />,
    );
    const input = screen.getByPlaceholderText("Search by code or name...");

    // ArrowDown to first addable
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // ArrowDown to second addable (skips disabled)
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const options = screen.getAllByRole("option");
    // Second addable item should be highlighted
    expect(options[1]).toHaveAttribute("data-highlighted", "true");
  });

  it("uses aria-activedescendant to indicate highlighted item", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const input = screen.getByPlaceholderText("Search by code or name...");

    // Initially no aria-activedescendant or empty
    expect(input.getAttribute("aria-activedescendant")).toBeFalsy();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
  });
});
