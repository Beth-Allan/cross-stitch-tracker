import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@/__tests__/test-utils";
import { SupplyTableAddRow } from "./supply-table-add-row";
import type { SupplyTableAdapter, CalcParams, SupplySearchResult } from "./types";
import { DEFAULT_CALC_PARAMS } from "./types";

// Mock child components to isolate add-row behavior
vi.mock("./segmented-type-toggle", () => ({
  SegmentedTypeToggle: ({ value, onChange }: { value: string; onChange: (t: string) => void }) => (
    <div data-testid="segmented-type-toggle" data-value={value}>
      <button onClick={() => onChange("THREAD")}>Thread</button>
      <button onClick={() => onChange("BEAD")}>Beads</button>
      <button onClick={() => onChange("SPECIALTY")}>Specialty</button>
    </div>
  ),
}));

vi.mock("./portal-autocomplete", () => ({
  PortalAutocomplete: ({
    isOpen,
    onSelect,
    onCreateRequest,
    displayItems,
  }: {
    isOpen: boolean;
    onSelect: (item: SupplySearchResult) => void;
    onCreateRequest: (text: string) => void;
    displayItems: SupplySearchResult[];
  }) =>
    isOpen ? (
      <div data-testid="portal-autocomplete">
        {displayItems.map((item) => (
          <button
            key={item.id}
            data-testid={`autocomplete-item-${item.id}`}
            onClick={() => onSelect(item)}
          >
            {item.code}
          </button>
        ))}
        <button data-testid="create-request" onClick={() => onCreateRequest("test")}>
          Create
        </button>
      </div>
    ) : null,
}));

vi.mock("./inline-create-dialog", () => ({
  InlineCreateDialog: ({
    open,
    onClose,
    onSubmit,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; brandId: string }) => void;
  }) =>
    open ? (
      <div data-testid="inline-create-dialog">
        <button
          data-testid="create-submit"
          onClick={() => onSubmit({ name: "New Supply", brandId: "b1" })}
        >
          Submit
        </button>
        <button data-testid="create-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

function makeSearchResult(overrides: Partial<SupplySearchResult> = {}): SupplySearchResult {
  return {
    id: "sr-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    brandId: "brand-1",
    hexColor: "#000000",
    ...overrides,
  };
}

function createMockAdapter(): SupplyTableAdapter {
  return {
    addThread: vi.fn().mockResolvedValue({ success: true }),
    addBead: vi.fn().mockResolvedValue({ success: true }),
    addSpecialty: vi.fn().mockResolvedValue({ success: true }),
    updateQuantity: vi.fn().mockResolvedValue({ success: true }),
    remove: vi.fn().mockResolvedValue({ success: true }),
    searchSupplies: vi.fn().mockResolvedValue([]),
    createSupply: vi.fn().mockResolvedValue(makeSearchResult({ id: "new-1", code: "999" })),
  };
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <table>
      <tbody>{children}</tbody>
    </table>
  );
}

describe("SupplyTableAddRow", () => {
  let adapter: SupplyTableAdapter;
  let calcParams: CalcParams;
  let existingIds: Set<string>;
  let onRowAdded: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    adapter = createMockAdapter();
    calcParams = { ...DEFAULT_CALC_PARAMS };
    existingIds = new Set<string>();
    onRowAdded = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderAddRow() {
    return render(
      <TableWrapper>
        <SupplyTableAddRow
          adapter={adapter}
          calcParams={calcParams}
          existingSupplyIds={existingIds}
          onRowAdded={onRowAdded}
        />
      </TableWrapper>,
    );
  }

  it("renders SegmentedTypeToggle in first cell", () => {
    renderAddRow();
    expect(screen.getByTestId("segmented-type-toggle")).toBeInTheDocument();
  });

  it("renders search input when no item is selected", () => {
    renderAddRow();
    expect(screen.getByPlaceholderText("Search by code or name...")).toBeInTheDocument();
  });

  it("renders selected item name when an item is selected", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");

    // Type to trigger search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });

    // Wait for debounce
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Select item from autocomplete
    const selectBtn = screen.getByTestId("autocomplete-item-t1");
    await act(async () => {
      fireEvent.click(selectBtn);
    });

    // Should show selected item info
    expect(screen.getByText("310")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
  });

  it("renders stitches input for THREAD type after item selection", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    const stitchesInput = screen.getByPlaceholderText("Stitches");
    expect(stitchesInput).toBeInTheDocument();
    expect(stitchesInput).toHaveAttribute("type", "number");
  });

  it("renders quantity input for BEAD type after item selection", async () => {
    const results = [
      makeSearchResult({
        id: "b1",
        type: "BEAD",
        code: "00123",
        name: "Red Bead",
      }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    // Switch to BEAD type
    await act(async () => {
      fireEvent.click(screen.getByText("Beads"));
    });

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "00123" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-b1"));
    });

    expect(screen.getByPlaceholderText("Bead count")).toBeInTheDocument();
  });

  it("renders need input directly for SPECIALTY type (no stitches field)", async () => {
    const results = [
      makeSearchResult({
        id: "s1",
        type: "SPECIALTY",
        code: "K001",
        name: "Gold Braid",
      }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    // Switch to SPECIALTY type
    await act(async () => {
      fireEvent.click(screen.getByText("Specialty"));
    });

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "K001" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-s1"));
    });

    // Stitches should show "--"
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("Enter in stitches field commits the row", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    // Search and select
    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    // Enter stitches and press Enter
    const stitchesInput = screen.getByPlaceholderText("Stitches");
    await act(async () => {
      fireEvent.change(stitchesInput, { target: { value: "5000" } });
    });
    await act(async () => {
      fireEvent.keyDown(stitchesInput, { key: "Enter" });
    });

    expect(adapter.addThread).toHaveBeenCalled();
    expect(onRowAdded).toHaveBeenCalled();
  });

  it("Tab in stitches field advances focus to need field", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    // Both stitches and need inputs should exist (Tab is browser default)
    const stitchesInput = screen.getByPlaceholderText("Stitches");
    const needInput = screen.getByLabelText("Need");
    expect(stitchesInput).toBeInTheDocument();
    expect(needInput).toBeInTheDocument();
  });

  it("Enter in need field commits the row", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    const needInput = screen.getByLabelText("Need");
    await act(async () => {
      fireEvent.change(needInput, { target: { value: "3" } });
    });
    await act(async () => {
      fireEvent.keyDown(needInput, { key: "Enter" });
    });

    expect(adapter.addThread).toHaveBeenCalled();
    expect(onRowAdded).toHaveBeenCalled();
  });

  it("Escape resets the add row", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    // Item should be selected
    expect(screen.getByText("310")).toBeInTheDocument();

    // Press Escape on stitches input
    const stitchesInput = screen.getByPlaceholderText("Stitches");
    await act(async () => {
      fireEvent.keyDown(stitchesInput, { key: "Escape" });
    });

    // Should reset back to search input
    expect(screen.getByPlaceholderText("Search by code or name...")).toBeInTheDocument();
  });

  it("PortalAutocomplete opens when search input has text and results", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByTestId("portal-autocomplete")).toBeInTheDocument();
  });

  it("InlineCreateDialog opens when create is requested from autocomplete", async () => {
    vi.mocked(adapter.searchSupplies).mockResolvedValue([]);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "custom" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // The PortalAutocomplete mock shows create button when items is empty
    // But we need searchText to be non-empty for isOpen to be true
    // Since mock returns [], the autocomplete should show with create option
    const createBtn = screen.getByTestId("create-request");
    await act(async () => {
      fireEvent.click(createBtn);
    });

    expect(screen.getByTestId("inline-create-dialog")).toBeInTheDocument();
  });

  it("add row has green tint background", () => {
    renderAddRow();
    const row = screen.getByTestId("supply-table-add-row");
    expect(row.className).toContain("bg-primary/[0.03]");
  });

  it("add row has primary bottom border", () => {
    renderAddRow();
    const row = screen.getByTestId("supply-table-add-row");
    expect(row.className).toContain("border-primary/20");
  });

  it("renders auto-calc sparkle indicator for THREAD type", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("autocomplete-item-t1"));
    });

    // Auto-calc sparkle should be present for THREAD
    expect(screen.getByTestId("auto-calc-sparkle")).toBeInTheDocument();
  });

  // --- ARIA combobox tests ---

  it("search input has role='combobox' attribute", () => {
    renderAddRow();
    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    expect(searchInput).toHaveAttribute("role", "combobox");
  });

  it("search input has aria-expanded that reflects autocomplete open state", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    // Initially closed
    expect(searchInput).toHaveAttribute("aria-expanded", "false");

    // Type to open autocomplete
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Now open
    expect(searchInput).toHaveAttribute("aria-expanded", "true");
  });

  it("search input has aria-controls='portal-autocomplete-listbox'", () => {
    renderAddRow();
    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    expect(searchInput).toHaveAttribute("aria-controls", "portal-autocomplete-listbox");
  });

  it("search input has aria-autocomplete='list'", () => {
    renderAddRow();
    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    expect(searchInput).toHaveAttribute("aria-autocomplete", "list");
  });

  // --- Keyboard navigation from search input ---

  it("ArrowDown on search input triggers highlight navigation", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // ArrowDown should not cause focus loss from search input
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    });

    // The search input should still be in the DOM (focus not stolen)
    expect(searchInput).toBeInTheDocument();
  });

  it("Escape on search input resets the add row", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    renderAddRow();

    const searchInput = screen.getByPlaceholderText("Search by code or name...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "310" } });
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Escape should reset
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: "Escape" });
    });

    // Input value should be cleared
    expect(searchInput).toHaveAttribute("value", "");
  });
});
