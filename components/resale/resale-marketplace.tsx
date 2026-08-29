"use client";

import {
  EmptyState,
  ErrorState,
} from "@/components/organizer/organizer-primitives";
import { ReservedForYou } from "@/components/resale/reserved-for-you";
import { AmountField } from "@/components/organizer/amount-field";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useInitializeResalePurchase,
  usePlaceBid,
  useVerifyResalePurchase,
} from "@/lib/hooks/use-resale";
import { type EventTicketApi } from "@/lib/types/organizer";
import { Check, Clock, Ticket, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const sellerName = (ticket: EventTicketApi) =>
  typeof ticket.buyerUserId === "string"
    ? "A Vera user"
    : ticket.buyerUserId.fullName;

const sellerImage = (ticket: EventTicketApi) =>
  typeof ticket.buyerUserId === "string" ? "VU" : ticket.buyerUserId.avatarUrl;

const BidDialog = ({
  ticket,
  ceiling,
  onClose,
}: {
  ticket: EventTicketApi | null;
  ceiling: number;
  onClose: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const placeBid = usePlaceBid(ticket?._id ?? "");

  const amountNaira = Number(amount) || 0;
  const valid = amountNaira > 0 && amountNaira <= ceiling;

  const submit = async () => {
    try {
      await placeBid.mutateAsync(amountNaira);
      toast.success("Offer sent to the seller");
      setAmount("");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't place that offer"));
    }
  };

  return (
    <Dialog open={Boolean(ticket)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose={false} className="max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-[-0.01em]">
            Make an offer
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {ticket?.ticketCategoryName || "Ticket"} · listed at{" "}
            {formatNairaAmount(ticket?.resalePriceNaira ?? 0)}. The seller has
            to accept before you pay.
          </p>

          <label className="mt-5 block">
            <span className="mb-2 block text-[13px] font-semibold">
              Your offer
            </span>
            <AmountField
              value={amount}
              onValueChange={setAmount}
              prefix="₦"
              placeholder="0"
            />
            <span className="mt-1.5 block text-xs text-muted-foreground tabular-nums">
              Up to {formatNairaAmount(ceiling)}. The resale ceiling for this
              event.
            </span>
          </label>

          {amountNaira > ceiling ? (
            <p className="mt-2 text-[13px] font-semibold text-destructive">
              That is above the ceiling.
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2.5">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!valid}
              loading={placeBid.isPending}
              onClick={submit}
            >
              Send offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ResaleMarketplace = ({
  listings,
  isLoading,
  isError,
  onRetry,
  faceValue,
  ceiling,
  markupPercent,
}: {
  listings: EventTicketApi[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  faceValue: number;
  ceiling: number;
  markupPercent: number;
}) => {
  const [bidTarget, setBidTarget] = useState<EventTicketApi | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const initialize = useInitializeResalePurchase();
  const verify = useVerifyResalePurchase();

  /* Same popup-and-verify shape the primary ticket purchase uses. */
  const buy = async (ticket: EventTicketApi) => {
    setBuyingId(ticket._id);

    try {
      const session = await initialize.mutateAsync({
        ticketId: ticket._id,
        callbackUrl: `${window.location.origin}/checkout/callback`,
      });

      const authorizationUrl = session.payment?.authorizationUrl;

      if (!authorizationUrl) {
        toast.error("Couldn't start checkout");
        setBuyingId(null);
        return;
      }

      const popup = window.open(
        authorizationUrl,
        "_blank",
        "width=480,height=720",
      );

      const poll = window.setInterval(() => {
        if (popup?.closed) {
          window.clearInterval(poll);

          verify
            .mutateAsync({
              ticketId: ticket._id,
              reference: session.payment?.reference,
              paymentAttemptId: session.paymentAttemptId ?? undefined,
            })
            .then(() => {
              toast.success("Ticket is yours. Check My tickets");
              onRetry();
            })
            .catch((error) =>
              toast.error(
                getApiErrorMessage(error, "We couldn't confirm that payment"),
              ),
            )
            .finally(() => setBuyingId(null));
        }
      }, 700);
    } catch (error) {
      setBuyingId(null);
      toast.error(getApiErrorMessage(error, "Couldn't start checkout"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[92px] w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Couldn't load the resale listings."
        onRetry={onRetry}
      />
    );
  }

  /* The API only returns an offer-accepted ticket to the buyer it is held
     for, so an accepted bid here is always mine. */
  const reserved = listings.filter(
    (ticket) => ticket.myBid?.status === "accepted",
  );
  const openOffers = listings.filter(
    (ticket) => ticket.myBid?.status === "open",
  );
  const browsable = listings.filter(
    (ticket) => ticket.myBid?.status !== "accepted",
  );

  return (
    <div>
      <BidDialog
        ticket={bidTarget}
        ceiling={ceiling}
        onClose={() => setBidTarget(null)}
      />

      {reserved.length > 0 ? (
        <div className="mb-3.5 flex flex-col gap-3">
          {reserved.map((ticket) => (
            <ReservedForYou
              key={ticket._id}
              ticket={ticket}
              isPaying={buyingId === ticket._id}
              onPay={() => buy(ticket)}
            />
          ))}
        </div>
      ) : null}

      {openOffers.length > 0 ? (
        <Card className="mb-3.5 flex-col items-start gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-[18px]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">
              {openOffers.length === 1
                ? "Your offer is with the seller"
                : `${openOffers.length} of your offers are with sellers`}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              If one is accepted you get a window to pay before it goes back on
              the market.
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="mb-3.5 flex-col items-start gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-[18px]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">
            Every resale gets a fresh QR
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            The seller&apos;s code dies the moment you pay. Capped at face value
            +{markupPercent}%, so nobody scalps.
          </div>
        </div>
        {faceValue > 0 ? (
          <Badge variant="outline" className="shrink-0 tabular-nums">
            max {formatNairaAmount(ceiling)}
          </Badge>
        ) : null}
      </Card>

      {browsable.length === 0 && reserved.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title="Nothing on resale"
          description="When someone can't make it, their ticket shows up here at face value or close to it."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {browsable.map((ticket) => {
            const price = ticket.resalePriceNaira ?? 0;
            const accepted = ticket.resaleStatus === "offer-accepted";

            return (
              <Card
                key={ticket._id}
                className="flex-col gap-0 py-0 sm:flex-row sm:items-stretch"
              >
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold">
                      {ticket.ticketCategoryName || "General admission"}
                    </span>
                    {accepted ? (
                      <Badge variant="outline">Offer accepted</Badge>
                    ) : null}
                    {ticket.openBidsCount ? (
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3" />
                        {ticket.openBidsCount} offers
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[13px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar>
                        <AvatarImage src={sellerImage(ticket)} />
                        <AvatarFallback>
                          {sellerName(ticket)
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      {sellerName(ticket)}
                    </span>
                    <span className="tabular-nums">
                      {ticket.resaleQuantity ?? 1} available
                    </span>
                  </div>
                </div>

                <hr className="ticket-perforation sm:hidden" />
                <div className="ticket-perforation-vertical hidden shrink-0 sm:block" />

                <div className="flex w-full flex-col justify-center gap-2.5 px-4 py-3.5 sm:w-[230px] sm:shrink-0 sm:py-4 sm:pr-4 sm:pl-5">
                  <div>
                    <div className="text-lg font-bold tracking-[-0.01em] tabular-nums">
                      {formatNairaAmount(price)}
                    </div>
                    {faceValue > 0 ? (
                      <div className="mt-px text-xs text-muted-foreground tabular-nums">
                        face value {formatNairaAmount(faceValue)}
                      </div>
                    ) : null}
                  </div>
                  {ticket.highestBidNaira ? (
                    <div className="text-xs text-muted-foreground tabular-nums">
                      highest offer {formatNairaAmount(ticket.highestBidNaira)}
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-[38px] flex-1 text-[13px]"
                      disabled={buyingId === ticket._id}
                      loading={buyingId === ticket._id}
                      onClick={() => buy(ticket)}
                    >
                      Buy
                    </Button>
                    {ticket.resaleAllowBids && !accepted && !ticket.myBid ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-[38px] text-[13px]"
                        onClick={() => setBidTarget(ticket)}
                      >
                        Offer
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
