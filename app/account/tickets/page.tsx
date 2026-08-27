"use client";

import { EmptyState, ErrorState } from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import Badge from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount } from "@/lib/format-currency";
import { useMyTickets } from "@/lib/hooks/use-tickets";
import { type MyTicketApi, type TicketEventSummaryApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_SIZE = 20;

const eventOf = (eventId: MyTicketApi["eventId"]): TicketEventSummaryApi | null =>
  typeof eventId === "string" ? null : eventId;

const AccountTicketsPage = () => {
  const [page, setPage] = useState(1);
  const ticketsQuery = useMyTickets({ page, limit: PAGE_SIZE });
  const tickets = ticketsQuery.data?.items ?? [];

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Tickets
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything you have bought, and anything you have listed for resale.
        </p>
      </header>

      <div className="flex flex-col gap-2.5 px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        {ticketsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[88px] w-full rounded-sm" />
          ))
        ) : ticketsQuery.isError ? (
          <ErrorState
            message="Couldn't load your tickets."
            onRetry={() => ticketsQuery.refetch()}
          />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-6 w-6" />}
            title="No tickets yet"
            description="Tickets you buy show up here, with the QR you scan at the door."
            action={
              <Link href="/events" className={cn(buttonVariants())}>
                Find an event
              </Link>
            }
          />
        ) : (
          tickets.map((ticket) => {
            const event = eventOf(ticket.eventId);
            const listed = ticket.resaleStatus === "listed";

            return (
              <Card key={ticket._id} className="gap-0 py-0">
                <Link
                  href={`/account/tickets/${ticket._id}`}
                  className="flex items-center gap-4 rounded-sm p-4 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-base leading-snug font-semibold">
                        {event?.name ?? "Event"}
                      </span>
                      {listed ? <Badge>Listed for resale</Badge> : null}
                      {ticket.status === "used" ? (
                        <Badge variant="outline">Checked in</Badge>
                      ) : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[13px] text-muted-foreground">
                      {event ? (
                        <>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{event.address}</span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Intl.DateTimeFormat("en-NG", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }).format(new Date(event.nextOccurrenceAt))}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatNairaAmount(ticket.totalPriceNaira)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.ticketCategoryName || "General"}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
                {event ? (
                  <div className="border-t border-border/60 px-4 py-2">
                    <Link
                      href={`/events/${event._id}`}
                      className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      Open the event page
                    </Link>
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>

      {!ticketsQuery.isLoading && tickets.length > 0 ? (
        <Pagination
          page={ticketsQuery.data?.page ?? 1}
          totalPages={ticketsQuery.data?.totalPages ?? 1}
          totalItems={ticketsQuery.data?.totalItems ?? 0}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          noun="ticket"
          className="px-4 pt-4 sm:px-6 lg:px-4 sm:px-6 lg:px-8"
        />
      ) : null}
    </div>
  );
};

export default AccountTicketsPage;
