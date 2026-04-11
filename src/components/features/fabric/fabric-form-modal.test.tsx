import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { FabricFormModal } from "./fabric-form-modal";
import { createMockFabricBrand } from "@/__tests__/mocks";
import type { FabricBrandWithCounts } from "@/types/fabric";

const mockCreateFabric = vi.fn();
const mockUpdateFabric = vi.fn();

vi.mock("@/lib/actions/fabric-actions", () => ({
  createFabric: (...args: unknown[]) => mockCreateFabric(...args),
  updateFabric: (...args: unknown[]) => mockUpdateFabric(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockBrands: FabricBrandWithCounts[] = [
  {
    ...createMockFabricBrand({ id: "fb-1", name: "Zweigart" }),
    _count: { fabrics: 3 },
  },
  {
    ...createMockFabricBrand({ id: "fb-2", name: "Charles Craft" }),
    _count: { fabrics: 1 },
  },
];

const mockProjects = [
  { id: "proj-1", chartName: "Dragon Queen" },
  { id: "proj-2", chartName: "Autumn Leaves" },
];

describe("FabricFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all fabric form fields in create mode", () => {
    render(
      <FabricFormModal
        open={true}
        onOpenChange={vi.fn()}
        fabric={null}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Title appears in heading; button also says "Add Fabric"
    const addFabricTexts = screen.getAllByText("Add Fabric");
    expect(addFabricTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Count/i)).toBeInTheDocument();
    expect(document.getElementById("fabric-type")).toBeInTheDocument();
    expect(screen.getByLabelText(/Colour Family/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Colour Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Shortest Edge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longest Edge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Linked Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Need to buy/i)).toBeInTheDocument();
  });

  it("shows count dropdown with standard fabric counts", () => {
    render(
      <FabricFormModal
        open={true}
        onOpenChange={vi.fn()}
        fabric={null}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    // Check that count options are available (as native select options)
    const countSelect = screen.getByLabelText(/Count/i) as HTMLSelectElement;
    const options = Array.from(countSelect.options).map((o) => o.value);
    expect(options).toEqual(
      expect.arrayContaining(["14", "16", "18", "20", "22", "25", "28", "32", "36", "40"]),
    );
  });

  it("calls createFabric on submit in create mode", async () => {
    const user = userEvent.setup();
    mockCreateFabric.mockResolvedValue({ success: true, fabric: { id: "new-1" } });

    render(
      <FabricFormModal
        open={true}
        onOpenChange={vi.fn()}
        fabric={null}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, "New Fabric");

    const submitBtn = screen.getByRole("button", { name: /Add Fabric/i });
    await user.click(submitBtn);

    expect(mockCreateFabric).toHaveBeenCalled();
  });

  it("shows Save Changes button in edit mode", () => {
    const editFabric = {
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
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <FabricFormModal
        open={true}
        onOpenChange={vi.fn()}
        fabric={editFabric}
        fabricBrands={mockBrands}
        projects={mockProjects}
      />,
    );

    expect(screen.getByText("Edit Fabric")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });
});
