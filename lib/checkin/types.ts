/** One admissible ticket, as the door holds it. Hashed code, no contact details. */
export interface RosterEntry {
  h: string;
  name: string;
  tier: string;
  seats: number;
  /** Set when the ticket was already used before this roster was fetched. */
  usedAt: string | null;
}

export interface RosterResponse {
  serverTime: string;
  isDelta: boolean;
  rosterKey: string;
  event: { _id: string; name: string; startsAt: string; endsAt: string };
  window: { opensAt: string; closesAt: string };
  tickets: RosterEntry[];
  revoked: string[];
  totalTickets: number;
}

export type ScanOutcome =
  | "admitted"
  | "duplicate_here"
  | "unknown"
  | "revoked"
  | "wrong_event"
  | "outside_window";

export interface QueuedScan {
  clientSeq?: number;
  /** The raw scanned code. The server re-validates it, so it must be kept. */
  code: string;
  hash: string;
  outcome: ScanOutcome;
  /** Corrected for this device's clock offset against the server. */
  scannedAt: string;
  override: boolean;
  syncState: "pending" | "synced" | "rejected";
  serverResult?: string;
}

export interface DoorMeta {
  eventId: string;
  eventName: string;
  rosterKey: string;
  /** serverTime minus device time at download; added to every local timestamp. */
  clockOffsetMs: number;
  window: { opensAt: string; closesAt: string };
  lastSyncedAt: string | null;
  rosterFetchedAt: string;
  /** Roster self-destructs after this, so a lost phone stops being useful. */
  expiresAt: string;
  deviceId: string | null;
  laneLabel: string | null;
}
