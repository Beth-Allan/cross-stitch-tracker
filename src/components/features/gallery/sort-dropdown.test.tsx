import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { SortDropdown } from "./sort-dropdown";
import type { SortField, SortDir } from "./gallery-types";

describe("SortDropdown", () => {
  const defaultProps = {
    sort: "dateAdded" as SortField,
    dir: "desc" as SortDir,
    onSortChange: vi.fn(),
  };

  it("renders Sort by trigger with current field label", () => {
    render(<SortDropdown {...defaultProps} />);
    const trigger = screen.getByRole("button", { name: /sort by/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Date Added");
  });

  it("opens dropdown showing 6 options", () => {
    render(<SortDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));

    // "Date Added" appears both in trigger and dropdown, so use getAllByText
    expect(screen.getAllByText("Date Added")).toHaveLength(2);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Stitch Count")).toBeInTheDocument();
  });

  it("calls onSortChange with correct field when option clicked", () => {
    const onSortChange = vi.fn();
    render(<SortDropdown {...defaultProps} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));
    fireEvent.click(screen.getByText("Name"));

    expect(onSortChange).toHaveBeenCalledWith("name");
  });

  it("trigger aria-label includes sort direction text", () => {
    render(<SortDropdown {...defaultProps} dir="asc" />);
    const trigger = screen.getByRole("button", { name: /ascending/i });
    expect(trigger).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<SortDropdown {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));
    expect(screen.getByText("Name")).toBeInTheDocument();

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "Escape" });
    // Options within the dropdown panel should be gone
    // Note: "Date Added" still appears in the trigger, so check for a non-trigger option
    expect(screen.queryByText("Designer")).not.toBeInTheDocument();
  });
});
