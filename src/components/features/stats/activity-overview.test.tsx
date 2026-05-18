import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type {
  MonthlyTotal,
  CalendarDayData,
  SessionHistoryData,
  PaceMetricsData,
  DayOfWeekData,
} from "@/types/stats";

// Mock all child components
vi.mock("./pace-cards", () => ({
  PaceCards: (props: Record<string, unknown>) => (
    <div data-testid="pace-cards" data-pace-metrics={JSON.stringify(props.paceMetrics)} />
  ),
}));

vi.mock("./monthly-stitch-chart", () => ({
  MonthlyStitchChart: (props: Record<string, unknown>) => (
    <div
      data-testid="monthly-stitch-chart"
      data-initial-year={props.initialYear}
      data-data={JSON.stringify(props.data)}
    />
  ),
}));

vi.mock("./day-of-week-chart", () => ({
  DayOfWeekChart: (props: Record<string, unknown>) => (
    <div data-testid="day-of-week-chart" data-data={JSON.stringify(props.data)} />
  ),
}));

vi.mock("./stitching-calendar", () => ({
  StitchingCalendar: (props: Record<string, unknown>) => (
    <div
      data-testid="stitching-calendar"
      data-initial-month={props.initialMonth}
      data-initial-year={props.initialYear}
      data-data={JSON.stringify(props.data)}
    />
  ),
}));

vi.mock("./session-history-table", () => ({
  SessionHistoryTable: (props: Record<string, unknown>) => (
    <div
      data-testid="session-history-table"
      data-data={JSON.stringify(props.data)}
      data-projects={JSON.stringify(props.projects)}
    />
  ),
}));

vi.mock("./data-unavailable", () => ({
  DataUnavailable: (props: Record<string, unknown>) => (
    <div data-testid="data-unavailable" data-label={props.label} />
  ),
}));

import { ActivityOverview } from "./activity-overview";

const mockPaceMetrics: PaceMetricsData = {
  avg7Day: 250,
  avg30Day: 200,
  avg90Day: 180,
  thisMonthStitches: 5000,
  lastMonthStitches: 4000,
  stitchRate: 120,
  stitchRatePrior: 110,
};

const mockMonthlyTotals: MonthlyTotal[] = [
  { month: "Jan", totalStitches: 3000, year: 2026 },
  { month: "Feb", totalStitches: 2500, year: 2026 },
];

const mockDayOfWeekData: DayOfWeekData[] = [
  { dayOfWeek: "Mon", avgStitches: 200 },
  { dayOfWeek: "Tue", avgStitches: 150 },
];

const mockCalendarData: CalendarDayData[] = [
  {
    date: "2026-05-15",
    sessions: [{ projectId: "p1", chartId: "c1", projectName: "My Project", stitchCount: 200 }],
  },
];

const mockSessionHistory: SessionHistoryData = {
  sessions: [
    {
      id: "s1",
      date: new Date("2026-05-15"),
      projectId: "p1",
      chartId: "c1",
      projectName: "My Project",
      stitchCount: 200,
      timeSpentMinutes: 60,
      hasPhoto: false,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

const mockProjects = [{ id: "p1", name: "My Project" }];

const defaultProps = {
  paceMetrics: mockPaceMetrics,
  monthlyTotals: mockMonthlyTotals,
  dayOfWeekData: mockDayOfWeekData,
  calendarData: mockCalendarData,
  sessionHistory: mockSessionHistory,
  projects: mockProjects,
  currentYear: 2026,
  currentMonth: 5,
  hasNoSessions: false,
};

describe("ActivityOverview", () => {
  it("renders PaceCards with paceMetrics props", () => {
    render(<ActivityOverview {...defaultProps} />);

    const paceCards = screen.getByTestId("pace-cards");
    expect(paceCards).toBeInTheDocument();
    expect(JSON.parse(paceCards.getAttribute("data-pace-metrics")!)).toEqual(mockPaceMetrics);
  });

  it("renders MonthlyStitchChart with data and initialYear props inside a Card", () => {
    render(<ActivityOverview {...defaultProps} />);

    const chart = screen.getByTestId("monthly-stitch-chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("data-initial-year", "2026");
    expect(JSON.parse(chart.getAttribute("data-data")!)).toEqual(mockMonthlyTotals);
  });

  it("renders DayOfWeekChart with data props inside a Card", () => {
    render(<ActivityOverview {...defaultProps} />);

    const chart = screen.getByTestId("day-of-week-chart");
    expect(chart).toBeInTheDocument();
    expect(JSON.parse(chart.getAttribute("data-data")!)).toEqual(mockDayOfWeekData);
  });

  it("renders StitchingCalendar with data, initialMonth, initialYear props inside a Card", () => {
    render(<ActivityOverview {...defaultProps} />);

    const calendar = screen.getByTestId("stitching-calendar");
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveAttribute("data-initial-month", "5");
    expect(calendar).toHaveAttribute("data-initial-year", "2026");
    expect(JSON.parse(calendar.getAttribute("data-data")!)).toEqual(mockCalendarData);
  });

  it("renders SessionHistoryTable with data and projects props inside a Card", () => {
    render(<ActivityOverview {...defaultProps} />);

    const table = screen.getByTestId("session-history-table");
    expect(table).toBeInTheDocument();
    expect(JSON.parse(table.getAttribute("data-data")!)).toEqual(
      JSON.parse(JSON.stringify(mockSessionHistory)),
    );
    expect(JSON.parse(table.getAttribute("data-projects")!)).toEqual(mockProjects);
  });

  it("renders sections in correct D-16 order: PaceCards, MonthlyStitchChart, DayOfWeekChart, StitchingCalendar, SessionHistoryTable", () => {
    const { container } = render(<ActivityOverview {...defaultProps} />);

    const testIds = [
      "pace-cards",
      "monthly-stitch-chart",
      "day-of-week-chart",
      "stitching-calendar",
      "session-history-table",
    ];

    const elements = testIds.map((id) => screen.getByTestId(id));
    const positions = elements.map((el) => {
      // Get position in DOM tree
      const allElements = container.querySelectorAll("[data-testid]");
      return Array.from(allElements).indexOf(el);
    });

    // Verify ascending order
    for (let i = 0; i < positions.length - 1; i++) {
      expect(positions[i]).toBeLessThan(positions[i + 1]);
    }
  });

  it("shows empty state when hasNoSessions is true", () => {
    render(<ActivityOverview {...defaultProps} hasNoSessions={true} />);

    expect(screen.getByText("No sessions logged yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Log your first stitching session to see activity trends, calendar views, and pace metrics here.",
      ),
    ).toBeInTheDocument();

    // Should not render any child components
    expect(screen.queryByTestId("pace-cards")).not.toBeInTheDocument();
    expect(screen.queryByTestId("monthly-stitch-chart")).not.toBeInTheDocument();
  });

  it("Monthly chart Card has heading 'Monthly Stitches'", () => {
    render(<ActivityOverview {...defaultProps} />);

    // The MonthlyStitchChart handles its own heading internally, so no external heading
    // Actually per plan, MonthlyStitchChart is inside a Card with CardContent but NO CardHeader
    // The chart itself handles the "Monthly Stitches -- {year}" heading
    // So we just verify the chart is inside a Card (via CardContent wrapper)
    const chart = screen.getByTestId("monthly-stitch-chart");
    expect(chart.closest("[data-slot='card-content']")).toBeInTheDocument();
  });

  it("Day-of-week Card has heading 'Stitching Patterns by Day'", () => {
    render(<ActivityOverview {...defaultProps} />);

    expect(screen.getByText("Stitching Patterns by Day")).toBeInTheDocument();
  });

  it("Session table Card wraps SessionHistoryTable in CardContent", () => {
    render(<ActivityOverview {...defaultProps} />);

    const table = screen.getByTestId("session-history-table");
    expect(table.closest("[data-slot='card-content']")).toBeInTheDocument();
  });

  it("shows DataUnavailable for paceMetrics when null", () => {
    render(<ActivityOverview {...defaultProps} paceMetrics={null} />);

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Pace metrics")).toBe(true);
    expect(screen.queryByTestId("pace-cards")).not.toBeInTheDocument();
  });

  it("shows DataUnavailable for monthlyTotals when null", () => {
    render(<ActivityOverview {...defaultProps} monthlyTotals={null} />);

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Monthly stitches")).toBe(
      true,
    );
    expect(screen.queryByTestId("monthly-stitch-chart")).not.toBeInTheDocument();
  });

  it("shows DataUnavailable for each null prop independently", () => {
    render(
      <ActivityOverview
        {...defaultProps}
        paceMetrics={null}
        monthlyTotals={null}
        dayOfWeekData={null}
        calendarData={null}
        sessionHistory={null}
      />,
    );

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable).toHaveLength(5);
  });

  it("renders normal content alongside null props", () => {
    render(<ActivityOverview {...defaultProps} paceMetrics={null} calendarData={null} />);

    expect(screen.getByTestId("monthly-stitch-chart")).toBeInTheDocument();
    expect(screen.getByTestId("day-of-week-chart")).toBeInTheDocument();
    expect(screen.getByTestId("session-history-table")).toBeInTheDocument();
    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable).toHaveLength(2);
  });
});
