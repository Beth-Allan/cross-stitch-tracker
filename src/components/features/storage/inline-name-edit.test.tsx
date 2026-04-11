import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { InlineNameEdit } from "./inline-name-edit";

describe("InlineNameEdit", () => {
  const defaultProps = {
    name: "Bin A",
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name text when not editing", () => {
    render(<InlineNameEdit {...defaultProps} />);
    expect(screen.getByText("Bin A")).toBeInTheDocument();
  });

  it("clicking edit button switches to input mode with auto-focus", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit name/i });
    await user.click(editButton);

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Bin A");
  });

  it("pressing Enter with non-empty trimmed value calls onSave with trimmed value", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "  Shelf 3  ");
    await user.keyboard("{Enter}");

    expect(defaultProps.onSave).toHaveBeenCalledWith("Shelf 3");
  });

  it("pressing Enter with empty/whitespace-only value does NOT call onSave", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it("pressing Escape reverts to display mode", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Bin A")).toBeInTheDocument();
  });

  it("blur event cancels editing (reverts to display mode)", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <InlineNameEdit {...defaultProps} />
        <button>other</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // Tab away to trigger blur
    await user.tab();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Bin A")).toBeInTheDocument();
  });

  it("confirm button uses onMouseDown to fire before blur and saves", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Updated");

    const saveButton = screen.getByRole("button", { name: /save name/i });
    await user.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith("Updated");
  });

  it("cancel button uses onMouseDown to fire before blur and cancels", async () => {
    const user = userEvent.setup();
    render(<InlineNameEdit {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit name/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Changed");

    const cancelButton = screen.getByRole("button", { name: /cancel editing/i });
    await user.click(cancelButton);

    expect(defaultProps.onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Bin A")).toBeInTheDocument();
  });

  it('when variant="heading", renders with text-2xl font-heading classes', () => {
    render(<InlineNameEdit {...defaultProps} variant="heading" />);
    const nameElement = screen.getByText("Bin A");
    expect(nameElement.className).toMatch(/text-2xl/);
    expect(nameElement.className).toMatch(/font-heading/);
  });
});
