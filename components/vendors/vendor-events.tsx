"use client";

import Button from "@/components/ui/button";
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
import { CalendarDays, Clock, MapPin } from "lucide-react";
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

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-primary/40 bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase text-primary">Invitation</p>
        <h3 className="mt-1.5 text-lg font-bold text-card-foreground">
          {booking.event?.name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {booking.event ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(booking.event.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {booking.event.address}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <p className="rounded-sm bg-secondary/60 p-3 text-sm text-foreground font-medium">
        {termsLine(booking.terms)}
      </p>

      {booking.message ? (
        <p className="text-sm text-muted-foreground">“{booking.message}”</p>
      ) : null}

      {declining ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`note-${booking._id}`}
            className="text-xs font-semibold text-muted-foreground"
          >
            Anything to tell them? (optional)
          </label>
          <input
            id={`note-${booking._id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Already booked that day"
            className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary"
          />
        </div>
      ) : null}

      {booking.stallFeeDueAt ? (
        <p className="flex items-center gap-2 rounded-xl bg-[#fff7de] p-3 text-xs font-semibold text-[#8a5f10]">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Pay within {timeLeft(booking.stallFeeDueAt)} or this spot goes back to
          the organizer.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          loading={respond.isPending || paying || verifyStallFee.isPending}
          onClick={() => void handleAccept()}
        >
          {booking.terms.stallFeeNaira
            ? `Accept and pay ${formatNairaAmount(booking.terms.stallFeeNaira)}`
            : "Accept"}
        </Button>
        <Button
          variant="outline"
          loading={respond.isPending}
          onClick={() => {
            if (!declining) {
              setDeclining(true);
              return;
            }

            respond.mutate(
              { bookingId: booking._id, accept: false, note },
              { onSuccess: () => toast.success("Invitation declined") },
            );
          }}
        >
          {declining ? "Send decline" : "Decline"}
        </Button>
        {booking.terms.stallFeeNaira ? (
          <span className="text-xs text-muted-foreground">
            Your spot is confirmed once the fee is paid.
          </span>
        ) : null}
      </div>
    </article>
  );
};

const BookingRow = ({ booking }: { booking: VendorBooking }) => (
  <li className="flex flex-wrap items-center gap-3 p-4">
    <span className="min-w-0 flex-1 flex flex-col gap-1">
      <span className="block truncate text-base font-semibold text-foreground">
        {booking.event?.name ?? "Event"}
      </span>
      <span className="block truncate text-sm text-muted-foreground font-medium">
        {booking.event ? formatDate(booking.event.startsAt) : ""} ·{" "}
        {termsLine(booking.terms)}
      </span>
    </span>
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-sm font-bold",
        booking.status === "confirmed"
          ? "bg-accent text-accent-foreground"
          : "bg-secondary text-muted-foreground",
      )}
    >
      {booking.status === "confirmed"
        ? "Confirmed"
        : booking.status === "applied"
          ? "Waiting on them"
          : booking.status === "declined"
            ? "You declined"
            : booking.status === "rejected"
              ? "Not accepted"
              : "Closed"}
    </span>
  </li>
);

/** A vendor's events: what they must answer, what they hold, what they can ask for. */
const VendorEvents = () => {
  const bookingsQuery = useMyBookings();
  const openEventsQuery = useOpenEventsForVendor();
  const apply = useApplyToEvent();

  const bookings = bookingsQuery.data ?? [];
  const invitations = bookings.filter((item) => item.status === "invited");
  const rest = bookings.filter((item) => item.status !== "invited");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Events</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Invitations to answer, the events you are booked for, and ones taking
        vendors.
      </p>

      {invitations.length > 0 ? (
        <section className="mt-8 flex flex-col gap-4">
          {invitations.map((booking) => (
            <InvitationCard key={booking._id} booking={booking} />
          ))}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
          Your events
        </h2>
        {rest.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing yet. Apply to an event below, or wait for an organizer to
            invite you.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {rest.map((booking) => (
              <BookingRow key={booking._id} booking={booking} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
          Taking vendors
        </h2>

        {openEventsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Looking for events…</p>
        ) : null}

        {openEventsQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No events are taking vendor applications right now.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(openEventsQuery.data ?? []).map((event) => (
            <article
              key={event._id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <h3 className="text-base font-bold text-card-foreground">
                  {event.name}
                </h3>
                <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(event.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.address}
                  </span>
                </div>
              </div>

              <p className="text-sm font-medium text-foreground">
                {event.vendorSettings.stallFeeNaira
                  ? `${formatNairaAmount(event.vendorSettings.stallFeeNaira)} stall fee`
                  : "No stall fee"}
              </p>

              <Button
                size="sm"
                variant="outline"
                className="w-fit"
                loading={apply.isPending}
                onClick={() =>
                  apply.mutate(
                    { eventId: event._id },
                    {
                      onSuccess: () =>
                        toast.success("Application sent to the organizer"),
                      onError: () =>
                        toast.error("Couldn't apply to that event."),
                    },
                  )
                }
              >
                Apply
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VendorEvents;
