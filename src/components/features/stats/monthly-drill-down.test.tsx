import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import type { DailyBreakdownEntry } from "@/types/stats";
import { MonthlyDrillDown } from "./monthly-drill-down";

const mockEntries: DailyBreakdownEntry[] = [
  {
    date: "2026-01-15",
    projectId: "proj-1",
    projectName: "Autumn Leaves",
    stitchCount: 198,
  },
  {
    date: "2026-01-16",
    projectId: "proj-2",
    projectName: "Winter Garden",
    stitchCount: 356,
  },
  {
    date: "2026-01-17",
    projectId: "proj-1",
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
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    // "Autumn Leaves" appears in 2 entries
    const autumnEntries = screen.getAllByText("Autumn Leaves");
    expect(autumnEntries).toHaveLength(2);
    expect(screen.getByText("Winter Garden")).toBeInTheDocument();
    expect(screen.getByText("198")).toBeInTheDocument();
    expect(screen.getByText("356")).toBeInTheDocument();
    expect(screen.getByText("124")).toBeInTheDocument();
  });

  it("project names are rendered as Links to /projects/{projectId}", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    const autumnLinks = screen.getAllByRole("link", { name: "Autumn Leaves" });
    expect(autumnLinks[0]).toHaveAttribute("href", "/projects/proj-1");

    const winterLink = screen.getByRole("link", { name: "Winter Garden" });
    expect(winterLink).toHaveAttribute("href", "/projects/proj-2");
  });

  it("shows month + year heading with total stitch count", () => {
    render(
      <MonthlyDrillDown
        entries={mockEntries}
        isExpanded={true}
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
        monthLabel="January"
        year={2026}
        totalStitches={678}
      />,
    );

    const scrollContainer = container.querySelector(".max-h-60");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("returns null when not expanded (no entries visible)", () => {
    const { container } = render(
      <MonthlyDrillDown
        entries={[]}
        isExpanded={true}
        monthLabel="January"
        year={2026}
        totalStitches={0}
      />,
    );

    // Empty entries + expanded = null output
    expect(container.querySelector("[data-testid]")).not.toBeInTheDocument();
    expect(screen.queryByText("January 2026")).not.toBeInTheDocument();
  });
});
