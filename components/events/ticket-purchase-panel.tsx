"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getEventPurchasability } from "@/lib/event-status";
import { formatNairaAmount } from "@/lib/format-currency";
import { useSession } from "@/lib/hooks/use-auth";
import {
  useInitializeTicketPurchase,
  useVerifyTicketPayment,
} from "@/lib/hooks/use-tickets";
import {
  type EventTicketCategoryApi,
  type PublicEventApi,
} from "@/lib/types/event";
import { type AddOnSelection } from "@/components/events/add-on-picker";
import { cn } from "@/lib/utils";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_PER_PURCHASE = 10;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type Step = "picking" | "awaiting-payment" | "verifying";

/**
 * Checkout for the full event page. Mirrors the modal's flow. Tier, quantity,
 * Paystack popup, then verify with retry because the webhook and the popup
 * close race each other, but laid out for a page rather than a dialog.
 */
export const TicketPurchasePanel = ({
  event,
  initialTierId,
  addOnSelection = {},
}: {
  event: PublicEventApi;
  /* Owned by the page: the picker sits in the main column while the running
     total lives here, which is the whole point of the desktop layout. */
  addOnSelection?: AddOnSelection;
  /* Set when someone arrived from a published landing page having already
     picked a tier there. Landing on "General" after clicking "VIP" reads as
     the link being broken. */
  initialTierId?: string;
}) => {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const initialize = useInitializeTicketPurchase(event._id);
  const verify = useVerifyTicketPayment();

  const tiers = event.ticketCategories ?? [];
  /* The server marks each tier's window state; only open ones are buyable. */
  const sellableTiers = tiers.filter((tier) => tier.onSale !== false);
  const requested = initialTierId
    ? (tiers.find((tier) => tier._id === initialTierId) ?? null)
    : null;
  const [selectedTier, setSelectedTier] = useState<EventTicketCategoryApi | null>(
    /* A requested tier that has since closed still wins the selection, so the
       panel explains why it cannot be bought rather than silently swapping it. */
    requested ?? sellableTiers[0] ?? tiers[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<Step>("picking");
  const rootRef = useRef<HTMLDivElement>(null);

  /* On a phone this panel sits below the whole event page. Someone who pressed
     "Get tickets" on a landing page asked for checkout, not the top of an
     article, so bring it to them. Once, and only when they asked. */
  useEffect(() => {
    if (!requested) {
      return;
    }

    rootRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    /* Deliberately mount-only: re-running on selection changes would yank the
       page while someone is picking a different tier. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFree = !event.isPaid;
  const unitPrice = isFree
    ? 0
    : (selectedTier?.priceNaira ??
      event.currentTicketPriceNaira ??
      event.ticketPriceNaira);
  const availableAddOns = event.addOns ?? [];

  /* Filtered against what is still sellable: an add-on that sold out between
     render and click must not ride along in the payload. */
  const selectedAddOns = Object.entries(addOnSelection)
    .filter(([addOnId]) =>
      availableAddOns.some((addOn) => addOn._id === addOnId && !addOn.soldOut),
    )
    .map(([addOnId, picked]) => ({
      addOnId,
      variantName: picked.variantName,
      quantity: picked.quantity,
    }));

  const addOnsTotal = selectedAddOns.reduce((sum, picked) => {
    const addOn = availableAddOns.find((item) => item._id === picked.addOnId);

    return sum + Number(addOn?.priceNaira || 0) * picked.quantity;
  }, 0);

  /* Add-ons are charged whether or not the ticket itself is, so a free event
     with paid parking still shows a real number. */
  const subtotal = unitPrice * quantity + addOnsTotal;
  const { purchasable, reason } = getEventPurchasability(event);
  const busy = step !== "picking" || initialize.isPending;

  const maxQuantity = Math.max(
    1,
    Math.min(MAX_PER_PURCHASE, event.remainingTickets || MAX_PER_PURCHASE),
  );

  const verifyWithRetry = async (ticketId: string, reference?: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await verify.mutateAsync({ ticketId, reference });
        toast.success(
          selectedAddOns.length
            ? `Ticket confirmed with ${selectedAddOns.length} add-on${
                selectedAddOns.length > 1 ? "s" : ""
              }. Open it to see where to collect them.`
            : "Ticket confirmed. It's in your account",
        );
        setStep("picking");
        router.push("/account/tickets");
        return;
      } catch {
        if (attempt === 7) {
          toast.error(
            "We couldn't confirm your payment yet. Check your tickets shortly. If you were charged, it will show up.",
          );
          setStep("picking");
          return;
        }

        await sleep(1300 + attempt * 400);
      }
    }
  };

  const startCheckout = async () => {
    try {
      const result = await initialize.mutateAsync({
        quantity,
        ticketCategoryId: selectedTier?._id,
        addOns: selectedAddOns,
        callbackUrl: `${window.location.origin}/checkout/callback`,
      });

      if (!result.requiresPayment) {
        toast.success("Ticket confirmed. It's in your account");
        router.push("/account/tickets");
        return;
      }

      if (!result.payment?.authorizationUrl) {
        toast.error("Couldn't start checkout. Please try again.");
        return;
      }

      setStep("awaiting-payment");

      const popup = window.open(
        result.payment.authorizationUrl,
        "vera-checkout",
        "width=480,height=720",
      );

      const pollClosed = window.setInterval(() => {
        if (!popup || popup.closed) {
          window.clearInterval(pollClosed);
          setStep("verifying");
          void verifyWithRetry(result.ticket._id, result.payment?.reference);
        }
      }, 700);
    } catch {
      setStep("picking");
      toast.error("Couldn't start checkout. Please try again.");
    }
  };

  const handleBuy = () => {
    if (!sessionQuery.data?.user) {
      openAuthModal({
        view: "sign-in",
        redirectTo: `/events/${event._id}`,
      });
      return;
    }

    void startCheckout();
  };

  if (step !== "picking") {
    return (
      <Card className="gap-0 py-0">
        <div className="flex flex-col items-center gap-3 px-[18px] py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="text-sm font-semibold">
            {step === "awaiting-payment"
              ? "Finish paying in the other window"
              : "Confirming your payment"}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {step === "awaiting-payment"
              ? "This page updates as soon as you're done. Don't close it."
              : "This takes a few seconds. Don't close this page."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card ref={rootRef} id="buy" className="gap-0 py-0">
      <div className="p-[18px]">
        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70">
          Straight from the organizer
        </span>
        <div className="mt-1.5 text-[28px] font-bold tracking-[-0.02em] tabular-nums">
          {isFree ? "Free" : formatNairaAmount(unitPrice)}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          {(event.remainingTickets ?? 0) > 0
            ? `${(event.remainingTickets ?? 0).toLocaleString("en-NG")} tickets left`
            : "Sold out"}
        </div>
      </div>

      {tiers.length > 0 ? (
        <>
          <hr className="ticket-perforation" />
          <div className="p-[18px]">
            <span className="mb-2.5 block text-[13px] font-semibold">
              Choose a ticket
            </span>
            <div className="flex flex-col gap-2">
              {tiers.map((tier) => {
                const selected = selectedTier?._id === tier._id;
                const closed = tier.onSale === false;
                const opensAt = tier.availableFrom
                  ? new Date(tier.availableFrom)
                  : null;

                return (
                  <button
                    key={tier._id}
                    type="button"
                    aria-pressed={selected}
                    disabled={closed}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-3 text-left transition-colors",
                      closed
                        ? "cursor-not-allowed opacity-55 shadow-[inset_0_0_0_1px_var(--border)]"
                        : selected
                          ? "cursor-pointer bg-accent shadow-[inset_0_0_0_2px_var(--primary)]"
                          : "cursor-pointer shadow-[inset_0_0_0_1px_var(--border)] hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "shadow-[inset_0_0_0_1px_var(--border)]",
                      )}
                    >
                      {selected ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={4} />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13px] font-semibold",
                          selected && "text-accent-foreground",
                        )}
                      >
                        {tier.name}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {closed && tier.availabilityState === "upcoming" && opensAt
                          ? `Opens ${new Intl.DateTimeFormat("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }).format(opensAt)}`
                          : closed
                            ? "No longer on sale"
                            : `${tier.quantity.toLocaleString("en-NG")} released`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[13px] font-semibold tabular-nums",
                        selected && "text-accent-foreground",
                      )}
                    >
                      {tier.priceNaira > 0
                        ? formatNairaAmount(tier.priceNaira)
                        : "Free"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <hr className="ticket-perforation" />

      <div className="p-[18px]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">How many</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="One fewer ticket"
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-9 text-center text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="One more ticket"
              disabled={quantity >= maxQuantity}
              onClick={() =>
                setQuantity((current) => Math.min(maxQuantity, current + 1))
              }
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isFree ? (
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-[13px] text-muted-foreground">Total</span>
            <span className="text-lg font-bold tracking-[-0.01em] tabular-nums">
              {formatNairaAmount(subtotal)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="bg-muted/60 px-[18px] py-4">
        {!purchasable && reason ? (
          <p className="mb-2.5 text-center text-xs text-muted-foreground">
            {reason}
          </p>
        ) : null}

        <Button
          className="w-full"
          disabled={
            !purchasable ||
            busy ||
            (tiers.length > 0 && sellableTiers.length === 0) ||
            selectedTier?.onSale === false
          }
          loading={initialize.isPending}
          onClick={handleBuy}
        >
          {!purchasable && (event.remainingTickets ?? 0) <= 0
            ? "Sold out"
            : isFree
              ? `Get ${quantity} ${quantity > 1 ? "tickets" : "ticket"}`
              : `Pay ${formatNairaAmount(subtotal)}`}
        </Button>

        {!sessionQuery.data?.user ? (
          <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
            You&apos;ll be asked to sign in before checkout.
          </p>
        ) : (
          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
            Buying from the organizer is always cheapest. Resale is for sold-out
            tiers.
          </p>
        )}
      </div>
    </Card>
  );
};
