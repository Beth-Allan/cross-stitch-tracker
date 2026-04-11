import { describe, expect, it } from "vitest";
import { chartFormSchema } from "./chart";
import { PROJECT_STATUSES } from "@/lib/utils/status";

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
  projectBin: null,
  ipadApp: null,
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
