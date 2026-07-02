import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ChartFormValues } from "./use-chart-form";

// Will import from implementation file once created
// import { saveDraft, loadDraft, clearDraft, DRAFT_KEY } from "./use-draft-persistence";

function createDefaultValues(): ChartFormValues {
  return {
    name: "",
    designerId: null,
    seriesId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    uploadedFiles: [],
    stitchesWide: 0,
    stitchesHigh: 0,
    stitchCount: 0,
    stitchCountApproximate: false,
    genreIds: [],
    isPaperChart: false,
    isFormalKit: false,
    kitColorCount: null,
    isSAL: false,
    notes: "",
    status: "UNSTARTED" as ChartFormValues["status"],
    storageLocationId: null,
    stitchingAppId: null,
    fabricId: null,
    needsOnionSkinning: false,
    startDate: "",
    finishDate: "",
    ffoDate: "",
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
  };
}

function createDraftValues(overrides: Partial<ChartFormValues> = {}): ChartFormValues {
  return {
    ...createDefaultValues(),
    name: "My Test Chart",
    designerId: "designer-1",
    stitchesWide: 150,
    stitchesHigh: 200,
    stitchCount: 30000,
    genreIds: ["genre-1", "genre-2"],
    isPaperChart: true,
    storageLocationId: "storage-1",
    stitchingAppId: "app-1",
    notes: "Test notes",
    ...overrides,
  };
}

const DRAFT_KEY = "chart-draft";

describe("use-draft-persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveDraft", () => {
    it("stores JSON string at key 'chart-draft' in localStorage", async () => {
      const { saveDraft } = await import("./use-draft-persistence");
      const values = createDraftValues();
      saveDraft(values);
      const stored = localStorage.getItem(DRAFT_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(values);
    });

    it("silently fails when localStorage.setItem throws (quota exceeded)", async () => {
      const { saveDraft } = await import("./use-draft-persistence");
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });

      // Should NOT throw
      expect(() => saveDraft(createDraftValues())).not.toThrow();
      setItemSpy.mockRestore();
    });
  });

  describe("loadDraft", () => {
    it("returns null when no draft exists in localStorage", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const result = loadDraft(createDefaultValues(), [], [], []);
      expect(result).toBeNull();
    });

    it("returns parsed ChartFormValues when valid draft exists", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(createDefaultValues(), ["designer-1"], ["storage-1"], ["app-1"]);

      expect(result).not.toBeNull();
      expect(result!.name).toBe("My Test Chart");
      expect(result!.stitchesWide).toBe(150);
      expect(result!.genreIds).toEqual(["genre-1", "genre-2"]);
    });

    it("nulls out designerId when ID is not in validDesignerIds", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues({ designerId: "deleted-designer" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(
        createDefaultValues(),
        ["designer-1", "designer-2"], // does NOT include "deleted-designer"
        ["storage-1"],
        ["app-1"],
      );

      expect(result).not.toBeNull();
      expect(result!.designerId).toBeNull();
    });

    it("nulls out storageLocationId when ID is not in validStorageIds", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues({ storageLocationId: "deleted-storage" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(
        createDefaultValues(),
        ["designer-1"],
        ["storage-1", "storage-2"], // does NOT include "deleted-storage"
        ["app-1"],
      );

      expect(result).not.toBeNull();
      expect(result!.storageLocationId).toBeNull();
    });

    it("nulls out stitchingAppId when ID is not in validAppIds", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues({ stitchingAppId: "deleted-app" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(
        createDefaultValues(),
        ["designer-1"],
        ["storage-1"],
        ["app-1", "app-2"], // does NOT include "deleted-app"
      );

      expect(result).not.toBeNull();
      expect(result!.stitchingAppId).toBeNull();
    });

    it("nulls out fabricId when ID is not in validFabricIds", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues({ fabricId: "deleted-fabric" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(
        createDefaultValues(),
        ["designer-1"],
        ["storage-1"],
        ["app-1"],
        ["fabric-1", "fabric-2"],
      );

      expect(result).not.toBeNull();
      expect(result!.fabricId).toBeNull();
    });

    it("preserves designerId when ID IS in validDesignerIds", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const draft = createDraftValues({ designerId: "designer-1" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraft(
        createDefaultValues(),
        ["designer-1", "designer-2"],
        ["storage-1"],
        ["app-1"],
      );

      expect(result).not.toBeNull();
      expect(result!.designerId).toBe("designer-1");
    });

    it("returns null when localStorage contains invalid JSON", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      localStorage.setItem(DRAFT_KEY, "not valid json {{{");

      const result = loadDraft(createDefaultValues(), [], [], []);
      expect(result).toBeNull();
    });

    it("merges with defaults so a draft missing new fields gets default values", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      // Simulate an old draft that was saved before 'startingStitches' field existed
      const partialDraft = {
        name: "Old Draft",
        designerId: null,
        stitchesWide: 100,
        // Missing many fields that exist in ChartFormValues
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(partialDraft));

      const defaults = createDefaultValues();
      const result = loadDraft(defaults, [], [], []);

      expect(result).not.toBeNull();
      // Overridden fields from draft
      expect(result!.name).toBe("Old Draft");
      expect(result!.stitchesWide).toBe(100);
      // Missing fields from draft get defaults
      expect(result!.startingStitches).toBe(0);
      expect(result!.genreIds).toEqual([]);
      expect(result!.isPaperChart).toBe(false);
      expect(result!.wantToStartNext).toBe(false);
    });

    it("silently returns null when localStorage.getItem throws", async () => {
      const { loadDraft } = await import("./use-draft-persistence");
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("SecurityError");
      });

      const result = loadDraft(createDefaultValues(), [], [], []);
      expect(result).toBeNull();
      getItemSpy.mockRestore();
    });
  });

  describe("clearDraft", () => {
    it("removes 'chart-draft' key from localStorage", async () => {
      const { clearDraft } = await import("./use-draft-persistence");
      localStorage.setItem(DRAFT_KEY, "some-data");
      expect(localStorage.getItem(DRAFT_KEY)).toBe("some-data");

      clearDraft();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("silently fails when localStorage.removeItem throws", async () => {
      const { clearDraft } = await import("./use-draft-persistence");
      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new DOMException("SecurityError");
      });

      expect(() => clearDraft()).not.toThrow();
      removeItemSpy.mockRestore();
    });
  });

  describe("DRAFT_KEY", () => {
    it("exports DRAFT_KEY as 'chart-draft'", async () => {
      const { DRAFT_KEY: key } = await import("./use-draft-persistence");
      expect(key).toBe("chart-draft");
    });
  });

  describe("saveDraftV2", () => {
    it("stores version 2 format with form + supplies + calcParams", async () => {
      const { saveDraftV2 } = await import("./use-draft-persistence");
      const form = createDraftValues();
      const supplies = [
        {
          id: "row-1",
          supplyId: "t1",
          type: "THREAD" as const,
          code: "310",
          name: "Black",
          brandName: "DMC",
          hexColor: "#000000",
          stitchCount: 500,
          need: 2,
          have: 0,
          isNeedOverridden: false,
        },
      ];
      const calcParams = {
        fabricCount: 16,
        strandCount: 2 as const,
        overCount: 1 as const,
        wastePercent: 20,
      };

      saveDraftV2(form, supplies, calcParams);

      const stored = localStorage.getItem(DRAFT_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(2);
      expect(parsed.form).toEqual(form);
      expect(parsed.supplies).toEqual(supplies);
      expect(parsed.calcParams).toEqual(calcParams);
    });
  });

  describe("loadDraftV2", () => {
    it("returns null when no draft exists", async () => {
      const { loadDraftV2 } = await import("./use-draft-persistence");
      const result = loadDraftV2(createDefaultValues(), [], [], []);
      expect(result).toBeNull();
    });

    it("returns DraftV2 shape when v2 draft exists", async () => {
      const { loadDraftV2 } = await import("./use-draft-persistence");
      const form = createDraftValues();
      const supplies = [
        {
          id: "row-1",
          supplyId: "t1",
          type: "THREAD",
          code: "310",
          name: "Black",
          brandName: "DMC",
          hexColor: "#000000",
          stitchCount: 500,
          need: 2,
          have: 0,
          isNeedOverridden: false,
        },
      ];
      const calcParams = { fabricCount: 16, strandCount: 2, overCount: 1, wastePercent: 20 };
      const draft = { version: 2, form, supplies, calcParams };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraftV2(createDefaultValues(), ["designer-1"], ["storage-1"], ["app-1"]);

      expect(result).not.toBeNull();
      expect(result!.form.name).toBe("My Test Chart");
      expect(result!.supplies).toHaveLength(1);
      expect(result!.supplies[0].code).toBe("310");
      expect(result!.calcParams.fabricCount).toBe(16);
    });

    it("handles v1 format (no version field) by wrapping in v2 shape with empty supplies", async () => {
      const { loadDraftV2 } = await import("./use-draft-persistence");
      const v1Draft = createDraftValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(v1Draft));

      const result = loadDraftV2(createDefaultValues(), ["designer-1"], ["storage-1"], ["app-1"]);

      expect(result).not.toBeNull();
      expect(result!.form.name).toBe("My Test Chart");
      expect(result!.supplies).toEqual([]);
      expect(result!.calcParams).toEqual({
        fabricCount: 14,
        strandCount: 2,
        overCount: 1,
        wastePercent: 20,
      });
    });

    it("nulls stale fabricId not in validFabricIds list", async () => {
      const { loadDraftV2 } = await import("./use-draft-persistence");
      const form = createDraftValues({ fabricId: "deleted-fabric" });
      const draft = {
        version: 2,
        form,
        supplies: [],
        calcParams: { fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 },
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      const result = loadDraftV2(
        createDefaultValues(),
        ["designer-1"],
        ["storage-1"],
        ["app-1"],
        ["fabric-1", "fabric-2"],
      );

      expect(result).not.toBeNull();
      expect(result!.form.fabricId).toBeNull();
    });

    it("returns null for invalid JSON", async () => {
      const { loadDraftV2 } = await import("./use-draft-persistence");
      localStorage.setItem(DRAFT_KEY, "not valid json {{{");
      const result = loadDraftV2(createDefaultValues(), [], [], []);
      expect(result).toBeNull();
    });
  });

  describe("clearDraft with v2", () => {
    it("removes storage item regardless of format", async () => {
      const { clearDraft } = await import("./use-draft-persistence");
      const draft = {
        version: 2,
        form: createDraftValues(),
        supplies: [],
        calcParams: { fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 },
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      clearDraft();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });
  });
});
