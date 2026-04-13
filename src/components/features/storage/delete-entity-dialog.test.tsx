import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { DeleteEntityDialog } from "./delete-entity-dialog";

describe("DeleteEntityDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    entityName: "Bin A",
    projectCount: 3,
    entityType: "storage-location" as const,
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct title and description for "storage-location" entityType', () => {
    render(<DeleteEntityDialog {...defaultProps} />);

    expect(screen.getByText("Delete Storage Location")).toBeInTheDocument();
    expect(screen.getByText(/Bin A/)).toBeInTheDocument();
    expect(screen.getByText(/will be unlinked from this storage location/)).toBeInTheDocument();
    expect(screen.getByText(/Projects will NOT be deleted/)).toBeInTheDocument();
  });

  it('renders correct description for "stitching-app" entityType', () => {
    render(
      <DeleteEntityDialog
        {...defaultProps}
        entityType="stitching-app"
        entityName="Markup R-XP"
        projectCount={5}
      />,
    );

    expect(screen.getByText("Delete Stitching App")).toBeInTheDocument();
    expect(screen.getByText(/Markup R-XP/)).toBeInTheDocument();
    expect(screen.getByText(/will be unlinked from this app/)).toBeInTheDocument();
  });

  it("shows affected project count in description (plural)", () => {
    render(<DeleteEntityDialog {...defaultProps} />);

    expect(screen.getByText(/3 project\(s\)/)).toBeInTheDocument();
  });

  it('shows "No projects are assigned" when count is 0 for storage-location', () => {
    render(<DeleteEntityDialog {...defaultProps} projectCount={0} />);

    expect(screen.getByText(/No projects are assigned/)).toBeInTheDocument();
  });

  it('shows "No projects are using" when count is 0 for stitching-app', () => {
    render(
      <DeleteEntityDialog
        {...defaultProps}
        entityType="stitching-app"
        entityName="Pattern Keeper"
        projectCount={0}
      />,
    );

    expect(screen.getByText(/No projects are using/)).toBeInTheDocument();
  });

  it('confirm button shows "Deleting..." while pending', async () => {
    const user = userEvent.setup();
    // Use a promise that won't resolve immediately
    const onConfirm = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<DeleteEntityDialog {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    await user.click(deleteButton);

    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: /deleting/i })).toBeInTheDocument();
    });
  });

  it("cancel button closes dialog", async () => {
    const user = userEvent.setup();
    render(<DeleteEntityDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps dialog open when onConfirm throws (does not call onOpenChange)", async () => {
    const user = userEvent.setup();
    const failingConfirm = vi.fn().mockRejectedValue(new Error("Delete failed"));
    const onOpenChange = vi.fn();
    render(
      <DeleteEntityDialog
        {...defaultProps}
        onConfirm={failingConfirm}
        onOpenChange={onOpenChange}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    await user.click(deleteButton);

    // Wait for the transition to settle
    await vi.waitFor(() => {
      expect(failingConfirm).toHaveBeenCalledTimes(1);
    });

    // Dialog should NOT have been closed — catch block keeps it open
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
