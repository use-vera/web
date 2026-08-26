"use client";

import { Card } from "@/components/ui/card";
import { formatNairaCompact } from "@/lib/format-currency";
import { type OrganizerEventApi } from "@/lib/types/organizer";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import {
  EventStatusBadge,
  RecurringBadge,
} from "@/components/organizer/event-status-badge";
import { Meter, PerforationY } from "@/components/organizer/organizer-primitives";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

/**
 * An event row is drawn as a ticket: the event on one side, the tear line, and
 * its sales stub on the other.
 */
export const EventRow = ({ event }: { event: OrganizerEventApi }) => {
  const occurrence = new Date(event.nextOccurrenceAt ?? event.startsAt);
  const isDraft = event.status === "draft";
  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const gross = sold * (event.ticketPriceNaira || 0);
  const isRecurring = Boolean(
    event.nextOccurrenceAt && event.nextOccurrenceAt !== event.startsAt,
  );

  return (
    <Card className="py-0">
      <Link
        href={`/organizer/events/${event._id}`}
        className="flex items-stretch rounded-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 p-4">
          <div
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-muted ${
              isDraft ? "opacity-65" : ""
            }`}
          >
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
              {MONTHS[occurrence.getMonth()]}
            </span>
            <span className="text-xl leading-none font-bold tabular-nums">
              {String(occurrence.getDate()).padStart(2, "0")}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-base leading-snug font-semibold">
                {event.name}
              </span>
              <EventStatusBadge event={event} />
              {isRecurring ? <RecurringBadge /> : null}
            </div>
            <div className="mt-1.5 flex items-center gap-3.5 text-[13px] text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{event.address}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {timeLabel(occurrence.toISOString())}
              </span>
            </div>
          </div>
        </div>

        <PerforationY />

        <div className="flex w-[236px] shrink-0 flex-col justify-center gap-2 py-4 pr-4 pl-5">
          {isDraft ? (
            <>
              <div className="text-[13px] text-muted-foreground">
                Not on sale yet
              </div>
              <div className="h-1 rounded-full bg-muted" />
              <div className="text-xs text-muted-foreground">
                Finish setup to publish
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold tabular-nums">
                  {sold.toLocaleString("en-NG")}
                  <span className="font-normal text-muted-foreground">
                    {" / "}
                    {capacity.toLocaleString("en-NG")}
                  </span>
                </span>
                <span className="text-[13px] font-semibold tabular-nums">
                  {formatNairaCompact(gross)}
                </span>
              </div>
              <Meter percent={percent} />
              <div className="text-xs text-muted-foreground tabular-nums">
                {percent}% of capacity sold
              </div>
            </>
          )}
        </div>

        <div className="flex items-center pr-3 text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </Card>
  );
};
