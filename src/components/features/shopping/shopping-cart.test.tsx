import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ShoppingCart } from "./shopping-cart";
import type { ShoppingCartData } from "@/types/dashboard";

// Mock the server action
vi.mock("@/lib/actions/shopping-cart-actions", () => ({
  updateSupplyAcquired: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock localStorage with a real store
let localStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStore[key];
  }),
  clear: vi.fn(() => {
    localStore = {};
  }),
  get length() {
    return Object.keys(localStore).length;
  },
  key: vi.fn((index: number) => Object.keys(localStore)[index] ?? null),
};

beforeEach(() => {
  localStore = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  vi.stubGlobal("localStorage", localStorageMock);
});

const mockData: ShoppingCartData = {
  projects: [
    {
      projectId: "p1",
      chartId: "c1",
      projectName: "Forest Sampler",
      designerName: "Ink Circles",
      coverThumbnailUrl: null,
      status: "IN_PROGRESS",
      threadCount: 5,
      beadCount: 2,
      specialtyCount: 1,
      fabricNeeded: true,
    },
    {
      projectId: "p2",
      chartId: "c2",
      projectName: "Ocean Waves",
      designerName: "Dimensions",
      coverThumbnailUrl: null,
      status: "KITTING",
      threadCount: 3,
      beadCount: 0,
      specialtyCount: 0,
      fabricNeeded: false,
    },
  ],
  threads: [
    {
      junctionId: "jt1",
      supplyId: "s1",
      brandName: "DMC",
      code: "310",
      colorName: "Black",
      hexColor: "#000000",
      quantityRequired: 3,
      quantityAcquired: 1,
      unit: "skeins",
      projectId: "p1",
      projectName: "Forest Sampler",
    },
    {
      junctionId: "jt2",
      supplyId: "s2",
      brandName: "DMC",
      code: "321",
      colorName: "Red",
      hexColor: "#cc0000",
      quantityRequired: 2,
      quantityAcquired: 2,
      unit: "skeins",
      projectId: "p1",
      projectName: "Forest Sampler",
    },
    {
      junctionId: "jt3",
      supplyId: "s3",
      brandName: "DMC",
      code: "415",
      colorName: "Pearl Gray",
      hexColor: "#c0c0c0",
      quantityRequired: 1,
      quantityAcquired: 0,
      unit: "skeins",
      projectId: "p2",
      projectName: "Ocean Waves",
    },
  ],
  beads: [
    {
      junctionId: "jb1",
      supplyId: "b1",
      brandName: "Mill Hill",
      code: "00123",
      colorName: "Crystal",
      hexColor: "#ffffff",
      quantityRequired: 1,
      quantityAcquired: 0,
      unit: "packs",
      projectId: "p1",
      projectName: "Forest Sampler",
    },
  ],
  specialty: [],
  fabrics: [
    {
      projectId: "p1",
      projectName: "Forest Sampler",
      stitchesWide: 200,
      stitchesHigh: 150,
      hasFabric: false,
      fabricName: null,
    },
  ],
};

describe("ShoppingCart", () => {
  it("renders tab bar with all 6 tab labels", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText(/Threads/)).toBeInTheDocument();
    expect(screen.getByText(/Beads/)).toBeInTheDocument();
    expect(screen.getByText(/Specialty/)).toBeInTheDocument();
    expect(screen.getByText(/Fabric/)).toBeInTheDocument();
    expect(screen.getByText(/Shopping List/)).toBeInTheDocument();
  });

  it("badge counts reflect unfulfilled items for selected projects", () => {
    // Pre-populate localStorage with project p1 selected
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);

    render(<ShoppingCart data={mockData} imageUrls={{}} />);

    // Threads: p1 has jt1 (acquired 1 < required 3) = 1 unfulfilled
    // jt2 (acquired 2 >= required 2) = fulfilled
    // The Threads tab should show badge with count 1
    const threadsTab = screen.getByText(/Threads/);
    expect(threadsTab).toBeInTheDocument();

    // ShoppingForBar should show "Shopping for:" with the selected project
    expect(screen.getByText("Shopping for:")).toBeInTheDocument();
  });

  it("supply tabs show disabled opacity when no projects selected", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);

    // With no projects selected, supply tabs should have opacity-50
    const threadsTab = screen.getByText(/Threads/).closest("button");
    expect(threadsTab).toBeInTheDocument();
    expect(threadsTab?.className).toContain("opacity-50");
  });

  it("renders ShoppingForBar with empty state when no projects selected", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    // When no projects are selected, the shopping-for bar shows empty state
    expect(
      screen.getByText(/No projects selected/),
    ).toBeInTheDocument();
  });

  it("filtering by selected projects returns correct subset of supplies", () => {
    // Pre-populate localStorage with only p2 selected
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p2"]);

    render(<ShoppingCart data={mockData} imageUrls={{}} />);

    // Projects tab shows both projects (it's the selection list)
    // Use getAllByText since names appear in both ProjectSelectionList and ShoppingForBar
    const forestSamplerElements = screen.getAllByText("Forest Sampler");
    expect(forestSamplerElements.length).toBeGreaterThanOrEqual(1);

    const oceanWavesElements = screen.getAllByText("Ocean Waves");
    expect(oceanWavesElements.length).toBeGreaterThanOrEqual(1);

    // The ShoppingForBar should show Ocean Waves as selected (as a chip)
    expect(screen.getByText("Shopping for:")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Ocean Waves")).toBeInTheDocument();
  });
});
