"use client";

import { AmountField } from "@/components/organizer/amount-field";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Eyebrow, Switch } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useEventPromoCodes,
  useOrganizerEvent,
  useUpdateEvent,
} from "@/lib/hooks/use-organizer";
import {
  type EventPromoCodeApi,
  type EventPromoCodePayload,
} from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DiscountType = "percent" | "fixed";
type AppliesTo = "ticket" | "addons";

/** Draft state while an organizer is typing. Numbers stay strings. */
interface PromoDraft {
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: string;
  appliesTo: AppliesTo;
  maxUses: string;
  /** Listed on the event for anyone to see and tap. */
  isPublic: boolean;
}

const emptyDraft = (): PromoDraft => ({
  name: "",
  code: "",
  discountType: "percent",
  discountValue: "",
  appliesTo: "ticket",
  maxUses: "",
  isPublic: false,
});

const APPLIES_TO: { value: AppliesTo; label: string; hint: string }[] = [
  {
    value: "ticket",
    label: "The ticket price",
    hint: "Every tier, including presale",
  },
  {
    value: "addons",
    label: "Add-ons",
    hint: "Whatever extras are in the order",
  },
];

const toPayload = (promo: EventPromoCodeApi): EventPromoCodePayload => ({
  name: promo.name,
  code: promo.code,
  discountType: promo.discountType,
  discountValue: promo.discountValue,
  appliesTo: promo.appliesTo,
  maxUses: promo.maxUses,
  perUserLimit: promo.perUserLimit,
  endsAt: promo.endsAt,
  isPublic: promo.isPublic,
  active: promo.active,
});

const describeDiscount = (promo: {
  discountType: DiscountType;
  discountValue: number;
}) =>
  promo.discountType === "percent"
    ? `${promo.discountValue}%`
    : formatNairaAmount(promo.discountValue);

const PromoCodesPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const promoCodesQuery = useEventPromoCodes(eventId);
  const eventQuery = useOrganizerEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);

  const [draft, setDraft] = useState<PromoDraft | null>(null);

  const codes = promoCodesQuery.data?.items ?? [];
  const ticketPrice = Number(
    eventQuery.data?.event?.ticketPriceNaira || 0,
  );
  const feePercent = Number(eventQuery.data?.event?.platformFeePercent || 5);

  /* What this code would do to one ticket at the headline price. The
     organizer carries the discount and Vera's fee is still worked out on the
     full price, so this is the number they actually keep. */
  const previewValue = draft
    ? Math.min(
        ticketPrice,
        draft.discountType === "percent"
          ? Math.round(
              (ticketPrice * Math.min(100, Number(draft.discountValue) || 0)) /
                100,
            )
          : Number(draft.discountValue) || 0,
      )
    : 0;
  const veraFee = Math.round((ticketPrice * feePercent) / 100);

  const save = async (next: EventPromoCodePayload[], message: string) => {
    try {
      await updateEvent.mutateAsync({ promoCodes: next });
      await promoCodesQuery.refetch();
      toast.success(message);

      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save that code."));

      return false;
    }
  };

  const addCode = async () => {
    if (!draft) {
      return;
    }

    const code = draft.code.trim().toUpperCase();
    const value = Math.round(Number(draft.discountValue) || 0);

    if (!draft.name.trim()) {
      toast.error("Give the code a name so you can tell them apart.");
      return;
    }

    if (code.length < 3 || !/^[A-Z0-9-]+$/.test(code)) {
      toast.error("A code is at least 3 letters, numbers or dashes.");
      return;
    }

    if (codes.some((promo) => promo.code === code)) {
      toast.error(`You already have a code called ${code}.`);
      return;
    }

    if (value < 1) {
      toast.error("Set how much this code takes off.");
      return;
    }

    if (draft.discountType === "percent" && value > 100) {
      toast.error("A code cannot take off more than 100%.");
      return;
    }

    const saved = await save(
      [
        ...codes.map(toPayload),
        {
          name: draft.name.trim(),
          code,
          discountType: draft.discountType,
          discountValue: value,
          appliesTo: draft.appliesTo,
          maxUses: Math.max(0, Math.round(Number(draft.maxUses) || 0)),
          perUserLimit: 1,
          isPublic: draft.isPublic,
          active: true,
        },
      ],
      `${code} is live.`,
    );

    if (saved) {
      setDraft(null);
    }
  };

  const removeCode = (promo: EventPromoCodeApi) =>
    save(
      codes.filter((item) => item._id !== promo._id).map(toPayload),
      `${promo.code} removed.`,
    );

  const togglePaused = (promo: EventPromoCodeApi) =>
    save(
      codes.map((item) =>
        item._id === promo._id
          ? { ...toPayload(item), active: !item.active }
          : toPayload(item),
      ),
      promo.active ? `${promo.code} paused.` : `${promo.code} is live again.`,
    );

  return (
    <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Promo codes</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Money off, for people you choose to give it to. A discount comes out
            of what you keep &mdash; Vera&apos;s fee is still worked out on the
            full price.
          </p>
        </div>
        {draft ? null : (
          <Button size="sm" onClick={() => setDraft(emptyDraft())}>
            <Plus className="h-4 w-4" />
            New code
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {draft ? (
            <Card className="gap-0 p-5">
              <Eyebrow>New code</Eyebrow>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="promo-name"
                    className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  >
                    Name
                  </label>
                  <OrganizerField
                    id="promo-name"
                    value={draft.name}
                    onChange={(input) =>
                      setDraft({ ...draft, name: input.target.value })
                    }
                    placeholder="Early bird"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Only you see this.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="promo-code"
                    className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  >
                    Code
                  </label>
                  <OrganizerField
                    id="promo-code"
                    value={draft.code}
                    onChange={(input) =>
                      setDraft({
                        ...draft,
                        code: input.target.value.toUpperCase(),
                      })
                    }
                    placeholder="EARLY10"
                    className="font-semibold tracking-[0.06em]"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    What attendees type. Case does not matter.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    How much off
                  </span>
                  <div className="inline-flex gap-1 rounded-md bg-muted p-1">
                    {(["percent", "fixed"] as DiscountType[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={draft.discountType === option}
                        onClick={() =>
                          setDraft({ ...draft, discountType: option })
                        }
                        className={cn(
                          "inline-flex h-10 cursor-pointer items-center rounded-sm px-4 text-[13px] font-semibold transition-colors",
                          draft.discountType === option
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option === "percent" ? "Percent" : "Naira"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="promo-value"
                    className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  >
                    {draft.discountType === "percent"
                      ? "Percent off"
                      : "Amount off"}
                  </label>
                  <AmountField
                    id="promo-value"
                    value={draft.discountValue}
                    onValueChange={(digits) =>
                      setDraft({ ...draft, discountValue: digits })
                    }
                    prefix={draft.discountType === "fixed" ? "₦" : undefined}
                    placeholder={draft.discountType === "percent" ? "10" : "5000"}
                  />
                </div>
              </div>

              <div className="mt-4">
                <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Take it off
                </span>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {APPLIES_TO.map((option) => {
                    const selected = draft.appliesTo === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setDraft({ ...draft, appliesTo: option.value })
                        }
                        className={cn(
                          "cursor-pointer rounded-md p-3.5 text-left transition-colors",
                          selected
                            ? "bg-accent shadow-[inset_0_0_0_2px_var(--primary)]"
                            : "shadow-[inset_0_0_0_1px_var(--border)] hover:bg-muted/50",
                        )}
                      >
                        <span
                          className={cn(
                            "block text-[13px] font-semibold",
                            selected && "text-accent-foreground",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  An add-on code waits until the buyer has an add-on in their
                  order, and says so rather than failing.
                </p>
              </div>

              <div className="mt-4 max-w-[220px]">
                <label
                  htmlFor="promo-uses"
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                >
                  How many uses
                </label>
                <AmountField
                  id="promo-uses"
                  value={draft.maxUses}
                  onValueChange={(digits) =>
                    setDraft({ ...draft, maxUses: digits })
                  }
                  placeholder="No limit"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  One use per attendee.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-4 rounded-md bg-muted/50 p-3.5">
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">
                    Show it on the event
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Anyone can see and tap it at checkout. Leave off for a code
                    you hand out yourself.
                  </span>
                </div>
                <Switch
                  checked={draft.isPublic}
                  onChange={(next) => setDraft({ ...draft, isPublic: next })}
                  label="Show this code on the event"
                />
              </div>

              <div className="mt-5 flex gap-2.5">
                <Button
                  onClick={() => void addCode()}
                  loading={updateEvent.isPending}
                >
                  Save code
                </Button>
                <Button variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="gap-0 py-0">
            {promoCodesQuery.isLoading ? (
              <div className="flex flex-col gap-3 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : codes.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No promo codes yet. A code is money off for people you choose to
                give it to.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {codes.map((promo) => (
                  <div
                    key={promo._id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold tracking-[0.04em]",
                            !promo.active && "text-muted-foreground",
                          )}
                        >
                          {promo.code}
                        </span>
                        <Badge>
                          {promo.appliesTo === "addons"
                            ? "Add-ons"
                            : "Ticket price"}
                        </Badge>
                        {promo.isPublic ? (
                          <Badge variant="outline">Listed</Badge>
                        ) : null}
                        {promo.active ? null : <Badge>Paused</Badge>}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {promo.name} &middot; {describeDiscount(promo)} off
                        {promo.maxUses > 0
                          ? ` · ${promo.usedCount} of ${promo.maxUses} used`
                          : ` · used ${promo.usedCount} ${
                              promo.usedCount === 1 ? "time" : "times"
                            }`}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {formatNairaAmount(promo.givenAwayNaira)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        given away
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void save(
                            codes.map((item) =>
                              item._id === promo._id
                                ? { ...toPayload(item), isPublic: !item.isPublic }
                                : toPayload(item),
                            ),
                            promo.isPublic
                              ? `${promo.code} is hidden from the event.`
                              : `${promo.code} is on the event for anyone to use.`,
                          )
                        }
                      >
                        {promo.isPublic ? "Hide" : "Show"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void togglePaused(promo)}
                      >
                        {promo.active ? "Pause" : "Resume"}
                      </Button>
                      <button
                        type="button"
                        aria-label={`Remove ${promo.code}`}
                        onClick={() => void removeCode(promo)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="w-full gap-0 p-5 lg:w-[300px] lg:shrink-0">
          <Eyebrow>Given away so far</Eyebrow>
          <div className="mt-2.5 text-3xl font-bold tracking-[-0.02em] tabular-nums">
            {formatNairaAmount(promoCodesQuery.data?.givenAwayNaira ?? 0)}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            across {promoCodesQuery.data?.paidUseCount ?? 0} paid{" "}
            {promoCodesQuery.data?.paidUseCount === 1 ? "order" : "orders"}
          </div>

          {draft && ticketPrice > 0 && previewValue > 0 ? (
            <>
              <hr className="ticket-perforation my-4" />
              <Eyebrow>On one ticket</Eyebrow>
              <dl className="mt-2.5 flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ticket price</dt>
                  <dd className="tabular-nums">
                    {formatNairaAmount(ticketPrice)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Your discount</dt>
                  <dd className="tabular-nums">
                    &minus;{formatNairaAmount(previewValue)}
                  </dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Buyer pays</dt>
                  <dd className="tabular-nums">
                    {formatNairaAmount(ticketPrice - previewValue)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Vera&apos;s {feePercent}% of {formatNairaAmount(ticketPrice)}
                  </dt>
                  <dd className="tabular-nums">
                    &minus;{formatNairaAmount(veraFee)}
                  </dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>You keep</dt>
                  <dd className="tabular-nums">
                    {formatNairaAmount(
                      Math.max(0, ticketPrice - previewValue - veraFee),
                    )}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            A buyer who uses a code can only resell at what they paid, not at
            the full price.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PromoCodesPage;
