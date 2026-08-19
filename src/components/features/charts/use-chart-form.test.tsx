import { renderHook, act } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useChartForm } from "./use-chart-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";
import { createStorageLocation } from "@/lib/actions/storage-location-actions";
import { createStitchingApp } from "@/lib/actions/stitching-app-actions";
import { createSeries } from "@/lib/actions/series-actions";
import { createChart } from "@/lib/actions/chart-actions";

// Mock all server actions the hook imports
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: vi.fn(),
  updateChart: vi.fn(),
}));
vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
}));
vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
}));
vi.mock("@/lib/actions/storage-location-actions", () => ({
  createStorageLocation: vi.fn(),
}));
vi.mock("@/lib/actions/stitching-app-actions", () => ({
  createStitchingApp: vi.fn(),
}));
vi.mock("@/lib/actions/series-actions", () => ({
  createSeries: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

const defaultProps = {
  mode: "create" as const,
  designers: [createMockDesigner()],
  genres: [createMockGenre()],
  storageLocations: [],
  stitchingApps: [],
  onSuccess: vi.fn(),
};

describe("useChartForm inline entity creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleAddStorageLocation", () => {
    it("creates storage location and selects it when name is provided", async () => {
      (createStorageLocation as Mock).mockResolvedValue({
        success: true,
        location: { id: "sl-new", name: "Bin A", description: null },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStorageLocation("Bin A");
      });

      expect(createStorageLocation).toHaveBeenCalledWith({ name: "Bin A" });
      expect(result.current.values.storageLocationId).toBe("sl-new");
      expect(result.current.storageLocationsList).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "sl-new", name: "Bin A" })]),
      );
    });

    it("trims whitespace from name before creating", async () => {
      (createStorageLocation as Mock).mockResolvedValue({
        success: true,
        location: { id: "sl-new", name: "Bin A", description: null },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStorageLocation("  Bin A  ");
      });

      expect(createStorageLocation).toHaveBeenCalledWith({ name: "Bin A" });
    });

    it("does not call server action when name is empty (dialog handles this case)", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStorageLocation("");
      });

      expect(createStorageLocation).not.toHaveBeenCalled();
    });

    it("does not call server action when name is whitespace only", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStorageLocation("   ");
      });

      expect(createStorageLocation).not.toHaveBeenCalled();
    });

    it("handles server action failure gracefully", async () => {
      (createStorageLocation as Mock).mockResolvedValue({
        success: false,
        error: "Already exists",
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await expect(
        act(async () => {
          await result.current.handleAddStorageLocation("Duplicate");
        }),
      ).rejects.toThrow("Already exists");
    });
  });

  describe("handleAddStitchingApp", () => {
    it("creates stitching app and selects it when name is provided", async () => {
      (createStitchingApp as Mock).mockResolvedValue({
        success: true,
        app: { id: "sa-new", name: "Pattern Keeper", description: null },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStitchingApp("Pattern Keeper");
      });

      expect(createStitchingApp).toHaveBeenCalledWith({ name: "Pattern Keeper" });
      expect(result.current.values.stitchingAppId).toBe("sa-new");
      expect(result.current.stitchingAppsList).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "sa-new", name: "Pattern Keeper" })]),
      );
    });

    it("does not call server action when name is empty (dialog handles this case)", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStitchingApp("");
      });

      expect(createStitchingApp).not.toHaveBeenCalled();
    });

    it("does not call server action when name is whitespace only", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddStitchingApp("   ");
      });

      expect(createStitchingApp).not.toHaveBeenCalled();
    });
  });

  describe("handleAddSeries", () => {
    it("creates series and selects it on success", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: true,
        series: {
          id: "series-new",
          name: "Test Series",
          totalCount: null,
          designerId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddSeries("Test Series");
      });

      expect(createSeries).toHaveBeenCalledWith({ name: "Test Series", designerId: null });
      expect(result.current.values.seriesId).toBe("series-new");
      expect(result.current.seriesList).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "series-new", name: "Test Series" }),
        ]),
      );
    });

    it("passes current designerId to createSeries (auto-populate)", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: true,
        series: {
          id: "series-new",
          name: "Designer Series",
          totalCount: null,
          designerId: "des-1",
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        result.current.setField("designerId", "des-1");
      });

      await act(async () => {
        await result.current.handleAddSeries("Designer Series");
      });

      expect(createSeries).toHaveBeenCalledWith({
        name: "Designer Series",
        designerId: "des-1",
      });
    });

    it("carries the created series' designer name into the series list", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: true,
        series: {
          id: "series-new",
          name: "Designer Series",
          totalCount: null,
          designerId: "des-1",
          designerName: "Mirabilia",
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        result.current.setField("designerId", "des-1");
      });

      await act(async () => {
        await result.current.handleAddSeries("Designer Series");
      });

      expect(result.current.seriesList).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "series-new", designerName: "Mirabilia" }),
        ]),
      );
    });

    it("carries a null designer name when the series has no designer", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: true,
        series: {
          id: "series-new",
          name: "No Designer Series",
          totalCount: null,
          designerId: null,
          designerName: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddSeries("No Designer Series");
      });

      expect(result.current.seriesList).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "series-new", designerName: null })]),
      );
    });

    it("throws on server error", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: false,
        error: "Already exists",
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await expect(
        act(async () => {
          await result.current.handleAddSeries("Duplicate");
        }),
      ).rejects.toThrow("Already exists");
    });

    it("does not call server action when name is empty", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddSeries("");
      });

      expect(createSeries).not.toHaveBeenCalled();
    });

    it("does not call server action when name is whitespace only", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddSeries("   ");
      });

      expect(createSeries).not.toHaveBeenCalled();
    });

    it("passes designerId: null when no designer selected", async () => {
      (createSeries as Mock).mockResolvedValue({
        success: true,
        series: {
          id: "series-new",
          name: "No Designer Series",
          totalCount: null,
          designerId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const { result } = renderHook(() => useChartForm(defaultProps));

      await act(async () => {
        await result.current.handleAddSeries("No Designer Series");
      });

      expect(createSeries).toHaveBeenCalledWith({
        name: "No Designer Series",
        designerId: null,
      });
    });
  });

  describe("validation errors", () => {
    it("names the empty chart name rather than the raw Zod path", async () => {
      const onValidationError = vi.fn();
      const { result } = renderHook(() => useChartForm({ ...defaultProps, onValidationError }));

      await act(async () => {
        await result.current.submitForm();
      });

      expect(result.current.errors["chart.name"]).toBe("Chart name is required");
      expect(onValidationError).toHaveBeenCalled();
      expect(createChart).not.toHaveBeenCalled();
    });

    it("falls back to a generic message for a path with no friendly wording", async () => {
      const { result } = renderHook(() => useChartForm(defaultProps));

      act(() => {
        result.current.setField("name", "Autumn Sampler");
        result.current.setField("stitchCount", 5000);
        result.current.setField("notes", "x".repeat(5001));
      });

      await act(async () => {
        await result.current.submitForm();
      });

      expect(result.current.errors["chart.notes"]).toBe("This field has an error");
      expect(createChart).not.toHaveBeenCalled();
    });
  });
});
