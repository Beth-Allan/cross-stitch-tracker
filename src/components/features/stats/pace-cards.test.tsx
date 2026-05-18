import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect } from "vitest";
import type { PaceMetricsData } from "@/types/stats";
import { PaceCards } from "./pace-cards";

const basePaceMetrics: PaceMetricsData = {
  avg7Day: 150,
  avg30Day: 120,
  avg90Day: 100,
  thisMonthStitches: 3600,
  lastMonthStitches: 3000,
  stitchRate: 45,
  stitchRatePrior: 40,
};

describe("PaceCards", () => {
  it('renders 5 metric cells: "7-DAY AVG", "30-DAY AVG", "90-DAY AVG", "VS LAST MONTH", "STITCH RATE"', () => {
    render(<PaceCards paceMetrics={basePaceMetrics} />);

    expect(screen.getByText("7-DAY AVG")).toBeInTheDocument();
    expect(screen.getByText("30-DAY AVG")).toBeInTheDocument();
    expect(screen.getByText("90-DAY AVG")).toBeInTheDocument();
    expect(screen.getByText("VS LAST MONTH")).toBeInTheDocument();
    expect(screen.getByText("STITCH RATE")).toBeInTheDocument();
  });

  it('displays rolling averages with "stitches/day" unit text', () => {
    render(<PaceCards paceMetrics={basePaceMetrics} />);

    // 3 cells should show "stitches/day"
    const units = screen.getAllByText("stitches/day");
    expect(units).toHaveLength(3);
  });

  it("shows positive MoM trend with +N% text", () => {
    render(<PaceCards paceMetrics={basePaceMetrics} />);

    // (3600 - 3000) / 3000 * 100 = 20%
    expect(screen.getByText("+20%")).toBeInTheDocument();
  });

  it("shows negative MoM trend with -N% text", () => {
    const metrics: PaceMetricsData = {
      ...basePaceMetrics,
      thisMonthStitches: 2400,
      lastMonthStitches: 3000,
    };
    render(<PaceCards paceMetrics={metrics} />);

    // (2400 - 3000) / 3000 * 100 = -20%
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it('shows "0%" for flat MoM (equal months)', () => {
    const metrics: PaceMetricsData = {
      ...basePaceMetrics,
      thisMonthStitches: 3000,
      lastMonthStitches: 3000,
    };
    render(<PaceCards paceMetrics={metrics} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it('stitch rate shows "N stitches/hr" when stitchRate is not null', () => {
    render(<PaceCards paceMetrics={basePaceMetrics} />);

    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("stitches/hr")).toBeInTheDocument();
  });

  it('stitch rate shows "--" when stitchRate is null', () => {
    const metrics: PaceMetricsData = {
      ...basePaceMetrics,
      stitchRate: null,
      stitchRatePrior: null,
    };
    render(<PaceCards paceMetrics={metrics} />);

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("stitch rate trend arrow renders when both stitchRate and stitchRatePrior are not null", () => {
    render(<PaceCards paceMetrics={basePaceMetrics} />);

    // Both rates are set (45 vs 40) => positive trend arrow should exist
    // The stitch rate cell should have the trend indicator
    const rateSection = screen.getByText("STITCH RATE").closest("div")!.parentElement!;
    // Look for trend indicator (an svg element from lucide TrendingUp)
    const svgs = rateSection.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("all values render with tabular-nums class for numeric alignment", () => {
    const { container } = render(<PaceCards paceMetrics={basePaceMetrics} />);

    const tabularElements = container.querySelectorAll(".tabular-nums");
    // At least 5 values should be rendered with tabular-nums (one per cell)
    expect(tabularElements.length).toBeGreaterThanOrEqual(5);
  });
});
