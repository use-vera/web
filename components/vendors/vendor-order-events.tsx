"use client";

import {
  useMyBookings,
  useVendorQueueAcrossEvents,
} from "@/lib/hooks/use-vendor";
import { useVendorOrderRealtime } from "@/lib/hooks/use-vendor-order-realtime";
import { cn, ROUTES } from "@/lib/utils";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

/**
 * Which event's orders to work.
 *
 * A vendor can be confirmed for several events at once, and guessing which
 * one they are standing at is how the board ends up showing an empty queue
 * for the wrong night. So they pick.
 */
const VendorOrderEvents = () => {
  const bookingsQuery = useMyBookings();
  const queueQuery = useVendorQueueAcrossEvents();

  useVendorOrderRealtime();

  const confirmed = (bookingsQuery.data ?? [])
    .filter((booking) => booking.status === "confirmed" && booking.event)
    .sort(
      (left, right) =>
        new Date(left.event!.startsAt).getTime() -
        new Date(right.event!.startsAt).getTime(),
    );

  /* Counted from one call across every event, so each row can say what is
     actually waiting without a request of its own. */
  const waitingByEvent = (queueQuery.data?.items ?? []).reduce<
    Record<string, number>
  >((counts, order) => {
    counts[order.eventId] = (counts[order.eventId] ?? 0) + 1;

    return counts;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the event you&apos;re working. Orders for it open on their own
          page.
        </p>
      </div>

      {bookingsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading your events…</p>
      ) : null}

      {bookingsQuery.isSuccess && confirmed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            No confirmed event yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once an organizer confirms you, that event shows up here and you can
            take orders for it.
          </p>
          <Link
            href={ROUTES.VENDOR_EVENTS}
            className="mt-4 inline-block text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
          >
            Find an event
          </Link>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {confirmed.map((booking) => {
          const waiting = waitingByEvent[booking.eventId] ?? 0;

          return (
            <li key={booking._id}>
              <Link
                href={`${ROUTES.VENDOR_ORDERS}/${booking.eventId}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-card-foreground">
                    {booking.event?.name}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {booking.event ? formatDate(booking.event.startsAt) : ""}
                    </span>
                    {booking.event?.address ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.event.address}
                      </span>
                    ) : null}
                  </span>
                </span>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold tabular-nums",
                    waiting > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {waiting > 0 ? `${waiting} waiting` : "Nothing waiting"}
                </span>

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VendorOrderEvents;
