import EventThumbnail from "@/components/event-thumbnail";
import Badge from "@/components/ui/badge";
import { isEventLive } from "@/lib/event-status";
import { formatNaira } from "@/lib/format-currency";
import { formatEventDate } from "@/lib/format-date";
import { type PublicEventApi } from "@/lib/types/event";
import { MapPin } from "lucide-react";

interface EventCardCompactProps {
  event: PublicEventApi;
  onSelect: (event: PublicEventApi) => void;
}

/**
 * A dense, thumbnail-left row — used in search results and the near-me list,
 * where several results need to be scannable at once. The main browse grid
 * keeps the larger EventCard; this is deliberately not a full-page redesign.
 */
const EventCardCompact = ({ event, onSelect }: EventCardCompactProps) => {
  const priceNaira = event.currentTicketPriceNaira ?? event.ticketPriceNaira;
  const priceLabel = event.isPaid ? formatNaira(priceNaira) : "Free";
  const live = isEventLive(event);

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition-colors hover:bg-secondary/50"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <EventThumbnail imageUrl={event.imageUrl} alt={event.name} className="h-full w-full" />
        {live ? (
          <span className="absolute left-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-sm font-bold text-card-foreground">
          {event.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {formatEventDate(event.nextOccurrenceAt)} · {event.address}
          </span>
        </div>
      </div>

      <Badge
        variant={event.isPaid ? "outline" : "default"}
        className="shrink-0 text-[11px]"
      >
        {priceLabel}
      </Badge>
    </button>
  );
};

export default EventCardCompact;
