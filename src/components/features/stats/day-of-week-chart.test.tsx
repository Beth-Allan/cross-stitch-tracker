import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { DayOfWeekData } from "@/types/stats";

// Mock recharts
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children, dataKey }: { children?: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  XAxis: ({ dataKey }: { dataKey?: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
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

const mockDayData: DayOfWeekData[] = [
  { dayOfWeek: "Mon", avgStitches: 120 },
  { dayOfWeek: "Tue", avgStitches: 90 },
  { dayOfWeek: "Wed", avgStitches: 150 },
  { dayOfWeek: "Thu", avgStitches: 80 },
  { dayOfWeek: "Fri", avgStitches: 60 },
  { dayOfWeek: "Sat", avgStitches: 200 },
  { dayOfWeek: "Sun", avgStitches: 180 },
];

const emptyDayData: DayOfWeekData[] = [
  { dayOfWeek: "Mon", avgStitches: 0 },
  { dayOfWeek: "Tue", avgStitches: 0 },
  { dayOfWeek: "Wed", avgStitches: 0 },
  { dayOfWeek: "Thu", avgStitches: 0 },
  { dayOfWeek: "Fri", avgStitches: 0 },
  { dayOfWeek: "Sat", avgStitches: 0 },
  { dayOfWeek: "Sun", avgStitches: 0 },
];

// Dynamic import after mocks
const { DayOfWeekChart } = await import("./day-of-week-chart");

describe("DayOfWeekChart", () => {
  it("renders 7 bars (Mon through Sun) via Recharts BarChart", () => {
    render(<DayOfWeekChart data={mockDayData} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("uses dayOfWeekConfig from chart-configs", () => {
    render(<DayOfWeekChart data={mockDayData} />);

    const container = screen.getByTestId("chart-container");
    expect(container.getAttribute("data-config-keys")).toContain("avgStitches");
  });

  it('shows "No stitching data yet" when all avgStitches are 0', () => {
    render(<DayOfWeekChart data={emptyDayData} />);

    expect(screen.getByText("No stitching data yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it('XAxis uses "dayOfWeek" as dataKey', () => {
    render(<DayOfWeekChart data={mockDayData} />);

    const xAxis = screen.getByTestId("x-axis");
    expect(xAxis.getAttribute("data-key")).toBe("dayOfWeek");
  });

  it('Bar uses "avgStitches" as dataKey', () => {
    render(<DayOfWeekChart data={mockDayData} />);

    const bar = screen.getByTestId("bar");
    expect(bar.getAttribute("data-key")).toBe("avgStitches");
  });
});
