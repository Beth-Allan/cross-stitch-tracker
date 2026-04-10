import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("DeleteConfirmationDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Delete Designer?",
    entityName: "Nora Corbett",
    chartCount: 8,
    entityType: "designer" as const,
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and description with entity name and chart count", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(screen.getByText("Delete Designer?")).toBeInTheDocument();
    expect(screen.getByText(/Nora Corbett/)).toBeInTheDocument();
    expect(screen.getByText(/8 chart\(s\)/)).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmationDialog {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    await user.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('description contains "Charts will NOT be deleted"', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(screen.getByText(/Charts will NOT be deleted/)).toBeInTheDocument();
  });

  it("shows designer-specific unlink message for designer entity type", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(
      screen.getByText(/will be unlinked from this designer/),
    ).toBeInTheDocument();
  });

  it("shows genre-specific tag message for genre entity type", () => {
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        title="Delete Genre?"
        entityName="Fantasy"
        chartCount={12}
        entityType="genre"
      />,
    );

    expect(
      screen.getByText(/will lose this genre tag/),
    ).toBeInTheDocument();
  });

  it("renders Cancel and Delete buttons", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /cancel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^delete$/i }),
    ).toBeInTheDocument();
  });

  it("closes dialog after successful onConfirm", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    // Wait for the transition to complete
    await vi.waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("keeps dialog open when onConfirm throws", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error("Network error"));
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    // Give the transition time to settle
    await vi.waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    // onOpenChange should NOT have been called with false
    const closeCalls = onOpenChange.mock.calls.filter(([val]: [boolean]) => val === false);
    expect(closeCalls).toHaveLength(0);
  });
});
