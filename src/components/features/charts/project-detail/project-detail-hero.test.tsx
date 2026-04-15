import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { createMockChartWithRelations } from "@/__tests__/mocks/factories";
import { ProjectDetailHero } from "./project-detail-hero";

vi.mock("@/lib/actions/chart-actions", () => ({
  updateChartStatus: vi.fn(),
  deleteChart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("ProjectDetailHero", () => {
  const defaultChart = createMockChartWithRelations({
    id: "chart-1",
    name: "Autumn Meadow",
    stitchCount: 45000,
    stitchesWide: 300,
    stitchesHigh: 150,
    designer: { name: "Jane Doe" },
    project: { status: "IN_PROGRESS", stitchesCompleted: 30600 },
  });

  it("renders chart name as heading", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    expect(screen.getByRole("heading", { name: "Autumn Meadow" })).toBeInTheDocument();
  });

  it("renders designer name when present", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    expect(screen.getByText(/Designer: Jane Doe/)).toBeInTheDocument();
  });

  it("renders stitch count formatted with commas", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
  });

  it("renders Edit link pointing to /charts/{id}/edit", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/charts/chart-1/edit");
  });

  it("renders BackToGalleryLink", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("does not render cover banner when no image URL", () => {
    const chartNoImage = createMockChartWithRelations({
      id: "chart-2",
      name: "No Image Chart",
      coverImageUrl: null,
      project: { status: "UNSTARTED" },
    });
    const { container } = render(<ProjectDetailHero chart={chartNoImage} imageUrls={{}} />);
    // No img tag with alt containing "Cover for" should exist
    expect(container.querySelector('img[alt*="Cover for"]')).toBeNull();
  });

  it("renders celebration ring class for FINISHED status", () => {
    const finishedChart = createMockChartWithRelations({
      name: "Finished Project",
      project: { status: "FINISHED", stitchesCompleted: 5000 },
    });
    const { container } = render(<ProjectDetailHero chart={finishedChart} imageUrls={{}} />);
    const heroContainer = container.firstElementChild;
    expect(heroContainer?.className).toContain("ring-violet-200");
  });

  it("renders celebration ring class for FFO status", () => {
    const ffoChart = createMockChartWithRelations({
      name: "FFO Project",
      project: { status: "FFO", stitchesCompleted: 5000 },
    });
    const { container } = render(<ProjectDetailHero chart={ffoChart} imageUrls={{}} />);
    const heroContainer = container.firstElementChild;
    expect(heroContainer?.className).toContain("ring-rose-200");
  });

  it("renders progress percentage for IN_PROGRESS status", () => {
    render(<ProjectDetailHero chart={defaultChart} imageUrls={{}} />);
    // 30600 / 45000 = 68%
    expect(screen.getByText("68%")).toBeInTheDocument();
  });

  it("does not render progress for UNSTARTED status", () => {
    const unstartedChart = createMockChartWithRelations({
      name: "Unstarted",
      stitchCount: 5000,
      project: { status: "UNSTARTED", stitchesCompleted: 0 },
    });
    render(<ProjectDetailHero chart={unstartedChart} imageUrls={{}} />);
    expect(screen.queryByText("%")).toBeNull();
  });
});
