import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SupplyGridView } from "./supply-grid-view";

const ITEMS = [
  {
    id: "t1",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    brand: { name: "DMC" },
  },
  {
    id: "b1",
    productCode: "02010",
    colorName: "Ice",
    hexColor: "#dbe9f4",
    brand: { name: "Mill Hill" },
  },
];

describe("SupplyGridView", () => {
  it("renders a tile per item", () => {
    render(<SupplyGridView items={ITEMS} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Edit 310 — Black" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit 02010 — Ice" })).toBeInTheDocument();
  });

  it("calls onEdit with the item id when the tile is activated", () => {
    const onEdit = vi.fn();
    render(<SupplyGridView items={ITEMS} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit 310 — Black" }));

    expect(onEdit).toHaveBeenCalledWith("t1");
  });

  it("offers a delete control per item", () => {
    render(<SupplyGridView items={ITEMS} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Delete 310 — Black" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete 02010 — Ice" })).toBeInTheDocument();
  });

  it("calls onDelete with the item id when the delete control is activated", () => {
    const onDelete = vi.fn();
    render(<SupplyGridView items={ITEMS} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete 02010 — Ice" }));

    expect(onDelete).toHaveBeenCalledWith("b1");
  });

  it("does not edit the item when its delete control is activated", () => {
    const onEdit = vi.fn();
    render(<SupplyGridView items={ITEMS} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete 310 — Black" }));

    expect(onEdit).not.toHaveBeenCalled();
  });
});
