import { renderHook, act } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useChartForm } from "./use-chart-form";
import { createMockDesigner, createMockGenre } from "@/__tests__/mocks";
import { createStorageLocation } from "@/lib/actions/storage-location-actions";
import { createStitchingApp } from "@/lib/actions/stitching-app-actions";

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
});
