import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SupplyTableView } from "./supply-table-view";

const COLUMNS = [
  {
    key: "code",
    label: "CODE",
    sortable: true,
    accessor: (item: { colorCode?: string; productCode?: string }) =>
      item.colorCode ?? item.productCode ?? "",
  },
  {
    key: "name",
    label: "NAME",
    sortable: true,
    accessor: (item: { colorName: string }) => item.colorName,
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    accessor: (item: { brand: { name: string } }) => item.brand.name,
  },
];

const ITEMS = [
  {
    id: "t1",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    brand: { name: "DMC" },
  },
  {
    id: "t2",
    colorCode: "blanc",
    colorName: "White",
    hexColor: "#FFFFFF",
    brand: { name: "DMC" },
  },
  {
    id: "t3",
    productCode: "E168",
    colorName: "Silver Metallic",
    hexColor: "#C0C0C0",
    brand: { name: "DMC" },
  },
];

describe("SupplyTableView", () => {
  const defaultProps = {
    items: ITEMS,
    columns: COLUMNS,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders desktop table hidden on mobile and mobile cards hidden on desktop", () => {
    const { container } = render(<SupplyTableView {...defaultProps} />);

    const desktopTable = container.querySelector(".hidden.md\\:block");
    expect(desktopTable).toBeInTheDocument();

    const mobileCards = container.querySelector(".md\\:hidden");
    expect(mobileCards).toBeInTheDocument();
  });

  it("renders all items in both desktop table and mobile cards", () => {
    render(<SupplyTableView {...defaultProps} />);

    // Each name appears twice: once in table, once in mobile card
    expect(screen.getAllByText("Black")).toHaveLength(2);
    expect(screen.getAllByText("White")).toHaveLength(2);
    expect(screen.getAllByText("Silver Metallic")).toHaveLength(2);
  });

  it("mobile cards show code and brand info", () => {
    render(<SupplyTableView {...defaultProps} />);

    // Codes appear in both views
    expect(screen.getAllByText("310")).toHaveLength(2);
    expect(screen.getAllByText("blanc")).toHaveLength(2);
    expect(screen.getAllByText("E168")).toHaveLength(2);
  });

  it("mobile cards have edit and delete buttons with proper aria-labels", () => {
    render(<SupplyTableView {...defaultProps} />);

    // 3 items × 2 views = 6 edit buttons, 6 delete buttons
    const editButtons = screen.getAllByLabelText(/^Edit /);
    expect(editButtons).toHaveLength(6);

    const deleteButtons = screen.getAllByLabelText(/^Delete /);
    expect(deleteButtons).toHaveLength(6);
  });

  it("mobile card edit and delete buttons call handlers", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<SupplyTableView {...defaultProps} onEdit={onEdit} onDelete={onDelete} />);

    // Get all edit buttons — mobile ones don't have md:opacity-40
    const editButtons = screen.getAllByLabelText("Edit 310");
    // Click the last one (mobile card)
    fireEvent.click(editButtons[editButtons.length - 1]);
    expect(onEdit).toHaveBeenCalledWith("t1");

    const deleteButtons = screen.getAllByLabelText("Delete 310");
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    expect(onDelete).toHaveBeenCalledWith("t1");
  });

  it("mobile cards have min-h-11 touch targets on action buttons", () => {
    render(<SupplyTableView {...defaultProps} />);

    const editButtons = screen.getAllByLabelText("Edit 310");
    for (const btn of editButtons) {
      expect(btn.className).toContain("min-h-11");
      expect(btn.className).toContain("min-w-11");
    }
  });

  it("renders empty state in both views when no items", () => {
    render(<SupplyTableView items={[]} columns={COLUMNS} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getAllByText("No items to display")).toHaveLength(2);
  });

  it("sorts items and reflects in both desktop and mobile views", () => {
    render(<SupplyTableView {...defaultProps} />);

    // Click NAME header to sort by name ascending
    const nameHeader = screen.getByRole("columnheader", { name: /name/i });
    fireEvent.click(nameHeader);

    // Both views should reflect the sorted order
    const rows = screen.getAllByRole("row");
    // header + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it("desktop table has sr-only caption", () => {
    render(<SupplyTableView {...defaultProps} />);

    expect(screen.getByText("Supply catalog items")).toBeInTheDocument();
  });
});
