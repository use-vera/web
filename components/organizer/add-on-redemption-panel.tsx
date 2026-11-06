"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { formatNairaAmount } from "@/lib/format-currency";
import { type TicketAddOnApi } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Check, Lock, Ticket } from "lucide-react";

const WHERE: Record<TicketAddOnApi["redemption"], string> = {
  door: "At the door",
  desk: "Collect at a desk",
  none: "Nothing to collect",
};

/**
 * What a ticket still holds, and what THIS surface can hand over.
 *
 * A door hands over its own items and shows the rest locked, so nobody burns
 * a dinner voucher at the gate — but it still names where each one is
 * collected, because staff get asked. The add-ons desk is the opposite: it
 * is the place people are sent to, so "all" lets it hand over anything,
 * including something the gate missed.
 */
export const AddOnRedemptionPanel = ({
  addOns,
  attendeeName,
  surface,
  busyPurchaseId,
  offline,
  onRedeem,
}: {
  addOns: TicketAddOnApi[];
  attendeeName: string;
  /** Which items this screen may redeem. "all" is the add-ons desk. */
  surface: "door" | "desk" | "all";
  busyPurchaseId: string | null;
  /** Handing over needs the network; admitting does not. */
  offline?: boolean;
  onRedeem: (purchase: TicketAddOnApi) => void;
}) => {
  if (!addOns.length) {
    return null;
  }

  const outstanding = addOns.filter(
    (item) => item.redemption !== "none" && item.redeemedQuantity < item.quantity,
  );

  return (
    <div className="rounded-[28px] border-[1.5px] border-border p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Also on this ticket</Eyebrow>
        <span className="text-xs text-muted-foreground">
          {outstanding.length
            ? `${outstanding.length} still to hand over`
            : "all collected"}
        </span>
      </div>

      <p className="mt-1 text-[13px] text-muted-foreground">{attendeeName}</p>

      <ul className="mt-3.5 flex flex-col gap-2">
        {addOns.map((item) => {
          const left = Math.max(0, item.quantity - item.redeemedQuantity);
          const done = left === 0;
          const mine = surface === "all" || item.redemption === surface;
          const collectible = item.redemption !== "none";
          const busy = busyPurchaseId === item._id;

          return (
            <li
              key={item._id}
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[18px] p-3",
                done ? "bg-accent" : "border-[1.5px] border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]",
                  done ? "bg-background" : "bg-secondary",
                )}
              >
                {done ? (
                  <Check
                    className="h-4 w-4 text-accent-foreground"
                    strokeWidth={3}
                  />
                ) : collectible && !mine ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">
                  {item.name}
                  {item.variantName ? ` · ${item.variantName}` : ""}
                  {item.quantity > 1 ? ` · ${item.quantity}` : ""}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {done
                    ? "Collected"
                    : collectible && !mine
                      ? `${WHERE[item.redemption]}${item.location ? ` · ${item.location}` : ""}`
                      : collectible
                        ? `${WHERE[item.redemption]}${item.location ? ` · ${item.location}` : ""}${
                            left > 1 ? ` · ${left} left` : ""
                          }`
                        : "Prints on the ticket"}
                </span>
              </span>

              {item.unitPriceNaira > 0 ? (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatNairaAmount(item.unitPriceNaira)}
                </span>
              ) : null}

              {collectible && !done && mine ? (
                <Button
                  size="sm"
                  variant="ink"
                  disabled={offline || Boolean(busyPurchaseId)}
                  loading={busy}
                  onClick={() => onRedeem(item)}
                >
                  {left > 1 ? "Hand over one" : "Hand over"}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {offline ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Handing an add-on over needs a connection — it comes off the
          event&apos;s stock, so it cannot be queued like an admission.
        </p>
      ) : null}
    </div>
  );
};

export default AddOnRedemptionPanel;
