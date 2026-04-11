import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SupplyFormModal } from "./supply-form-modal";
import { createMockSupplyBrand, createMockThread } from "@/__tests__/mocks";
import type { SupplyBrand } from "@/generated/prisma/client";

const mockCreateThread = vi.fn();
const mockUpdateThread = vi.fn();
const mockCreateBead = vi.fn();
const mockCreateSpecialtyItem = vi.fn();

vi.mock("@/lib/actions/supply-actions", () => ({
  createThread: (...args: unknown[]) => mockCreateThread(...args),
  updateThread: (...args: unknown[]) => mockUpdateThread(...args),
  createBead: (...args: unknown[]) => mockCreateBead(...args),
  createSpecialtyItem: (...args: unknown[]) => mockCreateSpecialtyItem(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const dmcBrand = createMockSupplyBrand({
  id: "brand-dmc",
  name: "DMC",
  website: "https://www.dmc.com",
  supplyType: "THREAD",
});

const brands: SupplyBrand[] = [dmcBrand];

describe("SupplyFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields for thread creation (brandId, colorCode, colorName, hexColor, colorFamily)", () => {
    render(
      <SupplyFormModal
        open={true}
        onOpenChange={vi.fn()}
        mode="create"
        supplyType="thread"
        brands={brands}
      />,
    );

    expect(screen.getByRole("button", { name: /Add Thread/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hex Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color Family/i)).toBeInTheDocument();
  });

  it("calls createThread on submit with valid data", async () => {
    const user = userEvent.setup();
    mockCreateThread.mockResolvedValue({ success: true, thread: createMockThread() });
    const onOpenChange = vi.fn();

    render(
      <SupplyFormModal
        open={true}
        onOpenChange={onOpenChange}
        mode="create"
        supplyType="thread"
        brands={brands}
      />,
    );

    await user.clear(screen.getByLabelText(/Color Code/i));
    await user.type(screen.getByLabelText(/Color Code/i), "310");
    await user.clear(screen.getByLabelText(/Color Name/i));
    await user.type(screen.getByLabelText(/Color Name/i), "Black");

    // Set hex color
    const hexInput = screen.getByLabelText(/Hex Color/i);
    await user.clear(hexInput);
    await user.type(hexInput, "#000000");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Add Thread/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateThread).toHaveBeenCalledWith(
        expect.objectContaining({
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
        }),
      );
    });
  });

  it("shows validation error for invalid hex color", async () => {
    const user = userEvent.setup();
    mockCreateThread.mockResolvedValue({ success: false, error: "Must be a valid hex color (e.g., #FF5733)" });

    render(
      <SupplyFormModal
        open={true}
        onOpenChange={vi.fn()}
        mode="create"
        supplyType="thread"
        brands={brands}
      />,
    );

    // Fill required fields with invalid hex
    await user.clear(screen.getByLabelText(/Color Code/i));
    await user.type(screen.getByLabelText(/Color Code/i), "310");
    await user.clear(screen.getByLabelText(/Color Name/i));
    await user.type(screen.getByLabelText(/Color Name/i), "Black");

    const hexInput = screen.getByLabelText(/Hex Color/i);
    await user.clear(hexInput);
    await user.type(hexInput, "invalid");

    const submitButton = screen.getByRole("button", { name: /Add Thread/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Must be a valid hex color/)).toBeInTheDocument();
    });
  });

  it("shows Save Changes button in edit mode", () => {
    render(
      <SupplyFormModal
        open={true}
        onOpenChange={vi.fn()}
        mode="edit"
        supplyType="thread"
        brands={brands}
        initialData={{
          id: "t1",
          brandId: "brand-dmc",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });

  it("shows Cancel button", () => {
    render(
      <SupplyFormModal
        open={true}
        onOpenChange={vi.fn()}
        mode="create"
        supplyType="thread"
        brands={brands}
      />,
    );

    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });
});
