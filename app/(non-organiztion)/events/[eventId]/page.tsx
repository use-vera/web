"use client";

import { EventDetails } from "@/components/events/event-details";
import {
  AddOnPicker,
  type AddOnSelection,
} from "@/components/events/add-on-picker";
import { TicketPurchasePanel } from "@/components/events/ticket-purchase-panel";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { ResaleMarketplace } from "@/components/resale/resale-marketplace";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hostOf, placeOf } from "@/components/vera/event-format";
import EventPoster from "@/components/vera/event-poster";
import { useSession } from "@/lib/hooks/use-auth";
import { useEvent } from "@/lib/hooks/use-events";
import { useResaleMarketplace } from "@/lib/hooks/use-resale";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

type Tab = "details" | "resale";

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  /* Published landing pages link straight to a tier: /events/:id?tier=… */
  const requestedTier = useSearchParams().get("tier") ?? undefined;
  const [tab, setTab] = useState<Tab>("details");
  const [addOnSelection, setAddOnSelection] = useState<AddOnSelection>({});

  const eventQuery = useEvent(eventId);
  const session = useSession();
  const signedIn = Boolean(session.data?.user);
  const { openAuthModal } = useAuthModal();
  const marketplaceQuery = useResaleMarketplace(eventId, 1, signedIn);

  const event = eventQuery.data?.event;
  const listings = marketplaceQuery.data?.items ?? [];
  const resaleCount = marketplaceQuery.data?.totalItems ?? 0;

  if (eventQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(16px,3vw,40px)] pb-24">
        <Skeleton className="h-[clamp(240px,32vw,420px)] w-full rounded-[36px]" />
        <Skeleton className="mt-8 h-14 w-2/3 max-w-xl" />
      </main>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          We couldn&apos;t find that event. It may have been taken down.
        </p>
      </main>
    );
  }

  const faceValue = event.ticketPriceNaira || 0;
  /* The event's own resale policy. The backend default is 25%, but an
     organizer can set their own ceiling per event. */
  const markupPercent = event.resale?.maxMarkupPercent ?? 25;
  const ceiling = Math.round(faceValue * (1 + markupPercent / 100));
  const soldOut = (event.remainingTickets ?? 0) <= 0;

  const host = hostOf(event);
  const when = event.nextOccurrenceAt || event.startsAt;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(16px,3vw,40px)] pb-24">
        {/* The poster, as big as the app draws it: the event's photo, or its flat colour with the name set huge. */}
        <EventPoster
          seed={event._id}
          title={event.name}
          tag={host || undefined}
          imageUrl={event.imageUrl}
          imageVariant="hero"
          className="min-h-[clamp(240px,32vw,420px)] rounded-[36px]"
          titleClassName="text-[clamp(52px,9vw,140px)] tracking-[-0.055em]"
          badge={
            <span className="flex h-[34px] items-center gap-2 rounded-full bg-[#16150F] px-3.5 text-sm font-bold text-[#F5F3EF]">
              <span className={cn("h-2 w-2 rounded-full", soldOut ? "bg-[#F0B9C7]" : "bg-[#15C67C]")} />
              {soldOut ? "Sold out" : "On sale"}
            </span>
          }
        />

        <div className="flex flex-col gap-2.5 pt-[clamp(24px,4vw,44px)]">
          <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(40px,5vw,64px)] font-extrabold tracking-[-0.045em]">
            {event.name}
          </h1>
          <span className="text-base text-muted-foreground">
            {[
              new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(when)),
              placeOf(event),
              `${(event.soldTickets || 0).toLocaleString("en-NG")} going`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>

        <div role="tablist" aria-label="Event sections" className="mt-7 flex gap-7 border-b border-border">
          {(
            [
              ["details", "About", null],
              ["resale", "Resale", resaleCount],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "-mb-px cursor-pointer border-b-[2.5px] pb-3.5 text-lg font-bold transition-colors",
                tab === value ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {count ? <span className="ml-1.5 text-muted-foreground tabular-nums">· {count}</span> : null}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8 pt-8 lg:flex-row lg:items-start lg:gap-16">
          <div className="min-w-0 flex-1">
            {tab === "details" ? (
              <div>
                {(event.addOns ?? []).length ? (
                  <section className="mb-9">
                    <h2 style={{ lineHeight: 1 }} className="text-[28px] font-extrabold tracking-[-0.03em]">
                      add to your ticket.
                    </h2>
                    <p className="mt-2 text-[15px] text-muted-foreground">
                      Optional extras, added to this ticket only. Collected at
                      the event.
                    </p>
                    <div className="mt-4">
                      <AddOnPicker
                        addOns={event.addOns ?? []}
                        selection={addOnSelection}
                        onChange={setAddOnSelection}
                      />
                    </div>
                  </section>
                ) : null}

                <EventDetails
                  event={event}
                  ratings={
                    eventQuery.data?.ratings ?? {
                      averageRating: 0,
                      ratingsCount: 0,
                      items: [],
                    }
                  }
                />
                {resaleCount > 0 ? (
                  <div className="flex flex-row items-center gap-4 border-y border-border py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold">
                        {resaleCount} {resaleCount === 1 ? "ticket" : "tickets"}{" "}
                        on resale
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        From people who can no longer make it.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="line"
                      onClick={() => setTab("resale")}
                    >
                      See resale
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : !signedIn && !session.isLoading ? (
              <div className="flex flex-col items-start gap-3.5 border-y border-border py-10">
                <span style={{ lineHeight: 0.95 }} className="text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-0.04em]">
                  sign in to see <span className="text-primary">resale.</span>
                </span>
                <span className="max-w-md text-base text-muted-foreground">
                  Tickets here come from people who can no longer go. Sign in to see what&apos;s listed and make an offer.
                </span>
                <Button variant="ink" onClick={() => openAuthModal({ view: "sign-in" })}>
                  Sign in
                </Button>
              </div>
            ) : (
              <ResaleMarketplace
                listings={listings}
                isLoading={session.isLoading || marketplaceQuery.isLoading}
                isError={marketplaceQuery.isError}
                onRetry={() => marketplaceQuery.refetch()}
                faceValue={faceValue}
                ceiling={ceiling}
                markupPercent={markupPercent}
              />
            )}
          </div>

          <div className="order-first w-full lg:sticky lg:top-24 lg:order-none lg:w-[380px] lg:shrink-0">
            <TicketPurchasePanel
              event={event}
              initialTierId={requestedTier}
              addOnSelection={addOnSelection}
            />

            <p className="mt-4 flex items-start gap-2.5 px-2 text-[13px] leading-relaxed text-pretty text-muted-foreground">
              <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Never pay a seller outside Vera. A ticket only transfers when it is paid for here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventPage;
