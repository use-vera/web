import EventPoster from "@/components/vera/event-poster";
import { dayLabel, hostOf, placeOf, priceTag, shortWhen } from "@/components/vera/event-format";
import { isEventLive } from "@/lib/event-status";
import { type PublicEventApi } from "@/lib/types/event";
import Link from "next/link";

/** The app's poster card, larger: the flat poster first, then host, name, when and where, and the price. */
const EventPosterCard = ({ event }: { event: PublicEventApi }) => {
  const when = event.nextOccurrenceAt || event.startsAt;
  const live = isEventLive(event);
  const host = hostOf(event);

  return (
    <Link href={`/events/${event._id}`} className="group flex flex-col gap-3.5">
      <EventPoster
        seed={event._id}
        title={event.name}
        tag={live ? undefined : shortWhen(when)}
        imageUrl={event.imageUrl}
        className="aspect-[4/3.4] w-full transition-transform duration-300 group-hover:-translate-y-1"
        titleClassName="text-[clamp(30px,3vw,42px)]"
        badge={
          live ? (
            <span className="flex h-7 items-center gap-1.5 rounded-full bg-background px-3 text-xs font-bold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live now
            </span>
          ) : null
        }
      />
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-1">
          {host ? <span className="text-[13px] text-muted-foreground">{host}</span> : null}
          <span className="text-xl font-bold tracking-[-0.015em] transition-colors group-hover:text-primary">{event.name}</span>
          <span className="text-sm text-muted-foreground">{[dayLabel(when), placeOf(event)].filter(Boolean).join(" · ")}</span>
        </span>
        <span className="flex h-8 shrink-0 items-center rounded-full border-[1.5px] border-border px-3 text-[13px] font-bold">{priceTag(event)}</span>
      </span>
    </Link>
  );
};

export default EventPosterCard;
