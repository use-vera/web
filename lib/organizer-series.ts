import { type EventTicketApi } from "@/lib/types/organizer";

export interface SeriesPoint {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/**
 * Buckets tickets into one point per day, ending today. Counts seats rather
 * than rows, so a single purchase of four tickets counts as four.
 *
 * Tickets come from a paged endpoint capped at 50 rows, so this describes the
 * tickets actually loaded. Not the event's whole sales history. Label it as
 * such wherever it is drawn.
 */
export const buildDailySeries = (
  tickets: EventTicketApi[],
  days: number,
): SeriesPoint[] => {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    if (ticket.status !== "paid" && ticket.status !== "used") {
      continue;
    }

    const paidAt = Date.parse(ticket.paidAt || ticket.createdAt);

    if (!Number.isFinite(paidAt)) {
      continue;
    }

    const key = dayKey(new Date(paidAt));
    counts.set(key, (counts.get(key) ?? 0) + (ticket.quantity || 1));
  }

  const shortLabel = new Intl.DateTimeFormat("en-NG", { weekday: "short" });
  const longLabel = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const dateLabel = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  });

  const today = new Date();
  const points: SeriesPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);

    const key = dayKey(date);

    points.push({
      key,
      label: days <= 10 ? shortLabel.format(date) : dateLabel.format(date),
      fullLabel: longLabel.format(date),
      value: counts.get(key) ?? 0,
    });
  }

  return points;
};
