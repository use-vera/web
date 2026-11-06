"use client";

import { EventStatusBadge, RecurringBadge } from "@/components/organizer/event-status-badge";
import { Meter } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { cloudinaryVariant } from "@/lib/cloudinary";
import { formatNairaCompact } from "@/lib/format-currency";
import { type OrganizerEventApi } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const monthOf = (date: Date) => new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date);

const whenLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(date);

/** The event's own tile: its artwork, or its date on its poster colour. */
/** Anything with an id, a date and maybe a picture: organizer events, and the vendor's bookings. */
type DateTileEvent = Pick<OrganizerEventApi, "_id" | "startsAt" | "imageUrl"> & { nextOccurrenceAt?: string | null };

export const EventDateTile = ({ event, className }: { event: DateTileEvent; className?: string }) => {
  const occurrence = new Date(event.nextOccurrenceAt ?? event.startsAt);
  const tone = toneFor(event._id);
  const colours = POSTER_TONES[tone];
  const image = cloudinaryVariant(event.imageUrl, "thumb");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px]",
        tone === "cream" && !image && "ring-1 ring-border ring-inset",
        className,
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already serves sized variants.
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <span className="text-xs font-bold">{monthOf(occurrence)}</span>
          <span className="text-[26px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{occurrence.getDate()}</span>
        </>
      )}
    </span>
  );
};

/** One event in the organizer's list: the event on the left, its sales on the right. */
export const EventRow = ({ event }: { event: OrganizerEventApi }) => {
  const occurrence = new Date(event.nextOccurrenceAt ?? event.startsAt);
  const isDraft = event.status === "draft";
  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const gross = sold * (event.ticketPriceNaira || 0);
  const isRecurring = Boolean(event.nextOccurrenceAt && event.nextOccurrenceAt !== event.startsAt);

  return (
    <Link
      href={`/organizer/events/${event._id}`}
      className="group flex flex-col gap-3 rounded-[26px] border-[1.5px] border-border p-2.5 transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:outline-none sm:flex-row sm:items-center sm:gap-5 sm:pr-4"
    >
      <span className="flex min-w-0 flex-1 items-center gap-4">
        <EventDateTile event={event} className={cn("h-[68px] w-[68px]", isDraft && "opacity-60")} />
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-[17px] font-bold tracking-[-0.01em] transition-colors group-hover:text-primary">{event.name}</span>
            <EventStatusBadge event={event} />
            {isRecurring ? <RecurringBadge /> : null}
          </span>
          <span className="truncate text-sm text-muted-foreground">{[whenLabel(occurrence), event.address].filter(Boolean).join(" · ")}</span>
        </span>
      </span>

      <span className="flex items-center gap-4 border-t-[1.5px] border-dashed border-border px-2 pt-3 pb-1 sm:w-[260px] sm:shrink-0 sm:border-t-0 sm:border-l-[1.5px] sm:px-0 sm:py-1 sm:pl-5">
        {isDraft ? (
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-bold">Not published yet</span>
            <span className="text-[13px] text-muted-foreground">Open it to publish and start selling</span>
          </span>
        ) : (
          <span className="flex flex-1 flex-col gap-2">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold tabular-nums">
                {sold.toLocaleString("en-NG")}
                <span className="font-medium text-muted-foreground"> / {capacity.toLocaleString("en-NG")} sold</span>
              </span>
              <span className="text-sm font-extrabold tabular-nums">{formatNairaCompact(gross)}</span>
            </span>
            <Meter percent={percent} />
          </span>
        )}
        <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
      </span>
    </Link>
  );
};
