import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent, act } from "@/__tests__/test-utils";
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

  describe("rejection feedback (UX-03)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("entering value below min and blurring shows rejection flash with background tint", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} min={1} max={100} />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "0" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "5" });
      expect(button.className).toContain("border-destructive");
      expect(button.className).toContain("animate-shake");
      expect(button.className).toContain("bg-destructive/10");
    });

    it("entering value above max and blurring shows rejection flash with background tint", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} min={1} max={10} />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "15" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "5" });
      expect(button.className).toContain("border-destructive");
      expect(button.className).toContain("animate-shake");
      expect(button.className).toContain("bg-destructive/10");
    });

    it("entering valid value within range does NOT show rejection or background tint", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} min={1} max={100} />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "50" } });
      fireEvent.blur(input);

      // After valid save, the button should show the new value (via onSave callback)
      // and not have rejection classes
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
      const button = screen.getByTitle("Click to edit");
      expect(button.className).not.toContain("border-destructive");
      expect(button.className).not.toContain("animate-shake");
      expect(button.className).not.toContain("bg-destructive/10");
    });

    it("rejection flash clears after 600ms", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} min={1} max={10} />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "20" } });
      fireEvent.blur(input);

      let button = screen.getByRole("button", { name: "5" });
      expect(button.className).toContain("animate-shake");

      act(() => {
        vi.advanceTimersByTime(600);
      });

      button = screen.getByRole("button", { name: "5" });
      expect(button.className).not.toContain("animate-shake");
      expect(button.className).not.toContain("border-destructive");
      expect(button.className).not.toContain("bg-destructive/10");
    });

    it("announces the rejection to assistive technology", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} min={1} max={10} />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "20" } });
      fireEvent.blur(input);

      expect(screen.getByRole("status")).toHaveTextContent("Value not saved");
    });

    it("announces nothing while no edit has been rejected", () => {
      render(<EditableNumber value={5} onSave={vi.fn()} min={1} max={10} />);

      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });
});
