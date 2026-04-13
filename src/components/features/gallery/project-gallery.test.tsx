import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";
import type { GalleryCardData } from "./gallery-types";
import type { GalleryChartData } from "@/types/chart";

// Mock useGalleryFilters to avoid nuqs dependency in test
const mockFilteredCards = [createMockGalleryCard({ chartId: "c1", name: "Test Project" })];
vi.mock("./use-gallery-filters", () => ({
  useGalleryFilters: () => ({
    view: "gallery",
    sort: "dateAdded",
    dir: "desc",
    search: "",
    statusFilter: [],
    sizeFilter: [],
    setView: vi.fn(),
    setSort: vi.fn(),
    setDir: vi.fn(),
    setSearch: vi.fn(),
    toggleStatus: vi.fn(),
    toggleSize: vi.fn(),
    clearFilters: vi.fn(),
    filteredAndSorted: mockFilteredCards,
    totalCount: 1,
    filteredCount: 1,
    hasActiveFilters: false,
  }),
}));

// Mock sub-components to test composition without deep rendering
vi.mock("./gallery-grid", () => ({
  GalleryGrid: ({ cards, view }: { cards: GalleryCardData[]; view: string }) => (
    <div data-testid="gallery-grid" data-view={view} data-count={cards.length} />
  ),
}));

vi.mock("./filter-bar", () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}));

vi.mock("./filter-chips", () => ({
  FilterChips: () => null,
}));

vi.mock("./view-toggle-bar", () => ({
  ViewToggleBar: () => <div data-testid="view-toggle-bar" />,
}));

vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// Dynamic import after mocks are set up
const { ProjectGallery } = await import("./project-gallery");

function createMockGalleryChartData(overrides?: Partial<GalleryChartData>): GalleryChartData {
  return {
    id: "chart-1",
    name: "Test Chart",
    designerId: "d1",
    coverImageUrl: null,
    coverThumbnailUrl: null,
    stitchCount: 10000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 100,
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    digitalWorkingCopyUrl: null,
    dateAdded: new Date("2026-01-15"),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: {
      id: "proj-1",
      status: "UNSTARTED",
      stitchesCompleted: 0,
      startDate: null,
      finishDate: null,
      ffoDate: null,
      fabric: null,
      _count: { projectThreads: 0, projectBeads: 0, projectSpecialty: 0 },
    },
    designer: { id: "d1", name: "Test Designer", website: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
    genres: [],
    ...overrides,
  };
}

describe("ProjectGallery", () => {
  const mockCharts = [createMockGalleryChartData()];
  const mockImageUrls: Record<string, string> = {};

  it("renders 'Project Gallery' heading", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    expect(
      screen.getByRole("heading", { name: /Project Gallery/i }),
    ).toBeInTheDocument();
  });

  it("renders 'Add Project' link button", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    const addLink = screen.getByRole("link", { name: /Add Project/i });
    expect(addLink).toHaveAttribute("href", "/charts/new");
  });

  it("renders the subtitle text", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    expect(
      screen.getByText("Browse and filter all your cross stitch projects"),
    ).toBeInTheDocument();
  });

  it("renders FilterBar component", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
  });

  it("renders ViewToggleBar component", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    expect(screen.getByTestId("view-toggle-bar")).toBeInTheDocument();
  });

  it("renders GalleryGrid with transformed chart data", () => {
    render(<ProjectGallery charts={mockCharts} imageUrls={mockImageUrls} />);
    const grid = screen.getByTestId("gallery-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("data-count", "1");
  });
});
