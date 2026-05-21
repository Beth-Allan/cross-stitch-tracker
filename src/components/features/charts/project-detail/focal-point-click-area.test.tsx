import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { FocalPointClickArea } from "./focal-point-click-area";

describe("FocalPointClickArea", () => {
  const defaultProps = {
    pendingPoint: null as { x: number; y: number } | null,
    containerSize: { width: 400, height: 300 },
    onImageClick: vi.fn(),
    onKeyDown: vi.fn(),
    onPlace: vi.fn(),
    containerRef: { current: null } as React.RefObject<HTMLDivElement | null>,
  };

  it("renders with absolute inset-0 positioning", () => {
    const { container } = render(<FocalPointClickArea {...defaultProps} />);
    const clickArea = container.firstChild as HTMLElement;
    expect(clickArea.className).toContain("absolute");
    expect(clickArea.className).toContain("inset-0");
  });

  it("renders cursor-crosshair overlay with role='button'", () => {
    render(<FocalPointClickArea {...defaultProps} />);
    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    expect(clickArea).toBeInTheDocument();
    expect(clickArea.className).toContain("cursor-crosshair");
  });

  it("calls onImageClick when clicked", () => {
    const onImageClick = vi.fn();
    render(<FocalPointClickArea {...defaultProps} onImageClick={onImageClick} />);
    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    fireEvent.click(clickArea);
    expect(onImageClick).toHaveBeenCalled();
  });

  it("renders FocalPointMarker when pendingPoint is set and containerSize is non-zero", () => {
    const { container } = render(
      <FocalPointClickArea
        {...defaultProps}
        pendingPoint={{ x: 0.5, y: 0.5 }}
        containerSize={{ width: 400, height: 300 }}
      />,
    );
    // FocalPointMarker renders an aria-hidden div with absolute positioning
    const marker = container.querySelector("[aria-hidden='true']");
    expect(marker).toBeInTheDocument();
  });

  it("does not render marker when containerSize width is 0", () => {
    const { container } = render(
      <FocalPointClickArea
        {...defaultProps}
        pendingPoint={{ x: 0.5, y: 0.5 }}
        containerSize={{ width: 0, height: 0 }}
      />,
    );
    const marker = container.querySelector("[aria-hidden='true']");
    expect(marker).not.toBeInTheDocument();
  });

  it("calls onPlace when Enter is pressed for keyboard focal point placement", () => {
    const onPlace = vi.fn();
    render(<FocalPointClickArea {...defaultProps} onPlace={onPlace} />);
    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    fireEvent.keyDown(clickArea, { key: "Enter" });
    expect(onPlace).toHaveBeenCalledOnce();
  });

  it("calls onPlace when Space is pressed for keyboard focal point placement", () => {
    const onPlace = vi.fn();
    render(<FocalPointClickArea {...defaultProps} onPlace={onPlace} />);
    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    fireEvent.keyDown(clickArea, { key: " " });
    expect(onPlace).toHaveBeenCalledOnce();
  });

  it("delegates non-activation keys to onKeyDown without calling onPlace", () => {
    const onKeyDown = vi.fn();
    const onPlace = vi.fn();
    render(<FocalPointClickArea {...defaultProps} onKeyDown={onKeyDown} onPlace={onPlace} />);
    const clickArea = screen.getByRole("button", { name: /click to place focal point/i });
    fireEvent.keyDown(clickArea, { key: "Escape" });
    expect(onKeyDown).toHaveBeenCalled();
    expect(onPlace).not.toHaveBeenCalled();
  });
});
