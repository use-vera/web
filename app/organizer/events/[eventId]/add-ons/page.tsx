"use client";

import { Eyebrow, Meter } from "@/components/organizer/organizer-primitives";
import { AddOnRedemptionPanel } from "@/components/organizer/add-on-redemption-panel";
import { OrganizerField } from "@/components/organizer/organizer-field";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useAddOnFulfilment,
  useOrganizerEvent,
  useRedeemAddOn,
} from "@/lib/hooks/use-organizer";
import { organizerService } from "@/lib/services/organizer.service";
import { type TicketAddOnApi } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { PackageCheck, Search, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

/** The event's name, when it has loaded, as a sentence opener. */
const namePrefix = (name?: string) => (name ? `${name} ·` : "");

/**
 * The collection desk.
 *
 * Two jobs, which is why they share a screen: what is still owed across the
 * whole event, and handing one person's item over when they come and ask.
 * The desk looks a ticket up rather than admitting it — someone collecting a
 * dinner may have walked in hours ago.
 */
const AddOnsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = useOrganizerEvent(eventId);
  const fulfilmentQuery = useAddOnFulfilment(eventId);
  const redeemAddOn = useRedeemAddOn(eventId);

  const [code, setCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [heldAddOns, setHeldAddOns] = useState<TicketAddOnApi[]>([]);
  const [holder, setHolder] = useState("");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = fulfilmentQuery.data?.items ?? [];
  const sold = rows.reduce((sum, row) => sum + row.sold, 0);
  const collected = rows.reduce((sum, row) => sum + row.collected, 0);
  const outstanding = Math.max(0, sold - collected);

  const lookUp = async (raw: string) => {
    const trimmed = raw.trim();

    if (!trimmed) {
      return;
    }

    setLooking(true);
    setError(null);

    try {
      /* Read-only on purpose: the desk must be able to serve someone who
         walked in hours ago without admitting someone who never did. */
      const response = await organizerService.lookupTicket(eventId, trimmed);

      setHeldAddOns(response.addOns ?? []);
      setHolder(response.ticket.attendeeName);

      if (!(response.addOns ?? []).length) {
        setError("That ticket has no add-ons on it.");
      }
    } catch (caught) {
      setHeldAddOns([]);
      setError(getApiErrorMessage(caught, "That code didn't match a ticket"));
    } finally {
      setLooking(false);
      setCode("");
    }
  };

  const handOver = async (purchase: TicketAddOnApi) => {
    setRedeemingId(purchase._id);
    setError(null);

    try {
      const updated = await redeemAddOn.mutateAsync({ purchaseId: purchase._id });

      setHeldAddOns((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (caught) {
      setError(getApiErrorMessage(caught, `Could not hand over ${purchase.name}`));
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Add-ons</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {namePrefix(eventQuery.data?.event?.name)} What has been collected, and
          what is still owed.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="gap-0 p-5">
            <Eyebrow>Hand something over</Eyebrow>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Scan or type the ticket code to hand over anything on it. This
              only reads the ticket — it never admits anyone.
            </p>

            <form
              className="mt-3.5 flex gap-2"
              onSubmit={(formEvent) => {
                formEvent.preventDefault();
                void lookUp(code);
              }}
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <OrganizerField
                  value={code}
                  onChange={(input) => setCode(input.target.value)}
                  placeholder="VRA-XXXXXXXX-XXXXX"
                  aria-label="Ticket code"
                  className="pl-10 font-semibold tracking-[0.04em]"
                />
              </div>
              <Button
                type="submit"
                className="h-12 shrink-0"
                disabled={!code.trim()}
                loading={looking}
              >
                Look up
              </Button>
            </form>

            {error ? (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-destructive">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </Card>

          {heldAddOns.length ? (
            <AddOnRedemptionPanel
              addOns={heldAddOns}
              attendeeName={holder}
              surface="all"
              busyPurchaseId={redeemingId}
              onRedeem={(purchase) => void handOver(purchase)}
            />
          ) : null}

          <Card className="gap-0 py-0">
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4">
              <span className="text-base leading-snug font-semibold">
                Still to hand over
              </span>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {outstanding} of {sold}
              </span>
            </div>
            <hr className="ticket-perforation" />

            {fulfilmentQuery.isLoading ? (
              <div className="flex flex-col gap-3 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Nothing sold yet. Add-ons show up here as people buy them.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {rows.map((row) => (
                  <div
                    key={`${row.addOnId}-${row.variantName}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">
                          {row.name}
                          {row.variantName ? ` · ${row.variantName}` : ""}
                        </span>
                        {row.outstanding === 0 ? (
                          <Badge variant="outline">All collected</Badge>
                        ) : null}
                      </div>
                      <div className="mt-1.5 max-w-[260px]">
                        <Meter
                          percent={row.sold ? (row.collected / row.sold) * 100 : 0}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          row.outstanding === 0 && "text-muted-foreground",
                        )}
                      >
                        {row.collected} / {row.sold}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.outstanding === 0
                          ? "done"
                          : `${row.outstanding} outstanding`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="w-full gap-0 p-5 lg:w-[300px] lg:shrink-0">
          <Eyebrow>Collected so far</Eyebrow>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-[-0.02em] tabular-nums">
              {collected}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              of {sold}
            </span>
          </div>
          <div className="mt-3">
            <Meter percent={sold ? (collected / sold) * 100 : 0} />
          </div>

          <hr className="ticket-perforation my-4" />

          <div className="flex items-start gap-2.5">
            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Anything on a ticket can be handed over here, whenever they come
              for it — including something the gate did not get to. The door
              hands over its own items as people are scanned in.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddOnsPage;
