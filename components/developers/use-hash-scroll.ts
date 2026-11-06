"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Room above a heading once it lands: the sticky phone bar below lg, a little air above it on a desk. */
const offsetFor = () => (window.matchMedia("(min-width: 1024px)").matches ? -24 : -88);

/**
 * Makes `#section` links work in the portal.
 *
 * The page scrolls through Lenis, which keeps its own target: a jump Next
 * makes behind its back gets dragged straight back, and on a route change the
 * site-wide scroll-to-top runs after Next has already jumped to the anchor.
 * So the anchor is scrolled to through Lenis, once on arrival (after the
 * scroll-to-top) and on every same-page hash link click.
 */
export const useHashScroll = () => {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      const target = id ? document.getElementById(id) : null;

      if (!target) {
        return;
      }

      if (lenis) {
        lenis.scrollTo(target, { offset: offsetFor() });
        return;
      }

      /* No Lenis (reduced motion): the browser's own jump honours scroll-margin. */
      target.scrollIntoView();
    };

    /* After this route's scroll-to-top, which runs in a parent effect. */
    const arrival = window.setTimeout(() => scrollToHash(window.location.hash), 60);

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
        return;
      }

      /* Let Next update the URL first, then scroll on top of whatever it did. */
      window.setTimeout(() => scrollToHash(url.hash), 0);
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.clearTimeout(arrival);
      document.removeEventListener("click", handleClick);
    };
  }, [lenis, pathname]);
};
