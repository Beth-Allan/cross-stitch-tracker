import { render, screen, act } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InlineNameDialog } from "./inline-name-dialog";

describe("InlineNameDialog", () => {
  it("renders with title and empty input when open", () => {
    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Storage Location"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Storage Location")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("pre-fills input with initialName", () => {
    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Storage Location"
        initialName="Bin A"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue("Bin A");
  });

  it("calls onSubmit with trimmed name and closes on submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <InlineNameDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Add Storage Location"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), "  My Bin  ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onSubmit).toHaveBeenCalledWith("My Bin");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows error when submitting with empty name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Storage Location"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error when submitting with whitespace-only name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Storage Location"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows server error when onSubmit throws", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Already exists"));

    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Storage Location"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), "Duplicate");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Already exists")).toBeInTheDocument();
  });

  it("closes without submitting when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <InlineNameDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Add Storage Location"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses custom placeholder when provided", () => {
    render(
      <InlineNameDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Add Stitching App"
        placeholder="e.g. Pattern Keeper"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("e.g. Pattern Keeper")).toBeInTheDocument();
  });
});
