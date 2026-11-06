"use client";

import { Eyebrow, PANEL } from "@/components/organizer/organizer-primitives";
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
import { POSTER_TONES } from "@/components/vera/event-poster";
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
      <div>
        <Skeleton className="h-[400px] w-full rounded-[28px]" />
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
    <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h2 style={{ lineHeight: 1 }} className="text-[clamp(26px,2.6vw,34px)] font-extrabold tracking-[-0.035em]">
          put it in front of <span className="text-primary">more people.</span>
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          You are at {percent}% capacity.{" "}
          {remaining.toLocaleString("en-NG")} tickets left.
        </p>

        <span className="mt-6 mb-2 block text-sm font-bold">
          Where it shows
        </span>
        <div className="rounded-[24px] p-5" style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2A220C] text-[#E6C56B]">
              <Check className="h-3 w-3" strokeWidth={4} />
            </span>
            <div className="min-w-0">
              <div className="text-[15px] font-bold">
                Featured on the home feed
              </div>
              <p className="mt-1 text-[13px] leading-relaxed font-medium text-pretty opacity-80">
                Top of the feed for everyone browsing events near you, above the
                follow-based results.
              </p>
            </div>
          </div>
          <div aria-hidden="true" className="my-4 border-t-2 border-dashed border-current opacity-25" />
          <div className="flex items-baseline justify-between">
            <span className="text-[22px] font-extrabold tracking-[-0.03em] tabular-nums">
              {formatNairaAmount(availability?.feePerDayNaira ?? 0)}
              <span className="text-xs font-semibold"> / day</span>
            </span>
            <span className="text-[13px] font-semibold opacity-75 tabular-nums">
              {availability
                ? `${availability.availability.length - blockedDays.length} of ${availability.availability.length} days free`
                : "checking availability"}
            </span>
          </div>
        </div>

        <span className="mt-6 mb-2 block text-sm font-bold">
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

        <span className="mt-6 mb-2 block text-sm font-bold">
          How long
        </span>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={days === option}
              onClick={() => setDays(option)}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center rounded-full border-[1.5px] px-4 text-sm font-semibold transition-colors",
                days === option
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground hover:border-foreground",
              )}
            >
              {option} days
            </button>
          ))}
        </div>

        {blockedDays.length > 0 ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-[18px] p-4" style={{ backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg }}>
            <TriangleAlert className="mt-px h-4 w-4 shrink-0" />
            <p className="text-[13px] leading-relaxed font-semibold">
              {blockedDays.length === 1
                ? "One day in this run is already full."
                : `${blockedDays.length} days in this run are already full.`}{" "}
              Pick a different start date, or a shorter run.
            </p>
          </div>
        ) : null}

        <Card className={cn(PANEL, "mt-6 gap-0 py-0")}>
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
            <div className="text-[17px] leading-snug font-bold">
              How it will look
            </div>
            <Badge variant="outline">Home feed</Badge>
          </div>
          <hr className="ticket-perforation" />
          <div className="px-5 pt-4 pb-5 sm:px-6">
            <div className="flex flex-row items-stretch overflow-hidden rounded-[22px] border-[1.5px] border-border">
              <div className="flex w-24 shrink-0 items-center justify-center overflow-hidden bg-secondary text-muted-foreground">
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
                <div className="mt-2 truncate text-base font-bold">
                  {event.name}
                </div>
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                  {event.address}
                  {ticketPrice > 0
                    ? ` · from ${formatNairaAmount(ticketPrice)}`
                    : " · free"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-3 lg:sticky lg:top-20 lg:w-[392px] lg:shrink-0">
        <Card className={cn(PANEL, "gap-0 py-0")}>
          <div className="px-5 py-4.5">
            <Eyebrow>Featured on the home feed</Eyebrow>
            {availabilityQuery.isLoading ? (
              <Skeleton className="mt-2 h-9 w-40" />
            ) : (
              <div className="mt-1.5 text-[44px] leading-none font-extrabold tracking-[-0.045em] tabular-nums">
                {formatNairaAmount(total)}
              </div>
            )}
            <div className="mt-0.5 text-xs text-muted-foreground">
              {days} days, starting when payment clears
            </div>
          </div>
          <hr className="ticket-perforation" />
          <div className="flex flex-col gap-2.5 px-5 py-4 sm:px-6 sm:py-5">
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
          <div className="border-t-[1.5px] border-border px-5 py-4 sm:px-6 sm:py-5">
            <Button
              variant="ink"
              size="lg"
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

        <p className="flex items-start gap-2.5 px-2 text-[13px] leading-relaxed text-pretty text-muted-foreground">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
          Featured events sit above the follow-based feed for everyone browsing in your area.
        </p>
      </div>
    </div>
  );
};

export default PromotePage;
