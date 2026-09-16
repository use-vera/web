"use client";

import { formatNairaAmount } from "@/lib/format-currency";
import { type EventAddOnApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/** What the buyer has picked, keyed by add-on id. */
export interface AddOnSelection {
  [addOnId: string]: { quantity: number; variantName?: string };
}

/* Stock only earns a line when it is genuinely scarce; "120 left" is noise. */
const SCARCE_AT = 10;

const whereLabel = (redemption: EventAddOnApi["redemption"]) =>
  redemption === "door"
    ? "At the door"
    : redemption === "desk"
      ? "Collect at desk"
      : "On your ticket";

/**
 * The add-ons step of a checkout. The parent owns the selection so the running
 * total can live beside it in the purchase panel, which is the one thing the
 * desktop layout can do that the phone cannot.
 */
export const AddOnPicker = ({
  addOns,
  selection,
  onChange,
}: {
  addOns: EventAddOnApi[];
  selection: AddOnSelection;
  onChange: (next: AddOnSelection) => void;
}) => {
  const sellable = addOns.filter((addOn) => !addOn.soldOut);

  if (!sellable.length) {
    return null;
  }

  const toggle = (addOn: EventAddOnApi) => {
    const next = { ...selection };

    if (next[addOn._id]) {
      delete next[addOn._id];
    } else {
      /* Pre-pick the first option still in stock so one click is enough for
         the common case; they can change it below. */
      const firstAvailable = addOn.variants?.find((variant) => !variant.soldOut);

      next[addOn._id] = { quantity: 1, variantName: firstAvailable?.name };
    }

    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {sellable.map((addOn) => {
        const picked = Boolean(selection[addOn._id]);
        const scarce =
          typeof addOn.remaining === "number" && addOn.remaining <= SCARCE_AT;
        const chosenVariant = selection[addOn._id]?.variantName;

        return (
          <div
            key={addOn._id}
            className={cn(
              "rounded-sm bg-card transition-shadow",
              picked
                ? "ring-2 ring-primary ring-inset"
                : "ring-1 ring-foreground/10 ring-inset",
            )}
          >
            <button
              type="button"
              aria-pressed={picked}
              onClick={() => toggle(addOn)}
              className="flex w-full cursor-pointer items-center gap-3.5 p-4 text-left active:scale-[0.995] transition-transform"
            >
              <span
                className={cn(
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border transition-colors",
                  picked
                    ? "border-primary bg-primary"
                    : "border-border-strong border-foreground/25 bg-background",
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 text-primary-foreground transition-all duration-150",
                    picked ? "scale-100 opacity-100" : "scale-[0.25] opacity-0",
                  )}
                  strokeWidth={3.2}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">
                  {addOn.name}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                      addOn.redemption === "door"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {whereLabel(addOn.redemption)}
                  </span>
                  {scarce ? (
                    <span className="text-[12px] font-medium text-destructive">
                      Only {addOn.remaining} left
                    </span>
                  ) : null}
                </span>
              </span>

              <span className="text-[15px] font-bold tabular-nums">
                {formatNairaAmount(addOn.priceNaira)}
              </span>
            </button>

            {picked && addOn.variants?.length ? (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-3">
                <span className="mr-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Option
                </span>
                {addOn.variants.map((variant) => {
                  const active = chosenVariant === variant.name;

                  return (
                    <button
                      key={variant.name}
                      type="button"
                      disabled={variant.soldOut}
                      aria-pressed={active}
                      onClick={() =>
                        onChange({
                          ...selection,
                          [addOn._id]: {
                            ...selection[addOn._id],
                            variantName: variant.name,
                          },
                        })
                      }
                      className={cn(
                        "h-9 min-w-10 cursor-pointer rounded-md border px-3 text-[12.5px] font-semibold transition-colors active:scale-[0.96]",
                        active
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border bg-secondary text-foreground hover:border-foreground/25",
                        variant.soldOut && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
