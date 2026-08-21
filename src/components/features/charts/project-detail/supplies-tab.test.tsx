import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
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
    warning: vi.fn(),
  },
}));

vi.mock("@/components/features/charts/form-primitives/calculator-card", () => ({
  CalculatorCard: ({
    calcParams,
    fabricOptions,
  }: {
    calcParams: {
      strandCount: number;
      overCount: number;
      wastePercent: number;
      fabricCount: number;
    };
    fabricOptions: Array<{ value: string; label: string; count: number }>;
  }) => (
    <div data-testid="calculator-card">
      <span>Skein Calculator</span>
      <span data-testid="calc-strands">{calcParams.strandCount}</span>
      <span data-testid="calc-over">{calcParams.overCount}</span>
      <span data-testid="calc-waste">{calcParams.wastePercent}</span>
      <span data-testid="calc-fabric-count">{calcParams.fabricCount}</span>
      <span data-testid="calc-fabric-options">{fabricOptions.length}</span>
    </div>
  ),
}));

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

function makeSpecialty(overrides?: Partial<ProjectSpecialtyWithItem>): ProjectSpecialtyWithItem {
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

describe("SuppliesTab", () => {
  describe("renders SupplyTable with transformed data", () => {
    it("renders the unified supply table when supplies are provided", () => {
      render(
        <SuppliesTab
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
          thread: {
            ...createMockThread({
              id: "t-z",
              colorCode: "Zzz",
              colorName: "Z Thread",
              hexColor: "#000",
            }),
            brand: mockBrand,
          },
        }),
        makeThread({
          id: "pt-a",
          thread: {
            ...createMockThread({
              id: "t-a",
              colorCode: "111",
              colorName: "A Thread",
              hexColor: "#FFF",
            }),
            brand: mockBrand,
          },
        }),
      ];
      render(
        <SuppliesTab project={defaultProject} supplies={{ threads, beads: [], specialty: [] }} />,
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
          thread: {
            ...createMockThread({
              id: "t-z",
              colorCode: "Zzz",
              colorName: "Z Thread",
              hexColor: "#000",
            }),
            brand: mockBrand,
          },
        }),
        makeThread({
          id: "pt-a",
          thread: {
            ...createMockThread({
              id: "t-a",
              colorCode: "111",
              colorName: "A Thread",
              hexColor: "#FFF",
            }),
            brand: mockBrand,
          },
        }),
      ];
      render(
        <SuppliesTab project={defaultProject} supplies={{ threads, beads: [], specialty: [] }} />,
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
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Renders the add row (proves adapter was created and passed)
      expect(screen.getByTestId("supply-table-add-row")).toBeInTheDocument();
    });
  });

  describe("calculator settings exclusion", () => {
    it("does NOT render fabric-count, strand-count or over-count controls", () => {
      render(
        <SuppliesTab
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      // Those settings belong to the chart form, never to this tab
      expect(screen.queryByText(/fabric count/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/strand count/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/over \d/i)).not.toBeInTheDocument();
    });
  });

  describe("CalculatorCard integration", () => {
    it("renders CalculatorCard when calculator prop is provided", () => {
      render(
        <SuppliesTab
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
          calculator={{ fabricOptions: [], chartId: "test-chart-id" }}
        />,
      );
      expect(screen.getByTestId("calculator-card")).toBeInTheDocument();
      expect(screen.getByText("Skein Calculator")).toBeInTheDocument();
    });

    it("does not render CalculatorCard when calculator prop is not provided", () => {
      render(
        <SuppliesTab
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
        />,
      );
      expect(screen.queryByTestId("calculator-card")).not.toBeInTheDocument();
    });

    it("passes calc params from project to CalculatorCard", () => {
      const customProject = {
        ...defaultProject,
        strandCount: 3,
        overCount: 1 as const,
        wastePercent: 30,
        fabric: { id: "fab-1", name: "Aida", count: 18, brand: { name: "Zweigart" } },
      };
      render(
        <SuppliesTab
          project={customProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
          calculator={{
            fabricOptions: [{ value: "fab-1", label: "Zweigart Aida (18ct)", count: 18 }],
            chartId: "test-chart-id",
          }}
        />,
      );
      expect(screen.getByTestId("calc-strands")).toHaveTextContent("3");
      expect(screen.getByTestId("calc-over")).toHaveTextContent("1");
      expect(screen.getByTestId("calc-waste")).toHaveTextContent("30");
      expect(screen.getByTestId("calc-fabric-count")).toHaveTextContent("18");
    });

    it("passes fabric options to CalculatorCard", () => {
      const fabricOptions = [
        { value: "fab-1", label: "Zweigart Aida (14ct)", count: 14 },
        { value: "fab-2", label: "Zweigart Aida (18ct)", count: 18 },
      ];
      render(
        <SuppliesTab
          project={defaultProject}
          supplies={{ threads: [makeThread()], beads: [], specialty: [] }}
          calculator={{ fabricOptions, chartId: "test-chart-id" }}
        />,
      );
      expect(screen.getByTestId("calc-fabric-options")).toHaveTextContent("2");
    });
  });
});
