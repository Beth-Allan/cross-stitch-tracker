import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/__tests__/test-utils";
import { EditableNumber } from "./editable-number";

describe("EditableNumber", () => {
  it("renders value as text when not editing", () => {
    render(<EditableNumber value={5} onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByTitle("Click to edit")).toHaveTextContent("5");
  });

  it("switches to input on click", async () => {
    const user = userEvent.setup();
    render(<EditableNumber value={3} onSave={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("calls onSave with new number on Enter", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableNumber value={3} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "3" }));
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "10");
    await user.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith(10);
  });

  it("reverts on Escape", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableNumber value={7} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "7" }));
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "99");
    await user.keyboard("{Escape}");

    // Should revert to display mode without calling onSave
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "7" })).toHaveTextContent("7");
  });

  it("input has aria-label when ariaLabel prop provided", async () => {
    const user = userEvent.setup();
    render(<EditableNumber value={2} onSave={vi.fn()} ariaLabel="Quantity needed for DMC 310" />);

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("spinbutton")).toHaveAttribute(
      "aria-label",
      "Quantity needed for DMC 310",
    );
  });
});
