import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SupplySearchInput } from "./supply-search-input";

describe("SupplySearchInput", () => {
  it("renders input with placeholder 'Search supplies...'", () => {
    render(<SupplySearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText("Search supplies...")).toBeInTheDocument();
  });

  it("calls onChange callback when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SupplySearchInput value="" onChange={onChange} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "DMC");

    expect(onChange).toHaveBeenCalledWith("D");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("shows X clear button only when value is non-empty", () => {
    const { rerender } = render(<SupplySearchInput value="" onChange={vi.fn()} />);

    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

    rerender(<SupplySearchInput value="test" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("clicking X clear button calls onChange with empty string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SupplySearchInput value="test" onChange={onChange} />);

    await user.click(screen.getByLabelText("Clear search"));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("has role='searchbox' and aria-label='Search supplies'", () => {
    render(<SupplySearchInput value="" onChange={vi.fn()} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-label", "Search supplies");
  });
});
