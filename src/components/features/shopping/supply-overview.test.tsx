import { render, screen } from "@/__tests__/test-utils";
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
      />,
    );
    const row = container.querySelector(".bg-selected");
    expect(row).toBeInTheDocument();
  });
});
