"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { type EventListQuery } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const TIME_FILTERS: {
  value: NonNullable<EventListQuery["filter"]>;
  label: string;
}[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "all", label: "All" },
];

export const TICKET_TYPE_FILTERS: {
  value: NonNullable<EventListQuery["ticketType"]>;
  label: string;
}[] = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

interface EventFilterModalProps {
  open: boolean;
  onClose: () => void;
  filter: NonNullable<EventListQuery["filter"]>;
  onFilterChange: (value: NonNullable<EventListQuery["filter"]>) => void;
  ticketType: NonNullable<EventListQuery["ticketType"]>;
  onTicketTypeChange: (
    value: NonNullable<EventListQuery["ticketType"]>,
  ) => void;
}

const EventFilterModal = ({
  open,
  onClose,
  filter,
  onFilterChange,
  ticketType,
  onTicketTypeChange,
}: EventFilterModalProps) => {
  const isDefault = filter === "upcoming" && ticketType === "all";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <div className="flex flex-col gap-6 p-6 pt-10">
          <h2 className="text-xl font-bold text-card-foreground">
            Filter events
          </h2>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              When
            </span>
            <div className="grid grid-cols-4 gap-2">
              {TIME_FILTERS.map((option) => {
                const active = option.value === filter;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFilterChange(option.value)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary",
                    )}
                  >
                    {option.label}
                    {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price
            </span>
            <div className="grid grid-cols-4 gap-2">
              {TICKET_TYPE_FILTERS.map((option) => {
                const active = option.value === ticketType;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTicketTypeChange(option.value)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary",
                    )}
                  >
                    {option.label}
                    {active ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isDefault}
              onClick={() => {
                onFilterChange("upcoming");
                onTicketTypeChange("all");
              }}
            >
              Reset
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Show events
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventFilterModal;
