import { describe, expect, it } from "vitest";
import { STATUS_CONFIG, PROJECT_STATUSES } from "./status";

describe("STATUS_CONFIG", () => {
  it("bgClass contains CSS variable reference for every status", () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_CONFIG[status].bgClass).toMatch(/var\(--status-/);
    }
  });

  it("dotClass contains CSS variable reference for every status", () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_CONFIG[status].dotClass).toMatch(/var\(--status-/);
    }
  });

  it("textClass contains CSS variable reference for every status", () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_CONFIG[status].textClass).toMatch(/var\(--status-/);
    }
  });

  it("no STATUS_CONFIG entry contains 'dark:' prefix in any class field", () => {
    for (const status of PROJECT_STATUSES) {
      const config = STATUS_CONFIG[status];
      expect(config.bgClass).not.toMatch(/dark:/);
      expect(config.dotClass).not.toMatch(/dark:/);
      expect(config.textClass).not.toMatch(/dark:/);
    }
  });

  it("STATUS_CONFIG type does not include darkBgClass field", () => {
    for (const status of PROJECT_STATUSES) {
      const config = STATUS_CONFIG[status];
      expect(config).not.toHaveProperty("darkBgClass");
    }
  });
});
