import { describe, expect, it } from "vitest";
import { coverNeedsOptimizing } from "./cover-keys";

/**
 * The test is the row, never the key's spelling: an optimized cover is one whose
 * *both* keys sit in the chart's own namespace, because that is what
 * `processAndStoreImage` writes and nothing else can produce. Matching on the
 * `opt-` prefix would call any file that happened to be named that way done.
 */
describe("coverNeedsOptimizing", () => {
  it("says no when both keys are in the chart's own namespace", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "covers/chart-1/opt-abc.webp",
        coverThumbnailUrl: "covers/chart-1/thumb-abc.webp",
      }),
    ).toBe(false);
  });

  it("says yes for a cover still on the pre-save prefix", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "covers/unsaved/xyz-phone-photo.jpg",
        coverThumbnailUrl: "covers/unsaved/thumb-xyz-phone-photo.webp",
      }),
    ).toBe(true);
  });

  it("says yes when the cover is converted but the thumbnail is still the old one", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "covers/chart-1/opt-abc.webp",
        coverThumbnailUrl: "covers/unsaved/thumb-xyz.webp",
      }),
    ).toBe(true);
  });

  it("says yes when the row names a cover but no thumbnail", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "covers/chart-1/opt-abc.webp",
        coverThumbnailUrl: null,
      }),
    ).toBe(true);
  });

  it("says yes when the cover belongs to another chart's namespace", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "covers/chart-2/opt-abc.webp",
        coverThumbnailUrl: "covers/chart-2/thumb-abc.webp",
      }),
    ).toBe(true);
  });

  it("says yes for a key this app's grammar does not recognise, so it is reported rather than skipped", () => {
    expect(
      coverNeedsOptimizing({
        id: "chart-1",
        coverImageUrl: "https://example.com/legacy-cover.jpg",
        coverThumbnailUrl: null,
      }),
    ).toBe(true);
  });

  it("says no when there is no cover to convert", () => {
    expect(
      coverNeedsOptimizing({ id: "chart-1", coverImageUrl: null, coverThumbnailUrl: null }),
    ).toBe(false);
  });
});
