import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format-file-size";

describe("formatFileSize", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("returns '1.0 KB' for 1024 bytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("returns '1.0 MB' for 1048576 bytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
  });

  it("returns '5.0 MB' for 5242880 bytes", () => {
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });

  it("returns '500 B' for 500 bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("returns '1.5 KB' for 1536 bytes", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});
