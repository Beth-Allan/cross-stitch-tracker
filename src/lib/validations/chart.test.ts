import { describe, expect, it } from "vitest";
import { chartFormSchema, batchSupplySchema } from "./chart";
import { PROJECT_STATUSES } from "@/lib/utils/status";
import { assertSuccess } from "@/__tests__/mocks";

const validChartBase = {
  name: "Test Chart",
  designerId: null,
  stitchCount: 5000,
  stitchCountApproximate: false,
  stitchesWide: 100,
  stitchesHigh: 50,
  genreIds: [],
  isPaperChart: false,
  isFormalKit: false,
  isSAL: false,
  kitColorCount: null,
  notes: null,
};

const validProject = {
  status: "UNSTARTED",
  storageLocationId: null,
  stitchingAppId: null,
  needsOnionSkinning: false,
  startDate: null,
  finishDate: null,
  ffoDate: null,
  wantToStartNext: false,
  preferredStartSeason: null,
  startingStitches: 0,
};

describe("chartFormSchema", () => {
  describe("R2 storage key fields (coverImageUrl, coverThumbnailUrl, digitalFileUrl)", () => {
    it("accepts R2 storage keys (not URLs) for image/file fields", () => {
      const result = chartFormSchema.safeParse({
        chart: {
          ...validChartBase,
          coverImageUrl: "covers/abc/xyz-photo.jpg",
          coverThumbnailUrl: "covers/abc/thumb-xyz.webp",
          digitalFileUrl: "files/abc/pattern.pdf",
        },
        project: validProject,
      });

      expect(result.success).toBe(true);
    });

    it("accepts null for image/file fields", () => {
      const result = chartFormSchema.safeParse({
        chart: {
          ...validChartBase,
          coverImageUrl: null,
          coverThumbnailUrl: null,
          digitalFileUrl: null,
        },
        project: validProject,
      });

      expect(result.success).toBe(true);
    });

    it("rejects empty string for image/file fields", () => {
      const result = chartFormSchema.safeParse({
        chart: {
          ...validChartBase,
          coverImageUrl: "",
          coverThumbnailUrl: "",
          digitalFileUrl: "",
        },
        project: validProject,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("project FK fields (storageLocationId, stitchingAppId, fabricId)", () => {
    it("accepts null storageLocationId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, storageLocationId: null },
      });
      expect(result.success).toBe(true);
    });

    it("accepts a string storageLocationId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, storageLocationId: "loc-123" },
      });
      assertSuccess(result);
      expect(result.data.project.storageLocationId).toBe("loc-123");
    });

    it("accepts null stitchingAppId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, stitchingAppId: null },
      });
      expect(result.success).toBe(true);
    });

    it("accepts a string stitchingAppId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, stitchingAppId: "app-456" },
      });
      assertSuccess(result);
      expect(result.data.project.stitchingAppId).toBe("app-456");
    });

    it("accepts null fabricId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, fabricId: null },
      });
      expect(result.success).toBe(true);
    });

    it("accepts a string fabricId", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, fabricId: "fab-789" },
      });
      assertSuccess(result);
      expect(result.data.project.fabricId).toBe("fab-789");
    });

    it("does NOT have projectBin field in project schema", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, projectBin: "Bin A" },
      });
      assertSuccess(result);
      expect(result.data.project).not.toHaveProperty("projectBin");
    });

    it("does NOT have ipadApp field in project schema", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, ipadApp: "Saga" },
      });
      assertSuccess(result);
      expect(result.data.project).not.toHaveProperty("ipadApp");
    });
  });

  describe("status enum derived from PROJECT_STATUSES", () => {
    it("accepts all PROJECT_STATUSES values", () => {
      for (const status of PROJECT_STATUSES) {
        const result = chartFormSchema.safeParse({
          chart: validChartBase,
          project: { ...validProject, status },
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid status values", () => {
      const result = chartFormSchema.safeParse({
        chart: validChartBase,
        project: { ...validProject, status: "INVALID_STATUS" },
      });

      expect(result.success).toBe(false);
    });
  });
});

describe("batchSupplySchema", () => {
  it("validates correct input with threads, beads, and specialty arrays", () => {
    const result = batchSupplySchema.safeParse({
      threads: [
        { supplyId: "t1", stitchCount: 500, need: 2, isNeedOverridden: false },
        { supplyId: "t2", stitchCount: 100, need: 1, isNeedOverridden: true },
      ],
      beads: [{ supplyId: "b1", need: 1 }],
      specialty: [{ supplyId: "s1", need: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty supplyId strings", () => {
    const result = batchSupplySchema.safeParse({
      threads: [{ supplyId: "", stitchCount: 100, need: 1, isNeedOverridden: false }],
      beads: [],
      specialty: [],
    });
    expect(result.success).toBe(false);
  });

  it("enforces max 500 items per type", () => {
    const tooManyThreads = Array.from({ length: 501 }, (_, i) => ({
      supplyId: `t-${i}`,
      stitchCount: 100,
      need: 1,
      isNeedOverridden: false,
    }));
    const result = batchSupplySchema.safeParse({
      threads: tooManyThreads,
      beads: [],
      specialty: [],
    });
    expect(result.success).toBe(false);
  });

  it("allows empty arrays (no supplies is valid)", () => {
    const result = batchSupplySchema.safeParse({
      threads: [],
      beads: [],
      specialty: [],
    });
    expect(result.success).toBe(true);
  });

  it("defaults missing arrays to empty", () => {
    const result = batchSupplySchema.safeParse({});
    assertSuccess(result);
    expect(result.data.threads).toEqual([]);
    expect(result.data.beads).toEqual([]);
    expect(result.data.specialty).toEqual([]);
  });

  it("rejects need < 1 for threads", () => {
    const result = batchSupplySchema.safeParse({
      threads: [{ supplyId: "t1", stitchCount: 100, need: 0, isNeedOverridden: false }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stitchCount for threads", () => {
    const result = batchSupplySchema.safeParse({
      threads: [{ supplyId: "t1", stitchCount: -1, need: 1, isNeedOverridden: false }],
    });
    expect(result.success).toBe(false);
  });
});
