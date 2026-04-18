import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { CalculatorSettingsBar } from "./calculator-settings-bar";
import type { CalculatorSettings } from "./types";

// Mock server actions
vi.mock("@/lib/actions/chart-actions", () => ({
  updateProjectSettings: vi.fn(() => Promise.resolve({ success: true })),
}));

const defaultSettings: CalculatorSettings = {
  strandCount: 2,
  overCount: 2,
  fabricCount: 14,
  wastePercent: 20,
};

describe("CalculatorSettingsBar", () => {
  it('renders "STRANDS", "OVER", "FABRIC", "WASTE" labels', () => {
    render(
      <CalculatorSettingsBar
        chartId="chart-1"
        settings={defaultSettings}
        fabricName={null}
        fabricSource="default"
        hasStitchCounts={true}
        onSettingsChange={vi.fn()}
      />,
    );
    expect(screen.getByText("STRANDS")).toBeInTheDocument();
    expect(screen.getByText("OVER")).toBeInTheDocument();
    expect(screen.getByText("FABRIC")).toBeInTheDocument();
    expect(screen.getByText("WASTE")).toBeInTheDocument();
  });

  it("renders current values", () => {
    const { container } = render(
      <CalculatorSettingsBar
        chartId="chart-1"
        settings={defaultSettings}
        fabricName={null}
        fabricSource="default"
        hasStitchCounts={true}
        onSettingsChange={vi.fn()}
      />,
    );
    // Over toggle buttons
    expect(screen.getByRole("button", { name: "Stitch over 1 thread" })).toBeInTheDocument();
    // Fabric count display
    expect(screen.getByText(/14ct/)).toBeInTheDocument();
    // Waste value displays "20%"
    expect(screen.getByText("20%")).toBeInTheDocument();
    // Settings bar container has all expected buttons
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4); // strands, over 1, over 2, waste
  });

  it("hidden when hasStitchCounts=false", () => {
    const { container } = render(
      <CalculatorSettingsBar
        chartId="chart-1"
        settings={defaultSettings}
        fabricName={null}
        fabricSource="default"
        hasStitchCounts={false}
        onSettingsChange={vi.fn()}
      />,
    );
    // Should not render any content
    expect(container.querySelector("[data-testid='settings-bar']")).not.toBeInTheDocument();
  });

  it("visible when hasStitchCounts=true", () => {
    const { container } = render(
      <CalculatorSettingsBar
        chartId="chart-1"
        settings={defaultSettings}
        fabricName={null}
        fabricSource="default"
        hasStitchCounts={true}
        onSettingsChange={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid='settings-bar']")).toBeInTheDocument();
  });

  it('shows "(default)" hint when fabricSource is "default"', () => {
    render(
      <CalculatorSettingsBar
        chartId="chart-1"
        settings={defaultSettings}
        fabricName={null}
        fabricSource="default"
        hasStitchCounts={true}
        onSettingsChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/default/)).toBeInTheDocument();
    expect(screen.getByText(/link a fabric for accuracy/)).toBeInTheDocument();
  });
});
