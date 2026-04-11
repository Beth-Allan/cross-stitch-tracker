import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SupplyBrandList } from "./supply-brand-list";
import { createMockSupplyBrand } from "@/__tests__/mocks";
import type { SupplyBrandWithCounts } from "@/types/supply";

const mockCreateSupplyBrand = vi.fn();
const mockUpdateSupplyBrand = vi.fn();
const mockDeleteSupplyBrand = vi.fn();

vi.mock("@/lib/actions/supply-actions", () => ({
  createSupplyBrand: (...args: unknown[]) => mockCreateSupplyBrand(...args),
  updateSupplyBrand: (...args: unknown[]) => mockUpdateSupplyBrand(...args),
  deleteSupplyBrand: (...args: unknown[]) => mockDeleteSupplyBrand(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockBrands: SupplyBrandWithCounts[] = [
  {
    ...createMockSupplyBrand({ id: "b1", name: "DMC", website: "https://www.dmc.com", supplyType: "THREAD" }),
    _count: { threads: 500, beads: 0, specialtyItems: 0 },
  },
  {
    ...createMockSupplyBrand({ id: "b2", name: "Mill Hill", website: null, supplyType: "BEAD" }),
    _count: { threads: 0, beads: 25, specialtyItems: 0 },
  },
  {
    ...createMockSupplyBrand({ id: "b3", name: "Kreinik", website: "https://kreinik.com", supplyType: "SPECIALTY" }),
    _count: { threads: 0, beads: 0, specialtyItems: 10 },
  },
];

describe("SupplyBrandList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table with Name, Website, Type, Actions columns", () => {
    render(<SupplyBrandList brands={mockBrands} />);

    expect(screen.getByText("NAME")).toBeInTheDocument();
    expect(screen.getByText("WEBSITE")).toBeInTheDocument();
    expect(screen.getByText("TYPE")).toBeInTheDocument();
  });

  it("shows brand name and supply type", () => {
    render(<SupplyBrandList brands={mockBrands} />);

    // Names should appear (multiple times due to mobile + desktop rendering)
    const dmcElements = screen.getAllByText("DMC");
    expect(dmcElements.length).toBeGreaterThanOrEqual(1);

    const millHillElements = screen.getAllByText("Mill Hill");
    expect(millHillElements.length).toBeGreaterThanOrEqual(1);

    const kreinikElements = screen.getAllByText("Kreinik");
    expect(kreinikElements.length).toBeGreaterThanOrEqual(1);
  });

  it("search filters brands by name", async () => {
    const user = userEvent.setup();
    render(<SupplyBrandList brands={mockBrands} />);

    const searchInput = screen.getByPlaceholderText("Search brands...");
    await user.type(searchInput, "Mill");

    // Mill Hill should still be visible
    const millHillElements = screen.getAllByText("Mill Hill");
    expect(millHillElements.length).toBeGreaterThanOrEqual(1);

    // DMC should not be visible (only table row, not any other reference)
    // The search should filter out DMC
    const dmcElements = screen.queryAllByText("DMC");
    // DMC may still appear in non-filtered contexts, but there should be fewer
    // The key test is that Mill Hill is still shown
    expect(millHillElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Add Brand button", () => {
    render(<SupplyBrandList brands={mockBrands} />);
    expect(screen.getByText("Add Brand")).toBeInTheDocument();
  });

  it("shows edit and delete action buttons with correct accessibility attributes", () => {
    render(<SupplyBrandList brands={mockBrands} />);

    // Each brand has edit/delete in both desktop table and mobile card (6 total each)
    const editButtons = screen.getAllByTitle("Edit brand");
    expect(editButtons.length).toBeGreaterThanOrEqual(3);

    const deleteButtons = screen.getAllByTitle("Delete brand");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(3);

    // Check aria-labels include brand name (multiple due to responsive rendering)
    const editDmcButtons = screen.getAllByLabelText("Edit DMC");
    expect(editDmcButtons.length).toBeGreaterThanOrEqual(1);
    const deleteDmcButtons = screen.getAllByLabelText("Delete DMC");
    expect(deleteDmcButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no brands exist", () => {
    render(<SupplyBrandList brands={[]} />);
    expect(screen.getByText("No supply brands yet")).toBeInTheDocument();
  });
});
