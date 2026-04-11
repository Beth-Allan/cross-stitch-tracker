import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { StitchingAppDetail } from "./stitching-app-detail";
import type { StitchingAppDetail as StitchingAppDetailType } from "@/types/storage";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock server actions
vi.mock("@/lib/actions/stitching-app-actions", () => ({
  updateStitchingApp: vi.fn().mockResolvedValue({ success: true }),
  deleteStitchingApp: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApp: StitchingAppDetailType = {
  id: "app-1",
  name: "Markup R-XP",
  description: null,
  projects: [
    {
      id: "proj-1",
      chart: { id: "chart-1", name: "Autumn Forest", coverThumbnailUrl: null },
      status: "IN_PROGRESS",
      fabric: { name: "White Aida", count: 14, type: "Aida" },
    },
    {
      id: "proj-2",
      chart: { id: "chart-2", name: "Winter Scene", coverThumbnailUrl: null },
      status: "KITTING",
      fabric: null,
    },
  ],
};

describe("StitchingAppDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders app name as heading with InlineNameEdit variant heading", () => {
    render(<StitchingAppDetail app={mockApp} />);

    const name = screen.getByText("Markup R-XP");
    expect(name).toBeInTheDocument();
    // Should have heading variant classes
    expect(name.className).toMatch(/text-2xl/);
    expect(name.className).toMatch(/font-heading/);
  });

  it("renders assigned projects with StatusBadge", () => {
    render(<StitchingAppDetail app={mockApp} />);

    expect(screen.getByText("Autumn Forest")).toBeInTheDocument();
    expect(screen.getByText("Winter Scene")).toBeInTheDocument();
    expect(screen.getByText("Stitching")).toBeInTheDocument();
    expect(screen.getByText("Kitting")).toBeInTheDocument();
  });

  it("shows empty state when no projects using this app", () => {
    const emptyApp: StitchingAppDetailType = {
      ...mockApp,
      projects: [],
    };
    render(<StitchingAppDetail app={emptyApp} />);

    expect(screen.getByText("No projects using this app")).toBeInTheDocument();
    expect(screen.getByText("Assign apps to projects from the chart form")).toBeInTheDocument();
  });

  it('back link text is "All Apps" and navigates to /apps', () => {
    render(<StitchingAppDetail app={mockApp} />);

    const backLink = screen.getByText("All Apps");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/apps");
  });
});
