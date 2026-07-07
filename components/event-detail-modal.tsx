"use client";

import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import EventThumbnail from "@/components/event-thumbnail";
import PerforatedDivider from "@/components/perforated-divider";
import QrCodePlaceholder from "@/components/qr-code-placeholder";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatNaira } from "@/lib/format-currency";
import { formatEventDate } from "@/lib/format-date";
import { useSession } from "@/lib/hooks/use-auth";
import {
  useInitializeTicketPurchase,
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
  CheckCircle2,
  Loader2,
  Lock,
  Minus,
  Plus,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";

type FlowStep =
  | "detail"
  | "sign-in"
  | "sign-up"
  | "awaiting-payment"
  | "verifying"
  | "success"
  | "failed";

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
  const [ticketCode, setTicketCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sessionQuery = useSession();
  const initializeMutation = useInitializeTicketPurchase(event._id);
  const verifyMutation = useVerifyTicketPayment();

  const hasCategories = Boolean(event.ticketCategories?.length);
  const unitPriceNaira = event.isPaid
    ? (selectedCategory?.priceNaira ??
      event.currentTicketPriceNaira ??
      event.ticketPriceNaira)
    : 0;
  const isFree = !event.isPaid;
  const subtotal = unitPriceNaira * quantity;

  const runVerifyWithRetry = async (ticketId: string, reference?: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const result = await verifyMutation.mutateAsync({
          ticketId,
          reference,
        });
        setTicketCode(result.ticket.ticketCode);
        setStep("success");
        return;
      } catch {
        if (attempt === 7) {
          setErrorMessage(
            "We couldn't confirm your payment yet. Check your tickets shortly — if you were charged, it will show up.",
          );
          setStep("failed");
          return;
        }

        await sleep(1300 + attempt * 400);
      }
    }
  };

  const startCheckout = async () => {
    setErrorMessage("");

    try {
      const result = await initializeMutation.mutateAsync({
        quantity,
        ticketCategoryId: selectedCategory?._id,
        callbackUrl: `${window.location.origin}/checkout/callback`,
      });

      if (!result.requiresPayment) {
        setTicketCode(result.ticket.ticketCode);
        setStep("success");
        return;
      }

      if (!result.payment?.authorizationUrl) {
        setErrorMessage("Couldn't start checkout. Please try again.");
        setStep("failed");
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
      setErrorMessage("Couldn't start checkout. Please try again.");
      setStep("failed");
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
            {event.state ? (
              <div className="absolute top-3 left-3">
                <Badge>{event.state}</Badge>
              </div>
            ) : null}
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

              <Button
                size="lg"
                onClick={handlePrimaryAction}
                disabled={
                  initializeMutation.isPending || event.remainingTickets <= 0
                }
              >
                {event.remainingTickets <= 0
                  ? "Sold out"
                  : isFree
                    ? `Get ${quantity} ticket${quantity > 1 ? "s" : ""}`
                    : `Pay ${formatNaira(subtotal)}`}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {sessionQuery.data?.user
                  ? "Chat opens after you get a ticket. Feed stays available now."
                  : "You'll be asked to sign in before checkout."}
              </p>
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

      {step === "failed" ? (
        <div className="flex flex-col gap-5 p-6 pt-14 text-center">
          <p className="text-sm font-semibold text-foreground">
            {errorMessage}
          </p>
          <Button size="lg" onClick={() => setStep("detail")}>
            Back to event
          </Button>
        </div>
      ) : null}

      {step === "success" ? (
        <div className="flex flex-col gap-5 p-6 pt-14">
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <h2 className="text-xl font-bold text-card-foreground">
              Ticket ready
            </h2>
            <p className="text-sm text-muted-foreground">
              {isFree
                ? `${quantity} ticket${quantity > 1 ? "s" : ""} issued successfully.`
                : "Payment confirmed and ticket is active."}
            </p>
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-secondary">
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-1.5 text-primary">
                <Ticket className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {selectedCategory?.name ?? "General"}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {event.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatEventDate(event.nextOccurrenceAt)} · {event.address}
              </span>
            </div>

            <PerforatedDivider />

            <div className="flex items-center justify-start gap-4 p-4">
              <QrCodePlaceholder className="h-46 w-46 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">
                  Ticket code
                </span>
                <span className="text-sm font-bold text-foreground">
                  {ticketCode}
                </span>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Quantity: {quantity}
                </span>
              </div>
            </div>
          </div>

          <Button size="lg" onClick={onClose}>
            Done
          </Button>
        </div>
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
