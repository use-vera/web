"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { type EventCountryApi, type EventListQuery } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
  country: string | null;
  onCountryChange: (value: string | null) => void;
  countries: EventCountryApi[];
  startDate: string | null;
  onStartDateChange: (value: string | null) => void;
}

const EventFilterModal = ({
  open,
  onClose,
  filter,
  onFilterChange,
  ticketType,
  onTicketTypeChange,
  country,
  onCountryChange,
  countries,
  startDate,
  onStartDateChange,
}: EventFilterModalProps) => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();

    if (!query) {
      return countries;
    }

    return countries.filter((option) =>
      option.country.toLowerCase().includes(query),
    );
  }, [countries, locationSearch]);

  const isDefault =
    filter === "upcoming" &&
    ticketType === "all" &&
    country === null &&
    startDate === null;

  const closeLocationPicker = () => {
    setLocationOpen(false);
    setLocationSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          closeLocationPicker();
        }
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
            <div className="grid grid-cols-3 gap-2">
              {TIME_FILTERS.map((option) => {
                const active = option.value === filter;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFilterChange(option.value)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
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

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </span>
            <div
              className="relative"
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  closeLocationPicker();
                }
              }}
            >
              <button
                type="button"
                onClick={() => setLocationOpen((prev) => !prev)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition-colors",
                  country
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {country ?? "Any location"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    locationOpen && "rotate-180",
                  )}
                />
              </button>

              {locationOpen ? (
                <div className="absolute z-10 mt-2 w-full rounded-md border border-border bg-card p-2 shadow-lg">
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      value={locationSearch}
                      onChange={(event) =>
                        setLocationSearch(event.target.value)
                      }
                      placeholder="Search countries"
                      className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-8 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onCountryChange(null);
                        closeLocationPicker();
                      }}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                        country === null
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      Any location
                      {country === null ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : null}
                    </button>

                    {filteredCountries.map((option) => {
                      const active = option.country === country;

                      return (
                        <button
                          key={option.country}
                          type="button"
                          onClick={() => {
                            onCountryChange(option.country);
                            closeLocationPicker();
                          }}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                            active
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-secondary",
                          )}
                        >
                          <span>
                            {option.country}{" "}
                            <span className="font-normal text-muted-foreground">
                              ({option.count})
                            </span>
                          </span>
                          {active ? (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}

                    {filteredCountries.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No countries match &ldquo;{locationSearch}&rdquo;
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Start date
            </span>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={startDate ?? ""}
                onChange={(event) =>
                  onStartDateChange(event.target.value || null)
                }
                className="h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              {startDate ? (
                <button
                  type="button"
                  onClick={() => onStartDateChange(null)}
                  className="text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
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
                onCountryChange(null);
                onStartDateChange(null);
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
