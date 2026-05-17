import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth-guard", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockGetCalendarDays = vi.fn();
const mockGetDailyBreakdown = vi.fn();
const mockGetMonthlyTotals = vi.fn();
vi.mock("@/lib/queries/stats", () => ({
  getCalendarDays: (...args: unknown[]) => mockGetCalendarDays(...args),
  getDailyBreakdown: (...args: unknown[]) => mockGetDailyBreakdown(...args),
  getMonthlyTotals: (...args: unknown[]) => mockGetMonthlyTotals(...args),
}));

describe("stats-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: "user-1", email: "test@test.com" });
  });

  describe("fetchCalendarMonth", () => {
    it("calls requireAuth and delegates to getCalendarDays", async () => {
      const mockData = [{ date: "2026-05-10", sessions: [] }];
      mockGetCalendarDays.mockResolvedValue(mockData);

      const { fetchCalendarMonth } = await import("./stats-actions");
      const result = await fetchCalendarMonth(5, 2026);

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockGetCalendarDays).toHaveBeenCalledWith("user-1", 5, 2026);
      expect(result).toEqual(mockData);
    });
  });

  describe("fetchDailyBreakdown", () => {
    it("calls requireAuth and delegates to getDailyBreakdown", async () => {
      const mockData = [{ date: "2026-05-10", projectId: "p1", projectName: "A", stitchCount: 100 }];
      mockGetDailyBreakdown.mockResolvedValue(mockData);

      const { fetchDailyBreakdown } = await import("./stats-actions");
      const result = await fetchDailyBreakdown(5, 2026);

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockGetDailyBreakdown).toHaveBeenCalledWith("user-1", 5, 2026);
      expect(result).toEqual(mockData);
    });
  });

  describe("fetchMonthlyTotals", () => {
    it("calls requireAuth and delegates to getMonthlyTotals", async () => {
      const mockData = [{ month: "Jan", totalStitches: 5000, year: 2026 }];
      mockGetMonthlyTotals.mockResolvedValue(mockData);

      const { fetchMonthlyTotals } = await import("./stats-actions");
      const result = await fetchMonthlyTotals(2026);

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockGetMonthlyTotals).toHaveBeenCalledWith("user-1", 2026);
      expect(result).toEqual(mockData);
    });
  });
});
