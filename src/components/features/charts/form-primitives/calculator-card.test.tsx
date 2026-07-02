import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { CalculatorCard } from "./calculator-card";
import type { CalcParams } from "@/components/features/supply-table/types";

// Mock SearchableSelect since it uses Popover/Command internals
vi.mock("./searchable-select", () => ({
  SearchableSelect: ({
    options,
    value,
    onChange,
    placeholder,
  }: {
    options: { value: string; label: string }[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
  }) => (
    <select
      data-testid="fabric-select"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

// Mock EditableNumber to simplify interaction testing
vi.mock("@/components/features/charts/editable-number", () => ({
  EditableNumber: ({
    value,
    onSave,
    ariaLabel,
    formatDisplay,
  }: {
    value: number;
    onSave: (v: number) => void;
    ariaLabel?: string;
    min?: number;
    max?: number;
    formatDisplay?: (v: number) => string;
    className?: string;
  }) => (
    <button
      data-testid={`editable-${ariaLabel?.toLowerCase().replace(/\s+/g, "-") ?? "number"}`}
      aria-label={ariaLabel}
      onClick={() => onSave(value + 1)}
    >
      {formatDisplay ? formatDisplay(value) : value}
    </button>
  ),
}));

describe("CalculatorCard", () => {
  const defaultCalcParams: CalcParams = {
    fabricCount: 14,
    strandCount: 2,
    overCount: 1,
    wastePercent: 20,
  };

  const defaultFabricOptions = [
    { value: "fab-1", label: "28ct Cashel Linen", count: 28 },
    { value: "fab-2", label: "14ct Aida", count: 14 },
  ];

  const defaultProps = {
    calcParams: defaultCalcParams,
    onCalcParamsChange: vi.fn(),
    fabricId: null as string | null,
    onFabricChange: vi.fn(),
    fabricOptions: defaultFabricOptions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Skein Calculator" title', () => {
    render(<CalculatorCard {...defaultProps} />);
    expect(screen.getByText("Skein Calculator")).toBeInTheDocument();
  });

  it('renders fabric dropdown with "Select fabric..." placeholder when no fabric selected', () => {
    render(<CalculatorCard {...defaultProps} />);
    const select = screen.getByTestId("fabric-select");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Select fabric...")).toBeInTheDocument();
  });

  it("renders Over segmented control with buttons for 1 and 2", () => {
    render(<CalculatorCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: /stitch over 1 thread/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stitch over 2 thread/i })).toBeInTheDocument();
  });

  it("Over button 1 shows active state (aria-pressed=true) when overCount is 1", () => {
    render(<CalculatorCard {...defaultProps} />);
    const over1 = screen.getByRole("button", { name: /stitch over 1 thread/i });
    expect(over1).toHaveAttribute("aria-pressed", "true");
    const over2 = screen.getByRole("button", { name: /stitch over 2 thread/i });
    expect(over2).toHaveAttribute("aria-pressed", "false");
  });

  it("Over button 2 shows active state when overCount is 2", () => {
    render(
      <CalculatorCard {...defaultProps} calcParams={{ ...defaultCalcParams, overCount: 2 }} />,
    );
    const over2 = screen.getByRole("button", { name: /stitch over 2 thread/i });
    expect(over2).toHaveAttribute("aria-pressed", "true");
    const over1 = screen.getByRole("button", { name: /stitch over 1 thread/i });
    expect(over1).toHaveAttribute("aria-pressed", "false");
  });

  it("clicking Over button calls onCalcParamsChange with updated overCount", async () => {
    const user = userEvent.setup();
    const onCalcParamsChange = vi.fn();
    render(<CalculatorCard {...defaultProps} onCalcParamsChange={onCalcParamsChange} />);

    await user.click(screen.getByRole("button", { name: /stitch over 2 thread/i }));
    expect(onCalcParamsChange).toHaveBeenCalledWith({
      ...defaultCalcParams,
      overCount: 2,
    });
  });

  it("renders Strands editable number", () => {
    render(<CalculatorCard {...defaultProps} />);
    expect(screen.getByTestId("editable-strand-count")).toBeInTheDocument();
  });

  it("renders Waste editable number with % suffix", () => {
    render(<CalculatorCard {...defaultProps} />);
    const waste = screen.getByTestId("editable-waste-percentage");
    expect(waste).toBeInTheDocument();
    expect(waste).toHaveTextContent("20%");
  });

  it("selecting fabric calls onFabricChange with fabric ID", async () => {
    const user = userEvent.setup();
    const onFabricChange = vi.fn();
    render(<CalculatorCard {...defaultProps} onFabricChange={onFabricChange} />);

    const select = screen.getByTestId("fabric-select");
    await user.selectOptions(select, "fab-1");
    expect(onFabricChange).toHaveBeenCalledWith("fab-1", 28);
  });

  it("selecting fabric delegates fabricCount update to parent via onFabricChange, not onCalcParamsChange", async () => {
    const user = userEvent.setup();
    const onCalcParamsChange = vi.fn();
    const onFabricChange = vi.fn();
    render(
      <CalculatorCard
        {...defaultProps}
        onCalcParamsChange={onCalcParamsChange}
        onFabricChange={onFabricChange}
      />,
    );

    const select = screen.getByTestId("fabric-select");
    await user.selectOptions(select, "fab-1");
    // Parent handles fabricCount via onFabricChange — child should NOT double-update
    expect(onFabricChange).toHaveBeenCalledWith("fab-1", 28);
    expect(onCalcParamsChange).not.toHaveBeenCalled();
  });

  it('has role="group" and aria-label="Skein calculator settings"', () => {
    render(<CalculatorCard {...defaultProps} />);
    const group = screen.getByRole("group", {
      name: /skein calculator settings/i,
    });
    expect(group).toBeInTheDocument();
  });
});
