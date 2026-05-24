import { render, screen } from "@/__tests__/test-utils";
import { describe, it, expect, vi } from "vitest";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
} from "@/types/stats";

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
      data-stitches={props.collectionTotalStitches}
      data-sessions={props.totalSessions}
      data-time={props.totalTimeMinutes}
      data-completed={props.projectsCompleted}
    />
  ),
}));

vi.mock("./collection-status-chart", () => ({
  CollectionStatusChart: (props: Record<string, unknown>) => (
    <div data-testid="collection-status-chart" data-total={props.totalProjects} />
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

vi.mock("./thread-insight-list", () => ({
  ThreadInsightList: () => <div data-testid="thread-insight-list" />,
}));

vi.mock("./designer-insight-list", () => ({
  DesignerInsightList: () => <div data-testid="designer-insight-list" />,
}));

vi.mock("./genre-insight-list", () => ({
  GenreInsightList: () => <div data-testid="genre-insight-list" />,
}));

vi.mock("./status-filter-pills", () => ({
  StatusFilterPills: () => <div data-testid="status-filter-pills" />,
}));

vi.mock("./data-unavailable", () => ({
  DataUnavailable: (props: Record<string, unknown>) => (
    <div data-testid="data-unavailable" data-label={props.label} />
  ),
}));

import { StatsOverview } from "./stats-overview";

const mockHeroStats: StatsHeroData = {
  stitchesToday: 150,
  stitchesThisWeek: 1200,
  stitchesThisMonth: 4500,
  stitchesThisYear: 28000,
  totalLifetimeStitches: 125000,
  collectionTotalStitches: 500000,
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

const mockThreadInsights: ThreadInsight[] = [
  {
    threadId: "t1",
    brandName: "DMC",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    projectCount: 5,
  },
];

const mockDesignerInsights: DesignerInsight[] = [
  {
    designerId: "d1",
    name: "Shannon Christine",
    totalProjects: 10,
    completedProjects: 3,
    completionRate: 30,
  },
];

const mockGenreInsights: GenreInsight[] = [
  {
    genreId: "g1",
    name: "Fantasy",
    projectCount: 8,
    totalStitches: 50000,
  },
];

function renderOverview(overrides: Partial<Parameters<typeof StatsOverview>[0]> = {}) {
  return render(
    <StatsOverview
      heroStats={mockHeroStats}
      collectionBreakdown={mockCollectionBreakdown}
      sizeBreakdown={mockSizeBreakdown}
      designerBreakdown={mockDesignerBreakdown}
      genreBreakdown={mockGenreBreakdown}
      threadInsights={mockThreadInsights}
      designerInsights={mockDesignerInsights}
      genreInsights={mockGenreInsights}
      {...overrides}
    />,
  );
}

describe("StatsOverview", () => {
  it("renders MetricsBar with correct heroStats props", () => {
    renderOverview();

    const metricsBar = screen.getByTestId("metrics-bar");
    expect(metricsBar).toHaveAttribute("data-today", "150");
    expect(metricsBar).toHaveAttribute("data-week", "1200");
    expect(metricsBar).toHaveAttribute("data-month", "4500");
    expect(metricsBar).toHaveAttribute("data-year", "28000");
  });

  it("renders LifetimeCounters with collectionTotalStitches from heroStats", () => {
    renderOverview();

    const counters = screen.getByTestId("lifetime-counters");
    expect(counters).toHaveAttribute("data-stitches", "500000");
    expect(counters).toHaveAttribute("data-sessions", "340");
    expect(counters).toHaveAttribute("data-time", "15600");
    expect(counters).toHaveAttribute("data-completed", "12");
  });

  it("renders CollectionStatusChart with collectionBreakdown data", () => {
    renderOverview();

    const chart = screen.getByTestId("collection-status-chart");
    expect(chart).toHaveAttribute("data-total", "15");
  });

  it("renders SizeCategoryChart with sizeBreakdown data", () => {
    renderOverview();
    expect(screen.getByTestId("size-category-chart")).toBeInTheDocument();
  });

  it("renders DesignerBreakdownChart with designerBreakdown data", () => {
    renderOverview();
    expect(screen.getByTestId("designer-breakdown-chart")).toBeInTheDocument();
  });

  it("renders GenreDistributionChart with genreBreakdown data", () => {
    renderOverview();
    expect(screen.getByTestId("genre-distribution-chart")).toBeInTheDocument();
  });

  it("does NOT render RankedList", () => {
    renderOverview();
    expect(screen.queryByTestId("ranked-list")).not.toBeInTheDocument();
  });

  it("renders insight lists when props provided", () => {
    renderOverview();

    expect(screen.getByTestId("thread-insight-list")).toBeInTheDocument();
    expect(screen.getByTestId("designer-insight-list")).toBeInTheDocument();
    expect(screen.getByTestId("genre-insight-list")).toBeInTheDocument();
  });

  it("renders StatusFilterPills", () => {
    renderOverview();
    expect(screen.getByTestId("status-filter-pills")).toBeInTheDocument();
  });

  it("renders 2x2 grid container with md:grid-cols-2", () => {
    const { container } = renderOverview();
    const grid = container.querySelector(".md\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  it("shows DataUnavailable for heroStats when null", () => {
    renderOverview({ heroStats: null });

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Stats summary")).toBe(true);
    expect(screen.queryByTestId("metrics-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lifetime-counters")).not.toBeInTheDocument();
  });

  it("shows DataUnavailable for collectionBreakdown when null", () => {
    renderOverview({ collectionBreakdown: null });

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable.some((el) => el.getAttribute("data-label") === "Collection status")).toBe(
      true,
    );
    expect(screen.queryByTestId("collection-status-chart")).not.toBeInTheDocument();
  });

  it("shows DataUnavailable for each null prop independently", () => {
    renderOverview({
      heroStats: null,
      collectionBreakdown: null,
      sizeBreakdown: null,
      designerBreakdown: null,
      genreBreakdown: null,
      threadInsights: null,
      designerInsights: null,
      genreInsights: null,
    });

    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable).toHaveLength(8);
  });

  it("shows DataUnavailable when insight props are null", () => {
    renderOverview({
      threadInsights: null,
      designerInsights: null,
      genreInsights: null,
    });

    const unavailable = screen.getAllByTestId("data-unavailable");
    const insightLabels = unavailable.map((el) => el.getAttribute("data-label"));
    expect(insightLabels).toContain("Thread insights");
    expect(insightLabels).toContain("Designer insights");
    expect(insightLabels).toContain("Genre insights");
  });

  it("renders normal content alongside null props", () => {
    renderOverview({
      collectionBreakdown: null,
      designerBreakdown: null,
    });

    expect(screen.getByTestId("metrics-bar")).toBeInTheDocument();
    expect(screen.getByTestId("size-category-chart")).toBeInTheDocument();
    expect(screen.getByTestId("genre-distribution-chart")).toBeInTheDocument();
    const unavailable = screen.getAllByTestId("data-unavailable");
    expect(unavailable).toHaveLength(2);
  });
});
