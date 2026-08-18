import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import type { FabricRequirementRow } from "@/types/session";
import { FabricRequirementsTab } from "./fabric-requirements-tab";

// Mock server action
vi.mock("@/lib/actions/pattern-dive-actions", () => ({
  assignFabricToProject: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeRow(overrides: Partial<FabricRequirementRow> = {}): FabricRequirementRow {
  return {
    chartId: "chart-1",
    projectId: "project-1",
    chartName: "Test Pattern",
    coverThumbnailUrl: null,
    designerName: "Test Designer",
    stitchesWide: 200,
    stitchesHigh: 300,
    totalStitches: 60000,
    fabricCount: 14,
    overCount: 1,
    fabricName: null,
    fabricId: null,
    requiredWidth: 20.3,
    requiredHeight: 27.4,
    assignedFabric: null,
    matchingFabrics: [],
    unmeasuredCandidateCount: 0,
    ...overrides,
  };
}

describe("FabricRequirementsTab", () => {
  it("renders project rows with fabric size requirements", () => {
    const rows = [makeRow()];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    expect(screen.getByText("Test Pattern")).toBeInTheDocument();
    expect(screen.getByText("200 x 300 stitches")).toBeInTheDocument();
  });

  it("shows the required size per count, margin included, in the row summary", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    // 200/14+6 = 20.2857…" x 300/14+6 = 27.4285…", each rounded up to the tenth
    expect(screen.getByText('20.3" x 27.5"')).toBeInTheDocument();
    // 200/18+6 = 17.111…" x 300/18+6 = 22.666…"
    expect(screen.getByText('17.2" x 22.7"')).toBeInTheDocument();
  });

  it("size reference table lists design size and size with margins for each count", async () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));
    fireEvent.click(screen.getByText("Size Reference — All Counts"));

    expect(screen.getByText("28 count")).toBeInTheDocument();
    // 28ct design 200/28 x 300/28, then the same plus the 6" margin, rounded up
    expect(screen.getByText('7.1" x 10.7"')).toBeInTheDocument();
    expect(screen.getByText('13.2" x 16.8"')).toBeInTheDocument();
  });

  it("sizes an over-two project at the effective count in the row summary", () => {
    render(<FabricRequirementsTab rows={[makeRow({ overCount: 2 })]} imageUrls={{}} />);

    // 14ct worked over two behaves like 7ct: 200/7+6 = 34.57…" x 300/7+6 = 48.85…"
    expect(screen.getByText('34.6" x 48.9"')).toBeInTheDocument();
    // 18ct behaves like 9ct: 200/9+6 = 28.22…" x 300/9+6 = 39.33…"
    expect(screen.getByText('28.3" x 39.4"')).toBeInTheDocument();
  });

  it("says on the row when a project is stitched over two", () => {
    render(<FabricRequirementsTab rows={[makeRow({ overCount: 2 })]} imageUrls={{}} />);

    expect(screen.getByText(/stitched over 2/)).toBeInTheDocument();
  });

  it("says nothing about over-count for an over-one project", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    expect(screen.queryByText(/stitched over 2/)).not.toBeInTheDocument();
    expect(screen.getByText("200 x 300 stitches")).toBeInTheDocument();
  });

  it("size reference table keeps the counts Beth buys and labels what each one works out to", async () => {
    render(<FabricRequirementsTab rows={[makeRow({ overCount: 2 })]} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));
    fireEvent.click(screen.getByText("Size Reference — All Counts"));

    // The row is still the count on the label of the fabric she buys...
    expect(screen.getByText("28 count")).toBeInTheDocument();
    // ...and it says what that works out to when stitched over two.
    expect(screen.getByText("works like 14")).toBeInTheDocument();
    // 28ct over two = 14ct: design 200/14 x 300/14, then the same plus the 6" margin
    expect(screen.getByText('14.3" x 21.4"')).toBeInTheDocument();
    expect(screen.getByText('20.3" x 27.5"')).toBeInTheDocument();
  });

  it("size reference table adds no over-count label for an over-one project", async () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));
    fireEvent.click(screen.getByText("Size Reference — All Counts"));

    expect(screen.queryByText(/works like/)).not.toBeInTheDocument();
  });

  it("shows info banner about 3 inch margins", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    expect(screen.getByText(/3" margins/)).toBeInTheDocument();
    expect(screen.getByText(/framing allowance/)).toBeInTheDocument();
  });

  it("renders filter toggle with Needs Fabric active by default", () => {
    const rows = [
      makeRow({ chartId: "c1", assignedFabric: null }),
      makeRow({
        chartId: "c2",
        chartName: "Assigned Pattern",
        assignedFabric: {
          id: "f1",
          name: "Aida 14ct",
          brandName: "DMC",
          count: 14,
          shortestEdgeInches: 18,
          longestEdgeInches: 24,
        },
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    // "Needs Fabric" is active so only unassigned projects show
    expect(screen.getByText("Test Pattern")).toBeInTheDocument();
    expect(screen.queryByText("Assigned Pattern")).not.toBeInTheDocument();
  });

  it("shows all projects when All Projects filter selected", () => {
    const rows = [
      makeRow({ chartId: "c1" }),
      makeRow({
        chartId: "c2",
        chartName: "Assigned Pattern",
        assignedFabric: {
          id: "f1",
          name: "Aida 14ct",
          brandName: "DMC",
          count: 14,
          shortestEdgeInches: 24,
          longestEdgeInches: 30,
        },
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    fireEvent.click(screen.getByText("All Projects"));

    expect(screen.getByText("Test Pattern")).toBeInTheDocument();
    expect(screen.getByText("Assigned Pattern")).toBeInTheDocument();
  });

  it("shows check icon (emerald) when fabric assigned and fits", () => {
    const rows = [
      makeRow({
        assignedFabric: {
          id: "f1",
          name: "Big Aida",
          brandName: "DMC",
          count: 14,
          shortestEdgeInches: 30,
          longestEdgeInches: 36,
        },
      }),
    ];
    // Show "All Projects" to see assigned ones
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);
    fireEvent.click(screen.getByText("All Projects"));

    const icon = screen.getByTestId("status-icon-chart-1");
    expect(icon).toBeInTheDocument();
    // SVG className is an SVGAnimatedString — use getAttribute
    expect(icon.getAttribute("class")).toContain("text-emerald");
  });

  it("shows AlertTriangle (amber) when fabric too small", () => {
    const rows = [
      makeRow({
        requiredWidth: 30,
        requiredHeight: 40,
        assignedFabric: {
          id: "f1",
          name: "Small Aida",
          brandName: "DMC",
          count: 14,
          shortestEdgeInches: 10,
          longestEdgeInches: 12,
        },
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);
    fireEvent.click(screen.getByText("All Projects"));

    const icon = screen.getByTestId("status-icon-chart-1");
    expect(icon.getAttribute("class")).toContain("text-amber");
  });

  it("shows Package icon (stone) when no fabric", () => {
    const rows = [makeRow({ assignedFabric: null })];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    const icon = screen.getByTestId("status-icon-chart-1");
    expect(icon.getAttribute("class")).toContain("text-stone");
  });

  it("expandable row shows matching fabrics from stash", () => {
    const rows = [
      makeRow({
        matchingFabrics: [
          {
            id: "fab-1",
            name: "White Aida",
            brandName: "DMC",
            count: 14,
            shortestEdgeInches: 24,
            longestEdgeInches: 30,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    // Click to expand
    fireEvent.click(screen.getByText("Test Pattern"));

    expect(screen.getByText("White Aida")).toBeInTheDocument();
    expect(screen.getByText("Assign")).toBeInTheDocument();
  });

  it("Assign button calls assignFabricToProject", async () => {
    const { assignFabricToProject } = await import("@/lib/actions/pattern-dive-actions");

    const rows = [
      makeRow({
        matchingFabrics: [
          {
            id: "fab-1",
            name: "White Aida",
            brandName: "DMC",
            count: 14,
            shortestEdgeInches: 24,
            longestEdgeInches: 30,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    // Click to expand
    fireEvent.click(screen.getByText("Test Pattern"));
    // Click Assign
    fireEvent.click(screen.getByText("Assign"));

    await waitFor(() => {
      expect(assignFabricToProject).toHaveBeenCalledWith("fab-1", "project-1");
    });
  });

  it("Assign button passes projectId (not chartId) to server action", async () => {
    const { assignFabricToProject } = await import("@/lib/actions/pattern-dive-actions");

    const rows = [
      makeRow({
        chartId: "chart-different",
        projectId: "project-correct",
        matchingFabrics: [
          {
            id: "fab-1",
            name: "White Aida",
            brandName: "DMC",
            count: 14,
            shortestEdgeInches: 24,
            longestEdgeInches: 30,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));
    fireEvent.click(screen.getByText("Assign"));

    await waitFor(() => {
      expect(assignFabricToProject).toHaveBeenCalledWith("fab-1", "project-correct");
      expect(assignFabricToProject).not.toHaveBeenCalledWith("fab-1", "chart-different");
    });
  });

  it("renders chart thumbnail when imageUrls provides a URL", () => {
    const rows = [makeRow({ coverThumbnailUrl: "thumb-key-123" })];
    render(
      <FabricRequirementsTab
        rows={rows}
        imageUrls={{ "thumb-key-123": "https://example.com/thumb.jpg" }}
      />,
    );

    const img = screen.getByRole("img", { name: "Test Pattern" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
    expect(screen.queryByTestId("status-icon-chart-1")).not.toBeInTheDocument();
  });

  it("does not render thumbnail when no image URL available", () => {
    const rows = [makeRow({ coverThumbnailUrl: null })];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    expect(screen.queryByRole("img", { name: "Test Pattern" })).not.toBeInTheDocument();
  });

  it("says how many stash pieces have no size recorded", () => {
    const rows = [makeRow({ matchingFabrics: [], unmeasuredCandidateCount: 3 })];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));

    expect(screen.getByText(/3 pieces in your stash have no size recorded/i)).toBeInTheDocument();
  });

  it("says it in the singular when exactly one piece has no size recorded", () => {
    const rows = [makeRow({ matchingFabrics: [], unmeasuredCandidateCount: 1 })];
    render(<FabricRequirementsTab rows={rows} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));

    expect(screen.getByText(/1 piece in your stash has no size recorded/i)).toBeInTheDocument();
  });

  it("says nothing about sizes when every stash piece has one", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    fireEvent.click(screen.getByText("Test Pattern"));

    expect(screen.queryByText(/no size recorded/i)).not.toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<FabricRequirementsTab rows={[]} imageUrls={{}} />);

    expect(screen.getByText(/All projects have fabric assigned/)).toBeInTheDocument();
  });

  it("shows formula hint text", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} imageUrls={{}} />);

    expect(screen.getByText(/Formula:/)).toBeInTheDocument();
  });
});
