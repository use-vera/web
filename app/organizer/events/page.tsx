"use client";

import { EventRow } from "@/components/organizer/event-row";
import {
  EmptyState,
  ErrorState,
  Eyebrow,
} from "@/components/organizer/organizer-primitives";
import { buttonVariants } from "@/components/ui/button";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Skeleton } from "@/components/ui/skeleton";
import { isEventStrictlyUpcoming } from "@/lib/event-status";
import { formatNairaCompact } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useMyEvents } from "@/lib/hooks/use-organizer";
import { type EventStatusFilter } from "@/lib/types/organizer";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;

const FILTERS: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "cancelled", label: "Cancelled" },
];

const OrganizerEventsPage = () => {
  const [status, setStatus] = useState<EventStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const eventsQuery = useMyEvents({
    status,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });
  const events = useMemo(
    () => eventsQuery.data?.items ?? [],
    [eventsQuery.data],
  );

  /**
   * Headline numbers are derived from the page we already have rather than a
   * second round trip — the backend has no organizer summary endpoint yet, so
   * these describe the events listed, not the whole account.
   */
  const totals = useMemo(() => {
    const live = events.filter((event) => event.status === "published");
    const sold = live.reduce((sum, event) => sum + (event.soldTickets || 0), 0);
    const gross = live.reduce(
      (sum, event) => sum + (event.soldTickets || 0) * (event.ticketPriceNaira || 0),
      0,
    );
    const next = live
      .filter(isEventStrictlyUpcoming)
      .sort(
        (a, b) =>
          new Date(a.nextOccurrenceAt).getTime() -
          new Date(b.nextOccurrenceAt).getTime(),
      )[0];

    return { sold, gross, next, liveCount: live.length };
  }, [events]);

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
              Events
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Everything you have put on, and everything still selling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <div className="relative w-full sm:w-[260px]">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <OrganizerField
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search events"
                aria-label="Search events"
                className="pl-10"
              />
            </div>
            <Link
              href="/organizer/events/new"
              className={cn(buttonVariants(), "shrink-0")}
            >
              <Plus className="h-4 w-4" />
              Create event
            </Link>
          </div>
        </div>
      </header>

      {totals.liveCount > 0 ? (
        <div className="flex gap-8 px-4 pt-5 sm:px-6 lg:px-4 sm:px-6 lg:px-8">
          <div>
            <Eyebrow>Tickets sold</Eyebrow>
            <div className="mt-1 text-[22px] font-bold tracking-[-0.01em] tabular-nums">
              {totals.sold.toLocaleString("en-NG")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              across {totals.liveCount} live{" "}
              {totals.liveCount === 1 ? "event" : "events"}
            </div>
          </div>
          <div>
            <Eyebrow>Gross sales</Eyebrow>
            <div className="mt-1 text-[22px] font-bold tracking-[-0.01em] tabular-nums">
              {formatNairaCompact(totals.gross)}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              before the Vera fee
            </div>
          </div>
          {totals.next ? (
            <div>
              <Eyebrow>Next door opens</Eyebrow>
              <div className="mt-1 text-[22px] font-bold tracking-[-0.01em]">
                {new Intl.DateTimeFormat("en-NG", {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(totals.next.nextOccurrenceAt))}
              </div>
              <div className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                {totals.next.name}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6 pb-3.5">
        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                status === filter.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {eventsQuery.isFetching && !eventsQuery.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5 px-4 sm:px-6 lg:px-8">
        {eventsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[88px] w-full rounded-sm" />
          ))
        ) : eventsQuery.isError ? (
          <ErrorState
            message="Couldn't load your events. Refresh the page, or try again shortly."
            onRetry={() => eventsQuery.refetch()}
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title={
              debouncedSearch ? "No events match that" : "No events yet"
            }
            description={
              debouncedSearch
                ? "Try a different name, or clear the search to see everything."
                : "Put on your first event and start selling tickets people can't fake."
            }
            action={
              debouncedSearch ? null : (
                <Link
                  href="/organizer/events/new"
                  className={cn(buttonVariants())}
                >
                  <Plus className="h-4 w-4" />
                  Create event
                </Link>
              )
            }
          />
        ) : (
          events.map((event) => <EventRow key={event._id} event={event} />)
        )}
      </div>

      {!eventsQuery.isLoading && events.length > 0 ? (
        <Pagination
          page={eventsQuery.data?.page ?? 1}
          totalPages={eventsQuery.data?.totalPages ?? 1}
          totalItems={eventsQuery.data?.totalItems ?? 0}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          noun="event"
          className="px-4 pt-4 sm:px-6 lg:px-4 sm:px-6 lg:px-8"
        />
      ) : null}
    </div>
  );
};

export default OrganizerEventsPage;
