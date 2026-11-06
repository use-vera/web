import EventPoster from "@/components/vera/event-poster";
import { hostOf, placeOf, priceTag, shortWhen } from "@/components/vera/event-format";
import { type PublicEventApi } from "@/lib/types/event";
import Link from "next/link";

/** The app's list row: poster, host, name, when and where, the price on the right. Sits on a hairline. */
const EventRow = ({ event }: { event: PublicEventApi }) => {
  const when = event.nextOccurrenceAt || event.startsAt;
  const host = hostOf(event);

  return (
    <Link
      href={`/events/${event._id}`}
      className="group flex flex-wrap items-center gap-5 border-b border-border py-[18px] transition-colors"
    >
      <EventPoster
        seed={event._id}
        title={event.name}
        imageUrl={event.imageUrl}
        imageVariant="thumb"
        className="h-[72px] w-[72px] shrink-0 rounded-2xl"
        titleClassName="text-[10px]"
      />
      <span className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
        {host ? <span className="text-[13px] text-muted-foreground">{host}</span> : null}
        <span className="text-[22px] font-bold tracking-[-0.02em] transition-colors group-hover:text-primary">{event.name}</span>
        <span className="text-sm text-muted-foreground">
          {[shortWhen(when), placeOf(event)].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="flex h-9 items-center rounded-full border-[1.5px] border-border px-4 text-sm font-semibold">{priceTag(event)}</span>
    </Link>
  );
};

export default EventRow;
