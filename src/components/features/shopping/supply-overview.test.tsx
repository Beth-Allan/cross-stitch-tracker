import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SupplyOverview } from "./supply-overview";
import type { ShoppingSupplyNeed } from "@/types/dashboard";

function createMockSupplyNeed(overrides: Partial<ShoppingSupplyNeed> = {}): ShoppingSupplyNeed {
  return {
    junctionId: "junction-1",
    supplyId: "supply-1",
    brandName: "DMC",
    code: "310",
    colorName: "Black",
    hexColor: "#000000",
    quantityRequired: 3,
    quantityAcquired: 1,
    unit: "skein",
    projectId: "project-1",
    projectName: "Test Project",
    ...overrides,
  };
}

describe("SupplyOverview", () => {
  it("renders empty state when no supplies provided", () => {
    render(
      <SupplyOverview
        threads={[]}
        beads={[]}
        specialty={[]}
        fabrics={[]}
        onUpdateAcquired={vi.fn()}
        pendingIds={new Set()}
        failedIds={new Set()}
        supplySearchQuery=""
        onSupplySearchChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Select projects to see supply needs")).toBeInTheDocument();
  });

  it("renders thread section with supply info", () => {
    const threads = [createMockSupplyNeed()];
    render(
      <SupplyOverview
        threads={threads}
        beads={[]}
        specialty={[]}
        fabrics={[]}
        onUpdateAcquired={vi.fn()}
        pendingIds={new Set()}
        failedIds={new Set()}
        supplySearchQuery=""
        onSupplySearchChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Threads")).toBeInTheDocument();
    expect(screen.getByText("DMC 310")).toBeInTheDocument();
  });

  it("shows pending state only on targeted supply, not others", () => {
    const threads = [
      createMockSupplyNeed({ junctionId: "j-1", supplyId: "s-1", code: "310" }),
      createMockSupplyNeed({
        junctionId: "j-2",
        supplyId: "s-2",
        code: "blanc",
        colorName: "White",
        hexColor: "#FFFFFF",
      }),
    ];
    const { container } = render(
      <SupplyOverview
        threads={threads}
        beads={[]}
        specialty={[]}
        fabrics={[]}
        onUpdateAcquired={vi.fn()}
        pendingIds={new Set(["j-1"])}
        failedIds={new Set()}
        supplySearchQuery=""
        onSupplySearchChange={vi.fn()}
      />,
    );
    const spinners = container.querySelectorAll(".animate-spin");
    expect(spinners).toHaveLength(1);
  });

  it("shows no pending spinners when pendingIds is empty", () => {
    const threads = [
      createMockSupplyNeed({ junctionId: "j-1", supplyId: "s-1" }),
      createMockSupplyNeed({
        junctionId: "j-2",
        supplyId: "s-2",
        code: "blanc",
        colorName: "White",
        hexColor: "#FFFFFF",
      }),
    ];
    const { container } = render(
      <SupplyOverview
        threads={threads}
        beads={[]}
        specialty={[]}
        fabrics={[]}
        onUpdateAcquired={vi.fn()}
        pendingIds={new Set()}
        failedIds={new Set()}
        supplySearchQuery=""
        onSupplySearchChange={vi.fn()}
      />,
    );
    const spinners = container.querySelectorAll(".animate-spin");
    expect(spinners).toHaveLength(0);
  });

  it("applies fulfilled styling when acquired >= required", () => {
    const threads = [createMockSupplyNeed({ quantityRequired: 2, quantityAcquired: 2 })];
    const { container } = render(
      <SupplyOverview
        threads={threads}
        beads={[]}
        specialty={[]}
        fabrics={[]}
        onUpdateAcquired={vi.fn()}
        pendingIds={new Set()}
        failedIds={new Set()}
        supplySearchQuery=""
        onSupplySearchChange={vi.fn()}
      />,
    );
    const row = container.querySelector(".bg-selected");
    expect(row).toBeInTheDocument();
  });

  describe("Supply search", () => {
    const defaultSupplyProps = {
      onUpdateAcquired: vi.fn(),
      pendingIds: new Set<string>(),
      failedIds: new Set<string>(),
      onSupplySearchChange: vi.fn(),
      fabrics: [],
      specialty: [],
    };

    it("supply search input appears within the By Supply view", () => {
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={[createMockSupplyNeed()]}
          beads={[]}
          supplySearchQuery=""
        />,
      );
      expect(screen.getByRole("searchbox", { name: "Search supplies" })).toBeInTheDocument();
    });

    it("typing in supply search filters aggregated supplies by brandName (case-insensitive)", () => {
      const threads = [
        createMockSupplyNeed({ supplyId: "s1", brandName: "DMC", code: "310" }),
        createMockSupplyNeed({
          supplyId: "s2",
          junctionId: "j2",
          brandName: "Weeks Dye Works",
          code: "WDW-100",
          colorName: "Garnet",
        }),
      ];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="weeks"
        />,
      );

      expect(screen.getByText("Weeks Dye Works WDW-100")).toBeInTheDocument();
      expect(screen.queryByText("DMC 310")).not.toBeInTheDocument();
    });

    it("typing in supply search filters aggregated supplies by code", () => {
      const threads = [
        createMockSupplyNeed({ supplyId: "s1", brandName: "DMC", code: "310" }),
        createMockSupplyNeed({
          supplyId: "s2",
          junctionId: "j2",
          brandName: "DMC",
          code: "blanc",
          colorName: "White",
        }),
      ];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="blanc"
        />,
      );

      expect(screen.getByText("DMC blanc")).toBeInTheDocument();
      expect(screen.queryByText("DMC 310")).not.toBeInTheDocument();
    });

    it("typing in supply search filters aggregated supplies by colorName", () => {
      const threads = [
        createMockSupplyNeed({ supplyId: "s1", colorName: "Black" }),
        createMockSupplyNeed({
          supplyId: "s2",
          junctionId: "j2",
          code: "321",
          colorName: "Red",
          hexColor: "#cc0000",
        }),
      ];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="red"
        />,
      );

      expect(screen.getByText("DMC 321")).toBeInTheDocument();
      expect(screen.queryByText("DMC 310")).not.toBeInTheDocument();
    });

    it("supply search does NOT filter by project name", () => {
      const threads = [createMockSupplyNeed({ supplyId: "s1", projectName: "Forest Sampler" })];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="Forest"
        />,
      );

      expect(screen.queryByText("DMC 310")).not.toBeInTheDocument();
    });

    it("supply sections with zero matches auto-hide during search", () => {
      const threads = [createMockSupplyNeed({ supplyId: "s1", brandName: "DMC", code: "310" })];
      const beads = [
        createMockSupplyNeed({
          supplyId: "s2",
          junctionId: "j2",
          brandName: "Mill Hill",
          code: "00123",
          colorName: "Crystal",
        }),
      ];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={beads}
          supplySearchQuery="Mill"
        />,
      );

      expect(screen.queryByText("Threads")).not.toBeInTheDocument();
      expect(screen.getByText("Beads")).toBeInTheDocument();
    });

    it('all sections hidden shows EmptyState with "No supplies match your search"', () => {
      const threads = [createMockSupplyNeed()];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="nonexistent"
        />,
      );

      expect(screen.getByText("No supplies match your search")).toBeInTheDocument();
    });

    it("fabric section is NOT filtered by supply search", () => {
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={[createMockSupplyNeed()]}
          beads={[]}
          fabrics={[
            {
              projectId: "p1",
              projectName: "Test",
              stitchesWide: 200,
              stitchesHigh: 150,
              hasFabric: false,
              fabricName: null,
            },
          ]}
          supplySearchQuery="dmc"
        />,
      );

      expect(screen.queryByText("Fabric")).not.toBeInTheDocument();
    });

    it("search filters AFTER aggregation so totals remain correct for multi-project supplies", () => {
      const threads = [
        createMockSupplyNeed({
          supplyId: "shared-s1",
          junctionId: "j1",
          brandName: "DMC",
          code: "310",
          projectId: "p1",
          projectName: "Project A",
          quantityRequired: 3,
          quantityAcquired: 1,
        }),
        createMockSupplyNeed({
          supplyId: "shared-s1",
          junctionId: "j2",
          brandName: "DMC",
          code: "310",
          projectId: "p2",
          projectName: "Project B",
          quantityRequired: 2,
          quantityAcquired: 0,
        }),
      ];
      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          beads={[]}
          supplySearchQuery="310"
        />,
      );

      expect(screen.getByText("DMC 310")).toBeInTheDocument();
      expect(screen.getByText(/Project A, Project B/)).toBeInTheDocument();
    });
  });

  describe("Aggregated quantity distribution", () => {
    const defaultSupplyProps = {
      beads: [] as ShoppingSupplyNeed[],
      specialty: [] as ShoppingSupplyNeed[],
      fabrics: [],
      pendingIds: new Set<string>(),
      failedIds: new Set<string>(),
      supplySearchQuery: "",
      onSupplySearchChange: vi.fn(),
    };

    it("increment on multi-item supply allocates to first item with capacity", async () => {
      const onUpdateAcquired = vi.fn();
      const user = userEvent.setup();
      const threads = [
        createMockSupplyNeed({
          supplyId: "shared-1",
          junctionId: "j-a",
          projectId: "p1",
          projectName: "Project A",
          quantityRequired: 3,
          quantityAcquired: 1,
        }),
        createMockSupplyNeed({
          supplyId: "shared-1",
          junctionId: "j-b",
          projectId: "p2",
          projectName: "Project B",
          quantityRequired: 2,
          quantityAcquired: 0,
        }),
      ];

      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          onUpdateAcquired={onUpdateAcquired}
        />,
      );

      const incrementBtn = screen.getByRole("button", { name: "Increment quantity" });
      await user.click(incrementBtn);

      expect(onUpdateAcquired).toHaveBeenCalledTimes(1);
      expect(onUpdateAcquired).toHaveBeenCalledWith("thread", "j-a", 2);
    });

    it("decrement on multi-item supply deducts from first item with acquired > 0", async () => {
      const onUpdateAcquired = vi.fn();
      const user = userEvent.setup();
      const threads = [
        createMockSupplyNeed({
          supplyId: "shared-1",
          junctionId: "j-a",
          projectId: "p1",
          projectName: "Project A",
          quantityRequired: 3,
          quantityAcquired: 2,
        }),
        createMockSupplyNeed({
          supplyId: "shared-1",
          junctionId: "j-b",
          projectId: "p2",
          projectName: "Project B",
          quantityRequired: 2,
          quantityAcquired: 1,
        }),
      ];

      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          onUpdateAcquired={onUpdateAcquired}
        />,
      );

      const decrementBtn = screen.getByRole("button", { name: "Decrement quantity" });
      await user.click(decrementBtn);

      expect(onUpdateAcquired).toHaveBeenCalledTimes(1);
      expect(onUpdateAcquired).toHaveBeenCalledWith("thread", "j-a", 1);
    });

    it("single-item supply calls onUpdateAcquired directly with junction ID", async () => {
      const onUpdateAcquired = vi.fn();
      const user = userEvent.setup();
      const threads = [
        createMockSupplyNeed({
          supplyId: "solo-1",
          junctionId: "j-single",
          quantityRequired: 3,
          quantityAcquired: 1,
        }),
      ];

      render(
        <SupplyOverview
          {...defaultSupplyProps}
          threads={threads}
          onUpdateAcquired={onUpdateAcquired}
        />,
      );

      const incrementBtn = screen.getByRole("button", { name: "Increment quantity" });
      await user.click(incrementBtn);

      expect(onUpdateAcquired).toHaveBeenCalledTimes(1);
      expect(onUpdateAcquired).toHaveBeenCalledWith("thread", "j-single", 2);
    });
  });

  describe("Memoization", () => {
    const baseProps = {
      beads: [] as ShoppingSupplyNeed[],
      specialty: [] as ShoppingSupplyNeed[],
      fabrics: [],
      onUpdateAcquired: vi.fn(),
      pendingIds: new Set<string>(),
      failedIds: new Set<string>(),
      supplySearchQuery: "",
      onSupplySearchChange: vi.fn(),
    };

    it("re-render with changed pendingIds does not recompute aggregation", () => {
      const threads = [
        createMockSupplyNeed({ supplyId: "s-1", junctionId: "j-1", code: "310" }),
        createMockSupplyNeed({
          supplyId: "s-2",
          junctionId: "j-2",
          code: "321",
          colorName: "Red",
          hexColor: "#cc0000",
        }),
      ];

      const { rerender } = render(<SupplyOverview {...baseProps} threads={threads} />);

      expect(screen.getByText("Threads")).toBeInTheDocument();
      expect(screen.getByText(/2 types/)).toBeInTheDocument();

      rerender(<SupplyOverview {...baseProps} threads={threads} pendingIds={new Set(["j-1"])} />);

      expect(screen.getByText(/2 types/)).toBeInTheDocument();
    });

    it("re-render with changed threads array updates aggregation", () => {
      const oneThread = [createMockSupplyNeed({ supplyId: "s-1", junctionId: "j-1", code: "310" })];
      const twoThreads = [
        ...oneThread,
        createMockSupplyNeed({
          supplyId: "s-2",
          junctionId: "j-2",
          code: "321",
          colorName: "Red",
          hexColor: "#cc0000",
        }),
      ];

      const { rerender } = render(<SupplyOverview {...baseProps} threads={oneThread} />);

      expect(screen.getByText(/1 type[^s]/)).toBeInTheDocument();

      rerender(<SupplyOverview {...baseProps} threads={twoThreads} />);

      expect(screen.getByText(/2 types/)).toBeInTheDocument();
    });
  });
});
