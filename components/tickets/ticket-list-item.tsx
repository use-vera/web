import EventThumbnail from "@/components/event-thumbnail";
import Badge from "@/components/ui/badge";
import { formatEventDate } from "@/lib/format-date";
import { type MyTicketApi, type TicketEventSummaryApi } from "@/lib/types/event";
import { ChevronRight, MapPin } from "lucide-react";

interface TicketListItemProps {
  ticket: MyTicketApi;
  onSelect: (ticket: MyTicketApi) => void;
}

const resolveEvent = (
  eventId: MyTicketApi["eventId"],
): TicketEventSummaryApi | null =>
  typeof eventId === "string" ? null : eventId;

const STATUS_LABEL: Record<MyTicketApi["status"], string> = {
  paid: "Valid",
  used: "Checked in",
  pending: "Awaiting payment",
  cancelled: "Cancelled",
  expired: "Expired",
};

const TicketListItem = ({ ticket, onSelect }: TicketListItemProps) => {
  const event = resolveEvent(ticket.eventId);
  const badgeVariant = ticket.status === "paid" ? "solid" : "outline";

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-lg"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <EventThumbnail imageUrl={event?.imageUrl} alt={event?.name} className="h-full w-full" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-card-foreground">
            {event?.name ?? "Event ticket"}
          </h3>
          <Badge variant={badgeVariant} className="shrink-0">
            {STATUS_LABEL[ticket.status]}
          </Badge>
        </div>

        <span className="text-xs text-muted-foreground">
          {event ? formatEventDate(event.nextOccurrenceAt) : ""}
        </span>

        {event?.address ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.address}</span>
          </div>
        ) : null}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
};

export default TicketListItem;
