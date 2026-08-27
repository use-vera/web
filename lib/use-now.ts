import { useSyncExternalStore } from "react";

/**
 * A ticking clock as an external store. The snapshot is cached in module
 * scope and only replaced by the interval, because useSyncExternalStore
 * requires a stable getSnapshot — returning Date.now() directly would
 * change on every call and loop.
 *
 * One interval is shared by every subscriber and stops when the last one
 * unmounts. The server snapshot is 0; callers render a placeholder until
 * hydration provides a real time.
 */
let snapshot = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);

  if (timer === null) {
    snapshot = Date.now();
    timer = setInterval(() => {
      snapshot = Date.now();
      listeners.forEach((listener) => listener());
    }, 1000);
  }

  return () => {
    listeners.delete(onChange);

    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
};

export const useNow = () =>
  useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => 0,
  );

/** "2h 14m 09s" / "9m 04s" / "48s", or null once the deadline has passed. */
export const formatCountdown = (deadlineIso: string, nowMs: number) => {
  if (!nowMs) {
    return null;
  }

  const remaining = Date.parse(deadlineIso) - nowMs;

  if (!Number.isFinite(remaining) || remaining <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${pad(seconds)}s`;
  }

  return `${seconds}s`;
};
