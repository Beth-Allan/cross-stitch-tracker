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
    <div role="option" aria-selected={false} onClick={onSelect} {...props}>
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

  describe("Add New button visibility and label", () => {
    it("shows 'Add New' when onAddNew is provided and no search text", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      expect(screen.getByText("Add New")).toBeDefined();
    });

    it("shows dynamic label with search text when user types", async () => {
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

      expect(screen.getByText('Add "Bin A"')).toBeDefined();
    });

    it("does NOT render add new item when onAddNew prop is omitted", () => {
      render(<SearchableSelect options={defaultOptions} value={null} onChange={mockOnChange} />);

      expect(screen.queryByText("Add New")).toBeNull();
    });

    it("trims whitespace-only search and shows static label", async () => {
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

      // Whitespace-only should show generic label
      expect(screen.getByText("Add New")).toBeDefined();
    });
  });

  describe("Add New interaction", () => {
    it("calls onAddNew with trimmed search text when clicked", async () => {
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

      const addButton = screen.getByText('Add "My Item"');
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

      const addButton = screen.getByText("Add New");
      await user.click(addButton);

      expect(mockOnAddNew).toHaveBeenCalledWith("");
    });

    it("resets search after clicking Add New with text", async () => {
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

      const addButton = screen.getByText('Add "Test"');
      await user.click(addButton);

      // After clicking, search input should be cleared
      await waitFor(() => {
        expect((screen.getByTestId("command-input") as HTMLInputElement).value).toBe("");
      });
    });

    it("handles names with spaces correctly", async () => {
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
      await user.type(input, "Project Bin A");

      const addButton = screen.getByText('Add "Project Bin A"');
      await user.click(addButton);

      expect(mockOnAddNew).toHaveBeenCalledWith("Project Bin A");
    });
  });

  describe("tab focus and type-to-search", () => {
    it("sets search value on printable keydown on trigger", async () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const trigger = screen.getByTestId("popover-trigger");
      // Simulate typing a printable character while trigger has focus
      trigger.focus();

      // Fire keydown with a printable character
      const event = new KeyboardEvent("keydown", {
        key: "a",
        bubbles: true,
        cancelable: true,
      });
      trigger.dispatchEvent(event);

      // The search state should update with "a" and the popover should open
      // In our mocked environment, the command-input reflects the search state
      await waitFor(() => {
        expect((screen.getByTestId("command-input") as HTMLInputElement).value).toBe("a");
      });
    });

    it("does not forward Space key as a typed character", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const trigger = screen.getByTestId("popover-trigger");
      trigger.focus();

      const event = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
        cancelable: true,
      });
      trigger.dispatchEvent(event);

      // Space should toggle dropdown, not set search to " "
      expect((screen.getByTestId("command-input") as HTMLInputElement).value).toBe("");
    });

    it("does not open on non-printable keys", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value={null}
          onChange={mockOnChange}
          onAddNew={mockOnAddNew}
        />,
      );

      const trigger = screen.getByTestId("popover-trigger");
      trigger.focus();

      // Fire keydown with non-printable keys
      for (const key of ["Tab", "Escape", "Shift"]) {
        const event = new KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        });
        trigger.dispatchEvent(event);
      }

      // The search input should still be empty
      expect((screen.getByTestId("command-input") as HTMLInputElement).value).toBe("");
    });
  });

  describe("Clear button", () => {
    it("shows clear button when a value is selected", () => {
      render(<SearchableSelect options={defaultOptions} value="opt-1" onChange={mockOnChange} />);

      expect(screen.getByRole("button", { name: /clear selection/i })).toBeDefined();
    });

    it("calls onChange(null) when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<SearchableSelect options={defaultOptions} value="opt-1" onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: /clear selection/i }));

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("does not show clear button when no value is selected", () => {
      render(<SearchableSelect options={defaultOptions} value={null} onChange={mockOnChange} />);

      expect(screen.queryByRole("button", { name: /clear selection/i })).toBeNull();
    });

    it("does not show clear button when disabled", () => {
      render(
        <SearchableSelect
          options={defaultOptions}
          value="opt-1"
          onChange={mockOnChange}
          disabled
        />,
      );

      expect(screen.queryByRole("button", { name: /clear selection/i })).toBeNull();
    });
  });
});

describe("SearchableSelect — empty message", () => {
  it("falls back to the generic no-results line", () => {
    render(<SearchableSelect options={[]} value={null} onChange={vi.fn()} />);

    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("shows a caller-supplied message instead, so a failed load can say so", () => {
    render(
      <SearchableSelect
        options={[]}
        value={null}
        onChange={vi.fn()}
        emptyMessage="Couldn't load your fabric. Try refreshing the page."
      />,
    );

    expect(
      screen.getByText("Couldn't load your fabric. Try refreshing the page."),
    ).toBeInTheDocument();
    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });
});
