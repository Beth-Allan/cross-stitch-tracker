import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { DeleteFileDialog } from "./delete-file-dialog";

describe("DeleteFileDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    filename: "pattern-chart.pdf",
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  it("renders filename in description", () => {
    render(<DeleteFileDialog {...defaultProps} />);

    expect(screen.getByText(/pattern-chart\.pdf/)).toBeInTheDocument();
  });

  it("calls onConfirm when 'Delete File' clicked", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<DeleteFileDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /Delete File/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("shows 'Deleting...' during pending state", async () => {
    // onConfirm never resolves to keep pending state
    const onConfirm = vi.fn(() => new Promise<void>(() => {}));
    render(<DeleteFileDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /Delete File/i }));

    await waitFor(() => {
      expect(screen.getByText("Deleting...")).toBeInTheDocument();
    });
  });

  it("Cancel button closes dialog", () => {
    const onOpenChange = vi.fn();
    render(<DeleteFileDialog {...defaultProps} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
