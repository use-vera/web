import { doorDb } from "@/lib/checkin/db";
import { hashTicketCode } from "@/lib/checkin/hash";
import { parseScan } from "@/lib/checkin/parse-scan";
import { type DoorMeta, type RosterEntry, type ScanOutcome } from "@/lib/checkin/types";

export interface ScanDecision {
  outcome: ScanOutcome;
  hash: string;
  /** The parsed reference, so the door can show it the way online does. */
  ticketCode: string;
  entry: RosterEntry | null;
  /** Local time corrected by the offset captured at roster download. */
  scannedAt: string;
  /** Set on duplicate_here, when this device admitted it before. */
  previouslyAdmittedAt?: string;
  message: string;
}

/**
 * The whole door decision, offline. No network, no awaiting a server, so the
 * queue moves at the speed of a hash and two IndexedDB reads.
 *
 * Order matters: identity first, then revocation, then the window, then the
 * local used-set, so the operator always gets the most specific reason.
 */
export const decideScan = async (
  meta: DoorMeta,
  code: string,
): Promise<ScanDecision> => {
  /* A camera scan is JSON; a typed reference is not. Both reduce to the
     ticket code the roster was hashed over. */
  const scanned = parseScan(code);
  const scannedAt = new Date(Date.now() + meta.clockOffsetMs).toISOString();

  /* A QR that names a different event is a wrong-door mistake, not an
     unknown ticket. Worth saying precisely. */
  if (scanned.eventId && scanned.eventId !== meta.eventId) {
    return {
      outcome: "wrong_event",
      ticketCode: scanned.ticketCode,
      hash: await hashTicketCode(meta.rosterKey, scanned.ticketCode),
      entry: null,
      scannedAt,
      message: "That ticket is for a different event",
    };
  }

  const hash = await hashTicketCode(meta.rosterKey, scanned.ticketCode);
  const entry = await doorDb.getRosterEntry(hash);

  if (!entry) {
    return {
      outcome: "unknown",
      ticketCode: scanned.ticketCode,
      hash,
      entry: null,
      scannedAt,
      message: "Not a ticket for this event",
    };
  }

  const now = new Date(scannedAt);

  if (now < new Date(meta.window.opensAt)) {
    return {
      outcome: "outside_window",
      ticketCode: scanned.ticketCode,
      hash,
      entry,
      scannedAt,
      message: "Doors are not open yet",
    };
  }

  if (now > new Date(meta.window.closesAt)) {
    return {
      outcome: "outside_window",
      ticketCode: scanned.ticketCode,
      hash,
      entry,
      scannedAt,
      message: "Check-in has closed for this event",
    };
  }

  const already = await doorDb.getAdmitted(hash);

  if (already) {
    return {
      outcome: "duplicate_here",
      ticketCode: scanned.ticketCode,
      hash,
      entry,
      scannedAt,
      previouslyAdmittedAt: already.at,
      message: "Already scanned at this door",
    };
  }

  /* The roster knew it was used before this device ever saw it. Another
     door, or the online path, got there first. */
  if (entry.usedAt) {
    return {
      outcome: "duplicate_here",
      ticketCode: scanned.ticketCode,
      hash,
      entry,
      scannedAt,
      previouslyAdmittedAt: entry.usedAt,
      message: "Already checked in",
    };
  }

  return {
    outcome: "admitted",
    ticketCode: scanned.ticketCode,
    hash,
    entry,
    scannedAt,
    message: "Admitted",
  };
};

/**
 * Commits a decision. The write happens BEFORE the caller renders a result:
 * buffering in React state and flushing later means a refresh or a crash
 * silently drops admissions, and nobody notices until reconciliation.
 */
export const commitScan = async (
  decision: ScanDecision,
  code: string,
  override = false,
) => {
  if (decision.outcome === "admitted" || override) {
    await doorDb.markAdmitted(decision.hash, decision.scannedAt);
  }

  await doorDb.enqueue({
    code,
    hash: decision.hash,
    outcome: decision.outcome,
    scannedAt: decision.scannedAt,
    override,
    syncState: "pending",
  });
};
