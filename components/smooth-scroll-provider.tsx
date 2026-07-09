"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (callback: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

/**
 * Lenis's own `autoRaf` drives its requestAnimationFrame loop by having
 * each frame reschedule the next one at the *end* of the callback — so any
 * uncaught error thrown mid-frame (anywhere in a "scroll" listener) skips
 * that reschedule and permanently kills scrolling for the rest of the page
 * session; only a hard refresh recreates the Lenis instance and recovers.
 * We disable `autoRaf` and drive the loop ourselves with a try/catch, so a
 * single bad frame can never take scrolling down with it.
 */
const LenisRafDriver = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    let frameId: number;

    const loop = (time: number) => {
      try {
        lenis.raf(time);
      } catch (error) {
        console.error("Lenis frame failed, continuing without it", error);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [lenis]);

  return null;
};

/**
 * base-ui's modal scroll lock (used by every Dialog/Popover/etc — sign-in,
 * event details, revoke/upgrade confirms, all of them) directly writes
 * `html`/`body` overflow and, on close, restores `html.scrollTop` by
 * assigning the DOM property straight (see
 * @base-ui/utils/useScrollLock's preventScrollInsetScrollbars). Lenis
 * ignores that restore if it still believes it's mid-animation
 * (`isScrolling === "smooth"`), so its internal animatedScroll/targetScroll
 * stay stale while the *real* scroll position just changed under it — the
 * next wheel tick then scrolls from the stale value, which reads as the
 * page "jumping" or refusing to scroll past some point until a refresh.
 * base-ui marks the lock with `data-base-ui-scroll-locked` on <html>, so we
 * watch that attribute: stop Lenis while locked, and restart it (which
 * resyncs animatedScroll/targetScroll to the real position) once unlocked.
 */
const LenisScrollLockSync = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    const html = document.documentElement;
    const sync = () => {
      if (html.hasAttribute("data-base-ui-scroll-locked")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-base-ui-scroll-locked"],
    });

    return () => observer.disconnect();
  }, [lenis]);

  return null;
};

/**
 * Lenis auto-recalculates its scroll limit via a ResizeObserver on
 * `document.documentElement`, but that observer does not reliably fire when
 * content grows purely via overflow (e.g. a React Query fetch resolving
 * after first paint and mounting a full grid of cards) — the limit stays
 * pinned to whatever height existed at construction time. Confirmed via a
 * direct Lenis scroll-event trace on /events: `limit` stuck at the
 * pre-fetch height for the entire session, clamping every wheel scroll well
 * short of the real (much taller) bottom. A MutationObserver on the whole
 * document body is a more reliable trigger — it fires on any DOM node
 * add/remove regardless of *why* the page grew, so this covers async data,
 * image loads, accordions, route changes, all of it. rAF-scheduled so a
 * burst of mutations (e.g. 24 cards mounting at once) collapses into one
 * resize() call.
 */
const LenisContentResizeSync = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    let frameId = 0;
    const scheduleResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => lenis.resize());
    };

    const observer = new MutationObserver(scheduleResize);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [lenis]);

  return null;
};

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        // `lerp` and `duration` are mutually exclusive in Lenis — when
        // `duration` is a number it wins (Lenis auto-assigns a default
        // easing and the duration+easing branch takes priority over lerp
        // internally), so `lerp` here was silently dead. That meant every
        // wheel tick restarted a fresh 1.4s eased animation toward a new
        // target instead of continuously damping toward it — with real
        // trackpad/mouse input firing every ~16ms, each tick interrupted
        // the previous curve right at its slow start, reading as the
        // scroll repeatedly starting then stalling. `lerp`-only gives
        // continuous, low-latency damping instead.
        lerp: 0.1,
        smoothWheel: true,
      }}
    >
      <LenisRafDriver />
      <LenisScrollLockSync />
      <LenisContentResizeSync />
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
