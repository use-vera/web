"use client";

import {
  StatStrip,
} from "@/components/organizer/organizer-primitives";
import { SalesBarChart } from "@/components/organizer/sales-bar-chart";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount } from "@/lib/format-currency";
import { useEventRatings, useEventTickets, useOrganizerEvent } from "@/lib/hooks/use-organizer";
import { buildDailySeries } from "@/lib/organizer-series";
import { type EventRatingApi } from "@/lib/types/event";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const raterName = (rating: EventRatingApi) =>
  typeof rating.userId === "string" ? "Attendee" : rating.userId.fullName;

const InsightsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = useOrganizerEvent(eventId);
  const ratingsQuery = useEventRatings(eventId);
  const ticketsQuery = useEventTickets(eventId, { limit: 50 });

  const event = eventQuery.data?.event;
  const ratings = ratingsQuery.data;
  const tickets = useMemo(
    () => ticketsQuery.data?.items ?? [],
    [ticketsQuery.data],
  );

  const derived = useMemo(() => {
    const settled = tickets.filter(
      (ticket) => ticket.status === "paid" || ticket.status === "used",
    );
    const gross = settled.reduce(
      (sum, ticket) => sum + (ticket.totalPriceNaira || 0),
      0,
    );
    const seats = settled.reduce((sum, ticket) => sum + (ticket.quantity || 1), 0);
    const admitted = tickets.filter((ticket) => ticket.status === "used").length;

    return {
      averageSpend: seats > 0 ? Math.round(gross / seats) : 0,
      checkInRate:
        settled.length > 0 ? Math.round((admitted / settled.length) * 100) : 0,
    };
  }, [tickets]);

  const series = useMemo(() => buildDailySeries(tickets, 21), [tickets]);
  const seriesTotal = useMemo(
    () => series.reduce((sum, point) => sum + point.value, 0),
    [series],
  );

  /* Distribution is counted from the ratings actually loaded. The backend
     returns the list plus an average, not a pre-bucketed histogram. */
  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: (ratings?.items ?? []).filter(
        (rating) => Math.round(rating.rating) === stars,
      ).length,
    }));
    const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

    return { buckets, max };
  }, [ratings]);

  if (eventQuery.isLoading || !event) {
    return (
      <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <Skeleton className="h-[92px] w-full rounded-sm" />
        <Skeleton className="h-[260px] w-full rounded-sm" />
      </div>
    );
  }

  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const sellThrough = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5 px-4 py-5 pb-8 sm:px-6 lg:px-8">
      <StatStrip
        cells={[
          {
            label: "Sell-through",
            value: `${sellThrough}%`,
            note: `${sold.toLocaleString("en-NG")} of ${capacity.toLocaleString("en-NG")}`,
          },
          {
            label: "Average spend",
            value: formatNairaAmount(derived.averageSpend),
            note: "per ticket sold",
          },
          {
            label: "Rating",
            value: (ratings?.averageRating ?? 0).toFixed(1),
            note: `from ${(ratings?.ratingsCount ?? 0).toLocaleString("en-NG")} attendees`,
          },
          {
            label: "Checked in",
            value: `${derived.checkInRate}%`,
            note: "of tickets loaded here",
          },
        ]}
      />

      <Card className="gap-0 py-0">
        <div className="flex items-baseline justify-between px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <div className="text-base leading-snug font-semibold">
              Tickets sold per day
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {seriesTotal} {seriesTotal === 1 ? "ticket" : "tickets"} across the
              last 21 days, from the tickets loaded here
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          {ticketsQuery.isLoading ? (
            <Skeleton className="h-[170px] w-full rounded-md" />
          ) : (
            <SalesBarChart points={series} labelEvery={5} />
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
        <Card className="w-full lg:w-[420px] lg:shrink-0 gap-0 py-0">
          <div className="px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="text-base leading-snug font-semibold">
              How the night landed
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {(ratings?.ratingsCount ?? 0).toLocaleString("en-NG")} ratings
            </div>
          </div>
          <div className="flex flex-col gap-2.5 px-5 pb-5">
            {ratingsQuery.isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-2 w-full rounded-full" />
                ))
              : distribution.buckets.map((bucket) => (
                  <div key={bucket.stars} className="flex items-center gap-2.5">
                    <span className="inline-flex w-8 items-center gap-1 text-muted-foreground">
                      <span className="text-xs font-semibold tabular-nums">
                        {bucket.stars}
                      </span>
                      <Star className="h-3 w-3" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={
                          bucket.stars >= 4
                            ? "h-full rounded-full bg-primary"
                            : "h-full rounded-full bg-border"
                        }
                        style={{
                          width: `${(bucket.count / distribution.max) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
                      {bucket.count}
                    </span>
                  </div>
                ))}
          </div>
        </Card>

        <Card className="min-w-0 flex-1 gap-0 py-0">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="text-base leading-snug font-semibold">
              What they wrote
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Most recent
            </span>
          </div>
          <hr className="ticket-perforation" />
          <div className="px-5 py-1 pb-2.5">
            {ratingsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="my-3 h-12 w-full rounded-md" />
              ))
            ) : (ratings?.items ?? []).filter((rating) => rating.review).length ===
              0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No written reviews yet. They arrive the morning after.
              </p>
            ) : (
              (ratings?.items ?? [])
                .filter((rating) => rating.review)
                .slice(0, 3)
                .map((rating) => (
                  <div key={rating._id} className="flex gap-3 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground outline outline-foreground/10 -outline-offset-1">
                      {raterName(rating)
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">
                          {raterName(rating)}
                        </span>
                        <span className="inline-flex gap-px text-primary">
                          {Array.from({ length: Math.round(rating.rating) }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                className="h-[11px] w-[11px] fill-current"
                              />
                            ),
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                        {rating.review}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
