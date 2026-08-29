"use client";

import { EventDetails } from "@/components/events/event-details";
import { TicketPurchasePanel } from "@/components/events/ticket-purchase-panel";
import { ResaleMarketplace } from "@/components/resale/resale-marketplace";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/lib/hooks/use-events";
import { useResaleMarketplace } from "@/lib/hooks/use-resale";
import { cloudinaryVariant } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Ticket, TriangleAlert, Users } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

type Tab = "details" | "resale";

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  /* Published landing pages link straight to a tier: /events/:id?tier=… */
  const requestedTier = useSearchParams().get("tier") ?? undefined;
  const [tab, setTab] = useState<Tab>("details");

  const eventQuery = useEvent(eventId);
  const marketplaceQuery = useResaleMarketplace(eventId);

  const event = eventQuery.data?.event;
  const listings = marketplaceQuery.data?.items ?? [];
  const resaleCount = marketplaceQuery.data?.totalItems ?? 0;

  if (eventQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Skeleton className="h-[280px] w-full rounded-sm" />
        <Skeleton className="mt-6 h-10 w-96" />
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

  return (
    <main className="flex flex-1 flex-col">
      <div className="ticket-dot-texture relative h-[180px] shrink-0 bg-muted sm:h-[240px] lg:h-[280px]">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryVariant(event.imageUrl, "hero")}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Ticket className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <div className="pt-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl leading-tight font-bold tracking-[-0.02em] sm:text-3xl">
              {event.name}
            </h1>
            {soldOut ? (
              <Badge variant="solid">Sold out</Badge>
            ) : (
              <Badge>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                On sale
              </Badge>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-[15px] w-[15px]" />
              {event.address}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-[15px] w-[15px]" />
              {new Intl.DateTimeFormat("en-NG", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(event.nextOccurrenceAt))}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Users className="h-[15px] w-[15px]" />
              {(event.soldTickets || 0).toLocaleString("en-NG")} going
            </span>
          </div>
        </div>

        <nav className="mt-5 flex gap-6 overflow-x-auto" aria-label="Event sections">
          {(
            [
              ["details", "Details", null],
              ["resale", "Resale", resaleCount],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              aria-current={tab === value ? "page" : undefined}
              className={cn(
                "cursor-pointer border-b-2 pb-3 text-sm transition-colors",
                tab === value
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {count ? (
                <span className="ml-1.5 font-medium text-muted-foreground tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <hr className="ticket-perforation" />

        <div className="flex items-start gap-7 pt-6">
          <div className="min-w-0 flex-1">
            {tab === "details" ? (
              <div>
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
                  <Card className="mt-7 flex-row items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold">
                        {resaleCount} {resaleCount === 1 ? "ticket" : "tickets"}{" "}
                        on resale
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        From people who can no longer make it.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTab("resale")}
                    >
                      See resale
                    </Button>
                  </Card>
                ) : null}
              </div>
            ) : (
              <ResaleMarketplace
                listings={listings}
                isLoading={marketplaceQuery.isLoading}
                isError={marketplaceQuery.isError}
                onRetry={() => marketplaceQuery.refetch()}
                faceValue={faceValue}
                ceiling={ceiling}
                markupPercent={markupPercent}
              />
            )}
          </div>

          <div className="w-full lg:sticky lg:top-24 lg:w-[340px] lg:shrink-0">
            <TicketPurchasePanel event={event} initialTierId={requestedTier} />

            <Card className="mt-3 flex-row items-start gap-3 p-4">
              <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                Never pay a seller outside Vera. A ticket only transfers when it
                is paid for here.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventPage;
