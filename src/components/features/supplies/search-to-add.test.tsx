import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@/__tests__/test-utils";
import { createMockSupplyBrand, createMockThread } from "@/__tests__/mocks";
import type { ThreadWithBrand } from "@/types/supply";
import { SearchToAdd } from "./search-to-add";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockGetThreads = vi.fn().mockResolvedValue([]);
const mockGetBeads = vi.fn().mockResolvedValue([]);
const mockGetSpecialtyItems = vi.fn().mockResolvedValue([]);
const mockAddThreadToProject = vi.fn().mockResolvedValue({ success: true });
const mockAddBeadToProject = vi.fn().mockResolvedValue({ success: true });
const mockAddSpecialtyToProject = vi.fn().mockResolvedValue({ success: true });

vi.mock("@/lib/actions/supply-actions", () => ({
  getThreads: (...args: unknown[]) => mockGetThreads(...args),
  getBeads: (...args: unknown[]) => mockGetBeads(...args),
  getSpecialtyItems: (...args: unknown[]) => mockGetSpecialtyItems(...args),
  addThreadToProject: (...args: unknown[]) => mockAddThreadToProject(...args),
  addBeadToProject: (...args: unknown[]) => mockAddBeadToProject(...args),
  addSpecialtyToProject: (...args: unknown[]) => mockAddSpecialtyToProject(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const dmcBrand = createMockSupplyBrand({ id: "brand-dmc", name: "DMC" });

const threadA: ThreadWithBrand = {
  ...createMockThread({ id: "t-1", colorCode: "310", colorName: "Black", hexColor: "#000000" }),
  brand: dmcBrand,
};

const threadB: ThreadWithBrand = {
  ...createMockThread({ id: "t-2", colorCode: "321", colorName: "Red", hexColor: "#FF0000" }),
  brand: dmcBrand,
};

const threadC: ThreadWithBrand = {
  ...createMockThread({
    id: "t-3",
    colorCode: "322",
    colorName: "Baby Pink",
    hexColor: "#FFB6C1",
  }),
  brand: dmcBrand,
};

const defaultProps = {
  supplyType: "thread" as const,
  projectId: "proj-1",
  existingIds: ["t-1"],
  onAdded: vi.fn(),
  onClose: vi.fn(),
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("SearchToAdd - already-added indicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetThreads.mockResolvedValue([threadA, threadB, threadC]);
  });

  async function renderAndWaitForResults(props = defaultProps) {
    render(<SearchToAdd {...props} />);
    // Wait for the debounced fetch to complete and items to render
    // The component has a 150ms debounce, so we need to wait for items to appear
    await waitFor(
      () => {
        expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
        // At least one item should be rendered (either addable or already-added)
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 2000 },
    );
  }

  it("shows 'Already added' indicator for items matching existingIds", async () => {
    await renderAndWaitForResults();

    // Thread A (id: t-1) is in existingIds, should show "Already added"
    expect(screen.getByText(/Already added/i)).toBeInTheDocument();
  });

  it("disables the button for already-added items", async () => {
    await renderAndWaitForResults();

    // Find the button containing thread 310 (already added)
    const buttons = screen.getAllByRole("button");
    const button310 = buttons.find((btn) => btn.textContent?.includes("310"));
    expect(button310).toBeDefined();
    expect(button310!.hasAttribute("disabled")).toBe(true);
  });

  it("keeps addable items clickable with normal styling", async () => {
    await renderAndWaitForResults();

    // Thread B and C are not in existingIds, should be enabled
    const buttons = screen.getAllByRole("button");
    const button321 = buttons.find((btn) => btn.textContent?.includes("321"));
    const button322 = buttons.find((btn) => btn.textContent?.includes("322"));

    expect(button321).toBeDefined();
    expect(button322).toBeDefined();
    expect(button321!.hasAttribute("disabled")).toBe(false);
    expect(button322!.hasAttribute("disabled")).toBe(false);
  });

  it("does NOT show 'No matches' when all results are already-added", async () => {
    // Pass all 3 IDs as existing
    await renderAndWaitForResults({
      ...defaultProps,
      existingIds: ["t-1", "t-2", "t-3"],
    });

    // Should still render items, NOT "No matches"
    expect(screen.queryByText("No matches")).not.toBeInTheDocument();
    // All 3 should show "Already added"
    const alreadyAddedElements = screen.getAllByText(/Already added/i);
    expect(alreadyAddedElements).toHaveLength(3);
  });

  it("shows 'No matches' only when API returns zero results", async () => {
    mockGetThreads.mockResolvedValue([]);
    render(<SearchToAdd {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("keyboard ArrowDown skips already-added items", async () => {
    // existingIds = ["t-2"] means thread B (middle item) is disabled
    // With addable-first sort: display order = [threadA, threadC, threadB]
    // Highlight starts at 0 (threadA). ArrowDown should go to 1 (threadC), skipping threadB at index 2
    await renderAndWaitForResults({
      ...defaultProps,
      existingIds: ["t-2"],
    });

    const input = screen.getByRole("textbox");

    // Press ArrowDown to move from item 0 to item 1
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // The highlighted item should be threadC (index 1)
    // It should have bg-muted class from being highlighted
    const buttons = screen.getAllByRole("button");
    const threadCButton = buttons.find((btn) => btn.textContent?.includes("322"));
    expect(threadCButton).toBeDefined();
    expect(threadCButton!.className).toContain("bg-muted");
  });

  it("renders mixed results with addable items first, then already-added items greyed out", async () => {
    await renderAndWaitForResults();

    const buttons = screen.getAllByRole("button");

    // Addable items (B, C) should appear before already-added item (A)
    const indexB = buttons.findIndex((btn) => btn.textContent?.includes("321"));
    const indexC = buttons.findIndex((btn) => btn.textContent?.includes("322"));
    const indexA = buttons.findIndex((btn) => btn.textContent?.includes("310"));

    expect(indexB).toBeLessThan(indexA);
    expect(indexC).toBeLessThan(indexA);

    // Already-added item should have reduced opacity
    const alreadyAddedButton = buttons[indexA];
    expect(alreadyAddedButton.className).toContain("opacity-50");
  });
});

describe("SearchToAdd - scrollIntoView after add", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGetThreads.mockResolvedValue([threadA, threadB, threadC]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderAndWaitForResults(props = defaultProps) {
    render(<SearchToAdd {...props} />);
    await vi.advanceTimersByTimeAsync(200);
    await waitFor(
      () => {
        expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 2000 },
    );
  }

  it("calls scrollIntoView after a successful add", async () => {
    const mockScrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    await renderAndWaitForResults({
      ...defaultProps,
      existingIds: [], // none existing so all are addable
    });

    // Click thread B (321) to add it
    const buttons = screen.getAllByRole("button");
    const button321 = buttons.find((btn) => btn.textContent?.includes("321"));
    expect(button321).toBeDefined();

    await act(async () => {
      fireEvent.click(button321!);
    });

    // Wait for the success action and setTimeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it("calls scrollIntoView with smooth behavior and block end", async () => {
    const mockScrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    await renderAndWaitForResults({
      ...defaultProps,
      existingIds: [],
    });

    const buttons = screen.getAllByRole("button");
    const button321 = buttons.find((btn) => btn.textContent?.includes("321"));

    await act(async () => {
      fireEvent.click(button321!);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "end",
    });
  });

  it("does NOT call scrollIntoView after a failed add", async () => {
    const mockScrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;
    mockAddThreadToProject.mockResolvedValueOnce({
      success: false,
      error: "Failed to add",
    });

    await renderAndWaitForResults({
      ...defaultProps,
      existingIds: [],
    });

    const buttons = screen.getAllByRole("button");
    const button321 = buttons.find((btn) => btn.textContent?.includes("321"));

    await act(async () => {
      fireEvent.click(button321!);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
