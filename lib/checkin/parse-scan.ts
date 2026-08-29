/**
 * Mirrors the server's `parseTicketScanCode`.
 *
 * A Vera QR carries JSON, not a bare code:
 *   {"provider":"vera","ticketCode":"VRA-…","eventId":"…"}
 *
 * The roster hashes the extracted `ticketCode`, so the door has to extract it
 * the same way before hashing. Hashing the raw payload instead makes every
 * camera scan miss the roster while typed references still work, which reads
 * as "the scanner is broken" rather than as a mismatch.
 */
export interface ParsedScan {
  /** Exactly what was scanned. Sent to the server, which re-parses it. */
  raw: string;
  /** What the roster hash is computed over. */
  ticketCode: string;
  /** Present when the QR names its event, so a foreign ticket is caught. */
  eventId: string | null;
}

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export const parseScan = (input: string): ParsedScan => {
  const raw = String(input || "").trim();

  let ticketCode = raw;
  let eventId: string | null = null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (parsed && typeof parsed === "object") {
      const maybeCode = String(parsed.ticketCode ?? "").trim();
      const maybeEvent = String(parsed.eventId ?? "").trim();

      if (maybeCode) {
        ticketCode = maybeCode;
      }

      if (OBJECT_ID.test(maybeEvent)) {
        eventId = maybeEvent;
      }
    }
  } catch {
    // Not JSON. A typed reference. Treat the whole string as the code.
  }

  return { raw, ticketCode, eventId };
};
