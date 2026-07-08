"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (callback: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

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
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
