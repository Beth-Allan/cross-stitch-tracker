import { describe, it, expect, vi } from "vitest";
import { createMockPrisma, mockTransaction } from "./factories";

describe("createMockPrisma", () => {
  describe("$transaction default behavior", () => {
    it("executes callback with mockPrisma and returns its result", async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.chart.findMany.mockResolvedValueOnce([{ id: "chart-1" }]);

      const result = await mockPrisma.$transaction(async (tx: typeof mockPrisma) => {
        return tx.chart.findMany();
      });

      expect(result).toEqual([{ id: "chart-1" }]);
      expect(mockPrisma.chart.findMany).toHaveBeenCalledTimes(1);
    });

    it("resolves array of promises with Promise.all", async () => {
      const mockPrisma = createMockPrisma();

      const result = await mockPrisma.$transaction([
        Promise.resolve("a"),
        Promise.resolve("b"),
        Promise.resolve("c"),
      ]);

      expect(result).toEqual(["a", "b", "c"]);
    });
  });
});

describe("mockTransaction", () => {
  it("overrides $transaction for one call with custom tx-client methods", async () => {
    const mockPrisma = createMockPrisma();
    const customCreate = vi.fn().mockResolvedValue({ id: "new-thread" });

    mockTransaction(mockPrisma, {
      thread: { create: customCreate },
    });

    const result = await mockPrisma.$transaction(
      async (tx: { thread: { create: typeof customCreate } }) => {
        return tx.thread.create({ data: { name: "test" } });
      },
    );

    expect(result).toEqual({ id: "new-thread" });
    expect(customCreate).toHaveBeenCalledWith({ data: { name: "test" } });
  });

  it("reverts to default behavior after mockTransaction is consumed", async () => {
    const mockPrisma = createMockPrisma();
    const customCreate = vi.fn().mockResolvedValue({ id: "new-thread" });

    mockTransaction(mockPrisma, {
      thread: { create: customCreate },
    });

    // First call uses the override
    await mockPrisma.$transaction(async (tx: { thread: { create: typeof customCreate } }) => {
      return tx.thread.create({ data: { name: "test" } });
    });

    // Second call should use the default (passes mockPrisma as tx)
    mockPrisma.chart.findMany.mockResolvedValueOnce([{ id: "chart-1" }]);
    const result = await mockPrisma.$transaction(async (tx: typeof mockPrisma) => {
      return tx.chart.findMany();
    });

    expect(result).toEqual([{ id: "chart-1" }]);
  });
});
