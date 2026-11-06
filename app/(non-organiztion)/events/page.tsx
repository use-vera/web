"use client";

import {
  TICKET_TYPE_FILTERS,
  TIME_FILTERS,
} from "@/components/events/event-filter-modal";
import NearYou from "@/components/events/near-you";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayHeading from "@/components/vera/display-heading";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import EventPosterCard from "@/components/vera/event-poster-card";
import { useCategories } from "@/lib/hooks/use-categories";
import {
  useEventCountries,
  useEvents,
  useFeaturedEvents,
  useInfiniteEvents,
} from "@/lib/hooks/use-events";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useScrollToTop } from "@/lib/hooks/use-scroll-to-top";
import { getCategoryIcon } from "@/lib/category-icons";
import { type EventListQuery } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Gift,
  Globe,
  Infinity as AnyTime,
  Loader2,
  Search,
  Tag,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

// startDate is a plain YYYY-MM-DD string from the native <input type="date">.
// Parsed as local-calendar midnight (not UTC) so the day bounds sent to the
// backend match what the picker visually shows the user.
const startOfDayIso = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};

const endOfDayIso = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};

/* The app's filter pill: ink when on, an outline when off. */
const pill = (active: boolean) =>
  cn(
    "flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-[18px] text-[15px] font-semibold whitespace-nowrap transition-colors",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-transparent text-foreground hover:border-foreground",
  );

const TIME_ICONS: Record<NonNullable<EventListQuery["filter"]>, LucideIcon> = {
  upcoming: Clock,
  "this-week": CalendarDays,
  "this-month": CalendarRange,
  all: AnyTime,
};

const PRICE_ICONS: Record<
  NonNullable<EventListQuery["ticketType"]>,
  LucideIcon
> = {
  all: Tag,
  free: Gift,
  paid: Ticket,
};

/* A fresh [] each render would read as "new events" to the map. */
const NO_EVENTS: never[] = [];

const RESULT_TITLES: Record<NonNullable<EventListQuery["filter"]>, string> = {
  upcoming: "coming up.",
  "this-week": "this week.",
  "this-month": "this month.",
  all: "everything.",
};

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<NonNullable<EventListQuery["filter"]>>("upcoming");
  const [ticketType, setTicketType] =
    useState<NonNullable<EventListQuery["ticketType"]>>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const categoriesQuery = useCategories();
  const countriesQuery = useEventCountries();
  /* "Near you" is always on the page, so the browser is asked as it opens. */
  const geolocation = useGeolocation({ requestOnMount: true });
  const latitude = geolocation.status === "granted" ? geolocation.latitude : null;
  const longitude = geolocation.status === "granted" ? geolocation.longitude : null;
  /* One object per position, not per render: typing re-renders the page and must not move the map. */
  const origin = useMemo(
    () => (latitude !== null && longitude !== null ? { latitude, longitude } : null),
    [latitude, longitude],
  );
  const scrollToTop = useScrollToTop();
  /* The request waits for a pause in typing; the page switches to results as soon as you type. */
  const searchTerm = useDebouncedValue(search.trim(), 300);
  const searching = search.trim().length > 0;

  // Excludes `page`: useInfiniteEvents paginates itself, and changing any of
  // these changes the cache key, which restarts from page 1.
  const query = useMemo<Omit<EventListQuery, "page">>(
    () => ({
      search: searchTerm,
      filter,
      ticketType,
      category: category ?? undefined,
      country: country ?? undefined,
      from: startDate ? startOfDayIso(startDate) : undefined,
      to: startDate ? endOfDayIso(startDate) : undefined,
      limit: 24,
    }),
    [searchTerm, filter, ticketType, category, country, startDate],
  );

  const eventsQuery = useInfiniteEvents(query);
  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [eventsQuery.data],
  );
  const total = eventsQuery.data?.pages[0]?.totalItems;

  const featuredQuery = useFeaturedEvents(6);
  const featured = featuredQuery.data ?? [];

  const nearQuery = useEvents(
    {
      filter: "upcoming",
      nearLat: origin?.latitude ?? 0,
      nearLng: origin?.longitude ?? 0,
      nearRadiusKm: 25,
      limit: 40,
    },
    Boolean(origin),
  );

  const categories = categoriesQuery.data ?? [];
  const sceneName = categories.find((item) => item._id === category)?.name;
  const filtered =
    filter !== "upcoming" ||
    ticketType !== "all" ||
    Boolean(category || country || startDate || search);
  /* Any change to what's shown eases you back up to see it. */
  const refine =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      scrollToTop();
    };
  const clearAll = () => {
    scrollToTop();
    setSearch("");
    setFilter("upcoming");
    setTicketType("all");
    setCategory(null);
    setCountry(null);
    setStartDate(null);
  };

  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-[clamp(16px,4vw,40px)] pt-[clamp(16px,3vw,40px)] pb-24">
        {searching ? (
          <h1 className="sr-only">Search events</h1>
        ) : (
          <DisplayHeading
            as="h1"
            lead="find your world in"
            accent="lagos."
            breakBeforeAccent
            className="text-[clamp(52px,8vw,112px)]"
          />
        )}

        {/* Search and filters on the page, not in a dialog: on a wide screen there's room. */}
        <div className="flex flex-col gap-3.5">
          <label className="flex h-14 items-center gap-3 rounded-full border-[1.5px] border-border px-5 focus-within:border-foreground">
            <Search
              aria-hidden="true"
              className="h-5 w-5 text-muted-foreground"
            />
            <span className="sr-only">Search events</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                /* Starting a search hides everything above the results, so bring the box back into view. */
                if (!searching && event.target.value.trim()) scrollToTop();
                setSearch(event.target.value);
              }}
              placeholder="Events, hosts, venues"
              className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="When and price"
          >
            {TIME_FILTERS.map((option) => {
              const Icon = TIME_ICONS[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => refine(setFilter)(option.value)}
                  className={pill(filter === option.value)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
            <span aria-hidden="true" className="mx-1.5 h-6 w-px bg-border" />
            {TICKET_TYPE_FILTERS.map((option) => {
              const Icon = PRICE_ICONS[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={ticketType === option.value}
                  onClick={() => refine(setTicketType)(option.value)}
                  className={pill(ticketType === option.value)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
            <span aria-hidden="true" className="mx-1.5 h-6 w-px bg-border" />
            <label className={pill(Boolean(startDate))}>
              <Calendar aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">On a date</span>
              <input
                type="date"
                value={startDate ?? ""}
                onChange={(event) =>
                  refine(setStartDate)(event.target.value || null)
                }
                className="cursor-pointer bg-transparent text-[15px] font-semibold outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </label>
            {countriesQuery.data && countriesQuery.data.length > 1 ? (
              <label className={pill(Boolean(country))}>
                <Globe aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Country</span>
                <select
                  value={country ?? ""}
                  onChange={(event) =>
                    refine(setCountry)(event.target.value || null)
                  }
                  className="cursor-pointer bg-transparent text-[15px] font-semibold outline-none"
                >
                  <option value="">Any country</option>
                  {countriesQuery.data.map((item) => (
                    <option key={item.country} value={item.country}>
                      {item.country}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {filtered ? (
              <button
                type="button"
                onClick={clearAll}
                className="flex h-11 cursor-pointer items-center gap-1.5 px-2 text-[15px] font-semibold text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" className="h-4 w-4" />
                Clear
              </button>
            ) : null}
          </div>

          {categories.length ? (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Scenes"
            >
              {categories.map((item) => {
                const colours = POSTER_TONES[toneFor(item._id)];
                const dimmed = Boolean(category) && category !== item._id;
                const Icon = getCategoryIcon(item.iconKey);
                return (
                  <button
                    key={item._id}
                    type="button"
                    aria-pressed={category === item._id}
                    onClick={() =>
                      refine(setCategory)(
                        category === item._id ? null : item._id,
                      )
                    }
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-opacity",
                      /* Cream is the page colour: it needs an edge to be seen. */
                      toneFor(item._id) === "cream" &&
                        !dimmed &&
                        "border-[1.5px] border-border",
                    )}
                    style={{
                      backgroundColor: dimmed ? "var(--border)" : colours.bg,
                      color: dimmed ? "var(--muted-foreground)" : colours.fg,
                    }}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {searching ? null : (
          <NearYou
            status={geolocation.status}
            origin={origin}
            events={nearQuery.data?.items ?? NO_EVENTS}
            loading={Boolean(origin) && nearQuery.isLoading}
            onRetry={geolocation.request}
          />
        )}

        {!searching && (featuredQuery.isLoading || featured.length) ? (
          <section
            aria-labelledby="featured"
            className="flex flex-col gap-5 border-t border-border pt-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="featured"
                style={{ lineHeight: 0.95 }}
                className="text-[clamp(32px,3.6vw,48px)] font-extrabold tracking-[-0.04em]"
              >
                featured.
              </h2>
              <span className="text-sm text-muted-foreground">
                Promoted by organizers
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-6 gap-y-9">
              {featuredQuery.isLoading
                ? Array.from({ length: 3 }, (_, index) => (
                    <Skeleton
                      key={index}
                      className="aspect-[4/3.4] rounded-[28px]"
                    />
                  ))
                : featured
                    .slice(0, 3)
                    .map((event) => (
                      <EventPosterCard key={event._id} event={event} />
                    ))}
            </div>
          </section>
        ) : null}

        <section
          aria-labelledby="results"
          className={cn(
            "flex flex-col gap-6",
            !searching && "border-t border-border pt-6",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="results"
              style={{ lineHeight: 0.95 }}
              className="text-[clamp(32px,3.6vw,48px)] font-extrabold tracking-[-0.04em]"
            >
              {searching ? (
                <>
                  results for{" "}
                  <span className="text-primary">
                    &ldquo;{search.trim()}&rdquo;.
                  </span>
                </>
              ) : (
                <>
                  {sceneName ? `${sceneName.toLowerCase()}, ` : ""}
                  {startDate
                    ? `on ${new Date(startOfDayIso(startDate)).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}.`
                    : RESULT_TITLES[filter]}
                </>
              )}
            </h2>
            {total !== undefined ? (
              <span className="text-sm text-muted-foreground">
                {total} {total === 1 ? "event" : "events"}
              </span>
            ) : null}
          </div>

          {eventsQuery.isLoading ||
          (searching && search.trim() !== searchTerm) ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-6 gap-y-9">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[4/3.4] rounded-[28px]"
                />
              ))}
            </div>
          ) : eventsQuery.isError ? (
            <div className="flex flex-col items-start gap-3 py-10">
              <span className="text-lg font-semibold">
                We couldn&apos;t load events.
              </span>
              <button
                type="button"
                onClick={() => void eventsQuery.refetch()}
                className={buttonVariants({ variant: "line" })}
              >
                Try again
              </button>
            </div>
          ) : events.length ? (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-6 gap-y-9">
                {events.map((event) => (
                  <EventPosterCard key={event._id} event={event} />
                ))}
              </div>
              {eventsQuery.hasNextPage ? (
                <button
                  type="button"
                  onClick={() => void eventsQuery.fetchNextPage()}
                  disabled={eventsQuery.isFetchingNextPage}
                  className={cn(
                    buttonVariants({ variant: "line", size: "lg" }),
                    "self-center",
                  )}
                >
                  {eventsQuery.isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Show more
                </button>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-start gap-3.5 py-12">
              <span
                style={{ lineHeight: 0.95 }}
                className="text-[40px] font-extrabold tracking-[-0.04em]"
              >
                nothing on
                <span className="block text-primary">for that.</span>
              </span>
              <span className="text-base text-muted-foreground">
                {searching
                  ? "Try a different word, or clear the search."
                  : "Try another day or price, or clear the filters."}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className={buttonVariants({ variant: "ink" })}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
