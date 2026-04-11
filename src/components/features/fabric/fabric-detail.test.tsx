import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { FabricDetail } from "./fabric-detail";
import { createMockFabric, createMockFabricBrand } from "@/__tests__/mocks";
import type { FabricWithProject, FabricBrandWithCounts } from "@/types/fabric";

const mockUpdateFabric = vi.fn();
const mockDeleteFabric = vi.fn();

vi.mock("@/lib/actions/fabric-actions", () => ({
  createFabric: vi.fn(),
  updateFabric: (...args: unknown[]) => mockUpdateFabric(...args),
  deleteFabric: (...args: unknown[]) => mockDeleteFabric(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockBrand = createMockFabricBrand({ id: "fb-1", name: "Zweigart" });
const mockBrands: FabricBrandWithCounts[] = [{ ...mockBrand, _count: { fabrics: 3 } }];

const mockProjects = [{ id: "proj-1", chartName: "Dragon Queen" }];

function makeFabricWithProject(overrides?: Partial<FabricWithProject>): FabricWithProject {
  return {
    ...createMockFabric({
      id: "f1",
      name: "White Aida 14ct",
      brandId: "fb-1",
      count: 14,
      type: "Aida",
      colorFamily: "White",
      colorType: "White",
      shortestEdgeInches: 18,
      longestEdgeInches: 24,
      needToBuy: false,
      linkedProjectId: null,
    }),
    brand: mockBrand,
    linkedProject: null,
    ...overrides,
  };
}

describe("FabricDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fabric name, brand, count, type, color info", () => {
    const fabric = makeFabricWithProject();
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    // Name appears in breadcrumb + heading
    expect(screen.getAllByText("White Aida 14ct").length).toBeGreaterThanOrEqual(1);
    // Brand appears in subtitle + metadata grid
    expect(screen.getAllByText("Zweigart").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("14ct")).toBeInTheDocument();
    expect(screen.getByText("Aida")).toBeInTheDocument();
    // "White" appears for both color family and color type in this test case
    expect(screen.getAllByText("White").length).toBeGreaterThanOrEqual(1);
  });

  it("shows linked project name when assigned", () => {
    const fabric = makeFabricWithProject({
      linkedProjectId: "proj-1",
      linkedProject: {
        id: "proj-1",
        chart: { id: "chart-1", name: "Dragon Queen", stitchesWide: 200, stitchesHigh: 150 },
      },
    });
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    expect(screen.getByText("Dragon Queen")).toBeInTheDocument();
  });

  it("shows 'Unassigned' when no linked project", () => {
    const fabric = makeFabricWithProject({ linkedProject: null });
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows size calculator with 'Fits' when fabric is large enough", () => {
    const fabric = makeFabricWithProject({
      shortestEdgeInches: 24,
      longestEdgeInches: 30,
      linkedProjectId: "proj-1",
      linkedProject: {
        id: "proj-1",
        chart: { id: "chart-1", name: "Dragon Queen", stitchesWide: 200, stitchesHigh: 150 },
      },
    });
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    // Required: (200/14) + 6 = 20.29" x (150/14) + 6 = 16.71"
    // Available: 24" x 30" -> Fits
    expect(screen.getByText("Fits")).toBeInTheDocument();
  });

  it("shows size calculator with 'Too small' when fabric is too small", () => {
    const fabric = makeFabricWithProject({
      shortestEdgeInches: 10,
      longestEdgeInches: 12,
      linkedProjectId: "proj-1",
      linkedProject: {
        id: "proj-1",
        chart: { id: "chart-1", name: "Dragon Queen", stitchesWide: 200, stitchesHigh: 150 },
      },
    });
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    // Required: 20.29" x 16.71" but only 10" x 12" available
    expect(screen.getByText("Too small")).toBeInTheDocument();
  });

  it("does not render size calculator when project has no stitch dimensions", () => {
    const fabric = makeFabricWithProject({
      linkedProjectId: "proj-1",
      linkedProject: {
        id: "proj-1",
        chart: { id: "chart-1", name: "Dragon Queen", stitchesWide: 0, stitchesHigh: 0 },
      },
    });
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    expect(screen.queryByText("Fits")).not.toBeInTheDocument();
    expect(screen.queryByText("Too small")).not.toBeInTheDocument();
    expect(screen.queryByText("Size Calculator")).not.toBeInTheDocument();
  });

  it("shows edit and delete buttons", () => {
    const fabric = makeFabricWithProject();
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it("shows breadcrumb with link back to /fabric", () => {
    const fabric = makeFabricWithProject();
    render(<FabricDetail fabric={fabric} fabricBrands={mockBrands} projects={mockProjects} />);

    const breadcrumbLink = screen.getByRole("link", { name: "Fabric" });
    expect(breadcrumbLink).toHaveAttribute("href", "/fabric");
  });
});
