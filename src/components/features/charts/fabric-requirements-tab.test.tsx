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
    fabricName: null,
    fabricId: null,
    requiredWidth: 20.3,
    requiredHeight: 27.4,
    assignedFabric: null,
    matchingFabrics: [],
    ...overrides,
  };
}

describe("FabricRequirementsTab", () => {
  it("renders project rows with fabric size requirements", () => {
    const rows = [makeRow()];
    render(<FabricRequirementsTab rows={rows} />);

    expect(screen.getByText("Test Pattern")).toBeInTheDocument();
    expect(screen.getByText("200 x 300 stitches")).toBeInTheDocument();
  });

  it("shows info banner about 3 inch margins", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} />);

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
    render(<FabricRequirementsTab rows={rows} />);

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
    render(<FabricRequirementsTab rows={rows} />);

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
    render(<FabricRequirementsTab rows={rows} />);
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
    render(<FabricRequirementsTab rows={rows} />);
    fireEvent.click(screen.getByText("All Projects"));

    const icon = screen.getByTestId("status-icon-chart-1");
    expect(icon.getAttribute("class")).toContain("text-amber");
  });

  it("shows Package icon (stone) when no fabric", () => {
    const rows = [makeRow({ assignedFabric: null })];
    render(<FabricRequirementsTab rows={rows} />);

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
            fitsWidth: true,
            fitsHeight: true,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} />);

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
            fitsWidth: true,
            fitsHeight: true,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} />);

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
            fitsWidth: true,
            fitsHeight: true,
          },
        ],
      }),
    ];
    render(<FabricRequirementsTab rows={rows} />);

    fireEvent.click(screen.getByText("Test Pattern"));
    fireEvent.click(screen.getByText("Assign"));

    await waitFor(() => {
      expect(assignFabricToProject).toHaveBeenCalledWith("fab-1", "project-correct");
      expect(assignFabricToProject).not.toHaveBeenCalledWith("fab-1", "chart-different");
    });
  });

  it("renders empty state", () => {
    render(<FabricRequirementsTab rows={[]} />);

    expect(screen.getByText(/All projects have fabric assigned/)).toBeInTheDocument();
  });

  it("shows formula hint text", () => {
    render(<FabricRequirementsTab rows={[makeRow()]} />);

    expect(screen.getByText(/Formula:/)).toBeInTheDocument();
  });
});
