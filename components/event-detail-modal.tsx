"use client";

import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import EventThumbnail from "@/components/event-thumbnail";
import PerforatedDivider from "@/components/perforated-divider";
import TicketPassCard from "@/components/tickets/ticket-pass-card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getEventPurchasability, isEventLive } from "@/lib/event-status";
import { formatNaira } from "@/lib/format-currency";
import { formatEventDate } from "@/lib/format-date";
import { useSession } from "@/lib/hooks/use-auth";
import {
  useInitializeTicketPurchase,
  useTicketsByPurchaseBatch,
  useVerifyTicketPayment,
} from "@/lib/hooks/use-tickets";
import {
  type EventTicketCategoryApi,
  type PublicEventApi,
} from "@/lib/types/event";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Lock,
  Minus,
  Plus,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FlowStep =
  | "detail"
  | "sign-in"
  | "sign-up"
  | "awaiting-payment"
  | "verifying"
  | "success";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface EventDetailModalProps {
  event: PublicEventApi | null;
  onClose: () => void;
}

const EventDetailModal = ({ event, onClose }: EventDetailModalProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(event)} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined}>
        {event ? (
          <EventDetailModalBody
            key={event._id}
            event={event}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

interface EventDetailModalBodyProps {
  event: PublicEventApi;
  onClose: () => void;
}

const EventDetailModalBody = ({
  event,
  onClose,
}: EventDetailModalBodyProps) => {
  const [step, setStep] = useState<FlowStep>("detail");
  const [selectedCategory, setSelectedCategory] =
    useState<EventTicketCategoryApi | null>(
      event.ticketCategories?.[0] ?? null,
    );
  const [quantity, setQuantity] = useState(1);
  const [purchaseBatchId, setPurchaseBatchId] = useState<string | null>(null);

  const sessionQuery = useSession();
  const initializeMutation = useInitializeTicketPurchase(event._id);
  const verifyMutation = useVerifyTicketPayment();
  const purchasedTicketsQuery = useTicketsByPurchaseBatch(purchaseBatchId);
  const purchasedTickets = purchasedTicketsQuery.data?.items ?? [];

  const hasCategories = Boolean(event.ticketCategories?.length);
  const unitPriceNaira = event.isPaid
    ? (selectedCategory?.priceNaira ??
      event.currentTicketPriceNaira ??
      event.ticketPriceNaira)
    : 0;
  const isFree = !event.isPaid;
  const subtotal = unitPriceNaira * quantity;
  const { purchasable, reason } = getEventPurchasability(event);
  const live = isEventLive(event);

  const runVerifyWithRetry = async (ticketId: string, reference?: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const result = await verifyMutation.mutateAsync({
          ticketId,
          reference,
        });
        setPurchaseBatchId(result.purchaseBatchId);
        setStep("success");
        return;
      } catch {
        if (attempt === 7) {
          toast.error(
            "We couldn't confirm your payment yet. Check your tickets shortly — if you were charged, it will show up.",
          );
          setStep("detail");
          return;
        }

        await sleep(1300 + attempt * 400);
      }
    }
  };

  const startCheckout = async () => {
    try {
      const result = await initializeMutation.mutateAsync({
        quantity,
        ticketCategoryId: selectedCategory?._id,
        callbackUrl: `${window.location.origin}/checkout/callback`,
      });

      if (!result.requiresPayment) {
        setPurchaseBatchId(result.purchaseBatchId);
        setStep("success");
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
          void runVerifyWithRetry(result.ticket._id, result.payment?.reference);
        }
      }, 700);
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
    }
  };

  const handlePrimaryAction = () => {
    if (!sessionQuery.data?.user) {
      setStep("sign-in");
      return;
    }

    void startCheckout();
  };

  return (
    <>
      {step === "detail" ? (
        <div className="flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
            <EventThumbnail
              imageUrl={event.imageUrl}
              alt={event.name}
              className="h-full w-full"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {live ? (
                <Badge variant="solid">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                  Live
                </Badge>
              ) : null}
              {event.state ? <Badge>{event.state}</Badge> : null}
            </div>
          </div>

          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-card-foreground">
                {event.name}
              </h2>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Hosted by</span>
                <span>
                  {typeof event.organizerUserId === "string"
                    ? "Vera organizer"
                    : event.organizerUserId.fullName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatEventDate(event.nextOccurrenceAt)} · {event.address}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                {event.soldTickets} sold
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                {event.remainingTickets} left
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 text-primary" />
                {event.ratingsCount ? event.averageRating.toFixed(1) : "-"}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>

            <PerforatedDivider />

            <div className="flex flex-col gap-4">
              {hasCategories ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ticket category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {event.ticketCategories?.map((category) => {
                      const active = category._id === selectedCategory?._id;

                      return (
                        <button
                          key={category._id}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {category.name} · {formatNaira(category.priceNaira)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ticket quantity
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.min(10, value + 1))
                    }
                    disabled={quantity >= 10}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {!isFree ? (
                <div className="flex flex-col gap-1.5 rounded-xl bg-secondary p-4 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Ticket price × {quantity}</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vera&apos;s service fee is applied at checkout.
                  </p>
                </div>
              ) : null}

              {!purchasable ? (
                <p className="text-center text-xs text-muted-foreground">
                  {reason}
                </p>
              ) : null}

              <Button
                size="lg"
                onClick={handlePrimaryAction}
                loading={initializeMutation.isPending}
                disabled={!purchasable}
              >
                {!purchasable && event.remainingTickets <= 0
                  ? "Sold out"
                  : isFree
                    ? `Get ${quantity} ticket${quantity > 1 ? "s" : ""}`
                    : `Pay ${formatNaira(subtotal)}`}
              </Button>

              {!sessionQuery.data?.user ? (
                <p className="text-center text-xs text-muted-foreground">
                  You&apos;ll be asked to sign in before checkout.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {step === "awaiting-payment" ? (
        <div className="flex flex-col items-center gap-4 p-6 py-20 text-center">
          <Lock className="h-8 w-8 text-primary" />
          <p className="text-sm font-semibold text-foreground">
            Complete payment in the popup window
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            We&apos;ll pick things up automatically once you&apos;re done.
          </p>
        </div>
      ) : null}

      {step === "verifying" ? (
        <div className="flex flex-col items-center gap-4 p-6 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">
            Verifying payment…
          </p>
        </div>
      ) : null}

      {step === "success" ? (
        purchasedTicketsQuery.isLoading ? (
          <div className="flex flex-col items-center gap-4 p-6 py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Loading your ticket{quantity > 1 ? "s" : ""}…
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            {purchasedTickets.length > 1 ? (
              <p className="text-center text-sm font-semibold text-foreground">
                You got {purchasedTickets.length} tickets — each one has its
                own code below.
              </p>
            ) : null}
            <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
              {purchasedTickets.map((ticket) => (
                <TicketPassCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>
        )
      ) : null}

      {step === "sign-in" ? (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setStep("detail")}
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <SignInView
            onSuccess={() => {
              setStep("detail");
              void startCheckout();
            }}
            onSwitchToSignUp={() => setStep("sign-up")}
          />
        </div>
      ) : null}

      {step === "sign-up" ? (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setStep("detail")}
            className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <SignUpView
            onSuccess={() => {
              setStep("detail");
              void startCheckout();
            }}
            onSwitchToSignIn={() => setStep("sign-in")}
          />
        </div>
      ) : null}
    </>
  );
};

export default EventDetailModal;
