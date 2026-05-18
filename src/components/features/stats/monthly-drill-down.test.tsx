import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import type { DailyBreakdownEntry } from "@/types/stats";
import { MonthlyDrillDown } from "./monthly-drill-down";

const mockEntries: DailyBreakdownEntry[] = [
  {
    date: "2026-01-15",
    projectId: "proj-1",
    chartId: "chart-1",
    projectName: "Autumn Leaves",
    stitchCount: 198,
  },
  {
    date: "2026-01-16",
    projectId: "proj-2",
    chartId: "chart-2",
    projectName: "Winter Garden",
    stitchCount: 356,
  },
  {
    date: "2026-01-17",
    projectId: "proj-1",
    chartId: "chart-1",
    projectName: "Autumn Leaves",
    stitchCount: 124,
  },
];

describe("MonthlyDrillDown", () => {
  it("renders daily breakdown entries with date, project name, stitch count", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    const autumnEntries = screen.getAllByText("Autumn Leaves");
    expect(autumnEntries).toHaveLength(2);
    expect(screen.getByText("Winter Garden")).toBeInTheDocument();
    expect(screen.getByText("198")).toBeInTheDocument();
    expect(screen.getByText("356")).toBeInTheDocument();
    expect(screen.getByText("124")).toBeInTheDocument();
  });

  it("project names are rendered as Links to /charts/{chartId}", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    const autumnLinks = screen.getAllByRole("link", { name: "Autumn Leaves" });
    expect(autumnLinks[0]).toHaveAttribute("href", "/charts/chart-1");

    const winterLink = screen.getByRole("link", { name: "Winter Garden" });
    expect(winterLink).toHaveAttribute("href", "/charts/chart-2");
  });

  it("shows month + year heading with total stitch count", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    expect(screen.getByText("January 2026")).toBeInTheDocument();
    expect(screen.getByText("678 stitches")).toBeInTheDocument();
  });

  it("container scrolls at max-h-60 for many entries", () => {
    const { container } = render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    const scrollContainer = container.querySelector(".max-h-60");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("shows Loading... when isLoading is true", () => {
    render(
      <MonthlyDrillDown
        entries={[]}
        isExpanded={true}
        isLoading={true}
        monthLabel="January"
        year={2026}
        totalStitches={0}
      />,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("January 2026")).not.toBeInTheDocument();
  });

  it("shows empty state when expanded with no entries and not loading", () => {
    render(
      <MonthlyDrillDown
        entries={[]}
        isExpanded={true}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={0}
      />,
    );

    expect(screen.getByText("No sessions this month")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("does not render interactive elements when collapsed", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={false}
        isLoading={false}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("Autumn Leaves")).not.toBeInTheDocument();
  });
});
