import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SearchableSelect } from "./searchable-select";

// Mock cmdk since it requires DOM APIs not available in jsdom
vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandInput: ({
    value,
    onValueChange,
    placeholder,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="command-input"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandGroup: ({
    children,
    forceMount: _fm,
    ...props
  }: {
    children: React.ReactNode;
    forceMount?: boolean;
  }) => <div {...props}>{children}</div>,
  CommandItem: ({
    children,
    onSelect,
    forceMount: _fm,
    ...props
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    forceMount?: boolean;
    value?: string;
    className?: string;
  }) => (
    <div role="option" onClick={onSelect} {...props}>
      {children}
    </div>
  ),
  CommandSeparator: () => <hr />,
}));

// Mock popover to always show content
vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }) => (
    <button data-testid="popover-trigger" {...props}>
      {children}
    </button>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

const defaultOptions = [
  { value: "opt-1", label: "Option One" },
  { value: "opt-2", label: "Option Two" },
];

describe("SearchableSelect", () => {
  const mockOnChange = vi.fn();
  const mockOnAddNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Add New button visibility", () => {
    it("shows + Add New immediately when onAddNew is provided (no search needed)", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      // "+ Add New" should be visible without typing anything
      expect(screen.getByText("+ Add New")).toBeDefined();
    });

    it("shows + Add New even when search contains spaces", async () => {
      const user = userEvent.setup();
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const input = screen.getByTestId("command-input");
      await user.type(input, "Bin A");

      expect(screen.getByText("+ Add New")).toBeDefined();
    });

    it("does NOT render + Add New when onAddNew prop is omitted", () => {
      render(<SearchableSelect options={defaultOptions} value={null} onChange={mockOnChange} />);

      expect(screen.queryByText("+ Add New")).toBeNull();
    });
  });

  describe("Add New interaction", () => {
    it("calls onAddNew with current search text when clicked", async () => {
      const user = userEvent.setup();
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const input = screen.getByTestId("command-input");
      await user.type(input, "My Item");

      const addButton = screen.getByText("+ Add New");
      await user.click(addButton);

      expect(mockOnAddNew).toHaveBeenCalledWith("My Item");
    });

    it("calls onAddNew with empty string when clicked without typing", async () => {
      const user = userEvent.setup();
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const addButton = screen.getByText("+ Add New");
      await user.click(addButton);

      expect(mockOnAddNew).toHaveBeenCalledWith("");
    });

    it("resets search after clicking + Add New", async () => {
      const user = userEvent.setup();
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const input = screen.getByTestId("command-input");
      await user.type(input, "Test");

      const addButton = screen.getByText("+ Add New");
      await user.click(addButton);

      // After clicking, search input should be cleared
      await waitFor(() => {
        expect((screen.getByTestId("command-input") as HTMLInputElement).value).toBe("");
      });
    });
  });
});
