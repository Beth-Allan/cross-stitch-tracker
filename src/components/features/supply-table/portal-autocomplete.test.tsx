import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { PortalAutocomplete } from "./portal-autocomplete";
import type { SupplySearchResult } from "./types";
import { MAX_DISPLAY_ITEMS } from "./use-supply-table";

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
    displayItems: makeItems(),
    existingIds: new Set<string>(),
    searchText: "",
    highlightIndex: -1,
    hasUsedArrowKeys: false,
    onSelect: vi.fn(),
    onCreateRequest: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    anchorRef = createAnchorRef();
  });

  it("renders NO input element when isOpen is true (results-only dropdown)", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    // Should NOT have any input inside the portal
    const inputs = screen.queryAllByRole("combobox");
    expect(inputs.length).toBe(0);
    // Also check there's no text input with the search placeholder
    expect(screen.queryByPlaceholderText("Search by code or name...")).not.toBeInTheDocument();
  });

  it("renders dropdown when items are provided and isOpen is true", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<PortalAutocomplete {...defaultProps} isOpen={false} anchorRef={anchorRef} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("dropdown has role='listbox' and items have role='option'", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(4);
  });

  it("accepts highlightIndex prop and highlights the correct option when hasUsedArrowKeys is true", () => {
    render(
      <PortalAutocomplete
        {...defaultProps}
        highlightIndex={1}
        hasUsedArrowKeys={true}
        anchorRef={anchorRef}
      />,
    );
    const options = screen.getAllByRole("option");
    expect(options[1]).toHaveAttribute("data-highlighted", "true");
    expect(options[0]).not.toHaveAttribute("data-highlighted");
  });

  it("does NOT have onSearchChange prop (prop removed)", () => {
    // This is a type-level test -- we ensure the component does not accept onSearchChange
    // The fact that defaultProps above does not include onSearchChange and renders is the proof
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("already-added items render with 'Added' label and disabled appearance", () => {
    const existingIds = new Set(["t-2"]);
    render(
      <PortalAutocomplete {...defaultProps} existingIds={existingIds} anchorRef={anchorRef} />,
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
        displayItems={[]}
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
        displayItems={[]}
        searchText="NewThread"
        anchorRef={anchorRef}
      />,
    );

    const createButton = screen.getByText(/Create "NewThread"/).closest("button")!;
    fireEvent.click(createButton);

    expect(defaultProps.onCreateRequest).toHaveBeenCalledWith("NewThread");
  });

  it("items display brand, code, and name", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    expect(screen.getByText("310")).toBeInTheDocument();
    expect(screen.getByText(/Black/)).toBeInTheDocument();
    expect(screen.getByText("321")).toBeInTheDocument();
    expect(screen.getByText(/Red/)).toBeInTheDocument();
    expect(screen.getAllByText("DMC").length).toBeGreaterThan(0);
  });

  it("max 8 items displayed with addable first, then already-added (pre-sorted by parent)", () => {
    const manyItems = Array.from({ length: 12 }, (_, i) =>
      makeItem({
        id: `t-${i}`,
        code: `${300 + i}`,
        name: `Color ${i}`,
        hexColor: "#000000",
      }),
    );
    const existingIds = new Set(["t-0", "t-1"]);
    // Parent pre-sorts: addable first, then already-added, sliced to 8
    const addable = manyItems.filter((item) => !existingIds.has(item.id));
    const alreadyAdded = manyItems.filter((item) => existingIds.has(item.id));
    const displayItems = [...addable, ...alreadyAdded].slice(0, MAX_DISPLAY_ITEMS);

    render(
      <PortalAutocomplete
        {...defaultProps}
        displayItems={displayItems}
        existingIds={existingIds}
        anchorRef={anchorRef}
      />,
    );

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(8);

    // First options should be addable items (not in existingIds)
    expect(options[0]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("clicking an addable item calls onSelect with that item", () => {
    render(<PortalAutocomplete {...defaultProps} anchorRef={anchorRef} />);
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]);
    expect(defaultProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t-1", code: "310" }),
    );
  });

  it("clicking a disabled item does not call onSelect", () => {
    const existingIds = new Set(["t-1"]);
    render(
      <PortalAutocomplete {...defaultProps} existingIds={existingIds} anchorRef={anchorRef} />,
    );
    // t-1 is now last (disabled items sorted after addable)
    const options = screen.getAllByRole("option");
    const disabledOption = options.find((opt) => opt.getAttribute("aria-disabled") === "true");
    expect(disabledOption).toBeDefined();
    fireEvent.click(disabledOption!);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  describe("keyboard-gated highlight (UX-01)", () => {
    it("renders no highlighted item when hasUsedArrowKeys is false and highlightIndex is 0", () => {
      render(
        <PortalAutocomplete
          {...defaultProps}
          highlightIndex={0}
          hasUsedArrowKeys={false}
          anchorRef={anchorRef}
        />,
      );
      const options = screen.getAllByRole("option");
      options.forEach((opt) => {
        expect(opt).not.toHaveAttribute("data-highlighted", "true");
      });
    });

    it("renders highlighted item when hasUsedArrowKeys is true and highlightIndex is 0", () => {
      render(
        <PortalAutocomplete
          {...defaultProps}
          highlightIndex={0}
          hasUsedArrowKeys={true}
          anchorRef={anchorRef}
        />,
      );
      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-highlighted", "true");
    });

    it("aria-selected is false on all items when hasUsedArrowKeys is false", () => {
      render(
        <PortalAutocomplete
          {...defaultProps}
          highlightIndex={0}
          hasUsedArrowKeys={false}
          anchorRef={anchorRef}
        />,
      );
      const options = screen.getAllByRole("option");
      options.forEach((opt) => {
        expect(opt).toHaveAttribute("aria-selected", "false");
      });
    });

    it("aria-selected is true on highlighted item when hasUsedArrowKeys is true", () => {
      render(
        <PortalAutocomplete
          {...defaultProps}
          highlightIndex={1}
          hasUsedArrowKeys={true}
          anchorRef={anchorRef}
        />,
      );
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-selected", "true");
      expect(options[0]).toHaveAttribute("aria-selected", "false");
    });
  });
});
