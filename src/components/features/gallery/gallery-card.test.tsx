"use client";

import { render, screen } from "@/__tests__/test-utils";
import { describe, expect, it, vi } from "vitest";
import { GalleryCard } from "./gallery-card";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("GalleryCard", () => {
  describe("WIP card", () => {
    it("renders progress bar with correct width style", () => {
      const card = createMockGalleryCard({
        status: "IN_PROGRESS",
        statusGroup: "wip",
        stitchCount: 50000,
        stitchesCompleted: 15000,
        progressPercent: 30,
        threadColourCount: 42,
      });
      const { container } = render(<GalleryCard card={card} />);
      // Find the progress bar fill element
      const fills = container.querySelectorAll("[style]");
      const progressFill = Array.from(fills).find((el) =>
        (el as HTMLElement).style.width?.includes("30%"),
      );
      expect(progressFill).toBeTruthy();
    });

    it("renders stitch fraction text", () => {
      const card = createMockGalleryCard({
        status: "IN_PROGRESS",
        statusGroup: "wip",
        stitchCount: 50000,
        stitchesCompleted: 15000,
        progressPercent: 30,
        threadColourCount: 42,
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText(/15,000/)).toBeInTheDocument();
      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });

    it("renders supply summary", () => {
      const card = createMockGalleryCard({
        status: "IN_PROGRESS",
        statusGroup: "wip",
        threadColourCount: 42,
        beadTypeCount: 3,
        specialtyItemCount: 0,
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText(/42 colours/)).toBeInTheDocument();
      expect(screen.getByText(/3 bead types/)).toBeInTheDocument();
    });

    it("does not render stitch count line (WIP shows fraction instead)", () => {
      const card = createMockGalleryCard({
        status: "IN_PROGRESS",
        statusGroup: "wip",
        stitchCount: 50000,
        stitchesCompleted: 15000,
        progressPercent: 30,
        threadColourCount: 42,
      });
      render(<GalleryCard card={card} />);
      // WIP cards should NOT show standalone stitch count text
      expect(screen.queryByText("50,000 stitches")).not.toBeInTheDocument();
    });
  });

  describe("Unstarted card", () => {
    it("renders KittingDots (check for Fabric text)", () => {
      const card = createMockGalleryCard({
        status: "UNSTARTED",
        statusGroup: "unstarted",
        fabricStatus: "needed",
        threadStatus: "needed",
        beadsStatus: "needed",
        specialtyStatus: "needed",
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText("Fabric")).toBeInTheDocument();
      expect(screen.getByText("Thread")).toBeInTheDocument();
    });

    it("renders stitch count for unstarted cards", () => {
      const card = createMockGalleryCard({
        status: "UNSTARTED",
        statusGroup: "unstarted",
        stitchCount: 25000,
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText(/25,000 stitches/)).toBeInTheDocument();
    });
  });

  describe("Finished card", () => {
    it("renders celebration border (violet for FINISHED)", () => {
      const card = createMockGalleryCard({
        status: "FINISHED",
        statusGroup: "finished",
        progressPercent: 100,
        finishDate: new Date("2026-03-15T12:00:00"),
      });
      const { container } = render(<GalleryCard card={card} />);
      const cardEl = container.firstChild as HTMLElement;
      expect(cardEl.className).toContain("border-violet-500");
    });

    it("renders 100% progress bar", () => {
      const card = createMockGalleryCard({
        status: "FINISHED",
        statusGroup: "finished",
        progressPercent: 100,
        finishDate: new Date("2026-03-15T12:00:00"),
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("renders finish date with Sparkles icon", () => {
      const card = createMockGalleryCard({
        status: "FINISHED",
        statusGroup: "finished",
        progressPercent: 100,
        finishDate: new Date("2026-03-15T12:00:00"),
      });
      render(<GalleryCard card={card} />);
      // "Finished" appears in both StatusBadge and date label, so use more specific match
      expect(screen.getByText(/Finished Mar/)).toBeInTheDocument();
      expect(screen.getByText(/Mar 15, 2026/)).toBeInTheDocument();
    });
  });

  describe("FFO card", () => {
    it("renders rose celebration border", () => {
      const card = createMockGalleryCard({
        status: "FFO",
        statusGroup: "finished",
        progressPercent: 100,
        ffoDate: new Date("2026-04-01T12:00:00"),
      });
      const { container } = render(<GalleryCard card={card} />);
      const cardEl = container.firstChild as HTMLElement;
      expect(cardEl.className).toContain("border-rose-500");
    });

    it("renders FFO date label", () => {
      const card = createMockGalleryCard({
        status: "FFO",
        statusGroup: "finished",
        progressPercent: 100,
        ffoDate: new Date("2026-04-01T12:00:00"),
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText(/FFO Apr/)).toBeInTheDocument();
      expect(screen.getByText(/Apr 1, 2026/)).toBeInTheDocument();
    });
  });

  describe("Common card elements", () => {
    it("renders project name as Link to /charts/{chartId}", () => {
      const card = createMockGalleryCard({
        chartId: "chart-abc",
        name: "Beautiful Sunset",
      });
      render(<GalleryCard card={card} />);
      const link = screen.getByRole("link", { name: "Beautiful Sunset" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/charts/chart-abc");
    });

    it("renders designer name", () => {
      const card = createMockGalleryCard({
        designerName: "Jane Designer",
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText("Jane Designer")).toBeInTheDocument();
    });

    it("renders genre tags with overflow pill for 5 genres", () => {
      const card = createMockGalleryCard({
        genres: ["Fantasy", "Landscape", "Animals", "Nature", "Flowers"],
      });
      render(<GalleryCard card={card} />);
      expect(screen.getByText("Fantasy")).toBeInTheDocument();
      expect(screen.getByText("Landscape")).toBeInTheDocument();
      expect(screen.getByText("Animals")).toBeInTheDocument();
      expect(screen.queryByText("Nature")).not.toBeInTheDocument();
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("renders CoverPlaceholder when no cover image", () => {
      const card = createMockGalleryCard({ coverImageUrl: null });
      const { container } = render(<GalleryCard card={card} />);
      // CoverPlaceholder has a Scissors icon (svg)
      const coverArea = container.querySelector(".aspect-\\[4\\/3\\]");
      expect(coverArea).toBeInTheDocument();
      const svg = coverArea?.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders img tag when cover image exists", () => {
      const card = createMockGalleryCard({
        coverImageUrl: "https://example.com/image.jpg",
        name: "Test Chart",
      });
      render(<GalleryCard card={card} />);
      const img = screen.getByRole("img", { name: "Test Chart" });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("renders size badge in cover area", () => {
      const card = createMockGalleryCard({ sizeCategory: "BAP" });
      render(<GalleryCard card={card} />);
      expect(screen.getByText("BAP")).toBeInTheDocument();
    });

    it("uses combined transition for shadow and transform (not transition-all)", () => {
      const card = createMockGalleryCard();
      const { container } = render(<GalleryCard card={card} />);
      const cardEl = container.firstChild as HTMLElement;
      expect(cardEl.className).toContain("transition-[box-shadow,transform]");
      expect(cardEl.className).not.toContain("transition-all");
    });

    it("has aspect-[4/3] cover area", () => {
      const card = createMockGalleryCard();
      const { container } = render(<GalleryCard card={card} />);
      const coverArea = container.querySelector(".aspect-\\[4\\/3\\]");
      expect(coverArea).toBeInTheDocument();
    });

    it("non-celebration cards have border-border class", () => {
      const card = createMockGalleryCard({
        status: "UNSTARTED",
        statusGroup: "unstarted",
      });
      const { container } = render(<GalleryCard card={card} />);
      const cardEl = container.firstChild as HTMLElement;
      expect(cardEl.className).toContain("border");
      expect(cardEl.className).toContain("border-border");
    });
  });
});
