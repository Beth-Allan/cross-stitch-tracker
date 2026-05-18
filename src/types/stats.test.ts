import { describe, expect, it } from "vitest";
import type {
  MonthlyTotal,
  CalendarDayData,
  CalendarSession,
  SessionHistoryData,
  SessionHistoryItem,
  PaceMetricsData,
  DayOfWeekData,
  DailyBreakdownEntry,
} from "./stats";

describe("Activity Visualization Types", () => {
  describe("MonthlyTotal", () => {
    it("has month (string), totalStitches (number), year (number) fields", () => {
      const item: MonthlyTotal = {
        month: "Jan",
        totalStitches: 5000,
        year: 2026,
      };
      expect(item.month).toBe("Jan");
      expect(item.totalStitches).toBe(5000);
      expect(item.year).toBe(2026);
    });
  });

  describe("CalendarDayData", () => {
    it("has date (string) and sessions (CalendarSession[]) fields", () => {
      const item: CalendarDayData = {
        date: "2026-05-17",
        sessions: [{ projectId: "p1", chartId: "c1", projectName: "Test", stitchCount: 100 }],
      };
      expect(item.date).toBe("2026-05-17");
      expect(item.sessions).toHaveLength(1);
    });
  });

  describe("CalendarSession", () => {
    it("has projectId (string), projectName (string), stitchCount (number) fields", () => {
      const item: CalendarSession = {
        projectId: "p1",
        chartId: "c1",
        projectName: "My Project",
        stitchCount: 200,
      };
      expect(item.projectId).toBe("p1");
      expect(item.projectName).toBe("My Project");
      expect(item.stitchCount).toBe(200);
    });
  });

  describe("SessionHistoryData", () => {
    it("has sessions, total, page, pageSize, totalPages fields", () => {
      const item: SessionHistoryData = {
        sessions: [],
        total: 100,
        page: 1,
        pageSize: 25,
        totalPages: 4,
      };
      expect(item.sessions).toEqual([]);
      expect(item.total).toBe(100);
      expect(item.page).toBe(1);
      expect(item.pageSize).toBe(25);
      expect(item.totalPages).toBe(4);
    });
  });

  describe("SessionHistoryItem", () => {
    it("has id, date, projectId, projectName, stitchCount, timeSpentMinutes (nullable), hasPhoto fields", () => {
      const item: SessionHistoryItem = {
        id: "s1",
        date: new Date("2026-05-17"),
        projectId: "p1",
        chartId: "c1",
        projectName: "Test",
        stitchCount: 150,
        timeSpentMinutes: null,
        hasPhoto: false,
      };
      expect(item.id).toBe("s1");
      expect(item.date).toBeInstanceOf(Date);
      expect(item.projectId).toBe("p1");
      expect(item.projectName).toBe("Test");
      expect(item.stitchCount).toBe(150);
      expect(item.timeSpentMinutes).toBeNull();
      expect(item.hasPhoto).toBe(false);
    });
  });

  describe("PaceMetricsData", () => {
    it("has avg7Day, avg30Day, avg90Day, thisMonthStitches, lastMonthStitches, stitchRate (nullable), stitchRatePrior (nullable) fields", () => {
      const item: PaceMetricsData = {
        avg7Day: 142,
        avg30Day: 120,
        avg90Day: 110,
        thisMonthStitches: 3600,
        lastMonthStitches: 3200,
        stitchRate: 85,
        stitchRatePrior: null,
      };
      expect(item.avg7Day).toBe(142);
      expect(item.avg30Day).toBe(120);
      expect(item.avg90Day).toBe(110);
      expect(item.thisMonthStitches).toBe(3600);
      expect(item.lastMonthStitches).toBe(3200);
      expect(item.stitchRate).toBe(85);
      expect(item.stitchRatePrior).toBeNull();
    });
  });

  describe("DayOfWeekData", () => {
    it("has dayOfWeek (string), avgStitches (number) fields", () => {
      const item: DayOfWeekData = {
        dayOfWeek: "Mon",
        avgStitches: 250,
      };
      expect(item.dayOfWeek).toBe("Mon");
      expect(item.avgStitches).toBe(250);
    });
  });

  describe("DailyBreakdownEntry", () => {
    it("has date (string), projectId (string), projectName (string), stitchCount (number) fields", () => {
      const item: DailyBreakdownEntry = {
        date: "2026-05-17",
        projectId: "p1",
        chartId: "c1",
        projectName: "My Project",
        stitchCount: 300,
      };
      expect(item.date).toBe("2026-05-17");
      expect(item.projectId).toBe("p1");
      expect(item.projectName).toBe("My Project");
      expect(item.stitchCount).toBe(300);
    });
  });
});
