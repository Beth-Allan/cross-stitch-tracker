import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import {
  createMockSupplyBrand,
  createMockThread,
  createMockProjectThread,
} from "@/__tests__/mocks";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";
import { ProjectSuppliesTab } from "./project-supplies-tab";

// Mock server actions
const mockRemoveProjectThread = vi.fn().mockResolvedValue({ success: true });
const mockRemoveProjectBead = vi.fn().mockResolvedValue({ success: true });
const mockRemoveProjectSpecialty = vi.fn().mockResolvedValue({ success: true });
const mockUpdateProjectSupplyQuantity = vi.fn().mockResolvedValue({ success: true });
const mockAddThreadToProject = vi.fn().mockResolvedValue({ success: true });
const mockAddBeadToProject = vi.fn().mockResolvedValue({ success: true });
const mockAddSpecialtyToProject = vi.fn().mockResolvedValue({ success: true });
const mockGetThreads = vi.fn().mockResolvedValue([]);
const mockGetBeads = vi.fn().mockResolvedValue([]);
const mockGetSpecialtyItems = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/actions/supply-actions", () => ({
  removeProjectThread: (...args: unknown[]) => mockRemoveProjectThread(...args),
  removeProjectBead: (...args: unknown[]) => mockRemoveProjectBead(...args),
  removeProjectSpecialty: (...args: unknown[]) => mockRemoveProjectSpecialty(...args),
  updateProjectSupplyQuantity: (...args: unknown[]) => mockUpdateProjectSupplyQuantity(...args),
  addThreadToProject: (...args: unknown[]) => mockAddThreadToProject(...args),
  addBeadToProject: (...args: unknown[]) => mockAddBeadToProject(...args),
  addSpecialtyToProject: (...args: unknown[]) => mockAddSpecialtyToProject(...args),
  getThreads: (...args: unknown[]) => mockGetThreads(...args),
  getBeads: (...args: unknown[]) => mockGetBeads(...args),
  getSpecialtyItems: (...args: unknown[]) => mockGetSpecialtyItems(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const dmcBrand = createMockSupplyBrand({
  id: "brand-dmc",
  name: "DMC",
});

function makeThreadWithBrand(
  overrides?: Partial<ProjectThreadWithThread>,
): ProjectThreadWithThread {
  const thread = createMockThread({
    id: "thread-310",
    brandId: "brand-dmc",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
  });
  const pt = createMockProjectThread({
    id: "pt-1",
    projectId: "proj-1",
    threadId: "thread-310",
    quantityRequired: 2,
    quantityAcquired: 1,
  });
  return {
    ...pt,
    thread: { ...thread, brand: dmcBrand },
    ...overrides,
  } as ProjectThreadWithThread;
}

const defaultProps = {
  projectId: "proj-1",
  threads: [] as ProjectThreadWithThread[],
  beads: [] as ProjectBeadWithBead[],
  specialty: [] as ProjectSpecialtyWithItem[],
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("ProjectSuppliesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders three supply sections: Thread, Beads, Specialty", () => {
    render(<ProjectSuppliesTab {...defaultProps} />);
    expect(screen.getByText("Thread")).toBeInTheDocument();
    expect(screen.getByText("Beads")).toBeInTheDocument();
    expect(screen.getByText("Specialty")).toBeInTheDocument();
  });

  it("shows empty state message when no threads are linked", () => {
    render(<ProjectSuppliesTab {...defaultProps} />);
    expect(screen.getByText("No threads linked to this project")).toBeInTheDocument();
  });

  it("shows kitting summary with percentage", () => {
    const threads = [
      makeThreadWithBrand({
        id: "pt-1",
        quantityRequired: 2,
        quantityAcquired: 2,
      }),
      makeThreadWithBrand({
        id: "pt-2",
        threadId: "thread-2",
        quantityRequired: 1,
        quantityAcquired: 0,
        thread: {
          ...createMockThread({
            id: "thread-2",
            colorCode: "666",
            colorName: "Red",
            hexColor: "#FF0000",
          }),
          brand: dmcBrand,
        },
      }),
    ];
    render(<ProjectSuppliesTab {...defaultProps} threads={threads} />);
    expect(screen.getByText("Supply Kitting")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders thread row with brand code, name, and quantities", () => {
    const threads = [makeThreadWithBrand()];
    render(<ProjectSuppliesTab {...defaultProps} threads={threads} />);
    expect(screen.getByText(/DMC 310/)).toBeInTheDocument();
    expect(screen.getByText(/Black/)).toBeInTheDocument();
    expect(screen.getByText("Req:")).toBeInTheDocument();
    expect(screen.getByText("Have:")).toBeInTheDocument();
  });

  it("calls removeProjectThread when remove button is clicked", async () => {
    const threads = [makeThreadWithBrand()];
    render(<ProjectSuppliesTab {...defaultProps} threads={threads} />);
    const removeButton = screen.getByTitle("Remove from project");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockRemoveProjectThread).toHaveBeenCalledWith("pt-1");
    });
  });

  it("shows 'All supplies acquired' when 100% fulfilled", () => {
    const threads = [
      makeThreadWithBrand({
        id: "pt-1",
        quantityRequired: 1,
        quantityAcquired: 1,
      }),
    ];
    render(<ProjectSuppliesTab {...defaultProps} threads={threads} />);
    expect(screen.getByText("All supplies acquired")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows Add threads link in empty thread section", () => {
    render(<ProjectSuppliesTab {...defaultProps} />);
    expect(screen.getByText("Add threads")).toBeInTheDocument();
  });
});
