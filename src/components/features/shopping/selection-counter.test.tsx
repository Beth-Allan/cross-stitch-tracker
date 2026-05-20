import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SelectionCounter } from "./selection-counter";

describe("SelectionCounter", () => {
  it("normal mode shows '{N} of {M} projects selected'", () => {
    render(
      <SelectionCounter
        selectedCount={3}
        totalCount={10}
        visibleCount={10}
        visibleSelectedCount={3}
        isSearchActive={false}
      />,
    );

    expect(screen.getByText("3 of 10 projects selected")).toBeInTheDocument();
  });

  it("normal mode with 1 project shows 'project' not 'projects' (singular)", () => {
    render(
      <SelectionCounter
        selectedCount={0}
        totalCount={1}
        visibleCount={1}
        visibleSelectedCount={0}
        isSearchActive={false}
      />,
    );

    expect(screen.getByText("0 of 1 project selected")).toBeInTheDocument();
  });

  it("search mode shows visible selected count with total parenthetical", () => {
    render(
      <SelectionCounter
        selectedCount={5}
        totalCount={48}
        visibleCount={12}
        visibleSelectedCount={3}
        isSearchActive={true}
      />,
    );

    expect(screen.getByText("3 of 12 visible selected (5 total selected)")).toBeInTheDocument();
  });

  it("search mode when totalSelected equals visibleSelected omits the parenthetical", () => {
    render(
      <SelectionCounter
        selectedCount={3}
        totalCount={48}
        visibleCount={12}
        visibleSelectedCount={3}
        isSearchActive={true}
      />,
    );

    expect(screen.getByText("3 of 12 visible selected")).toBeInTheDocument();
    expect(screen.queryByText(/total selected/)).not.toBeInTheDocument();
  });

  it("has aria-live='polite' on the container", () => {
    render(
      <SelectionCounter
        selectedCount={3}
        totalCount={10}
        visibleCount={10}
        visibleSelectedCount={3}
        isSearchActive={false}
      />,
    );

    const counter = screen.getByText("3 of 10 projects selected");
    expect(counter).toHaveAttribute("aria-live", "polite");
  });

  it("normal mode when isSearchActive=false does not show 'visible' text", () => {
    render(
      <SelectionCounter
        selectedCount={5}
        totalCount={10}
        visibleCount={10}
        visibleSelectedCount={5}
        isSearchActive={false}
      />,
    );

    expect(screen.queryByText(/visible/)).not.toBeInTheDocument();
  });
});
