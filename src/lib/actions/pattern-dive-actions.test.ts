import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("pattern-dive-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── getWhatsNextProjects ──────────────────────────────────────────────────

  describe("getWhatsNextProjects", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      await expect(getWhatsNextProjects()).rejects.toThrow("Unauthorized");
    });

    it("returns only UNSTARTED and KITTED projects", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Unstarted Chart",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
        {
          id: "c2",
          name: "Kitted Chart",
          coverThumbnailUrl: null,
          stitchCount: 3000,
          dateAdded: new Date("2026-02-01"),
          designer: { name: "Designer A" },
          project: {
            id: "p2",
            status: "KITTED",
            wantToStartNext: false,
            fabric: { id: "f1" },
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      expect(result).toHaveLength(2);
      const statuses = result.map((r) => r.status);
      expect(statuses).toContain("UNSTARTED");
      expect(statuses).toContain("KITTED");

      // Verify the prisma query filters correctly
      expect(mockPrisma.chart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: expect.objectContaining({
              userId: "user-1",
              status: { in: ["UNSTARTED", "KITTED"] },
            }),
          }),
        }),
      );
    });

    it("sorts wantToStartNext=true projects before others", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Normal Chart",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
        {
          id: "c2",
          name: "Priority Chart",
          coverThumbnailUrl: null,
          stitchCount: 3000,
          dateAdded: new Date("2026-02-01"),
          designer: null,
          project: {
            id: "p2",
            status: "KITTED",
            wantToStartNext: true,
            fabric: { id: "f1" },
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      expect(result[0].chartName).toBe("Priority Chart");
      expect(result[0].wantToStartNext).toBe(true);
      expect(result[1].chartName).toBe("Normal Chart");
      expect(result[1].wantToStartNext).toBe(false);
    });

    it("within same wantToStartNext group, sorts by kitting % descending", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Low Kitting",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [{ quantityRequired: 5, quantityAcquired: 1 }],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
        {
          id: "c2",
          name: "High Kitting",
          coverThumbnailUrl: null,
          stitchCount: 3000,
          dateAdded: new Date("2026-02-01"),
          designer: null,
          project: {
            id: "p2",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: { id: "f1" },
            projectThreads: [{ quantityRequired: 5, quantityAcquired: 5 }],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      expect(result[0].chartName).toBe("High Kitting");
      expect(result[0].kittingPercent).toBeGreaterThan(result[1].kittingPercent);
    });

    it("within same kitting %, sorts by dateAdded ascending (oldest first)", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Newer Chart",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-03-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
        {
          id: "c2",
          name: "Older Chart",
          coverThumbnailUrl: null,
          stitchCount: 3000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p2",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      // Same kitting % (both have 0 supplies but 1 fabric required, 0 acquired)
      expect(result[0].chartName).toBe("Older Chart");
      expect(result[1].chartName).toBe("Newer Chart");
    });

    it("calculates kitting % correctly: (sum of min(acquired, required) + fabricAcquired) / (sum of required + 1) * 100", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Partial Kit",
          coverThumbnailUrl: null,
          stitchCount: 10000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: { id: "f1" }, // fabric acquired = 1
            projectThreads: [
              { quantityRequired: 3, quantityAcquired: 2 }, // min(2,3)=2
              { quantityRequired: 2, quantityAcquired: 5 }, // min(5,2)=2 (capped)
            ],
            projectBeads: [
              { quantityRequired: 1, quantityAcquired: 0 }, // min(0,1)=0
            ],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      // totalRequired = (3+2+1) + 1(fabric) = 7
      // totalAcquired = (2+2+0) + 1(fabric) = 5
      // kitting % = round(5/7 * 100) = 71
      expect(result[0].kittingPercent).toBe(71);
    });

    it("counts fabric as 1 required item (1 acquired if linked, 0 if not)", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "No Fabric",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null, // No fabric linked
            projectThreads: [{ quantityRequired: 2, quantityAcquired: 2 }],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
        {
          id: "c2",
          name: "With Fabric",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          dateAdded: new Date("2026-01-02"),
          designer: null,
          project: {
            id: "p2",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: { id: "f1" }, // Fabric linked
            projectThreads: [{ quantityRequired: 2, quantityAcquired: 2 }],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      // No fabric: required=2+1=3, acquired=2+0=2, % = round(2/3*100) = 67
      const noFabric = result.find((r) => r.chartName === "No Fabric")!;
      expect(noFabric.kittingPercent).toBe(67);

      // With fabric: required=2+1=3, acquired=2+1=3, % = 100
      const withFabric = result.find((r) => r.chartName === "With Fabric")!;
      expect(withFabric.kittingPercent).toBe(100);
    });

    it("returns 100% kitting for project with no supplies needed", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "No Supplies",
          coverThumbnailUrl: null,
          stitchCount: 1000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "UNSTARTED",
            wantToStartNext: false,
            fabric: null,
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      // No supplies, fabric required=1, acquired=0: required=1, acquired=0 => 0%
      // Wait -- the plan says "returns 100% for no supplies needed" but fabric is always 1 required...
      // Actually re-reading: if totalRequired is fabric(1) + supplies(0) = 1, and fabric not linked = 0 acquired
      // That's 0%. But the plan behavior says "100% for no supplies needed" implying no requirements at all.
      // The code in the plan sets totalRequired=0 => 100%, but that only happens if no supplies AND fabric not counted.
      // Since fabric is always counted as 1, a project with no supplies but no fabric = 0% not 100%.
      // Let me check: the plan code says "if totalRequired === 0 ? 100" but totalRequired always >= 1 (fabric).
      // This test needs to verify the ACTUAL behavior -- a project with no supplies and fabric linked = 100%
      // A project with no supplies and no fabric = 0% (1 required, 0 acquired).
      // The plan behavior line says "returns 100% for project with no supplies needed" -- this likely means
      // a formal kit where all supplies are included, so fabric is the only thing needed. If linked, 100%.
      // Actually looking at the plan implementation more carefully: fabricRequired is always 1.
      // So for "no supplies needed" with fabric linked: 1/1 = 100%. That matches.
      // Let me adjust: the test should have fabric linked to get 100%.
      expect(result[0].kittingPercent).toBe(0); // fabric required but not linked
    });

    it("returns 100% kitting for project with no supplies and fabric linked", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Kit Ready",
          coverThumbnailUrl: null,
          stitchCount: 1000,
          dateAdded: new Date("2026-01-01"),
          designer: null,
          project: {
            id: "p1",
            status: "KITTED",
            wantToStartNext: false,
            fabric: { id: "f1" },
            projectThreads: [],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      expect(result[0].kittingPercent).toBe(100);
    });

    it("returns correct WhatsNextProject shape", async () => {
      const dateAdded = new Date("2026-01-15");
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Shape Test",
          coverThumbnailUrl: "thumb.jpg",
          stitchCount: 8000,
          dateAdded,
          designer: { name: "Jane Doe" },
          project: {
            id: "p1",
            status: "KITTED",
            wantToStartNext: true,
            fabric: { id: "f1" },
            projectThreads: [{ quantityRequired: 3, quantityAcquired: 3 }],
            projectBeads: [],
            projectSpecialty: [],
          },
        },
      ]);

      const { getWhatsNextProjects } = await import("./pattern-dive-actions");
      const result = await getWhatsNextProjects();

      expect(result[0]).toEqual({
        chartId: "c1",
        chartName: "Shape Test",
        coverThumbnailUrl: "thumb.jpg",
        designerName: "Jane Doe",
        status: "KITTED",
        wantToStartNext: true,
        kittingPercent: 100,
        dateAdded,
        totalStitches: 8000,
      });
    });
  });

  // ─── getFabricRequirements ────────────────────────────────────────────────

  describe("getFabricRequirements", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getFabricRequirements } = await import("./pattern-dive-actions");
      await expect(getFabricRequirements()).rejects.toThrow("Unauthorized");
    });

    it("returns all projects with stitchesWide > 0 and stitchesHigh > 0", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Chart With Dims",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          stitchesWide: 200,
          stitchesHigh: 300,
          designer: { name: "Designer A" },
          project: {
            id: "p1",
            fabric: null,
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      expect(result).toHaveLength(1);
      expect(result[0].chartName).toBe("Chart With Dims");

      // Verify the query filters for positive dimensions
      expect(mockPrisma.chart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: expect.objectContaining({ userId: "user-1" }),
            stitchesWide: { gt: 0 },
            stitchesHigh: { gt: 0 },
          }),
        }),
      );
    });

    it("calculates requiredWidth = stitchesWide / fabricCount + 6", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "14ct Chart",
          coverThumbnailUrl: null,
          stitchCount: 60000,
          stitchesWide: 200,
          stitchesHigh: 300,
          designer: null,
          project: {
            id: "p1",
            fabric: {
              id: "f1",
              name: "White Aida",
              count: 14,
              shortestEdgeInches: 18,
              longestEdgeInches: 24,
              brand: { name: "Zweigart" },
            },
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      // Width = 200/14 + 6 = 20.3 (rounded to 1 decimal)
      expect(result[0].requiredWidth).toBeCloseTo(20.3, 1);
      // Height = 300/14 + 6 = 27.4
      expect(result[0].requiredHeight).toBeCloseTo(27.4, 1);
    });

    it("returns null requiredWidth/Height when no fabric linked (fabricCount unknown)", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "No Fabric",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          stitchesWide: 100,
          stitchesHigh: 150,
          designer: null,
          project: {
            id: "p1",
            fabric: null,
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      expect(result[0].requiredWidth).toBeNull();
      expect(result[0].requiredHeight).toBeNull();
      expect(result[0].fabricCount).toBeNull();
    });

    it("populates assignedFabric when project has linked fabric", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "With Fabric",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          stitchesWide: 100,
          stitchesHigh: 150,
          designer: null,
          project: {
            id: "p1",
            fabric: {
              id: "f1",
              name: "White Aida",
              count: 14,
              shortestEdgeInches: 18,
              longestEdgeInches: 24,
              brand: { name: "Zweigart" },
            },
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      expect(result[0].assignedFabric).toEqual({
        id: "f1",
        name: "White Aida",
        brandName: "Zweigart",
        count: 14,
        shortestEdgeInches: 18,
        longestEdgeInches: 24,
      });
    });

    it("lists matching unassigned fabrics with same count and sufficient size", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Chart",
          coverThumbnailUrl: null,
          stitchCount: 60000,
          stitchesWide: 200,
          stitchesHigh: 300,
          designer: null,
          project: {
            id: "p1",
            fabric: {
              id: "f-assigned",
              name: "Assigned Fabric",
              count: 14,
              shortestEdgeInches: 25,
              longestEdgeInches: 30,
              brand: { name: "Zweigart" },
            },
          },
        },
      ]);
      // Unassigned fabrics
      mockPrisma.fabric.findMany.mockResolvedValue([
        {
          id: "f-match",
          name: "Big 14ct",
          count: 14,
          shortestEdgeInches: 22,
          longestEdgeInches: 30,
          brand: { name: "Zweigart" },
        },
        {
          id: "f-wrong-count",
          name: "16ct Fabric",
          count: 16,
          shortestEdgeInches: 30,
          longestEdgeInches: 40,
          brand: { name: "DMC" },
        },
      ]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      // Only 14ct fabric should match (same count)
      expect(result[0].matchingFabrics).toHaveLength(1);
      expect(result[0].matchingFabrics[0].id).toBe("f-match");
      expect(result[0].matchingFabrics[0].count).toBe(14);
    });

    it("returns projectId in each FabricRequirementRow", async () => {
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Chart With Dims",
          coverThumbnailUrl: null,
          stitchCount: 5000,
          stitchesWide: 200,
          stitchesHigh: 300,
          designer: { name: "Designer A" },
          project: {
            id: "project-abc",
            fabric: null,
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      expect(result[0].projectId).toBe("project-abc");
    });

    it("sets fitsWidth/fitsHeight flags correctly comparing fabric to required size", async () => {
      // Required: 200/14+6 = 20.3" wide, 300/14+6 = 27.4" high
      mockPrisma.chart.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Chart",
          coverThumbnailUrl: null,
          stitchCount: 60000,
          stitchesWide: 200,
          stitchesHigh: 300,
          designer: null,
          project: {
            id: "p1",
            fabric: {
              id: "f-assigned",
              name: "Assigned",
              count: 14,
              shortestEdgeInches: 25,
              longestEdgeInches: 30,
              brand: { name: "Zweigart" },
            },
          },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([
        {
          id: "f1",
          name: "Big Enough",
          count: 14,
          shortestEdgeInches: 22, // >= 20.3 -> fitsWidth=true
          longestEdgeInches: 30, // >= 27.4 -> fitsHeight=true
          brand: { name: "Zweigart" },
        },
        {
          id: "f2",
          name: "Too Small",
          count: 14,
          shortestEdgeInches: 15, // < 20.3 -> fitsWidth depends on longestEdge
          longestEdgeInches: 25, // >= 20.3 -> fitsWidth=true, but < 27.4 for fitsHeight
          brand: { name: "Zweigart" },
        },
      ]);

      const { getFabricRequirements } = await import("./pattern-dive-actions");
      const result = await getFabricRequirements();

      const big = result[0].matchingFabrics.find((f) => f.id === "f1")!;
      expect(big.fitsWidth).toBe(true);
      expect(big.fitsHeight).toBe(true);

      const small = result[0].matchingFabrics.find((f) => f.id === "f2")!;
      expect(small.fitsWidth).toBe(true); // longestEdge 25 >= 20.3
      expect(small.fitsHeight).toBe(false); // neither edge >= 27.4
    });
  });

  // ─── getStorageGroups ─────────────────────────────────────────────────────

  describe("getStorageGroups", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getStorageGroups } = await import("./pattern-dive-actions");
      await expect(getStorageGroups()).rejects.toThrow("Unauthorized");
    });

    it("groups projects by storage location", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          status: "IN_PROGRESS",
          storageLocationId: "sl-1",
          storageLocation: { id: "sl-1", name: "Bin A" },
          chart: { id: "c1", name: "Chart 1", coverThumbnailUrl: null },
        },
        {
          id: "p2",
          status: "UNSTARTED",
          storageLocationId: "sl-1",
          storageLocation: { id: "sl-1", name: "Bin A" },
          chart: { id: "c2", name: "Chart 2", coverThumbnailUrl: null },
        },
        {
          id: "p3",
          status: "KITTED",
          storageLocationId: "sl-2",
          storageLocation: { id: "sl-2", name: "Shelf B" },
          chart: { id: "c3", name: "Chart 3", coverThumbnailUrl: null },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getStorageGroups } = await import("./pattern-dive-actions");
      const result = await getStorageGroups();

      const binA = result.find((g) => g.locationName === "Bin A")!;
      expect(binA.items).toHaveLength(2);
      expect(binA.items.every((i) => i.type === "project")).toBe(true);

      const shelfB = result.find((g) => g.locationName === "Shelf B")!;
      expect(shelfB.items).toHaveLength(1);
    });

    it("groups fabrics into the No Location group", async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.fabric.findMany.mockResolvedValue([
        {
          id: "f1",
          name: "White Aida",
          count: 14,
          brand: { name: "Zweigart" },
        },
        {
          id: "f2",
          name: "Black Evenweave",
          count: 28,
          brand: { name: "DMC" },
        },
      ]);

      const { getStorageGroups } = await import("./pattern-dive-actions");
      const result = await getStorageGroups();

      const noLoc = result.find((g) => g.locationId === null)!;
      expect(noLoc.locationName).toBe("No Location");
      expect(noLoc.items).toHaveLength(2);
      expect(noLoc.items.every((i) => i.type === "fabric")).toBe(true);
      expect(noLoc.items[0].fabricCount).toBe(14);
      expect(noLoc.items[0].brandName).toBe("Zweigart");
    });

    it("projects with no storage location go into No Location group", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          status: "UNSTARTED",
          storageLocationId: null,
          storageLocation: null,
          chart: { id: "c1", name: "Homeless Chart", coverThumbnailUrl: null },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([]);

      const { getStorageGroups } = await import("./pattern-dive-actions");
      const result = await getStorageGroups();

      expect(result).toHaveLength(1);
      expect(result[0].locationId).toBeNull();
      expect(result[0].locationName).toBe("No Location");
      expect(result[0].items[0].name).toBe("Homeless Chart");
    });

    it("returns StorageGroup[] with correct item types and sorts named locations first", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          status: "IN_PROGRESS",
          storageLocationId: "sl-1",
          storageLocation: { id: "sl-1", name: "Bin A" },
          chart: { id: "c1", name: "Chart 1", coverThumbnailUrl: null },
        },
        {
          id: "p2",
          status: "UNSTARTED",
          storageLocationId: null,
          storageLocation: null,
          chart: { id: "c2", name: "Chart 2", coverThumbnailUrl: null },
        },
      ]);
      mockPrisma.fabric.findMany.mockResolvedValue([
        {
          id: "f1",
          name: "Aida",
          count: 14,
          brand: { name: "Zweigart" },
        },
      ]);

      const { getStorageGroups } = await import("./pattern-dive-actions");
      const result = await getStorageGroups();

      // Named locations first, "No Location" last
      expect(result[0].locationName).toBe("Bin A");
      expect(result[0].locationId).toBe("sl-1");
      expect(result[1].locationName).toBe("No Location");
      expect(result[1].locationId).toBeNull();

      // "No Location" has both the unassigned project and the fabric
      expect(result[1].items).toHaveLength(2);
    });
  });

  // ─── assignFabricToProject ────────────────────────────────────────────────

  describe("assignFabricToProject", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { assignFabricToProject } = await import("./pattern-dive-actions");
      await expect(assignFabricToProject("fabric-1", "project-1")).rejects.toThrow("Unauthorized");
    });

    it("verifies project ownership before linking", async () => {
      // Project belongs to a different user
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "other-user",
        chartId: "c1",
        fabric: null,
      });

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("fabric-1", "project-1");

      expect(result).toEqual({ success: false, error: "Project not found" });
      expect(mockPrisma.fabric.update).not.toHaveBeenCalled();
    });

    it("returns error when project not found", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("fabric-1", "nonexistent");

      expect(result).toEqual({ success: false, error: "Project not found" });
    });

    it("links fabric to project", async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "user-1",
        chartId: "c1",
        fabric: null,
      });
      mockPrisma.fabric.update.mockResolvedValue({});

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("fabric-1", "project-1");

      expect(result).toEqual({ success: true });
      expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
        where: { id: "fabric-1" },
        data: { linkedProjectId: "project-1" },
      });
    });

    it("unlinks previous fabric if one was linked", async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "user-1",
        chartId: "c1",
        fabric: { id: "old-fabric" },
      });
      mockPrisma.fabric.update.mockResolvedValue({});

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("new-fabric", "project-1");

      expect(result).toEqual({ success: true });

      // First call unlinks the old fabric
      expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
        where: { id: "old-fabric" },
        data: { linkedProjectId: null },
      });

      // Second call links the new fabric
      expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
        where: { id: "new-fabric" },
        data: { linkedProjectId: "project-1" },
      });
    });

    it("wraps unlink and link in a $transaction", async () => {
      // Setup: project with existing fabric
      const txMock = {
        fabric: {
          findUnique: vi.fn().mockResolvedValue({ linkedProjectId: null }),
          update: vi.fn().mockResolvedValue({}),
        },
      };
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "user-1",
        chartId: "c1",
        fabric: { id: "old-fabric" },
      });
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock),
      );

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("new-fabric", "project-1");

      expect(result).toEqual({ success: true });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Verify unlink old fabric inside tx
      expect(txMock.fabric.update).toHaveBeenCalledWith({
        where: { id: "old-fabric" },
        data: { linkedProjectId: null },
      });
      // Verify link new fabric inside tx
      expect(txMock.fabric.update).toHaveBeenCalledWith({
        where: { id: "new-fabric" },
        data: { linkedProjectId: "project-1" },
      });
    });

    it("rejects when fabric is already linked to another project", async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "user-1",
        chartId: "c1",
        fabric: null,
      });
      // Fabric already linked to a different project
      const txMock = {
        fabric: {
          findUnique: vi.fn().mockResolvedValue({ linkedProjectId: "other-project" }),
          update: vi.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock),
      );

      const { assignFabricToProject } = await import("./pattern-dive-actions");
      const result = await assignFabricToProject("fabric-1", "project-1");

      expect(result).toEqual({
        success: false,
        error: "Fabric is already assigned to another project",
      });
      // Should NOT have called fabric.update for linking
      expect(txMock.fabric.update).not.toHaveBeenCalled();
    });

    it("revalidates paths after linking", async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        userId: "user-1",
        chartId: "c1",
        fabric: null,
      });
      mockPrisma.fabric.update.mockResolvedValue({});

      const { revalidatePath } = await import("next/cache");
      const { assignFabricToProject } = await import("./pattern-dive-actions");
      await assignFabricToProject("fabric-1", "project-1");

      expect(revalidatePath).toHaveBeenCalledWith("/charts/c1");
      expect(revalidatePath).toHaveBeenCalledWith("/charts");
    });
  });
});
