import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import type { StorageGroup } from "@/types/session";
import { StorageViewTab } from "./storage-view-tab";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeGroup(overrides: Partial<StorageGroup> = {}): StorageGroup {
  return {
    locationId: "loc-1",
    locationName: "Craft Room",
    items: [
      {
        type: "project",
        id: "chart-1",
        name: "Mountain Sunset",
        coverThumbnailUrl: null,
        status: "IN_PROGRESS",
      },
    ],
    ...overrides,
  };
}

describe("StorageViewTab", () => {
  it("renders location groups with header showing location name", () => {
    const groups = [makeGroup()];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    expect(screen.getByText("Craft Room")).toBeInTheDocument();
  });

  it("groups are collapsible (click to toggle)", () => {
    const groups = [makeGroup()];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    // Item is visible initially (expanded by default)
    expect(screen.getByText("Mountain Sunset")).toBeInTheDocument();

    // Click header to collapse
    fireEvent.click(screen.getByText("Craft Room"));

    // Item should be hidden
    expect(screen.queryByText("Mountain Sunset")).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(screen.getByText("Craft Room"));
    expect(screen.getByText("Mountain Sunset")).toBeInTheDocument();
  });

  it("project items show status badge", () => {
    const groups = [makeGroup()];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    // StatusBadge renders the status label
    expect(screen.getByText("Stitching")).toBeInTheDocument();
  });

  it("fabric items show Layers icon", () => {
    const groups = [
      makeGroup({
        items: [
          {
            type: "fabric",
            id: "fab-1",
            name: "White Aida 14ct",
            coverThumbnailUrl: null,
            fabricCount: 14,
            brandName: "DMC",
          },
        ],
      }),
    ];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    expect(screen.getByTestId("layers-icon-fab-1")).toBeInTheDocument();
  });

  it("count text shows correct numbers with dot separator", () => {
    const groups = [
      makeGroup({
        locationId: "loc-1",
        locationName: "Craft Room",
        items: [
          { type: "project", id: "c1", name: "Pattern A", coverThumbnailUrl: null, status: "UNSTARTED" },
          { type: "fabric", id: "f1", name: "Fabric A", coverThumbnailUrl: null, fabricCount: 14, brandName: "DMC" },
        ],
      }),
      makeGroup({
        locationId: "loc-2",
        locationName: "Closet",
        items: [
          { type: "project", id: "c2", name: "Pattern B", coverThumbnailUrl: null, status: "KITTED" },
        ],
      }),
    ];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    // 2 locations, 3 items
    expect(screen.getByText(/2 locations/)).toBeInTheDocument();
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<StorageViewTab groups={[]} imageUrls={{}} />);

    expect(
      screen.getByText(/No storage locations set up yet/),
    ).toBeInTheDocument();
  });

  it("project items link to /charts/{id}", () => {
    const groups = [makeGroup()];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    const link = screen.getByRole("link", { name: "Mountain Sunset" });
    expect(link).toHaveAttribute("href", "/charts/chart-1");
  });

  it("singular text for 1 location and 1 item", () => {
    const groups = [
      makeGroup({
        items: [
          { type: "project", id: "c1", name: "Solo", coverThumbnailUrl: null, status: "UNSTARTED" },
        ],
      }),
    ];
    render(<StorageViewTab groups={groups} imageUrls={{}} />);

    expect(screen.getByText(/1 location/)).toBeInTheDocument();
    expect(screen.getByText(/1 item(?!s)/)).toBeInTheDocument();
  });
});
