"use client";

import { EventRow } from "@/components/organizer/event-row";
import {
  DESK,
  EmptyState,
  ErrorState,
  FilterPills,
  PageHeader,
  SearchField,
  StatStrip,
  solidOnTone,
} from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventPoster, { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { daysUntil, getOrganizerEventBadge, isEventStrictlyUpcoming } from "@/lib/event-status";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useWallet } from "@/lib/hooks/use-money";
import { useMyEvents } from "@/lib/hooks/use-organizer";
import { koboToNaira } from "@/lib/types/money";
import { type EventStatusFilter, type OrganizerEventApi } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, Plus, ScanLine, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;
/* The backend has no organizer summary yet, so "up next" and the selling
   counts read one larger page of published events. Enough for any real
   organizer's live calendar. */
const SAMPLE_SIZE = 50;

const FILTERS: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "cancelled", label: "Cancelled" },
];

const SELLING = new Set(["on-sale", "live", "scheduled", "sold-out"]);

const countdown = (iso: string) => {
  const days = daysUntil(iso);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
};

/** The organizer's next event, given the whole width: the thing they are most likely here for. */
const UpNext = ({ event }: { event: OrganizerEventApi }) => {
  const tone = toneFor(event._id);
  const colours = POSTER_TONES[tone];
  const when = event.nextOccurrenceAt ?? event.startsAt;
  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const base = `/organizer/events/${event._id}`;

  return (
    <section
      aria-label="Up next"
      className={cn("grid gap-2.5 rounded-[32px] p-2.5 md:grid-cols-[minmax(0,380px)_1fr]", tone === "cream" && "ring-1 ring-border ring-inset")}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      <EventPoster
        seed={event._id}
        tone={event.imageUrl ? tone : "ink"}
        title={event.name}
        imageUrl={event.imageUrl}
        className="aspect-[4/3] w-full rounded-[24px] md:aspect-auto md:min-h-[260px]"
        titleClassName="text-[clamp(28px,3vw,44px)]"
      />
      <div className="flex flex-col gap-5 p-[clamp(12px,2vw,24px)]">
        <span className="text-sm font-bold opacity-75">Up next · {countdown(when)}</span>
        <div className="flex flex-col gap-2">
          <Link href={base} style={{ lineHeight: 0.95 }} className="text-[clamp(30px,3.6vw,52px)] font-extrabold tracking-[-0.045em] hover:underline">
            {event.name}
          </Link>
          <span className="text-[15px] font-semibold opacity-75">
            {new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(when))}
            {event.address ? ` · ${event.address}` : ""}
          </span>
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm font-bold tabular-nums">
            <span>
              {sold.toLocaleString("en-NG")} of {capacity.toLocaleString("en-NG")} sold
            </span>
            <span>{formatNairaCompact(sold * (event.ticketPriceNaira || 0))}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-current/15">
            <div className="h-full rounded-full bg-current" style={{ width: `${Math.min(100, percent)}%` }} />
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <Link href={`${base}/check-in`} style={solidOnTone(tone)} className="flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-opacity hover:opacity-90">
            <ScanLine className="h-4 w-4" />
            Door mode
          </Link>
          <Link href={`${base}/attendees`} className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-current px-5 text-sm font-bold transition-colors hover:bg-black/5">
            <Users className="h-4 w-4" />
            Guest list
          </Link>
          <Link href={base} className="flex h-11 items-center rounded-full px-4 text-sm font-bold underline-offset-4 hover:underline">
            Open event
          </Link>
        </div>
      </div>
    </section>
  );
};

const OrganizerEventsPage = () => {
  const [status, setStatus] = useState<EventStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const eventsQuery = useMyEvents({ status, search: debouncedSearch, page, limit: PAGE_SIZE });
  const sampleQuery = useMyEvents({ status: "published", page: 1, limit: SAMPLE_SIZE });
  const walletQuery = useWallet();

  const events = useMemo(() => eventsQuery.data?.items ?? [], [eventsQuery.data]);

  const summary = useMemo(() => {
    const published = sampleQuery.data?.items ?? [];
    const selling = published.filter((event) => SELLING.has(getOrganizerEventBadge(event)));
    const next = published
      .filter(isEventStrictlyUpcoming)
      .sort((a, b) => Date.parse(a.nextOccurrenceAt) - Date.parse(b.nextOccurrenceAt))[0];
    const sold = published.reduce((sum, event) => sum + (event.soldTickets || 0), 0);
    return { selling: selling.length, next, sold, publishedCount: published.length };
  }, [sampleQuery.data]);

  const wallet = walletQuery.data;
  const searching = debouncedSearch.length > 0;

  return (
    <div className={DESK}>
      <PageHeader
        lead="your"
        accent="events."
        description="Everything you have put on, and everything still selling."
        actions={
          <SearchField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search your events"
            aria-label="Search your events"
            className="w-full sm:w-[300px]"
          />
        }
      />

      {searching ? null : (
        <div className="flex flex-col gap-4 pb-10">
          {walletQuery.isLoading || sampleQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[118px] rounded-[24px]" />
              ))}
            </div>
          ) : (
            <StatStrip
              cells={[
                {
                  label: "Ready to withdraw",
                  value: wallet ? formatNairaAmount(koboToNaira(wallet.availableBalanceKobo)) : "-",
                  note: (
                    <Link href="/organizer/payouts/withdraw" className="underline underline-offset-4">
                      Withdraw
                    </Link>
                  ),
                },
                {
                  label: "Lifetime sales",
                  value: wallet ? formatNairaCompact(koboToNaira(wallet.lifetimeGrossSalesKobo)) : "-",
                  note: "before Vera's fee",
                },
                {
                  label: "Selling now",
                  value: summary.selling.toLocaleString("en-NG"),
                  note: summary.selling === 1 ? "event on sale" : "events on sale",
                },
                {
                  label: "Tickets sold",
                  value: summary.sold.toLocaleString("en-NG"),
                  note: `across ${summary.publishedCount} published`,
                },
              ]}
            />
          )}

          {summary.next ? (
            <UpNext event={summary.next} />
          ) : sampleQuery.isLoading ? null : (
            <section
              aria-label="Up next"
              className="flex flex-col items-start gap-4 rounded-[32px] p-[clamp(20px,3vw,36px)] sm:flex-row sm:items-center sm:justify-between"
              style={{ backgroundColor: POSTER_TONES.ink.bg, color: POSTER_TONES.ink.fg }}
            >
              <div className="flex flex-col gap-1.5">
                <span style={{ lineHeight: 0.95 }} className="text-[clamp(28px,3.4vw,44px)] font-extrabold tracking-[-0.045em]">
                  nothing coming up.
                </span>
                <span className="text-[15px] opacity-70">Put on the next one and it shows up here, with the door one tap away.</span>
              </div>
              <Link href="/organizer/events/new" className={cn(buttonVariants({ size: "lg" }), "shrink-0 font-bold")}>
                <Plus className="h-4 w-4" />
                Create event
              </Link>
            </section>
          )}
        </div>
      )}

      <section aria-label="All events" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ lineHeight: 1 }} className="text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-[-0.035em]">
            {searching ? `results for “${debouncedSearch}”.` : "all events."}
          </h2>
          <div className="flex items-center gap-3">
            {eventsQuery.isFetching && !eventsQuery.isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            <FilterPills
              label="Filter by status"
              options={FILTERS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {eventsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[90px] w-full rounded-[26px]" />)
          ) : eventsQuery.isError ? (
            <ErrorState message="Couldn't load your events. Refresh the page, or try again shortly." onRetry={() => eventsQuery.refetch()} />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title={searching ? "No events match that" : status === "all" ? "No events yet" : "Nothing here"}
              description={
                searching
                  ? "Try a different name, or clear the search to see everything."
                  : "Put on your first event and start selling tickets people can't fake."
              }
              action={
                searching ? null : (
                  <Link href="/organizer/events/new" className={cn(buttonVariants({ variant: "ink" }))}>
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
          />
        ) : null}
      </section>
    </div>
  );
};

export default OrganizerEventsPage;
