import Badge from "@/components/ui/badge";
import { getOrganizerEventBadge } from "@/lib/event-status";
import { type OrganizerEventApi } from "@/lib/types/organizer";
import { Repeat } from "lucide-react";

const Dot = ({ className }: { className: string }) => (
  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} />
);

export const EventStatusBadge = ({ event }: { event: OrganizerEventApi }) => {
  const badge = getOrganizerEventBadge(event);

  if (badge === "draft") {
    return (
      <Badge variant="outline">
        <Dot className="bg-muted-foreground" />
        Draft
      </Badge>
    );
  }

  if (badge === "cancelled") {
    return <Badge variant="outline">Cancelled</Badge>;
  }

  if (badge === "ended") {
    return <Badge variant="outline">Ended</Badge>;
  }

  if (badge === "sold-out") {
    return <Badge variant="solid">Sold out</Badge>;
  }

  return (
    <Badge>
      <Dot className="bg-primary" />
      Live
    </Badge>
  );
};

export const RecurringBadge = () => (
  <Badge variant="outline">
    <Repeat className="h-3 w-3" />
    Recurring
  </Badge>
);
