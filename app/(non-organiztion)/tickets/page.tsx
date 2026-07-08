"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import TicketListItem from "@/components/tickets/ticket-list-item";
import TicketPassCard from "@/components/tickets/ticket-pass-card";
import Button, { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "@/lib/hooks/use-auth";
import { useMyTickets } from "@/lib/hooks/use-tickets";
import { type MyTicketApi, type TicketEventSummaryApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Loader2, Ticket } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "upcoming" | "past";

const resolveEvent = (
  eventId: MyTicketApi["eventId"],
): TicketEventSummaryApi | null =>
  typeof eventId === "string" ? null : eventId;

const isUpcoming = (ticket: MyTicketApi) => {
  if (ticket.status !== "paid") {
    return false;
  }

  const event = resolveEvent(ticket.eventId);

  if (!event) {
    return false;
  }

  return new Date(event.nextOccurrenceEndsAt).getTime() >= Date.now();
};

export default function TicketsPage() {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [selectedTicket, setSelectedTicket] = useState<MyTicketApi | null>(null);

  const isAuthenticated = Boolean(sessionQuery.data?.user);
  const ticketsQuery = useMyTickets();
  const tickets = ticketsQuery.data?.items;

  const { upcoming, past } = useMemo(() => {
    const upcomingItems: MyTicketApi[] = [];
    const pastItems: MyTicketApi[] = [];

    for (const ticket of tickets ?? []) {
      (isUpcoming(ticket) ? upcomingItems : pastItems).push(ticket);
    }

    return { upcoming: upcomingItems, past: pastItems };
  }, [tickets]);

  const visibleTickets = tab === "upcoming" ? upcoming : past;

  if (sessionQuery.isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Sign in to see your tickets
          </h1>
          <p className="text-sm text-muted-foreground">
            Your tickets and entry barcodes are only visible once you&apos;re
            signed in.
          </p>
          <Button
            size="lg"
            onClick={() =>
              openAuthModal({ view: "sign-in", redirectTo: "/tickets" })
            }
          >
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Dashboard
          </span>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Your tickets.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Every ticket you&apos;ve grabbed, with the barcode ready for
            scanning at the door.
          </p>
        </div>

        <div className="mt-8 flex w-fit rounded-full border border-border bg-secondary p-1">
          {(
            [
              { value: "upcoming", label: `Upcoming (${upcoming.length})` },
              { value: "past", label: `Past (${past.length})` },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTab(option.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === option.value
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {ticketsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : visibleTickets.length ? (
            visibleTickets.map((ticket) => (
              <TicketListItem
                key={ticket._id}
                ticket={ticket}
                onSelect={setSelectedTicket}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
              <p className="text-base font-semibold text-card-foreground">
                {tab === "upcoming"
                  ? "No upcoming tickets yet."
                  : "No past tickets yet."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "upcoming"
                  ? "Grab a ticket and it'll show up here."
                  : "Tickets from events that have ended will show up here."}
              </p>
              {tab === "upcoming" ? (
                <Link href="/events" className={cn(buttonVariants(), "mt-5")}>
                  Browse events
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
          }
        }}
      >
        <DialogContent aria-describedby={undefined} className="p-0">
          {selectedTicket ? <TicketPassCard ticket={selectedTicket} /> : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
