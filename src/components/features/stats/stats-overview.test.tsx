import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type { StatsHeroData, CollectionBreakdownData, SizeBreakdownItem, DesignerBreakdownItem, GenreBreakdownItem } from "@/types/stats";

// Mock all child components
vi.mock("./metrics-bar", () => ({
  MetricsBar: (props: Record<string, unknown>) => (
    <div
      data-testid="metrics-bar"
      data-today={props.stitchesToday}
      data-week={props.stitchesThisWeek}
      data-month={props.stitchesThisMonth}
      data-year={props.stitchesThisYear}
    />
  ),
}));

vi.mock("./lifetime-counters", () => ({
  LifetimeCounters: (props: Record<string, unknown>) => (
    <div
      data-testid="lifetime-counters"
      data-stitches={props.totalLifetimeStitches}
      data-sessions={props.totalSessions}
      data-time={props.totalTimeMinutes}
      data-completed={props.projectsCompleted}
    />
  ),
}));

vi.mock("./collection-status-chart", () => ({
  CollectionStatusChart: (props: Record<string, unknown>) => (
    <div
      data-testid="collection-status-chart"
      data-total={props.totalProjects}
    />
  ),
}));

vi.mock("./size-category-chart", () => ({
  SizeCategoryChart: () => <div data-testid="size-category-chart" />,
}));

vi.mock("./designer-breakdown-chart", () => ({
  DesignerBreakdownChart: () => <div data-testid="designer-breakdown-chart" />,
}));

vi.mock("./genre-distribution-chart", () => ({
  GenreDistributionChart: () => <div data-testid="genre-distribution-chart" />,
}));

vi.mock("./ranked-list", () => ({
  RankedList: (props: Record<string, unknown>) => (
    <div data-testid="ranked-list" data-label={props.label} />
  ),
}));

import { StatsOverview } from "./stats-overview";

const mockHeroStats: StatsHeroData = {
  stitchesToday: 150,
  stitchesThisWeek: 1200,
  stitchesThisMonth: 4500,
  stitchesThisYear: 28000,
  totalLifetimeStitches: 125000,
  totalSessions: 340,
  totalTimeMinutes: 15600,
  projectsCompleted: 12,
};

const mockCollectionBreakdown: CollectionBreakdownData = {
  byStatus: [
    { status: "UNSTARTED" as const, count: 10, fill: "var(--status-unstarted)" },
    { status: "IN_PROGRESS" as const, count: 5, fill: "var(--status-in-progress)" },
  ],
  totalProjects: 15,
};

const mockSizeBreakdown: SizeBreakdownItem[] = [
  { category: "Mini", count: 3, fill: "var(--chart-1)" },
  { category: "Small", count: 5, fill: "var(--chart-2)" },
  { category: "Medium", count: 4, fill: "var(--chart-3)" },
  { category: "Large", count: 2, fill: "var(--chart-4)" },
  { category: "BAP", count: 1, fill: "var(--chart-5)" },
];

const mockDesignerBreakdown: DesignerBreakdownItem[] = [
  { designerId: "d1", name: "Shannon Christine", count: 12 },
  { designerId: "d2", name: "Tiny Modernist", count: 8 },
];

const mockGenreBreakdown: GenreBreakdownItem[] = [
  { genreId: "g1", name: "Fantasy", count: 15 },
  { genreId: "g2", name: "Sampler", count: 10 },
];

describe("StatsOverview", () => {
  it("renders MetricsBar with correct heroStats props", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    const metricsBar = screen.getByTestId("metrics-bar");
    expect(metricsBar).toHaveAttribute("data-today", "150");
    expect(metricsBar).toHaveAttribute("data-week", "1200");
    expect(metricsBar).toHaveAttribute("data-month", "4500");
    expect(metricsBar).toHaveAttribute("data-year", "28000");
  });

  it("renders LifetimeCounters with correct heroStats props", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    const counters = screen.getByTestId("lifetime-counters");
    expect(counters).toHaveAttribute("data-stitches", "125000");
    expect(counters).toHaveAttribute("data-sessions", "340");
    expect(counters).toHaveAttribute("data-time", "15600");
    expect(counters).toHaveAttribute("data-completed", "12");
  });

  it("renders CollectionStatusChart with collectionBreakdown data", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    const chart = screen.getByTestId("collection-status-chart");
    expect(chart).toHaveAttribute("data-total", "15");
  });

  it("renders SizeCategoryChart with sizeBreakdown data", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    expect(screen.getByTestId("size-category-chart")).toBeInTheDocument();
  });

  it("renders DesignerBreakdownChart with designerBreakdown data", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    expect(screen.getByTestId("designer-breakdown-chart")).toBeInTheDocument();
  });

  it("renders GenreDistributionChart with genreBreakdown data", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    expect(screen.getByTestId("genre-distribution-chart")).toBeInTheDocument();
  });

  it("renders 2 RankedList instances (designers and genres)", () => {
    render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    const rankedLists = screen.getAllByTestId("ranked-list");
    expect(rankedLists).toHaveLength(2);
    expect(rankedLists[0]).toHaveAttribute("data-label", "Top Designers by Chart Count");
    expect(rankedLists[1]).toHaveAttribute("data-label", "Genre Distribution by Chart Count");
  });

  it("renders 2x2 grid container with md:grid-cols-2", () => {
    const { container } = render(
      <StatsOverview
        heroStats={mockHeroStats}
        collectionBreakdown={mockCollectionBreakdown}
        sizeBreakdown={mockSizeBreakdown}
        designerBreakdown={mockDesignerBreakdown}
        genreBreakdown={mockGenreBreakdown}
      />,
    );

    const grid = container.querySelector(".md\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });
});
