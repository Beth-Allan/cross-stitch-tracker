import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { Package } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders icon, title, and description", () => {
    render(
      <EmptyState
        icon={Package}
        title="Nothing here"
        description="Add some items to get started"
      />,
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Add some items to get started")).toBeInTheDocument();
  });

  it("renders title-only without description", () => {
    render(<EmptyState icon={Package} title="Empty" />);

    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders children (action slot)", () => {
    render(
      <EmptyState icon={Package} title="Empty">
        <button>Add Item</button>
      </EmptyState>,
    );

    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("renders with heading variant for page-level empties", () => {
    const { container } = render(<EmptyState icon={Package} title="No items" heading />);

    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("renders with paragraph variant for inline empties", () => {
    const { container } = render(<EmptyState icon={Package} title="No matches" />);

    expect(container.querySelector("h2")).not.toBeInTheDocument();
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });
});
