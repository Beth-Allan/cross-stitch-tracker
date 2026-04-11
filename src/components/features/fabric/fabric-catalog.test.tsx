import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { FabricCatalog } from "./fabric-catalog";
import { createMockFabric, createMockFabricBrand } from "@/__tests__/mocks";
import type { FabricWithBrand, FabricBrandWithCounts } from "@/types/fabric";

const mockCreateFabric = vi.fn();
const mockUpdateFabric = vi.fn();
const mockDeleteFabric = vi.fn();
const mockCreateFabricBrand = vi.fn();
const mockUpdateFabricBrand = vi.fn();
const mockDeleteFabricBrand = vi.fn();

vi.mock("@/lib/actions/fabric-actions", () => ({
  createFabric: (...args: unknown[]) => mockCreateFabric(...args),
  updateFabric: (...args: unknown[]) => mockUpdateFabric(...args),
  deleteFabric: (...args: unknown[]) => mockDeleteFabric(...args),
  createFabricBrand: (...args: unknown[]) => mockCreateFabricBrand(...args),
  updateFabricBrand: (...args: unknown[]) => mockUpdateFabricBrand(...args),
  deleteFabricBrand: (...args: unknown[]) => mockDeleteFabricBrand(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockBrands: FabricBrandWithCounts[] = [
  {
    ...createMockFabricBrand({ id: "fb-1", name: "Zweigart", website: "https://zweigart.com" }),
    _count: { fabrics: 3 },
  },
  {
    ...createMockFabricBrand({ id: "fb-2", name: "Charles Craft", website: null }),
    _count: { fabrics: 1 },
  },
];

const mockFabrics: FabricWithBrand[] = [
  {
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
    }),
    brand: createMockFabricBrand({ id: "fb-1", name: "Zweigart" }),
  },
  {
    ...createMockFabric({
      id: "f2",
      name: "Driftwood Princess",
      brandId: "fb-2",
      count: 28,
      type: "Linen",
      colorFamily: "Cream",
      colorType: "Hand-dyed",
      shortestEdgeInches: 12,
      longestEdgeInches: 15,
      needToBuy: true,
    }),
    brand: createMockFabricBrand({ id: "fb-2", name: "Charles Craft" }),
  },
  {
    ...createMockFabric({
      id: "f3",
      name: "Midnight Blue Evenweave",
      brandId: "fb-1",
      count: 32,
      type: "Evenweave",
      colorFamily: "Blue",
      colorType: "Dark",
      shortestEdgeInches: 0,
      longestEdgeInches: 0,
      needToBuy: false,
    }),
    brand: createMockFabricBrand({ id: "fb-1", name: "Zweigart" }),
  },
];

const mockProjects = [
  { id: "proj-1", chartName: "Dragon Queen" },
  { id: "proj-2", chartName: "Autumn Leaves" },
];

describe("FabricCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tabs: Fabrics (count) and Brands (count)", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    expect(screen.getByText(/Fabrics\s*\(3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Brands\s*\(2\)/)).toBeInTheDocument();
  });

  it("shows sortable table with Name, Brand, Count, Type, Colour, Dimensions columns", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    expect(screen.getByText("NAME")).toBeInTheDocument();
    expect(screen.getByText("BRAND")).toBeInTheDocument();
    expect(screen.getByText("COUNT")).toBeInTheDocument();
    expect(screen.getByText("TYPE")).toBeInTheDocument();
    expect(screen.getByText("COLOUR")).toBeInTheDocument();
    expect(screen.getByText("DIMENSIONS")).toBeInTheDocument();
  });

  it("renders fabric names as links", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Both desktop table and mobile cards render links (hidden via CSS)
    const links = screen.getAllByRole("link", { name: "White Aida 14ct" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/fabric/f1");
  });

  it("shows Need to Buy badges", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Driftwood Princess has needToBuy: true
    const driftwood = screen.getAllByText("Driftwood Princess");
    expect(driftwood.length).toBeGreaterThanOrEqual(1);
    // Should show "Yes" badge for needToBuy true
    const yesBadges = screen.getAllByText("Yes");
    expect(yesBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("search filters fabrics by name", async () => {
    const user = userEvent.setup();
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Search fabric...");
    await user.type(searchInput, "Drift");

    expect(screen.getAllByText("Driftwood Princess").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText("White Aida 14ct")).toHaveLength(0);
    expect(screen.queryAllByText("Midnight Blue Evenweave")).toHaveLength(0);
  });

  it("shows empty state when no fabrics", () => {
    render(
      <FabricCatalog fabrics={[]} fabricBrands={mockBrands} projects={mockProjects} />,
    );

    expect(screen.getByText("No fabric records yet")).toBeInTheDocument();
  });

  it("has edit and delete action buttons with aria-labels", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Both desktop and mobile render these (hidden via CSS)
    const editButtons = screen.getAllByRole("button", { name: "Edit White Aida 14ct" });
    expect(editButtons.length).toBeGreaterThanOrEqual(1);
    const deleteButtons = screen.getAllByRole("button", { name: "Delete White Aida 14ct" });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Add Fabric button", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    expect(screen.getByRole("button", { name: /Add Fabric/i })).toBeInTheDocument();
  });

  /* ── Hydration-safe rendering ── */

  it("does not use Base UI Tabs component (avoids useId hydration mismatch)", () => {
    // The fabric catalog should use plain buttons for tab switching
    // instead of Base UI Tabs which generates mismatching SSR/client IDs
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Tab buttons should be type="button" elements, not [role="tab"]
    const fabricsTab = screen.getByRole("button", { name: /Fabrics\s*\(3\)/ });
    expect(fabricsTab).toBeInTheDocument();
    const brandsTab = screen.getByRole("button", { name: /Brands\s*\(2\)/ });
    expect(brandsTab).toBeInTheDocument();
  });

  it("switches between Fabrics and Brands tabs", async () => {
    const user = userEvent.setup();
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Fabrics tab should be active by default - search input should be visible
    expect(screen.getByPlaceholderText("Search fabric...")).toBeInTheDocument();

    // Click Brands tab
    const brandsTab = screen.getByRole("button", { name: /Brands\s*\(2\)/ });
    await user.click(brandsTab);

    // Fabrics search input should no longer be visible
    expect(screen.queryByPlaceholderText("Search fabric...")).not.toBeInTheDocument();
  });

  it("renders consistent HTML for Badge needToBuy regardless of value", () => {
    render(
      <FabricCatalog
        fabrics={mockFabrics}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Both Yes and No badges should render (desktop table has both)
    const yesBadges = screen.getAllByText("Yes");
    const noBadges = screen.getAllByText("No");
    expect(yesBadges.length).toBeGreaterThanOrEqual(1);
    expect(noBadges.length).toBeGreaterThanOrEqual(1);
  });
});
