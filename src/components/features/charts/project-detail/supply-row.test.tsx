import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SupplyRow } from "./supply-row";
import type { SupplyRowData, CalculatorSettings } from "./types";

// Mock server actions
vi.mock("@/lib/actions/supply-actions", () => ({
  updateProjectSupplyQuantity: vi.fn(() => Promise.resolve({ success: true })),
}));

const defaultSettings: CalculatorSettings = {
  strandCount: 2,
  overCount: 2,
  fabricCount: 14,
  wastePercent: 20,
};

function makeThreadRow(overrides?: Partial<SupplyRowData>): SupplyRowData {
  return {
    id: "pt-1",
    type: "thread",
    name: "Black",
    code: "310",
    hexColor: "#000000",
    brandName: "DMC",
    stitchCount: 0,
    quantityRequired: 1,
    quantityAcquired: 0,
    isNeedOverridden: false,
    ...overrides,
  };
}

describe("SupplyRow", () => {
  it("renders color swatch with hex background", () => {
    const { container } = render(
      <SupplyRow
        data={makeThreadRow({ hexColor: "#FF5733" })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    const swatch = container.querySelector("[aria-hidden='true']");
    expect(swatch).toHaveStyle({ backgroundColor: "#FF5733" });
  });

  it("renders color code in semibold mono", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ code: "310", brandName: "DMC" })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/DMC 310/)).toBeInTheDocument();
  });

  it("renders color name", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ name: "Black" })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/Black/)).toBeInTheDocument();
  });

  it("renders stitch count formatted with commas when > 0", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ stitchCount: 12450 })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/12,450/)).toBeInTheDocument();
  });

  it("shows Calculator icon when stitch count > 0 and not overridden", () => {
    render(
      <SupplyRow
        data={makeThreadRow({
          stitchCount: 1000,
          quantityRequired: 3,
          isNeedOverridden: false,
        })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    // Calculator icon should be present with tooltip
    expect(screen.getByLabelText("Auto-calculated")).toBeInTheDocument();
  });

  it('shows "Calc: X" text when isNeedOverridden=true and calculatedNeed !== quantityRequired', () => {
    // With 1000 stitches, 2 strands, 14ct, over 2, 20% waste:
    // calculateSkeins returns 9 (from the formula)
    // quantityRequired is 10 (manually set, differs from 9), so "Calc: 9" should show
    render(
      <SupplyRow
        data={makeThreadRow({
          stitchCount: 1000,
          quantityRequired: 10,
          isNeedOverridden: true,
          calculatedNeed: 9,
        })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/Calc: 9/)).toBeInTheDocument();
  });

  it('does NOT show "Calc: X" when isNeedOverridden=false', () => {
    render(
      <SupplyRow
        data={makeThreadRow({
          stitchCount: 1000,
          quantityRequired: 5,
          isNeedOverridden: false,
          calculatedNeed: 5,
        })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Calc:/)).not.toBeInTheDocument();
  });

  it("renders trash icon button with accessible tooltip", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ name: "Black" })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/Remove Black/i)).toBeInTheDocument();
  });

  it("renders check icon when quantityAcquired >= quantityRequired", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ quantityRequired: 3, quantityAcquired: 3 })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("All acquired")).toBeInTheDocument();
  });

  it("renders warning icon when 0 < quantityAcquired < quantityRequired", () => {
    render(
      <SupplyRow
        data={makeThreadRow({ quantityRequired: 5, quantityAcquired: 2 })}
        settings={defaultSettings}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("2 of 5 acquired")).toBeInTheDocument();
  });
});
