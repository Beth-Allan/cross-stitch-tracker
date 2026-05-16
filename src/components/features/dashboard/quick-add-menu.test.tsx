import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { QuickAddMenu } from "./quick-add-menu";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("QuickAddMenu", () => {
  it("renders 'Quick Add' trigger button", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    expect(screen.getByText("Quick Add")).toBeInTheDocument();
  });

  it("renders 8 action items when menu is open", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    fireEvent.click(screen.getByText("Quick Add"));

    expect(screen.getByText("Log Stitches")).toBeInTheDocument();
    expect(screen.getByText("New Chart")).toBeInTheDocument();
    expect(screen.getByText("New Thread")).toBeInTheDocument();
    expect(screen.getByText("New Bead")).toBeInTheDocument();
    expect(screen.getByText("New Specialty")).toBeInTheDocument();
    expect(screen.getByText("New Fabric")).toBeInTheDocument();
    expect(screen.getByText("New Designer")).toBeInTheDocument();
    expect(screen.getByText("New Genre")).toBeInTheDocument();
  });

  it("renders group labels for menu sections", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    fireEvent.click(screen.getByText("Quick Add"));

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Reference")).toBeInTheDocument();
  });

  it("calls onLogStitches callback when 'Log Stitches' is clicked", () => {
    const mockOnLogStitches = vi.fn();
    render(<QuickAddMenu onLogStitches={mockOnLogStitches} />);

    fireEvent.click(screen.getByText("Quick Add"));
    fireEvent.click(screen.getByText("Log Stitches"));

    expect(mockOnLogStitches).toHaveBeenCalledTimes(1);
  });

  it("closes menu on Escape and returns focus to trigger", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    const trigger = screen.getByText("Quick Add").closest("button")!;
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("navigates items with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    await user.click(screen.getByText("Quick Add"));
    const items = screen.getAllByRole("menuitem");

    expect(items[0]).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(items[0]).toHaveFocus();
  });

  it("sets aria-expanded on trigger button", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);
    const trigger = screen.getByText("Quick Add").closest("button")!;

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("wraps ArrowDown from last item back to first", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    await user.click(screen.getByText("Quick Add"));
    const items = screen.getAllByRole("menuitem");

    for (let i = 0; i < items.length - 1; i++) {
      await user.keyboard("{ArrowDown}");
    }
    expect(items[items.length - 1]).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(items[0]).toHaveFocus();
  });

  it("wraps ArrowUp from first item to last", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    await user.click(screen.getByText("Quick Add"));
    const items = screen.getAllByRole("menuitem");

    expect(items[0]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(items[items.length - 1]).toHaveFocus();
  });

  it("opens menu via ArrowDown on trigger and focuses first item", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    const trigger = screen.getByText("Quick Add").closest("button")!;
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const items = screen.getAllByRole("menuitem");
    expect(items[0]).toHaveFocus();
  });

  it("opens menu via Enter on trigger", async () => {
    const user = userEvent.setup();
    render(<QuickAddMenu onLogStitches={vi.fn()} />);

    const trigger = screen.getByText("Quick Add").closest("button")!;
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders ARIA groups with labelledby references", () => {
    render(<QuickAddMenu onLogStitches={vi.fn()} />);
    fireEvent.click(screen.getByText("Quick Add"));

    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(3);
    groups.forEach((group) => {
      const labelId = group.getAttribute("aria-labelledby");
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId!)).toBeInTheDocument();
    });
  });
});
