import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ProjectSetupSection } from "./project-setup-section";
import {
  createMockFabric,
  createMockFabricBrand,
  createMockStorageLocationWithStats,
  createMockStitchingAppWithStats,
} from "@/__tests__/mocks";
import type { Fabric, FabricBrand } from "@/generated/prisma/client";

// Mock next/link for test environment
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  status: "UNSTARTED" as const,
  storageLocationId: null,
  stitchingAppId: null,
  fabricId: null,
  storageLocations: [],
  stitchingApps: [],
  unassignedFabrics: [] as (Fabric & { brand: FabricBrand })[],
  needsOnionSkinning: false,
  onStatusChange: vi.fn(),
  onStorageLocationChange: vi.fn(),
  onStitchingAppChange: vi.fn(),
  onFabricChange: vi.fn(),
  onOnionSkinningChange: vi.fn(),
};

function buildFabricWithBrand(
  overrides?: Partial<Fabric>,
  brandOverrides?: Partial<FabricBrand>,
): Fabric & { brand: FabricBrand } {
  return {
    ...createMockFabric(overrides),
    brand: createMockFabricBrand(brandOverrides),
  };
}

describe("ProjectSetupSection", () => {
  it("renders storage location dropdown with options from storageLocations prop", () => {
    const storageLocations = [
      createMockStorageLocationWithStats({ id: "sl-1", name: "Bin A" }),
      createMockStorageLocationWithStats({ id: "sl-2", name: "Bin B" }),
    ];

    render(<ProjectSetupSection {...defaultProps} storageLocations={storageLocations} />);

    expect(screen.getByText("Storage Location")).toBeInTheDocument();
    expect(screen.getByText("Select storage location...")).toBeInTheDocument();
  });

  it("renders stitching app dropdown with options from stitchingApps prop", () => {
    const stitchingApps = [
      createMockStitchingAppWithStats({ id: "sa-1", name: "Markup R-XP" }),
      createMockStitchingAppWithStats({ id: "sa-2", name: "Saga" }),
    ];

    render(<ProjectSetupSection {...defaultProps} stitchingApps={stitchingApps} />);

    expect(screen.getByText("Stitching App")).toBeInTheDocument();
    expect(screen.getByText("Select stitching app...")).toBeInTheDocument();
  });

  it("renders fabric dropdown with formatted labels", () => {
    const unassignedFabrics = [
      buildFabricWithBrand(
        { id: "f-1", name: "White Aida", count: 14, type: "Aida" },
        { name: "Zweigart" },
      ),
      buildFabricWithBrand(
        { id: "f-2", name: "Antique White Linen", count: 28, type: "Linen" },
        { name: "Wichelt" },
      ),
    ];

    render(
      <ProjectSetupSection
        {...defaultProps}
        unassignedFabrics={unassignedFabrics}
        fabricId="f-1"
      />,
    );

    // When a fabric is selected, its label should be visible
    expect(screen.getByText("White Aida - 14ct Aida (Zweigart)")).toBeInTheDocument();
  });

  it("fabric dropdown is disabled when unassignedFabrics is empty", () => {
    render(<ProjectSetupSection {...defaultProps} unassignedFabrics={[]} />);

    // The trigger button for the empty fabric dropdown should be disabled
    const fabricTrigger = screen.getByText("No unassigned fabrics").closest("button");
    expect(fabricTrigger).toBeDisabled();
  });

  it("shows 'No unassigned fabrics' placeholder when no fabrics available", () => {
    render(<ProjectSetupSection {...defaultProps} unassignedFabrics={[]} />);

    expect(screen.getByText("No unassigned fabrics")).toBeInTheDocument();
  });

  it("shows helper text with 'Add fabric' link to /fabric when no fabrics available", () => {
    render(<ProjectSetupSection {...defaultProps} unassignedFabrics={[]} />);

    const addLink = screen.getByText("Add fabric");
    expect(addLink).toBeInTheDocument();
    expect(addLink.closest("a")).toHaveAttribute("href", "/fabric");
    expect(screen.getByText(/to assign to this project/)).toBeInTheDocument();
  });

  it("does NOT contain hardcoded DEFAULT_BIN_OPTIONS or DEFAULT_APP_OPTIONS", () => {
    // Render with empty data — should not show any of the old hardcoded options
    render(<ProjectSetupSection {...defaultProps} />);

    expect(screen.queryByText("Bin A")).not.toBeInTheDocument();
    expect(screen.queryByText("Bin B")).not.toBeInTheDocument();
    expect(screen.queryByText("Bin C")).not.toBeInTheDocument();
    expect(screen.queryByText("Bin D")).not.toBeInTheDocument();
    expect(screen.queryByText("MacStitch")).not.toBeInTheDocument();
  });

  it("renders the Needs Onion Skinning checkbox", () => {
    render(<ProjectSetupSection {...defaultProps} needsOnionSkinning={true} />);

    expect(screen.getByText("Needs Onion Skinning")).toBeInTheDocument();
  });

  it("renders Add New option for storage location when onAddStorageLocation is provided", async () => {
    const user = userEvent.setup();
    render(<ProjectSetupSection {...defaultProps} onAddStorageLocation={vi.fn()} />);

    // Open the Storage Location popover by clicking the trigger
    const storageTrigger = screen.getByText("Select storage location...").closest("button")!;
    await user.click(storageTrigger);

    // "Add New" should appear in the dropdown
    expect(screen.getByText("Add New")).toBeInTheDocument();
  });

  it("renders Add New option for stitching app when onAddStitchingApp is provided", async () => {
    const user = userEvent.setup();
    render(<ProjectSetupSection {...defaultProps} onAddStitchingApp={vi.fn()} />);

    // Open the Stitching App popover by clicking the trigger
    const appTrigger = screen.getByText("Select stitching app...").closest("button")!;
    await user.click(appTrigger);

    // "Add New" should appear in the dropdown
    expect(screen.getByText("Add New")).toBeInTheDocument();
  });

  it("does not render Add New for storage when onAddStorageLocation is omitted", async () => {
    const user = userEvent.setup();
    render(<ProjectSetupSection {...defaultProps} />);

    // Open the Storage Location popover
    const storageTrigger = screen.getByText("Select storage location...").closest("button")!;
    await user.click(storageTrigger);

    // "Add New" should NOT appear since onAddStorageLocation is not provided
    expect(screen.queryByText("Add New")).not.toBeInTheDocument();
  });
});
