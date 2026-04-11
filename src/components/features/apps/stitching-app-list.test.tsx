import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StitchingAppList } from "./stitching-app-list";
import type { StitchingAppWithStats } from "@/types/storage";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock server actions
vi.mock("@/lib/actions/stitching-app-actions", () => ({
  createStitchingApp: vi
    .fn()
    .mockResolvedValue({ success: true, app: { id: "new-1", name: "New" } }),
  updateStitchingApp: vi.fn().mockResolvedValue({ success: true }),
  deleteStitchingApp: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApps: StitchingAppWithStats[] = [
  { id: "app-1", name: "Markup R-XP", description: null, _count: { projects: 5 } },
  { id: "app-2", name: "Pattern Keeper", description: null, _count: { projects: 0 } },
];

describe("StitchingAppList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list of apps with names and project counts", () => {
    render(<StitchingAppList apps={mockApps} />);

    expect(screen.getByText("Markup R-XP")).toBeInTheDocument();
    expect(screen.getByText("5 projects")).toBeInTheDocument();
    expect(screen.getByText("Pattern Keeper")).toBeInTheDocument();
    expect(screen.getByText("No projects")).toBeInTheDocument();
  });

  it('clicking "Add App" CTA shows inline add row', async () => {
    const user = userEvent.setup();
    render(<StitchingAppList apps={mockApps} />);

    const addButton = screen.getByRole("button", { name: /add app/i });
    await user.click(addButton);

    const input = screen.getByPlaceholderText(/app name/i);
    expect(input).toBeInTheDocument();
  });

  it("pressing Enter in inline add row calls createStitchingApp with name", async () => {
    const user = userEvent.setup();
    const { createStitchingApp } = await import("@/lib/actions/stitching-app-actions");

    render(<StitchingAppList apps={mockApps} />);

    await user.click(screen.getByRole("button", { name: /add app/i }));
    const input = screen.getByPlaceholderText(/app name/i);
    await user.type(input, "Saga");
    await user.keyboard("{Enter}");

    expect(createStitchingApp).toHaveBeenCalledWith({ name: "Saga" });
  });

  it("clicking trash icon opens DeleteEntityDialog with entityType stitching-app", async () => {
    const user = userEvent.setup();
    render(<StitchingAppList apps={mockApps} />);

    const deleteButton = screen.getByRole("button", { name: /delete markup r-xp/i });
    await user.click(deleteButton);

    expect(screen.getByText("Delete Stitching App")).toBeInTheDocument();
  });

  it("shows empty state when no apps exist", () => {
    render(<StitchingAppList apps={[]} />);

    expect(screen.getByText("No stitching apps yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add apps you use for digital pattern viewing and markup"),
    ).toBeInTheDocument();
  });

  it("clicking a row navigates to /apps/[id]", async () => {
    const user = userEvent.setup();
    render(<StitchingAppList apps={mockApps} />);

    const rows = screen.getAllByRole("button", { name: /navigate to/i });
    await user.click(rows[0]);

    expect(mockPush).toHaveBeenCalledWith("/apps/app-1");
  });

  it("pencil click calls e.stopPropagation (doesn't navigate)", async () => {
    const user = userEvent.setup();
    render(<StitchingAppList apps={mockApps} />);

    const renameButton = screen.getByRole("button", { name: /rename markup r-xp/i });
    await user.click(renameButton);

    // Should enter edit mode, not navigate
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
