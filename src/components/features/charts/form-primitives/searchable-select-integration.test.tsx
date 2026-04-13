import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { SearchableSelect } from "./searchable-select";

describe("cmdk forceMount CommandItem click (real cmdk, no mocks)", () => {
  it("fires onSelect when forceMount CommandItem is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup>
            <CommandItem value="one" onSelect={() => {}}>
              One
            </CommandItem>
          </CommandGroup>
          <CommandGroup forceMount>
            <CommandItem forceMount onSelect={onSelect}>
              Add New
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    const addNew = screen.getByText("Add New");
    await user.click(addNew);

    expect(onSelect).toHaveBeenCalled();
  });
});

describe("SearchableSelect fix verification (real cmdk, no mocks)", () => {
  const defaultOptions = [
    { value: "opt-1", label: "Option One" },
    { value: "opt-2", label: "Option Two" },
  ];

  it("shows 'Add New' when no search text — no duplicate +", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onAddNew = vi.fn();

    render(
      <SearchableSelect
        options={defaultOptions}
        value={null}
        onChange={onChange}
        onAddNew={onAddNew}
      />,
    );

    const trigger = screen.getByText("Select...");
    await user.click(trigger);

    // Find the add new item
    const addNewItem = Array.from(document.querySelectorAll("[cmdk-item]")).find((el) =>
      el.textContent?.includes("Add New"),
    );
    expect(addNewItem).toBeDefined();

    // Verify no duplicate "+" - text should NOT contain "+ +" or "++Add"
    const textContent = addNewItem!.textContent ?? "";
    console.log("Add new item text (no search):", JSON.stringify(textContent));
    expect(textContent).not.toMatch(/\+\s*\+/);
    expect(textContent).toContain("Add New");
  });

  it("calls onAddNew with empty string when clicked without search text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onAddNew = vi.fn();

    render(
      <SearchableSelect
        options={defaultOptions}
        value={null}
        onChange={onChange}
        onAddNew={onAddNew}
      />,
    );

    const trigger = screen.getByText("Select...");
    await user.click(trigger);

    const addNewItem = Array.from(document.querySelectorAll("[cmdk-item]")).find((el) =>
      el.textContent?.includes("Add New"),
    );
    expect(addNewItem).toBeDefined();

    await user.click(addNewItem!);
    expect(onAddNew).toHaveBeenCalledWith("");
  });

  it("shows dynamic label and calls onAddNew with trimmed text when typed and clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onAddNew = vi.fn();

    render(
      <SearchableSelect
        options={defaultOptions}
        value={null}
        onChange={onChange}
        onAddNew={onAddNew}
      />,
    );

    const trigger = screen.getByText("Select...");
    await user.click(trigger);

    // Type in the search
    const input = document.querySelector("[cmdk-input]") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.type(input, "Bin A");

    // Find the add new item - should show dynamic label
    const addNewItem = Array.from(document.querySelectorAll("[cmdk-item]")).find((el) =>
      el.textContent?.includes("Bin A"),
    );
    expect(addNewItem).toBeDefined();

    const textContent = addNewItem!.textContent ?? "";
    console.log("Add new item text (with search):", JSON.stringify(textContent));

    // No duplicate "+"
    expect(textContent).not.toMatch(/\+\s*\+/);

    await user.click(addNewItem!);
    expect(onAddNew).toHaveBeenCalledWith("Bin A");
  });

  it("handles names with spaces correctly (forceMount prevents filtering)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onAddNew = vi.fn();

    render(
      <SearchableSelect
        options={defaultOptions}
        value={null}
        onChange={onChange}
        onAddNew={onAddNew}
      />,
    );

    const trigger = screen.getByText("Select...");
    await user.click(trigger);

    const input = document.querySelector("[cmdk-input]") as HTMLInputElement;
    await user.type(input, "My Storage Bin");

    // forceMount ensures the item is still visible even with spaces
    const addNewItem = Array.from(document.querySelectorAll("[cmdk-item]")).find((el) =>
      el.textContent?.includes("My Storage Bin"),
    );
    expect(addNewItem).toBeDefined();

    await user.click(addNewItem!);
    expect(onAddNew).toHaveBeenCalledWith("My Storage Bin");
  });
});
