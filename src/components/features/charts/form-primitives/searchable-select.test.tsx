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
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandItem: ({
    children,
    onSelect,
    ...props
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
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
    it("does NOT render Add New when search input is empty", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      // With empty search, "Add" text should not appear
      expect(screen.queryByText(/Add /)).toBeNull();
    });

    it("does NOT render Add New when search is whitespace-only", async () => {
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
      await user.type(input, "   ");

      expect(screen.queryByText(/Add /)).toBeNull();
    });

    it("renders Add New with search text when search has non-empty trimmed text", async () => {
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
      await user.type(input, "Custom Bin");

      expect(screen.getByText(/Add "Custom Bin"/)).toBeDefined();
    });

    it("does NOT render Add section when onAddNew prop is not provided", () => {
      render(<SearchableSelect options={defaultOptions} value={null} onChange={mockOnChange} />);

      expect(screen.queryByText(/Add /)).toBeNull();
    });
  });

  describe("Add New interaction", () => {
    it("calls onAddNew with the current search text when clicked", async () => {
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
      await user.type(input, "My New Item");

      const addButton = screen.getByText(/Add "My New Item"/);
      await user.click(addButton);

      expect(mockOnAddNew).toHaveBeenCalledWith("My New Item");
    });

    it("resets search after clicking Add New", async () => {
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

      const addButton = screen.getByText(/Add "Test"/);
      await user.click(addButton);

      // After clicking, search should reset — "Add" option should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Add "/)).toBeNull();
      });
    });
  });
});
