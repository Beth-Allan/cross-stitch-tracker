import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { SupplyCatalog } from "./supply-catalog";
import {
  createMockSupplyBrand,
  createMockThread,
  createMockBead,
  createMockSpecialtyItem,
} from "@/__tests__/mocks";
import type { ThreadWithBrand, BeadWithBrand, SpecialtyItemWithBrand } from "@/types/supply";
import type { SupplyBrand } from "@/generated/prisma/client";

const mockCreateThread = vi.fn();
const mockUpdateThread = vi.fn();
const mockDeleteThread = vi.fn();
const mockCreateBead = vi.fn();
const mockUpdateBead = vi.fn();
const mockDeleteBead = vi.fn();
const mockCreateSpecialtyItem = vi.fn();
const mockUpdateSpecialtyItem = vi.fn();
const mockDeleteSpecialtyItem = vi.fn();

vi.mock("@/lib/actions/supply-actions", () => ({
  createThread: (...args: unknown[]) => mockCreateThread(...args),
  updateThread: (...args: unknown[]) => mockUpdateThread(...args),
  deleteThread: (...args: unknown[]) => mockDeleteThread(...args),
  createBead: (...args: unknown[]) => mockCreateBead(...args),
  updateBead: (...args: unknown[]) => mockUpdateBead(...args),
  deleteBead: (...args: unknown[]) => mockDeleteBead(...args),
  createSpecialtyItem: (...args: unknown[]) => mockCreateSpecialtyItem(...args),
  updateSpecialtyItem: (...args: unknown[]) => mockUpdateSpecialtyItem(...args),
  deleteSpecialtyItem: (...args: unknown[]) => mockDeleteSpecialtyItem(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const dmcBrand = createMockSupplyBrand({
  id: "brand-dmc",
  name: "DMC",
  website: "https://www.dmc.com",
  supplyType: "THREAD",
});

const millHillBrand = createMockSupplyBrand({
  id: "brand-mh",
  name: "Mill Hill",
  website: null,
  supplyType: "BEAD",
});

const kreinikBrand = createMockSupplyBrand({
  id: "brand-kr",
  name: "Kreinik",
  website: null,
  supplyType: "SPECIALTY",
});

const mockThreads: ThreadWithBrand[] = [
  { ...createMockThread({ id: "t1", colorCode: "310", colorName: "Black", hexColor: "#000000", colorFamily: "BLACK", brandId: "brand-dmc" }), brand: dmcBrand },
  { ...createMockThread({ id: "t2", colorCode: "321", colorName: "Red", hexColor: "#C72B3B", colorFamily: "RED", brandId: "brand-dmc" }), brand: dmcBrand },
  { ...createMockThread({ id: "t3", colorCode: "White", colorName: "White", hexColor: "#FFFFFF", colorFamily: "WHITE", brandId: "brand-dmc" }), brand: dmcBrand },
];

const mockBeads: BeadWithBrand[] = [
  { ...createMockBead({ id: "b1", productCode: "00123", colorName: "Red Bead", hexColor: "#FF0000", colorFamily: "RED", brandId: "brand-mh" }), brand: millHillBrand },
];

const mockSpecialty: SpecialtyItemWithBrand[] = [
  { ...createMockSpecialtyItem({ id: "s1", productCode: "K001", colorName: "Gold Braid", hexColor: "#FFD700", brandId: "brand-kr" }), brand: kreinikBrand },
];

const brands: SupplyBrand[] = [dmcBrand, millHillBrand, kreinikBrand];

describe("SupplyCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  it("renders three tabs: Threads, Beads, Specialty Items", () => {
    render(
      <SupplyCatalog
        threads={mockThreads}
        beads={mockBeads}
        specialtyItems={mockSpecialty}
        brands={brands}
      />,
    );

    expect(screen.getByText(/Threads/)).toBeInTheDocument();
    expect(screen.getByText(/Beads/)).toBeInTheDocument();
    expect(screen.getByText(/Specialty/)).toBeInTheDocument();
  });

  it("shows thread count in tab label", () => {
    render(
      <SupplyCatalog
        threads={mockThreads}
        beads={mockBeads}
        specialtyItems={mockSpecialty}
        brands={brands}
      />,
    );

    expect(screen.getByText(/Threads \(3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Beads \(1\)/)).toBeInTheDocument();
  });

  it("renders thread items in the catalog", () => {
    render(
      <SupplyCatalog
        threads={mockThreads}
        beads={mockBeads}
        specialtyItems={mockSpecialty}
        brands={brands}
      />,
    );

    // Thread tab is default active, should show thread codes
    expect(screen.getByText("310")).toBeInTheDocument();
    expect(screen.getByText("321")).toBeInTheDocument();
  });

  it("shows Add Thread button on threads tab", () => {
    render(
      <SupplyCatalog
        threads={mockThreads}
        beads={mockBeads}
        specialtyItems={mockSpecialty}
        brands={brands}
      />,
    );

    expect(screen.getByText("Add Thread")).toBeInTheDocument();
  });

  it("shows empty state when no threads exist", () => {
    render(
      <SupplyCatalog
        threads={[]}
        beads={mockBeads}
        specialtyItems={mockSpecialty}
        brands={brands}
      />,
    );

    expect(screen.getByText("No threads in your catalog")).toBeInTheDocument();
  });
});
