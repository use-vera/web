"use client";

import EventCard from "@/components/event-card";
import EventCardCompact from "@/components/event-card-compact";
import EventDetailModal from "@/components/event-detail-modal";
import CategoryChipRow from "@/components/events/category-chip-row";
import EventFilterModal, {
  TICKET_TYPE_FILTERS,
  TIME_FILTERS,
} from "@/components/events/event-filter-modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useCategories } from "@/lib/hooks/use-categories";
import { useEventCountries, useEvents } from "@/lib/hooks/use-events";
import { type EventListQuery, type PublicEventApi } from "@/lib/types/event";
import { Loader2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// startDate is a plain YYYY-MM-DD string from the native <input type="date">
// — parsed as local-calendar midnight (not UTC) so the day bounds sent to
// the backend match what the picker visually shows the user.
const startOfDayIso = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};

const endOfDayIso = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<NonNullable<EventListQuery["filter"]>>("upcoming");
  const [ticketType, setTicketType] =
    useState<NonNullable<EventListQuery["ticketType"]>>("all");
  const [selectedEvent, setSelectedEvent] = useState<PublicEventApi | null>(
    null,
  );
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const categoriesQuery = useCategories();
  const countriesQuery = useEventCountries();

  const query = useMemo<EventListQuery>(
    () => ({
      search,
      filter,
      ticketType,
      category: category ?? undefined,
      country: country ?? undefined,
      from: startDate ? startOfDayIso(startDate) : undefined,
      to: startDate ? endOfDayIso(startDate) : undefined,
      limit: 24,
    }),
    [search, filter, ticketType, category, country, startDate],
  );

  const eventsQuery = useEvents(query);
  const events = eventsQuery.data?.items ?? [];

  const activeFilterCount =
    (filter === "upcoming" ? 0 : 1) +
    (ticketType === "all" ? 0 : 1) +
    (country ? 1 : 0) +
    (startDate ? 1 : 0);

  const activeFilterLabel = TIME_FILTERS.find(
    (option) => option.value === filter,
  )?.label;
  const activeTicketTypeLabel = TICKET_TYPE_FILTERS.find(
    (option) => option.value === ticketType,
  )?.label;

  return (
    <>
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Events
            </span>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Find your next adventure.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Browse what&apos;s happening around you, grab a ticket, and see
              who else is going.
            </p>
            <Link
              href="/events/near-me"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" />
              See what&apos;s near me
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events or locations"
                className="pl-12"
                type="search"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setFilterModalOpen(true)}
              className="relative shrink-0 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </div>

          {activeFilterCount > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {filter !== "upcoming" ? (
                <button
                  type="button"
                  onClick={() => setFilter("upcoming")}
                  className="flex items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  {activeFilterLabel}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}

              {ticketType !== "all" ? (
                <button
                  type="button"
                  onClick={() => setTicketType("all")}
                  className="flex items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  {activeTicketTypeLabel}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}

              {country ? (
                <button
                  type="button"
                  onClick={() => setCountry(null)}
                  className="flex items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  {country}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}

              {startDate ? (
                <button
                  type="button"
                  onClick={() => setStartDate(null)}
                  className="flex items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  {startDate}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}

          {categoriesQuery.data?.length ? (
            <CategoryChipRow
              className="mt-6"
              categories={categoriesQuery.data}
              selectedCategoryId={category}
              onSelect={setCategory}
            />
          ) : null}
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12">
          {eventsQuery.isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length ? (
            search.trim() ? (
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <EventCardCompact
                    key={event._id}
                    event={event}
                    onSelect={setSelectedEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onSelect={setSelectedEvent}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
              <p className="text-base font-semibold text-card-foreground">
                No events match your search.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different keyword or filter.
              </p>
            </div>
          )}
        </section>
      </main>
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <EventFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filter={filter}
        onFilterChange={setFilter}
        ticketType={ticketType}
        onTicketTypeChange={setTicketType}
        country={country}
        onCountryChange={setCountry}
        countries={countriesQuery.data ?? []}
        startDate={startDate}
        onStartDateChange={setStartDate}
      />
    </>
  );
}
