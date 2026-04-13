import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@/__tests__/test-utils";
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

describe("SearchToAdd - results container height", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses max-h-72 for a taller results viewport (not max-h-48)", () => {
    const { container } = render(
      <SearchToAdd
        supplyType="thread"
        projectId="proj-1"
        existingIds={[]}
        onAdded={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const resultsContainer = container.querySelector(".overflow-y-auto");
    expect(resultsContainer).not.toBeNull();
    expect(resultsContainer!.className).toContain("max-h-72");
    expect(resultsContainer!.className).not.toContain("max-h-48");
  });
});

describe("SearchToAdd - multi-add flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetThreads.mockResolvedValue([threadA, threadB, threadC]);
  });

  it("does NOT call onClose after a successful add (stays open for multi-add)", async () => {
    const onAdded = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchToAdd
        supplyType="thread"
        projectId="proj-1"
        existingIds={[]}
        onAdded={onAdded}
        onClose={onClose}
      />,
    );

    // Wait for items to render
    await waitFor(
      () => {
        expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 2000 },
    );

    // Click first addable thread
    const buttons = screen.getAllByRole("button");
    const threadButton = buttons.find((btn) => btn.textContent?.includes("310"));
    expect(threadButton).toBeDefined();
    fireEvent.click(threadButton!);

    // Wait for the add action to complete
    await waitFor(() => {
      expect(mockAddThreadToProject).toHaveBeenCalled();
    });

    // onAdded should be called (to refresh data)
    await waitFor(() => {
      expect(onAdded).toHaveBeenCalled();
    });

    // onClose should NOT be called — picker stays open for multi-add
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("SearchToAdd - viewport flip", () => {
  let origGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;
  let origInnerHeight: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetThreads.mockResolvedValue([]);
    origGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    origInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = origGetBoundingClientRect;
    Object.defineProperty(window, "innerHeight", { value: origInnerHeight, writable: true });
  });

  it("uses top-full positioning when space below is sufficient", async () => {
    // 1000px viewport, element bottom at 400px = 600px below (>= 300)
    Object.defineProperty(window, "innerHeight", { value: 1000, writable: true });

    // Mock getBoundingClientRect globally before rendering so the useEffect reads it
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        bottom: 400,
        top: 350,
        left: 0,
        right: 300,
        width: 300,
        height: 50,
        x: 0,
        y: 350,
        toJSON: () => ({}),
      };
    };

    const { container } = render(<SearchToAdd {...defaultProps} />);

    await waitFor(() => {
      const outerDiv = container.firstElementChild as HTMLElement;
      expect(outerDiv.className).toContain("top-full");
      expect(outerDiv.className).toContain("mt-1");
      expect(outerDiv.className).not.toContain("bottom-full");
    });
  });

  it("uses bottom-full positioning when near viewport bottom", async () => {
    // 600px viewport, element bottom at 500px = 100px below (< 300)
    Object.defineProperty(window, "innerHeight", { value: 600, writable: true });

    // Mock getBoundingClientRect globally before rendering so the useEffect reads it
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        bottom: 500,
        top: 450,
        left: 0,
        right: 300,
        width: 300,
        height: 50,
        x: 0,
        y: 450,
        toJSON: () => ({}),
      };
    };

    const { container } = render(<SearchToAdd {...defaultProps} />);

    await waitFor(() => {
      const outerDiv = container.firstElementChild as HTMLElement;
      expect(outerDiv.className).toContain("bottom-full");
      expect(outerDiv.className).toContain("mb-1");
      expect(outerDiv.className).not.toContain("top-full");
    });
  });
});
