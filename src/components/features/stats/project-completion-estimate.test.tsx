import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";

import { ProjectCompletionEstimate } from "./project-completion-estimate";
import type { CompletionEstimate } from "@/types/stats";

const mockEstimate: CompletionEstimate = {
  projectId: "p1",
  chartId: "c1",
  projectName: "Big Project",
  stitchesCompleted: 17000,
  totalStitches: 50000,
  percentComplete: 34,
  estimatedDate: "Aug 2027",
  avgPerDay: 50,
};

describe("ProjectCompletionEstimate", () => {
  it("renders estimated date when estimate exists", () => {
    render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    expect(screen.getByText("~Aug 2027")).toBeInTheDocument();
  });

  it("renders progress bar with correct width percentage", () => {
    const { container } = render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    const progressBar = container.querySelector("[role='progressbar']");
    expect(progressBar).toBeInTheDocument();
  });

  it("renders stitch count as 'X of Y stitches'", () => {
    render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    expect(screen.getByText("17,000 of 50,000 stitches")).toBeInTheDocument();
  });

  it("renders nothing (null) when estimate is null", () => {
    const { container } = render(<ProjectCompletionEstimate estimate={null} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders progress bar with role='progressbar' and aria-valuenow", () => {
    const { container } = render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    const progressBar = container.querySelector("[role='progressbar']");
    expect(progressBar).toHaveAttribute("aria-valuenow", "34");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders 'Est. completion' label", () => {
    render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    expect(screen.getByText("Est. completion")).toBeInTheDocument();
  });

  it("renders percentage display", () => {
    render(<ProjectCompletionEstimate estimate={mockEstimate} />);

    expect(screen.getByText("34%")).toBeInTheDocument();
  });
});
