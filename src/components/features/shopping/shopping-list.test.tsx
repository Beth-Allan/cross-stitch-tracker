import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ShoppingList } from "./shopping-list";
import type { ShoppingListProject } from "@/lib/actions/shopping-actions";

const mockMarkSupplyAcquired = vi.fn();

vi.mock("@/lib/actions/shopping-actions", () => ({
  markSupplyAcquired: (...args: unknown[]) => mockMarkSupplyAcquired(...args),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const projectWithThreads: ShoppingListProject = {
  projectId: "proj-1",
  chartId: "chart-1",
  projectName: "Fairy Garden Sampler",
  projectStatus: "KITTING",
  unfulfilledThreads: [
    {
      id: "pt-1",
      threadId: "t-310",
      quantityRequired: 3,
      quantityAcquired: 1,
      thread: {
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        brand: { name: "DMC" },
      },
    },
    {
      id: "pt-2",
      threadId: "t-321",
      quantityRequired: 2,
      quantityAcquired: 0,
      thread: {
        colorCode: "321",
        colorName: "Red",
        hexColor: "#C72B3B",
        brand: { name: "DMC" },
      },
    },
  ],
  unfulfilledBeads: [],
  unfulfilledSpecialty: [],
  needsFabric: false,
  fabricNeeds: null,
};

const projectWithBeadsAndFabric: ShoppingListProject = {
  projectId: "proj-2",
  chartId: "chart-2",
  projectName: "Holiday Ornament",
  projectStatus: "UNSTARTED",
  unfulfilledThreads: [],
  unfulfilledBeads: [
    {
      id: "pb-1",
      beadId: "b-123",
      quantityRequired: 5,
      quantityAcquired: 2,
      bead: {
        productCode: "00123",
        colorName: "Red Glass",
        hexColor: "#FF0000",
        brand: { name: "Mill Hill" },
      },
    },
  ],
  unfulfilledSpecialty: [
    {
      id: "ps-1",
      specialtyItemId: "s-k001",
      quantityRequired: 1,
      quantityAcquired: 0,
      specialtyItem: {
        productCode: "K001",
        colorName: "Gold Braid",
        brand: { name: "Kreinik" },
      },
    },
  ],
  needsFabric: true,
  fabricNeeds: [
    { label: "14 / 28 over 2", count: 14, widthInches: 21, heightInches: 17 },
    { label: "16 / 32 over 2", count: 16, widthInches: 19, heightInches: 16 },
    { label: "18 / 36 over 2", count: 18, widthInches: 18, heightInches: 15 },
    { label: "20 / 40 over 2", count: 20, widthInches: 16, heightInches: 14 },
    { label: "22", count: 22, widthInches: 15, heightInches: 13 },
    { label: "25", count: 25, widthInches: 14, heightInches: 12 },
  ],
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("ShoppingList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkSupplyAcquired.mockResolvedValue({ success: true });
  });

  it("renders project groups with project name and status badge", () => {
    render(<ShoppingList projects={[projectWithThreads, projectWithBeadsAndFabric]} />);

    expect(screen.getByText("Fairy Garden Sampler")).toBeInTheDocument();
    expect(screen.getByText("Holiday Ornament")).toBeInTheDocument();
    // Status badges render status labels
    expect(screen.getByText("Kitting")).toBeInTheDocument();
    expect(screen.getByText("Unstarted")).toBeInTheDocument();
  });

  it("shows unfulfilled thread with color swatch, brand code, name, and need quantity", () => {
    render(<ShoppingList projects={[projectWithThreads]} />);

    // Brand + code
    expect(screen.getByText("DMC 310")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    // Both threads need 2: (3-1=2) and (2-0=2)
    expect(screen.getByText("DMC 321")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getAllByText("Need 2")).toHaveLength(2);
  });

  it("shows Mark Acquired button for each supply", () => {
    render(<ShoppingList projects={[projectWithThreads, projectWithBeadsAndFabric]} />);

    // 2 threads + 1 bead + 1 specialty = 4 buttons
    const buttons = screen.getAllByRole("button", { name: /Mark Acquired/i });
    expect(buttons).toHaveLength(4);
  });

  it("shows fabric needs when needsFabric is true", () => {
    render(<ShoppingList projects={[projectWithBeadsAndFabric]} />);

    expect(screen.getByText(/Needs fabric/)).toBeInTheDocument();
    expect(screen.getByText("14 / 28 over 2")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it('renders "All caught up!" empty state when no items', () => {
    render(<ShoppingList projects={[]} />);

    expect(screen.getByText("All caught up!")).toBeInTheDocument();
    expect(
      screen.getByText("Every supply across all your projects is acquired. Time to stitch!"),
    ).toBeInTheDocument();
  });

  it("calls markSupplyAcquired when Mark Acquired clicked", async () => {
    const user = userEvent.setup();

    render(<ShoppingList projects={[projectWithThreads]} />);

    const buttons = screen.getAllByRole("button", { name: /Mark Acquired/i });
    await user.click(buttons[0]);

    expect(mockMarkSupplyAcquired).toHaveBeenCalledWith("thread", "pt-1");
  });

  it("shows bead supply rows with product code and brand", () => {
    render(<ShoppingList projects={[projectWithBeadsAndFabric]} />);

    expect(screen.getByText("Mill Hill 00123")).toBeInTheDocument();
    expect(screen.getByText("Red Glass")).toBeInTheDocument();
    // Need: 5 - 2 = 3
    expect(screen.getByText("Need 3")).toBeInTheDocument();
  });

  it("shows specialty item rows with product code and brand", () => {
    render(<ShoppingList projects={[projectWithBeadsAndFabric]} />);

    expect(screen.getByText("Kreinik K001")).toBeInTheDocument();
    expect(screen.getByText("Gold Braid")).toBeInTheDocument();
    // Need: 1 - 0 = 1
    expect(screen.getByText("Need 1")).toBeInTheDocument();
  });
});
