import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { QuantityControl } from "./quantity-control";

describe("QuantityControl", () => {
  const defaultProps = {
    acquired: 2,
    required: 3,
    isPending: false,
    onChange: vi.fn(),
  };

  it("renders acquired/total display", () => {
    render(<QuantityControl {...defaultProps} />);
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("minus button is disabled when acquired is 0", () => {
    render(<QuantityControl {...defaultProps} acquired={0} />);
    const minusButton = screen.getByRole("button", { name: /minus|decrement/i });
    expect(minusButton).toBeDisabled();
  });

  it("plus button is disabled when acquired >= total", () => {
    render(<QuantityControl {...defaultProps} acquired={3} />);
    const plusButton = screen.getByRole("button", { name: /plus|increment/i });
    expect(plusButton).toBeDisabled();
  });

  it("calls onChange with incremented value when Plus clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    const plusButton = screen.getByRole("button", { name: /plus|increment/i });
    await user.click(plusButton);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange with decremented value when Minus clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    const minusButton = screen.getByRole("button", { name: /minus|decrement/i });
    await user.click(minusButton);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("shows selected background when fully fulfilled", () => {
    const { container } = render(<QuantityControl {...defaultProps} acquired={3} required={3} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("bg-selected");
  });

  it("does not show selected background when not fully fulfilled", () => {
    const { container } = render(<QuantityControl {...defaultProps} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).not.toContain("bg-selected");
  });

  it("disables buttons when isPending is true", () => {
    render(<QuantityControl {...defaultProps} isPending={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("opens inline input on quantity display click and commits on Enter", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("2/3"));
    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "1");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("cancels inline edit on Escape without calling onChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("2/3"));
    const input = screen.getByRole("spinbutton");
    await user.click(input);
    await user.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("clamps inline input value to [0, required]", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("2/3"));
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "99");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("commits edited value on blur (mobile commit path)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("2/3"));
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "1");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("blur after Escape does not re-commit value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityControl {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("2/3"));
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  describe("a need that is unknown (D-34)", () => {
    const unknownProps = { ...defaultProps, required: null };

    it("shows the need as the word Unknown, never as a number", () => {
      render(<QuantityControl {...unknownProps} acquired={2} />);
      const display = screen.getByRole("button", { name: /click to edit/ });
      expect(display).toHaveTextContent("2/Unknown");
      expect(screen.getByText("Unknown")).toHaveClass("text-muted-foreground");
    });

    it("never reads as fulfilled, however much has been bought", () => {
      const { container } = render(<QuantityControl {...unknownProps} acquired={5} />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("bg-selected");
    });

    it("keeps the plus button open, because there is no need to stop at", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<QuantityControl {...unknownProps} acquired={5} onChange={onChange} />);
      const plusButton = screen.getByRole("button", { name: /plus|increment/i });
      expect(plusButton).toBeEnabled();
      await user.click(plusButton);
      expect(onChange).toHaveBeenCalledWith(6);
    });

    it("commits an edited value without clamping it to a need", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<QuantityControl {...unknownProps} acquired={2} onChange={onChange} />);
      await user.click(screen.getByRole("button", { name: /click to edit/ }));
      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "9");
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenCalledWith(9);
    });

    it("shows a known total that also covers unknown lines as 'N + unknown'", () => {
      const { container } = render(
        <QuantityControl {...defaultProps} acquired={3} required={3} plusUnknown />,
      );
      const display = screen.getByRole("button", { name: /click to edit/ });
      expect(display).toHaveTextContent("3/3 + unknown");
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).not.toContain("bg-selected");
      expect(screen.getByRole("button", { name: /plus|increment/i })).toBeEnabled();
    });
  });
});
