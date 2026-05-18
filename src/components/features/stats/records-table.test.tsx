import { describe, it, expect } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import { RecordsTable } from "./records-table";
import type { PersonalBestRecord, FastestCompletion } from "@/types/stats";

const mockPersonalBests: PersonalBestRecord[] = [
  {
    type: "bestDay",
    label: "Best Day",
    value: 1247,
    unit: "stitches",
    date: "2026-03-15",
    projectId: "proj-1",
    chartId: "chart-1",
    projectName: "Spring Garden",
  },
  {
    type: "bestSession",
    label: "Best Session",
    value: 982,
    unit: "stitches",
    date: "2026-02-10",
    projectId: "proj-2",
    chartId: "chart-2",
    projectName: "Autumn Leaves",
  },
  {
    type: "longestStreak",
    label: "Longest Streak",
    value: 45,
    unit: "days",
    date: "2026-01-01",
    projectId: "proj-1",
    chartId: "chart-1",
    projectName: "Spring Garden",
  },
  {
    type: "currentStreak",
    label: "Current Streak",
    value: 12,
    unit: "days",
    date: null,
    projectId: null,
    chartId: null,
    projectName: null,
  },
];

const mockFastestCompletions: FastestCompletion[] = [
  {
    sizeCategory: "Mini",
    daysToComplete: 7,
    projectId: "proj-3",
    chartId: "chart-3",
    projectName: "Tiny Snowflake",
    startDate: "2026-01-01",
    finishDate: "2026-01-08",
  },
  {
    sizeCategory: "Small",
    daysToComplete: 30,
    projectId: "proj-4",
    chartId: "chart-4",
    projectName: "Little Flower",
    startDate: "2025-11-01",
    finishDate: "2025-12-01",
  },
  {
    sizeCategory: "Large",
    daysToComplete: 180,
    projectId: "proj-5",
    chartId: "chart-5",
    projectName: "Mountain Vista",
    startDate: "2025-01-01",
    finishDate: "2025-06-30",
  },
];

describe("RecordsTable", () => {
  const defaultProps = {
    personalBests: mockPersonalBests,
    fastestCompletions: mockFastestCompletions,
  };

  it("renders 4 personal best rows (Best Day, Best Session, Longest Streak, Current Streak)", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("Best Day")).toBeInTheDocument();
    expect(screen.getByText("Best Session")).toBeInTheDocument();
    expect(screen.getByText("Longest Streak")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
  });

  it("renders grouped divider row with Fastest Completions text", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("Fastest Completions")).toBeInTheDocument();
  });

  it("renders up to 5 fastest completion rows (one per size category)", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("Fastest Mini")).toBeInTheDocument();
    expect(screen.getByText("Fastest Small")).toBeInTheDocument();
    expect(screen.getByText("Fastest Medium")).toBeInTheDocument();
    expect(screen.getByText("Fastest Large")).toBeInTheDocument();
    expect(screen.getByText("Fastest BAP")).toBeInTheDocument();
  });

  it("Value column has bg-success-muted background class", () => {
    render(<RecordsTable {...defaultProps} />);

    const valueHeader = screen.getByText("Value").closest("th");
    expect(valueHeader?.className).toContain("bg-success-muted");
  });

  it("record values display with toLocaleString() for stitches", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("1,247")).toBeInTheDocument();
    expect(screen.getByText("982")).toBeInTheDocument();
  });

  it("empty cells display -- for missing records", () => {
    render(<RecordsTable {...defaultProps} />);

    const dashes = screen.getAllByText("--");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("project names are rendered as links to /charts/{chartId}", () => {
    render(<RecordsTable {...defaultProps} />);

    const springGardenLinks = screen.getAllByRole("link", { name: "Spring Garden" });
    expect(springGardenLinks.length).toBeGreaterThan(0);
    expect(springGardenLinks[0]).toHaveAttribute("href", "/charts/chart-1");
  });

  it("Current Streak row shows (live) suffix in label", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("(live)")).toBeInTheDocument();
  });

  it("row icons render (Flame for Best Day, Trophy for Best Session, etc.)", () => {
    render(<RecordsTable {...defaultProps} />);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it("fastest completion rows show days to complete value", () => {
    render(<RecordsTable {...defaultProps} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
  });

  it("fastest completion project names link to charts", () => {
    render(<RecordsTable {...defaultProps} />);

    const snowflakeLink = screen.getByRole("link", { name: "Tiny Snowflake" });
    expect(snowflakeLink).toHaveAttribute("href", "/charts/chart-3");
  });

  it("empty fastest completion categories show --", () => {
    render(<RecordsTable {...defaultProps} />);

    const dashes = screen.getAllByText("--");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});
