import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockProjectForNeeds,
  createMockThreadLine,
} from "@/__tests__/mocks";
import type { Prisma } from "@/generated/prisma/client";
import { reworkCalculatedNeeds } from "./thread-need-rework";

const mockPrisma = createMockPrisma();
const tx = mockPrisma as unknown as Prisma.TransactionClient;

const LINE = createMockProjectForNeeds().projectThreads[0];

describe("reworkCalculatedNeeds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("works a calculated line out at the linked fabric's count", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProjectForNeeds({ fabric: { count: 18 } }),
    );

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-1"] } },
      data: { quantityRequired: 10 },
    });
  });

  it("works a line out at the default count when no fabric is linked", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProjectForNeeds({ projectThreads: [{ ...LINE, quantityRequired: 10 }] }),
    );

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-1"] } },
      data: { quantityRequired: 13 },
    });
  });

  it("reads the project's own strands, over-count and waste", async () => {
    // 20,000 stitches × 3 strands × 1.5 waste / ((28 / 2) × 273 usable inches) = 23.55…
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProjectForNeeds({
        strandCount: 3,
        overCount: 2,
        wastePercent: 50,
        fabric: { count: 28 },
      }),
    );

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-1"] } },
      data: { quantityRequired: 24 },
    });
  });

  it("reads only lines with a stitch count that are not marked as typed", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(createMockProjectForNeeds());

    await reworkCalculatedNeeds(tx, "proj-1");

    const query = mockPrisma.project.findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ id: "proj-1" });
    expect(query.select.projectThreads.where).toEqual({
      isNeedOverridden: false,
      stitchCount: { gt: 0 },
    });
  });

  it("writes nothing for a line already on its figure", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(createMockProjectForNeeds());

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).not.toHaveBeenCalled();
  });

  it("leaves a line the calculator cannot read as it is, never turning it unknown", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProjectForNeeds({
        fabric: { count: 18 },
        projectThreads: [
          {
            ...LINE,
            quantityRequired: 4,
            thread: { line: createMockThreadLine({ skeinLengthMm: null }) },
          },
        ],
      }),
    );

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).not.toHaveBeenCalled();
  });

  it("writes lines reaching the same figure together, one write per figure", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(
      createMockProjectForNeeds({
        fabric: { count: 18 },
        projectThreads: [
          LINE,
          { ...LINE, id: "pt-2" },
          { ...LINE, id: "pt-3", stitchCount: 40000, quantityRequired: 26 },
        ],
      }),
    );

    await reworkCalculatedNeeds(tx, "proj-1");

    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledTimes(2);
    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-1", "pt-2"] } },
      data: { quantityRequired: 10 },
    });
    expect(mockPrisma.projectThread.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["pt-3"] } },
      data: { quantityRequired: 20 },
    });
  });

  it("does nothing for a project that is not there", async () => {
    mockPrisma.project.findUnique.mockResolvedValueOnce(null);

    await reworkCalculatedNeeds(tx, "gone");

    expect(mockPrisma.projectThread.updateMany).not.toHaveBeenCalled();
  });
});
