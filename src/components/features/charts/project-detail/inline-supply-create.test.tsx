import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { InlineSupplyCreate } from "./inline-supply-create";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockCreateAndAddThread = vi.fn();
const mockCreateAndAddBead = vi.fn();
const mockCreateAndAddSpecialty = vi.fn();

vi.mock("@/lib/actions/supply-actions", () => ({
  createAndAddThread: (...args: unknown[]) => mockCreateAndAddThread(...args),
  createAndAddBead: (...args: unknown[]) => mockCreateAndAddBead(...args),
  createAndAddSpecialty: (...args: unknown[]) => mockCreateAndAddSpecialty(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  type: "thread" as const,
  projectId: "proj-1",
  searchText: "Custom Red",
  onCreated: vi.fn(),
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("InlineSupplyCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAndAddThread.mockResolvedValue({ success: true, record: {} });
    mockCreateAndAddBead.mockResolvedValue({ success: true, record: {} });
    mockCreateAndAddSpecialty.mockResolvedValue({ success: true, record: {} });
  });

  it("renders dialog title 'Add New Thread' for thread type", () => {
    render(<InlineSupplyCreate {...defaultProps} type="thread" />);
    expect(screen.getByText("Add New Thread")).toBeInTheDocument();
  });

  it("renders dialog title 'Add New Bead' for bead type", () => {
    render(<InlineSupplyCreate {...defaultProps} type="bead" />);
    expect(screen.getByText("Add New Bead")).toBeInTheDocument();
  });

  it("renders dialog title 'Add New Item' for specialty type", () => {
    render(<InlineSupplyCreate {...defaultProps} type="specialty" />);
    expect(screen.getByText("Add New Item")).toBeInTheDocument();
  });

  it("pre-fills name input with searchText", () => {
    render(<InlineSupplyCreate {...defaultProps} searchText="My Custom Thread" />);
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveValue("My Custom Thread");
  });

  it("shows validation error for empty name", async () => {
    render(<InlineSupplyCreate {...defaultProps} searchText="" />);
    const nameInput = screen.getByLabelText(/name/i);
    // Clear the input
    fireEvent.change(nameInput, { target: { value: "   " } });

    // Click submit
    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
    // Should NOT call the server action
    expect(mockCreateAndAddThread).not.toHaveBeenCalled();
  });

  it("calls createAndAddThread on submit for thread type", async () => {
    render(<InlineSupplyCreate {...defaultProps} type="thread" searchText="Custom Red" />);

    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAndAddThread).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          name: "Custom Red",
        }),
      );
    });
  });

  it("calls createAndAddBead on submit for bead type", async () => {
    render(<InlineSupplyCreate {...defaultProps} type="bead" searchText="Custom Bead" />);

    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAndAddBead).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          name: "Custom Bead",
        }),
      );
    });
  });

  it("calls createAndAddSpecialty on submit for specialty type", async () => {
    render(<InlineSupplyCreate {...defaultProps} type="specialty" searchText="Custom Item" />);

    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAndAddSpecialty).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          name: "Custom Item",
        }),
      );
    });
  });

  it("closes dialog on successful creation", async () => {
    const onCreated = vi.fn();
    render(<InlineSupplyCreate {...defaultProps} onCreated={onCreated} />);

    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it("shows error toast on failure without closing dialog", async () => {
    const onCreated = vi.fn();
    mockCreateAndAddThread.mockResolvedValue({
      success: false,
      error: "Something went wrong",
    });

    render(<InlineSupplyCreate {...defaultProps} onCreated={onCreated} />);

    const submitButton = screen.getByRole("button", { name: /add$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAndAddThread).toHaveBeenCalled();
    });

    // Dialog should stay open (onCreated should NOT be called on failure)
    expect(onCreated).not.toHaveBeenCalled();
    // onOpenChange should NOT be called with false on failure
    expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("does not render when open is false", () => {
    render(<InlineSupplyCreate {...defaultProps} open={false} />);
    expect(screen.queryByText("Add New Thread")).not.toBeInTheDocument();
  });
});
