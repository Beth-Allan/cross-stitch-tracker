/**
 * Keyboard-navigation behaviour the main suite does not reach: ArrowUp wiring in
 * supply-table-add-row, and aria-activedescendant tracking the highlighted option.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@/__tests__/test-utils";
import { SupplyTableAddRow } from "./supply-table-add-row";
import type { SupplyTableAdapter, CalcParams, SupplySearchResult } from "./types";
import { DEFAULT_CALC_PARAMS } from "./types";

// Mirror the mocks from the main test file so these tests run in isolation
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

describe("SupplyTableAddRow — keyboard navigation gaps", () => {
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

  // ArrowUp on the search input moves the highlight to the previous non-disabled item. The main
  // test file covers ArrowDown and ArrowDown+Enter, so the ArrowUp path from handleSearchKeyDown
  // to moveHighlight(-1, ...) is verified only here.
  // ──────────────────────────────────────────────────────────────────────────────

  describe("GAP-1: ArrowUp keyboard navigation", () => {
    it("ArrowUp after ArrowDown returns highlight to first item", async () => {
      // Two addable results; ArrowDown twice reaches index 1, ArrowUp returns to index 0.
      const results = [
        makeSearchResult({ id: "t1", code: "310", name: "Black" }),
        makeSearchResult({ id: "t2", code: "321", name: "Red" }),
      ];
      vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

      renderAddRow();

      const searchInput = screen.getByPlaceholderText("Search by code or name...");

      // Trigger search
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "3" } });
      });
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      // ArrowDown twice: highlight moves from -1 → 0 → 1
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });

      // ArrowUp: should move from 1 → 0
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowUp" });
      });

      // After ArrowUp, Enter should select t1 (index 0), not t2
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "Enter" });
      });

      // t1 is selected: its code "310" and name "Black" should appear
      expect(screen.getByText("310")).toBeInTheDocument();
      expect(screen.getByText("Black")).toBeInTheDocument();
    });

    it("ArrowUp when at first item stays on first item (does not go to -1)", async () => {
      // One addable result; ArrowDown to index 0, then ArrowUp should stay at 0.
      // Proof: Enter still selects the item (highlightIndex stayed 0, not went -1).
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

      // Move down to index 0
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });

      // Move up — should stay at 0 (no prev addable item)
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowUp" });
      });

      // Enter should still select t1 (highlight is still on index 0)
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "Enter" });
      });

      expect(screen.getByText("310")).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // GAP-3: aria-activedescendant reflects current highlightIndex
  //
  // Requirement: search input has aria-activedescendant=
  //   "portal-autocomplete-item-{id}" when a result is highlighted.
  //
  // Existing tests verify aria-controls and aria-autocomplete but NOT that
  // aria-activedescendant actually updates when highlightIndex changes. This is
  // the ARIA attribute that screen readers use to announce the active result.
  // ──────────────────────────────────────────────────────────────────────────────

  describe("GAP-3: aria-activedescendant reflects highlighted item", () => {
    it("aria-activedescendant is absent when no item is highlighted (highlightIndex=-1)", async () => {
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

      // No arrow key pressed yet — highlightIndex should be -1, no activedescendant
      expect(searchInput).not.toHaveAttribute("aria-activedescendant");
    });

    it("aria-activedescendant points to highlighted item id after ArrowDown", async () => {
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

      // ArrowDown highlights index 0 (item t1)
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });

      expect(searchInput).toHaveAttribute("aria-activedescendant", "portal-autocomplete-item-t1");
    });

    it("aria-activedescendant updates to second item after two ArrowDowns", async () => {
      const results = [
        makeSearchResult({ id: "t1", code: "310", name: "Black" }),
        makeSearchResult({ id: "t2", code: "321", name: "Red" }),
      ];
      vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

      renderAddRow();

      const searchInput = screen.getByPlaceholderText("Search by code or name...");

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "3" } });
      });
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });

      // Now highlightIndex=1 → t2
      expect(searchInput).toHaveAttribute("aria-activedescendant", "portal-autocomplete-item-t2");
    });

    it("aria-activedescendant clears after new search results arrive (highlightIndex resets to -1)", async () => {
      const results1 = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
      const results2 = [makeSearchResult({ id: "t2", code: "321", name: "Red" })];
      vi.mocked(adapter.searchSupplies).mockResolvedValueOnce(results1);

      renderAddRow();

      const searchInput = screen.getByPlaceholderText("Search by code or name...");

      // First search
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "310" } });
      });
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      // Highlight index 0
      await act(async () => {
        fireEvent.keyDown(searchInput, { key: "ArrowDown" });
      });
      expect(searchInput).toHaveAttribute("aria-activedescendant", "portal-autocomplete-item-t1");

      // New search — results change, highlightIndex resets to -1
      vi.mocked(adapter.searchSupplies).mockResolvedValueOnce(results2);
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "321" } });
      });
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      // aria-activedescendant should be absent (highlightIndex=-1)
      expect(searchInput).not.toHaveAttribute("aria-activedescendant");
    });
  });
});
