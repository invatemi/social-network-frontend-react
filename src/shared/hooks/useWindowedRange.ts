import { useEffect, useState, type RefObject } from "react";

export type WindowedRange = {
  start: number;
  end: number;
  topSpacer: number;
  bottomSpacer: number;
};

type ScrollRoot = "self" | "window";

/**
 * Scroll-based windowing without extra deps.
 * Uses estimated row height + overscan; pair with content-visibility CSS.
 */
export const useWindowedRange = (
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  estimateSize: number,
  overscan = 8,
  scrollRoot: ScrollRoot = "self"
): WindowedRange => {
  const [range, setRange] = useState<WindowedRange>(() => ({
    start: 0,
    end: itemCount,
    topSpacer: 0,
    bottomSpacer: 0,
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el || itemCount === 0 || estimateSize <= 0) {
      setRange({
        start: 0,
        end: itemCount,
        topSpacer: 0,
        bottomSpacer: 0,
      });
      return;
    }

    const update = () => {
      let scrollTop: number;
      let viewport: number;

      if (scrollRoot === "window") {
        const rect = el.getBoundingClientRect();
        viewport = window.innerHeight || estimateSize * 10;
        // Distance from top of list to top of viewport
        scrollTop = Math.max(0, -rect.top);
      } else {
        scrollTop = el.scrollTop;
        viewport = el.clientHeight || estimateSize * 10;
      }

      const start = Math.max(
        0,
        Math.floor(scrollTop / estimateSize) - overscan
      );
      const end = Math.min(
        itemCount,
        Math.ceil((scrollTop + viewport) / estimateSize) + overscan
      );
      setRange({
        start,
        end,
        topSpacer: start * estimateSize,
        bottomSpacer: Math.max(0, (itemCount - end) * estimateSize),
      });
    };

    update();

    if (scrollRoot === "window") {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        ro.disconnect();
      };
    }

    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [containerRef, itemCount, estimateSize, overscan, scrollRoot]);

  return range;
};
