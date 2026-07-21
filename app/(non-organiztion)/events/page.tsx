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
import {
  useEventCountries,
  useEvents,
  useFeaturedEvents,
  useInfiniteEvents,
} from "@/lib/hooks/use-events";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { type EventListQuery, type PublicEventApi } from "@/lib/types/event";
import { Loader2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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
  const [nearMeActive, setNearMeActive] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const categoriesQuery = useCategories();
  const countriesQuery = useEventCountries();
  const geolocation = useGeolocation();
  const nearMeReady = nearMeActive && geolocation.status === "granted";

  // Excludes `page` — useInfiniteEvents drives pagination itself via
  // fetchNextPage, and changing any of these fields changes the query's
  // cache key, which naturally restarts from page 1 (no manual reset needed).
  const query = useMemo<Omit<EventListQuery, "page">>(
    () => ({
      search,
      filter,
      ticketType,
      category: category ?? undefined,
      country: country ?? undefined,
      from: startDate ? startOfDayIso(startDate) : undefined,
      to: startDate ? endOfDayIso(startDate) : undefined,
      nearLat:
        nearMeReady && geolocation.status === "granted"
          ? geolocation.latitude
          : undefined,
      nearLng:
        nearMeReady && geolocation.status === "granted"
          ? geolocation.longitude
          : undefined,
      nearRadiusKm: nearMeReady ? 25 : undefined,
      limit: 24,
    }),
    [
      search,
      filter,
      ticketType,
      category,
      country,
      startDate,
      nearMeReady,
      geolocation,
    ],
  );

  const eventsQuery = useInfiniteEvents(query);
  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [eventsQuery.data],
  );
  const isInitialLoading = eventsQuery.isLoading && !events.length;

  const featuredEventsQuery = useFeaturedEvents(12);
  const featuredEvents = featuredEventsQuery.data ?? [];

  const nearMePreviewQuery = useEvents(
    {
      filter: "upcoming",
      nearLat: geolocation.status === "granted" ? geolocation.latitude : 0,
      nearLng: geolocation.status === "granted" ? geolocation.longitude : 0,
      nearRadiusKm: 25,
      limit: 8,
    },
    geolocation.status === "granted" && !nearMeActive,
  );
  const nearMePreviewEvents = (nearMePreviewQuery.data?.items ?? []).slice(
    0,
    6,
  );

  const activeFilterCount =
    (filter === "upcoming" ? 0 : 1) +
    (ticketType === "all" ? 0 : 1) +
    (country ? 1 : 0) +
    (startDate ? 1 : 0) +
    (nearMeActive ? 1 : 0);

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

        {featuredEventsQuery.isLoading || featuredEvents.length ? (
          <section className="mx-auto max-w-6xl px-6 pb-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Featured events
              </h2>
              <p className="text-sm text-muted-foreground">
                Promoted by organizers
              </p>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {featuredEventsQuery.isLoading
                ? Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`featured-skeleton-${index}`}
                      className="h-72 w-72 shrink-0 animate-pulse rounded-2xl bg-secondary"
                    />
                  ))
                : featuredEvents.map((event) => (
                    <div key={event._id} className="w-72 shrink-0 snap-start">
                      <EventCard event={event} onSelect={setSelectedEvent} />
                    </div>
                  ))}
            </div>
          </section>
        ) : null}

        {nearMeActive ? null : (
          <section className="mx-auto max-w-6xl px-6 pb-4">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Near me</h2>
                <p className="text-sm text-muted-foreground">
                  What&apos;s happening within 25km
                </p>
              </div>
              {geolocation.status === "granted" &&
              nearMePreviewEvents.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setNearMeActive(true);
                    resultsRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="shrink-0 text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </button>
              ) : null}
            </div>

            {geolocation.status === "granted" ? (
              nearMePreviewQuery.isLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`near-me-skeleton-${index}`}
                      className="h-20 w-80 shrink-0 animate-pulse rounded-xl bg-secondary"
                    />
                  ))}
                </div>
              ) : nearMePreviewEvents.length ? (
                <div className="flex snap-x snap-mandatory gap-4 flex-wrap pb-2">
                  {nearMePreviewEvents.map((event) => (
                    <div
                      key={event._id}
                      className="w-[calc(33.3%-16px)] shrink-0 snap-start"
                    >
                      <EventCardCompact
                        event={event}
                        onSelect={setSelectedEvent}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center">
                  <p className="text-sm font-semibold text-card-foreground">
                    Nothing upcoming within 25km right now.
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {geolocation.status === "denied"
                        ? "We couldn't get your location"
                        : "See what's happening near you"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {geolocation.status === "denied"
                        ? "Check your browser's location permission, then try again."
                        : "Share your location to see events within 25km."}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={geolocation.request}
                  className="shrink-0"
                >
                  {geolocation.status === "denied"
                    ? "Try again"
                    : "Share location"}
                </Button>
              </div>
            )}
          </section>
        )}

        <section ref={resultsRef} className="mx-auto max-w-6xl px-6 pb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {nearMeActive
                  ? "Events near me"
                  : "Events you might be interested in"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {nearMeActive
                  ? "Everything upcoming within 25km"
                  : "Some outings that you and your friends might not want to miss"}
              </p>
            </div>
            {nearMeActive ? (
              <button
                type="button"
                onClick={() => setNearMeActive(false)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
              >
                Near me
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {isInitialLoading ? (
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

          {eventsQuery.hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => eventsQuery.fetchNextPage()}
                disabled={eventsQuery.isFetchingNextPage}
              >
                {eventsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          ) : null}
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
