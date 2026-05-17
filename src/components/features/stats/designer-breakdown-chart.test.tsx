import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { DesignerBreakdownItem } from "@/types/stats";

// Mock recharts to avoid SSR/canvas issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children, layout }: { children: ReactNode; layout?: string }) => (
    <div data-testid="bar-chart" data-layout={layout}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey, fill }: { children?: ReactNode; dataKey: string; fill?: string }) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill}>
      {children}
    </div>
  ),
  XAxis: ({ type }: { type?: string }) => <div data-testid="x-axis" data-type={type} />,
  YAxis: ({ type, dataKey }: { type?: string; dataKey?: string }) => (
    <div data-testid="y-axis" data-type={type} data-key={dataKey} />
  ),
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

const mockDesignerData: DesignerBreakdownItem[] = [
  { designerId: "d1", name: "Shannon Christine", count: 12 },
  { designerId: "d2", name: "Tiny Modernist", count: 8 },
  { designerId: "d3", name: "Long Dog Samplers", count: 5 },
];

// Dynamic import after mocks
const { DesignerBreakdownChart } = await import("./designer-breakdown-chart");

describe("DesignerBreakdownChart", () => {
  it("renders ChartContainer with designerBarConfig", () => {
    render(<DesignerBreakdownChart data={mockDesignerData} />);

    const container = screen.getByTestId("chart-container");
    const configKeys = container.getAttribute("data-config-keys");
    expect(configKeys).toContain("count");
  });

  it('renders BarChart with layout="vertical"', () => {
    render(<DesignerBreakdownChart data={mockDesignerData} />);

    const chart = screen.getByTestId("bar-chart");
    expect(chart).toHaveAttribute("data-layout", "vertical");
  });

  it('renders XAxis with type="number" and YAxis with type="category"', () => {
    render(<DesignerBreakdownChart data={mockDesignerData} />);

    const xAxis = screen.getByTestId("x-axis");
    expect(xAxis).toHaveAttribute("data-type", "number");

    const yAxis = screen.getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-type", "category");
  });

  it('shows "No designers yet" when data is empty', () => {
    render(<DesignerBreakdownChart data={[]} />);

    expect(screen.getByText("No designers yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it('renders Bar with dataKey="count" and fill="var(--chart-1)"', () => {
    render(<DesignerBreakdownChart data={mockDesignerData} />);

    const bar = screen.getByTestId("bar");
    expect(bar).toHaveAttribute("data-key", "count");
    expect(bar).toHaveAttribute("data-fill", "var(--chart-1)");
  });
});
