import { doorDb } from "@/lib/checkin/db";
import { doorService } from "@/lib/services/door.service";
import { type DoorMeta } from "@/lib/checkin/types";

/** One night of scans is tens of KB, so batches stay comfortably small. */
const BATCH_SIZE = 200;

export interface SyncSummary {
  attempted: number;
  accepted: number;
  duplicates: number;
  rejected: number;
}

/**
 * Drains the queue. Called opportunistically. Whenever a request succeeds,
 * when the browser reports it is back online, and on a slow backoff. Rather
 * than on a fixed schedule, because connectivity at a venue comes in bursts.
 *
 * Every entry is settled locally against the server's answer, so a scan is
 * only ever sent once even though the endpoint is idempotent.
 */
export const drainQueue = async (meta: DoorMeta): Promise<SyncSummary | null> => {
  const pending = await doorDb.pending();

  if (pending.length === 0) {
    return null;
  }

  const batch = pending.slice(0, BATCH_SIZE);

  const response = await doorService.syncBatch(meta.eventId, {
    ...(meta.deviceId ? { deviceId: meta.deviceId } : {}),
    entries: batch.map((scan) => ({
      clientSeq: scan.clientSeq as number,
      code: scan.code,
      scannedAt: scan.scannedAt,
      override: scan.override,
    })),
  });

  await Promise.all(
    response.results.map((result) =>
      doorDb.settle(
        result.clientSeq,
        result.result === "admitted" || result.result === "duplicate"
          ? "synced"
          : "rejected",
        result.result,
      ),
    ),
  );

  await doorDb.setMeta({ ...meta, lastSyncedAt: new Date().toISOString() });

  return {
    attempted: batch.length,
    accepted: response.accepted,
    duplicates: response.duplicates,
    rejected: response.rejected,
  };
};

/**
 * Downloads or refreshes the roster. A full download replaces everything; a
 * delta merges changes and drops revoked codes, so a device with signal stays
 * current without re-downloading the event.
 */
export const refreshRoster = async (
  eventId: string,
  existing: DoorMeta | null,
): Promise<DoorMeta> => {
  const requestedAt = Date.now();
  const since = existing?.eventId === eventId ? existing.rosterFetchedAt : null;
  const roster = await doorService.getRoster(eventId, since);

  if (roster.isDelta) {
    await doorDb.mergeRoster(roster.tickets, roster.revoked);
  } else {
    await doorDb.replaceRoster(roster.tickets);
  }

  /* Round-trip time is split evenly to approximate the moment the server
     stamped its clock; good to a few hundred ms, which is all the audit
     trail needs. */
  const halfTrip = (Date.now() - requestedAt) / 2;
  const clockOffsetMs =
    new Date(roster.serverTime).getTime() + halfTrip - Date.now();

  const meta: DoorMeta = {
    eventId,
    eventName: roster.event.name,
    rosterKey: roster.rosterKey,
    clockOffsetMs,
    window: roster.window,
    lastSyncedAt: existing?.lastSyncedAt ?? null,
    rosterFetchedAt: roster.serverTime,
    /* The roster stops being useful, and stops being a liability after six
       hours after the event ends. */
    expiresAt: new Date(
      new Date(roster.event.endsAt).getTime() + 6 * 60 * 60 * 1000,
    ).toISOString(),
    deviceId: existing?.deviceId ?? null,
    laneLabel: existing?.laneLabel ?? null,
  };

  await doorDb.setMeta(meta);

  return meta;
};

/** Wipes an expired roster. A door phone should not carry a past event. */
export const purgeIfExpired = async (meta: DoorMeta | null) => {
  if (!meta) {
    return null;
  }

  if (new Date(meta.expiresAt).getTime() > Date.now()) {
    return meta;
  }

  await doorDb.clearAll();

  return null;
};
