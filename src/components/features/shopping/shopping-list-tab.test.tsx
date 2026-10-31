import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ShoppingListTab } from "./shopping-list-tab";
import type { ShoppingSupplyNeed } from "@/types/dashboard";

vi.mock("@/components/features/supplies/color-swatch", () => ({
  ColorSwatch: () => <span data-testid="swatch" />,
}));

function createNeed(overrides: Partial<ShoppingSupplyNeed> = {}): ShoppingSupplyNeed {
  return {
    junctionId: "jt-1",
    supplyId: "s-1",
    brandName: "DMC",
    code: "310",
    colorName: "Black",
    hexColor: "#000000",
    quantityRequired: 3,
    quantityAcquired: 1,
    unit: "skeins",
    projectId: "p1",
    projectName: "Forest Sampler",
    ...overrides,
  };
}

const unknownLine = createNeed({
  junctionId: "jt-u",
  brandName: "Kreinik",
  code: "001",
  colorName: "Silver",
  quantityRequired: null,
  quantityAcquired: 0,
});

describe("ShoppingListTab", () => {
  it("lists what is still short on a known need", () => {
    render(
      <ShoppingListTab
        threads={[createNeed(), createNeed({ junctionId: "jt-2", quantityAcquired: 3 })]}
        beads={[]}
        specialty={[]}
        fabrics={[]}
      />,
    );

    expect(screen.getByText("1 item to buy")).toBeInTheDocument();
    expect(screen.getByText("2 skeins")).toBeInTheDocument();
  });

  describe("a thread line whose need is unknown (THR-011)", () => {
    it("is on the list, with Unknown as its quantity", () => {
      render(<ShoppingListTab threads={[unknownLine]} beads={[]} specialty={[]} fabrics={[]} />);

      expect(screen.getByText("Kreinik 001 Silver")).toBeInTheDocument();
      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("1 item to buy")).toBeInTheDocument();
    });

    it("stays on the list after skeins were bought against it", () => {
      render(
        <ShoppingListTab
          threads={[{ ...unknownLine, quantityAcquired: 5 }]}
          beads={[]}
          specialty={[]}
          fabrics={[]}
        />,
      );

      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.queryByText(/All supplies acquired/)).not.toBeInTheDocument();
    });

    it("keeps the list from reading all-acquired when every known line is in hand", () => {
      render(
        <ShoppingListTab
          threads={[createNeed({ quantityAcquired: 3 }), unknownLine]}
          beads={[]}
          specialty={[]}
          fabrics={[]}
        />,
      );

      expect(screen.getByText("1 item to buy")).toBeInTheDocument();
      expect(screen.queryByText(/All supplies acquired/)).not.toBeInTheDocument();
    });
  });
});
