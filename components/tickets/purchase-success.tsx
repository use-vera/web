"use client";

import TicketPassCard from "@/components/tickets/ticket-pass-card";
import { buttonVariants } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format-date";
import {
  type MyTicketApi,
  type TicketEventSummaryApi,
} from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const resolveEvent = (
  eventId: MyTicketApi["eventId"],
): TicketEventSummaryApi | null =>
  typeof eventId === "string" ? null : eventId;

/**
 * The end of the purchase flow, and the moment people remember, so it opens
 * with a confirmation rather than dropping straight into ticket codes.
 *
 * Multiple tickets are paged, not stacked. Each seat gets its own scannable
 * code and they are presented one at a time at the door, so a horizontal
 * pager matches how they are actually used; stacking five full passes in a
 * modal produced a wall of near-identical cards nobody could navigate.
 */
export const PurchaseSuccess = ({
  tickets,
  onDone,
}: {
  tickets: MyTicketApi[];
  onDone: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const event = resolveEvent(tickets[0]?.eventId);
  const many = tickets.length > 1;

  /* Derive the page from scroll position so swiping, dragging and the dots
     all stay in agreement without duplicating state. */
  const handleScroll = () => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const width = track.clientWidth || 1;
    const next = Math.round(track.scrollLeft / width);

    if (next !== index) {
      setIndex(next);
    }
  };

  const goTo = (next: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollTo({
      left: next * track.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div className="flex flex-col">
      {/* One orchestrated reveal: the mark, then the words, then the ticket. */}
      <header className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-300">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:delay-100 motion-safe:duration-300 motion-safe:fill-mode-both">
          <h2 className="text-xl font-bold tracking-[-0.01em] text-balance">
            {many ? `${tickets.length} tickets are yours` : "You're going"}
          </h2>
          {event ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {event.name}
              <span className="mx-1.5 opacity-50">·</span>
              {formatEventDate(event.nextOccurrenceAt)}
            </p>
          ) : null}
        </div>
      </header>

      <hr className="ticket-perforation" />

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200 motion-safe:duration-300 motion-safe:fill-mode-both">
        {many ? (
          <>
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  /* Slightly under full width so the next pass peeks past the
                     edge. The cue that there is more to swipe to. */
                  className="w-[calc(100%-2rem)] shrink-0 snap-center"
                >
                  <TicketPassCard ticket={ticket} showGuidance={false} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pb-1">
              <div className="flex gap-1.5">
                {tickets.map((ticket, dot) => (
                  <button
                    key={ticket._id}
                    type="button"
                    aria-label={`Show ticket ${dot + 1}`}
                    aria-current={dot === index ? "true" : undefined}
                    onClick={() => goTo(dot)}
                    className={cn(
                      "h-1.5 cursor-pointer rounded-full transition-all duration-200",
                      dot === index
                        ? "w-5 bg-primary"
                        : "w-1.5 bg-border hover:bg-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                Ticket {Math.min(index + 1, tickets.length)} of {tickets.length}
              </span>
            </div>
          </>
        ) : (
          <div className="px-6 py-5">
            <TicketPassCard ticket={tickets[0]} showGuidance={false} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-muted/50 px-6 py-5">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {many
            ? "Every ticket has its own code. Scan them one at a time at the door."
            : "Show this code at the entrance, or read out the ticket ID if scanning fails."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Link
            href="/account/tickets"
            className={cn(buttonVariants(), "flex-1 active:scale-[0.96]")}
          >
            {many ? "See all my tickets" : "See it in my tickets"}
          </Link>
          <button
            type="button"
            onClick={onDone}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 active:scale-[0.96]",
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
