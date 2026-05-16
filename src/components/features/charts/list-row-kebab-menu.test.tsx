import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ListRowKebabMenu } from "./list-row-kebab-menu";
import { deleteChart } from "@/lib/actions/chart-actions";
import { toast } from "sonner";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/actions/chart-actions", () => ({
  deleteChart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("ListRowKebabMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with aria-label "Project actions"', () => {
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger).toBeInTheDocument();
  });

  it("trigger has MoreHorizontal icon", () => {
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    const svg = trigger.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("trigger has min-h-11 min-w-11 for 44px touch target", () => {
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);
    const trigger = screen.getByLabelText("Project actions");
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });

  it('shows "Edit Project" menu item after clicking trigger', async () => {
    const user = userEvent.setup();
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Edit Project")).toBeInTheDocument();
    });
  });

  it('shows "Delete Project" menu item after clicking trigger', async () => {
    const user = userEvent.setup();
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });
  });

  it('clicking "Edit Project" calls router.push with /charts/{chartId}/edit', async () => {
    const user = userEvent.setup();
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Edit Project")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Edit Project"));

    expect(mockPush).toHaveBeenCalledWith("/charts/c1/edit");
  });

  it('clicking "Delete Project" opens confirmation dialog with "Delete {chartName}?" title', async () => {
    const user = userEvent.setup();
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Delete Project"));

    await waitFor(() => {
      expect(screen.getByText("Delete Test Chart?")).toBeInTheDocument();
    });
  });

  it('confirmation dialog has "Cancel" and "Delete Project" buttons', async () => {
    const user = userEvent.setup();
    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });
    // Click the menu item (not the button yet)
    await user.click(screen.getByText("Delete Project"));

    await waitFor(() => {
      expect(screen.getByText("Delete Test Chart?")).toBeInTheDocument();
    });

    // Now check dialog buttons
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    // The dialog has its own "Delete Project" button distinct from the menu item
    const deleteButtons = screen.getAllByText("Delete Project");
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("confirming delete calls deleteChart server action", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteChart).mockResolvedValue({ success: true });

    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    // Open menu
    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });
    // Click delete in menu to open dialog
    await user.click(screen.getByText("Delete Project"));

    await waitFor(() => {
      expect(screen.getByText("Delete Test Chart?")).toBeInTheDocument();
    });

    // Click delete in dialog confirmation
    const dialogDeleteButton = screen
      .getAllByRole("button")
      .find(
        (btn) =>
          btn.textContent === "Delete Project" && btn.closest("[data-slot='dialog-content']"),
      );
    expect(dialogDeleteButton).toBeTruthy();
    await user.click(dialogDeleteButton!);

    await waitFor(() => {
      expect(deleteChart).toHaveBeenCalledWith("c1");
    });
  });

  it("successful delete calls router.refresh() and toast.success", async () => {
    const user = userEvent.setup();
    vi.mocked(deleteChart).mockResolvedValue({ success: true });

    render(<ListRowKebabMenu chartId="c1" chartName="Test Chart" />);

    // Open menu
    await user.click(screen.getByLabelText("Project actions"));
    await waitFor(() => {
      expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });
    // Open dialog
    await user.click(screen.getByText("Delete Project"));
    await waitFor(() => {
      expect(screen.getByText("Delete Test Chart?")).toBeInTheDocument();
    });

    // Confirm delete
    const dialogDeleteButton = screen
      .getAllByRole("button")
      .find(
        (btn) =>
          btn.textContent === "Delete Project" && btn.closest("[data-slot='dialog-content']"),
      );
    await user.click(dialogDeleteButton!);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith("Project deleted");
  });
});
