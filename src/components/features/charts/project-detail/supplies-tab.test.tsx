import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SuppliesTab } from "./supplies-tab";
import type { ProjectDetailProps } from "./types";
import type { ProjectThreadWithThread } from "@/types/supply";
import {
  createMockSupplyBrand,
  createMockThread,
  createMockProjectThread,
} from "@/__tests__/mocks/factories";

// Mock server actions
vi.mock("@/lib/actions/supply-actions", () => ({
  updateProjectSupplyQuantity: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectThread: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectBead: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectSpecialty: vi.fn(() => Promise.resolve({ success: true })),
  getThreads: vi.fn(() => Promise.resolve([])),
  getBeads: vi.fn(() => Promise.resolve([])),
  getSpecialtyItems: vi.fn(() => Promise.resolve([])),
  addThreadToProject: vi.fn(() => Promise.resolve({ success: true })),
  addBeadToProject: vi.fn(() => Promise.resolve({ success: true })),
  addSpecialtyToProject: vi.fn(() => Promise.resolve({ success: true })),
  createAndAddThread: vi.fn(() => Promise.resolve({ success: true })),
  createAndAddBead: vi.fn(() => Promise.resolve({ success: true })),
  createAndAddSpecialty: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/lib/actions/chart-actions", () => ({
  updateProjectSettings: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockBrand = createMockSupplyBrand({ id: "brand-1", name: "DMC" });

function makeThread(overrides?: Partial<ProjectThreadWithThread>): ProjectThreadWithThread {
  return {
    ...createMockProjectThread({
      id: overrides?.id ?? "pt-1",
      stitchCount: overrides?.stitchCount ?? 500,
      quantityRequired: overrides?.quantityRequired ?? 2,
      quantityAcquired: overrides?.quantityAcquired ?? 1,
    }),
    thread: {
      ...createMockThread({
        id: "thread-1",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
      }),
      brand: mockBrand,
    },
    ...overrides,
  };
}

const defaultProject: NonNullable<ProjectDetailProps["chart"]["project"]> = {
  id: "proj-1",
  userId: "user-1",
  status: "IN_PROGRESS",
  startDate: null,
  finishDate: null,
  ffoDate: null,
  startingStitches: 0,
  stitchesCompleted: 0,
  strandCount: 2,
  overCount: 2,
  wastePercent: 20,
  storageLocation: null,
  stitchingApp: null,
  fabric: null,
};

describe("SuppliesTab", () => {
  it('renders three supply section headings ("Threads", "Beads", "Specialty Items")', () => {
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
      />,
    );
    expect(screen.getByText("Threads")).toBeInTheDocument();
    expect(screen.getByText("Beads")).toBeInTheDocument();
    expect(screen.getByText("Specialty Items")).toBeInTheDocument();
  });

  it("computes total stitch count correctly from thread data", () => {
    const threads = [
      makeThread({ id: "pt-1", stitchCount: 1000 }),
      makeThread({
        id: "pt-2",
        stitchCount: 2500,
        thread: {
          ...createMockThread({
            id: "thread-2",
            colorCode: "321",
            colorName: "Red",
            hexColor: "#FF0000",
          }),
          brand: mockBrand,
        },
      }),
    ];
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads, beads: [], specialty: [] }}
      />,
    );
    // Total stitch count appears in both section header and footer totals
    const matches = screen.getAllByText(/3,500/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders sort toggle with "Added" and "A-Z" options', () => {
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
      />,
    );
    expect(screen.getByRole("button", { name: "Added" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A-Z" })).toBeInTheDocument();
  });

  it("renders empty state message when no supplies", () => {
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads: [], beads: [], specialty: [] }}
      />,
    );
    expect(screen.getByText("No supplies added yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add thread colours, beads, or specialty items to track what you need for this project.",
      ),
    ).toBeInTheDocument();
  });

  it("renders footer totals row", () => {
    const threads = [
      makeThread({
        id: "pt-1",
        stitchCount: 1000,
        quantityRequired: 3,
        quantityAcquired: 2,
      }),
    ];
    render(
      <SuppliesTab
        chartId="chart-1"
        project={defaultProject}
        supplies={{ threads, beads: [], specialty: [] }}
      />,
    );
    expect(screen.getByText("Totals:")).toBeInTheDocument();
  });
});
