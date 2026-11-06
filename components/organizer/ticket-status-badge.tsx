import Badge from "@/components/ui/badge";
import { type EventTicketApi } from "@/lib/types/organizer";

/** A ticket's state in words an organizer uses: "Checked in", not "used". */
export const TicketStatusBadge = ({
  status,
}: {
  status: EventTicketApi["status"];
}) => {
  if (status === "paid") {
    return (
      <Badge>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Paid
      </Badge>
    );
  }

  if (status === "used") {
    return <Badge variant="solid">Checked in</Badge>;
  }

  if (status === "refunded" || status === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/60 text-destructive"
      >
        {status === "refunded" ? "Refunded" : "Cancelled"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      {status === "pending" ? "Pending" : "Expired"}
    </Badge>
  );
};
