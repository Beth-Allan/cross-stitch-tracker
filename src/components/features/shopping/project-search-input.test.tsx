import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ProjectSearchInput } from "./project-search-input";

describe("ProjectSearchInput", () => {
  it("renders input with placeholder 'Search projects...'", () => {
    render(<ProjectSearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("renders Search icon in the input", () => {
    const { container } = render(<ProjectSearchInput value="" onChange={vi.fn()} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls onChange callback when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProjectSearchInput value="" onChange={onChange} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "dragon");

    expect(onChange).toHaveBeenCalledWith("d");
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it("shows X clear button only when value is non-empty", () => {
    const { rerender } = render(<ProjectSearchInput value="" onChange={vi.fn()} />);

    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

    rerender(<ProjectSearchInput value="test" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("clicking X clear button calls onChange with empty string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProjectSearchInput value="test" onChange={onChange} />);

    await user.click(screen.getByLabelText("Clear search"));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("has role='searchbox' and aria-label='Search projects'", () => {
    render(<ProjectSearchInput value="" onChange={vi.fn()} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-label", "Search projects");
  });

  it("clear button has aria-label='Clear search'", () => {
    render(<ProjectSearchInput value="test" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });
});
