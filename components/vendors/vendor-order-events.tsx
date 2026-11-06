"use client";

import {
  useMyBookings,
  useVendorQueueAcrossEvents,
} from "@/lib/hooks/use-vendor";
import { useVendorOrderRealtime } from "@/lib/hooks/use-vendor-order-realtime";
import { EventDateTile } from "@/components/organizer/event-row";
import { EmptyState, ErrorState, PageHeader, Panel } from "@/components/organizer/organizer-primitives";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { cn, ROUTES } from "@/lib/utils";
import { ChevronRight, ListChecks } from "lucide-react";
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

  const waitingTotal = Object.values(waitingByEvent).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-col pb-10">
      <PageHeader
        lead="take"
        accent="orders."
        description="Pick the event you're working. Its orders open on their own board."
        actions={
          waitingTotal > 0 ? (
            <span
              className="flex h-10 items-center rounded-full px-4 text-sm font-bold tabular-nums"
              style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
            >
              {waitingTotal} waiting across your events
            </span>
          ) : null
        }
      />

      {bookingsQuery.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[94px] rounded-[26px]" />
          ))}
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <Panel>
          <ErrorState message="Couldn't load your events." onRetry={() => bookingsQuery.refetch()} />
        </Panel>
      ) : null}

      {bookingsQuery.isSuccess && confirmed.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<ListChecks className="h-6 w-6" />}
            title="no confirmed event yet"
            description="Once an organizer confirms your stall, the event shows up here and you can take its orders."
            action={
              <Link href={ROUTES.VENDOR_EVENTS} className={cn(buttonVariants({ variant: "ink", size: "sm" }))}>
                Find an event
              </Link>
            }
          />
        </Panel>
      ) : null}

      <ul className="flex flex-col gap-3">
        {confirmed.map((booking) => {
          const waiting = waitingByEvent[booking.eventId] ?? 0;
          const event = booking.event!;

          return (
            <li key={booking._id}>
              <Link
                href={`${ROUTES.VENDOR_ORDERS}/${booking.eventId}`}
                className="group flex items-center gap-4 rounded-[26px] border-[1.5px] border-border p-2.5 pr-4 transition-colors hover:border-foreground"
              >
                <EventDateTile event={event} className="h-[68px] w-[68px]" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="truncate text-[17px] font-bold tracking-[-0.01em] transition-colors group-hover:text-primary">{event.name}</span>
                  <span className="truncate text-sm text-muted-foreground">{[formatDate(event.startsAt), event.address].filter(Boolean).join(" · ")}</span>
                </span>

                <span
                  className={cn(
                    "hidden h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] font-bold tabular-nums sm:flex",
                    waiting > 0 ? "" : "border-[1.5px] border-border text-muted-foreground",
                  )}
                  style={waiting > 0 ? { backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg } : undefined}
                >
                  {waiting > 0 ? `${waiting} waiting` : "Nothing waiting"}
                </span>
                {waiting > 0 ? (
                  <span
                    className="flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[13px] font-bold tabular-nums sm:hidden"
                    style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
                  >
                    {waiting}
                  </span>
                ) : null}

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VendorOrderEvents;
