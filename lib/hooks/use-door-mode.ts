"use client";

import { doorDb } from "@/lib/checkin/db";
import { drainQueue, purgeIfExpired, refreshRoster } from "@/lib/checkin/sync";
import { commitScan, decideScan, type ScanDecision } from "@/lib/checkin/validate";
import { type DoorMeta } from "@/lib/checkin/types";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { registerDoorServiceWorker } from "@/lib/checkin/register-sw";
import { doorService } from "@/lib/services/door.service";
import { useCallback, useEffect, useRef, useState } from "react";

export type DoorStatus = "idle" | "preparing" | "ready" | "error";

export interface DoorState {
  status: DoorStatus;
  meta: DoorMeta | null;
  rosterCount: number;
  admittedCount: number;
  pendingCount: number;
  online: boolean;
  syncing: boolean;
  error: string | null;
}

/** Retried on a slow backoff. A venue's signal returns in bursts, not on a timer. */
const SYNC_INTERVAL_MS = 20_000;

/**
 * Door mode: prepare once while online, then scan with no network at all.
 *
 * The React layer deliberately holds no scan state of its own. Every scan is
 * written to IndexedDB before a result is rendered, so a refresh, a crash or a
 * backgrounded tab loses nothing.
 */
export const useDoorMode = (
  eventId: string,
  /** Called after a successful drain. The only moment conflicts change. */
  onSynced?: () => void,
) => {
  const [state, setState] = useState<DoorState>({
    status: "idle",
    meta: null,
    rosterCount: 0,
    admittedCount: 0,
    pendingCount: 0,
    online: true,
    syncing: false,
    error: null,
  });

  const metaRef = useRef<DoorMeta | null>(null);
  const syncingRef = useRef(false);
  /* Held in a ref so callers can pass an inline arrow without destabilising
     `sync`, and through it, the effect below. */
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  }, [onSynced]);

  const readCounts = useCallback(async () => {
    const [rosterCount, admittedCount, pending] = await Promise.all([
      doorDb.countRoster(),
      doorDb.countAdmitted(),
      doorDb.pending(),
    ]);

    setState((current) =>
      current.rosterCount === rosterCount &&
      current.admittedCount === admittedCount &&
      current.pendingCount === pending.length
        ? current
        : { ...current, rosterCount, admittedCount, pendingCount: pending.length },
    );
  }, []);

  const sync = useCallback(async () => {
    const meta = metaRef.current;

    if (!meta || syncingRef.current || !navigator.onLine) {
      return null;
    }

    syncingRef.current = true;
    setState((current) => ({ ...current, syncing: true }));

    try {
      const summary = await drainQueue(meta);
      await readCounts();

      if (summary && summary.duplicates > 0) {
        onSyncedRef.current?.();
      }

      return summary;
    } catch {
      /* Sync failing is the expected state at a bad venue, not an error worth
         showing. The queue is durable; it drains when it can. */
      return null;
    } finally {
      syncingRef.current = false;
      setState((current) => ({ ...current, syncing: false }));
    }
  }, [readCounts]);

  /**
   * Downloads the roster and claims a lane. Must be called while there is
   * signal. This is the one moment door mode needs the network.
   */
  const prepare = useCallback(async (laneLabel?: string) => {
    setState((current) => ({ ...current, status: "preparing", error: null }));

    try {
      /* Registered here so the shell is cached from a page we know works. */
      void registerDoorServiceWorker();

      const stored = await purgeIfExpired(await doorDb.getMeta());

      /* A device holding another event's roster must not validate against it. */
      if (stored && stored.eventId !== eventId) {
        await doorDb.clearAll();
      }

      const meta = await refreshRoster(
        eventId,
        stored?.eventId === eventId ? stored : null,
      );

      /* Claim the lane. Re-registering an existing label returns the same
         door, so a device that cleared its storage rejoins its own history
         rather than fragmenting it. */
      let withLane = meta;
      const label = laneLabel?.trim() || meta.laneLabel;

      if (label) {
        try {
          const device = await doorService.registerDevice(eventId, label);
          withLane = { ...meta, deviceId: device._id, laneLabel: device.label };
          await doorDb.setMeta(withLane);
        } catch {
          /* A lane is useful, not required. An unlabelled door still scans,
             it just cannot be named in the conflicts report. */
        }
      }

      metaRef.current = withLane;
      setState((current) => ({ ...current, status: "ready", meta: withLane }));
      await readCounts();
      await sync();
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: getApiErrorMessage(
          error,
          "Couldn't download the guest list. Door mode needs signal to start.",
        ),
      }));
    }
  }, [eventId, readCounts, sync]);

  /** Decides, commits, and returns. No network on this path. */
  const scan = useCallback(
    async (code: string, override = false): Promise<ScanDecision | null> => {
      const meta = metaRef.current;

      if (!meta) {
        return null;
      }

      const decision = await decideScan(meta, code);
      await commitScan(decision, code, override);
      await readCounts();

      /* Fire and forget: the result is already on screen. */
      void sync();

      return decision;
    },
    [readCounts, sync],
  );

  /* Restore a prepared door across a refresh, and track connectivity. */
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const stored = await purgeIfExpired(await doorDb.getMeta());

      if (cancelled || !stored || stored.eventId !== eventId) {
        return;
      }

      metaRef.current = stored;
      setState((current) => ({ ...current, status: "ready", meta: stored }));
      await readCounts();
    };

    void restore();

    const setOnline = () =>
      setState((current) =>
        current.online === navigator.onLine
          ? current
          : { ...current, online: navigator.onLine },
      );

    setOnline();
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOnline);

    const onReconnect = () => void sync();
    window.addEventListener("online", onReconnect);

    const timer = setInterval(() => void sync(), SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOnline);
      window.removeEventListener("online", onReconnect);
      clearInterval(timer);
    };
  }, [eventId, readCounts, sync]);

  return { ...state, prepare, scan, sync, refresh: prepare };
};
