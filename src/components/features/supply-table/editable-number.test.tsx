import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@/__tests__/test-utils";
import { EditableNumber } from "./editable-number";

describe("EditableNumber", () => {
  it("renders value as a button in read mode", () => {
    render(<EditableNumber value={42} onSave={vi.fn()} ariaLabel="Stitch count" />);
    const button = screen.getByRole("button", { name: "Stitch count" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("42");
  });

  it("clicking the button enters edit mode (shows input)", () => {
    render(<EditableNumber value={10} onSave={vi.fn()} ariaLabel="Need" />);
    const button = screen.getByRole("button", { name: "Need" });
    fireEvent.click(button);
    const input = screen.getByRole("spinbutton", { name: "Need" });
    expect(input).toBeInTheDocument();
  });

  it("input auto-focuses and selects text on edit", () => {
    render(<EditableNumber value={25} onSave={vi.fn()} ariaLabel="Have" />);
    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    const input = screen.getByRole("spinbutton", { name: "Have" });
    expect(input).toHaveFocus();
  });

  it("pressing Enter saves the value", () => {
    const onSave = vi.fn();
    render(<EditableNumber value={10} onSave={onSave} ariaLabel="Count" />);
    fireEvent.click(screen.getByRole("button", { name: "Count" }));
    const input = screen.getByRole("spinbutton", { name: "Count" });
    fireEvent.change(input, { target: { value: "20" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).toHaveBeenCalledWith(20);
  });

  it("pressing Escape reverts to original value without calling onSave", () => {
    const onSave = vi.fn();
    render(<EditableNumber value={10} onSave={onSave} ariaLabel="Count" />);
    fireEvent.click(screen.getByRole("button", { name: "Count" }));
    const input = screen.getByRole("spinbutton", { name: "Count" });
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.keyDown(input, { key: "Escape" });
    // Should revert to button with original value
    const button = screen.getByRole("button", { name: "Count" });
    expect(button).toHaveTextContent("10");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("blur saves valid value", () => {
    const onSave = vi.fn();
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
    fireEvent.click(screen.getByRole("button", { name: "Qty" }));
    const input = screen.getByRole("spinbutton", { name: "Qty" });
    fireEvent.change(input, { target: { value: "15" } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledWith(15);
  });

  it("blur with invalid value (NaN) reverts without calling onSave", () => {
    const onSave = vi.fn();
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
    fireEvent.click(screen.getByRole("button", { name: "Qty" }));
    const input = screen.getByRole("spinbutton", { name: "Qty" });
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
    // Should revert to button showing original value
    const button = screen.getByRole("button", { name: "Qty" });
    expect(button).toHaveTextContent("5");
  });

  it("blur with negative value reverts without calling onSave", () => {
    const onSave = vi.fn();
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
    fireEvent.click(screen.getByRole("button", { name: "Qty" }));
    const input = screen.getByRole("spinbutton", { name: "Qty" });
    fireEvent.change(input, { target: { value: "-3" } });
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("aria-label prop is rendered on both button and input", () => {
    const { rerender } = render(
      <EditableNumber value={7} onSave={vi.fn()} ariaLabel="Stitch count" />,
    );
    // Button mode
    expect(screen.getByRole("button", { name: "Stitch count" })).toBeInTheDocument();
    // Switch to edit mode
    fireEvent.click(screen.getByRole("button", { name: "Stitch count" }));
    expect(screen.getByRole("spinbutton", { name: "Stitch count" })).toBeInTheDocument();
  });

  it('button has "Click to edit" title attribute', () => {
    render(<EditableNumber value={42} onSave={vi.fn()} ariaLabel="Count" />);
    const button = screen.getByRole("button", { name: "Count" });
    expect(button).toHaveAttribute("title", "Click to edit");
  });

  it("hover state class includes primary-tinted background", () => {
    render(<EditableNumber value={42} onSave={vi.fn()} ariaLabel="Count" />);
    const button = screen.getByRole("button", { name: "Count" });
    expect(button.className).toContain("hover:bg-primary/5");
  });

  describe("rejection feedback (UX-03)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("entering invalid value (NaN) and blurring shows rejection flash with border + background tint", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).toContain("border-destructive");
      expect(button.className).toContain("animate-shake");
      expect(button.className).toContain("bg-destructive/10");
    });

    it("bg-destructive/10 background tint is present while showRejection is true", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).toContain("bg-destructive/10");
    });

    it("rejection flash disappears after 600ms", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.blur(input);

      // Should have rejection classes immediately
      let button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).toContain("animate-shake");

      // Advance past 600ms
      act(() => {
        vi.advanceTimersByTime(600);
      });

      button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).not.toContain("animate-shake");
      expect(button.className).not.toContain("border-destructive");
      expect(button.className).not.toContain("bg-destructive/10");
    });

    it("entering valid value and blurring does NOT show rejection classes", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "15" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).not.toContain("border-destructive");
      expect(button.className).not.toContain("animate-shake");
      expect(button.className).not.toContain("bg-destructive/10");
    });

    it("entering negative value and blurring shows rejection flash with background tint", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "-3" } });
      fireEvent.blur(input);

      const button = screen.getByRole("button", { name: "Qty" });
      expect(button.className).toContain("border-destructive");
      expect(button.className).toContain("animate-shake");
      expect(button.className).toContain("bg-destructive/10");
    });

    it("announces the rejection to assistive technology", () => {
      const onSave = vi.fn();
      render(<EditableNumber value={5} onSave={onSave} ariaLabel="Qty" />);
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));
      const input = screen.getByRole("spinbutton", { name: "Qty" });
      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.blur(input);

      expect(screen.getByRole("status")).toHaveTextContent("Value not saved");
    });

    it("announces nothing while no edit has been rejected", () => {
      render(<EditableNumber value={5} onSave={vi.fn()} ariaLabel="Qty" />);

      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("keeps the announcement region mounted while the input is showing", () => {
      render(<EditableNumber value={5} onSave={vi.fn()} ariaLabel="Qty" />);
      const before = screen.getByRole("status");
      fireEvent.click(screen.getByRole("button", { name: "Qty" }));

      expect(screen.getByRole("spinbutton", { name: "Qty" })).toBeInTheDocument();
      // The same node, not merely a node: a region inserted alongside its text is not
      // announced, so remounting it across the edit swap would silently undo the fix
      expect(screen.getByRole("status")).toBe(before);
    });
  });
});

describe("EditableNumber — optimistic save that fails", () => {
  it("rolls back to the saved value when the save reports failure", async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    expect(screen.getByRole("button", { name: "Have" })).toHaveTextContent("12");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Have" })).toHaveTextContent("5"),
    );
  });

  it("rolls back when the save throws", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("network down"));
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Have" })).toHaveTextContent("5"),
    );
  });

  it("announces the rollback so the revert is not silent", async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Value not saved"));
  });

  it("keeps the optimistic value while a successful save is in flight", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(12));
    expect(screen.getByRole("button", { name: "Have" })).toHaveTextContent("12");
  });
});

describe("EditableNumber — overlapping saves", () => {
  it("ignores a stale failure so it cannot clobber a newer accepted edit", async () => {
    let rejectFirst: (value: boolean) => void = () => {};
    const onSave = vi
      .fn()
      .mockImplementationOnce(() => new Promise<boolean>((res) => (rejectFirst = res)))
      .mockResolvedValueOnce(true);

    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "20" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));

    await act(async () => {
      rejectFirst(false);
    });

    const button = screen.getByRole("button", { name: "Have" });
    expect(button).toHaveTextContent("20");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("still rolls back when the latest save is the one that fails", async () => {
    const onSave = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    render(<EditableNumber value={5} onSave={onSave} ariaLabel="Have" />);

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "12" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    fireEvent.click(screen.getByRole("button", { name: "Have" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Have" }), {
      target: { value: "20" },
    });
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Have" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Have" })).toHaveTextContent("5"),
    );
  });
});
