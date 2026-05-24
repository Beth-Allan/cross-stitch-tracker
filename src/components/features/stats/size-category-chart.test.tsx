import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { SizeBreakdownItem } from "@/types/stats";

// Mock recharts to avoid SSR/canvas issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children, dataKey }: { children: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  XAxis: ({ dataKey }: { dataKey?: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ allowDecimals }: { allowDecimals?: boolean }) => (
    <div data-testid="y-axis" data-allow-decimals={allowDecimals === false ? "false" : "true"} />
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock the chart UI components
vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({
    children,
    config,
  }: {
    children: ReactNode;
    config: Record<string, unknown>;
    className?: string;
  }) => (
    <div data-testid="chart-container" data-config-keys={Object.keys(config).join(",")}>
      {children}
    </div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}));

const mockSizeData: SizeBreakdownItem[] = [
  { category: "Mini", count: 15, fill: "var(--chart-1)" },
  { category: "Small", count: 25, fill: "var(--chart-2)" },
  { category: "Medium", count: 30, fill: "var(--chart-3)" },
  { category: "Large", count: 10, fill: "var(--chart-4)" },
  { category: "BAP", count: 5, fill: "var(--chart-5)" },
];

const emptySizeData: SizeBreakdownItem[] = [
  { category: "Mini", count: 0, fill: "var(--chart-1)" },
  { category: "Small", count: 0, fill: "var(--chart-2)" },
  { category: "Medium", count: 0, fill: "var(--chart-3)" },
  { category: "Large", count: 0, fill: "var(--chart-4)" },
  { category: "BAP", count: 0, fill: "var(--chart-5)" },
];

// Dynamic import after mocks
const { SizeCategoryChart } = await import("./size-category-chart");

describe("SizeCategoryChart", () => {
  it("renders ChartContainer with sizeCategoryConfig", () => {
    render(<SizeCategoryChart data={mockSizeData} />);

    const container = screen.getByTestId("chart-container");
    const configKeys = container.getAttribute("data-config-keys");
    expect(configKeys).toContain("Mini");
    expect(configKeys).toContain("Small");
    expect(configKeys).toContain("Medium");
    expect(configKeys).toContain("Large");
    expect(configKeys).toContain("BAP");
  });

  it("renders BarChart with 5 bars", () => {
    render(<SizeCategoryChart data={mockSizeData} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();

    // 5 cells for 5 size categories
    const cells = screen.getAllByTestId("cell");
    expect(cells).toHaveLength(5);
  });

  it('shows "No projects yet" when all counts are 0', () => {
    render(<SizeCategoryChart data={emptySizeData} />);

    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("disallows decimal tick values on the numeric Y-axis", () => {
    render(<SizeCategoryChart data={mockSizeData} />);

    const yAxis = screen.getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-allow-decimals", "false");
  });

  it("renders cells with correct fill colors from data items", () => {
    render(<SizeCategoryChart data={mockSizeData} />);

    const cells = screen.getAllByTestId("cell");
    expect(cells[0]).toHaveAttribute("data-fill", "var(--chart-1)");
    expect(cells[1]).toHaveAttribute("data-fill", "var(--chart-2)");
    expect(cells[2]).toHaveAttribute("data-fill", "var(--chart-3)");
    expect(cells[3]).toHaveAttribute("data-fill", "var(--chart-4)");
    expect(cells[4]).toHaveAttribute("data-fill", "var(--chart-5)");
  });
});
