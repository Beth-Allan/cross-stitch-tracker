import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

describe("designer-actions error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDesigners returns empty array and logs on Prisma error", async () => {
    const { getDesigners } = await import("./designer-actions");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.designer.findMany.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await getDesigners();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("getDesigners error:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
