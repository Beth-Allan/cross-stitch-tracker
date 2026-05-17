import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { StatusBreakdownItem } from "@/types/stats";
import type { ProjectStatus } from "@/generated/prisma/client";

// Mock recharts to avoid SSR/canvas issues in tests
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children, data }: { children: ReactNode; data?: StatusBreakdownItem[] }) => (
    <div data-testid="pie" data-slice-count={data?.length ?? 0}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  Label: ({ content }: { content: (props: Record<string, unknown>) => ReactNode }) => {
    // Call content with mock viewBox to render center label
    const rendered = content({ viewBox: { cx: 125, cy: 125 } });
    return <>{rendered}</>;
  },
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

function createMockData(overrides?: Partial<Record<ProjectStatus, number>>): StatusBreakdownItem[] {
  const defaults: Record<ProjectStatus, number> = {
    UNSTARTED: 10,
    KITTING: 5,
    KITTED: 3,
    IN_PROGRESS: 8,
    ON_HOLD: 2,
    FINISHED: 12,
    FFO: 4,
  };
  const merged = { ...defaults, ...overrides };
  return Object.entries(merged).map(([status, count]) => ({
    status: status as ProjectStatus,
    count,
    fill: `var(--status-${status.toLowerCase().replace("_", "-")})`,
  }));
}

// Import after mocks
const { CollectionStatusChart } = await import("./collection-status-chart");

describe("CollectionStatusChart", () => {
  it("renders without crashing when given valid data", () => {
    const data = createMockData();
    const totalProjects = data.reduce((sum, item) => sum + item.count, 0);

    render(<CollectionStatusChart data={data} totalProjects={totalProjects} />);

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it('renders "No projects yet" message when all counts are 0', () => {
    const data = createMockData({
      UNSTARTED: 0,
      KITTING: 0,
      KITTED: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      FINISHED: 0,
      FFO: 0,
    });

    render(<CollectionStatusChart data={data} totalProjects={0} />);

    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });

  it("renders the chart container with the correct chartConfig (collectionStatusConfig)", () => {
    const data = createMockData();
    const totalProjects = 44;

    render(<CollectionStatusChart data={data} totalProjects={totalProjects} />);

    const container = screen.getByTestId("chart-container");
    // collectionStatusConfig has 7 status keys
    const configKeys = container.getAttribute("data-config-keys");
    expect(configKeys).toContain("UNSTARTED");
    expect(configKeys).toContain("IN_PROGRESS");
    expect(configKeys).toContain("FFO");
  });

  it("displays total project count in the center label", () => {
    const data = createMockData();
    const totalProjects = 44;

    render(<CollectionStatusChart data={data} totalProjects={totalProjects} />);

    expect(screen.getByText("44")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("filters out zero-count statuses from the pie chart data", () => {
    const data = createMockData({
      UNSTARTED: 0,
      KITTING: 0,
      KITTED: 0,
      ON_HOLD: 0,
    });
    const totalProjects = 24; // 8 + 12 + 4

    render(<CollectionStatusChart data={data} totalProjects={totalProjects} />);

    const pie = screen.getByTestId("pie");
    // Only 3 statuses have count > 0: IN_PROGRESS (8), FINISHED (12), FFO (4)
    expect(pie.getAttribute("data-slice-count")).toBe("3");
  });
});
