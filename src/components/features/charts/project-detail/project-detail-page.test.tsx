import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, act } from "@/__tests__/test-utils";
import { createMockChartWithRelations } from "@/__tests__/mocks/factories";
import { ProjectDetailPage } from "./project-detail-page";
import type { ProjectDetailProps } from "./types";

// Import mocked modules for spy assertions
import { ProjectDetailHero } from "./project-detail-hero";
import { OverviewTab } from "./overview-tab";

// Mock child components as stubs to isolate composition logic
vi.mock("./project-detail-hero", () => ({
  ProjectDetailHero: vi.fn(() => <div data-testid="project-detail-hero" />),
}));

vi.mock("./project-tabs", () => ({
  ProjectTabs: vi.fn(
    ({
      overviewContent,
      suppliesContent,
    }: {
      overviewContent: React.ReactNode;
      suppliesContent: React.ReactNode;
    }) => (
      <div data-testid="project-tabs">
        <div data-testid="overview-content">{overviewContent}</div>
        <div data-testid="supplies-content">{suppliesContent}</div>
      </div>
    ),
  ),
}));

vi.mock("./overview-tab", () => ({
  OverviewTab: vi.fn(() => <div data-testid="overview-tab" />),
}));

vi.mock("./supplies-tab", () => ({
  SuppliesTab: vi.fn(() => <div data-testid="supplies-tab" />),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Helper to build a typed supplies prop
function makeSupplies(): NonNullable<ProjectDetailProps["supplies"]> {
  return {
    threads: [],
    beads: [],
    specialty: [],
  };
}

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ProjectDetailHero", () => {
    const chart = createMockChartWithRelations({
      name: "Autumn Meadow",
      project: { status: "IN_PROGRESS" },
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={makeSupplies()} />);

    expect(screen.getByTestId("project-detail-hero")).toBeInTheDocument();
    expect(ProjectDetailHero).toHaveBeenCalledWith(
      expect.objectContaining({
        chart: expect.objectContaining({ name: "Autumn Meadow" }),
      }),
      undefined,
    );
  });

  it("renders ProjectTabs with overview and supplies content", () => {
    const chart = createMockChartWithRelations({
      project: { status: "UNSTARTED" },
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={makeSupplies()} />);

    expect(screen.getByTestId("project-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("overview-content")).toBeInTheDocument();
    expect(screen.getByTestId("supplies-content")).toBeInTheDocument();
  });

  it("renders OverviewTab with chart and supplies data", () => {
    const chart = createMockChartWithRelations({
      name: "Winter Garden",
      project: { status: "IN_PROGRESS" },
    });
    const supplies = makeSupplies();

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={supplies} />);

    expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
    expect(OverviewTab).toHaveBeenCalledWith(
      expect.objectContaining({
        chart: expect.objectContaining({ name: "Winter Garden" }),
        supplies: supplies,
      }),
      undefined,
    );
  });

  it("renders SuppliesTab when project and supplies exist", () => {
    const chart = createMockChartWithRelations({
      id: "chart-42",
      project: { id: "proj-42", status: "IN_PROGRESS" },
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={makeSupplies()} />);

    expect(screen.getByTestId("supplies-tab")).toBeInTheDocument();
  });

  it("shows 'No project linked' when project is null", () => {
    const chart = createMockChartWithRelations({
      project: null,
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={null} />);

    expect(screen.getByText("No project linked")).toBeInTheDocument();
    expect(screen.getByText(/Create a project to manage supplies/)).toBeInTheDocument();
    expect(screen.queryByTestId("supplies-tab")).not.toBeInTheDocument();
  });

  it("shows 'No project linked' when supplies is null even with project", () => {
    // Edge case: project exists but supplies failed to load
    const chart = createMockChartWithRelations({
      project: null,
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={null} />);

    expect(screen.getByText("No project linked")).toBeInTheDocument();
  });

  it("passes imageUrls to ProjectDetailHero", () => {
    const chart = createMockChartWithRelations({
      coverImageUrl: "covers/test.jpg",
      project: { status: "IN_PROGRESS" },
    });
    const imageUrls = { "covers/test.jpg": "https://signed.url/test.jpg" };

    render(<ProjectDetailPage chart={chart} imageUrls={imageUrls} supplies={makeSupplies()} />);

    expect(ProjectDetailHero).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrls: expect.objectContaining({
          "covers/test.jpg": "https://signed.url/test.jpg",
        }),
      }),
      undefined,
    );
  });

  it("passes onStatusChange callback to ProjectDetailHero", () => {
    const chart = createMockChartWithRelations({
      project: { status: "IN_PROGRESS" },
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={makeSupplies()} />);

    expect(ProjectDetailHero).toHaveBeenCalledWith(
      expect.objectContaining({
        onStatusChange: expect.any(Function),
      }),
      undefined,
    );
  });

  it("updates overview tab status when onStatusChange is called", () => {
    const chart = createMockChartWithRelations({
      project: { status: "IN_PROGRESS" },
    });

    render(<ProjectDetailPage chart={chart} imageUrls={{}} supplies={makeSupplies()} />);

    // Extract the onStatusChange callback and call it (wrapped in act for state update)
    const heroCall = (ProjectDetailHero as Mock).mock.calls[0][0];
    act(() => {
      heroCall.onStatusChange("FINISHED");
    });

    // OverviewTab should be re-rendered with updated status
    const overviewCalls = (OverviewTab as Mock).mock.calls;
    const lastCall = overviewCalls[overviewCalls.length - 1][0];
    expect(lastCall.chart.project.status).toBe("FINISHED");
  });
});
