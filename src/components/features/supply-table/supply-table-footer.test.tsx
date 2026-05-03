import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SupplyTableFooter } from "./supply-table-footer";

describe("SupplyTableFooter", () => {
  it('shows "N colours added" when only threads are present (not mixed)', () => {
    render(
      <SupplyTableFooter
        threadCount={12}
        beadCount={0}
        specialtyCount={0}
        totalSkeinsNeeded={24}
        totalItemsNeeded={24}
      />,
    );
    expect(screen.getByText("12 colours added")).toBeInTheDocument();
  });

  it('shows "N supplies added" when mixed types are present', () => {
    render(
      <SupplyTableFooter
        threadCount={10}
        beadCount={3}
        specialtyCount={0}
        totalSkeinsNeeded={20}
        totalItemsNeeded={23}
      />,
    );
    expect(screen.getByText("13 supplies added")).toBeInTheDocument();
  });

  it('shows "Total: N skeins needed" for thread-only supplies', () => {
    render(
      <SupplyTableFooter
        threadCount={5}
        beadCount={0}
        specialtyCount={0}
        totalSkeinsNeeded={15}
        totalItemsNeeded={15}
      />,
    );
    expect(screen.getByText("Total: 15 skeins needed")).toBeInTheDocument();
  });

  it('shows "Total: N items needed" for mixed supplies', () => {
    render(
      <SupplyTableFooter
        threadCount={5}
        beadCount={2}
        specialtyCount={1}
        totalSkeinsNeeded={15}
        totalItemsNeeded={18}
      />,
    );
    expect(screen.getByText("Total: 18 items needed")).toBeInTheDocument();
  });

  it('renders keyboard hints containing "Enter", "Tab", and "Esc"', () => {
    render(
      <SupplyTableFooter
        threadCount={1}
        beadCount={0}
        specialtyCount={0}
        totalSkeinsNeeded={2}
        totalItemsNeeded={2}
      />,
    );
    const footer = screen.getByText(/Enter/);
    expect(footer).toBeInTheDocument();
    expect(screen.getByText(/Tab/)).toBeInTheDocument();
    expect(screen.getByText(/Esc/)).toBeInTheDocument();
  });

  it("renders correct total count from threadCount + beadCount + specialtyCount", () => {
    render(
      <SupplyTableFooter
        threadCount={3}
        beadCount={4}
        specialtyCount={5}
        totalSkeinsNeeded={6}
        totalItemsNeeded={12}
      />,
    );
    expect(screen.getByText("12 supplies added")).toBeInTheDocument();
  });
});
