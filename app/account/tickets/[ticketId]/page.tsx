"use client";

import { AmountField } from "@/components/organizer/amount-field";
import {
  ErrorState,
  Eyebrow,
  SectionLabel,
  Switch,
} from "@/components/organizer/organizer-primitives";
import TicketQrCode from "@/components/tickets/ticket-qr-code";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import { useEvent } from "@/lib/hooks/use-events";
import {
  useCancelResaleListing,
  useListTicketForResale,
  useResaleBids,
  useRespondToBid,
} from "@/lib/hooks/use-resale";
import {
  useInitializeTicketUpgrade,
  useMyTickets,
  useTicketUpgradeOptions,
  useVerifyTicketPayment,
} from "@/lib/hooks/use-tickets";
import { googleMapsDirectionsUrl } from "@/lib/maps";
import { TicketUpgradeDialog } from "@/components/tickets/upgrade-dialog";
import { getResaleUnlock } from "@/lib/resale-unlock";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ArrowUp, Check, Lock, Navigation } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORM_FEE_PERCENT = 5;
/* Only used until the event loads. The event carries its own ceiling. */
const FALLBACK_MARKUP_PERCENT = 25;

const bidderName = (bidderUserId: unknown) =>
  typeof bidderUserId === "string" || !bidderUserId
    ? "A Vera user"
    : (bidderUserId as { fullName?: string }).fullName || "VU";

const bidderCredentials = (bidderUserId: unknown) =>
  typeof bidderUserId === "string" || !bidderUserId
    ? "A Vera user"
    : (bidderUserId as { fullName?: string }).fullName?.[0] || "VU";

const bidderProfileImage = (bidderUserId: unknown) =>
  typeof bidderUserId === "string" || !bidderUserId
    ? "VU"
    : (bidderUserId as { avatarUrl?: string }).avatarUrl || "VU";

const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();

  /* My tickets is the only endpoint that returns a ticket the buyer owns with
     its resale fields populated, so the one ticket is picked out of that list
     rather than fetched on its own. */
  const ticketsQuery = useMyTickets({ limit: 50 });
  const ticket = (ticketsQuery.data?.items ?? []).find(
    (item) => item._id === ticketId,
  );

  /* Refunded and cancelled lines are not the holder's any more. */
  const heldAddOns = (ticket?.addOns ?? []).filter((purchase) =>
    ["paid", "redeemed"].includes(purchase.status),
  );
  const collectedAddOns = heldAddOns.filter(
    (purchase) => purchase.redeemedQuantity >= purchase.quantity,
  ).length;

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  /* Asked for only once the dialog opens: a ticket page should not pay for an
     availability sweep nobody looked at. */
  const upgradeOptionsQuery = useTicketUpgradeOptions(ticketId, upgradeOpen);
  const upgrade = useInitializeTicketUpgrade(ticketId);
  const verify = useVerifyTicketPayment();
  /* Kept separate from the mutation's own pending state: the wait that
     matters to the buyer is the verify after the popup closes. */
  const [upgrading, setUpgrading] = useState(false);

  const isListed = ticket?.resaleStatus === "listed";
  const bidsQuery = useResaleBids(ticketId, Boolean(isListed));
  const listForResale = useListTicketForResale(ticketId);
  const cancelListing = useCancelResaleListing(ticketId);
  const respond = useRespondToBid(ticketId);

  const [price, setPrice] = useState("");
  const [allowBids, setAllowBids] = useState(true);

  const event =
    ticket && typeof ticket.eventId !== "string" ? ticket.eventId : null;

  /* The ticket's embedded event summary omits the resale policy, so the
     event itself is fetched for the real ceiling rather than assuming the
     platform default. */
  const eventQuery = useEvent(event?._id ?? null);
  const markupPercent =
    eventQuery.data?.event.resale?.maxMarkupPercent ?? FALLBACK_MARKUP_PERCENT;

  const fullEvent = eventQuery.data?.event;
  const directionsUrl = event
    ? googleMapsDirectionsUrl({
        latitude: fullEvent?.latitude,
        longitude: fullEvent?.longitude,
        address: event.address,
      })
    : null;

  const faceValue = Number(ticket?.unitPriceNaira ?? 0);
  const ceiling = Math.round(faceValue * (1 + markupPercent / 100));
  const listedPrice = Number(ticket?.resalePriceNaira ?? 0);
  const netOfFee = Math.round(listedPrice * (1 - PLATFORM_FEE_PERCENT / 100));

  const priceNaira = Number(price) || 0;

  /* Resale stays shut while the organizer can still sell the same seat. */
  const unlock = getResaleUnlock(fullEvent, ticket?.ticketCategoryId ?? null);
  const priceValid =
    unlock.unlocked && priceNaira > 0 && priceNaira <= ceiling;

  const submitListing = async () => {
    try {
      await listForResale.mutateAsync({ priceNaira, allowBids });
      toast.success("Listed for resale");
      setPrice("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't list that ticket"));
    }
  };

  const removeListing = async () => {
    try {
      await cancelListing.mutateAsync();
      toast.success("Listing removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't remove that listing"));
    }
  };

  const answerBid = async (bidId: string, action: "accept" | "reject") => {
    try {
      await respond.mutateAsync({ bidId, action });
      toast.success(action === "accept" ? "Offer accepted" : "Offer declined");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't update that offer"));
    }
  };

  if (ticketsQuery.isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Skeleton className="h-[420px] w-full rounded-sm" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <ErrorState message="We couldn't find that ticket on your account." />
    );
  }

  const bids = (bidsQuery.data?.items ?? []).filter(
    (bid) => bid.status === "open",
  );
  const highest = Math.max(0, ...bids.map((bid) => bid.amountNaira));

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <Link
          href="/account/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tickets
        </Link>
        <h1 className="mt-3.5 text-[26px] leading-tight font-bold tracking-[-0.02em]">
          {event?.name ?? "Your ticket"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {ticket.ticketCategoryName || "General admission"}
          {event
            ? ` · ${new Intl.DateTimeFormat("en-NG", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(event.nextOccurrenceAt))}`
            : ""}
        </p>
        {event ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/events/${event._id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13px] font-semibold transition-colors hover:bg-secondary"
            >
              Open the event page
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13px] font-semibold transition-colors hover:bg-secondary"
              >
                <Navigation className="h-3.5 w-3.5" />
                Directions
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="flex flex-col items-stretch gap-3.5 px-4 lg:flex-row lg:items-start pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="w-full lg:w-[380px] lg:shrink-0">
          <Card className="gap-0 py-0">
            <div className="p-4 sm:p-5">
              <Eyebrow>{event?.name}</Eyebrow>
              <div className="mt-1.5 text-xl font-bold tracking-[-0.01em]">
                {ticket.attendeeName}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {ticket.ticketCategoryName || "General admission"} ·{" "}
                {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
              </div>
            </div>
            <div className="relative">
              <hr className="ticket-perforation" />
              <span className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-background" />
              <span className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-background" />
            </div>
            <div className="flex flex-col items-center gap-3 p-4 sm:p-5">
              <TicketQrCode
                value={ticket.barcodeValue || ticket.ticketCode}
                size={168}
              />
              <div className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
                {ticket.ticketCode}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <Card className="flex-row items-center gap-4 bg-accent p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary">
              <ArrowUp className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-base leading-snug font-semibold">
                Move up a tier
              </div>
              <p className="mt-0.5 text-[13px] text-accent-foreground">
                Pay only the difference from what you already paid.
              </p>
            </div>
            <Button size="sm" onClick={() => setUpgradeOpen(true)}>
              Upgrade
            </Button>
          </Card>

          {heldAddOns.length ? (
            <Card className="gap-0 py-0">
              <div className="flex items-baseline justify-between gap-3 p-4 sm:p-5">
                <div className="text-base leading-snug font-semibold">
                  Your add-ons
                </div>
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {collectedAddOns} of {heldAddOns.length} used
                </span>
              </div>
              <hr className="ticket-perforation" />
              <div className="flex flex-col gap-2 p-4 sm:p-5">
                {heldAddOns.map((purchase) => {
                  const done = purchase.redeemedQuantity >= purchase.quantity;

                  return (
                    <div
                      key={purchase._id}
                      className={cn(
                        "flex items-center gap-3 rounded-md bg-background px-4 py-3 ring-1 ring-border ring-inset",
                        done && "opacity-60",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            done && "line-through decoration-border",
                          )}
                        >
                          {purchase.name}
                          {purchase.variantName ? ` · ${purchase.variantName}` : ""}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {done
                            ? "Collected"
                            : purchase.location ||
                              (purchase.redemption === "door"
                                ? "Show this ticket at the door"
                                : "Collect at the desk")}
                        </div>
                      </div>
                      {done ? (
                        <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                            purchase.redemption === "door"
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {purchase.redemption === "door" ? "Ready" : "Collect"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {isListed ? (
            <>
              <Card className="gap-0 py-0">
                <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5 sm:py-[18px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-snug font-semibold">
                        Listed for resale
                      </span>
                      <Badge>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Live
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-[13px] text-muted-foreground">
                      Your QR keeps working until someone pays.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={cancelListing.isPending}
                    onClick={removeListing}
                  >
                    Remove listing
                  </Button>
                </div>
                <hr className="ticket-perforation" />
                <div className="flex flex-wrap gap-5 sm:gap-7 px-4 py-4 sm:px-5 sm:py-[18px]">
                  {[
                    ["Your price", formatNairaAmount(listedPrice)],
                    ["Face value", formatNairaAmount(faceValue)],
                    ["Ceiling", formatNairaAmount(ceiling)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <Eyebrow>{label}</Eyebrow>
                      <div className="mt-1 text-[22px] font-bold tabular-nums">
                        {value}
                      </div>
                    </div>
                  ))}
                  <div className="ml-auto text-right">
                    <Eyebrow>You receive</Eyebrow>
                    <div className="mt-1 text-[22px] font-bold tabular-nums">
                      {formatNairaAmount(netOfFee)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      after {PLATFORM_FEE_PERCENT}% fee
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="gap-0 py-0">
                <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4">
                  <div>
                    <span className="text-base leading-snug font-semibold">
                      Offers
                    </span>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Accepting one gives that buyer a window to pay.
                    </div>
                  </div>
                  <Badge variant="outline" className="tabular-nums">
                    {bids.length} open
                  </Badge>
                </div>
                <hr className="ticket-perforation" />
                <div className="px-5 py-1 pb-2.5">
                  {bidsQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="my-3 h-11 w-full rounded-md"
                      />
                    ))
                  ) : bids.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-muted-foreground">
                      No offers yet. Buyers can still buy outright at your
                      price.
                    </p>
                  ) : (
                    bids.map((bid) => (
                      <div
                        key={bid._id}
                        className="flex items-center gap-3 py-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          <Avatar>
                            <AvatarImage
                              src={bidderProfileImage(bid?.bidderUserId)}
                            />
                            <AvatarFallback>
                              {bidderCredentials(bid?.bidderUserId)}
                            </AvatarFallback>
                          </Avatar>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[13px] font-semibold">
                            {bidderName(bid.bidderUserId)}
                            {bid.amountNaira === highest && bids.length > 1 ? (
                              <Badge>Highest</Badge>
                            ) : null}
                          </div>
                          {bid.expiresAt ? (
                            <div className="text-xs text-muted-foreground">
                              expires{" "}
                              {new Intl.DateTimeFormat("en-NG", {
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }).format(new Date(bid.expiresAt))}
                            </div>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[15px] font-bold tabular-nums">
                          {formatNairaAmount(bid.amountNaira)}
                        </span>
                        <div className="ml-4 flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-[34px] text-xs"
                            disabled={respond.isPending}
                            onClick={() => answerBid(bid._id, "reject")}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="h-[34px] text-xs"
                            disabled={respond.isPending}
                            onClick={() => answerBid(bid._id, "accept")}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="gap-0 py-0">
              <div className="px-4 py-4 sm:px-5 sm:py-[18px]">
                <div className="text-base leading-snug font-semibold">
                  Can&apos;t make it?
                </div>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  List it for resale. Vera issues the buyer a fresh QR and kills
                  yours, so nobody can be sold a screenshot.
                </p>
              </div>
              <hr className="ticket-perforation" />
              {unlock.reason ? (
                <div className="flex items-start gap-2.5 border-b border-border bg-muted/60 px-4 py-3.5 sm:px-5 sm:py-4">
                  <Lock className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {unlock.reason}
                  </p>
                </div>
              ) : null}
              <div className="p-4 sm:p-5">
                <label className="block">
                  <SectionLabel
                    hint={`Face value ${formatNairaAmount(faceValue)} · ceiling ${formatNairaAmount(ceiling)}`}
                  >
                    Your price
                  </SectionLabel>
                  <AmountField
                    value={price}
                    onValueChange={setPrice}
                    prefix="₦"
                    disabled={!unlock.unlocked}
                    placeholder={faceValue.toLocaleString("en-NG")}
                    className="w-full sm:max-w-[240px]"
                  />
                </label>

                {priceNaira > ceiling ? (
                  <p className="mt-2 text-[13px] font-semibold text-destructive">
                    That is above the ceiling for this event.
                  </p>
                ) : null}

                {priceValid ? (
                  <p className="mt-2 text-[13px] text-muted-foreground tabular-nums">
                    You receive{" "}
                    <span className="font-semibold text-foreground">
                      {formatNairaAmount(
                        Math.round(
                          priceNaira * (1 - PLATFORM_FEE_PERCENT / 100),
                        ),
                      )}
                    </span>{" "}
                    after the {PLATFORM_FEE_PERCENT}% fee.
                  </p>
                ) : null}

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-sm font-semibold">
                      Accept offers
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Buyers can propose a lower price you choose to take or
                      leave.
                    </span>
                  </div>
                  <Switch
                    checked={allowBids}
                    onChange={setAllowBids}
                    label="Accept offers"
                  />
                </div>
              </div>
              <div className={cn("bg-muted/60 px-5 py-4")}>
                <Button
                  disabled={!priceValid}
                  loading={listForResale.isPending}
                  onClick={submitListing}
                >
                  List for resale
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      <TicketUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        data={upgradeOptionsQuery.data}
        isLoading={upgradeOptionsQuery.isLoading}
        isSubmitting={upgrade.isPending || upgrading}
        onUpgrade={async (ticketCategoryId) => {
          try {
            const result = await upgrade.mutateAsync({
              ticketCategoryId,
              callbackUrl: `${window.location.origin}/checkout/callback`,
            });

            if (result.requiresPayment && result.payment?.authorizationUrl) {
              setUpgradeOpen(false);

              /* A popup, not a navigation: the callback page closes itself and
                 expects the original window to still be here to finish up.
                 Navigating away strands the buyer on "you can close this tab". */
              const popup = window.open(
                result.payment.authorizationUrl,
                "vera-upgrade",
                "width=480,height=720",
              );

              const pollClosed = window.setInterval(() => {
                if (popup && !popup.closed) {
                  return;
                }

                window.clearInterval(pollClosed);
                setUpgrading(true);

                void verify
                  .mutateAsync({
                    ticketId,
                    reference: result.payment?.reference,
                  })
                  .then(() => ticketsQuery.refetch())
                  .then(() =>
                    toast.success(
                      "You have been upgraded. Your ticket carries a new code.",
                    ),
                  )
                  .catch(() =>
                    toast.message("We could not confirm that yet", {
                      description:
                        "If you were charged, your ticket will update shortly.",
                    }),
                  )
                  .finally(() => setUpgrading(false));
              }, 700);

              return;
            }

            toast.success("You have been upgraded. Your ticket carries a new code.");
            setUpgradeOpen(false);
            void ticketsQuery.refetch();
          } catch (error) {
            /* The dialog stays open so the reason sits next to the choice. */
            toast.error(getApiErrorMessage(error, "Couldn't start the upgrade"));
          }
        }}
      />

    </div>
  );
};

export default TicketDetailPage;
