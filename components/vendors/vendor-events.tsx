"use client";

import { EventDateTile } from "@/components/organizer/event-row";
import { DESK, ErrorState, PageHeader, Panel, solidOnTone } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useApplyToEvent,
  useMyBookings,
  useOpenEventsForVendor,
  useRespondToInvite,
  useVerifyStallFee,
} from "@/lib/hooks/use-vendor";
import { type VendorBooking } from "@/lib/types/vendor";
import { cn } from "@/lib/utils";
import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const termsLine = (terms: VendorBooking["terms"]) =>
  [
    terms.stallFeeNaira
      ? `${formatNairaAmount(terms.stallFeeNaira)} stall fee`
      : "No stall fee",
    terms.stallLabel || null,
  ]
    .filter(Boolean)
    .join(" · ");

/** Time left on a hold, in the words a vendor would use. */
const timeLeft = (dueAt: string) => {
  const minutes = Math.floor(
    (new Date(dueAt).getTime() - Date.now()) / 60_000,
  );

  if (minutes <= 0) {
    return "any moment";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m`;
};

const InvitationCard = ({ booking }: { booking: VendorBooking }) => {
  const respond = useRespondToInvite();
  const verifyStallFee = useVerifyStallFee();
  const [note, setNote] = useState("");
  const [declining, setDeclining] = useState(false);
  const [paying, setPaying] = useState(false);

  /**
   * Paystack in a popup, then verify with retry: the popup closing and the
   * webhook landing race each other, and the spot is only really yours once
   * the payment is confirmed.
   */
  const verifyWithRetry = async (reference?: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await verifyStallFee.mutateAsync({ bookingId: booking._id, reference });
        toast.success("Stall fee paid. Your spot is confirmed.");
        setPaying(false);
        return;
      } catch {
        if (attempt === 7) {
          setPaying(false);
          toast.error(
            "We couldn't confirm that payment yet. If you were charged, your spot will show as confirmed shortly.",
          );
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1300 + attempt * 400));
      }
    }
  };

  const handleAccept = async () => {
    try {
      const result = await respond.mutateAsync({
        bookingId: booking._id,
        accept: true,
        /* The page Paystack returns the popup to, which then closes itself
           and lets the opener verify. */
        callbackUrl: `${window.location.origin}/checkout/callback`,
      });

      /* A free stall is confirmed on the spot. One with a fee is not yours
         until it is paid for. */
      if (!result.requiresPayment) {
        toast.success("Your stall is confirmed");
        return;
      }

      if (!result.payment?.authorizationUrl) {
        toast.error("We couldn't open checkout. Try again.");
        return;
      }

      setPaying(true);

      const popup = window.open(
        result.payment.authorizationUrl,
        "vera-stall-fee",
        "width=480,height=720",
      );

      const pollClosed = window.setInterval(() => {
        if (!popup || popup.closed) {
          window.clearInterval(pollClosed);
          void verifyWithRetry(result.payment?.reference);
        }
      }, 700);
    } catch {
      toast.error("We couldn't accept that invitation.");
    }
  };

  const tone = toneFor(booking.eventId);
  const colours = POSTER_TONES[tone];
  const busy = respond.isPending || paying || verifyStallFee.isPending;

  return (
    <article
      className={cn("flex flex-col gap-4 rounded-[32px] p-2.5 md:flex-row", tone === "cream" && "ring-1 ring-border ring-inset")}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      {booking.event ? <EventDateTile event={booking.event} className="h-28 w-full rounded-[24px] md:h-auto md:min-h-36 md:w-36" /> : null}

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-2 pb-2 md:px-1 md:py-2">
        <div>
          <span className="inline-flex h-7 items-center rounded-full border-[1.5px] border-current px-2.5 text-xs font-bold">Invitation</span>
          <h3 style={{ lineHeight: 1 }} className="mt-2.5 text-[clamp(24px,2.4vw,30px)] font-extrabold tracking-[-0.035em]">
            {booking.event?.name}
          </h3>
          {booking.event ? (
            <p className="mt-1.5 text-[15px] font-semibold opacity-80">
              {formatDate(booking.event.startsAt)} · {booking.event.address}
            </p>
          ) : null}
        </div>

        <p className="text-[15px] font-bold">{termsLine(booking.terms)}</p>

        {booking.message ? <p className="text-[15px] font-medium opacity-80">“{booking.message}”</p> : null}

        {booking.stallFeeDueAt ? (
          <p className="flex w-fit items-center gap-2 rounded-full bg-black/10 px-3.5 py-2 text-[13px] font-bold">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Pay within {timeLeft(booking.stallFeeDueAt)} or this spot goes back to the organizer.
          </p>
        ) : null}

        {declining ? (
          <label className="flex max-w-md flex-col gap-2">
            <span className="text-sm font-bold">Anything to tell them? (optional)</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Already booked that day"
              className="h-12 rounded-2xl border-[1.5px] border-current bg-transparent px-4 text-[15px] outline-none placeholder:text-current placeholder:opacity-50"
            />
          </label>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleAccept()}
            style={solidOnTone(tone)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {booking.terms.stallFeeNaira ? `Accept and pay ${formatNairaAmount(booking.terms.stallFeeNaira)}` : "Accept"}
          </button>
          <button
            type="button"
            disabled={respond.isPending}
            onClick={() => {
              if (!declining) {
                setDeclining(true);
                return;
              }

              respond.mutate(
                { bookingId: booking._id, accept: false, note },
                {
                  onSuccess: () => toast.success("Invitation declined"),
                  onError: () => toast.error("Couldn't decline that invitation."),
                },
              );
            }}
            className="flex h-11 cursor-pointer items-center rounded-full border-[1.5px] border-current px-5 text-sm font-bold transition-colors hover:bg-black/5 disabled:opacity-60"
          >
            {declining ? "Send decline" : "Decline"}
          </button>
          {booking.terms.stallFeeNaira ? <span className="text-[13px] font-semibold opacity-75">Your spot is confirmed once the fee is paid.</span> : null}
        </div>
      </div>
    </article>
  );
};

const STATUS: Record<string, { label: string; tone?: "green" | "yellow" | "pink" }> = {
  confirmed: { label: "Confirmed", tone: "green" },
  applied: { label: "Waiting on them", tone: "yellow" },
  declined: { label: "You declined" },
  rejected: { label: "Not accepted", tone: "pink" },
};

const BookingRow = ({ booking }: { booking: VendorBooking }) => {
  const status = STATUS[booking.status] ?? { label: "Closed" };
  const colours = status.tone ? POSTER_TONES[status.tone] : null;

  return (
    <li className="flex items-center gap-3 p-2.5 pr-4 sm:gap-4">
      {booking.event ? <EventDateTile event={booking.event} className="h-14 w-14 rounded-[16px]" /> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-bold">{booking.event?.name ?? "Event"}</span>
        <span className="truncate text-[13px] text-muted-foreground">
          {booking.event ? `${formatDate(booking.event.startsAt)} · ` : ""}
          {termsLine(booking.terms)}
        </span>
      </span>
      <span
        className={cn("flex h-8 shrink-0 items-center rounded-full px-3 text-[13px] font-bold", !colours && "border-[1.5px] border-border text-muted-foreground")}
        style={colours ? { backgroundColor: colours.bg, color: colours.fg } : undefined}
      >
        {status.label}
      </span>
    </li>
  );
};

const SectionHeading = ({ children, count }: { children: string; count?: number }) => (
  <div className="mb-4 flex items-end gap-3">
    <h2 style={{ lineHeight: 1 }} className="text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-[-0.035em]">
      {children}
    </h2>
    {count ? <span className="pb-0.5 text-[13px] font-semibold text-muted-foreground tabular-nums">{count}</span> : null}
  </div>
);

/** A vendor's events: what they must answer, what they hold, what they can ask for. */
const VendorEvents = () => {
  const bookingsQuery = useMyBookings();
  const openEventsQuery = useOpenEventsForVendor();
  const apply = useApplyToEvent();

  const bookings = bookingsQuery.data ?? [];
  const invitations = bookings.filter((item) => item.status === "invited");
  const rest = bookings.filter((item) => item.status !== "invited");
  /* The server already leaves out events this vendor has an open booking for. */
  const openEvents = openEventsQuery.data ?? [];

  return (
    <div className={cn(DESK, "pb-10")}>
      <PageHeader lead="your" accent="events." description="Invitations to answer, the events you're booked for, and ones taking vendors." />

      {bookingsQuery.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-44 rounded-[32px]" />
          <Skeleton className="h-40 rounded-[28px]" />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <Panel>
          <ErrorState message="Couldn't load your events." onRetry={() => bookingsQuery.refetch()} />
        </Panel>
      ) : null}

      {invitations.length > 0 ? (
        <section className="mb-10">
          <SectionHeading count={invitations.length}>waiting on you.</SectionHeading>
          <div className="flex flex-col gap-3">
            {invitations.map((booking) => (
              <InvitationCard key={booking._id} booking={booking} />
            ))}
          </div>
        </section>
      ) : null}

      {bookingsQuery.isSuccess ? (
        <section className="mb-10">
          <SectionHeading count={rest.length}>booked.</SectionHeading>
          {rest.length === 0 ? (
            <p className="rounded-[22px] border-[1.5px] border-dashed border-border px-5 py-8 text-center text-[13px] font-semibold text-muted-foreground">
              Nothing yet. Apply to an event below, or wait for an organizer to invite you.
            </p>
          ) : (
            <Panel>
              <ul className="divide-y-[1.5px] divide-border">
                {rest.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} />
                ))}
              </ul>
            </Panel>
          )}
        </section>
      ) : null}

      <section>
        <SectionHeading count={openEvents.length}>taking vendors.</SectionHeading>

        {openEventsQuery.isPending ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-56 rounded-[28px]" />
            ))}
          </div>
        ) : null}

        {openEventsQuery.isSuccess && openEvents.length === 0 ? (
          <p className="rounded-[22px] border-[1.5px] border-dashed border-border px-5 py-8 text-center text-[13px] font-semibold text-muted-foreground">
            No events are taking vendor applications right now.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {openEvents.map((event) => (
            <article key={event._id} className="flex flex-col gap-3 rounded-[28px] border-[1.5px] border-border p-2.5">
              <EventDateTile event={event} className="h-32 w-full rounded-[20px]" />
              <div className="flex flex-1 flex-col gap-1 px-2">
                <h3 className="text-[17px] leading-snug font-bold tracking-[-0.01em]">{event.name}</h3>
                <p className="text-[13px] text-muted-foreground">{formatDate(event.startsAt)}</p>
                <p className="truncate text-[13px] text-muted-foreground">{event.address}</p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t-[1.5px] border-dashed border-border px-2 pt-3 pb-1">
                <span className="text-sm font-bold">
                  {event.vendorSettings.stallFeeNaira ? `${formatNairaAmount(event.vendorSettings.stallFeeNaira)} stall fee` : "No stall fee"}
                </span>
                <Button
                  size="sm"
                  variant="ink"
                  loading={apply.isPending && apply.variables?.eventId === event._id}
                  disabled={apply.isPending}
                  onClick={() =>
                    apply.mutate(
                      { eventId: event._id },
                      {
                        onSuccess: () => toast.success("Application sent to the organizer"),
                        onError: () => toast.error("Couldn't apply to that event."),
                      },
                    )
                  }
                >
                  Apply
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VendorEvents;
