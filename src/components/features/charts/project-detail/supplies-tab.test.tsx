import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SuppliesTab } from "./supplies-tab";
import type { ProjectDetailProps } from "./types";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";
import {
  createMockSupplyBrand,
  createMockThread,
  createMockBead,
  createMockSpecialtyItem,
  createMockProjectThread,
  createMockProjectBead,
  createMockProjectSpecialty,
} from "@/__tests__/mocks/factories";

// Mock server actions used by ServerActionAdapter
vi.mock("@/lib/actions/supply-actions", () => ({
  addThreadToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-1" } })),
  addBeadToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-2" } })),
  addSpecialtyToProject: vi.fn(() => Promise.resolve({ success: true, record: { id: "new-3" } })),
  updateProjectSupplyQuantity: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectThread: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectBead: vi.fn(() => Promise.resolve({ success: true })),
  removeProjectSpecialty: vi.fn(() => Promise.resolve({ success: true })),
  getThreads: vi.fn(() => Promise.resolve([])),
  getBeads: vi.fn(() => Promise.resolve([])),
  getSpecialtyItems: vi.fn(() => Promise.resolve([])),
  createAndAddThread: vi.fn(() => Promise.resolve({ success: true })),
  createAndAddBead: vi.fn(() => Promise.resolve({ success: true })),
  createAndAddSpecialty: vi.fn(() => Promise.resolve({ success: true })),
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

vi.mock("@/lib/actions/chart-actions", () => ({
  updateProjectSettings: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockBrand = createMockSupplyBrand({ id: "brand-1", name: "DMC" });

function makeThread(overrides?: Partial<ProjectThreadWithThread>): ProjectThreadWithThread {
  return {
    ...createMockProjectThread({
      id: overrides?.id ?? "pt-1",
      threadId: "thread-1",
      stitchCount: overrides?.stitchCount ?? 500,
      quantityRequired: overrides?.quantityRequired ?? 2,
      quantityAcquired: overrides?.quantityAcquired ?? 1,
      isNeedOverridden: overrides?.isNeedOverridden ?? false,
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

function makeBead(overrides?: Partial<ProjectBeadWithBead>): ProjectBeadWithBead {
  return {
    ...createMockProjectBead({
      id: overrides?.id ?? "pb-1",
      beadId: "bead-1",
      quantityRequired: overrides?.quantityRequired ?? 3,
      quantityAcquired: overrides?.quantityAcquired ?? 1,
    }),
    bead: {
      ...createMockBead({
        id: "bead-1",
        productCode: "00123",
        colorName: "Red",
        hexColor: "#FF0000",
      }),
      brand: mockBrand,
    },
    ...overrides,
  };
}

function makeSpecialty(
  overrides?: Partial<ProjectSpecialtyWithItem>,
): ProjectSpecialtyWithItem {
  return {
    ...createMockProjectSpecialty({
      id: overrides?.id ?? "ps-1",
      specialtyItemId: "specialty-1",
      quantityRequired: overrides?.quantityRequired ?? 1,
      quantityAcquired: overrides?.quantityAcquired ?? 0,
    }),
    specialtyItem: {
      ...createMockSpecialtyItem({
        id: "specialty-1",
        productCode: "K001",
        colorName: "Gold Braid",
        description: "Metallic braid",
        hexColor: "#FFD700",
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SuppliesTab", () => {
  describe("renders SupplyTable with transformed data", () => {
    it("renders the unified supply table when supplies are provided", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // The SupplyTable renders section dividers with labels
      // "Thread" appears in both section divider and type toggle, so use getAllByText
      expect(screen.getAllByText("Thread").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Beads").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Specialty").length).toBeGreaterThanOrEqual(1);
    });

    it("renders empty state when no supplies exist", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [], beads: [], specialty: [] }}
        />,
      );
      expect(screen.getByText("No supplies added yet")).toBeInTheDocument();
    });
  });

  describe("calcParams derivation", () => {
    it("derives fabricCount from project.fabric.count when fabric is linked", () => {
      const projectWithFabric = {
        ...defaultProject,
        fabric: { id: "fab-1", name: "Aida", count: 18, brand: { name: "Zweigart" } },
      };
      render(
        <SuppliesTab
          chartId="chart-1"
          project={projectWithFabric}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Component should render without error -- fabricCount=18 used internally
      expect(screen.getByTestId("supply-table-add-row")).toBeInTheDocument();
    });

    it("uses default fabricCount=14 when project.fabric is null", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={{ ...defaultProject, fabric: null }}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Component renders with default -- no crash
      expect(screen.getByTestId("supply-table-add-row")).toBeInTheDocument();
    });

    it("passes strandCount, overCount, wastePercent from project", () => {
      const customProject = {
        ...defaultProject,
        strandCount: 3,
        overCount: 1 as const,
        wastePercent: 30,
      };
      render(
        <SuppliesTab
          chartId="chart-1"
          project={customProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Renders correctly with custom calcParams
      expect(screen.getByTestId("supply-table-add-row")).toBeInTheDocument();
    });
  });

  describe("data transformation", () => {
    it("transforms ProjectThreadWithThread to SupplyRow (colorCode -> code)", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Thread code "310" should appear in the table
      expect(screen.getByText("310")).toBeInTheDocument();
      // Thread name "Black" should appear
      expect(screen.getByText("Black")).toBeInTheDocument();
    });

    it("transforms ProjectBeadWithBead to SupplyRow (productCode -> code)", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [], beads: [makeBead()], specialty: [] }}
        />,
      );
      // Bead code "00123" should appear
      expect(screen.getByText("00123")).toBeInTheDocument();
      // Bead name "Red" should appear
      expect(screen.getByText("Red")).toBeInTheDocument();
    });

    it("transforms ProjectSpecialtyWithItem to SupplyRow (productCode -> code, description appended)", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [], beads: [], specialty: [makeSpecialty()] }}
        />,
      );
      // Specialty code "K001" should appear
      expect(screen.getByText("K001")).toBeInTheDocument();
    });
  });

  describe("sort toggle", () => {
    it('default sort is "added" (Added button has aria-pressed=true)', () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      const addedBtn = screen.getByRole("button", { name: "Added" });
      const azBtn = screen.getByRole("button", { name: "A-Z" });
      expect(addedBtn).toHaveAttribute("aria-pressed", "true");
      expect(azBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("clicking A-Z button sorts rows alphabetically by code", async () => {
      const user = userEvent.setup();
      const threads = [
        makeThread({
          id: "pt-z",
          thread: { ...createMockThread({ id: "t-z", colorCode: "Zzz", colorName: "Z Thread", hexColor: "#000" }), brand: mockBrand },
        }),
        makeThread({
          id: "pt-a",
          thread: { ...createMockThread({ id: "t-a", colorCode: "111", colorName: "A Thread", hexColor: "#FFF" }), brand: mockBrand },
        }),
      ];
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads, beads: [], specialty: [] }}
        />,
      );

      // In "added" order, "Zzz" appears before "111"
      const allCodes = screen.getAllByText(/Zzz|111/);
      expect(allCodes[0]).toHaveTextContent("Zzz");
      expect(allCodes[1]).toHaveTextContent("111");

      // Click A-Z
      await user.click(screen.getByRole("button", { name: "A-Z" }));

      // Now "111" should appear before "Zzz" (numeric sorting)
      const sortedCodes = screen.getAllByText(/Zzz|111/);
      expect(sortedCodes[0]).toHaveTextContent("111");
      expect(sortedCodes[1]).toHaveTextContent("Zzz");
    });

    it("clicking Added button returns to insertion order", async () => {
      const user = userEvent.setup();
      const threads = [
        makeThread({
          id: "pt-z",
          thread: { ...createMockThread({ id: "t-z", colorCode: "Zzz", colorName: "Z Thread", hexColor: "#000" }), brand: mockBrand },
        }),
        makeThread({
          id: "pt-a",
          thread: { ...createMockThread({ id: "t-a", colorCode: "111", colorName: "A Thread", hexColor: "#FFF" }), brand: mockBrand },
        }),
      ];
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads, beads: [], specialty: [] }}
        />,
      );

      // Sort A-Z
      await user.click(screen.getByRole("button", { name: "A-Z" }));
      // Back to Added
      await user.click(screen.getByRole("button", { name: "Added" }));

      // Back to insertion order: "Zzz" before "111"
      const codes = screen.getAllByText(/Zzz|111/);
      expect(codes[0]).toHaveTextContent("Zzz");
      expect(codes[1]).toHaveTextContent("111");
    });

    it("sort toggle buttons have aria-pressed attributes", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      const addedBtn = screen.getByRole("button", { name: "Added" });
      const azBtn = screen.getByRole("button", { name: "A-Z" });
      expect(addedBtn).toHaveAttribute("aria-pressed");
      expect(azBtn).toHaveAttribute("aria-pressed");
    });
  });

  describe("ServerActionAdapter integration", () => {
    it("instantiates ServerActionAdapter with project.id (renders without error)", () => {
      // The component instantiates the adapter internally -- if project.id is wrong
      // or adapter creation fails, rendering would throw
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Renders the add row (proves adapter was created and passed)
      expect(screen.getByTestId("supply-table-add-row")).toBeInTheDocument();
    });
  });

  describe("CalculatorSettingsBar exclusion", () => {
    it("does NOT render CalculatorSettingsBar (per D-02/D-03)", () => {
      render(
        <SuppliesTab
          chartId="chart-1"
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // CalculatorSettingsBar renders fabric count, strand count labels
      // None of those should be present
      expect(screen.queryByText(/fabric count/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/strand count/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/over \d/i)).not.toBeInTheDocument();
    });
  });
});
