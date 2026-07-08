"use client";

import PerforatedDivider from "@/components/perforated-divider";
import TicketQrCode from "@/components/tickets/ticket-qr-code";
import { formatEventDate } from "@/lib/format-date";
import {
  type MyTicketApi,
  type TicketEventSummaryApi,
} from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Calendar, Check, Copy, MapPin } from "lucide-react";
import { useState } from "react";

interface TicketPassCardProps {
  ticket: MyTicketApi;
}

const resolveEvent = (
  eventId: MyTicketApi["eventId"],
): TicketEventSummaryApi | null =>
  typeof eventId === "string" ? null : eventId;

const STATUS_LABEL: Record<MyTicketApi["status"], string> = {
  paid: "Valid ticket",
  used: "Checked in",
  pending: "Awaiting payment",
  cancelled: "Cancelled",
  expired: "Expired",
};

const TicketPassCard = ({ ticket }: TicketPassCardProps) => {
  const [copied, setCopied] = useState(false);
  const event = resolveEvent(ticket.eventId);
  const isUsed = ticket.status === "used";
  const isInactive =
    isUsed || ticket.status === "cancelled" || ticket.status === "expired";
  const codeValue = (ticket.barcodeValue || ticket.ticketCode || "").trim();
  const displayCode = (ticket.ticketCode || codeValue || "VRA-CODE").trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card">
      <div
        className={cn(
          "flex flex-col gap-2 p-6 text-primary-foreground",
          isInactive ? "bg-muted-foreground" : "bg-primary",
        )}
      >
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
          {STATUS_LABEL[ticket.status]}
        </span>
        <h3 className="text-xl font-bold leading-snug text-background">
          {event?.name ?? "Event ticket"}
        </h3>
        {event ? (
          <div className="flex flex-col gap-1 text-sm text-background/85 ">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {formatEventDate(event.nextOccurrenceAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
          </div>
        ) : null}
      </div>

      <PerforatedDivider />

      <div className="flex flex-col items-center gap-5 p-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ticket holder
            </span>
            <span className="text-sm font-bold text-card-foreground">
              {ticket.attendeeName || "Guest"}
            </span>
          </div>

          {ticket.ticketCategoryName ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              {ticket.ticketCategoryName}
            </span>
          ) : null}
        </div>

        <TicketQrCode
          value={codeValue || displayCode}
          size={192}
          className={cn(isUsed && "opacity-50")}
        />

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-left"
        >
          <span className="flex-1 truncate text-sm font-bold tracking-wide text-foreground">
            {displayCode}
          </span>
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              copied ? "text-primary" : "text-muted-foreground",
            )}
          >
            {copied ? "Copied" : "Copy"}
          </span>
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {isUsed
            ? "This ticket has already been used and cannot be checked in again."
            : isInactive
              ? "This ticket is no longer valid for entry."
              : "Present this code at the entrance, or share the ticket ID if scanning isn't possible."}
        </p>
      </div>
    </div>
  );
};

export default TicketPassCard;
