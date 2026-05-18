import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { MonthlyTotal } from "@/types/stats";

// Mock recharts
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({
    children,
    dataKey,
    onClick,
  }: {
    children: ReactNode;
    dataKey: string;
    onClick?: (data: { payload?: Record<string, unknown> }) => void;
  }) => (
    <div
      data-testid="bar"
      data-key={dataKey}
      onClick={() => onClick?.({ payload: { month: "Jan", totalStitches: 5000, year: 2026 } })}
    >
      {children}
    </div>
  ),
  XAxis: ({ dataKey }: { dataKey?: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  Cell: ({ fill, cursor }: { fill: string; cursor?: string }) => (
    <div data-testid="cell" data-fill={fill} data-cursor={cursor} />
  ),
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock chart UI components
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

// Mock server actions
const mockFetchMonthlyTotals = vi.fn();
const mockFetchDailyBreakdown = vi.fn();
vi.mock("@/lib/actions/stats-actions", () => ({
  fetchMonthlyTotals: (...args: unknown[]) => mockFetchMonthlyTotals(...args),
  fetchDailyBreakdown: (...args: unknown[]) => mockFetchDailyBreakdown(...args),
}));

// Mock MonthlyDrillDown
vi.mock("./monthly-drill-down", () => ({
  MonthlyDrillDown: ({
    isExpanded,
    monthLabel,
  }: {
    isExpanded: boolean;
    monthLabel: string;
    entries: unknown[];
    year: number;
    totalStitches: number;
  }) =>
    isExpanded ? (
      <div data-testid="drill-down">Drill down: {monthLabel}</div>
    ) : (
      <div data-testid="drill-down-collapsed" />
    ),
}));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mockMonthlyData: MonthlyTotal[] = MONTHS.map((month) => ({
  month,
  totalStitches: month === "Jan" ? 5000 : month === "Feb" ? 3000 : 0,
  year: 2026,
}));

const emptyMonthlyData: MonthlyTotal[] = MONTHS.map((month) => ({
  month,
  totalStitches: 0,
  year: 2026,
}));

// Dynamic import after mocks
const { MonthlyStitchChart } = await import("./monthly-stitch-chart");

describe("MonthlyStitchChart", () => {
  it("renders 12 bars (one per month) via Recharts BarChart", () => {
    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    const cells = screen.getAllByTestId("cell");
    expect(cells).toHaveLength(12);
  });

  it('shows "Monthly Stitches — {year}" heading with year value', () => {
    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    expect(screen.getByText(/Monthly Stitches/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("previous year button calls fetchMonthlyTotals with year-1", async () => {
    const newYearData = MONTHS.map((month) => ({
      month,
      totalStitches: 1000,
      year: 2025,
    }));
    mockFetchMonthlyTotals.mockResolvedValue(newYearData);

    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    const prevButton = screen.getByLabelText("Previous year");
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(mockFetchMonthlyTotals).toHaveBeenCalledWith(2025);
    });
  });

  it("next year button calls fetchMonthlyTotals with year+1", async () => {
    const newYearData = MONTHS.map((month) => ({
      month,
      totalStitches: 2000,
      year: 2027,
    }));
    mockFetchMonthlyTotals.mockResolvedValue(newYearData);

    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    const nextButton = screen.getByLabelText("Next year");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockFetchMonthlyTotals).toHaveBeenCalledWith(2027);
    });
  });

  it("clicking a non-zero bar calls fetchDailyBreakdown and shows drill-down", async () => {
    mockFetchDailyBreakdown.mockResolvedValue([
      { date: "2026-01-15", projectId: "p1", chartId: "c1", projectName: "Test", stitchCount: 100 },
    ]);

    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    // Click the bar (mocked to fire at index 0 which is January with 5000 stitches)
    const bar = screen.getByTestId("bar");
    fireEvent.click(bar);

    await waitFor(() => {
      expect(mockFetchDailyBreakdown).toHaveBeenCalledWith(1, 2026);
    });

    await waitFor(() => {
      expect(screen.getByTestId("drill-down")).toBeInTheDocument();
    });
  });

  it("clicking same bar again collapses drill-down", async () => {
    mockFetchDailyBreakdown.mockResolvedValue([
      { date: "2026-01-15", projectId: "p1", chartId: "c1", projectName: "Test", stitchCount: 100 },
    ]);

    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    const bar = screen.getByTestId("bar");

    // First click - expand
    fireEvent.click(bar);
    await waitFor(() => {
      expect(screen.getByTestId("drill-down")).toBeInTheDocument();
    });

    // Second click - collapse
    fireEvent.click(bar);
    await waitFor(() => {
      expect(screen.getByTestId("drill-down-collapsed")).toBeInTheDocument();
    });
  });

  it('empty year shows "No stitching data for {year}" state', () => {
    render(<MonthlyStitchChart data={emptyMonthlyData} initialYear={2026} />);

    expect(screen.getByText("No stitching data for 2026")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it('year nav buttons have aria-label "Previous year" and "Next year"', () => {
    render(<MonthlyStitchChart data={mockMonthlyData} initialYear={2026} />);

    expect(screen.getByLabelText("Previous year")).toBeInTheDocument();
    expect(screen.getByLabelText("Next year")).toBeInTheDocument();
  });
});
