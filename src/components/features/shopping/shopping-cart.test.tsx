import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ShoppingCart } from "./shopping-cart";
import type { ShoppingCartData } from "@/types/dashboard";

vi.mock("@/lib/actions/shopping-cart-actions", () => ({
  updateSupplyAcquired: vi.fn().mockResolvedValue({ success: true }),
}));

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
      focalPointX: null,
      focalPointY: null,
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
      focalPointX: null,
      focalPointY: null,
      status: "KITTING",
      threadCount: 3,
      beadCount: 0,
      specialtyCount: 0,
      fabricNeeded: false,
    },
    {
      projectId: "p3",
      chartId: "c3",
      projectName: "Alpine Meadow",
      designerName: "Northern Expressions",
      coverThumbnailUrl: null,
      focalPointX: null,
      focalPointY: null,
      status: "KITTING",
      threadCount: 2,
      beadCount: 0,
      specialtyCount: 0,
      fabricNeeded: true,
    },
    {
      projectId: "p4",
      chartId: "c4",
      projectName: "Dragon Dreams",
      designerName: "Heaven and Earth",
      coverThumbnailUrl: null,
      focalPointX: null,
      focalPointY: null,
      status: "UNSTARTED",
      threadCount: 1,
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
    {
      junctionId: "jt4",
      supplyId: "s4",
      brandName: "DMC",
      code: "699",
      colorName: "Green",
      hexColor: "#00cc00",
      quantityRequired: 2,
      quantityAcquired: 0,
      unit: "skeins",
      projectId: "p3",
      projectName: "Alpine Meadow",
    },
    {
      junctionId: "jt5",
      supplyId: "s5",
      brandName: "Weeks Dye Works",
      code: "1234",
      colorName: "Crimson",
      hexColor: "#cc0000",
      quantityRequired: 1,
      quantityAcquired: 0,
      unit: "skeins",
      projectId: "p4",
      projectName: "Dragon Dreams",
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
    {
      projectId: "p3",
      projectName: "Alpine Meadow",
      stitchesWide: 300,
      stitchesHigh: 250,
      hasFabric: false,
      fabricName: null,
    },
  ],
};

describe("ShoppingCart", () => {
  it("renders 2 tabs (Projects and Shopping List)", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText(/Shopping List/)).toBeInTheDocument();
  });

  it("renders view toggle with By Project and By Supply Type", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("By Project")).toBeInTheDocument();
    expect(screen.getByText("By Supply Type")).toBeInTheDocument();
  });

  it("defaults to By Project view", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    const byProjectBtn = screen.getByText("By Project");
    expect(byProjectBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("shows project accordion in By Project view", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("Forest Sampler")).toBeInTheDocument();
    expect(screen.getByText("Ocean Waves")).toBeInTheDocument();
  });

  it("renders ShoppingForBar with empty state when no projects selected", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText(/No projects selected/)).toBeInTheDocument();
  });

  it("shopping list tab shows disabled opacity when no projects selected", () => {
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    const listTab = screen.getByText(/Shopping List/).closest("button");
    expect(listTab?.className).toContain("opacity-50");
  });

  it("shows ShoppingForBar with selected project names", () => {
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("Shopping for:")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Forest Sampler")).toBeInTheDocument();
  });

  it("filtering by selected projects returns correct subset", () => {
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p2"]);
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("Shopping for:")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Ocean Waves")).toBeInTheDocument();
  });

  it("switches to By Supply Type view when toggled", async () => {
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
    const user = userEvent.setup();
    render(<ShoppingCart data={mockData} imageUrls={{}} />);

    await user.click(screen.getByText("By Supply Type"));

    expect(screen.getByText("By Supply Type")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Threads/)).toBeInTheDocument();
  });

  it("persists view mode in localStorage", async () => {
    const user = userEvent.setup();
    render(<ShoppingCart data={mockData} imageUrls={{}} />);

    await user.click(screen.getByText("By Supply Type"));

    expect(localStorageMock.setItem).toHaveBeenCalledWith("shopping-cart-view-mode", "by-supply");
  });

  it("restores persisted view mode", () => {
    localStore["shopping-cart-view-mode"] = "by-supply";
    localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
    render(<ShoppingCart data={mockData} imageUrls={{}} />);
    expect(screen.getByText("By Supply Type")).toHaveAttribute("aria-pressed", "true");
  });

  describe("Project search", () => {
    it("typing in project search filters displayed projects by name", async () => {
      const user = userEvent.setup();
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Forest");

      expect(screen.getByText("Forest Sampler")).toBeInTheDocument();
      expect(screen.queryByText("Ocean Waves")).not.toBeInTheDocument();
      expect(screen.queryByText("Dragon Dreams")).not.toBeInTheDocument();
    });

    it("project search filters projects in By Supply view too", async () => {
      const user = userEvent.setup();
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1", "p2"]);
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Ocean");

      await user.click(screen.getByText("By Supply Type"));

      expect(screen.getByText("DMC 415")).toBeInTheDocument();
      expect(screen.queryByText("DMC 310")).not.toBeInTheDocument();
    });

    it("clicking 'Select visible' when search is active selects only visible projects", async () => {
      const user = userEvent.setup();
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Ocean");

      await user.click(screen.getByText("Select visible"));

      expect(screen.getByText("Shopping for:")).toBeInTheDocument();
      expect(screen.getByLabelText("Remove Ocean Waves")).toBeInTheDocument();
      expect(screen.queryByLabelText("Remove Forest Sampler")).not.toBeInTheDocument();
    });

    it("selecting projects then searching does not deselect hidden projects", async () => {
      const user = userEvent.setup();
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Ocean");

      expect(screen.getByLabelText("Remove Forest Sampler")).toBeInTheDocument();
    });

    it("iterative selection works across multiple searches", async () => {
      const user = userEvent.setup();
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Ocean");
      await user.click(screen.getByText("Select visible"));

      await user.clear(search);
      await user.type(search, "Alpine");
      await user.click(screen.getByText("Select visible"));

      expect(screen.getByLabelText("Remove Ocean Waves")).toBeInTheDocument();
      expect(screen.getByLabelText("Remove Alpine Meadow")).toBeInTheDocument();
    });

    it("'Select all' changes to 'Select visible' when search is active", async () => {
      const user = userEvent.setup();
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      expect(screen.getAllByText("Select all").length).toBeGreaterThan(0);
      expect(screen.queryByText("Select visible")).not.toBeInTheDocument();

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Forest");

      expect(screen.getByText("Select visible")).toBeInTheDocument();
    });

    it("SelectionCounter shows filtered/total counts during search", async () => {
      const user = userEvent.setup();
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1", "p2"]);
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Ocean");

      expect(screen.getByText(/1 of 1 visible selected/)).toBeInTheDocument();
      expect(screen.getByText(/2 total selected/)).toBeInTheDocument();
    });

    it("clearing search shows all projects with previous selections intact", async () => {
      const user = userEvent.setup();
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
      render(<ShoppingCart data={mockData} imageUrls={{}} />);

      const search = screen.getByRole("searchbox", { name: "Search projects" });
      await user.type(search, "Forest");
      await user.clear(search);

      expect(screen.getAllByText("Forest Sampler").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Ocean Waves")).toBeInTheDocument();
      expect(screen.getByText("Dragon Dreams")).toBeInTheDocument();
      expect(screen.getByLabelText("Remove Forest Sampler")).toBeInTheDocument();
    });
  });

  describe("Shopping-for bar pill styling (UX-06)", () => {
    it("pill elements have rounded-lg class (not rounded-full)", () => {
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
      const { container } = render(<ShoppingCart data={mockData} imageUrls={{}} />);
      const pills = container.querySelectorAll('[class*="bg-selected"]');
      const pill = Array.from(pills).find((el) => el.textContent?.includes("Forest Sampler"));
      expect(pill).toBeTruthy();
      expect(pill?.className).toContain("rounded-lg");
      expect(pill?.className).not.toContain("rounded-full");
    });

    it("pill elements have border and border-selected-border classes", () => {
      localStore["shopping-cart-selected-projects"] = JSON.stringify(["p1"]);
      const { container } = render(<ShoppingCart data={mockData} imageUrls={{}} />);
      const pills = container.querySelectorAll('[class*="bg-selected"]');
      const pill = Array.from(pills).find((el) => el.textContent?.includes("Forest Sampler"));
      expect(pill).toBeTruthy();
      expect(pill?.className).toContain("border");
      expect(pill?.className).toContain("border-selected-border");
    });
  });
});
