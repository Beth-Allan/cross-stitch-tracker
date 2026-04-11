import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StorageLocationDetail } from "./storage-location-detail";
import type { StorageLocationDetail as StorageLocationDetailType } from "@/types/storage";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock server actions
vi.mock("@/lib/actions/storage-location-actions", () => ({
  updateStorageLocation: vi.fn().mockResolvedValue({ success: true }),
  deleteStorageLocation: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockLocation: StorageLocationDetailType = {
  id: "loc-1",
  name: "Bin A",
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

describe("StorageLocationDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders location name as heading with InlineNameEdit", () => {
    render(<StorageLocationDetail location={mockLocation} />);

    const name = screen.getByText("Bin A");
    expect(name).toBeInTheDocument();
    // Should have heading variant classes
    expect(name.className).toMatch(/text-2xl/);
    expect(name.className).toMatch(/font-heading/);
  });

  it("renders assigned projects with status badges", () => {
    render(<StorageLocationDetail location={mockLocation} />);

    expect(screen.getByText("Autumn Forest")).toBeInTheDocument();
    expect(screen.getByText("Winter Scene")).toBeInTheDocument();
    expect(screen.getByText("Stitching")).toBeInTheDocument();
    expect(screen.getByText("Kitting")).toBeInTheDocument();
  });

  it("shows empty state when no projects assigned", () => {
    const emptyLocation: StorageLocationDetailType = {
      ...mockLocation,
      projects: [],
    };
    render(<StorageLocationDetail location={emptyLocation} />);

    expect(screen.getByText("No projects in this location")).toBeInTheDocument();
    expect(
      screen.getByText("Assign projects to this location from the chart form"),
    ).toBeInTheDocument();
  });

  it('back link navigates to /storage (text: "All Locations")', () => {
    render(<StorageLocationDetail location={mockLocation} />);

    const backLink = screen.getByText("All Locations");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/storage");
  });

  it('shows fabric info or italic "No fabric assigned" per project', () => {
    render(<StorageLocationDetail location={mockLocation} />);

    // First project has fabric
    expect(screen.getByText(/White Aida/)).toBeInTheDocument();
    expect(screen.getByText(/14ct/)).toBeInTheDocument();

    // Second project has no fabric
    expect(screen.getByText("No fabric assigned")).toBeInTheDocument();
  });
});
