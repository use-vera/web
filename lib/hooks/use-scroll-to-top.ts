"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";

const DURATION_S = 0.9;
/* easeOutQuart: quick to start, gentle to land. */
const easeOut = (t: number) => 1 - (1 - t) ** 4;

/**
 * Eases the page back to the top. Goes through Lenis when it is running, so
 * Lenis's own idea of the scroll position stays true (setting window.scrollY
 * behind its back makes the next wheel tick jump back). Without Lenis (reduced
 * motion), it jumps straight there.
 */
export const useScrollToTop = () => {
  const lenis = useLenis();

  return useCallback(() => {
    if (lenis) {
      lenis.scrollTo(0, { duration: DURATION_S, easing: easeOut });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [lenis]);
};
