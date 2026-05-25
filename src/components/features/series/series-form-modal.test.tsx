import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SeriesFormModal } from "./series-form-modal";

const mockCreateSeries = vi.fn();
vi.mock("@/lib/actions/series-actions", () => ({
  createSeries: (...args: unknown[]) => mockCreateSeries(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockOnOpenChange = vi.fn();

function renderModal(overrides?: { open?: boolean }) {
  return render(<SeriesFormModal open={overrides?.open ?? true} onOpenChange={mockOnOpenChange} />);
}

describe("SeriesFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Name field (required), Total Count, and Notes fields", () => {
    renderModal();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("shows 'Series name is required' error when submitting with empty name", async () => {
    const user = userEvent.setup();
    renderModal();

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /create series/i }));

    await waitFor(() => {
      expect(screen.getByText("Series name is required")).toBeInTheDocument();
    });
  });

  it("successful createSeries shows 'Series created' toast and closes modal", async () => {
    const { toast } = await import("sonner");
    mockCreateSeries.mockResolvedValue({ success: true, series: { id: "s1" } });

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/name/i), "Mini Bottles");
    await user.click(screen.getByRole("button", { name: /create series/i }));

    await waitFor(() => {
      expect(mockCreateSeries).toHaveBeenCalledWith({
        name: "Mini Bottles",
        totalCount: null,
        designerId: null,
        notes: null,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Series created");
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("duplicate name error shows inline error from server response", async () => {
    mockCreateSeries.mockResolvedValue({
      success: false,
      error: "A series with that name already exists",
    });

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/name/i), "Mini Bottles");
    await user.click(screen.getByRole("button", { name: /create series/i }));

    await waitFor(() => {
      expect(screen.getByText("A series with that name already exists")).toBeInTheDocument();
    });
  });

  it("generic server error shows toast with fallback message", async () => {
    const { toast } = await import("sonner");
    mockCreateSeries.mockResolvedValue({
      success: false,
      error: "Database error",
    });

    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/name/i), "Mini Bottles");
    await user.click(screen.getByRole("button", { name: /create series/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Couldn't create series. Please try again.");
    });
  });
});
