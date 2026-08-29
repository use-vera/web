"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useFeatureAvailability,
  useInitializeEventFeature,
  useOrganizerEvent,
} from "@/lib/hooks/use-organizer";
import { cloudinaryVariant } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { Check, Megaphone, Ticket, TrendingUp, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const DURATIONS = [3, 7, 14];

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const PromotePage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data?.event;

  const [startDate, setStartDate] = useState(() => isoDate(new Date()));
  const [days, setDays] = useState(7);

  const availabilityQuery = useFeatureAvailability(startDate, days);
  const initialize = useInitializeEventFeature(eventId);

  const availability = availabilityQuery.data;
  const blockedDays = useMemo(
    () => (availability?.availability ?? []).filter((day) => day.remaining <= 0),
    [availability],
  );

  const promote = async () => {
    try {
      const response = await initialize.mutateAsync({
        startDate,
        days,
        callbackUrl: `${window.location.origin}/organizer/events/${eventId}/promote`,
      });

      if (response.requiresPayment && response.payment?.authorizationUrl) {
        window.location.href = response.payment.authorizationUrl;
        return;
      }

      toast.success("This event is now featured");
      availabilityQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't start featuring"));
    }
  };

  if (eventQuery.isLoading || !event) {
    return (
      <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <Skeleton className="h-[400px] w-full rounded-sm" />
      </div>
    );
  }

  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const remaining = event.remainingTickets ?? Math.max(0, capacity - sold);
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const ticketPrice = event.ticketPriceNaira || 0;
  const total = availability?.totalNaira ?? 0;
  const breakEven =
    ticketPrice > 0 ? Math.ceil(total / ticketPrice) : null;

  return (
    <div className="flex flex-col items-stretch gap-3.5 px-4 lg:flex-row lg:items-start py-5 sm:px-6 lg:px-4 pb-8 sm:px-6 lg:px-4 sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl leading-tight font-bold tracking-[-0.02em]">
          Put this in front of more people
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You are at {percent}% capacity.{" "}
          {remaining.toLocaleString("en-NG")} tickets left.
        </p>

        <span className="mt-5.5 mb-2 block text-[13px] font-semibold">
          Where it shows
        </span>
        <div className="rounded-sm bg-accent p-4.5 shadow-[inset_0_0_0_2px_var(--primary)]">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-2.5 w-2.5" strokeWidth={4} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-accent-foreground">
                Featured on the home feed
              </div>
              <p className="mt-1 text-xs leading-relaxed text-pretty text-accent-foreground/85">
                Top of the feed for everyone browsing events near you, above the
                follow-based results.
              </p>
            </div>
          </div>
          <hr className="ticket-perforation my-3.5" />
          <div className="flex items-baseline justify-between">
            <span className="text-[17px] font-bold tracking-[-0.01em] text-accent-foreground tabular-nums">
              {formatNairaAmount(availability?.feePerDayNaira ?? 0)}
              <span className="text-xs font-semibold"> / day</span>
            </span>
            <span className="text-xs text-accent-foreground/85 tabular-nums">
              {availability
                ? `${availability.availability.length - blockedDays.length} of ${availability.availability.length} days free`
                : "checking availability"}
            </span>
          </div>
        </div>

        <span className="mt-5.5 mb-2 block text-[13px] font-semibold">
          Start from
        </span>
        <OrganizerField
          type="date"
          value={startDate}
          min={isoDate(new Date())}
          onChange={(input) => setStartDate(input.target.value)}
          aria-label="First day to feature this event"
          className="w-full sm:max-w-[240px]"
        />

        <span className="mt-5.5 mb-2 block text-[13px] font-semibold">
          How long
        </span>
        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {DURATIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center rounded-full px-4 text-[13px] font-semibold transition-colors",
                days === option
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option} days
            </button>
          ))}
        </div>

        {blockedDays.length > 0 ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-sm bg-destructive/10 p-3.5">
            <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-destructive" />
            <p className="text-[13px] leading-relaxed text-destructive">
              {blockedDays.length === 1
                ? "One day in this run is already full."
                : `${blockedDays.length} days in this run are already full.`}{" "}
              Pick a different start date, or a shorter run.
            </p>
          </div>
        ) : null}

        <Card className="mt-5.5 gap-0 py-0">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="text-base leading-snug font-semibold">
              How it will look
            </div>
            <Badge variant="outline">Home feed</Badge>
          </div>
          <hr className="ticket-perforation" />
          <div className="px-5 py-4.5">
            <Card className="flex-row items-stretch gap-0 py-0 shadow-[inset_0_0_0_1px_var(--border),0_4px_12px_rgba(22,21,15,0.06)]">
              <div className="flex w-24 shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground">
                {event.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryVariant(event.imageUrl, "thumb")}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Ticket className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Badge variant="solid">
                    <Megaphone className="h-3 w-3" />
                    Featured
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Intl.DateTimeFormat("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(new Date(event.nextOccurrenceAt))}
                  </span>
                </div>
                <div className="mt-2 truncate text-[15px] font-semibold">
                  {event.name}
                </div>
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                  {event.address}
                  {ticketPrice > 0
                    ? ` · from ${formatNairaAmount(ticketPrice)}`
                    : " · free"}
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      <div className="flex w-full lg:w-[392px] lg:shrink-0 flex-col gap-3">
        <Card className="gap-0 py-0">
          <div className="px-5 py-4.5">
            <Eyebrow>Featured on the home feed</Eyebrow>
            {availabilityQuery.isLoading ? (
              <Skeleton className="mt-2 h-9 w-40" />
            ) : (
              <div className="mt-1.5 text-3xl font-bold tracking-[-0.02em] tabular-nums">
                {formatNairaAmount(total)}
              </div>
            )}
            <div className="mt-0.5 text-xs text-muted-foreground">
              {days} days, starting when payment clears
            </div>
          </div>
          <hr className="ticket-perforation" />
          <div className="flex flex-col gap-2.5 px-5 py-4">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Per day</span>
              <span className="font-semibold tabular-nums">
                {formatNairaAmount(availability?.feePerDayNaira ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">Days available</span>
              <span className="font-semibold tabular-nums">
                {(availability?.availability.length ?? 0) - blockedDays.length} of{" "}
                {availability?.availability.length ?? days}
              </span>
            </div>
            {breakEven !== null ? (
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Pays for itself at</span>
                <span className="font-semibold tabular-nums">
                  {breakEven} {breakEven === 1 ? "ticket" : "tickets"}
                </span>
              </div>
            ) : null}
          </div>
          <div className="bg-muted/60 px-5 py-4">
            <Button
              className="w-full"
              onClick={promote}
              loading={initialize.isPending}
              disabled={
                availabilityQuery.isLoading ||
                !availability?.allAvailable ||
                event.status !== "published"
              }
            >
              {total > 0 ? "Pay with Paystack" : "Feature this event"}
            </Button>
            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              {event.status !== "published"
                ? "Publish this event before featuring it."
                : "Charged once. Featuring stops at the end of the run and never renews on its own."}
            </p>
          </div>
        </Card>

        <Card className="flex-row items-start gap-3 p-4">
          <TrendingUp className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
            Featured events sit above the follow-based feed for everyone browsing
            in your area.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PromotePage;
