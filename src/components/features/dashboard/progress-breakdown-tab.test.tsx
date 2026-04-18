import { describe, it, expect } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ProgressBreakdownTab } from "./progress-breakdown-tab";
import type { ProgressBucket, BucketProject } from "@/types/dashboard";

function createMockProject(overrides?: Partial<BucketProject>): BucketProject {
  return {
    projectId: "p1",
    chartId: "c1",
    projectName: "Test Project",
    designerName: "Test Designer",
    coverThumbnailUrl: null,
    status: "IN_PROGRESS",
    progressPercent: 50,
    totalStitches: 10000,
    stitchesCompleted: 5000,
    lastSessionDate: new Date("2026-04-10"),
    stitchingDays: 15,
    ...overrides,
  };
}

function createMockBuckets(): ProgressBucket[] {
  return [
    {
      id: "unstarted",
      label: "Unstarted",
      range: "Not yet started",
      count: 2,
      projects: [
        createMockProject({
          projectId: "p-un1",
          projectName: "Unstarted A",
          status: "UNSTARTED",
          progressPercent: 0,
        }),
        createMockProject({
          projectId: "p-un2",
          projectName: "Unstarted B",
          status: "KITTING",
          progressPercent: 0,
        }),
      ],
    },
    {
      id: "0-25",
      label: "Just Getting Started",
      range: "0.1% \u2013 24.9%",
      count: 1,
      projects: [
        createMockProject({
          projectId: "p-low",
          projectName: "Low Progress",
          progressPercent: 10,
          stitchingDays: 3,
        }),
      ],
    },
    {
      id: "25-50",
      label: "Making Progress",
      range: "25% \u2013 49.9%",
      count: 1,
      projects: [
        createMockProject({
          projectId: "p-mid",
          projectName: "Mid Progress",
          progressPercent: 40,
          stitchingDays: 20,
        }),
      ],
    },
    {
      id: "50-75",
      label: "Over Halfway",
      range: "50% \u2013 74.9%",
      count: 1,
      projects: [
        createMockProject({
          projectId: "p-high",
          projectName: "High Progress",
          progressPercent: 60,
        }),
      ],
    },
    {
      id: "75-100",
      label: "Almost There",
      range: "75% \u2013 99.9%",
      count: 0,
      projects: [],
    },
  ];
}

describe("ProgressBreakdownTab", () => {
  it("renders stacked bar chart", () => {
    const { container } = render(
      <ProgressBreakdownTab buckets={createMockBuckets()} imageUrls={{}} />,
    );

    // The stacked bar should have a container with rounded-full
    const barContainer = container.querySelector(".rounded-full.overflow-hidden");
    expect(barContainer).toBeInTheDocument();
  });

  it("renders all 5 bucket headers with labels", () => {
    render(<ProgressBreakdownTab buckets={createMockBuckets()} imageUrls={{}} />);

    expect(screen.getByText("Unstarted")).toBeInTheDocument();
    expect(screen.getByText("Just Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Making Progress")).toBeInTheDocument();
    expect(screen.getByText("Over Halfway")).toBeInTheDocument();
    expect(screen.getByText("Almost There")).toBeInTheDocument();
  });

  it("has all buckets collapsed by default (no project rows visible initially)", () => {
    render(<ProgressBreakdownTab buckets={createMockBuckets()} imageUrls={{}} />);

    // Project names should NOT be visible since all buckets are collapsed
    expect(screen.queryByText("Unstarted A")).not.toBeInTheDocument();
    expect(screen.queryByText("Low Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("Mid Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("High Progress")).not.toBeInTheDocument();
  });

  it("renders sort dropdown with 5 options", () => {
    render(<ProgressBreakdownTab buckets={createMockBuckets()} imageUrls={{}} />);

    const sortSelect = screen.getByRole("combobox");
    expect(sortSelect).toBeInTheDocument();

    const options = within(sortSelect).getAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent("Closest to Done");
    expect(options[1]).toHaveTextContent("Furthest from Done");
    expect(options[2]).toHaveTextContent("Most Stitching Days");
    expect(options[3]).toHaveTextContent("Fewest Stitching Days");
    expect(options[4]).toHaveTextContent("Recently Stitched");
  });

  it("changing sort reorders projects within buckets", async () => {
    const user = userEvent.setup();
    const buckets = createMockBuckets();
    // Add more projects to the 0-25 bucket for sorting to be visible
    buckets[1].projects.push(
      createMockProject({
        projectId: "p-low2",
        projectName: "Low Progress Two",
        progressPercent: 20,
        stitchingDays: 30,
      }),
    );
    buckets[1].count = 2;

    render(<ProgressBreakdownTab buckets={buckets} imageUrls={{}} />);

    // Click on the "Just Getting Started" bucket header to expand
    const bucketHeader = screen.getByText("Just Getting Started");
    await user.click(bucketHeader);

    // Default sort is "closestToDone" — higher percent first
    const projectRows = screen.getAllByText(/Low Progress/);
    // "Low Progress Two" (20%) should come before "Low Progress" (10%) in closestToDone
    expect(projectRows[0]).toHaveTextContent("Low Progress Two");

    // Change sort to "Furthest from Done"
    const sortSelect = screen.getByRole("combobox");
    await user.selectOptions(sortSelect, "furthestFromDone");

    // After re-sorting, "Low Progress" (10%) should come first
    const reorderedRows = screen.getAllByText(/Low Progress/);
    expect(reorderedRows[0]).toHaveTextContent("Low Progress");
  });
});
