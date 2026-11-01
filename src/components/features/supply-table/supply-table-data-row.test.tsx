import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SupplyTableDataRow } from "./supply-table-data-row";
import type { SupplyRow } from "./types";
import type { SkeinLine } from "@/types/supply";

const DMC_LINE: SkeinLine = { skeinLengthMm: 8000, strandStructure: "SIX_STRAND" };
const UNKNOWN_LINE: SkeinLine = { skeinLengthMm: null, strandStructure: null };

// Mock the tooltip portal to avoid portaling issues in tests
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="tooltip-content">{children}</span>
  ),
}));

function makeRow(overrides: Partial<SupplyRow> = {}): SupplyRow {
  return {
    id: "junction-1",
    supplyId: "supply-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    hexColor: "#000000",
    stitchCount: 1200,
    need: 3,
    have: 1,
    isNeedOverridden: false,
    line: DMC_LINE,
    ...overrides,
  };
}

function renderRow(
  row: SupplyRow,
  props: Partial<{
    onUpdateQuantity: ReturnType<typeof vi.fn>;
    onDelete: ReturnType<typeof vi.fn>;
    isNew: boolean;
    calculatedNeed: number | null;
    onBackToCalculated: ReturnType<typeof vi.fn>;
  }> = {},
) {
  const onUpdateQuantity = props.onUpdateQuantity ?? vi.fn();
  const onDelete = props.onDelete ?? vi.fn();
  return render(
    <table>
      <tbody>
        <SupplyTableDataRow
          row={row}
          onUpdateQuantity={onUpdateQuantity}
          onDelete={onDelete}
          isNew={props.isNew}
          calculatedNeed={props.calculatedNeed}
          onBackToCalculated={props.onBackToCalculated}
        />
      </tbody>
    </table>,
  );
}

describe("SupplyTableDataRow", () => {
  it("renders ColorSwatch with the row's hexColor", () => {
    renderRow(makeRow({ hexColor: "#FF5733" }));
    const swatch = document.querySelector('[aria-hidden="true"]');
    expect(swatch).toBeInTheDocument();
    expect(swatch).toHaveStyle({ backgroundColor: "#FF5733" });
  });

  it("renders supply code in mono font and supply name in muted text", () => {
    renderRow(makeRow({ code: "310", name: "Black" }));
    const code = screen.getByText("310");
    expect(code).toBeInTheDocument();
    expect(code.className).toContain("font-mono");

    const name = screen.getByText("Black");
    expect(name).toBeInTheDocument();
    expect(name.className).toContain("text-muted-foreground");
  });

  it("renders stitches EditableNumber for THREAD type", () => {
    renderRow(makeRow({ type: "THREAD", stitchCount: 1200 }));
    const stitchBtn = screen.getByRole("button", { name: "Stitches for 310" });
    expect(stitchBtn).toBeInTheDocument();
    expect(stitchBtn).toHaveTextContent("1200");
  });

  it("renders stitches EditableNumber for BEAD type (shows bead count)", () => {
    renderRow(makeRow({ type: "BEAD", stitchCount: 50, code: "BEA-01" }));
    const beadBtn = screen.getByRole("button", { name: "Bead count for BEA-01" });
    expect(beadBtn).toBeInTheDocument();
    expect(beadBtn).toHaveTextContent("50");
  });

  it("renders dash in stitches column for SPECIALTY type", () => {
    renderRow(makeRow({ type: "SPECIALTY" }));
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("renders arrow icon for THREAD and BEAD types, hidden for SPECIALTY", () => {
    const { unmount } = renderRow(makeRow({ type: "THREAD" }));
    expect(document.querySelector('[data-testid="arrow-icon"]')).toBeInTheDocument();
    unmount();

    const { unmount: unmount2 } = renderRow(makeRow({ type: "BEAD" }));
    expect(document.querySelector('[data-testid="arrow-icon"]')).toBeInTheDocument();
    unmount2();

    renderRow(makeRow({ type: "SPECIALTY" }));
    expect(document.querySelector('[data-testid="arrow-icon"]')).not.toBeInTheDocument();
  });

  it('renders need EditableNumber with unit label ("sk" for thread, "pkg" for bead, "item" for specialty)', () => {
    const { unmount } = renderRow(makeRow({ type: "THREAD", code: "310" }));
    expect(screen.getByRole("button", { name: "Need for 310" })).toBeInTheDocument();
    expect(screen.getByText("sk")).toBeInTheDocument();
    unmount();

    const { unmount: unmount2 } = renderRow(makeRow({ type: "BEAD", code: "BEA" }));
    expect(screen.getByRole("button", { name: "Need for BEA" })).toBeInTheDocument();
    expect(screen.getByText("pkg")).toBeInTheDocument();
    unmount2();

    renderRow(makeRow({ type: "SPECIALTY", code: "SPEC" }));
    expect(screen.getByRole("button", { name: "Need for SPEC" })).toBeInTheDocument();
    expect(screen.getByText("item")).toBeInTheDocument();
  });

  it("renders auto-calc Sparkles indicator when type is THREAD and isNeedOverridden is false", () => {
    renderRow(makeRow({ type: "THREAD", isNeedOverridden: false }));
    expect(document.querySelector('[data-testid="auto-calc-indicator"]')).toBeInTheDocument();
  });

  it("does NOT render Sparkles when isNeedOverridden is true", () => {
    renderRow(makeRow({ type: "THREAD", isNeedOverridden: true }));
    expect(document.querySelector('[data-testid="auto-calc-indicator"]')).not.toBeInTheDocument();
  });

  it("renders have EditableNumber", () => {
    renderRow(makeRow({ code: "310", have: 2 }));
    const haveBtn = screen.getByRole("button", { name: "Have for 310" });
    expect(haveBtn).toBeInTheDocument();
    expect(haveBtn).toHaveTextContent("2");
  });

  it("renders StatusDonut with have/need values", () => {
    renderRow(makeRow({ have: 1, need: 3 }));
    // StatusDonut renders an SVG with a <title> element
    expect(screen.getByTitle("1 of 3")).toBeInTheDocument();
  });

  it("delete button has opacity-0 class (hidden by default)", () => {
    renderRow(makeRow());
    const deleteBtn = screen.getByRole("button", { name: "Remove 310" });
    expect(deleteBtn.className).toContain("opacity-0");
  });

  it('delete button has aria-label "Remove {code}"', () => {
    renderRow(makeRow({ code: "DMC-310" }));
    const deleteBtn = screen.getByRole("button", { name: "Remove DMC-310" });
    expect(deleteBtn).toBeInTheDocument();
  });

  it("clicking delete calls onDelete with row id and type", () => {
    const onDelete = vi.fn();
    renderRow(makeRow({ id: "junc-42", type: "BEAD" }), { onDelete });
    const deleteBtn = screen.getByRole("button", { name: "Remove 310" });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("BEAD", "junc-42");
  });

  it("row has animate-slide-in class when isNew prop is true", () => {
    renderRow(makeRow(), { isNew: true });
    const row = document.querySelector("tr.animate-slide-in");
    expect(row).toBeInTheDocument();
  });

  it("refuses a need of 0", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ code: "310", need: 3 }), { onUpdateQuantity });

    fireEvent.click(screen.getByRole("button", { name: "Need for 310" }));
    const input = screen.getByRole("spinbutton", { name: "Need for 310" });
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateQuantity).not.toHaveBeenCalled();
  });

  it("opening a Need cell and leaving it unchanged does not save, so it is not marked as typed", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ code: "310", need: 3 }), { onUpdateQuantity });

    fireEvent.click(screen.getByRole("button", { name: "Need for 310" }));
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Need for 310" }));

    expect(onUpdateQuantity).not.toHaveBeenCalled();
    expect(screen.getByTestId("auto-calc-indicator")).toBeInTheDocument();
  });

  it("re-entering the stitch count of an Unknown need saves, so the calculator works it out", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ id: "junc-1", code: "310", stitchCount: 500, need: null }), {
      onUpdateQuantity,
    });

    fireEvent.click(screen.getByRole("button", { name: "Stitches for 310" }));
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Stitches for 310" }));

    expect(onUpdateQuantity).toHaveBeenCalledWith("THREAD", "junc-1", "stitchCount", 500);
  });

  it("leaving the stitch count of a known need unchanged does not save", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ code: "310", stitchCount: 500, need: 3 }), { onUpdateQuantity });

    fireEvent.click(screen.getByRole("button", { name: "Stitches for 310" }));
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Stitches for 310" }));

    expect(onUpdateQuantity).not.toHaveBeenCalled();
  });

  it("a need changed by hand still saves", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ type: "THREAD", id: "junc-1", code: "310", need: 3 }), {
      onUpdateQuantity,
    });

    fireEvent.click(screen.getByRole("button", { name: "Need for 310" }));
    const input = screen.getByRole("spinbutton", { name: "Need for 310" });
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.blur(input);

    expect(onUpdateQuantity).toHaveBeenCalledWith("THREAD", "junc-1", "need", 5);
  });

  it("onUpdateQuantity is called with correct args when EditableNumber saves", () => {
    const onUpdateQuantity = vi.fn();
    renderRow(makeRow({ type: "THREAD", id: "junc-1", code: "310", have: 1 }), {
      onUpdateQuantity,
    });

    // Click the have button to enter edit mode
    const haveBtn = screen.getByRole("button", { name: "Have for 310" });
    fireEvent.click(haveBtn);

    // Change value and press Enter
    const input = screen.getByRole("spinbutton", { name: "Have for 310" });
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateQuantity).toHaveBeenCalledWith("THREAD", "junc-1", "have", 5);
  });

  describe("back to calculated", () => {
    const markedRow = () => makeRow({ code: "310", need: 30, isNeedOverridden: true });
    const backButton = () => screen.queryByRole("button", { name: "Back to calculated for 310" });

    it("offers the button on a marked line, naming the figure it would give", () => {
      renderRow(markedRow(), { calculatedNeed: 23, onBackToCalculated: vi.fn() });

      expect(backButton()).toBeInTheDocument();
      expect(screen.getByText("Back to calculated: 23 sk")).toBeInTheDocument();
    });

    it("hands the row and its figure back on one click, without opening the Need cell", () => {
      const onBackToCalculated = vi.fn();
      renderRow(markedRow(), { calculatedNeed: 23, onBackToCalculated });

      fireEvent.click(backButton()!);

      expect(onBackToCalculated).toHaveBeenCalledExactlyOnceWith("junction-1", 23);
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    });

    it("is a plain button, so it can never submit a form around it", () => {
      renderRow(markedRow(), { calculatedNeed: 23, onBackToCalculated: vi.fn() });

      expect(backButton()).toHaveAttribute("type", "button");
    });

    it("offers nothing when there is no figure to give", () => {
      renderRow(markedRow(), { calculatedNeed: null, onBackToCalculated: vi.fn() });

      expect(backButton()).not.toBeInTheDocument();
    });

    it("offers nothing to a row rendered without the handler", () => {
      renderRow(markedRow());

      expect(backButton()).not.toBeInTheDocument();
    });

    it("sits where the sparkle would, which a marked line does not show", () => {
      renderRow(markedRow(), { calculatedNeed: 23, onBackToCalculated: vi.fn() });

      expect(document.querySelector('[data-testid="auto-calc-indicator"]')).not.toBeInTheDocument();
    });
  });

  describe("a need it cannot work out", () => {
    const unknownRow = () =>
      makeRow({ code: "002", need: null, have: 1, stitchCount: 5000, line: UNKNOWN_LINE });

    it("shows the need as Unknown, never 0 or 1", () => {
      renderRow(unknownRow());

      const needBtn = screen.getByRole("button", { name: "Need for 002" });
      expect(needBtn).toHaveTextContent("Unknown");
      expect(needBtn).not.toHaveTextContent(/\d/);
    });

    it("says Unknown in the status too", () => {
      renderRow(unknownRow());

      expect(screen.getByTitle("1 of Unknown")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip-content")).toHaveTextContent("1 of Unknown");
    });

    it("still takes a need typed by hand", () => {
      const onUpdateQuantity = vi.fn();
      renderRow(unknownRow(), { onUpdateQuantity });

      fireEvent.click(screen.getByRole("button", { name: "Need for 002" }));
      const input = screen.getByRole("spinbutton", { name: "Need for 002" });
      fireEvent.change(input, { target: { value: "3" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onUpdateQuantity).toHaveBeenCalledWith("THREAD", "junction-1", "need", 3);
    });
  });

  it("does not render Sparkles for BEAD type regardless of isNeedOverridden", () => {
    renderRow(makeRow({ type: "BEAD", isNeedOverridden: false }));
    expect(document.querySelector('[data-testid="auto-calc-indicator"]')).not.toBeInTheDocument();
  });
});
