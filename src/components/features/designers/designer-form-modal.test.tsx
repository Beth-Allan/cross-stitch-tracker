import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { DesignerFormModal } from "./designer-form-modal";
import { createMockDesignerWithStats } from "@/__tests__/mocks";

const mockCreateDesigner = vi.fn();
const mockUpdateDesigner = vi.fn();
vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: (...args: unknown[]) => mockCreateDesigner(...args),
  updateDesigner: (...args: unknown[]) => mockUpdateDesigner(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

function renderModal(overrides?: {
  open?: boolean;
  designer?: ReturnType<typeof createMockDesignerWithStats> | null;
}) {
  return render(
    <DesignerFormModal
      open={overrides?.open ?? true}
      onOpenChange={mockOnOpenChange}
      designer={overrides?.designer ?? null}
      onSuccess={mockOnSuccess}
    />,
  );
}

describe("DesignerFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, website, notes fields", () => {
    renderModal();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("in create mode shows 'Add Designer' title and button", () => {
    renderModal();

    // Both title and submit button say "Add Designer"
    const addDesignerElements = screen.getAllByText("Add Designer");
    expect(addDesignerElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: /add designer/i })).toBeInTheDocument();
  });

  it("in edit mode shows 'Edit Designer' title and 'Save Changes' button with pre-filled fields", () => {
    const designer = createMockDesignerWithStats({
      id: "d1",
      name: "Nora Corbett",
      website: "https://nora.com",
      notes: "Beautiful fairy designs",
    });

    renderModal({ designer });

    expect(screen.getByText("Edit Designer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Nora Corbett");
    expect(screen.getByLabelText(/website/i)).toHaveValue("https://nora.com");
    expect(screen.getByLabelText(/notes/i)).toHaveValue("Beautiful fairy designs");
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    renderModal();

    // Clear any default value and submit
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /add designer/i }));

    await waitFor(() => {
      expect(screen.getByText(/designer name is required/i)).toBeInTheDocument();
    });
  });

  it("calls createDesigner on submit in create mode", async () => {
    mockCreateDesigner.mockResolvedValue({ success: true, designer: { id: "d1" } });

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/name/i), "Heaven and Earth Designs");
    await user.type(screen.getByLabelText(/website/i), "https://heavenandearthdesigns.com");
    await user.click(screen.getByRole("button", { name: /add designer/i }));

    await waitFor(() => {
      expect(mockCreateDesigner).toHaveBeenCalledWith({
        name: "Heaven and Earth Designs",
        website: "https://heavenandearthdesigns.com",
        notes: null,
      });
    });
  });

  it("calls updateDesigner on submit in edit mode", async () => {
    mockUpdateDesigner.mockResolvedValue({ success: true, designer: { id: "d1" } });

    const designer = createMockDesignerWithStats({
      id: "d1",
      name: "Nora Corbett",
      website: null,
      notes: null,
    });

    const user = userEvent.setup();
    renderModal({ designer });

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Mirabilia Designs");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateDesigner).toHaveBeenCalledWith("d1", {
        name: "Mirabilia Designs",
        website: null,
        notes: null,
      });
    });
  });

  it("shows helper text about computed fields", () => {
    renderModal();

    expect(
      screen.getByText(/chart count, genre, and project stats are calculated automatically/i),
    ).toBeInTheDocument();
  });

  it("shows server error below name field when createDesigner returns duplicate name error", async () => {
    mockCreateDesigner.mockResolvedValue({
      success: false,
      error: "A designer with that name already exists",
    });

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/name/i), "Heaven and Earth Designs");
    await user.click(screen.getByRole("button", { name: /add designer/i }));

    await waitFor(() => {
      expect(screen.getByText("A designer with that name already exists")).toBeInTheDocument();
    });
  });
});
