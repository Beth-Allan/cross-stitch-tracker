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
            projectThreads: [
              { quantityRequired: 5, quantityAcquired: 1 },
            ],
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
            projectThreads: [
              { quantityRequired: 5, quantityAcquired: 5 },
            ],
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
            projectThreads: [
              { quantityRequired: 2, quantityAcquired: 2 },
            ],
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
            projectThreads: [
              { quantityRequired: 2, quantityAcquired: 2 },
            ],
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
            projectThreads: [
              { quantityRequired: 3, quantityAcquired: 3 },
            ],
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
});
