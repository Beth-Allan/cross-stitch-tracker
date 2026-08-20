import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { FabricFormModal } from "./fabric-form-modal";
import { createMockFabricBrand } from "@/__tests__/mocks";
import type { FabricBrandWithCounts } from "@/types/fabric";

const mockCreateFabric = vi.fn();
const mockUpdateFabric = vi.fn();
const mockCreateFabricBrand = vi.fn();

vi.mock("@/lib/actions/fabric-actions", () => ({
  createFabric: (...args: unknown[]) => mockCreateFabric(...args),
  updateFabric: (...args: unknown[]) => mockUpdateFabric(...args),
  createFabricBrand: (...args: unknown[]) => mockCreateFabricBrand(...args),
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
    expect(screen.getByText("Brand")).toBeInTheDocument();
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

  describe("a stored type or colour the app's lists do not offer", () => {
    // Fabric.type/colorFamily/colorType are plain String columns, so a row written
    // by a seed, Prisma Studio or SQL can hold a value no dropdown contains.
    const oddFabric = {
      id: "f-odd",
      name: "Mystery cloth",
      brandId: "fb-1",
      count: 28,
      type: "Sparkly Aida",
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

    // The Type label is not uniquely addressable by text: a required FormField puts
    // its screen-reader "(required)" ahead of the label, and "Colour Type" also
    // contains "Type". The select's own id is unambiguous, and the dialog portals
    // out of the render container, so it is looked up on the document.
    const typeSelect = () => document.getElementById("fabric-type") as HTMLSelectElement;

    function renderOdd() {
      return render(
        <FabricFormModal
          open={true}
          onOpenChange={vi.fn()}
          fabric={oddFabric}
          fabricBrands={mockBrands}
          projects={mockProjects}
        />,
      );
    }

    it("shows the stored value rather than silently displaying a different one", () => {
      renderOdd();

      expect(typeSelect()).toHaveValue("Sparkly Aida");
      expect(screen.getByText("Sparkly Aida (not recognised)")).toBeInTheDocument();
    });

    it("refuses to save it instead of rewriting the row to a default", async () => {
      const user = userEvent.setup();
      renderOdd();

      await user.click(screen.getByRole("button", { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/type or colour this app does not recognise/i)).toBeInTheDocument();
      });
      expect(mockUpdateFabric).not.toHaveBeenCalled();
    });

    it("saves once a real option is chosen", async () => {
      mockUpdateFabric.mockResolvedValue({ success: true, fabric: { id: "f-odd" } });
      const user = userEvent.setup();
      renderOdd();

      await user.selectOptions(typeSelect(), "Linen");
      await user.click(screen.getByRole("button", { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUpdateFabric).toHaveBeenCalledWith(
          "f-odd",
          expect.objectContaining({ type: "Linen" }),
        );
      });
    });
  });

  describe("brand selection via SearchableSelect", () => {
    it("renders a searchable brand selector with brand options", () => {
      render(
        <FabricFormModal
          open={true}
          onOpenChange={vi.fn()}
          fabric={null}
          fabricBrands={mockBrands}
          projects={mockProjects}
        />,
      );

      // SearchableSelect renders as a button trigger showing the selected brand
      expect(screen.getByText("Zweigart")).toBeInTheDocument();
    });

    it("brand selector shows Add New option in dropdown", async () => {
      const user = userEvent.setup();
      render(
        <FabricFormModal
          open={true}
          onOpenChange={vi.fn()}
          fabric={null}
          fabricBrands={mockBrands}
          projects={mockProjects}
        />,
      );

      // Click the SearchableSelect trigger to open the dropdown
      await user.click(screen.getByText("Zweigart"));

      // "Add New" should be visible immediately (no typing required)
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    it("clicking Add New opens the brand creation dialog", async () => {
      const user = userEvent.setup();
      render(
        <FabricFormModal
          open={true}
          onOpenChange={vi.fn()}
          fabric={null}
          fabricBrands={mockBrands}
          projects={mockProjects}
        />,
      );

      await user.click(screen.getByText("Zweigart"));
      await user.click(screen.getByText("Add New"));

      await waitFor(() => {
        expect(screen.getByText("Add New Brand")).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Brand name/i)).toBeInTheDocument();
      });
    });

    it("submitting brand dialog calls createFabricBrand", async () => {
      const user = userEvent.setup();
      const newBrand = {
        id: "fb-new",
        name: "Wichelt",
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreateFabricBrand.mockResolvedValue({ success: true, brand: newBrand });

      render(
        <FabricFormModal
          open={true}
          onOpenChange={vi.fn()}
          fabric={null}
          fabricBrands={mockBrands}
          projects={mockProjects}
        />,
      );

      await user.click(screen.getByText("Zweigart"));
      await user.click(screen.getByText("Add New"));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Brand name/i)).toBeInTheDocument();
      });

      // Brand name field starts empty — type the name and submit
      const brandNameInput = screen.getByPlaceholderText(/Brand name/i);
      await user.type(brandNameInput, "Wichelt");
      await user.click(screen.getByRole("button", { name: /Add Brand/i }));

      await waitFor(() => {
        expect(mockCreateFabricBrand).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Wichelt" }),
        );
      });
    });
  });
});
