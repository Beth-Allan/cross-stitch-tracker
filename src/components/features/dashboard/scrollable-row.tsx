"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Horizontal scroll container with left/right arrow navigation.
 * Arrows appear conditionally based on scroll position.
 */
export function ScrollableRow({ children, className }: ScrollableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    window.addEventListener("resize", updateScrollState);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -300 : 300;
    el.scrollTo({ left: el.scrollLeft + amount, behavior: "smooth" });
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        tabIndex={canScrollLeft ? 0 : -1}
        aria-hidden={!canScrollLeft}
        className={`border-border bg-card hover:bg-muted focus-visible:ring-ring absolute top-1/2 -left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-colors outline-none focus-visible:ring-2 ${
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeft className="text-muted-foreground h-5 w-5" strokeWidth={2} />
      </button>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
        aria-hidden={!canScrollRight}
        className={`border-border bg-card hover:bg-muted focus-visible:ring-ring absolute top-1/2 -right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-colors outline-none focus-visible:ring-2 ${
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronRight className="text-muted-foreground h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}
