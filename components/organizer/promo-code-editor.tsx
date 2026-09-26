"use client";

import { AmountField } from "@/components/organizer/amount-field";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Switch } from "@/components/organizer/organizer-primitives";
import { type EventPromoCodePayload } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export type PromoDiscountType = "percent" | "fixed";
export type PromoAppliesTo = "ticket" | "addons";

/** Draft state while an organizer is typing. Numbers stay strings. */
export interface PromoCodeDraft {
  name: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: string;
  appliesTo: PromoAppliesTo;
  /** Empty means no ceiling on how many people can use it. */
  maxUses: string;
  /** Listed on the event for anyone to see and tap. */
  isPublic: boolean;
}

export const emptyPromoCode = (): PromoCodeDraft => ({
  name: "",
  code: "",
  discountType: "percent",
  discountValue: "",
  appliesTo: "ticket",
  maxUses: "",
  isPublic: false,
});

/** Turns drafts into what the API takes. */
export const toPromoCodePayload = (
  drafts: PromoCodeDraft[],
): EventPromoCodePayload[] =>
  drafts
    .filter((draft) => draft.code.trim() && draft.name.trim())
    .map((draft) => ({
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      discountType: draft.discountType,
      discountValue: Math.max(0, Math.round(Number(draft.discountValue) || 0)),
      appliesTo: draft.appliesTo,
      maxUses: Math.max(0, Math.round(Number(draft.maxUses) || 0)),
      perUserLimit: 1,
      isPublic: draft.isPublic,
      active: true,
    }));

/**
 * The first thing wrong with a started draft, or nothing.
 *
 * Returns the sentence rather than a boolean: an organizer stopped on their
 * way to publishing deserves to be told which field, not that "something" is
 * incomplete.
 */
export const findPromoCodeIssue = (drafts: PromoCodeDraft[]) => {
  for (const draft of drafts) {
    const started =
      draft.name.trim() || draft.code.trim() || draft.discountValue;

    if (!started) {
      continue;
    }

    if (!draft.name.trim()) {
      return "Give every promo code a name.";
    }

    const code = draft.code.trim().toUpperCase();

    if (code.length < 3 || !/^[A-Z0-9-]+$/.test(code)) {
      return `${draft.name.trim()} needs a code of at least 3 letters, numbers or dashes.`;
    }

    const value = Math.round(Number(draft.discountValue) || 0);

    if (value < 1) {
      return `Set how much ${code} takes off.`;
    }

    if (draft.discountType === "percent" && value > 100) {
      return `${code} cannot take off more than 100%.`;
    }
  }

  const codes = drafts
    .map((draft) => draft.code.trim().toUpperCase())
    .filter(Boolean);
  const duplicate = codes.find((code, index) => codes.indexOf(code) !== index);

  return duplicate ? `You have two codes called ${duplicate}.` : "";
};

const APPLIES_TO: { value: PromoAppliesTo; label: string; hint: string }[] = [
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

/**
 * Four decisions per code: how much off, what it comes off, how many people
 * get it, and whether it is listed on the event or handed out by name.
 */
export const PromoCodeEditor = ({
  drafts,
  onChange,
}: {
  drafts: PromoCodeDraft[];
  onChange: (next: PromoCodeDraft[]) => void;
}) => {
  const update = <K extends keyof PromoCodeDraft>(
    index: number,
    field: K,
    value: PromoCodeDraft[K],
  ) =>
    onChange(
      drafts.map((draft, position) =>
        position === index ? { ...draft, [field]: value } : draft,
      ),
    );

  return (
    <div className="flex flex-col gap-2.5">
      {drafts.map((draft, index) => (
        <div
          key={index}
          className="rounded-md bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70">
              Code {index + 1}
            </span>
            <button
              type="button"
              aria-label={`Remove promo code ${index + 1}`}
              onClick={() =>
                onChange(drafts.filter((_, position) => position !== index))
              }
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Name
              </span>
              <OrganizerField
                value={draft.name}
                onChange={(input) =>
                  update(index, "name", input.target.value)
                }
                placeholder="Early bird"
                aria-label={`Promo code ${index + 1} name`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Code
              </span>
              <OrganizerField
                value={draft.code}
                onChange={(input) =>
                  update(index, "code", input.target.value.toUpperCase())
                }
                placeholder="EARLY10"
                aria-label={`Promo code ${index + 1}`}
                className="font-semibold tracking-[0.06em]"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                How much off
              </span>
              <div className="inline-flex gap-1 rounded-md bg-muted p-1">
                {(["percent", "fixed"] as PromoDiscountType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={draft.discountType === option}
                    onClick={() => update(index, "discountType", option)}
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
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                {draft.discountType === "percent" ? "Percent off" : "Amount off"}
              </span>
              <AmountField
                value={draft.discountValue}
                onValueChange={(digits) =>
                  update(index, "discountValue", digits)
                }
                prefix={draft.discountType === "fixed" ? "₦" : undefined}
                placeholder={draft.discountType === "percent" ? "10" : "5000"}
                aria-label={`Promo code ${index + 1} discount`}
              />
            </div>
          </div>

          <div className="mt-3">
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
                    onClick={() => update(index, "appliesTo", option.value)}
                    className={cn(
                      "cursor-pointer rounded-md p-3 text-left transition-colors",
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
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                How many uses
              </span>
              <AmountField
                value={draft.maxUses}
                onValueChange={(digits) => update(index, "maxUses", digits)}
                placeholder="No limit"
                aria-label={`Promo code ${index + 1} uses`}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                One use per attendee.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start rounded-md bg-muted/50 p-3.5">
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">
                  Show it on the event
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Anyone can see and tap it. Leave off for a code you hand out
                  yourself.
                </span>
              </div>
              <Switch
                checked={draft.isPublic}
                onChange={(next) => update(index, "isPublic", next)}
                label={`Show promo code ${index + 1} on the event`}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...drafts, emptyPromoCode()])}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border-strong p-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-muted/50"
      >
        <Plus className="h-4 w-4" />
        {drafts.length ? "Add another" : "Add a promo code"}
      </button>
    </div>
  );
};

export default PromoCodeEditor;
