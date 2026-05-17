import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { GenreBreakdownItem } from "@/types/stats";

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

const mockGenreData: GenreBreakdownItem[] = [
  { genreId: "g1", name: "Fantasy", count: 15 },
  { genreId: "g2", name: "Sampler", count: 10 },
  { genreId: "g3", name: "Floral", count: 8 },
];

// Dynamic import after mocks
const { GenreDistributionChart } = await import("./genre-distribution-chart");

describe("GenreDistributionChart", () => {
  it("renders ChartContainer with genreDistributionConfig", () => {
    render(<GenreDistributionChart data={mockGenreData} />);

    const container = screen.getByTestId("chart-container");
    const configKeys = container.getAttribute("data-config-keys");
    expect(configKeys).toContain("count");
  });

  it('renders BarChart with layout="vertical"', () => {
    render(<GenreDistributionChart data={mockGenreData} />);

    const chart = screen.getByTestId("bar-chart");
    expect(chart).toHaveAttribute("data-layout", "vertical");
  });

  it('shows "No genres yet" when data is empty', () => {
    render(<GenreDistributionChart data={[]} />);

    expect(screen.getByText("No genres yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it('renders Bar with dataKey="count" and fill="var(--chart-3)"', () => {
    render(<GenreDistributionChart data={mockGenreData} />);

    const bar = screen.getByTestId("bar");
    expect(bar).toHaveAttribute("data-key", "count");
    expect(bar).toHaveAttribute("data-fill", "var(--chart-3)");
  });
});
