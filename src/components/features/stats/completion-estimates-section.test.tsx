import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { CompletionEstimatesSection } from "./completion-estimates-section";
import type { CompletionEstimate } from "@/types/stats";

const mockItems: CompletionEstimate[] = [
  {
    projectId: "p1",
    chartId: "c1",
    projectName: "Almost Done",
    stitchesCompleted: 4000,
    totalStitches: 5000,
    percentComplete: 80,
    estimatedDate: "Jun 2026",
    avgPerDay: 133.3,
  },
  {
    projectId: "p2",
    chartId: "c2",
    projectName: "Big Project",
    stitchesCompleted: 17000,
    totalStitches: 50000,
    percentComplete: 34,
    estimatedDate: "Aug 2027",
    avgPerDay: 50,
  },
];

describe("CompletionEstimatesSection", () => {
  it("renders heading 'Completion Estimates' with Target icon", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    expect(screen.getByText("Completion Estimates")).toBeInTheDocument();
  });

  it("renders subtitle 'Based on your average stitching pace'", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    expect(screen.getByText("Based on your average stitching pace")).toBeInTheDocument();
  });

  it("renders project name as Link to /charts/{chartId}", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    const link1 = screen.getByRole("link", { name: "Almost Done" });
    expect(link1).toHaveAttribute("href", "/charts/c1");

    const link2 = screen.getByRole("link", { name: "Big Project" });
    expect(link2).toHaveAttribute("href", "/charts/c2");
  });

  it("renders estimated date right-aligned", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    expect(screen.getByText("~Jun 2026")).toBeInTheDocument();
    expect(screen.getByText("~Aug 2027")).toBeInTheDocument();
  });

  it("renders progress bar with correct width percentage", () => {
    const { container } = render(<CompletionEstimatesSection items={mockItems} />);

    const progressBars = container.querySelectorAll("[role='progressbar']");
    expect(progressBars).toHaveLength(2);
  });

  it("renders progress bar with role='progressbar' and aria-valuenow", () => {
    const { container } = render(<CompletionEstimatesSection items={mockItems} />);

    const progressBars = container.querySelectorAll("[role='progressbar']");
    expect(progressBars[0]).toHaveAttribute("aria-valuenow", "80");
    expect(progressBars[1]).toHaveAttribute("aria-valuenow", "34");
    expect(progressBars[0]).toHaveAttribute("aria-valuemin", "0");
    expect(progressBars[0]).toHaveAttribute("aria-valuemax", "100");
  });

  it("shows stitch count as 'X of Y stitches'", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    expect(screen.getByText("4,000 of 5,000 stitches")).toBeInTheDocument();
    expect(screen.getByText("17,000 of 50,000 stitches")).toBeInTheDocument();
  });

  it("shows empty state when items is empty", () => {
    render(<CompletionEstimatesSection items={[]} />);

    expect(screen.getByText("No estimates available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Estimates appear for active projects with a stitch target and at least 3 logged sessions.",
      ),
    ).toBeInTheDocument();
  });

  it("renders percentage display for each project", () => {
    render(<CompletionEstimatesSection items={mockItems} />);

    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("34%")).toBeInTheDocument();
  });
});
