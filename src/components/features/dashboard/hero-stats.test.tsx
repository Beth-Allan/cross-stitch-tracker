import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { HeroStats } from "./hero-stats";
import type { HeroStatsData } from "@/types/dashboard";

function createMockStats(overrides?: Partial<HeroStatsData>): HeroStatsData {
  return {
    totalWIPs: 4,
    averageProgress: 31,
    closestToCompletion: { projectId: "p1", name: "Gold Collection", percent: 87 },
    finishedThisYear: 1,
    finishedAllTime: 5,
    totalStitchesAllProjects: 284368,
    ...overrides,
  };
}

describe("HeroStats", () => {
  it("renders all 6 stat labels", () => {
    render(<HeroStats stats={createMockStats()} />);

    expect(screen.getByText("Total WIPs")).toBeInTheDocument();
    expect(screen.getByText("Avg. Progress")).toBeInTheDocument();
    expect(screen.getByText("Closest to Done")).toBeInTheDocument();
    expect(screen.getByText("Finished This Year")).toBeInTheDocument();
    expect(screen.getByText("Finished All Time")).toBeInTheDocument();
    expect(screen.getByText("Total Stitches")).toBeInTheDocument();
  });

  it("renders stat values with JetBrains Mono (font-mono class)", () => {
    render(<HeroStats stats={createMockStats()} />);

    // Check that numeric values have the font-mono class
    const wipValue = screen.getByText("4");
    expect(wipValue.className).toContain("font-mono");

    const progressValue = screen.getByText("31%");
    expect(progressValue.className).toContain("font-mono");
  });

  it('renders a dash for closestToCompletion when null', () => {
    render(<HeroStats stats={createMockStats({ closestToCompletion: null })} />);

    // The "Closest to Done" label should still be present
    expect(screen.getByText("Closest to Done")).toBeInTheDocument();

    // The value should show a dash
    expect(screen.getByText(/\u2014/)).toBeInTheDocument();
  });
});
