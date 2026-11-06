"use client";

import { Meter, Panel, PanelHeader, SearchField } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { AddOnRedemptionPanel } from "@/components/organizer/add-on-redemption-panel";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
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
import { PackageCheck, TriangleAlert } from "lucide-react";
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Panel>
          <PanelHeader
            title="Hand something over"
            description={`${namePrefix(eventQuery.data?.event?.name)} Scan or type a ticket code. This only reads the ticket, it never admits anyone.`}
          />
          <div className="px-5 pb-5 sm:px-6">
            <form
              className="flex gap-2"
              onSubmit={(formEvent) => {
                formEvent.preventDefault();
                void lookUp(code);
              }}
            >
              <SearchField
                value={code}
                onChange={(input) => setCode(input.target.value)}
                placeholder="VRA-XXXXXXXX-XXXXX"
                aria-label="Ticket code"
                className="flex-1 font-semibold"
              />
              <Button type="submit" variant="ink" className="h-12 shrink-0" disabled={!code.trim()} loading={looking}>
                Look up
              </Button>
            </form>

            {error ? (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-destructive">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </div>
        </Panel>

        {heldAddOns.length ? (
          <AddOnRedemptionPanel
            addOns={heldAddOns}
            attendeeName={holder}
            surface="all"
            busyPurchaseId={redeemingId}
            onRedeem={(purchase) => void handOver(purchase)}
          />
        ) : null}

        <Panel>
          <PanelHeader
            title="Still to hand over"
            action={
              <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
                {outstanding} of {sold}
              </span>
            }
          />

          {fulfilmentQuery.isLoading ? (
            <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="px-5 pb-6 text-[15px] text-muted-foreground sm:px-6">Nothing sold yet. Add-ons show up here as people buy them.</p>
          ) : (
            <div className="flex flex-col px-2.5 pb-2.5">
              {rows.map((row) => (
                <div key={`${row.addOnId}-${row.variantName}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] px-2.5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold">
                        {row.name}
                        {row.variantName ? ` · ${row.variantName}` : ""}
                      </span>
                      {row.outstanding === 0 ? <Badge variant="outline">All collected</Badge> : null}
                    </div>
                    <div className="mt-2 max-w-[320px]">
                      <Meter percent={row.sold ? (row.collected / row.sold) * 100 : 0} />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn("text-[15px] font-bold tabular-nums", row.outstanding === 0 && "text-muted-foreground")}>
                      {row.collected} / {row.sold}
                    </div>
                    <div className="text-[13px] text-muted-foreground">{row.outstanding === 0 ? "done" : `${row.outstanding} outstanding`}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-20 lg:w-[320px] lg:shrink-0">
        <section
          aria-label="Collected so far"
          className="flex flex-col gap-4 rounded-[28px] p-6"
          style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
        >
          <span className="text-sm font-bold opacity-75">Collected so far</span>
          <div className="flex items-baseline gap-2">
            <span style={{ lineHeight: 0.9 }} className="text-[64px] font-extrabold tracking-[-0.05em] tabular-nums">
              {collected}
            </span>
            <span className="text-base font-bold tabular-nums opacity-75">of {sold}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#2A220C]/15">
            <div className="h-full rounded-full bg-[#2A220C]" style={{ width: `${sold ? Math.min(100, (collected / sold) * 100) : 0}%` }} />
          </div>
        </section>
        <p className="flex items-start gap-2.5 px-2 text-[13px] leading-relaxed text-muted-foreground">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Anything on a ticket can be handed over here, whenever they come for it, including something the gate did not get to. The door hands over its own items as people are scanned in.
        </p>
      </aside>
    </div>
  );
};

export default AddOnsPage;
