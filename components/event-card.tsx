import EventThumbnail from "@/components/event-thumbnail";
import PerforatedDivider from "@/components/perforated-divider";
import Badge from "@/components/ui/badge";
import { isEventLive } from "@/lib/event-status";
import { formatNaira } from "@/lib/format-currency";
import { formatEventDate } from "@/lib/format-date";
import { type PublicEventApi } from "@/lib/types/event";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: PublicEventApi;
  onSelect: (event: PublicEventApi) => void;
}

const EventCard = ({ event, onSelect }: EventCardProps) => {
  const priceNaira = event.currentTicketPriceNaira ?? event.ticketPriceNaira;
  const priceLabel = event.isPaid ? `From ${formatNaira(priceNaira)}` : "Free entry";
  const live = isEventLive(event);

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <EventThumbnail
          imageUrl={event.imageUrl}
          alt={event.name}
          className="h-full w-full"
          iconClassName="transition-transform group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {live ? (
            <Badge className="border-transparent bg-red-600 text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </Badge>
          ) : null}
          {event.state ? <Badge>{event.state}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatEventDate(event.nextOccurrenceAt)}
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-card-foreground">
          {event.name}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{event.address}</span>
        </div>

        <PerforatedDivider className="mt-1" />

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-foreground">{priceLabel}</span>
          <span className="text-xs text-muted-foreground">
            {event.soldTickets} going
          </span>
        </div>
      </div>
    </button>
  );
};

export default EventCard;
