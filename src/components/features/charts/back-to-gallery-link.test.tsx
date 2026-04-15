import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { BackToGalleryLink } from "./back-to-gallery-link";

const VIEW_STORAGE_KEY = "gallery-view-mode";

describe("BackToGalleryLink", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders href as "/charts?view=table" when localStorage has "table"', () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "table");
    render(<BackToGalleryLink />);

    const link = screen.getByRole("link", { name: /projects/i });
    expect(link).toHaveAttribute("href", "/charts?view=table");
  });

  it('renders href as "/charts?view=list" when localStorage has "list"', () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "list");
    render(<BackToGalleryLink />);

    const link = screen.getByRole("link", { name: /projects/i });
    expect(link).toHaveAttribute("href", "/charts?view=list");
  });

  it('renders href as "/charts" when localStorage is empty', () => {
    render(<BackToGalleryLink />);

    const link = screen.getByRole("link", { name: /projects/i });
    expect(link).toHaveAttribute("href", "/charts");
  });

  it('renders href as "/charts" when localStorage has "gallery" (default)', () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "gallery");
    render(<BackToGalleryLink />);

    const link = screen.getByRole("link", { name: /projects/i });
    expect(link).toHaveAttribute("href", "/charts");
  });

  it('renders href as "/charts" when localStorage has an invalid value', () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "invalid");
    render(<BackToGalleryLink />);

    const link = screen.getByRole("link", { name: /projects/i });
    expect(link).toHaveAttribute("href", "/charts");
  });
});
