"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatNairaAmount } from "@/lib/format-currency";
import { type TicketUpgradeOptionsApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";

const describe = (option: TicketUpgradeOptionsApi["options"][number]) => {
  if (option.isCurrent) return "Your ticket today";
  if (option.soldOut) return "Sold out";
  if (!option.onSale) return "Not on sale";
  if (!option.upgradable) return "Not available as an upgrade";

  return option.remaining <= 15
    ? `Only ${option.remaining} left`
    : `${option.remaining} available`;
};

/**
 * Moving a ticket up a tier.
 *
 * The dialog exists to show one subtraction: what was already paid, what the
 * new tier costs, what is left. A holder who cannot see their first payment
 * counted will assume they are being charged twice.
 */
export const TicketUpgradeDialog = ({
  open,
  onOpenChange,
  data,
  isLoading,
  isSubmitting,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: TicketUpgradeOptionsApi;
  isLoading: boolean;
  isSubmitting: boolean;
  onUpgrade: (ticketCategoryId: string) => void;
}) => {
  const [picked, setPicked] = useState<string | null>(null);

  const options = data?.options ?? [];
  const selectedId =
    picked ?? options.find((option) => option.upgradable)?._id ?? null;
  const selected = options.find((option) => option._id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.01em]">
              Upgrade your ticket
            </h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Pay the difference. Your seat stays yours until you do.
            </p>
          </div>

          {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex max-h-[280px] flex-col gap-2.5 overflow-y-auto">
              {options.map((option) => {
                const active = option._id === selectedId && option.upgradable;

                return (
                  <button
                    key={option._id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!option.upgradable}
                    onClick={() => setPicked(option._id)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-sm p-4 text-left transition-shadow",
                      option.upgradable
                        ? "cursor-pointer bg-background"
                        : "cursor-not-allowed bg-muted opacity-60",
                      active
                        ? "ring-2 ring-primary ring-inset"
                        : "ring-1 ring-foreground/10 ring-inset",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        active
                          ? "border-primary bg-primary"
                          : "border-foreground/25",
                      )}
                    >
                      {active ? (
                        <span className="h-2 w-2 rounded-full bg-card" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold">
                          {option.name}
                        </span>
                        {option.isCurrent ? (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            YOU HAVE THIS
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[12.5px]",
                          option.upgradable && option.remaining <= 15
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {describe(option)}
                      </span>
                    </span>

                    <span className="text-right">
                      <span
                        className={cn(
                          "block text-[15px] font-bold tabular-nums",
                          active ? "text-accent-foreground" : "text-foreground",
                        )}
                      >
                        {option.upgradable
                          ? `+${formatNairaAmount(option.differenceNaira)}`
                          : "—"}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground tabular-nums">
                        {formatNairaAmount(option.priceNaira)}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Tiers below what you paid are not returned at all, so a
                  holder on the top tier would otherwise see their own row and
                  nothing else, with no word on why. */}
              {options.length > 0 &&
              !options.some((option) => option.upgradable) ? (
                <p className="px-2 py-1.5 text-center text-[13px] text-muted-foreground">
                  There is no higher tier available on this event right now.
                </p>
              ) : null}
            </div>

            <div className="rounded-sm bg-background p-4 ring-1 ring-border ring-inset">
              <div className="flex items-baseline justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  You paid
                </span>
                <span className="text-sm tabular-nums">
                  {formatNairaAmount(data?.paidNaira ?? 0)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  {selected?.name ?? "New tier"}
                </span>
                <span className="text-sm tabular-nums">
                  {formatNairaAmount(selected?.priceNaira ?? 0)}
                </span>
              </div>
              <hr className="ticket-perforation my-3" />
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-semibold">You pay</span>
                <span className="text-[26px] font-bold tracking-[-0.02em] tabular-nums">
                  {formatNairaAmount(selected?.differenceNaira ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-sm bg-muted p-3.5">
              <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your current QR stops working once this goes through. A fresh
                one lands on this ticket. Your add-ons come with you.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                disabled={!selected?.upgradable}
                loading={isSubmitting}
                onClick={() => selected && onUpgrade(selected._id)}
                className="flex-[2]"
              >
                {selected?.upgradable
                  ? `Pay ${formatNairaAmount(selected.differenceNaira)}`
                  : "Nothing to upgrade to"}
              </Button>
            </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
