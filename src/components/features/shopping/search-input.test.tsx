import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("renders input with provided placeholder", () => {
    render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("renders Search icon in the input", () => {
    const { container } = render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls onChange callback when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SearchInput
        value=""
        onChange={onChange}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    const input = screen.getByRole("searchbox");
    await user.type(input, "dragon");

    expect(onChange).toHaveBeenCalledWith("d");
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it("shows X clear button only when value is non-empty", () => {
    const { rerender } = render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

    rerender(
      <SearchInput
        value="test"
        onChange={vi.fn()}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("clicking X clear button calls onChange with empty string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SearchInput
        value="test"
        onChange={onChange}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    await user.click(screen.getByLabelText("Clear search"));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("applies provided aria-label to the searchbox", () => {
    render(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder="Search supplies..."
        ariaLabel="Search supplies"
      />,
    );

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-label", "Search supplies");
  });

  it("clear button has aria-label='Clear search'", () => {
    render(
      <SearchInput
        value="test"
        onChange={vi.fn()}
        placeholder="Search projects..."
        ariaLabel="Search projects"
      />,
    );

    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });
});
