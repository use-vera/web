"use client";

import { AmountField } from "@/components/organizer/amount-field";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Switch } from "@/components/organizer/organizer-primitives";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export type AddOnRedemption = "door" | "desk" | "none";

/** Draft state while an organizer is typing. Numbers stay strings. */
export interface AddOnDraft {
  name: string;
  priceNaira: string;
  stock: string;
  redemption: AddOnRedemption;
  location: string;
  /** Comma-separated while editing: "S, M, L". Empty means no options. */
  variantNames: string;
  variantStock: string;
  transfersOnResale: boolean;
  /* Until the organizer types a number of their own, stock follows the
     event's capacity. These say whether that has happened, so a field left
     alone keeps tracking a tier added later instead of going stale. */
  stockTouched?: boolean;
  variantStockTouched?: boolean;
}

export const emptyAddOn = (): AddOnDraft => ({
  name: "",
  priceNaira: "",
  stock: "",
  redemption: "door",
  location: "",
  variantNames: "",
  variantStock: "",
  transfersOnResale: true,
});

const REDEMPTIONS: { value: AddOnRedemption; label: string; hint: string }[] = [
  { value: "door", label: "At the door", hint: "Scanned with the ticket" },
  { value: "desk", label: "Collect at a desk", hint: "Scanned where you hand it over" },
  { value: "none", label: "Nothing to collect", hint: "Prints on the ticket" },
];

/**
 * What a stock field holds: the organizer's number once they set one, and
 * the event's capacity until then.
 *
 * An add-on is only ever sold alongside a ticket, so capacity is the real
 * ceiling anyway. Starting there means the common case needs no typing and
 * the number is never higher than the room allows.
 */
export const resolveAddOnStock = (draft: AddOnDraft, capacity: number) =>
  draft.stockTouched ? draft.stock : capacity > 0 ? String(capacity) : "";

export const resolveAddOnVariantStock = (
  draft: AddOnDraft,
  capacity: number,
) =>
  draft.variantStockTouched
    ? draft.variantStock
    : capacity > 0
      ? String(capacity)
      : "";

export const parseVariantNames = (value: string) =>
  value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

/**
 * Turns drafts into what the API takes. Options share one stock number here,
 * which is what an organizer ordering shirts usually means; per-option counts
 * are tuned on the event afterwards.
 */
export const toAddOnPayload = (drafts: AddOnDraft[], capacity: number) =>
  drafts
    .filter((draft) => draft.name.trim())
    .map((draft) => {
      const names = parseVariantNames(draft.variantNames);
      const perOption = Math.max(
        0,
        Math.round(Number(resolveAddOnVariantStock(draft, capacity)) || 0),
      );

      return {
        name: draft.name.trim(),
        priceNaira: Math.max(0, Number(draft.priceNaira) || 0),
        redemption: draft.redemption,
        location: draft.location.trim(),
        stock: names.length
          ? 0
          : Math.max(
              0,
              Math.round(Number(resolveAddOnStock(draft, capacity)) || 0),
            ),
        variants: names.map((name) => ({ name, stock: perOption })),
        maxPerTicket: 1,
        transfersOnResale: draft.transfersOnResale,
        active: true,
      };
    });

/** The first draft that has a name but no sellable stock. */
export const findIncompleteAddOn = (drafts: AddOnDraft[], capacity: number) =>
  drafts.find((draft) => {
    if (!draft.name.trim()) {
      return false;
    }

    return parseVariantNames(draft.variantNames).length
      ? Math.round(Number(resolveAddOnVariantStock(draft, capacity)) || 0) < 1
      : Math.round(Number(resolveAddOnStock(draft, capacity)) || 0) < 1;
  });

export const AddOnEditor = ({
  drafts,
  onChange,
  capacity,
}: {
  drafts: AddOnDraft[];
  onChange: (next: AddOnDraft[]) => void;
  /** Everyone this event can hold, which is where stock starts. */
  capacity: number;
}) => {
  const patch = (index: number, changes: Partial<AddOnDraft>) =>
    onChange(
      drafts.map((draft, i) => (i === index ? { ...draft, ...changes } : draft)),
    );

  const update = <K extends keyof AddOnDraft>(
    index: number,
    field: K,
    value: AddOnDraft[K],
  ) => patch(index, { [field]: value } as Partial<AddOnDraft>);

  return (
    <div className="flex flex-col gap-3">
      {drafts.map((draft, index) => {
        const options = parseVariantNames(draft.variantNames);

        return (
          <div
            key={index}
            className="rounded-sm bg-card p-4 ring-1 ring-foreground/10 ring-inset"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Add-on {index + 1}
              </span>
              <button
                type="button"
                aria-label={`Remove add-on ${index + 1}`}
                onClick={() => onChange(drafts.filter((_, i) => i !== index))}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px_140px]">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Name
                </span>
                <OrganizerField
                  value={draft.name}
                  placeholder="Parking"
                  onChange={(input) => update(index, "name", input.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Price
                </span>
                <AmountField
                  value={draft.priceNaira}
                  onValueChange={(digits) => update(index, "priceNaira", digits)}
                  prefix="₦"
                  placeholder="5,000"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  {options.length ? "Per option" : "Stock"}
                </span>
                <AmountField
                  value={
                    options.length
                      ? resolveAddOnVariantStock(draft, capacity)
                      : resolveAddOnStock(draft, capacity)
                  }
                  onValueChange={(digits) =>
                    patch(
                      index,
                      options.length
                        ? { variantStock: digits, variantStockTouched: true }
                        : { stock: digits, stockTouched: true },
                    )
                  }
                  placeholder={options.length ? "20" : "150"}
                />
                {/* Said out loud, because a number that filled itself in is
                    otherwise indistinguishable from one already typed. */}
                {capacity > 0 &&
                (options.length
                  ? !draft.variantStockTouched
                  : !draft.stockTouched) ? (
                  <span className="mt-1.5 block text-xs text-muted-foreground">
                    Your full capacity of {capacity.toLocaleString("en-NG")}
                    {options.length ? " for each option" : ""}. Lower it if you
                    have fewer to sell.
                  </span>
                ) : null}
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Options
              </span>
              <OrganizerField
                value={draft.variantNames}
                placeholder="S, M, L, XL — leave blank if there is only one kind"
                onChange={(input) =>
                  update(index, "variantNames", input.target.value)
                }
              />
              {options.length ? (
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  {options.length} options, {draft.variantStock || 0} of each.
                  Sizes get their own stock so a desk knows it is out of mediums,
                  not out of shirts.
                </span>
              ) : null}
            </label>

            <div className="mt-4">
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                How is it collected?
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {REDEMPTIONS.map((option) => {
                  const active = draft.redemption === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => update(index, "redemption", option.value)}
                      className={cn(
                        "cursor-pointer rounded-md p-3 text-left transition-colors",
                        active
                          ? "bg-accent ring-2 ring-primary ring-inset"
                          : "bg-background ring-1 ring-border ring-inset hover:ring-foreground/25",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-[13px] font-semibold",
                          active && "text-accent-foreground",
                        )}
                      >
                        {option.label}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11.5px]",
                          active
                            ? "text-accent-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {draft.redemption !== "none" ? (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Where
                </span>
                <OrganizerField
                  value={draft.location}
                  placeholder="Dining tent, from 6:30 PM"
                  onChange={(input) => update(index, "location", input.target.value)}
                />
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  Shown on the guest&apos;s ticket, so nobody has to ask your
                  staff.
                </span>
              </label>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="min-w-0">
                <span className="block text-[13px] font-semibold">
                  Follows a resold ticket
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Turn off for anything personal. The seller is refunded instead.
                </span>
              </div>
              <Switch
                checked={draft.transfersOnResale}
                onChange={(next) => update(index, "transfersOnResale", next)}
                label="Follows a resold ticket"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...drafts, emptyAddOn()])}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border text-[13px] font-semibold text-primary transition-colors hover:border-primary hover:bg-accent/40"
      >
        <Plus className="h-4 w-4" />
        {drafts.length ? "Add another" : "Add an add-on"}
      </button>
    </div>
  );
};
