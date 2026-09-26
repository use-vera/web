"use client";

import Button from "@/components/ui/button";
import { formatNairaAmount } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Tag, X } from "lucide-react";
import { useState } from "react";

export interface OfferedPromoCode {
  _id: string;
  name: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  appliesTo: "ticket" | "addons";
}

const describeOffer = (offer: OfferedPromoCode) => {
  const amount =
    offer.discountType === "percent"
      ? `${offer.discountValue}% off`
      : `${formatNairaAmount(offer.discountValue)} off`;

  return offer.appliesTo === "addons" ? `${amount} add-ons` : `${amount} tickets`;
};

export interface AppliedPromoCode {
  code: string;
  appliesTo: "ticket" | "addons";
  discountNaira: number;
  /** The code is good, but the order has nothing for it to come off yet. */
  needsAddOn: boolean;
}

/**
 * Where a buyer puts a code in.
 *
 * Three states, deliberately distinct: applied (what it took off), waiting
 * (an add-on code with no add-on in the order yet — the code is fine, so it
 * asks rather than refuses), and refused.
 */
export const PromoCodeField = ({
  applied,
  offers,
  isApplying,
  error,
  onApply,
  onRemove,
  onErrorCleared,
}: {
  applied: AppliedPromoCode | null;
  /** What this event is advertising. Clicking one applies it. */
  offers: OfferedPromoCode[];
  isApplying: boolean;
  error: string;
  onApply: (code: string) => void;
  onRemove: () => void;
  onErrorCleared: () => void;
}) => {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const code = draft.trim();

    if (!code || isApplying) {
      return;
    }

    onApply(code);
  };

  if (applied) {
    const waiting = applied.needsAddOn;

    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md p-3",
          waiting
            ? "bg-amber-500/10 shadow-[inset_0_0_0_1px_var(--color-amber-500)]"
            : "bg-accent shadow-[inset_0_0_0_1px_var(--primary)]",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            "bg-card",
          )}
        >
          {waiting ? (
            <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          ) : (
            <Check className="h-4 w-4 text-accent-foreground" strokeWidth={3} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold tracking-[0.04em]">
            {applied.code}
          </span>
          <span
            className={cn(
              "block text-xs",
              waiting
                ? "text-amber-700 dark:text-amber-300"
                : "text-accent-foreground",
            )}
          >
            {waiting
              ? "Add-on code — pick an add-on to use it"
              : applied.appliesTo === "ticket"
                ? `${formatNairaAmount(applied.discountNaira)} off your ticket`
                : `${formatNairaAmount(applied.discountNaira)} off add-ons`}
          </span>
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove promo code ${applied.code}`}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {offers.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {offers.map((offer) => (
            <li key={offer._id}>
              <button
                type="button"
                disabled={isApplying}
                onClick={() => onApply(offer.code)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md bg-card p-3 text-left shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent">
                  <Tag className="h-3.5 w-3.5 text-accent-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold tracking-[0.04em]">
                    {offer.code}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {offer.name} &middot; {describeOffer(offer)}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-primary">
                  Use
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(input) => {
            setDraft(input.target.value.toUpperCase());

            if (error) {
              onErrorCleared();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Enter code"
          aria-label="Promo code"
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-md bg-card px-3.5 text-[13px] font-semibold tracking-[0.04em] outline-none transition-shadow placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground",
            error
              ? "shadow-[inset_0_0_0_1px_var(--destructive)]"
              : "shadow-[inset_0_0_0_1px_var(--border)] focus-visible:shadow-[inset_0_0_0_2px_var(--primary)]",
          )}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0"
          disabled={!draft.trim()}
          loading={isApplying}
          onClick={submit}
        >
          Apply
        </Button>
      </div>

      {error ? (
        <p
          role="status"
          className="flex items-start gap-2 text-xs text-destructive"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default PromoCodeField;
