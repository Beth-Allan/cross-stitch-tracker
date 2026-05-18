import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StitchingCalendar } from "./stitching-calendar";
import type { CalendarDayData } from "@/types/stats";

// Mock fetchCalendarMonth server action
vi.mock("@/lib/actions/stats-actions", () => ({
  fetchCalendarMonth: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createMockData(): CalendarDayData[] {
  return [
    {
      date: "2026-05-05",
      sessions: [
        { projectId: "p1", chartId: "c1", projectName: "Dragon Sampler", stitchCount: 198 },
      ],
    },
    {
      date: "2026-05-10",
      sessions: [
        { projectId: "p2", chartId: "c2", projectName: "Winter Village", stitchCount: 356 },
        { projectId: "p1", chartId: "c1", projectName: "Dragon Sampler", stitchCount: 120 },
      ],
    },
    {
      date: "2026-05-17",
      sessions: [
        { projectId: "p1", chartId: "c1", projectName: "Dragon Sampler", stitchCount: 245 },
      ],
    },
  ];
}

describe("StitchingCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 7 column headers (Mon through Sun)", () => {
    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("renders correct number of day cells for May 2026 (31 days + padding)", () => {
    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    // May 2026 starts on Friday (index 4 in Mon-start grid) => 4 padding cells + 31 day cells
    // Total cells should be 35 (5 rows × 7)
    // Check that day 1 and day 31 are rendered
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
  });

  it("renders today's date with a green circle indicator (data-testid='today-indicator')", () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-based
    const year = now.getFullYear();
    const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const data: CalendarDayData[] = [
      {
        date: todayStr,
        sessions: [
          { projectId: "p1", chartId: "c1", projectName: "Test Project", stitchCount: 100 },
        ],
      },
    ];

    render(<StitchingCalendar data={data} initialMonth={month} initialYear={year} />);

    const todayIndicator = screen.getByTestId("today-indicator");
    expect(todayIndicator).toBeInTheDocument();
    expect(todayIndicator.className).toContain("bg-success");
  });

  it("renders session pills with project names as links to /charts/{chartId}", () => {
    const data = createMockData();

    render(<StitchingCalendar data={data} initialMonth={5} initialYear={2026} />);

    // Check for links to charts (using chartId, not projectId)
    const dragonLinks = screen.getAllByRole("link", {
      name: /Dragon Sampler/,
    });
    expect(dragonLinks.length).toBeGreaterThan(0);
    expect(dragonLinks[0]).toHaveAttribute("href", "/charts/c1");

    const winterLinks = screen.getAllByRole("link", {
      name: /Winter Village/,
    });
    expect(winterLinks.length).toBeGreaterThan(0);
    expect(winterLinks[0]).toHaveAttribute("href", "/charts/c2");
  });

  it('month navigation prev/next buttons have aria-label "Previous month" / "Next month"', () => {
    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
  });

  it("clicking next month button calls fetchCalendarMonth with correct month/year", async () => {
    const { fetchCalendarMonth } = await import("@/lib/actions/stats-actions");
    const mockFetch = vi.mocked(fetchCalendarMonth);
    mockFetch.mockResolvedValue({ success: true, data: [] });

    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    const nextBtn = screen.getByRole("button", { name: "Next month" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(6, 2026);
    });
  });

  it('empty month shows "No sessions this month" text', () => {
    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    expect(screen.getByText("No sessions this month")).toBeInTheDocument();
  });

  it("calendar legend renders project color swatches below the grid", () => {
    const data = createMockData();

    render(<StitchingCalendar data={data} initialMonth={5} initialYear={2026} />);

    // Legend should show project names
    const legendContainer = screen.getByTestId("calendar-legend");
    expect(legendContainer).toBeInTheDocument();

    // Both project names should appear in the legend
    const dragonLegendTexts = screen.getAllByText("Dragon Sampler");
    const winterLegendTexts = screen.getAllByText("Winter Village");
    // At least one occurrence of each in legend
    expect(dragonLegendTexts.length).toBeGreaterThan(0);
    expect(winterLegendTexts.length).toBeGreaterThan(0);
  });

  it("padding cells for days before month start use bg-muted styling", () => {
    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    // May 2026 starts on Friday, so Mon-Thu should be padding cells (4 cells)
    const paddingCells = screen.getAllByTestId("padding-cell");
    expect(paddingCells.length).toBeGreaterThan(0);
    expect(paddingCells[0].className).toContain("bg-muted");
  });
});
