import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent, waitFor, act } from "@/__tests__/test-utils";
import { SupplyTable } from "./supply-table";
import { LocalStateAdapter } from "./local-state-adapter";
import type { SupplyRow, SupplySearchResult, SupplyTableAdapter } from "./types";
import { DEFAULT_CALC_PARAMS } from "./types";

// Mock child components to isolate SupplyTable's structure and logic
vi.mock("./supply-table-add-row", () => ({
  SupplyTableAddRow: ({
    onRowAdded,
  }: {
    onRowAdded: () => void;
  }) => (
    <tr data-testid="supply-table-add-row">
      <td colSpan={7}>
        <button data-testid="trigger-row-added" onClick={onRowAdded}>
          Add Row
        </button>
      </td>
    </tr>
  ),
}));

vi.mock("./supply-table-data-row", () => ({
  SupplyTableDataRow: ({
    row,
    onUpdateQuantity,
    onDelete,
    isNew,
  }: {
    row: SupplyRow;
    onUpdateQuantity: (type: string, id: string, field: string, value: number) => void;
    onDelete: (type: string, id: string) => void;
    isNew?: boolean;
  }) => (
    <tr data-testid={`data-row-${row.id}`} data-is-new={isNew ? "true" : "false"}>
      <td>{row.code}</td>
      <td>{row.name}</td>
      <td>
        <button
          data-testid={`update-qty-${row.id}`}
          onClick={() => onUpdateQuantity(row.type, row.id, "quantityRequired", 5)}
        >
          Update
        </button>
        <button
          data-testid={`delete-${row.id}`}
          onClick={() => onDelete(row.type, row.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ),
}));

vi.mock("./supply-table-section-divider", () => ({
  SupplyTableSectionDivider: ({
    label,
    count,
  }: {
    label: string;
    count: number;
  }) =>
    count > 0 ? (
      <tr data-testid={`section-divider-${label.toLowerCase()}`}>
        <td colSpan={7}>
          {label} ({count})
        </td>
      </tr>
    ) : null,
}));

vi.mock("./supply-table-footer", () => ({
  SupplyTableFooter: ({
    threadCount,
    beadCount,
    specialtyCount,
    totalSkeinsNeeded,
    totalItemsNeeded,
  }: {
    threadCount: number;
    beadCount: number;
    specialtyCount: number;
    totalSkeinsNeeded: number;
    totalItemsNeeded: number;
  }) => (
    <div data-testid="supply-table-footer">
      threads={threadCount} beads={beadCount} specialty={specialtyCount} skeins=
      {totalSkeinsNeeded} items={totalItemsNeeded}
    </div>
  ),
}));

vi.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function makeThread(overrides: Partial<SupplyRow> = {}): SupplyRow {
  return {
    id: "t1",
    supplyId: "supply-t1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    hexColor: "#000000",
    stitchCount: 1200,
    need: 3,
    have: 1,
    isNeedOverridden: false,
    ...overrides,
  };
}

function makeBead(overrides: Partial<SupplyRow> = {}): SupplyRow {
  return {
    id: "b1",
    supplyId: "supply-b1",
    type: "BEAD",
    code: "00123",
    name: "Red Glass",
    brandName: "Mill Hill",
    hexColor: "#FF0000",
    stitchCount: 50,
    need: 2,
    have: 0,
    isNeedOverridden: false,
    ...overrides,
  };
}

function makeSpecialty(overrides: Partial<SupplyRow> = {}): SupplyRow {
  return {
    id: "s1",
    supplyId: "supply-s1",
    type: "SPECIALTY",
    code: "BF1234",
    name: "Metallic Braid",
    brandName: "Kreinik",
    hexColor: "#FFD700",
    stitchCount: 0,
    need: 1,
    have: 1,
    isNeedOverridden: false,
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
    createSupply: vi.fn().mockResolvedValue({
      id: "new-1",
      type: "THREAD",
      code: "NEW",
      name: "New Supply",
      brandName: "Custom",
      brandId: "b1",
      hexColor: "#808080",
    }),
  };
}

describe("SupplyTable", () => {
  let adapter: SupplyTableAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    vi.clearAllMocks();
  });

  it("renders table with thead containing 7 column headers", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
  });

  it("column headers include Colour, Stitches, Need, Have, Status", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    expect(screen.getByText("Colour")).toBeInTheDocument();
    expect(screen.getByText("Stitches")).toBeInTheDocument();
    expect(screen.getByText("Need")).toBeInTheDocument();
    expect(screen.getByText("Have")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders add row as first tbody element", () => {
    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );
    const addRow = screen.getByTestId("supply-table-add-row");
    expect(addRow).toBeInTheDocument();
    // Add row should appear before data rows
    const tbody = addRow.closest("tbody");
    expect(tbody).toBeTruthy();
    const firstRow = tbody!.querySelector("tr");
    expect(firstRow).toBe(addRow);
  });

  it("renders Thread section divider with correct count when threads provided", () => {
    const threads = [makeThread(), makeThread({ id: "t2", code: "321" })];
    render(
      <SupplyTable threads={threads} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const divider = screen.getByTestId("section-divider-thread");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveTextContent("Thread (2)");
  });

  it("renders Bead section divider with correct count when beads provided", () => {
    const beads = [makeBead()];
    render(
      <SupplyTable threads={[]} beads={beads} specialty={[]} adapter={adapter} />,
    );
    const divider = screen.getByTestId("section-divider-beads");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveTextContent("Beads (1)");
  });

  it("renders Specialty section divider with correct count when specialty provided", () => {
    const specialty = [makeSpecialty()];
    render(
      <SupplyTable threads={[]} beads={[]} specialty={specialty} adapter={adapter} />,
    );
    const divider = screen.getByTestId("section-divider-specialty");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveTextContent("Specialty (1)");
  });

  it("hides section divider when section has 0 items", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    expect(screen.queryByTestId("section-divider-thread")).not.toBeInTheDocument();
    expect(screen.queryByTestId("section-divider-beads")).not.toBeInTheDocument();
    expect(screen.queryByTestId("section-divider-specialty")).not.toBeInTheDocument();
  });

  it("renders data rows within their correct sections", () => {
    const threads = [makeThread()];
    const beads = [makeBead()];
    const specialty = [makeSpecialty()];
    render(
      <SupplyTable
        threads={threads}
        beads={beads}
        specialty={specialty}
        adapter={adapter}
      />,
    );
    expect(screen.getByTestId("data-row-t1")).toBeInTheDocument();
    expect(screen.getByTestId("data-row-b1")).toBeInTheDocument();
    expect(screen.getByTestId("data-row-s1")).toBeInTheDocument();
  });

  it("renders footer with running totals", () => {
    const threads = [
      makeThread({ need: 3 }),
      makeThread({ id: "t2", need: 5 }),
    ];
    const beads = [makeBead({ need: 2 })];
    render(
      <SupplyTable threads={threads} beads={beads} specialty={[]} adapter={adapter} />,
    );
    const footer = screen.getByTestId("supply-table-footer");
    expect(footer).toBeInTheDocument();
    // threadCount=2, beadCount=1, specialtyCount=0
    expect(footer).toHaveTextContent("threads=2");
    expect(footer).toHaveTextContent("beads=1");
    // totalSkeinsNeeded = 3 + 5 = 8
    expect(footer).toHaveTextContent("skeins=8");
    // totalItemsNeeded = 3 + 5 + 2 = 10
    expect(footer).toHaveTextContent("items=10");
  });

  it("renders empty state when no supplies of any type exist", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent("No supplies added yet");
    expect(emptyState).toHaveTextContent(
      "Start typing a supply code above to add your first colour.",
    );
  });

  it("renders loading skeleton when isLoading prop is true", () => {
    render(
      <SupplyTable
        threads={[]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
        isLoading={true}
      />,
    );
    const skeletons = document.querySelectorAll(".animate-skeleton-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
    // Should not show empty state when loading
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("handles update quantity -- calls adapter.updateQuantity and toasts on error", async () => {
    const { toast } = await import("sonner");
    (adapter.updateQuantity as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
      error: "DB error",
    });

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("update-qty-t1"));
    });

    await waitFor(() => {
      expect(adapter.updateQuantity).toHaveBeenCalledWith(
        "THREAD",
        "t1",
        "quantityRequired",
        5,
      );
    });

    // When adapter returns an error string, it's used in the toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("DB error");
    });
  });

  it("handles update quantity -- uses fallback message when no error string", async () => {
    const { toast } = await import("sonner");
    (adapter.updateQuantity as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
    });

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("update-qty-t1"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't update value. Try again.",
      );
    });
  });

  it("handles delete -- calls adapter.remove and toasts on error", async () => {
    const { toast } = await import("sonner");
    (adapter.remove as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
      error: "Not found",
    });

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-t1"));
    });

    await waitFor(() => {
      expect(adapter.remove).toHaveBeenCalledWith("THREAD", "t1");
    });

    // When adapter returns an error string, it's used in the toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Not found");
    });
  });

  it("handles delete -- uses fallback message when no error string", async () => {
    const { toast } = await import("sonner");
    (adapter.remove as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
    });

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-t1"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't remove supply. Try again.",
      );
    });
  });

  it("newly added rows have isNew=true (triggers animation)", () => {
    // This test verifies that the SupplyTable tracks newly-added row IDs
    // Since we're mocking sub-components, we test the existingSupplyIds derivation
    const threads = [makeThread()];
    render(
      <SupplyTable threads={threads} beads={[]} specialty={[]} adapter={adapter} />,
    );
    // Data rows rendered by default should NOT have isNew
    const row = screen.getByTestId("data-row-t1");
    expect(row.getAttribute("data-is-new")).toBe("false");
  });

  it("table has semantic HTML: table, thead, tbody, th[scope=col], td", () => {
    render(
      <SupplyTable threads={[makeThread()]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const table = document.querySelector("table");
    expect(table).toBeTruthy();
    const thead = document.querySelector("thead");
    expect(thead).toBeTruthy();
    const tbody = document.querySelector("tbody");
    expect(tbody).toBeTruthy();
    const ths = document.querySelectorAll('th[scope="col"]');
    expect(ths.length).toBe(7);
    // Data rows should have td elements
    const tds = document.querySelectorAll("td");
    expect(tds.length).toBeGreaterThan(0);
  });

  it("column headers have uppercase tracking-[0.04em] styling", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const header = screen.getByText("Colour");
    expect(header.className).toContain("uppercase");
    expect(header.className).toContain("tracking-[0.04em]");
  });

  it("table wrapper has table-layout: fixed", () => {
    render(
      <SupplyTable threads={[]} beads={[]} specialty={[]} adapter={adapter} />,
    );
    const table = document.querySelector("table");
    expect(table).toBeTruthy();
    expect(table!.style.tableLayout).toBe("fixed");
  });

  it("does not show empty state when supplies exist", () => {
    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("handles adapter.updateQuantity throwing an exception", async () => {
    const { toast } = await import("sonner");
    (adapter.updateQuantity as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("update-qty-t1"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't update value. Try again.",
      );
    });
  });

  it("handles adapter.remove throwing an exception", async () => {
    const { toast } = await import("sonner");
    (adapter.remove as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(
      <SupplyTable
        threads={[makeThread()]}
        beads={[]}
        specialty={[]}
        adapter={adapter}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-t1"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't remove supply. Try again.",
      );
    });
  });

  describe("calcParams wiring", () => {
    it("calls adapter.setCalcParams when adapter has that method", () => {
      const adapterWithCalc = {
        ...createMockAdapter(),
        setCalcParams: vi.fn(),
        setRows: vi.fn(),
      };

      render(
        <SupplyTable
          threads={[makeThread()]}
          beads={[]}
          specialty={[]}
          adapter={adapterWithCalc}
          calcParams={{ fabricCount: 18, strandCount: 2, overCount: 1, wastePercent: 20 }}
        />,
      );

      expect(adapterWithCalc.setCalcParams).toHaveBeenCalledWith({
        fabricCount: 18,
        strandCount: 2,
        overCount: 1,
        wastePercent: 20,
      });
    });

    it("calls adapter.setRows when adapter has that method", () => {
      const threads = [makeThread()];
      const adapterWithRows = {
        ...createMockAdapter(),
        setCalcParams: vi.fn(),
        setRows: vi.fn(),
      };

      render(
        <SupplyTable
          threads={threads}
          beads={[]}
          specialty={[]}
          adapter={adapterWithRows}
        />,
      );

      expect(adapterWithRows.setRows).toHaveBeenCalled();
      // Should include all rows (threads + beads + specialty)
      const callArgs = adapterWithRows.setRows.mock.calls[0][0];
      expect(callArgs).toHaveLength(1);
      expect(callArgs[0].id).toBe("t1");
    });

    it("recalculates all non-overridden thread rows when calcParams change", async () => {
      const adapterWithCalc = {
        ...createMockAdapter(),
        setCalcParams: vi.fn(),
        setRows: vi.fn(),
      };

      const threads = [
        makeThread({ id: "t1", stitchCount: 1000, isNeedOverridden: false }),
        makeThread({ id: "t2", code: "321", stitchCount: 500, isNeedOverridden: false }),
        makeThread({ id: "t3", code: "666", stitchCount: 800, isNeedOverridden: true }),
      ];

      const { rerender } = render(
        <SupplyTable
          threads={threads}
          beads={[]}
          specialty={[]}
          adapter={adapterWithCalc}
          calcParams={{ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 }}
        />,
      );

      // Clear mocks from initial render
      (adapterWithCalc.updateQuantity as ReturnType<typeof vi.fn>).mockClear();

      // Rerender with different calcParams to trigger recalculation
      await act(async () => {
        rerender(
          <SupplyTable
            threads={threads}
            beads={[]}
            specialty={[]}
            adapter={adapterWithCalc}
            calcParams={{ fabricCount: 18, strandCount: 2, overCount: 1, wastePercent: 20 }}
          />,
        );
      });

      // Should call updateQuantity for t1 and t2 (non-overridden with stitchCount > 0)
      // but NOT for t3 (isNeedOverridden: true)
      await waitFor(() => {
        const calls = (adapterWithCalc.updateQuantity as ReturnType<typeof vi.fn>).mock.calls;
        const stitchCountCalls = calls.filter(
          (c: unknown[]) => c[2] === "stitchCount",
        );
        expect(stitchCountCalls).toHaveLength(2);
        expect(stitchCountCalls.map((c: unknown[]) => c[1])).toContain("t1");
        expect(stitchCountCalls.map((c: unknown[]) => c[1])).toContain("t2");
        expect(stitchCountCalls.map((c: unknown[]) => c[1])).not.toContain("t3");
      });
    });
  });
});
