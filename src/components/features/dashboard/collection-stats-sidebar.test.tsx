import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it } from "vitest";
import { CollectionStatsSidebar } from "./collection-stats-sidebar";
import type { CollectionStats } from "@/types/dashboard";

function createMockStats(overrides?: Partial<CollectionStats>): CollectionStats {
  return {
    totalProjects: 18,
    totalWIP: 4,
    totalOnHold: 1,
    totalUnstarted: 8,
    totalFinished: 5,
    totalStitchesCompleted: 284368,
    mostRecentFinish: {
      projectId: "proj-finished",
      name: "Autumn Leaves Bookmark",
      finishDate: new Date("2026-02-15"),
    },
    largestProject: {
      projectId: "proj-large",
      name: "Winter Wonderland BAP",
      stitchCount: 213000,
    },
    ...overrides,
  };
}

describe("CollectionStatsSidebar", () => {
  it("renders all 8 stat labels", () => {
    render(<CollectionStatsSidebar stats={createMockStats()} />);

    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("On Hold")).toBeInTheDocument();
    expect(screen.getByText("Unstarted")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(screen.getByText("Total Stitches")).toBeInTheDocument();
    expect(screen.getByText("Most Recent Finish")).toBeInTheDocument();
    expect(screen.getByText("Largest Project")).toBeInTheDocument();
  });

  it("renders stat values", () => {
    render(<CollectionStatsSidebar stats={createMockStats()} />);

    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("284,368")).toBeInTheDocument();
    expect(screen.getByText("Autumn Leaves Bookmark")).toBeInTheDocument();
    expect(screen.getByText("Winter Wonderland BAP")).toBeInTheDocument();
  });

  it("renders dash when mostRecentFinish is null", () => {
    const stats = createMockStats({
      mostRecentFinish: null,
      largestProject: null,
    });
    render(<CollectionStatsSidebar stats={stats} />);

    const dashes = screen.getAllByText("\u2014");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
