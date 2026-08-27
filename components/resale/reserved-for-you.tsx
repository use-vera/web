"use client";

import Button from "@/components/ui/button";
import { formatNairaAmount } from "@/lib/format-currency";
import { type EventTicketApi } from "@/lib/types/organizer";
import { formatCountdown, useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { Clock, TriangleAlert } from "lucide-react";

/**
 * The seller accepted your offer, so this ticket is held for you until the
 * deadline the backend stamped (acceptedBidExpiresAt / the bid's expiresAt).
 * Miss it and the offer expires, the listing goes back on the market, and
 * anyone can buy it — so the deadline is the loudest thing here.
 */
export const ReservedForYou = ({
  ticket,
  onPay,
  isPaying,
}: {
  ticket: EventTicketApi;
  onPay: () => void;
  isPaying: boolean;
}) => {
  const now = useNow();

  const deadline = ticket.acceptedBidExpiresAt ?? ticket.myBid?.expiresAt ?? null;
  const remaining = deadline ? formatCountdown(deadline, now) : null;
  const expired = Boolean(deadline) && now > 0 && remaining === null;

  /* You pay what you bid, not the asking price. */
  const price = ticket.myBid?.amountNaira ?? ticket.resalePriceNaira ?? 0;
  const urgent = Boolean(
    deadline && now > 0 && Date.parse(deadline) - now < 60 * 60 * 1000,
  );

  return (
    <div
      className={cn(
        "rounded-sm p-5 outline -outline-offset-1",
        expired
          ? "bg-muted outline-border"
          : "bg-accent outline-foreground/10",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[17px] font-bold tracking-[-0.01em]",
              expired ? "text-foreground" : "text-accent-foreground",
            )}
          >
            {expired ? "Your offer expired" : "Your offer was accepted"}
          </div>
          <p
            className={cn(
              "mt-1.5 max-w-md text-[13px] leading-relaxed text-pretty",
              expired ? "text-muted-foreground" : "text-accent-foreground/85",
            )}
          >
            {expired
              ? "You didn't pay in time, so the ticket went back on the market. You can still buy it at the asking price if nobody else has."
              : `${ticket.ticketCategoryName || "This ticket"} is held for you at ${formatNairaAmount(price)}. Pay before the timer runs out or it goes back on the market.`}
          </p>
        </div>

        {!expired && deadline ? (
          <div className="shrink-0 text-right">
            <div
              className={cn(
                "text-[11px] font-semibold tracking-[0.08em] uppercase",
                urgent ? "text-destructive" : "text-accent-foreground/70",
              )}
            >
              {urgent ? "Hurry" : "Time left"}
            </div>
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-1.5 text-2xl font-bold tracking-[-0.02em] tabular-nums",
                urgent ? "text-destructive" : "text-accent-foreground",
              )}
            >
              <Clock className="h-5 w-5" />
              {remaining ?? "—"}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={onPay} loading={isPaying} disabled={isPaying}>
          {expired
            ? `Buy at ${formatNairaAmount(ticket.resalePriceNaira ?? 0)}`
            : `Pay ${formatNairaAmount(price)}`}
        </Button>
        {!expired ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-accent-foreground/85">
            <TriangleAlert className="h-3.5 w-3.5" />
            The seller can&apos;t sell it to anyone else until then.
          </span>
        ) : null}
      </div>
    </div>
  );
};
