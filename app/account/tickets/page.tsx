"use client";

import { ErrorState } from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventPoster, { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { shortWhen } from "@/components/vera/event-format";
import { formatNairaAmount } from "@/lib/format-currency";
import { useMyTickets } from "@/lib/hooks/use-tickets";
import { type MyTicketApi, type TicketEventSummaryApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

/* Refunded and cancelled lines are not the holder's any more, so the card
   only advertises what they can actually collect. */
const heldAddOns = (ticket: MyTicketApi) => (ticket.addOns ?? []).filter((purchase) => ["paid", "redeemed"].includes(purchase.status));

const PAGE_SIZE = 20;

const eventOf = (eventId: MyTicketApi["eventId"]): TicketEventSummaryApi | null => (typeof eventId === "string" ? null : eventId);

const isPast = (event: TicketEventSummaryApi | null) => (event?.nextOccurrenceEndsAt ? new Date(event.nextOccurrenceEndsAt).getTime() < Date.now() : false);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-7 items-center rounded-full bg-background px-3 text-xs font-bold text-foreground">{children}</span>
);

/** A ticket as the app draws it: the event's poster colour all round, the artwork inset, the stub underneath. */
const TicketCard = ({ ticket }: { ticket: MyTicketApi }) => {
  const event = eventOf(ticket.eventId);
  const seed = event?._id ?? ticket._id;
  const tone = toneFor(seed);
  const colours = POSTER_TONES[tone];
  const past = isPast(event);
  const addOns = heldAddOns(ticket);

  return (
    <Link
      href={`/account/tickets/${ticket._id}`}
      className={cn(
        "group flex flex-col gap-1 rounded-[30px] p-2.5 transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        tone === "cream" && "ring-1 ring-border ring-inset",
        past && "opacity-70 hover:opacity-100",
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      <EventPoster
        seed={seed}
        tone={event?.imageUrl ? tone : "ink"}
        title={event?.name ?? "Event"}
        tag={event ? shortWhen(event.nextOccurrenceAt) : undefined}
        imageUrl={event?.imageUrl}
        className="aspect-[16/10] w-full rounded-[22px]"
        titleClassName="text-[clamp(26px,2.6vw,36px)]"
        badge={
          ticket.resaleStatus === "listed" ? (
            <Chip>Listed for resale</Chip>
          ) : ticket.status === "used" ? (
            <Chip>Checked in</Chip>
          ) : past ? (
            <Chip>Been</Chip>
          ) : null
        }
      />

      <div className="flex flex-col gap-1.5 px-3 pt-3">
        <span style={{ lineHeight: 1.05 }} className="line-clamp-2 text-[22px] font-extrabold tracking-[-0.03em]">
          {event?.name ?? "Event"}
        </span>
        {event ? (
          <span className="truncate text-sm font-semibold opacity-75">{[shortWhen(event.nextOccurrenceAt), event.address].filter(Boolean).join(" · ")}</span>
        ) : null}
      </div>

      {/* The tear between ticket and stub, cut in the card's own colour. */}
      <div aria-hidden="true" className="relative mx-3 my-3 border-t-2 border-dashed border-current opacity-25" />

      <div className="flex items-center justify-between gap-3 px-3 pb-2">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-bold">
            {ticket.ticketCategoryName || "General"}
            {ticket.quantity > 1 ? ` × ${ticket.quantity}` : ""}
          </span>
          {addOns.length ? (
            <span className="truncate text-[13px] font-semibold opacity-75">+ {addOns.map((purchase) => purchase.name).join(", ")}</span>
          ) : null}
        </span>
        <span className="shrink-0 text-[17px] font-extrabold tabular-nums">{formatNairaAmount(ticket.totalPriceNaira)}</span>
      </div>
    </Link>
  );
};

const AccountTicketsPage = () => {
  const [page, setPage] = useState(1);
  const ticketsQuery = useMyTickets({ page, limit: PAGE_SIZE });
  const tickets = ticketsQuery.data?.items ?? [];

  return (
    <section aria-label="Your tickets" className="flex flex-col gap-6">
      {ticketsQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[380px] w-full rounded-[30px]" />
          ))}
        </div>
      ) : ticketsQuery.isError ? (
        <ErrorState message="Couldn't load your tickets." onRetry={() => ticketsQuery.refetch()} />
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-[30px] px-[clamp(20px,4vw,48px)] py-[clamp(28px,5vw,56px)]" style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}>
          <h2 style={{ lineHeight: 0.95 }} className="text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.045em]">
            no tickets yet.
          </h2>
          <p className="max-w-md text-base font-semibold opacity-80">Tickets you buy show up here, with the QR you scan at the door.</p>
          <Link href="/events" className={cn(buttonVariants({ variant: "ink" }), "mt-2")}>
            Find an event
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[15px] text-muted-foreground">Everything you have bought, and anything you have listed for resale.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
          <Pagination
            page={ticketsQuery.data?.page ?? 1}
            totalPages={ticketsQuery.data?.totalPages ?? 1}
            totalItems={ticketsQuery.data?.totalItems ?? 0}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            noun="ticket"
          />
        </>
      )}
    </section>
  );
};

export default AccountTicketsPage;
