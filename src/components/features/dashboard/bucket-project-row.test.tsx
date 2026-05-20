import { describe, expect, it } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { BucketProjectRow } from "./bucket-project-row";
import type { BucketProject } from "@/types/dashboard";

const baseBucketProject: BucketProject = {
  projectId: "proj-1",
  chartId: "chart-1",
  projectName: "Summer Garden",
  designerName: "Designer A",
  coverThumbnailUrl: null,
  status: "WIP",
  progressPercent: 45,
  totalStitches: 10000,
  stitchesCompleted: 4500,
  lastSessionDate: new Date("2026-05-15"),
  stitchingDays: 12,
  focalPointX: null,
  focalPointY: null,
};

describe("BucketProjectRow", () => {
  describe("focal point styling (UX-09)", () => {
    it("applies objectPosition style when focalPointX/Y are provided", () => {
      const project: BucketProject = {
        ...baseBucketProject,
        coverThumbnailUrl: "https://example.com/cover.jpg",
        focalPointX: 0.3,
        focalPointY: 0.7,
      };

      render(<BucketProjectRow project={project} imageUrl="https://example.com/cover.jpg" bucketId="25-50" />);

      const img = screen.getByAltText("Summer Garden");
      expect(img.style.objectPosition).toBe("30% 70%");
    });

    it("does not apply objectPosition style when focalPointX/Y are null", () => {
      const project: BucketProject = {
        ...baseBucketProject,
        coverThumbnailUrl: "https://example.com/cover.jpg",
        focalPointX: null,
        focalPointY: null,
      };

      render(<BucketProjectRow project={project} imageUrl="https://example.com/cover.jpg" bucketId="25-50" />);

      const img = screen.getByAltText("Summer Garden");
      expect(img.style.objectPosition).toBe("");
    });
  });

  it("renders project name", () => {
    render(<BucketProjectRow project={baseBucketProject} imageUrl={null} bucketId="25-50" />);
    expect(screen.getByText("Summer Garden")).toBeInTheDocument();
  });

  it("shows cover placeholder when no image URL", () => {
    render(<BucketProjectRow project={baseBucketProject} imageUrl={null} bucketId="25-50" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
