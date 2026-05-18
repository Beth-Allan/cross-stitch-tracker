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
  PersonalBestRecord,
  RecordType,
  FastestCompletion,
  SizeCategory,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
  CompletionEstimate,
  BrokenRecord,
  BrokenRecordType,
  AvailableYearsData,
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

describe("Records & Insights Types", () => {
  describe("PersonalBestRecord", () => {
    it("has type, label, value, unit, date, projectId, chartId, projectName fields", () => {
      const record: PersonalBestRecord = {
        type: "bestDay" as RecordType,
        label: "Best Day",
        value: 500,
        unit: "stitches",
        date: "2026-05-17",
        projectId: "p1",
        chartId: "c1",
        projectName: "Test Project",
      };
      expect(record.type).toBe("bestDay");
      expect(record.label).toBe("Best Day");
      expect(record.value).toBe(500);
      expect(record.unit).toBe("stitches");
      expect(record.date).toBe("2026-05-17");
      expect(record.projectId).toBe("p1");
      expect(record.chartId).toBe("c1");
      expect(record.projectName).toBe("Test Project");
    });

    it("allows null for date, projectId, chartId, projectName (current streak)", () => {
      const record: PersonalBestRecord = {
        type: "currentStreak" as RecordType,
        label: "Current Streak",
        value: 5,
        unit: "days",
        date: null,
        projectId: null,
        chartId: null,
        projectName: null,
      };
      expect(record.date).toBeNull();
      expect(record.projectId).toBeNull();
      expect(record.chartId).toBeNull();
      expect(record.projectName).toBeNull();
    });
  });

  describe("FastestCompletion", () => {
    it("has sizeCategory, daysToComplete, projectId, chartId, projectName, startDate, finishDate fields", () => {
      const item: FastestCompletion = {
        sizeCategory: "Medium" as SizeCategory,
        daysToComplete: 45,
        projectId: "p1",
        chartId: "c1",
        projectName: "Test Project",
        startDate: "2026-01-01",
        finishDate: "2026-02-14",
      };
      expect(item.sizeCategory).toBe("Medium");
      expect(item.daysToComplete).toBe(45);
      expect(item.projectId).toBe("p1");
      expect(item.chartId).toBe("c1");
      expect(item.projectName).toBe("Test Project");
      expect(item.startDate).toBe("2026-01-01");
      expect(item.finishDate).toBe("2026-02-14");
    });
  });

  describe("ThreadInsight", () => {
    it("has threadId, brandName, colorCode, colorName, hexColor, projectCount fields", () => {
      const item: ThreadInsight = {
        threadId: "t1",
        brandName: "DMC",
        colorCode: "310",
        colorName: "Black",
        hexColor: "#000000",
        projectCount: 12,
      };
      expect(item.threadId).toBe("t1");
      expect(item.brandName).toBe("DMC");
      expect(item.colorCode).toBe("310");
      expect(item.colorName).toBe("Black");
      expect(item.hexColor).toBe("#000000");
      expect(item.projectCount).toBe(12);
    });
  });

  describe("DesignerInsight", () => {
    it("has designerId, name, totalProjects, completedProjects, completionRate fields", () => {
      const item: DesignerInsight = {
        designerId: "d1",
        name: "Test Designer",
        totalProjects: 17,
        completedProjects: 14,
        completionRate: 82,
      };
      expect(item.designerId).toBe("d1");
      expect(item.name).toBe("Test Designer");
      expect(item.totalProjects).toBe(17);
      expect(item.completedProjects).toBe(14);
      expect(item.completionRate).toBe(82);
    });
  });

  describe("GenreInsight", () => {
    it("has genreId, name, totalStitches fields", () => {
      const item: GenreInsight = {
        genreId: "g1",
        name: "Samplers",
        totalStitches: 150000,
      };
      expect(item.genreId).toBe("g1");
      expect(item.name).toBe("Samplers");
      expect(item.totalStitches).toBe(150000);
    });
  });

  describe("CompletionEstimate", () => {
    it("has projectId, chartId, projectName, stitchesCompleted, totalStitches, percentComplete, estimatedDate, avgPerDay fields", () => {
      const item: CompletionEstimate = {
        projectId: "p1",
        chartId: "c1",
        projectName: "Big Project",
        stitchesCompleted: 25000,
        totalStitches: 50000,
        percentComplete: 50,
        estimatedDate: "~Aug 2027",
        avgPerDay: 120.5,
      };
      expect(item.projectId).toBe("p1");
      expect(item.chartId).toBe("c1");
      expect(item.projectName).toBe("Big Project");
      expect(item.stitchesCompleted).toBe(25000);
      expect(item.totalStitches).toBe(50000);
      expect(item.percentComplete).toBe(50);
      expect(item.estimatedDate).toBe("~Aug 2027");
      expect(item.avgPerDay).toBe(120.5);
    });
  });

  describe("BrokenRecord", () => {
    it("has type, label, oldValue, newValue, unit fields", () => {
      const item: BrokenRecord = {
        type: "bestDay" as BrokenRecordType,
        label: "Best Day",
        oldValue: 300,
        newValue: 500,
        unit: "stitches",
      };
      expect(item.type).toBe("bestDay");
      expect(item.label).toBe("Best Day");
      expect(item.oldValue).toBe(300);
      expect(item.newValue).toBe(500);
      expect(item.unit).toBe("stitches");
    });
  });

  describe("AvailableYearsData", () => {
    it("has years (number[]) field", () => {
      const item: AvailableYearsData = {
        years: [2026, 2025],
      };
      expect(item.years).toEqual([2026, 2025]);
    });
  });
});
