import EventThumbnail from "@/components/event-thumbnail";
import { formatNaira } from "@/lib/format-currency";
import { formatEventDate } from "@/lib/format-date";
import {
  type MyTicketApi,
  type TicketEventSummaryApi,
} from "@/lib/types/event";
import { cn } from "@/lib/utils";
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

const STATUS_STYLES: Record<MyTicketApi["status"], string> = {
  paid: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  used: "bg-muted text-muted-foreground",
  pending:
    "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  cancelled: "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  expired: "bg-muted text-muted-foreground",
};

const TicketListItem = ({ ticket, onSelect }: TicketListItemProps) => {
  const event = resolveEvent(ticket.eventId);

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-shadow hover:shadow-lg sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
        <EventThumbnail
          imageUrl={event?.imageUrl}
          alt={event?.name}
          className="h-full w-full"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-card-foreground sm:text-base">
            {event?.name ?? "Event ticket"}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              STATUS_STYLES[ticket.status],
            )}
          >
            {STATUS_LABEL[ticket.status]}
          </span>
        </div>

        <span className="text-xs text-muted-foreground sm:text-sm">
          {event ? formatEventDate(event.nextOccurrenceAt) : ""}
        </span>

        {event?.address ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.address}</span>
          </div>
        ) : null}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="text-sm font-bold text-foreground">
          {ticket.totalPriceNaira > 0
            ? formatNaira(ticket.totalPriceNaira)
            : "Free"}
        </span>
        {ticket.ticketCategoryName ? (
          <span className="text-xs text-muted-foreground">
            {ticket.ticketCategoryName}
          </span>
        ) : null}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
};

export default TicketListItem;
